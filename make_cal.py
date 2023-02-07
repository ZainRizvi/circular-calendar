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
import svgwrite
from svgwrite import Drawing
from IPython.display import SVG
from typing import NamedTuple
from enum import Enum
from typing import List

# custom libs
from primitives import *
from arc_drawing import getArc, getDimensionalArc
from calendar_data import MonthInstance


# In[2]:





# In[3]:


DATE_FILL_COLOR = "#3A6"
def getMonth(month: MonthInstance, days_in_year: int, origin: Point):
    month_width_degrees = 360 * month.num_days / days_in_year
    # center start and stop angles around -90 degrees
    angle_offset = month_width_degrees / 2
    center_angle = -90
    start_angle = center_angle - angle_offset
    stop_angle = center_angle + angle_offset

    drawing_elements = []
    background = getDimensionalArc(
        origin=origin,
        inner_radius=month.inner_radius,
        outer_radius=month.outer_radius,
        start_angle=start_angle,
        stop_angle=stop_angle,
        fill=month.color
    )

    drawing_elements.append(background)
    date_width_degrees = month_width_degrees / month.num_days # how many degrees of width the date box should have
    if month.date_on_top:
        date_inner_radius = month.outer_radius - month.date_box_height
        date_outer_radius = month.outer_radius
        month_text_radius = (date_inner_radius + month.inner_radius) / 2
    else:
        date_inner_radius = month.inner_radius
        date_outer_radius = month.inner_radius + month.date_box_height
        month_text_radius = (date_outer_radius + month.outer_radius) / 2

    month_text_arc = getArc(
        origin=origin,
        radius=month_text_radius,
        start_angle=start_angle,
        stop_angle=stop_angle
    )

    month_text = CurvedText(arc=month_text_arc, text=month.name)
    # drawing_elements.append(month_text_arc)
    drawing_elements.append(month_text)

    curr_date_end_angle = start_angle
    for i in range(month.num_days):
        curr_date_start_angle = curr_date_end_angle
        curr_date_end_angle = curr_date_start_angle + date_width_degrees

        date_background = getDimensionalArc(
            origin=origin,
            inner_radius=date_inner_radius,
            outer_radius=date_outer_radius,
            start_angle=curr_date_start_angle,
            stop_angle=curr_date_end_angle,
            fill=DATE_FILL_COLOR
        )

        drawing_elements.append(date_background)

        
    
    return drawing_elements


# In[4]:


monthInstance = MonthInstance(
    name="January",
    num_days=31,
    date_on_top=False,
    date_box_height=10,
    inner_radius=800,
    outer_radius=900,
    color = "pink",
)

monthInstance2 = MonthInstance(
    name="January",
    num_days=31,
    date_on_top=True,
    date_box_height=10,
    inner_radius=700,
    outer_radius=800,
    color="blue",
)

origin = Point(250, 1000)
days_in_year = 366

def drawMonthParts(dwg, monthParts):
    for part in monthParts:
        drawing = part.drawnPath()
        # some drawn parts return a list of multiple things to draw. Unify both interfaces here. 
        if not isinstance(drawing, list):
            drawing = [drawing]
            
        for component in drawing:
            dwg.add(component)


# In[5]:





# In[12]:


dwg = svgwrite.Drawing()
dwg.viewbox(0,0,500,500)

month1 = getMonth(monthInstance, days_in_year, origin)
month2 = getMonth(monthInstance2, days_in_year, origin)


drawMonthParts(dwg, month1)
drawMonthParts(dwg, month2)
    
dwg.saveas("test_output.svg", pretty=True)
SVG(dwg.tostring())


# In[10]:





# In[ ]:


# darc = getDimensionalArc(Point(100,100), 60, 90, -135, -45, fill="red")
# print(darc.path())

# dwg.add(darc.drawnPath(dwg))

# darc = getDimensionalArc(Point(100,120), 60, 70, -135, -45, fill="yellow")
# dwg.add(darc.drawnPath(dwg))

#dwg.add(dwg.path(d="m 64.64466094067262,64.64466094067262 A 50,50 0 0 1 135.35533905932738,64.64466094067262 L 128.2842712474619,71.7157287525381 A 40,40 71.7157287525381,71.7157287525381L 64.64466094067262,64.64466094067262",
#stroke="#DDD", fill="none"))

# arc1 = arcPath(Point(100, 100), 50, -135, -45)
# arc2 = arcPath(Point(100, 120), 50, -45, -135)

# dwg.add(arc1.drawnPath(dwg))
# dwg.add(arc2.drawnPath(dwg))


# In[17]:


dwg = svgwrite.Drawing()
dwg.viewbox(0,0,500,220)

x1 = 200
y1 = 200
r1 = 50
arc = math.sqrt(2*(r1**2))

# setup canvas
dwg = svgwrite.Drawing()
dwg.viewbox(0,0,500,220)

# def getTextAlongArc(arc: Arc, text: str):
  

# Print text centered along path 
path = dwg.path(
        d=f"m {x1},{y1} " + # starting point
          f"a{r1},{r1} 0 0 1 {arc},0 " + # first arc
          f"a{r1},{r1} 0 0 0 {arc},0 ", # second arc
        stroke="#DDD",
        fill="none")
text = svgwrite.text.Text("")
text.add(svgwrite.text.TextPath(path, text="soy sol sonatora", startOffset="50%", method="align", text_anchor="middle"))
dwg.add(path)
dwg.add(text)

# make_circle(x1,y1,r1)
# extension = 50
# (x2, y2) = extend_line_point((x1+r1, y1+r1),(x1,y1), extension)
# print((x2, y2))
# extend_circle(x2,y2,50+extension)

SVG(dwg.tostring())


# In[ ]:





# In[118]:


dwg = svgwrite.Drawing()
dwg.viewbox(0,0,500,220)
#dwg.add(dwg.line((0, 0), (100, 100), stroke='black'))
dwg.add(dwg.text('Test', insert=(50, 20)))

for r in range(10,100,5):
    dwg.add(dwg.circle(center=(300,100), r=r, fill='blue', opacity='0.05'))

#for n in range(11,100,5):
    #dwg.add(dwg.line((0, 0), (100, n), stroke='black'))

dwg.add(dwg.text("how are you doing", insert=(200, 300)))

x1 = 200
y1 = 200
r1 = 50
arc = math.sqrt(2*(r1**2))

# setup canvas
dwg = svgwrite.Drawing()
dwg.viewbox(0,0,500,220)

# Print text centered along path 
path = dwg.path(
        d=f"m {x1},{y1} " + # starting point
          f"a{r1},{r1} 0 0 1 {arc},0 " + # first arc
          f"a{r1},{r1} 0 0 0 {arc},0 ", # second arc
        stroke="#DDD",
        fill="none")
text = svgwrite.text.Text("")
text.add(svgwrite.text.TextPath(path, text="soy sol sonatora", startOffset="50%", method="align", text_anchor="middle"))
dwg.add(path)
dwg.add(text)

# make_circle(x1,y1,r1)
# extension = 50
# (x2, y2) = extend_line_point((x1+r1, y1+r1),(x1,y1), extension)
# print((x2, y2))
# extend_circle(x2,y2,50+extension)

SVG(dwg.tostring())


# In[ ]:





# In[119]:


# def extend_line_point(start, ext, len):
#     m = (ext[0] - start[0])/(ext[1]-start[1])
#     print (f"(ext[0] - start[0]) = {(ext[0] - start[0])}")
#     print(f"(ext[1]-start[1]) = {(ext[1]-start[1])}")
#     print(m)
#     extension_y = math.sqrt((len**2)/(1+m**2))
#     extension_x = m * extension_y

#     return (ext[0] - extension_x, ext[1] - extension_y)


# def make_circle(x, y, r):
#     arc = math.sqrt(2*(r**2))
#     print(f"arc={arc}")

#     dwg.add(dwg.path(
#             d=f'm {x},{y}  a{r},{r} 0 0 1 {arc},0 ',
#             stroke="#000",
#             fill="none"))
#     dwg.add(dwg.path(
#             d=f'm {x + arc},{y}  a{r},{r} 0 0 1 0,{arc} ',
#             stroke="#000",
#             fill="none"))
#     dwg.add(dwg.path(
#             d=f'm {x + arc},{y+arc}  a{r},{r} 0 0 1 {arc * -1}, 0 ',
#             stroke="#000",
#             fill="none"))
#     dwg.add(dwg.path(
#             d=f'm {x},{y+arc} a{r},{r} 0 0 1 0,{arc * -1} ',
#             stroke="#000",
#             fill="none"))

# def extend_circle(x, y, r):
#     arc = math.sqrt(2*(r**2))
#     print(f"arc={arc}")

#     dwg.add(dwg.path(
#             d=f'm {x},{y}  a{r},{r} 0 0 1 {arc},0 ',
#             stroke="#000",
#             fill="none"))


# In[120]:


# setup canvas
dwg = svgwrite.Drawing()
dwg.viewbox(0,0,600,250)

# Create a path
x1 = 20
y1 = 50
r1 = 50
arc = math.sqrt(2*(r1**2))
path = dwg.path(
        d=f"m {x1+2*arc},{y1} " + # starting point
          f"a{r1},{r1} 0 0 1 {-arc},0 " + # first arc
          f"a{r1},{r1} 0 0 0 {-arc},0 ", # second arc
        # d=f"m {x1},{y1} " + # starting point
        #  f"a{r1},{r1} 0 0 1 {arc},0 " + # first arc
        #  f"a{r1},{r1} 0 0 0 {arc},0 ", # second arc         
        stroke="#DDD",
        fill="none")

path2 = dwg.path(
        d=f"m {x1},{y1} " + # starting point
          f"a{r1},{r1} 0 0 1 {arc},0 " + # first arc
          f"a{r1},{r1} 0 0 0 {arc},0 ", # second arc
        stroke="#DDD",
        fill="none",
        transform=f"rotate(180 {x1+arc} {y1})")

# Center text along path 
text = svgwrite.text.Text("")
text.add(svgwrite.text.TextPath(path, text="it worked alhamd", startOffset="50%", method="align", text_anchor="middle"))
# text.add(svgwrite.text.TextPath(path2, text="it worked alhamd", startOffset="50%", method="align", text_anchor="middle"))

# Draw path and text
dwg.add(path)
dwg.add(path2)
dwg.add(text)
SVG(dwg.tostring())


# In[ ]:





# In[ ]:




