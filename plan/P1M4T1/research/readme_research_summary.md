# README Research Summary for P1.M4.T1

## Research Summary

### 1. Codebase Analysis

**Project**: `mdsel-mcp` - A Model Context Protocol (MCP) server that provides transport adapter for the `mdsel` CLI tool.

**Key Facts**:
- Package name: `mdsel-mcp`
- Version: `1.0.0`
- Binary name: `mdsel-mcp`
- Entry point: `./dist/index.js`
- Node requirement: >=18.0.0
- Type: ESM module

**Two Tools Exposed**:
1. `mdsel.index` - Index markdown files for selector-based access
2. `mdsel.select` - Select content using selector syntax

**Architecture**:
- Thin MCP wrapper around `mdsel` CLI
- Uses stdio transport
- Zod validation for tool inputs
- Stateless design

### 2. PRD Requirements (Section 10.2)

**Required README Sections**:
- Installation via `npx`
- MCP server startup
- Tool list and purpose
- Example `mdsel.index` call
- Example `mdsel.select` call
- Explanation of selector grammar (brief, mechanical)

**What to Exclude**:
- No philosophy
- No marketing

**Selector Grammar Notes**:
- Use shorthand notation (`h2.0`) not legacy syntax (`heading:h2[0]`)
- Document dot notation as preferred over bracket notation

### 3. MCP Server README Best Practices

**Common MCP Server README Sections**:
1. Project title with badges
2. Brief description
3. Installation (npx focus)
4. Configuration (Claude Desktop MCP config)
5. Available Tools (with schemas)
6. Usage Examples (tool calls)
7. Development/Setup

**Badge Sources**:
- npm version: `https://img.shields.io/npm/v/package-name.svg`
- License: `https://img.shields.io/npm/l/package-name.svg`
- Node version: `https://img.shields.io/node/v/package-name.svg`

**MCP Configuration Pattern**:
```json
{
  "mcpServers": {
    "mdsel-mcp": {
      "command": "npx",
      "args": ["-y", "mdsel-mcp"]
    }
  }
}
```

### 4. External README Best Practices 2025

**Essential Sections**:
- Title & Badges
- Description (1-2 sentences)
- Installation
- Usage
- API/Tools
- Configuration

**Code Block Formatting**:
- Use syntax highlighting (bash, typescript, json)
- Show working examples
- Include expected output where helpful

**Best Practices**:
- Keep descriptions concise and technical
- No marketing language
- Focus on practical usage
- Use consistent heading levels
- Include emojis sparingly

### 5. File References

**Files to Reference in README**:
- `/home/dustin/projects/mdsel-mcp-glm/package.json` - For package metadata
- `/home/dustin/projects/mdsel-mcp-glm/src/index.ts` - For tool schemas and implementation

**Existing Documentation**:
- `/home/dustin/projects/mdsel-mcp-glm/PRD.md` - Full product requirements
- `/home/dustin/projects/mdsel-mcp-glm/plan/docs/system_context.md` - System context

### 6. Selector Grammar Reference

Based on PRD and codebase analysis, the selector grammar uses:
- Shorthand notation: `h2.0` (second h2 heading)
- Dot notation preferred: `section.link.0`
- Legacy syntax mentioned but not primary: `heading:h2[0]`

This should be documented briefly and mechanically - no philosophy explanations.

## Sources

### Internal Sources
- PRD.md (Section 10.2) - README requirements
- src/index.ts - Tool implementation and schemas
- package.json - Package metadata and dependencies
- plan/docs/system_context.md - Architecture context

### External Sources
- npm README best practices (npmjs.com documentation)
- GitHub README guides (docs.github.com)
- MCP documentation (modelcontextprotocol.io)
- TypeScript CLI tool examples (various GitHub repositories)
