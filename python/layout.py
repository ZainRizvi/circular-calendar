"""
Layout calculation module for circular calendar.

Pure computation functions extracted from make_cal.py for testability.
Handles layout dimensions, month instance creation, pagination, and
geometric transformations - all without side effects.
"""

from typing import List, NamedTuple, Tuple

from primitives import Point, SCALE_FACTOR
from arc_drawing import inchToMilimeter
from calendar_data import MonthInstance, Month, Year


class LayoutParams(NamedTuple):
    """Computed layout dimensions for the calendar."""
    scale_factor: float
    canvas_width: float
    width: float
    outermost_radius: float
    inner_radius: float
    month_thickness: float
    date_box_height: float
    width_center: float
    vertical_offset: float
    origin: Point
    month_offset: float
    num_rows: int
    num_columns: int


def calculate_layout_params(scale_factor: float = SCALE_FACTOR) -> LayoutParams:
    """Calculate all layout dimensions from scale factor."""
    canvas_width = 11 * scale_factor
    width = inchToMilimeter(8 * scale_factor)
    outermost_radius = width / (2 * 3.14 / 12)
    inner_radius = outermost_radius * 9.2 / 10
    month_thickness = outermost_radius - inner_radius
    date_box_height = month_thickness * 0.2

    extra_width_offset = 10
    width_center = inchToMilimeter(canvas_width) / 2 + extra_width_offset
    vertical_offset = 30 * scale_factor

    origin = Point(width_center, outermost_radius + vertical_offset)
    month_offset = 4 * scale_factor

    num_rows, num_columns = get_pagination(scale_factor)

    return LayoutParams(
        scale_factor=scale_factor,
        canvas_width=canvas_width,
        width=width,
        outermost_radius=outermost_radius,
        inner_radius=inner_radius,
        month_thickness=month_thickness,
        date_box_height=date_box_height,
        width_center=width_center,
        vertical_offset=vertical_offset,
        origin=origin,
        month_offset=month_offset,
        num_rows=num_rows,
        num_columns=num_columns,
    )


def get_pagination(scale_factor: float) -> Tuple[int, int]:
    """Return (num_rows, num_columns) based on scale factor."""
    if scale_factor <= 0.5:
        return 5, 2
    elif scale_factor < 0.75:
        return 4, 1
    else:
        return 2, 1


def date_rotation(month: Month) -> int:
    """Calculate the date angle offset for a month based on its position number."""
    return -1 * (month.number - 1) * (360 / 12)


def offset_point_by(point: Point, x_offset: float, y_offset: float) -> Point:
    """Translate a point by the given offsets."""
    return Point(point.x + x_offset, point.y + y_offset)


def calculate_circle_rotation(days_elapsed: float, num_days: int, days_in_year: int) -> float:
    """Calculate rotation angle for placing a month on the circular calendar."""
    return 360.0 * (days_elapsed + num_days / 2) / days_in_year


def build_solar_month_instances(
    solar_year: Year,
    date_box_height: float,
    inner_radius: float,
    outermost_radius: float,
) -> List[MonthInstance]:
    """Build MonthInstance list for solar (Gregorian) calendar months."""
    solar_months = []
    for index, month in enumerate(solar_year.months):
        name_upside_down = (index >= 3 and index < 9)
        for day in month.num_days:
            solar_months.append(
                MonthInstance(
                    name=month.name,
                    num_days=day,
                    color=month.color,
                    name_upside_down=name_upside_down,
                    date_on_top=False,
                    date_box_height=date_box_height,
                    inner_radius=inner_radius,
                    outer_radius=outermost_radius,
                    date_angle_offset=date_rotation(month),
                )
            )
    return solar_months


def build_islamic_month_instances(
    islamic_year: Year,
    date_box_height: float,
    inner_radius: float,
    outermost_radius: float,
    month_thickness: float,
    islamic_date_rotation_offset: float,
) -> List[MonthInstance]:
    """Build MonthInstance list for Islamic (Hijri) calendar months."""
    islamic_months = []
    for month in islamic_year.months:
        name_upside_down = (month.number > 3 and month.number <= 9)
        for day in month.num_days:
            islamic_months.append(
                MonthInstance(
                    name=month.name,
                    num_days=day,
                    color=month.color,
                    name_upside_down=name_upside_down,
                    date_on_top=True,
                    date_box_height=date_box_height,
                    inner_radius=inner_radius - month_thickness,
                    outer_radius=outermost_radius - month_thickness,
                    date_angle_offset=date_rotation(month) + islamic_date_rotation_offset,
                )
            )
    return islamic_months
