# npm package.json Research for CLI Tools

## Key Findings

### bin Field Configuration
- The `bin` field should point to **compiled JavaScript**, not TypeScript source
- Format: `"bin": { "cli-name": "./dist/index.js" }` or `"bin": "./dist/index.js"`
- npm creates symlinks when package is installed

### Shebang Requirements
- Add `#!/usr/bin/env node` at the top of the entry TypeScript file
- Compiled JS will retain the shebang
- Ensure execute permissions: `chmod +x dist/index.js`

### ESM Module Configuration
- Set `"type": "module"` in package.json
- All imports must use `.js` extensions even for TypeScript source
- Example: `import { foo } from './utils.js'` (not `.ts`)

### Common Scripts
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "prepublishOnly": "npm run build && chmod +x dist/index.js"
  }
}
```

### Additional Fields
- `engines`: Specify Node.js version requirement
- `files`: Control what's included in published package
- `exports`: Modern alternative to `main` field

## Common Gotchas

1. **Forgot to compile before publishing**: Use `prepublishOnly` hook
2. **Missing .js extensions in imports**: ESM requires explicit file extensions
3. **Shebang not preserved**: Ensure source file has shebang at top
4. **Execute permissions lost**: Add chmod step to build script

## References

- https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
- https://nodejs.org/api/packages.html#packages_type
- https://www.typescriptlang.org/docs/handbook/modules/reference.html
