# Intuitive Islamic Circle Calendar

An annual calendar that's easy for little kids (and adults) to understand. Visualizes how the Islamic (Hijri) lunar calendar and Gregorian solar calendar relate to each other.

**Download the latest calendar**: http://zainrizvi.io/calendar

## How It Works

The calendar is a circular design where:
- **Outer ring**: 12 Gregorian months (January at top, proceeding clockwise)
- **Inner ring**: 12 Islamic months aligned with their corresponding solar dates

Since the Islamic year (~354 days) is shorter than the solar year (365 days), there's always a gap in the inner ring. This gap visually demonstrates why Islamic months "drift" through the seasons over the years.

## Repository Structure

- `python/` - Production-ready Python CLI that generates the calendar PDF
- `app/` - Next.js web app (work in progress)

See `PLAN.md` for migration status.

## Generating the Calendar

### Python Version

```bash
cd python
python -m venv .venv
source .venv/bin/activate
pip install --no-deps -r requirements.txt
python make_cal.py
```

Output: `out/calendar_pages_0.7_COMPLETE.pdf`

---

## Assembling the Physical Calendar

### Materials Needed
- Printed PDF pages
- Scissors
- Sticky putty or tape
- Wall space

### Instructions

1. **Print** all pages from the PDF
2. **Cut out** all the month segments
3. **Arrange solar months** in a circle on your wall:
   - Place January at the top (12 o'clock position)
   - Proceed clockwise through December
   - If it's not a leap year, cover Feb 29 with May 1
4. **Place Islamic months** on the inner ring:
   - Align each day with its corresponding solar calendar day
   - Use an Islamic calendar or [moonsighting.com](https://moonsighting.com) to check if each month has 29 or 30 days
   - For 29-day months, cover the 30th with the next month's 1st
5. **Monthly maintenance**: As each Islamic month ends, shift it counter-clockwise to close the gap

### Optional Enhancements

- **Laminate** pages before cutting for durability
- **Create an arrow** to point to the current day
- **Add arrow-shaped tags** to mark important events (birthdays, Islamic holidays, etc.)
