# TypeScript Configuration for Node.js ESM Projects

## Key Findings

### NodeNext Module Configuration
- Use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`
- This enables proper ESM support with Node.js
- Differs from older CommonJS configurations

### Target Version
- `"target": "ES2022"` is recommended for modern Node.js
- Ensures access to latest JavaScript features
- Compatible with Node.js 18+ (engines field should reflect this)

### Compilation Options for CLI Tools
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### File Extension Handling with ESM
- Imports must include `.js` extensions even in TypeScript source
- TypeScript compiles `.ts` to `.js` but maintains import paths
- Example: `import { foo } from './utils.js'` references `utils.ts`

### Include/Exclude Patterns
- `include`: Specify which files to compile (`["src/**/*"]`)
- `exclude`: Omit test files, node_modules, dist from compilation
- Keep it simple for this project: just src/

## Common Pitfalls with NodeNext + ESM

1. **Module resolution errors**: Ensure all imports use `.js` extensions
2. **Type errors with third-party packages**: May need `esModuleInterop: true`
3. **Output structure**: `outDir` + `rootDir` preserves directory structure

## References

- https://www.typescriptlang.org/tsconfig#module
- https://www.typescriptlang.org/tsconfig#moduleResolution
- https://nodejs.org/api/esm.html
