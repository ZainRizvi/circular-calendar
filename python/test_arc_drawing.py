"""
Unit tests for arc_drawing module.

Tests geometric calculation functions: coordinate conversion,
arc construction, and dimensional arc properties.

Run with: python -m pytest test_arc_drawing.py -v
"""

import math
import unittest
from primitives import Point, Arc, ArcDrawMode
from arc_drawing import (
    inchToMilimeter,
    toRadian,
    getCoordinatePoint,
    getArc,
    getDimensionalArc,
    getPageCanvas,
    getVerticalPageCanvas,
)


class TestInchToMillimeter(unittest.TestCase):
    """Test unit conversion."""

    def test_one_inch(self):
        self.assertEqual(inchToMilimeter(1), 25)

    def test_zero(self):
        self.assertEqual(inchToMilimeter(0), 0)

    def test_fractional(self):
        self.assertEqual(inchToMilimeter(8.5), 212.5)


class TestToRadian(unittest.TestCase):
    """Test degree to radian conversion."""

    def test_zero(self):
        self.assertAlmostEqual(toRadian(0), 0)

    def test_90_degrees(self):
        self.assertAlmostEqual(toRadian(90), math.pi / 2)

    def test_180_degrees(self):
        self.assertAlmostEqual(toRadian(180), math.pi)

    def test_360_degrees(self):
        self.assertAlmostEqual(toRadian(360), 2 * math.pi)

    def test_negative(self):
        self.assertAlmostEqual(toRadian(-90), -math.pi / 2)


class TestGetCoordinatePoint(unittest.TestCase):
    """Test polar to cartesian conversion on circle."""

    def test_0_degrees(self):
        """0 degrees should be directly to the right of origin."""
        p = getCoordinatePoint(Point(100, 100), 50, 0)
        self.assertAlmostEqual(p.x, 150)
        self.assertAlmostEqual(p.y, 100)

    def test_90_degrees(self):
        """90 degrees should be directly below origin (y increases downward in SVG)."""
        p = getCoordinatePoint(Point(100, 100), 50, 90)
        self.assertAlmostEqual(p.x, 100, places=5)
        self.assertAlmostEqual(p.y, 150, places=5)

    def test_180_degrees(self):
        """180 degrees should be directly to the left."""
        p = getCoordinatePoint(Point(100, 100), 50, 180)
        self.assertAlmostEqual(p.x, 50, places=5)
        self.assertAlmostEqual(p.y, 100, places=5)

    def test_270_degrees(self):
        """270 degrees should be directly above (negative y in SVG)."""
        p = getCoordinatePoint(Point(100, 100), 50, 270)
        self.assertAlmostEqual(p.x, 100, places=5)
        self.assertAlmostEqual(p.y, 50, places=5)

    def test_negative_90_degrees(self):
        """-90 degrees should be above origin (same as 270)."""
        p = getCoordinatePoint(Point(100, 100), 50, -90)
        self.assertAlmostEqual(p.x, 100, places=5)
        self.assertAlmostEqual(p.y, 50, places=5)

    def test_distance_from_origin(self):
        """Result should always be exactly 'radius' away from origin."""
        origin = Point(50, 75)
        radius = 30
        for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
            p = getCoordinatePoint(origin, radius, angle)
            dist = math.sqrt((p.x - origin.x) ** 2 + (p.y - origin.y) ** 2)
            self.assertAlmostEqual(dist, radius, places=5,
                                   msg=f"Distance wrong at {angle} degrees")


class TestGetArc(unittest.TestCase):
    """Test arc construction from angles."""

    def test_small_arc_flag(self):
        """Arc spanning less than 180 degrees should have large_arc_flag=0."""
        arc = getArc(Point(100, 100), 50, 0, 90)
        self.assertIn("0 0 1", arc.params)  # x_rotation=0, large_arc=0, sweep=1

    def test_large_arc_flag(self):
        """Arc spanning more than 180 degrees should have large_arc_flag=1."""
        arc = getArc(Point(100, 100), 50, 0, 270)
        self.assertIn("0 1 1", arc.params)  # x_rotation=0, large_arc=1, sweep=1

    def test_exactly_180_degrees(self):
        """Arc spanning exactly 180 degrees should have large_arc_flag=0."""
        arc = getArc(Point(100, 100), 50, 0, 180)
        self.assertIn("0 0 1", arc.params)

    def test_sweep_clockwise(self):
        """When start < stop, sweep_flag should be 1 (clockwise in SVG)."""
        arc = getArc(Point(100, 100), 50, 10, 80)
        self.assertTrue(arc.params.endswith("1"))

    def test_sweep_counterclockwise(self):
        """When start > stop, sweep_flag should be 0 (counter-clockwise)."""
        arc = getArc(Point(100, 100), 50, 80, 10)
        self.assertTrue(arc.params.endswith("0"))

    def test_arc_start_stop_points_on_circle(self):
        """Start and stop points should both be on the circle."""
        origin = Point(100, 100)
        radius = 50
        arc = getArc(origin, radius, -45, 45)
        for p in [arc.start, arc.stop]:
            dist = math.sqrt((p.x - origin.x) ** 2 + (p.y - origin.y) ** 2)
            self.assertAlmostEqual(dist, radius, places=5)

    def test_arc_radius_preserved(self):
        """The arc should carry the same radius it was created with."""
        arc = getArc(Point(0, 0), 42, 0, 90)
        self.assertEqual(arc.radius, 42)


class TestGetDimensionalArc(unittest.TestCase):
    """Test 2D (annular sector) arc construction."""

    def test_outer_inner_relationship(self):
        """Outer arc radius should be larger than inner arc radius."""
        darc = getDimensionalArc(Point(100, 100), 60, 90, -45, 45)
        self.assertGreater(darc.outerArc.radius, darc.innerArc.radius)

    def test_stroke_default(self):
        """Default stroke should be black."""
        darc = getDimensionalArc(Point(100, 100), 60, 90, -45, 45)
        self.assertEqual(darc.stroke, "black")

    def test_fill_default(self):
        """Default fill should be none."""
        darc = getDimensionalArc(Point(100, 100), 60, 90, -45, 45)
        self.assertEqual(darc.fill, "none")

    def test_fill_custom(self):
        """Custom fill should be preserved."""
        darc = getDimensionalArc(Point(100, 100), 60, 90, -45, 45, fill="red")
        self.assertEqual(darc.fill, "red")

    def test_inner_arc_angles_reversed(self):
        """Inner arc should have reversed start/stop angles for closed path."""
        # The inner arc goes from stop_angle to start_angle (reverse direction)
        # so that the path forms a closed shape
        origin = Point(100, 100)
        darc = getDimensionalArc(origin, 60, 90, -45, 45)
        # Inner arc sweep is opposite to outer arc sweep
        outer_sweep = "1" if darc.outerArc.params.endswith("1") else "0"
        inner_sweep = "1" if darc.innerArc.params.endswith("1") else "0"
        self.assertNotEqual(outer_sweep, inner_sweep)

    def test_path_forms_closed_shape(self):
        """The dimensional arc path should end by closing back to start."""
        darc = getDimensionalArc(Point(100, 100), 60, 90, -45, 45)
        path = darc.path()
        # Path should end with L back to the outer arc start point
        self.assertIn(f"L {darc.outerArc.start.pathText()}", path)


class TestCanvasDimensions(unittest.TestCase):
    """Test SVG canvas creation."""

    def test_horizontal_canvas_size(self):
        """Horizontal canvas should be 11x8.5 inches in mm."""
        dwg = getPageCanvas()
        # Width should be 11*25=275mm, height 8.5*25=212.5mm
        self.assertIn("275mm", dwg.attribs.get("width", ""))
        self.assertIn("212.5mm", dwg.attribs.get("height", ""))

    def test_vertical_canvas_size(self):
        """Vertical canvas should be 8.5x11 inches in mm."""
        dwg = getVerticalPageCanvas()
        self.assertIn("212.5mm", dwg.attribs.get("width", ""))
        self.assertIn("275mm", dwg.attribs.get("height", ""))

    def test_horizontal_vs_vertical_swapped(self):
        """Horizontal and vertical canvases should have swapped dimensions."""
        h = getPageCanvas()
        v = getVerticalPageCanvas()
        self.assertEqual(h.attribs["width"], v.attribs["height"])
        self.assertEqual(h.attribs["height"], v.attribs["width"])


if __name__ == "__main__":
    unittest.main()
