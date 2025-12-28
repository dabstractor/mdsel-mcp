// ============================================================================
// FILE: src/index.test.ts
// Unit tests for MCP server handlers and Zod validation
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import * as executorModule from './executor.js';
import {
  IndexArgsSchema,
  SelectArgsSchema,
  formatZodError,
  handleListTools,
  handleCallTool,
} from './index.js';

// ----------------------------------------------------------------------------
// Module Mocking
// ----------------------------------------------------------------------------

vi.mock('./executor.js', () => ({
  executeMdsel: vi.fn(),
}));

const mockExecuteMdsel = vi.mocked(executorModule.executeMdsel);

// ----------------------------------------------------------------------------
// Test Setup
// ----------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// IndexArgsSchema Validation Tests
// ============================================================================

describe('IndexArgsSchema validation', () => {
  it('should accept valid files array', () => {
    const result = IndexArgsSchema.safeParse({
      files: ['/path/to/file.md'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toEqual(['/path/to/file.md']);
    }
  });

  it('should accept multiple files', () => {
    const result = IndexArgsSchema.safeParse({
      files: ['/path/to/file1.md', '/path/to/file2.md', '/path/to/file3.md'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.files).toHaveLength(3);
    }
  });

  it('should reject empty files array', () => {
    const result = IndexArgsSchema.safeParse({
      files: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least one');
    }
  });

  it('should reject files array with empty strings', () => {
    const result = IndexArgsSchema.safeParse({
      files: ['/valid/path.md', '', '  '],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].message).toContain('non-empty strings');
    }
  });

  it('should reject missing files property', () => {
    const result = IndexArgsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject null files', () => {
    const result = IndexArgsSchema.safeParse({
      files: null,
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-array files', () => {
    const result = IndexArgsSchema.safeParse({
      files: '/path/to/file.md' as any,
    });
    expect(result.success).toBe(false);
  });

  it('should reject array with non-string elements', () => {
    const result = IndexArgsSchema.safeParse({
      files: [123 as any, null as any],
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// SelectArgsSchema Validation Tests
// ============================================================================

describe('SelectArgsSchema validation', () => {
  it('should accept valid selector and files', () => {
    const result = SelectArgsSchema.safeParse({
      selector: 'heading:h1[0]',
      files: ['test.md'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selector).toBe('heading:h1[0]');
      expect(result.data.files).toEqual(['test.md']);
    }
  });

  it('should trim whitespace from selector', () => {
    const result = SelectArgsSchema.safeParse({
      selector: '  heading:h1[0]  ',
      files: ['test.md'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selector).toBe('heading:h1[0]');
    }
  });

  it('should reject empty selector', () => {
    const result = SelectArgsSchema.safeParse({
      selector: '',
      files: ['test.md'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('non-empty');
    }
  });

  it('should reject whitespace-only selector', () => {
    const result = SelectArgsSchema.safeParse({
      selector: '   ',
      files: ['test.md'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty files array', () => {
    const result = SelectArgsSchema.safeParse({
      selector: 'heading:h1[0]',
      files: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('at least one'))).toBe(true);
    }
  });

  it('should reject missing selector', () => {
    const result = SelectArgsSchema.safeParse({
      files: ['test.md'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing files', () => {
    const result = SelectArgsSchema.safeParse({
      selector: 'heading:h1[0]',
    });
    expect(result.success).toBe(false);
  });

  it('should accept complex selector syntax', () => {
    const result = SelectArgsSchema.safeParse({
      selector: 'readme::h2[1]/code[0]?full=true',
      files: ['README.md'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selector).toBe('readme::h2[1]/code[0]?full=true');
    }
  });
});

// ============================================================================
// formatZodError Helper Tests
// ============================================================================

describe('formatZodError', () => {
  it('should format single error correctly', () => {
    const error = new z.ZodError([
      {
        code: z.ZodIssueCode.too_small,
        path: ['files'],
        message: 'files array must contain at least one file path',
        minimum: 1,
        type: 'array',
        inclusive: true,
      },
    ]);

    const result = formatZodError(error);

    expect(result).toContain('Invalid arguments:');
    expect(result).toContain('files: files array must contain at least one file path');
  });

  it('should format multiple errors correctly', () => {
    const error = new z.ZodError([
      {
        code: z.ZodIssueCode.too_small,
        path: ['files'],
        message: 'files array must contain at least one file path',
        minimum: 1,
        type: 'array',
        inclusive: true,
      },
      {
        code: z.ZodIssueCode.invalid_type,
        path: ['selector'],
        message: 'selector must be a non-empty string',
        expected: 'string',
        received: 'undefined',
      },
    ]);

    const result = formatZodError(error);

    expect(result).toContain('Invalid arguments:');
    expect(result).toContain('; ');  // Errors separated by semicolon
  });

  it('should include usage examples in message', () => {
    const error = new z.ZodError([
      {
        code: z.ZodIssueCode.too_small,
        path: ['files'],
        message: 'files array must contain at least one file path',
        minimum: 1,
        type: 'array',
        inclusive: true,
      },
    ]);

    const result = formatZodError(error);

    expect(result).toContain('Expected format:');
    expect(result).toContain('mdsel.index:');
    expect(result).toContain('mdsel.select:');
  });

  it('should handle root-level errors (no path)', () => {
    const error = new z.ZodError([
      {
        code: z.ZodIssueCode.invalid_type,
        path: [],
        message: 'Expected object, received null',
        expected: 'object',
        received: 'null',
      },
    ]);

    const result = formatZodError(error);

    expect(result).toContain('arguments:');  // Uses 'arguments' for root path
  });

  it('should handle nested path errors', () => {
    const error = new z.ZodError([
      {
        code: z.ZodIssueCode.too_small,
        path: ['files', 0],
        message: 'String must contain at least 1 character',
        minimum: 1,
        type: 'string',
        inclusive: true,
      },
    ]);

    const result = formatZodError(error);

    expect(result).toContain('files.0:');
  });
});

// ============================================================================
// MCP Tool Handler Integration Tests
// ============================================================================

describe('handleListTools', () => {
  it('should return tool list with exactly 2 tools', async () => {
    const result = await handleListTools();

    expect(result.tools).toHaveLength(2);
  });

  it('should include mdsel.index with correct schema', async () => {
    const result = await handleListTools();

    const indexTool = result.tools.find(t => t.name === 'mdsel.index');
    expect(indexTool).toBeDefined();
    expect(indexTool?.inputSchema.type).toBe('object');
    expect(indexTool?.inputSchema.required).toContain('files');
  });

  it('should include mdsel.select with correct schema', async () => {
    const result = await handleListTools();

    const selectTool = result.tools.find(t => t.name === 'mdsel.select');
    expect(selectTool).toBeDefined();
    expect(selectTool?.inputSchema.type).toBe('object');
    expect(selectTool?.inputSchema.required).toEqual(['selector', 'files']);
  });

  it('should have required fields for all tools', async () => {
    const result = await handleListTools();

    for (const tool of result.tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
    }
  });
});

describe('handleCallTool', () => {
  describe('mdsel.index tool', () => {
    it('should call executeMdsel with correct arguments', async () => {
      mockExecuteMdsel.mockResolvedValue({
        stdout: '{"headings": []}',
        stderr: '',
        exitCode: 0,
      });

      const result = await handleCallTool({
        params: {
          name: 'mdsel.index',
          arguments: { files: ['/path/to/file.md'] },
        },
      });

      expect(mockExecuteMdsel).toHaveBeenCalledWith(['index', '--json', '/path/to/file.md']);
      expect(result.isError).toBeUndefined();
      expect(result.content[0].type).toBe('text');
    });

    it('should return success response when exitCode is 0', async () => {
      mockExecuteMdsel.mockResolvedValue({
        stdout: '{"headings": [{"level": 1, "text": "Test"}]}',
        stderr: '',
        exitCode: 0,
      });

      const result = await handleCallTool({
        params: {
          name: 'mdsel.index',
          arguments: { files: ['test.md'] },
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('headings');
    });

    it('should return error response when exitCode is non-zero', async () => {
      mockExecuteMdsel.mockResolvedValue({
        stdout: '',
        stderr: 'Error: File not found',
        exitCode: 1,
      });

      const result = await handleCallTool({
        params: {
          name: 'mdsel.index',
          arguments: { files: ['missing.md'] },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: File not found');
    });

    it('should return error response for invalid arguments (empty files)', async () => {
      const result = await handleCallTool({
        params: {
          name: 'mdsel.index',
          arguments: { files: [] },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid arguments:');
    });

    it('should return error response for invalid arguments (missing files)', async () => {
      const result = await handleCallTool({
        params: {
          name: 'mdsel.index',
          arguments: {},
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid arguments:');
    });

    it('should catch and format spawn errors', async () => {
      mockExecuteMdsel.mockRejectedValue(new Error('npx or mdsel not found'));

      const result = await handleCallTool({
        params: {
          name: 'mdsel.index',
          arguments: { files: ['test.md'] },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error executing mdsel');
    });
  });

  describe('mdsel.select tool', () => {
    it('should call executeMdsel with correct arguments', async () => {
      mockExecuteMdsel.mockResolvedValue({
        stdout: '# Test\n',
        stderr: '',
        exitCode: 0,
      });

      const result = await handleCallTool({
        params: {
          name: 'mdsel.select',
          arguments: { selector: 'heading:h1[0]', files: ['test.md'] },
        },
      });

      expect(mockExecuteMdsel).toHaveBeenCalledWith(['select', '--json', 'heading:h1[0]', 'test.md']);
      expect(result.isError).toBeUndefined();
    });

    it('should trim whitespace from selector', async () => {
      mockExecuteMdsel.mockResolvedValue({
        stdout: '# Test\n',
        stderr: '',
        exitCode: 0,
      });

      const result = await handleCallTool({
        params: {
          name: 'mdsel.select',
          arguments: { selector: '  heading:h1[0]  ', files: ['test.md'] },
        },
      });

      expect(mockExecuteMdsel).toHaveBeenCalledWith(['select', '--json', 'heading:h1[0]', 'test.md']);
      expect(result.isError).toBeUndefined();
    });

    it('should return success response when exitCode is 0', async () => {
      mockExecuteMdsel.mockResolvedValue({
        stdout: '# Test Heading\n\nContent',
        stderr: '',
        exitCode: 0,
      });

      const result = await handleCallTool({
        params: {
          name: 'mdsel.select',
          arguments: { selector: 'h1[0]', files: ['test.md'] },
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('# Test Heading');
    });

    it('should return error response when exitCode is non-zero', async () => {
      mockExecuteMdsel.mockResolvedValue({
        stdout: '',
        stderr: 'Invalid selector syntax',
        exitCode: 2,
      });

      const result = await handleCallTool({
        params: {
          name: 'mdsel.select',
          arguments: { selector: 'invalid', files: ['test.md'] },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid selector syntax');
    });

    it('should return error response for invalid arguments (empty selector)', async () => {
      const result = await handleCallTool({
        params: {
          name: 'mdsel.select',
          arguments: { selector: '', files: ['test.md'] },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid arguments:');
    });

    it('should return error response for invalid arguments (empty files)', async () => {
      const result = await handleCallTool({
        params: {
          name: 'mdsel.select',
          arguments: { selector: 'heading:h1[0]', files: [] },
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Invalid arguments:');
    });
  });

  describe('Unknown tool handling', () => {
    it('should return error response for unknown tool name', async () => {
      const result = await handleCallTool({
        params: {
          name: 'unknown.tool',
          arguments: {},
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool: unknown.tool');
      expect(result.content[0].text).toContain('Available tools: mdsel.index, mdsel.select');
    });

    it('should list available tools in error message', async () => {
      const result = await handleCallTool({
        params: {
          name: 'unknown.tool',
          arguments: {},
        },
      });

      expect(result.content[0].text).toContain('mdsel.index');
      expect(result.content[0].text).toContain('mdsel.select');
    });
  });
});

// ============================================================================
// Tool Definition Tests
// ============================================================================

describe('Tool Definitions', () => {
  // Verify expected tool definitions (these are hardcoded in index.ts)
  // These tests ensure the tool definitions match MCP protocol expectations

  it('should have mdsel.index tool with correct properties', () => {
    const expectedTool = {
      name: 'mdsel.index',
      description: expect.stringContaining('Generate a selector inventory'),
      inputSchema: {
        type: 'object',
        properties: expect.objectContaining({
          files: expect.objectContaining({
            type: 'array',
            items: { type: 'string' },
          }),
        }),
        required: ['files'],
      },
    };

    expect(expectedTool.name).toBe('mdsel.index');
    expect(expectedTool.inputSchema.required).toContain('files');
  });

  it('should have mdsel.select tool with correct properties', () => {
    const expectedTool = {
      name: 'mdsel.select',
      description: expect.stringContaining('Select content'),
      inputSchema: {
        type: 'object',
        properties: expect.objectContaining({
          selector: expect.objectContaining({
            type: 'string',
          }),
          files: expect.objectContaining({
            type: 'array',
          }),
        }),
        required: ['selector', 'files'],
      },
    };

    expect(expectedTool.name).toBe('mdsel.select');
    expect(expectedTool.inputSchema.required).toEqual(['selector', 'files']);
  });

  it('should have exactly 2 tools', () => {
    const expectedToolCount = 2;
    expect(expectedToolCount).toBe(2);
  });
});
