"""
Unit tests for calendar_drawings module.

Tests the getMonth function which generates all SVG drawing elements
for a single month (background arc, date boxes, date text, month name).

Run with: python -m pytest test_calendar_drawings.py -v
"""

import unittest
from primitives import Point, DimensionalArc, CurvedText, TextCenteredAroundPoint
from calendar_data import MonthInstance
from calendar_drawings import getMonth


def _make_month_instance(
    name="January",
    num_days=31,
    color="#aebbff",
    name_upside_down=False,
    date_on_top=False,
    date_box_height=2.0,
    inner_radius=80.0,
    outer_radius=100.0,
    date_angle_offset=0,
) -> MonthInstance:
    """Helper to create a MonthInstance with sensible defaults."""
    return MonthInstance(
        name=name,
        num_days=num_days,
        color=color,
        name_upside_down=name_upside_down,
        date_on_top=date_on_top,
        date_box_height=date_box_height,
        inner_radius=inner_radius,
        outer_radius=outer_radius,
        date_angle_offset=date_angle_offset,
    )


class TestGetMonthElementCount(unittest.TestCase):
    """Test that getMonth produces the right number and type of elements."""

    def test_element_count_31_day_month(self):
        """31-day month: 1 background + 1 month name + 31 date boxes + 31 date texts = 64."""
        month = _make_month_instance(num_days=31)
        elements = getMonth(month, 366, Point(100, 100))
        self.assertEqual(len(elements), 1 + 1 + 31 + 31)

    def test_element_count_30_day_month(self):
        """30-day month: 1 + 1 + 30 + 30 = 62."""
        month = _make_month_instance(num_days=30, name="April")
        elements = getMonth(month, 366, Point(100, 100))
        self.assertEqual(len(elements), 62)

    def test_element_count_29_day_month(self):
        """29-day month (Feb leap): 1 + 1 + 29 + 29 = 60."""
        month = _make_month_instance(num_days=29, name="February")
        elements = getMonth(month, 366, Point(100, 100))
        self.assertEqual(len(elements), 60)


class TestGetMonthStructure(unittest.TestCase):
    """Test the structure and types of generated elements."""

    def test_first_element_is_background_arc(self):
        """First element should be the colored background DimensionalArc."""
        month = _make_month_instance(color="#ff0000")
        elements = getMonth(month, 366, Point(100, 100))
        self.assertIsInstance(elements[0], DimensionalArc)
        self.assertEqual(elements[0].fill, "#ff0000")

    def test_second_element_is_month_name(self):
        """Second element should be the CurvedText month name."""
        month = _make_month_instance(name="March")
        elements = getMonth(month, 366, Point(100, 100))
        self.assertIsInstance(elements[1], CurvedText)
        self.assertEqual(elements[1].text, "March")

    def test_date_boxes_are_dimensional_arcs(self):
        """Date boxes (elements 2, 4, 6, ...) should be DimensionalArcs."""
        month = _make_month_instance(num_days=5)
        elements = getMonth(month, 366, Point(100, 100))
        # Elements: [background, name, date_box_1, date_1, date_box_2, date_2, ...]
        for i in range(5):
            self.assertIsInstance(elements[2 + i * 2], DimensionalArc,
                                 f"Element {2 + i * 2} should be a DimensionalArc date box")

    def test_date_texts_are_text_centered(self):
        """Date texts (elements 3, 5, 7, ...) should be TextCenteredAroundPoint."""
        month = _make_month_instance(num_days=5)
        elements = getMonth(month, 366, Point(100, 100))
        for i in range(5):
            self.assertIsInstance(elements[3 + i * 2], TextCenteredAroundPoint,
                                 f"Element {3 + i * 2} should be a TextCenteredAroundPoint")

    def test_date_text_values(self):
        """Date texts should contain "1", "2", ..., "N"."""
        month = _make_month_instance(num_days=5)
        elements = getMonth(month, 366, Point(100, 100))
        for i in range(5):
            text_elem = elements[3 + i * 2]
            self.assertEqual(text_elem.text, str(i + 1))


class TestGetMonthDatePlacement(unittest.TestCase):
    """Test date box placement (top vs bottom of arc)."""

    def test_date_on_top_radius(self):
        """When date_on_top=True, date boxes should be near outer_radius."""
        month = _make_month_instance(date_on_top=True, inner_radius=80, outer_radius=100, date_box_height=5)
        elements = getMonth(month, 366, Point(100, 100))
        date_box = elements[2]  # First date box
        # For date_on_top, date outer = month outer, date inner = outer - height
        self.assertEqual(date_box.outerArc.radius, 100)
        self.assertEqual(date_box.innerArc.radius, 95)  # 100 - 5

    def test_date_on_bottom_radius(self):
        """When date_on_top=False, date boxes should be near inner_radius."""
        month = _make_month_instance(date_on_top=False, inner_radius=80, outer_radius=100, date_box_height=5)
        elements = getMonth(month, 366, Point(100, 100))
        date_box = elements[2]
        # For date_on_top=False, date inner = month inner, date outer = inner + height
        self.assertEqual(date_box.innerArc.radius, 80)
        self.assertEqual(date_box.outerArc.radius, 85)  # 80 + 5


class TestGetMonthNameOrientation(unittest.TestCase):
    """Test month name arc direction for upside-down handling."""

    def test_normal_month_name_arc_direction(self):
        """Normal (not upside down) month: text arc goes start→stop."""
        month = _make_month_instance(name_upside_down=False)
        elements = getMonth(month, 366, Point(100, 100))
        text = elements[1]
        # start_angle < stop_angle → arc goes left to right
        # The text arc start should be to the left (smaller x)
        self.assertLess(text.arc.start.x, text.arc.stop.x)

    def test_upside_down_month_name_arc_direction(self):
        """Upside-down month: text arc goes stop→start (reversed)."""
        month = _make_month_instance(name_upside_down=True)
        elements = getMonth(month, 366, Point(100, 100))
        text = elements[1]
        # The text arc should be reversed - start.x > stop.x
        self.assertGreater(text.arc.start.x, text.arc.stop.x)


class TestGetMonthDateRotation(unittest.TestCase):
    """Test that date_angle_offset propagates to date text elements."""

    def test_offset_applied_to_date_texts(self):
        """All date texts should use the month's date_angle_offset for rotation."""
        offset = -60
        month = _make_month_instance(num_days=3, date_angle_offset=offset)
        elements = getMonth(month, 366, Point(100, 100))
        for i in range(3):
            text_elem = elements[3 + i * 2]
            self.assertEqual(text_elem.rotation, offset)

    def test_different_offsets_produce_different_rotations(self):
        """Two months with different offsets should have different text rotations."""
        m1 = _make_month_instance(num_days=1, date_angle_offset=0)
        m2 = _make_month_instance(num_days=1, date_angle_offset=-30)
        e1 = getMonth(m1, 366, Point(100, 100))
        e2 = getMonth(m2, 366, Point(100, 100))
        self.assertNotEqual(e1[3].rotation, e2[3].rotation)


if __name__ == "__main__":
    unittest.main()
