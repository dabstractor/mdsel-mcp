# Implementation Patterns

## MCP Server Bootstrap Pattern

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new Server({
  name: "mdsel-mcp",
  version: "1.0.0"
});

// ... define tools ...

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

## Tool Definition Pattern

```typescript
server.tool(
  "mdsel.index",
  {
    files: z.array(z.string()).min(1).describe("Markdown file paths to index")
  },
  async (args) => {
    const result = await executeMdsel(["index", "--json", ...args.files]);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);
```

## CLI Execution Pattern

```typescript
import { spawn } from "child_process";

async function executeMdsel(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("mdsel", args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => { stdout += data; });
    proc.stderr.on("data", (data) => { stderr += data; });

    proc.on("close", (code) => {
      // Return stdout regardless of exit code
      // mdsel outputs valid JSON even on errors
      resolve(stdout);
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}
```

## Error Handling Strategy

Per PRD Section 6: Pass through all mdsel output unchanged.

1. **mdsel returns JSON (success or error)**: Return as-is to MCP client
2. **mdsel fails to spawn**: Surface spawn error to client
3. **No validation**: MCP layer does not validate selectors or files

## Tool Response Format

```typescript
// Success: Return mdsel JSON as text content
return {
  content: [{ type: "text", text: mdselJsonOutput }]
};

// Spawn error: Return error message with isError flag
return {
  content: [{
    type: "text",
    text: `Failed to execute mdsel: ${error.message}`,
    isError: true
  }]
};
```

## Package.json Configuration

```json
{
  "name": "mdsel-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.25.1",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.0.0"
  }
}
```

## tsconfig.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```
