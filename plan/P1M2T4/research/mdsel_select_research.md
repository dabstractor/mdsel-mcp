# mdsel select Command Research

## Overview

Research findings about the `mdsel select` command for implementing the `mdsel.select` MCP tool.

## 1. Command Syntax

```bash
mdsel select [options] <selector> [files...]
```

### 1.1 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | string | Yes | mdsel selector string |
| `files` | string[] | No | Markdown file paths to search |

### 1.2 Options

| Option | Type | Description |
|--------|------|-------------|
| `--full` | flag | Bypass truncation and return full content |
| `--json` | flag | Output JSON format (required for MCP) |

## 2. Selector Grammar

Selectors follow this pattern:

```
[namespace::]type[index][/path][?query]
```

### 2.1 Syntax Components

| Component | Description | Example |
|-----------|-------------|---------|
| `namespace` | Optional document identifier | `doc1::h1.0` |
| `type` | Node type or shorthand | `h1`, `code`, `para` |
| `index` | 0-based ordinal | `.0`, `.1-2`, `.0,2,4` |
| `path` | Additional path segments | `/section/code.0` |
| `query` | Query parameters | `?full=true` |

### 2.2 Node Types

| Full Form | Shorthand | Description |
|-----------|-----------|-------------|
| `heading:h1`-`heading:h6` | `h1`-`h6` | Headings by level |
| `section` | - | Document sections |
| `block:paragraph` | `para`, `paragraph` | Paragraph blocks |
| `block:code` | `code` | Code blocks |
| `block:list` | `list` | List blocks |
| `block:table` | `table` | Table blocks |
| `block:blockquote` | `quote`, `blockquote` | Blockquote blocks |

## 3. Selector Examples

### 3.1 Basic Selectors

```bash
# Select first heading
mdsel select h1.0 README.md

# Select second heading
mdsel select h1.1 README.md

# Select first code block
mdsel select code.0 README.md

# Select first paragraph
mdsel select para.0 README.md
```

### 3.2 Nested Selectors

```bash
# Select code block under second heading
mdsel select "h2.0/code.0" README.md

# Select paragraph under subsection
mdsel select "h1.0/h2.0/para.0" README.md

# Deep nested selection
mdsel select "h1.0/h2.1/h3.0/code.0" README.md
```

### 3.3 Multiple Selection

```bash
# Select multiple headings by range
mdsel select h2.0-2 README.md

# Select specific headings
mdsel select h2.0,2,4 README.md

# Select multiple types
mdsel select "h1.0, h2.0" README.md
```

### 3.4 With Options

```bash
# Select with full output (no truncation)
mdsel select h2.0 README.md --full

# Select with JSON output
mdsel select h1.0 README.md --json

# Select with both options
mdsel select h2.0 README.md --json --full
```

## 4. Output Format

### 4.1 Text Mode (default)

```
## Quick Start

To get started with mdsel, install it globally:
```bash
npm install -g mdsel
```

Then run the index command to see available selectors.
```

### 4.2 JSON Mode (with `--json`)

**Success Response**:
```json
{
  "success": true,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "h1.0",
        "content": "# Main Heading\n\n",
        "type": "heading",
        "level": 1,
        "line": 0,
        "column": 0
      }
    ],
    "unresolved": []
  }
}
```

**Multiple Matches Response**:
```json
{
  "success": true,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "h2.0",
        "content": "## Section 1\n\nSome content.\n\n",
        "type": "heading",
        "level": 2
      },
      {
        "selector": "h2.1",
        "content": "## Section 2\n\nMore content.\n\n",
        "type": "heading",
        "level": 2
      }
    ],
    "unresolved": []
  }
}
```

**Code Block Match**:
```json
{
  "success": true,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "matches": [
      {
        "selector": "h2.0/code.0",
        "content": "```javascript\nconsole.log('hello');\n```\n",
        "type": "code",
        "lang": "javascript",
        "line": 10
      }
    ],
    "unresolved": []
  }
}
```

## 5. Error Responses

### 5.1 Selector Not Found

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

### 5.2 Invalid Selector Syntax

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": {
    "code": "INVALID_SELECTOR",
    "message": "Invalid selector syntax: 'invalid:::selector'"
  }
}
```

### 5.3 File Not Found

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found: /path/to/nonexistent.md"
  }
}
```

### 5.4 Parse Error

```json
{
  "success": false,
  "command": "select",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "error": {
    "code": "PARSE_ERROR",
    "message": "Failed to parse Markdown",
    "details": {
      "file": "/path/to/file.md",
      "line": 15,
      "reason": "Unclosed code block"
    }
  }
}
```

## 6. Error Codes

| Error Code | Description |
|------------|-------------|
| `FILE_NOT_FOUND` | Specified file does not exist |
| `PARSE_ERROR` | Failed to parse Markdown |
| `INVALID_SELECTOR` | Selector syntax is invalid |
| `SELECTOR_NOT_FOUND` | Selector does not match any nodes |
| `NAMESPACE_NOT_FOUND` | Namespace not found in index |
| `PROCESSING_ERROR` | General processing error |

## 7. Command Construction for MCP

### 7.1 Basic Command

```typescript
const args = ["select", "--json", selector];
```

### 7.2 With Full Flag

```typescript
const args = ["select", "--json"];
if (full) {
  args.push("--full");
}
args.push(selector);
```

### 7.3 With Files

```typescript
const args = ["select", "--json", selector];
if (files) {
  args.push(...files);
}
```

### 7.4 Complete Command Construction

```typescript
const cmdArgs = ["select", "--json"];

// Add --full flag BEFORE selector (critical)
if (parsed.data.full) {
  cmdArgs.push("--full");
}

// Add required selector
cmdArgs.push(parsed.data.selector);

// Add optional files
if (parsed.data.files) {
  cmdArgs.push(...parsed.data.files);
}

// Result: ["select", "--json", "--full", "h1.0", "README.md"]
// or:     ["select", "--json", "h1.0"]
```

## 8. Key Behaviors for MCP Integration

### 8.1 JSON Output Mode

**Critical**: Always use `--json` flag for MCP integration

- Structured output is parseable
- Error information is included in response
- Timestamps provide audit trail
- Consistent format across success and error cases

### 8.2 Exit Code Behavior

- mdsel returns JSON with success field even on errors
- Exit code 0 can still have `"success": false` in JSON
- For mdsel-mcp: Return stdout JSON regardless of exit code

### 8.3 Selector Validation

- mdsel validates selectors and provides suggestions
- No pre-validation needed at MCP layer
- Pass all selectors directly to mdsel

### 8.4 File Handling

- If files not provided, mdsel searches current directory
- mdsel handles file not found errors gracefully
- Returns proper error JSON
- No file existence checks needed at MCP layer

### 8.5 Truncation Behavior

- By default, mdsel truncates long content
- Use `--full` flag to bypass truncation
- This is important for large code blocks or long paragraphs

## 9. Usage Examples for Testing

### 9.1 Create Test Document

```bash
cat > /tmp/test_select.md << 'EOF'
# Main Document Title

## First Section

This is a paragraph with some text.

### Subsection A

```javascript
function example() {
  return "hello";
}
```

## Second Section

- List item one
- List item two
- List item three

More paragraph text here.

### Subsection B

Some content under subsection B.

## Third Section

Final section content.

```python
def another_example():
    return "world"
```
EOF
```

### 9.2 Test Commands

```bash
# Test simple heading selection
mdsel select h1.0 /tmp/test_select.md --json

# Test section selection
mdsel select h2.0 /tmp/test_select.md --json

# Test nested selector (code under section)
mdsel select "h2.0/code.0" /tmp/test_select.md --json

# Test range selection
mdsel select h2.0-1 /tmp/test_select.md --json

# Test with full flag
mdsel select h2.0 /tmp/test_select.md --json --full

# Test without files (current directory)
cd /tmp && mdsel select h1.0 test_select.md --json
```

## 10. Integration with mdsel.index

The typical workflow is:

1. Call `mdsel.index` to discover available selectors
2. Parse the JSON response to get selector list
3. Call `mdsel.select` with desired selector(s)

```bash
# Step 1: Index to discover selectors
mdsel index README.md --json

# Response includes selectors like:
# "h1.0", "h2.0", "h2.1", "h2.0/code.0", etc.

# Step 2: Select specific content
mdsel select "h2.0/code.0" README.md --json
```

## 11. Documentation References

- **GitHub Repository**: https://github.com/dabstractor/mdsel
- **CLI Help**: `mdsel select --help`
- **Format Spec**: `mdsel format --example`
