# mdsel CLI Research

## Overview

Research findings about the `mdsel` CLI tool that the mdsel-mcp server wraps.

## 1. What is mdsel?

**mdsel** is a **Declarative Markdown semantic selection CLI for LLM agents**. It parses Markdown documents into semantic trees and exposes machine-addressable selectors for every meaningful chunk, enabling LLMs to request exactly the content they want without loading entire files into context.

## 2. Repository Information

- **GitHub Repository**: https://github.com/dabstractor/mdsel
- **Version**: 1.0.0
- **License**: MIT
- **Language**: TypeScript/Node.js
- **Installation**: `npm install -g mdsel`
- **Requirements**: Node.js >=18.0.0

## 3. Command-Line Interface

### 3.1 Basic Usage

```bash
mdsel [options] [command]
```

### 3.2 Global Options

| Option | Description |
|--------|-------------|
| `-V, --version` | Output version number |
| `--json` | Output JSON instead of minimal text |
| `-h, --help` | Display help |

### 3.3 Commands

#### Command: `index`

Parse documents and emit selector inventory.

```bash
mdsel index <files...>
```

**Input**: Markdown file paths (one or more)

**Output** (text mode):
```
h1.0 mdsel
 h2.0 Installation
 h2.1 Quick Start
 h2.2 Commands
  h3.0 index
  h3.1 select
---
code:19 para:23 list:5 table:3
```

**Output** (JSON mode with `--json`):
```json
{
  "success": true,
  "command": "index",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "documents": [...],
    "summary": {...}
  }
}
```

#### Command: `select`

Retrieve content via selectors.

```bash
mdsel select [options] <selector> [files...]
```

**Options**:
- `--full` - Bypass truncation and return full content

**Input**:
- `selector`: A selector string (see Selector Grammar below)
- `files`: Optional Markdown file paths

**Output** (text mode):
```
## Quick Start

To get started...
```

**Output** (JSON mode with `--json`):
```json
{
  "success": true,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "matches": [...],
    "unresolved": []
  }
}
```

**Error Output** (JSON mode):
```json
{
  "success": false,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": {
    "code": "SELECTOR_NOT_FOUND",
    "message": "Selector 'h1.99' not found",
    "suggestions": ["h1.0", "h1.1"]
  }
}
```

#### Command: `format`

Output format specification for tool descriptions.

```bash
mdsel format [options] [command]
```

**Options**:
- `--example` - Show example output instead of terse spec

This command is useful for generating MCP tool schemas programmatically.

## 4. Selector Grammar

Selectors follow this pattern:

```
[namespace::]type[index][/path][?query]
```

### 4.1 Syntax Components

| Component | Description | Example |
|-----------|-------------|---------|
| `namespace` | Optional document identifier | `doc1::h1.0` |
| `type` | Node type or shorthand | `h1`, `code`, `para` |
| `index` | 0-based ordinal | `.0`, `.1-2`, `.0,2,4` |
| `path` | Additional path segments | `/section/code.0` |
| `query` | Query parameters | `?full=true` |

### 4.2 Node Types

| Full Form | Shorthand | Description |
|-----------|-----------|-------------|
| `heading:h1`-`heading:h6` | `h1`-`h6` | Headings by level |
| `section` | - | Document sections |
| `block:paragraph` | `para`, `paragraph` | Paragraph blocks |
| `block:code` | `code` | Code blocks |
| `block:list` | `list` | List blocks |
| `block:table` | `table` | Table blocks |
| `block:blockquote` | `quote`, `blockquote` | Blockquote blocks |

### 4.3 Selector Examples

```bash
# Select first heading
mdsel select h1.0 README.md

# Select nested content
mdsel select "h2.0/code.0" README.md

# Multiple selection
mdsel select h2.0,2 README.md

# Full content retrieval
mdsel select h2.0 README.md --full

# Complex nested selector
mdsel select "h1.0/h2.1/code.0" README.md

# Range selection
mdsel select h2.0-2 README.md
```

## 5. Error Handling

### 5.1 Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 2 | Usage error |

### 5.2 Error Types

| Error Code | Description |
|------------|-------------|
| `FILE_NOT_FOUND` | Specified file does not exist |
| `PARSE_ERROR` | Failed to parse Markdown |
| `INVALID_SELECTOR` | Selector syntax is invalid |
| `SELECTOR_NOT_FOUND` | Selector does not match any nodes |
| `NAMESPACE_NOT_FOUND` | Namespace not found in index |
| `PROCESSING_ERROR` | General processing error |

### 5.3 Error Suggestions

mdsel provides fuzzy-matched suggestions when selectors fail to resolve:

```json
{
  "success": false,
  "error": {
    "code": "SELECTOR_NOT_FOUND",
    "message": "Selector 'h1.99' not found",
    "suggestions": ["h1.0", "h1.1", "h2.0"]
  }
}
```

## 6. Usage Examples for MCP Integration

### 6.1 Index Command

```bash
# Single file
mdsel index README.md --json

# Multiple files
mdsel index README.md CONTRIBUTING.md --json

# Glob pattern (via shell)
mdsel index docs/**/*.md --json
```

### 6.2 Select Command

```bash
# Simple selection
mdsel select h1.0 README.md --json

# With full output
mdsel select h2.0 README.md --json --full

# Nested selection
mdsel select "h1.0/h2.0/code.0" README.md --json

# Multiple selectors
mdsel select "h2.0, h2.1" README.md --json
```

## 7. Key Behaviors for MCP Wrapper

### 7.1 JSON Output Mode

**Critical**: Always use `--json` flag for MCP integration

- Structured output is parseable
- Error information is included in response
- Timestamps provide audit trail
- Consistent format across success and error cases

### 7.2 Exit Code Behavior

- mdsel returns JSON with success field even on errors
- Exit code 0 can still have `"success": false` in JSON
- For mdsel-mcp: Return stdout JSON regardless of exit code

### 7.3 Selector Validation

- mdsel validates selectors and provides suggestions
- No pre-validation needed at MCP layer
- Pass all selectors directly to mdsel

### 7.4 File Handling

- mdsel handles file not found errors
- Returns proper error JSON
- No file existence checks needed at MCP layer

## 8. Testing mdsel Locally

### 8.1 Installation

```bash
npm install -g mdsel
```

### 8.2 Verification

```bash
# Check version
mdsel --version

# View help
mdsel --help

# Test index
mdsel index README.md --json

# Test select
mdsel select h1.0 README.md --json
```

### 8.3 Creating Test Markdown

```bash
# Create test file
cat > test.md << 'EOF'
# Test Document

## Section 1

Some paragraph text.

### Subsection

```javascript
console.log("code");
```

## Section 2

More content.
EOF

# Index it
mdsel index test.md --json

# Select from it
mdsel select h1.0 test.md --json
mdsel select "h1.0/h2.0" test.md --json
mdsel select code.0 test.md --json
```

## 9. Documentation URLs

- **Main Repository**: https://github.com/dabstractor/mdsel
- **CLI Help**: `mdsel --help`, `mdsel index --help`, `mdsel select --help`
- **Format Spec**: `mdsel format --example`

## 10. MCP Tool Mapping

### mdsel.index Tool

```typescript
// Tool registration
server.tool("mdsel.index", {
  files: z.array(z.string()).min(1).describe("Markdown file paths to index")
}, async (args) => {
  const result = await executeMdsel(["index", "--json", ...args.files]);
  return { content: [{ type: "text", text: result }] };
});
```

### mdsel.select Tool

```typescript
// Tool registration
server.tool("mdsel.select", {
  selector: z.string().describe("mdsel selector string"),
  files: z.array(z.string()).optional().describe("Optional file paths"),
  full: z.boolean().optional().default(false).describe("Return full content")
}, async (args) => {
  const cmdArgs = ["select", "--json"];
  if (args.full) cmdArgs.push("--full");
  cmdArgs.push(args.selector);
  if (args.files) cmdArgs.push(...args.files);

  const result = await executeMdsel(cmdArgs);
  return { content: [{ type: "text", text: result }] };
});
```
