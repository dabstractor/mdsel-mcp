# Node.js Subprocess Execution Research

## Overview

Research findings for implementing robust subprocess execution in TypeScript/Node.js CLI wrappers, specifically for the mdsel-mcp project.

## 1. Node.js child_process Module APIs

### 1.1 spawn() - Recommended for This Use Case

```typescript
import { spawn } from 'child_process';

const child = spawn('command', ['arg1', 'arg2'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  encoding: 'utf8',
  timeout: 5000
});
```

**Why spawn() for mdsel-mcp:**
- Handles long-running processes with streaming output
- Provides fine-grained control over stdio streams
- Non-blocking by default (essential for async MCP server)
- Can handle large outputs without buffering issues

### 1.2 Other APIs (For Reference)

**exec()**: Convenience for shell commands with buffered output
```typescript
import { exec } from 'child_process';
exec('command arg1 arg2', { timeout: 10000 }, (error, stdout, stderr) => { });
```

**execFile()**: Safer - executes file directly without shell
```typescript
import { execFile } from 'child_process';
execFile('node', ['script.js', 'arg1'], (error, stdout, stderr) => { });
```

**execSync()**: Synchronous blocking version
```typescript
import { execSync } from 'child_process';
const output = execSync('command arg1 arg2');
```

## 2. Official Documentation

### 2.1 Core References

- **[child_process module](https://nodejs.org/api/child_process.html#child_process_child_process)**
  - Complete API reference for all subprocess methods
  - Event handling documentation (close, exit, error, data)

- **[spawn() documentation](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)**
  - Options: stdio, cwd, env, timeout, uid, gid, shell
  - Return value: ChildProcess instance with streams

- **[Class: ChildProcess](https://nodejs.org/api/child_process.html#child_process_class_childprocess)**
  - Events: close, exit, error, disconnect, message, spawn
  - Methods: kill(), send(), ref(), unref()
  - Properties: pid, stdin, stdout, stderr, stdio, killed, signalCode

- **[Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)**
  - Input validation and sanitization
  - Environment variable handling
  - Shell injection prevention

## 3. Stream Handling Best Practices

### 3.1 Proper Stream Accumulation Pattern

```typescript
import { spawn } from 'child_process';

function runCommand(command: string, args: string[]) {
  return new Promise<{ stdout: string; stderr: string; code: number }>((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';

    // Handle stdout stream - IMPORTANT: Must handle data events
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Handle stderr stream
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle spawn errors (e.g., command not found)
    child.on('error', (error) => {
      reject(error);
    });

    // Handle process completion
    child.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });
  });
}
```

### 3.2 Streaming to Output (Alternative)

```typescript
const child = spawn('command', ['args']);

// Pipe stdout to current process stdout
child.stdout.pipe(process.stdout);

// Pipe stderr to current process stderr
child.stderr.pipe(process.stderr);

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
```

**Note**: For mdsel-mcp, we MUST capture output (not pipe) to return it to MCP client.

## 4. Error Handling Patterns

### 4.1 Promise-Based Error Handling with Timeout

```typescript
import { spawn } from 'child_process';

function spawnWithTimeout(
  command: string,
  args: string[],
  timeoutMs: number = 5000
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let timeout: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(timeout);
      child.removeAllListeners();
    };

    timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      // Force kill if SIGTERM doesn't work
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
        }
      }, 2000);
      reject(new Error(`Process timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      cleanup();
      if (timedOut) return;

      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      } else {
        resolve({ stdout, stderr, code });
      }
    });

    child.on('error', (error) => {
      cleanup();
      reject(error);
    });
  });
}
```

### 4.2 Critical: Two-Phase Termination

```typescript
// SIGTERM first, wait grace period, then SIGKILL
function terminateProcess(child: ChildProcess, gracePeriodMs: number = 2000) {
  child.kill('SIGTERM');

  setTimeout(() => {
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }, gracePeriodMs);
}
```

**Why this pattern matters:**
- SIGTERM allows process to clean up resources
- SIGKILL force-terminates if SIGTERM is ignored
- Prevents zombie processes

## 5. Security Considerations

### 5.1 Shell Injection Prevention

```typescript
// NEVER do this - vulnerable to shell injection
function vulnerableCommand(userInput: string) {
  // exec() uses shell, so userInput could execute arbitrary commands
  exec(`grep "${userInput}" file.txt`);
}

// ALWAYS use parameterized arguments with spawn()
function safeCommand(userInput: string) {
  // spawn() doesn't use shell by default
  spawn('grep', [userInput, 'file.txt']);
}

// Or use execFile for direct execution
function safeFileCommand(userInput: string) {
  execFile('grep', ['file.txt', userInput], (error, stdout, stderr) => { });
}
```

### 5.2 Environment Security

```typescript
function secureExecution(
  command: string,
  args: string[],
  options: {
    env?: NodeJS.ProcessEnv;
    cwd?: string;
  } = {}
) {
  // Create minimal environment
  const cleanEnv = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    // For mdsel-mcp: disable color output
    NO_COLOR: '1',
    ...options.env
  };

  return spawn(command, args, {
    ...options,
    env: cleanEnv,
    stdio: ['pipe', 'pipe', 'pipe']
  });
}
```

## 6. Buffer Management

### 6.1 maxBuffer Option

```typescript
const child = spawn('command', ['args'], {
  stdio: 'pipe',
  maxBuffer: 1024 * 1024 * 10 // 10MB buffer
});
```

**Default**: 1024 * 1024 (1MB) for stdout and stderr each

**For mdsel-mcp**: Consider increasing to 50MB for large Markdown files

### 6.2 Handling Buffer Overflow

```typescript
child.stdout.on('data', (data) => {
  stdout += data.toString();

  // Check if approaching limit
  if (stdout.length > MAX_BUFFER_SIZE) {
    child.kill('SIGKILL');
    reject(new Error(`Output exceeded buffer limit`));
  }
});
```

## 7. Common Pitfalls and Solutions

### Pitfall 1: Memory Leaks from Unhandled Streams

```typescript
// PROBLEM: Streams not properly handled
const child = spawn('command', ['args']);
child.stdout.on('data', (data) => {
  console.log(data); // No cleanup
});

// SOLUTION: Proper cleanup
const child = spawn('command', ['args']);
child.stdout.on('data', (data) => {
  console.log(data);
});

child.on('close', () => {
  child.stdout.removeAllListeners();
  child.stderr.removeAllListeners();
});
```

### Pitfall 2: Deadlocks with Buffered Output

```typescript
// PROBLEM: Large output can cause deadlock
const child = spawn('command', ['args'], { stdio: 'pipe' });

// SOLUTION: Increase buffer or use streams
const child = spawn('command', ['args'], {
  stdio: 'pipe',
  maxBuffer: 1024 * 1024 * 10 // 10MB
});
```

### Pitfall 3: Not Handling 'error' Event

```typescript
// PROBLEM: Unhandled promise rejection if command doesn't exist
const child = spawn('nonexistent', ['args']);
// If spawn fails, error event is emitted

// SOLUTION: Always handle error event
child.on('error', (err) => {
  console.error('Failed to spawn process:', err);
  reject(err);
});
```

## 8. TypeScript-Specific Patterns

### 8.1 Type Definitions

```typescript
import { ChildProcess, SpawnOptions } from 'child_process';

interface ProcessResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
}

interface ProcessOptions extends SpawnOptions {
  timeout?: number;
  maxBuffer?: number;
}

class ProcessExecutor {
  async execute(
    command: string,
    args: string[],
    options: ProcessOptions = {}
  ): Promise<ProcessResult> {
    // Implementation
  }
}
```

### 8.2 Modern Async/Await

```typescript
// Using util.promisify (simpler cases)
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const { stdout, stderr } = await execAsync('command arg1 arg2', {
  timeout: 5000
});

// But for mdsel-mcp, use spawn() for stream control
```

## 9. Node.js Version Considerations

- **Node.js >= 18.0.0** required for mdsel-mcp (per mdsel requirements)
- **ESM modules**: All imports must use `.js` extensions
- **top-level await**: Available in ESM modules (not needed for this task)

## 10. References

- [Node.js child_process API](https://nodejs.org/api/child_process.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
