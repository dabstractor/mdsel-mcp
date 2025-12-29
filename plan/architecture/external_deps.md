# External Dependencies

## Runtime Dependencies

### @modelcontextprotocol/sdk (^1.25.1)
Official MCP SDK for TypeScript/Node.js.

**Usage:**
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

**Key Patterns:**
- `new Server({ name, version })` - Create server instance
- `server.tool(name, schema, handler)` - Define tools
- `new StdioServerTransport()` - stdio transport
- `server.connect(transport)` - Start server

### zod (^3.25)
Runtime schema validation (peer dependency of MCP SDK).

**Usage:**
```typescript
import { z } from "zod";

// Tool parameter schemas
const filesSchema = z.array(z.string()).describe("Markdown file paths");
const selectorSchema = z.string().describe("mdsel selector string");
```

## Dev Dependencies

### typescript (^5.0)
TypeScript compiler.

### @types/node (^22.0)
Node.js type definitions.

## External CLI Tool

### mdsel (v1.0.0)
Must be available in PATH or installed globally.

**CLI Interface:**
```bash
# Index command
mdsel index --json <files...>
# Output: JSON with document structure

# Select command
mdsel select --json [--full] <selector> [files...]
# Output: JSON with matched content
```

**JSON Output Structure:**

Index success:
```json
{
  "success": true,
  "command": "index",
  "timestamp": "ISO-8601",
  "data": {
    "documents": [...],
    "summary": {...}
  }
}
```

Select success:
```json
{
  "success": true,
  "command": "select",
  "timestamp": "ISO-8601",
  "data": {
    "matches": [...],
    "unresolved": [...]
  }
}
```

Error:
```json
{
  "success": false,
  "command": "...",
  "timestamp": "ISO-8601",
  "data": null,
  "errors": [...]
}
```
