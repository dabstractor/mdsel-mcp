// ============================================================================
// FILE: src/index.ts
// MCP Server Entry Point for mdsel-mcp
// ============================================================================

// CRITICAL: Use .js extensions for ESM imports
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { executeMdsel } from './executor.js';

// CRITICAL: Use console.error for debug messages, NOT console.log
// In stdio mode, console.log corrupts the MCP protocol stream
console.error('Initializing mdsel-mcp server...');

// --------------------------------------------------------------
// Server Initialization
// --------------------------------------------------------------

const server = new Server(
  {
    name: 'mdsel-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},  // Enable tools capability
    },
  }
);

console.error('Server initialized');

// --------------------------------------------------------------
// ListTools Handler
// --------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('ListTools requested');

  return {
    tools: [
      {
        name: 'mdsel.index',
        description: 'Generate a selector inventory for Markdown documents. Returns all available selectors (headings, blocks) that can be used with mdsel.select. Each document is assigned a namespace derived from its filename (e.g., \'README.md\' → \'readme\').',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Absolute paths to Markdown files to index',
            },
          },
          required: ['files'],
        },
      },
      {
        name: 'mdsel.select',
        description: 'Select content from Markdown documents using selectors. Selectors follow the pattern: [namespace::]type[index][/path][?query]. Examples: \'heading:h1[0]\' (first h1), \'readme::h2[1]\' (second h2 in readme), \'h2[0]/code[0]\' (first code block under first h2). Use \'?full=true\' to bypass truncation.',
        inputSchema: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'Selector expression. Format: [namespace::]type[index][/path][?query]. Types: heading:h1-h6 (or h1-h6), block:paragraph (or para), block:code (or code), block:list (or list), block:table (or table), block:blockquote (or quote), root, section.',
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Absolute paths to Markdown files to search',
            },
          },
          required: ['selector', 'files'],
        },
      },
    ],
  };
});

// --------------------------------------------------------------
// CallTool Handler
// --------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`CallTool requested: ${name}`);

  try {
    let cliArgs: string[];

    // Dispatch based on tool name
    if (name === 'mdsel.index') {
      // Type guard for mdsel.index arguments
      const { files } = args as { files: string[] };
      cliArgs = ['index', '--json', ...files];
      console.error(`Executing: mdsel index --json ${files.join(' ')}`);
    } else if (name === 'mdsel.select') {
      // Type guard for mdsel.select arguments
      const { selector, files } = args as { selector: string; files: string[] };
      cliArgs = ['select', '--json', selector, ...files];
      console.error(`Executing: mdsel select --json ${selector} ${files.join(' ')}`);
    } else {
      // Unknown tool - return error response
      console.error(`Unknown tool requested: ${name}`);
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}. Available tools: mdsel.index, mdsel.select`,
          },
        ],
      };
    }

    // Execute mdsel CLI via executor
    const result = await executeMdsel(cliArgs);

    // Return response based on exit code
    if (result.exitCode === 0) {
      console.error(`Tool ${name} succeeded (exit code 0)`);
      return {
        content: [
          {
            type: 'text',
            text: result.stdout,
          },
        ],
      };
    } else {
      // mdsel returned non-zero exit code
      console.error(`Tool ${name} failed with exit code ${result.exitCode}`);
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.stderr || `mdsel exited with code ${result.exitCode}`,
          },
        ],
      };
    }
  } catch (error) {
    // Handle executor errors (e.g., MdselSpawnError)
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error executing tool ${name}: ${errorMessage}`);
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error executing mdsel: ${errorMessage}`,
        },
      ],
    };
  }
});

// --------------------------------------------------------------
// Transport Setup
// --------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('mdsel-mcp server running on stdio transport');
}

// --------------------------------------------------------------
// Signal Handling
// --------------------------------------------------------------

process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down mdsel-mcp server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down mdsel-mcp server...');
  process.exit(0);
});

// --------------------------------------------------------------
// Start Server
// --------------------------------------------------------------

main().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
