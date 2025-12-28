# External Dependencies: mdsel-mcp

## Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | `^1.0.0` | Official MCP SDK for server implementation |
| `zod` | `^3.25.0` | Schema validation (peer dependency of MCP SDK) |

## Peer Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `mdsel` | `^1.0.0` | The CLI tool being wrapped |

## Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | `^5.7.0` | TypeScript compiler |
| `tsup` | `^8.3.0` | Build tool |
| `@types/node` | `^22.0.0` | Node.js type definitions |
| `vitest` | `^2.1.0` | Testing framework |

## MCP SDK Usage Patterns

### Server Initialization

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "mdsel-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Tool Definition Pattern

```typescript
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mdsel.index",
      description: "...",
      inputSchema: { type: "object", properties: {...}, required: [...] }
    }
  ]
}));
```

### Tool Execution Pattern

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const result = await executeMdsel(command, args);
  return {
    content: [{ type: "text", text: result }]
  };
});
```

### Error Handling Pattern

```typescript
// Return errors in content, not as protocol errors
return {
  isError: true,
  content: [{ type: "text", text: errorOutput }]
};
```

## CLI Execution Pattern

### Spawning mdsel

```typescript
import { spawn } from "child_process";

function executeMdsel(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["mdsel", ...args], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => stdout += data.toString());
    proc.stderr.on("data", (data) => stderr += data.toString());

    proc.on("close", (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 1 });
    });

    proc.on("error", reject);
  });
}
```

## Build Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  dts: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
```

### package.json bin entry

```json
{
  "bin": "./dist/index.js",
  "type": "module"
}
```

## Shebang Requirement

The built JavaScript file MUST start with:
```
#!/usr/bin/env node
```

This is handled by tsup's `banner` configuration.

## Logging Constraints

**CRITICAL**: In stdio-based MCP servers:
- **NEVER** use `console.log()` (writes to stdout, breaks protocol)
- **USE** `console.error()` for debug output (writes to stderr)

## Testing Strategy

### Unit Tests
- Mock `child_process.spawn` to test CLI execution logic
- Verify argument transformation

### Integration Tests
- Spawn actual mdsel CLI with test fixtures
- Verify output passthrough fidelity
