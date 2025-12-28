# Zod Validation Patterns Research

## Overview

This document outlines Zod patterns used for runtime validation in the mdsel-mcp tool handlers.

## Key Zod Concepts for This Project

### 1. String Validation

```typescript
import { z } from 'zod';

// Non-empty string
const nonEmptyString = z.string()
  .min(1, 'string must not be empty');

// Trim whitespace
const trimmedString = z.string()
  .trim();

// Combined: non-empty and trimmed
const validSelector = z.string()
  .min(1, 'selector must be non-empty')
  .trim();
```

### 2. Array Validation

```typescript
// Array of strings
const stringArray = z.array(z.string());

// Non-empty array
const nonEmptyArray = z.array(z.string())
  .min(1, 'array must contain at least one element');

// Custom validation with refine
const validFilesArray = z.array(z.string())
  .min(1, 'files array must contain at least one file path')
  .refine(
    (files) => files.every(f => f.trim().length > 0),
    'all file paths must be non-empty strings'
  );
```

### 3. Object Validation

```typescript
// Simple object
const indexArgsSchema = z.object({
  files: z.array(z.string()).min(1)
});

// Nested object
const selectArgsSchema = z.object({
  selector: z.string().min(1).trim(),
  files: z.array(z.string()).min(1)
});
```

### 4. Safe Parse vs Parse

**CRITICAL**: Use `safeParse()` for validation, not `parse()`

```typescript
// DON'T: parse() throws errors
try {
  const result = schema.parse(args);
  // use result
} catch (error) {
  // handle error
}

// DO: safeParse() returns result object
const result = schema.safeParse(args);
if (!result.success) {
  // handle validation error
  console.error(result.error);
  return errorResponse;
}
// use result.data
```

### 5. Type Inference

```typescript
// Infer TypeScript type from schema
const IndexArgsSchema = z.object({
  files: z.array(z.string())
});

type IndexArgs = z.infer<typeof IndexArgsSchema>;
// Type is: { files: string[] }

// Usage with safeParse
const result = IndexArgsSchema.safeParse(args);
if (result.success) {
  const files: string[] = result.data.files;  // Type-safe!
}
```

### 6. Error Formatting

```typescript
// Access error issues
function formatZodError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join('.');
    const message = issue.message;
    return `${path}: ${message}`;
  }).join('; ');
  return `Validation failed: ${issues}`;
}

// Example error output:
// "Validation failed: files.0: file path must not be empty; selector: selector must be non-empty"
```

## Common Patterns for MCP Tool Handlers

### Pattern 1: Required Array Parameter

```typescript
const ToolWithArraySchema = z.object({
  items: z.array(z.string())
    .min(1, 'items must contain at least one element')
});
```

### Pattern 2: Required String Parameter

```typescript
const ToolWithStringSchema = z.object({
  query: z.string()
    .min(1, 'query must not be empty')
    .trim()
});
```

### Pattern 3: Optional Parameters

```typescript
const ToolWithOptionalSchema = z.object({
  required: z.string(),
  optional: z.string().optional()
});
```

### Pattern 4: Union Types

```typescript
const ToolWithUnionSchema = z.object({
  mode: z.union([z.literal('index'), z.literal('select')])
});
```

## Zod API Reference

### String Methods

- `.min(length, message)` - Minimum length
- `.max(length, message)` - Maximum length
- `.email()` - Email format
- `.url()` - URL format
- `.trim()` - Trim whitespace
- `.toLowerCase()` - Convert to lowercase
- `.regex(pattern, message)` - Regex validation

### Array Methods

- `.min(length, message)` - Minimum length
- `.max(length, message)` - Maximum length
- `.length(length, message)` - Exact length
- `.nonempty(message)` - Alias for `.min(1)`

### Object Methods

- `.shape` - Access object shape
- `.extend({})` - Add fields
- `.pick({})` - Keep only specified fields
- `.omit({})` - Remove specified fields

### Transformations

- `.transform(fn)` - Transform value after validation
- `.refine(fn, message)` - Custom validation
- `.superRefine(fn)` - Advanced custom validation

## Common Gotchas

1. **Forgetting to trim strings**: Use `.trim()` to remove leading/trailing whitespace
2. **Using parse() instead of safeParse()**: parse() throws, safeParse() returns result
3. **Not handling nested errors**: Use `error.issues` array for all validation failures
4. **Missing type inference**: Use `z.infer<typeof Schema>` for TypeScript types
5. **Validating after use**: Always validate BEFORE using the data (fail fast)

## Resources

- Official Zod docs: https://zod.dev/
- Error handling: https://zod.dev/?id=error-handling
- Custom validation: https://zod.dev/?id=refine
