"""
SVG generation module for circular calendar.

Provides deterministic SVG generation functions that can be tested
for output stability. All functions are pure and produce the same
output given the same inputs.
"""

from typing import List, Tuple
from datetime import date

from primitives import Point
from arc_drawing import getVerticalPageCanvas, drawMonthParts, groupWithMonthParts
from calendar_data import solar_year, islamic_year_canonical, Year
from calendar_drawings import getMonth
from layout import (
    calculate_layout_params,
    build_solar_month_instances,
    build_islamic_month_instances,
    calculate_circle_rotation,
)
import islamic_alignment


def generate_month_strip_svg(
    month_index: int,
    gregorian_date: date,
    days_in_year: int = 366,
) -> str:
    """
    Generate SVG for a single month strip (both solar and Islamic).

    Args:
        month_index: Index of the month (0-11)
        gregorian_date: Date used to calculate Islamic calendar alignment
        days_in_year: Number of days in the year (365 or 366)

    Returns:
        SVG content as a string
    """
    # Get alignment for the given date
    alignment = islamic_alignment.get_alignment_params(gregorian_date=gregorian_date)

    # Rotate Islamic months to start with current month
    islamic_year = Year(
        months=islamic_alignment.rotate_months(
            islamic_year_canonical.months, alignment.current_month_index
        )
    )

    # Calculate layout
    layout = calculate_layout_params()

    # Build month instances
    solar_months = build_solar_month_instances(
        solar_year, layout.date_box_height, layout.inner_radius, layout.outermost_radius
    )

    islamic_months = build_islamic_month_instances(
        islamic_year, layout.date_box_height, layout.inner_radius,
        layout.outermost_radius, layout.month_thickness, alignment.rotation_offset
    )

    # Create SVG
    dwg = getVerticalPageCanvas()
    origin = layout.origin

    if month_index < len(solar_months):
        drawMonthParts(dwg, getMonth(solar_months[month_index], days_in_year, origin))

    if month_index < len(islamic_months):
        # Offset for Islamic month below solar
        islamic_origin = Point(origin.x, origin.y + layout.month_offset)
        drawMonthParts(dwg, getMonth(islamic_months[month_index], days_in_year, islamic_origin))

    return dwg.tostring()


def generate_circular_calendar_svg(
    gregorian_date: date,
    days_in_year: int = 366,
) -> str:
    """
    Generate SVG for the full circular calendar (cover page).

    Args:
        gregorian_date: Date used to calculate Islamic calendar alignment
        days_in_year: Number of days in the year (365 or 366)

    Returns:
        SVG content as a string
    """
    # Get alignment for the given date
    alignment = islamic_alignment.get_alignment_params(gregorian_date=gregorian_date)

    # Rotate Islamic months to start with current month
    islamic_year = Year(
        months=islamic_alignment.rotate_months(
            islamic_year_canonical.months, alignment.current_month_index
        )
    )

    # Calculate layout
    layout = calculate_layout_params()

    # Build month instances
    solar_months = build_solar_month_instances(
        solar_year, layout.date_box_height, layout.inner_radius, layout.outermost_radius
    )

    islamic_months = build_islamic_month_instances(
        islamic_year, layout.date_box_height, layout.inner_radius,
        layout.outermost_radius, layout.month_thickness, alignment.rotation_offset
    )

    days_elapsed_islamic_base = alignment.days_elapsed

    # Circle form factor transformation
    def circle_form_factor(g, month, days_elapsed, days_in_year, origin, origin_first):
        g.translate(75, 50)
        g.scale(0.3)
        rot = calculate_circle_rotation(days_elapsed, month.num_days, days_in_year)
        g.rotate(rot, center=origin)
        g.translate(0, origin_first.y - origin.y)

    # Create SVG
    dwg = getVerticalPageCanvas()
    origin_first = Point(layout.width_center, layout.outermost_radius + layout.vertical_offset)

    days_elapsed = 0 - solar_months[0].num_days / 2
    days_elapsed_islamic = days_elapsed_islamic_base - islamic_months[0].num_days / 2

    # Draw all months in circular arrangement
    for month_idx in range(len(solar_months)):
        origin = Point(origin_first.x, origin_first.y)

        # Solar month
        month = solar_months[month_idx]
        g = groupWithMonthParts(getMonth(month, days_in_year, origin))
        circle_form_factor(g, month, days_elapsed, days_in_year, origin, origin_first)
        days_elapsed += month.num_days
        dwg.add(g)

        # Islamic month
        if month_idx < len(islamic_months):
            month = islamic_months[month_idx]
            g = groupWithMonthParts(getMonth(month, days_in_year, origin))
            circle_form_factor(g, month, days_elapsed_islamic, days_in_year, origin, origin_first)
            days_elapsed_islamic += month.num_days
            dwg.add(g)

    return dwg.tostring()


def generate_single_month_svg(
    month_name: str,
    num_days: int,
    color: str,
    inner_radius: float,
    outer_radius: float,
    date_box_height: float,
    name_upside_down: bool = False,
    date_on_top: bool = False,
    date_angle_offset: float = 0,
    days_in_year: int = 366,
) -> str:
    """
    Generate SVG for a single month arc with full control over parameters.

    Useful for testing individual month rendering in isolation.
    """
    from calendar_data import MonthInstance

    month = MonthInstance(
        name=month_name,
        num_days=num_days,
        color=color,
        name_upside_down=name_upside_down,
        date_on_top=date_on_top,
        date_box_height=date_box_height,
        inner_radius=inner_radius,
        outer_radius=outer_radius,
        date_angle_offset=date_angle_offset,
    )

    layout = calculate_layout_params()
    dwg = getVerticalPageCanvas()

    drawMonthParts(dwg, getMonth(month, days_in_year, layout.origin))

    return dwg.tostring()
