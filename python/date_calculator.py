#!/usr/bin/env python
# coding: utf-8

"""
Module for calculating automatic calendar rotation based on current dates.

This module provides functions to calculate the proper positioning and rotation
of both solar and Islamic calendar months based on the current date.
"""

from datetime import datetime
from hijri_converter import Hijri, Gregorian
from typing import Tuple, NamedTuple


class CalendarAlignment(NamedTuple):
    """Contains all the calculated values needed to align the calendars."""
    islamic_date_rotation_offset: float  # Offset for Islamic calendar rotation in degrees
    days_elapsed_islamic: float  # Days elapsed in the Islamic year for circle positioning
    num_months_to_skip: int  # Number of months to skip in the Islamic calendar list
    current_solar_date: str  # Current Gregorian date for reference
    current_islamic_date: str  # Current Hijri date for reference


def get_current_alignment() -> CalendarAlignment:
    """
    Calculate calendar alignment based on current date.

    Returns:
        CalendarAlignment with all necessary values for positioning the calendars
    """
    # Get current Gregorian date
    today = datetime.now()
    gregorian = Gregorian(today.year, today.month, today.day)

    # Convert to Hijri date
    hijri = gregorian.to_hijri()

    # Calculate days elapsed in the solar year (from January 1)
    day_of_year = today.timetuple().tm_yday

    # The current Islamic month (1-12)
    current_islamic_month = hijri.month
    current_islamic_day = hijri.day

    # For the circular view: center the current Islamic month at the current solar day
    # circle_form_factor rotates by: 360 * (days_elapsed + month.num_days/2) / days_in_year
    # We want the center at day_of_year, so: days_elapsed = day_of_year - 15
    days_elapsed_islamic = day_of_year - 15

    # For individual month arcs: rotate date numbers based on current day alignment
    islamic_date_rotation_offset = day_of_year - current_islamic_day

    # Format dates for reference
    current_solar_date = today.strftime("%Y-%m-%d")
    current_islamic_date = f"{hijri.year}-{hijri.month:02d}-{hijri.day:02d}"

    print(f"Current Solar Date: {current_solar_date} (day {day_of_year} of year)")
    print(f"Current Islamic Date: {current_islamic_date} (month {current_islamic_month}, day {current_islamic_day})")
    print(f"Days elapsed (Islamic): {days_elapsed_islamic:.1f}")
    print(f"  → This centers the current Islamic month at day {day_of_year}")
    print(f"Islamic date rotation offset: {islamic_date_rotation_offset:.1f} days")

    return CalendarAlignment(
        islamic_date_rotation_offset=islamic_date_rotation_offset,
        days_elapsed_islamic=days_elapsed_islamic,
        num_months_to_skip=current_islamic_month,  # Which Islamic month (1-12) to start with
        current_solar_date=current_solar_date,
        current_islamic_date=current_islamic_date
    )


def get_manual_alignment(
    gregorian_year: int,
    gregorian_month: int,
    gregorian_day: int
) -> CalendarAlignment:
    """
    Calculate calendar alignment for a specific date.

    Args:
        gregorian_year: Year in Gregorian calendar
        gregorian_month: Month in Gregorian calendar (1-12)
        gregorian_day: Day in Gregorian calendar

    Returns:
        CalendarAlignment with all necessary values for positioning the calendars
    """
    target_date = datetime(gregorian_year, gregorian_month, gregorian_day)
    gregorian = Gregorian(gregorian_year, gregorian_month, gregorian_day)
    hijri = gregorian.to_hijri()

    day_of_year = target_date.timetuple().tm_yday
    current_islamic_month = hijri.month
    current_islamic_day = hijri.day

    days_elapsed_islamic = day_of_year - 15
    islamic_date_rotation_offset = day_of_year - current_islamic_day

    current_solar_date = target_date.strftime("%Y-%m-%d")
    current_islamic_date = f"{hijri.year}-{hijri.month:02d}-{hijri.day:02d}"

    print(f"Target Solar Date: {current_solar_date} (day {day_of_year} of year)")
    print(f"Target Islamic Date: {current_islamic_date} (month {current_islamic_month}, day {current_islamic_day})")
    print(f"Days elapsed (Islamic): {days_elapsed_islamic:.1f}")
    print(f"  → This centers the current Islamic month at day {day_of_year}")
    print(f"Islamic date rotation offset: {islamic_date_rotation_offset:.1f} days")

    return CalendarAlignment(
        islamic_date_rotation_offset=islamic_date_rotation_offset,
        days_elapsed_islamic=days_elapsed_islamic,
        num_months_to_skip=current_islamic_month,
        current_solar_date=current_solar_date,
        current_islamic_date=current_islamic_date
    )


if __name__ == "__main__":
    # Test the function
    print("=== Current Date Alignment ===")
    alignment = get_current_alignment()
    print(f"\nCalculated alignment:")
    print(f"  Islamic rotation offset: {alignment.islamic_date_rotation_offset:.1f} days")
    print(f"  Days elapsed (Islamic): {alignment.days_elapsed_islamic:.1f}")
    print(f"  Months to skip: {alignment.num_months_to_skip}")
    print(f"  Solar date: {alignment.current_solar_date}")
    print(f"  Islamic date: {alignment.current_islamic_date}")
