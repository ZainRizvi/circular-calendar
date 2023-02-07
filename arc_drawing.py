import math
from typing import List

from primitives import *

def getPageCanvas() -> svgwrite.Drawing:
    return svgwrite.Drawing(
        size=(f"{inchToMilimeter(11)}mm", f"{inchToMilimeter(8.5)}mm"),
        viewBox=(f"0 0 {inchToMilimeter(11)} {inchToMilimeter(8.5)}")
    )

def inchToMilimeter(i: int) -> int:
    return i * 25

def toRadian(angle: Angle) -> float:
    return angle * math.pi / 180

def getCoordinatePoint(origin: Point, radius: Length, angle: Angle) -> Point:
    rise = radius * math.sin(toRadian(angle))
    run = radius * math.cos(toRadian(angle))
    coordinate = Point(origin.x + run, origin.y + rise)
    return coordinate

def getArc(origin: Point, radius: Length, start_angle: Angle, stop_angle: Angle) -> Arc:
    # Calulate arc points
    start = getCoordinatePoint(origin, radius, start_angle)
    stop = getCoordinatePoint(origin, radius, stop_angle)
    
    # Calculate arc params
    x_axis_rotation = 0 # useless
    # whether to draw the larger portion of the circle
    large_arc_flag = 0 if abs(start_angle - stop_angle) <= 180 else 1 
    # whether to draw the clockwise or counter clockwise portion of the circle
    sweep_flag = 1 if start_angle < stop_angle else 0
    
    params = f"{x_axis_rotation} {large_arc_flag} {sweep_flag}"

    arc = Arc(start, stop, radius, params)
    return arc    


def getDimensionalArc(
    origin: Point, 
    inner_radius: Length, 
    outer_radius: Length, 
    start_angle: Angle, 
    stop_angle: Angle,
    stroke: str = "black",
    fill: str = "none"):

    outerArc = getArc(origin, outer_radius, start_angle, stop_angle)
    innerArc = getArc(origin, inner_radius, stop_angle, start_angle)

    dimArc = DimensionalArc(outerArc, innerArc, stroke=stroke, fill=fill)
    return dimArc

def drawMonthParts(dwg: svgwrite.Drawing, monthParts: List[any]):
    for part in monthParts:
        drawing = part.drawnPath()
        # some drawn parts return a list of multiple things to draw. Unify both interfaces here. 
        if not isinstance(drawing, list):
            drawing = [drawing]
            
        for component in drawing:
            dwg.add(component)