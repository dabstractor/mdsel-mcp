# MCP Server CLI Tool Wrapper Research

## Introduction

This research document examines common patterns and implementation strategies for MCP (Model Context Protocol) servers that wrap CLI tools. Based on analysis of existing implementations and known patterns, this guide provides insights into building robust CLI wrapper MCP servers.

## 1. Examples of MCP Servers that Wrap CLI Tools

### 1.1 Known MCP CLI Wrapper Implementations

#### MDSel MCP Server (Current Project)
- **Purpose**: Wraps the `mdsel` CLI tool for document selection
- **Repository**: [Current project structure](/home/dustin/projects/mdsel-mcp-glm/src/index.ts)
- **Key Features**:
  - Subprocess execution with timeout handling
  - Graceful shutdown
  - Color code management for JSON-RPC compatibility

#### Git MCP Server (Hypothetical/Pattern Analysis)
While `git-mcp-server` specific implementation details are limited based on current search constraints, Git MCP servers would typically:
- Wrap common Git commands (`git status`, `git log`, `git diff`, etc.)
- Handle repository state management
- Provide structured output for Git operations

#### SQLite MCP Server
- **Purpose**: Wraps SQLite CLI for database operations
- **Pattern**: Executes `sqlite3` commands with structured input/output
- **Features**: Parameterized queries, result formatting

#### HTTP Fetch MCP Server
- **Purpose**: Wraps curl or fetch for HTTP operations
- **Pattern**: Transforms MCP tool calls to HTTP requests
- **Features**: Header management, response parsing

### 1.2 Common CLI Tool Categories
1. **Version Control Tools** (git, hg, svn)
2. **Database Tools** (sqlite, mysql, postgresql)
3. **Build Tools** (npm, yarn, cargo, make)
4. **Development Tools** (eslint, prettier, jest)
5. **System Tools** (docker, kubectl, aws-cli)

## 2. Subprocess Execution Patterns

### 2.1 Basic Subprocess Execution

```typescript
import { spawn } from "child_process";

async function executeCommand(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}
```

### 2.2 Advanced Subprocess Execution (from mdsel-mcp)

```typescript
async function executeMdsel(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("mdsel", args, {
      env: { ...process.env, NO_COLOR: "1" }
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
    proc.on("close", (code) => {
      cleanup();
      if (timedOut) return;
      // Return stdout regardless of exit code
      // CLI tool outputs valid JSON even on errors
      resolve(stdout);
    });

    proc.on("error", (err) => {
      cleanup();
      reject(err);
    });
  });
}
```

### 2.3 Key Subprocess Execution Patterns

1. **Timeout Management**: Essential for preventing hanging processes
2. **Signal Handling**: Proper SIGTERM/SIGKILL sequence for graceful termination
3. **Stream Management**: Accumulating stdout/stderr without memory leaks
4. **Environment Control**: Setting environment variables (e.g., NO_COLOR)
5. **Exit Code Handling**: Differentiating between success and error conditions

## 3. Tool Response Formatting

### 3.1 Zod Schema for Tool Definitions

```typescript
import { z } from "zod";
import {
  Tool,
  ToolInputSchema,
  ToolOutputSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Define tool input schema
const selectInputSchema = ToolInputSchema({
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "Search query for document selection"
    },
    limit: {
      type: "number",
      description: "Maximum number of results to return",
      default: 10
    },
    threshold: {
      type: "number",
      description: "Similarity threshold (0-1)",
      default: 0.5
    }
  },
  required: ["query"]
});

// Define tool
const selectTool: Tool = {
  name: "select",
  description: "Select documents using mdsel CLI",
  inputSchema: selectInputSchema
};
```

### 3.2 Response Formatting Patterns

#### Pattern 1: JSON Output (Recommended)
```typescript
// CLI tool outputs JSON directly
const result = await executeCommand("mdsel", ["select", "--json", query]);
return JSON.parse(result);
```

#### Pattern 2: Structured Text Parsing
```typescript
// Parse structured text output
const result = await executeCommand("tool", args);
const parsed = parseStructuredOutput(result); // Custom parser
return {
  items: parsed.items,
  metadata: {
    total: parsed.total,
    command: `tool ${args.join(" ")}`
  }
};
```

#### Pattern 3: Stream Processing
```typescript
// Process streaming output
const result = await executeCommand("tool", ["--stream"]);
const lines = result.split("\n");
return lines
  .filter(line => line.trim())
  .map(line => JSON.parse(line));
```

## 4. Error Handling Patterns

### 4.1 Error Classification

```typescript
class ToolError extends Error {
  constructor(
    message: string,
    public code: string,
    public exitCode?: number,
    public stderr?: string
  ) {
    super(message);
    this.name = "ToolError";
  }
}

async function executeWithRetry(command: string, args: string[], maxRetries = 3): Promise<string> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await executeCommand(command, args);
    } catch (error) {
      lastError = error;

      // Retry only for specific error types
      if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") {
        continue;
      }
      throw error;
    }
  }

  throw lastError!;
}
```

### 4.2 Error Response Mapping

```typescript
// Map CLI errors to MCP error responses
function mapToolError(error: Error): ToolOutputSchema {
  if (error instanceof ToolError) {
    switch (error.code) {
      case "ENOENT":
        return {
          content: [
            {
              type: "text",
              text: `Command not found: ${error.message}`
            }
          ],
          isError: true
        };
      case "ETIMEDOUT":
        return {
          content: [
            {
              type: "text",
              text: `Command timed out: ${error.message}`
            }
          ],
          isError: true
        };
      default:
        return {
          content: [
            {
              type: "text",
              text: `Command failed: ${error.message}\n${error.stderr || ""}`
            }
          ],
          isError: true
        };
    }
  }

  // Generic error
  return {
    content: [
      {
        type: "text",
        text: `Unexpected error: ${error.message}`
      }
    ],
    isError: true
  };
}
```

### 4.3 Graceful Degradation

```typescript
async function executeWithFallback(
  primaryCommand: string[],
  fallbackCommand: string[]
): Promise<ToolOutputSchema> {
  try {
    const result = await executeCommand(primaryCommand[0], primaryCommand.slice(1));
    return {
      content: [{ type: "text", text: result }]
    };
  } catch (error) {
    // Try fallback
    try {
      const result = await executeCommand(fallbackCommand[0], fallbackCommand.slice(1));
      return {
        content: [{ type: "text", text: result }],
        warnings: ["Using fallback command due to primary command failure"]
      };
    } catch (fallbackError) {
      return mapToolError(fallbackError);
    }
  }
}
```

## 5. Git MCP Server Implementation Patterns

### 5.1 Git Command Wrapping

```typescript
const gitTools: Tool[] = [
  {
    name: "git_status",
    description: "Get git repository status",
    inputSchema: ToolInputSchema({
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Repository path (default: current directory)"
        }
      }
    })
  },
  {
    name: "git_log",
    description: "Get git commit history",
    inputSchema: ToolInputSchema({
      type: "object",
      properties: {
        path: { type: "string" },
        limit: { type: "number", default: 10 },
        since: { type: "string" },
        until: { type: "string" }
      }
    })
  }
];
```

### 5.2 Git Repository State Management

```typescript
class GitRepository {
  private repoPath: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  async getStatus(): Promise<any> {
    const cacheKey = "status";
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached.data;
    }

    const result = await executeCommand("git", ["status", "--porcelain"], this.repoPath);
    const status = parseGitStatus(result);

    this.cache.set(cacheKey, { data: status, timestamp: Date.now() });
    return status;
  }
}
```

## 6. Best Practices for CLI Wrapper MCP Servers

### 6.1 Performance Optimization

1. **Caching**: Implement intelligent caching for expensive operations
2. **Lazy Loading**: Load tools only when needed
3. **Parallel Execution**: Support concurrent command execution
4. **Output Streaming**: Stream large outputs when possible

### 6.2 Security Considerations

1. **Input Sanitization**: Validate and sanitize all user inputs
2. **Path Validation**: Restrict file system access to safe directories
3. **Command Escaping**: Prevent command injection
4. **Rate Limiting**: Implement rate limiting for expensive operations

### 6.3 Reliability Patterns

1. **Idempotency**: Design tools to be safely retryable
2. **Circuit Breakers**: Automatically fail fast on repeated failures
3. **Health Checks**: Implement tool availability checks
4. **Logging**: Comprehensive logging for debugging

## 7. Implementation Template

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { spawn } from "child_process";
import { z } from "zod";
import { Tool, ToolInputSchema, ToolOutputSchema } from "@modelcontextprotocol/sdk/types.js";

class CLIMCPServer {
  private server: Server;
  private toolCache = new Map<string, any>();

  constructor(name: string, version: string) {
    this.server = new Server({ name, version }, { capabilities: { tools: {} } });
    this.setupToolHandlers();
  }

  private async executeCommand(
    command: string,
    args: string[],
    options: { timeout?: number; cwd?: string } = {}
  ): Promise<string> {
    // Implementation with timeout, cleanup, etc.
  }

  private setupToolHandlers() {
    // Register tool handlers
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Usage
const server = new CLIMCPServer("my-tool-mcp", "1.0.0");
await server.start();
```

## 8. Conclusion

Building MCP servers that wrap CLI tools requires careful attention to:

1. **Subprocess Management**: Proper timeout, cleanup, and error handling
2. **Tool Definition**: Clear schemas and documentation
3. **Response Formatting**: Structured, predictable output
4. **Error Handling**: Graceful degradation and meaningful error messages
5. **Performance**: Caching and optimization strategies

The mdsel-mcp implementation demonstrates many of these patterns, particularly around subprocess execution with proper timeout handling and cleanup. By following these patterns, developers can create robust CLI wrapper MCP servers that provide reliable tool access to AI systems.

## Further Research

To continue this research, the following resources should be explored:

1. [MCP Specification](https://github.com/modelcontextprotocol/specification)
2. [MCP Server Examples](https://github.com/modelcontextprotocol/server-examples)
3. [Tool Pattern Documentation](https://docs.modelcontextprotocol.org/)
4. Community implementations in the MCP ecosystem

Note: Due to search limitations at the time of this research, some specific implementation details (particularly git-mcp-server) may need to be supplemented with additional research when web access is available.