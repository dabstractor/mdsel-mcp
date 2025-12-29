#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import { z } from "zod";

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

// Zod schema for mdsel.index tool
const MdselIndexSchema = z.object({
  files: z.array(z.string())
    .min(1, "At least one file must be specified")
    .describe("Markdown file paths to index")
});

// Zod schema for mdsel.select tool
const MdselSelectSchema = z.object({
  selector: z.string()
    .describe("mdsel selector string (e.g., 'h1.0', 'h2.0/code.0', 'h1.0/h2.1')"),
  files: z.array(z.string())
    .optional()
    .describe("Optional Markdown file paths to search")
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
      name: "mdsel.index",
      description: "Index Markdown documents to discover available selectors for content retrieval. Returns a compact text inventory of all addressable content chunks including headings, paragraphs, code blocks, lists, and tables.",
      inputSchema: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            description: "Markdown file paths to index",
            minItems: 1
          }
        },
        required: ["files"]
      }
    },
    {
      name: "mdsel.select",
      description: "Retrieve Markdown content via declarative selectors. Uses mdsel selector grammar to extract specific document sections, headings, code blocks, paragraphs, lists, and tables. Returns matched content as compact text.",
      inputSchema: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "mdsel selector string (e.g., 'h1.0', 'h2.0/code.0', 'h1.0/h2.1')"
          },
          files: {
            type: "array",
            items: { type: "string" },
            description: "Optional Markdown file paths to search"
          }
        },
        required: ["selector"]
      }
    }
  ]
}));

// Register CallTool handler - executes tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "mdsel.index": {
      const parsed = MdselIndexSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for mdsel.index: ${parsed.error.message}`);
      }

      try {
        const result = await executeMdsel(["index", ...parsed.data.files]);
        return {
          content: [{ type: "text", text: result }]
        };
      } catch (spawnError) {
        return {
          content: [{
            type: "text",
            text: `Failed to execute mdsel: ${spawnError instanceof Error ? spawnError.message : String(spawnError)}`,
            isError: true
          }]
        };
      }
    }

    case "mdsel.select": {
      const parsed = MdselSelectSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for mdsel.select: ${parsed.error.message}`);
      }

      try {
        // Build command arguments
        const cmdArgs = ["select"];

        // Note: mdsel CLI doesn't have a --full flag
        // The 'full' parameter is documented but not implemented in the CLI
        // Future: add --full support to mdsel CLI if needed

        // Add required selector parameter
        cmdArgs.push(parsed.data.selector);

        // Add optional files parameter
        if (parsed.data.files) {
          cmdArgs.push(...parsed.data.files);
        }

        const result = await executeMdsel(cmdArgs);
        return {
          content: [{ type: "text", text: result }]
        };
      } catch (spawnError) {
        return {
          content: [{
            type: "text",
            text: `Failed to execute mdsel: ${spawnError instanceof Error ? spawnError.message : String(spawnError)}`,
            isError: true
          }]
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
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
