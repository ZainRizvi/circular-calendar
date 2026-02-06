# Circular Calendar - AI Assistant Guide

## Critical Technical Constraints

**Coordinate System:**
- Uses polar coordinates (radius, angle) with origin at circle center
- Angles are in **degrees** (not radians)
- 0° is at 3 o'clock position; -90° is at 12 o'clock (top)

**Arc Direction:**
- Pay attention to `start_angle` vs `stop_angle`
- Text rendering may require reversed arcs for upside-down text
- See `app/src/lib/month.ts:106-112` for example

**Text Orientation:**
- Month names render right-side-up or upside-down based on position
- Upside-down range: months 3-9 (bottom half of circle)

**Protected Code:**
- `app/src/lib/month.ts:139-147` - center point calculation is correct; do not modify

## Project Overview

Creates a circular calendar overlaying the Islamic (Hijri) lunar calendar on the Gregorian solar calendar. Designed to help visualize how the two calendar systems relate.

**Visual Structure:**
- **Outer ring**: 12 Gregorian months (January at top/12 o'clock, clockwise)
- **Inner ring**: 12 Islamic months aligned with corresponding solar dates
- **Gap**: The ~11-day difference between lunar (354 days) and solar (365 days) years creates a visible gap in the inner ring

## Repository Structure

```
/python     - Production-ready Python CLI (generates PDF)
/app        - Next.js web app (work in progress)
```

See `PLAN.md` for migration status.

### Python Version (`/python`)
- **Key files**: `make_cal.py`, `calendar_data.py`, `calendar_drawings.py`, `arc_drawing.py`, `primitives.py`
- **Auto-alignment**: Islamic calendar positioning is calculated automatically via `hijridate` library
- See `python/CLAUDE.md` for running, testing, and technical details

### Next.js Version (`/app`)
- **Key files**: `src/lib/month.ts`, `src/lib/svg.ts`, `src/lib/primitives.ts`
- **Status**: Core primitives and SVG generation ported; full calendar logic in progress

## Key Technical Details

**Layout Calculation:**
- Each day occupies an arc: 360° / days_in_year
- Month rotation formula: `date_angle_offset = -1 * (month.number - 1) * (360 / 12)`

**Color Coding:**
- 12-color palette (`colorWheelClassic`) distinguishes months
- Defined in `calendar_data.py` (Python) or `month.ts` (Next.js)

**Date Boxes:**
- Background arc filled with `DATE_FILL_COLOR = "#fbebb3"`
- Text centered with rotation to keep numbers upright

## Common Tasks

### Adding a New Color Scheme
1. Edit `colorWheelClassic` array in `calendar_data.py` or `month.ts`
2. Ensure 12 colors defined (one per month)
3. Use hex color codes

### Debugging Alignment Issues
1. Check the circular cover page PDF
2. Verify `days_elapsed` calculations
3. Each day ≈ 360/365 ≈ 0.986 degrees

## Documentation Guidelines

- **Root `CLAUDE.md`**: Cross-cutting technical concepts, AI constraints
- **`python/CLAUDE.md`**: Python-specific processes, testing, dependencies
- **`README.md`**: User-facing instructions (physical calendar assembly)
