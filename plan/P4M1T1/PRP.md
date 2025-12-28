# PRP: P4.M1.T1 - Finalize Package for Publication

**Phase**: P4 (Build & Distribution) / Milestone M1 (Package Finalization) / Task T1 (Finalize Package for Publication)

---

## Goal

**Feature Goal**: Configure the mdsel-mcp package with complete npm metadata and verify npx execution readiness for publication to the npm registry.

**Deliverable**: A publication-ready package with:
- Complete package.json metadata (author, repository, bugs, homepage, exports)
- .npmignore file for security
- Verified npx execution (shebang, permissions, bin entry)
- prepublishOnly script that builds and tests
- Working npm pack validation

**Success Definition**:
- package.json contains all recommended npm metadata fields
- .npmignore prevents source files and test files from being published
- `npm pack` produces a valid .tgz file containing only dist/ and README.md
- `npx ./mdsel-mcp-1.0.0.tgz` executes successfully (simulating npx usage)
- `npm run build && chmod +x dist/*.js && ./dist/index.js` executes
- All tests pass before publication: `npm run prepublishOnly` succeeds

## User Persona

**Target User**: npm users and MCP client integrators who will install and use mdsel-mcp via npx.

**Use Case**: A user discovers mdsel-mcp on npm and installs it via npx to integrate with their MCP client (Claude Desktop, VS Code, Cursor, etc.).

**User Journey**:
1. User searches npm for MCP servers
2. User finds mdsel-mcp and reads the README
3. User configures their MCP client with `"command": "npx", "args": ["-y", "mdsel-mcp@latest"]`
4. User's MCP client executes `npx mdsel-mcp@latest`
5. Server starts successfully and responds to tool calls

**Pain Points Addressed**:
- Packages that don't include proper metadata are hard to discover
- Packages that publish source files clutter installations
- Packages with broken npx execution fail silently
- Packages without testing before publication may have bugs

## Why

- **npm Discovery**: Proper metadata (keywords, description, repository) helps users find the package
- **Installation Size**: .npmignore prevents publishing unnecessary files (src/, test/, coverage/)
- **npx Execution**: Correct bin entry, shebang, and permissions enable frictionless npx usage
- **Publication Safety**: prepublishOnly script ensures only tested, working code is published
- **Professional Quality**: Complete metadata signals a maintained, trustworthy package

## What

Configure mdsel-mcp for npm publication by adding missing metadata and verifying npx execution.

### Success Criteria

- [ ] package.json has author field with name and email
- [ ] package.json has repository field with GitHub URL
- [ ] package.json has bugs field with issues URL
- [ ] package.json has homepage field pointing to README
- [ ] .npmignore file exists and excludes source/test files
- [ ] prepublishOnly script runs build and tests
- [ ] npm pack produces valid .tgz with correct contents
- [ ] npx execution works with packed .tgz
- [ ] Bin entry has shebang and execute permissions

---

## All Needed Context

### Context Completeness Check

_Before writing this PRP, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

- [x] **Current package.json configuration** understood (name, version, bin, files, scripts)
- [x] **tsup build configuration** understood (banner for shebang, clean builds)
- [x] **npx requirements** clarified (shebang, permissions, bin entry)
- [x] **npm publish workflow** understood (prepublishOnly, .npmignore, files field)
- [x] **Existing README** exists with installation instructions
- [x] **PRD requirements** for distribution (npx execution, no global install)

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
  why: Official npm package.json field reference
  critical: "Recommended fields: author, repository, bugs, homepage, keywords"

- url: https://docs.npmjs.com/cli/v10/commands/npm-publish
  why: Official npm publish documentation with workflow details
  critical: "prepublishOnly script runs before publish, use for build/test"

- url: https://docs.npmjs.com/cli/v10/configuring-npm/package.json#bin
  why: Bin field configuration for npx execution
  section: "#bin"
  gotcha: "Bin file must start with shebang and have execute permission"

- url: https://docs.npmjs.com/files/npmignore
  why: .npmignore documentation for excluding files from publication
  critical: ".npmignore excludes files, package.json files field includes files (whitelist is more secure)"

- url: https://docs.npmjs.com/cli/v10/commands/npm-pack
  why: npm pack command for testing publication without actually publishing
  critical: "Use npm pack to validate the package before npm publish"

# EXISTING CODEBASE FILES
- file: /home/dustin/projects/mdsel-mcp-glm/package.json
  why: Current package configuration - identifies missing metadata fields
  pattern: "Has name, version, bin, files, engines, scripts - missing author, repository, bugs, homepage"
  gotcha: "Already has type: 'module', bin entry, prepublishOnly script"

- file: /home/dustin/projects/mdsel-mcp-glm/tsup.config.ts
  why: Build configuration with shebang banner
  pattern: "banner.js: '#!/usr/bin/env node' - this provides the shebang for npx"
  critical: "Shebang is critical for npx execution"

- file: /home/dustin/projects/mdsel-mcp-glm/src/index.ts
  why: Main entry point that becomes the executable
  pattern: "MCP server initialization with stdio transport"

- file: /home/dustin/projects/mdsel-mcp-glm/README.md
  why: Documentation to include in published package
  gotcha: "README must exist in published package for user onboarding"

# RESEARCH DOCUMENTS
- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P4M1T1/research/npm-publishing-best-practices.md
  why: Complete npm publishing best practices guide
  section: "Essential package.json Fields" for field definitions

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P4M1T1/research/npx-execution-requirements.md
  why: Detailed npx execution requirements
  section: "bin Field Configuration" and "Shebang Line"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/P4M1T1/research/mcp-server-publishing-patterns.md
  why: Common patterns used by other MCP servers
  section: "Common package.json Patterns for MCP Servers"

# PRD AND ARCHITECTURE
- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/docs/PRD.md
  why: Project requirements for distribution
  section: Section 3 - Distribution & Execution
  critical: "Server must be runnable via npx mdsel-mcp (no global install)"

- docfile: /home/dustin/projects/mdsel-mcp-glm/plan/architecture/external_deps.md
  why: Build configuration reference
  section: "Build Configuration" and "Shebang Requirement"
  pattern: "tsup banner configuration for shebang"
```

### Current Codebase Tree

```bash
mdsel-mcp-glm/
├── package.json              # Has name, version, bin, files, engines, scripts
├── tsup.config.ts            # Has shebang banner configuration
├── tsconfig.json             # TypeScript configuration
├── vitest.config.ts          # Test configuration
├── README.md                 # Documentation exists
├── src/
│   ├── executor.ts           # CLI executor
│   ├── executor.test.ts      # Executor tests
│   ├── index.ts              # MCP server entry point
│   └── index.test.ts         # MCP server tests
├── dist/                     # Built output (generated)
├── plan/                     # Planning documents
└── coverage/                 # Test coverage reports (generated)
```

### Desired Codebase Tree (Additions Highlighted)

```bash
mdsel-mcp-glm/
├── .npmignore                # NEW: Excludes source and test files from publication
├── package.json              # UPDATED: Add author, repository, bugs, homepage
├── tsup.config.ts            # UNCHANGED
├── tsconfig.json             # UNCHANGED
├── vitest.config.ts          # UNCHANGED
├── README.md                 # UNCHANGED
├── src/                      # UNCHANGED
├── dist/                     # Generated
├── plan/
│   └── P4M1T1/
│       ├── PRP.md            # NEW: This document
│       └── research/         # NEW: Research documents
└── coverage/                 # Generated
```

### Known Gotchas & Library Quirks

```json
// CRITICAL: The bin field must point to the BUILT JavaScript file, not TypeScript source
// Correct: "bin": { "mdsel-mcp": "./dist/index.js" }
// Wrong: "bin": { "mdsel-mcp": "./src/index.ts" }

// CRITICAL: Shebang must be at the very beginning of the built file
// tsup banner adds this, but verify dist/index.js starts with "#!/usr/bin/env node"

// CRITICAL: Built files must have execute permissions for npx
// Use "chmod +x dist/*.js" after build - can be added to build script

// CRITICAL: .npmignore uses blacklist mode, files field uses whitelist mode
// When using "files" field in package.json, only listed files are included
// This is more secure than .npmignore alone

// CRITICAL: prepublishOnly script should fail if tests fail
// This prevents publishing broken code
// Current: "prepublishOnly": "npm run build"
// Should be: "prepublishOnly": "npm run build && npm run test:run"

// GOTCHA: npm pack creates .tgz file that can be tested with npx
// Use "npx ./package-name-version.tgz" to test before actual publish

// GOTCHA: Repository URL should use HTTPS, not SSH format
// Correct: "https://github.com/username/repo.git"
// Wrong: "git@github.com:username/repo.git"

// GOTCHA: engines.node should match MCP SDK requirement
// MCP SDK requires Node.js >= 18.0.0
```

---

## Implementation Blueprint

### Data Models and Structure

No new data models - this task modifies package.json metadata and creates .npmignore.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: UPDATE package.json - Add author field
  - ADD author field with name and email
  - FORMAT: "Your Name <email@example.com>" or object format
  - EXAMPLE: "Jane Developer <jane@example.com>"
  - OR object format: { "name": "Jane Developer", "email": "jane@example.com" }
  - PLACEMENT: Top level in package.json (after description, before keywords)
  - DEPENDENCIES: None (first task)

Task 2: UPDATE package.json - Add repository field
  - ADD repository field with GitHub URL
  - FORMAT: { "type": "git", "url": "https://github.com/username/repo.git" }
  - EXAMPLE: { "type": "git", "url": "https://github.com/dustin/mdsel-mcp.git" }
  - USE HTTPS URL (not SSH git@github.com format)
  - PLACEMENT: After author field
  - DEPENDENCIES: Task 1

Task 3: UPDATE package.json - Add bugs field
  - ADD bugs field with issues URL
  - FORMAT: { "url": "https://github.com/username/repo/issues" }
  - EXAMPLE: { "url": "https://github.com/dustin/mdsel-mcp/issues" }
  - POINTS to GitHub issues page
  - PLACEMENT: After repository field
  - DEPENDENCIES: Task 2

Task 4: UPDATE package.json - Add homepage field
  - ADD homepage field
  - FORMAT: "https://github.com/username/repo#readme"
  - EXAMPLE: "https://github.com/dustin/mdsel-mcp#readme"
  - POINTS to GitHub README (includes anchor)
  - PLACEMENT: After bugs field
  - DEPENDENCIES: Task 3

Task 5: ENHANCE package.json - Update keywords
  - REVIEW current keywords: ["mcp", "modelcontextprotocol", "markdown", "mdsel"]
  - CONSIDER adding: "model-context-protocol", "selector", "cli", "ai", "anthropic"
  - DO NOT overdo it - 5-10 relevant keywords is optimal
  - PLACEMENT: keywords field (already exists)
  - DEPENDENCIES: None (can be done in parallel with Tasks 1-4)

Task 6: UPDATE package.json - Enhance prepublishOnly script
  - CHANGE: "prepublishOnly": "npm run build"
  - TO: "prepublishOnly": "npm run build && npm run test:run"
  - ENSURES tests pass before publication
  - FAILS publication if tests fail
  - PLACEMENT: scripts section
  - DEPENDENCIES: None

Task 7: CREATE .npmignore file
  - CREATE new .npmignore file in project root
  - EXCLUDE: node_modules/, src/, test/, *.test.ts, *.test.js
  - EXCLUDE: coverage/, dist/, *.map, .git/, .env
  - EXCLUDE: plan/, tasks.json, .npmignore itself
  - EXCLUDE: development files like tsconfig.json, tsup.config.ts, vitest.config.ts
  - INCLUDE: README.md, LICENSE (if exists)
  - NOTE: "files" field in package.json is a whitelist, so .npmignore is secondary
  - PLACEMENT: Project root
  - DEPENDENCIES: None

Task 8: VERIFY build output and shebang
  - RUN: npm run build
  - VERIFY: dist/index.js and dist/executor.js are created
  - VERIFY: dist/index.js starts with "#!/usr/bin/env node" (shebang)
  - CHECK: head -1 dist/index.js should show the shebang
  - DEPENDENCIES: Task 6 (prepublishOnly script)

Task 9: VERIFY file permissions for npx
  - CHECK: ls -l dist/*.js to see current permissions
  - SET: chmod +x dist/*.js if not executable
  - VERIFY: ls -l dist/*.js shows -rwxr-xr-x (executable)
  - CONSIDER: Add chmod to build script if permissions aren't preserved
  - DEPENDENCIES: Task 8

Task 10: VALIDATE with npm pack
  - RUN: npm pack
  - VERIFY: Creates mdsel-mcp-1.0.0.tgz file
  - INSPECT: tar -tzf mdsel-mcp-1.0.0.tgz to see contents
  - CHECK: Contents include package/, dist/, README.md
  - CHECK: Contents EXCLUDE src/, test/, coverage/, plan/
  - DEPENDENCIES: Tasks 1-7 (metadata and .npmignore)

Task 11: TEST npx execution with packed tarball
  - RUN: npx ./mdsel-mcp-1.0.0.tgz
  - EXPECT: Server starts (may need stdin input, which is normal for stdio)
  - OR test with: echo '{}' | npx ./mdsel-mcp-1.0.0.tgz
  - VERIFY: No errors about missing shebang or permissions
  - DEPENDENCIES: Task 10

Task 12: CLEAN UP test tarball
  - REMOVE: rm mdsel-mcp-1.0.0.tgz
  - VERIFY: Clean working directory
  - DEPENDENCIES: Task 11

Task 13: FINAL VALIDATION - prepublishOnly script
  - RUN: npm run prepublishOnly
  - VERIFY: Build succeeds
  - VERIFY: All tests pass
  - VERIFY: No errors in output
  - DEPENDENCIES: All previous tasks
```

### Implementation Patterns & Key Details

```json
// ============================================================================
// PATTERN: Enhanced package.json for npm publication
// ============================================================================

{
  "name": "mdsel-mcp",
  "version": "1.0.0",
  "description": "MCP server for mdsel CLI - declarative Markdown selection",

  // NEW: Author field (Task 1)
  "author": "Your Name <your.email@example.com>",

  // NEW: Repository field (Task 2)
  "repository": {
    "type": "git",
    "url": "https://github.com/username/mdsel-mcp.git"
  },

  // NEW: Bugs field (Task 3)
  "bugs": {
    "url": "https://github.com/username/mdsel-mcp/issues"
  },

  // NEW: Homepage field (Task 4)
  "homepage": "https://github.com/username/mdsel-mcp#readme",

  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "mdsel-mcp": "./dist/index.js"
  },

  "keywords": [
    "mcp",
    "modelcontextprotocol",
    "model-context-protocol",
    "markdown",
    "mdsel",
    "selector",
    "ai",
    "anthropic"
  ],

  "engines": {
    "node": ">=18.0.0"
  },

  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run build && npm run test:run",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  },

  "files": [
    "dist",
    "README.md"
  ],

  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.25.0"
  },

  "peerDependencies": {
    "mdsel": "^1.0.0"
  },

  "peerDependenciesMeta": {
    "mdsel": {
      "optional": true
    }
  },

  "devDependencies": {
    "@types/node": "^22.0.0",
    "@vitest/coverage-v8": "^2.1.0",
    "tsup": "^8.3.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}

// ============================================================================
// PATTERN: .npmignore file for excluding source files (Task 7)
// ============================================================================

# Source files
src/
*.ts
!*.d.ts

# Test files
*.test.ts
*.test.js
test/
coverage/

# Build artifacts (we only publish dist/)
dist/*.map

# Development files
tsconfig.json
tsup.config.ts
vitest.config.ts

# Planning and documentation
plan/
tasks.json
.prettierrc*
.prettierignore

# Git
.git/
.gitignore

# Environment
.env
.env.*

# CI/CD
.github/

# npm
.npmignore
package-lock.json

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Temporary files
*.tmp
*.temp

// ============================================================================
// VALIDATION: npm pack output inspection (Task 10)
// ============================================================================

// Inspect tarball contents:
$ tar -tzf mdsel-mcp-1.0.0.tgz

// Expected output:
package/dist/index.js
package/dist/index.d.ts
package/dist/executor.js
package/dist/executor.d.ts
package/README.md
package/package.json

// Should NOT contain:
package/src/
package/test/
package/coverage/
package/plan/
package/tsconfig.json
package/vitest.config.ts

// ============================================================================
// VALIDATION: Verify shebang in built file (Task 8)
// ============================================================================

$ head -1 dist/index.js
#!/usr/bin/env node

// If shebang is missing, check tsup.config.ts has:
banner: {
  js: '#!/usr/bin/env node',
}

// ============================================================================
// VALIDATION: File permissions (Task 9)
// ============================================================================

$ ls -l dist/*.js
-rwxr-xr-x  1 user  staff  1234 Dec 27 10:00 dist/executor.js
-rwxr-xr-x  1 user  staff  5678 Dec 27 10:00 dist/index.js

// The 'x' in the first position indicates executable permission
// If missing, run: chmod +x dist/*.js
```

### Integration Points

```yaml
PACKAGE_JSON:
  - author: Add your name and email
  - repository: Update URL to match your GitHub repository
  - bugs: Update URL to match your GitHub issues
  - homepage: Update URL to match your GitHub README
  - keywords: Enhanced with MCP-related terms

BUILD_SCRIPT:
  - Consider: "build": "tsup && chmod +x dist/*.js"
  - This ensures executable permissions are set automatically

PREPUBLISH_ONLY:
  - Updated: "prepublishOnly": "npm run build && npm run test:run"
  - Ensures only tested code is published
```

---

## Validation Loop

### Level 1: Metadata Verification (Immediate Feedback)

```bash
# Verify package.json has all required fields
echo "Checking package.json metadata..."

# Check for author field
jq -e '.author' package.json && echo "author: OK" || echo "ERROR: Missing author field"

# Check for repository field
jq -e '.repository' package.json && echo "repository: OK" || echo "ERROR: Missing repository field"

# Check for bugs field
jq -e '.bugs' package.json && echo "bugs: OK" || echo "ERROR: Missing bugs field"

# Check for homepage field
jq -e '.homepage' package.json && echo "homepage: OK" || echo "ERROR: Missing homepage field"

# Verify repository URL format (HTTPS, not SSH)
REPO_URL=$(jq -r '.repository.url' package.json)
if [[ "$REPO_URL" =~ ^https://github\.com/ ]]; then
  echo "repository URL format: OK"
else
  echo "ERROR: repository URL should use HTTPS format (https://github.com/user/repo.git)"
fi

# Expected: All fields present and correctly formatted
```

### Level 2: .npmignore Verification

```bash
# Verify .npmignore exists
test -f .npmignore && echo ".npmignore: OK" || echo "ERROR: .npmignore not found"

# Verify .npmignore excludes source files
if grep -q "^src/$" .npmignore; then
  echo ".npmignore excludes src/: OK"
else
  echo "WARNING: .npmignore should exclude src/"
fi

# Verify .npmignore excludes test files
if grep -q "test/" .npmignore || grep -q "*.test" .npmignore; then
  echo ".npmignore excludes tests: OK"
else
  echo "WARNING: .npmignore should exclude test files"
fi

# Expected: .npmignore exists and excludes appropriate files
```

### Level 3: Build and Shebang Verification

```bash
# Build the package
npm run build
# Expected: Build succeeds, no errors

# Verify shebang in built files
echo "Checking shebang..."
head -1 dist/index.js
# Expected: #!/usr/bin/env node

head -1 dist/executor.js
# Expected: May or may not have shebang (only index.js is bin entry)

# Verify file permissions
echo "Checking file permissions..."
ls -l dist/*.js
# Expected: -rwxr-xr-x (executable permission)

# If permissions are missing:
chmod +x dist/*.js
ls -l dist/*.js
# Expected: Permissions updated to executable
```

### Level 4: npm Pack and npx Testing

```bash
# Create packed tarball
npm pack
# Expected: Creates mdsel-mcp-1.0.0.tgz

# Inspect tarball contents
echo "Inspecting tarball contents..."
tar -tzf mdsel-mcp-1.0.0.tgz | grep -E "^package/(dist|README|package\.json)"
# Expected: Shows package/dist/, package/README.md, package/package.json

# Verify source files are NOT included
tar -tzf mdsel-mcp-1.0.0.tgz | grep "^package/src/" && echo "ERROR: src/ should not be included" || echo "src/ excluded: OK"

# Verify test files are NOT included
tar -tzf mdsel-mcp-1.0.0.tgz | grep -E "test|coverage" && echo "ERROR: test/coverage should not be included" || echo "test/ excluded: OK"

# Test npx execution with packed tarball
echo "Testing npx execution..."
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | npx ./mdsel-mcp-1.0.0.tgz
# Expected: Server responds with initialization (or waits for more stdio input)

# Alternative simple test (just check it starts without crashing)
timeout 1 npx ./mdsel-mcp-1.0.0.tgz 2>&1 | head -5
# Expected: No errors about missing shebang or permissions

# Clean up
rm mdsel-mcp-1.0.0.tgz
# Expected: Test tarball removed
```

### Level 5: prepublishOnly Validation

```bash
# Run the complete prepublishOnly workflow
npm run prepublishOnly
# Expected:
# 1. Build succeeds (tsup completes)
# 2. Tests pass (vitest run shows X pass Y fail)
# 3. Exit code is 0 (success)

# Verify exit code
if [ $? -eq 0 ]; then
  echo "prepublishOnly: SUCCESS - Ready to publish"
else
  echo "ERROR: prepublishOnly failed - fix issues before publishing"
fi
```

---

## Final Validation Checklist

### Technical Validation

- [ ] package.json has author field with name and email
- [ ] package.json has repository field with HTTPS GitHub URL
- [ ] package.json has bugs field with issues URL
- [ ] package.json has homepage field with README anchor
- [ ] package.json keywords are relevant and comprehensive
- [ ] .npmignore file exists and excludes source/test files
- [ ] prepublishOnly script runs build and tests
- [ ] npm pack creates valid .tgz file
- [ ] Packed .tgz contains only dist/, README.md, package.json
- [ ] dist/index.js starts with shebang (#!/usr/bin/env node)
- [ ] dist/index.js has executable permissions

### Feature Validation

- [ ] npx execution works with packed .tgz
- [ ] Server starts without errors
- [ ] prepublishOnly script fails if tests fail
- [ ] Source files (src/, test/) are excluded from published package
- [ ] README.md is included in published package

### Code Quality Validation

- [ ] All metadata fields follow npm conventions
- [ ] Repository URL uses HTTPS (not SSH)
- [ ] Bugs URL points to GitHub issues
- [ ] Homepage URL points to GitHub README with anchor
- [ ] Keywords include "modelcontextprotocol" and "mcp"
- [ ] .npmignore follows best practices (blacklist approach)

### Publication Readiness

- [ ] npm run prepublishOnly succeeds
- [ ] All tests pass before publication
- [ ] Package size is reasonable (only dist/ and README)
- [ ] Package can be installed via npx (simulated with npm pack)

---

## Anti-Patterns to Avoid

- **Don't** use SSH URL for repository field - use HTTPS format
- **Don't** skip the author field - it's required for proper package attribution
- **Don't** forget to update URLs to match actual repository
- **Don't** publish source files - use .npmignore and files field
- **Don't** skip the prepublishOnly script - it prevents broken code from being published
- **Don't** assume build preserves permissions - use chmod +x
- **Don't** forget to test with npm pack before actual npm publish
- **Don't** publish without running tests - prepublishOnly should include test:run
- **Don't** use placeholder URLs - update to actual repository URLs
- **Don't** skip verifying shebang in built files
- **Don't** publish .map files - exclude via .npmignore

---

## Confidence Score

**9/10** - Very high confidence in one-pass implementation success

**Reasoning**:
- All required metadata fields are clearly defined
- .npmignore pattern is well-established
- Build configuration (tsup) is already correct
- Research documents provide complete context
- Validation commands are specific and executable
- No new code logic required - only metadata changes

**Risks**:
- Repository/bugs/homepage URLs need to be updated to match actual repository
- File permissions may not be preserved by build (need chmod)
- User may not have npm authentication set up (not part of this task)

**Mitigation**:
- Validation commands check for specific URL formats
- chmod command is included in validation steps
- npm authentication is out of scope for this task (only preparing package)
