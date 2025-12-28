// ============================================================================
// FILE: src/test/setup.ts
// Global test setup and configuration for mdsel-mcp tests
// ============================================================================

import { beforeEach, afterEach } from 'vitest';

// ----------------------------------------------------------------------------
// Global Test Hooks
// ----------------------------------------------------------------------------

beforeEach(() => {
  // Clear all mocks before each test to ensure test isolation
  vi.clearAllMocks();
});

afterEach(() => {
  // Additional cleanup after each test if needed
  vi.restoreAllMocks();
});

// ----------------------------------------------------------------------------
// Common Test Utilities
// ----------------------------------------------------------------------------

/**
 * Wait for all pending promises to resolve
 * Useful for testing async code with setImmediate/setTimeout
 */
export async function flushPromises(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve));
}

/**
 * Create a delay for testing timeouts
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------------------------------------------------------------------------
// Test Constants
// ----------------------------------------------------------------------------

export const TEST_FIXTURES = {
  validMarkdown: '# Test Heading\n\nThis is a test.',
  validIndexOutput: '{"headings":[{"level":1,"text":"Test Heading","selector":"heading:h1[0]"}]}',
  validSelectOutput: '# Test Heading\n\n',
  emptyOutput: '',
  errorOutput: 'Error: File not found',
};

export const TEST_FILE_PATHS = [
  '/path/to/test.md',
  '/path/to/README.md',
  '/absolute/path/to/file.md',
];

export const TEST_SELECTORS = [
  'heading:h1[0]',
  'h2[1]',
  'readme::h1[0]',
  'code[0]',
];
