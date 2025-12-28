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
import { z } from 'zod';
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
// Zod Validation Schemas
// --------------------------------------------------------------

/**
 * Zod schema for mdsel.index tool arguments
 * Validates that files array is non-empty and contains non-empty strings
 */
export const IndexArgsSchema = z.object({
  files: z.array(z.string())
    .min(1, 'files array must contain at least one file path')
    .refine(
      (files) => files.every(f => f.trim().length > 0),
      'all file paths must be non-empty strings'
    )
});

/**
 * Zod schema for mdsel.select tool arguments
 * Validates that selector is non-empty and files array is non-empty
 */
export const SelectArgsSchema = z.object({
  selector: z.string()
    .trim()  // Trim whitespace from selector first
    .min(1, 'selector must be a non-empty string'),
  files: z.array(z.string())
    .min(1, 'files array must contain at least one file path')
    .refine(
      (files) => files.every(f => f.trim().length > 0),
      'all file paths must be non-empty strings'
    )
});

// --------------------------------------------------------------
// Error Formatting Helper
// --------------------------------------------------------------

/**
 * Format Zod validation errors into user-friendly error messages
 */
export function formatZodError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'arguments';
    return `${path}: ${issue.message}`;
  }).join('; ');

  return `Invalid arguments: ${issues}\n\n` +
    `Expected format:\n` +
    `  mdsel.index: { "files": ["path/to/file1.md", "path/to/file2.md"] }\n` +
    `  mdsel.select: { "selector": "heading:h1[0]", "files": ["path/to/file.md"] }`;
}

// --------------------------------------------------------------
// ListTools Handler
// --------------------------------------------------------------

/**
 * Handler for ListTools MCP requests
 * Returns the list of available tools (mdsel.index and mdsel.select)
 */
export async function handleListTools() {
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
}

server.setRequestHandler(ListToolsRequestSchema, handleListTools);

// --------------------------------------------------------------
// CallTool Handler
// --------------------------------------------------------------

/**
 * Handler for CallTool MCP requests
 * Executes mdsel index or select based on the tool name
 */
export async function handleCallTool(request: { params: { name: string; arguments?: unknown } }) {
  const { name, arguments: args } = request.params;
  console.error(`CallTool requested: ${name}`);

  try {
    let cliArgs: string[];

    // Dispatch based on tool name
    if (name === 'mdsel.index') {
      // Validate arguments using Zod
      const validation = IndexArgsSchema.safeParse(args);
      if (!validation.success) {
        console.error('mdsel.index validation failed:', validation.error.issues);
        return {
          isError: true,
          content: [{
            type: 'text',
            text: formatZodError(validation.error)
          }]
        };
      }

      // Use validated data (type-safe)
      const { files } = validation.data;
      cliArgs = ['index', '--json', ...files];
      console.error(`Executing: mdsel index --json ${files.join(' ')}`);
    } else if (name === 'mdsel.select') {
      // Validate arguments using Zod
      const validation = SelectArgsSchema.safeParse(args);
      if (!validation.success) {
        console.error('mdsel.select validation failed:', validation.error.issues);
        return {
          isError: true,
          content: [{
            type: 'text',
            text: formatZodError(validation.error)
          }]
        };
      }

      // Use validated data (type-safe, selector trimmed)
      const { selector, files } = validation.data;
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
      // Include command context for better debugging
      const command = `mdsel ${cliArgs.join(' ')}`;
      console.error(`Command failed with exit code ${result.exitCode}: ${command}`);
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: result.stderr || `Command "${command}" exited with code ${result.exitCode}`,
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
}

server.setRequestHandler(CallToolRequestSchema, handleCallTool);

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
