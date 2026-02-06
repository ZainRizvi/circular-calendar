"""
Unit tests for layout module.

Tests pure computation functions: layout dimensions, pagination,
month instance building, and geometric transformations.

Run with: python -m pytest test_layout.py -v
"""

import unittest
from primitives import Point, SCALE_FACTOR
from calendar_data import Month, Year, solar_year, islamic_year_canonical
from layout import (
    calculate_layout_params,
    get_pagination,
    date_rotation,
    offset_point_by,
    calculate_circle_rotation,
    build_solar_month_instances,
    build_islamic_month_instances,
)
import islamic_alignment


class TestCalculateLayoutParams(unittest.TestCase):
    """Test layout dimension calculations."""

    def test_default_uses_scale_factor_constant(self):
        """Default layout should use SCALE_FACTOR from primitives."""
        layout = calculate_layout_params()
        self.assertEqual(layout.scale_factor, SCALE_FACTOR)

    def test_radii_relationship(self):
        """Inner radius must be less than outer radius, both positive."""
        layout = calculate_layout_params(0.7)
        self.assertGreater(layout.outermost_radius, 0)
        self.assertGreater(layout.inner_radius, 0)
        self.assertGreater(layout.outermost_radius, layout.inner_radius)

    def test_month_thickness_is_difference_of_radii(self):
        """Month thickness should equal outer - inner radius."""
        layout = calculate_layout_params(0.7)
        self.assertAlmostEqual(
            layout.month_thickness,
            layout.outermost_radius - layout.inner_radius,
        )

    def test_date_box_height_proportional_to_thickness(self):
        """Date box height should be 20% of month thickness."""
        layout = calculate_layout_params(0.7)
        self.assertAlmostEqual(
            layout.date_box_height,
            layout.month_thickness * 0.2,
        )

    def test_larger_scale_produces_larger_radii(self):
        """Increasing scale factor should increase all radii."""
        small = calculate_layout_params(0.5)
        large = calculate_layout_params(1.0)
        self.assertGreater(large.outermost_radius, small.outermost_radius)
        self.assertGreater(large.inner_radius, small.inner_radius)

    def test_origin_y_accounts_for_radius_and_offset(self):
        """Origin y should be outermost_radius + vertical_offset."""
        layout = calculate_layout_params(0.7)
        expected_y = layout.outermost_radius + layout.vertical_offset
        self.assertAlmostEqual(layout.origin.y, expected_y)


class TestGetPagination(unittest.TestCase):
    """Test page layout determination."""

    def test_small_scale(self):
        """Scale <= 0.5 should use 5 rows, 2 columns."""
        rows, cols = get_pagination(0.3)
        self.assertEqual(rows, 5)
        self.assertEqual(cols, 2)

    def test_boundary_small_scale(self):
        """Scale exactly 0.5 should use 5 rows, 2 columns."""
        rows, cols = get_pagination(0.5)
        self.assertEqual(rows, 5)
        self.assertEqual(cols, 2)

    def test_medium_scale(self):
        """Scale between 0.5 and 0.75 should use 4 rows, 1 column."""
        rows, cols = get_pagination(0.6)
        self.assertEqual(rows, 4)
        self.assertEqual(cols, 1)

    def test_large_scale(self):
        """Scale >= 0.75 should use 2 rows, 1 column."""
        rows, cols = get_pagination(0.75)
        self.assertEqual(rows, 2)
        self.assertEqual(cols, 1)

    def test_default_scale(self):
        """Default scale factor 0.7 should use 4 rows, 1 column."""
        rows, cols = get_pagination(0.7)
        self.assertEqual(rows, 4)
        self.assertEqual(cols, 1)

    def test_layout_params_pagination_matches(self):
        """LayoutParams should embed the same pagination as get_pagination."""
        for sf in [0.3, 0.5, 0.6, 0.7, 0.75, 1.0]:
            layout = calculate_layout_params(sf)
            rows, cols = get_pagination(sf)
            self.assertEqual(layout.num_rows, rows, f"Mismatch at scale {sf}")
            self.assertEqual(layout.num_columns, cols, f"Mismatch at scale {sf}")


class TestDateRotation(unittest.TestCase):
    """Test date angle offset calculation."""

    def test_first_month_zero_offset(self):
        """Month number 1 should have zero rotation offset."""
        m = Month(1, "January", [31], "#fff")
        self.assertEqual(date_rotation(m), 0)

    def test_second_month(self):
        """Month number 2 should be offset by -30 degrees."""
        m = Month(2, "February", [29], "#fff")
        self.assertEqual(date_rotation(m), -30)

    def test_seventh_month(self):
        """Month number 7 should be offset by -180 degrees."""
        m = Month(7, "July", [31], "#fff")
        self.assertEqual(date_rotation(m), -180)

    def test_twelfth_month(self):
        """Month number 12 should be offset by -330 degrees."""
        m = Month(12, "December", [31], "#fff")
        self.assertEqual(date_rotation(m), -330)


class TestOffsetPointBy(unittest.TestCase):
    """Test point translation."""

    def test_positive_offset(self):
        p = offset_point_by(Point(10, 20), 5, 3)
        self.assertEqual(p.x, 15)
        self.assertEqual(p.y, 23)

    def test_negative_offset(self):
        p = offset_point_by(Point(10, 20), -5, -3)
        self.assertEqual(p.x, 5)
        self.assertEqual(p.y, 17)

    def test_zero_offset(self):
        p = offset_point_by(Point(10, 20), 0, 0)
        self.assertEqual(p, Point(10, 20))


class TestCalculateCircleRotation(unittest.TestCase):
    """Test rotation angle for circular layout placement."""

    def test_halfway_through_year(self):
        """Month centered at day 183 of 366 should be at ~180 degrees."""
        # days_elapsed such that days_elapsed + num_days/2 = 183
        rot = calculate_circle_rotation(168.0, 30, 366)
        self.assertAlmostEqual(rot, 360.0 * 183 / 366, places=5)

    def test_start_of_year(self):
        """First month centered around day 0 with 31 days → ~15.5/366 of circle."""
        rot = calculate_circle_rotation(0, 31, 366)
        expected = 360.0 * (0 + 31 / 2) / 366
        self.assertAlmostEqual(rot, expected, places=5)

    def test_full_year_sums_to_360(self):
        """Sum of month widths should cover 360 degrees for 366-day year."""
        days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        self.assertEqual(sum(days), 366)
        # Each month contributes 360 * num_days / 366 degrees
        total = sum(360.0 * d / 366 for d in days)
        self.assertAlmostEqual(total, 360.0, places=5)


class TestBuildSolarMonthInstances(unittest.TestCase):
    """Test solar month instance creation."""

    def test_count(self):
        """Should produce 12 MonthInstance objects (one per month)."""
        instances = build_solar_month_instances(solar_year, 2.0, 80.0, 100.0)
        self.assertEqual(len(instances), 12)

    def test_all_date_on_top_false(self):
        """Solar months are the outer ring; date_on_top should be False."""
        instances = build_solar_month_instances(solar_year, 2.0, 80.0, 100.0)
        for mi in instances:
            self.assertFalse(mi.date_on_top, f"{mi.name} should have date_on_top=False")

    def test_upside_down_months(self):
        """Months at index 3-8 (April through September) should be upside down."""
        instances = build_solar_month_instances(solar_year, 2.0, 80.0, 100.0)
        expected_upside_down = {"April", "May", "June", "July", "August", "September"}
        for mi in instances:
            if mi.name in expected_upside_down:
                self.assertTrue(mi.name_upside_down, f"{mi.name} should be upside down")
            else:
                self.assertFalse(mi.name_upside_down, f"{mi.name} should NOT be upside down")

    def test_radii_passed_through(self):
        """Inner and outer radius should match the provided values."""
        instances = build_solar_month_instances(solar_year, 2.0, 80.0, 100.0)
        for mi in instances:
            self.assertEqual(mi.inner_radius, 80.0)
            self.assertEqual(mi.outer_radius, 100.0)

    def test_total_days(self):
        """Total days across all instances should be 366 (leap year)."""
        instances = build_solar_month_instances(solar_year, 2.0, 80.0, 100.0)
        total = sum(mi.num_days for mi in instances)
        self.assertEqual(total, 366)

    def test_first_month_is_january(self):
        instances = build_solar_month_instances(solar_year, 2.0, 80.0, 100.0)
        self.assertEqual(instances[0].name, "January")
        self.assertEqual(instances[0].num_days, 31)

    def test_date_angle_offsets_are_distinct(self):
        """Each month should have a different date angle offset."""
        instances = build_solar_month_instances(solar_year, 2.0, 80.0, 100.0)
        offsets = [mi.date_angle_offset for mi in instances]
        self.assertEqual(len(set(offsets)), 12)


class TestBuildIslamicMonthInstances(unittest.TestCase):
    """Test Islamic month instance creation."""

    def test_count(self):
        """Should produce 12 instances (one per Islamic month)."""
        instances = build_islamic_month_instances(
            islamic_year_canonical, 2.0, 80.0, 100.0, 20.0, -19
        )
        self.assertEqual(len(instances), 12)

    def test_all_date_on_top_true(self):
        """Islamic months are the inner ring; date_on_top should be True."""
        instances = build_islamic_month_instances(
            islamic_year_canonical, 2.0, 80.0, 100.0, 20.0, -19
        )
        for mi in instances:
            self.assertTrue(mi.date_on_top, f"{mi.name} should have date_on_top=True")

    def test_inner_radius_offset_by_month_thickness(self):
        """Islamic inner_radius should be original inner_radius - month_thickness."""
        thickness = 20.0
        instances = build_islamic_month_instances(
            islamic_year_canonical, 2.0, 80.0, 100.0, thickness, 0
        )
        for mi in instances:
            self.assertEqual(mi.inner_radius, 80.0 - thickness)
            self.assertEqual(mi.outer_radius, 100.0 - thickness)

    def test_upside_down_based_on_month_number(self):
        """Months with number 4-9 should be upside down."""
        instances = build_islamic_month_instances(
            islamic_year_canonical, 2.0, 80.0, 100.0, 20.0, 0
        )
        for mi in instances:
            # The canonical month numbers are 1-12
            month_obj = [m for m in islamic_year_canonical.months if m.name == mi.name][0]
            if month_obj.number > 3 and month_obj.number <= 9:
                self.assertTrue(mi.name_upside_down, f"{mi.name} (#{month_obj.number}) should be upside down")
            else:
                self.assertFalse(mi.name_upside_down, f"{mi.name} (#{month_obj.number}) should NOT be upside down")

    def test_rotation_offset_applied(self):
        """Islamic date_angle_offset should include the rotation offset."""
        offset = -19
        instances_with_offset = build_islamic_month_instances(
            islamic_year_canonical, 2.0, 80.0, 100.0, 20.0, offset
        )
        instances_without_offset = build_islamic_month_instances(
            islamic_year_canonical, 2.0, 80.0, 100.0, 20.0, 0
        )
        for with_off, without_off in zip(instances_with_offset, instances_without_offset):
            self.assertAlmostEqual(
                with_off.date_angle_offset,
                without_off.date_angle_offset + offset,
            )

    def test_rotated_months_upside_down(self):
        """After rotation, upside_down should follow reassigned month numbers."""
        rotated_year = Year(
            months=islamic_alignment.rotate_months(
                islamic_year_canonical.months, 7  # Sha'ban first
            )
        )
        instances = build_islamic_month_instances(
            rotated_year, 2.0, 80.0, 100.0, 20.0, 0
        )
        # After rotation, month numbers are reassigned 1-12
        # Months 4-9 should be upside down
        for mi in instances:
            rotated_month = [m for m in rotated_year.months if m.name == mi.name][0]
            expected = rotated_month.number > 3 and rotated_month.number <= 9
            self.assertEqual(mi.name_upside_down, expected,
                           f"{mi.name} (rotated #{rotated_month.number}): "
                           f"expected upside_down={expected}")


if __name__ == "__main__":
    unittest.main()
