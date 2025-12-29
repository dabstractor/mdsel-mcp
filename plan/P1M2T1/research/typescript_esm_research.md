# TypeScript ESM Patterns for Node.js CLI Tools

## Research Overview

This document covers TypeScript ESM (ES Module) patterns specifically for Node.js CLI tools, including configuration, import syntax, executable scripts, and common issues.

## 1. ESM Import Syntax

### 1.1 Basic Import Rules

When using TypeScript with ESM, you must follow these patterns:

```typescript
// ES import syntax (required)
import { parse } from 'markdown-it';
import { readFile } from 'fs/promises';

// Relative imports with .js extension
import { config } from './config.js';
import * as utils from '../utils/index.js';

// For TypeScript source files (.mts), use relative paths without extension
import { CLI } from './cli.mts';

// Dynamic imports
const markdownParser = await import('markdown-it');
```

### 1.2 Import.meta.url for File Paths

In ESM, you can't use `__dirname` and `__filename`. Use `import.meta.url` instead:

```typescript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Example: Getting project root
const projectRoot = join(__dirname, '..');
```

### 1.3 File Extension Requirements

- **Always include .js extension** for imports from `node_modules`
- **Always include .js extension** for relative imports
- TypeScript source files can omit extensions when importing other .mts files

## 2. tsconfig.json Configuration

### 2.1 Minimal ESM Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 2.2 Key Configuration Options

| Option | Description | Value |
|--------|-------------|-------|
| `module` | Sets module system for generated JavaScript | `"NodeNext"` |
| `moduleResolution` | Specifies module resolution strategy | `"NodeNext"` |
| `target` | JavaScript version for output | `"ES2022"` or higher |
| `esModuleInterop` | Enables compatibility between CommonJS and ESM | `true` |
| `allowSyntheticDefaultImports` | Allows default imports from modules without `default` export | `true` |

### 2.3 TypeScript File Extensions

- `.mts` - TypeScript ESM module
- `.cts` - TypeScript CommonJS module
- `.ts` - Default (inherit from project configuration)
- `.tsx` - TypeScript React component file

## 3. package.json Configuration

### 3.1 Basic ESM Package

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "my-cli": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.mts"
  },
  "keywords": ["cli", "typescript", "esm"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "commander": "^11.0.0",
    "markdown-it": "^13.0.0"
  }
}
```

### 3.2 Dual Package Exports (Optional)

For better npm compatibility:

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./package.json": "./package.json"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "my-cli": "./dist/index.js"
  }
}
```

## 4. Executable Scripts

### 4.1 Making Scripts Executable

Create your entry point file (e.g., `src/index.mts`):

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'fs/promises';

const program = new Command();

program
  .name('my-cli')
  .description('My awesome CLI tool')
  .version('1.0.0');

program
  .command('build')
  .description('Build the project')
  .option('-o, --output <path>', 'Output directory', './dist')
  .action(async (options) => {
    console.log('Building to:', options.output);
    // Add your build logic here
  });

await program.parseAsync();
```

### 4.2 Build Configuration

Make sure your build output files are executable:

```json
// package.json scripts
{
  "scripts": {
    "build": "tsc",
    "postbuild": "chmod +x dist/*.js"
  }
}
```

### 4.3 Development with Shebang

For development, you can use `tsx` to run TypeScript files directly:

```bash
npm install -D tsx
npx tsx src/index.mts --help
```

## 5. Common Gotchas and Solutions

### 5.1 Gotcha: Missing File Extensions

**Problem**:
```
Error: Cannot find module './config'
```

**Solution**: Always include `.js` extension in imports:
```typescript
// Wrong
import { config } from './config';

// Right
import { config } from './config.js';
```

### 5.2 Gotcha: CommonJS Module Import Issues

**Problem**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'commander'
```

**Solution**: Make sure you're using ES import syntax and have `"esModuleInterop": true`:

```typescript
// Wrong
const { Command } = require('commander');

// Right
import { Command } from 'commander';
```

### 5.3 Gotcha: __dirname/__filename Not Defined

**Problem**: ReferenceError: __dirname is not defined

**Solution**: Use `import.meta.url`:

```typescript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
```

### 5.4 Gotcha: Async Command Parsing

**Problem**: Commands don't work when using `await` in main script

**Solution**: Use `program.parseAsync()` instead of `program.parse()`:

```typescript
// Wrong
program.parse();

// Right
await program.parseAsync();
```

### 5.5 Gotcha: Path Resolution Issues

**Problem**: Incorrect paths when building and running from different directories

**Solution**: Use relative paths from `__dirname`:

```typescript
import { join } from 'path';
import { readFileSync } from 'fs';

const templatePath = join(__dirname, '../templates/default.md');
const template = readFileSync(templatePath, 'utf-8');
```

### 5.6 Gotcha: TypeScript Resolution Errors

**Problem**:
```
Option 'moduleResolution' cannot be specified without specifying 'module'.
```

**Solution**: Ensure both `module` and `moduleResolution` are set to compatible values:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

## 6. Recommended Tooling

### 6.1 Development Tools

```json
{
  "devDependencies": {
    "tsx": "^4.0.0",     // Run TypeScript files directly
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 6.2 Build Tools

```json
{
  "devDependencies": {
    "esbuild": "^0.19.0",    // Fast bundler
    "tsup": "^8.0.0",       // TypeScript bundler
    "pkg": "^5.8.0"         // Create standalone executables
  }
}
```

## 7. Example Complete Project Structure

```
my-cli-tool/
├── src/
│   ├── index.mts          # CLI entry point
│   ├── commands/
│   │   ├── build.mts      # Build command
│   │   └── serve.mts      # Serve command
│   ├── utils/
│   │   ├── logger.ts      # Logging utilities
│   │   └── config.ts      # Configuration
│   └── types/
│       └── cli.ts         # TypeScript interfaces
├── templates/
│   └── default.md         # Default template
├── dist/                  # Build output
│   ├── index.js
│   ├── index.d.ts
│   └── commands/
├── package.json
├── tsconfig.json
└── README.md
```

## 8. Best Practices

1. **Use TypeScript strict mode** to catch more errors at compile time
2. **Always include file extensions** in imports (except for .mts files)
3. **Use `program.parseAsync()`** for CLI tools with async operations
4. **Structure commands in separate files** for better organization
5. **Include proper type definitions** for all dependencies
6. **Test both development and built versions** of your CLI tool
7. **Use `.gitignore`** to exclude `dist/` and `node_modules/`

## 9. Further Reading

### Documentation Resources

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [MDN - ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### Community Resources

- [Stack Overflow: TypeScript ESM](https://stackoverflow.com/questions/tagged/typescript+esmodules)
- [GitHub Discussions: TypeScript](https://github.com/microsoft/TypeScript/discussions)
- r/typescript on Reddit

### Recommended Tools

- [tsx](https://github.com/privatenumber/tsx) - Execute TypeScript files
- [tsup](https://github.com/egoist/tsup) - TypeScript bundler
- [esbuild](https://esbuild.github.io/) - Fast JavaScript bundler