// ============================================================================
// FILE: src/test/mocks/executor.ts
// Mock factories for executeMdsel function
// ============================================================================

import type { ExecutionResult } from '../../executor.js';

// ----------------------------------------------------------------------------
// Mock Factory Functions
// ----------------------------------------------------------------------------

/**
 * Create a mock ExecutionResult for successful execution
 *
 * @param stdout - Simulated stdout output
 * @param stderr - Simulated stderr output (default: '')
 * @returns ExecutionResult with exitCode 0
 */
export function createMockExecutionSuccess(
  stdout = '',
  stderr = ''
): ExecutionResult {
  return {
    stdout,
    stderr,
    exitCode: 0,
  };
}

/**
 * Create a mock ExecutionResult for failed execution
 *
 * @param stderr - Simulated stderr output
 * @param exitCode - Simulated exit code (default: 1)
 * @returns ExecutionResult with non-zero exit code
 */
export function createMockExecutionFailure(
  stderr = 'Command failed',
  exitCode = 1
): ExecutionResult {
  return {
    stdout: '',
    stderr,
    exitCode,
  };
}

/**
 * Create a mock ExecutionResult with specific JSON output
 * Useful for testing mdsel.index and mdsel.select responses
 */
export function createMockIndexOutput(
  headings: Array<{ level: number; text: string; selector: string }> = []
): ExecutionResult {
  return {
    stdout: JSON.stringify({ headings }),
    stderr: '',
    exitCode: 0,
  };
}

/**
 * Create a mock ExecutionResult for mdsel.select
 */
export function createMockSelectOutput(
  content: string
): ExecutionResult {
  return {
    stdout: content,
    stderr: '',
    exitCode: 0,
  };
}

// ----------------------------------------------------------------------------
// Predefined Mock Results
// ----------------------------------------------------------------------------

/**
 * Mock result for successful index command
 */
export const mockIndexSuccess = createMockIndexOutput([
  { level: 1, text: 'Test Heading', selector: 'heading:h1[0]' },
  { level: 2, text: 'Subheading', selector: 'heading:h2[0]' },
]);

/**
 * Mock result for empty index
 */
export const mockIndexEmpty = createMockIndexOutput([]);

/**
 * Mock result for successful select command
 */
export const mockSelectSuccess = createMockSelectOutput('# Test Heading\n\nContent here.');

/**
 * Mock result for file not found error
 */
export const mockFileNotFound = createMockExecutionFailure(
  'Error: File not found',
  1
);

/**
 * Mock result for invalid selector error
 */
export const mockInvalidSelector = createMockExecutionFailure(
  'Error: Invalid selector syntax',
  2
);
