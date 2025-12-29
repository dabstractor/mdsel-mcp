# MCP Inspector / Client Session Documentation

**Date**: 2025-12-29
**Test Method**: Automated E2E Test Suite (MCP SDK Client)
**Transport**: stdio

## Connection Details

**Server Command**:
```bash
node dist/index.js
```

**Transport**: StdioServerTransport
**Environment**: `NO_COLOR=1` (to prevent ANSI corruption in JSON-RPC)

## Connection Process

### 1. Server Startup

The server is started by executing the compiled JavaScript binary:

```bash
node /home/dustin/projects/mdsel-mcp-glm/dist/index.js
```

The server immediately begins listening for JSON-RPC messages on stdin and writes responses to stdout.

### 2. Client Connection

The test client connects using the MCP SDK's StdioClientTransport:

```typescript
const transport = new StdioClientTransport({
  command: "node",
  args: [SERVER_PATH],
  env: { ...process.env, NO_COLOR: "1" }
});

const client = new Client({
  name: "mdsel-mcp-test-client",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(transport);
```

**Result**: Connection established successfully on first attempt.

---

## Tool Discovery

### ListTools Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

### ListTools Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "mdsel.index",
        "description": "Index Markdown documents to discover available selectors for content retrieval. Returns a compact text inventory of all addressable content chunks including headings, paragraphs, code blocks, lists, and tables.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "files": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Markdown file paths to index",
              "minItems": 1
            }
          },
          "required": ["files"]
        }
      },
      {
        "name": "mdsel.select",
        "description": "Retrieve Markdown content via declarative selectors. Uses mdsel selector grammar to extract specific document sections, headings, code blocks, paragraphs, lists, and tables. Returns matched content as compact text.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "selector": {
              "type": "string",
              "description": "mdsel selector string (e.g., 'h1.0', 'h2.0/code.0', 'h1.0/h2.1')"
            },
            "files": {
              "type": "array",
              "items": { "type": "string" },
              "description": "Optional Markdown file paths to search"
            },
            "full": {
              "type": "boolean",
              "description": "Bypass truncation and return full content"
            }
          },
          "required": ["selector"]
        }
      }
    ]
  }
}
```

**Validation**: Both tools are correctly registered with proper schemas matching `src/index.ts` definitions.

---

## Tool Execution Examples

### Example 1: mdsel.index

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "mdsel.index",
    "arguments": {
      "files": ["plan/P1M5T1/research/test_simple.md"]
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "h1.0 Test Document\n h2.0 Installation\n h2.1 Quick Start\n h2.2 Features\n---\ncode:2 para:4 list:1"
      }
    ]
  }
}
```

### Example 2: mdsel.select

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "mdsel.select",
    "arguments": {
      "selector": "h1.0",
      "files": ["plan/P1M5T1/research/test_simple.md"]
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# Test Document\n\nThis is a simple test document for mdsel-mcp E2E validation.\n\n..."
      }
    ]
  }
}
```

### Example 3: mdsel.select with --full flag

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "mdsel.select",
    "arguments": {
      "selector": "h2.0",
      "files": ["plan/P1M5T1/research/test_complex.md"],
      "full": true
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "## Heading Levels\n\n### Heading 3\n\n#### Heading 4\n\n##### Heading 5\n\n###### Heading 6"
      }
    ]
  }
}
```

---

## Error Handling Examples

### Example 1: Invalid Selector

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "tools/call",
  "params": {
    "name": "mdsel.select",
    "arguments": {
      "selector": "h1.999",
      "files": ["plan/P1M5T1/research/test_simple.md"]
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "!heading:h1[999]\nNo matches found in any document"
      }
    ]
  }
}
```

**Note**: mdsel outputs error messages to stdout, which are correctly passed through to the MCP client.

### Example 2: Schema Validation Error

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "tools/call",
  "params": {
    "name": "mdsel.index",
    "arguments": {
      "files": []
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "error": {
    "code": -32603,
    "message": "Invalid arguments for mdsel.index: At least one file must be specified"
  }
}
```

**Note**: Zod schema validation catches invalid input before executing mdsel.

---

## Protocol Compliance

The server correctly implements the Model Context Protocol:

- [x] JSON-RPC 2.0 message format
- [x] `tools/list` method with proper schema
- [x] `tools/call` method with argument validation
- [x] Proper error responses (both mdsel errors and schema validation errors)
- [x] Stdio transport handling
- [x] NO_COLOR environment variable for clean output

---

## Notes

1. **Transport**: The server uses stdio transport only. HTTP/SSE transport is not implemented per PRD requirements.

2. **Timeout**: The server implements a 30-second timeout for mdsel subprocess execution (see `src/index.ts:36-46`).

3. **Statelessness**: Each tool call is independent. No caching or state is maintained between calls.

4. **Output Fidelity**: The server returns raw mdsel output without modification or interpretation, ensuring byte-for-byte fidelity to the CLI.
