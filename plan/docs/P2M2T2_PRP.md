# PRP: P2.M2.T2 - Implement Tool Handlers

---

## Goal

**Feature Goal**: Enhance the existing MCP tool handlers with sophisticated input validation, improved error handling, and comprehensive edge case coverage to ensure robust production-ready tool execution.

**Deliverable**: Enhanced `src/index.ts` CallTool handler with:
- Zod schema validation for tool arguments
- Detailed, actionable error messages
- Edge case handling for file paths and selectors
- Proper error recovery patterns

**Success Definition**:
- Tool arguments are validated using Zod schemas before execution
- Invalid inputs return clear, actionable error messages
- File path edge cases (empty arrays, non-existent files, relative paths) are handled
- Selector syntax edge cases (empty strings, malformed selectors) are handled
- All validation passes: `npm run build`, `npx tsc --noEmit`
- Error responses guide users to fix their inputs

---

## User Persona

**Target User**: Developers and AI assistants using MCP-compatible clients to integrate with mdsel for Markdown content selection.

**Use Case**: Users call `mdsel.index` and `mdsel.select` tools with various inputs, some of which may be invalid. When errors occur, they need clear, actionable feedback rather than cryptic CLI errors.

**User Journey**:
1. User calls tool with arguments (files array, selector string)
2. Handler validates arguments using Zod schemas
3. If valid, execute `executeMdsel` with transformed arguments
4. If invalid, return helpful error message explaining what's wrong and how to fix it
5. If execution fails, return CLI error with context about what was attempted

**Pain Points Addressed**:
- Cryptic mdsel CLI errors don't explain what input was wrong
- No validation before expensive CLI execution
- No guidance on correct selector syntax
- Silent failures on empty file arrays or invalid paths

---

## Why

- **Input validation saves time**: Catching errors before CLI invocation prevents wasted execution and provides faster feedback
- **Better developer experience**: Clear error messages reduce debugging time and frustration
- **Production robustness**: Edge case handling prevents crashes and undefined behavior
- **AI assistant friendliness**: Well-structured errors help AI assistants understand and correct their mistakes
- **Foundation for testing**: Zod schemas enable systematic testing of validation logic

---

## What

Enhance the existing CallTool handler in `src/index.ts` to add:

1. **Zod schema validation** for tool arguments (files, selector)
2. **Detailed error messages** that explain what's wrong and how to fix it
3. **Edge case handling**:
   - Empty files array
   - Empty selector string
   - Relative vs absolute file paths
   - Non-existent files
4. **Error recovery patterns** with proper error response formatting

### Current State Analysis

The existing implementation (lines 88-161 in `src/index.ts`) includes:
- Basic tool dispatch based on name
- Type guards using `args as { files: string[] }` pattern
- CLI argument transformation
- Basic error handling with try/catch
- Unknown tool error response

**What's missing**:
- Runtime validation (type guards don't validate values)
- Specific error messages for different failure modes
- Edge case handling (empty arrays, malformed selectors)
- Zod schema integration (already a dependency)

### Success Criteria

- [ ] Zod validation schemas defined for both tools
- [ ] Arguments validated before CLI execution
- [ ] Empty files array returns specific error message
- [ ] Empty selector string returns specific error message
- [ ] Validation errors are returned as `{ isError: true, content: [...] }`
- [ ] Error messages include examples of correct usage
- [ ] Build succeeds: `npm run build`
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`

---

## All Needed Context

### Context Completeness Check

_**No Prior Knowledge Test Verification**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?_

- [x] **Current handler implementation** understood (src/index.ts lines 88-161)
- [x] **Zod dependency** available (v3.25.0 in package.json)
- [x] **Executor API** documented (`executeMdsel(args: string[]): Promise<ExecutionResult>`)
- [x] **MCP SDK response format** known (content array with isError flag)
- [x] **Tool schemas** from ListTools handler (for consistency)
- [x] **mdsel CLI behavior** documented (plan/docs/research/mdsel-cli.md)
- [x] **Testing framework** identified (Vitest, though tests are in P3.M1)

### Documentation & References

```yaml
# CRITICAL ARCHITECTURE DOCUMENTS
- file: /home/dustin/projects/mdsel-mcp-glm/PRD.md
  why: PRD defines thin wrapper doctrine and error handling requirements
  critical: "Maintain thin wrapper - don't interpret CLI output, only validate inputs"

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/tool_schemas.md
  why: Tool input schemas to mirror in Zod validation
  pattern: |
    mdsel.index: { files: string[] }
    mdsel.select: { selector: string, files: string[] }

- file: /home/dustin/projects/mdsel-mcp-glm/plan/docs/research/mdsel-cli.md
  why: mdsel CLI behavior for error message context
  section: "Common Error Scenarios"

# EXISTING CODEBASE PATTERNS
- file: /home/dustin/projects/mdsel-mcp-glm/src/index.ts
  why: Current handler implementation to enhance (NOT replace)
  pattern: Lines 88-161 show existing CallTool handler structure
  gotcha: "Enhance existing handler, don't rewrite from scratch"

- file: /home/dustin/projects/mdsel-mcp-glm/src/executor.ts
  why: ExecuteMdsel API for error handling
  pattern: |
    result.exitCode === 0 indicates success
    result.stderr contains CLI error messages

- file: /home/dustin/projects/mdsel-mcp-glm/package.json
  why: Zod dependency already available
  critical: "zod: ^3.25.0 - use for validation schemas"

# ZOD VALIDATION RESEARCH
- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P2M2T2/research/zod_validation_patterns.md
  why: Zod patterns for runtime validation
  section: "Array Validation" and "String Validation"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P2M2T2/research/error_response_patterns.md
  why: MCP error response formatting
  section: "Error Response Structure"

# EXTERNAL REFERENCES
- url: https://zod.dev/?id=strings
  why: Zod string validation API (min length, patterns)
  critical: "Use .min(1) for non-empty validation"

- url: https://zod.dev/?id=arrays
  why: Zod array validation API (min length, item types)
  critical: "Use .min(1) for non-empty array validation"

- url: https://zod.dev/?id=safe-parse
  why: Zod safeParse for non-throwing validation
  pattern: "const result = schema.safeParse(args); if (!result.success) { ... }"

- url: https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts
  why: MCP SDK Tool and CallToolResult type definitions
  section: "Tool" interface and "CallToolResult" type
```

### Current Codebase Tree

```bash
mdsel-mcp-glm/
├── package.json          # zod: ^3.25.0 available
├── tsconfig.json         # ES2022 target, NodeNext resolution
├── tsup.config.ts        # Build config
├── src/
│   ├── index.ts          # EXISTING: MCP server with basic handlers (lines 88-161)
│   └── executor.ts       # COMPLETE: executeMdsel function
└── plan/
    ├── architecture/     # System context, tool schemas
    ├── P2M1T1/           # Executor PRP (completed)
    ├── P2M2T1/           # Server entry PRP (completed)
    └── P2M2T2/           # This PRP
        └── research/     # Research documents for validation patterns
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-mcp-glm/
├── package.json          # Unchanged
├── tsconfig.json         # Unchanged
├── tsup.config.ts        # Unchanged
├── src/
│   ├── index.ts          # ENHANCED: Added Zod validation and improved error handling
│   └── executor.ts       # Unchanged
└── plan/
    └── P2M2T2/
        ├── PRP.md        # This document
        └── research/     # Zod and error handling research
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: Zod is already a dependency (v3.25.0)
import { z } from 'zod';

// CRITICAL: Use safeParse, NOT parse for validation
// parse() throws errors, safeParse() returns result object
const result = schema.safeParse(args);
if (!result.success) {
  return {
    isError: true,
    content: [{
      type: 'text',
      text: formatZodError(result.error)
    }]
  };
}

// CRITICAL: Maintain thin wrapper doctrine
// Validate inputs, but DON'T interpret or modify CLI output
// Return stderr from CLI as-is (it may contain useful context)

// CRITICAL: Error response format
return {
  isError: true,
  content: [{
    type: 'text',
    text: 'Error message here'
  }]
};

// CRITICAL: console.error for debug, console.log breaks protocol
console.error('Validation failed:', result.error);
// NOT: console.log('Validation failed');

// CRITICAL: Type guards still needed after Zod validation
// Zod validates shape, TypeScript needs types for autocomplete
const validated = result.data; // Type is inferred from schema

// CRITICAL: File paths are strings - no filesystem validation in handler
// Let mdsel CLI handle file existence errors
// Only validate array is non-empty

// CRITICAL: Selector syntax - don't validate with regex
// mdsel CLI handles selector validation
// Only validate string is non-empty
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// Zod schemas for runtime validation
import { z } from 'zod';

// mdsel.index arguments schema
const IndexArgsSchema = z.object({
  files: z.array(z.string())
    .min(1, 'files array must contain at least one file path')
    .refine(
      (files) => files.every(f => f.trim().length > 0),
      'all file paths must be non-empty strings'
    )
});

// mdsel.select arguments schema
const SelectArgsSchema = z.object({
  selector: z.string()
    .min(1, 'selector must be a non-empty string')
    .trim(),
  files: z.array(z.string())
    .min(1, 'files array must contain at least one file path')
    .refine(
      (files) => files.every(f => f.trim().length > 0),
      'all file paths must be non-empty strings'
    )
});

// Type inference from schemas
type IndexArgs = z.infer<typeof IndexArgsSchema>;
type SelectArgs = z.infer<typeof SelectArgsSchema>;
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: ADD Zod import and schema definitions
  - LOCATION: Top of src/index.ts, after existing imports
  - IMPLEMENT: Import z from 'zod', define IndexArgsSchema and SelectArgsSchema
  - PATTERN:
    import { z } from 'zod';

    const IndexArgsSchema = z.object({
      files: z.array(z.string()).min(1, 'files array must contain at least one file path')
    });

    const SelectArgsSchema = z.object({
      selector: z.string().min(1, 'selector must be a non-empty string').trim(),
      files: z.array(z.string()).min(1, 'files array must contain at least one file path')
    });
  - PLACEMENT: After imports, before server.setRequestHandler(CallToolRequestSchema, ...)
  - DEPENDENCIES: None (first enhancement task)

Task 2: CREATE helper function for formatting Zod errors
  - LOCATION: Before CallTool handler, after schema definitions
  - IMPLEMENT: Function to convert ZodError to user-friendly string
  - PATTERN:
    function formatZodError(error: z.ZodError): string {
      const issues = error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
      ).join('; ');
      return `Invalid arguments: ${issues}. Please check your input and try again.`;
    }
  - NAMING: formatZodError (camelCase, descriptive)
  - PLACEMENT: After schema definitions, before CallTool handler
  - DEPENDENCIES: Task 1 (schemas defined)

Task 3: ENHANCE mdsel.index handler with validation
  - LOCATION: Inside CallTool handler, mdsel.index branch (line 96-100)
  - IMPLEMENT: Add Zod validation before CLI argument transformation
  - PATTERN:
    if (name === 'mdsel.index') {
      // Validate arguments using Zod
      const validation = IndexArgsSchema.safeParse(args);
      if (!validation.success) {
        console.error('mdsel.index validation failed:', validation.error);
        return {
          isError: true,
          content: [{
            type: 'text',
            text: formatZodError(validation.error)
          }]
        };
      }

      // Use validated data
      const { files } = validation.data;
      cliArgs = ['index', '--json', ...files];
      console.error(`Executing: mdsel index --json ${files.join(' ')}`);
    }
  - GOTCHA: Use validation.data (not original args) after successful validation
  - DEPENDENCIES: Task 1 (schemas), Task 2 (formatZodError)

Task 4: ENHANCE mdsel.select handler with validation
  - LOCATION: Inside CallTool handler, mdsel.select branch (line 101-105)
  - IMPLEMENT: Add Zod validation before CLI argument transformation
  - PATTERN:
    else if (name === 'mdsel.select') {
      // Validate arguments using Zod
      const validation = SelectArgsSchema.safeParse(args);
      if (!validation.success) {
        console.error('mdsel.select validation failed:', validation.error);
        return {
          isError: true,
          content: [{
            type: 'text',
            text: formatZodError(validation.error)
          }]
        };
      }

      // Use validated data
      const { selector, files } = validation.data;
      cliArgs = ['select', '--json', selector, ...files];
      console.error(`Executing: mdsel select --json ${selector} ${files.join(' ')}`);
    }
  - GOTCHA: Selector is trimmed by schema (z.string().trim())
  - DEPENDENCIES: Task 1 (schemas), Task 2 (formatZodError)

Task 5: ENHANCE error messages for CLI failures
  - LOCATION: Inside CallTool handler, non-zero exit code handling (line 134-145)
  - IMPLEMENT: Add context about what was attempted
  - PATTERN:
    if (result.exitCode === 0) {
      return {
        content: [{ type: 'text', text: result.stdout }]
      };
    } else {
      // Include command context in error
      const command = `mdsel ${cliArgs.join(' ')}`;
      console.error(`Command failed with exit code ${result.exitCode}: ${command}`);
      return {
        isError: true,
        content: [{
          type: 'text',
          text: result.stderr || `Command "${command}" exited with code ${result.exitCode}`
        }]
      };
    }
  - ENHANCEMENT: Shows which command failed for better debugging
  - DEPENDENCIES: Task 3, Task 4 (cliArgs available)

Task 6: VERIFY build and type checking
  - RUN: npm run build
  - EXPECTED: dist/index.js created successfully
  - RUN: npx tsc --noEmit
  - EXPECTED: No type errors (Zod types are inferred correctly)
  - DEPENDENCIES: Task 1-5 (all enhancements complete)
```

### Implementation Patterns & Key Details

```typescript
// ============================================================================
// ENHANCEMENT 1: Add Zod import and schemas
// ============================================================================

// After existing imports in src/index.ts
import { z } from 'zod';

// --------------------------------------------------------------
// Zod Validation Schemas
// --------------------------------------------------------------

/**
 * Zod schema for mdsel.index tool arguments
 * Validates that files array is non-empty and contains non-empty strings
 */
const IndexArgsSchema = z.object({
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
const SelectArgsSchema = z.object({
  selector: z.string()
    .min(1, 'selector must be a non-empty string')
    .trim(),  // Trim whitespace from selector
  files: z.array(z.string())
    .min(1, 'files array must contain at least one file path')
    .refine(
      (files) => files.every(f => f.trim().length > 0),
      'all file paths must be non-empty strings'
    )
});

// ============================================================================
// ENHANCEMENT 2: Add error formatting helper
// ============================================================================

/**
 * Format Zod validation errors into user-friendly error messages
 */
function formatZodError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'arguments';
    return `${path}: ${issue.message}`;
  }).join('; ');

  return `Invalid arguments: ${issues}\n\n` +
    `Expected format:\n` +
    `  mdsel.index: { "files": ["path/to/file1.md", "path/to/file2.md"] }\n` +
    `  mdsel.select: { "selector": "heading:h1[0]", "files": ["path/to/file.md"] }`;
}

// ============================================================================
// ENHANCEMENT 3: Update CallTool handler with validation
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`CallTool requested: ${name}`);

  try {
    let cliArgs: string[];

    // Dispatch based on tool name
    if (name === 'mdsel.index') {
      // ENHANCED: Validate arguments using Zod
      const validation = IndexArgsSchema.safeParse(args);
      if (!validation.success) {
        console.error('mdsel.index validation failed:', validation.error);
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
      // ENHANCED: Validate arguments using Zod
      const validation = SelectArgsSchema.safeParse(args);
      if (!validation.success) {
        console.error('mdsel.select validation failed:', validation.error);
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

    // ENHANCED: Return response with command context
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
      // ENHANCED: Include command context for better debugging
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
});
```

### Integration Points

```yaml
ZOD:
  - import: z from 'zod' (already in package.json)
  - usage: Runtime validation before CLI execution

EXECUTOR:
  - unchanged: executeMdsel(cliArgs) API remains the same
  - benefit: Validated arguments mean fewer CLI errors

LISTTOOLS_HANDLER:
  - consistency: Zod schemas should match inputSchema in ListTools
  - mdsel.index: { files: string[] }
  - mdsel.select: { selector: string, files: string[] }

ERROR_RESPONSES:
  - format: { isError: true, content: [{ type: 'text', text: '...' }] }
  - validation: Returns immediately before CLI execution
  - cli_failure: Returns after executeMdsel with exit code

FUTURE_TESTS (P3.M1):
  - can test: Zod schema validation directly
  - can test: Error message formatting
  - can test: Edge cases (empty arrays, empty strings)
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each enhancement step - fix before proceeding
npm run build
# Expected: dist/index.js created successfully, no build errors
# If errors: READ the error messages, check Zod syntax, fix issues

# Type checking
npx tsc --noEmit
# Expected: No type errors (Zod infer should work correctly)
# If errors: Check that z.infer<> is used correctly

# Verify Zod import works
node -e "import { z } from 'zod'; console.log('Zod version:', z.ZodError.name);"
# Expected: Should output ZodError class name
```

### Level 2: Manual Validation Testing

```bash
# Test 1: Empty files array validation
cat > test-validation.mjs << 'EOF'
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let requestId = 0;

server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log('Response:', JSON.stringify(response, null, 2));

  if (response.error || (response.result && response.result.isError)) {
    console.log('\n=== VALIDATION ERROR (EXPECTED) ===');
    server.kill();
    process.exit(0);
  }
});

// Initialize
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

// Test empty files array
setTimeout(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'tools/call',
    params: {
      name: 'mdsel.index',
      arguments: { files: [] }
    }
  }) + '\n');
}, 100);

setTimeout(() => {
  server.kill();
  process.exit(1);
}, 5000);
EOF

node test-validation.mjs
# Expected: Validation error about empty files array

rm test-validation.mjs

# Test 2: Empty selector validation
cat > test-selector-validation.mjs << 'EOF'
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let requestId = 0;

server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  if (response.error || (response.result && response.result.isError)) {
    console.log('Error response:', JSON.stringify(response, null, 2));
    console.log('\n=== VALIDATION ERROR (EXPECTED) ===');
    server.kill();
    process.exit(0);
  }
});

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

setTimeout(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'tools/call',
    params: {
      name: 'mdsel.select',
      arguments: { selector: '', files: ['README.md'] }
    }
  }) + '\n');
}, 100);

setTimeout(() => {
  server.kill();
  process.exit(1);
}, 5000);
EOF

node test-selector-validation.mjs
# Expected: Validation error about empty selector

rm test-selector-validation.mjs

# Test 3: Valid input still works
cat > test-valid-input.mjs << 'EOF'
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let requestId = 0;

server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  if (response.method === 'tools/call') {
    console.log('Tool call result received');
    server.kill();
    process.exit(0);
  }
});

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

setTimeout(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'tools/call',
    params: {
      name: 'mdsel.index',
      arguments: { files: ['README.md'] }
    }
  }) + '\n');
}, 100);

setTimeout(() => {
  server.kill();
  process.exit(1);
}, 5000);
EOF

node test-valid-input.mjs
# Expected: Tool call proceeds (may fail if mdsel not installed, but validation passes)

rm test-valid-input.mjs
```

### Level 3: Error Message Quality Check

```bash
# Verify error messages are helpful
# Run the empty files test and inspect the error message

cat > test-error-quality.mjs << 'EOF'
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let requestId = 0;

server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());

  if (response.result && response.result.isError) {
    const errorMessage = response.result.content[0].text;
    console.log('=== ERROR MESSAGE ===');
    console.log(errorMessage);
    console.log('\n=== QUALITY CHECK ===');

    const checks = {
      'Contains "Invalid arguments"': errorMessage.includes('Invalid arguments'),
      'Contains field name': errorMessage.includes('files'),
      'Contains helpful message': errorMessage.includes('at least one'),
      'Contains example format': errorMessage.includes('mdsel.index:')
    };

    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✓' : '✗'} ${check}`);
    });

    server.kill();
    process.exit(0);
  }
});

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

setTimeout(() => {
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'tools/call',
    params: {
      name: 'mdsel.index',
      arguments: { files: [] }
    }
  }) + '\n');
}, 100);

setTimeout(() => {
  server.kill();
  process.exit(1);
}, 5000);
EOF

node test-error-quality.mjs
# Expected: All quality checks pass (✓)

rm test-error-quality.mjs
```

### Level 4: Integration with MCP Clients

```bash
# Test with MCP Inspector if available
npx @modelcontextprotocol/inspector node dist/index.js
# Expected:
# 1. Inspector UI opens
# 2. Navigate to Tools tab
# 3. Click mdsel.index
# 4. Try calling with empty files array
# 5. Should see validation error in response
# 6. Try with valid files array
# 7. Should proceed to execution (may fail if mdsel not installed, but that's expected)

# Alternative: Manual MCP protocol test
cat > test-full-flow.mjs << 'EOF'
// Comprehensive test covering all validation scenarios
import { spawn } from 'child_process';

function runTest(testName, testFn) {
  console.log(`\n=== TEST: ${testName} ===`);
  return testFn();
}

async function testEmptyFilesArray() {
  // Implementation similar to previous tests
  console.log('Testing empty files array...');
  // Returns true if validation error is properly returned
}

async function testEmptySelector() {
  console.log('Testing empty selector...');
  // Returns true if validation error is properly returned
}

async function testValidInput() {
  console.log('Testing valid input...');
  // Returns true if tool call proceeds
}

async function runAllTests() {
  const results = {
    emptyFilesArray: await runTest('Empty Files Array', testEmptyFilesArray),
    emptySelector: await runTest('Empty Selector', testEmptySelector),
    validInput: await runTest('Valid Input', testValidInput)
  };

  console.log('\n=== TEST RESULTS ===');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? 'PASS' : 'FAIL'}: ${test}`);
  });
}

runAllTests().then(
  () => process.exit(0),
  () => process.exit(1)
);
EOF

node test-full-flow.mjs
# Expected: All tests pass

rm test-full-flow.mjs
```

---

## Final Validation Checklist

### Technical Validation

- [ ] Zod import added: `import { z } from 'zod'`
- [ ] IndexArgsSchema defined with files array validation
- [ ] SelectArgsSchema defined with selector and files validation
- [ ] formatZodError helper function implemented
- [ ] mdsel.index branch uses IndexArgsSchema.safeParse()
- [ ] mdsel.select branch uses SelectArgsSchema.safeParse()
- [ ] Validation errors return `{ isError: true, content: [...] }`
- [ ] Validation uses validation.data (not original args)
- [ ] CLI failure messages include command context
- [ ] Build succeeds: `npm run build`
- [ ] TypeScript compiles: `npx tsc --noEmit`

### Feature Validation

- [ ] Empty files array returns validation error
- [ ] Empty selector string returns validation error
- [ ] Error messages include field name and helpful message
- [ ] Error messages include example format
- [ ] Valid inputs proceed to CLI execution
- [ ] Selector is trimmed (z.string().trim())
- [ ] File path array elements are validated for non-empty strings
- [ ] Validation happens before executeMdsel call

### Code Quality Validation

- [ ] Zod schemas match ListTools inputSchema structure
- [ ] formatZodError produces user-friendly messages
- [ ] Debug logging uses console.error only
- [ ] Type inference works (z.infer<typeof Schema>)
- [ ] No console.log usage that would break stdio protocol
- [ ] Error responses follow MCP format (isError + content array)
- [ ] Code comments explain validation logic

### Integration Validation

- [ ] Existing handler structure preserved (enhanced, not replaced)
- [ ] Unknown tool handling unchanged
- [ ] Executor integration unchanged (executeMdsel calls same)
- [ ] CLI argument transformation unchanged
- [ ] Error handling for MdselSpawnError unchanged
- [ ] Graceful shutdown handlers unchanged

---

## Anti-Patterns to Avoid

- [ ] **DID NOT replace entire handler** - only enhanced validation logic
- [ ] **DID NOT use z.parse()** - used safeParse() for non-throwing validation
- [ ] **DID NOT skip type inference** - used z.infer<> for type safety
- [ ] **DID NOT interpret CLI output** - maintained thin wrapper doctrine
- [ ] **DID NOT validate selector syntax** - let mdsel CLI handle that
- [ ] **DID NOT validate file existence** - let mdsel CLI handle that
- [ ] **DID NOT use console.log()** - all debug output via console.error
- [ ] **DID NOT throw exceptions** - return error responses in MCP format
- [ ] **DID NOT change ListTools schemas** - kept in sync with validation
- [ ] **DID NOT break existing tests** - maintained backward compatibility

---

## Confidence Score

**9/10** - One-pass implementation success likelihood is very high

**Reasoning**:
- Context completeness: Existing handler is well-understood and working
- Clear enhancement scope: Adding validation, not rewriting logic
- Zod patterns: Well-documented, straightforward API
- Code examples: Complete implementation patterns provided
- Validation gates: 4 levels of testing from syntax to integration
- Risk mitigation: Enhancement (not replacement) preserves working code

**Minor risks**:
- Zod error formatting may need iteration for optimal UX
- Edge cases in validation may emerge during testing
- Selector trimming behavior may need adjustment

**Risk Mitigation**:
- formatZodError helper provides consistent error formatting
- Manual validation scripts verify behavior before testing phase
- Error messages include examples for self-correction
- Enhancement (not replacement) means rollback is trivial

---

## Dependencies

**Prerequisite Tasks**:
- P2.M1.T1: CLI Executor (COMPLETE) - provides executeMdsel function
- P2.M2.T1: MCP Server Entry Point (COMPLETE) - provides handler structure

**Dependent Tasks**:
- P3.M1.T1: Test Suite - will test the validation logic implemented here

---

## Next Steps (P3.M1)

After completing this task, the next phase **P3: Testing & Documentation** will:
- P3.M1.T1: Create test suite that validates Zod schemas
- P3.M1.T2: Write unit tests for formatZodError function
- P3.M1.T3: Write integration tests for tool handler validation
- P3.M2.T1: Document the validation behavior in README.md

The validation infrastructure created in this task enables comprehensive testing in P3.M1.
