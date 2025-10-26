#!/usr/bin/env python
# coding: utf-8

# Modified version of make_cal.py that generates SVGs only (no PDF conversion needed)

import math
import os

# custom libs
from primitives import *
from arc_drawing import *
from calendar_data import *
from calendar_drawings import *
from date_calculator import get_current_alignment

# make the out dir
os.makedirs("out", exist_ok=True)

# Get months to draw

scale_factor = SCALE_FACTOR

print(scale_factor)

canvas_width = 11 * scale_factor
width = inchToMilimeter(8 * scale_factor)
outermost_radius = width / ( 2 * 3.14 / 12)
inner_radius = outermost_radius * 9.2 / 10
month_thickness = (outermost_radius - inner_radius)
date_box_height = month_thickness * 0.2

extra_width_offset = 10
width_center = inchToMilimeter(canvas_width) / 2 + extra_width_offset
vertical_offset = 30 * scale_factor

def date_rotation(month: Month) -> int:
    date_angle_offset = -1 * (month.number - 1) * (360 / 12)
    print(f"Offset for {month.name} is {date_angle_offset}")
    return date_angle_offset

solarMonths = []

for index, month in enumerate(solar_year.months):
    name_upside_down = (index >= 3 and index < 9)
    for day in month.num_days:
        solarMonths.append(
            MonthInstance(
                name=month.name,
                num_days=day,
                color=month.color,
                name_upside_down=name_upside_down,
                date_on_top=False, # the outer month
                date_box_height=date_box_height,
                inner_radius=inner_radius,
                outer_radius=outermost_radius,
                date_angle_offset=date_rotation(month),
            )
        )

# Get automatic calendar alignment based on current date
alignment = get_current_alignment()
islamic_date_rotation_offset = alignment.islamic_date_rotation_offset
current_islamic_month_number = alignment.num_months_to_skip  # 1-12

print(f"\n=== Calendar Alignment Info ===")
print(f"Solar Date: {alignment.current_solar_date}")
print(f"Islamic Date: {alignment.current_islamic_date}")
print(f"Islamic rotation offset: {islamic_date_rotation_offset:.1f} days")
print(f"="*35 + "\n")

# Map Islamic month numbers (1-12) to month names
islamic_month_names = {
    1: "Muharram", 2: "Safar", 3: "Rabi al-Awwal", 4: "Rabi ath-Thani",
    5: "Jumada al-Awwal", 6: "Jumada ath-Thani", 7: "Rajab", 8: "Sha'baan",
    9: "Ramadan", 10: "Shawwal", 11: "Dhu al-Qa'dah", 12: "Dhu al-Hijja"
}

# Find the current month by name
current_month_name = islamic_month_names[current_islamic_month_number]

# Reorder Islamic months to start with the current month
reordered_islamic_months = []
for month in islamic_year.months:
    if month.name == current_month_name:
        start_index = islamic_year.months.index(month)
        reordered_islamic_months = islamic_year.months[start_index:] + islamic_year.months[:start_index]
        break

print(f"Reordered Islamic months starting with: {reordered_islamic_months[0].name}")

# Create MonthInstances with position-based rotation
islamicMonths = []
for index, month in enumerate(reordered_islamic_months):
    # Position-based rotation: position 0 = 0°, position 1 = -30°, etc.
    position_based_rotation = -1 * index * (360 / 12)

    # Positions 3-8 are on the bottom half of the circle
    name_upside_down = (index >= 3 and index < 9)

    for day in month.num_days:
        islamicMonths.append(
            MonthInstance(
                name=month.name,
                num_days=day,
                color=month.color,
                name_upside_down=name_upside_down,
                date_on_top=True,
                date_box_height=date_box_height,
                inner_radius=inner_radius - month_thickness,
                outer_radius=outermost_radius - month_thickness,
                date_angle_offset=position_based_rotation + islamic_date_rotation_offset,
            )
        )

month_offset = 4 * scale_factor

origin_first = Point(width_center, outermost_radius + vertical_offset)

days_in_year = 366

def offsetPointBy(point: Point, x_offset: int, y_offset: int):
    return Point(point.x + x_offset, point.y + y_offset)

if scale_factor <= 0.5:
    NUM_ROWS = 5
    NUM_COLUMNS = 2
elif scale_factor < 0.75:
    NUM_ROWS = 4
    NUM_COLUMNS = 1
else:
    NUM_ROWS = 2
    NUM_COLUMNS = 1

month_idx = 0
page_num = 0
svgs = []

# Draw full scale pages
print(f"\nGenerating calendar pages (SVG only)...")
while month_idx < len(solarMonths) - 1:
    dwg = getVerticalPageCanvas()
    origin = origin_first
    for col_num in range(NUM_COLUMNS):
        for row_num in range(NUM_ROWS):
            month_idx = row_num + NUM_ROWS*col_num + NUM_ROWS * NUM_COLUMNS * page_num

            if month_idx < len(solarMonths):
                drawMonthParts(dwg, getMonth(solarMonths[month_idx], days_in_year, origin))
                origin = offsetPointBy(origin, 0, month_offset)

            if month_idx < len(islamicMonths):
                drawMonthParts(dwg, getMonth(islamicMonths[month_idx], days_in_year, origin))
                origin = offsetPointBy(origin, 0, (month_thickness + month_offset)*2.3)

        # move to next column
        origin = offsetPointBy(origin_first, width * 1.05, 0)

    svg_file = f"out/svg_{scale_factor}_{page_num}.svg"

    dwg.saveas(svg_file, pretty=True)
    print(f"Generated: {svg_file}")
    svgs.append(svg_file)

    page_num += 1

# Draw summary page (circular view)
def circle_form_factor(g, month, days_elapsed, days_in_year, origin):
    g.translate(75, 50)
    g.scale(0.3)
    rot = 360.0 * (days_elapsed + month.num_days / 2)/days_in_year
    g.rotate(rot, center=origin)
    g.translate(0, origin_first.y - origin.y)

month_idx = 0
page_num = 0
days_elapsed = 0 - solarMonths[0].num_days/2

# For the circular view, use the same reordered months
days_elapsed_islamic = alignment.days_elapsed_islamic

print(f"\nPositioning Islamic calendar in circular view:")
print(f"  Days elapsed: {days_elapsed_islamic:.1f}")
print(f"  Current month ({reordered_islamic_months[0].name}) centered at day {days_elapsed_islamic + 15:.0f}")

dwg = getVerticalPageCanvas()
origin_first = Point(width_center, outermost_radius + vertical_offset)

while month_idx < len(solarMonths) - 1:
    origin = Point(origin_first.x, origin_first.y)
    for col_num in range(NUM_COLUMNS):
        for row_num in range(NUM_ROWS):
            month_idx = row_num + NUM_ROWS*col_num + NUM_ROWS * NUM_COLUMNS * page_num

            if month_idx < len(solarMonths):
                month = solarMonths[month_idx]
                g = groupWithMonthParts(getMonth(month, days_in_year, origin))
                circle_form_factor(g, month, days_elapsed, days_in_year, origin)
                days_elapsed += month.num_days
                dwg.add(g)

            if month_idx < len(islamicMonths):
                month = islamicMonths[month_idx]
                g = groupWithMonthParts(getMonth(month, days_in_year, origin))
                circle_form_factor(g, month, days_elapsed_islamic, days_in_year, origin)
                days_elapsed_islamic += month.num_days
                dwg.add(g)

    page_num += 1

print("\nSaving circular view SVG...")
svg_file = f"out/svg_{scale_factor}_{page_num}_cover.svg"

dwg.saveas(svg_file, pretty=True)
print(f"Generated: {svg_file}")
svgs.insert(0, svg_file)

print(f"\n{'='*60}")
print(f"✓ Successfully generated {len(svgs)} SVG files!")
print(f"{'='*60}")
print(f"\nGenerated files:")
for svg in svgs:
    print(f"  - {svg}")
print(f"\nThese SVGs demonstrate the automatic calendar rotation.")
print(f"Current date alignment: {alignment.current_solar_date} (Solar) / {alignment.current_islamic_date} (Islamic)")
