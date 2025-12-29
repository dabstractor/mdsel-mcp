# MCP SDK Research: Node.js/TypeScript Implementation

Based on analysis of the @modelcontextprotocol/sdk package (v1.25.1) and existing documentation patterns.

## 1. Server Initialization

### Official Import Pattern
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### Server Constructor Options
```typescript
const server = new Server(
  {
    name: "your-server-name",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {} // Enable tools capability
    },
    instructions?: "Optional server instructions",
    jsonSchemaValidator?: /* Custom validator instance */
  }
);
```

**Key Findings:**
- The Server class extends Protocol and provides MCP-specific functionality
- Server capabilities must be explicitly declared in options
- The constructor takes server info (name, version) and optional configuration
- The API documentation shows that `Server` is marked as deprecated in favor of `McpServer` for high-level use cases

## 2. Stdio Transport Configuration

### StdioServerTransport Constructor
```typescript
const transport = new StdioServerTransport(
  stdin?: Readable,
  stdout?: Writable
);
```

**Key Findings:**
- Default behavior uses process.stdin and process.stdout when no streams are provided
- Only available in Node.js environments
- Implements the Transport interface with methods: start(), close(), send()
- Has optional callbacks: onclose, onerror, onmessage

### Transport Connection Pattern
```typescript
// Transport initialization is handled by server.connect()
// No explicit start() call needed on the transport when using server.connect()
```

## 3. Server Connection Pattern

### Recommended Connection Pattern
```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

**Key Findings:**
- The server.connect() method handles the transport initialization
- Connection is asynchronous and should be awaited
- Main function should catch unhandled errors and exit with code 1
- No explicit transport.start() call needed when using server.connect()

## 4. Error Handling and Graceful Shutdown

### Error Handling Strategy
```typescript
// 1. Transport-level errors
transport.onerror = (error) => {
  console.error("Transport error:", error);
};

// 2. Request-level error handling in handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Handle the request
    return { /* success response */ };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Tool execution failed: ${error.message}`,
        isError: true
      }]
    };
  }
});

// 3. Process-level cleanup
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await server.close();
  process.exit(0);
});
```

**Best Practices:**
- Always handle transport errors with the onerror callback
- Use try-catch blocks in all request handlers
- Implement graceful shutdown for SIGINT/SIGTERM signals
- Server.close() should be called during shutdown to clean up resources

## 5. Shebang Requirements

### File-level Shebang
```typescript
#!/usr/bin/env node

// Rest of the TypeScript code
```

**Key Findings:**
- Must be the very first line of the file (no preceding whitespace)
- The compiled JavaScript will retain the shebang
- Required for the binary entry point to work correctly
- Points to the node interpreter via env lookup

### Package.json Configuration
```json
{
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  }
}
```

## Critical Gotchas

### 1. ESM Import Requirements
```typescript
// Always use .js extensions for imports even in TypeScript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### 2. TypeScript Configuration
- Must use `"module": "NodeNext"`
- Must use `"moduleResolution": "NodeNext"`
- ESM output required for Node.js compatibility

### 3. Binary Entry Point
- `bin` in package.json must point to compiled JS, not TS source
- The shebang works in the compiled JS output
- File must be executable: `chmod +x dist/index.js`

### 4. Connection Order
- Create server instance first
- Define tools and request handlers
- Then connect to transport
- Order matters for capability advertisement

## Complete Working Example

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new Server(
  {
    name: "mdsel-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Define tools
server.tool(
  "mdsel.index",
  {
    files: z.array(z.string()).min(1).describe("Markdown file paths to index")
  },
  async (args) => {
    // Tool implementation will be added later
    return {
      content: [{ type: "text", text: "Tool implementation pending" }]
    };
  }
);

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Tools will be automatically listed
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Tool calls will be routed to the defined handlers
  throw new Error("Tool not implemented");
});

// Error handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down...');
  await server.close();
  process.exit(0);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

## References

- Package source: node_modules/@modelcontextprotocol/sdk/dist/esm/
- Server class: `/server/index.d.ts`
- Stdio transport: `/server/stdio.d.ts`
- Protocol base: `/shared/protocol.d.ts`
- Types: `/types.d.ts`

This research provides the foundation for implementing the MCP server bootstrap pattern in the P1.M2.T1.S1 task.