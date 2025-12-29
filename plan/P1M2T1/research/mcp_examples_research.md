# MCP Server Implementation Research

## Summary of Findings

This research document examines real-world MCP server implementations using stdio transport, focusing on minimal examples, bootstrap patterns, entry point structures, and executable script conventions.

## 1. Minimal MCP Servers

### Example 1: Model Context Protocol TypeScript Template
**Repository**: [modelcontextprotocol/create-typescript-server](https://github.com/modelcontextprotocol/create-typescript-server)

**Key Features**:
- Simple in-memory notes system
- Implements resources, tools, and prompts
- Clean, minimal implementation

**File**: `template/src/index.ts.ejs`

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "<%= name %>",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

// Resource handler
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: Object.entries(notes).map(([id, note]) => ({
      uri: `note:///${id}`,
      mimeType: "text/plain",
      name: note.title,
      description: `A text note: ${note.title}`
    }))
  };
});

// Tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "create_note": {
      const title = String(request.params.arguments?.title);
      const content = String(request.params.arguments?.content);
      // ... implementation
    }
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

### Example 2: Git MCP Server
**Repository**: [cyanheads/git-mcp-server](https://github.com/cyanheads/git-mcp-server)

**Key Features**:
- More complex with dependency injection
- Support for multiple transport types (stdio/http)
- Production-ready with telemetry and logging

**File**: `src/index.ts`

```typescript
#!/usr/bin/env node

// Disable ANSI color codes for MCP compatibility
const transportType = process.env.MCP_TRANSPORT_TYPE?.toLowerCase();
const isStdioMode = !transportType || transportType === 'stdio';

if (isStdioMode || isHttpModeWithoutTty) {
  process.env.NO_COLOR = '1';
  process.env.FORCE_COLOR = '0';
}

import 'reflect-metadata';
import { container, composeContainer } from '@/container/index.js';
import { TransportManager } from '@/mcp-server/transports/manager.js';

async function main() {
  // Initialize container and config
  const config = container.resolve(AppConfig);
  const transportManager = container.resolve(TransportManagerToken);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

## 2. Server Bootstrap Patterns

### Pattern 1: Simple Direct Bootstrap
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({ name: "my-server", version: "1.0.0" });

// Define handlers...
server.setRequestHandler(ListToolsRequestSchema, async () => { /* ... */ });

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Pattern 2: Configurable Bootstrap
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || "default-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    }
  }
);
```

### Pattern 3: Dependency Injection Pattern
```typescript
import { container } from '@/container/index.js';

// Resolve dependencies from container
const config = container.resolve(AppConfig);
const logger = container.resolve(LoggerToken);

const server = new Server(config.serverConfig, config.capabilities);
```

## 3. Entry Point Patterns

### Common Pattern 1: Direct Export
```typescript
#!/usr/bin/env node

// All server logic in single file
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({ name: "server", version: "1.0.0" });

// Request handlers...

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### Common Pattern 2: Modular Structure
```typescript
#!/usr/bin/env node

// Main entry point orchestrates modules
import { createServer } from './server.js';
import { loadConfig } from './config.js';
import { setupLogging } from './logging.js';

async function main() {
  const config = await loadConfig();
  await setupLogging(config);
  const server = await createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

## 4. Executable Scripts & Build Patterns

### Shebang Convention
All examples consistently use:
```typescript
#!/usr/bin/env node
```
at the top of the entry point file.

### Package.json Bin Configuration
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-mcp-server": "./build/index.js"
  },
  "files": [
    "build"
  ],
  "scripts": {
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "prepare": "npm run build"
  }
}
```

### Key Build Steps:
1. **TypeScript compilation**: `tsc`
2. **Make executable**: `chmod 755 build/index.js`
3. **Prepare hook**: Runs build before publish

## 5. Best Practices Observed

### 1. Transport Configuration
- Always detect stdio mode vs HTTP mode
- Disable color output for stdio transport
- Use environment variables for configuration

### 2. Error Handling
```typescript
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

### 3. Environment Detection
```typescript
const transportType = process.env.MCP_TRANSPORT_TYPE?.toLowerCase();
const isStdioMode = !transportType || transportType === 'stdio';
```

### 4. Capability Declaration
Explicitly declare supported capabilities:
```typescript
{
  capabilities: {
    resources: {},
    tools: {},
    prompts: {}
  }
}
```

### 5. Version Management
- Use semantic versioning
- Include version in server configuration
- Update SDK versions regularly

## 6. Common Patterns Summary

| Pattern | Usage | Examples |
|---------|-------|----------|
| **Simple Bootstrap** | Quick prototypes, small servers | create-typescript-server |
| **Configurable Bootstrap** | Production servers, multiple configs | git-mcp-server |
| **Dependency Injection** | Large, complex applications | git-mcp-server |
| **Modular Structure** | Maintainable codebases | git-mcp-server |

## 7. Key Learnings

1. **Stdio Transport is Standard**: All MCP servers use stdio as the primary transport
2. **Shebang is Required**: `#!/usr/bin/env node` enables direct execution
3. **Build Process Makes Executable**: Compile JS must have execute permissions
4. **Color Output Must Be Disabled**: Critical for clean JSON-RPC communication
5. **Error Handling is Mandatory**: Must exit with non-zero on failure
6. **Environment Variables Control Behavior**: Transport type, logging, etc.

## 8. Recommended Implementation for mdsel-mcp

Based on research findings, here's the recommended approach:

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Disable colors for stdio transport
if (!process.stdout.isTTY) {
  process.env.NO_COLOR = '1';
}

const server = new Server({
  name: "mdsel-mcp",
  version: "1.0.0"
});

// Tool definitions with Zod schemas
server.tool(
  "mdsel.index",
  {
    files: z.array(z.string()).min(1).describe("Markdown file paths to index")
  },
  async (args) => {
    // Implementation...
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

This follows the established patterns from the official template and maintains compatibility with MCP clients.