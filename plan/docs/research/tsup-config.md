# tsup Configuration Research for Node.js CLI Packages

## Installation and Version

### Latest Installation Command
```bash
npm install tsup --save-dev
```

### Latest Version (as of December 2024)
- Check npm: https://www.npmjs.com/package/tsup
- Typical version: `^8.1.0` or higher

## Official Documentation Sources

- **Official Site**: https://tsup.egoist.dev
- **GitHub Repository**: https://github.com/egoist/tsup
- **Package on npm**: https://www.nnpmjs.com/package/tsup

## Key Configuration Requirements for CLI/MCP Server

### 1. ES Module Output (type: "module")

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  target: 'node18',
  splitting: false,
  platform: 'node',
  external: [],
})
```

### 2. Adding Shebang (#!/usr/bin/env node)

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  // ... other options
})
```

### 3. DTS (Declaration Files) Generation

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  dts: {
    // Optional: specify declaration file output directory
    compilerOptions: {
      target: 'ES2022',
    },
  },
})
```

### 4. Entry Point Configuration

For single-file builds:

```typescript
// tsup.config.ts
export default defineConfig({
  entry: {
    'index': './src/index.ts',
    // For MCP server specific entry point
    'server': './src/server.ts',
  },
  outDir: 'dist',
  format: 'esm',
  dts: true,
})
```

### 5. Node.js 18+ Compatibility

```typescript
// tsup.config.ts
export default defineConfig({
  target: 'node18',
  platform: 'node',
  minify: false, // Recommended for CLI tools
  sourcemap: false, // Optional: disable sourcemaps for cleaner distribution
})
```

### 6. Clean Output Directory

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true, // Automatically clean output directory before build
  outDir: 'dist',
  // ... other options
})
```

## Complete Example for CLI/MCP Server

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  // Entry points
  entry: {
    'index': './src/index.ts',
    'mcp-server': './src/mcp-server.ts',
  },

  // Output
  outDir: 'dist',
  format: 'esm',
  target: 'node18',
  platform: 'node',

  // Shebang for CLI compatibility
  banner: {
    js: '#!/usr/bin/env node',
  },

  // Declaration files
  dts: true,

  // Clean build
  clean: true,

  // Bundle external packages
  external: [],

  // No splitting for CLI tools
  splitting: false,

  // Optimizations
  minify: false,
  sourcemap: false,
})
```

## Package.json Integration

```json
{
  "name": "mdsel-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mdsel": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "tsup": "^8.1.0"
  }
}
```

## Key Configuration Options Reference

| Option | Type | Description |
|--------|------|-------------|
| `entry` | Object/String | Entry point(s) for the build |
| `format` | String | Output format: 'esm', 'cjs', or array |
| `outDir` | String | Output directory |
| `target` | String | Target runtime: 'node18', 'es2017', etc |
| `platform` | String | 'node', 'browser', 'neutral' |
| `dts` | Boolean/Object | Generate declaration files |
| `banner` | Object | Add banner to output files |
| `clean` | Boolean | Clean output directory |
| `external` | Array | External dependencies to not bundle |
| `minify` | Boolean | Minify output |
| `sourcemap` | Boolean | Generate sourcemaps |

## Best Practices for CLI/MCP Servers

1. **Use ESM format** for modern Node.js compatibility
2. **Include shebang** for direct execution with npx
3. **Generate DTS** for better TypeScript integration
4. **Target Node 18+** for MCP SDK compatibility
5. **Clean output** directory on each build
6. **Don't bundle external packages** that should be installed as dependencies
7. **Disable sourcemaps** in production builds for cleaner distribution
8. **Use single entry point** for simple CLI tools

## Testing CLI with npx

After building, test your CLI with:

```bash
# Make executable
chmod +x dist/index.js

# Test locally
./dist/index.js --help

# Test with npx (after publishing)
npx your-cli-package --help
```

## Resources

- [tsup Official Documentation](https://tsup.egoist.dev)
- [tsup GitHub Repository](https://github.com/egoist/tsup)
- [npm tsup Package](https://www.npmjs.com/package/tsup)
- [MCP SDK Documentation](https://modelcontextprotocol.io/docs/)