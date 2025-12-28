// ============================================================================
// FILE: src/executor.test.ts
// Unit tests for executeMdsel function
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawn } from 'child_process';
import { executeMdsel, MdselSpawnError } from './executor.js';
import {
  createMockChildProcess,
  createMockSuccess,
  createMockNullExitCode,
  createMockStreaming,
} from './test/mocks/child_process.js';

// ----------------------------------------------------------------------------
// Module Mocking
// ----------------------------------------------------------------------------

// CRITICAL: Mock at module level, not inside describe/beforeEach
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

const mockSpawn = vi.mocked(spawn);

// ----------------------------------------------------------------------------
// Test Setup
// ----------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ----------------------------------------------------------------------------
// executeMdsel Tests
// ----------------------------------------------------------------------------

describe('executeMdsel', () => {
  // ------------------------------------------------------------------------
  // Test: Argument Passing
  // ------------------------------------------------------------------------

  it('should spawn npx mdsel with correct arguments', async () => {
    // SETUP: Create mock child process
    const mockChild = createMockChildProcess('{"result": true}', '', 0);
    mockSpawn.mockReturnValue(mockChild as any);

    // EXECUTE
    await executeMdsel(['index', '--json', 'test.md']);

    // VERIFY: spawn called with correct arguments
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    expect(mockSpawn).toHaveBeenCalledWith(
      'npx',
      ['mdsel', 'index', '--json', 'test.md'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );
  });

  it('should spawn with correct stdio configuration', async () => {
    const mockChild = createMockChildProcess('', '', 0);
    mockSpawn.mockReturnValue(mockChild as any);

    await executeMdsel(['select', 'heading:h1[0]', 'file.md']);

    expect(mockSpawn).toHaveBeenCalledWith(
      'npx',
      ['mdsel', 'select', 'heading:h1[0]', 'file.md'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );
  });

  // ------------------------------------------------------------------------
  // Test: Success Case
  // ------------------------------------------------------------------------

  it('should capture stdout and stderr on success', async () => {
    const expectedStdout = '{"headings": [{"level": 1, "text": "Test"}]}';
    const expectedStderr = '';
    const mockChild = createMockChildProcess(expectedStdout, expectedStderr, 0);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', '--json', 'test.md']);

    expect(result.stdout).toBe(expectedStdout);
    expect(result.stderr).toBe(expectedStderr);
    expect(result.exitCode).toBe(0);
  });

  it('should return exit code 0 on successful execution', async () => {
    const mockChild = createMockSuccess('{"result": true}', '');
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', '--json', 'test.md']);

    expect(result.exitCode).toBe(0);
  });

  // ------------------------------------------------------------------------
  // Test: Non-Zero Exit Code
  // ------------------------------------------------------------------------

  it('should return non-zero exit code on failure', async () => {
    const expectedStderr = 'Error: File not found';
    const mockChild = createMockChildProcess('', expectedStderr, 1);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'nonexistent.md']);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBe(expectedStderr);
  });

  it('should return exit code 2 on CLI error', async () => {
    const mockChild = createMockChildProcess('', 'Invalid selector', 2);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['select', 'invalid']);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toBe('Invalid selector');
  });

  // ------------------------------------------------------------------------
  // Test: Null Exit Code Handling
  // ------------------------------------------------------------------------

  it('should default to exit code 1 when close emits null', async () => {
    const mockChild = createMockNullExitCode();
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'test.md']);

    expect(result.exitCode).toBe(1);
  });

  // ------------------------------------------------------------------------
  // Test: Spawn Errors - ENOENT
  // ------------------------------------------------------------------------

  it('should throw MdselSpawnError on ENOENT', async () => {
    const spawnError = new Error('spawn ENOENT') as Error & { code?: string };
    spawnError.code = 'ENOENT';

    // Create mock that emits error asynchronously
    const { EventEmitter } = await import('events');
    const mockChild = new EventEmitter() as any;
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();
    mockChild.kill = vi.fn();

    // Emit error asynchronously (simulating actual spawn behavior)
    setImmediate(() => {
      mockChild.emit('error', spawnError);
    });

    mockSpawn.mockReturnValue(mockChild);

    await expect(executeMdsel(['index', 'test.md']))
      .rejects.toThrow('npx or mdsel not found');
  });

  it('should set error code to ENOENT on spawn failure', async () => {
    const spawnError = new Error('spawn ENOENT') as Error & { code?: string };
    spawnError.code = 'ENOENT';

    const { EventEmitter } = await import('events');
    const mockChild = new EventEmitter() as any;
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();
    mockChild.kill = vi.fn();

    setImmediate(() => {
      mockChild.emit('error', spawnError);
    });

    mockSpawn.mockReturnValue(mockChild);

    try {
      await executeMdsel(['index', 'test.md']);
      expect.fail('Should have thrown MdselSpawnError');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as MdselSpawnError).name).toBe('MdselSpawnError');
      expect((error as MdselSpawnError).code).toBe('ENOENT');
    }
  });

  it('should preserve original error in MdselSpawnError', async () => {
    const originalError = new Error('spawn ENOENT') as Error & { code?: string };
    originalError.code = 'ENOENT';

    const { EventEmitter } = await import('events');
    const mockChild = new EventEmitter() as any;
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();
    mockChild.kill = vi.fn();

    setImmediate(() => {
      mockChild.emit('error', originalError);
    });

    mockSpawn.mockReturnValue(mockChild);

    try {
      await executeMdsel(['index', 'test.md']);
      expect.fail('Should have thrown MdselSpawnError');
    } catch (error) {
      expect((error as MdselSpawnError).originalError).toBe(originalError);
    }
  });

  // ------------------------------------------------------------------------
  // Test: Other Spawn Errors
  // ------------------------------------------------------------------------

  it('should throw MdselSpawnError on other spawn errors', async () => {
    const spawnError = new Error('EACCES: permission denied') as Error & { code?: string };
    spawnError.code = 'EACCES';

    const { EventEmitter } = await import('events');
    const mockChild = new EventEmitter() as any;
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();
    mockChild.kill = vi.fn();

    setImmediate(() => {
      mockChild.emit('error', spawnError);
    });

    mockSpawn.mockReturnValue(mockChild);

    await expect(executeMdsel(['index', 'test.md']))
      .rejects.toThrow('Failed to spawn mdsel');
  });

  it('should set error code to SPAWN_ERROR for generic errors', async () => {
    const spawnError = new Error('Unknown error') as Error & { code?: string };

    const { EventEmitter } = await import('events');
    const mockChild = new EventEmitter() as any;
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();
    mockChild.kill = vi.fn();

    setImmediate(() => {
      mockChild.emit('error', spawnError);
    });

    mockSpawn.mockReturnValue(mockChild);

    try {
      await executeMdsel(['index', 'test.md']);
      expect.fail('Should have thrown MdselSpawnError');
    } catch (error) {
      expect((error as MdselSpawnError).code).toBe('SPAWN_ERROR');
    }
  });

  // ------------------------------------------------------------------------
  // Test: Stream Handling
  // ------------------------------------------------------------------------

  it('should accumulate multiple stdout chunks', async () => {
    const chunks = ['chunk1', 'chunk2', 'chunk3'];
    const mockChild = createMockStreaming(chunks);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'test.md']);

    expect(result.stdout).toBe('chunk1chunk2chunk3');
  });

  it('should handle large output', async () => {
    // Generate large output (>64KB)
    const largeOutput = 'x'.repeat(100 * 1024); // 100KB
    const mockChild = createMockChildProcess(largeOutput, '', 0);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'large.md']);

    expect(result.stdout).toBe(largeOutput);
    expect(result.stdout.length).toBe(100 * 1024);
  });

  it('should handle empty stdout and stderr', async () => {
    const mockChild = createMockChildProcess('', '', 0);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'empty.md']);

    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('');
    expect(result.exitCode).toBe(0);
  });

  it('should capture stderr even on success', async () => {
    const stderrOutput = 'Warning: deprecated feature';
    const mockChild = createMockChildProcess('{"result": true}', stderrOutput, 0);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'test.md']);

    expect(result.stderr).toBe(stderrOutput);
  });

  // ------------------------------------------------------------------------
  // Test: Unicode Content
  // ------------------------------------------------------------------------

  it('should handle unicode content in output', async () => {
    const unicodeOutput = '{"text": "Hello 世界 🌍"}';
    const mockChild = createMockChildProcess(unicodeOutput, '', 0);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'unicode.md']);

    expect(result.stdout).toBe(unicodeOutput);
  });

  // ------------------------------------------------------------------------
  // Test: Kill Method
  // ------------------------------------------------------------------------

  it('should provide kill method on mock process', async () => {
    const mockChild = createMockChildProcess('', '', 0);
    mockSpawn.mockReturnValue(mockChild as any);

    // Call executeMdsel but don't await - we want to test the process object
    const promise = executeMdsel(['index', 'test.md']);

    // The mock should have a kill method
    expect(mockChild.kill).toBeDefined();
    expect(typeof mockChild.kill).toBe('function');

    await promise;
  });

  // ------------------------------------------------------------------------
  // Test: ExecutionResult Interface
  // ------------------------------------------------------------------------

  it('should return ExecutionResult with all fields', async () => {
    const mockChild = createMockChildProcess('output', 'error', 1);
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', 'test.md']);

    // Verify all ExecutionResult fields are present
    expect(result).toHaveProperty('stdout');
    expect(result).toHaveProperty('stderr');
    expect(result).toHaveProperty('exitCode');

    // Verify types
    expect(typeof result.stdout).toBe('string');
    expect(typeof result.stderr).toBe('string');
    expect(typeof result.exitCode).toBe('number');
  });
});
