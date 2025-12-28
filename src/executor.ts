// ============================================================================
// FILE: src/executor.ts
// CLI Executor for mdsel MCP server
// ============================================================================

// Import with .js extension for ESM compatibility
import { spawn } from 'child_process';

// --------------------------------------------------------------
// Type Definitions
// --------------------------------------------------------------

/**
 * Result type returned by executeMdsel
 *
 * All fields are always present regardless of success/failure.
 * Callers should check exitCode === 0 to determine success.
 */
export interface ExecutionResult {
  /** Captured stdout from the mdsel process */
  stdout: string;

  /** Captured stderr from the mdsel process */
  stderr: string;

  /** Exit code (0 = success, non-zero = error, null if spawn failed) */
  exitCode: number | null;
}

/**
 * Error thrown when the mdsel process fails to spawn
 */
export class MdselSpawnError extends Error {
  public readonly code: string;
  public readonly originalError: Error;

  constructor(message: string, code: string, originalError: Error) {
    super(message);
    this.name = 'MdselSpawnError';
    this.code = code;
    this.originalError = originalError;
  }
}

// --------------------------------------------------------------
// executeMdsel Function
// --------------------------------------------------------------

/**
 * Execute mdsel CLI command via npx and capture output.
 *
 * @param args - Command arguments to pass to mdsel (e.g., ['index', '--json', 'file.md'])
 * @returns Promise resolving to ExecutionResult with stdout, stderr, and exitCode
 * @throws MdselSpawnError if the process fails to spawn
 *
 * @example
 * ```typescript
 * const result = await executeMdsel(['index', '--json', 'README.md']);
 * if (result.exitCode === 0) {
 *   console.log(result.stdout); // JSON output
 * } else {
 *   console.error(result.stderr); // Error message
 * }
 * ```
 */
export async function executeMdsel(args: string[]): Promise<ExecutionResult> {
  return new Promise<ExecutionResult>((resolve, reject) => {
    // Spawn npx mdsel with provided arguments
    // CRITICAL: Use 'pipe' for stdio to capture output
    const proc = spawn('npx', ['mdsel', ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],  // stdin ignored, stdout/stderr piped
    });

    // Buffers for captured output
    let stdout = '';
    let stderr = '';

    // ------------------------------------------------------------
    // Stream Capture
    // ------------------------------------------------------------

    // Capture stdout data
    // Use optional chaining (?.) as stdout may be null
    proc.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });

    // Capture stderr data
    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    // ------------------------------------------------------------
    // Process Completion Handler
    // ------------------------------------------------------------

    // CRITICAL: Use 'close' event, not 'exit'
    // 'close' fires after streams have been flushed
    proc.on('close', (code: number | null, _signal: NodeJS.Signals | null) => {
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,  // Treat null exit code as failure
      });
    });

    // ------------------------------------------------------------
    // Spawn Error Handler
    // ------------------------------------------------------------

    proc.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        // npx or mdsel not found
        reject(new MdselSpawnError(
          'npx or mdsel not found. Ensure Node.js 18+ and mdsel are installed.',
          'ENOENT',
          err
        ));
      } else {
        // Other spawn errors
        reject(new MdselSpawnError(
          `Failed to spawn mdsel: ${err.message}`,
          err.code || 'SPAWN_ERROR',
          err
        ));
      }
    });
  });
}

// --------------------------------------------------------------
// Default Export
// --------------------------------------------------------------

export default executeMdsel;
