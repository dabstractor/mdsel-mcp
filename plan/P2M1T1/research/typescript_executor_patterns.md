# TypeScript Patterns for CLI Executor Functions

## Research Summary

This document explores TypeScript patterns for implementing CLI executor functions, focusing on return types, interfaces, error handling, type-safe argument passing, async/await patterns, and best practices for external process interactions.

## 1. TypeScript Return Type Patterns for Process Execution Results

### Basic Return Types

```typescript
// Simple Promise-based return type
type ProcessResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

// Enhanced with additional metadata
type EnhancedProcessResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
  executionTime?: number;
  signal?: NodeJS.Signals | null;
  pid?: number;
  error?: Error;
};

// Union type for different execution states
type ProcessExecutionResult =
  | { type: 'success'; stdout: string; stderr: string; exitCode: 0 }
  | { type: 'error'; stdout: string; stderr: string; exitCode: number; error: Error }
  | { type: 'timeout'; stdout: string; stderr: string; exitCode: number };
```

### Result Objects with Discriminants

```typescript
interface ProcessResultBase {
  stdout: string;
  stderr: string;
  exitCode: number;
}

interface SuccessResult extends ProcessResultBase {
  status: 'success';
  executionTime: number;
}

interface ErrorResult extends ProcessResultBase {
  status: 'error';
  error: Error;
}

interface TimeoutResult extends ProcessResultBase {
  status: 'timeout';
  timeoutMs: number;
}

type ProcessExecutionStatus = SuccessResult | ErrorResult | TimeoutResult;
```

## 2. Interface Definitions for CLI Execution Results

### Standard Process Result Interface

```typescript
/**
 * Represents the result of a process execution
 */
interface ProcessResult {
  /** Standard output as string */
  stdout: string;

  /** Standard error as string */
  stderr: string;

  /** Exit code of the process (0 = success, non-zero = error) */
  exitCode: number;

  /** Whether the execution was successful (exitCode === 0) */
  success: boolean;

  /** Optional error if the process failed to spawn */
  error?: Error;

  /** Process ID if process was spawned */
  pid?: number;

  /** Signal that terminated the process */
  signal?: NodeJS.Signals | null;

  /** Time taken for execution in milliseconds */
  executionTime?: number;

  /** Working directory where command was executed */
  cwd?: string;

  /** Environment variables used */
  env?: NodeJS.ProcessEnv;
}
```

### Execution Options Interface

```typescript
/**
 * Options for process execution
 */
interface ProcessOptions {
  /** Command to execute */
  command: string;

  /** Arguments to pass to the command */
  args?: string[];

  /** Current working directory */
  cwd?: string;

  /** Environment variables */
  env?: NodeJS.ProcessEnv;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Encoding for stdout/stderr */
  encoding?: BufferEncoding;

  /** Whether to automatically trim whitespace from output */
  trim?: boolean;

  /** Maximum buffer size for stdout/stderr */
  maxBuffer?: number;

  /** Whether to shell out to the system shell */
  shell?: boolean;
}
```

### Command Builder Pattern

```typescript
interface CommandBuilder {
  command: string;

  withArgs(args: string[]): CommandBuilder;
  withCwd(cwd: string): CommandBuilder;
  withEnv(env: NodeJS.ProcessEnv): CommandBuilder;
  withTimeout(timeout: number): CommandBuilder;
  withEncoding(encoding: BufferEncoding): CommandBuilder;
  trimOutput(trim: boolean): CommandBuilder;

  execute(): Promise<ProcessResult>;
}

class ProcessCommandBuilder implements CommandBuilder {
  // Implementation would go here
}
```

## 3. Error Handling Patterns for CLI Execution in TypeScript

### Basic Error Handling

```typescript
async function executeCommand(command: string, args: string[]): Promise<ProcessResult> {
  const child = spawn(command, args);
  let stdout = '';
  let stderr = '';
  let error: Error | undefined;

  const stdoutBuffer = Buffer.alloc(1024 * 1024); // 1MB buffer
  const stderrBuffer = Buffer.alloc(1024 * 1024);

  child.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  return new Promise<ProcessResult>((resolve) => {
    child.on('close', (exitCode) => {
      resolve({
        stdout,
        stderr,
        exitCode,
        success: exitCode === 0,
        error,
      });
    });

    child.on('error', (err) => {
      error = err;
      resolve({
        stdout,
        stderr,
        exitCode: -1,
        success: false,
        error: err,
      });
    });
  });
}
```

### Error Type Hierarchy

```typescript
class ProcessError extends Error {
  constructor(
    public stdout: string,
    public stderr: string,
    public exitCode: number,
    message?: string
  ) {
    super(message || `Process failed with exit code ${exitCode}`);
    this.name = 'ProcessError';
  }
}

class ProcessTimeoutError extends ProcessError {
  constructor(
    stdout: string,
    stderr: string,
    timeoutMs: number
  ) {
    super(stdout, stderr, -1, `Process timed out after ${timeoutMs}ms`);
    this.name = 'ProcessTimeoutError';
  }
}

class ProcessSpawnError extends Error {
  constructor(
    public command: string,
    public args: string[],
    originalError: Error
  ) {
    super(`Failed to spawn process: ${originalError.message}`);
    this.name = 'ProcessSpawnError';
    this.originalError = originalError;
  }

  public readonly originalError: Error;
}
```

### Advanced Error Handling with Result Types

```typescript
type ProcessResult<T = string> =
  | { success: true; data: T; exitCode: 0; stderr: string }
  | { success: false; error: ProcessError; stdout: string; stderr: string };

async function executeWithResult<T>(
  command: string,
  args: string[],
  parser?: (stdout: string) => T
): Promise<ProcessResult<T>> {
  try {
    const result = await executeCommand(command, args);

    if (result.success) {
      return {
        success: true,
        data: parser ? parser(result.stdout) : result.stdout as T,
        exitCode: result.exitCode,
        stderr: result.stderr,
      };
    } else {
      return {
        success: false,
        error: new ProcessError(
          result.stdout,
          result.stderr,
          result.exitCode
        ),
        stdout: result.stdout,
        stderr: result.stderr,
      };
    }
  } catch (error) {
    if (error instanceof ProcessError) {
      return {
        success: false,
        error,
        stdout: '',
        stderr: error.stderr,
      };
    }
    throw error;
  }
}
```

## 4. Type-Safe Argument Passing Patterns for CLI Tools

### Command Arguments with Validation

```typescript
interface CommandArguments {
  [key: string]: string | number | boolean | undefined;
}

function buildArgs(args: CommandArguments): string[] {
  return Object.entries(args)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? `--${key}` : undefined;
      }
      return `--${key}=${value}`;
    })
    .filter(Boolean) as string[];
}

// Usage
const args = buildArgs({
  verbose: true,
  output: 'result.txt',
  count: 42,
  silent: false,
});

console.log(args); // ['--verbose', '--output=result.txt', '--count=42']
```

### Typed Command Arguments

```typescript
type MdselArgs = {
  mode?: 'query' | 'build' | 'validate';
  output?: string;
  input: string;
  verbose?: boolean;
  timeout?: number;
  config?: string;
};

function validateArgs(args: MdselArgs): void {
  if (!args.input) {
    throw new Error('Input is required');
  }

  if (args.timeout && args.timeout < 1000) {
    throw new Error('Timeout must be at least 1000ms');
  }
}

function buildMdselArgs(args: MdselArgs): string[] {
  const flagArgs: CommandArguments = {};

  if (args.mode) flagArgs.mode = args.mode;
  if (args.output) flagArgs.output = args.output;
  if (args.config) flagArgs.config = args.config;
  if (args.verbose) flagArgs.verbose = true;
  if (args.timeout) flagArgs.timeout = args.timeout.toString();

  return ['input', args.input, ...buildArgs(flagArgs)];
}

// Usage
const mdselArgs: MdselArgs = {
  mode: 'query',
  output: 'result.json',
  input: 'data.md',
  verbose: true,
  timeout: 5000,
};

const commandArgs = buildMdselArgs(mdselArgs);
console.log(commandArgs);
// ['input', 'data.md', '--mode=query', '--output=result.json', '--verbose', '--timeout=5000']
```

### Argument Builder Pattern

```typescript
class MdselArgumentBuilder {
  private args: MdselArgs = {};

  mode(mode: 'query' | 'build' | 'validate'): this {
    this.args.mode = mode;
    return this;
  }

  output(output: string): this {
    this.args.output = output;
    return this;
  }

  input(input: string): this {
    this.args.input = input;
    return this;
  }

  verbose(verbose: boolean = true): this {
    this.args.verbose = verbose;
    return this;
  }

  timeout(timeout: number): this {
    this.args.timeout = timeout;
    return this;
  }

  config(config: string): this {
    this.args.config = config;
    return this;
  }

  build(): string[] {
    validateArgs(this.args);
    return buildMdselArgs(this.args);
  }
}

// Usage
const args = new MdselArgumentBuilder()
  .input('data.md')
  .mode('query')
  .output('result.json')
  .verbose()
  .timeout(10000)
  .build();
```

## 5. Async/Await Patterns for Promise-Based Process Spawning

### Basic Promise Wrapper for spawn

```typescript
import { spawn } from 'child_process';

function spawnAsync(
  command: string,
  args: string[] = [],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    encoding?: BufferEncoding;
    timeout?: number;
  } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
    });

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout | undefined;

    // Handle timeout
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        child.kill();
        reject(new Error(`Process timed out after ${options.timeout}ms`));
      }, options.timeout);
    }

    // Capture output
    child.stdout?.on('data', (data) => {
      stdout += data.toString(options.encoding || 'utf8');
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString(options.encoding || 'utf8');
    });

    child.on('close', (exitCode) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({ stdout, stderr, exitCode });
    });

    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
  });
}
```

### Using execa for Better Promise Support

```typescript
import execa from 'execa';

async function executeWithExeca(command: string, args: string[]): Promise<ProcessResult> {
  const startTime = Date.now();

  try {
    const result = await execa(command, args, {
      encoding: 'utf8',
      timeout: 30000,
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      success: true,
      executionTime: Date.now() - startTime,
      pid: result.pid,
    };
  } catch (error) {
    if (error instanceof execa.ExecaError) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        exitCode: error.exitCode || -1,
        success: false,
        error: error,
        executionTime: Date.now() - startTime,
      };
    }
    throw error;
  }
}
```

### Concurrent Process Execution

```typescript
async function executeMultipleCommands(
  commands: Array<{ command: string; args: string[] }>
): Promise<ProcessResult[]> {
  const promises = commands.map(({ command, args }) =>
    executeMdsel(args)
      .catch(error => ({
        stdout: '',
        stderr: error.message,
        exitCode: -1,
        success: false,
        error,
      }))
  );

  return Promise.all(promises);
}

// Usage
const results = await executeMultipleCommands([
  { command: 'mdsel', args: ['--query', 'test.md'] },
  { command: 'mdsel', args: ['--build', 'test.md'] },
]);
```

### Process Execution with Progress Tracking

```typescript
class ProcessExecutionTracker {
  private startTime: number;
  private updateInterval?: NodeJS.Timeout;

  constructor(
    private onProgress?: (progress: number) => void
  ) {
    this.startTime = Date.now();
  }

  startTracking(): void {
    this.updateInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const progress = Math.min(elapsed / 30000, 1); // 30 second max
      this.onProgress?.(progress);
    }, 1000);
  }

  stopTracking(): number {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    return Date.now() - this.startTime;
  }
}

async function executeWithProgress(
  command: string,
  args: string[],
  onProgress?: (progress: number) => void
): Promise<ProcessResult> {
  const tracker = new ProcessExecutionTracker(onProgress);
  tracker.startTracking();

  try {
    const result = await spawnAsync(command, args);
    const executionTime = tracker.stopTracking();

    return {
      ...result,
      success: result.exitCode === 0,
      executionTime,
    };
  } catch (error) {
    tracker.stopTracking();
    throw error;
  }
}
```

## 6. Best Practices for Typing External Process Interactions

### 1. Always Type Process Results

```typescript
// Bad - any types
function runCommand(command: string, args: string[]): Promise<any> {
  // implementation
}

// Good - specific type
interface TypedProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  metadata?: {
    command: string;
    args: string[];
    timestamp: Date;
  };
}

function runTypedCommand(command: string, args: string[]): Promise<TypedProcessResult> {
  // implementation
}
```

### 2. Use Generic Types for Flexible Parsing

```typescript
async function executeAndParse<T>(
  command: string,
  args: string[],
  parser: (stdout: string) => T
): Promise<{ stdout: string; stderr: string; exitCode: number; data: T }> {
  const result = await spawnAsync(command, args);

  return {
    ...result,
    data: parser(result.stdout),
  };
}

// Usage
interface JsonResult {
  id: string;
  name: string;
  value: number;
}

const jsonResult = await executeAndParse<MdselResult>(
  'mdsel',
  ['--json', 'query', 'data.md'],
  (stdout) => JSON.parse(stdout) as MdselResult
);
```

### 3. Environment-Specific Type Definitions

```typescript
interface ProcessEnvironment {
  isProduction: boolean;
  isTest: boolean;
  platform: NodeJS.Platform;
  nodeVersion: string;
}

function getEnvironment(): ProcessEnvironment {
  return {
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    platform: process.platform,
    nodeVersion: process.version,
  };
}

async function executeWithEnvironmentAwareness(
  command: string,
  args: string[],
  options?: ProcessOptions
): Promise<ProcessResult> {
  const env = getEnvironment();

  // Modify command or args based on environment
  if (env.isTest && !args.includes('--test')) {
    args.push('--test');
  }

  return spawnAsync(command, args, options);
}
```

### 4. Command Injection Prevention

```typescript
import { escape } from 'shell-quote';

interface SafeCommand {
  command: string;
  args: (string | number)[];
}

function buildSafeCommand(cmd: SafeCommand): string {
  const escapedArgs = cmd.args.map(arg => escape(String(arg)));
  return `${cmd.command} ${escapedArgs.join(' ')}`;
}

// Usage
const safeCommand = buildSafeCommand({
  command: 'mdsel',
  args: ['--input', 'safe data.txt', '--verbose'],
});

console.log(safeCommand); // mdsel --input "safe data.txt" --verbose
```

### 5. Process Cleanup and Resource Management

```typescript
import { spawn } from 'child_process';
import { once } from 'events';

async function executeWithCleanup(
  command: string,
  args: string[],
  options?: ProcessOptions
): Promise<ProcessResult> {
  const child = spawn(command, args, options);
  let stdout = '';
  let stderr = '';

  // Handle output streams
  child.stdout?.on('data', (data) => stdout += data.toString());
  child.stderr?.on('data', (data) => stderr += data.toString());

  // Handle process events
  const [exitCode, signal] = await Promise.race([
    once(child, 'close') as Promise<[number, NodeJS.Signals]>,
    once(child, 'error').then(() => [-1, null] as [number, NodeJS.Signals | null]),
  ]);

  // Ensure process is cleaned up
  if (!child.killed) {
    child.kill();
  }

  return {
    stdout,
    stderr,
    exitCode,
    success: exitCode === 0,
    signal,
  };
}
```

## Complete Example: executeMdsel Function

```typescript
import { spawn } from 'child_process';
import { once } from 'events';

/**
 * Extended interface for Mdsel-specific execution results
 */
interface MdselResult extends ProcessResult {
  /** Parsed JSON output if successful and contains JSON */
  jsonOutput?: unknown;

  /** Warnings generated during execution */
  warnings?: string[];

  /** Input file that was processed */
  inputFile?: string;

  /** Output file that was generated */
  outputFile?: string;
}

/**
 * Type-safe implementation of executeMdsel function
 */
async function executeMdsel(
  args: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    timeout?: number;
    inputFile?: string;
    outputFile?: string;
  } = {}
): Promise<MdselResult> {
  const startTime = Date.now();
  const timeout = options.timeout ?? 30000; // Default 30 seconds

  return new Promise((resolve, reject) => {
    const child = spawn('mdsel', args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
    });

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout | undefined;

    // Set up timeout handler
    if (timeout) {
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Mdsel execution timed out after ${timeout}ms`));
      }, timeout);
    }

    // Capture stdout and stderr
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', async (exitCode, signal) => {
      // Clean up timeout
      if (timeoutId) clearTimeout(timeoutId);

      try {
        const result: MdselResult = {
          stdout,
          stderr,
          exitCode: exitCode ?? -1,
          success: exitCode === 0,
          signal,
          pid: child.pid,
          executionTime: Date.now() - startTime,
          inputFile: options.inputFile,
          outputFile: options.outputFile,
        };

        // Try to parse JSON output if successful
        if (result.success && stdout.trim()) {
          try {
            result.jsonOutput = JSON.parse(stdout);
          } catch {
            // Not JSON, that's fine
          }
        }

        // Extract warnings from stderr
        if (stderr) {
          result.warnings = stderr
            .split('\n')
            .filter(line => line.includes('warning') || line.includes('WARN'))
            .map(line => line.trim());
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    // Handle process spawn errors
    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(new ProcessSpawnError('mdsel', args, error));
    });
  });
}

// Usage example
async function main() {
  try {
    const result = await executeMdsel(
      ['--query', 'data.md', '--format=json'],
      {
        timeout: 10000,
        inputFile: 'data.md',
      }
    );

    if (result.success) {
      console.log('Query successful:', result.jsonOutput);

      if (result.warnings?.length) {
        console.log('Warnings:', result.warnings);
      }
    } else {
      console.error('Query failed:', result.stderr);
      process.exit(1);
    }
  } catch (error) {
    console.error('Execution error:', error);
    process.exit(1);
  }
}

// Alternative: Using with async/await and destructuring
async function executeMdselSafe(args: string[]) {
  const { stdout, stderr, exitCode, success } = await executeMdsel(args);

  if (!success) {
    throw new ProcessError(stdout, stderr, exitCode);
  }

  return { stdout, stderr, exitCode };
}
```

## Additional Resources

1. [Node.js child_process Documentation](https://nodejs.org/api/child_process.html)
2. [TypeScript Documentation - Types](https://www.typescriptlang.org/docs/handbook/2/types.html)
3. [execa - Better child_process](https://github.com/sindresorhus/execa)
4. [shell-quote - Safely quote shell commands](https://github.com/substack/node-shell-quote)
5. [Concurrently - Run commands concurrently](https://github.com/kimmobrunfeldt/concurrently)

## Summary

Key patterns for TypeScript CLI executor functions:

1. **Strong Typing**: Always define specific interfaces for process results
2. **Error Handling**: Use discriminated unions for different error types
3. **Promise-based**: Wrap spawn/exec in Promises for async/await support
4. **Resource Management**: Clean up processes and handle timeouts
5. **Type Safety**: Validate arguments and prevent command injection
6. **Extensibility**: Use generics for flexible output parsing
7. **Metadata**: Include execution time, PID, and other useful information

The `executeMdsel` function demonstrates these patterns with a focus on type safety, error handling, and comprehensive result reporting.