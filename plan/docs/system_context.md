# System Context: mdsel-mcp

## Overview

`mdsel-mcp` is a thin MCP (Model Context Protocol) server wrapper around the `mdsel` CLI tool. It translates MCP tool calls into CLI invocations and returns results unchanged.

## Architecture Diagram

```
┌─────────────────┐     MCP/stdio     ┌─────────────────┐     spawn      ┌─────────────┐
│   MCP Client    │ ◄────────────────► │   mdsel-mcp     │ ─────────────► │   mdsel     │
│ (Claude, Agent) │   JSON-RPC 2.0    │   (Node.js)     │   subprocess   │   (CLI)     │
└─────────────────┘                    └─────────────────┘                └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────────┐
                                       │    @mcp/sdk     │
                                       │   StdioServer   │
                                       └─────────────────┘
```

## Key Design Decisions

### 1. Transport: stdio
- MCP communication via stdin/stdout
- Enables `npx mdsel-mcp` execution model
- No HTTP server, no ports, no configuration

### 2. CLI Invocation Pattern
- Spawn `mdsel` as child process per request
- Pass `--json` flag to ensure JSON output
- Capture stdout, return as-is to MCP client

### 3. No State
- Each MCP tool call is independent
- No caching, no session management
- Files specified per-request

## MCP Tools Exposed

| Tool Name     | CLI Command      | Parameters                    |
|---------------|------------------|-------------------------------|
| `mdsel.index` | `mdsel index`    | `files: string[]`             |
| `mdsel.select`| `mdsel select`   | `selector: string`, `files?: string[]`, `full?: boolean` |

## Technology Stack

- **Runtime**: Node.js (ESM modules)
- **Language**: TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk` v1.25+
- **Schema**: `zod` for parameter validation
- **Build**: `tsc` to compile TypeScript
- **Distribution**: npm package with `bin` entry for npx

## File Structure (Target)

```
mdsel-mcp/
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts      # MCP server entry point
├── dist/             # Compiled output
│   └── index.js
└── README.md
```
