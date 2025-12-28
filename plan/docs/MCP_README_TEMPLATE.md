# MCP Server README Template

Based on analysis of excellent MCP server repositories including:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- [upstash/context7](https://github.com/upstash/context7)

## Header Structure

### Badges
```markdown
[![NPM Version](https://img.shields.io/npm/v/@yourpackage/yourname)](https://www.npmjs.com/package/@yourpackage/yourname)
[![MIT licensed](https://img.shields.io/npm/l/@yourpackage/yourname)](./LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourorg/yourrepo/build.yml?branch=main)](https://github.com/yourorg/yourrepo/actions)
[![Coverage](https://img.shields.io/codecov/c/github/yourorg/yourrepo)](https://codecov.io/gh/yourorg/yourrepo)
```

### Title and Description
```markdown
# Your MCP Server Name

[![Install button](https://img.shields.io/badge/Install-Server-blue)](installation-link)

Brief one-sentence description of what your MCP server does.

## Key Features

- **Feature 1**: Brief description of primary capability
- **Feature 2**: Brief description of secondary capability
- **Feature 3**: Brief description of advanced capability
```

## Section Organization

### Table of Contents
```markdown
<details>
<summary>Table of Contents</summary>

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

</details>
```

## Installation Instructions

### Requirements
```markdown
### Requirements

- Node.js >= 18.0.0
- [VS Code](https://code.visualstudio.com/), [Cursor](https://cursor.sh/), [Windsurf](https://windsurf.rs/), [Claude Desktop](https://claude.ai/desktop), or another MCP client
```

### Standard Installation
```markdown
## Installation

### Standard Installation (Recommended)

```bash
npm install -g @yourpackage/yourname
```

Or using npx:
```bash
npx @yourpackage/yourname@latest
```
```

### Client-Specific Installations
```markdown
### Client-Specific Installations

<details>
<summary>Install in VS Code</summary>

[![Install in VS Code](https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF)](installation-link)

Add to your VS Code MCP config:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["@yourpackage/yourname@latest"]
    }
  }
}
```

</details>

<details>
<summary>Install in Claude Desktop</summary>

Follow the MCP install [guide](https://modelcontextprotocol.io/quickstart/user) and add:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["@yourpackage/yourname@latest"]
    }
  }
}
```

</details>

<details>
<summary>Install in Cursor</summary>

Use the Cursor MCP settings interface or add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "your-server": {
      "url": "https://your-server.com/mcp"
    }
  }
}
```

</details>
```

## Configuration Examples

### Basic Configuration
```markdown
## Configuration

### Basic Configuration

For local servers:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["@yourpackage/yourname@latest"]
    }
  }
}
```

For remote servers:

```json
{
  "mcpServers": {
    "your-server": {
      "url": "https://your-server.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```
```

### Advanced Configuration
```markdown
### Advanced Configuration

With environment variables:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["@yourpackage/yourname@latest"],
      "env": {
        "YOUR_ENV_VAR": "value"
      }
    }
  }
}
```

With custom options:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["@yourpackage/yourname@latest", "--option1", "value1"],
      "disabled": false,
      "timeout": 30000
    }
  }
}
```
```

## Usage Examples

### Basic Usage
```markdown
## Usage Examples

### Basic Usage

Add this to your prompt:

```txt
Describe what you want to accomplish using the {your-tool} tool
```

Example:

```txt
Create a new markdown file with a heading and list items. use your-tool
```
```

### Tool-Specific Examples
```markdown
### Tool: your-tool-name

Description: What this tool does

Parameters:
- `param1` (string, required): Description of required parameter
- `param2` (number, optional): Description of optional parameter, defaults to 10
- `param3` (array, optional): Description of array parameter

Example usage:

```json
{
  "name": "your-tool-name",
  "arguments": {
    "param1": "example value",
    "param2": 5
  }
}
```

Response format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Tool executed successfully"
    }
  ]
}
```
```

### Advanced Workflows
```markdown
### Advanced Workflows

#### Example: Multi-step Workflow

1. First, initialize the context:

```txt
Initialize the project structure using your-init-tool with template "typescript"
```

2. Then configure the settings:

```txt
Configure the settings using your-config-tool with options: {port: 3000, debug: true}
```

3. Finally, start the service:

```txt
Start the service using your-start-tool with name "my-service"
```
```

## API Reference

### Tools Overview
```markdown
## API Reference

### Available Tools

| Tool Name | Description | Required Parameters | Optional Parameters |
|-----------|-------------|-------------------|---------------------|
| tool1     | Description | param1 (string)   | param2 (number)     |
| tool2     | Description | -                 | param3 (array)     |
| tool3     | Description | param4 (string)   | param5 (boolean)    |
```

### Detailed Tool Documentation
```markdown
### Tool: tool-name

**Title:** Human-readable title
**Description:** Detailed description of what the tool does
**Read-only:** false (or true for read-only tools)

**Parameters:**

- `param1` (string, required):
  - Description of parameter
  - Validation rules or constraints
  - Example values

- `param2` (number, optional, default=10):
  - Description of parameter
  - Allowed range if applicable

- `param3` (array, optional):
  - Description of array contents
  - Format of items

**Response:**

Success:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Success message"
    }
  ]
}
```

Error:
```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "Error message"
    }
  ]
}
```
```

## Code Examples

### Server Implementation
```markdown
## Code Examples

### Creating a Simple Server

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'your-server',
  version: '1.0.0'
});

// Register a tool
server.registerTool('your-tool', {
  description: 'Description of your tool',
  inputSchema: {
    param1: z.string().describe('Description of param1'),
    param2: z.number().optional().default(10).describe('Description of param2')
  }
}, async ({ param1, param2 }) => {
  // Tool implementation
  return {
    content: [{
      type: 'text',
      text: `Processed: ${param1} with value ${param2}`
    }]
  };
});

// Connect to transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.log('Server running...');
```
```

### Client Usage
```markdown
### Using the Server from a Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport();
const client = new Client(
  {
    name: 'your-client',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools.tools);

// Call a tool
const result = await client.callTool({
  name: 'your-tool',
  arguments: {
    param1: 'example',
    param2: 5
  }
});
console.log('Result:', result.content);
```
```

## Development

### Setup Instructions
```markdown
## Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourorg/your-repo.git
cd your-repo
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```
```

### Available Scripts
```markdown
### Available Scripts

```bash
# Development
npm run dev          # Build in watch mode
npm run build        # Production build
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run lint         # Run ESLint
npm run format       # Run Prettier

# Package
npm run package      # Create distributable package
npm run publish      # Publish to npm
```
```

### Testing
```markdown
### Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

Test specific file:
```bash
npm test -- your.test.ts
```

Test configuration example:

```typescript
import { describe, it, expect } from 'vitest';
import { YourTool } from '../src/tools';

describe('YourTool', () => {
  it('should process input correctly', () => {
    const tool = new YourTool();
    const result = tool.execute({ param1: 'test' });
    expect(result.content[0].text).toBe('Expected output');
  });
});
```
```

## Contributing

### Guidelines
```markdown
## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Run the linter: `npm run lint`
7. Commit your changes: `git commit -m 'feat: add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Code Style

- Use TypeScript with strict mode
- Follow ESLint configuration
- Format code with Prettier
- Write tests for new features
- Update documentation as needed
```

### Pull Request Template
```markdown
### Pull Request Checklist

- [ ] Code follows the project style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated if needed
- [ ] The branch is up-to-date with main
- [ ] All CI checks are passing

### Changes Description

Briefly describe the changes made and why they were needed.

### Testing Instructions

Describe how to test the changes, including any special setup required.
```

## Troubleshooting

### Common Issues
```markdown
## Troubleshooting

### Common Issues

#### Module Not Found Error

If you encounter `ERR_MODULE_NOT_FOUND`, try using `bunx` instead of `npx`:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "bunx",
      "args": ["@yourpackage/yourname@latest"]
    }
  }
}
```

#### Permission Issues

On Unix systems, you may need to set execute permissions:

```bash
chmod +x node_modules/.bin/your-executable
```

#### Environment Variables

Make sure to set required environment variables in your MCP client configuration:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["@yourpackage/yourname@latest"],
      "env": {
        "REQUIRED_ENV_VAR": "value"
      }
    }
  }
}
```
```

## License

```markdown
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- 📧 **Email**: support@yourcompany.com
- 💬 **Discord**: [Join our community](https://discord.gg/yourcommunity)
- 🐛 **Issues**: [Report bugs on GitHub](https://github.com/yourorg/your-repo/issues)
- 📖 **Documentation**: [Read the full docs](https://docs.yourserver.com)
```

## Best Practices Checklist

### Header
- [ ] Include relevant badges (NPM version, license, build status)
- [ ] Clear, descriptive title
- [ ] Concise tagline
- [ ] Feature list with bullet points

### Installation
- [ ] Clear requirements section
- [ ] Multiple installation methods
- [ ] Client-specific configurations for major MCP clients
- [ ] One-click install buttons where applicable

### Documentation
- [ ] Table of contents for easy navigation
- [ ] Comprehensive API reference
- [ ] Code examples in multiple languages
- [ ] Real-world usage examples
- [ ] Error handling examples

### Development
- [ ] Clear setup instructions
- [ ] Available scripts documentation
- [ ] Testing guidelines
- [ ] Contributing guidelines
- [ ] Code style requirements

### Polish
- [ ] Consistent formatting and styling
- [ ] Proper use of code blocks and syntax highlighting
- [ ] Responsive design considerations
- [ ] Accessibility features mentioned
- [ ] Version compatibility information