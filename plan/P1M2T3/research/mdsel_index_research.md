# mdsel CLI Tool Research: Index Subcommand

## Document Information
- **Project**: mdsel-mcp-glm
- **Task**: P1M2T3 - Tool: mdsel.index
- **Version**: 1.0
- **Date**: 2025-12-28
- **Source**: Based on existing research documents and project specifications

---

## 1. mdsel CLI Overview

### What is mdsel?

**mdsel** is a **Declarative Markdown semantic selection CLI for LLM agents**. It serves as a specialized tool that:

- Parses Markdown documents into semantic trees
- Exposes machine-addressable selectors for every meaningful chunk
- Enables LLMs to request exactly the content they want without loading entire files into context
- Provides fine-grained access to Markdown content through a selector-based interface

### Purpose and Architecture

The tool is designed to solve the context window problem for LLMs when working with large Markdown documents. Instead of sending entire files, LLMs can:

1. First index the document to discover available selectors
2. Then request specific content using precise selectors
3. Receive only the relevant content needed for their task

This approach enables efficient processing of large documentation repositories, technical specs, and complex Markdown structures.

---

## 2. The `index` Subcommand

### Functionality

The `index` subcommand parses one or more Markdown documents and emits a selector inventory that describes all addressable content chunks within those documents.

### Command Syntax

```bash
mdsel index [options] <files...>
```

### Required Parameters

| Parameter | Description | Example | Required |
|-----------|-------------|---------|----------|
| `files...` | One or more Markdown file paths to index | `README.md`, `docs/**/*.md` | Yes (minimum 1) |

### Optional Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--json` | Output JSON instead of minimal text | `mdsel index README.md --json` |
| `-V, --version` | Output version number | `mdsel --version` |
| `-h, --help` | Display help | `mdsel index --help` |

### Output Formats

#### Text Mode (Default)
When called without `--json`, the index command returns minimal text output:

```text
h1.0 mdsel
 h2.0 Installation
 h2.1 Quick Start
 h2.2 Commands
  h3.0 index
  h3.1 select
---
code:19 para:23 list:5 table:3
```

**Format Explanation:**
- Hierarchical structure showing document sections
- Indentation indicates nesting level
- Final line shows content type counts

#### JSON Mode (Required for MCP)
When called with `--json`, the index returns structured data:

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

**JSON Structure Details:**

```json
{
  "success": boolean,           // Operation success status
  "command": "index",          // Always "index" for this command
  "timestamp": "ISO8601",      // Timestamp of execution
  "data": {
    "documents": [
      {
        "path": "string",      // File path
        "selectors": [         // Available selectors in this document
          {
            "selector": "h1.0", // Selector string
            "type": "heading",  // Node type
            "level": 1,        // For headings
            "title": "string",  // For headings
            "start": number,    // Character position
            "end": number,      // Character position
            "namespace": "doc" // Default namespace
          }
        ],
        "stats": {             // Document statistics
          "headings": number,
          "paragraphs": number,
          "codeBlocks": number,
          "lists": number,
          "tables": number,
          "blockquotes": number
        }
      }
    ],
    "summary": {               // Overall statistics
      "totalDocuments": number,
      "totalSelectors": number,
      "typeCounts": {
        "heading": number,
        "paragraph": number,
        "code": number,
        "list": number,
        "table": number,
        "blockquote": number
      }
    }
  }
}
```

### Example Usage

#### Basic Indexing
```bash
# Index a single file
mdsel index README.md --json

# Index multiple files
mdsel index README.md CONTRIBUTING.md CHANGELOG.md --json

# Index files with glob pattern (via shell)
mdsel index docs/**/*.md --json
```

#### Output Example
```bash
$ mdsel index example.md --json
{
  "success": true,
  "command": "index",
  "timestamp": "2024-01-01T12:34:56.789Z",
  "data": {
    "documents": [
      {
        "path": "example.md",
        "selectors": [
          {
            "selector": "h1.0",
            "type": "heading",
            "level": 1,
            "title": "Example Document",
            "start": 0,
            "end": 18,
            "namespace": "doc"
          },
          {
            "selector": "h2.0",
            "type": "heading",
            "level": 2,
            "title": "Introduction",
            "start": 20,
            "end": 33,
            "namespace": "doc"
          },
          {
            "selector": "para.0",
            "type": "paragraph",
            "start": 35,
            "end": 120,
            "namespace": "doc"
          },
          {
            "selector": "code.0",
            "type": "code",
            "language": "javascript",
            "start": 122,
            "end": 145,
            "namespace": "doc"
          }
        ],
        "stats": {
          "headings": 2,
          "paragraphs": 1,
          "codeBlocks": 1,
          "lists": 0,
          "tables": 0,
          "blockquotes": 0
        }
      }
    ],
    "summary": {
      "totalDocuments": 1,
      "totalSelectors": 4,
      "typeCounts": {
        "heading": 2,
        "paragraph": 1,
        "code": 1,
        "list": 0,
        "table": 0,
        "blockquote": 0
      }
    }
  }
}
```

---

## 3. Installation and Verification

### Installation Requirements

- **Node.js**: >= 18.0.0
- **Package Manager**: npm
- **Command**: `npm install -g mdsel`

### Verification Steps

```bash
# Check if mdsel is installed
which mdsel

# Check version
mdsel --version

# View help for index command
mdsel index --help

# Create test file
cat > test.md << 'EOF'
# Test Document

## Section 1

This is a paragraph.

```javascript
console.log("Hello World");
```

## Section 2

Another paragraph here.

- List item 1
- List item 2
EOF

# Test index command
mdsel index test.md --json
```

### Expected Output for Test

```json
{
  "success": true,
  "command": "index",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "documents": [
      {
        "path": "test.md",
        "selectors": [
          {
            "selector": "h1.0",
            "type": "heading",
            "level": 1,
            "title": "Test Document",
            "start": 0,
            "end": 13,
            "namespace": "doc"
          },
          {
            "selector": "h2.0",
            "type": "heading",
            "level": 2,
            "title": "Section 1",
            "start": 15,
            "end": 26,
            "namespace": "doc"
          },
          {
            "selector": "para.0",
            "type": "paragraph",
            "start": 28,
            "end": 56,
            "namespace": "doc"
          },
          {
            "selector": "code.0",
            "type": "code",
            "language": "javascript",
            "start": 58,
            "end": 85,
            "namespace": "doc"
          },
          {
            "selector": "h2.1",
            "type": "heading",
            "level": 2,
            "title": "Section 2",
            "start": 87,
            "end": 98,
            "namespace": "doc"
          },
          {
            "selector": "para.1",
            "type": "paragraph",
            "start": 100,
            "end": 122,
            "namespace": "doc"
          },
          {
            "selector": "list.0",
            "type": "list",
            "start": 124,
            "end": 145,
            "namespace": "doc"
          }
        ],
        "stats": {
          "headings": 3,
          "paragraphs": 2,
          "codeBlocks": 1,
          "lists": 1,
          "tables": 0,
          "blockquotes": 0
        }
      }
    ],
    "summary": {
      "totalDocuments": 1,
      "totalSelectors": 7,
      "typeCounts": {
        "heading": 3,
        "paragraph": 2,
        "code": 1,
        "list": 1,
        "table": 0,
        "blockquote": 0
      }
    }
  }
}
```

---

## 4. Error Modes and JSON Output Format

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 2 | Usage error |

### Error Types and Formats

#### File Not Found Error
```json
{
  "success": false,
  "command": "index",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File 'nonexistent.md' not found",
    "suggestions": []
  }
}
```

#### Parse Error
```json
{
  "success": false,
  "command": "index",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": {
    "code": "PARSE_ERROR",
    "message": "Failed to parse Markdown in invalid.md",
    "details": "Unexpected token at line 5, column 10",
    "suggestions": []
  }
}
```

#### Multiple Files with Mixed Results
```json
{
  "success": false,
  "command": "index",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "documents": [
      {
        "path": "valid.md",
        "selectors": [...],
        "stats": {...}
      }
    ]
  },
  "error": {
    "code": "PARTIAL_SUCCESS",
    "message": "Successfully indexed 1 of 2 files",
    "failedFiles": [
      {
        "path": "invalid.md",
        "error": {
          "code": "FILE_NOT_FOUND",
          "message": "File not found"
        }
      }
    ]
  }
}
```

### Common Error Scenarios

1. **File Not Found**: When specified files don't exist
2. **Permission Denied**: When files can't be read due to permissions
3. **Invalid Markdown**: When files contain malformed Markdown
4. **Disk I/O Error**: When reading files fails due to filesystem issues

---

## 5. Integration Requirements for MCP Wrapper

### Core Requirements

1. **Always Use `--json` Flag**: The MCP wrapper must always use the `--json` flag to get structured output.

2. **Raw Output Pass-through**: The MCP server should return the exact JSON output from mdsel without modification.

3. **Spawn Error Handling**: Handle cases where mdsel CLI cannot be spawned (not runtime errors).

### MCP Tool Implementation

```typescript
server.tool("mdsel.index", {
  files: z.array(z.string()).min(1).describe("Markdown file paths to index")
}, async (args) => {
  const result = await executeMdsel(["index", "--json", ...args.files]);
  return { content: [{ type: "text", text: result }] };
});
```

### Execution Function

```typescript
async function executeMdsel(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("mdsel", args);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => { stdout += data; });
    proc.stderr.on("data", (data) => { stderr += data; });

    proc.on("close", (code) => {
      // Return stdout regardless of exit code
      // mdsel outputs valid JSON even on errors
      resolve(stdout);
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}
```

### Key Behaviors

1. **No Pre-validation**: The MCP layer should not validate files or selectors - let mdsel handle this.

2. **Error Response Format**: Return spawn errors with `isError: true` flag:

```typescript
return {
  content: [{
    type: "text",
    text: `Failed to execute mdsel: ${error.message}`,
    isError: true
  }]
};
```

3. **Byte-Fidelity**: MCP responses must be byte-identical to mdsel CLI output.

### Testing Strategy

1. **Unit Tests**: Test with various Markdown structures
2. **Error Cases**: Test file not found, parse errors, permission issues
3. **Multiple Files**: Test indexing multiple files simultaneously
4. **Large Files**: Test with large Markdown documents

---

## 6. Selector Grammar Reference

### Selector Pattern
```
[namespace::]type[index][/path][?query]
```

### Component Breakdown

| Component | Description | Example |
|-----------|-------------|---------|
| `namespace` | Optional document identifier | `doc1::h1.0` |
| `type` | Node type or shorthand | `h1`, `code`, `para` |
| `index` | 0-based ordinal | `.0`, `.1-2`, `.0,2,4` |
| `path` | Additional path segments | `/section/code.0` |
| `query` | Query parameters | `?full=true` |

### Node Types

| Full Form | Shorthand | Description |
|-----------|-----------|-------------|
| `heading:h1`-`heading:h6` | `h1`-`h6` | Headings by level |
| `section` | - | Document sections |
| `block:paragraph` | `para`, `paragraph` | Paragraph blocks |
| `block:code` | `code` | Code blocks |
| `block:list` | `list` | List blocks |
| `block:table` | `table` | Table blocks |
| `block:blockquote` | `quote`, `blockquote` | Blockquote blocks |

### Example Selectors

```bash
# First heading
h1.0

# Code block in first section
h1.0/code.0

# Multiple selection
h2.0,2

# Complex nested selector
h1.0/h2.1/code.0
```

---

## 7. Performance Considerations

### Indexing Performance

- **Large Files**: mdsel can efficiently handle large Markdown files (10MB+)
- **Multiple Files**: Indexing multiple files in one call is more efficient than individual calls
- **Caching**: No built-in caching - files are parsed fresh each time

### Memory Usage

- Index output is typically small (KB range) even for large documents
- Memory usage scales with document complexity, not size
- No file content is stored in the index - only metadata

### Timeout Considerations

- No built-in timeout in mdsel
- MCP wrapper should implement appropriate timeouts for user experience
- Consider 30-60 second timeout for large document collections

---

## 8. Documentation Sources

- **GitHub Repository**: https://github.com/dabstractor/mdsel
- **Installation**: `npm install -g mdsel`
- **CLI Help**: `mdsel --help`, `mdsel index --help`
- **Format Spec**: `mdsel format --example`

### Additional Resources

- **GitHub Issues**: For bug reports and feature requests
- **npm Package Page**: For version information and changelog
- **TypeScript Source**: For implementation details

---

## 9. Best Practices for MCP Integration

### Tool Registration

```typescript
server.tool("mdsel.index", {
  files: z.array(z.string())
    .min(1, "At least one file must be specified")
    .describe("Markdown file paths to index")
}, async (args) => {
  try {
    const result = await executeMdsel(["index", "--json", ...args.files]);
    return { content: [{ type: "text", text: result }] };
  } catch (spawnError) {
    return {
      content: [{
        type: "text",
        text: `Failed to execute mdsel: ${spawnError.message}`,
        isError: true
      }]
    };
  }
});
```

### Usage Examples for MCP Clients

```javascript
// Index a single document
{
  "method": "tools/call",
  "params": {
    "name": "mdsel.index",
    "arguments": {
      "files": ["README.md"]
    }
  }
}

// Index multiple documents
{
  "method": "tools/call",
  "params": {
    "name": "mdsel.index",
    "arguments": {
      "files": ["docs/api.md", "docs/guide.md", "CHANGELOG.md"]
    }
  }
}
```

### Response Handling

MCP clients should:
1. Always expect JSON text content
2. Parse the JSON to check `success` field
3. Handle error objects when `success` is false
4. Use the selector information for subsequent `select` operations

---

## 10. Future Considerations

### Potential Enhancements

1. **Caching**: Add caching layer to avoid re-parsing unchanged files
2. **Incremental Indexing**: Support for adding/removing files from existing index
3. **Custom Selectors**: Support for user-defined selector patterns
4. **Output Formats**: Additional output formats (XML, YAML, etc.)

### Version Compatibility

- Current mdsel version: 1.0.0
- Compatible with Node.js 18+
- Future versions should maintain JSON output format compatibility
- Breaking changes would require MCP version updates

---

This research document provides comprehensive information about the mdsel CLI tool's `index` subcommand for implementing the MCP wrapper. The information is based on existing research and project specifications, covering all aspects needed for successful integration.