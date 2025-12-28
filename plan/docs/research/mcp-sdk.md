# MCP TypeScript SDK Research

## Overview

The Model Context Protocol (MCP) TypeScript SDK allows building MCP servers in TypeScript/Node.js. This document provides comprehensive findings from the official TypeScript SDK repository at [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk).

### Important Version Note
> **Note**: This is the `main` branch which contains v2 of the SDK (currently in development, pre-alpha). We anticipate a stable v2 release in Q1 2026. Until then, **v1.x remains the recommended version** for production use. v1.x will continue to receive bug fixes and security updates for at least 6 months after v2 ships to give people time to upgrade. For v1 documentation and code, see the [`v1.x` branch](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x).

## 1. Package Installation

### Latest Version
- Package: `@modelcontextprotocol/server`
- Required peer dependency: `zod` for schema validation
- SDK internally imports from `zod/v4` but remains compatible with projects using Zod v3.25+

### Installation Command
```bash
npm install @modelcontextprotocol/server zod
```

**Source**: [README.md#installation](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/README.md#installation)

## 2. Server Initialization Pattern

### Using McpServer Class

The primary server class is `McpServer` from `@modelcontextprotocol/server`:

```typescript
import { McpServer } from '@modelcontextprotocol/server';

const server = new McpServer(
    {
        name: 'simple-streamable-http-server',
        version: '1.0.0',
        icons: [{ src: './mcp.svg', sizes: ['512x512'], mimeType: 'image/svg+xml' }],
        websiteUrl: 'https://github.com/modelcontextprotocol/typescript-sdk'
    },
    {
        capabilities: {
            logging: {},
            tasks: { requests: { tools: { call: {} } } }
        },
        taskStore,
        taskMessageQueue: new InMemoryTaskMessageQueue()
    }
);
```

**Server Config**:
- `name`: Server identifier
- `version`: Semantic version
- `icons`: Optional SVG icons for UI
- `websiteUrl`: URL for server information

**Options Config**:
- `capabilities`: Define server capabilities (logging, tasks, etc.)
- `taskStore`: Task storage implementation
- `taskMessageQueue`: Message queue for tasks

**Source**: [examples/server/src/simpleStreamableHttp.ts](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/server/src/simpleStreamableHttp.ts#L25-L42)

### Available Transports

1. **Streamable HTTP** (recommended for remote servers)
2. **HTTP + SSE** (deprecated, for backwards compatibility only)
3. **stdio** (for local, process-spawned integrations)

**Source**: [docs/server.md#transports](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md#transports)

## 3. Tool Registration and Handler Setup

### Tool Registration Pattern

```typescript
server.registerTool(
    'greet',
    {
        title: 'Greeting Tool', // Display name for UI
        description: 'A simple greeting tool',
        inputSchema: {
            name: z.string().describe('Name to greet')
        }
    },
    async ({ name }): Promise<CallToolResult> => {
        return {
            content: [
                {
                    type: 'text',
                    text: `Hello, ${name}!`
                }
            ]
        };
    }
);
```

### Advanced Tool with Annotations and Logging

```typescript
server.registerTool(
    'multi-greet',
    {
        description: 'A tool that sends different greetings with delays between them',
        inputSchema: {
            name: z.string().describe('Name to greet')
        },
        annotations: {
            title: 'Multiple Greeting Tool',
            readOnlyHint: true,
            openWorldHint: false
        }
    },
    async ({ name }, extra): Promise<CallToolResult> => {
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        await server.sendLoggingMessage(
            {
                level: 'debug',
                data: `Starting multi-greet for ${name}`
            },
            extra.sessionId
        );

        // ... additional logic with delays and logging

        return {
            content: [
                {
                    type: 'text',
                    text: `Good morning, ${name}!`
                }
            ]
        };
    }
);
```

**Source**: [examples/server/src/simpleStreamableHttp.ts](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/server/src/simpleStreamableHttp.ts#L58-L95)

## 4. Transport Setup with StreamableHTTPServerTransport

### Basic Transport Setup

```typescript
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/server';
import { randomUUID } from 'node:crypto';

const eventStore = new InMemoryEventStore();
const transports = new Map<string, StreamableHTTPServerTransport>();

const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    eventStore, // Enable resumability
    onsessioninitialized: sessionId => {
        console.log(`Session initialized with ID: ${sessionId}`);
        transports[sessionId] = transport;
    }
});

// Set up onclose handler to clean up transport when closed
transport.onclose = () => {
    const sid = transport.sessionId;
    if (sid && transports[sid]) {
        console.log(`Transport closed for session ${sid}, removing from transports map`);
        delete transports[sid];
    }
};

// Connect the transport to the MCP server BEFORE handling the request
const server = getServer();
await server.connect(transport);

await transport.handleRequest(req, res, req.body);
```

**Source**: [examples/server/src/simpleStreamableHttp.ts](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/server/src/simpleStreamableHttp.ts#L96-L123)

### Express.js Integration with DNS Rebinding Protection

```typescript
import { createMcpExpressApp } from '@modelcontextprotocol/server';

// Protection auto-enabled (default host is 127.0.0.1)
const app = createMcpExpressApp();

// Protection auto-enabled for localhost
const app = createMcpExpressApp({ host: 'localhost' });

// No auto protection when binding to all interfaces, unless you provide allowedHosts
const app = createMcpExpressApp({ host: '0.0.0.0' });

// When binding to 0.0.0.0 / ::, provide an allow-list of hosts
const app = createMcpExpressApp({
    host: '0.0.0.0',
    allowedHosts: ['localhost', '127.0.0.1', 'myhost.local']
});
```

**Source**: [docs/server.md#dns-rebinding-protection](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md#dns-rebinding-protection)

## 5. Request Schema Usage

### ListToolsRequestSchema
The SDK internally handles the protocol messages, but tools are registered using the pattern shown above. The actual schema definitions are abstracted away by the server implementation.

### CallToolRequestSchema
The handler function receives parameters and provides a `CallToolResult`:

```typescript
type CallToolResult = {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
};
```

**Source**: [packages/server/src/types.ts](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/packages/server/src/types.ts)

## 6. Error Handling Patterns

### Transport Error Handling

```typescript
try {
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
} catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
        res.status(500).send('Error processing session termination');
    }
}
```

### Server Shutdown Handling

```typescript
// Handle server shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');

    // Close all active transports to properly clean up resources
    for (const sessionId in transports) {
        try {
            console.log(`Closing transport for session ${sessionId}`);
            await transports[sessionId]!.close();
            delete transports[sessionId];
        } catch (error) {
            console.error(`Error closing transport for session ${sessionId}:`, error);
        }
    }
    console.log('Server shutdown complete');
    process.exit(0);
});
```

**Source**: [examples/server/src/simpleStreamableHttp.ts](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/server/src/simpleStreamableHttp.ts#L190-L213)

## 7. Common Gotchas and Best Practices

### TypeScript Compilation Errors
**Issue**: `TS2589: Type instantiation is excessively deep and possibly infinite`

**Solution**: This occurs when there are multiple `zod` versions in the dependency tree. Ensure:
- Run `npm ls zod` to check for multiple versions
- Align on a single `zod` version
- Use `overrides` / `resolutions` if necessary
- Ensure all packages use compatible Zod version ranges (v3.25+ recommended)

**Source**: [docs/faq.md](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/faq.md#general)

### Web Crypto Issues for Client Authentication
**Issue**: OAuth client authentication helpers rely on `globalThis.crypto` which may not be available in older Node.js versions.

**Solution**: For Node.js v18.x, either:
- Run Node with `--experimental-global-webcrypto`
- Polyfill using:
```typescript
import { webcrypto } from 'node:crypto';
globalThis.crypto = webcrypto;
```

**Source**: [docs/faq.md](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/faq.md#clients)

### Session Management Best Practices
1. Always handle session cleanup in `onclose` handlers
2. Use session IDs for tracking active connections
3. Implement proper shutdown sequences to close all transports
4. Use event stores for resumability in stateful servers

### State vs Stateless Servers
- **Stateless**: No session tracking, ideal for simple API-style servers
- **Stateful**: Sessions have IDs, enable resumability and advanced features

**Example Stateless**: [simpleStatelessStreamableHttp.ts](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/server/src/simpleStatelessStreamableHttp.ts)
**Example Stateful**: [simpleStreamableHttp.ts](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/server/src/simpleStreamableHttp.ts)

## 8. Example Implementations

### Complete Runnable Examples
The repository provides several complete examples:

1. **simpleStreamableHttp.ts** - Feature-rich Streamable HTTP server with sessions, logging, tasks, elicitation, auth hooks
2. **jsonResponseStreamableHttp.ts** - Streamable HTTP with JSON response mode (no SSE)
3. **simpleStatelessStreamableHttp.ts** - Stateless Streamable HTTP server
4. **sseAndStreamableHttpCompatibleServer.ts** - Backwards-compatible server for old and new clients

**Source**: [docs/server.md#transports](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md#transports)

## 9. Additional Resources

### Documentation
- [Server docs](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md) - Building MCP servers, transports, tools/resources/prompts, CORS, DNS rebinding, deployment patterns
- [Client docs](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/client.md) - Using the high-level client, transports, backwards compatibility, OAuth helpers
- [Capabilities docs](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/capabilities.md) - Sampling, elicitation, experimental task-based execution
- [FAQ](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/faq.md) - Environment and troubleshooting FAQs

### External References
- [Model Context Protocol documentation](https://modelcontextprotocol.io)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [Example Servers](https://github.com/modelcontextprotocol/servers)

**Note**: All URLs link to specific sections in the TypeScript SDK repository as of the research date.