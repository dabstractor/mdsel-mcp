# npm Package Publishing Best Practices for 2025

## 1. Essential package.json Fields for Publication

### Required Fields
- **name**: Package identifier (must be unique on npm registry)
- **version**: Must follow semantic versioning (SemVer) - e.g., "1.0.0"

### Recommended Fields
- **description**: Clear, concise description of what your package does
- **keywords**: Array of strings for discoverability
- **author**: Object or string identifying the maintainer(s)
- **license**: SPDX license identifier (e.g., "MIT", "Apache-2.0")
- **homepage**: URL to project homepage
- **repository**: Object with "type" and "url" properties
- **bugs**: URL to issue tracker (GitHub issues, etc.)

### Important Optional Fields
- **exports**: Modern module resolution mapping
- **main**: CommonJS entry point (deprecated in favor of exports)
- **module**: ES module entry point
- **types**: TypeScript declaration file path
- **files**: Array of files to include in published package
- **bin**: Object mapping command names to executables
- **engines**: Specify compatible Node.js versions
- **os**: Array of supported operating systems
- **cpu**: Array of supported CPU architectures

## 2. npm Publish Workflow and Best Practices

### Using prepublishOnly Script
```json
{
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "test": "vitest",
    "prepublishOnly": "npm test && npm run build"
  }
}
```

### Semantic Versioning Conventions
- **Patch (x.0.0)**: Backward-compatible bug fixes
- **Minor (x.x.0)**: Backward-compatible new features
- **Major (0.x.x)**: Breaking changes

### .npmignore vs package.json files field
- **files field**: Explicitly include specific files/directories
- **.npmignore**: Exclude files (similar to .gitignore)

### Public vs Private Packages
- **Public packages**: Available to everyone on npm registry
- **Private packages**: Require npm Pro plan, access control available

### Authentication and Tokens
```bash
# Use npm login or authentication token
npm login
# Or publish with token
npm publish --registry=https://registry.npmjs.org --token=${NPM_TOKEN}
```

### Two-Factor Authentication
- Required for all npm publishers since 2018
- Use npm OTP or app-based authentication

## 3. Package Quality and Discoverability

### Keywords Selection
- Use 2-5 relevant, descriptive keywords
- Include "mcp", "modelcontextprotocol" for MCP servers
- Avoid overly generic terms

### README Formatting
- Include installation instructions
- Provide usage examples
- Document API reference
- Include contribution guidelines
- Add license and contact information

### Package Naming Conventions
- Use lowercase with hyphens
- Be descriptive but concise
- Include scope for scoped packages (@org/package)
- Check name availability before publishing

## 4. Common Pitfalls to Avoid

### Including Sensitive Data
- Never commit API keys, credentials, or secrets
- Use environment variables for configuration
- Add sensitive patterns to .npmignore

### Incorrect File Permissions
- Ensure executable files have proper permissions (755)
- Test package installation in clean environment

### Missing or Incorrect Bin Entry Points
- Verify paths in bin field are correct
- Test CLI commands after installation
- Include proper shebang line in executable files

### Engine Constraints
- Be specific about Node.js version requirements
- Test across compatible versions
- Use "node" instead of specific versions for broader compatibility

## 5. MCP-Specific Package Patterns

### Example package.json for MCP Server
```json
{
  "name": "@mdsel/mcp-glm",
  "version": "1.0.0",
  "description": "GLM MCP server for Model Context Protocol integration",
  "type": "module",
  "main": "dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "bin": {
    "mdsel-mcp-glm": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "test": "vitest",
    "prepublishOnly": "npm run test && npm run build"
  },
  "keywords": [
    "mcp",
    "modelcontextprotocol",
    "anthropic",
    "glm",
    "ai",
    "server"
  ],
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/mdsel-mcp-glm.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/mdsel-mcp-glm/issues"
  },
  "homepage": "https://github.com/your-org/mdsel-mcp-glm#readme",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "mcp": {
    "name": "mdsel-glm-server",
    "version": "1.0.0",
    "description": "GLM-based MCP server for mdsel integration"
  }
}
```

### MCP Server Publishing Patterns
1. **Naming**: Use scope (@org/package) for organizational packages
2. **Entry Point**: Use CommonJS or ES modules with proper exports field
3. **Dependencies**: Include @modelcontextprotocol/sdk as primary dependency
4. **Scripts**: Always include prepublishOnly for build/test
5. **Types**: Include TypeScript definitions for better IDE support
6. **Files**: Explicitly list published files, typically built dist folder

## Official Resources

### npm Documentation
- [package.json Configuration](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [Publishing Packages](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Semantic Versioning](https://docs.npmjs.com/cli/v10/commands/npm-version)
- [Using .npmignore](https://docs.npmjs.com/cli/v10/configuring-npm/npm-folders#npmignore)

### MCP Resources
- [Model Context Protocol Documentation](https://docs.anthropic.com/en/docs/build-with-claude/model-context-protocol)
- [MCP SDK GitHub Repository](https://github.com/modelcontextprotocol/sdk)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)

### Security Best Practices
- [npm Security Guide](https://docs.npmjs.com/security-best-practices)
- [Avoiding Sensitive Data](https://docs.npmjs.com/cli/v10/commands/npm-config#avoiding-sensitive-information)
- [Two-Factor Authentication](https://docs.npmjs.com/cli/v10/commands/npm-login#two-factor-authentication)

## Checklist Before Publishing

1. [ ] Package name is unique and follows conventions
2. [ ] Version follows semantic versioning
3. [ ] All required fields are present
4. [ ] Description is clear and concise
5. [ ] Keywords are relevant and discoverable
6. [ ] License is properly specified
7. [ ] Repository and bug links are working
8. [ ] Entry point(s) are correctly configured
9. [ ] Files field or .npmignore is properly set
10. [ ] Sensitive data is excluded
11. [ ] Tests pass
12. [ ] Build script works
13. [ ] Package installs correctly in test environment
14. [ ] CLI commands (if any) work after installation
15. [ ] README is comprehensive and up-to-date

## Analysis of Your Current package.json

Your current package.json is well-configured for MCP publishing! Here's what you have right:

### ✅ Current Strengths
- Properly scoped naming with MCP keywords
- TypeScript module configuration with `type: "module"`
- Appropriate prepublishOnly script for build automation
- Correct entry point and bin configuration
- Proper peerDependencies handling for mdsel
- Files field explicitly lists what to publish
- Modern build configuration with tsup

### 📋 Recommended Enhancements
```json
{
  "name": "mdsel-mcp",
  "version": "1.0.0",
  "description": "MCP server for mdsel CLI - declarative Markdown selection",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run test && npm run build",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  },
  "keywords": [
    "mcp",
    "modelcontextprotocol",
    "model-context-protocol",
    "markdown",
    "mdsel",
    "declarative",
    "selection",
    "cli"
  ],
  "author": {
    "name": "Dustin",
    "email": "your.email@example.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dustin/mdsel-mcp-glm.git"
  },
  "bugs": {
    "url": "https://github.com/dustin/mdsel-mcp-glm/issues"
  },
  "homepage": "https://github.com/dustin/mdsel-mcp-glm#readme",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.25.0"
  },
  "peerDependencies": {
    "mdsel": "^1.0.0"
  },
  "peerDependenciesMeta": {
    "mdsel": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@vitest/coverage-v8": "^2.1.0",
    "tsup": "^8.3.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
}
```

## MCP Server Specific Checklist

1. [ ] @modelcontextprotocol/sdk is included in dependencies ✓
2. [ ] Server implements required MCP interface methods ✓
3. [ ] Command-line tool is properly configured in bin ✓
4. [ ] TypeScript definitions are included (add types field)
5. [ ] MCP metadata is in package.json or separate config
6. [ ] Server responds to MCP protocol correctly ✓
7. [ ] Error handling follows MCP specification ✓
8. [ ] Documentation includes MCP-specific usage examples ✓
9. [ ] Author information is complete
10. [ ] License and repository links are included

## Publishing Your MCP Server

### Steps to Publish:
1. **Login to npm**:
   ```bash
   npm login
   ```

2. **Verify everything**:
   ```bash
   npm test
   npm run build
   npm pack --dry-run
   ```

3. **Publish**:
   ```bash
   npm publish
   ```

### Authentication Requirements:
- Enable 2FA on your npm account
- Use an auth token for CI/CD:
  ```bash
  npm config set //registry.npmjs.org/:_authToken your_token
  ```

### Security Considerations:
- Add .npmignore to exclude sensitive files
- Never publish node_modules or build artifacts
- Use environment variables for configuration
- Consider using npm access for scoped packages

### Post-Publish:
- Update version and publish updates following SemVer
- Monitor npm downloads and issues
- Keep dependencies updated