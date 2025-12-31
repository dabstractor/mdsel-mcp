# mdsel-mcp

MCP server for the mdsel markdown selector CLI.

## Installation

```bash
npx -y mdsel-mcp
```

## Prerequisites

* **Node.js**: Version 18.0.0 or higher

## Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mdsel-mcp": {
      "command": "npx",
      "args": ["-y", "mdsel-mcp"]
    }
  }
}
```

Restart Claude Desktop after adding the configuration.

## Tool

This MCP server provides one unified tool: **mdsel**

**Parameters**:

* `files` (string[], required): List of markdown file paths
* `selector` (string, optional): Selector string (comma-separated for multiple)

**Behavior**:

* Files only → returns index (document structure with available selectors)
* Selector + files → returns selected content
* Search query + files → fuzzy search when input doesn't look like a selector

### Index Mode (files only)

```json
{
  "name": "mdsel",
  "arguments": {
    "files": ["README.md"]
  }
}
```

Returns document structure:

```
h1.0 mdsel-mcp
 h2.0 Installation
 h2.1 Prerequisites
 h2.2 Configuration
---
code:2 para:5 list:3
```

### Select Mode (selector + files)

```json
{
  "name": "mdsel",
  "arguments": {
    "selector": "h2.1",
    "files": ["README.md"]
  }
}
```

Returns the content under the selected heading.

### Search Mode (fuzzy matching)

When the selector doesn't look like selector syntax, mdsel performs fuzzy search:

```json
{
  "name": "mdsel",
  "arguments": {
    "selector": "installation",
    "files": ["README.md"]
  }
}
```

Returns matching selectors with relevance scores:

```
Search results for "installation":

readme::h2.1 (100% match)
  Installation
```

Use the returned selectors to fetch the actual content.

## Selector Syntax

Selectors are path-based, ordinal, and 0-indexed.

```
[namespace::]type[index][/path]
```

### Node Types

| Type | Shorthand | Description |
|------|-----------|-------------|
| `*` | `*` | Entire document (wildcard) |
| `root` | - | Document root |
| `heading:h1` ... `heading:h6` | `h1` ... `h6` | Headings by level |
| `block:paragraph` | `para` | Paragraphs |
| `block:code` | `code` | Code blocks |
| `block:list` | `list` | Lists |
| `block:table` | `table` | Tables |
| `block:blockquote` | `quote` | Blockquotes |

### Index Notation

| Notation | Example | Meaning |
|----------|---------|---------|
| Dot | `h2.0` | First h2 |
| Bracket | `h2[0]` | First h2 |
| Range | `h2.0-2` | h2.0, h2.1, h2.2 |
| No index | `h2` | All h2 headings |

### Path Composition

Nest selectors with `/` to select within a parent:

* `h2.1/code.0` - First code block under second h2
* `h1.0/h2.0` - First h2 under first h1

### Namespace Selection (multiple files)

When indexing multiple files, each gets a namespace. Use `namespace::selector` to target specific files:

* `readme::h2.0` - First h2 in readme
* `h2.0` - First h2 from all files

### Query Parameters

Limit output with query parameters:

* `h2.0?head=10` - First 10 lines of content
* `h2.0?tail=5` - Last 5 lines of content

### Examples

```bash
# Wildcard - entire document
*

# Basic selection
h1.0                # First h1 heading
h2.1                # Second h2 heading
code.0              # First code block
para.2              # Third paragraph

# Ranges
h2.0-2              # First three h2 headings

# Nested paths
h2.1/code.0         # First code block under second h2
h1.0/h2.0           # First h2 under first h1

# Multiple files
readme::h2.0        # First h2 in readme namespace

# Truncation
h2.0?head=10        # First 10 lines
```

## Development

```bash
npm run build
```

## License

MIT
