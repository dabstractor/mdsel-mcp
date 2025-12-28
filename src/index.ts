// File: src/index.ts - Minimal Server Stub
// This is a STUB only. Full implementation happens in P2.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// CRITICAL: Use console.error for debug messages, NOT console.log
// In stdio mode, console.log corrupts the MCP protocol stream
console.error('mdsel-mcp server starting...');

// Minimal server that initializes but doesn't register tools yet
// Tools will be registered in P2.M2 (Implement Tool Handlers)
const server = new Server(
  {
    name: 'mdsel-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}  // Enable tools capability
    }
  }
);

// For now, just prevent immediate exit
// In P2 we'll connect to stdio transport and handle requests
console.error('mdsel-mcp stub initialized');

// Export for potential testing
export { server };
