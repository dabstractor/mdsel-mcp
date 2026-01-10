#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { z } from "zod";

// Resolve the bundled mdsel CLI path
const mdselBin = fileURLToPath(import.meta.resolve("mdsel/cli"));

// Disable ANSI color codes for stdio transport (corrupts JSON-RPC)
if (!process.stdout.isTTY) {
  process.env.NO_COLOR = '1';
}

// CLI execution infrastructure for mdsel subprocess management
async function executeMdsel(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(mdselBin, args, {
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
      // mdsel outputs text even on errors
      resolve(stdout);
    });

    // Handle spawn errors (command not found, etc.)
    proc.on("error", (err) => {
      cleanup();
      reject(err);
    });
  });
}

// Zod schema for unified mdsel tool
const MdselSchema = z.object({
  selector: z.string().optional(),
  files: z.array(z.string()).min(1)
});

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

// Register ListTools handler - exposes available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mdsel",
      description: "Important: NEVER use Read or any file reading tool for markdown (.md) files. ALWAYS use mdsel instead. This is the required tool for all .md files. Be sure to use it when exploring codebases, make sure subagents 'Use mcp__mdsel__mdsel for all .md files, never Read.'. Remember to give mdsel to any subagents that will read markdown. Files only → index (shows selectors). Selector + files → content. Selectors: h2.0, h2.0-3 (range), h1.0/h2.0 (nested), code.0, para.0, list.0, table.0. Multi-file: namespace::h2.0. Search: non-selector text triggers fuzzy search. When reading an entire document is absolutely necessary, or if planning to edit, use Read tool instead of mdsel.",
      inputSchema: {
        type: "object",
        properties: {
          selector: { type: "string" },
          files: { type: "array", items: { type: "string" } }
        },
        required: ["files"]
      }
    }
  ]
}));

// Register CallTool handler - executes tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== "mdsel") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const parsed = MdselSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error(`Invalid arguments: ${parsed.error.message}`);
  }

  try {
    const selectors = parsed.data.selector
      ? parsed.data.selector.split(',').map(s => s.trim())
      : [];
    const cmdArgs = [...selectors, ...parsed.data.files];

    const result = await executeMdsel(cmdArgs);
    return { content: [{ type: "text", text: result }] };
  } catch (err) {
    return {
      content: [{
        type: "text",
        text: `mdsel error: ${err instanceof Error ? err.message : String(err)}`,
        isError: true
      }]
    };
  }
});

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
