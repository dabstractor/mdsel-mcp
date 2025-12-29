# MCP Server Testing Research

## Executive Summary

Based on research of the MCP ecosystem, here are the key findings for testing MCP servers:

1. **Limited official testing documentation** from the TypeScript SDK
2. **MCP Inspector** provides manual testing capabilities
3. **Common testing frameworks** like Jest, Vitest, and ts-mockito are applicable
4. **Mock patterns** can be implemented using various mocking libraries
5. **Integration testing** requires testing both server and client communication

## 1. Unit Testing MCP Server Components

### Server Creation Testing

**Approach:**
- Test server initialization with different configurations
- Verify transport layer setup (stdio, HTTP, SSE)
- Validate tool registration

**Example Patterns:**
```typescript
// Server creation test
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { stdioTransport } from '@modelcontextprotocol/sdk/transport/stdio.js';

describe('MCP Server', () => {
  test('should initialize with stdio transport', () => {
    const server = new McpServer({
      name: 'test-server',
      version: '1.0.0',
    });

    const transport = stdioTransport();
    expect(server).toBeDefined();
    expect(transport).toBeDefined();
  });
});
```

**Best Practices:**
- Isolate server configuration testing from transport testing
- Use dependency injection for testable components
- Test server state management

### Tool Registration Testing

**Key Areas:**
- Tool schema validation
- Handler function registration
- Tool metadata validation
- Error handling for invalid tools

**Example:**
```typescript
describe('Tool Registration', () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({
      name: 'test-server',
      version: '1.0.0',
    });
  });

  test('should register valid tool', () => {
    const testTool = {
      name: 'test-tool',
      description: 'A test tool',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    };

    expect(() => {
      server.setRequestHandler(ToolNames.CallTool, async (request) => {
        // Handle tool call
      });
    }).not.toThrow();
  });
});
```

## 2. Integration Testing - stdio Transport

**Testing stdio Communication:**

```typescript
import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('stdio Transport Integration', () => {
  test('should communicate via stdio', async () => {
    const serverProcess = spawn('node', ['dist/index.js']);

    const client = Client.stdio({
      command: 'node',
      args: ['dist/index.js']
    });

    await client.connect();

    const response = await client.listTools();
    expect(response.tools).toBeDefined();

    await client.close();
    serverProcess.kill();
  });
});
```

**Challenges:**
- Process lifecycle management
- Proper cleanup to prevent hanging
- Error handling for communication failures

## 3. MCP Inspector for Manual Testing

### Installation and Usage

**Install MCP Inspector:**
```bash
npm install -g @modelcontextprotocol/inspector
```

**Connect to MCP Server:**
```bash
# For stdio servers
mcp-inspector node dist/index.js

# For HTTP servers
mcp-inspector http://localhost:3000
```

**Key Features:**
- Interactive testing of tools and resources
- Real-time protocol inspection
- Request/response debugging
- Protocol compliance validation

**Example Inspector Workflow:**
1. Start your MCP server
2. Run `mcp-inspector` with server connection
3. Use the inspector to:
   - List available tools and resources
   - Call tools interactively
   - Inspect protocol messages
   - Validate server responses

## 4. Testing Frameworks

### Recommended Frameworks

**Jest + TypeScript**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

**Vitest (Modern alternative)**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

### Test Structure Example

```
tests/
├── unit/
│   ├── server.test.ts
│   ├── tools.test.ts
│   └── transport.test.ts
├── integration/
│   ├── stdio.test.ts
│   └── http.test.ts
└── e2e/
    └── inspector.test.ts
```

## 5. Mock Patterns for MCP SDK

### Mocking MCP Components

**Using ts-mockito:**
```typescript
import { mock, when, verify } from 'ts-mockito';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

describe('Mocked Server', () => {
  let server: McpServer;
  let mockServer: McpServer;

  beforeEach(() => {
    mockServer = mock(McpServer);
    server = mockServer;
  });

  test('should handle mock requests', () => {
    when(server.listTools()).thenReturn({
      tools: []
    });

    const result = server.listTools();
    verify(server.listTools()).once();
  });
});
```

**Using Jest mocks:**
```typescript
jest.mock('@modelcontextprotocol/sdk/server/mcp.js');

describe('Jest Mocked Server', () => {
  test('should mock server behavior', () => {
    const mockServer = new McpServer({
      name: 'mock-server',
      version: '1.0.0'
    });

    jest.spyOn(mockServer, 'listTools').mockResolvedValue({
      tools: [{
        name: 'test-tool',
        description: 'Test tool'
      }]
    });

    // Test mock implementation
  });
});
```

### Mocking Transport Layers

**Mocking stdio transport:**
```typescript
import { EventEmitter } from 'events';

class MockStdioTransport extends EventEmitter {
  write(data: string) {
    this.emit('data', data);
  }

  on(event: string, listener: Function) {
    super.on(event, listener);
  }
}

// Usage in tests
const mockTransport = new MockStdioTransport();
const server = new McpServer({
  name: 'test-server',
  version: '1.0.0'
});
```

## 6. Testing Tools and Resources

### Tool Testing Best Practices

1. **Input Validation Tests**
   - Test schema validation
   - Test error responses for invalid inputs
   - Test edge cases

2. **Handler Function Tests**
   - Test successful execution
   - Test error handling
   - Test async operations

3. **Integration Tests**
   - Test tool calls from client
   - Test resource access patterns
   - Test prompt templates

### Resource Testing Patterns

```typescript
describe('Resource Testing', () => {
  test('should handle resource reading', async () => {
    const client = new Client();
    await client.connect();

    const resource = await client.readResource({
      uri: 'file:///test-resource.txt'
    });

    expect(resource.contents).toBeDefined();
  });
});
```

## 7. Sample Test Setup

### Test Configuration Example

**jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

**Test Setup File:**
```typescript
// tests/setup.ts
import '@modelcontextprotocol/sdk';

// Global test setup
beforeAll(() => {
  // Initialize test environment
});

afterAll(() => {
  // Cleanup
});
```

## 8. Continuous Integration

### GitHub Actions Example

```yaml
name: MCP Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm test
      - run: npm run test:integration
      - run: npm run test:e2e
```

## 9. Validation Commands

### Manual Testing Commands

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Inspector Validation Commands

```bash
# Test stdio server
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | node dist/index.js

# Test with inspector
mcp-inspector node dist/index.js

# Test HTTP server
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```

## 10. Additional Resources

### Documentation Sources

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [MCP Servers Examples](https://github.com/modelcontextprotocol/servers)

### Community Resources

- [Awesome MCP DevTools](https://github.com/punkpeye/awesome-mcp-devtools)
- [MCP GitHub Discussions](https://github.com/modelcontextprotocol/typescript-sdk/discussions)
- [Stack Overflow MCP Tag](https://stackoverflow.com/questions/tagged/model-context-protocol)

## Conclusion

Testing MCP servers requires a combination of:
1. **Unit tests** for server components and tools
2. **Integration tests** for transport communication
3. **Manual testing** with MCP Inspector
4. **Mocking strategies** for isolated testing
5. **CI/CD integration** for automated validation

The MCP ecosystem is still evolving, so stay updated with the latest SDK documentation and community best practices.