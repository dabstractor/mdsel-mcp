# MCP Tool Implementation Patterns Research

## Overview

This document researches implementation patterns for building MCP (Model Context Protocol) tools using the @modelcontextprotocol/sdk TypeScript library, focusing on tool registration, parameter validation with Zod, and best practices for tool design.

## 1. How to Define/Register Tools with the MCP Server

### Basic Server Setup

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: "my-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // Enable tools capability
    },
  }
);
```

### Tool Registration Pattern

Tools are registered by implementing the `ListTools` and `CallTool` request handlers:

```typescript
// Import request schemas
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// Register the ListTools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "file_search",
      description: "Search for files in the project directory matching patterns",
      inputSchema: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "Glob pattern to search for files",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return",
            default: 10,
          },
        },
        required: ["pattern"],
      },
    },
    {
      name: "execute_command",
      description: "Execute a shell command and capture its output",
      inputSchema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The command to execute",
          },
          timeout: {
            type: "number",
            description: "Timeout in milliseconds",
            default: 30000,
          },
        },
        required: ["command"],
      },
    },
  ],
}));

// Register the CallTool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "file_search":
      return handleFileSearch(args);
    case "execute_command":
      return handleExecuteCommand(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

## 2. Using Zod for Parameter Schemas

### Why Use Zod for MCP Tools?

While MCP tools can use JSON Schema directly, using Zod provides:
- Type-safe parameter validation
- Better error messages
- Runtime type checking
- Easier schema definition

### Zod Integration Pattern

```typescript
import { z } from 'zod';

// Define Zod schemas for each tool
const FileSearchSchema = z.object({
  pattern: z.string().describe("Glob pattern to search for files"),
  maxResults: z.number().min(1).max(100).default(10).describe("Maximum number of results"),
});

const ExecuteCommandSchema = z.object({
  command: z.string().min(1).describe("The command to execute"),
  timeout: z.number().min(1000).max(300000).default(30000).describe("Timeout in milliseconds"),
});

// Convert Zod schemas to JSON Schema for MCP
const fileSearchSchema = {
  type: "object",
  properties: {
    pattern: { type: "string", description: FileSearchSchema.shape.pattern.description },
    maxResults: {
      type: "number",
      description: FileSearchSchema.shape.maxResults.description,
      default: FileSearchSchema.shape.maxResults.defaultValue()
    },
  },
  required: ["pattern"],
} as const;

// Updated tool registration with Zod
const tools: Tool[] = [
  {
    name: "file_search",
    description: "Search for files in the project directory matching patterns",
    inputSchema: fileSearchSchema,
  },
  {
    name: "execute_command",
    description: "Execute a shell command and capture its output",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: ExecuteCommandSchema.shape.command.description },
        timeout: {
          type: "number",
          description: ExecuteCommandSchema.shape.timeout.description,
          default: ExecuteCommandSchema.shape.timeout.defaultValue()
        },
      },
      required: ["command"],
    } as const,
  },
];

// Tool handler with Zod validation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "file_search": {
      const parsed = FileSearchSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for file_search: ${parsed.error.message}`);
      }
      return handleFileSearch(parsed.data);
    }

    case "execute_command": {
      const parsed = ExecuteCommandSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments for execute_command: ${parsed.error.message}`);
      }
      return handleExecuteCommand(parsed.data);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

### Advanced Zod Patterns

```typescript
// Union types for different command types
const CommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("bash"),
    command: z.string(),
    cwd: z.string().optional(),
    env: z.record(z.string()).optional(),
  }),
  z.object({
    type: z.literal("npm"),
    script: z.string(),
    workspace: z.string().optional(),
  }),
]);

// Optional with default values
const ToolConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean().default(true),
  rateLimit: z.object({
    requests: z.number().default(10),
    windowMs: z.number().default(60000),
  }).optional(),
});

// Array validation
const FileListSchema = z.array(z.object({
  path: z.string(),
  size: z.number(),
  modified: z.string(),
})).max(100);
```

## 3. The server.tool() Method Signature and Pattern

### Alternative Tool Registration Method

Some MCP implementations provide a helper method for cleaner tool registration:

```typescript
// If available in your MCP SDK version
server.tool(
  "file_search",
  "Search for files in the project directory matching patterns",
  {
    pattern: {
      type: "string",
      description: "Glob pattern to search for files",
    },
    maxResults: {
      type: "number",
      description: "Maximum number of results",
      default: 10,
    },
  },
  async (args) => {
    // Validate args with Zod
    const parsed = FileSearchSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    // Implementation
    const files = await searchFiles(parsed.data.pattern, parsed.data.maxResults);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(files, null, 2),
        },
      ],
    };
  }
);
```

### Tool Handler Signature

```typescript
async function handleFileSearch(args: { pattern: string; maxResults?: number }) {
  // Implementation with proper error handling
  try {
    const results = await glob(args.pattern, {
      maxMatches: args.maxResults || 10,
      ignore: ["node_modules/**", ".git/**"],
    });

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} files:\n${results.join("\n")}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error searching files: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
```

## 4. How to Format Tool Responses

### Response Format Types

MCP tools can return responses in different formats:

```typescript
// Text response (most common)
{
  content: [
    {
      type: "text",
      text: "Command executed successfully",
    },
  ],
}

// JSON response
{
  content: [
    {
      type: "json",
      json: {
        files: ["file1.txt", "file2.js"],
        count: 2,
      },
    },
  ],
}

// Error response
{
  content: [
    {
      type: "text",
      text: "Error: File not found",
    },
  ],
  isError: true,
}

// Multiple content types
{
  content: [
    {
      type: "text",
      text: "Found files:",
    },
    {
      type: "json",
      json: fileResults,
    },
    {
      type: "image",
      data: "base64-encoded-image",
      mimeType: "image/png",
    },
  ],
}
```

### Response Patterns

```typescript
// Success response pattern
function createSuccessResponse(text: string): ToolResult {
  return {
    content: [{ type: "text", text }],
  };
}

// Error response pattern
function createErrorResponse(error: Error | string): ToolResult {
  return {
    content: [{
      type: "text",
      text: `Error: ${error instanceof Error ? error.message : String(error)}`
    }],
    isError: true,
  };
}

// Structured response pattern
function createJsonResponse<T>(data: T): ToolResult {
  return {
    content: [{ type: "json", json: data }],
  };
}

// Multi-part response pattern
function createMultiResponse(parts: Content[]): ToolResult {
  return {
    content: parts,
  };
}
```

## 5. Best Practices for Tool Naming and Descriptions

### Tool Naming Conventions

```typescript
// Good tool names
const wellNamedTools: Tool[] = [
  {
    name: "search_files",           // snake_case, descriptive
    description: "Search for files matching glob patterns",
  },
  {
    name: "execute_command",        // clear action
    description: "Execute a shell command in the current directory",
  },
  {
    name: "read_file",              // simple verb
    description: "Read the contents of a file",
  },
  {
    name: "list_projects",          // plural for lists
    description: "List all available projects",
  },
];

// Avoid these names
const poorNamedTools: Tool[] = [
  {
    name: "do_stuff",               // too vague
    description: "Does some stuff",
  },
  {
    name: "cmd",                    // too short/ambiguous
    description: "Command execution",
  },
  {
    name: "fileHandler",            // not action-oriented
    description: "Handles file operations",
  },
  {
    name: "get_read_file_data",     // redundant
    description: "Gets file data",
  },
];
```

### Description Best Practices

```typescript
// Good descriptions
const goodDescriptions = {
  file_search: {
    description: "Search for files in the project directory using glob patterns like '**/*.ts' or 'src/**/*'. Returns absolute paths to matching files.",
  },
  execute_command: {
    description: "Execute a shell command in the current working directory. Use for running build tools, tests, or system commands. Timeout after 30 seconds by default.",
  },
  read_file: {
    description: "Read the complete contents of a file. Use for reading source code, configuration files, or text documents. Returns file content as plain text.",
  },
  git_status: {
    description: "Get the current git repository status including modified files, untracked files, and branch information. Equivalent to running 'git status'.",
  },
};

// Bad descriptions
const badDescriptions = {
  file_search: {
    description: "Search files",  // too brief
  },
  execute_command: {
    description: "Run commands",   // vague
  },
  read_file: {
    description: "Get file",        // unclear
  },
};
```

### Complete Tool Example

```typescript
const highQualityTool: Tool = {
  name: "analyze_code_quality",
  description: "Analyze code quality metrics for a directory including cyclomatic complexity, code coverage, and linting issues. Supports JavaScript, TypeScript, and Python projects.",
  inputSchema: {
    type: "object",
    properties: {
      directory: {
        type: "string",
        description: "Directory path to analyze (default: current directory)",
        default: ".",
      },
      tools: {
        type: "array",
        items: {
          type: "string",
          enum: ["eslint", "sonarqube", "complexity", "coverage"],
        },
        description: "Quality analysis tools to run",
        default: ["eslint", "complexity"],
      },
      exclude: {
        type: "array",
        items: { type: "string" },
        description: "Glob patterns to exclude from analysis",
        default: ["node_modules/**", "dist/**", "build/**"],
      },
    },
    required: [],
  },
};
```

## 6. Example Implementations from Official MCP Templates

### Example 1: File System Server

```typescript
// File system MCP server implementation
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const server = new Server(
  {
    name: "filesystem-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Zod schemas
const ReadFileSchema = z.object({
  path: z.string().describe("Absolute or relative path to the file"),
});

const ListDirectorySchema = z.object({
  path: z.string().describe("Absolute or relative path to the directory"),
  recursive: z.boolean().default(false).describe("List files recursively"),
});

// Tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "read_file",
      description: "Read the contents of a file",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: ReadFileSchema.shape.path.description },
        },
        required: ["path"],
      },
    },
    {
      name: "list_directory",
      description: "List the contents of a directory",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: ListDirectorySchema.shape.path.description },
          recursive: {
            type: "boolean",
            description: ListDirectorySchema.shape.recursive.description,
            default: ListDirectorySchema.shape.recursive.defaultValue()
          },
        },
        required: ["path"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "read_file": {
      const parsed = ReadFileSchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments: ${parsed.error.message}`);
      }

      try {
        const content = await fs.readFile(parsed.data.path, 'utf8');
        return {
          content: [{ type: "text", text: content }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error reading file: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }

    case "list_directory": {
      const parsed = ListDirectorySchema.safeParse(args);
      if (!parsed.success) {
        throw new Error(`Invalid arguments: ${parsed.error.message}`);
      }

      try {
        const items = await fs.readdir(parsed.data.path, { withFileTypes: true });
        const listing = items.map(item => ({
          name: item.name,
          type: item.isDirectory() ? "directory" : "file",
          path: path.join(parsed.data.path, item.name),
        }));

        return {
          content: [{ type: "json", json: listing }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error listing directory: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);
```

### Example 2: Git Operations Server

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const GitOperationsSchema = z.object({
  operation: z.enum([
    "status",
    "log",
    "diff",
    "branch",
    "commit",
    "push"
  ]),
  args: z.array(z.string()).default([]),
  cwd: z.string().optional(),
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "git_command") {
    const parsed = GitOperationsSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    const { operation, args: gitArgs, cwd } = parsed.data;
    const command = `git ${operation} ${gitArgs.join(' ')}`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: cwd || process.cwd(),
        timeout: 30000,
      });

      return {
        content: [{ type: "text", text: stdout || stderr }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Git command failed: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

### Example 3: Web Scraping Server

```typescript
import fetch from 'node-fetch';

const WebScrapeSchema = z.object({
  url: z.string().url().describe("URL to scrape"),
  selector: z.string().optional().describe("CSS selector to extract specific elements"),
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "scrape_web") {
    const parsed = WebScrapeSchema.safeParse(args);
    if (!parsed.success) {
      throw new Error(`Invalid arguments: ${parsed.error.message}`);
    }

    try {
      const response = await fetch(parsed.data.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      if (parsed.data.selector) {
        // Simple selector implementation (would need cheerio or similar in production)
        const extractedContent = extractContentWithSelector(html, parsed.data.selector);
        return {
          content: [{ type: "text", text: extractedContent }],
        };
      } else {
        return {
          content: [{ type: "text", text: html.substring(0, 5000) + '...' }],
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Failed to scrape web page: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

## 7. Error Handling Patterns

### Comprehensive Error Handling

```typescript
// Custom error types
class MCPToolError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "MCPToolError";
  }
}

class ValidationError extends MCPToolError {
  constructor(message: string, details?: z.ZodError) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

class ExecutionError extends MCPToolError {
  constructor(message: string, details?: unknown) {
    super(message, "EXECUTION_ERROR", details);
    this.name = "ExecutionError";
  }
}

// Error handler utility
function createToolError(
  error: unknown,
  toolName: string
): { content: Content[]; isError: true } {
  if (error instanceof MCPToolError) {
    return {
      content: [{
        type: "text",
        text: `[${toolName}] ${error.code}: ${error.message}`,
      }],
      isError: true,
    };
  }

  if (error instanceof z.ZodError) {
    return {
      content: [{
        type: "text",
        text: `[${toolName}] Validation Error: ${error.errors.map(e => e.message).join(', ')}`,
      }],
      isError: true,
    };
  }

  return {
    content: [{
      type: "text",
      text: `[${toolName}] Unexpected Error: ${error instanceof Error ? error.message : String(error)}`,
    }],
    isError: true,
  };
}

// Tool handler with comprehensive error handling
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "sensitive_operation": {
        // Validate input
        const parsed = SomeSchema.safeParse(args);
        if (!parsed.success) {
          throw new ValidationError("Invalid input parameters", parsed.error);
        }

        // Check permissions
        if (!hasPermission("sensitive_operation")) {
          throw new ExecutionError("Permission denied", { operation: name });
        }

        // Execute with timeout
        const result = await Promise.race([
          performSensitiveOperation(parsed.data),
          new Promise((_, reject) =>
            setTimeout(() => reject(new ExecutionError("Operation timed out")), 10000)
          )
        ]);

        return createSuccessResponse(JSON.stringify(result, null, 2));
      }

      // ... other tool cases
    }
  } catch (error) {
    return createToolError(error, name);
  }
});
```

## 8. Testing Patterns

### Tool Testing Strategy

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('MCP Tool Tests', () => {
  let server: Server;

  beforeEach(() => {
    server = createTestServer();
  });

  afterEach(() => {
    // Cleanup server
  });

  describe('file_search tool', () => {
    it('should search for files with valid pattern', async () => {
      const request = {
        method: "tools/call",
        params: {
          name: "file_search",
          arguments: {
            pattern: "**/*.ts",
            maxResults: 5,
          },
        },
      };

      const response = await server.request(request);
      expect(response.content).toBeArray();
      expect(response.content[0].type).toBe("text");
    });

    it('should reject invalid pattern', async () => {
      const request = {
        method: "tools/call",
        params: {
          name: "file_search",
          arguments: {
            pattern: null, // Invalid
          },
        },
      };

      await expect(server.request(request)).rejects.toThrow();
    });
  });
});
```

## 9. Performance and Optimization

### Tool Performance Patterns

```typescript
// Caching for expensive operations
const cache = new Map<string, { data: unknown; timestamp: number }>();

const CACHE_TTL = 60000; // 1 minute

async function cachedFetch(key: string, fetchFn: () => Promise<unknown>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Rate limiting
const rateLimits = new Map<string, { count: number; reset: number }>();

function checkRateLimit(toolName: string, userId: string): boolean {
  const key = `${toolName}:${userId}`;
  const now = Date.now();
  const limit = rateLimits.get(key);

  if (!limit || now > limit.reset) {
    rateLimits.set(key, { count: 1, reset: now + 60000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

// Tool handler with optimizations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Check rate limit
  if (!checkRateLimit(name, request.userId || "anonymous")) {
    return {
      content: [{ type: "text", text: "Rate limit exceeded. Please try again later." }],
      isError: true,
    };
  }

  // Use cache for expensive operations
  if (name === "expensive_operation") {
    const cacheKey = JSON.stringify(args);
    const result = await cachedFetch(cacheKey, () => performExpensiveOperation(args));
    return createJsonResponse(result);
  }

  // ... other tool handling
});
```

## Conclusion

This research document covers the essential patterns for implementing MCP tools using TypeScript and the @modelcontextprotocol/sdk. Key takeaways:

1. **Use Zod for validation**: Provides type safety and better error messages than raw JSON Schema
2. **Follow consistent naming**: Use snake_case with clear, descriptive names
3. **Write detailed descriptions**: Help users understand what each tool does
4. **Handle errors gracefully**: Use the isError flag and provide clear error messages
5. **Structure responses appropriately**: Choose between text, json, or mixed content types
6. **Implement best practices**: Include rate limiting, caching, and proper error handling
7. **Test thoroughly**: Validate both success and error cases

For the most current information, always refer to the official MCP TypeScript SDK documentation and examples.