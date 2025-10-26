#!/usr/bin/env python
"""Debug script to understand circle positioning"""

from date_calculator import get_current_alignment

alignment = get_current_alignment()
print("\n" + "="*60)
print("DEBUGGING CIRCLE POSITIONING")
print("="*60)

# Solar calendar
print("\nSOLAR CALENDAR (reference):")
print("  January (month 0) at index 0:")
days_elapsed_solar = 0 - 31/2  # -15.5
print(f"    days_elapsed = {days_elapsed_solar:.1f}")
rot_jan = 360.0 * (days_elapsed_solar + 31/2) / 366
print(f"    rotation = 360 * ({days_elapsed_solar:.1f} + 15.5) / 366 = {rot_jan:.1f}°")
print(f"    → January appears at {rot_jan:.1f}° (top of circle)")

print("\n  October (month 9):")
# October starts around day 274
days_elapsed_oct = 274 - 31/2  # approximate
rot_oct = 360.0 * (274 + 31/2) / 366
print(f"    Day 274-304 of year (Oct 1-31)")
print(f"    Center at day ~289")
print(f"    rotation ≈ 360 * 289 / 366 = {rot_oct:.1f}°")
print(f"    → October appears at ~{rot_oct:.1f}° (left side, ~10 o'clock)")

# Current day
day_of_year = 299
rot_current = 360.0 * day_of_year / 366
print(f"\n  Current day (Oct 26 = day 299):")
print(f"    rotation = 360 * 299 / 366 = {rot_current:.1f}°")

# Islamic calendar
print("\n" + "="*60)
print("ISLAMIC CALENDAR:")
print(f"  Current: Jumada al-Awwal 4 (day 4 of month)")
print(f"  days_elapsed_islamic = {alignment.days_elapsed_islamic:.1f}")

print(f"\n  Jumada al-Awwal (first in list, index 0):")
rot_islamic = 360.0 * (alignment.days_elapsed_islamic + 30/2) / 366
print(f"    days_elapsed = {alignment.days_elapsed_islamic:.1f}")
print(f"    month has 30 days, so center at day {alignment.days_elapsed_islamic + 15:.1f}")
print(f"    rotation = 360 * {alignment.days_elapsed_islamic + 15:.1f} / 366 = {rot_islamic:.1f}°")
print(f"    → Jumada al-Awwal CENTER appears at {rot_islamic:.1f}°")

print(f"\n  Day 4 of Jumada al-Awwal:")
day_4_position = alignment.days_elapsed_islamic + 4
rot_day_4 = 360.0 * day_4_position / 366
print(f"    Position: {day_4_position:.1f} days into year")
print(f"    rotation = 360 * {day_4_position:.1f} / 366 = {rot_day_4:.1f}°")
print(f"    → Day 4 appears at {rot_day_4:.1f}°")

print("\n" + "="*60)
print("ALIGNMENT CHECK:")
print(f"  Current solar day (Oct 26): {rot_current:.1f}°")
print(f"  Current Islamic day (Jumada al-Awwal 4): {rot_day_4:.1f}°")
print(f"  Difference: {abs(rot_current - rot_day_4):.1f}°")
if abs(rot_current - rot_day_4) < 1:
    print("  ✓ ALIGNED!")
else:
    print("  ✗ NOT ALIGNED!")
print("="*60)
