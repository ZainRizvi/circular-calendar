"""
Unit tests for islamic_alignment module.

Run with: python -m pytest test_islamic_alignment.py -v
"""

import unittest
from datetime import date

import islamic_alignment


class TestIslamicAlignment(unittest.TestCase):
    """Test alignment calculations."""

    def test_feb_5_2026_is_shaban(self):
        """Feb 5, 2026 should be in Sha'ban (month index 7)."""
        params = islamic_alignment.get_alignment_params(date(2026, 2, 5))
        # Sha'ban is the 8th month, so index 7
        self.assertEqual(params.current_month_index, 7)
        self.assertEqual(params.hijri_month, 8)

    def test_shaban_1_2026_days_elapsed(self):
        """Sha'ban 1, 1447 AH should be around Jan 20, 2026 (~19-20 days from Jan 1)."""
        params = islamic_alignment.get_alignment_params(date(2026, 1, 20))
        # days_elapsed should be close to 19 (Jan 20 is 19 days after Jan 1)
        self.assertGreaterEqual(params.days_elapsed, 17)
        self.assertLessEqual(params.days_elapsed, 22)

    def test_rotation_offset_is_negative_days_elapsed(self):
        """Rotation offset should be approximately negative of days_elapsed."""
        params = islamic_alignment.get_alignment_params(date(2026, 2, 5))
        # rotation_offset should be close to -days_elapsed
        self.assertAlmostEqual(
            params.rotation_offset, -round(params.days_elapsed - 0.5), delta=2
        )

    def test_month_index_range(self):
        """Month index should always be 0-11."""
        test_dates = [
            date(2026, 1, 1),
            date(2026, 6, 15),
            date(2026, 12, 31),
            date(2025, 3, 20),
        ]
        for d in test_dates:
            params = islamic_alignment.get_alignment_params(d)
            self.assertGreaterEqual(params.current_month_index, 0)
            self.assertLessEqual(params.current_month_index, 11)

    def test_days_elapsed_reasonable_range(self):
        """Days elapsed should be in a reasonable range (-30 to 365)."""
        test_dates = [
            date(2026, 1, 1),
            date(2026, 6, 15),
            date(2026, 12, 31),
        ]
        for d in test_dates:
            params = islamic_alignment.get_alignment_params(d)
            self.assertGreaterEqual(params.days_elapsed, -30)
            self.assertLessEqual(params.days_elapsed, 365)

    def test_hijri_date_input(self):
        """Test specifying input as Hijri date."""
        # Sha'ban 17, 1447 should give Sha'ban (index 7)
        params = islamic_alignment.get_alignment_params(
            hijri_year=1447, hijri_month=8, hijri_day=17
        )
        self.assertEqual(params.current_month_index, 7)
        self.assertEqual(params.hijri_month, 8)
        self.assertEqual(params.hijri_year, 1447)

    def test_ramadan_detection(self):
        """Test that Ramadan is correctly detected."""
        # Ramadan 1447 should start around Feb 19, 2026
        params = islamic_alignment.get_alignment_params(date(2026, 2, 25))
        # This should be in Ramadan (month 9, index 8)
        self.assertEqual(params.current_month_index, 8)
        self.assertEqual(params.hijri_month, 9)


class TestRotateMonths(unittest.TestCase):
    """Test month rotation logic."""

    def test_rotate_by_zero(self):
        """Rotating by 0 should keep Muharram first."""
        from calendar_data import Month

        months = [
            Month(i + 1, f"Month{i}", [30], "#fff")
            for i in range(12)
        ]
        rotated = islamic_alignment.rotate_months(months, 0)
        self.assertEqual(rotated[0].name, "Month0")
        self.assertEqual(rotated[0].number, 1)

    def test_rotate_to_shaban(self):
        """Rotating to Sha'ban (index 7) should put it first."""
        from calendar_data import Month

        names = islamic_alignment.ISLAMIC_MONTHS
        months = [
            Month(i + 1, names[i], [30], "#fff")
            for i in range(12)
        ]
        rotated = islamic_alignment.rotate_months(months, 7)  # Sha'ban index
        self.assertEqual(rotated[0].name, "Sha'baan")
        self.assertEqual(rotated[0].number, 1)
        self.assertEqual(rotated[1].name, "Ramadan")
        self.assertEqual(rotated[1].number, 2)

    def test_numbers_reassigned_correctly(self):
        """After rotation, numbers should be 1-12 in order."""
        from calendar_data import Month

        months = [
            Month(i + 1, f"Month{i}", [30], "#fff")
            for i in range(12)
        ]
        rotated = islamic_alignment.rotate_months(months, 5)
        for i, month in enumerate(rotated):
            self.assertEqual(month.number, i + 1)


class TestHeuristicVsLibrary(unittest.TestCase):
    """Test that heuristic fallback is within acceptable tolerance."""

    def test_heuristic_accuracy(self):
        """Heuristic should be within ±5 days of library result."""
        test_dates = [
            date(2026, 2, 5),
            date(2026, 6, 15),
            date(2026, 10, 1),
        ]
        for d in test_dates:
            library_result = islamic_alignment._get_alignment_with_library(d)
            heuristic_result = islamic_alignment._get_alignment_heuristic(d)

            # Month should match or be off by at most 1 (edge case near month boundaries)
            month_diff = abs(library_result.current_month_index - heuristic_result.current_month_index)
            self.assertLessEqual(month_diff, 1, f"Month mismatch for {d}")

            # Days elapsed should be within ±5 days
            days_diff = abs(library_result.days_elapsed - heuristic_result.days_elapsed)
            self.assertLessEqual(days_diff, 5, f"Days elapsed diff too large for {d}: {days_diff}")


class TestGetMonthName(unittest.TestCase):
    """Test month name lookup."""

    def test_month_names(self):
        """Test all month names are correct."""
        self.assertEqual(islamic_alignment.get_month_name(0), "Muharram")
        self.assertEqual(islamic_alignment.get_month_name(7), "Sha'baan")
        self.assertEqual(islamic_alignment.get_month_name(8), "Ramadan")
        self.assertEqual(islamic_alignment.get_month_name(11), "Dhu al-Hijja")


if __name__ == "__main__":
    unittest.main()
