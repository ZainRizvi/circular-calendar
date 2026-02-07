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

## Directory Layout

```
circular-calendar/
├── node/            # Node.js/TypeScript CLI and core library (see node/CLAUDE.md)
├── app/             # Next.js web app deployed to Vercel (see app/CLAUDE.md)
└── README.md        # User-facing instructions
```

## Web App

The Next.js web app (`app/`) provides a landing page with a PDF download button.

**Live site**: Deployed to Vercel
**API endpoint**: `POST /api/generate` - returns calendar PDF

## Key Technical Details

**Layout Calculation:**
- Each day occupies an arc: 360° / days_in_year
- Month rotation formula: `date_angle_offset = -1 * (month.number - 1) * (360 / 12)`

**Color Coding:**
- 12-color palette (`colorWheelClassic`) distinguishes months
- Defined in `calendar-data.ts`

**Date Boxes:**
- Background arc filled with `DATE_FILL_COLOR = "#fbebb3"`
- Text centered with rotation to keep numbers upright

## Common Tasks

### Adding a New Color Scheme
1. Edit `colorWheelClassic` array in `calendar-data.ts`
2. Ensure 12 colors defined (one per month)
3. Use hex color codes

### Debugging Alignment Issues
1. Check the circular cover page PDF
2. Verify `days_elapsed` calculations
3. Each day ≈ 360/365 ≈ 0.986 degrees

## Development Guidelines

**Test-Driven Development (TDD):**
- Write tests before implementing new functionality
- Co-locate test files with source code (e.g., `foo.ts` + `foo.test.ts`)
- Run tests after each change to verify correctness

## Documentation Guidelines

- **Root `CLAUDE.md`**: Cross-cutting technical concepts, AI constraints
- **`node/CLAUDE.md`**: Node.js/TypeScript CLI and core library
- **`app/CLAUDE.md`**: Next.js web app and Vercel deployment
- **`README.md`**: User-facing instructions (physical calendar assembly)
