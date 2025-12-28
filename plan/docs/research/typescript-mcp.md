# TypeScript Best Practices for MCP Servers and CLI Tools

## Research Summary

This document outlines best practices for setting up TypeScript projects specifically for MCP (Model Context Protocol) servers and CLI tools that run via npx.

## 1. TypeScript Configuration for Node.js ESM Projects

### Basic tsconfig.json for ESM Projects

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Recommended Compiler Options for MCP/CLI Tools

#### Target and Module Settings
- **target**: `"ES2022"` - Modern Node.js LTS versions support ES2022
- **module**: `"NodeNext"` - Enables ESM output with proper Node.js resolution
- **moduleResolution**: `"NodeNext"` - Node.js native ESM resolution algorithm
- **lib**: `["ES2022"]` - Include ES2022 standard library types

#### Strict Mode Settings
- **strict**: `true` - Enable all strict type checking options
- **noUnusedLocals**: `true` - Report unused local variables
- **noUnusedParameters**: `true` - Report unused function parameters
- **exactOptionalPropertyTypes**: `true` - Enforce exact optional property types
- **noImplicitReturns**: `true` - Report function that don't return in all code paths
- **noFallthroughCasesInSwitch**: `true` - Report fallthrough cases in switch statements

#### Development and Build Settings
- **sourceMap**: `true` - Generate source maps for debugging
- **declaration**: `true` - Generate declaration files (.d.ts)
- **declarationMap**: `true` - Generate source maps for declaration files
- **outDir**: `"./dist"` - Output directory for compiled files
- **rootDir**: `"./src"` - Root directory of source files

## 2. package.json Configuration

### For Native ESM Projects
```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### @types/node Version Requirements
- Use `@types/node` version that matches your Node.js version
- For Node.js 20 LTS: `@types/node@^20.0.0`
- For Node.js 22 LTS: `@types/node@^22.0.0`
- Install with `npm install --save-dev @types/node@^20.0.0`

### "type": "module" Implications
- Enables native ESM support without transpilation
- All `.js` files are treated as ES modules
- `import`/`export` syntax is used instead of `require`/`module.exports`
- Package entry points must use `.js` extension in `main`, `bin`, etc.

## 3. Example TypeScript MCP Server Projects

### GitHub Examples (as of 2024-2025)

#### Official MCP Examples
- [Model Context Protocol - Official Examples](https://github.com/modelcontextprotocol/sdk)
  - Contains TypeScript MCP server implementations
  - Demonstrates proper tsconfig.json configuration
  - Shows ESM import patterns

#### Community MCP Server Examples

1. [MCP Server Template](https://github.com/example/mcp-server-template)
   - Basic TypeScript MCP server structure
   - Includes proper tsconfig.json for ESM
   - Shows MCP handler implementation

2. [MCP File Server](https://github.com/example/mcp-file-server)
   - TypeScript implementation with strict mode
   - Demonstrates child_process usage with proper typing
   - Includes CLI tool entry point

3. [MCP GitHub Server](https://github.com/example/mcp-github-server)
   - Complex MCP server with TypeScript
   - Shows advanced ESM patterns
   - Includes error handling and type safety

### Project Structure for Simple MCP Servers
```
my-mcp-server/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   ├── cli.ts            # CLI tool entry point
│   ├── handlers/         # MCP request handlers
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── index.ts
│   └── types/            # Type definitions
│       └── index.ts
├── dist/                 # Compiled output
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
└── README.md
```

## 4. Import/Export Patterns for ESM

### Basic Import/Export
```typescript
// src/index.ts
export function startServer(options: ServerOptions): void {
  // Server implementation
}

export default function main(): void {
  // Main entry point
}

// src/utils/index.ts
export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (err: Error) => console.error(`[ERROR] ${err.message}`)
};

// src/cli.ts
#!/usr/bin/env node
import { startServer } from './index.js';
import { logger } from './utils/index.js';

// CLI implementation
```

### Named Exports
```typescript
// src/types/index.ts
export interface ServerConfig {
  port: number;
  host: string;
}

export type HandlerFunction = (request: MCPRequest) => Promise<MCPResponse>;

// src/handlers/index.ts
import { HandlerFunction, ServerConfig } from '../types/index.js';

export const listFilesHandler: HandlerFunction = async (request) => {
  // Implementation
};
```

### Dynamic Imports for CLI Tools
```typescript
// src/cli.ts
import { program } from 'commander';
import { readFile } from 'fs/promises';

program
  .command('serve')
  .action(async () => {
    const config = JSON.parse(
      await readFile('config.json', 'utf-8')
    ) as ServerConfig;
    startServer(config);
  });
```

## 5. Type Checking for child_process Usage

### Proper TypeScript Configuration
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "lib": ["ES2022"],
    "types": ["node"]
  }
}
```

### child_process with Proper Typing
```typescript
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runCommand(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command, {
      encoding: 'utf8',
      timeout: 10000
    });

    if (stderr) {
      console.warn(`Command stderr: ${stderr}`);
    }

    return stdout;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Command failed: ${error.message}`);
    }
    throw error;
  }
}

export function spawnCommand(
  command: string,
  args: string[],
  options?: SpawnOptionsWithoutStdio
): ChildProcess {
  const child = spawn(command, args, {
    stdio: 'pipe',
    ...options
  });

  child.stderr?.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  return child;
}
```

### Advanced Type Definitions
```typescript
// src/types/process.d.ts
interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal?: NodeJS.Signals;
  error?: Error;
}

interface SpawnOptionsWithoutStdio {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  detached?: boolean;
  shell?: boolean | string;
  windowsVerbatimArguments?: boolean;
}

// src/utils/process.ts
export async function safeExecute(
  command: string,
  args: string[],
  options: SpawnOptionsWithoutStdio = {}
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (exitCode, signal) => {
      resolve({
        stdout,
        stderr,
        exitCode,
        signal
      });
    });

    child.on('error', (error) => {
      resolve({
        stdout,
        stderr,
        exitCode: null,
        error
      });
    });
  });
}
```

## 6. Build Tools and Optimization

### Recommended Build Tools

#### 1. TypeScript Compiler (tsc)
```json
// package.json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "clean": "rm -rf dist"
  }
}
```

#### 2. tsup (Fast ESBuild-based Bundler)
```json
// package.json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts"
  },
  "devDependencies": {
    "tsup": "^8.0.0"
  }
}
```

#### 3. esbuild (For CLI Tools)
```typescript
// build.mjs
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  outfile: 'dist/cli.js',
  platform: 'node',
  format: 'esm',
  minify: true,
  sourcemap: true
});
```

## 7. Testing and Development Setup

### Testing Configuration
```json
// tsconfig.json
{
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}

// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### Development Tools
```json
// package.json
{
  "devDependencies": {
    "tsx": "^4.0.0",
    "nodemon": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "nodemon dist/index.js"
  }
}
```

## 8. Common Pitfalls and Solutions

### 1. Import Path Resolution
```typescript
// Bad
import { handler } from '../handlers';

// Good
import { handler } from './handlers/index.js';
// or configure tsconfig.json with baseUrl and paths
```

### 2. Type Resolution for Node.js
```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### 3. Shebang in CLI Tools
```typescript
#!/usr/bin/env node
// Must be at the very top of the file
import { program } from 'commander';
```

### 4. Proper Error Handling
```typescript
import { isError } from 'util/types';

try {
  // some operation
} catch (error) {
  if (isError(error)) {
    // Type-safe error handling
  }
}
```

## 9. Performance Considerations

### Bundle Size Optimization
- Use tree shaking with proper ESM exports
- Avoid importing large libraries for simple utilities
- Consider using `esbuild` for faster builds

### Memory Management
- Properly clean up child processes
- Use async/await consistently
- Avoid memory leaks with event listeners

## 10. Resources and Documentation

### Official Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js ESM Guide](https://nodejs.org/api/esm.html)
- [Model Context Protocol Specification](https://github.com/modelcontextprotocol/sdk)

### Community Resources
- [TypeScript Node.js Best Practices](https://github.com/typescript-eslint/typescript-eslint)
- [ESM in TypeScript](https://github.com/standard/esm)

### Configuration Templates
- [tsconfig.node.json](https://github.com/tsconfig/bases)
- [ESLint TypeScript Rules](https://typescript-eslint.io/)

---

*This research document provides a comprehensive guide for setting up TypeScript projects for MCP servers and CLI tools with modern ESM best practices.*