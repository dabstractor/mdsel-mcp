#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { spawn } from "child_process";

// Disable ANSI color codes for stdio transport (corrupts JSON-RPC)
if (!process.stdout.isTTY) {
  process.env.NO_COLOR = '1';
}

// CLI execution infrastructure for mdsel subprocess management
async function executeMdsel(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("mdsel", args, {
      env: { ...process.env, NO_COLOR: "1" }
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let timeoutHandle: NodeJS.Timeout | undefined;

    // Cleanup function to prevent memory leaks
    const cleanup = () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      proc.removeAllListeners();
    };

    // Set timeout (30 seconds default)
    timeoutHandle = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGTERM");
      // Force kill after grace period
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill("SIGKILL");
        }
      }, 2000);
      reject(new Error("mdsel process timed out after 30 seconds"));
    }, 30000);

    // Accumulate stdout
    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    // Accumulate stderr
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    // CRITICAL: Use 'close' event, not 'exit', to ensure streams are drained
    proc.on("close", (code) => {
      cleanup();
      if (timedOut) return;
      // CRITICAL: Return stdout regardless of exit code
      // mdsel outputs valid JSON even on errors
      resolve(stdout);
    });

    // Handle spawn errors (command not found, etc.)
    proc.on("error", (err) => {
      cleanup();
      reject(err);
    });
  });
}

// Create MCP server instance
const server = new Server(
  {
    name: "mdsel-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

// Main function: connect to stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start server with error handling
main().catch((error) => {
  console.error("Fatal error in mdsel-mcp server:", error);
  process.exit(1);
});
