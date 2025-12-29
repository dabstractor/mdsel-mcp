# Product Requirement Prompt (PRP): P1.M2.T3 - Tool: mdsel.index

---

## Goal

**Feature Goal**: Implement the `mdsel.index` MCP tool that exposes mdsel's document indexing capability through the Model Context Protocol.

**Deliverable**: A functional MCP tool named `mdsel.index` registered in `src/index.ts` that accepts Markdown file paths, invokes the mdsel CLI with `index --json` command, and returns the selector inventory JSON unchanged.

**Success Definition**:
- Tool is registered and discoverable via MCP protocol
- Tool accepts `files` parameter (array of strings, min 1)
- Tool invokes `executeMdsel(["index", "--json", ...files])`
- Tool returns mdsel's JSON output as text content
- Build compiles without errors: `npm run build`
- MCP Inspector can call the tool successfully
- Error handling for spawn failures works correctly

---

## Why

- **First exposed tool**: `mdsel.index` is the first tool that makes mdsel functionality accessible to MCP clients, enabling document discovery before selection
- **Enables selector-based workflows**: Clients must index documents first to discover available selectors for subsequent `mdsel.select` calls
- **Validates infrastructure**: This task validates that the executeMdsel function (P1.M2.T2) and MCP server bootstrap (P1.M2.T1) work together correctly
- **Foundation for P1.M2.T4**: Implementation pattern here will be reused for `mdsel.select` tool

---

## What

Implement the `mdsel.index` MCP tool in `src/index.ts` with:

1. Import `z` from "zod" for parameter schema definition
2. Import `ListToolsRequestSchema` and `CallToolRequestSchema` from MCP SDK types
3. Register `ListToolsRequestSchema` handler that exposes the `mdsel.index` tool
4. Register `CallToolRequestSchema` handler that routes `mdsel.index` calls to implementation
5. Define Zod schema: `z.object({ files: z.array(z.string()).min(1).describe("...") })`
6. Implement tool handler: calls `executeMdsel(["index", "--json", ...args.files])`
7. Format response: `{ content: [{ type: "text", text: result }] }`
8. Handle spawn errors: return error response with `isError: true`

### Success Criteria

- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Tool appears in MCP Inspector tool list
- [ ] Tool accepts files array parameter
- [ ] Tool invokes mdsel with correct arguments
- [ ] Tool returns JSON output from mdsel unchanged
- [ ] Spawn errors (mdsel not found) return proper error response

---

## All Needed Context

### Context Completeness Check

**"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"**

Yes - this PRP provides:
- Exact import patterns including `.js` extensions for ESM
- Complete tool registration pattern from existing codebase
- Specific Zod schema for parameter validation
- Exact MCP response format to use
- Integration points with existing executeMdsel function
- Validation commands verified for this project
- Complete working examples

### Documentation & References

```yaml
# CRITICAL INTERNAL DOCS - Must read before implementing

- docfile: plan/docs/implementation_patterns.md
  why: Contains the exact Tool Definition Pattern to follow
  section: "## Tool Definition Pattern" (lines 28-43)
  pattern: server.setRequestHandler(ListToolsRequestSchema) → CallToolRequestSchema → executeMdsel
  critical: "The pattern shows exact schema structure and response format"

- docfile: plan/docs/system_context.md
  why: Shows the mdsel.index tool specification
  section: "## MCP Tools Exposed" table
  critical: "Tool name: mdsel.index, Parameters: files: string[]"

- file: src/index.ts
  why: Current server bootstrap and executeMdsel function - add tool registration here
  current: "Has Server instance, executeMdsel function, SIGINT handler, main() function"
  placement: "Add tool registration AFTER Server creation, BEFORE main() function"
  pattern: "Follow existing code structure - single file, all in src/index.ts"

- docfile: plan/P1M2T1/PRP.md
  why: Reference for PRP structure and ESM import patterns
  section: "## Known Gotchas of Our Codebase & Library Quirks"
  gotcha: "ESM imports MUST use .js extensions even in TypeScript source"

- docfile: plan/P1M2T2/PRP.md
  why: Shows executeMdsel function implementation that this tool will call
  section: "### Implementation Patterns & Key Details"
  pattern: "executeMdsel(['index', '--json', ...files]) returns Promise<string>"

# RESEARCH DOCUMENTS - Detailed findings for this task

- docfile: plan/P1M2T3/research/mdsel_index_research.md
  why: Complete mdsel index command documentation
  section: "## 2. The `index` Subcommand"
  critical: "Command syntax: mdsel index [options] <files...> --json"
  section: "### Integration Requirements for MCP Wrapper"
  pattern: "Shows exact tool registration pattern for mdsel.index"

- docfile: plan/P1M2T3/research/mcp_tool_patterns_research.md
  why: MCP tool registration patterns with request handlers
  section: "## 1. How to Define/Register Tools with the MCP Server"
  pattern: "ListToolsRequestSchema + CallToolRequestSchema pattern"

- docfile: plan/P1M2T3/research/mcp_wrapper_examples_research.md
  why: CLI wrapper patterns and error handling
  section: "## 3. Tool Response Formatting"
  pattern: "Shows response format with content array and isError flag"

- docfile: plan/P1M2T2/research/mdsel_cli_research.md
  why: mdsel CLI interface details
  section: "### 3.3 Commands → Command: index"
  critical: "JSON output format and error modes"

# EXTERNAL REFERENCES - Official documentation

- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official MCP TypeScript SDK repository
  section: Request handler patterns for tools

- url: https://github.com/dabstractor/mdsel
  why: mdsel CLI repository for reference
  section: index command documentation
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-mcp-glm
├── dist/
│   ├── index.d.ts         # Compiled TypeScript declarations
│   └── index.js           # Compiled MCP server with executeMdsel
├── node_modules/          # Dependencies (@modelcontextprotocol/sdk, zod)
├── plan/
│   ├── P1M2T1/
│   │   └── PRP.md         # PRP for MCP Server Bootstrap (completed)
│   ├── P1M2T2/
│   │   ├── PRP.md         # PRP for CLI Execution Layer (completed)
│   │   └── research/      # Research for executeMdsel function
│   ├── P1M2T3/
│   │   └── research/      # Research documents for this task
│   │       ├── mdsel_index_research.md
│   │       ├── mcp_tool_patterns_research.md
│   │       └── mcp_wrapper_examples_research.md
│   └── docs/              # Architecture documentation
│       ├── implementation_patterns.md
│       ├── mcp_sdk_notes.md
│       └── system_context.md
├── package.json           # ESM module with MCP SDK dependencies
├── PRD.md                 # Product Requirements Document
├── src/
│   └── index.ts           # MCP server with executeMdsel (tools to be added)
├── tasks.json             # Task tracking
└── tsconfig.json          # TypeScript configuration for ESM
```

### Desired Codebase Tree (after implementation)

```bash
# No new files - tool registration added to existing src/index.ts
# File structure remains the same

# Changes to src/index.ts:
# - Add: import { z } from "zod";
# - Add: import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
# - Add: setRequestHandler(ListToolsRequestSchema, ...) for tool listing
# - Add: setRequestHandler(CallToolRequestSchema, ...) for tool execution
# - Placement: After Server creation (line ~72), before main() function (line ~91)
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extensions
// WRONG: import { Server } from "@modelcontextprotocol/sdk/server/index";
// RIGHT: import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// RIGHT: import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// CRITICAL: TypeScript module resolution requires NodeNext
// If you get module resolution errors, verify tsconfig.json has:
// "module": "NodeNext"
// "moduleResolution": "NodeNext"

// CRITICAL: Tool registration order matters
// 1. Create Server instance
// 2. Register request handlers (ListTools, CallTool)
// 3. Connect to transport
// If you connect before setting up handlers, tools won't be advertised

// CRITICAL: Use setRequestHandler, NOT server.tool() helper
// The MCP SDK version (^1.25.1) uses setRequestHandler pattern
// Pattern: server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [...] }));

// CRITICAL: Response format must be exact
// SUCCESS: { content: [{ type: "text", text: mdselJsonOutput }] }
// ERROR: { content: [{ type: "text", text: errorMessage, isError: true }] }
// The isError flag is a boolean on the content item, not the response

// CRITICAL: Zod schema must define the inputSchema structure
// Use .describe() for parameter descriptions
// Pattern: z.object({ files: z.array(z.string()).min(1).describe("...") })

// CRITICAL: Always use --json flag with mdsel
// Without it, output is unstructured text
// Pattern: executeMdsel(["index", "--json", ...args.files])

// CRITICAL: Return stdout from executeMdsel regardless of exit code
// mdsel outputs valid JSON even on errors
// Only reject on spawn errors (ENOENT - mdsel not found)

// GOTCHA: mdsel must be installed on user's system
// Not bundled with mdsel-mcp, not in node_modules
// Spawn fails with ENOENT if not installed - surface this error to user

// GOTCHA: Tool handler must use switch/case or if/else
// The CallToolRequestSchema handler receives all tool calls
// Must route to correct implementation based on request.params.name

// GOTCHA: zod is already installed as dependency
// Check package.json - "zod": "^3.25.0" is present
// Import: import { z } from "zod";
```

---

## Implementation Blueprint

### Data Models and Structure

No new data models - this tool integrates with existing infrastructure:

```typescript
// Tool input schema (defined with Zod)
interface MdselIndexInput {
  files: string[];  // Array of Markdown file paths (minimum 1)
}

// Tool output format (MCP standard)
interface ToolResponse {
  content: Array<{
    type: "text";
    text: string;  // JSON string from mdsel
    isError?: boolean;
  }>;
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: ADD Zod and MCP types imports to src/index.ts
  - ADD: import { z } from "zod";
  - ADD: import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
  - PLACEMENT: After existing MCP SDK imports (after line 4)
  - PATTERN: Follow existing import structure with .js extensions

Task 2: DEFINE Zod schema for mdsel.index parameters
  - CREATE: const MdselIndexSchema = z.object({...})
  - SCHEMA: { files: z.array(z.string()).min(1).describe("Markdown file paths to index") }
  - PLACEMENT: After executeMdsel function, before Server creation (line ~70)

Task 3: REGISTER ListToolsRequestSchema handler
  - ADD: server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [...] }))
  - TOOL DEFINITION:
    * name: "mdsel.index"
    * description: "Index Markdown documents to discover available selectors"
    * inputSchema: JSON Schema converted from Zod
  - PLACEMENT: After Server creation (line ~72), before main() function
  - PATTERN: Follow plan/docs/implementation_patterns.md Tool Definition Pattern

Task 4: REGISTER CallToolRequestSchema handler with mdsel.index case
  - ADD: server.setRequestHandler(CallToolRequestSchema, async (request) => {...})
  - IMPLEMENT: switch (request.params.name) case "mdsel.index"
  - VALIDATE: Parse args with MdselIndexSchema.safeParse()
  - EXECUTE: const result = await executeMdsel(["index", "--json", ...parsed.data.files])
  - RETURN: { content: [{ type: "text", text: result }] }
  - ERROR HANDLING: Catch spawn errors, return { content: [{ type: "text", text: error.message, isError: true }] }
  - PLACEMENT: After ListToolsRequestSchema handler, before main() function

Task 5: VERIFY TypeScript compilation
  - RUN: npm run build
  - VALIDATE: No compilation errors
  - VALIDATE: dist/index.js contains tool registration

Task 6: VERIFY tool registration
  - CHECK: setRequestHandler called before transport connection
  - CHECK: Tool name is "mdsel.index" (exact match)
  - CHECK: Default case in switch throws Error("Unknown tool")
```

### Implementation Patterns & Key Details

```typescript
// CRITICAL PATTERN: Import statements
// Location: Top of src/index.ts, after existing MCP SDK imports (line ~4-5)
import { z } from "zod";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// PATTERN: Zod schema definition
// Location: After executeMdsel function, before Server creation (line ~70)
const MdselIndexSchema = z.object({
  files: z.array(z.string())
    .min(1, "At least one file must be specified")
    .describe("Markdown file paths to index")
});

// PATTERN: ListTools handler - exposes tool to MCP clients
// Location: After Server creation (line ~72-85)
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mdsel.index",
      description: "Index Markdown documents to discover available selectors for content retrieval. Returns a JSON inventory of all addressable content chunks including headings, paragraphs, code blocks, lists, and tables.",
      inputSchema: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            description: MdselIndexSchema.shape.files.description,
            minItems: 1
          }
        },
        required: ["files"]
      }
    }
  ]
}));

// PATTERN: CallTool handler - executes tool calls
// Location: After ListTools handler (line ~86-110)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "mdsel.index": {
      // Validate input with Zod
      const parsed = MdselIndexSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for mdsel.index: ${parsed.error.message}`);
      }

      try {
        // Execute mdsel index command
        const result = await executeMdsel(["index", "--json", ...parsed.data.files]);

        // Return mdsel JSON output unchanged
        return {
          content: [{ type: "text", text: result }]
        };
      } catch (spawnError) {
        // Handle spawn failures (e.g., mdsel not installed)
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
```

### Complete Implementation Example (src/index.ts after implementation)

```typescript
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

    const cleanup = () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      proc.removeAllListeners();
    };

    timeoutHandle = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGTERM");
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill("SIGKILL");
        }
      }, 2000);
      reject(new Error("mdsel process timed out after 30 seconds"));
    }, 30000);

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      cleanup();
      if (timedOut) return;
      resolve(stdout);
    });

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
      description: "Index Markdown documents to discover available selectors for content retrieval. Returns a JSON inventory of all addressable content chunks including headings, paragraphs, code blocks, lists, and tables.",
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
        const result = await executeMdsel(["index", "--json", ...parsed.data.files]);
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
```

### Integration Points

```yaml
NO_CHANGES_TO:
  - package.json (zod already installed)
  - tsconfig.json (already configured)
  - executeMdsel function (already implemented)

MODIFICATIONS_TO:
  - src/index.ts:
    * Add imports (zod, MCP types)
    * Add Zod schema definition
    * Add ListToolsRequestSchema handler
    * Add CallToolRequestSchema handler

NEXT_TASK_DEPENDENCIES:
  - P1.M2.T3 completion enables P1.M2.T4 (mdsel.select tool)
  - Pattern from mdsel.index will be reused for mdsel.select

EXTERNAL_DEPENDENCY:
  - requires: "mdsel CLI installed on user's system"
  - installation: "npm install -g mdsel"
  - verification: "mdsel --version"
  - error: "ENOENT if mdsel not found - surfaces as spawn error"
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after modifying src/index.ts
npm run build

# Expected: Clean compilation with no errors
# Output should show:
#   (no output on success, just compiled files in dist/)

# If errors occur, READ the TypeScript error message carefully:
# - Common: "Cannot find module 'zod'" → zod is installed, check import
# - Common: "Cannot find module" → Missing .js extension in import
# - Common: "Property 'description' does not exist" → Check Zod schema definition
# - Common: "Duplicate function declaration" → Check for existing handler
```

### Level 2: Type Checking (Component Validation)

```bash
# TypeScript type checking
npx tsc --noEmit

# Expected: No type errors
# If type errors occur, check:
# - import statements are correct with .js extensions
# - Zod schema type matches expected shape
# - Request handler signatures match MCP SDK types
```

### Level 3: Build Verification (Output Validation)

```bash
# Verify the compiled output exists
head -n 100 dist/index.js

# Expected: Compiled JavaScript with tool registration
# Look for:
#   setRequestHandler
#   ListToolsRequestSchema
#   CallToolRequestSchema
#   mdsel.index

# Verify the shebang is preserved
head -n 1 dist/index.js

# Expected: #!/usr/bin/env node
```

### Level 4: MCP Inspector Testing (System Validation)

```bash
# Prerequisite: Install mdsel CLI globally
npm install -g mdsel

# Verify mdsel is available
mdsel --version

# Create test Markdown file
cat > /tmp/test_index.md << 'EOF'
# Test Document

## Section 1

Some paragraph content.

### Subsection

```javascript
console.log("code");
```

## Section 2

More content with a list:
- Item 1
- Item 2
EOF

# Start the server through MCP Inspector
mcp-inspector node dist/index.js

# Expected:
# 1. Inspector UI opens in browser (or shows terminal UI)
# 2. Server "mdsel-mcp" version "1.0.0" is detected
# 3. Tool "mdsel.index" appears in tool list
# 4. No errors in the inspector console

# Test the tool via Inspector UI:
# 1. Click on "mdsel.index" tool
# 2. Enter files parameter: ["/tmp/test_index.md"]
# 3. Click "Call Tool" or "Execute"
# 4. Verify JSON response with selectors

# Expected response:
# {
#   "success": true,
#   "command": "index",
#   "data": {
#     "documents": [
#       {
#         "path": "/tmp/test_index.md",
#         "selectors": [
#           { "selector": "h1.0", "type": "heading", "level": 1, ... },
#           { "selector": "h2.0", "type": "heading", "level": 2, ... },
#           ...
#         ]
#       }
#     ]
#   }
# }
```

### Level 5: Manual Tool Call Testing

```bash
# Test direct tool invocation with echo and JSON-RPC
# Create a test script to call the tool

cat > /tmp/test_mdsel_index.mjs << 'EOF'
import { spawn } from 'child_process';

async function callMcpTool(toolName, args) {
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args
    }
  };

  const proc = spawn('node', ['dist/index.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'inherit']
  });

  // Write request
  proc.stdin.write(JSON.stringify(request) + '\n');

  // Read response
  let response = '';
  proc.stdout.on('data', (data) => {
    response += data.toString();
    console.log('Response:', response);
  });

  await new Promise(resolve => proc.on('close', resolve));
}

// Test mdsel.index
await callMcpTool('mdsel.index', {
  files: ['/tmp/test_index.md']
});
EOF

node /tmp/test_mdsel_index.mjs

# Expected: JSON-RPC response with tool result containing mdsel index output
```

### Level 6: Error Handling Tests

```bash
# Test 1: mdsel not installed (simulate by using wrong command)
# Modify executeMdsel temporarily to use non-existent command
# Or test with a PATH that doesn't include mdsel

# Test 2: File not found (should return valid JSON with error)
# In Inspector, call mdsel.index with files: ["/tmp/nonexistent.md"]
# Expected: JSON response with success: false and error object

# Test 3: Empty files array (validation error)
# In Inspector, call mdsel.index with files: []
# Expected: Zod validation error or mdsel error about required files

# Test 4: Invalid Markdown file
cat > /tmp/invalid.md << 'EOF'
# Valid heading
```
Unclosed code block
EOF

# In Inspector, call mdsel.index with files: ["/tmp/invalid.md"]
# Expected: JSON response with parse error
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 6 validation levels completed successfully
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Compiled file has shebang: `head -n 1 dist/index.js` shows `#!/usr/bin/env node`
- [ ] Tool registration in compiled output: `grep -q "mdsel.index" dist/index.js`
- [ ] MCP Inspector can connect and detect server
- [ ] Tool "mdsel.index" appears in Inspector tool list

### Feature Validation

- [ ] Tool name is exactly "mdsel.index"
- [ ] Tool accepts `files` parameter (array of strings)
- [ ] Tool invokes `executeMdsel(["index", "--json", ...files])`
- [ ] Tool returns mdsel JSON output unchanged
- [ ] Success response format: `{ content: [{ type: "text", text: result }] }`
- [ ] Error response format: `{ content: [{ type: "text", text: message, isError: true }] }`
- [ ] Spawn errors (mdsel not found) return proper error response
- [ ] Zod validation works for invalid input

### Code Quality Validation

- [ ] All imports use .js extensions (ESM requirement)
- [ ] Tool registration before transport connection
- [ ] Zod schema defined with proper validation
- [ ] Error handling follows try/catch pattern
- [ ] Default case in switch throws error for unknown tools
- [ ] No console.log() that would corrupt JSON-RPC
- [ ] Code follows pattern from plan/docs/implementation_patterns.md

### Documentation & Deployment

- [ ] No additional dependencies added (uses existing zod)
- [ ] Single-file implementation maintained (src/index.ts only)
- [ ] Ready for P1.M2.T4 (mdsel.select tool)
- [ ] Tool description is clear and helpful

---

## Anti-Patterns to Avoid

- **Don't** use `server.tool()` helper method - use `setRequestHandler` pattern
- **Don't** omit .js extensions from imports - will cause runtime module errors
- **Don't** skip Zod validation - validate input before executeMdsel
- **Don't** forget the `--json` flag - mdsel must output JSON for MCP
- **Don't** parse/modify mdsel output - return it unchanged
- **Don't** use console.log() for debugging - corrupts JSON-RPC protocol
- **Don't** place tool registration after transport connection - tools won't be advertised
- **Don't** handle mdsel runtime errors - let mdsel JSON speak for itself
- **Don't** create separate modules - keep everything in src/index.ts
- **Don't** add extra parameters beyond `files` - stick to mdsel interface
- **Don't** forget the default case - must throw Error for unknown tools

---

## Confidence Score

**9/10** for one-pass implementation success likelihood

**Rationale**:
- Complete working pattern provided from implementation_patterns.md
- Specific import syntax and registration pattern documented
- All validation commands are project-specific and executable
- Research documents provide deep context on mdsel CLI
- Error handling patterns with code examples included
- Integration points with existing code clearly specified

**Risk factors**:
- Requires mdsel CLI to be installed for full E2E testing (external dependency)
- MCP Inspector may not be available in all environments
- Tool registration pattern differs from some online examples (uses setRequestHandler vs server.tool())

---

## Success Metrics

Upon completion, the following should work:

```bash
# Build succeeds
npm run build

# Tool exists in compiled output
grep -q "mdsel.index" dist/index.js

# Inspector can detect tool
mcp-inspector node dist/index.js
# -> Shows "mdsel.index" in tool list

# Tool executes successfully (via Inspector UI)
# Call mdsel.index with files: ["/tmp/test.md"]
# -> Returns JSON with selectors

# Error handling works
# Call mdsel.index with files: ["/tmp/nonexistent.md"]
# -> Returns JSON with error object
```

The server will be ready for the next task:
- **P1.M2.T4**: mdsel.select tool (will reuse same pattern with different parameters)
