# Vitest Testing Framework Research

## 1. Official Documentation URL and Setup Guide

**Official Documentation:** [Vitest.dev](https://vitest.dev/)

**Quick Setup Guide:** [Vitest Installation Guide](https://vitest.dev/guide/)

## 2. Configure Vitest for ESM Projects

For projects with `"type": "module"` in package.json:

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### package.json
```json
{
  "name": "your-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node", "vitest/globals"]
  }
}
```

## 3. Best Practices for Testing TypeScript Code with Vitest

### File Organization
- Place test files alongside source files with `.test.ts` extension
- Or place all tests in a `__tests__` directory
- Use descriptive test names that explain the behavior

### Test Structure
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('ClassName', () => {
  let sut: ClassName // System Under Test

  beforeEach(() => {
    sut = new ClassName()
  })

  afterEach(() => {
    // Cleanup if needed
  })

  it('should initialize with default values', () => {
    expect(sut.property).toBe(expectedValue)
  })

  it('should handle edge cases', () => {
    expect(() => sut.invalidMethod()).toThrow()
  })
})
```

### Mocking Strategies
```typescript
// Mocking dependencies
import { mocked } from 'vitest/utils'
import { dependency } from './dependency'

const mockedDependency = mocked(dependency)
```

## 4. How to Mock child_process.spawn Function

### Basic Mock
```typescript
import { describe, it, expect, vi } from 'vitest'
import { spawn } from 'child_process'

describe('child_process.spawn tests', () => {
  it('should spawn process correctly', () => {
    const spawnSpy = vi.spyOn(require('child_process'), 'spawn')

    // Setup mock
    spawnSpy.mockImplementation((command, args) => {
      const mockProcess = new EventEmitter()
      mockProcess.stdout = new EventEmitter()
      mockProcess.stderr = new EventEmitter()
      mockProcess.pid = 12345
      setTimeout(() => mockProcess.emit('close', 0), 100)
      return mockProcess as any
    })

    // Test your code
    // ...

    // Restore
    spawnSpy.mockRestore()
  })
})
```

### Using Mock Child Processes
```typescript
import { vi } from 'vitest'
import { spawn } from 'child_process'

const mockSpawn = vi.fn()
vi.mock('child_process', () => ({
  spawn: mockSpawn
}))

describe('using mock spawn', () => {
  beforeEach(() => {
    mockSpawn.mockClear()
  })

  it('calls spawn with correct arguments', () => {
    // Your code that calls spawn
    expect(mockSpawn).toHaveBeenCalledWith('npm', ['install'], expect.any(Object))
  })
})
```

## 5. How to Test Async Functions and Promises

### Basic Async Testing
```typescript
import { describe, it, expect } from 'vitest'

describe('async functions', () => {
  it('should resolve with correct value', async () => {
    const result = await asyncFunction()
    expect(result).toBe('expected value')
  })

  it('should reject with error', async () => {
    await expect(asyncFunctionThatThrows()).rejects.toThrow('Error message')
  })
})
```

### Promise Testing
```typescript
describe('promise tests', () => {
  it('handles resolved promises', () => {
    return promiseFunction().then(result => {
      expect(result).toBe('success')
    })
  })

  it('handles rejected promises', () => {
    return promiseFunctionThatFails().catch(error => {
      expect(error.message).toBe('failed')
    })
  })
})
```

### Async/Await with Timeout
```typescript
import { describe, it, expect } from 'vitest'

describe('async with timeout', () => {
  it('resolves within timeout', async () => {
    await expect(slowFunction()).resolves.toBe('done')
  }, 5000) // 5 second timeout
})
```

## 6. Test File Naming Conventions and Placement

### Conventions
- `*.test.ts` - standard test files
- `*.spec.ts` - alternative naming convention
- `__tests__/` - directory for all tests

### Recommended Structure
```
src/
├── lib/
│   ├── calculator.ts
│   └── calculator.test.ts
├── services/
│   ├── api.ts
│   └── api.test.ts
└── utils/
    └── helpers.ts

tests/
├── integration/
│   └── api.test.ts
├── unit/
│   └── helpers.test.ts
└── setup.ts
```

### Glob Patterns for Test Discovery
```json
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
    },
  },
})
```

## 7. How to Run Tests and Get Coverage

### Basic Test Commands
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test -- --watch

# Run specific test file
npm run test -- math.test.ts

# Run tests matching pattern
npm run test -- --grep "addition"
```

### Coverage Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'coverage/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
})
```

### Coverage Reports
- Terminal: `--coverage` flag shows summary
- HTML: `coverage/index.html` - detailed browser report
- JSON: `coverage/coverage-final.json` - machine-readable format

## Additional Resources

- [Vitest GitHub Repository](https://github.com/vitest-dev/vitest)
- [Vitest API Reference](https://vitest.dev/api/)
- [Vitest Utils](https://vitest.dev/gest.html)
- [Vitest Mock Functions](https://vitest.dev/api/vi.html)