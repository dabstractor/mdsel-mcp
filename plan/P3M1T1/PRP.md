name: "PRP: P3.M1.T1 - Implement Test Suite for mdsel-mcp"
description: |

---

## Goal

**Feature Goal**: Implement comprehensive unit and integration tests for the mdsel-mcp MCP server using Vitest testing framework.

**Deliverable**: A complete test suite with 85%+ code coverage covering:
- Unit tests for `src/executor.ts` (CLI executor functionality)
- Unit tests for `src/index.ts` (MCP server tool handlers)
- Integration tests for end-to-end request/response cycles
- Test fixtures and mock factories
- Vitest configuration and npm test scripts

**Success Definition**:
- All tests pass: `npm test` succeeds with zero failures
- Code coverage >= 85% for `src/` directory
- Tests execute in under 5 seconds
- No external process execution (all mocked)
- CI/CD ready (no interactive or environment-dependent tests)

## User Persona (if applicable)

**Target User**: Developer maintaining and extending the mdsel-mcp package

**Use Case**: Run tests during development to catch regressions, verify changes don't break existing functionality, and ensure new features work as expected.

**User Journey**:
1. Developer makes code changes to executor or index
2. Developer runs `npm test` to verify changes
3. Tests provide quick feedback on pass/fail status
4. Failed tests indicate specific broken behavior
5. Developer fixes issues and re-runs tests

**Pain Points Addressed**:
- Currently no automated way to verify code correctness
- Risk of breaking changes going undetected
- No safety net for refactoring
- Unclear what functionality exists and how it should behave

## Why

- **Code Quality Assurance**: Tests catch bugs before they reach production
- **Regression Prevention**: Changes won't break existing functionality
- **Documentation**: Tests serve as executable documentation of expected behavior
- **Refactoring Safety**: Confident code changes with test coverage
- **Onboarding**: New developers can understand expected behavior from tests

## What

Implement a test suite using Vitest framework that:

1. Tests `executeMdsel` function with mocked `child_process.spawn`
2. Tests MCP server request handlers (ListToolsRequestSchema, CallToolRequestSchema)
3. Tests Zod validation schemas for tool arguments
4. Tests error handling paths (spawn failures, CLI errors, invalid inputs)
5. Provides test fixtures for valid/invalid inputs
6. Achieves 85%+ code coverage

### Success Criteria

- [ ] Unit tests for `src/executor.ts` (8+ test cases)
- [ ] Unit tests for `src/index.ts` (15+ test cases)
- [ ] Integration tests for request/response cycles
- [ ] All tests pass with `npm test`
- [ ] Coverage >= 85% reported by `npm run test:coverage`
- [ ] Tests execute without external dependencies (mocked)
- [ ] Test execution completes in under 5 seconds

## All Needed Context

### Context Completeness Check

_Before implementing, validate: The executing AI agent needs to know how to mock child_process.spawn, how to test MCP handlers, what the existing code does, and what patterns to follow. This PRP provides specific file references, mock patterns, and implementation examples._

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://vitest.dev/guide/
  why: Vitest setup and configuration guide
  critical: ESM projects require specific configuration (environment: 'node', globals: true)

- url: https://vitest.dev/api/vi.html
  why: vitest vi API for mocking (vi.mock, vi.spyOn, vi.fn)
  critical: Use vi.mock() for module-level mocking of child_process

- url: https://nodejs.org/api/child_process.html
  why: child_process.spawn API reference
  critical: spawn returns ChildProcess with stdout, stderr streams and 'close' event

- file: /home/dustin/projects/mdsel-mcp-glm/src/executor.ts
  why: Implementation of executeMdsel function to test
  pattern: Uses child_process.spawn with stdio: ['ignore', 'pipe', 'pipe'], listens to 'close' event
  gotcha: Uses 'close' event not 'exit', null exit code defaults to 1

- file: /home/dustin/projects/mdsel-mcp-glm/src/index.ts
  why: MCP server handlers to test (ListToolsRequestSchema, CallToolRequestSchema)
  pattern: Zod validation with safeParse, formatZodError helper
  gotcha: console.error only (no console.log in stdio mode), ESM imports with .js extension

- file: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/external_deps.md
  why: Testing strategy and MCP SDK usage patterns
  section: Testing Strategy (Unit Tests - Mock child_process.spawn)
  pattern: Mock spawn to test CLI execution logic, verify argument transformation

- file: /home/dustin/projects/mdsel-mcp-glm/plan/P3M1T1/research/implementation_test_analysis.md
  why: Detailed analysis of test scenarios and edge cases
  section: Test Scenarios for executeMdsel and Test Priority Order
  pattern: 8+ executor tests, 15+ handler tests, specific edge cases to cover

- file: /home/dustin/projects/mdsel-mcp-glm/plan/P3M1T1/research/vitest_research.md
  why: Vitest configuration patterns for ESM TypeScript projects
  section: Configure Vitest for ESM Projects, Mocking child_process.spawn
  pattern: environment: 'node', globals: true, vi.mock('child_process')

- file: /home/dustin/projects/mdsel-mcp-glm/plan/P3M1T1/research/spawn_mocking_research.md
  why: Specific patterns for mocking child_process.spawn
  section: Manual Mocking Approaches, Creating a Mock Factory
  pattern: createMockChildProcess factory with stdout/stderr/close handlers

- file: /home/dustin/projects/mdsel-mcp-glm/package.json
  why: Current dependencies and scripts configuration
  gotcha: Project uses "type": "module", requires ESM-compatible test setup
```

### Current Codebase Tree

```bash
mdsel-mcp-glm/
├── src/
│   ├── executor.ts          # CLI executor with executeMdsel function
│   └── index.ts             # MCP server with tool handlers
├── dist/                     # Compiled JavaScript (generated)
├── plan/
│   └── P3M1T1/
│       └── research/        # Research documentation (created)
├── package.json             # Project configuration
├── tsconfig.json            # TypeScript configuration
└── tsup.config.ts           # Build configuration
```

### Desired Codebase Tree (After Implementation)

```bash
mdsel-mcp-glm/
├── src/
│   ├── executor.ts
│   ├── executor.test.ts     # NEW: Unit tests for executeMdsel
│   ├── index.ts
│   ├── index.test.ts        # NEW: Unit tests for MCP handlers
│   └── test/                # NEW: Test infrastructure
│       ├── setup.ts         # Test setup and global configuration
│       └── mocks/           # Mock factories
│           ├── child_process.ts  # Spawn mock factory
│           └── executor.ts        # executeMdsel mock factory
├── vitest.config.ts         # NEW: Vitest configuration
├── package.json             # UPDATED: Add test scripts and vitest deps
└── coverage/                # NEW: Generated coverage reports
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM Module System
// Project uses "type": "module" in package.json
// All imports must use .js extensions (even for .ts files)
import { executeMdsel } from './executor.js';  // Note .js extension

// CRITICAL: child_process.spawn Mock Behavior
// The spawn mock must return an object with:
// - stdout: EventEmitter with .on('data', callback) method
// - stderr: EventEmitter with .on('data', callback) method
// - .on('close', callback) method (NOT 'exit' event)
// - Optional .kill() method

// CRITICAL: MCP Server Stdio Constraint
// In stdio mode, console.log() corrupts the MCP protocol stream
// Use console.error() for debug output only
// Tests should verify no console.log is called

// CRITICAL: Zod Validation Pattern
// Use safeParse() not parse() to avoid thrown errors
// Check validation.success boolean before accessing validation.data

// GOTCHA: Vitest with ESM
// Use vi.mock() at top level, not inside beforeEach
// Use vi.resetModules() between tests if needed
// Mock .js extension paths: vi.mock('./executor.js')

// GOTCHA: TypeScript with Vitest
// Add 'vitest/globals' to tsconfig types array
// Or import { describe, it, expect } from 'vitest'
```

---

## Implementation Blueprint

### Data Models and Structure

No new data models needed - tests validate existing `ExecutionResult`, `MdselSpawnError` interfaces and MCP request/response schemas.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE vitest.config.ts
  - IMPLEMENT: Vitest configuration for ESM TypeScript project
  - CONFIGURE: environment: 'node', globals: true, coverage provider: 'v8'
  - INCLUDE: src/**/*.test.ts pattern, exclude node_modules and dist
  - SCRIPTS: setupFiles: ['./src/test/setup.ts']
  - PLACEMENT: Root directory

Task 2: UPDATE package.json
  - ADD devDependencies: "vitest": "^2.1.0", "@vitest/coverage-v8": "^2.1.0"
  - ADD scripts: "test", "test:run", "test:coverage", "test:ui"
  - ADD tsconfig types: "vitest/globals" (or configure in setup)
  - FOLLOW: existing script naming pattern (build, dev, prepublishOnly)

Task 3: CREATE src/test/setup.ts
  - IMPLEMENT: Global test setup and configuration
  - EXPORT: Common test utilities and constants
  - CONFIGURE: vi.resetAllMocks(), vi.clearAllMocks() hooks
  - PLACEMENT: src/test/ directory

Task 4: CREATE src/test/mocks/child_process.ts
  - IMPLEMENT: createMockChildProcess factory function
  - SIGNATURE: (stdout?: string, stderr?: string, exitCode?: number) => MockChildProcess
  - BEHAVIOR: Mock stdout.on('data'), stderr.on('data'), proc.on('close')
  - ASYNC: Use setImmediate to emit events asynchronously
  - PLACEMENT: src/test/mocks/

Task 5: CREATE src/executor.test.ts
  - IMPLEMENT: Unit tests for executeMdsel function
  - MOCK: vi.mock('child_process') with mock factory from Task 4
  - TEST CASES:
    * "should spawn npx mdsel with correct arguments" - verify spawn call
    * "should capture stdout and stderr on success" - exitCode 0
    * "should return non-zero exit code on failure" - exitCode 1
    * "should default to exit code 1 when close emits null" - null -> 1
    * "should throw MdselSpawnError on ENOENT" - spawn not found
    * "should throw MdselSpawnError on other spawn errors" - generic errors
    * "should accumulate multiple stdout chunks" - streaming test
    * "should handle large output" - >64KB test
  - NAMING: describe('executeMdsel', () => { it('should ...', async () => { ... }) })
  - PLACEMENT: src/executor.test.ts

Task 6: CREATE src/test/mocks/executor.ts
  - IMPLEMENT: Mock executeMdsel function for index.test.ts
  - SIGNATURE: vi.fn().mockResolvedValue({ stdout, stderr, exitCode })
  - VARIANTS: createMockSuccess(), createMockFailure()
  - PLACEMENT: src/test/mocks/

Task 7: CREATE src/index.test.ts (ListTools Handler)
  - IMPLEMENT: Tests for ListToolsRequestSchema handler
  - MOCK: MCP Server and request handlers
  - TEST CASES:
    * "should return tool list with exactly 2 tools" - length check
    * "should include mdsel.index with correct schema" - schema validation
    * "should include mdsel.select with correct schema" - schema validation
    * "should have required fields for all tools" - name, description, inputSchema
  - PLACEMENT: src/index.test.ts

Task 8: EXTEND src/index.test.ts (Zod Validation)
  - IMPLEMENT: Tests for IndexArgsSchema and SelectArgsSchema
  - TEST CASES for IndexArgsSchema:
    * "should accept valid files array"
    * "should reject empty files array"
    * "should reject files array with empty strings"
    * "should reject missing files property"
  - TEST CASES for SelectArgsSchema:
    * "should accept valid selector and files"
    * "should reject empty selector"
    * "should trim whitespace from selector"
    * "should reject empty files array"
    * "should reject missing selector"
  - TEST formatZodError helper:
    * "should format single error correctly"
    * "should format multiple errors correctly"
    * "should include usage examples in message"

Task 9: EXTEND src/index.test.ts (CallTool - mdsel.index)
  - IMPLEMENT: Tests for mdsel.index tool execution
  - MOCK: executeMdsel with mock from Task 6
  - TEST CASES:
    * "should call executeMdsel with correct arguments for mdsel.index"
    * "should return success response when exitCode is 0"
    * "should return error response when exitCode is non-zero"
    * "should return error response for invalid arguments (empty files)"
    * "should return error response for invalid arguments (missing files)"
    * "should catch and format spawn errors"
  - VERIFY: Args transformed to ['index', '--json', ...files]

Task 10: EXTEND src/index.test.ts (CallTool - mdsel.select)
  - IMPLEMENT: Tests for mdsel.select tool execution
  - MOCK: executeMdsel with mock from Task 6
  - TEST CASES:
    * "should call executeMdsel with correct arguments for mdsel.select"
    * "should trim whitespace from selector"
    * "should return success response when exitCode is 0"
    * "should return error response when exitCode is non-zero"
    * "should return error response for invalid arguments (empty selector)"
    * "should return error response for invalid arguments (empty files)"
  - VERIFY: Args transformed to ['select', '--json', selector, ...files]

Task 11: EXTEND src/index.test.ts (Unknown Tool)
  - IMPLEMENT: Test for unknown tool name handling
  - TEST CASE:
    * "should return error response for unknown tool name"
    * "should list available tools in error message"
  - VERIFY: Error includes "Available tools: mdsel.index, mdsel.select"

Task 12: RUN and VALIDATE
  - EXECUTE: npm install to install vitest dependencies
  - RUN: npm test to execute all tests
  - VERIFY: All tests pass (zero failures)
  - RUN: npm run test:coverage
  - VERIFY: Coverage >= 85% for src/ directory
  - CHECK: Test execution time under 5 seconds
```

### Implementation Patterns & Key Details

```typescript
// ============================================================================
// CRITICAL PATTERN: Vitest Mock Factory for child_process.spawn
// ============================================================================
// File: src/test/mocks/child_process.ts

import { EventEmitter } from 'events';

export interface MockChildProcess extends EventEmitter {
  stdout: EventEmitter;
  stderr: EventEmitter;
  kill: ReturnType<typeof vi.fn>;
}

export function createMockChildProcess(
  stdoutData = '',
  stderrData = '',
  exitCode = 0
): MockChildProcess {
  const mockProc = new EventEmitter() as MockChildProcess;

  // CRITICAL: Create stdout/stderr as EventEmitters with .on() method
  mockProc.stdout = new EventEmitter();
  mockProc.stderr = new EventEmitter();
  mockProc.kill = vi.fn();

  // CRITICAL: Use setImmediate for async event emission
  if (stdoutData) {
    setImmediate(() => {
      mockProc.stdout.emit('data', Buffer.from(stdoutData));
    });
  }

  if (stderrData) {
    setImmediate(() => {
      mockProc.stderr.emit('data', Buffer.from(stderrData));
    });
  }

  // CRITICAL: Emit 'close' event, NOT 'exit'
  setImmediate(() => {
    mockProc.emit('close', exitCode, null);
  });

  return mockProc;
}

// ============================================================================
// PATTERN: Mocking child_process at module level
// ============================================================================
// File: src/executor.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawn } from 'child_process';
import { executeMdsel } from './executor.js';
import { createMockChildProcess } from './test/mocks/child_process.js';

// CRITICAL: Mock at module level, not inside describe/beforeEach
vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

describe('executeMdsel', () => {
  const mockSpawn = vi.mocked(spawn);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should spawn npx mdsel with correct arguments', async () => {
    // SETUP: Create mock child process
    const mockChild = createMockChildProcess('{"result": true}', '', 0);
    mockSpawn.mockReturnValue(mockChild as any);

    // EXECUTE
    await executeMdsel(['index', '--json', 'test.md']);

    // VERIFY
    expect(mockSpawn).toHaveBeenCalledWith(
      'npx',
      ['mdsel', 'index', '--json', 'test.md'],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );
  });

  it('should capture stdout and stderr on success', async () => {
    const mockChild = createMockChildProcess(
      '{"headings": []}',
      '',
      0
    );
    mockSpawn.mockReturnValue(mockChild as any);

    const result = await executeMdsel(['index', '--json', 'test.md']);

    expect(result.stdout).toBe('{"headings": []}');
    expect(result.stderr).toBe('');
    expect(result.exitCode).toBe(0);
  });

  it('should throw MdselSpawnError on ENOENT', async () => {
    const spawnError = new Error('spawn ENOENT') as Error & { code?: string };
    spawnError.code = 'ENOENT';
    mockSpawn.mockImplementation(() => {
      throw spawnError;
    });

    await expect(executeMdsel(['index', 'test.md']))
      .rejects.toThrow('npx or mdsel not found');

    try {
      await executeMdsel(['index', 'test.md']);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as any).name).toBe('MdselSpawnError');
      expect((e as any).code).toBe('ENOENT');
    }
  });
});

// ============================================================================
// PATTERN: Testing MCP Handlers with Mocked Executor
// ============================================================================
// File: src/index.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as executorModule from './executor.js';

// Mock executor module
vi.mock('./executor.js', () => ({
  executeMdsel: vi.fn(),
}));

const mockExecuteMdsel = vi.mocked(executorModule.executeMdsel);

describe('mdsel.index tool handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call executeMdsel with correct arguments', async () => {
    // SETUP: Mock successful execution
    mockExecuteMdsel.mockResolvedValue({
      stdout: '{"headings": []}',
      stderr: '',
      exitCode: 0,
    });

    // EXECUTE: Simulate MCP request (would use actual handler in real test)
    await mockExecuteMdsel(['index', '--json', 'test.md']);

    // VERIFY
    expect(mockExecuteMdsel).toHaveBeenCalledWith(['index', '--json', 'test.md']);
    expect(mockExecuteMdsel).toHaveBeenCalledTimes(1);
  });

  it('should handle validation errors for empty files array', async () => {
    // This would test the actual Zod validation in the handler
    // Implementation depends on how we access the handler for testing
  });
});

// ============================================================================
// PATTERN: Zod Validation Testing
// ============================================================================

import { IndexArgsSchema, SelectArgsSchema } from './index.js';

describe('IndexArgsSchema validation', () => {
  it('should accept valid files array', () => {
    const result = IndexArgsSchema.safeParse({
      files: ['/path/to/file.md'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toEqual(['/path/to/file.md']);
    }
  });

  it('should reject empty files array', () => {
    const result = IndexArgsSchema.safeParse({
      files: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least one');
    }
  });

  it('should reject files array with empty strings', () => {
    const result = IndexArgsSchema.safeParse({
      files: ['/valid/path.md', '', '  '],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
    }
  });
});

describe('SelectArgsSchema validation', () => {
  it('should trim whitespace from selector', () => {
    const result = SelectArgsSchema.safeParse({
      selector: '  heading:h1[0]  ',
      files: ['test.md'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selector).toBe('heading:h1[0]');
    }
  });

  it('should reject empty selector', () => {
    const result = SelectArgsSchema.safeParse({
      selector: '',
      files: ['test.md'],
    });
    expect(result.success).toBe(false);
  });
});
```

### Integration Points

```yaml
PACKAGE.JSON:
  - add to: devDependencies
    "vitest": "^2.1.0"
    "@vitest/coverage-v8": "^2.1.0"
  - add to: scripts
    "test": "vitest"
    "test:run": "vitest run"
    "test:coverage": "vitest --coverage"
    "test:ui": "vitest --ui"
  - add to: tsconfig.compilerOptions.types
    "vitest/globals"

TSCONFIG.JSON:
  - add to: compilerOptions.types
    "vitest/globals"

VITEST.CONFIG.TS (NEW FILE):
  - environment: "node"
  - globals: true
  - coverage.provider: "v8"
  - setupFiles: ["./src/test/setup.ts"]
  - include: ["src/**/*.test.ts"]
  - exclude: ["node_modules", "dist"]
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
npm run build                    # Ensure TypeScript compiles
npx tsc --noEmit                # Type check without emitting

# Expected: Zero type errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test executor functionality
npm test -- executor.test.ts

# Test MCP handlers
npm test -- index.test.ts

# Run all tests
npm test

# Watch mode for development
npm test -- --watch

# Expected: All tests pass. If failing, debug root cause and fix implementation.
```

### Level 3: Coverage Validation (Code Quality)

```bash
# Generate coverage report
npm run test:coverage

# Check coverage thresholds
# Expected output:
# % Coverage report:
# Lines        > 85%
# Functions    > 85%
# Branches     > 80%
# Statements   > 85%

# Open HTML report for detailed view
open coverage/index.html

# Expected: Coverage >= 85%. If below threshold, add tests for uncovered paths.
```

### Level 4: Integration & Performance Testing

```bash
# Test execution time
time npm test

# Expected: Complete in under 5 seconds

# Verify no external process execution (all mocked)
# Tests should not actually spawn mdsel CLI
npm test 2>&1 | grep -i "npx" | grep -v "test"

# Expected: No output (tests don't execute actual npx commands)

# Verify tests work in CI environment
npm test -- --run

# Expected: All tests pass in non-watch mode
```

### Level 5: Domain-Specific Validation

```bash
# MCP Protocol Validation
# Verify request/response format matches MCP spec
npm test -- --grep "MCP\\|request\\|response"

# Zod Schema Validation
# Verify input validation catches all invalid cases
npm test -- --grep "validation\\|schema\\|Zod"

# Error Handling Validation
# Verify all error paths return correct format
npm test -- --grep "error\\|throw\\|reject"

# Edge Case Validation
# Verify boundary conditions and unusual inputs
npm test -- --grep "edge\\|empty\\|null\\|undefined"

# Expected: All domain-specific tests pass with correct behavior.
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] All tests pass: `npm test` shows 0 failures
- [ ] No TypeScript errors: `npx tsc --noEmit` succeeds
- [ ] Coverage >= 85%: `npm run test:coverage` reports >= 85%
- [ ] Test execution < 5 seconds: `time npm test` completes quickly
- [ ] No external dependencies: Tests run without mdsel CLI installed

### Feature Validation

- [ ] All executor test scenarios covered (8+ tests)
- [ ] All MCP handler test scenarios covered (15+ tests)
- [ ] Zod validation tests for both schemas
- [ ] Error handling tests for spawn failures
- [ ] Error handling tests for CLI failures
- [ ] Error handling tests for invalid inputs
- [ ] Unknown tool error handling verified

### Code Quality Validation

- [ ] Tests follow existing codebase patterns
- [ ] File placement matches desired tree structure
- [ ] Mock factories are reusable and well-documented
- [ ] Test names are descriptive and follow "should..." pattern
- [ ] Setup/teardown properly cleans up mocks
- [ ] No console.log usage (only console.error for debug)

### Documentation & Deployment

- [ ] vitest.config.ts is properly configured
- [ ] package.json includes all test scripts
- [ ] Test code is self-documenting with clear assertions
- [ ] Mock factories have JSDoc comments
- [ ] Coverage report is generated and reviewable

---

## Anti-Patterns to Avoid

- **Don't** use `jest.mock()` syntax - use Vitest's `vi.mock()`
- **Don't** mock inside test functions - mock at module level
- **Don't** use `.on('exit')` - code uses `'close'` event
- **Don't** forget to clear mocks between tests - use `vi.clearAllMocks()`
- **Don't** spawn actual processes - all external calls must be mocked
- **Don't** use sync assertions for async code - use `await expect(...).resolves`
- **Don't** skip error path tests - test both success and failure cases
- **Don't** use console.log in tests - it corrupts stdio in MCP mode
- **Don't** forget .js extensions in import paths - required for ESM
- **Don't** test implementation details - test behavior and interfaces
- **Don't** ignore coverage warnings - 85%+ required
- **Don't** make tests depend on external state - all fixtures in test files

---

## Success Metrics

**Confidence Score**: 9/10 for one-pass implementation success

**Validation**: The completed PRP includes:
- Specific mock factory patterns for child_process.spawn
- Detailed test scenarios for all code paths
- Vitest configuration for ESM TypeScript projects
- File-by-file implementation tasks in dependency order
- Validation commands that are project-specific and executable
- Research documents referenced for all major decisions
- Anti-patterns section to avoid common mistakes
