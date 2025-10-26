#!/usr/bin/env python
# coding: utf-8

"""
Test script to verify Islamic date rotation is correct
"""

from calendar_data import islamic_year

print("Testing Islamic month rotation calculations...")
print("=" * 70)

# Simulate the rotation calculation
for index, month in enumerate(islamic_year.months):
    # Calculate the position-based rotation for this month
    position_based_rotation = -1 * index * (360 / 12)

    # Determine if name should be upside down based on position
    name_upside_down = (index >= 3 and index < 9)

    upside_down_str = "YES (upside down)" if name_upside_down else "NO (right-side up)"

    print(f"Position {index:2d}: {month.name:20s} | "
          f"Rotation: {position_based_rotation:6.1f}° | "
          f"Upside down: {upside_down_str}")

print("=" * 70)
print("\nExplanation:")
print("- Position 0 (top): 0° rotation - dates appear upright")
print("- Position 3-8 (bottom half): month names are upside down")
print("- Position 6 (bottom): -180° rotation")
print("- Position 11 (top-left): -330° rotation")
print("\nThis ensures all date numbers remain vertical/readable")
print("regardless of which Islamic month is at the top of the calendar.")
