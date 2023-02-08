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
import svgwrite
from svgwrite import Drawing
from IPython.display import SVG
from typing import NamedTuple
from enum import Enum
from typing import List

# custom libs
from primitives import *
from arc_drawing import *
from calendar_data import *
from calendar_drawings import *


# In[2]:


# Get months to draw

canvas_width = 11
width = inchToMilimeter(8)
outermost_radius = width / ( 2 * 3.14 / 12)
# outermost_radius = inchToMilimeter(35)
inner_radius = outermost_radius * 9.2 / 10
month_thickness = (outermost_radius - inner_radius)
date_box_height = month_thickness * 0.18

# width = outermost_radius * 2 * 3.14 / 12 / 2
width_center = inchToMilimeter(canvas_width) / 2
vertical_offset = 30

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
            )
        ) 


islamicMonths = []
month_offset = 5
for index, month in enumerate(islamic_year.months):
    name_upside_down = (index >= 3 and index < 9)
    for day in month.num_days:
        islamicMonths.append(
            MonthInstance(
                name=month.name,
                num_days=day,
                color=month.color,
                name_upside_down=name_upside_down,
                date_on_top=True, # the outer month
                date_box_height=date_box_height,
                inner_radius=inner_radius - month_thickness - month_offset,
                outer_radius=outermost_radius - month_thickness - month_offset,
            )
        ) 


# In[4]:


origin_first = Point(width_center, outermost_radius + vertical_offset)
origin = origin_first

days_in_year = 366

for i in range(int(len(solarMonths)/2)):
    dwg = getPageCanvas()

    origin = origin_first
    drawMonthParts(dwg, getMonth(solarMonths[2 * i], days_in_year, origin))
    drawMonthParts(dwg, getMonth(islamicMonths[2 * i], days_in_year, origin))
    
    origin = Point(origin.x, origin.y + (month_thickness * 2.4))
    drawMonthParts(dwg, getMonth(solarMonths[2 * i + 1], days_in_year, origin))
    drawMonthParts(dwg, getMonth(islamicMonths[2 * i + 1], days_in_year, origin))

    svg_file = f"out/test_output_{i}.svg"
    pdf_file = f"out/calendar_page_{i}.pdf"

    dwg.saveas(svg_file, pretty=True)
    # os.system(f"convert {svg_file} {pdf_file}")
    os.system(f"inkscape {svg_file} --export-pdf={pdf_file}")

SVG(dwg.tostring())

