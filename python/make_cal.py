#!/usr/bin/env python
# coding: utf-8

# In[1]:


def is_notebook() -> bool:
    try:
        shell = get_ipython().__class__.__name__
        if shell == 'ZMQInteractiveShell':
            return True   # Jupyter notebook or qtconsole
        elif shell == 'TerminalInteractiveShell':
            return False  # Terminal running IPython
        else:
            return False  # Other type (?)
    except NameError:
        return False      # Probably standard Python interpreter

if is_notebook():
    get_ipython().run_line_magic('load_ext', 'autoreload')
    get_ipython().run_line_magic('autoreload', '2')

import argparse
import math
import os
from datetime import date
from IPython.display import SVG

# custom libs
from primitives import *
from arc_drawing import *
from calendar_data import *
from calendar_drawings import *
import islamic_alignment
import pdfizer


def svg_to_pdf(svg_path: str, pdf_path: str):
    """Convert SVG file to PDF using Inkscape."""
    import subprocess
    subprocess.run(["inkscape", svg_path, f"--export-filename={pdf_path}", "--export-type=pdf"], check=True)


def parse_args():
    """Parse command-line arguments for date specification."""
    parser = argparse.ArgumentParser(
        description="Generate circular calendar with Islamic/Gregorian overlay"
    )
    parser.add_argument(
        "--date",
        type=str,
        help="Gregorian date to align to (YYYY-MM-DD format). Defaults to today.",
    )
    parser.add_argument(
        "--hijri",
        type=str,
        help="Hijri date to align to (YYYY-MM-DD format, e.g., 1447-08-17 for Sha'ban 17, 1447).",
    )
    return parser.parse_args() if not is_notebook() else argparse.Namespace(date=None, hijri=None)


def get_alignment_from_args(args) -> islamic_alignment.AlignmentParams:
    """Get alignment parameters based on CLI arguments."""
    if args.hijri:
        parts = args.hijri.split("-")
        if len(parts) != 3:
            raise ValueError("Hijri date must be in YYYY-MM-DD format")
        hijri_year, hijri_month, hijri_day = int(parts[0]), int(parts[1]), int(parts[2])
        return islamic_alignment.get_alignment_params(
            hijri_year=hijri_year, hijri_month=hijri_month, hijri_day=hijri_day
        )
    elif args.date:
        parts = args.date.split("-")
        if len(parts) != 3:
            raise ValueError("Date must be in YYYY-MM-DD format")
        gregorian_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
        return islamic_alignment.get_alignment_params(gregorian_date=gregorian_date)
    else:
        return islamic_alignment.get_alignment_params()


# Parse arguments and calculate alignment
args = parse_args()
alignment = get_alignment_from_args(args)
islamic_alignment.print_alignment_info(alignment)

# Rotate Islamic months to start with current month
islamic_year = Year(
    months=islamic_alignment.rotate_months(
        islamic_year_canonical.months, alignment.current_month_index
    )
)

# Derived alignment values
islamic_date_rotation_offset = alignment.rotation_offset
days_elapsed_islamic_base = alignment.days_elapsed


# In[2]:


# make the out dir
os.makedirs("out", exist_ok=True)


# In[3]:


# Get months to draw

scale_factor = SCALE_FACTOR

print(scale_factor)

canvas_width = 11 * scale_factor
width = inchToMilimeter(8 * scale_factor)
outermost_radius = width / ( 2 * 3.14 / 12)
# outermost_radius = inchToMilimeter(35)
inner_radius = outermost_radius * 9.2 / 10
month_thickness = (outermost_radius - inner_radius)
date_box_height = month_thickness * 0.2

# width = outermost_radius * 2 * 3.14 / 12 / 2
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

# islamic_date_rotation_offset is now calculated dynamically from alignment params above
    
islamicMonths = []
for month in islamic_year.months:
    name_upside_down = (month.number > 3 and month.number <= 9)
    for day in month.num_days:
        islamicMonths.append(
            MonthInstance(
                name=month.name,
                num_days=day,
                color=month.color,
                name_upside_down=name_upside_down,
                date_on_top=True, # the outer month
                date_box_height=date_box_height,
                inner_radius=inner_radius - month_thickness,
                outer_radius=outermost_radius - month_thickness,
                date_angle_offset=date_rotation(month) + islamic_date_rotation_offset,
            )
        ) 


# In[4]:


month_offset = 4 * scale_factor # Use 0 to have solar/Islamic months touching in the print out

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
pdfs = []

# Draw full scale pages
while month_idx < len(solarMonths) - 1:
    dwg = getVerticalPageCanvas() # getPageCanvas()
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
    pdf_file = f"out/calendar_page_{scale_factor}_{page_num}.pdf"

    dwg.saveas(svg_file, pretty=True)
    svg_to_pdf(svg_file, pdf_file)
    os.remove(svg_file)
    pdfs.append(pdf_file)
    
    page_num += 1



# Draw summary page
def circle_form_factor(g, month, days_elapsed, days_in_year, origin):
    g.translate(75, 50)
    g.scale(0.3)
    rot = 360.0 * (days_elapsed + month.num_days / 2)/days_in_year
    g.rotate(rot, center=origin)
    g.translate(0, origin_first.y - origin.y)

month_idx = 0
page_num = 0
days_elapsed = 0 - solarMonths[0].num_days/2

# days_elapsed_islamic is now calculated dynamically from alignment params
# The base value comes from islamic_alignment module; we just adjust for centering
days_elapsed_islamic = days_elapsed_islamic_base - islamicMonths[0].num_days/2 

dwg = getVerticalPageCanvas() # getPageCanvas()
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
                #origin = offsetPointBy(origin, 0, month_offset)
                

            if month_idx < len(islamicMonths):
                month = islamicMonths[month_idx]
                g = groupWithMonthParts(getMonth(month, days_in_year, origin))
                circle_form_factor(g, month, days_elapsed_islamic, days_in_year, origin)
                days_elapsed_islamic += month.num_days
                dwg.add(g)
                #origin = offsetPointBy(origin, 0, month_thickness*2.3)
        
        # move to next column 
        #origin = offsetPointBy(origin_first, width * 1.05, 0)

    page_num += 1

print("saving pdf")
svg_file = f"out/svg_{scale_factor}_{page_num}_cover.svg"
pdf_file = f"out/calendar_page_{scale_factor}_{page_num}_cover.pdf"

dwg.saveas(svg_file, pretty=True)
svg_to_pdf(svg_file, pdf_file)
os.remove(svg_file)
pdfs.insert(0, pdf_file)

# Generate the instructions PDF with the cover image embedded
import generate_instructions
cover_pdf = f"out/calendar_page_{scale_factor}_{page_num}_cover.pdf"
instructions_pdf = "v3 Instructions.pdf"
generate_instructions.generate_instructions_pdf(cover_pdf, instructions_pdf)

# Remove cover from pdfs list since it's now embedded in instructions
pdfs.remove(cover_pdf)

pdfizer.concat_pdfs([instructions_pdf] + pdfs, f"out/calendar_pages_{scale_factor}_COMPLETE.pdf")
print("Wrote the concatenated file!")

# Clean up intermediate PDFs
for pdf in pdfs:
    print(f"removing {pdf}...")
    os.remove(pdf)
print(f"removing {cover_pdf}...")
os.remove(cover_pdf)
print("and removed old pdfs")

print(scale_factor)
if SVG:
    SVG(dwg.tostring())




