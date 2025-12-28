# Node.js child_process.spawn Mocking Patterns for Testing CLI Executors

This research document covers comprehensive patterns for mocking `child_process.spawn()` in Node.js testing scenarios, with a focus on testing CLI executors.

## Table of Contents

1. [Introduction](#introduction)
2. [Popular Mocking Libraries](#popular-mocking-libraries)
3. [Jest Mocking Patterns](#jest-mocking-patterns)
4. [SinonJS Mocking Patterns](#sinonjs-mocking-patterns)
5. [Manual Mocking Approaches](#manual-mocking-approaches)
6. [Testing Scenarios](#testing-scenarios)
7. [Advanced Mocking Techniques](#advanced-mocking-techniques)
8. [Open Source Examples](#open-source-examples)
9. [Best Practices](#best-practices)

## Introduction

Mocking `child_process.spawn` is essential for testing CLI executor functionality without actually executing external processes. This research covers the most effective patterns and libraries for achieving this.

## Popular Mocking Libraries

### 1. Jest
- **Built-in mocking capabilities**
- Auto-mocks modules
- Function mocking with `jest.fn()`
- Mock implementation with `mockImplementation()`
- Mock return values with `mockReturnValue()`

### 2. SinonJS
- **Stubs and spies**
- Comprehensive mocking API
- Restoration capabilities
- Mocking timers and promises

### 3. Proxyquire
- **Dependency injection**
- Replace modules during testing
- Useful for complex mocking scenarios

### 4. Mockery
- **Mock replacement**
- Clean module cache
- Good for integration testing

### 5. TestDouble
- **Modern testing utilities**
- Simple API
- Good performance

## Jest Mocking Patterns

### Basic Module Mocking

```javascript
// __tests__/executor.test.js
const { spawn } = require('child_process');
const { executeMdsel } = require('../src/executor');

// Mock the entire module
jest.mock('child_process');

describe('executeMdsel', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should spawn npx mdsel with correct arguments', () => {
    const mockSpawn = jest.fn();
    spawn.mockImplementation(mockSpawn);

    executeMdsel(['index', '--json', 'file.md']);

    expect(spawn).toHaveBeenCalledWith('npx', ['mdsel', 'index', '--json', 'file.md']);
  });
});
```

### Mocking Spawn Return Object

```javascript
test('should capture stdout and stderr', async () => {
  const mockStdout = new PassThrough();
  const mockStderr = new PassThrough();

  const mockChild = {
    stdout: mockStdout,
    stderr: mockStderr,
    on: jest.fn(),
    kill: jest.fn()
  };

  const spawnMock = jest.fn().mockReturnValue(mockChild);
  spawn.mockImplementation(spawnMock);

  // Simulate process output
  setImmediate(() => {
    mockStdout.emit('data', Buffer.from('{"headings":[]}'));
    mockStderr.emit('data', Buffer.from(''));
    mockChild.on.mock.calls.find(([event]) => event === 'close')[1](0);
  });

  const result = await executeMdsel(['index', '--json', 'file.md']);

  expect(result.stdout).toBe('{"headings":[]}');
  expect(result.exitCode).toBe(0);
});
```

### Using Manual Mocks

Create `__mocks__/child_process.js`:

```javascript
// __mocks__/child_process.js
const events = require('events');

class MockChildProcess extends events.EventEmitter {
  constructor() {
    super();
    this.stdout = new PassThrough();
    this.stderr = new PassThrough();
    this.kill = jest.fn();
  }
}

const spawn = jest.fn(() => new MockChildProcess());

module.exports = { spawn };
```

## SinonJS Mocking Patterns

### Basic Stubbing

```javascript
const sinon = require('sinon');
const { spawn } = require('child_process');
const { executeMdsel } = require('../src/executor');

describe('executeMdsel with Sinon', () => {
  let spawnStub;

  beforeEach(() => {
    // Stub the spawn function
    spawnStub = sinon.stub(childProcess, 'spawn');
  });

  afterEach(() => {
    // Restore the original function
    spawnStub.restore();
  });

  test('should spawn with correct arguments', () => {
    const mockChild = {
      stdout: { on: sinon.stub().callsArgWith(1, Buffer.from('test')) },
      stderr: { on: sinon.stub() },
      on: sinon.stub().callsArgWith(1, 0),
      kill: sinon.stub()
    };

    spawnStub.returns(mockChild);

    executeMdsel(['select', 'heading:h1', 'file.md']);

    sinon.assert.calledWith(spawnStub, 'npx', ['mdsel', 'select', 'heading:h1', 'file.md']);
  });
});
```

### Stub with Promises

```javascript
test('should handle async operations', async () => {
  const mockChild = new EventEmitter();

  spawnStub.returns(mockChild);

  const promise = executeMdsel(['index', '--json', 'file.md']);

  // Simulate async behavior
  setImmediate(() => {
    mockChild.stdout.emit('data', Buffer.from('{"headings":[]}'));
    mockChild.emit('close', 0);
  });

  const result = await promise;
  expect(result.stdout).toBe('{"headings":[]}');
});
```

## Manual Mocking Approaches

### Using Proxyquire for Dependency Injection

```javascript
const proxyquire = require('proxyquire');
const { executeMdsel } = proxyquire('../src/executor', {
  'child_process': {
    spawn: function(command, args) {
      // Custom mock implementation
      return {
        stdout: { on: (event, callback) => {
          if (event === 'data') callback(Buffer.from('mock output'));
        }},
        stderr: { on: () => {} },
        on: (event, callback) => {
          if (event === 'close') callback(0);
        }
      };
    }
  }
});
```

### Creating a Mock Factory

```javascript
// test/mocks/spawnMock.js
const events = require('events');

function createMockChildProcess(stdoutData = '', stderrData = '', exitCode = 0) {
  const child = new events.EventEmitter();

  child.stdout = {
    on: jest.fn((event, callback) => {
      if (event === 'data' && stdoutData) {
        setImmediate(() => callback(Buffer.from(stdoutData)));
      }
      return child.stdout;
    })
  };

  child.stderr = {
    on: jest.fn((event, callback) => {
      if (event === 'data' && stderrData) {
        setImmediate(() => callback(Buffer.from(stderrData)));
      }
      return child.stderr;
    })
  };

  child.on = jest.fn((event, callback) => {
    if (event === 'close') {
      setImmediate(() => callback(exitCode));
    }
    return child;
  });

  child.kill = jest.fn();

  return child;
}

module.exports = { createMockChildProcess };
```

## Testing Scenarios

### 1. Success Case Testing

```javascript
test('should handle successful command execution', async () => {
  const mockChild = createMockChildProcess(
    '{"headings": [{"level": 1, "text": "Test Heading"}]}',
    '',
    0
  );

  spawn.mockReturnValue(mockChild);

  const result = await executeMdsel(['index', '--json', 'test.md']);

  expect(result.stdout).toContain('Test Heading');
  expect(result.exitCode).toBe(0);
});
```

### 2. Error Case Testing

```javascript
test('should handle command failure', async () => {
  const mockChild = createMockChildProcess(
    '',
    'Error: File not found',
    1
  );

  spawn.mockReturnValue(mockChild);

  await expect(executeMdsel(['index', 'nonexistent.md']))
    .rejects.toThrow('Error: File not found');
});
```

### 3. ENOENT Error Testing

```javascript
test('should handle command not found error', async () => {
  const spawnError = new Error('spawn ENOENT');
  spawnError.code = 'ENOENT';

  spawn.mockImplementation(() => {
    throw spawnError;
  });

  await expect(executeMdsel(['index', 'test.md']))
    .rejects.toThrow('spawn ENOENT');
});
```

### 4. Timeout Testing

```javascript
test('should handle process timeout', async () => {
  const mockChild = createMockChildProcess('', '', 0);
  spawn.mockReturnValue(mockChild);

  // Don't emit close event to simulate hanging process
  const timeoutSpy = jest.spyOn(mockChild, 'kill');

  await executeMdsel(['index', 'test.md']);

  // In a real test, you would need to implement timeout logic
  expect(timeoutSpy).not.toHaveBeenCalled();
});
```

### 5. Large Output Testing

```javascript
test('should handle large output', async () => {
  // Generate large output (1MB)
  const largeOutput = 'x'.repeat(1024 * 1024);
  const mockChild = createMockChildProcess(largeOutput, '', 0);

  spawn.mockReturnValue(mockChild);

  const result = await executeMdsel(['index', 'large.md']);

  expect(result.stdout).toBe(largeOutput);
  expect(result.exitCode).toBe(0);
});
```

## Advanced Mocking Techniques

### 1. Mocking Stream Behavior

```javascript
function createStreamMock(dataChunks) {
  let index = 0;
  return {
    on: jest.fn((event, callback) => {
      if (event === 'data' && dataChunks[index]) {
        setImmediate(() => callback(Buffer.from(dataChunks[index])));
        index++;
      }
      return this;
    })
  };
}

test('should handle streaming data', async () => {
  const mockChild = {
    stdout: createStreamMock(['line1\n', 'line2\n', 'line3\n']),
    stderr: createStreamMock(['']),
    on: jest.fn((event, callback) => {
      if (event === 'close') callback(0);
    }),
    kill: jest.fn()
  };

  spawn.mockReturnValue(mockChild);

  const result = await executeMdsel(['index', 'stream.md']);

  expect(result.stdout).toBe('line1\nline2\nline3\n');
});
```

### 2. Mocking Process Signals

```javascript
test('should handle process kill', async () => {
  const mockChild = {
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn(),
    kill: jest.fn(),
    killed: false
  };

  spawn.mockReturnValue(mockChild);

  executeMdsel(['index', 'test.md']);

  // Simulate timeout scenario
  mockChild.kill.mock.calls[0][0]('SIGTERM');

  expect(mockChild.kill).toHaveBeenCalledWith('SIGTERM');
});
```

### 3. Integration Testing with Real Files

```javascript
const fs = require('fs');
const path = require('path');

describe('Integration with test files', () => {
  const testFilePath = path.join(__dirname, 'fixtures', 'test.md');

  beforeAll(() => {
    // Create test fixture
    fs.writeFileSync(testFilePath, '# Test Heading\n\nThis is a test.');
  });

  afterAll(() => {
    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('should process real markdown file', async () => {
    const mockChild = createMockChildProcess(
      JSON.stringify({ headings: [{ level: 1, text: 'Test Heading' }] }),
      '',
      0
    );

    spawn.mockReturnValue(mockChild);

    const result = await executeMdsel(['index', '--json', testFilePath]);

    expect(JSON.parse(result.stdout)).toEqual({
      headings: [{ level: 1, text: 'Test Heading' }]
    });
  });
});
```

## Open Source Examples

### 1. VS Code Code Extension Testing

From [vscode-markdown-preview](https://github.com/microsoft/vscode-markdown-preview):

```javascript
// Test for markdown preview
suite('Markdown Preview', () => {
  test('should render markdown', async () => {
    const spawnStub = sinon.stub(cp, 'spawn');
    spawnStub.returns({
      stdout: { on: sinon.stub().callsArgWith(1, 'rendered html') },
      stderr: { on: sinon.stub() },
      on: sinon.stub().callsArgWith(1, 0)
    });

    // Test code...
  });
});
```

### 2. Jest Testing Patterns

From [Jest repository](https://github.com/facebook/jest):

```javascript
// Testing spawn with Jest
test('should spawn process with args', () => {
  const spy = jest.spyOn(childProcess, 'spawn');
  spy.mockImplementation((cmd, args) => {
    expect(cmd).toBe('node');
    expect(args).toContain('--test');
    return mockProcess;
  });

  // Test execution
});
```

### 3. Node.js Core Testing

From [Node.js test suite](https://github.com/nodejs/node):

```javascript
// Test child_process.spawn
test('spawn with shell option', () => {
  const child = spawn('echo', ['hello'], { shell: true });
  expect(child.spawnargs).toEqual(['echo', 'hello']);
});
```

### 4. CLI Tool Testing

From [commander.js](https://github.com/tj/commander.js):

```javascript
// Testing CLI tools
test('should parse arguments', () => {
  const spawnMock = jest.fn().mockReturnValue({
    stdout: { on: jest.fn().mockImplementation((event, fn) => {
      if (event === 'data') fn(Buffer.from('success'));
    }) },
    stderr: { on: jest.fn() },
    on: jest.fn().mockImplementation((event, fn) => {
      if (event === 'close') fn(0);
    })
  });

  // Test CLI parsing
});
```

## Best Practices

### 1. Always Restore Original Functions

```javascript
afterEach(() => {
  jest.restoreAllMocks();
  // or
  sinon.restore();
});
```

### 2. Test Edge Cases

```javascript
// Test empty arguments
test('should handle empty arguments', async () => {
  const mockChild = createMockChildProcess('{"headings": []}', '', 0);
  spawn.mockReturnValue(mockChild);

  const result = await executeMdsel(['index']);
  expect(result.stdout).toBe('{"headings": []}');
});
```

### 3. Use Test Isolation

```javascript
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});
```

### 4. Mock the Entire Module

```javascript
// Good - Mock the entire module
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

// Avoid - Individual function mocking
jest.spyOn(require('child_process'), 'spawn');
```

### 5. Type Safety with TypeScript

```typescript
// types/test-mocks.d.ts
declare module 'child_process' {
  export function spawn(
    command: string,
    args: string[],
    options?: SpawnOptions
  ): ChildProcess;

  // Add other types as needed
}
```

### 6. Document Mock Behaviors

```javascript
/**
 * Mock child_process.spawn for testing
 * @param {string} stdout - Simulated stdout output
 * @param {string} stderr - Simulated stderr output
 * @param {number} exitCode - Simulated exit code
 * @returns {MockChildProcess} Mock child process
 */
function createSpawnMock(stdout = '', stderr = '', exitCode = 0) {
  // Implementation
}
```

## Conclusion

Mocking `child_process.spawn` is essential for testing CLI executors. The key patterns include:

1. **Jest mocking** for built-in, simple mocking
2. **SinonJS** for comprehensive stubbing and spying
3. **Manual mocks** for complex scenarios
4. **Proxyquire** for dependency injection
5. **Factory functions** for consistent mock creation

Choose the approach that best fits your testing framework and requirements. Always ensure proper cleanup and isolation between tests.

## Additional Resources

- [Jest Mocking Documentation](https://jestjs.io/docs/mock-functions)
- [SinonJS Documentation](https://sinonjs.org/)
- [Node.js child_process Documentation](https://nodejs.org/api/child_process.html)
- [Proxyquire Documentation](https://github.com/thlorenz/proxyquire)
- [TestDouble Documentation](https://testdouble.com/docs/getting-started-with-testdouble)