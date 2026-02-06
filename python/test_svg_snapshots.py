"""
Snapshot tests for SVG generation.

These tests ensure that SVG output remains consistent across code changes.
If SVG output intentionally changes, regenerate snapshots with:
    python test_svg_snapshots.py --update

Reference files are stored in test_snapshots/ directory.
"""

import os
import sys
from datetime import date
from pathlib import Path

import pytest

from svg_generator import (
    generate_month_strip_svg,
    generate_circular_calendar_svg,
    generate_single_month_svg,
)
from layout import calculate_layout_params


SNAPSHOT_DIR = Path(__file__).parent / "test_snapshots"

# Fixed date for reproducible tests
REFERENCE_DATE = date(2026, 2, 5)


def normalize_svg(svg: str) -> str:
    """Normalize SVG for comparison (handle minor whitespace differences)."""
    # Remove trailing whitespace from lines and normalize line endings
    lines = [line.rstrip() for line in svg.strip().split('\n')]
    return '\n'.join(lines)


def load_snapshot(name: str) -> str:
    """Load a reference snapshot file."""
    path = SNAPSHOT_DIR / f"{name}.svg"
    if not path.exists():
        raise FileNotFoundError(
            f"Snapshot {path} not found. Run with --update to create it."
        )
    return normalize_svg(path.read_text())


def save_snapshot(name: str, content: str):
    """Save a reference snapshot file."""
    SNAPSHOT_DIR.mkdir(exist_ok=True)
    path = SNAPSHOT_DIR / f"{name}.svg"
    path.write_text(content)
    print(f"Saved snapshot: {path}")


class TestSingleMonthSnapshots:
    """Test individual month SVG generation."""

    def test_january_31_days(self):
        """January with 31 days should match snapshot."""
        layout = calculate_layout_params()
        svg = generate_single_month_svg(
            month_name="January",
            num_days=31,
            color="#aebbff",
            inner_radius=layout.inner_radius,
            outer_radius=layout.outermost_radius,
            date_box_height=layout.date_box_height,
            name_upside_down=False,
            date_on_top=False,
            date_angle_offset=0,
        )
        assert normalize_svg(svg) == load_snapshot("month_january_31")

    def test_june_upside_down(self):
        """June (upside down month) should match snapshot."""
        layout = calculate_layout_params()
        svg = generate_single_month_svg(
            month_name="June",
            num_days=30,
            color="#aebbff",
            inner_radius=layout.inner_radius,
            outer_radius=layout.outermost_radius,
            date_box_height=layout.date_box_height,
            name_upside_down=True,
            date_on_top=False,
            date_angle_offset=-150,
        )
        assert normalize_svg(svg) == load_snapshot("month_june_upside_down")

    def test_islamic_month_date_on_top(self):
        """Islamic month with date_on_top=True should match snapshot."""
        layout = calculate_layout_params()
        svg = generate_single_month_svg(
            month_name="Ramadan",
            num_days=30,
            color="#9ce3ff",
            inner_radius=layout.inner_radius - layout.month_thickness,
            outer_radius=layout.outermost_radius - layout.month_thickness,
            date_box_height=layout.date_box_height,
            name_upside_down=False,
            date_on_top=True,
            date_angle_offset=-30,
        )
        assert normalize_svg(svg) == load_snapshot("month_ramadan_date_on_top")


class TestMonthStripSnapshots:
    """Test month strip (combined solar + Islamic) SVG generation."""

    def test_first_month_strip(self):
        """First month strip (Jan + current Islamic) should match snapshot."""
        svg = generate_month_strip_svg(
            month_index=0,
            gregorian_date=REFERENCE_DATE,
        )
        assert normalize_svg(svg) == load_snapshot("strip_month_0")

    def test_sixth_month_strip(self):
        """Sixth month strip should match snapshot."""
        svg = generate_month_strip_svg(
            month_index=5,
            gregorian_date=REFERENCE_DATE,
        )
        assert normalize_svg(svg) == load_snapshot("strip_month_5")


class TestCircularCalendarSnapshots:
    """Test full circular calendar SVG generation."""

    def test_full_circular_calendar(self):
        """Full circular calendar should match snapshot."""
        svg = generate_circular_calendar_svg(
            gregorian_date=REFERENCE_DATE,
        )
        assert normalize_svg(svg) == load_snapshot("circular_calendar_full")


def update_all_snapshots():
    """Regenerate all snapshot reference files."""
    layout = calculate_layout_params()

    # Single month snapshots
    save_snapshot("month_january_31", generate_single_month_svg(
        month_name="January",
        num_days=31,
        color="#aebbff",
        inner_radius=layout.inner_radius,
        outer_radius=layout.outermost_radius,
        date_box_height=layout.date_box_height,
        name_upside_down=False,
        date_on_top=False,
        date_angle_offset=0,
    ))

    save_snapshot("month_june_upside_down", generate_single_month_svg(
        month_name="June",
        num_days=30,
        color="#aebbff",
        inner_radius=layout.inner_radius,
        outer_radius=layout.outermost_radius,
        date_box_height=layout.date_box_height,
        name_upside_down=True,
        date_on_top=False,
        date_angle_offset=-150,
    ))

    save_snapshot("month_ramadan_date_on_top", generate_single_month_svg(
        month_name="Ramadan",
        num_days=30,
        color="#9ce3ff",
        inner_radius=layout.inner_radius - layout.month_thickness,
        outer_radius=layout.outermost_radius - layout.month_thickness,
        date_box_height=layout.date_box_height,
        name_upside_down=False,
        date_on_top=True,
        date_angle_offset=-30,
    ))

    # Month strip snapshots
    save_snapshot("strip_month_0", generate_month_strip_svg(
        month_index=0,
        gregorian_date=REFERENCE_DATE,
    ))

    save_snapshot("strip_month_5", generate_month_strip_svg(
        month_index=5,
        gregorian_date=REFERENCE_DATE,
    ))

    # Full circular calendar
    save_snapshot("circular_calendar_full", generate_circular_calendar_svg(
        gregorian_date=REFERENCE_DATE,
    ))

    print(f"\nAll snapshots updated in {SNAPSHOT_DIR}")


if __name__ == "__main__":
    if "--update" in sys.argv:
        update_all_snapshots()
    else:
        print("Run with --update to regenerate snapshots")
        print("Run with pytest to test against existing snapshots")
