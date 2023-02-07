from typing import NamedTuple
import svgwrite
from enum import Enum

class Length(float):
    pass

class Angle(float):
    pass

class Point(NamedTuple):
    x: float
    y: float

    def pathText(self):
        return f"{self.x},{self.y}"

class ArcDrawMode(Enum):
    NEW = 1
    LINE_TO = 2 # Draw a line from wherever the path last ended to the start of this Arc

STROKE_WIDTH = 0.5
"""
A linear arc
"""
class Arc(NamedTuple):
    start: Point
    stop: Point
    radius: Length
    params: str

    def path(self, mode: ArcDrawMode):
        if mode not in ArcDrawMode:
            raise Exception(f"Invalid mode {mode}") 

        if mode == ArcDrawMode.NEW:
            starting_mode = "m" # move drawer to starting point
        elif mode == ArcDrawMode.LINE_TO:
            starting_mode = "L" # draw line to starting point
        else:
            raise Exception(f"Invalid mode {mode}") 

        return f"{starting_mode} {self.start.pathText()} " + \
                f"A {self.radius},{self.radius} {self.params} {self.stop.pathText()} "

    def drawnPath(self, stroke: str = "black", fill: str = "none"):
        return svgwrite.path.Path(
            d=self.path(ArcDrawMode.NEW),
            stroke=stroke,
            stroke_width=STROKE_WIDTH,
            fill=fill)
        
"""
An 2D arc
"""
class DimensionalArc(NamedTuple):
    outerArc: Arc
    innerArc: Arc
    stroke: str
    fill: str

    def path(self):
        return \
            self.outerArc.path(ArcDrawMode.NEW) + \
            self.innerArc.path(ArcDrawMode.LINE_TO) + \
            f"L {self.outerArc.start.pathText()} " # close off the shape

    def drawnPath(self):
        text = self.path()

        return svgwrite.path.Path(
            d=text,
            stroke=self.stroke,
            stroke_width=STROKE_WIDTH,
            fill=self.fill)

class TextCenteredAroundPoint(NamedTuple):
    point: Point
    text: str
    font_size: float

    def drawnPath(self):
        t = svgwrite.text.Text(
            self.text,
            insert=(self.point.x, self.point.y),
            font_size=self.font_size,
            text_anchor="middle",
            #alignment_baseline="middle",
            dominant_baseline="central",
        )
        return t


    
class CurvedText(NamedTuple):
    arc: Arc
    text: str
    font_size: int = 30

    # There's some VSCode bug that sometimes renders text in the wrong location
    # even if the underlying svg code is perfect. Retrying the rendering a couple 
    # times fixes it in a very deterministic way somehow.
    # Loading the same svg code in other viewers renders it just fine even at the first attempt
    def drawnPath(self):
        path = self.arc.drawnPath(stroke="none")
        text = svgwrite.text.Text(
            "", 
            font_size=self.font_size,
            font_family="Arial, Helvetica, sans-serif"
        )
        text.add(
            svgwrite.text.TextPath(
                path, 
                text=self.text,
                startOffset="50%",
                method="align",
                text_anchor="middle",
                dominant_baseline="middle"))

        return [path, text]

class Circle(NamedTuple):
    radius: float
    center: Point

    def drawnPath(self):
        return [
            svgwrite.shapes.Circle(
                center=(self.center.x, self.center.y),
                r = self.radius,
                fill="yellow"
            )
        ]