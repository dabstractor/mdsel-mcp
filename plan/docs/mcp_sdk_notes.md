# MCP SDK Notes

## Dependencies (from architecture documents)

### Runtime Dependencies
- `@modelcontextprotocol/sdk`: ^1.25.1
  - Import: `import { Server } from "@modelcontextprotocol/sdk/server/index.js"`
  - Import: `import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"`

- `zod`: ^3.25.0 (peer dependency of MCP SDK)
  - Used for tool parameter schemas
  - Import: `import { z } from "zod"`

### Dev Dependencies
- `typescript`: ^5.0.0
- `@types/node`: ^22.0.0

## Package Structure Reference

The package should follow this structure:
```
mdsel-mcp/
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts      # MCP server entry point with shebang
├── dist/             # Compiled output
│   └── index.js
└── README.md
```

## Known Gotchas

1. **ESM imports require .js extensions**: Even in TypeScript source
2. **Shebang in source file**: Add `#!/usr/bin/env node` at top of index.ts
3. **Bin points to compiled JS**: Not the TypeScript source
4. **mdsel CLI must be in PATH**: External dependency, not npm package

## References

- See plan/architecture/external_deps.md for full dependency specifications
- See plan/architecture/implementation_patterns.md for package.json structure
