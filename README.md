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

Generate a selector inventory for Markdown documents. Returns all available selectors (headings, blocks) that can be used with mdsel.select. Each document is assigned a namespace derived from its filename (e.g., 'README.md' -> 'readme').

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
            "selector": "document::heading:h1[0]",
            "type": "heading:h1",
            "depth": 1,
            "text": "Document Title"
          }
        ],
        "blocks": {
          "paragraphs": 5,
          "code_blocks": 2,
          "lists": 1,
          "tables": 0,
          "blockquotes": 0
        }
      }
    ]
  }
}
```

### mdsel.select

Select content from Markdown documents using selectors. Selectors follow the pattern: [namespace::]type[index][/path][?query]. Examples: 'heading:h1[0]' (first h1), 'readme::h2[1]' (second h2 in readme), 'h2[0]/code[0]' (first code block under first h2). Use '?full=true' to bypass truncation.

**Parameters:**
- `selector` (string, required): Selector expression. Format: [namespace::]type[index][/path][?query]
- `files` (array of strings, required): Absolute paths to Markdown files to search

**Example:**

```json
{
  "name": "mdsel.select",
  "arguments": {
    "selector": "heading:h1[0]",
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
        "selector": "heading:h1[0]",
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
[namespace::]type[index][/path]?query
```

### Components

- **namespace** (optional): Document identifier derived from filename. Defaults to all documents if omitted.
- **type** (required): Node type to select
- **index** (optional): 0-based ordinal among siblings of the same type
- **path** (optional): Additional path segments for nested selection
- **query** (optional): Query parameters (e.g., `?full=true` to bypass truncation)

### Node Types

| Category | Types | Shorthand |
|----------|-------|-----------|
| Root | `root` | - |
| Headings | `heading:h1`, `heading:h2`, `heading:h3`, `heading:h4`, `heading:h5`, `heading:h6` | `h1`, `h2`, `h3`, `h4`, `h5`, `h6` |
| Sections | `section` | - |
| Blocks | `block:paragraph`, `block:list`, `block:code`, `block:table`, `block:blockquote` | `para`, `list`, `code`, `table`, `quote` |

### Selector Examples

**Basic selectors:**
- `heading:h1[0]` - First h1 heading in any document
- `h2[1]` - Second h2 heading (shorthand form)
- `code[0]` - First code block

**Namespaced selectors:**
- `readme::heading:h1[0]` - First h1 in the readme namespace
- `document::h2[0]` - First h2 in the document namespace

**Path selectors:**
- `h2[0]/code[0]` - First code block under the first h2
- `h1[0]/h2[1]/para[0]` - First paragraph under second h2 under first h1

**Query selectors:**
- `section[0]?full=true` - Full content of first section (no truncation)
- `readme::h2[0]/code[0]?full=true` - Full code block content

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
