# MCP Server README Examples Research

## Notable MCP Server README Examples

### 1. @modelcontextprotocol/server-filesystem
**URL**: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem

**Key Sections**:
- Brief description of purpose
- Installation via npx
- Configuration for Claude Desktop
- Available tools list
- Usage examples

**Relevant Pattern**:
```markdown
## Installation

\`\`\`bash
npx @modelcontextprotocol/server-filesystem /path/to/allowed/files
\`\`\`

## Configuration

Add to Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]
    }
  }
}
\`\`\`
```

### 2. @modelcontextprotocol/server-github
**URL**: https://github.com/modelcontextprotocol/servers/tree/main/src/github

**Key Sections**:
- Feature overview
- Authentication setup
- Configuration with GitHub token
- Available tools with descriptions

**Relevant Pattern**:
```markdown
## Usage

This server provides the following tools:

- **github/get_issue**: Get details of a GitHub issue
- **github/create_issue**: Create a new issue
- **github/search_issues**: Search for issues

## Configuration

\`\`\`json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
\`\`\`
```

### 3. Community MCP Servers (Various)

**Common Patterns Observed**:

1. **Installation Section**:
   - Always shows npx usage
   - Often includes `-y` flag for auto-confirmation
   - May show global npm install as alternative

2. **Configuration Section**:
   - Shows Claude Desktop MCP config
   - Includes full JSON example
   - Shows command structure clearly

3. **Tools Section**:
   - Lists each tool with brief description
   - Shows input schema for each tool
   - Includes example usage

4. **Usage Examples**:
   - Shows actual tool call format
   - Includes example responses
   - May show error handling

## README Structure Template for MCP Servers

```markdown
# [Package Name]

[Badges]

[Brief description - 1-2 sentences]

## Installation

\`\`\`bash
npx -y [package-name]
\`\`\`

## Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

\`\`\`json
{
  "mcpServers": {
    "[server-name]": {
      "command": "npx",
      "args": ["-y", "[package-name]"]
    }
  }
}
\`\`\`

## Available Tools

This MCP server provides the following tools:

### [tool_name]

[Description of what the tool does]

**Parameters**:
- `param1` (required): [description]
- `param2` (optional): [description]

**Example**:
\`\`\`json
{
  "name": "[tool_name]",
  "arguments": {
    "param1": "value1"
  }
}
\`\`\`

## Usage Examples

### Example 1: [Use case title]

\`\`\`typescript
// Show tool call
\`\`\`

## Development

\`\`\`bash
git clone [repo]
cd [project]
npm install
npm run build
\`\`\`

## License

[License type]
```

## Key Insights for mdsel-mcp README

1. **Keep installation simple**: Show only npx usage
2. **Clear configuration**: Show exact JSON for Claude Desktop
3. **Tool documentation**: List both tools with their parameters
4. **Practical examples**: Show actual tool call format
5. **No fluff**: Skip philosophy and marketing, focus on usage

## Selector Grammar Documentation Pattern

For mdsel-specific selector syntax, use a mechanical, brief explanation:

```markdown
## Selector Syntax

This tool uses the `mdsel` selector syntax for targeting markdown elements:

- `h1.0` - First h1 heading
- `h2.1` - Second h2 heading
- `section.0` - First section
- `section.link.0` - First link in first section

Selectors use dot notation and zero-based indexing.
```

This keeps it brief and mechanical as required by PRD.
