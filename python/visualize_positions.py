#!/usr/bin/env python
"""Visualize where months appear on the circle"""

print("\nCIRCLE POSITION GUIDE:")
print("="*60)
print("  0° = Top (12 o'clock) = Day 0 (Jan 1)")
print(" 90° = Right (3 o'clock) = Day 91 (Apr 1-2)")
print("180° = Bottom (6 o'clock) = Day 183 (Jul 2)")
print("270° = Left (9 o'clock) = Day 274 (Oct 1)")
print("360° = Top again = Day 366")
print("="*60)

# Calculate positions
october_26_position = 299 / 366 * 360
may_15_position = 135 / 366 * 360  # Mid-May
jumada_center = 310 / 366 * 360
jumada_day_4 = 299 / 366 * 360

print("\nCALCULATED POSITIONS:")
print(f"  October 26 (day 299): {october_26_position:.1f}° (should be ~10 o'clock)")
print(f"  Mid-May (day 135): {may_15_position:.1f}° (should be ~4-5 o'clock)")
print(f"  Jumada al-Awwal CENTER (day 310): {jumada_center:.1f}°")
print(f"  Jumada al-Awwal DAY 4 (day 299): {jumada_day_4:.1f}°")

print("\n" + "="*60)
print("PROBLEM ANALYSIS:")
print("="*60)
print(f"SVG shows Jumada al-Awwal rotated to: 304.9°")
print(f"This is around 11 o'clock position (upper left)")
print(f"")
print(f"October 26 should be at: {october_26_position:.1f}° (~10 o'clock)")
print(f"Jumada day 4 should align with October 26")
print(f"")
print(f"But the CENTER of Jumada is at: {jumada_center:.1f}° (~11 o'clock)")
print(f"")
print(f"The issue: circle_form_factor rotates based on the")
print(f"CENTER of the month, not individual days!")
print("="*60)

# Calculate what days_elapsed should be to center day 4 (not day 15) at position 299
print("\nSOLUTION:")
print("="*60)
print("To align day 4 at day 299, we need to CENTER the month differently")
print("")
print("Currently:")
print(f"  days_elapsed = 295")
print(f"  Center at 295 + 15 = 310 → rotates to {jumada_center:.1f}°")
print(f"  Day 4 at 295 + 4 = 299 (within the rotated month)")
print("")
print("But the rotation applies to the WHOLE month as a unit!")
print("So we need to account for the visual rotation of the month arc itself")
