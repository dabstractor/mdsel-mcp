# MCP Error Response Patterns Research

## Overview

This document outlines error response patterns for MCP tool handlers, ensuring consistent and user-friendly error reporting.

## MCP Error Response Structure

### Standard Error Response Format

```typescript
// From @modelcontextprotocol/sdk/types.ts
interface CallToolResult {
  content: ContentBlock[];
  isError?: boolean;
  // ... other optional fields
}

interface ContentBlock {
  type: 'text' | 'image' | 'audio' | 'resource';
  text?: string;  // For type: 'text'
  // ... other fields for other types
}
```

### Success Response Pattern

```typescript
return {
  content: [
    {
      type: 'text',
      text: 'Result data here'
    }
  ]
  // isError is undefined/false by default
};
```

### Error Response Pattern

```typescript
return {
  isError: true,
  content: [
    {
      type: 'text',
      text: 'Error message here'
    }
  ]
};
```

## Error Categories

### 1. Validation Errors

**When**: Input doesn't meet requirements (before execution)

```typescript
const validation = schema.safeParse(args);
if (!validation.success) {
  return {
    isError: true,
    content: [{
      type: 'text',
      text: `Invalid arguments: ${formatZodError(validation.error)}`
    }]
  };
}
```

**Characteristics**:
- Returned immediately before expensive operations
- Include specific field names and issues
- Include examples of correct format

### 2. Unknown Tool Errors

**When**: Tool name doesn't match any registered tool

```typescript
if (name === 'unknown_tool') {
  return {
    isError: true,
    content: [{
      type: 'text',
      text: `Unknown tool: ${name}. Available tools: mdsel.index, mdsel.select`
    }]
  };
}
```

**Characteristics**:
- List available tools for user reference
- Include the invalid tool name

### 3. Execution Errors

**When**: Tool execution fails (CLI returns non-zero exit code)

```typescript
const result = await executeMdsel(cliArgs);
if (result.exitCode !== 0) {
  return {
    isError: true,
    content: [{
      type: 'text',
      text: result.stderr || `Command failed with code ${result.exitCode}`
    }]
  };
}
```

**Characteristics**:
- Include stderr from CLI if available
- Include exit code as fallback
- Include command context for debugging

### 4. System Errors

**When**: Unexpected system failures (spawn errors, etc.)

```typescript
try {
  const result = await executeMdsel(cliArgs);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{
      type: 'text',
      text: `System error: ${message}`
    }]
  };
}
```

**Characteristics**:
- Generic error message for system failures
- Include original error message

## Error Message Best Practices

### DO:

1. **Be specific about what went wrong**
   ```typescript
   // Good
   text: 'files array must contain at least one file path'

   // Bad
   text: 'Invalid input'
   ```

2. **Include the field name**
   ```typescript
   // Good
   text: 'files: array must not be empty'

   // Bad
   text: 'Array must not be empty'
   ```

3. **Provide examples**
   ```typescript
   // Good
   text: `Invalid arguments: ${issues}
   Expected format:
     mdsel.index: { "files": ["path/to/file.md"] }`

   // Bad
   text: 'Invalid arguments'
   ```

4. **Guide to resolution**
   ```typescript
   // Good
   text: 'Ensure mdsel is installed: npm install -g mdsel'

   // Bad
   text: 'Command not found'
   ```

### DON'T:

1. **Expose internal stack traces**
   ```typescript
   // Bad
   text: error.stack

   // Good
   text: error.message
   ```

2. **Use technical jargon**
   ```typescript
   // Bad
   text: 'Zod validation failed: constraint violation'

   // Good
   text: 'The files array must contain at least one file'
   ```

3. **Return multiple content blocks for errors**
   ```typescript
   // Bad - multiple blocks for single error
   content: [
     { type: 'text', text: 'Error 1' },
     { type: 'text', text: 'Error 2' }
   ]

   // Good - single combined message
   content: [
     { type: 'text', text: 'Error 1\nError 2' }
   ]
   ```

## Error Response Examples

### Example 1: Validation Error

```typescript
// Input: { files: [] }
{
  isError: true,
  content: [
    {
      type: 'text',
      text: `Invalid arguments: files: Array must contain at least 1 element(s)

Expected format:
  mdsel.index: { "files": ["path/to/file1.md", "path/to/file2.md"] }
  mdsel.select: { "selector": "heading:h1[0]", "files": ["path/to/file.md"] }`
    }
  ]
}
```

### Example 2: Unknown Tool Error

```typescript
// Input: { name: "mdsel.unknown" }
{
  isError: true,
  content: [
    {
      type: 'text',
      text: 'Unknown tool: mdsel.unknown. Available tools: mdsel.index, mdsel.select'
    }
  ]
}
```

### Example 3: CLI Execution Error

```typescript
// CLI returned: "Error: File not found: missing.md" with exit code 1
{
  isError: true,
  content: [
    {
      type: 'text',
      text: 'Error: File not found: missing.md'
    }
  ]
}
```

### Example 4: System Error

```typescript
// MdselSpawnError thrown
{
  isError: true,
  content: [
    {
      type: 'text',
      text: 'Error executing mdsel: npx or mdsel not found. Ensure Node.js 18+ and mdsel are installed.'
    }
  ]
}
```

## Debug Logging Patterns

### CRITICAL: Use console.error for Debug Output

In stdio mode, `console.log` corrupts the MCP protocol stream. Always use `console.error` for debugging.

```typescript
// Good - goes to stderr, doesn't break protocol
console.error('Validation failed:', validation.error);
console.error(`Executing: mdsel ${cliArgs.join(' ')}`);
console.error(`Tool ${name} failed with exit code ${result.exitCode}`);

// Bad - goes to stdout, breaks MCP protocol
console.log('Validation failed:', validation.error);
console.log(`Executing: mdsel ${cliArgs.join(' ')}`);
```

## Error Handling Flow

```
1. Receive tool call with arguments
   |
2. Validate arguments with Zod
   |-- Validation failed? --> Return validation error (immediate)
   |
3. Transform arguments to CLI args
   |
4. Execute CLI via executor
   |-- Spawn failed? --> Catch exception, return system error
   |-- Exit code != 0? --> Return CLI error with stderr
   |
5. Return success with stdout
```

## Common Gotchas

1. **Forgetting isError flag**: Error responses must have `isError: true`
2. **Using console.log**: Always use `console.error` for debug output
3. **Throwing exceptions**: Return error responses instead
4. **Vague error messages**: Be specific about what went wrong
5. **Missing examples**: Include format examples in validation errors
6. **Not catching spawn errors**: Wrap executeMdsel in try/catch

## Resources

- MCP SDK types: https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/src/types.ts
- Error handling best practices: https://modelcontextprotocol.io/docs/concepts/errors/
