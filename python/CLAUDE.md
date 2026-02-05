# Circular Calendar - Python Generator

## Overview

This script generates a circular calendar that overlays the Islamic (Hijri) lunar calendar on the Gregorian solar calendar. The calendar is split into printable segments plus a circular cover page showing all 12 months arranged in a ring.

## Running

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pypdf
python make_cal.py
```

Output goes to `out/` directory.

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

- `make_cal.py` - Main script, alignment parameters
- `calendar_data.py` - Month definitions, colors, month order
- `calendar_drawings.py` - SVG rendering for month arcs
- `arc_drawing.py` - Geometric utilities for arcs/angles
- `primitives.py` - Data structures (Point, Arc, etc.)
- `pdfizer.py` - PDF concatenation utility
