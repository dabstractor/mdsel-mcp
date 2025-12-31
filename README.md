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
    "selector": "h2.0",
    "files": ["README.md"]
  }
}
```

Returns the content under the selected heading.

## Selector Syntax

Selectors are path-based, ordinal, and 0-indexed.

```
[namespace::]type[index][/path]
```

### Node Types

| Type | Shorthand | Description |
|------|-----------|-------------|
| `heading:h1` ... `heading:h6` | `h1` ... `h6` | Headings by level |
| `block:paragraph` | `para` | Paragraphs |
| `block:code` | `code` | Code blocks |
| `block:list` | `list` | Lists |
| `block:table` | `table` | Tables |
| `block:blockquote` | `quote` | Blockquotes |
| `root` | - | Document root |

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

### Examples

```bash
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
```

## Development

```bash
npm run build
```

## License

MIT
