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

## Islamic Calendar Rotation Logic

The Islamic calendar shifts ~11 days earlier each Gregorian year. To keep the calendar aligned with the current date, three values must be updated:

### 1. Month Order in `calendar_data.py`

The `islamic_year.months` list must start with the **current Islamic month**. Reorder the 12 months so the current month is first, maintaining the sequence.

The `month.number` field (1-12) controls text orientation:
- Months numbered 4-9 render **upside-down** (bottom half of circle)
- Assign numbers so the first 3 months are 1-3, next 6 are 4-9, last 3 are 10-12

### 2. `days_elapsed_islamic` in `make_cal.py`

This value is the number of days from January 1 to the **start of the current Islamic month**.

Example: If Sha'ban 1 falls on January 20, set `days_elapsed_islamic = 19.5`

### 3. `num_months_to_skip` in `make_cal.py`

If the current Islamic month is already first in the `islamic_year.months` list, set this to `0`.

If you don't want to reorder the months list, you can instead skip months: set this to the number of months before the current month in the list.

### 4. `islamic_date_rotation_offset` in `make_cal.py`

Controls rotation of **date numbers** within each Islamic month so they appear upright. Set this to approximately the negative of `days_elapsed_islamic` (e.g., if `days_elapsed_islamic = 19.5`, use `islamic_date_rotation_offset = -19`).

## Example: Updating for a New Date

For February 5, 2026 (Sha'ban 17, 1447 AH):

1. Sha'ban 1 ≈ January 20, 2026 (19 days from Jan 1)
2. Reorder `islamic_year.months` to start with Sha'baan
3. Set `days_elapsed_islamic = 19.5`
4. Set `num_months_to_skip = 0`
5. Set `islamic_date_rotation_offset = -19`

## File Structure

- `make_cal.py` - Main script, alignment parameters, orchestrates PDF generation
- `calendar_data.py` - Month definitions, colors, month order
- `calendar_drawings.py` - SVG rendering for month arcs
- `arc_drawing.py` - Geometric utilities for arcs/angles
- `primitives.py` - Data structures (Point, Arc, etc.)
- `pdfizer.py` - PDF concatenation utility
- `generate_instructions.py` - Generates instructions PDF with embedded cover image

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
