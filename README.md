# mdsel-mcp

MCP server for mdsel CLI - declarative Markdown selection.

## Overview

mdsel-mcp is a Model Context Protocol server that exposes the `mdsel` CLI as MCP tools. It enables MCP-compatible AI agents to perform selector-based content retrieval from Markdown documents.

The server is a thin wrapper that translates MCP tool calls into `mdsel` CLI invocations and returns results unchanged.

## Requirements

- Node.js >= 18.0.0
- mdsel CLI installed globally or available via npx
- An MCP-compatible client (Claude Desktop, VS Code, Cursor, Windsurf, etc.)

## Installation

### Installing mdsel CLI

The mdsel CLI is a peer dependency and must be installed separately:

```bash
npm install -g mdsel
```

### Running the Server

The mdsel-mcp server runs via npx without requiring global installation:

```bash
npx mdsel-mcp
```

## Configuration

### Claude Desktop

Add to your Claude Desktop MCP configuration file:

```json
{
  "mcpServers": {
    "mdsel": {
      "command": "npx",
      "args": ["-y", "mdsel-mcp@latest"]
    }
  }
}
```

### VS Code

Add to your VS Code settings for MCP-compatible extensions:

```json
{
  "mcp.servers": {
    "mdsel": {
      "command": "npx",
      "args": ["-y", "mdsel-mcp@latest"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "mdsel": {
      "command": "npx",
      "args": ["-y", "mdsel-mcp@latest"]
    }
  }
}
```

### Windsurf

Configure in your Windsurf MCP settings:

```json
{
  "mcpServers": {
    "mdsel": {
      "command": "npx",
      "args": ["-y", "mdsel-mcp@latest"]
    }
  }
}
```

## Tools

### mdsel.index

Generate a selector inventory for Markdown documents. Returns all available selectors (headings, blocks) for use with mdsel.select. Each document gets a namespace from its filename (e.g., 'README.md' → 'readme'). Output includes heading tree and block counts (code, para, list, table, quote).

**Parameters:**
- `files` (array of strings, required): Absolute paths to Markdown files to index

**Example:**

```json
{
  "name": "mdsel.index",
  "arguments": {
    "files": ["/absolute/path/to/document.md"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-12-28T00:16:19.299Z",
  "data": {
    "documents": [
      {
        "namespace": "document",
        "file_path": "/absolute/path/to/document.md",
        "headings": [
          {
            "selector": "document::h1.0",
            "type": "h1",
            "depth": 1,
            "text": "Document Title"
          }
        ],
        "blocks": {
          "code": 2,
          "para": 5,
          "list": 1,
          "table": 0,
          "quote": 0
        }
      }
    ]
  }
}
```

### mdsel.select

Select content from Markdown documents using selectors. Selectors follow the pattern: [namespace::]type[.index][/path][?query]. Examples: 'h1.0' (first h1), 'readme::h2.1' (second h2 in readme), 'h2.0/code.0' (first code block under first h2), 'h2' (all h2 headings). Use '?full=true' to bypass truncation.

**Parameters:**
- `selector` (string, required): Selector expression. Format: [namespace::]type[.index][/path][?query]
- `files` (array of strings, required): Absolute paths to Markdown files to search

**Example:**

```json
{
  "name": "mdsel.select",
  "arguments": {
    "selector": "h1.0",
    "files": ["/absolute/path/to/document.md"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-12-28T00:16:23.126Z",
  "data": {
    "matches": [
      {
        "selector": "h1.0",
        "type": "heading",
        "content": "# Document Title\n\nContent under the heading...",
        "truncated": false
      }
    ]
  }
}
```

## Selector Grammar

### Syntax

```
[namespace::]type[.index][/path][?query]
```

### Components

- **namespace** (optional): Document identifier derived from filename. Defaults to all documents if omitted.
- **type** (required): Node type to select (shorthand preferred)
- **index** (optional): 0-based ordinal. Use dot notation (`.0`) or bracket notation (`[0]`). Omit to select all matches.
- **path** (optional): Additional path segments for nested selection
- **query** (optional): Query parameters (e.g., `?full=true` to bypass truncation)

### Node Types

| Shorthand | Full Form | Description |
|-----------|-----------|-------------|
| `h1`-`h6` | `heading:h1`-`heading:h6` | Headings by level |
| `code` | `block:code` | Code blocks |
| `para`, `paragraph` | `block:paragraph` | Paragraphs |
| `list` | `block:list` | Lists |
| `table` | `block:table` | Tables |
| `quote`, `blockquote` | `block:blockquote` | Block quotes |
| `section` | `section` | Sections |
| `root` | `root` | Document root |

### Index Notation

Both notations are interchangeable:

| Notation | Example | Description |
|----------|---------|-------------|
| Dot | `h2.0` | First h2 (preferred) |
| Bracket | `h2[0]` | First h2 (also supported) |
| Range | `h2.1-3` or `h2[1-3]` | Selects h2.1, h2.2, h2.3 |
| Comma list | `h2.0,2,4` or `h2[0,2,4]` | Selects h2.0, h2.2, h2.4 |
| No index | `h2` | Selects **all** h2 headings |

### Selector Examples

**Basic selectors:**
- `h1.0` - First h1 heading in any document
- `h2.1` - Second h2 heading
- `code.0` - First code block
- `h2` - All h2 headings (no index = all)

**Namespaced selectors:**
- `readme::h1.0` - First h1 in the readme namespace
- `document::h2.0` - First h2 in the document namespace

**Path selectors:**
- `h2.0/code.0` - First code block under the first h2
- `h1.0/h2.1/para.0` - First paragraph under second h2 under first h1

**Range and list selectors:**
- `h2.0-2` - First three h2 headings
- `code.0,2,4` - First, third, and fifth code blocks

**Query selectors:**
- `section.0?full=true` - Full content of first section (no truncation)
- `readme::h2.0/code.0?full=true` - Full code block content

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/mdsel-mcp.git
cd mdsel-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

```bash
npm run build          # Production build
npm run dev            # Build in watch mode
npm run test           # Run tests
npm run test:run       # Run tests once
npm run test:coverage  # Run tests with coverage
npm run test:ui        # Run tests with UI
```

## License

MIT License

## MCP Server Startup

When started, the mdsel-mcp server:

1. Initializes the MCP server with stdio transport
2. Registers two tools: `mdsel.index` and `mdsel.select`
3. Listens for tool calls from the MCP client
4. Forwards calls to the mdsel CLI via npx
5. Returns CLI output unchanged to the client

The server requires no persistent state or configuration. Each tool call is independent and self-contained.
