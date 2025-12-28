import { defineConfig } from 'tsup';

export default defineConfig({
  // Single entry point for simple MCP server
  entry: ['src/index.ts'],

  // Output directory
  outDir: 'dist',

  // ES module format for modern Node.js
  format: ['esm'],

  // Target Node.js 18+ (MCP SDK requirement)
  target: 'node18',

  // Node.js platform (not browser)
  platform: 'node',

  // Generate TypeScript declaration files
  dts: true,

  // Clean dist directory before build
  clean: true,

  // CRITICAL: Add shebang for npx execution
  // This makes the built file executable directly
  banner: {
    js: '#!/usr/bin/env node',
  },

  // Don't split chunks - single file for simple CLI
  splitting: false,

  // Don't minify - easier debugging
  minify: false,

  // No sourcemaps in distribution
  sourcemap: false,
});
