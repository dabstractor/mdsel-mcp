# MCP Server Testing Research

## Overview
This document researches testing patterns and methodologies for Model Context Protocol (MCP) servers, focusing on SDK documentation, testing frameworks, and implementation examples.

## 1. Official MCP SDK Testing Patterns

### Core Testing Components
Based on MCP specification, testing should focus on:

- **Protocol Compliance**: JSON-RPC 2.0 adherence
- **Schema Validation**: Testing request/response schemas
- **Error Handling**: Proper error responses for invalid requests
- **Transport Layer**: Testing stdio, HTTP, WebSocket transports
- **Tool Registration**: Dynamic tool listing and calling

### Official Testing Resources
*Note: Web search service is currently at monthly limit. Direct GitHub repositories to check:*
- Anthropic/MCP - Official MCP specification and SDK
- Anthropic/MCP-Server-Templates - Template implementations
- Anthropic/MCP-Client-Libraries - Client-side testing utilities

## 2. Testing MCP Server Request Handlers

### ListToolsRequestSchema Testing
```typescript
// Test case for tools/list
test('should return registered tools', async () => {
  const server = new TestMCPServer();
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  };

  const response = await server.handleRequest(request);

  expect(response).toEqual({
    jsonrpc: "2.0",
    id: 1,
    result: {
      tools: [
        {
          name: "example_tool",
          description: "Tool description",
          inputSchema: { type: "object", properties: {} }
        }
      ]
    }
  });
});
```

### CallToolRequestSchema Testing
```typescript
// Test case for tools/call
test('should execute tool with provided arguments', async () => {
  const server = new TestMCPServer();
  const request = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "example_tool",
      arguments: {
        param1: "value1",
        param2: 42
      }
    }
  };

  const response = await server.handleRequest(request);

  expect(response).toEqual({
    jsonrpc: "2.0",
    id: 2,
    result: {
      content: [
        {
          type: "text",
          text: "Execution result"
        }
      ]
    }
  });
});
```

## 3. Mocking Patterns for MCP Classes

### Mock Server Class
```typescript
class MockMCPServer implements MCPServer {
  private tools = new Map<string, Tool>();
  private handlers = new Map<string, Function>();

  constructor() {
    // Register default handlers
    this.registerHandler('tools/list', this.handleListTools.bind(this));
    this.registerHandler('tools/call', this.handleCallTool.bind(this));
  }

  registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  registerHandler(method: string, handler: Function) {
    this.handlers.set(method, handler);
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const handler = this.handlers.get(request.method);
    if (!handler) {
      throw new Error(`Unknown method: ${request.method}`);
    }
    return handler(request);
  }
}
```

### Mock Transport Class
```typescript
class MockTransport implements Transport {
  private callbacks: Map<string, Function> = new Map();

  onMessage(callback: Function) {
    this.callbacks.set('message', callback);
  }

  sendMessage(message: MCPRequest | MCPResponse) {
    // Simulate message processing
    this.callbacks.get('message')?.(message);
  }

  close() {
    // Cleanup logic
  }
}
```

## 4. Integration Testing Approaches

### Full Server Testing
```typescript
describe('MCP Server Integration', () => {
  let server: MCPServer;
  let transport: MockTransport;

  beforeEach(() => {
    server = new MCPServer();
    transport = new MockTransport();

    // Connect server to transport
    server.connect(transport);
  });

  test('should handle full tool lifecycle', async () => {
    // Register a test tool
    server.registerTool({
      name: 'test_tool',
      description: 'Test tool for integration',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      handler: async (args) => {
        return { content: [{ type: 'text', text: args.message }] };
      }
    });

    // Send tools/list request
    const listRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    };

    const listResponse = await transport.sendAndWaitForResponse(listRequest);
    expect(listResponse.result.tools).toHaveLength(1);

    // Send tools/call request
    const callRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "test_tool",
        arguments: { message: "Hello World" }
      }
    };

    const callResponse = await transport.sendAndWaitForResponse(callRequest);
    expect(callResponse.result.content[0].text).toBe("Hello World");
  });
});
```

### Transport-Specific Testing
```typescript
describe('Transport Testing', () => {
  test('stdio transport should handle bidirectional communication', () => {
    const server = new StdioServer();
    const mockStdio = createMockStdio();

    server.connect(mockStdio);

    // Test message sending and receiving
    mockStdio.emit('data', JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    }));

    // Verify response
    expect(mockStdio.writtenData).toContain('"jsonrpc":"2.0"');
  });
});
```

## 5. Error Handling Tests

### Protocol Error Testing
```typescript
test('should handle malformed JSON requests', async () => {
  const server = new MCPServer();
  const malformedRequest = 'not json';

  await expect(server.handleRequest(malformedRequest))
    .rejects.toThrow('Invalid JSON');
});

test('should handle unknown methods', async () => {
  const server = new MCPServer();
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "unknown_method"
  };

  const response = await server.handleRequest(request);
  expect(response.error.code).toBe(-32601); // Method not found
});
```

### Tool Error Testing
```typescript
test('should handle tool execution errors', async () => {
  const server = new MCPServer();

  server.registerTool({
    name: 'failing_tool',
    description: 'Tool that always fails',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => {
      throw new Error('Tool execution failed');
    }
  });

  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "failing_tool",
      arguments: {}
    }
  };

  const response = await server.handleRequest(request);
  expect(response.error).toBeDefined();
  expect(response.error.message).toContain('Tool execution failed');
});
```

## 6. Testing Best Practices

### 1. Test Structure
- **Unit Tests**: Individual handler functions
- **Integration Tests**: Full request/response cycles
- **Transport Tests**: Protocol-specific communication
- **Error Tests**: All error scenarios

### 2. Mocking Strategy
- Use dependency injection for transport layer
- Mock external service dependencies
- Create testable server instances

### 3. Test Data Management
- Use factories for creating test requests
- Maintain test tool registry
- Verify request/response schemas

### 4. Continuous Integration
- Include MCP compliance tests
- Test against multiple SDK versions
- Performance benchmarking for tool calls

## 7. Recommended Testing Tools

### Testing Libraries
- **Jest** or **Vitest** for unit testing
- **Supertest** for HTTP transport testing
- **Socket.IO client** for WebSocket testing
- **Mock-Request** for HTTP mocking

### Assertion Libraries
- **Chai** for assertion chaining
- **Sinon** for spy/stub/mock utilities
- **Deep-equal** for JSON comparison

### Test Utilities
- **uuid** for generating test IDs
- **json-schema-validator** for schema validation
- **lodash** for data manipulation

## 8. Real-World Examples

### Example from Model Context Protocol SDK
*Check official repositories for:*
- `tests/` directory structure
- `__mocks__/` for dependency mocking
- `test-utils/` for shared testing utilities

### Community Examples
*Search GitHub for repositories containing:*
- `mcp-*` package names
- `server` in repository names
- Testing directories with MCP-related tests

## Next Steps

1. Explore official MCP repositories for testing patterns
2. Implement testing utilities based on this research
3. Create comprehensive test suite for the current MCP server implementation
4. Integrate testing into CI/CD pipeline

---
*Research compiled due to web search service limitations. Direct exploration of official MCP repositories recommended for latest patterns.*