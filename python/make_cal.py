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

import math
import os
from IPython.display import SVG

# custom libs
from primitives import *
from arc_drawing import *
from calendar_data import *
from calendar_drawings import *
import pdfizer
from date_calculator import get_current_alignment


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

# Get automatic calendar alignment based on current date
# This calculates the proper rotation to align solar and Islamic calendars
alignment = get_current_alignment()
islamic_date_rotation_offset = alignment.islamic_date_rotation_offset

print(f"\n=== Calendar Alignment Info ===")
print(f"Solar Date: {alignment.current_solar_date}")
print(f"Islamic Date: {alignment.current_islamic_date}")
print(f"Islamic rotation offset: {islamic_date_rotation_offset:.1f} days")
print(f"="*35 + "\n")
    
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
    # os.system(f"convert {svg_file} {pdf_file}")
    os.system(f"inkscape {svg_file} --export-filename={pdf_file} --export-type=pdf")
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

# Automatically calculate Islamic calendar positioning based on current date
# This ensures the Islamic calendar aligns properly with the solar calendar
num_months_to_skip = alignment.num_months_to_skip
days_elapsed_islamic = alignment.days_elapsed_islamic

print(f"Positioning Islamic calendar:")
print(f"  Months to skip: {num_months_to_skip}")
print(f"  Days elapsed: {days_elapsed_islamic:.1f}")
print(f"  This will position the current Islamic month at the top") 

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
# os.system(f"convert {svg_file} {pdf_file}")
os.system(f"inkscape {svg_file} --export-filename={pdf_file} --export-type=pdf")
os.remove(svg_file)
pdfs.insert(0, pdf_file)

instructions_pdf = "v3 Instructions.pdf"
pdfizer.concat_pdfs([instructions_pdf] + pdfs, f"out/calendar_pages_{scale_factor}_COMPLETE.pdf")
print("Wrote the concatenated file!")
for pdf in pdfs:
    print(f"removing {pdf}...") 
    os.remove(pdf)
print("and removed old pdfs")

print(scale_factor)
SVG(dwg.tostring())


# In[ ]:




