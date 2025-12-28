# mdsel CLI Tool Research

## Overview

`mdsel` is a declarative Markdown semantic selection CLI tool for LLM agents. It parses Markdown documents into semantic trees and exposes machine-addressable selectors for every meaningful chunk.

## Installation Method

### npm install (Recommended)
```bash
npm install -g mdsel
```

### Requirements
- Node.js >=18.0.0

### Alternative (npx)
The tool can also be run via npx, though this requires the tool to be installed locally or available in the npm registry.

## Command Syntax

### 1. `mdsel index --json`

**Purpose**: Parse documents and emit selector inventory.

**Syntax**:
```bash
mdsel index [options] <files...>
```

**Example**:
```bash
mdsel index --json README.md docs/API.md
```

**Options**:
- `--json` - Output JSON instead of minimal text
- `-h, --help` - Display help

### 2. `mdsel select --json`

**Purpose**: Retrieve content via selectors.

**Syntax**:
```bash
mdsel select [options] <selector> [files...]
```

**Example**:
```bash
mdsel select --json "heading:h2[0]" README.md
mdsel select --json "readme::heading:h2[0]/block:code[0]" README.md
mdsel select --json "heading:h1[0]?full=true" README.md
```

**Options**:
- `--json` - Output JSON instead of minimal text
- `--full` - Bypass truncation and return full content
- `-h, --help` - Display help

## Output JSON Schema

### Response Envelope (Common to both commands)

```typescript
interface CLIResponse<T = unknown> {
  success: boolean;
  command: 'index' | 'select';
  timestamp: string;        // ISO 8601 format
  data: T | null;
  errors?: ErrorEntry[];
}

interface ErrorEntry {
  type: string;
  code: string;
  message: string;
  selector?: string;
}
```

### Index Response Schema

```typescript
interface IndexResponse {
  documents: DocumentIndex[];
  summary: {
    total_documents: number;
    total_nodes: number;
    total_selectors: number;
  };
}

interface DocumentIndex {
  namespace: string;          // Derived from filename (e.g., 'README.md' → 'readme')
  file_path: string;
  root?: RootNode;           // Optional root node information
  headings: HeadingNode[];
  blocks: BlockStats;
}

interface RootNode {
  selector: string;
  type: 'root';
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
}

interface HeadingNode {
  selector: string;
  type: string;              // 'heading:h1' through 'heading:h6'
  depth: number;
  text: string;
  content_preview: string;
  truncated: boolean;
  children_count: number;
  word_count: number;
  section_word_count: number;
  section_truncated: boolean;
}

interface BlockStats {
  paragraphs: number;
  code_blocks: number;
  lists: number;
  tables: number;
  blockquotes: number;
}
```

### Select Response Schema

```typescript
interface SelectResponse {
  matches: MatchItem[];
  unresolved: UnresolvedItem[];
}

interface MatchItem {
  selector: string;
  type: string;              // 'heading', 'section', 'block:paragraph', etc.
  content: string;
  truncated: boolean;
  children_available: ChildItem[];
}

interface ChildItem {
  selector: string;
  type: string;
  preview: string;
}

interface UnresolvedItem {
  selector: string;
  reason: string;
  suggestions: string[];
}
```

## Exit Codes and Error Handling

### Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 2 | Usage error |

### Error Types
| Type | Description |
|------|-------------|
| `FILE_NOT_FOUND` | Specified file does not exist |
| `PARSE_ERROR` | Markdown parsing failed |
| `INVALID_SELECTOR` | Selector syntax is invalid |
| `SELECTOR_NOT_FOUND` | Selector does not match any nodes |
| `NAMESPACE_NOT_FOUND` | Specified namespace does not exist |
| `PROCESSING_ERROR` | General processing error |

### Error Response Example

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2025-12-28T00:16:26.178Z",
  "data": null,
  "errors": [
    {
      "type": "INVALID_SELECTOR",
      "code": "INVALID_SYNTAX",
      "message": "Unknown selector 'invalid' - use h1-h6, code, para, list, table, quote, root, or section",
      "selector": "invalid:selector[999]"
    }
  ]
}
```

## Selector Grammar

### Syntax
```
[namespace::]type[index][/path]?query
```

### Components
- **namespace** (optional) - Document identifier, defaults to all documents
- **type** - Node type (root, heading, section, block)
- **index** (optional) - 0-based ordinal among siblings
- **path** (optional) - Additional path segments for nested selection
- **query** (optional) - Query parameters (e.g., `?full=true`)

### Node Types
| Category | Types | Shorthand |
|----------|-------|-----------|
| Root | `root` | - |
| Headings | `heading:h1`, `heading:h2`, `heading:h3`, `heading:h4`, `heading:h5`, `heading:h6` | `h1`, `h2`, `h3`, `h4`, `h5`, `h6` |
| Sections | `section` | - |
| Blocks | `block:paragraph`, `block:list`, `block:code`, `block:table`, `block:blockquote` | `para`, `list`, `code`, `table`, `quote` |

### Examples
- `heading:h1[0]` - First h1 heading
- `readme::heading:h2[0]` - First h2 in readme namespace
- `block:code[0]` - First code block
- `heading:h2[1]/block:code[0]` - First code block under second h2
- `section[0]?full=true` - Full content of first section

## Documentation and Examples

### Primary Sources
1. **GitHub Repository**: /home/dustin/projects/mdsel/ (local clone)
2. **README**: /home/dustin/projects/mdsel/README.md
3. **Source Code**: Available in the above directory

### URLs
- While there's no public npm package found, the tool exists locally and documentation is available at the GitHub repository.

### Test Examples Used
Based on testing with a sample markdown file:

```markdown
# Test Document

## Section 1

Some content here.

```javascript
console.log("hello");
```

### Subsection

More content.
```

### Index Command Output Example
```json
{
  "success": true,
  "command": "index",
  "timestamp": "2025-12-28T00:16:19.299Z",
  "data": {
    "documents": [
      {
        "namespace": "test",
        "file_path": "test.md",
        "headings": [
          {
            "selector": "test::heading:h1[0]",
            "type": "heading:h1",
            "depth": 1,
            "text": "Test Document",
            "content_preview": "Test Document",
            "truncated": false,
            "children_count": 5,
            "word_count": 2,
            "section_word_count": 2,
            "section_truncated": false
          }
        ],
        "blocks": {
          "paragraphs": 2,
          "code_blocks": 1,
          "lists": 0,
          "tables": 0,
          "blockquotes": 0
        }
      }
    ],
    "summary": {
      "total_documents": 1,
      "total_nodes": 6,
      "total_selectors": 6
    }
  }
}
```

### Select Command Output Example
```json
{
  "success": true,
  "command": "select",
  "timestamp": "2025-12-28T00:16:23.126Z",
  "data": {
    "matches": [
      {
        "selector": "heading:h1.0",
        "type": "section",
        "content": "# Test Document\n\n## Section 1\n\nSome content here.\n\n```javascript\nconsole.log(\"hello\");\n```\n\n### Subsection\n\nMore content.",
        "truncated": false,
        "children_available": [
          {"selector": "h1[0]", "type": "heading", "preview": "Test Document"},
          {"selector": "h2[0]", "type": "heading", "preview": "Section 1"}
        ]
      }
    ],
    "unresolved": []
  }
}
```

## Key Findings

1. **Installation**: Tool is installed globally via `npm install -g mdsel`
2. **Version**: Tested with version 1.0.0
3. **JSON Output**: Both commands support `--json` flag for structured output
4. **Error Handling**: Consistent error format with type, code, message
5. **Selectors**: Support complex path-based selection with namespaces
6. **Output Fidelity**: Exactly what the MCP server needs - verbatim CLI output

## MCP Server Implications

The research confirms that the MCP server implementation plan is accurate:
- Tool mappings are correct (`mdsel.index` → `mdsel index --json`)
- Output schemas match the expected format
- Error handling passthrough is appropriate
- No interpretation needed - direct CLI execution is sufficient