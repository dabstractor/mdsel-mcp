// ============================================================================
// FILE: vitest.config.ts
// Vitest configuration for mdsel-mcp ESM TypeScript project
// ============================================================================

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment - Node.js for server/CLI testing
    environment: 'node',

    // Use global Vitest APIs (describe, it, expect, etc.)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
      ],
    },

    // Test file patterns
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],

    // Global setup file
    setupFiles: ['./src/test/setup.ts'],

    // Test timeout (5 seconds for slow tests)
    testTimeout: 5000,

    // Disable isolation for ESM module mocking
    // poolOptions: {
    //   threads: { singleThread: true },
    // },
  },

  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
