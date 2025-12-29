# Product Requirement Prompt (PRP): P1.M1.T1 - Initialize npm package

---

## Goal

**Feature Goal**: Initialize a complete Node.js/TypeScript project structure that enables compilation to an npx-executable MCP server wrapping the `mdsel` CLI.

**Deliverable**: Three configuration files (`package.json`, `tsconfig.json`, `src/index.ts` placeholder) with all dependencies installed and project verified to compile successfully.

**Success Definition**:
- `package.json` exists at project root with correct metadata, dependencies, and bin entry
- `tsconfig.json` exists with NodeNext ESM configuration
- `src/index.ts` exists as a placeholder with shebang
- `npm install` completes successfully
- `npx tsc` compiles without errors, producing `dist/index.js`
- `dist/index.js` is executable with shebang intact

---

## Why

This is the foundation task for **P1: MVP: Functional MCP Server**. Without proper package initialization:
- Subsequent tasks (MCP server implementation, CLI execution layer) cannot proceed
- TypeScript compilation will fail with cryptic errors
- npx execution model will not work
- All downstream milestones (P1.M2-P1.M5) depend on this scaffolding

---

## What

Create the initial Node.js package structure for an ESM-based TypeScript CLI tool that:
1. Can be executed via `npx mdsel-mcp`
2. Compiles TypeScript to JavaScript in `dist/` directory
3. Uses modern Node.js ESM modules (`type: "module"`)
4. Has correct MCP SDK dependencies installed

### Success Criteria

- [ ] `package.json` at root with name="mdsel-mcp", version="1.0.0", type="module", bin pointing to ./dist/index.js
- [ ] `tsconfig.json` at root with target="ES2022", module="NodeNext", moduleResolution="NodeNext", outDir="./dist", rootDir="./src"
- [ ] `src/index.ts` placeholder with `#!/usr/bin/env node` shebang
- [ ] `npm install` completes without errors, `node_modules/` contains @modelcontextprotocol/sdk and zod
- [ ] `npm run build` (tsc) compiles src/index.ts to dist/index.js without errors
- [ ] `dist/index.js` has shebang and is executable

---

## All Needed Context

### Context Completeness Check

**"No Prior Knowledge" test**: If someone knew nothing about this codebase, would they have everything needed to implement this successfully?

**YES** - This PRP provides:
- Exact file contents with all field values specified
- Directory structure showing where files go
- Dependency versions and their purpose
- Step-by-step implementation with validation commands
- Gotchas specific to ESM + NodeNext + TypeScript combination

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- docfile: plan/architecture/system_context.md
  why: High-level architecture showing MCP server as stdio transport wrapper around mdsel CLI
  critical: Target file structure shows dist/ output directory, src/ source directory

- docfile: plan/architecture/external_deps.md
  why: Exact dependency versions and peer dependency requirements
  critical: @modelcontextprotocol/sdk ^1.25.1 requires zod ^3.25.0 as peer dependency

- docfile: plan/architecture/implementation_patterns.md
  why: Contains exact package.json and tsconfig.json structure to follow
  critical: Shows bin entry, type: "module", scripts configuration

- docfile: plan/architecture/implementation_patterns.md
  why: Lines 98-122 contain exact package.json structure
  section: "## Package.json Configuration"
  pattern: Copy all fields exactly as shown

- docfile: plan/architecture/implementation_patterns.md
  why: Lines 124-140 contain exact tsconfig.json structure
  section: "## tsconfig.json Configuration"
  pattern: Copy all compilerOptions exactly as shown

- file: plan/P1M1T1/research/npm_package_patterns.md
  why: npm CLI tool patterns including bin field, shebang, ESM configuration
  critical: bin points to compiled JS (./dist/index.js), not TypeScript source

- file: plan/P1M1T1/research/typescript_esm_config.md
  why: NodeNext module configuration specifics for ESM projects
  critical: Imports in .ts files must use .js extensions

- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
  why: Official documentation on bin field configuration
  critical: Understanding symlink creation and execute permissions

- url: https://nodejs.org/api/packages.html#packages_type
  why: Official Node.js ESM documentation
  critical: type: "module" affects all .js files in package

- url: https://www.typescriptlang.org/tsconfig#module
  why: TypeScript module configuration reference
  critical: NodeNext is required for ESM support
```

### Current Codebase Tree

```bash
# This is a GREENFIELD project - no existing source code
/home/dustin/projects/mdsel-mcp-glm
├── plan/
│   ├── architecture/
│   │   ├── external_deps.md      # Dependency specifications
│   │   ├── implementation_patterns.md  # Exact package.json/tsconfig structures
│   │   └── system_context.md     # Architecture overview
│   └── P1M1T1/
│       └── research/             # Research findings for this task
├── PRD.md                         # Product requirements
└── tasks.json                     # Task breakdown
```

### Desired Codebase Tree After This Task

```bash
/home/dustin/projects/mdsel-mcp-glm
├── node_modules/                  # Created by npm install
│   ├── @modelcontextprotocol/     # MCP SDK
│   └── zod/                       # Schema validation
├── dist/                          # Created by tsc build
│   └── index.js                   # Compiled from src/index.ts
├── src/                           # NEW - Source directory
│   └── index.ts                   # NEW - Placeholder with shebang
├── package.json                   # NEW - NPM package manifest
├── tsconfig.json                  # NEW - TypeScript configuration
├── plan/                          # (unchanged)
├── PRD.md                         # (unchanged)
└── tasks.json                     # (unchanged)
```

### Known Gotchas of Our Codebase & Library Quirks

```javascript
// CRITICAL: ESM + TypeScript requires .js extensions in imports
// Even in .ts files, imports must reference .js:
// import { Server } from "./server.js";  // NOT "./server"

// CRITICAL: Shebang must be FIRST LINE of src/index.ts
// #!/usr/bin/env node
// No blank lines before shebang!

// CRITICAL: bin field points to COMPILED JS, not TypeScript source
// "bin": { "mdsel-mcp": "./dist/index.js" }  // Correct
// "bin": { "mdsel-mcp": "./src/index.ts" }  // WRONG - won't work

// CRITICAL: type: "module" in package.json makes ALL .js files ESM
// Cannot mix require() (CommonJS) with import (ESM) in same package

// CRITICAL: NodeNext moduleResolution is required for proper ESM
// Do not use "nodenext" or "Node16" - exact case: "NodeNext"

// GOTCHA: zod is a PEER DEPENDENCY of @modelcontextprotocol/sdk
// Must be listed in dependencies, not devDependencies

// GOTCHA: @modelcontextprotocol/sdk uses ESM exports
// Import path must include .js extension:
// import { Server } from "@modelcontextprotocol/sdk/server/index.js";
```

---

## Implementation Blueprint

### Data Models and Structure

No data models for this task - pure configuration files.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE package.json at project root
  - IMPLEMENT: Complete package.json with all required fields
  - CONTENT: See "Exact File Contents" section below
  - NAMING: File named exactly "package.json" (lowercase)
  - PLACEMENT: /home/dustin/projects/mdsel-mcp-glm/package.json
  - CONTAINS:
    * name: "mdsel-mcp"
    * version: "1.0.0"
    * type: "module"
    * bin: { "mdsel-mcp": "./dist/index.js" }
    * main: "./dist/index.js"
    * scripts.build: "tsc"
    * scripts.start: "node dist/index.js"
    * dependencies: @modelcontextprotocol/sdk ^1.25.1, zod ^3.25.0
    * devDependencies: typescript ^5.0.0, @types/node ^22.0.0

Task 2: CREATE tsconfig.json at project root
  - IMPLEMENT: TypeScript configuration for NodeNext ESM
  - CONTENT: See "Exact File Contents" section below
  - NAMING: File named exactly "tsconfig.json" (lowercase)
  - PLACEMENT: /home/dustin/projects/mdsel-mcp-glm/tsconfig.json
  - DEPENDENCIES: Requires package.json to exist first (for type: "module" alignment)
  - CONTAINS:
    * compilerOptions.target: "ES2022"
    * compilerOptions.module: "NodeNext"
    * compilerOptions.moduleResolution: "NodeNext"
    * compilerOptions.outDir: "./dist"
    * compilerOptions.rootDir: "./src"
    * compilerOptions.esModuleInterop: true
    * compilerOptions.strict: true
    * compilerOptions.declaration: true
    * include: ["src/**/*"]

Task 3: CREATE src directory and index.ts placeholder
  - IMPLEMENT: Empty TypeScript file with shebang
  - CONTENT: See "Exact File Contents" section below
  - NAMING: src/index.ts (directory "src", file "index.ts")
  - PLACEMENT: /home/dustin/projects/mdsel-mcp-glm/src/index.ts
  - CRITICAL: First line must be exactly "#!/usr/bin/env node"
  - CONTENT: Shebang + minimal comment explaining placeholder

Task 4: RUN npm install
  - EXECUTE: npm install command in project root
  - VALIDATE: node_modules/ directory created
  - VALIDATE: @modelcontextprotocol/sdk exists in node_modules/
  - VALIDATE: zod exists in node_modules/
  - VALIDATE: typescript exists in node_modules/
  - VALIDATE: @types/node exists in node_modules/

Task 5: RUN npm run build (tsc compilation)
  - EXECUTE: npx tsc command
  - VALIDATE: dist/ directory created
  - VALIDATE: dist/index.js exists
  - VALIDATE: dist/index.js has shebang at first line
  - VALIDATE: No compilation errors in terminal output
```

### Exact File Contents

#### package.json (EXACT CONTENT - Use as-is)

```json
{
  "name": "mdsel-mcp",
  "version": "1.0.0",
  "description": "MCP server for mdsel CLI - Declarative Markdown Selection",
  "type": "module",
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.25.1",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### tsconfig.json (EXACT CONTENT - Use as-is)

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

#### src/index.ts (PLACEHOLDER CONTENT)

```typescript
#!/usr/bin/env node

// Placeholder entry point for mdsel-mcp MCP server
// MCP server implementation will be added in P1.M2 tasks
```

### Implementation Patterns & Key Details

```bash
# Pattern: Create src/ directory if it doesn't exist
mkdir -p src

# Pattern: Check if file exists before creating (avoid overwrites)
test -f package.json && echo "package.json already exists" || echo "creating..."

# Pattern: Validate JSON syntax after creation
jq empty package.json 2>&1 || echo "Invalid JSON"
cat tsconfig.json | jq empty 2>&1 || echo "Invalid JSON"
```

### Integration Points

```yaml
NO EXTERNAL INTEGRATIONS for this task - pure scaffolding

NEXT TASK DEPENDENCIES:
  - P1.M1.T1.S3 completion enables P1.M2.T1 (MCP Server Bootstrap)
  - dist/index.js will become MCP server entry point
  - node_modules/ provides @modelcontextprotocol/sdk imports
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding

# Validate package.json syntax
jq empty /home/dustin/projects/mdsel-mcp-glm/package.json
# Expected: No output (exit code 0)

# Validate tsconfig.json syntax
jq empty /home/dustin/projects/mdsel-mcp-glm/tsconfig.json
# Expected: No output (exit code 0)

# Verify TypeScript source file exists
test -f /home/dustin/projects/mdsel-mcp-glm/src/index.ts
# Expected: Exit code 0

# Verify shebang in index.ts (first line check)
head -n1 /home/dustin/projects/mdsel-mcp-glm/src/index.ts | grep -q "#!/usr/bin/env node"
# Expected: Exit code 0

# Expected: All validations pass with exit code 0
# If any fail, READ output and fix before proceeding to npm install
```

### Level 2: Dependency Installation (Component Validation)

```bash
# Change to project directory
cd /home/dustin/projects/mdsel-mcp-glm

# Install dependencies
npm install
# Expected: Downloads packages, creates node_modules/, creates package-lock.json

# Verify critical dependencies exist
test -d node_modules/@modelcontextprotocol/sdk && echo "MCP SDK found"
test -d node_modules/zod && echo "zod found"
test -d node_modules/typescript && echo "typescript found"
test -d node_modules/@types/node && echo "@types/node found"

# Expected: All four checks print "found"
# If any dependency missing, check package.json dependencies section
```

### Level 3: TypeScript Compilation (System Validation)

```bash
# Run TypeScript compiler
cd /home/dustin/projects/mdsel-mcp-glm
npx tsc
# Expected: No error output, creates dist/index.js

# Verify compiled output exists
test -f dist/index.js && echo "Compiled output found"

# Verify shebang preserved in compiled output
head -n1 dist/index.js | grep -q "#!/usr/bin/env node" && echo "Shebang intact"

# Verify dist/index.js is readable
cat dist/index.js | head -n5
# Expected output:
# #!/usr/bin/env node
#
# // Placeholder entry point for mdsel-mcp MCP server
# // MCP server implementation will be added in P1.M2 tasks

# Expected: All validations pass, dist/index.js exists with shebang
```

### Level 4: Build Script Validation (Project-Level)

```bash
# Test npm run build script
cd /home/dustin/projects/mdsel-mcp-glm
npm run build
# Expected: Runs tsc successfully, no errors

# Clean rebuild test
rm -rf dist/
npm run build
test -f dist/index.js && echo "Clean rebuild successful"

# Expected: Build script works, dist/index.js created
```

---

## Final Validation Checklist

### Technical Validation

- [ ] package.json exists at /home/dustin/projects/mdsel-mcp-glm/package.json
- [ ] package.json passes `jq empty` validation (valid JSON)
- [ ] package.json has type: "module", bin entry, correct dependencies
- [ ] tsconfig.json exists at /home/dustin/projects/mdsel-mcp-glm/tsconfig.json
- [ ] tsconfig.json has module: "NodeNext", moduleResolution: "NodeNext"
- [ ] src/index.ts exists with shebang as first line
- [ ] `npm install` completed successfully (node_modules/ created)
- [ ] @modelcontextprotocol/sdk, zod, typescript, @types/node all installed
- [ ] `npx tsc` compiles without errors
- [ ] dist/index.js exists with shebang intact

### Feature Validation

- [ ] Package name is "mdsel-mcp" (exact spelling, lowercase with hyphen)
- [ ] Version is "1.0.0" (semver format)
- [ ] Bin entry points to "./dist/index.js" (compiled JS, not source)
- [ ] TypeScript target is ES2022 (modern JavaScript features)
- [ ] Module system is ESM (not CommonJS)
- [ ] Source directory is src/, output directory is dist/

### Code Quality Validation

- [ ] package.json formatted as valid JSON (use jq or prettier if desired)
- [ ] tsconfig.json formatted as valid JSON
- [ ] src/index.ts has shebang and minimal placeholder comment
- [ ] No linting errors (if project adds linter later)
- [ ] Files use LF line endings (Git default)

### Dependency Validation

- [ ] @modelcontextprotocol/sdk version ^1.25.1 in dependencies
- [ ] zod version ^3.25.0 in dependencies (peer dependency of MCP SDK)
- [ ] typescript version ^5.0.0 in devDependencies
- [ ] @types/node version ^22.0.0 in devDependencies
- [ ] node_modules/ contains all four dependencies

---

## Anti-Patterns to Avoid

- **Don't** put bin entry pointing to src/index.ts - must point to compiled dist/index.js
- **Don't** forget the shebang (#!/usr/bin/env node) at the very top of src/index.ts
- **Don't** use CommonJS syntax (require/module.exports) - this is an ESM package
- **Don't** omit .js extensions in future import statements - ESM requires them
- **Don't** use "nodenext" with wrong casing - must be exactly "NodeNext"
- **Don't** put zod in devDependencies - it's a runtime peer dependency
- **Don't** skip validation steps - each catch configuration errors early
- **Don't** proceed to next tasks until all validations pass
- **Don't** forget type: "module" in package.json - ESM requires explicit declaration
- **Don't** use old module settings like "commonjs" or "es6" - NodeNext is required

---

## Confidence Score

**9/10** - One-pass implementation success likelihood

**Justification**:
- Exact file contents provided with no ambiguity
- Comprehensive validation commands for each step
- All gotchas documented with specific examples
- Greenfield project means no legacy code to contend with
- External dependency references (MCP SDK) well-documented in architecture

**Risk Factors**:
- User's Node.js/npm version compatibility (mitigated by engines field)
- Network issues during npm install (mitigated by validation steps)

---

## Appendix: Quick Reference

### File Creation Commands (if creating manually)

```bash
# Create package.json
cat > /home/dustin/projects/mdsel-mcp-glm/package.json << 'EOF'
{
  "name": "mdsel-mcp",
  "version": "1.0.0",
  "description": "MCP server for mdsel CLI - Declarative Markdown Selection",
  "type": "module",
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  },
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.25.1",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create tsconfig.json
cat > /home/dustin/projects/mdsel-mcp-glm/tsconfig.json << 'EOF'
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
EOF

# Create src/index.ts placeholder
mkdir -p /home/dustin/projects/mdsel-mcp-glm/src
cat > /home/dustin/projects/mdsel-mcp-glm/src/index.ts << 'EOF'
#!/usr/bin/env node

// Placeholder entry point for mdsel-mcp MCP server
// MCP server implementation will be added in P1.M2 tasks
EOF
```

### Validation One-Liner

```bash
# Run all validations in sequence
cd /home/dustin/projects/mdsel-mcp-glm && \
jq empty package.json && \
jq empty tsconfig.json && \
head -n1 src/index.ts | grep -q "#!/usr/bin/env node" && \
npm install && \
npx tsc && \
test -f dist/index.js && \
echo "ALL VALIDATIONS PASSED"
```

---

**End of PRP for P1.M1.T1**
