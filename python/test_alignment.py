#!/usr/bin/env python
# coding: utf-8

"""
Quick test to verify the automatic calendar alignment works
"""

import sys
from date_calculator import get_current_alignment

# Test the alignment calculation
print("Testing automatic calendar alignment...")
print("=" * 50)

alignment = get_current_alignment()

print("\n" + "=" * 50)
print("RESULTS:")
print("=" * 50)
print(f"✓ Solar Date: {alignment.current_solar_date}")
print(f"✓ Islamic Date: {alignment.current_islamic_date}")
print(f"✓ Islamic rotation offset: {alignment.islamic_date_rotation_offset:.1f} days")
print(f"✓ Days elapsed (Islamic): {alignment.days_elapsed_islamic:.1f}")
print(f"✓ Months to skip: {alignment.num_months_to_skip}")
print("=" * 50)

print("\n✓ Automatic alignment calculation successful!")
print("\nWhat this means:")
print(f"  - The Islamic calendar will be rotated by {alignment.islamic_date_rotation_offset:.1f} days")
print(f"    to align with the solar calendar")
print(f"  - The current Islamic month will be positioned at the top of the circle")
print(f"  - When you run the script on different dates, these values will")
print(f"    automatically update to keep the calendars properly aligned")
