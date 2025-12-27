# PRD: `mdsel-mcp`

**Minimal MCP Server for Declarative Markdown Selection**

---

## 1. Purpose & Scope

`mdsel-mcp` exposes the `mdsel` CLI as a **Model Context Protocol (MCP) server**, enabling non–Claude Code agents to perform selector-based Markdown access.

This project is intentionally boring.

It exists to:

* Provide protocol-level access to `mdsel`
* Preserve deterministic, selector-driven document retrieval
* Enable usage by any MCP-capable client

---

## 2. Design Philosophy

### 2.1 Thin Wrapper Doctrine

`mdsel-mcp` is a transport adapter, not a feature layer.

It must:

* Translate MCP calls → `mdsel` invocations
* Return results unchanged
* Avoid all interpretation

If a behavior is not present in `mdsel`, it must not exist here.

---

### 2.2 Protocol as Interface

The MCP schema is the **primary user interface**.

Agents must be able to infer correct usage solely from:

* Tool names
* Parameter schemas
* Inline descriptions

---

## 3. Distribution & Execution

### 3.1 Runtime

* Node.js

### 3.2 Installation & Execution

The server must be runnable via:

```
npx mdsel-mcp
```

No global install required.

---

## 4. MCP Tool Surface

Exactly **two tools** are exposed.

No auxiliary helpers.
No aliases.

---

### 4.1 Tool: `mdsel.index`

#### Purpose

Return a selector inventory for one or more Markdown documents.

#### Parameters

* Explicit file paths provided per request

#### Behavior

* Invoke `mdsel index`
* Return structured JSON exactly as emitted
* No modification

---

### 4.2 Tool: `mdsel.select`

#### Purpose

Retrieve document content via selectors.

#### Parameters

* One or more selectors
* Optional document namespaces (as supported by `mdsel`)

#### Behavior

* Invoke `mdsel select`
* Return structured JSON exactly as emitted
* No interpretation

---

## 5. File Handling Model

* All file paths are provided explicitly per call
* No persistent document registry
* No cross-call namespaces
* No indexing cache

Each request is fully self-contained.

---

## 6. Error Handling

### 6.1 Selector Errors

All errors returned by `mdsel` are passed through unchanged.

No validation is performed at the MCP layer.

---

### 6.2 Execution Errors

If `mdsel` fails to execute:

* The error is surfaced verbatim to the MCP client
* No retries
* No fallbacks

---

## 7. Output Fidelity

Output must be:

* Byte-for-byte identical to `mdsel` JSON output
* No additional wrapper fields
* No metadata injected by the MCP server

---

## 8. Statelessness

* No memory
* No retained documents
* No retained selectors
* No session awareness

---

## 9. Non-Goals (Explicit)

This project will **not**:

* Add reminders or behavioral conditioning
* Enforce usage patterns
* Summarize content
* Validate selectors
* Optimize token usage beyond `mdsel`
* Maintain document state

---

## 10. Documentation Requirements

### 10.1 Audience

* Humans configuring MCP-based agents
* Tooling integrators

Agents may read this documentation once during setup, but it is not optimized for repeated agent consumption.

---

### 10.2 Required Documentation Sections

README **must** include:

* Installation via `npx`
* MCP server startup
* Tool list and purpose
* Example `index` call
* Example `select` call
* Explanation of selector grammar (brief, mechanical)

No philosophy.
No marketing.

---

## 11. Success Criteria

`mdsel-mcp` is successful if:

* Any MCP-capable agent can use `mdsel` without custom glue code
* Output matches CLI exactly
* The server remains invisible beyond transport concerns
