# Library Tests

This directory contains library code and corresponding unit tests for the circular calendar application.

## Test Files

- `primitives.test.ts` - Tests for the primitives.ts module
- `svg.test.ts` - Tests for the svg.ts module
- `month.test.ts` - Tests for the month.ts module

## Testing Approach

### SVG.js Dependencies

The library uses SVG.js for drawing SVG elements, which requires a DOM environment. In tests:

- We use real implementations when possible (e.g., month.test.ts)
- We mock SVG.js when necessary (primitives.test.ts and svg.test.ts)
- We skip tests for methods that call SVG() directly, since they require a DOM environment

### Test Coverage

The tests cover all exported:
- Functions
- Classes
- Constants
- Enums

TypeScript interfaces and type aliases don't need direct testing since they're just type definitions.

## Running Tests

Run the tests with:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- -t <filename>
```

For example:

```bash
npm test -- -t month
```