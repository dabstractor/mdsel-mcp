# mdsel-mcp

MCP server for the mdsel markdown selector CLI.

## Installation

```bash
npx -y mdsel-mcp
```

## Prerequisites

- **mdsel CLI**: Must be installed locally on your system
- **Node.js**: Version 18.0.0 or higher

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

## Available Tools

This MCP server provides two tools:

- **mdsel.index** - Index markdown files for selector-based access
- **mdsel.select** - Select content using mdsel selector syntax

### mdsel.index

Indexes markdown files to enable selector-based content access.

**Parameters**:
- `files` (string[], required): List of markdown file paths to index

**Example**:
```json
{
  "name": "mdsel.index",
  "arguments": {
    "files": ["README.md", "docs/**/*.md"]
  }
}
```

### mdsel.select

Selects content from indexed files using mdsel selector syntax.

**Parameters**:
- `selector` (string, required): mdsel selector string
- `files` (string[], optional): Array of file paths to search

**Example**:
```json
{
  "name": "mdsel.select",
  "arguments": {
    "selector": "h2.0",
    "files": ["README.md"]
  }
}
```

## Selector Syntax

mdsel uses dot notation and zero-based indexing for targeting markdown elements:

- `h1.0` - First h1 heading
- `h2.1` - Second h2 heading
- `section.0` - First section
- `section.link.0` - First link in first section
- `code.0` - First code block
- `h2.0-2` - Range: h2 headings 0 through 2

Selectors use dot notation (preferred) over bracket notation.

## Development

```bash
# Build
npm run build

# Output: ./dist/
```

## License

MIT
