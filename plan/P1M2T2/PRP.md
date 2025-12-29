# Product Requirement Prompt (PRP): P1.M2.T2 - CLI Execution Layer

---

## Goal

**Feature Goal**: Create the `executeMdsel` subprocess executor function that implements the CLI execution infrastructure for all mdsel MCP tools.

**Deliverable**: A working `executeMdsel()` function in `src/index.ts` that spawns mdsel CLI subprocesses, captures stdout/stderr, handles timeouts and errors, and returns the JSON output for consumption by MCP tools.

**Success Definition**:
- Function compiles without errors: `npm run build`
- Function spawns mdsel subprocesses correctly
- Captures stdout even when mdsel exits with non-zero code
- Handles timeouts with SIGTERM → grace period → SIGKILL pattern
- Properly handles spawn errors (e.g., mdsel not installed)
- No memory leaks from unhandled streams or unreaped processes

---

## Why

- **Foundation for MCP tools**: The `executeMdsel()` function is the shared infrastructure for both `mdsel.index` and `mdsel.select` tools (P1.M2.T3 and P1.M2.T4)
- **Reliability guarantee**: Proper timeout handling prevents hung MCP requests
- **Resource management**: Cleanup patterns prevent memory leaks and zombie processes in long-running MCP servers
- **Error transparency**: Passes through mdsel's JSON output unchanged, ensuring all error details reach the client

---

## What

Implement the CLI execution layer in `src/index.ts` with:

1. Import `spawn` from `child_process` with `.js` extension (ESM requirement)
2. Create `executeMdsel(args: string[]): Promise<string>` async function
3. Spawn `mdsel` command with provided arguments
4. Capture `stdout` and `stderr` streams as strings
5. Implement timeout handling (default 30 seconds)
6. Implement two-phase termination (SIGTERM → 2s grace → SIGKILL)
7. Handle spawn errors (command not found, permission denied)
8. Return stdout regardless of exit code (mdsel outputs valid JSON even on errors)
9. Clean up all event listeners and stream handles on completion
10. Set `NO_COLOR=1` environment variable to prevent ANSI codes in JSON output

### Success Criteria

- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Function signature matches expected pattern: `executeMdsel(args: string[]): Promise<string>`
- [ ] Handles normal mdsel execution (stdout returned, errors in stderr)
- [ ] Handles mdsel exit code 1 (still returns stdout JSON)
- [ ] Handles timeout (process killed, error thrown)
- [ ] Handles spawn failure (mdsel not found, error thrown)
- [ ] NO_COLOR environment variable set
- [ ] All event listeners properly cleaned up

---

## All Needed Context

### Context Completeness Check

**"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"**

Yes - this PRP provides:
- Complete working implementation pattern from `plan/docs/implementation_patterns.md`
- Specific import patterns for ESM with `.js` extensions
- Exact function signature and placement in `src/index.ts`
- Timeout and cleanup patterns with code examples
- mdsel CLI interface details and expected behaviors
- Integration points with existing MCP server bootstrap code

### Documentation & References

```yaml
# CRITICAL INTERNAL DOCS - Must read before implementing

- docfile: plan/docs/implementation_patterns.md
  why: Contains exact CLI Execution Pattern to follow for executeMdsel()
  section: "## CLI Execution Pattern" (lines 45-70)
  pattern: spawn() → Promise wrapper → stdout/stderr accumulation → close handler
  critical: "Return stdout regardless of exit code - mdsel outputs valid JSON even on errors"

- docfile: plan/docs/system_context.md
  why: Architecture overview showing mdsel-mcp as subprocess wrapper
  critical: "Each MCP tool call is independent - no state management needed"
  gotcha: "mdsel CLI must be installed on user's system - not bundled"

- file: src/index.ts
  why: Current MCP server bootstrap code - add executeMdsel() before tool definitions
  current: "Has Server instance, stdio transport, SIGINT handler"
  pattern: "Add executeMdsel() function after imports, before Server creation"
  placement: "Line ~10-15 (after color output disable, before Server new)"

- docfile: plan/P1M2T1/PRP.md
  why: Reference for PRP structure and ESM patterns used in this project
  section: "## Known Gotchas of Our Codebase & Library Quirks"
  gotcha: "ESM imports MUST use .js extensions even in TypeScript source"

# RESEARCH DOCUMENTS - Detailed findings for this task

- docfile: plan/P1M2T2/research/subprocess_research.md
  why: Comprehensive Node.js subprocess execution patterns
  section: "## 4. Error Handling Patterns" - Promise-based timeout handling
  section: "## 5. Security Considerations" - NO_COLOR environment variable
  section: "## 6. Buffer Management" - maxBuffer considerations for large outputs

- docfile: plan/P1M2T2/research/mdsel_cli_research.md
  why: Complete mdsel CLI interface documentation
  section: "## 3.3 Commands" - index and select command syntax
  section: "## 7. Key Behaviors for MCP Wrapper" - JSON output mode requirements
  critical: "Always use --json flag for MCP integration"
  critical: "mdsel returns JSON with success field even on errors"

# EXTERNAL REFERENCES - Official documentation

- url: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
  why: Official spawn() API documentation
  critical: "stdio option defaults to 'pipe' for stdout/stderr capture"
  gotcha: "spawn() doesn't use shell by default - safer than exec()"

- url: https://nodejs.org/api/child_process.html#child_process_class_childprocess
  why: ChildProcess class documentation for event handling
  critical: "Events: close (emitted after stdio streams close), exit (emitted when process ends)"
  gotcha: "Use 'close' event not 'exit' to ensure all stdio streams are drained"

- url: https://github.com/dabstractor/mdsel
  why: mdsel CLI repository for reference
  critical: "Installation: npm install -g mdsel"
  gotcha: "mdsel must be installed on user's system - not a dependency of mdsel-mcp"
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-mcp-glm
├── dist/
│   ├── index.d.ts         # Compiled TypeScript declarations
│   └── index.js           # Compiled MCP server bootstrap
├── node_modules/          # Dependencies (@modelcontextprotocol/sdk, zod)
├── plan/
│   ├── P1M2T1/
│   │   └── PRP.md         # PRP for MCP Server Bootstrap (completed)
│   └── P1M2T2/
│       └── research/      # Research documents for this task
│           ├── subprocess_research.md
│           └── mdsel_cli_research.md
├── package.json           # ESM module with MCP SDK dependencies
├── src/
│   └── index.ts           # MCP server bootstrap (executeMdsel to be added here)
├── tasks.json             # Task tracking
└── tsconfig.json          # TypeScript configuration for ESM
```

### Desired Codebase Tree (after implementation)

```bash
# No new files - executeMdsel() function added to existing src/index.ts
# File structure remains the same

# Changes to src/index.ts:
# - Add: import { spawn } from "child_process"; (after line 3)
# - Add: executeMdsel() function (before Server creation, ~line 11)
# - Modify: No tool definitions yet (that's P1.M2.T3 and P1.M2.T4)
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extensions
// WRONG: import { spawn } from "child_process";
// RIGHT: import { spawn } from "child_process";  // Built-in, no extension needed
// RIGHT: import { Server } from "@modelcontextprotocol/sdk/server/index.js";  // External, needs .js

// CRITICAL: spawn() for built-in modules doesn't need .js extension
// Node.js built-in modules (child_process, fs, path) don't use extensions in imports
// Only external ESM module imports need .js extensions

// CRITICAL: Use 'close' event not 'exit' for final process result
// 'exit' fires when process ends but streams may still be draining
// 'close' fires after all stdio streams have closed
// Pattern: proc.on('close', (code) => { resolve(stdout); });

// CRITICAL: Return stdout regardless of exit code
// mdsel outputs valid JSON even on errors
// Pattern: Don't reject on code !== 0 - always resolve(stdout)
// Only reject on spawn errors (ENOENT, EACCES)

// CRITICAL: Set NO_COLOR=1 environment variable
// Prevents ANSI color codes from corrupting JSON output
// Pattern: spawn("mdsel", args, { env: { ...process.env, NO_COLOR: "1" } });

// CRITICAL: Two-phase termination for timeout handling
// SIGTERM allows graceful cleanup, then SIGKILL if needed
// Pattern: kill('SIGTERM') → setTimeout(2000) → kill('SIGKILL')

// CRITICAL: Cleanup event listeners to prevent memory leaks
// Remove all listeners on close/error to prevent accumulation
// Pattern: proc.removeAllListeners() in cleanup function

// GOTCHA: mdsel must be installed on user's system
// Not bundled with mdsel-mcp, not in node_modules
// Spawn fails with ENOENT if not installed - surface this error to user

// GOTCHA: Default timeout should be reasonable
// 30 seconds is reasonable for Markdown parsing
// Large files may take longer - consider making timeout configurable

// GOTCHA: maxBuffer may need to be increased for large outputs
// Default is 1MB - large Markdown files may exceed this
// Consider setting to 10MB or higher
```

---

## Implementation Blueprint

### Data Models and Structure

No new data models - this is pure infrastructure code. The function signature:

```typescript
async function executeMdsel(args: string[]): Promise<string>
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: ADD child_process import to src/index.ts
  - ADD: import { spawn } from "child_process"; after existing imports
  - PLACEMENT: Line 4 (after MCP SDK imports)
  - NOTE: Built-in module, no .js extension needed
  - PATTERN: Follow existing import structure

Task 2: CREATE executeMdsel() function in src/index.ts
  - IMPLEMENT: async function executeMdsel(args: string[]): Promise<string>
  - PLACEMENT: After color output disable logic, before Server creation (lines ~10-25)
  - PATTERN: Follow plan/docs/implementation_patterns.md CLI Execution Pattern
  - CONTAINS:
    * Promise wrapper with reject/resolve
    * spawn("mdsel", args) with environment setup
    * stdout and stderr string accumulation
    * 'data' event handlers for both streams
    * 'close' event handler for process completion
    * 'error' event handler for spawn failures
    * Timeout with setTimeout → SIGTERM → grace → SIGKILL
    * Cleanup function for event listeners
    * NO_COLOR=1 environment variable

Task 3: VERIFY TypeScript compilation
  - RUN: npm run build
  - VALIDATE: No compilation errors
  - VALIDATE: dist/index.js contains executeMdsel function

Task 4: VERIFY function placement
  - CHECK: executeMdsel is defined before Server creation
  - CHECK: executeMdsel is accessible for future tool definitions
  - CHECK: No duplicate function names
```

### Implementation Patterns & Key Details

```typescript
// CRITICAL PATTERN: executeMdsel function placement
// Location: src/index.ts, after color output disable, before Server creation
// Approximate line range: 10-25 (inserts between existing lines)

// PATTERN: Import statement (add after line 3)
import { spawn } from "child_process";

// PATTERN: Function definition with timeout and cleanup
async function executeMdsel(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("mdsel", args, {
      env: { ...process.env, NO_COLOR: "1" }  // Prevent ANSI codes
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
```

### Complete Implementation Example (src/index.ts after Task 2)

```typescript
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
```

### Integration Points

```yaml
# No external integrations - pure infrastructure function

FUNCTION EXPORT:
  - visibility: "module-private (not exported, used by tool definitions)"
  - consumers: "mdsel.index and mdsel.select tools (P1.M2.T3, P1.M2.T4)"
  - placement: "defined before tool registrations"

NEXT TASK DEPENDENCIES:
  - P1.M2.T2 completion enables P1.M2.T3 (mdsel.index tool)
  - P1.M2.T2 completion enables P1.M2.T4 (mdsel.select tool)
  - executeMdsel(["index", "--json", ...files]) for index tool
  - executeMdsel(["select", "--json", ...]) for select tool

EXTERNAL DEPENDENCY:
  - requires: "mdsel CLI installed on user's system"
  - installation: "npm install -g mdsel"
  - verification: "mdsel --version"
  - error: "ENOENT if mdsel not found - surface to user"
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
# - Common: "Cannot find module" → Missing import
# - Common: "Property 'stdout' does not exist" → Type assertion needed
# - Common: "Duplicate function declaration" → Check for existing name
```

### Level 2: Type Checking (Component Validation)

```bash
# TypeScript type checking
npx tsc --noEmit

# Expected: No type errors
# If type errors occur, check:
# - import statement is correct
# - function signature matches expected type
# - ChildProcess types are properly imported
```

### Level 3: Build Verification (Output Validation)

```bash
# Verify the compiled output exists
head -n 30 dist/index.js

# Expected: Compiled JavaScript with executeMdsel function
# Look for:
#   function executeMdsel(args) {
#     return new Promise((resolve, reject) => {
#       const proc = (0, child_process_1.spawn)("mdsel", args, ...

# Verify the shebang is preserved
head -n 1 dist/index.js

# Expected: #!/usr/bin/env node
```

### Level 4: Function Unit Test (Manual Testing)

```bash
# Prerequisite: Install mdsel CLI globally
npm install -g mdsel

# Verify mdsel is available
mdsel --version

# Create test Markdown file
cat > /tmp/test.md << 'EOF'
# Test Document

## Section 1

Some content here.

### Subsection

More content.
EOF

# Test executeMdsel with a simple Node.js script
cat > /tmp/test_execute.mjs << 'EOF'
import { spawn } from "child_process";

async function executeMdsel(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("mdsel", args, {
      env: { ...process.env, NO_COLOR: "1" }
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let timeoutHandle;

    const cleanup = () => {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      proc.removeAllListeners();
    };

    timeoutHandle = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGTERM");
      setTimeout(() => {
        if (!proc.killed) proc.kill("SIGKILL");
      }, 2000);
      reject(new Error("Timeout"));
    }, 30000);

    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
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

// Test index command
const indexResult = await executeMdsel(["index", "--json", "/tmp/test.md"]);
console.log("Index result:", indexResult);

// Test select command
const selectResult = await executeMdsel(["select", "--json", "h1.0", "/tmp/test.md"]);
console.log("Select result:", selectResult);
EOF

# Run the test script
node /tmp/test_execute.mjs

# Expected: JSON output from mdsel
# Index result: {"success":true,"command":"index",...}
# Select result: {"success":true,"command":"select",...}
```

### Level 5: Error Handling Tests

```bash
# Test 1: mdsel not installed
# Temporarily rename mdsel to simulate missing installation
which mdsel
# (if found, create a script that tests the ENOENT case)

# Test 2: Invalid selector (should still return JSON)
node /tmp/test_execute.mjs << 'EOF'
import { spawn } from "child_process";

async function executeMdsel(args) {
  // ... (same function as above)
}

const result = await executeMdsel(["select", "--json", "h1.99", "/tmp/test.md"]);
console.log("Error result:", result);
# Should show: {"success":false,"error":{...}}
EOF

# Test 3: File not found (should still return JSON)
node /tmp/test_execute.mjs << 'EOF'
const result = await executeMdsel(["index", "--json", "/tmp/nonexistent.md"]);
console.log("Not found result:", result);
# Should show: {"success":false,"error":{...}}
EOF
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 5 validation levels completed successfully
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] executeMdsel function exists in dist/index.js
- [ ] Function returns string Promise type
- [ ] NO_COLOR environment variable is set
- [ ] Timeout handling implemented (30 seconds)

### Feature Validation

- [ ] Function signature: `async function executeMdsel(args: string[]): Promise<string>`
- [ ] Spawns mdsel with provided arguments
- [ ] Captures stdout and stderr streams
- [ ] Returns stdout regardless of exit code
- [ ] Handles spawn errors (rejects on ENOENT, EACCES)
- [ ] Implements two-phase termination (SIGTERM → SIGKILL)
- [ ] Cleans up event listeners on completion

### Code Quality Validation

- [ ] Function placed before Server creation
- [ ] Import statement added correctly (child_process)
- [ ] No duplicate function names
- [ ] Follows pattern from plan/docs/implementation_patterns.md
- [ ] Timeout value is reasonable (30 seconds)
- [ ] Cleanup function prevents memory leaks

### Documentation & Deployment

- [ ] No additional dependencies added
- [ ] Function is module-private (not exported)
- [ ] Ready for P1.M2.T3 (mdsel.index tool)
- [ ] Ready for P1.M2.T4 (mdsel.select tool)

---

## Anti-Patterns to Avoid

- **Don't** use `exec()` instead of `spawn()` - spawn is more secure and doesn't use shell
- **Don't** reject on non-zero exit codes - mdsel outputs valid JSON even on errors
- **Don't** forget to set NO_COLOR=1 - ANSI codes corrupt JSON output
- **Don't** use 'exit' event instead of 'close' - streams may not be drained
- **Don't** skip cleanup of event listeners - causes memory leaks
- **Don't** omit two-phase termination - can cause zombie processes
- **Don't** hardcode file paths - use args parameter for all mdsel arguments
- **Don't** add .js extension to child_process import - built-in modules don't need it
- **Don't** place executeMdsel after Server creation - must be defined before tool registrations
- **Don't** make executeMdsel async for tool definitions yet - that's P1.M2.T3 and P1.M2.T4

---

## Confidence Score

**9/10** for one-pass implementation success likelihood

**Rationale**:
- Complete working pattern provided from implementation_patterns.md
- Specific import syntax and function placement documented
- Timeout and cleanup patterns with code examples
- All edge cases documented (spawn errors, non-zero exit codes, missing mdsel)
- Validation commands are project-specific and executable

**Risk factors**:
- Requires mdsel CLI to be installed for full E2E testing (external dependency)
- Timeout value (30s) may need adjustment based on real-world file sizes
- Large file handling may require maxBuffer adjustment (documented for future refinement)

---

## Success Metrics

Upon completion, the following should work:

```bash
# Build succeeds
npm run build

# Function exists in compiled output
grep -q "executeMdsel" dist/index.js

# Manual test (requires mdsel installation)
npm install -g mdsel
node /tmp/test_execute.mjs  # Returns valid JSON from mdsel
```

The server will be ready for the next tasks:
- **P1.M2.T3**: mdsel.index tool (uses `executeMdsel(["index", "--json", ...files])`)
- **P1.M2.T4**: mdsel.select tool (uses `executeMdsel(["select", "--json", ...])`)
