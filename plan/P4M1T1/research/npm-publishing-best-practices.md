# npm Publishing Best Practices for MCP Servers

## Essential package.json Fields

### Required Fields
```json
{
  "name": "package-name",
  "version": "1.0.0"
}
```

### Recommended Fields
```json
{
  "description": "Clear package description",
  "keywords": ["modelcontextprotocol", "mcp", "markdown", "selector"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "bugs": {
    "url": "https://github.com/username/repo/issues"
  },
  "homepage": "https://github.com/username/repo#readme"
}
```

### Important Optional Fields
```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "command-name": "./dist/index.js"
  },
  "files": ["dist", "README.md"],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## npm Publish Workflow

### prepublishOnly Script
```json
{
  "scripts": {
    "prepublishOnly": "npm run build && npm run test:run"
  }
}
```

The `prepublishOnly` script runs before `npm publish` and is the recommended place to:
- Build the package
- Run tests
- Validate the package

### Semantic Versioning
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### .npmignore vs package.json files field

**.npmignore** (excludes files):
```
node_modules/
src/
test/
*.test.ts
*.map
coverage/
.git/
.env
```

**package.json files field** (includes files - recommended):
```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

Using the `files` field is more secure as it's a whitelist approach.

## Authentication

### npm Token
```bash
npm login
# or
npm token create
```

### Two-Factor Authentication
Required for publishing npm packages as of 2025.

## Common Pitfalls

1. **Including sensitive data** - Use .npmignore or files field
2. **Incorrect file permissions** - Binaries need execute permission
3. **Missing or incorrect bin entry points** - Verify paths
4. **Engine constraints** - Document Node.js requirements clearly
5. **Forgetting to build** - Use prepublishOnly script

## Package Quality

### Keywords Selection
Include both general and specific keywords:
- "modelcontextprotocol"
- "mcp"
- "markdown"
- "selector"
- "cli"

### README Formatting
- Clear installation instructions
- Usage examples
- Configuration examples for major MCP clients
- Tool documentation

## References

- [npm package.json documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [npm publish documentation](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [npm two-factor authentication](https://docs.npmjs.com/about-two-factor-authentication)
