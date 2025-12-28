# PRP: P2.M1.T1 - Implement CLI Executor

---

## Goal

**Feature Goal**: Create a robust, type-safe CLI executor function that spawns `mdsel` CLI processes via npx and captures their output for use by MCP tool handlers.

**Deliverable**: A standalone `src/executor.ts` module exporting the `executeMdsel` function with proper TypeScript types, error handling, and documentation.

**Success Definition**:
- The `executeMdsel` function is exported from `src/executor.ts`
- It successfully spawns `npx mdsel` with provided arguments
- It returns `{ stdout, stderr, exitCode }` for all executions (success and failure)
- It handles missing `mdsel` gracefully with descriptive errors
- The build completes without errors: `npm run build`
- TypeScript compilation passes: `npx tsc --noEmit`

---

## Why

- **Foundation for MCP tools**: The executor is the core dependency for both `mdsel.index` and `mdsel.select` tool handlers in P2.M2
- **Separation of concerns**: Isolating CLI execution logic allows for independent testing and easier debugging
- **Reusability**: Other parts of the system may need to invoke `mdsel` commands
- **Testability**: A pure function executor is easier to mock and test than inline spawn calls

---

## What

Create a TypeScript module `src/executor.ts` that:

1. **Spawns `npx mdsel` with provided CLI arguments**
2. **Captures stdout and stderr streams as strings**
3. **Returns exit code for result determination**
4. **Handles process spawn errors (e.g., ENOENT when npx is missing)**
5. **Does not interpret or modify CLI output** (per PRD thin wrapper doctrine)

### Success Criteria

- [ ] `src/executor.ts` exports `executeMdsel(args: string[]): Promise<ExecutionResult>`
- [ ] Function spawns `npx mdsel` with provided args using `child_process.spawn`
- [ ] Returns `{ stdout: string, stderr: string, exitCode: number }`
- [ ] Handles ENOENT errors when npx/mdsel not found
- [ ] TypeScript compiles without errors
- [ ] Build succeeds: `npm run build`

---

## All Needed Context

### Context Completeness Check

_**No Prior Knowledge Test Verification**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?_

- [x] **Project structure** understood (src/, package.json, tsconfig.json)
- [x] **MCP SDK version** clarified (v1.0.0, NOT v2 which is pre-alpha)
- [x] **CLI command** to execute: `npx mdsel <args>`
- [x] **Expected output format**: JSON envelope with success/command/timestamp/data fields
- [x] **Build system**: tsup with ESM output, Node.js 18 target
- [x] **Testing framework**: vitest (to be added in P3.M1)

### Documentation & References

```yaml
# CRITICAL ARCHITECTURE DOCUMENTS
- file: /home/dustin/projects/mdsel-mcp-glm/PRD.md
  why: PRD defines thin wrapper doctrine and output fidelity requirements
  critical: "Output must be byte-for-byte identical to mdsel JSON output. No interpretation."

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/system_context.md
  why: Architecture overview showing executor's role in the system
  section: "CLI Executor (child_process.spawn)" layer
  gotcha: "mdsel is a peer dependency - assume available via npx"

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/external_deps.md
  why: Defines exact spawn pattern to use
  pattern: "spawn('npx', ['mdsel', ...args], {stdio: 'pipe'})"
  critical: "Use 'pipe' for stdio to capture output, NOT 'inherit'"

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/tool_schemas.md
  why: CLI mapping reference for future context
  pattern: "mdsel index --json <files> / mdsel select --json <selector> <files>"

# EXISTING CODEBASE PATTERNS
- file: /home/dustin/projects/mdsel-mcp-glm/package.json
  why: Dependency versions and build configuration
  critical: "type: 'module' - use .js extensions in imports"

- file: /home/dustin/projects/mdsel-mcp-glm/tsconfig.json
  why: TypeScript compilation settings
  gotcha: "moduleResolution: 'NodeNext' - affects import paths"

- file: /home/dustin/projects/mdsel-mcp-glm/src/index.ts
  why: Existing stub code pattern for logging
  pattern: "console.error for debug messages, NOT console.log"
  critical: "In stdio mode, console.log corrupts MCP protocol stream"

# RESEARCH DOCUMENTS
- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P2M1T1/research/mcp-sdk-v1.md
  why: MCP SDK v1 patterns (executor doesn't use SDK directly, but handlers will)
  section: "Key Differences from v2"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P2M1T1/research/child_process_patterns.md
  why: Comprehensive spawn patterns, error handling, gotchas
  section: "Basic Promise Wrapper" and "ENOENT and Command Not Found Handling"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P2M1T1/research/typescript_executor_patterns.md
  why: TypeScript patterns for executor functions
  section: "Complete Example: executeMdsel Function"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P2M1T1/research/npx_execution_patterns.md
  why: npx-specific considerations and error handling
  section: "How to Correctly Spawn npx Commands"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/docs/research/mdsel-cli.md
  why: mdsel CLI command syntax and output schema
  section: "Output JSON Schema" for expected response envelope

# EXTERNAL REFERENCES
- url: https://nodejs.org/api/child_process.html#child_processspawncommand-args-options
  why: Official Node.js spawn() documentation
  critical: "stdio option determines stream handling"

- url: https://nodejs.org/api/child_process.html#event-close
  why: Understanding close vs exit events
  gotcha: "Use 'close' event, not 'exit' - streams may not be flushed on exit"

- url: https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
  why: MCP SDK v1 reference (executor doesn't use SDK but context helps)
```

### Current Codebase Tree

```bash
mdsel-mcp-glm/
├── package.json          # Dependencies, type: "module", bin entry
├── tsconfig.json         # ES2022 target, NodeNext resolution
├── tsup.config.ts        # Build config with shebang banner
├── src/
│   └── index.ts          # Server stub (to be implemented in P2.M2)
└── plan/
    ├── architecture/     # System context, deps, tool schemas
    └── P2M1T1/
        └── PRP.md        # This document
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-mcp-glm/
├── package.json          # Unchanged
├── tsconfig.json         # Unchanged
├── tsup.config.ts        # Unchanged
├── src/
│   ├── index.ts          # Server stub (unchanged for now)
│   └── executor.ts       # NEW: executeMdsel function
└── plan/
    └── P2M1T1/
        ├── PRP.md        # This document
        └── research/     # Research documents
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: stdio mode must be 'pipe', NOT 'inherit'
// 'inherit' would output to parent stdout which corrupts MCP protocol
spawn('npx', ['mdsel', ...args], { stdio: 'pipe' })

// CRITICAL: Use 'close' event, not 'exit' event
// 'exit' fires before streams are flushed
proc.on('close', (code) => { /* handle result */ })

// CRITICAL: Handle ENOENT for missing npx/mdsel
proc.on('error', (err) => {
  if (err.code === 'ENOENT') {
    // npx or mdsel not found
  }
})

// CRITICAL: Use .js extensions in ESM imports
import { spawn } from 'child_process';  // NOT 'child_process'

// CRITICAL: Exit code may be null - use null coalescing
const exitCode = code ?? 1;

// CRITICAL: Debug output goes to stderr, NOT stdout
console.error('debug message');  // OK
console.log('debug message');    // WRONG - breaks MCP protocol
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
/**
 * Result type returned by executeMdsel
 *
 * All fields are always present regardless of success/failure.
 * Callers should check exitCode === 0 to determine success.
 */
export interface ExecutionResult {
  /** Captured stdout from the mdsel process */
  stdout: string;

  /** Captured stderr from the mdsel process */
  stderr: string;

  /** Exit code (0 = success, non-zero = error, null if spawn failed) */
  exitCode: number | null;
}

/**
 * Error thrown when the mdsel process fails to spawn
 */
export class MdselSpawnError extends Error {
  public readonly code: string;
  public readonly originalError: Error;

  constructor(message: string, code: string, originalError: Error) {
    super(message);
    this.name = 'MdselSpawnError';
    this.code = code;
    this.originalError = originalError;
  }
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE src/executor.ts
  - IMPLEMENT: ExecutionResult interface, MdselSpawnError class, executeMdsel function
  - FILE STRUCTURE:
    1. Import child_process.spawn with .js extension
    2. Define ExecutionResult interface
    3. Define MdselSpawnError error class
    4. Implement executeMdsel function
    5. Export executeMdsel as default export
  - NAMING: snake_case for function name (executeMdsel), PascalCase for interfaces/classes
  - PLACEMENT: src/executor.ts (new file)
  - DEPENDENCIES: None (first implementation task)

Task 2: IMPLEMENT executeMdsel function signature
  - SIGNATURE: async function executeMdsel(args: string[]): Promise<ExecutionResult>
  - PARAMS: args - array of CLI arguments to pass to mdsel (e.g., ['index', '--json', 'file.md'])
  - RETURNS: Promise<ExecutionResult> with stdout, stderr, exitCode
  - IMPLEMENTATION:
    1. Return new Promise wrapping spawn call
    2. Spawn: spawn('npx', ['mdsel', ...args], { stdio: ['ignore', 'pipe', 'pipe'] })
    3. Create empty string buffers for stdout/stderr
    4. Attach data handlers to proc.stdout and proc.stderr
    5. Attach close handler to resolve promise with ExecutionResult
    6. Attach error handler to reject promise with MdselSpawnError
  - GOTCHA: Use ['ignore', 'pipe', 'pipe'] for stdio (stdin ignored, stdout/stderr piped)
  - DEPENDENCIES: Task 1 (file created)

Task 3: IMPLEMENT stdout/stderr capture
  - PATTERN: Concatenate Buffer chunks to string
  - IMPLEMENTATION:
    proc.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8'); });
    proc.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8'); });
  - ENCODING: Use 'utf8' explicitly for consistency
  - NULL CHECK: Use optional chaining (?.) as stdout/stderr may be null
  - DEPENDENCIES: Task 2 (spawn created)

Task 4: IMPLEMENT process completion handling
  - EVENT: Use 'close' event (NOT 'exit')
  - PATTERN:
    proc.on('close', (code: number | null, signal: NodeJS.Signals | null) => {
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1  // Treat null as failure
      });
    });
  - GOTCHA: Exit code may be null - use null coalescing (?? 1)
  - SIGNAL: Signal parameter available but not used in result
  - DEPENDENCIES: Task 3 (buffers created)

Task 5: IMPLEMENT spawn error handling
  - EVENT: Use 'error' event
  - PATTERN:
    proc.on('error', (err: Error) => {
      if (err.code === 'ENOENT') {
        reject(new MdselSpawnError(
          'npx or mdsel not found. Ensure Node.js and mdsel are installed.',
          'ENOENT',
          err
        ));
      } else {
        reject(new MdselSpawnError(
          `Failed to spawn mdsel: ${err.message}`,
          err.code || 'SPAWN_ERROR',
          err
        ));
      }
    });
  - ERROR TYPES: ENOENT (not found), other spawn errors
  - DEPENDENCIES: Task 2 (promise created)

Task 6: VERIFY build and type checking
  - RUN: npm run build
  - EXPECTED: dist/executor.js and dist/executor.d.ts created
  - RUN: npx tsc --noEmit
  - EXPECTED: No type errors
  - DEPENDENCIES: Task 1-5 (implementation complete)
```

### Implementation Patterns & Key Details

```typescript
// ============================================================================
// FILE: src/executor.ts
// ============================================================================

// Import with .js extension for ESM compatibility
import { spawn } from 'child_process';

// --------------------------------------------------------------
// Type Definitions
// --------------------------------------------------------------

/**
 * Result type returned by executeMdsel
 *
 * All fields are always present regardless of success/failure.
 * Callers should check exitCode === 0 to determine success.
 */
export interface ExecutionResult {
  /** Captured stdout from the mdsel process */
  stdout: string;

  /** Captured stderr from the mdsel process */
  stderr: string;

  /** Exit code (0 = success, non-zero = error, null if spawn failed) */
  exitCode: number | null;
}

/**
 * Error thrown when the mdsel process fails to spawn
 */
export class MdselSpawnError extends Error {
  public readonly code: string;
  public readonly originalError: Error;

  constructor(message: string, code: string, originalError: Error) {
    super(message);
    this.name = 'MdselSpawnError';
    this.code = code;
    this.originalError = originalError;
  }
}

// --------------------------------------------------------------
// executeMdsel Function
// --------------------------------------------------------------

/**
 * Execute mdsel CLI command via npx and capture output.
 *
 * @param args - Command arguments to pass to mdsel (e.g., ['index', '--json', 'file.md'])
 * @returns Promise resolving to ExecutionResult with stdout, stderr, and exitCode
 * @throws MdselSpawnError if the process fails to spawn
 *
 * @example
 * ```typescript
 * const result = await executeMdsel(['index', '--json', 'README.md']);
 * if (result.exitCode === 0) {
 *   console.log(result.stdout); // JSON output
 * } else {
 *   console.error(result.stderr); // Error message
 * }
 * ```
 */
export async function executeMdsel(args: string[]): Promise<ExecutionResult> {
  return new Promise<ExecutionResult>((resolve, reject) => {
    // Spawn npx mdsel with provided arguments
    // CRITICAL: Use 'pipe' for stdio to capture output
    const proc = spawn('npx', ['mdsel', ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],  // stdin ignored, stdout/stderr piped
    });

    // Buffers for captured output
    let stdout = '';
    let stderr = '';

    // ------------------------------------------------------------
    // Stream Capture
    // ------------------------------------------------------------

    // Capture stdout data
    // Use optional chaining (?.) as stdout may be null
    proc.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });

    // Capture stderr data
    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });

    // ------------------------------------------------------------
    // Process Completion Handler
    // ------------------------------------------------------------

    // CRITICAL: Use 'close' event, not 'exit'
    // 'close' fires after streams have been flushed
    proc.on('close', (code: number | null, signal: NodeJS.Signals | null) => {
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,  // Treat null exit code as failure
      });
    });

    // ------------------------------------------------------------
    // Spawn Error Handler
    // ------------------------------------------------------------

    proc.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        // npx or mdsel not found
        reject(new MdselSpawnError(
          'npx or mdsel not found. Ensure Node.js 18+ and mdsel are installed.',
          'ENOENT',
          err
        ));
      } else {
        // Other spawn errors
        reject(new MdselSpawnError(
          `Failed to spawn mdsel: ${err.message}`,
          err.code || 'SPAWN_ERROR',
          err
        ));
      }
    });
  });
}

// --------------------------------------------------------------
// Default Export
// --------------------------------------------------------------

export default executeMdsel;
```

### Integration Points

```yaml
# Future integration (not part of this task)
TOOL_HANDLERS:
  - add to: src/index.ts (in P2.M2.T2)
  - pattern: |
    import { executeMdsel } from './executor.js';
    const result = await executeMdsel(['index', '--json', ...files]);

UNIT_TESTS:
  - add to: tests/executor.test.ts (in P3.M1.T2)
  - mock: child_process.spawn
  - test: happy path, ENOENT error, non-zero exit code
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after file creation - fix before proceeding
npm run build
# Expected: dist/executor.js and dist/executor.d.ts created successfully
# Look for: "Build success" or similar message

# Type checking with specific file
npx tsc --noEmit src/executor.ts
# Expected: No type errors

# Full project type check
npx tsc --noEmit
# Expected: No errors across entire project
```

### Level 2: Manual Verification (No tests yet)

```bash
# Note: Unit tests will be added in P3.M1.T2
# For now, verify manually:

# Create a simple test script
cat > test-executor.mjs << 'EOF'
import { executeMdsel } from './dist/executor.js';

try {
  // Test with a simple mdsel command (if mdsel is installed)
  const result = await executeMdsel(['--version']);
  console.log('Exit code:', result.exitCode);
  console.log('Stdout:', result.stdout);
  console.log('Stderr:', result.stderr);
} catch (err) {
  console.error('Spawn error (expected if mdsel not installed):', err.message);
}
EOF

# Run the test
node test-executor.mjs
# Expected: Either successful mdsel output OR MdselSpawnError if mdsel not installed

# Clean up
rm test-executor.mjs
```

### Level 3: Integration Verification (Future)

```bash
# These verifications will be performed in P2.M2 (MCP Server Implementation)
# when tool handlers are added that use the executor

# Test: mdsel.index handler calls executeMdsel(['index', '--json', ...files])
# Test: mdsel.select handler calls executeMdsel(['select', '--json', selector, ...files])
```

### Level 4: Build Output Verification

```bash
# Verify the built JavaScript file has correct format
cat dist/executor.js | head -20
# Expected: ESM format with proper exports

# Verify TypeScript declarations are generated
cat dist/executor.d.ts
# Expected: ExecutionResult interface and executeMdsel function signature

# Verify the file can be imported
node -e "import('./dist/executor.js').then(m => console.log(Object.keys(m)))"
# Expected: Should see executeMdsel, ExecutionResult, MdselSpawnError
```

---

## Final Validation Checklist

### Technical Validation

- [ ] File created at `src/executor.ts`
- [ ] Function signature: `async function executeMdsel(args: string[]): Promise<ExecutionResult>`
- [ ] Interface exported: `ExecutionResult { stdout, stderr, exitCode }`
- [ ] Error class exported: `MdselSpawnError extends Error`
- [ ] Default export: `export default executeMdsel`
- [ ] Build succeeds: `npm run build` produces `dist/executor.js` and `dist/executor.d.ts`
- [ ] Type checking passes: `npx tsc --noEmit` with no errors

### Feature Validation

- [ ] Function spawns `npx mdsel` with provided args
- [ ] stdio configured as `['ignore', 'pipe', 'pipe']` for output capture
- [ ] Uses 'close' event (not 'exit') for process completion
- [ ] Captures stdout to string via 'data' event handler
- [ ] Captures stderr to string via 'data' event handler
- [ ] Handles ENOENT error with descriptive message
- [ ] Returns exitCode with null coalescing (null -> 1)
- [ ] Does NOT interpret or modify CLI output (thin wrapper doctrine)

### Code Quality Validation

- [ ] Imports use `.js` extension for ESM compatibility
- [ ] TypeScript types properly defined
- [ ] JSDoc comments present for public API
- [ ] Error class extends Error with proper fields
- [ ] No console.log usage (would break MCP protocol)
- [ ] Follows existing codebase patterns (see src/index.ts stub)

### Anti-Patterns to Avoid

- [ ] Did NOT use `shell: true` (security risk, unnecessary)
- [ ] Did NOT use `exec()` or `execSync()` (spawn is correct)
- [ ] Did NOT use 'exit' event (streams may not be flushed)
- [ ] Did NOT use `stdio: 'inherit'` (would corrupt MCP protocol)
- [ ] Did NOT add CLI output interpretation (violates thin wrapper doctrine)
- [ ] Did NOT add retry logic (not needed for local process)
- [ ] Did NOT add timeout (not specified in requirements)

---

## Confidence Score

**8/10** - One-pass implementation success likelihood is high

**Reasoning**:
- Context completeness: All documentation, patterns, and gotchas provided
- Code examples: Complete working implementation provided
- Clear task breakdown: Sequential tasks with dependencies
- Validation gates: Specific commands with expected outputs
- Minor risk: Manual testing required (no automated tests until P3.M1)

**Risk Mitigation**:
- Manual verification steps provided
- Error handling patterns are explicit
- Build/type-check commands provided for validation
