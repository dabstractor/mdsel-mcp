# PRP: Create Documentation (README.md)

**Phase**: P3 (Testing & Documentation) / Milestone M2 (Documentation) / Task T1 (Create Documentation)

---

## Goal

**Feature Goal**: Create a comprehensive README.md that enables users to successfully install, configure, and use the mdsel-mcp server.

**Deliverable**: A complete README.md file in the project root directory following MCP server documentation best practices.

**Success Definition**:
- README.md exists in the project root with all required sections
- A new user can install and configure the server following only the README
- All tool parameters and selector syntax are clearly documented
- Examples are accurate and can be verified against the actual MCP server behavior

## User Persona

**Target User**: Developers and AI agent integrators who need to integrate mdsel (declarative Markdown selection) capabilities into MCP-compatible AI systems.

**Use Case**: Configuring an MCP client (Claude Desktop, VS Code, Cursor, etc.) to enable AI agents to programmatically query and extract content from Markdown documents using semantic selectors.

**User Journey**:
1. User discovers mdsel-mcp via npm or GitHub
2. User reads README to understand what the server does
3. User installs the server via npx
4. User configures their MCP client with the provided configuration
5. User tests the server with the example tool calls
6. User integrates the server into their AI agent workflows

**Pain Points Addressed**:
- No existing documentation for installation or usage
- Unclear how to configure MCP clients for this specific server
- Missing examples of tool usage and selector syntax
- No reference for mdsel CLI integration requirements

## Why

- **User Impact**: Without documentation, potential users cannot discover, install, or use the mdsel-mcp server
- **Adoption Barrier**: Well-documented MCP servers are significantly more likely to be adopted by the community
- **Integration Support**: Clear configuration examples reduce integration time and support burden
- **Onboarding**: New contributors need documentation to understand the project's purpose and usage

## What

Create a comprehensive README.md file with the following user-visible sections:

### Required Sections (per PRD Section 10.2)

1. **Installation via npx** - How to run the server without global installation
2. **MCP server startup** - What happens when the server starts
3. **Tool list and purpose** - Both `mdsel.index` and `mdsel.select`
4. **Example `index` call** - Complete JSON example
5. **Example `select` call** - Complete JSON example
6. **Selector grammar explanation** - Brief, mechanical description of syntax

### Additional Recommended Sections

- **Overview** - What is mdsel-mcp and why it exists
- **Requirements** - Node.js version and mdsel CLI dependency
- **Configuration** - MCP client setup for major clients (Claude Desktop, VS Code, Cursor, etc.)
- **Development** - How to build and test locally
- **License** - MIT License reference

### Success Criteria

- [ ] README.md exists at project root with all required sections
- [ ] Installation instructions work (npx execution)
- [ ] Configuration examples are valid JSON
- [ ] Tool examples match actual MCP server behavior
- [ ] Selector grammar is clearly explained with examples
- [ ] No philosophy or marketing language (per PRD requirement)

---

## All Needed Context

### Context Completeness Check

**Before writing this README, validate**: "If someone knew nothing about this codebase, would they have everything needed to write a comprehensive README.md?"

The following context has been gathered and should be referenced during implementation.

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official MCP TypeScript SDK - reference for server patterns and terminology
  critical: Use consistent terminology: "MCP server", "stdio transport", "tools", "resources"

- url: https://github.com/microsoft/playwright-mcp
  why: Excellent example of MCP server README with client configuration examples
  critical: Note the multi-client configuration format (Claude Desktop, VS Code, Cursor, etc.)

- url: https://github.com/upstash/context7
  why: Advanced MCP server documentation with comprehensive usage examples
  critical: Reference for tool documentation format and JSON request/response examples

- file: package.json
  why: Contains exact package name, version, dependencies, scripts, and requirements
  pattern: Extract name: "mdsel-mcp", version: "1.0.0", engines.node: ">=18.0.0"
  gotcha: Package has peer dependency on mdsel CLI which must be installed separately

- file: src/index.ts
  why: Contains exact tool names, descriptions, and parameter schemas used by the MCP server
  pattern: Extract tool descriptions from lines 103-136 for accurate documentation
  gotcha: Tool descriptions must match exactly what the server returns via ListTools

- file: src/executor.ts
  why: Contains the executeMdsel function showing how CLI commands are invoked
  pattern: Commands are: "npx", "mdsel", "index", "--json" and "npx", "mdsel", "select", "--json"
  gotcha: The executor spawns npx processes, so mdsel must be available via npx or globally

- docfile: plan/docs/research/mdsel-cli.md
  why: Complete reference for mdsel CLI command syntax and selector grammar
  section: Selector Grammar (lines 200-228) for syntax documentation
  gotcha: Selector syntax is [namespace::]type[index][/path]?query

- docfile: plan/docs/PRD.md
  why: Defines project scope and documentation requirements (Section 10)
  section: Section 10 - Documentation Requirements (lines 176-200)
  gotcha: PRD explicitly requires "No philosophy. No marketing." - keep documentation mechanical

- file: /home/dustin/projects/mdsel-mcp-glm/MCP_README_TEMPLATE.md
  why: Template created from research of excellent MCP server READMEs
  pattern: Follow the structure: Header, Badges, Overview, Installation, Configuration, Usage, API Reference, Development, License
  gotcha: Template includes many optional sections - focus on required sections per PRD

- docfile: plan/P3M1T1/PRP.md
  why: Contains test setup information that may inform testing examples in README
  section: Implementation Tasks - test file patterns and vitest configuration
  gotcha: If including development section, reference the test scripts from package.json
```

### Current Codebase Tree

```bash
mdsel-mcp-glm/
├── dist/                      # Built JavaScript (generated, not in source control)
├── src/                       # Source code
│   ├── executor.ts           # mdsel CLI executor
│   ├── executor.test.ts      # Executor tests
│   ├── index.ts              # MCP server entry point
│   ├── index.test.ts         # MCP server tests
│   └── test/                 # Test utilities
├── plan/                     # Project planning
│   ├── docs/                 # PRD and research
│   ├── P2M1T1/               # Phase 2 task PRPs
│   ├── P2M2T1/               # Phase 2 task PRPs
│   ├── P3M1T1/               # Phase 3 task PRPs
│   └── P3M2T1/               # THIS TASK
├── .gitignore
├── package.json              # Package metadata
├── tsconfig.json             # TypeScript config
├── tsup.config.ts            # Build config
├── vitest.config.ts          # Test config
└── tasks.json                # Task tracking
```

### Desired Codebase Tree (Additions Highlighted)

```bash
mdsel-mcp-glm/
├── README.md                 # NEW: Main project documentation (this task's deliverable)
├── dist/
├── src/
├── plan/
├── .gitignore
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── tasks.json
```

### Known Gotchas & Library Quirks

```markdown
# CRITICAL: mdsel CLI is a peer dependency - must be installed separately
# The MCP server does NOT bundle mdsel. Users must have mdsel available via:
# 1. Global install: npm install -g mdsel
# 2. npx resolution (if published to npm)

# CRITICAL: stdio transport requires console.error for debug output
# Using console.log in the MCP server will corrupt the protocol stream
# (Documented in src/index.ts line 16-17)

# CRITICAL: MCP tool descriptions must match ListTools response exactly
# The tool descriptions in README should match src/index.ts lines 103-136
# Any discrepancy causes confusion for users

# CRITICAL: Selector grammar has specific syntax rules
# Format: [namespace::]type[index][/path]?query
# Examples from src/index.ts line 120:
# - 'heading:h1[0]' (first h1)
# - 'readme::h2[1]' (second h2 in readme namespace)
# - 'h2[0]/code[0]' (first code block under first h2)
# - Use '?full=true' to bypass truncation

# GOTCHA: Package name is "mdsel-mcp" but binary is "mdsel-mcp" (same)
# This is intentional and matches the pattern from package.json line 7-8

# GOTCHA: Node.js version requirement is >=18.0.0
# Document this clearly in requirements section (package.json line 10-12)
```

---

## Implementation Blueprint

### Data Models and Structure

No data models are created for this task - the deliverable is a Markdown documentation file.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE plan/P3M2T1/research/selector_examples.md
  - RESEARCH: Extract example selectors from src/index.ts and src/test/setup.ts
  - DOCUMENT: Real-world selector examples with expected outputs
  - REFERENCE: plan/docs/research/mdsel-cli.md for selector grammar
  - ORGANIZE: Group by complexity (basic, namespace, path, query)
  - PLACEMENT: Research directory for reference during README writing

Task 2: CREATE plan/P3M2T1/research/mcp_client_configs.md
  - RESEARCH: Document configuration format for major MCP clients
  - REFERENCE: MCP_README_TEMPLATE.md lines 80-137 for client configuration patterns
  - INCLUDE: Claude Desktop, VS Code, Cursor, Windsurf configurations
  - FORMAT: Valid JSON configuration blocks
  - PLACEMENT: Research directory for reference during README writing

Task 3: WRITE README.md header and overview sections
  - CREATE: Project root README.md
  - WRITE: Title "# mdsel-mcp"
  - WRITE: Brief description from package.json line 4
  - WRITE: "Overview" section explaining what the server does
  - CONSTRAINT: Keep it mechanical - no philosophy or marketing (PRD Section 10.2)
  - REFERENCE: src/index.ts lines 24-34 for server metadata

Task 4: WRITE README.md requirements and installation sections
  - WRITE: "Requirements" section listing Node.js >=18.0.0 and mdsel CLI
  - WRITE: "Installation" section with npx usage (PRD Section 3.2)
  - INCLUDE: npm global install option for mdsel CLI
  - REFERENCE: package.json lines 10-12 for Node version requirement
  - REFERENCE: plan/docs/research/mdsel-cli.md lines 9-12 for mdsel installation

Task 5: WRITE README.md configuration section
  - WRITE: "Configuration" section with MCP client setup
  - INCLUDE: Basic stdio configuration example
  - INCLUDE: Multi-client configurations (Claude Desktop, VS Code, Cursor)
  - REFERENCE: Task 2 research for configuration patterns
  - VALIDATE: All JSON is valid and properly formatted

Task 6: WRITE README.md tools reference section
  - WRITE: "Tools" section with tool overview table
  - DOCUMENT: mdsel.index tool with parameters and examples
  - DOCUMENT: mdsel.select tool with parameters and examples
  - REFERENCE: src/index.ts lines 103-136 for exact tool schemas
  - REFERENCE: Task 1 research for selector examples
  - INCLUDE: Example JSON request/response for each tool

Task 7: WRITE README.md selector grammar section
  - WRITE: "Selector Grammar" section with syntax explanation
  - DOCUMENT: Format: [namespace::]type[index][/path]?query
  - INCLUDE: Node types table (heading, block, root, section)
  - INCLUDE: Progressive examples from basic to complex
  - REFERENCE: src/index.ts line 120 for examples
  - REFERENCE: plan/docs/research/mdsel-cli.md lines 200-228

Task 8: WRITE README.md development section
  - WRITE: "Development" section with local setup instructions
  - INCLUDE: Clone, install, build, test commands
  - LIST: Available scripts from package.json lines 13-21
  - REFERENCE: vitest.config.ts for test configuration details

Task 9: WRITE README.md license and final sections
  - WRITE: "License" section referencing MIT License
  - WRITE: Any footer links or support information
  - VALIDATE: All sections are complete and accurate
  - CHECK: Against PRD Section 10.2 requirements

Task 10: VALIDATE README.md content
  - VERIFY: All required sections from PRD are present
  - VERIFY: Installation instructions are accurate
  - VERIFY: Configuration examples use valid JSON
  - VERIFY: Tool examples match actual server behavior
  - VERIFY: Selector examples follow correct syntax
  - VERIFY: No philosophy or marketing language (PRD constraint)
```

### Implementation Patterns & Key Details

```markdown
# README.md Structure Pattern (following MCP_README_TEMPLATE.md)

# mdsel-mcp

[Badges - optional but recommended for published packages]

## Overview
[2-3 sentences explaining what mdsel-mcp does]
[Reference: package.json description line 4]

## Requirements
- Node.js >= 18.0.0
- mdsel CLI installed globally or available via npx

## Installation
### Using npx (Recommended)
```bash
npx mdsel-mcp
```

### Installing mdsel CLI
```bash
npm install -g mdsel
```

## Configuration
### Basic Configuration
```json
{
  "mcpServers": {
    "mdsel": {
      "command": "npx",
      "args": ["-y", "mdsel-mcp@latest"]
    }
  }
}
```

[Additional client configurations in collapsible sections]

## Tools

### mdsel.index
[Description from src/index.ts lines 103-117]

**Parameters:**
- `files` (array of strings, required): Absolute paths to Markdown files

**Example:**
```json
{
  "name": "mdsel.index",
  "arguments": {
    "files": ["/path/to/document.md"]
  }
}
```

**Response:**
[Example response format]

### mdsel.select
[Description from src/index.ts lines 119-137]

**Parameters:**
- `selector` (string, required): Selector expression
- `files` (array of strings, required): Absolute paths to search

**Example:**
```json
{
  "name": "mdsel.select",
  "arguments": {
    "selector": "heading:h1[0]",
    "files": ["/path/to/document.md"]
  }
}
```

## Selector Grammar

[Syntax explanation from plan/docs/research/mdsel-cli.md]

### Node Types
| Type | Description | Examples |
|------|-------------|----------|
| heading:h1-h6 | Headings by level | `h1[0]`, `heading:h2[1]` |
| block:code | Code blocks | `code[0]`, `block:code[0]` |
| ... | ... | ... |

### Selector Examples
[Progressive examples from basic to complex]

## Development
[Local development instructions]

## License
MIT License
```

# CRITICAL: Tool Description Accuracy
# Tool descriptions in README MUST match src/index.ts exactly
# Any discrepancy causes user confusion
# mdsel.index description: src/index.ts lines 104-105
# mdsel.select description: src/index.ts line 120

# CRITICAL: JSON Configuration Validity
# All JSON blocks must be valid JSON
# Use proper double quotes, no trailing commas
# Validate with: cat config.json | jq .

# CRITICAL: Selector Syntax Examples
# Use real, working selector examples from src/test/setup.ts
# Avoid invented examples that may not work
# Test selectors if possible: npx mdsel select --json "<selector>" <file>

# PATTERN: Use collapsible sections for optional content
# <details>
# <summary>Install in VS Code</summary>
#
# Content here
#
# </details>

# GOTCHA: Avoid marketing language per PRD Section 10.2
# Do NOT use: "Revolutionary", "Amazing", "Powerful", etc.
# DO use: "Declarative Markdown selection", "Selector-based content access"
# Keep descriptions factual and mechanical
```

### Integration Points

```yaml
PACKAGE_JSON:
  - version: Extract from package.json line 3 for documentation accuracy
  - scripts: Reference package.json lines 13-21 for development section
  - engines: Reference package.json lines 10-12 for requirements

SRC_INDEX_TS:
  - server.name: "mdsel-mcp" (line 26)
  - server.version: "1.0.0" (line 27)
  - tool schemas: Lines 103-136 for accurate tool documentation

SRC_EXECUTOR_TS:
  - CLI invocation: Lines showing npx mdsel execution
  - Command construction: References for how commands are built

RESEARCH_DOCS:
  - plan/docs/research/mdsel-cli.md: Selector grammar reference
  - plan/docs/PRD.md Section 10: Documentation requirements and constraints
```

---

## Validation Loop

### Level 1: Content & Structure Verification

```bash
# Verify README.md exists
test -f README.md && echo "README.md exists" || echo "ERROR: README.md not found"

# Check for required sections (PRD Section 10.2)
echo "Checking required sections..."
grep -q "## Installation" README.md && echo "Installation: OK" || echo "ERROR: Missing Installation"
grep -q "## Tools" README.md && echo "Tools: OK" || echo "ERROR: Missing Tools"
grep -q "mdsel.index" README.md && echo "mdsel.index: OK" || echo "ERROR: Missing mdsel.index"
grep -q "mdsel.select" README.md && echo "mdsel.select: OK" || echo "ERROR: Missing mdsel.select"
grep -q "## Selector" README.md && echo "Selector Grammar: OK" || echo "ERROR: Missing Selector Grammar"

# Verify no marketing/philosophy language (PRD constraint)
echo "Checking for prohibited marketing language..."
if grep -iE "revolutionary|amazing|powerful|cutting-edge|groundbreaking" README.md; then
  echo "WARNING: Marketing language detected - remove per PRD"
else
  echo "Marketing language check: OK"
fi

# Expected: All checks pass, README.md exists with all required sections
```

### Level 2: JSON Validation

```bash
# Extract and validate all JSON blocks in README.md
echo "Validating JSON blocks..."

# Extract JSON blocks and validate each
awk '/```json/,/```/' README.md | grep -v '```' | jq . > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "JSON validation: OK"
else
  echo "ERROR: Invalid JSON found in README.md"
  # Show which JSON block failed
  awk '/```json/,/```/' README.md | grep -v '```' | jq . 2>&1 | head -20
fi

# Expected: All JSON blocks are valid
```

### Level 3: Accuracy Verification

```bash
# Verify tool descriptions match source code
echo "Verifying tool description accuracy..."

# Extract mdsel.index description from README and compare to source
README_DESC=$(grep -A5 "mdsel.index" README.md | head -1)
SOURCE_DESC=$(grep -A2 'name:.*"mdsel.index"' src/index.ts | grep description)
echo "README: $README_DESC"
echo "Source: $SOURCE_DESC"

# Verify package version consistency
PACKAGE_VERSION=$(grep '"version"' package.json | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
if grep -q "$PACKAGE_VERSION" README.md; then
  echo "Version consistency: OK"
else
  echo "WARNING: Version $PACKAGE_VERSION not mentioned in README"
fi

# Verify Node version requirement
NODE_VERSION=$(grep '"node"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
if grep -q "$NODE_VERSION" README.md; then
  echo "Node version requirement: OK"
else
  echo "ERROR: Node version requirement not documented"
fi

# Expected: All information matches source code and package.json
```

### Level 4: Functional Testing

```bash
# Test that installation instructions work
echo "Testing installation instructions..."

# Build the package first
npm run build
if [ $? -ne 0 ]; then
  echo "ERROR: Build failed - cannot test"
  exit 1
fi

# Test npx execution (simulated)
echo "Simulating npx execution..."
node dist/index.js --help 2>&1 | head -5 || echo "Note: Server runs on stdio, no --help available"

# Verify MCP server can list tools
echo "Verifying MCP server responds to ListTools..."
# This would require actual MCP client connection
# For now, verify the server can at least start without errors
timeout 2 node dist/index.js 2>&1 | grep -q "mdsel-mcp server running" && \
  echo "Server startup: OK" || echo "Note: Server requires stdio transport"

# Test mdsel CLI availability (if installed)
if command -v mdsel &> /dev/null; then
  echo "mdsel CLI: Available ($(mdsel --version 2>&1 || echo 'version unknown'))"
else
  echo "WARNING: mdsel CLI not installed - document this requirement clearly"
fi

# Expected: Build succeeds, mdsel CLI requirement is clearly documented
```

### Level 5: Documentation Quality Validation

```bash
# Check for broken links (if any URLs are included)
echo "Checking for broken links..."
# This would require a link checker tool
# For now, verify any URLs are well-formed
grep -oE 'https?://[^")\s]+' README.md | sort -u | while read url; do
  if [[ ! "$url" =~ ^https?://[a-zA-Z0-9.-] ]]; then
    echo "WARNING: Possibly malformed URL: $url"
  fi
done

# Check code fence syntax
echo "Checking code fence formatting..."
CODE_FENCE_COUNT=$(grep -c '```' README.md)
if [ $((CODE_FENCE_COUNT % 2)) -ne 0 ]; then
  echo "ERROR: Unclosed code fence detected"
else
  echo "Code fences: OK ($((CODE_FENCE_COUNT / 2)) blocks)"
fi

# Check for consistent heading hierarchy
echo "Checking heading hierarchy..."
if grep -E '^#####[^#]' README.md; then
  echo "WARNING: H5+ headings detected - consider restructuring"
else
  echo "Heading hierarchy: OK"
fi

# Expected: No broken links, properly closed code fences, reasonable heading depth
```

---

## Final Validation Checklist

### Content Validation

- [ ] README.md exists in project root
- [ ] All PRD Section 10.2 required sections are present:
  - [ ] Installation via npx
  - [ ] MCP server startup description
  - [ ] Tool list and purpose (mdsel.index, mdsel.select)
  - [ ] Example index call with JSON
  - [ ] Example select call with JSON
  - [ ] Selector grammar explanation
- [ ] No philosophy or marketing language (PRD requirement)
- [ ] Package version matches package.json
- [ ] Node.js version requirement is documented
- [ ] mdsel CLI dependency is clearly explained

### Accuracy Validation

- [ ] Tool descriptions match src/index.ts exactly
- [ ] All JSON configuration examples are valid
- [ ] Selector syntax examples are correct
- [ ] Installation commands are accurate
- [ ] Script names match package.json

### Structure Validation

- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] All code blocks have language specified
- [ ] Code fences are properly closed
- [ ] Links (if any) are well-formed
- [ ] Tables (if any) are properly formatted

### User Experience Validation

- [ ] New user can install following instructions
- [ ] Configuration examples are copy-paste ready
- [ ] Tool examples include request and response
- [ ] Selector examples progress from basic to complex
- [ ] Development section enables local contribution

---

## Anti-Patterns to Avoid

- **Avoid marketing language**: No "revolutionary", "powerful", "cutting-edge" - keep it mechanical
- **Avoid invented examples**: Use real, tested selector examples from src/test/setup.ts
- **Avoid unclear dependencies**: Clearly state mdsel CLI must be installed separately
- **Avoid inconsistent descriptions**: Tool descriptions must match src/index.ts exactly
- **Avoid philosophy**: Don't explain "why" declarative selection is good - just document "what" it does
- **Avoid missing error context**: If an example can fail, document what failure looks like
- **Avoid version drift**: Always reference current version from package.json
- **Avoid broken JSON**: Validate all JSON blocks before including them
- **Assume no prior knowledge**: Explain MCP concepts briefly (stdio transport, tools, etc.)
- **Don't skip testing**: Verify examples work if possible, or mark as illustrative

---

## Confidence Score

**8/10** - High confidence in one-pass implementation success

**Reasoning**:
- Comprehensive research has been completed covering all aspects
- Source code provides exact tool descriptions and schemas
- Existing research documents contain selector grammar and CLI patterns
- Template from excellent MCP server examples provides structure
- PRD provides clear constraints and requirements

**Risks**:
- mdsel CLI may not be published to npm, affecting installation instructions
- Selector examples may need real testing to verify accuracy
- MCP client configuration formats may vary across versions

**Mitigation**:
- Document mdsel CLI requirement clearly with installation options
- Use selector examples from test files where available
- Provide multiple client configuration examples covering major clients
- Include validation steps to catch any inaccuracies
