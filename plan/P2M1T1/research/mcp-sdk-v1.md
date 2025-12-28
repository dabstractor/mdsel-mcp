# MCP SDK v1 Research

## 1. Official GitHub Repository and Documentation

**GitHub Repository**: https://github.com/modelcontextprotocol/typescript-sdk

**Documentation**: The SDK documentation is available in the `dist/esm/` directory of the installed package.

**Package Information**:
- NPM Package: `@modelcontextprotocol/sdk` (version ^1.0.0)
- Published: ~1 year ago
- License: MIT
- Dependencies:
  - content-type: ^1.0.5
  - raw-body: ^3.0.0
  - zod: ^3.23.8

## 2. Creating a Server with Stdio Transport in v1

### Using McpServer (Recommended - High-Level API)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'my-server',
  version: '1.0.0'
});

// Create stdio transport
const transport = new StdioServerTransport();

// Connect the server to the transport
await server.connect(transport);
console.log('MCP server is running...');
```

### Using Server Class (Low-Level API)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'my-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Create stdio transport
const transport = new StdioServerTransport();

// Set up message handlers
transport.onmessage = (message) => {
  // Handle incoming messages
  server.handleMessage(message);
};

// Start the transport
await transport.start();

// The server will handle the initialization flow automatically
```

## 3. Registering ListTools and CallTool Request Handlers in v1

### Using McpServer (Recommended)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

const server = new McpServer({
  name: 'mdsel-mcp',
  version: '1.0.0'
});

// Register a tool
server.registerTool('mdsel.index', {
  description: 'Index markdown files for search',
  inputSchema: {
    files: z.array(z.string()).describe('Array of file paths to index')
  }
}, async ({ files }, extra) => {
  // Tool implementation
  return {
    content: [{
      type: 'text',
      text: `Indexed ${files.length} files`
    }]
  };
});

// The McpServer automatically handles both ListTools and CallTool requests
// based on the registered tools
```

### Using Server Class (Manual Registration)

```typescript
import { Server, ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/server/index.js';
import { ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'my-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register ListTools request handler
server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return {
    tools: [
      {
        name: 'mdsel.index',
        description: 'Index markdown files for search',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['files']
        }
      }
    ]
  };
});

// Register CallTool request handler
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;

  if (name === 'mdsel.index') {
    const { files } = args;
    // Tool implementation
    return {
      content: [{
        type: 'text',
        text: `Indexed ${files.length} files`
      }]
    };
  }

  // Error response for unknown tools
  return {
    isError: true,
    content: [{
      type: 'text',
      text: `Unknown tool: ${name}`
    }]
  };
});
```

## 4. Exact Import Paths and Class Names for v1

### Primary Imports
```typescript
// Main server class
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// High-level server wrapper
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Stdio transport
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Request schemas
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolResultSchema
} from '@modelcontextprotocol/sdk/types.js';

// Server capabilities
import { ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';

// Zod schema compatibility
import { AnySchema, AnyObjectSchema } from '@modelcontextprotocol/sdk/server/zod-compat.js';
```

### Key Classes
- `Server` - The main MCP server class
- `McpServer` - High-level wrapper for easier tool/resource/prompt management
- `StdioServerTransport` - Node.js stdio transport implementation
- `ListToolsRequestSchema` - Schema for listing available tools
- `CallToolRequestSchema` - Schema for calling tools
- `ServerCapabilities` - Type for server capabilities

## 5. Request Handler Patterns - setRequestHandler Usage

### Basic Pattern
```typescript
import { Server, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'my-server',
  version: '1.0.0'
});

server.setRequestHandler(ListToolsRequestSchema, async (request, extra) => {
  // request.params contains the request parameters
  // extra provides additional context (sessionId, transport info, etc.)

  return {
    tools: [
      {
        name: 'my-tool',
        description: 'Description of my tool',
        inputSchema: {
          type: 'object',
          properties: {
            param1: { type: 'string' }
          },
          required: ['param1']
        }
      }
    ]
  };
});
```

### With Zod Schema Validation
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import * as z from 'zod';

const server = new Server({
  name: 'my-server',
  version: '1.0.0'
});

// Define custom schema with validation
const CustomRequestSchema = z.object({
  method: z.literal('tools/call'),
  params: z.object({
    name: z.string(),
    arguments: z.object({
      param1: z.string().min(1).max(100)
    })
  })
});

server.setRequestHandler(CustomRequestSchema, async (request, extra) => {
  // TypeScript knows the structure of request.params
  const { name, arguments: args } = request.params;
  const { param1 } = args;

  // Tool implementation
  return {
    content: [{
      type: 'text',
      text: `Processed: ${param1}`
    }]
  };
});
```

## 6. Error Response Patterns for Tools in v1

### Standard Error Response
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;

  try {
    // Tool implementation
    if (name === 'my-tool') {
      if (!args.requiredParam) {
        throw new Error('Missing required parameter');
      }

      // Success response
      return {
        content: [{
          type: 'text',
          text: 'Success!'
        }]
      };
    }

    // Unknown tool error
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Unknown tool: ${name}`
      }]
    };

  } catch (error) {
    // Tool execution error
    return {
      isError: true,
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }]
    };
  }
});
```

### Using McpServer with Automatic Error Handling
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

const server = new McpServer({
  name: 'my-server',
  version: '1.0.0'
});

server.registerTool('risky-tool', {
  description: 'A tool that might fail',
  inputSchema: {
    operation: z.string()
  }
}, async ({ operation }) => {
  if (operation === 'fail') {
    throw new Error('Intentional failure');
  }

  return {
    content: [{
      type: 'text',
      text: 'Operation completed successfully'
    }]
  };
});

// McpServer automatically converts thrown errors
// to appropriate error responses
```

## Key Differences from v2

1. **No McpServer class in v1** - v1 has `Server` and `McpServer` as separate classes
2. **Manual transport connection** - In v1, you need to explicitly connect the server to the transport
3. **Explicit request handlers** - v1 requires manual registration of ListTools and CallTool handlers
4. **No built-in tool validation** - v1 doesn't automatically validate tool schemas
5. **Different error handling** - Error responses must be explicitly constructed in v1

## Important Notes for v1 Implementation

1. Always use `console.error` for debug messages in stdio mode, never `console.log`
2. The `McpServer` class is recommended for most use cases as it simplifies tool registration
3. The `Server` class provides more control but requires manual handler registration
4. Transport connections should be handled with proper error catching
5. The SDK uses Zod for schema validation - ensure proper error handling