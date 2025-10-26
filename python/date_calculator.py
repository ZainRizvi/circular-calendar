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

    # Calculate which Islamic month should be at the top
    # The calendar data starts with Jumada al-Awwal (month 5 of Islamic year)
    # and lists months in order: Jumada I, Jumada II, Rajab, Sha'ban, Ramadan,
    # Shawwal, Dhu al-Qa'dah, Dhu al-Hijjah, Muharram, Safar, Rabi I, Rabi II

    # Map Islamic month numbers (1-12) to their position in the calendar_data.py list (0-11)
    islamic_month_to_list_index = {
        5: 0,   # Jumada al-Awwal -> index 0
        6: 1,   # Jumada ath-Thani -> index 1
        7: 2,   # Rajab -> index 2
        8: 3,   # Sha'ban -> index 3
        9: 4,   # Ramadan -> index 4
        10: 5,  # Shawwal -> index 5
        11: 6,  # Dhu al-Qa'dah -> index 6
        12: 7,  # Dhu al-Hijjah -> index 7
        1: 8,   # Muharram -> index 8
        2: 9,   # Safar -> index 9
        3: 10,  # Rabi al-Awwal -> index 10
        4: 11,  # Rabi ath-Thani -> index 11
    }

    current_islamic_month = hijri.month
    current_islamic_day = hijri.day

    # Find which month should be at the top (index 0 position after rotation)
    num_months_to_skip = islamic_month_to_list_index[current_islamic_month]

    # Calculate days elapsed for the "circle form" - positioning in the summary page
    # The circle_form_factor rotates based on the CENTER of each month, not individual days
    # So we need to position the month such that the current day VISUALLY aligns with the current solar day
    #
    # We want the center of Jumada al-Awwal (day 15 of 30) to be positioned such that
    # day 4 of the month aligns with day 299 of the solar year.
    #
    # If day 4 should be at position 299, and day 4 is 11 days before the center (day 15),
    # then the center should be at position 299 + (15 - current_islamic_day)
    #
    # Therefore: center_position = day_of_year + (15 - current_islamic_day)
    # And: days_elapsed = center_position - 15
    #     days_elapsed = day_of_year + (15 - current_islamic_day) - 15
    #     days_elapsed = day_of_year - current_islamic_day
    #
    # Wait, that's the same formula! But we need to think about the visual centering...
    #
    # Actually, the issue is that circle_form_factor uses: (days_elapsed + month.num_days/2)
    # So: center_position = days_elapsed + 15
    # We want the center at: day_of_year (to align visually with current solar position)
    # Therefore: days_elapsed = day_of_year - 15
    days_elapsed_islamic = day_of_year - 15  # Center the current month at the current day

    # Calculate the rotation offset for the individual month arc drawings
    # Since we're centering the month at the current day, we need to offset the dates
    # to account for which day of the month we're on
    islamic_date_rotation_offset = day_of_year - current_islamic_day

    # Format dates for reference
    current_solar_date = today.strftime("%Y-%m-%d")
    current_islamic_date = f"{hijri.year}-{hijri.month:02d}-{hijri.day:02d}"

    print(f"Current Solar Date: {current_solar_date} (day {day_of_year} of year)")
    print(f"Current Islamic Date: {current_islamic_date} (day {current_islamic_day} of month)")
    print(f"Islamic month in list: {num_months_to_skip}")
    print(f"Days elapsed (Islamic): {days_elapsed_islamic:.1f}")
    print(f"  → This positions day {current_islamic_day} of Islamic month at day {day_of_year} of solar year")
    print(f"Islamic date rotation offset: {islamic_date_rotation_offset:.1f} days")

    return CalendarAlignment(
        islamic_date_rotation_offset=islamic_date_rotation_offset,
        days_elapsed_islamic=days_elapsed_islamic,
        num_months_to_skip=num_months_to_skip,
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
    # Create a datetime object for the specified date
    target_date = datetime(gregorian_year, gregorian_month, gregorian_day)

    # Temporarily replace datetime.now() with our target date
    # We'll use the same logic as get_current_alignment()
    gregorian = Gregorian(gregorian_year, gregorian_month, gregorian_day)
    hijri = gregorian.to_hijri()

    day_of_year = target_date.timetuple().tm_yday

    islamic_month_to_list_index = {
        5: 0, 6: 1, 7: 2, 8: 3, 9: 4, 10: 5,
        11: 6, 12: 7, 1: 8, 2: 9, 3: 10, 4: 11,
    }

    current_islamic_month = hijri.month
    current_islamic_day = hijri.day
    num_months_to_skip = islamic_month_to_list_index[current_islamic_month]

    # Use same calculation as get_current_alignment
    days_elapsed_islamic = day_of_year - 15  # Center the current month at the current day
    islamic_date_rotation_offset = day_of_year - current_islamic_day

    current_solar_date = target_date.strftime("%Y-%m-%d")
    current_islamic_date = f"{hijri.year}-{hijri.month:02d}-{hijri.day:02d}"

    print(f"Target Solar Date: {current_solar_date} (day {day_of_year} of year)")
    print(f"Target Islamic Date: {current_islamic_date} (day {current_islamic_day} of month)")
    print(f"Islamic month in list: {num_months_to_skip}")
    print(f"Days elapsed (Islamic): {days_elapsed_islamic:.1f}")
    print(f"  → This positions day {current_islamic_day} of Islamic month at day {day_of_year} of solar year")
    print(f"Islamic date rotation offset: {islamic_date_rotation_offset:.1f} days")

    return CalendarAlignment(
        islamic_date_rotation_offset=islamic_date_rotation_offset,
        days_elapsed_islamic=days_elapsed_islamic,
        num_months_to_skip=num_months_to_skip,
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
