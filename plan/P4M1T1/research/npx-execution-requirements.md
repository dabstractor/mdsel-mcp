# npx Execution Requirements for CLI Packages

## bin Field Configuration

### String Format (single executable)
```json
{
  "bin": "./dist/index.js"
}
```

### Object Format (multiple executables)
```json
{
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  }
}
```

## Key Requirements

### 1. Shebang Line
The executable file MUST start with:
```bash
#!/usr/bin/env node
```

This is handled in tsup.config.ts via the banner option:
```typescript
export default defineConfig({
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

### 2. File Permissions
Built files need executable permissions:
```bash
chmod +x dist/index.js
```

This can be automated in the build script.

### 3. Type Field
For ESM packages, ensure package.json has:
```json
{
  "type": "module"
}
```

## How npx Works

1. **Local check** - Checks `node_modules/.bin/`
2. **Global cache** - Checks npm's global cache
3. **Temporary installation** - Downloads to cache if not present
4. **Execution** - Runs the binary specified in `bin` field

## ESM Module Considerations

### Import Extensions
Must include `.js` extensions:
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
```

### File Extensions in bin
The bin field should point to `.js` files (the built output, not TypeScript source).

## Testing npx Execution

### Local Testing with npm link
```bash
npm link
npx mdsel-mcp
```

### Testing with npm pack
```bash
npm pack
npx ./mdsel-mcp-1.0.0.tgz
```

### Direct execution test
```bash
chmod +x dist/index.js
./dist/index.js
```

## Common Issues

### File Not Found
- Verify bin path matches actual file location
- Ensure dist/ directory is built

### Permission Denied
- Files need execute permission
- Use `chmod +x dist/*.js` after build

### Shebang Issues
- Must be at very beginning of file
- Use Unix line endings (LF, not CRLF)

## Build Output Requirements

### tsup Configuration
```typescript
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
  splitting: false,
  minify: false,
  sourcemap: false,
});
```

## References

- [npm bin field documentation](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)
- [npx GitHub repository](https://github.com/npm/npx)
- [Node.js ESM documentation](https://nodejs.org/api/esm.html)
- [tsup documentation](https://tsup.egoist.dev/)
