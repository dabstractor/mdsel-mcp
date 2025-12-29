# PRP: Build Pipeline for mdsel-mcp

---

## Goal

**Feature Goal**: Configure a complete TypeScript build pipeline that produces executable JavaScript output compatible with npx execution and MCP server distribution.

**Deliverable**: A working build system with npm scripts that compile TypeScript to JavaScript, ensure proper file permissions, and validate that the built package can be executed via npx.

**Success Definition**:
- Running `npm run build` compiles `src/index.ts` to `dist/index.js` without errors
- The built `dist/index.js` has executable permissions (`chmod +x`)
- The package can be executed via `npx mdsel-mcp` after local linking (`npm link`)
- The shebang (`#!/usr/bin/env node`) is present at line 1 of `dist/index.js`
- TypeScript declaration files (`.d.ts`) are generated in `dist/`

## User Persona (if applicable)

**Target User**: Developers who will install and use the mdsel-mcp server via npx or npm install.

**Use Case**: Users install the package globally or via npx and run the MCP server to integrate with their MCP clients.

**User Journey**:
1. User runs `npx mdsel-mcp`
2. npx resolves the package and executes the bin entry point
3. The MCP server starts on stdio transport
4. Server exposes `mdsel.index` and `mdsel.select` tools

**Pain Points Addressed**:
- No need to manually clone and build the repository
- No need to install TypeScript dependencies
- Instant usage via single command (`npx mdsel-mcp`)

## Why

- **Distribution**: Enables publishing to npm registry for widespread adoption
- **Convenience**: Users can execute via npx without local installation
- **Integration**: Allows MCP clients to discover and use the server automatically
- **Standardization**: Follows npm ecosystem conventions for CLI packages

## What

Configure the build pipeline with the following components:

1. **Build Script**: Compile TypeScript to JavaScript using `tsc`
2. **Post-Build Script**: Ensure executable permissions on output files
3. **Prepack Hook**: Automatically build before npm pack/publish
4. **Validation Scripts**: Test that the built binary executes correctly

### Success Criteria

- [ ] `npm run build` completes without errors
- [ ] `dist/index.js` exists and is executable (`ls -la dist/index.js` shows `-rwxr-xr-x`)
- [ ] `dist/index.js` has shebang `#!/usr/bin/env node` as first line
- [ ] `dist/index.d.ts` declaration file is generated
- [ ] `npm link && npx mdsel-mcp --help` (or equivalent) executes without error
- [ ] `npm pack` produces a tarball with correct files

## All Needed Context

### Context Completeness Check

The current codebase already has:
- package.json with basic build script
- tsconfig.json with proper compiler options
- src/index.ts with shebang
- Working MCP server implementation

What needs to be added:
- Post-build step for executable permissions
- Prepack hook for automatic building
- Additional validation scripts

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
  why: Official documentation on bin field configuration for executable packages
  critical: The bin field must point to the compiled JavaScript, not TypeScript source

- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files
  why: Understanding what files are included in published packages
  critical: Only include dist/ in published package, not src/

- url: https://docs.npmjs.com/cli/v10/using-npm/scripts
  why: Understanding npm lifecycle scripts (prepack, prepublishOnly, postbuild)
  critical: prepack runs before npm pack and npm publish

- url: https://www.typescriptlang.org/docs/handbook/compiler-options.html
  why: TypeScript compiler options reference
  critical: outDir, rootDir, declaration, and esModuleInterop settings

- url: https://github.com/modelcontextprotocol/servers
  why: Official MCP servers repository for build pattern reference
  critical: See how official servers configure their build scripts
  section: Look at package.json in any server subdirectory

- file: /home/dustin/projects/mdsel-mcp-glm/package.json
  why: Current package.json configuration - base for modifications
  pattern: bin field points to ./dist/index.js, scripts already have basic "build"
  gotcha: The build script exists but doesn't set executable permissions

- file: /home/dustin/projects/mdsel-mcp-glm/tsconfig.json
  why: Current TypeScript configuration - already properly configured
  pattern: ES2022 target, NodeNext module, outDir ./dist, rootDir ./src
  gotcha: Configuration is correct, no changes needed

- file: /home/dustin/projects/mdsel-mcp-glm/src/index.ts
  why: Main entry point with shebang - must be preserved in build output
  pattern: Shebang on line 1: `#!/usr/bin/env node`
  gotcha: TypeScript compiler preserves comments but shebang handling varies by version

- file: https://github.com/modelcontextprotocol/servers/blob/main/src/everything/package.json
  why: Official MCP server build script pattern to follow
  pattern: "build": "tsc && shx chmod +x dist/*.js"
  gotcha: Uses shx for cross-platform chmod compatibility
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-mcp-glm
├── dist/
│   ├── index.d.ts      # TypeScript declarations (generated by build)
│   └── index.js        # Compiled JavaScript (generated by build)
├── package.json        # Package configuration (needs build script updates)
├── tsconfig.json       # TypeScript compiler config (correct as-is)
└── src/
    └── index.ts        # Source code with shebang (line 1: #!/usr/bin/env node)
```

### Desired Codebase Tree (after implementation)

```bash
/home/dustin/projects/mdsel-mcp-glm
├── dist/
│   ├── index.d.ts      # Generated declaration file
│   └── index.js        # Generated executable (with shebang, chmod +x)
├── package.json        # UPDATED: enhanced scripts
├── tsconfig.json       # Unchanged
└── src/
    └── index.ts        # Unchanged
```

### Known Gotchas of Our Codebase & Library Quirks

```javascript
// CRITICAL: Shebang preservation
// The shebang in src/index.ts (line 1) must be preserved in dist/index.js
// TypeScript 5.0+ preserves comments, but verify the first line is exactly:
// #!/usr/bin/env node

// CRITICAL: Executable permissions
// The chmod +x step is ESSENTIAL for npx execution
// Without it, npx may fail with "permission denied" on some systems
// Use shx for cross-platform compatibility (Windows doesn't have native chmod)

// CRITICAL: prepack vs prepublishOnly
// prepublishOnly runs on npm publish BUT NOT on npm pack
// prepack runs on BOTH npm publish AND npm pack
// Use prepack for local testing with npm pack

// GOTCHA: TypeScript compile order
// tsc must complete before chmod runs (use &&, not &)
// Incorrect: "build": "tsc & chmod +x dist/*.js"
// Correct:   "build": "tsc && chmod +x dist/*.js"

// GOTCHA: File permissions in npm packages
// npm does NOT preserve file permissions in published tarballs by default
// The chmod must run AFTER npm pack extracts the tarball during installation
// Solution: Use "prepack" script which runs before packaging, not "postbuild"

// GOTCHA: npx local testing
// When testing locally, use `npm link` first, then `npx mdsel-mcp`
// Without npm link, npx won't find the local package
```

## Implementation Blueprint

### Data Models and Structure

No new data models required - this is a build infrastructure task.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: MODIFY package.json - Add postbuild script for executable permissions
  - IMPLEMENT: "postbuild": "shx chmod +x dist/*.js"
  - FOLLOW pattern: Official MCP servers use shx for cross-platform chmod
  - NAMING: npm lifecycle script "postbuild" runs automatically after "build"
  - DEPENDENCIES: Requires shx package (add to devDependencies)
  - PLACEMENT: package.json scripts section

Task 2: MODIFY package.json - Add prepack hook
  - IMPLEMENT: "prepack": "npm run build"
  - FOLLOW pattern: npm lifecycle hooks for automatic build before packaging
  - NAMING: npm lifecycle script "prepack"
  - DEPENDENCIES: Requires Task 1 (build script)
  - PLACEMENT: package.json scripts section

Task 3: MODIFY package.json - Add shx to devDependencies
  - IMPLEMENT: "shx": "^0.3.4" or latest version
  - FOLLOW pattern: Official MCP servers use shx for cross-platform shell commands
  - NAMING: shx package in devDependencies
  - DEPENDENCIES: None (new dependency)
  - PLACEMENT: package.json devDependencies section

Task 4: MODIFY package.json - Add files field for distribution
  - IMPLEMENT: "files": ["dist", "README.md", "LICENSE"]
  - FOLLOW pattern: Limit published package to compiled output only
  - NAMING: files array in package.json root
  - DEPENDENCIES: None (publishing optimization)
  - PLACEMENT: package.json root level

Task 5: MODIFY package.json - Add validation scripts
  - IMPLEMENT: "check:build": "test -f dist/index.js && test -x dist/index.js"
  - FOLLOW pattern: Shell-based validation of build output
  - NAMING: check:build npm script
  - ALTERNATIVE: For Windows compatibility, use Node.js-based validation
  - DEPENDENCIES: Requires Task 1 (build output)
  - PLACEMENT: package.json scripts section

Task 6: VERIFY build output shebang preservation
  - IMPLEMENT: Manual verification step - run build, check first line of dist/index.js
  - FOLLOW pattern: head -n 1 dist/index.js should show #!/usr/bin/env node
  - NAMING: Manual verification step
  - DEPENDENCIES: Requires Task 1 (build script)
  - PLACEMENT: Validation section, not automated

Task 7: VALIDATE npx execution locally
  - IMPLEMENT: npm link && npx mdsel-mcp (test execution)
  - FOLLOW pattern: Standard npx testing workflow
  - NAMING: Manual testing step in validation
  - DEPENDENCIES: Requires all previous tasks
  - PLACEMENT: Validation section, not automated
```

### Implementation Patterns & Key Details

```json
// package.json pattern for build pipeline
{
  "name": "mdsel-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "postbuild": "shx chmod +x dist/*.js",
    "prepack": "npm run build",
    "check:build": "test -f dist/index.js && test -x dist/index.js",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "shx": "^0.3.4",
    "typescript": "^5.0.0"
  }
}

// CRITICAL: Script execution order
// 1. User runs `npm run build`
// 2. tsc compiles TypeScript
// 3. postbuild runs automatically: chmod +x dist/*.js
// 4. User runs `npm pack`
// 5. prepack runs automatically: npm run build (which runs steps 2-3)
// 6. tarball is created with executable files

// CRITICAL: npx local testing workflow
// Step 1: npm run build        # Build the package
// Step 2: npm link             # Link package globally
// Step 3: npx mdsel-mcp        # Test npx execution (uses local linked version)
```

### Integration Points

```yaml
PACKAGE_JSON:
  - modify: package.json
  - add: postbuild script with shx chmod +x
  - add: prepack script calling npm run build
  - add: files field limiting to dist/
  - add: shx to devDependencies

DEPENDENCIES:
  - add: shx@^0.3.4 to devDependencies

BUILD_OUTPUT:
  - verify: dist/index.js has shebang on line 1
  - verify: dist/index.js has executable permissions (chmod +x)
  - verify: dist/index.d.ts is generated
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# After modifying package.json - validate JSON syntax
cat package.json | jq . > /dev/null
# Expected: No output = valid JSON

# Verify shx is available (after npm install)
npx shx --version
# Expected: shx version output

# TypeScript compilation (build script)
npm run build
# Expected: Clean compilation, no errors, dist/index.js and dist/index.d.ts created
```

### Level 2: Build Output Validation (Component Validation)

```bash
# Verify dist/index.js exists
test -f dist/index.js && echo "File exists" || echo "File missing"
# Expected: File exists

# Verify shebang is preserved (first line check)
head -n 1 dist/index.js
# Expected: #!/usr/bin/env node

# Verify executable permissions
ls -la dist/index.js
# Expected: -rwxr-xr-x (executable bit set)

# Verify declaration file
test -f dist/index.d.ts && echo "Declaration exists" || echo "Declaration missing"
# Expected: Declaration exists

# Run check:build script
npm run check:build 2>/dev/null || echo "Build check script not implemented"
# Expected: No output = all checks pass
```

### Level 3: Integration Testing (System Validation)

```bash
# Test local linking
npm link
# Expected: /home/dustin/.nvm/versions/node/vXX.XX/bin/mdsel-mcp -> ... symlink created

# Test npx execution (this will use the linked local version)
npx mdsel-mcp
# Expected: MCP server starts (may wait for stdio input, can Ctrl+C to exit)

# Alternative: Test that the binary is found
which mdsel-mcp
# Expected: Path to the linked binary

# Test npm pack (verifies prepack hook works)
npm pack
# Expected: Creates mdsel-mcp-1.0.0.tgz with compiled files

# Verify tarball contents
tar -tzf mdsel-mcp-1.0.0.tgz | grep -E "(dist/|package.json)"
# Expected: dist/index.js, dist/index.d.ts, package.json listed
# NOT expected: src/ directory (should not be in tarball)

# Cleanup test tarball
rm mdsel-mcp-1.0.0.tgz

# Cleanup link when done
npm unlink -g mdsel-mcp
```

### Level 4: MCP Server Functional Validation

```bash
# Verify the MCP server starts correctly
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}' | \
  node dist/index.js
# Expected: JSON-RPC response with server capabilities

# Verify tools are listed
echo '{"jsonrpc":"2.0","method":"tools/list","id":2}' | \
  node dist/index.js
# Expected: JSON array with mdsel.index and mdsel.select tools

# Note: These tests send a single JSON-RPC message and expect a response
# The server exits after response because stdin closes
```

## Final Validation Checklist

### Technical Validation

- [ ] npm run build completes without errors
- [ ] dist/index.js exists with shebang as first line
- [ ] dist/index.js has executable permissions (rwxr-xr-x)
- [ ] dist/index.d.ts declaration file is generated
- [ ] npm link succeeds
- [ ] npx mdsel-mcp executes the server
- [ ] npm pack creates tarball with dist/ but not src/
- [ ] tar -tzf shows correct files in package

### Feature Validation

- [ ] Build script produces working JavaScript output
- [ ] Shebang is preserved in compiled output
- [ ] Executable permissions are set automatically
- [ ] prepack hook triggers build on npm pack
- [ ] npx can execute the package after local linking

### Code Quality Validation

- [ ] package.json JSON is valid
- [ ] Scripts follow npm naming conventions
- [ ] Files field limits published content to dist/
- [ ] shx dependency is added to devDependencies

### Documentation & Deployment

- [ ] Build process is documented in comments
- [ ] Validation commands are clear and repeatable

---

## Anti-Patterns to Avoid

- ❌ Don't use native chmod (fails on Windows) - use shx for cross-platform compatibility
- ❌ Don't put chmod before tsc - it must run after compilation
- ❌ Don't use prepublishOnly - use prepack for local testing support
- ❌ Don't forget to add shx to devDependencies - it's not installed by default
- ❌ Don't skip verifying shebang preservation - TypeScript versions may behave differently
- ❌ Don't publish src/ directory - use files field to limit to dist/
- ❌ Don't skip npm pack testing - prepack hooks may have issues
- ❌ Don't assume executable permissions persist - verify in tarball contents
