# Circular Calendar - Python Generator

## Running

```bash
cd python
python -m venv .venv
source .venv/bin/activate
pip install --no-deps -r requirements.txt
playwright install chromium
python make_cal.py
```

Note: The `--no-deps` flag prevents svglib from pulling in pycairo, which requires system libraries.

**Output**: `out/calendar_pages_0.7_COMPLETE.pdf`

## Testing

```bash
source .venv/bin/activate
pip install pytest
python -m pytest test_svg_snapshots.py test_islamic_alignment.py -v
```

Or use: `./test.sh`

### SVG Snapshot Tests

Runs `make_cal.py` with a fixed date (2026-02-05) and compares SVG output against `test_snapshots/`. To update after intentional visual changes:

```bash
python test_svg_snapshots.py --update
```

### PDF Snapshot Tests

Also compares rendered PDF pages (as PNG images) against `test_snapshots/pdf_pages/`. This catches issues with SVG-to-PDF conversion that SVG tests alone would miss.

## Auto-Alignment

Islamic calendar alignment is calculated automatically using the `hijridate` library. No manual updates needed.

### CLI Options

```bash
python make_cal.py                      # Auto-align to today
python make_cal.py --date 2026-02-05    # Specific Gregorian date
python make_cal.py --hijri 1447-08-17   # Specific Islamic date
```

### Fallback

If `hijridate` is unavailable, a heuristic uses reference date (Sha'ban 1, 1447 AH = January 20, 2026). Accuracy ±5 days.

## Technical Details

### Coordinate System

- Uses polar coordinates (radius, angle) with origin at circle center
- Angles in **degrees** (not radians)
- 0° at 3 o'clock; -90° at 12 o'clock (top)

### Month Rotation

Months stored in canonical order (Muharram first) in `calendar_data.py`. At runtime, rotated so current Islamic month appears first.

`month.number` (1-12) controls text orientation:
- Months 4-9: render upside-down (bottom half)
- Numbers reassigned during rotation

### Scale Factor

`SCALE_FACTOR` in `primitives.py` (default 0.7):
- Controls canvas dimensions and month arc sizing
- 0.7 uses 4 rows × 1 column per page

### Layout Types

1. **Linear strips** (pages 0-2): Individual month arcs for cutting
2. **Circular cover** (page 3): All months in a ring (preview image)

Both use same `MonthInstance` objects with different transforms.

## Directory Layout

```
python/
├── make_cal.py              # Entry point: CLI, PDF orchestration
├── svg_to_png.py            # SVG→PNG conversion via Playwright/Chromium
├── calendar_data.py         # Month definitions, colors, constants
├── calendar_drawings.py     # SVG rendering for month arcs
├── arc_drawing.py           # Geometric utilities (arcs, angles)
├── primitives.py            # Data structures (Point, Arc, SCALE_FACTOR)
├── islamic_alignment.py     # Auto-alignment calculation via hijridate
├── pdfizer.py               # PDF concatenation utility
├── generate_instructions.py # Builds instructions PDF with cover image
├── test_islamic_alignment.py# Unit tests for alignment
├── test_svg_snapshots.py    # SVG and PDF snapshot tests
├── test_snapshots/          # Reference SVGs for snapshot tests
│   └── pdf_pages/           # Reference PNGs for PDF snapshot tests
├── requirements.txt         # Python dependencies
└── out/                     # Generated output (PDFs, SVGs)
```

## PDF Pipeline

1. `make_cal.py` generates SVG files for each calendar page
2. `svg_to_png.py` (Playwright/headless Chromium) converts SVG → PNG at 150 DPI
3. `reportlab` embeds PNG into PDF at original SVG dimensions
4. `generate_instructions.py` creates instructions page (converts cover PDF → PNG via `pypdfium2`)
5. `pdfizer.py` concatenates instructions + calendar pages into final PDF
6. Intermediate files cleaned up

### Why Playwright for SVG→PDF?

Pure Python libraries like `svglib` don't handle complex SVG features (text on paths, nested transforms) correctly. Playwright uses headless Chromium which renders SVGs perfectly. The PNG intermediate preserves visual fidelity while remaining serverless-compatible.

## Dependencies

**Python** (see `requirements.txt`):
- `svgwrite` - SVG generation
- `reportlab` - PDF creation from PNG
- `pypdfium2` - PDF to PNG conversion
- `pypdf` - PDF concatenation
- `hijridate` - Islamic calendar conversion
- `pillow` - Image handling
- `playwright` - Headless Chromium for accurate SVG rendering

For serverless deployment (AWS Lambda, Vercel), use playwright with a pre-installed Chromium layer.
