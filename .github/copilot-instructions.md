# Copilot Instructions for dtdl-parser

## Overview

TypeScript library (ES2022/ESNext) for parsing DTDL ontologies using .NET interop compiled to WASM. Functional style, synchronous file operations, structured error handling.

## Code Style

- **Module System**: Pure ESM (`"type": "module"`); always use `.js` extension in imports even for `.ts` files
- **Formatting**: Single quotes, no semicolons, 120 char line width, ES5 trailing commas
- **Imports**: Prettier organizes imports automatically; use `import type` for type-only imports
- **Console**: Destructure at module top: `const { log, error } = console` (bypasses `no-console` rule)
- **Naming**: 
  - Files: `kebab-case.ts`
  - Functions/variables: `camelCase` 
  - Types/interfaces: `PascalCase`
  - Type guards: prefix with `is` (e.g., `isModelingException`)
- **TypeScript**: Strict mode enabled except `noImplicitAny: false`; prefer type guards over assertions

## Project Structure

```
src/
  index.ts              # Public API: parsing/validation functions
  error.ts              # Type guards and error handlers
  interop.ts            # .NET parser interface
  __tests__/            # Co-located unit tests (*.test.ts)
  interop/              # .NET C# implementation
types/                  # TypeScript declarations for .NET types
  DtdlOm.d.ts          # Object model types
  DtdlErr.d.ts         # Error types
test/integration/       # Post-build integration tests (*.test.js)
dtdl/                   # DTDL JSON test fixtures
build/                  # Compiled output (gitignored)
```

## Common Patterns

### Imports

```typescript
// External dependencies
import fs from 'fs'
import path from 'path'

// Type-only imports with .d.ts extension
import type { ModelingException } from '../types/DtdlErr.d.ts'
import type { DtdlObjectModel } from '../types/DtdlOm.d.ts'

// Local imports with .js extension (ESM requirement)
import { errorHandler } from './error.js'
import type { Parser } from './interop.js'
```

### Error Handling (Result Pattern)

Functions return errors as values rather than throwing:

```typescript
export const parseDtdl = (json: string, parser: Parser): DtdlObjectModel | ModelingException => {
  try {
    const model = JSON.parse(parser.parse(json)) as DtdlObjectModel
    log(`Successfully parsed`)
    return model
  } catch (err) {
    error(`Error parsing`)
    return errorHandler(err)  // Returns structured exception
  }
}
```

### Type Guards

Use discriminated unions with type predicates:

```typescript
export const isModelingException = (input: unknown): input is ModelingException => {
  if (typeof input === 'object' && input !== null && 'ExceptionKind' in input) {
    const exception = input as ModelingException
    return isParsingEx(exception) || isResolutionEx(exception)
  }
  return false
}

// Usage
if (isModelingException(fullModel)) {
  log('Error while parsing directories:')
  return null
}
```

### Logging Pattern

```typescript
const { log, error } = console

export const someFunction = (param: string): ResultType | null => {
  log(`Starting operation on: '${param}'`)
  
  if (!isValid(param)) {
    error(`Invalid parameter: '${param}'`)
    return null
  }
  
  log(`Successfully completed`)
  return result
}
```

### Async (Minimal Usage)

Only one async function in the entire codebase:

```typescript
export const getInterop = async (): Promise<Parser> => {
  const module = await import('./interop/modelParser.js')
  return module as Parser
}
```

All other operations are synchronous (including file I/O).

## Testing

### Unit Tests (Mocha + Chai)

```typescript
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { functionToTest } from '../index'

describe('feature area', () => {
  it('should describe expected behavior', () => {
    const result = functionToTest(input, mockParser)
    expect(result).to.deep.equal(expected)
  })
})
```

### Mock Pattern

```typescript
const mockParser: Parser = {
  parse: () => JSON.stringify(exampleModel),
  parserVersion: () => '1.0.0',
}

const mockParserWithException: Parser = {
  parse: () => {
    throw new Error(JSON.stringify({
      ExceptionKind: 'Parsing',
      Errors: [{ Cause: '', Action: '', ValidationID: '' }],
    }))
  },
  parserVersion: () => '1.0.0',
}
```

### Test Locations

- **Unit tests**: `src/__tests__/*.test.ts` (import from source)
- **Integration tests**: `test/integration/*.test.js` (import from `build/`)

## Examples

### Public API Function

```typescript
export const parseDirectories = (directory: string, parser: Parser): DtdlObjectModel | null => {
  log(`Parsing DTDL at: '${directory}'`)
  
  const filepaths = searchForJsonFiles(directory)
  if (filepaths.length < 1) return null
  
  const fullJson = combineJson(filepaths)
  if (fullJson === null) return null
  
  const fullModel = parseDtdl(JSON.stringify(fullJson), parser)
  if (isModelingException(fullModel)) {
    log('Error while parsing directories:')
    log(fullModel)
    return null
  }
  
  return fullModel
}
```

### Type Re-exports

```typescript
// Re-export all types from declaration files
export type * from '../types/DtdlErr.d.ts'
export type * from '../types/DtdlOm.d.ts'
export { getInterop } from './interop.js'
```

### Recursive File Search

```typescript
export const searchForJsonFiles = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    error(`'${directory}' not a valid filepath`)
    return []
  }

  return fs
    .readdirSync(directory)
    .map((file) => path.join(directory, file))
    .reduce((jsonFiles, fullPath) => {
      if (fs.statSync(fullPath).isDirectory()) {
        return jsonFiles.concat(searchForJsonFiles(fullPath)) // recursive
      } else if (path.extname(fullPath) === '.json') {
        return jsonFiles.concat(fullPath)
      }
      return jsonFiles
    }, [] as string[])
}
```

## Things to Avoid

- ❌ **Direct `console.log/error` calls** — always destructure: `const { log, error } = console`
- ❌ **Imports without `.js` extension** — ESM requires `.js` even for TypeScript files
- ❌ **Throwing expected errors** — return errors as values (Result pattern)
- ❌ **Forgetting `type` modifier** — use `import type` for type-only imports
- ❌ **Mixing async/sync file operations** — stay synchronous (no `fs.promises`)
- ❌ **Unit tests importing from `build/`** — import from source in unit tests
- ❌ **Integration tests importing from `src/`** — import from `build/` in integration tests
- ❌ **Classes or OOP patterns** — this codebase is purely functional
