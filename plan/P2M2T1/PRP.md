# PRP: P2.M2.T1 - Implement MCP Server Entry Point

---

## Goal

**Feature Goal**: Create a fully functional MCP server that exposes `mdsel.index` and `mdsel.select` tools via the Model Context Protocol using stdio transport, enabling AI assistants to query and select Markdown content through a standardized interface.

**Deliverable**: A complete `src/index.ts` that:
- Initializes an MCP server with stdio transport
- Implements `ListTools` handler returning tool schemas for `mdsel.index` and `mdsel.select`
- Implements `CallTool` handler that dispatches to `executeMdsel`
- Handles unknown tools with appropriate error responses
- Connects to stdio transport and runs indefinitely

**Success Definition**:
- The server starts and connects to stdio transport without exiting
- `tools/list` returns both `mdsel.index` and `mdsel.select` with correct schemas
- `tools/call` for `mdsel.index` invokes `executeMdsel(['index', '--json', ...files])`
- `tools/call` for `mdsel.select` invokes `executeMdsel(['select', '--json', selector, ...files])`
- Unknown tools return `isError: true` with descriptive message
- Build succeeds: `npm run build`
- TypeScript compiles without errors: `npx tsc --noEmit`

---

## User Persona

**Target User**: Developers and AI assistants using MCP-compatible clients (e.g., Claude Desktop, Cursor, Windsurf) to integrate declarative Markdown selection capabilities.

**Use Case**: An AI assistant needs to query the structure of Markdown documents and extract specific sections (headings, code blocks, etc.) using semantic selectors rather than regex or fragile string manipulation.

**User Journey**:
1. MCP client starts the server via npx: `npx mdsel-mcp`
2. Client sends `tools/list` request to discover available tools
3. Client sends `tools/call` request with tool name and arguments
4. Server invokes `executeMdsel` and returns mdsel JSON output verbatim
5. Client receives structured data about document content

**Pain Points Addressed**:
- Without this MCP server, AI assistants cannot interact with mdsel through the standardized MCP protocol
- Manual CLI invocation is not feasible for AI assistants
- No standard interface for different AI clients to access mdsel functionality

---

## Why

- **Enables AI-Markdown Integration**: Provides a standardized protocol interface for AI assistants to query and select Markdown content, unlocking capabilities like semantic search, content extraction, and document analysis.
- **Foundation for Tool Handlers**: This server entry point is the foundation for P2.M2.T2 where full tool logic will be implemented. The stubs created here will be expanded in the next task.
- **Reusability**: The MCP server pattern established here can serve as a template for other CLI-to-MCP wrappers.
- **Completes P2 Phase**: Finishes the MCP Server Core phase, enabling the Testing phase (P3) to begin.

---

## What

Implement an MCP server in `src/index.ts` that:

1. **Imports and uses the `executeMdsel` function** from `src/executor.ts`
2. **Creates an MCP `Server` instance** with name `mdsel-mcp` and tools capability
3. **Implements `ListToolsRequestSchema` handler** returning schemas for `mdsel.index` and `mdsel.select`
4. **Implements `CallToolRequestSchema` handler** that:
   - Dispatches `mdsel.index` calls to `executeMdsel(['index', '--json', ...files])`
   - Dispatches `mdsel.select` calls to `executeMdsel(['select', '--json', selector, ...files])`
   - Returns `isError: true` for unknown tools
5. **Creates `StdioServerTransport` and connects** the server
6. **Handles graceful shutdown** on SIGINT/SIGTERM

### Success Criteria

- [ ] Server instance created with `Server` class from `@modelcontextprotocol/sdk/server/index.js`
- [ ] `ListToolsRequestSchema` handler returns both tool schemas exactly as specified in `plan/architecture/tool_schemas.md`
- [ ] `CallToolRequestSchema` handler dispatches to `executeMdsel` with correct CLI arguments
- [ ] Unknown tools return `{ isError: true, content: [{ type: 'text', text: 'Unknown tool: ...' }] }`
- [ ] Stdio transport connected and server runs indefinitely
- [ ] No `console.log()` usage (only `console.error()` for debug output)
- [ ] Build succeeds: `npm run build` produces `dist/index.js` with shebang
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`

---

## All Needed Context

### Context Completeness Check

_**No Prior Knowledge Test Verification**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?_

- [x] **Project structure** understood (src/, package.json, tsconfig.json, tsup.config.ts)
- [x] **Executor API** documented (`executeMdsel(args: string[]): Promise<ExecutionResult>`)
- [x] **MCP SDK version** confirmed (v1.0.0 with `Server` class and `setRequestHandler` pattern)
- [x] **Tool schemas** defined in `plan/architecture/tool_schemas.md`
- [x] **CLI mappings** documented (mdsel.index → `mdsel index --json`, mdsel.select → `mdsel select --json`)
- [x] **Stdio transport pattern** from `plan/P2M1T1/research/mcp-sdk-v1.md`
- [x] **Build configuration** (tsup with shebang banner, ESM output)
- [x] **Logging constraints** (console.error only, never console.log in stdio mode)
- [x] **Testing approach** (deferred to P3.M1 as confirmed by user)

### Documentation & References

```yaml
# CRITICAL ARCHITECTURE DOCUMENTS
- file: /home/dustin/projects/mdsel-mcp-glm/PRD.md
  why: PRD defines thin wrapper doctrine and overall system architecture
  critical: "Output must be byte-for-byte identical to mdsel JSON output. No interpretation."

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/system_context.md
  why: System architecture showing MCP server's role and integration points
  section: "MCP Server (stdio transport)" layer

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/tool_schemas.md
  why: EXACT tool schemas to implement in ListTools handler
  critical: "Copy schemas EXACTLY - inputSchema must match specification"
  pattern: |
    mdsel.index: { files: string[] }
    mdsel.select: { selector: string, files: string[] }

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/external_deps.md
  why: MCP SDK usage patterns and transport setup
  section: "MCP SDK Usage Patterns"
  pattern: |
    import { Server } from "@modelcontextprotocol/sdk/server/index.js";
    import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
    import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

# EXECUTOR INTEGRATION
- file: /home/dustin/projects/mdsel-mcp-glm/src/executor.ts
  why: The executeMdsel function that tool handlers will call
  pattern: |
    import { executeMdsel } from './executor.js';
    const result = await executeMdsel(['index', '--json', ...files]);
    return { content: [{ type: 'text', text: result.stdout }] };
  critical: "Use .js extension in import path for ESM compatibility"

- file: /home/dustin/projects/mdsel-mcp-glm/src/index.ts (current stub)
  why: Existing code pattern to preserve/modify
  pattern: "console.error for debug messages, NOT console.log"

# MCP SDK RESEARCH (v1.0.0)
- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P2M1T1/research/mcp-sdk-v1.md
  why: MCP SDK v1 specific patterns for Server class and request handlers
  section: "Using Server Class (Low-Level API)" and "Registering ListTools and CallTool Request Handlers in v1"
  critical: "v1 does NOT have McpServer class - use Server class with setRequestHandler"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/docs/research/mcp-sdk.md
  why: Additional context on MCP patterns (note: this is v2 docs, but patterns are similar)
  section: "Tool Registration and Handler Setup"

# EXTERNAL REFERENCES
- url: https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
  why: Official MCP SDK v1.x branch reference
  critical: "We are using v1.0.0, NOT v2 which is pre-alpha"

- url: https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/README.md
  why: v1.x README with usage examples
  section: "Quick Start" and "Server Examples"

- url: https://nodejs.org/api/process.html#event-sigint
  why: Process signal handling for graceful shutdown
  section: "SIGINT handling"

# BUILD CONFIGURATION
- file: /home/dustin/projects/mdsel-mcp-glm/tsup.config.ts
  why: Build configuration that adds shebang banner automatically
  critical: "banner: { js: '#!/usr/bin/env node' }"

- file: /home/dustin/projects/mdsel-mcp-glm/package.json
  why: Entry point configuration: main: './dist/index.js', bin: { 'mdsel-mcp': './dist/index.js' }
```

### Current Codebase Tree

```bash
mdsel-mcp-glm/
├── package.json          # Dependencies: @modelcontextprotocol/sdk, zod
├── tsconfig.json         # ES2022 target, NodeNext resolution
├── tsup.config.ts        # Build with shebang banner
├── src/
│   ├── index.ts          # STUB - Server initialized but no handlers or transport
│   └── executor.ts       # COMPLETE - executeMdsel function
└── plan/
    ├── architecture/     # tool_schemas.md, external_deps.md, system_context.md
    ├── P2M1T1/           # Completed executor PRP
    └── P2M2T1/           # This PRP
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-mcp-glm/
├── package.json          # Unchanged
├── tsconfig.json         # Unchanged
├── tsup.config.ts        # Unchanged
├── src/
│   ├── index.ts          # COMPLETE - MCP server with handlers and transport
│   └── executor.ts       # Unchanged (imported by index.ts)
└── plan/
    └── P2M2T1/
        ├── PRP.md        # This document
        └── research/     # Additional research (if needed)
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: MCP SDK v1.0.0 uses Server class, NOT McpServer
// McpServer is only in v2 (pre-alpha)
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// NOT: import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// CRITICAL: Use .js extensions in ESM imports
import { executeMdsel } from './executor.js';  // NOT './executor'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// CRITICAL: Stdio transport must use 'stdio' NOT 'streamable-http'
const transport = new StdioServerTransport();
await server.connect(transport);

// CRITICAL: setRequestHandler takes (schema, handler) not (schema, options, handler)
server.setRequestHandler(ListToolsRequestSchema, async (request) => {
  return { tools: [...] };
});

// CRITICAL: In stdio mode, NEVER use console.log() - it corrupts the protocol stream
console.error('Debug message');  // OK - goes to stderr
console.log('Debug message');    // WRONG - goes to stdout, breaks MCP protocol

// CRITICAL: Request parameter structure in handler
const { name, arguments: args } = request.params;
// NOT: request.params.name, request.params.arguments

// CRITICAL: Tool response format
return {
  content: [{ type: 'text', text: 'Result' }]  // SUCCESS
};
return {
  isError: true,
  content: [{ type: 'text', text: 'Error message' }]  // ERROR
};

// CRITICAL: Keep process running - don't call process.exit()
// The server will run until SIGINT/SIGTERM

// CRITICAL: Graceful shutdown pattern
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down...');
  process.exit(0);
});
```

---

## Implementation Blueprint

### Data Models and Structure

No new data models are needed. The server uses:
- **Existing**: `ExecutionResult` interface from `src/executor.ts`
- **Existing**: `executeMdsel` function from `src/executor.ts`
- **SDK-provided**: `Server`, `StdioServerTransport`, request schemas from MCP SDK

```typescript
// Tool schemas are defined inline in ListTools handler
// These match the specification in plan/architecture/tool_schemas.md

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      items?: { type: string };
    }>;
    required: string[];
  };
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: BACKUP current stub (optional but recommended)
  - ACTION: Copy src/index.ts to src/index.ts.bak
  - REASON: Preserve existing stub code for reference
  - DEPENDENCIES: None

Task 2: REPLACE file header and imports
  - IMPLEMENT: Update file header comment, add all necessary imports
  - FILE STRUCTURE:
    1. File header comment describing the MCP server
    2. Import Server from @modelcontextprotocol/sdk/server/index.js
    3. Import StdioServerTransport from @modelcontextprotocol/sdk/server/stdio.js
    4. Import ListToolsRequestSchema, CallToolRequestSchema from @modelcontextprotocol/sdk/types.js
    5. Import executeMdsel from ./executor.js
  - NAMING: Use exact import paths with .js extensions
  - PLACEMENT: Top of src/index.ts
  - DEPENDENCIES: Task 1 (backup made)

Task 3: INITIALIZE server instance
  - IMPLEMENT: Create Server instance with name, version, and capabilities
  - PATTERN:
    const server = new Server(
      {
        name: 'mdsel-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
  - DEBUG: Add console.error('Server initialized') after creation
  - PLACEMENT: After imports, before handlers
  - DEPENDENCIES: Task 2 (imports added)

Task 4: IMPLEMENT ListTools request handler
  - IMPLEMENT: Register ListToolsRequestSchema handler with mdsel.index and mdsel.select schemas
  - PATTERN:
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'mdsel.index',
            description: 'Generate a selector inventory for Markdown documents...',
            inputSchema: {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Absolute paths to Markdown files to index'
                }
              },
              required: ['files']
            }
          },
          {
            name: 'mdsel.select',
            description: 'Select content from Markdown documents using selectors...',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'Selector expression...'
                },
                files: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Absolute paths to Markdown files to search'
                }
              },
              required: ['selector', 'files']
            }
          }
        ]
      };
    });
  - CRITICAL: Copy inputSchema EXACTLY from plan/architecture/tool_schemas.md
  - PLACEMENT: After server initialization
  - DEPENDENCIES: Task 3 (server created)

Task 5: IMPLEMENT CallTool request handler (stub version)
  - IMPLEMENT: Register CallToolRequestSchema handler with tool dispatch logic
  - PATTERN:
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let cliArgs: string[];

        if (name === 'mdsel.index') {
          // Dispatch to executeMdsel with index command
          const { files } = args as { files: string[] };
          cliArgs = ['index', '--json', ...files];
        } else if (name === 'mdsel.select') {
          // Dispatch to executeMdsel with select command
          const { selector, files } = args as { selector: string; files: string[] };
          cliArgs = ['select', '--json', selector, ...files];
        } else {
          // Unknown tool - return error
          return {
            isError: true,
            content: [{
              type: 'text',
              text: `Unknown tool: ${name}. Available tools: mdsel.index, mdsel.select`
            }]
          };
        }

        // Execute mdsel CLI
        const result = await executeMdsel(cliArgs);

        // Check exit code and return appropriate response
        if (result.exitCode === 0) {
          return {
            content: [{
              type: 'text',
              text: result.stdout
            }]
          };
        } else {
          // mdsel returned non-zero exit code
          return {
            isError: true,
            content: [{
              type: 'text',
              text: result.stderr || `mdsel exited with code ${result.exitCode}`
            }]
          };
        }
      } catch (error) {
        // Handle errors (e.g., MdselSpawnError)
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{
            type: 'text',
            text: `Error executing mdsel: ${errorMessage}`
          }]
        };
      }
    });
  - HANDLING: Both success (exitCode 0) and failure cases
  - ERROR: Return errors in content with isError: true, not as thrown exceptions
  - PLACEMENT: After ListTools handler
  - DEPENDENCIES: Task 4 (handler registration pattern established)

Task 6: CREATE stdio transport and connect
  - IMPLEMENT: Create StdioServerTransport and connect server to it
  - PATTERN:
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('mdsel-mcp server running on stdio');
  - CRITICAL: No await for indefinite running - server.connect() handles connection
  - PLACEMENT: After all handlers registered
  - DEPENDENCIES: Task 5 (all handlers registered)

Task 7: ADD graceful shutdown handling
  - IMPLEMENT: Handle SIGINT and SIGTERM for clean shutdown
  - PATTERN:
    process.on('SIGINT', async () => {
      console.error('Received SIGINT, shutting down mdsel-mcp server...');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Received SIGTERM, shutting down mdsel-mcp server...');
      process.exit(0);
    });
  - PLACEMENT: After transport connection
  - DEPENDENCIES: Task 6 (server running)
```

### Implementation Patterns & Key Details

```typescript
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
```

### Integration Points

```yaml
EXECUTOR:
  - import: executeMdsel from './executor.js'
  - usage: |
      const result = await executeMdsel(['index', '--json', ...files]);
      const result = await executeMdsel(['select', '--json', selector, ...files]);

BUILD:
  - output: dist/index.js with shebang (#!/usr/bin/env node)
  - handled_by: tsup.config.ts banner configuration
  - verify: head -1 dist/index.js should show shebang

PACKAGE_JSON:
  - bin: { "mdsel-mcp": "./dist/index.js" }
  - allows: npx mdsel-mcp to run the server

FUTURE_TOOL_HANDLERS (P2.M2.T2):
  - expand: CallTool handler with more sophisticated logic
  - add: Input validation, Zod schemas
  - add: More detailed error handling
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after implementation - fix before proceeding
npm run build
# Expected: dist/index.js created with shebang, no compilation errors
# Look for: "Build success" or similar message
# If errors: READ the error messages carefully and fix

# Verify shebang was added
head -1 dist/index.js
# Expected: #!/usr/bin/env node

# Type checking with specific file
npx tsc --noEmit src/index.ts
# Expected: No type errors

# Full project type check
npx tsc --noEmit
# Expected: No errors across entire project
# If type errors exist: READ the error, check import paths (.js extensions), fix type issues
```

### Level 2: Manual MCP Protocol Testing

```bash
# Note: Automated tests will be added in P3.M1.T1
# For now, verify MCP protocol manually using a test client

# Create a simple test script to verify server responds correctly
cat > test-mcp-server.mjs << 'EOF'
import { spawn } from 'child_process';

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']  // stdin/stdout as pipes, stderr inherited
});

// Test initialize request
const initRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' }
  }
});

server.stdout.on('data', (data) => {
  console.log('SERVER RESPONSE:', data.toString());
});

// Send initialize request
server.stdin.write(initRequest + '\n');

// Clean up after 2 seconds
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 2000);
EOF

# Run the test
node test-mcp-server.mjs
# Expected: JSON-RPC response from server with server capabilities

# Clean up
rm test-mcp-server.mjs
```

### Level 3: Tool Handler Verification

```bash
# Test that tools/list returns correct schemas
cat > test-tools-list.mjs << 'EOF'
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let requestId = 0;

server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log('Response:', JSON.stringify(response, null, 2));

  if (response.result && response.result.tools) {
    console.log('\n=== TOOLS LIST ===');
    response.result.tools.forEach((tool, i) => {
      console.log(`\nTool ${i + 1}: ${tool.name}`);
      console.log('Description:', tool.description.substring(0, 100) + '...');
      console.log('Required params:', tool.inputSchema.required);
    });

    // We got tools list, verify and exit
    if (response.result.tools.length === 2) {
      console.log('\n✓ Both tools (mdsel.index and mdsel.select) are registered');
    }
    server.kill();
    process.exit(0);
  }
});

// Initialize first
server.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: ++requestId,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' }
  }
}) + '\n');

// Then request tools list
setTimeout(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'tools/list'
  }) + '\n');
}, 100);

setTimeout(() => {
  server.kill();
  process.exit(1);
}, 5000);
EOF

# Run the test
node test-tools-list.mjs
# Expected: Two tools listed (mdsel.index and mdsel.select)

# Clean up
rm test-tools-list.mjs
```

### Level 4: MCP Inspector Testing (Recommended)

```bash
# If MCP Inspector is available, use it for comprehensive testing
# MCP Inspector is the official debugging tool for MCP servers

npx @modelcontextprotocol/inspector node dist/index.js
# Expected: Inspector UI opens, shows server info, allows testing tools
# Navigate to Tools tab, verify mdsel.index and mdsel.select appear
# Click on each tool to see their schemas

# If inspector is not installed, install it first
npm install -g @modelcontextprotocol/inspector

# Alternative: Run directly with npx
npx @modelcontextprotocol/inspector dist/index.js
```

---

## Final Validation Checklist

### Technical Validation

- [ ] File modified: `src/index.ts` replaced stub with full implementation
- [ ] Import paths use `.js` extensions for ESM compatibility
- [ ] Server instance created with `Server` class from `@modelcontextprotocol/sdk/server/index.js`
- [ ] `ListToolsRequestSchema` handler registered
- [ ] `CallToolRequestSchema` handler registered
- [ ] `StdioServerTransport` created and `server.connect(transport)` called
- [ ] SIGINT/SIGTERM handlers added for graceful shutdown
- [ ] No `console.log()` usage (only `console.error()` for debug output)
- [ ] Build succeeds: `npm run build` produces `dist/index.js`
- [ ] Shebang present in built file: `head -1 dist/index.js` shows `#!/usr/bin/env node`
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`

### Feature Validation

- [ ] `tools/list` returns exactly 2 tools: `mdsel.index` and `mdsel.select`
- [ ] `mdsel.index` schema matches specification in `plan/architecture/tool_schemas.md`
- [ ] `mdsel.select` schema matches specification in `plan/architecture/tool_schemas.md`
- [ ] `tools/call` with `mdsel.index` invokes `executeMdsel(['index', '--json', ...files])`
- [ ] `tools/call` with `mdsel.select` invokes `executeMdsel(['select', '--json', selector, ...files])`
- [ ] Unknown tool returns `{ isError: true, content: [{ type: 'text', text: 'Unknown tool: ...' }] }`
- [ ] mdsel errors (non-zero exit code) return `isError: true` with stderr content
- [ ] Server runs indefinitely until SIGINT/SIGTERM (does not exit immediately)

### Code Quality Validation

- [ ] Follows existing codebase patterns (see `src/executor.ts` for style reference)
- [ ] ESM import syntax with `.js` extensions
- [ ] TypeScript types properly inferred/defined
- [ ] Error handling covers: unknown tools, executor errors, non-zero exit codes
- [ ] Debug logging uses `console.error()` only
- [ ] File header comment describes MCP server purpose
- [ ] Code is organized with clear section comments

### Integration Validation

- [ ] `executeMdsel` imported from `./executor.js` (correct path with `.js` extension)
- [ ] CLI argument transformation correct: `['index', '--json', ...files]` and `['select', '--json', selector, ...files]`
- [ ] Response format matches MCP spec: `{ content: [{ type: 'text', text: '...' }] }`
- [ ] Error response format: `{ isError: true, content: [{ type: 'text', text: '...' }] }`

---

## Anti-Patterns to Avoid

- [ ] **DID NOT use `McpServer` class** (v2 only, we're using v1.0.0)
- [ ] **DID NOT skip `.js` extensions** in import paths (breaks ESM)
- [ ] **DID NOT use `console.log()`** for debug output (corrupts stdio protocol)
- [ ] **DID NOT throw exceptions** for tool errors (use `isError: true` in response)
- [ ] **DID NOT call `process.exit()`** after `server.connect()` (let server run)
- [ ] **DID NOT modify mdsel output** (thin wrapper doctrine - pass stdout verbatim)
- [ ] **DID NOT hardcode tool schemas** differently from specification (use exact schemas from `tool_schemas.md`)
- [ ] **DID NOT use sync functions** for request handlers (must be `async`)
- [ ] **DID NOT forget to handle** `MdselSpawnError` from executor (wrap in try/catch)
- [ ] **DID NOT skip SIGINT/SIGTERM** handlers (server won't shut down cleanly)

---

## Confidence Score

**9/10** - One-pass implementation success likelihood is very high

**Reasoning**:
- Context completeness: All documentation, patterns, and gotchas provided from comprehensive research
- Code examples: Complete working implementation provided with inline comments
- Clear task breakdown: Sequential tasks with explicit dependencies
- Validation gates: Specific commands with expected outputs at 4 levels
- External research: MCP SDK v1 patterns verified against official documentation
- Executor integration: Existing `executeMdsel` function is stable and well-tested

**Minor risks**:
- Manual testing required (automated tests deferred to P3.M1)
- MCP protocol nuances may require iterative debugging
- Stdio transport behavior may vary across different MCP clients

**Risk Mitigation**:
- MCP Inspector recommended for comprehensive testing
- Manual validation scripts provided for tools/list and tools/call testing
- Error handling patterns are explicit and cover multiple failure modes
- Debug logging via `console.error()` allows troubleshooting without breaking protocol

---

## Next Steps (P2.M2.T2)

After completing this task, the next task **P2.M2.T2: Implement Tool Handlers** will:
- Expand the `CallTool` handler with more sophisticated input validation
- Add Zod schema validation for tool arguments
- Implement more detailed error messages and error recovery
- Add support for edge cases in selector syntax and file paths

The stubs created in this task (P2.M2.T1) provide the foundation that will be enhanced in P2.M2.T2.
