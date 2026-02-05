"""
Islamic Calendar Alignment Module

Calculates alignment parameters for overlaying the Islamic (Hijri) calendar
on the Gregorian calendar, automatically determining the current Islamic month
and its position relative to January 1.
"""

from datetime import date, timedelta
from typing import NamedTuple, Optional

# Canonical Islamic month names (1-indexed, Muharram is month 1)
ISLAMIC_MONTHS = [
    "Muharram",
    "Safar",
    "Rabi al-Awwal",
    "Rabi ath-Thani",
    "Jumada al-Awwal",
    "Jumada ath-Thani",
    "Rajab",
    "Sha'baan",
    "Ramadan",
    "Shawwal",
    "Dhu al-Qa'dah",
    "Dhu al-Hijja",
]


class AlignmentParams(NamedTuple):
    """Parameters needed to align the Islamic calendar."""
    current_month_index: int  # 0-based index of current Islamic month (0=Muharram)
    days_elapsed: float  # Days from Jan 1 to start of current Islamic month
    rotation_offset: int  # Rotation offset for date numbers (approx -days_elapsed)
    gregorian_date: date  # The Gregorian date used for calculation
    hijri_month: int  # 1-based Hijri month number
    hijri_year: int  # Hijri year


def get_alignment_params(
    gregorian_date: Optional[date] = None,
    hijri_year: Optional[int] = None,
    hijri_month: Optional[int] = None,
    hijri_day: Optional[int] = None,
) -> AlignmentParams:
    """
    Calculate alignment parameters for the Islamic calendar.

    Args:
        gregorian_date: Gregorian date to align to (defaults to today)
        hijri_year: If specified with hijri_month/day, use this Hijri date instead
        hijri_month: Hijri month (1-12)
        hijri_day: Hijri day

    Returns:
        AlignmentParams with all values needed for calendar generation
    """
    try:
        return _get_alignment_with_library(gregorian_date, hijri_year, hijri_month, hijri_day)
    except ImportError:
        print("Warning: hijridate library not available, using heuristic fallback")
        return _get_alignment_heuristic(gregorian_date)


def _get_alignment_with_library(
    gregorian_date: Optional[date] = None,
    hijri_year: Optional[int] = None,
    hijri_month: Optional[int] = None,
    hijri_day: Optional[int] = None,
) -> AlignmentParams:
    """Calculate alignment using the hijridate library."""
    from hijridate import Hijri, Gregorian

    # Determine the target date
    if hijri_year is not None and hijri_month is not None and hijri_day is not None:
        # Convert specified Hijri date to Gregorian
        hijri = Hijri(hijri_year, hijri_month, hijri_day)
        greg = hijri.to_gregorian()
        gregorian_date = date(greg.year, greg.month, greg.day)
        current_hijri = hijri
    else:
        if gregorian_date is None:
            gregorian_date = date.today()
        # Convert Gregorian to Hijri
        greg = Gregorian(gregorian_date.year, gregorian_date.month, gregorian_date.day)
        current_hijri = greg.to_hijri()

    # Get the first day of the current Hijri month
    first_of_month = Hijri(current_hijri.year, current_hijri.month, 1)
    first_of_month_greg = first_of_month.to_gregorian()
    first_of_month_date = date(first_of_month_greg.year, first_of_month_greg.month, first_of_month_greg.day)

    # Calculate days from Jan 1 of the Gregorian year to start of Islamic month
    jan_1 = date(gregorian_date.year, 1, 1)
    days_elapsed = (first_of_month_date - jan_1).days

    # If the Islamic month started in the previous year, adjust
    # (days_elapsed will be negative, which is fine)

    # Current month index (0-based, Muharram = 0)
    current_month_index = current_hijri.month - 1

    # Rotation offset is approximately negative of days_elapsed
    rotation_offset = -round(days_elapsed)

    return AlignmentParams(
        current_month_index=current_month_index,
        days_elapsed=days_elapsed + 0.5,  # Add 0.5 for visual centering
        rotation_offset=rotation_offset,
        gregorian_date=gregorian_date,
        hijri_month=current_hijri.month,
        hijri_year=current_hijri.year,
    )


def _get_alignment_heuristic(gregorian_date: Optional[date] = None) -> AlignmentParams:
    """
    Fallback heuristic when hijridate library is unavailable.

    Uses a known reference point and lunar month arithmetic.
    Reference: Sha'ban 1, 1447 AH = January 20, 2026
    """
    if gregorian_date is None:
        gregorian_date = date.today()

    # Reference point: Sha'ban 1, 1447 AH = January 20, 2026
    reference_date = date(2026, 1, 20)
    reference_hijri_year = 1447
    reference_hijri_month = 8  # Sha'ban

    # Average lunar month length
    LUNAR_MONTH_DAYS = 29.530588853

    # Days since reference
    days_diff = (gregorian_date - reference_date).days

    # Calculate months elapsed (can be negative for dates before reference)
    months_elapsed = days_diff / LUNAR_MONTH_DAYS

    # Current month offset from Sha'ban
    month_offset = int(months_elapsed)
    if months_elapsed < 0:
        month_offset = int(months_elapsed) - 1 if months_elapsed != int(months_elapsed) else int(months_elapsed)

    # Calculate current Hijri month (1-12)
    current_hijri_month = ((reference_hijri_month - 1 + month_offset) % 12) + 1

    # Calculate Hijri year
    total_months_from_muharram_ref = (reference_hijri_month - 1) + month_offset
    year_offset = total_months_from_muharram_ref // 12
    current_hijri_year = reference_hijri_year + year_offset

    # Estimate first day of current Islamic month
    months_since_ref_start = month_offset
    days_since_ref_start = months_since_ref_start * LUNAR_MONTH_DAYS
    first_of_current_month = reference_date + timedelta(days=days_since_ref_start)

    # Days from Jan 1
    jan_1 = date(gregorian_date.year, 1, 1)
    days_elapsed = (first_of_current_month - jan_1).days

    current_month_index = current_hijri_month - 1
    rotation_offset = -round(days_elapsed)

    return AlignmentParams(
        current_month_index=current_month_index,
        days_elapsed=days_elapsed + 0.5,
        rotation_offset=rotation_offset,
        gregorian_date=gregorian_date,
        hijri_month=current_hijri_month,
        hijri_year=current_hijri_year,
    )


def rotate_months(months: list, start_month_index: int) -> list:
    """
    Rotate a list of months so that start_month_index becomes first.

    Args:
        months: List of Month objects in canonical order (Muharram first)
        start_month_index: 0-based index of month to place first

    Returns:
        New list with months rotated and numbers reassigned for correct orientation
    """
    n = len(months)
    rotated = []

    for i in range(n):
        original_index = (start_month_index + i) % n
        original_month = months[original_index]

        # Reassign number (1-12) based on new position for text orientation
        # Numbers 4-9 will be upside down (bottom half of circle)
        new_number = i + 1

        # Create new Month with updated number but same name/color
        new_month = original_month._replace(number=new_number)
        rotated.append(new_month)

    return rotated


def get_month_name(index: int) -> str:
    """Get Islamic month name by 0-based index."""
    return ISLAMIC_MONTHS[index]


def print_alignment_info(params: AlignmentParams) -> None:
    """Print alignment parameters for debugging/verification."""
    month_name = ISLAMIC_MONTHS[params.current_month_index]
    print(f"=== Islamic Calendar Alignment ===")
    print(f"Gregorian date: {params.gregorian_date}")
    print(f"Hijri date: {month_name} {params.hijri_year} AH")
    print(f"Current month index: {params.current_month_index} ({month_name})")
    print(f"Days elapsed from Jan 1: {params.days_elapsed:.1f}")
    print(f"Rotation offset: {params.rotation_offset}")
    print(f"==================================")
