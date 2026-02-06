# Circular Calendar - Python Generator

## Running

```bash
cd python
python -m venv .venv
source .venv/bin/activate
pip install --no-deps -r requirements.txt
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
├── calendar_data.py         # Month definitions, colors, constants
├── calendar_drawings.py     # SVG rendering for month arcs
├── arc_drawing.py           # Geometric utilities (arcs, angles)
├── primitives.py            # Data structures (Point, Arc, SCALE_FACTOR)
├── islamic_alignment.py     # Auto-alignment calculation via hijridate
├── pdfizer.py               # PDF concatenation utility
├── generate_instructions.py # Builds instructions PDF with cover image
├── test_islamic_alignment.py# Unit tests for alignment
├── test_svg_snapshots.py    # SVG snapshot tests
├── test_snapshots/          # Reference SVGs for snapshot tests
├── requirements.txt         # Python dependencies
└── out/                     # Generated output (PDFs, SVGs)
```

## PDF Pipeline

1. `make_cal.py` generates SVG files
2. `svglib` + `reportlab` convert SVG → PDF
3. `generate_instructions.py` creates instructions page (converts cover PDF → PNG via `pypdfium2`)
4. `pdfizer.py` concatenates into final PDF
5. Intermediate files cleaned up

## Dependencies

All pure Python (serverless-compatible):
- `svgwrite` - SVG generation
- `svglib` + `reportlab` - SVG to PDF
- `pypdfium2` - PDF to PNG
- `pypdf` - PDF concatenation
- `hijridate` - Islamic calendar conversion
- `pillow` - Image handling
