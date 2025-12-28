// ============================================================================
// FILE: src/test/mocks/child_process.ts
// Mock factory for child_process.spawn in tests
// ============================================================================

import { EventEmitter } from 'events';

// ----------------------------------------------------------------------------
// Mock ChildProcess Interface
// ----------------------------------------------------------------------------

/**
 * Mock ChildProcess interface for testing
 * Extends EventEmitter to support 'close' and 'error' events
 */
export interface MockChildProcess extends EventEmitter {
  stdout: EventEmitter;
  stderr: EventEmitter;
  kill: ReturnType<typeof vi.fn>;
  pid?: number;
}

// ----------------------------------------------------------------------------
// Mock Factory Function
// ----------------------------------------------------------------------------

/**
 * Create a mock ChildProcess for testing executeMdsel
 *
 * @param stdoutData - Simulated stdout output
 * @param stderrData - Simulated stderr output
 * @param exitCode - Simulated exit code (default: 0)
 * @param chunks - Number of data chunks to emit (for testing stream accumulation)
 *
 * @returns MockChildProcess that behaves like a real child_process.spawn result
 *
 * @example
 * ```typescript
 * const mockChild = createMockChildProcess('{"result": true}', '', 0);
 * spawn.mockReturnValue(mockChild);
 * ```
 */
export function createMockChildProcess(
  stdoutData = '',
  stderrData = '',
  exitCode = 0,
  chunks = 1
): MockChildProcess {
  const mockProc = new EventEmitter() as MockChildProcess;

  // Create stdout/stderr as EventEmitters with .on() method
  mockProc.stdout = new EventEmitter();
  mockProc.stderr = new EventEmitter();
  mockProc.kill = vi.fn();
  mockProc.pid = Math.floor(Math.random() * 10000);

  // Emit stdout data in chunks (simulating stream behavior)
  if (stdoutData && chunks > 0) {
    const chunkSize = Math.ceil(stdoutData.length / chunks);
    for (let i = 0; i < chunks; i++) {
      const chunk = stdoutData.slice(i * chunkSize, (i + 1) * chunkSize);
      setImmediate(() => {
        mockProc.stdout.emit('data', Buffer.from(chunk));
      });
    }
  }

  // Emit stderr data
  if (stderrData) {
    setImmediate(() => {
      mockProc.stderr.emit('data', Buffer.from(stderrData));
    });
  }

  // CRITICAL: Emit 'close' event, NOT 'exit'
  // The executor.ts code listens to 'close' event
  setImmediate(() => {
    mockProc.emit('close', exitCode, null);
  });

  return mockProc;
}

// ----------------------------------------------------------------------------
// Specialized Mock Factories
// ----------------------------------------------------------------------------

/**
 * Create a mock child process that succeeds with exit code 0
 */
export function createMockSuccess(
  stdoutData = '',
  stderrData = ''
): MockChildProcess {
  return createMockChildProcess(stdoutData, stderrData, 0);
}

/**
 * Create a mock child process that fails with exit code 1
 */
export function createMockFailure(
  stderrData = 'Command failed'
): MockChildProcess {
  return createMockChildProcess('', stderrData, 1);
}

/**
 * Create a mock child process with null exit code
 * (Tests the default to exit code 1 behavior)
 */
export function createMockNullExitCode(): MockChildProcess {
  const mockProc = new EventEmitter() as MockChildProcess;
  mockProc.stdout = new EventEmitter();
  mockProc.stderr = new EventEmitter();
  mockProc.kill = vi.fn();

  setImmediate(() => {
    mockProc.emit('close', null, null);
  });

  return mockProc;
}

/**
 * Create a mock child process that emits multiple data chunks
 * (for testing stream accumulation)
 */
export function createMockStreaming(
  chunks: string[]
): MockChildProcess {
  const mockProc = new EventEmitter() as MockChildProcess;
  mockProc.stdout = new EventEmitter();
  mockProc.stderr = new EventEmitter();
  mockProc.kill = vi.fn();

  // Emit each chunk immediately
  chunks.forEach((chunk) => {
    setImmediate(() => {
      mockProc.stdout.emit('data', Buffer.from(chunk));
    });
  });

  // Emit close after all chunks
  setImmediate(() => {
    mockProc.emit('close', 0, null);
  });

  return mockProc;
}

/**
 * Create a mock child process that times out (never emits close)
 * Useful for testing timeout behavior
 */
export function createMockHangingProcess(): MockChildProcess {
  const mockProc = new EventEmitter() as MockChildProcess;
  mockProc.stdout = new EventEmitter();
  mockProc.stderr = new EventEmitter();
  mockProc.kill = vi.fn();

  // Don't emit 'close' event - process hangs indefinitely

  return mockProc;
}
