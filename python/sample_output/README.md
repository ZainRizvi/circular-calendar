# Sample Output - Automatic Calendar Rotation

This directory contains sample SVG output demonstrating the automatic calendar rotation feature.

## Generated On
- **Date**: October 26, 2025 (Solar) / Jumada al-Awwal 4, 1447 (Islamic)
- **Script**: `make_cal_svg_only.py`

## Files

### calendar_cover_auto_rotated.svg
This is the most important demonstration file. It shows the complete circular calendar with:
- **Solar months** (outer ring) positioned with January at the top
- **Islamic months** (inner ring) automatically rotated to align with the solar calendar
- **Current Islamic month** (Jumada al-Awwal) positioned at the top
- **Automatic rotation offset**: 175.0 days to align the calendars

### calendar_page_0.svg, calendar_page_1.svg
Individual month pages showing both solar and Islamic months with proper alignment.

## Key Features Demonstrated

1. **Automatic Date Alignment**: The Islamic calendar is automatically positioned based on the current date
2. **Proper Day Rotation**: All day numbers remain vertical/upright regardless of month position
3. **Dynamic Month Positioning**: The current Islamic month (Jumada al-Awwal in this case) appears at the top

## How It Works

When the script runs:
1. It detects the current solar and Islamic dates
2. Calculates which Islamic month should be at the top (based on current month)
3. Calculates the rotation offset to align the calendars (175.0 days in this example)
4. Rotates individual day numbers based on their position in the circle (0°, -30°, -60°, etc.)

This ensures that no matter when you generate the calendar, it will be properly aligned for the current date!

## Regenerating

To regenerate these files for a different date:
```bash
python make_cal_svg_only.py
```

The output will automatically reflect the current date when you run it.
