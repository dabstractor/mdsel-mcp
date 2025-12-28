# Implementation Test Analysis for mdsel-mcp

## Overview
This document analyzes the existing implementation (`src/executor.ts` and `src/index.ts`) to identify specific test scenarios and test cases.

---

## 1. executor.ts Analysis

### File: `src/executor.ts` (136 lines)

### Key Components to Test

#### Type 1: `ExecutionResult` Interface
- **Type definition** - verify TypeScript compilation (no runtime tests needed)

#### Type 2: `MdselSpawnError` Class
- **Custom Error class** with additional properties: `code`, `originalError`
- Test scenarios:
  - Constructor creates error with correct properties
  - Error name is set to 'MdselSpawnError'
  - Code property is preserved
  - OriginalError is preserved

#### Type 3: `executeMdsel` Function
**Lines 66-129** - Core async function that spawns mdsel CLI

##### Test Scenarios for `executeMdsel`:

1. **Happy Path - Success with Exit Code 0**
   - Mock spawn returns process with stdout, stderr, exit code 0
   - Verify stdout is captured correctly
   - Verify stderr is captured correctly
   - Verify exitCode is 0

2. **Error Path - Non-Zero Exit Code**
   - Mock spawn returns process with exit code 1
   - Verify exitCode is 1 (not null)
   - Verify stdout/stderr still captured

3. **Error Path - Null Exit Code**
   - Mock spawn emits close with code=null
   - Verify exitCode defaults to 1

4. **Spawn Error - ENOENT**
   - Mock spawn throws error with code='ENOENT'
   - Verify MdselSpawnError is thrown
   - Verify error message mentions "npx or mdsel not found"
   - Verify error.code is 'ENOENT'

5. **Spawn Error - Other Error**
   - Mock spawn throws generic error
   - Verify MdselSpawnError is thrown
   - Verify error code is 'SPAWN_ERROR'

6. **Argument Passing**
   - Verify spawn is called with 'npx' command
   - Verify args include 'mdsel' + provided arguments
   - Verify stdio option is ['ignore', 'pipe', 'pipe']

7. **Stream Handling**
   - Verify stdout.on('data') handler accumulates chunks
   - Verify stderr.on('data') handler accumulates chunks
   - Verify chunks are converted to UTF-8 strings

8. **Large Output**
   - Test with large stdout (>64KB)
   - Verify all chunks are accumulated correctly

9. **Multiple Data Chunks**
   - Emit multiple 'data' events on stdout
   - Verify all chunks concatenated correctly

### Critical Mock Requirements for executor.ts tests:
- Must mock `child_process.spawn`
- Mock must return object with:
  - `stdout` stream with `.on(event, callback)` method
  - `stderr` stream with `.on(event, callback)` method
  - `.on(event, callback)` method for 'close' event
  - Optional `.kill()` method

---

## 2. index.ts Analysis

### File: `src/index.ts` (276 lines)

### Key Components to Test

#### Component 1: Server Initialization (Lines 24-36)
- Server creation with correct name and version
- Tools capability is enabled

#### Component 2: Zod Validation Schemas (Lines 42-69)

##### `IndexArgsSchema` Validation Tests:
1. Valid: Non-empty files array
2. Invalid: Empty files array
3. Invalid: Files array with empty strings
4. Invalid: Files array with whitespace-only strings
5. Invalid: Missing files property

##### `SelectArgsSchema` Validation Tests:
1. Valid: Non-empty selector and non-empty files array
2. Invalid: Empty selector
3. Invalid: Whitespace-only selector (should be trimmed)
4. Invalid: Empty files array
5. Invalid: Missing selector property
6. Valid: Selector with leading/trailing whitespace (should trim)

#### Component 3: formatZodError Helper (Lines 75-88)

Test scenarios:
1. Single error with path
2. Single error without path (root level)
3. Multiple errors
4. Verify format includes "Invalid arguments:" prefix
5. Verify format includes expected usage examples

#### Component 4: ListTools Handler (Lines 94-135)

Test scenarios:
1. Returns tool array with exactly 2 tools
2. mdsel.index tool has correct schema
3. mdsel.select tool has correct schema
4. All required fields are present

#### Component 5: CallTool Handler (Lines 141-242)

##### mdsel.index Tool Tests:
1. **Valid arguments** - calls executeMdsel with ['index', '--json', ...files]
2. **Invalid arguments (empty files)** - returns error response
3. **Invalid arguments (missing files)** - returns error response
4. **Success response (exitCode 0)** - returns content with stdout
5. **Error response (exitCode non-zero)** - returns isError:true with stderr
6. **Spawn error** - catches and returns error response

##### mdsel.select Tool Tests:
1. **Valid arguments** - calls executeMdsel with ['select', '--json', selector, ...files]
2. **Selector is trimmed** - whitespace removed from selector
3. **Invalid arguments (empty selector)** - returns error response
4. **Invalid arguments (empty files)** - returns error response
5. **Success response (exitCode 0)** - returns content with stdout
6. **Error response (exitCode non-zero)** - returns isError:true with stderr

##### Unknown Tool Tests:
1. **Unknown tool name** - returns error with available tools list

#### Component 6: Transport Setup (Lines 248-252)
- Verify StdioServerTransport is created
- Verify server.connect is called

#### Component 7: Signal Handling (Lines 258-266)
- SIGINT handler calls process.exit(0)
- SIGTERM handler calls process.exit(0)

#### Component 8: Main Entry Point (Lines 272-275)
- Verify main() is called
- Errors are caught and logged to console.error

### Critical Mock Requirements for index.ts tests:
- Must mock `@modelcontextprotocol/sdk/server/index.js` Server class
- Must mock `@modelcontextprotocol/sdk/server/stdio.js` StdioServerTransport class
- Must mock `./executor.js` executeMdsel function
- Test request objects matching MCP protocol format

---

## 3. Test File Structure Recommendation

```
src/
├── executor.ts
├── executor.test.ts           <-- Executor unit tests
├── index.ts
├── index.test.ts              <-- Server handler tests
├── test/
│   ├── setup.ts               <-- Test setup/configuration
│   ├── mocks/
│   │   ├── child_process.ts   <-- spawn mock factory
│   │   ├── mcp-server.ts      <-- MCP Server mocks
│   │   └── executor.ts        <-- executeMdsel mocks
│   └── fixtures/
│       ├── valid.md
│       └── invalid.txt
```

---

## 4. Test Priority Order

### Phase 1: Core Executor Tests (P3.M1.T1.S2)
1. executeMdsel success case
2. executeMdsel non-zero exit code
3. executeMdsel ENOENT error
4. executeMdsel argument passing

### Phase 2: Tool Handler Tests (P3.M1.T1.S3)
1. mdsel.index with valid arguments
2. mdsel.index with invalid arguments (validation)
3. mdsel.select with valid arguments
4. mdsel.select with invalid arguments (validation)
5. Unknown tool error handling

### Phase 3: Integration Tests
1. Full request/response cycle for mdsel.index
2. Full request/response cycle for mdsel.select
3. Error propagation from executor through tool handler

---

## 5. Test Fixtures Needed

### Markdown Test Fixtures
```
test/fixtures/
├── simple.md          - Simple markdown with one heading
├── nested.md          - Nested headings (h1 > h2 > h3)
├── code-blocks.md     - Multiple code blocks
├── lists.md           - Various list types
├── tables.md          - Table markdown
└── empty.md           - Empty file
```

---

## 6. Expected Test Count

| Component | Minimum Tests | Target Coverage |
|-----------|---------------|-----------------|
| executor.ts | 8 | 90%+ |
| index.ts (handlers) | 15 | 85%+ |
| index.ts (validation) | 8 | 95%+ |
| **Total** | **31+** | **85%+** |

---

## 7. Edge Cases to Cover

### Executor Edge Cases:
1. Empty stdout/stderr
2. Unicode content in output
3. Very long file paths
4. Special characters in arguments
5. Process that never emits 'close' (timeout)

### Handler Edge Cases:
1. Null/undefined arguments object
2. Arguments with wrong types
3. Selector with newlines
4. Files array with duplicate paths
5. Malformed selector syntax

---

## 8. Integration with Build Process

### package.json Scripts to Add:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### vitest.config.ts Configuration:
- Environment: 'node'
- Globals: true (for describe, it, expect)
- Setup files: './src/test/setup.ts'
- Coverage provider: 'v8'
- Include: 'src/**/*.test.ts'

---

## 9. Dependencies to Add

```json
{
  "devDependencies": {
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0"
  }
}
```

---

## 10. Known Constraints from Implementation

1. **ESM Only**: Project uses `"type": "module"` - tests must use ESM imports
2. **.js Extensions Required**: All imports must use `.js` extension for ESM
3. **console.error Only**: No console.log in server (corrupts stdio protocol)
4. **child_process.spawn**: Uses 'pipe' for stdio - critical for mock behavior
5. **'close' not 'exit'**: Uses 'close' event, not 'exit' - important for mock timing
