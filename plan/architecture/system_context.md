# System Context: mdsel-mcp

## Project Overview

**mdsel-mcp** is a thin MCP (Model Context Protocol) server that wraps the `mdsel` CLI tool, exposing its functionality to MCP-capable AI agents.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     MCP Client (AI Agent)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MCP Protocol (stdio)
                              │ JSON-RPC 2.0
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       mdsel-mcp Server                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Transport Layer (StdioServerTransport)                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Tool Handlers                                              │ │
│  │  ├── mdsel.index: maps to `mdsel index --json <files>`     │ │
│  │  └── mdsel.select: maps to `mdsel select --json <args>`    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CLI Executor (child_process.spawn)                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Shell Execution
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         mdsel CLI                                │
│  (Installed globally or via npx)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ File System Access
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Markdown Documents                            │
│  (*.md files on disk)                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Design Principles (from PRD)

1. **Thin Wrapper Doctrine**: No interpretation, no feature additions
2. **Protocol as Interface**: Tool schemas are the primary documentation
3. **Output Fidelity**: Byte-for-byte identical to CLI output
4. **Statelessness**: No memory, no retained state

## Package Structure

```
mdsel-mcp/
├── src/
│   └── index.ts          # Entry point, MCP server setup, tool handlers
├── package.json          # NPM package config with bin entry
├── tsconfig.json         # TypeScript configuration
├── tsup.config.ts        # Build configuration
└── README.md             # Usage documentation
```

## Key Design Decisions

### 1. Single Entry Point
The server is simple enough to be a single file. No complex directory structure needed.

### 2. CLI Execution Strategy
Use `child_process.spawn` to invoke `mdsel` CLI commands. This ensures:
- Output fidelity (stdout captured verbatim)
- Error passthrough (stderr + exit codes preserved)
- No tight coupling to mdsel internals

### 3. mdsel Dependency
`mdsel` is a **peer dependency**. The MCP server assumes `mdsel` is available in the PATH or resolvable via npx.

### 4. JSON Mode Only
The MCP server always passes `--json` to mdsel commands. The MCP protocol expects structured data.

## Integration Points

### mdsel CLI Commands

| MCP Tool | CLI Command | Notes |
|----------|-------------|-------|
| `mdsel.index` | `mdsel index --json <files...>` | Returns selector inventory |
| `mdsel.select` | `mdsel select --json <selector> <files...>` | Returns matched content |

### mdsel CLI Output Schema

Both commands return JSON with this envelope:
```typescript
interface CLIResponse {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;  // ISO 8601
  data: unknown;
  errors?: ErrorEntry[];
}
```

The MCP server returns this JSON verbatim as text content.
