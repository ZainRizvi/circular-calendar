# Circular Calendar - Node.js/TypeScript Generator

## Running

```bash
cd node
npm install
npm start
```

**Output**: `out/calendar_pages_0.7_COMPLETE.pdf`

## Testing

```bash
npm test
```

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `tsx src/cli/index.ts` | Generate calendar PDF |
| `npm test` | `vitest run` | Run tests once |
| `npm run test:watch` | `vitest` | Run tests in watch mode |
| `npm run test:coverage` | `vitest run --coverage` | Run tests with coverage |
| `npm run typecheck` | `tsc --noEmit` | TypeScript type checking |
| `npm run snapshots:generate` | `tsx scripts/generate-snapshots.ts` | Regenerate test snapshots |

### Snapshot Tests

The `snapshot.test.ts` verifies SVG and PNG output matches stored snapshots for three fixed dates (2024-10-06, 2026-02-06, 2027-06-06).

**Regenerating snapshots:** Only run `npm run snapshots:generate` when you intentionally change the visual output for one or more of these dates. Do not regenerate snapshots to make failing tests pass without understanding why they failed.

## CLI Options

```bash
npm start                             # Auto-align to today
npm start -- --date 2026-02-05        # Specific Gregorian date
npm start -- --hijri 1447-08-17       # Specific Islamic date
```

## Architecture

The codebase follows a modular library architecture with dependency injection for rendering.

### Directory Layout

```
node/src/
├── lib/                           # Core library (browser-compatible)
│   ├── index.ts                   # Barrel export
│   ├── types.ts                   # SvgRenderer, SvgRenderResult interfaces
│   ├── config.ts                  # LayoutConfig + computeLayout()
│   ├── primitives.ts              # Point, Arc, DimensionalArc
│   ├── calendar-data.ts           # Month, Year interfaces + data
│   ├── geometry.ts                # Geometric utilities
│   ├── month-renderer.ts          # Month SVG rendering
│   ├── islamic-alignment.ts       # Date alignment calculations
│   ├── calendar-builder.ts        # SVG generation functions
│   └── pdf-generator.ts           # PDF generation with injected renderer
│
├── renderers/                     # Swappable rendering strategies
│   ├── index.ts                   # Barrel export
│   └── resvg-renderer.ts          # Node.js: @resvg/resvg-js implementation
│
├── cli/                           # CLI entry point (Node.js only)
│   ├── index.ts                   # Main entry
│   ├── args.ts                    # CLI argument parsing
│   └── pipeline.ts                # Orchestrates PDF generation + file I/O
│
├── index.ts                       # Root barrel: re-exports lib/ and renderers/
├── make-cal.ts                    # Legacy entry point (kept for compatibility)
├── pdfizer.ts                     # PDF utilities with file I/O
├── generate-instructions.ts       # Instructions PDF generation
└── svg-to-png.ts                  # Legacy SVG renderer (kept for compatibility)
```

### Key Design: Dependency Injection

The library uses dependency injection for rendering, allowing different backends:

```typescript
// Node.js usage
import { createPdfGenerator } from '@/node/src/lib';
import { createResvgRenderer } from '@/node/src/renderers';

const renderer = createResvgRenderer({ dpi: 150 });
const pdfGenerator = createPdfGenerator({ renderer });
const pdfBytes = await pdfGenerator.svgToPdf(svgContent);
```

### SvgRenderer Interface

```typescript
interface SvgRenderResult {
  pngBuffer: Uint8Array;
  widthPts: number;
  heightPts: number;
}

interface SvgRenderer {
  render(svgContent: string): Promise<SvgRenderResult>;
}
```

## Technical Details

### Coordinate System

- Uses polar coordinates (radius, angle) with origin at circle center
- Angles in **degrees** (not radians)
- 0° at 3 o'clock; -90° at 12 o'clock (top)

### Month Rotation

Months stored in canonical order (Muharram first) in `calendar-data.ts`. At runtime, rotated so current Islamic month appears first.

`month.number` (1-12) controls text orientation:
- Months 4-9: render upside-down (bottom half of circle)
- Numbers reassigned during rotation

### Scale Factor

`LayoutConfig.scaleFactor` (default 0.7):
- Controls canvas dimensions and month arc sizing
- 0.7 uses 4 rows × 1 column per page

## PDF Pipeline

1. `calendar-builder.ts` generates SVG strings for each calendar page
2. `renderers/resvg-renderer.ts` converts SVG → PNG at 150 DPI
3. `lib/pdf-generator.ts` uses pdf-lib to embed PNG into PDF
4. `generate-instructions.ts` creates instructions page with cover image
5. `cli/pipeline.ts` orchestrates everything and handles file I/O

### Why resvg-js for SVG→PNG?

Pure JavaScript/WASM solution (~50MB) that handles complex SVG features (text on paths, transforms) without requiring a browser. Serverless-compatible with Vercel.

## Dependencies

**Runtime** (see `package.json`):
- `@resvg/resvg-js` - SVG → PNG rendering (Rust/WASM)
- `pdf-lib` - PDF creation and concatenation
- `qrcode` - QR code generation
- `commander` - CLI argument parsing

**Dev**:
- `typescript` - TypeScript compiler
- `tsx` - TypeScript runner
- `vitest` - Test framework
- `pngjs` - PNG parsing for snapshot tests
