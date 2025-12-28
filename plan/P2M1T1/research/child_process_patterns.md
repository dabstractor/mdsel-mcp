# Node.js child_process.spawn() Patterns & Best Practices

This research document covers comprehensive patterns for using Node.js `child_process.spawn()` effectively, with a focus on TypeScript implementations.

## Table of Contents

1. [Basic spawn() Usage](#basic-spawn-usage)
2. [Stream Handling (stdout/stderr)](#stream-handling-stdoutstderr)
3. [Exit Code and Error Handling](#exit-code-and-error-handling)
4. [Promise-Based Wrapper Patterns](#promise-based-wrapper-patterns)
5. [Advanced Considerations](#advanced-considerations)
6. [NPX-Specific Patterns](#npx-specific-patterns)
7. [Encoding Considerations](#encoding-considerations)
8. [Common Gotchas](#common-gotchas)

## Basic spawn() Usage

### Basic Example
```typescript
import { spawn, ChildProcess } from 'child_process';

// Spawn a simple command
const child: ChildProcess = spawn('ls', ['-la', '/usr']);

// Basic event handling
child.stdout.on('data', (data: Buffer) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data: Buffer) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code: number) => {
  console.log(`Process exited with code ${code}`);
});
```

### Typed Spawn Options
```typescript
import { spawn, SpawnOptions } from 'child_process';

interface TypedSpawnOptions extends SpawnOptions {
  encoding?: BufferEncoding;
  timeout?: number;
  maxBuffer?: number;
  killSignal?: string | number;
  windowsHide?: boolean;
}

function safeSpawn(command: string, args: string[], options: TypedSpawnOptions = {}): ChildProcess {
  const defaultOptions: TypedSpawnOptions = {
    stdio: 'pipe',
    shell: false,
    encoding: 'utf8',
    timeout: 0,
    maxBuffer: 1024 * 1024, // 1MB
    ...options
  };

  return spawn(command, args, defaultOptions);
}
```

## Stream Handling (stdout/stderr)

### Collecting Output
```typescript
import { spawn } from 'child_process';

interface ProcessOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

function executeCommand(command: string, args: string[]): Promise<ProcessOutput> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';

    // Handle stdout
    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    // Handle stderr
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', (code: number | null) => {
      resolve({
        stdout,
        stderr,
        exitCode: code
      });
    });

    // Handle process errors
    child.on('error', (error: Error) => {
      reject(error);
    });
  });
}
```

### Stream Piping Pattern
```typescript
import { spawn } from 'child_process';

function spawnWithPiping(command: string, args: string[], options: any = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit' // Inherit parent stdio
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to spawn process: ${error.message}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}
```

### Real-time Stream Processing
```typescript
import { spawn, Transform } from 'child_process';

function createLineTransform(): Transform {
  let remaining = '';

  return new Transform({
    transform(chunk: Buffer, encoding, callback) {
      remaining += chunk.toString();
      const lines = remaining.split('\n');
      remaining = lines.pop() || '';

      for (const line of lines) {
        this.push(line + '\n');
      }

      callback();
    },
    flush(callback) {
      if (remaining) {
        this.push(remaining);
      }
      callback();
    }
  });
}

// Usage
const child = spawn('git', ['log', '--oneline']);
child.stdout
  .pipe(createLineTransform())
  .on('data', (line: Buffer) => {
    console.log(`Git commit: ${line.toString().trim()}`);
  });
```

## Exit Code and Error Handling

### Comprehensive Error Handling
```typescript
import { spawn, SpawnOptions } from 'child_process';

class ProcessError extends Error {
  constructor(
    public message: string,
    public exitCode: number | null = null,
    public signal: NodeJS.Signals | null = null,
    public stdout?: string,
    public stderr?: string
  ) {
    super(message);
    this.name = 'ProcessError';
  }
}

async function executeWithRetry(
  command: string,
  args: string[],
  maxRetries: number = 3,
  spawnOptions: SpawnOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await spawnCommand(command, args, spawnOptions);
      return result;
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw lastError!;
}

async function spawnCommand(
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(new ProcessError(
        `Failed to spawn process: ${error.message}`,
        null,
        null,
        stdout,
        stderr
      ));
    });

    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new ProcessError(
          `Process exited with code ${code}${signal ? `, signal: ${signal}` : ''}`,
          code,
          signal,
          stdout,
          stderr
        ));
      }
    });

    child.on('exit', (code, signal) => {
      // Additional cleanup if needed
    });
  });
}
```

### ENOENT and Command Not Found Handling
```typescript
async function safeSpawnCommand(command: string, args: string[]): Promise<string> {
  try {
    const result = await spawnCommand(command, args);
    return result.stdout;
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`Command not found: ${command}. Please ensure it's installed and in PATH.`);
    }
    throw error;
  }
}
```

## Promise-Based Wrapper Patterns

### Basic Promise Wrapper
```typescript
import { spawn } from 'child_process';

function promisifiedSpawn(
  command: string,
  args: string[],
  options: any = {}
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
```

### Advanced Spawn Utility Class
```typescript
import { spawn, ChildProcess, SpawnOptions } from 'child_process';

interface SpawnResult {
  process: ChildProcess;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

class SpawnManager {
  private processes: Set<ChildProcess> = new Set();

  async spawn(
    command: string,
    args: string[],
    options: SpawnOptions = {}
  ): Promise<SpawnResult> {
    const child = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });

    this.processes.add(child);

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const result = await new Promise<SpawnResult>((resolve, reject) => {
      child.on('close', (exitCode) => {
        this.processes.delete(child);
        resolve({
          process: child,
          stdout,
          stderr,
          exitCode
        });
      });

      child.on('error', (error) => {
        this.processes.delete(child);
        reject(error);
      });
    });

    return result;
  }

  killAll(signal: string | number = 'SIGTERM'): void {
    this.processes.forEach(child => {
      if (!child.killed) {
        child.kill(signal);
      }
    });
    this.processes.clear();
  }

  cleanupOnExit(): void {
    process.on('exit', () => this.killAll());
    process.on('SIGINT', () => {
      this.killAll('SIGINT');
      process.exit();
    });
    process.on('SIGTERM', () => {
      this.killAll('SIGTERM');
      process.exit();
    });
  }
}

// Usage
const spawnManager = new SpawnManager();
spawnManager.cleanupOnExit();
```

## Advanced Considerations

### Process Pool Pattern
```typescript
import { spawn } from 'child_process';

interface ProcessTask {
  command: string;
  args: string[];
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

class ProcessPool {
  private poolSize: number;
  private activeProcesses = 0;
  private queue: ProcessTask[] = [];

  constructor(poolSize: number = 4) {
    this.poolSize = poolSize;
  }

  async execute(command: string, args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ command, args, resolve, reject });
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.activeProcesses >= this.poolSize || this.queue.length === 0) {
      return;
    }

    this.activeProcesses++;
    const task = this.queue.shift()!;

    this.runProcess(task.command, task.args)
      .then(task.resolve)
      .catch(task.reject)
      .finally(() => {
        this.activeProcesses--;
        this.processQueue();
      });
  }

  private async runProcess(command: string, args: string[]): Promise<any> {
    const { stdout, stderr, exitCode } = await promisifiedSpawn(command, args);

    if (exitCode !== 0) {
      throw new Error(`Command failed: ${stderr}`);
    }

    return stdout;
  }
}
```

### Process State Management
```typescript
import { spawn } from 'child_process';

interface ProcessState {
  id: string;
  command: string;
  args: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}

class ProcessMonitor {
  private processes: Map<string, ProcessState> = new Map();

  async spawnWithTracking(
    id: string,
    command: string,
    args: string[]
  ): Promise<ProcessState> {
    const state: ProcessState = {
      id,
      command,
      args,
      status: 'pending'
    };

    this.processes.set(id, state);

    try {
      state.status = 'running';
      state.startTime = new Date();

      const result = await promisifiedSpawn(command, args);

      state.status = 'completed';
      state.exitCode = result.exitCode;
      state.stdout = result.stdout;
      state.stderr = result.stderr;
      state.endTime = new Date();

      return state;
    } catch (error) {
      state.status = 'failed';
      state.stderr = error.message;
      state.endTime = new Date();
      throw error;
    } finally {
      this.processes.set(id, state);
    }
  }

  getProcessState(id: string): ProcessState | undefined {
    return this.processes.get(id);
  }

  getAllProcesses(): ProcessState[] {
    return Array.from(this.processes.values());
  }
}
```

## NPX-Specific Patterns

### Safe NPX Execution
```typescript
import { spawn } from 'child_process';

async function safeNPXCommand(packageName: string, args: string[]): Promise<string> {
  // Validate package name to prevent command injection
  if (!/^[a-z0-9\-_\.]+$/.test(packageName)) {
    throw new Error('Invalid package name');
  }

  const npxArgs = ['--no-install', '--quiet', packageName, ...args];

  try {
    const result = await spawnCommand('npx', npxArgs);
    return result.stdout;
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error('NPX not found. Please install Node.js and npm.');
    }
    throw error;
  }
}

// Example usage
async function runTypeScriptFile(file: string): Promise<void> {
  const result = await safeNPXCommand('typescript', ['--target', 'es2017', '--lib', 'dom,es2017', file]);
  console.log(result);
}
```

### NPX Timeout Handling
```typescript
async function npxWithTimeout(
  packageName: string,
  args: string[],
  timeoutMs: number = 30000
): Promise<string> {
  const child = spawn('npx', ['--no-install', packageName, ...args]);

  const timeout = setTimeout(() => {
    child.kill('SIGTERM');
    throw new Error(`NPX command timed out after ${timeoutMs}ms`);
  }, timeoutMs);

  try {
    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => stdout += data.toString());
      child.stderr?.on('data', (data) => stderr += data.toString());

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`NPX command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    return result.stdout;
  } finally {
    clearTimeout(timeout);
  }
}
```

## Encoding Considerations

### UTF-8 and Buffer Handling
```typescript
import { spawn } from 'child_process';

interface SpawnOptionsWithEncoding extends SpawnOptions {
  encoding?: BufferEncoding;
}

function spawnWithEncoding(
  command: string,
  args: string[],
  options: SpawnOptionsWithEncoding = {}
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  const encoding = options.encoding || 'utf8';

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });

    let stdout = '';
    let stderr = '';

    // Handle different encodings
    const handleStream = (stream: NodeJS.ReadableStream, buffer: string) => {
      stream.on('data', (data: Buffer) => {
        buffer += data.toString(encoding);
      });
    };

    handleStream(child.stdout, stdout);
    handleStream(child.stderr, stderr);

    child.on('close', (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Binary data handling
async function spawnWithBinaryOutput(
  command: string,
  args: string[]
): Promise<{ stdout: Buffer; stderr: Buffer; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'pipe' });

    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);

    child.stdout?.on('data', (data: Buffer) => {
      stdout = Buffer.concat([stdout, data]);
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderr = Buffer.concat([stderr, data]);
    });

    child.on('close', (exitCode) => {
      resolve({ stdout, stderr, exitCode });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}
```

### Encoding Detection
```typescript
import { spawn } from 'child_process';

async function spawnWithAutoEncoding(
  command: string,
  args: string[]
): Promise<{ stdout: string; stderr: string; exitCode: number | null; encoding?: string }> {
  // Try UTF-8 first
  try {
    return await spawnWithEncoding(command, args, { encoding: 'utf8' });
  } catch (error) {
    // If UTF-8 fails, try latin1
    return await spawnWithEncoding(command, args, { encoding: 'latin1' });
  }
}
```

## Common Gotchas

### 1. Shell Injection Vulnerability
```typescript
// BAD - Vulnerable to command injection
function badSpawn(userInput: string) {
  spawn(`echo ${userInput}`, [], { shell: true });
}

// GOOD - Safe version
function goodSpawn(userInput: string) {
  spawn('echo', [userInput], { shell: false });
}
```

### 2. Memory Leaks from Large Output
```typescript
// BAD - No buffer size limit
function badSpawnUnlimited() {
  spawn('command', ['args']).stdout.on('data', (data) => {
    // This can cause memory issues with large output
  });
}

// GOOD - With buffer size limit
function goodSpawnLimited() {
  spawn('command', ['args'], { maxBuffer: 1024 * 1024 }) // 1MB limit
    .stdout.on('data', (data) => {
      // Process in chunks
    });
}
```

### 3. Hanging Processes
```typescript
// BAD - Process can hang indefinitely
function badSpawnHanging() {
  spawn('command', ['args']).on('close', () => {
    // Process might hang waiting for input
  });
}

// GOOD - Proper timeout handling
async function goodSpawnWithTimeout() {
  const child = spawn('command', ['args'], { timeout: 5000 });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Process timed out'));
    }, 5000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve(code);
    });
  });
}
```

### 4. Path Issues Across Platforms
```typescript
// BAD - Windows-specific path issues
function badSpawnPath() {
  spawn('script.sh', [], { cwd: 'C:/Users/name' }); // Fails on Windows
}

// GOOD - Cross-platform path handling
import { join } from 'path';
import { homedir } from 'os';

function goodSpawnPath() {
  const scriptPath = join(homedir(), 'scripts', 'script.sh');
  spawn('script.sh', [], { cwd: scriptPath });
}
```

### 5. Signal Handling
```typescript
// BAD - Improper signal handling
function badSpawnSignals() {
  spawn('command', []).on('exit', () => {
    // Doesn't differentiate between normal exit and signal
  });
}

// GOOD - Proper signal handling
function goodSpawnSignals() {
  spawn('command', []).on('exit', (code, signal) => {
    if (signal) {
      console.log(`Process killed by ${signal}`);
    } else {
      console.log(`Process exited with code ${code}`);
    }
  });
}
```

## Complete TypeScript Example

Here's a complete, production-ready spawn wrapper:

```typescript
import { spawn, ChildProcess, SpawnOptions } from 'child_process';
import { promisify } from 'util';

export interface SpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  process: ChildProcess;
}

export interface SpawnOptionsWithEncoding extends SpawnOptions {
  encoding?: BufferEncoding;
  timeout?: number;
  maxBuffer?: number;
}

export class ProcessSpawner {
  private processes = new Set<ChildProcess>();

  async spawn(
    command: string,
    args: string[] = [],
    options: SpawnOptionsWithEncoding = {}
  ): Promise<SpawnResult> {
    const {
      encoding = 'utf8',
      timeout = 0,
      maxBuffer = 1024 * 1024, // 1MB default
      ...spawnOptions
    } = options;

    const child = spawn(command, args, {
      stdio: 'pipe',
      ...spawnOptions
    });

    this.processes.add(child);

    let stdout = '';
    let stderr = '';

    const stdoutHandler = (data: Buffer) => {
      stdout += data.toString(encoding);
    };

    const stderrHandler = (data: Buffer) => {
      stderr += data.toString(encoding);
    };

    child.stdout?.on('data', stdoutHandler);
    child.stderr?.on('data', stderrHandler);

    // Cleanup on process end
    const cleanup = () => {
      child.stdout?.removeListener('data', stdoutHandler);
      child.stderr?.removeListener('data', stderrHandler);
      this.processes.delete(child);
    };

    return new Promise<SpawnResult>((resolve, reject) => {
      if (timeout > 0) {
        const timeoutId = setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error(`Process timed out after ${timeout}ms`));
        }, timeout);

        child.on('close', () => {
          clearTimeout(timeoutId);
        });
      }

      child.on('error', (error) => {
        cleanup();
        reject(error);
      });

      child.on('close', (exitCode, signal) => {
        cleanup();

        if (exitCode === 0) {
          resolve({
            stdout,
            stderr,
            exitCode,
            signal,
            process: child
          });
        } else {
          reject(new Error(`Process failed with code ${exitCode}: ${stderr}`));
        }
      });
    });
  }

  killAll(signal: string | number = 'SIGTERM'): void {
    this.processes.forEach(child => {
      if (!child.killed) {
        child.kill(signal);
      }
    });
    this.processes.clear();
  }

  cleanupOnExit(): void {
    process.on('exit', () => this.killAll());
    process.on('SIGINT', () => {
      this.killAll('SIGINT');
      process.exit();
    });
    process.on('SIGTERM', () => {
      this.killAll('SIGTERM');
      process.exit();
    });
  }
}

// Usage example
const spawner = new ProcessSpawner();
spawner.cleanupOnExit();

async function runCommand() {
  try {
    const result = await spawner.spawn('ls', ['-la'], {
      encoding: 'utf8',
      timeout: 10000,
      cwd: process.cwd()
    });

    console.log('Command output:', result.stdout);
  } catch (error) {
    console.error('Command failed:', error.message);
  }
}
```

## References and Resources

1. [Node.js child_process Documentation](https://nodejs.org/api/child_process.html)
2. [Node.js Stream Documentation](https://nodejs.org/api/stream.html)
3. [TypeNode - TypeScript Node.js Definitions](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node)
4. [Node.js Best Practices - spawn()](https://github.com/goldbergyoni/nodebestpractices#-7-working-with-external-processes-and-child-processes)
5. [Node.js Security - Command Injection](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#command-injection)