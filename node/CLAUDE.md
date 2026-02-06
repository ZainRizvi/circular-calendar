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

Or use: `./test.sh` (runs typecheck + tests)

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `tsx src/make-cal.ts` | Generate calendar PDF |
| `npm test` | `vitest run` | Run tests once |
| `npm run test:watch` | `vitest` | Run tests in watch mode |
| `npm run test:coverage` | `vitest run --coverage` | Run tests with coverage |
| `npm run typecheck` | `tsc --noEmit` | TypeScript type checking |

### Snapshot Tests

The `snapshot-comparison.test.ts` compares Node.js SVG output against Python snapshots in `test_snapshots/`. Tests verify:
- Same month names and structure
- Matching coordinate values
- Correct Islamic calendar alignment

## CLI Options

```bash
npm start                             # Auto-align to today
npm start -- --date 2026-02-05        # Specific Gregorian date
npm start -- --hijri 1447-08-17       # Specific Islamic date
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

`SCALE_FACTOR` in `primitives.ts` (default 0.7):
- Controls canvas dimensions and month arc sizing
- 0.7 uses 4 rows × 1 column per page

## Directory Layout

```
node/
├── src/
│   ├── make-cal.ts              # Entry point: CLI, PDF orchestration
│   ├── make-cal.test.ts
│   ├── svg-to-png.ts            # SVG→PNG conversion via resvg-js
│   ├── svg-to-png.test.ts
│   ├── calendar-data.ts         # Month definitions, colors, constants
│   ├── calendar-data.test.ts
│   ├── calendar-drawings.ts     # SVG rendering for month arcs
│   ├── calendar-drawings.test.ts
│   ├── arc-drawing.ts           # Geometric utilities (arcs, angles)
│   ├── arc-drawing.test.ts
│   ├── primitives.ts            # Data structures (Point, Arc, SCALE_FACTOR)
│   ├── primitives.test.ts
│   ├── islamic-alignment.ts     # Auto-alignment calculation (heuristic)
│   ├── islamic-alignment.test.ts
│   ├── pdfizer.ts               # PDF concatenation utility
│   ├── pdfizer.test.ts
│   ├── generate-instructions.ts # Builds instructions PDF with cover image
│   ├── generate-instructions.test.ts
│   └── snapshot-comparison.test.ts # Compares output with Python snapshots
├── out/                         # Generated output (PDFs, SVGs)
├── test_snapshots/              # Reference SVGs from Python (for comparison)
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── test.sh
└── CLAUDE.md
```

## PDF Pipeline

1. `make-cal.ts` generates SVG strings for each calendar page
2. `svg-to-png.ts` (resvg-js, Rust-based WASM) converts SVG → PNG at 150 DPI
3. `pdf-lib` embeds PNG into PDF at original SVG dimensions
4. `generate-instructions.ts` creates instructions page with embedded cover PDF
5. `pdfizer.ts` concatenates instructions + calendar pages into final PDF
6. Intermediate files cleaned up

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
