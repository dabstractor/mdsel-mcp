# Product Requirement Prompt (PRP): P1.M2.T4 - Tool: mdsel.select

---

## Goal

**Feature Goal**: Implement the `mdsel.select` MCP tool that exposes mdsel's selector-based Markdown content retrieval through the Model Context Protocol.

**Deliverable**: A functional MCP tool named `mdsel.select` registered in `src/index.ts` that accepts selector strings and optional parameters, invokes the mdsel CLI with `select --json` command, and returns the selected content JSON unchanged.

**Success Definition**:
- Tool is registered and discoverable via MCP protocol alongside mdsel.index
- Tool accepts `selector` parameter (required string) and `files` (optional string array), `full` (optional boolean)
- Tool invokes `executeMdsel(["select", "--json", selector, ...files])` with conditional `--full` flag
- Tool returns mdsel's JSON output as text content
- Build compiles without errors: `npm run build`
- MCP Inspector can call the tool successfully
- Error handling for spawn failures works correctly
- Follows exact same pattern as mdsel.index tool

---

## Why

- **Second exposed tool**: `mdsel.select` completes the mdsel-mcp tool surface, enabling actual content retrieval after discovery via mdsel.index
- **Enables precise content access**: Clients can retrieve specific Markdown sections using selectors, avoiding loading entire files into context
- **Validates complete infrastructure**: This task validates that the executeMdsel function (P1.M2.T2), MCP server bootstrap (P1.M2.T1), and tool pattern (P1.M2.T3) work correctly for a more complex command with optional parameters
- **Completes P1.M2**: This is the final tool in the Core MCP Server Implementation milestone

---

## What

Implement the `mdsel.select` MCP tool in `src/index.ts` with:

1. Add new Zod schema: `MdselSelectSchema` for selector validation
2. Add tool to `ListToolsRequestSchema` handler's tools array
3. Add new case in `CallToolRequestSchema` handler's switch statement
4. Implement conditional argument construction for `--full` flag
5. Handle optional `files` parameter (may be undefined)
6. Return mdsel JSON output unchanged

### Success Criteria

- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Tool "mdsel.select" appears in MCP Inspector tool list
- [ ] Tool accepts `selector` (required string), `files` (optional string[]), `full` (optional boolean)
- [ ] Tool invokes mdsel with correct arguments including conditional `--full`
- [ ] Tool returns JSON output from mdsel unchanged
- [ ] Spawn errors (mdsel not found) return proper error response
- [ ] Both tools (mdsel.index and mdsel.select) work side-by-side

---

## All Needed Context

### Context Completeness Check

**"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"**

Yes - this PRP provides:
- Complete mdsel.index implementation pattern to follow exactly
- Specific command construction pattern for select with optional parameters
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

- file: src/index.ts (lines 76-143)
  why: The exact mdsel.index implementation to replicate for mdsel.select
  pattern: "MdselIndexSchema → ListTools handler → CallTool handler case"
  placement: "Add MdselSelectSchema after MdselIndexSchema, add tool to both handlers"

- docfile: plan/docs/implementation_patterns.md
  why: Contains the exact Tool Definition Pattern to follow
  section: "## Tool Definition Pattern" (lines 28-43)
  pattern: server.setRequestHandler(ListToolsRequestSchema) → CallToolRequestSchema → executeMdsel
  critical: "The pattern shows exact schema structure and response format"

- docfile: plan/docs/system_context.md
  why: Shows the mdsel.select tool specification in the tools table
  section: "## MCP Tools Exposed" table
  critical: "Tool name: mdsel.select, Parameters: selector: string, files?: string[], full?: boolean"

- docfile: plan/P1M2T3/PRP.md
  why: Complete PRP for mdsel.index - use as template
  section: "### Implementation Tasks" and "### Implementation Patterns & Key Details"
  pattern: "Shows complete tool registration flow from schema to handler to response"

- docfile: plan/P1M2T2/PRP.md
  why: Shows executeMdsel function implementation that this tool will call
  section: "### Implementation Patterns & Key Details"
  pattern: "executeMdsel(['select', '--json', ...]) returns Promise<string>"

# RESEARCH DOCUMENTS - Detailed findings for this task

- docfile: plan/P1M2T2/research/mdsel_cli_research.md
  why: Complete mdsel CLI documentation including select command
  section: "#### Command: `select`" (lines 73-120)
  critical: "Command syntax: mdsel select [options] <selector> [files...]"
  critical: "Options: --full (bypass truncation and return full content)"
  section: "### 6.2 Select Command" (lines 238-252)
  pattern: "Shows exact command construction with --json and --full flags"

- docfile: plan/P1M2T3/research/mdsel_index_research.md
  why: Reference for tool registration pattern (same pattern applies to select)
  section: "### Integration Requirements for MCP Wrapper"
  pattern: "Shows exact tool registration pattern used in this codebase"

# EXTERNAL REFERENCES - Official documentation

- url: https://github.com/dabstractor/mdsel
  why: mdsel CLI repository for reference
  section: select command documentation
  critical: "Command: mdsel select [options] <selector> [files...]"

- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official MCP TypeScript SDK repository
  section: Request handler patterns for tools
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-mcp-glm
├── dist/
│   ├── index.d.ts         # Compiled TypeScript declarations
│   └── index.js           # Compiled MCP server with mdsel.index tool
├── node_modules/          # Dependencies (@modelcontextprotocol/sdk, zod)
├── plan/
│   ├── P1M2T1/
│   │   └── PRP.md         # PRP for MCP Server Bootstrap (completed)
│   ├── P1M2T2/
│   │   └── PRP.md         # PRP for CLI Execution Layer (completed)
│   ├── P1M2T3/
│   │   └── PRP.md         # PRP for mdsel.index tool (completed)
│   ├── P1M2T4/
│   │   └── research/      # Research documents for this task (to be created)
│   └── docs/              # Architecture documentation
│       ├── implementation_patterns.md
│       ├── mcp_sdk_notes.md
│       └── system_context.md
├── package.json           # ESM module with MCP SDK dependencies
├── PRD.md                 # Product Requirements Document
├── src/
│   └── index.ts           # MCP server with executeMdsel and mdsel.index (mdsel.select to be added)
├── tasks.json             # Task tracking
└── tsconfig.json          # TypeScript configuration for ESM
```

### Desired Codebase Tree (after implementation)

```bash
# No new files - mdsel.select tool added to existing src/index.ts
# File structure remains the same

# Changes to src/index.ts:
# - Add: MdselSelectSchema Zod schema (after MdselIndexSchema, ~line 82)
# - Modify: Add mdsel.select to ListTools handler tools array (line ~98-115)
# - Modify: Add case "mdsel.select" to CallTool handler switch (line ~118-148)
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: Follow exact same pattern as mdsel.index
// The mdsel.select implementation must be nearly identical to mdsel.index
// Only differences: schema fields and command construction

// CRITICAL: Conditional command construction for --full flag
// Unlike mdsel.index which has simple arguments, mdsel.select has conditional logic:
// const args = ["select", "--json"];
// if (parsed.data.full) args.push("--full");
// args.push(parsed.data.selector);
// if (parsed.data.files) args.push(...parsed.data.files);

// CRITICAL: Optional files parameter handling
// mdsel.index requires files (min 1)
// mdsel.select has optional files - may be undefined
// Pattern: if (parsed.data.files) args.push(...parsed.data.files);

// CRITICAL: Selector is required parameter
// Pattern: z.string().describe("mdsel selector string")
// No min constraint like files array - single string always required

// CRITICAL: Boolean optional parameter with default false
// Pattern: z.boolean().optional().describe("Bypass truncation and return full content")
// No .default() needed - undefined becomes falsy, which is correct behavior

// CRITICAL: Add tool to BOTH handlers
// 1. ListTools handler - exposes tool in tool list
// 2. CallTool handler - implements tool execution
// Both handlers must be updated or tool won't work

// CRITICAL: Tool order in handlers
// Add mdsel.select AFTER mdsel.index in both handlers
// Keeps code organized and predictable

// CRITICAL: Switch statement needs new case
// Add case "mdsel.select": { ... } before default case
// Don't forget to add break or return (return is used in this pattern)

// CRITICAL: Maintain default case
// default: throw new Error(`Unknown tool: ${name}`);
// Must remain as final case for unknown tool handling

// GOTCHA: mdsel select command has specific argument order
// CORRECT: mdsel select [--full] <selector> [files...]
// WRONG: mdsel select <selector> [--full] [files...]
// The --full flag must come BEFORE the selector

// GOTCHA: Files are optional for mdsel select
// When files is undefined, mdsel searches current directory
// MCP layer should not add default behavior - pass undefined through

// GOTCHA: Tool description should explain selector syntax briefly
// Description: "Retrieve Markdown content via selectors. Selectors use pattern: [namespace::]type[index][/path]"
// This helps users understand the selector parameter
```

---

## Implementation Blueprint

### Data Models and Structure

Tool input schema (defined with Zod):

```typescript
// Tool input schema (defined with Zod)
interface MdselSelectInput {
  selector: string;      // Required: mdsel selector string
  files?: string[];      // Optional: Markdown file paths to search
  full?: boolean;        // Optional: bypass truncation and return full content
}

// Tool output format (MCP standard) - same as mdsel.index
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
Task 1: ADD MdselSelectSchema Zod schema to src/index.ts
  - ADD: const MdselSelectSchema = z.object({...})
  - SCHEMA FIELDS:
    * selector: z.string().describe("mdsel selector string")
    * files: z.array(z.string()).optional().describe("Optional Markdown file paths")
    * full: z.boolean().optional().describe("Bypass truncation and return full content")
  - PLACEMENT: After MdselIndexSchema (line ~82)
  - PATTERN: Follow MdselIndexSchema structure with different fields

Task 2: ADD mdsel.select to ListToolsRequestSchema handler
  - MODIFY: server.setRequestHandler(ListToolsRequestSchema, ...) tools array
  - ADD: New tool object after mdsel.index in tools array
  - TOOL DEFINITION:
    * name: "mdsel.select"
    * description: "Retrieve Markdown content via selectors. Uses mdsel selector grammar: [namespace::]type[index][/path]. Returns matched content as JSON with matches array."
    * inputSchema: JSON Schema with selector (required), files (optional), full (optional)
  - PLACEMENT: In tools array, after mdsel.index object (line ~114)
  - PATTERN: Follow mdsel.index tool structure with different schema

Task 3: ADD mdsel.select case to CallToolRequestSchema handler
  - MODIFY: server.setRequestHandler(CallToolRequestSchema, ...) switch statement
  - ADD: case "mdsel.select": { ... } before default case
  - IMPLEMENT:
    * Validate: Parse args with MdselSelectSchema.safeParse()
    * Build args: const cmdArgs = ["select", "--json"]
    * Condition: if (parsed.data.full) cmdArgs.push("--full")
    * Add selector: cmdArgs.push(parsed.data.selector)
    * Condition: if (parsed.data.files) cmdArgs.push(...parsed.data.files)
    * Execute: const result = await executeMdsel(cmdArgs)
    * Return: { content: [{ type: "text", text: result }] }
    * Error: Catch spawn errors, return error response with isError: true
  - PLACEMENT: After mdsel.index case, before default case (line ~143)

Task 4: VERIFY TypeScript compilation
  - RUN: npm run build
  - VALIDATE: No compilation errors
  - VALIDATE: dist/index.js contains both tool registrations

Task 5: VERIFY tool registration
  - CHECK: Both tools appear in ListTools handler
  - CHECK: Both cases exist in CallTool handler
  - CHECK: Tool names are exactly "mdsel.index" and "mdsel.select"
```

### Implementation Patterns & Key Details

```typescript
// CRITICAL PATTERN: Zod schema definition
// Location: src/index.ts, after MdselIndexSchema (line ~82-88)
const MdselSelectSchema = z.object({
  selector: z.string()
    .describe("mdsel selector string following pattern: [namespace::]type[index][/path]"),
  files: z.array(z.string())
    .optional()
    .describe("Optional Markdown file paths to search (defaults to current directory)"),
  full: z.boolean()
    .optional()
    .describe("Bypass truncation and return full content without length limits")
});

// PATTERN: ListTools handler - add mdsel.select to tools array
// Location: src/index.ts, in ListToolsRequestSchema handler (line ~98-115)
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "mdsel.index",
      // ... existing mdsel.index tool definition ...
    },
    {
      name: "mdsel.select",
      description: "Retrieve Markdown content via declarative selectors. Uses mdsel selector grammar to extract specific document sections, headings, code blocks, paragraphs, lists, and tables. Returns matched content as JSON with matches and unresolved arrays.",
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
          },
          full: {
            type: "boolean",
            description: "Bypass truncation and return full content"
          }
        },
        required: ["selector"]
      }
    }
  ]
}));

// PATTERN: CallTool handler - add mdsel.select case
// Location: src/index.ts, in CallToolRequestSchema handler (line ~118-148)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "mdsel.index": {
      // ... existing mdsel.index implementation ...
    }

    case "mdsel.select": {
      // Validate input with Zod
      const parsed = MdselSelectSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for mdsel.select: ${parsed.error.message}`);
      }

      try {
        // Build command arguments with conditional --full flag
        const cmdArgs = ["select", "--json"];

        // CRITICAL: --full flag must come before selector
        if (parsed.data.full) {
          cmdArgs.push("--full");
        }

        // Add required selector parameter
        cmdArgs.push(parsed.data.selector);

        // Add optional files parameter
        if (parsed.data.files) {
          cmdArgs.push(...parsed.data.files);
        }

        // Execute mdsel select command
        const result = await executeMdsel(cmdArgs);

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

### Complete Implementation Example (src/index.ts modifications)

```typescript
// ... existing code up to MdselIndexSchema ...

// Zod schema for mdsel.index tool
const MdselIndexSchema = z.object({
  files: z.array(z.string())
    .min(1, "At least one file must be specified")
    .describe("Markdown file paths to index")
});

// Zod schema for mdsel.select tool
const MdselSelectSchema = z.object({
  selector: z.string()
    .describe("mdsel selector string following pattern: [namespace::]type[index][/path]"),
  files: z.array(z.string())
    .optional()
    .describe("Optional Markdown file paths to search"),
  full: z.boolean()
    .optional()
    .describe("Bypass truncation and return full content")
});

// ... Server creation and other existing code ...

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
    },
    {
      name: "mdsel.select",
      description: "Retrieve Markdown content via declarative selectors. Uses mdsel selector grammar to extract specific document sections, headings, code blocks, paragraphs, lists, and tables. Returns matched content as JSON with matches and unresolved arrays.",
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
          },
          full: {
            type: "boolean",
            description: "Bypass truncation and return full content"
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

    case "mdsel.select": {
      const parsed = MdselSelectSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for mdsel.select: ${parsed.error.message}`);
      }

      try {
        const cmdArgs = ["select", "--json"];

        if (parsed.data.full) {
          cmdArgs.push("--full");
        }

        cmdArgs.push(parsed.data.selector);

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

// ... rest of existing code (SIGINT handler, main(), etc.) ...
```

### Integration Points

```yaml
NO_CHANGES_TO:
  - package.json (zod already installed)
  - tsconfig.json (already configured)
  - executeMdsel function (already implemented)
  - mdsel.index tool (already working)

MODIFICATIONS_TO:
  - src/index.ts:
    * Add MdselSelectSchema after MdselIndexSchema
    * Add mdsel.select to ListToolsRequestSchema tools array
    * Add case "mdsel.select" to CallToolRequestSchema switch

COMPLETES:
  - P1.M2: Core MCP Server Implementation
  - P1.M2.T4: Tool: mdsel.select (this task)

NEXT_TASK_DEPENDENCIES:
  - P1.M2.T4 completion enables P1.M3 (Build and Distribution)
  - Both tools (index and select) now available for P1.M5 (Integration Testing)

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
# - Common: "Duplicate identifier" → Check for duplicate schema or case names
# - Common: "Property 'files' does not exist" → Check Zod schema definition
# - Common: "Type 'undefined' is not assignable" → Check optional parameter handling
# - Common: "Unexpected token" → Check syntax in switch statement
```

### Level 2: Type Checking (Component Validation)

```bash
# TypeScript type checking
npx tsc --noEmit

# Expected: No type errors
# If type errors occur, check:
# - Zod schema types match expected shapes
# - Request handler signatures match MCP SDK types
# - Optional properties are correctly typed with | undefined
```

### Level 3: Build Verification (Output Validation)

```bash
# Verify the compiled output exists
head -n 150 dist/index.js

# Expected: Compiled JavaScript with both tool registrations
# Look for:
#   "mdsel.index"
#   "mdsel.select"
#   MdselIndexSchema
#   MdselSelectSchema

# Verify both tools are in the compiled output
grep -q "mdsel.index" dist/index.js && echo "mdsel.index found"
grep -q "mdsel.select" dist/index.js && echo "mdsel.select found"
```

### Level 4: MCP Inspector Testing (System Validation)

```bash
# Prerequisite: Install mdsel CLI globally
npm install -g mdsel

# Verify mdsel is available
mdsel --version

# Create test Markdown file
cat > /tmp/test_select.md << 'EOF'
# Main Heading

## Section 1

Some paragraph content here.

### Subsection A

```javascript
console.log("code block");
```

## Section 2

- List item 1
- List item 2

More paragraph content.

## Section 3

Final section with content.
EOF

# Start the server through MCP Inspector
mcp-inspector node dist/index.js

# Expected:
# 1. Inspector UI opens in browser (or shows terminal UI)
# 2. Server "mdsel-mcp" version "1.0.0" is detected
# 3. BOTH tools "mdsel.index" and "mdsel.select" appear in tool list
# 4. No errors in the inspector console

# Test the tools via Inspector UI:

# Test 1: mdsel.index (should already work from P1.M2.T3)
# 1. Click on "mdsel.index" tool
# 2. Enter files parameter: ["/tmp/test_select.md"]
# 3. Click "Call Tool" or "Execute"
# 4. Verify JSON response with selectors

# Test 2: mdsel.select with simple selector
# 1. Click on "mdsel.select" tool
# 2. Enter selector parameter: "h1.0"
# 3. Enter files parameter: ["/tmp/test_select.md"]
# 4. Click "Call Tool" or "Execute"
# 5. Verify JSON response with content of first heading

# Test 3: mdsel.select with nested selector
# 1. Click on "mdsel.select" tool
# 2. Enter selector parameter: "h2.0"
# 3. Enter files parameter: ["/tmp/test_select.md"]
# 4. Click "Call Tool" or "Execute"
# 5. Verify JSON response with "Section 1" content

# Test 4: mdsel.select with code block selector
# 1. Click on "mdsel.select" tool
# 2. Enter selector parameter: "h2.0/code.0"
# 3. Enter files parameter: ["/tmp/test_select.md"]
# 4. Click "Call Tool" or "Execute"
# 5. Verify JSON response with JavaScript code block

# Test 5: mdsel.select with --full flag
# 1. Click on "mdsel.select" tool
# 2. Enter selector parameter: "h2.0"
# 3. Enter files parameter: ["/tmp/test_select.md"]
# 4. Enter full parameter: true
# 5. Click "Call Tool" or "Execute"
# 5. Verify JSON response with full content (not truncated)

# Expected response for mdsel.select:
# {
#   "success": true,
#   "command": "select",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "data": {
#     "matches": [
#       {
#         "selector": "h1.0",
#         "content": "# Main Heading\n\n",
#         "type": "heading",
#         "level": 1
#       }
#     ],
#     "unresolved": []
#   }
# }
```

### Level 5: Command Line Testing

```bash
# Test direct tool invocation with JSON-RPC

# First, verify mdsel CLI works directly
mdsel select h1.0 /tmp/test_select.md --json

# Expected: JSON output with heading content

# Test multiple selectors
mdsel select "h2.0, h2.1" /tmp/test_select.md --json

# Expected: JSON output with both sections

# Test nested selector
mdsel select "h2.0/code.0" /tmp/test_select.md --json

# Expected: JSON output with code block

# Test with --full flag
mdsel select h2.0 /tmp/test_select.md --json --full

# Expected: JSON output with full (untruncated) content

# Test invalid selector (should return error JSON)
mdsel select h99.0 /tmp/test_select.md --json

# Expected:
# {
#   "success": false,
#   "error": {
#     "code": "SELECTOR_NOT_FOUND",
#     "message": "Selector 'h99.0' not found",
#     "suggestions": [...]
#   }
# }
```

### Level 6: Error Handling Tests

```bash
# Test 1: mdsel not installed (simulate by modifying executeMdsel)
# This should return error response with isError: true

# Test 2: Invalid selector (should return valid JSON with error)
# In Inspector, call mdsel.select with selector: "invalid:::selector"
# Expected: JSON response with error object, no MCP exception

# Test 3: Empty selector string (should fail mdsel validation)
# In Inspector, call mdsel.select with selector: ""
# Expected: JSON response with INVALID_SELECTOR error

# Test 4: Files parameter without selector (validation should catch)
# In Inspector, call mdsel.select without selector parameter
# Expected: Zod validation error

# Test 5: File not found (should return valid JSON with error)
# In Inspector, call mdsel.select with selector: "h1.0", files: ["/tmp/nonexistent.md"]
# Expected: JSON response with FILE_NOT_FOUND error
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 6 validation levels completed successfully
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Both tools in compiled output: `grep -E "(mdsel\.index|mdsel\.select)" dist/index.js`
- [ ] MCP Inspector can connect and detect server
- [ ] Both tools "mdsel.index" and "mdsel.select" appear in Inspector tool list

### Feature Validation

- [ ] Tool name is exactly "mdsel.select"
- [ ] Tool accepts `selector` parameter (required string)
- [ ] Tool accepts `files` parameter (optional string array)
- [ ] Tool accepts `full` parameter (optional boolean)
- [ ] Tool invokes `executeMdsel(["select", "--json", selector, ...files])`
- [ ] Tool adds `--full` flag when `full` parameter is true
- [ ] Tool returns mdsel JSON output unchanged
- [ ] Success response format: `{ content: [{ type: "text", text: result }] }`
- [ ] Error response format: `{ content: [{ type: "text", text: message, isError: true }] }`
- [ ] Spawn errors (mdsel not found) return proper error response
- [ ] Zod validation works for invalid input
- [ ] Both tools work side-by-side without conflicts

### Code Quality Validation

- [ ] All imports use .js extensions (ESM requirement)
- [ ] MdselSelectSchema defined with proper validation
- [ ] Tool registration before transport connection
- [ ] Both tools in ListTools handler
- [ ] Both cases in CallTool handler
- [ ] Error handling follows try/catch pattern
- [ ] Default case in switch throws error for unknown tools
- [ ] No console.log() that would corrupt JSON-RPC
- [ ] Code follows pattern from mdsel.index implementation
- [ ] Optional parameter handling is correct (files may be undefined)

### Documentation & Deployment

- [ ] No additional dependencies added (uses existing zod)
- [ ] Single-file implementation maintained (src/index.ts only)
- [ ] Ready for P1.M3 (Build and Distribution)
- [ ] Tool description is clear and helpful
- [ ] P1.M2 (Core MCP Server Implementation) complete

---

## Anti-Patterns to Avoid

- **Don't** add .default() to optional parameters - undefined is correct behavior
- **Don't** put --full flag after selector - mdsel requires flag before selector
- **Don't** forget to add tool to BOTH handlers - ListTools and CallTool
- **Don't** skip conditional logic for optional parameters - handle undefined correctly
- **Don't** hardcode file paths - use args.files parameter
- **Don't** add default files behavior - pass undefined through to mdsel
- **Don't** use console.log() for debugging - corrupts JSON-RPC protocol
- **Don't** create separate modules - keep everything in src/index.ts
- **Don't** modify mdsel.index implementation - only add mdsel.select
- **Don't** forget the default case - must throw Error for unknown tools
- **Don't** parse/modify mdsel output - return it unchanged
- **Don't** validate selector syntax - let mdsel handle validation
- **Don't** add extra parameters beyond selector, files, full - stick to mdsel interface

---

## Confidence Score

**9/10** for one-pass implementation success likelihood

**Rationale**:
- Complete working pattern provided from mdsel.index implementation
- Specific command construction pattern documented with conditional logic
- All validation commands are project-specific and executable
- Research documents provide deep context on mdsel select command
- Error handling patterns with code examples included
- Integration points with existing code clearly specified
- Optional parameter handling patterns documented

**Risk factors**:
- Requires mdsel CLI to be installed for full E2E testing (external dependency)
- MCP Inspector may not be available in all environments
- Conditional command construction for --full flag has specific order requirements

---

## Success Metrics

Upon completion, the following should work:

```bash
# Build succeeds
npm run build

# Both tools exist in compiled output
grep -q "mdsel.index" dist/index.js && echo "mdsel.index found"
grep -q "mdsel.select" dist/index.js && echo "mdsel.select found"

# Inspector can detect both tools
mcp-inspector node dist/index.js
# -> Shows both "mdsel.index" and "mdsel.select" in tool list

# Tools execute successfully (via Inspector UI)

# Test mdsel.select with simple selector
# Call: mdsel.select with selector="h1.0", files=["/tmp/test_select.md"]
# -> Returns JSON with heading content

# Test mdsel.select with nested selector
# Call: mdsel.select with selector="h2.0/code.0", files=["/tmp/test_select.md"]
# -> Returns JSON with code block content

# Test mdsel.select with --full flag
# Call: mdsel.select with selector="h2.0", files=["/tmp/test_select.md"], full=true
# -> Returns JSON with full untruncated content

# Error handling works
# Call: mdsel.select with selector="h99.0", files=["/tmp/test_select.md"]
# -> Returns JSON with error object

# P1.M2 (Core MCP Server Implementation) is complete
# Ready for P1.M3 (Build and Distribution)
```

The server will have both tools available:
- **mdsel.index**: Index documents to discover selectors
- **mdsel.select**: Retrieve content using selectors

This completes the Core MCP Server Implementation milestone (P1.M2).
