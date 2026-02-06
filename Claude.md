# Circular Calendar Project - Claude Documentation

## Project Overview

This repository creates an **Intuitive Islamic Circle Calendar** designed for children (and adults) to understand how the solar Gregorian calendar and Islamic (Hijri) calendar work and how they relate to each other.

### Visual Structure

The calendar is a **circular design** where:

- **Outer Circle (Solar Calendar)**: Contains all 12 months of the Gregorian calendar arranged in a circle
  - January is positioned at the top (12 o'clock position)
  - Months proceed clockwise around the circle
  - Each month shows all its days as individual segments

- **Inner Circle (Islamic Calendar)**: Contains the 12 months of the Islamic calendar
  - Days of each Islamic month are aligned with their corresponding solar calendar days on the outer circle
  - Since the Islamic year has ~354 days (11 days fewer than the solar year), there will always be a **gap** in the inner circle
  - As the year progresses, Islamic months shift counterclockwise to maintain alignment with the solar dates

### Key Educational Concept

The gap in the inner circle visually demonstrates that the Islamic calendar year is shorter than the solar year, which is why Islamic months "drift" through the seasons over the years.

## Repository Structure

The repository is split into two main implementations:

### 1. Python Version (`/python` directory)
- **Status**: Fully functional, production-ready
- **Purpose**: Original implementation as a console application
- **Output**: Generates PDF files with the circular calendar
- **Key Files**:
  - `make_cal.py` - Main entry point and orchestration
  - `calendar_data.py` - Calendar data structures and month definitions
  - `calendar_drawings.py` - SVG drawing logic for calendar elements
  - `arc_drawing.py` - Low-level arc and geometric drawing functions
  - `primitives.py` - Basic geometric primitives (Point, Arc, etc.)
  - `pdfizer.py` - PDF generation and concatenation utilities

### 2. Next.js Web App (`/app` directory)
- **Status**: Work in progress
- **Purpose**: Modern web-based implementation
- **Output**: Browser-based calendar generator with PDF export
- **Key Files**:
  - `src/lib/month.ts` - Month rendering logic (ported from Python)
  - `src/lib/svg.ts` - SVG generation utilities
  - `src/lib/primitives.ts` - Basic geometric primitives

**See `PLAN.md` for detailed migration status and next steps.**

## How the Calendar Works

### Layout Calculation

1. **Circular Arrangement**: Months are positioned around a circle based on the number of days they contain
   - Each day occupies an arc proportional to its share of the year (360° / days_in_year)
   - For a leap year: 366 days; for non-leap: 365 days

2. **Dual Rings**:
   - Outer ring: Solar (Gregorian) months
   - Inner ring: Islamic (Hijri) months

3. **Alignment**: Islamic month days are aligned with their corresponding solar dates based on the current year

### Key Technical Details

#### Color Coding
Both calendars use a consistent 12-color palette (`colorWheelClassic`) to help visually distinguish months:
- January/Muharram: Light blue (`#aebbff`)
- February/Safar: Cyan (`#9ce3ff`)
- March/Rabi' al-awwal: Mint (`#a1fec5`)
- And so on through the spectrum...

#### Rotation and Positioning
- **Date Angle Offset**: Each month's number determines its base rotation
  - Formula: `date_angle_offset = -1 * (month.number - 1) * (360 / 12)`
  - This ensures months are evenly distributed around the circle

- **Text Orientation**: Month names are rendered right-side-up or upside-down based on their position
  - Upside-down range: months 3-9 (roughly bottom half of circle)
  - This ensures text is always readable when viewing the calendar

#### Islamic Calendar Alignment

**IMPORTANT LIMITATION**: The Islamic calendar alignment currently requires **manual calculation and hard-coding** each year.

In `python/make_cal.py` (lines 188-194):
```python
# For starting with Jamadi ul-Awwal 2024
days_elapsed_islamic = 6.5 # Will need to be tweaked every year to fine tune the calendar alignment
num_months_to_skip = 10 # up till the current calendar month
for i in range(num_months_to_skip):
  days_elapsed_islamic += islamicMonths[i].num_days
```

This offset controls:
1. Where the gap appears in the inner circle
2. Which Islamic month aligns with January 1st
3. Fine-tuning the day-to-day alignment

**Ideally**, the gap should appear just before the current Islamic month, but this currently requires manual adjustment of:
- `days_elapsed_islamic` - Fine-tuning offset
- `num_months_to_skip` - Which Islamic month to start with

## Physical Calendar Instructions

Once you generate a PDF:

1. **Print** all pages
2. **Cut out** all the month segments
3. **Assemble** on a wall:
   - Arrange solar months in a circle (January at top)
   - Place Islamic months on inner ring, aligning days with solar dates
   - Use sticky putty for easy repositioning
4. **Adjust for month length**:
   - If non-leap year: cover Feb 29 with May 1
   - For 29-day Islamic months: cover day 30 with next month's day 1
5. **Monthly maintenance**: Shift Islamic months counterclockwise as each month ends to close the gap

### Optional Enhancements
- Laminate pages for durability
- Create an arrow to point to current day
- Add arrow-shaped tags for important events (birthdays, Islamic holidays, etc.)

## Development Considerations

### Updating Documentation

When making changes to development processes, testing, or workflows, update the appropriate `CLAUDE.md` file:
- **Root `CLAUDE.md`**: Project overview, architecture, cross-cutting concerns
- **`python/CLAUDE.md`**: Python-specific processes, testing, dependencies

### For AI Assistants Working on This Code

1. **Coordinate Systems**: The code uses polar coordinates (radius, angle) extensively
   - Origin point is typically the center of the circle
   - Angles are in degrees (not radians)
   - 0° is typically at 3 o'clock position; -90° is at 12 o'clock (top)

2. **Arc Direction**: Pay attention to start_angle vs stop_angle
   - Text rendering may require reversed arcs for upside-down text
   - See `month.ts:106-112` for example

3. **Scaling**: The Python version uses a `SCALE_FACTOR` for different print sizes
   - Controls page layout (number of rows/columns)
   - Affects font sizes and spacing

4. **Date Boxes**: Each day is rendered as:
   - Background arc (filled with `DATE_FILL_COLOR = "#fbebb3"`)
   - Centered text with rotation to keep numbers upright
   - Size proportional to available space

5. **Known Bug-Free Code**: See `month.ts:139-147` - this center point calculation is correct and should not be modified

### Migration Status (Python → Next.js)

See `PLAN.md` for details. Current status:
- ✅ Core primitives ported
- ✅ SVG generation ported
- ✅ PDF generation (browser-based)
- 🚧 Full calendar generation logic (in progress)
- ⏳ Frontend UI (not started)
- ⏳ Deployment (not started)

## Future Improvements

1. **Automatic Islamic Calendar Alignment**:
   - Calculate alignment programmatically based on current date
   - Use an Islamic calendar API or astronomical calculations
   - Eliminate manual tweaking requirement

2. **Interactive Web Interface**:
   - Allow users to select year and current Islamic month
   - Auto-calculate the optimal gap position
   - Live preview before generating PDF

3. **Customization Options**:
   - Custom color schemes
   - Different calendar systems (other lunar calendars)
   - Adjustable sizes and layouts

## External Resources

- Latest calendar PDF: http://zainrizvi.io/calendar
- Instructions: See `v3 Instructions.docx` in repository root

## Technical Stack

### Python Version
- SVG Generation: `svgwrite` library
- PDF Conversion: `inkscape` (command-line)
- PDF Merging: `PyPDF2` (via `pdfizer.py`)

### Next.js Version (Planned)
- Framework: Next.js with TypeScript
- SVG: Native SVG generation (no external library needed)
- PDF: `pdf-lib` (browser-based)
- Deployment: Vercel

## Common Tasks

### Updating for a New Year (Python Version)

1. Open `python/calendar_data.py`
2. Update February's `num_days` (29 for leap year, 28 otherwise)
3. Open `python/make_cal.py`
4. Update `islamic_date_rotation_offset` (line 91)
5. Update `days_elapsed_islamic` and `num_months_to_skip` (lines 189-194)
6. Run the script to generate new PDFs

### Adding a New Month Color Scheme

1. Edit `colorWheelClassic` array in `calendar_data.py` (Python) or `month.ts` (Next.js)
2. Ensure 12 colors are defined (one per month)
3. Use hex color codes for consistency

### Debugging Alignment Issues

1. Check the "cover page" PDF (shows full assembled circle)
2. Verify `days_elapsed` and `days_elapsed_islamic` calculations
3. Adjust rotation offsets incrementally (try ±1 day at a time)
4. Remember: Each day is approximately 360/365 ≈ 0.986 degrees

## Questions or Issues?

For questions about this codebase or suggestions for improvements, please open an issue in the GitHub repository.
