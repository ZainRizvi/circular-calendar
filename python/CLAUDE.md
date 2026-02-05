# Circular Calendar - Python Generator

## Overview

This script generates a circular calendar that overlays the Islamic (Hijri) lunar calendar on the Gregorian solar calendar. The calendar is split into printable segments plus a circular cover page showing all 12 months arranged in a ring.

## Running

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python make_cal.py
```

Output: `out/calendar_pages_0.7_COMPLETE.pdf` - a single PDF containing:
1. Instructions page with embedded circular calendar preview image
2. Printable calendar strip pages (solar and Islamic months)

The script also generates `v3 Instructions.pdf` as an intermediate file.

## Auto-Alignment to Current Date

The Islamic calendar alignment is calculated automatically based on the current date. The script uses the `hijridate` library to:
1. Determine the current Islamic month
2. Calculate when that month started in the Gregorian calendar
3. Derive all alignment parameters (rotation offset, days elapsed, month order)

No manual updates are needed when regenerating the calendar.

### CLI Options for Testing

```bash
# Auto-align to today (default)
python make_cal.py

# Test with specific Gregorian date
python make_cal.py --date 2026-02-05

# Test with specific Islamic date (Sha'ban 17, 1447)
python make_cal.py --hijri 1447-08-17
```

### Fallback Heuristic

If `hijridate` is unavailable, a fallback heuristic uses a known reference date (Sha'ban 1, 1447 AH = January 20, 2026) and lunar month arithmetic. Accuracy is within ±5 days.

## Islamic Calendar Rotation Logic (Reference)

The `islamic_alignment.py` module handles these calculations automatically:

### Month Order

Months are stored in canonical order (Muharram first) in `calendar_data.py`. At runtime, they're rotated so the current Islamic month appears first.

The `month.number` field (1-12) controls text orientation:
- Months numbered 4-9 render **upside-down** (bottom half of circle)
- Numbers are reassigned during rotation

### Alignment Parameters

These values are calculated automatically:
- `days_elapsed_islamic` - Days from January 1 to start of current Islamic month
- `islamic_date_rotation_offset` - Approximately the negative of days_elapsed

## File Structure

- `make_cal.py` - Main script, CLI interface, orchestrates PDF generation
- `islamic_alignment.py` - Auto-alignment calculation using hijridate library
- `calendar_data.py` - Month definitions, colors, canonical month order
- `calendar_drawings.py` - SVG rendering for month arcs
- `arc_drawing.py` - Geometric utilities for arcs/angles
- `primitives.py` - Data structures (Point, Arc, etc.)
- `pdfizer.py` - PDF concatenation utility
- `generate_instructions.py` - Generates instructions PDF with embedded cover image
- `test_islamic_alignment.py` - Unit tests for alignment module

## Running Tests

```bash
source .venv/bin/activate
pip install pytest
python -m pytest test_islamic_alignment.py -v
```

## PDF Generation Pipeline

1. `make_cal.py` generates SVG files for each calendar page
2. Inkscape converts each SVG to PDF (`inkscape --export-type=pdf`)
3. `generate_instructions.py` creates the instructions page:
   - Converts the circular cover PDF to PNG via Inkscape
   - Embeds the PNG in an HTML template with instructions text
   - Uses WeasyPrint to render HTML to PDF
4. `pdfizer.py` concatenates instructions + calendar pages into final PDF
5. Intermediate files are cleaned up

## Dependencies

- `inkscape` - Must be installed system-wide for SVG→PDF conversion
- `svgwrite` - SVG generation
- `pypdf` - PDF reading/writing/concatenation
- `weasyprint` - HTML→PDF conversion for instructions page
- `hijridate` - Islamic calendar date conversion

## Scale Factor

The `SCALE_FACTOR` in `primitives.py` (default 0.7) controls output size:
- Affects canvas dimensions and month arc sizing
- Lower values = smaller output, more months per page
- Controls page layout: 0.7 uses 4 rows × 1 column per page

## Circular vs Linear Layout

The calendar generates two layouts:
1. **Linear strips** (pages 0-2): Individual month arcs for cutting and assembling
2. **Circular cover** (page 3): All months arranged in a ring, used as preview image

Both layouts use the same `MonthInstance` objects but apply different transformations:
- Linear: months offset vertically on page
- Circular: `circle_form_factor()` rotates each month around center point based on `days_elapsed`
