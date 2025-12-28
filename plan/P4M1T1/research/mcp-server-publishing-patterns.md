# MCP Server Publishing Patterns

## Official @modelcontextprotocol Packages

### SDK Package
```json
{
  "name": "@modelcontextprotocol/sdk",
  "version": "1.0.0",
  "type": "module"
}
```

## Common package.json Patterns for MCP Servers

### Pattern Structure
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "description": "MCP Server Description",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "files": ["dist"],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "modelcontextprotocol",
    "mcp",
    "markdown",
    "selector"
  ],
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "npm run build"
  }
}
```

## Key Patterns

### 1. ESM Module Type
All modern MCP servers use `"type": "module"`

### 2. Bin Field with Shebang
- Bin entry points to dist/index.js
- Shebang added via tsup banner

### 3. Files Field
Only include compiled output:
```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

### 4. Keywords
Always include:
- "modelcontextprotocol"
- "mcp"

Plus domain-specific keywords.

### 5. Node.js Engine
MCP SDK requires Node.js >= 18.0.0:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## npx Usage Pattern

MCP servers are invoked by clients via npx:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name@latest"]
    }
  }
}
```

## Testing Before Publishing

### 1. Build Test
```bash
npm run build
```

### 2. Local Execution Test
```bash
node dist/index.js
```

### 3. npx Test (via npm pack)
```bash
npm pack
npx ./package-name-1.0.0.tgz
```

### 4. npm link Test
```bash
npm link
npx package-name
```

## Build Configuration Pattern

### tsup for MCP Servers
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  dts: true,
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [npm package.json documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
