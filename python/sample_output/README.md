# Sample Output - Automatic Calendar Rotation

This directory contains sample SVG output demonstrating the automatic calendar rotation feature.

## Generated On
- **Date**: October 26, 2025 (Solar) / Jumada al-Awwal 4, 1447 (Islamic)
- **Script**: `make_cal_svg_only.py`

## Files

### calendar_cover_auto_rotated.svg (and .png)
This is the most important demonstration file. It shows the complete circular calendar with:
- **Solar months** (outer ring) positioned with January at the top
- **Islamic months** (inner ring) automatically rotated to align with the solar calendar
- **Current Islamic month** (Jumada al-Awwal) positioned on the LEFT side, aligned with October
- **Automatic positioning**: days_elapsed = 284 to center Jumada al-Awwal at day 299 (Oct 26)
- **Gap in Islamic calendar**: Correctly positioned just before Jumada al-Awwal

### calendar_page_0.svg, calendar_page_1.svg
Individual month pages showing both solar and Islamic months with proper alignment.

## Key Features Demonstrated

1. **Automatic Date Alignment**: The Islamic calendar is automatically positioned based on the current date
2. **Proper Day Rotation**: All day numbers remain vertical/upright regardless of month position
3. **Visual Alignment**: Jumada al-Awwal (inner ring) aligns with October (outer ring) on the left side of the circle

## How It Works

When the script runs:
1. It detects the current solar and Islamic dates (Oct 26, 2025 = Jumada al-Awwal 4, 1447)
2. Calculates which Islamic month should be first in the list (Jumada al-Awwal)
3. Calculates the circle positioning: `days_elapsed_islamic = day_of_year - 15 = 284`
   - This centers Jumada al-Awwal at day 299 (where Oct 26 is)
   - Center position = 284 + 15 = 299 ✓
4. Rotates individual day numbers: `offset = day_of_year - current_islamic_day = 295`
   - This ensures day 4 of the month appears at position 299

The key insight: The `circle_form_factor` function rotates each month based on its CENTER position,
so we need `days_elapsed = day_of_year - 15` to center the current Islamic month at the current solar day.

This ensures that no matter when you generate the calendar, it will be properly aligned for the current date!

## Regenerating

To regenerate these files for a different date:
```bash
python make_cal_svg_only.py
```

The output will automatically reflect the current date when you run it.
