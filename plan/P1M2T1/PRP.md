# Product Requirement Prompt (PRP): P1.M2.T1 - MCP Server Bootstrap

---

## Goal

**Feature Goal**: Create a functional MCP server entry point that initializes with stdio transport and is ready for tool registration.

**Deliverable**: A working `src/index.ts` that creates an MCP Server instance, connects to stdio transport, and handles protocol-level operations.

**Success Definition**:
- Server compiles without errors: `npm run build`
- Server executes without crashes: `node dist/index.js` (waits for stdio input)
- Server responds to MCP initialization: Can be detected by MCP Inspector
- Process exits cleanly on errors with non-zero exit code

---

## Why

- **Foundation for all MCP tools**: The server bootstrap is the prerequisite for all subsequent tool implementations (P1.M2.T2, P1.M2.T3, P1.M2.T4)
- **Enables npx execution model**: Proper stdio transport setup allows `npx mdsel-mcp` execution
- **Protocol compliance**: Correct server initialization ensures the MCP client can communicate properly
- **Error handling foundation**: Establishes error handling patterns for the entire server lifecycle

---

## What

Implement the MCP server bootstrap in `src/index.ts` with:
1. Import MCP SDK components with ESM `.js` extensions
2. Create Server instance with name "mdsel-mcp" and version "1.0.0"
3. Declare tools capability
4. Disable ANSI color output for stdio mode
5. Implement async main() function that creates StdioServerTransport and connects
6. Add error handling with process.exit(1)
7. Add SIGINT graceful shutdown handler

### Success Criteria

- [ ] TypeScript compiles without errors: `tsc`
- [ ] Built file is executable: `node dist/index.js` starts and waits
- [ ] No TypeScript type errors
- [ ] MCP Inspector can connect and detect the server
- [ ] Process exits cleanly on fatal errors

---

## All Needed Context

### Context Completeness Check

**"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"**

Yes - this PRP provides:
- Exact import patterns for ESM
- Complete working code example
- Specific package.json and tsconfig.json values
- Exact file locations and patterns to follow
- Validation commands verified for this project

### Documentation & References

```yaml
# CRITICAL INTERNAL DOCS - Must read before implementing

- docfile: plan/docs/mcp_sdk_notes.md
  why: Official MCP SDK import patterns and package structure
  critical: "ESM imports require .js extensions even in TypeScript source"
  gotcha: "The bin entry must point to compiled JS (dist/index.js), not TypeScript source"

- docfile: plan/docs/implementation_patterns.md
  why: Complete MCP Server Bootstrap pattern with error handling
  section: "MCP Server Bootstrap Pattern"
  pattern: "Server creation → tools capability → transport connection → async main()"

- docfile: plan/docs/system_context.md
  why: Architecture overview showing stdio transport as the only transport layer
  critical: "Each MCP tool call is independent, no state management needed"

- docfile: plan/P1M2T1/research/mcp_sdk_research.md
  why: Complete working example of server initialization with proper imports
  section: "Complete Working Example"
  critical: "Connection order matters: create server → define tools → connect transport"

- docfile: plan/P1M2T1/research/mcp_examples_research.md
  why: Real-world patterns from official create-typescript-server template
  section: "Example 1: Model Context Protocol TypeScript Template"
  pattern: "Color output management with NO_COLOR environment variable"

- docfile: plan/P1M2T1/research/typescript_esm_research.md
  why: TypeScript ESM patterns including .js extension requirement
  section: "1.1 Basic Import Rules"
  gotcha: "Missing .js extension causes module not found errors at runtime"

# EXTERNAL REFERENCES - For deep dives and troubleshooting

- url: https://github.com/modelcontextprotocol/typescript-sdk
  why: Official MCP TypeScript SDK repository
  critical: "Import paths must use .js extensions for ESM"

- url: https://github.com/modelcontextprotocol/create-typescript-server
  why: Official template with minimal MCP server example
  pattern: "Look at template/src/index.ts.ejs for bootstrap pattern"

- url: https://spec.modelcontextprotocol.io
  why: MCP specification - understand protocol requirements
  critical: "Stdio transport is the standard for CLI MCP servers"

# CODEBASE FILES - Reference these for exact patterns

- file: src/index.ts
  why: Current placeholder entry point - will be completely replaced
  current: "Contains only shebang and comment"

- file: package.json
  why: Verify bin entry points to dist/index.js, dependencies are correct
  critical: "\"type\": \"module\" is required for ESM"
  pattern: "bin: { \"mdsel-mcp\": \"./dist/index.js\" }"

- file: tsconfig.json
  why: Verify module and moduleResolution are NodeNext
  critical: "\"module\": \"NodeNext\" and \"moduleResolution\": \"NodeNext\" required"
```

### Current Codebase Tree

```bash
/home/dustin/projects/mdsel-mcp-glm
├── dist/
│   ├── index.d.ts         # Compiled TypeScript declarations
│   └── index.js           # Compiled placeholder (will be replaced)
├── node_modules/          # Dependencies
├── plan/
│   ├── docs/              # Architecture documentation
│   │   ├── implementation_patterns.md
│   │   ├── mcp_sdk_notes.md
│   │   └── system_context.md
│   └── P1M2T1/
│       └── research/      # Research documents created for this PRP
│           ├── mcp_sdk_research.md
│           ├── mcp_examples_research.md
│           ├── mcp_testing_research.md
│           └── typescript_esm_research.md
├── package.json           # Project configuration with MCP SDK dependencies
├── PRD.md                 # Product Requirements Document
├── src/
│   └── index.ts           # Placeholder entry point (to be implemented)
├── tasks.json             # Task tracking
└── tsconfig.json          # TypeScript configuration for ESM
```

### Desired Codebase Tree (after implementation)

```bash
# No new files - src/index.ts will be replaced with full implementation
# File structure remains the same
```

### Known Gotchas of Our Codebase & Library Quirks

```typescript
// CRITICAL: ESM imports MUST use .js extensions
// WRONG: import { Server } from "@modelcontextprotocol/sdk/server/index";
// RIGHT: import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// CRITICAL: TypeScript module resolution requires NodeNext
// If you get module resolution errors, verify tsconfig.json has:
// "module": "NodeNext"
// "moduleResolution": "NodeNext"

// CRITICAL: The shebang must be the FIRST LINE (no preceding whitespace)
// The compiled JavaScript retains the shebang from the source

// CRITICAL: Disable ANSI color output for stdio transport
// Color codes corrupt JSON-RPC protocol messages
// Pattern from git-mcp-server: check !process.stdout.isTTY

// CRITICAL: Connection order matters for capability advertisement
// 1. Create Server instance
// 2. Set up request handlers / tools
// 3. Connect to transport
// If you connect before setting up handlers, capabilities won't be advertised

// GOTCHA: process.exit(1) on errors - non-zero exit code signals failure
// Use main().catch((error) => { console.error(...); process.exit(1); });

// GOTCHA: Graceful shutdown - handle SIGINT to close server properly
// process.on('SIGINT', async () => { await server.close(); process.exit(0); });

// GOTCHA: For zod parameter validation in future tasks, import from "zod"
// The package is already installed as a peer dependency of MCP SDK
```

---

## Implementation Blueprint

### Data Models and Structure

No data models needed for this task - this is purely infrastructure setup.

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: MODIFY src/index.ts - Replace placeholder with MCP server bootstrap
  - DELETE: All existing placeholder content except shebang
  - ADD: MCP SDK imports with .js extensions
  - ADD: Color output disable logic for stdio mode
  - ADD: Server instance creation with name/version and tools capability
  - ADD: async main() function with StdioServerTransport creation
  - ADD: server.connect(transport) call
  - ADD: main().catch() error handler with process.exit(1)
  - ADD: SIGINT handler for graceful shutdown
  - PATTERN: Follow plan/docs/implementation_patterns.md "MCP Server Bootstrap Pattern"
  - NAMING: Server name must be "mdsel-mcp", version "1.0.0"
  - PLACEMENT: All code in src/index.ts (single-file entry point)

Task 2: VERIFY package.json configuration
  - CHECK: "type": "module" is present
  - CHECK: "bin" entry points to "./dist/index.js"
  - CHECK: "@modelcontextprotocol/sdk" version ^1.25.1
  - CHECK: "zod" version ^3.25.0 (for future tool tasks)
  - NO CHANGES NEEDED: Already configured correctly

Task 3: VERIFY tsconfig.json configuration
  - CHECK: "module": "NodeNext"
  - CHECK: "moduleResolution": "NodeNext"
  - CHECK: "outDir": "./dist"
  - CHECK: "rootDir": "./src"
  - NO CHANGES NEEDED: Already configured correctly
```

### Implementation Patterns & Key Details

```typescript
// CRITICAL PATTERN: ESM imports with .js extensions
// Location: Top of src/index.ts, after shebang
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// PATTERN: Disable color output for stdio transport
// Prevents ANSI codes from corrupting JSON-RPC messages
if (!process.stdout.isTTY) {
  process.env.NO_COLOR = '1';
}

// PATTERN: Server creation with explicit capabilities
// The tools capability {} enables tool registration in future tasks
const server = new Server(
  {
    name: "mdsel-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// PATTERN: Async main function with transport connection
// Order is critical: create server, define handlers, THEN connect
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server is now listening on stdin/stdout
}

// PATTERN: Error handling with non-zero exit code
// Signals failure to calling process
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

// PATTERN: Graceful shutdown on SIGINT
// Allows MCP Inspector to cleanly disconnect
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});
```

### Complete Implementation Example

```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Disable ANSI color codes for stdio transport (corrupts JSON-RPC)
if (!process.stdout.isTTY) {
  process.env.NO_COLOR = '1';
}

// Create MCP server instance
const server = new Server(
  {
    name: "mdsel-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

// Main function: connect to stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start server with error handling
main().catch((error) => {
  console.error("Fatal error in mdsel-mcp server:", error);
  process.exit(1);
});
```

### Integration Points

```yaml
# No database or config changes needed for this task
# The integration is purely at the MCP protocol level

TRANSPORT:
  - type: "stdio (stdin/stdout)"
  - pattern: "StdioServerTransport() with no arguments uses process.stdin/stdout"

PACKAGE:
  - verify: package.json has "type": "module"
  - verify: package.json bin points to "./dist/index.js"

BUILD:
  - command: "npm run build" (runs tsc)
  - output: "dist/index.js with shebang preserved"
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after modifying src/index.ts
npm run build

# Expected: Clean compilation with no errors
# Output should show:
#   (no output on success, just compiled files in dist/)

# If errors occur, READ the TypeScript error message carefully:
# - Common: "Cannot find module" → Missing .js extension in import
# - Common: "module_resolution" errors → Check tsconfig.json has NodeNext
```

### Level 2: Type Checking (Component Validation)

```bash
# TypeScript type checking
npx tsc --noEmit

# Expected: No type errors
# If type errors occur, check import paths and server configuration
```

### Level 3: Build Verification (Output Validation)

```bash
# Verify the compiled output exists and has shebang
head -n 1 dist/index.js

# Expected: #!/usr/bin/env node

# Verify the file is executable (may need chmod for local testing)
chmod +x dist/index.js

# Test direct execution (should hang waiting for stdin)
timeout 2 node dist/index.js || true

# Expected: Process starts, waits for stdin, then times out after 2 seconds
# This is SUCCESS - it means the server is waiting for MCP protocol messages
```

### Level 4: MCP Inspector Testing (System Validation)

```bash
# Install MCP Inspector globally if not already installed
npm install -g @modelcontextprotocol/inspector

# Start the server through MCP Inspector
mcp-inspector node dist/index.js

# Expected:
# 1. Inspector UI opens in browser (or shows terminal UI)
# 2. Server "mdsel-mcp" version "1.0.0" is detected
# 3. Tools capability is shown
# 4. No errors in the inspector console

# If inspector cannot connect:
# - Check that dist/index.js exists
# - Verify shebang is present: head -n 1 dist/index.js
# - Try running directly: node dist/index.js (should wait for input)

# Manual protocol test (sends initialize request)
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js

# Expected: JSON-RPC response with server info
# Look for: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"mdsel-mcp","version":"1.0.0"}}}
```

### Level 5: Distribution Testing

```bash
# Test npx execution (simulates how users will run the server)
npx mdsel-mcp

# Expected: Process starts and waits for stdin (use Ctrl+C to exit)
# Note: This only works after publishing to npm, or with npm link

# For local testing with npm link:
npm link
mdsel-mcp  # Should start the server
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All 5 validation levels completed successfully
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Compiled file has shebang: `head -n 1 dist/index.js` shows `#!/usr/bin/env node`
- [ ] Server executes and waits for stdin: `timeout 2 node dist/index.js`
- [ ] MCP Inspector can connect and detect server: `mcp-inspector node dist/index.js`

### Feature Validation

- [ ] Server name is "mdsel-mcp" and version is "1.0.0"
- [ ] Tools capability is declared in server configuration
- [ ] Color output is disabled for stdio mode (NO_COLOR set)
- [ ] Fatal errors exit with code 1
- [ ] SIGINT handler closes server gracefully

### Code Quality Validation

- [ ] All imports use .js extensions (ESM requirement)
- [ ] Error handling follows the main().catch() pattern
- [ ] Graceful shutdown implemented with SIGINT handler
- [ ] No console.log() that would corrupt JSON-RPC (use console.error for errors)
- [ ] Code follows the pattern from plan/docs/implementation_patterns.md

### Documentation & Deployment

- [ ] Implementation matches all patterns in research documents
- [ ] No additional dependencies were added (uses existing @modelcontextprotocol/sdk)
- [ ] Package configuration unchanged (already correct)

---

## Anti-Patterns to Avoid

- Don't use CommonJS require() - must use ESM import syntax
- Don't omit .js extensions from imports - will cause runtime module errors
- Don't use console.log() for debugging - corrupts JSON-RPC protocol
- Don't skip the shebang - required for npx execution model
- Don't connect to transport before setting up handlers - capabilities won't be advertised
- Don't use process.exit(0) on errors - must use process.exit(1) for failures
- Don't forget to disable color output - ANSI codes break JSON parsing
- Don't create separate modules yet - keep everything in src/index.ts for this task
- Don't add tool definitions yet - that's P1.M2.T3 and P1.M2.T4
- Don't implement mdsel CLI execution yet - that's P1.M2.T2

---

## Confidence Score

**9/10** for one-pass implementation success likelihood

**Rationale**:
- Complete working example provided
- All import patterns specified
- Validation commands are project-specific and tested
- Research documents provide deep context
- Only missing element: actual mdsel CLI (external dependency, expected)

**Risk factors**:
- mdsel CLI must be installed on user's system for full E2E testing (future tasks)
- MCP Inspector may not be available in all environments

---

## Success Metrics

Upon completion, the following should work:

```bash
# Build succeeds
npm run build

# Direct execution starts server
node dist/index.js  # Waits for stdin

# Inspector can connect
mcp-inspector node dist/index.js  # Shows "mdsel-mcp" server detected
```

The server will be ready for the next task (P1.M2.T2: CLI Execution Layer) where tool handlers will be added.
