# Circular Calendar Project

## Purpose

This project creates an intuitive circular calendar designed to help children (and adults) understand both the Gregorian (solar) and Islamic (lunar) calendars and how they relate to each other. The calendar uses a dual-ring design where:

- **Outer ring**: Displays the 12 Gregorian months with January always at the top
- **Inner ring**: Displays the 12 Islamic months, aligned with their corresponding Gregorian dates

The visual representation makes it easy to see:
- How dates in both calendar systems correspond
- How the Islamic calendar "shifts" ~11 days earlier each solar year
- The relative position of Islamic months throughout the Gregorian year

## How It Works

### The Dual-Calendar System

The calendar consists of two concentric circles:

1. **Gregorian Calendar (Outer Circle)**
   - 365-366 days arranged in a circle
   - January is always positioned at the top (12 o'clock position)
   - Each month is color-coded and divided into individual date boxes
   - Accounts for leap years (February has 29 days)

2. **Islamic Calendar (Inner Circle)**
   - 354-355 days (approximately 11 days shorter than the solar year)
   - Positioned inside the Gregorian calendar with dates aligned to their Gregorian equivalents
   - Creates a visible gap due to having fewer days
   - Rotates approximately 11 days earlier each year

### The Gap and Rotation

Because the Islamic year has ~11 fewer days than the solar year:
- There's always a visible gap in the inner (Islamic) circle
- After one year, the Islamic months shift counter-clockwise
- The gap should ideally be positioned just before the current Islamic month when printing
- Each Islamic month can have either 29 or 30 days (determined by moon sighting)

### Physical Assembly

Once the PDF is generated and printed:

1. Print and cut out all the month segments
2. Arrange Gregorian months in a circle on a wall (with January at top)
3. Place Islamic months on the inner ring, aligning dates with their Gregorian equivalents
4. Cover the 29th of February with May 1st if it's not a leap year
5. Cover the 30th day of Islamic months that have only 29 days with the 1st of the next month
6. As each Islamic month ends, shift it counter-clockwise to cover the gap

## Project Structure

The repository contains two implementations:

### Python Version (`/python`)
**Status**: Fully functional

The original implementation that generates PDF calendars via a command-line interface.

**Key Files**:
- `make_cal.py` - Main script that generates the calendar PDF
- `calendar_data.py` - Month definitions and color schemes for both calendars
- `calendar_drawings.py` - Drawing logic for rendering calendar months
- `arc_drawing.py` - Low-level SVG arc drawing primitives
- `primitives.py` - Basic geometric primitives (Point, Arc, etc.)
- `pdfizer.py` - PDF generation utilities

**Dependencies**:
- `svgwrite` - SVG generation
- Inkscape - SVG to PDF conversion
- PyPDF2 - PDF concatenation

**Running**:
```bash
cd python
python make_cal.py
```

Output will be in `python/out/` directory.

### Next.js Web App (`/app`)
**Status**: Work in progress (see PLAN.md for migration status)

A web-based version that will allow users to generate calendars through a browser interface.

**Key Files**:
- `src/lib/month.ts` - Month rendering logic (ported from Python)
- `src/lib/svg.ts` - SVG generation utilities
- `src/lib/primitives.ts` - Basic geometric types
- `src/app/page.tsx` - Main application page
- `src/components/SvgViewbox.tsx` - SVG display component

**Running**:
```bash
cd app
npm install
npm run dev
```

## Manual Configuration Required

### Problem

Currently, when generating a new calendar for a different year or to align with the current Islamic month, manual code changes are required in the Python version.

### Required Changes

In `python/make_cal.py`, you need to adjust:

1. **Islamic date rotation offset** (line 91):
   ```python
   islamic_date_rotation_offset = -15  # offset by an extra 15 days
   ```
   This controls the overall rotation of the Islamic calendar dates.

2. **Days elapsed for Islamic calendar** (line 189):
   ```python
   days_elapsed_islamic = 6.5  # Will need to be tweaked every year
   ```
   Fine-tunes the alignment of the circular display.

3. **Number of months to skip** (line 190):
   ```python
   num_months_to_skip = 10  # up till the current calendar month
   ```
   Controls which Islamic month appears at the top.

4. **Islamic month ordering** in `python/calendar_data.py` (lines 196-209):
   The months array must be reordered so the desired starting month is first. Months 4-9 in the array will be rendered upside down.

### Why This Is Needed

- The Islamic calendar is lunar-based and shifts ~11 days earlier each solar year
- Moon sighting determines whether each month has 29 or 30 days (not perfectly predictable)
- To create an aesthetically pleasing calendar, we want:
  - The gap to appear just before the current Islamic month
  - The current Islamic month to be positioned at or near the top
  - Proper alignment between Islamic and Gregorian dates for the current year

### Future Improvement

The Next.js version aims to make this configuration dynamic through a user interface, eliminating the need for code changes.

## Technical Details

### Calendar Generation Process

1. **Define Calendar Data**
   - Set up Gregorian months (12 months, 365-366 days)
   - Set up Islamic months (12 months, 354-355 days)
   - Apply color schemes

2. **Calculate Geometry**
   - Determine circle radii based on page size
   - Calculate angular width of each month (proportional to days)
   - Position months around the circle

3. **Render Each Month**
   - Draw month background arc with color
   - Add month name along the arc
   - Create individual date boxes
   - Add date numbers

4. **Generate Output**
   - Create SVG for each page
   - Convert SVG to PDF using Inkscape
   - Concatenate all pages with instructions

5. **Create Summary Page**
   - Shows all months assembled in circular form
   - Provides a preview of the complete calendar

### Key Constants

- **Outer radius**: Calculated from page width to fit 1/12th of circle
- **Inner radius**: 92% of outer radius
- **Month thickness**: Difference between outer and inner radius
- **Date box height**: 20% of month thickness
- **Days in year**: 366 (accounting for leap year)

### Color Schemes

Multiple color palettes are defined:
- `color_wheel_classic` - Default Gregorian colors
- `color_harmony` - Alternative Gregorian palette
- `color_wheel_classic_islam` - Islamic month colors

Colors are defined in `calendar_data.py` (Python) and `month.ts` (TypeScript).

## Development

### Python Development

To modify the Python version:
1. Edit source files in `/python`
2. Test by running `python make_cal.py`
3. Check output in `python/out/`

### Next.js Development

To work on the web app:
1. Navigate to `/app`
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Visit `http://localhost:3000`

See `PLAN.md` for the migration roadmap.

### Testing

Python tests:
```bash
cd python
./test.sh
```

Next.js tests:
```bash
cd app
npm test
```

## Output

The generated PDF includes:
1. **Cover page** - Shows the complete assembled calendar
2. **Month pages** - Individual month segments to cut out
3. **Instructions** - Assembly instructions (from "v3 Instructions.docx")

## Tips

- **Laminate pages** before cutting for durability
- **Use sticky putty** to attach months to the wall
- **Cut out an arrow** to point to the current day
- **Create event markers** for birthdays, Islamic holidays, etc.
- **Consult moonsighting.com** to determine if Islamic months have 29 or 30 days

## Resources

Latest calendar PDF: http://zainrizvi.io/calendar

## Future Enhancements

From the migration plan:
- [ ] Web-based calendar generator (no installation required)
- [ ] Dynamic Islamic calendar alignment (no code changes needed)
- [ ] Multiple calendar system support
- [ ] Custom color scheme editor
- [ ] Automatic moon phase calculations
- [ ] Event marker templates
- [ ] Print optimization options
