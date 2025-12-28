# package.json Configuration for Node.js Packages Executable via npx

## 1. Official npm Documentation

### bin Field Documentation
- **Official npm docs**: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
- **The bin field**: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin-1

### Package.json Overview
- **Complete package.json reference**: https://docs.npmjs.com/cli/v10/configuring-npm/package-json

## 2. Required Fields for npx Executable Packages

### Core Fields for Executable Packages

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "description": "An MCP server",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "exports": {
    ".": "./dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "peerDependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

## 3. Detailed Field Explanations

### 3.1 The `bin` Field

The `bin` field specifies executable commands that should be installed when the package is installed.

#### Basic Syntax
```json
{
  "bin": {
    "command-name": "./path/to/script.js"
  }
}
```

#### Shorthand Form (Single Command)
```json
{
  "bin": "./path/to/script.js"
}
// Command name defaults to package name
```

#### Requirements
1. **Shebang Line**: Executable files must start with:
   ```javascript
   #!/usr/bin/env node
   ```

2. **File Permissions**: Files should be executable (chmod +x)

3. **Installation Location**:
   - Global install: Commands added to PATH
   - Local install: Commands in `node_modules/.bin/`
   - npx: Executes from temporary location

### 3.2 The `type` Field

```json
{
  "type": "module"
}
```

- Set to `"module"` for ES modules
- Default is `"commonjs"` (but only affects imports in `.js` files, not `.mjs`)
- Important for proper ES module support in npx

### 3.3 The `exports` Field

Modern way to define package entry points with better encapsulation.

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./utils": "./dist/utils.js"
  }
}
```

### 3.4 The `main` Field

The primary entry point for the package when imported.

```json
{
  "main": "./dist/index.js"
}
```

### 3.5 The `files` Field

Specifies which files to include in the published package.

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

## 4. Dependencies Configuration

### 4.1 `dependencies`
Runtime dependencies required for the package to function.

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "express": "^4.18.2"
  }
}
```

### 4.2 `peerDependencies`
Packages that should be provided by the consumer (parent application).

```json
{
  "peerDependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

**Use Cases for peerDependencies**:
- MCP servers (the SDK should be provided by the host)
- Plugin systems
- Libraries extending another framework

### 4.3 `devDependencies`
Development-only dependencies.

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "jest": "^29.5.0"
  }
}
```

### 4.4 Installation Commands

```bash
# Install dependencies
npm install

# Install dev dependencies only
npm install --save-dev

# Install peer dependencies (npm v7+)
npm install --save-peer

# Install as dependency and dev dependency
npm install express --save
npm install jest --save-dev
```

## 5. The `engines` Field

Specifies Node.js version compatibility.

### Basic Usage

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Version Specifiers

| Specifier | Meaning | Example |
|-----------|---------|---------|
| `>=18.0.0` | Greater than or equal | `>=18.0.0` |
| `>18.0.0` | Greater than | `>18.0.0` |
| `^18.0.0` | Compatible with 18.x.x | `^18.0.0` |
| `~18.0.0` | Approximately 18.0.x | `~18.0.0` |
| `18.x` | Any 18.x version | `18.x` |
| `>=18.0.0 <20.0.0` | Range | `>=18.0.0 <20.0.0` |

### Behavior Notes

1. **npm**: Shows warning by default, can enforce with `engine-strict` in `.npmrc`
2. **Yarn**: Fails by default (can override with `--ignore-engines`)
3. **Best Practice**: Always specify minimum Node.js version

## 6. Common npx and ES Module Gotchas

### 6.1 npx Gotchas

1. **Caching**: npx caches packages by default, use `npx --no-install` to bypass
2. **Temporary Execution**: Files run from temporary location, not in project directory
3. **File Permissions**: Executables may not have execute permissions on some systems
4. **Network Issues**: npx requires internet access (unless cached)

### 6.2 ES Module Gotchas

1. **File Extensions**:
   - Use `.js` with `"type": "module"`
   - Use `.mjs` for explicit ES modules
   - Use `.cjs` for explicit CommonJS

2. **Import/Require**:
   ```javascript
   // ES modules
   import { createServer } from '@modelcontextprotocol/sdk';
   export default function() { /* ... */ }

   // CommonJS (avoid if using "type": "module")
   const { createServer } = require('@modelcontextprotocol/sdk');
   module.exports = function() { /* ... */ }
   ```

3. **__dirname and __filename**:
   ```javascript
   import { fileURLToPath } from 'url';
   import { dirname, join } from 'path';

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);
   ```

4. **Package.json Pitfalls**:
   - Don't mix `require` and `import` in the same file
   - Use `"type": "module"` consistently across your project
   - Ensure `exports` field aligns with your module system

## 7. MCP Server Package.json Examples

### Example 1: TypeScript MCP Server

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "description": "TypeScript MCP Server",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "jest"
  },
  "keywords": ["mcp", "model-context-protocol"],
  "files": [
    "dist",
    "README.md"
  ],
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "peerDependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "jest": "^29.5.0",
    "@types/jest": "^29.5.0"
  }
}
```

### Example 2: JavaScript MCP Server

```json
{
  "name": "simple-mcp-server",
  "version": "1.0.0",
  "description": "JavaScript MCP Server",
  "type": "module",
  "main": "index.js",
  "bin": {
    "simple-mcp-server": "./index.js"
  },
  "scripts": {
    "start": "node index.js"
  },
  "keywords": ["mcp", "model-context-protocol"],
  "files": [
    "index.js",
    "utils.js"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Example 3: Complex MCP Server with Conditional Exports

```json
{
  "name": "advanced-mcp-server",
  "version": "1.0.0",
  "description": "Advanced MCP Server with multiple entry points",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./cli": {
      "import": "./dist/cli.js",
      "require": "./dist/cli.cjs"
    }
  },
  "bin": {
    "advanced-mcp-server": "./dist/cli.js"
  },
  "files": [
    "dist",
    "config/*.json"
  ],
  "engines": {
    "node": ">=18.0.0 <20.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "commander": "^11.0.0"
  },
  "peerDependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/commander": "^11.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 8. Best Practices Checklist

### Before Publishing an npx Executable

1. [ ] **Shebang Line**: Ensure executable files start with `#!/usr/bin/env node`
2. [ ] **File Permissions**: Make sure files are executable
3. [ ] **Type Field**: Set `"type": "module"` if using ES modules
4. [ ] **Exports Field**: Configure proper exports for your module system
5. [ ] **Files Field**: Include only necessary files in the package
6. [ ] **Dependencies**: Review and optimize dependency tree
7. [ ] **Peer Dependencies**: Use appropriately for MCP servers
8. [ ] **Engines**: Specify minimum Node.js version
9. [ ] **Scripts**: Include helpful development and build scripts
10. [ ] **Test**: Verify npx execution locally before publishing
11. [ ] **Size**: Keep package size reasonable for npx usage
12. [ ] **Documentation**: Include usage instructions in README

### Testing npx Execution

```bash
# Test locally without publishing
npm pack
npx ./my-package-1.0.0.tgz

# After publishing
npx my-mcp-server --help

# Install globally for testing
npm install -g . && my-mcp-server --help
```

## 9. Troubleshooting Common Issues

### Issue: npx command not found
- Ensure package name is correct
- Check that `bin` field is properly configured
- Verify the executable file exists and has proper permissions

### Issue: Module not found with ES modules
- Check `"type": "module"` in package.json
- Use proper import syntax
- Ensure file extensions match module system

### Issue: Permission denied
- Run `chmod +x` on executable files
- Check file permissions in the package
- Use `--no-bin-links` flag if needed

### Issue: Node.js version mismatch
- Check `engines` field requirements
- Use Node.js version manager (nvm, fnm) to match required version
- Override with `--ignore-engines` if appropriate