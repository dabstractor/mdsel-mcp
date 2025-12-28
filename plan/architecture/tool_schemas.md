# MCP Tool Schemas: mdsel-mcp

## Tool: mdsel.index

### Purpose
Return a selector inventory for one or more Markdown documents.

### MCP Schema

```json
{
  "name": "mdsel.index",
  "description": "Generate a selector inventory for Markdown documents. Returns all available selectors (headings, blocks) that can be used with mdsel.select. Each document is assigned a namespace derived from its filename (e.g., 'README.md' → 'readme').",
  "inputSchema": {
    "type": "object",
    "properties": {
      "files": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Absolute paths to Markdown files to index"
      }
    },
    "required": ["files"]
  }
}
```

### CLI Mapping

```
MCP: mdsel.index({ files: ["/path/to/doc.md", "/path/to/other.md"] })
CLI: mdsel index --json /path/to/doc.md /path/to/other.md
```

### Expected Output

```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-12-27T00:00:00.000Z",
  "data": {
    "documents": [
      {
        "namespace": "doc",
        "file_path": "/path/to/doc.md",
        "headings": [...],
        "blocks": {...}
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 16,
      "total_selectors": 16
    }
  }
}
```

---

## Tool: mdsel.select

### Purpose
Retrieve document content via selectors.

### MCP Schema

```json
{
  "name": "mdsel.select",
  "description": "Select content from Markdown documents using selectors. Selectors follow the pattern: [namespace::]type[index][/path][?query]. Examples: 'heading:h1[0]' (first h1), 'readme::h2[1]' (second h2 in readme), 'h2[0]/code[0]' (first code block under first h2). Use '?full=true' to bypass truncation.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "selector": {
        "type": "string",
        "description": "Selector expression. Format: [namespace::]type[index][/path][?query]. Types: heading:h1-h6 (or h1-h6), block:paragraph (or para), block:code (or code), block:list (or list), block:table (or table), block:blockquote (or quote), root, section."
      },
      "files": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Absolute paths to Markdown files to search"
      }
    },
    "required": ["selector", "files"]
  }
}
```

### CLI Mapping

```
MCP: mdsel.select({ selector: "heading:h2[0]", files: ["/path/to/doc.md"] })
CLI: mdsel select --json "heading:h2[0]" /path/to/doc.md
```

### Expected Output

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-12-27T00:00:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "heading:h2.0",
        "type": "section",
        "content": "## First Section\n\nContent here.",
        "truncated": false,
        "children_available": [...]
      }
    ],
    "unresolved": []
  }
}
```

---

## Selector Grammar Reference

### Syntax

```
[namespace::]type[index][/path][?query]
```

### Components

| Component | Required | Description | Example |
|-----------|----------|-------------|---------|
| namespace | No | Document identifier (derived from filename) | `readme::` |
| type | Yes | Node type to select | `heading:h2`, `code` |
| index | No | 0-based ordinal among siblings | `[0]`, `[3]` |
| path | No | Nested path segments | `/code[0]` |
| query | No | Query parameters | `?full=true` |

### Node Types

| Full Form | Shorthand | Description |
|-----------|-----------|-------------|
| `heading:h1` - `heading:h6` | `h1` - `h6` | Heading levels |
| `block:paragraph` | `para` | Paragraphs |
| `block:code` | `code` | Code blocks |
| `block:list` | `list` | Lists |
| `block:table` | `table` | Tables |
| `block:blockquote` | `quote` | Blockquotes |
| `root` | - | Document root |
| `section` | - | Section (heading + content) |

---

## MCP Response Format

### Success Response

```typescript
{
  content: [
    {
      type: "text",
      text: "<mdsel JSON output verbatim>"
    }
  ]
}
```

### Error Response

```typescript
{
  isError: true,
  content: [
    {
      type: "text",
      text: "<mdsel stderr or error JSON>"
    }
  ]
}
```

The MCP server MUST NOT modify mdsel output. It is a transparent passthrough.
