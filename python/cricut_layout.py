#!/usr/bin/env python3
"""
Compute arc dimensions and optimal Cricut Maker sheet layouts
for printing circular calendar arcs as vinyl stickers.

Cricut Maker Print Then Cut limits:
  - Max printable area: 6.75" x 9.25"
  - Mat size: 12" x 12" (or 12" x 24")
  - Registration marks consume ~0.75" on each side

Usage:
  python cricut_layout.py [--scale SCALE] [--target-diameter INCHES]
"""

import math
import argparse


# --- Constants ---
CRICUT_PTC_WIDTH = 6.75   # inches (Print Then Cut max width)
CRICUT_PTC_HEIGHT = 9.25  # inches (Print Then Cut max height)
CUT_MARGIN = 0.05         # inches between stickers for cut path
MM_PER_INCH = 25           # matches code's inchToMilimeter()

DAYS_IN_YEAR = 366  # leap year (code default)

SOLAR_MONTHS = [
    ("January",   31), ("February",  29), ("March",     31),
    ("April",     30), ("May",       31), ("June",      30),
    ("July",      31), ("August",    31), ("September", 30),
    ("October",   31), ("November",  30), ("December",  31),
]

ISLAMIC_MONTHS = [
    ("Muharram",       30), ("Safar",          30), ("Rabi al-Awwal",  30),
    ("Rabi ath-Thani", 30), ("Jumada al-Awwal",30), ("Jumada ath-Thani",30),
    ("Rajab",          30), ("Sha'baan",       30), ("Ramadan",        30),
    ("Shawwal",        30), ("Dhu al-Qa'dah",  30), ("Dhu al-Hijja",   30),
]


def compute_radii(scale_factor):
    """Replicate layout.py calculations."""
    width_mm = 8 * scale_factor * MM_PER_INCH
    outermost_radius = width_mm / (2 * 3.14 / 12)
    inner_radius = outermost_radius * 9.2 / 10
    month_thickness = outermost_radius - inner_radius
    return outermost_radius, inner_radius, month_thickness


def arc_bounding_box(outer_r, inner_r, num_days, days_in_year=DAYS_IN_YEAR):
    """
    Compute the bounding box of an arc strip in mm.
    Arc is centered at -90° (12 o'clock position).
    Returns (width_mm, height_mm, sagitta_outer_mm, sagitta_inner_mm).
    """
    angle_deg = 360.0 * num_days / days_in_year
    half_angle = math.radians(angle_deg / 2)

    width = 2 * outer_r * math.sin(half_angle)
    # Top = outer arc at center, Bottom = inner arc at edges
    height = outer_r - inner_r * math.cos(half_angle)

    sagitta_outer = outer_r * (1 - math.cos(half_angle))
    sagitta_inner = inner_r * (1 - math.cos(half_angle))

    return width, height, sagitta_outer, sagitta_inner


def scale_for_diameter(target_diameter_inches):
    """Find scale factor that produces the desired circle diameter."""
    # diameter = 2 * outermost_radius
    # outermost_radius = (8 * scale * 25) / (2*3.14/12)
    # target_diameter/2 * 25 = (8 * scale * 25) / (6.28/12)
    # Solving for scale:
    target_radius_mm = target_diameter_inches / 2 * MM_PER_INCH
    scale = target_radius_mm * (2 * 3.14 / 12) / (8 * MM_PER_INCH)
    return scale


def fits_cricut_ptc(width_in, height_in):
    """Check if an arc fits in Cricut Print Then Cut area."""
    return width_in <= CRICUT_PTC_WIDTH and height_in <= CRICUT_PTC_HEIGHT


def layout_arcs_simple(arcs, available_height=CRICUT_PTC_HEIGHT, margin=CUT_MARGIN):
    """
    Simple stacking: place arcs one below another.
    Returns list of sheets, each sheet is a list of (name, y_offset).
    """
    sheets = []
    current_sheet = []
    y = 0

    for name, width_in, height_in in arcs:
        if y + height_in > available_height and current_sheet:
            sheets.append(current_sheet)
            current_sheet = []
            y = 0
        current_sheet.append((name, y, width_in, height_in))
        y += height_in + margin

    if current_sheet:
        sheets.append(current_sheet)
    return sheets


def layout_arcs_nested(arcs, available_height=CRICUT_PTC_HEIGHT, margin=CUT_MARGIN):
    """
    Nested layout: alternate arc orientation (concave up / concave down).
    Arcs nest into each other's curvature, saving vertical space.
    Returns list of sheets.
    """
    sheets = []
    current_sheet = []
    y = 0
    flip = False

    for name, width_in, height_in, sagitta_in in arcs:
        # When flipped, the concave side faces up and can overlap
        # with the previous arc's concave area
        savings = sagitta_in * 0.7 if flip and current_sheet else 0
        effective_height = height_in - savings

        if y + effective_height > available_height and current_sheet:
            sheets.append(current_sheet)
            current_sheet = []
            y = 0
            flip = False
            savings = 0
            effective_height = height_in

        current_sheet.append((name, y, width_in, height_in, "flipped" if flip else "normal"))
        y += effective_height + margin
        flip = not flip

    if current_sheet:
        sheets.append(current_sheet)
    return sheets


def main():
    parser = argparse.ArgumentParser(description="Compute Cricut layout for calendar arcs")
    parser.add_argument("--scale", type=float, default=None,
                        help="Scale factor (default: 0.7)")
    parser.add_argument("--target-diameter", type=float, default=None,
                        help="Target circle diameter in inches (overrides --scale)")
    args = parser.parse_args()

    if args.target_diameter:
        scale = scale_for_diameter(args.target_diameter)
        print(f"Target diameter: {args.target_diameter}\" → scale factor: {scale:.3f}")
    elif args.scale:
        scale = args.scale
    else:
        scale = 0.7

    outer_r, inner_r, thickness = compute_radii(scale)
    diameter_mm = 2 * outer_r
    diameter_in = diameter_mm / MM_PER_INCH

    # Islamic ring is one thickness inward
    islamic_outer_r = inner_r  # = outermost - thickness
    islamic_inner_r = inner_r - thickness

    print(f"\n{'='*70}")
    print(f"CIRCULAR CALENDAR ARC DIMENSIONS (scale={scale:.2f})")
    print(f"{'='*70}")
    print(f"Assembled circle diameter: {diameter_in:.1f}\" ({diameter_mm:.0f} mm) = {diameter_in/12:.1f} ft")
    print(f"Solar ring:   outer_r={outer_r:.1f}mm  inner_r={inner_r:.1f}mm  thickness={thickness:.1f}mm ({thickness/MM_PER_INCH:.2f}\")")
    print(f"Islamic ring: outer_r={islamic_outer_r:.1f}mm  inner_r={islamic_inner_r:.1f}mm  thickness={thickness:.1f}mm ({thickness/MM_PER_INCH:.2f}\")")
    print(f"\nCricut Print Then Cut area: {CRICUT_PTC_WIDTH}\" × {CRICUT_PTC_HEIGHT}\"")

    # --- Compute each arc ---
    print(f"\n{'─'*70}")
    print(f"{'Month':<20} {'Days':>4}  {'Width':>7}  {'Height':>7}  {'Sagitta':>7}  {'Fits PTC':>8}")
    print(f"{'─'*70}")

    all_arcs = []  # (name, width_in, height_in, sagitta_in)

    print("\nSOLAR (outer ring):")
    for name, days in SOLAR_MONTHS:
        w, h, sag_o, sag_i = arc_bounding_box(outer_r, inner_r, days)
        w_in, h_in, sag_in = w / MM_PER_INCH, h / MM_PER_INCH, sag_i / MM_PER_INCH
        fits = fits_cricut_ptc(w_in, h_in)
        print(f"  {name:<18} {days:>4}  {w_in:>6.2f}\"  {h_in:>6.2f}\"  {sag_in:>6.2f}\"  {'  ✓' if fits else '  ✗ TOO WIDE'}")
        all_arcs.append((f"S:{name}", w_in, h_in, sag_in))

    print("\nISLAMIC (inner ring):")
    for name, days in ISLAMIC_MONTHS:
        w, h, sag_o, sag_i = arc_bounding_box(islamic_outer_r, islamic_inner_r, days)
        w_in, h_in, sag_in = w / MM_PER_INCH, h / MM_PER_INCH, sag_i / MM_PER_INCH
        fits = fits_cricut_ptc(w_in, h_in)
        print(f"  {name:<18} {days:>4}  {w_in:>6.2f}\"  {h_in:>6.2f}\"  {sag_in:>6.2f}\"  {'  ✓' if fits else '  ✗ TOO WIDE'}")
        all_arcs.append((f"I:{name}", w_in, h_in, sag_in))

    # --- Check if any arcs are too wide ---
    too_wide = [(n, w) for n, w, h, s in all_arcs if w > CRICUT_PTC_WIDTH]
    if too_wide:
        print(f"\n⚠  {len(too_wide)} arc(s) exceed Cricut PTC width of {CRICUT_PTC_WIDTH}\"!")
        print(f"   Widest arc: {too_wide[0][0]} at {too_wide[0][1]:.2f}\"")
        max_scale = scale_for_diameter(CRICUT_PTC_WIDTH / (2 * math.sin(math.radians(360 * 31 / DAYS_IN_YEAR / 2))) * 2 / MM_PER_INCH * MM_PER_INCH)
        max_diam = 2 * compute_radii(max_scale)[0] / MM_PER_INCH
        print(f"   Max scale for PTC: {max_scale:.3f} (diameter: {max_diam:.1f}\")")
        print(f"\n   Options:")
        print(f"   1. Reduce scale to ≤{max_scale:.2f} (max ~{max_diam:.0f}\" / {max_diam/12:.1f} ft circle)")
        print(f"   2. Split each arc into 2 halves")
        print(f"   3. Use Cricut's mat-only cutting (print separately, cut on 12\" mat)")

    # --- Layout: Simple Stacking ---
    simple_arcs = [(n, w, h) for n, w, h, s in all_arcs if w <= CRICUT_PTC_WIDTH]
    if simple_arcs:
        sheets_simple = layout_arcs_simple(simple_arcs)
        print(f"\n{'='*70}")
        print(f"LAYOUT A: Simple Stacking (all arcs same orientation)")
        print(f"{'='*70}")
        print(f"Total sheets needed: {len(sheets_simple)}")
        for i, sheet in enumerate(sheets_simple):
            used_height = sheet[-1][1] + sheet[-1][3]
            print(f"\n  Sheet {i+1} ({len(sheet)} arcs, {used_height:.2f}\" used of {CRICUT_PTC_HEIGHT}\"):")
            for name, y, w, h in sheet:
                print(f"    {name:<25} at y={y:.2f}\"  ({w:.2f}\" × {h:.2f}\")")

    # --- Layout: Nested (alternating orientation) ---
    nestable_arcs = [(n, w, h, s) for n, w, h, s in all_arcs if w <= CRICUT_PTC_WIDTH]
    if nestable_arcs:
        sheets_nested = layout_arcs_nested(nestable_arcs)
        print(f"\n{'='*70}")
        print(f"LAYOUT B: Nested (alternating arc orientation for tighter packing)")
        print(f"{'='*70}")
        print(f"Total sheets needed: {len(sheets_nested)}")
        for i, sheet in enumerate(sheets_nested):
            used_height = sheet[-1][1] + sheet[-1][3]
            print(f"\n  Sheet {i+1} ({len(sheet)} arcs, {used_height:.2f}\" used of {CRICUT_PTC_HEIGHT}\"):")
            for name, y, w, h, orient in sheet:
                print(f"    {name:<25} at y={y:.2f}\"  ({w:.2f}\" × {h:.2f}\")  [{orient}]")

    # --- Layout: Mixed (pair solar + islamic on same row) ---
    solar_arcs = [(n, w, h, s) for n, w, h, s in all_arcs[:12] if w <= CRICUT_PTC_WIDTH]
    islamic_arcs = [(n, w, h, s) for n, w, h, s in all_arcs[12:] if w <= CRICUT_PTC_WIDTH]

    if solar_arcs and islamic_arcs:
        # Check if a solar + islamic arc can sit side by side
        widest_solar = max(w for _, w, _, _ in solar_arcs)
        narrowest_islamic = min(w for _, w, _, _ in islamic_arcs)
        side_by_side = (widest_solar + narrowest_islamic + CUT_MARGIN) <= CRICUT_PTC_WIDTH

        if not side_by_side:
            # Can they be stacked more efficiently by grouping by size?
            print(f"\n{'='*70}")
            print(f"LAYOUT C: Size-grouped (group by arc width for less wasted space)")
            print(f"{'='*70}")
            # Sort by width descending, then stack
            sorted_arcs = sorted(
                [(n, w, h) for n, w, h, s in all_arcs if w <= CRICUT_PTC_WIDTH],
                key=lambda x: x[1], reverse=True
            )
            sheets_sorted = layout_arcs_simple(sorted_arcs)
            print(f"Total sheets needed: {len(sheets_sorted)}")
            for i, sheet in enumerate(sheets_sorted):
                used_height = sheet[-1][1] + sheet[-1][3]
                print(f"\n  Sheet {i+1} ({len(sheet)} arcs, {used_height:.2f}\" used of {CRICUT_PTC_HEIGHT}\"):")
                for name, y, w, h in sheet:
                    print(f"    {name:<25} at y={y:.2f}\"  ({w:.2f}\" × {h:.2f}\")")

    # --- Cost estimate ---
    num_sheets = len(sheets_simple) if simple_arcs else 0
    print(f"\n{'='*70}")
    print(f"COST ESTIMATE")
    print(f"{'='*70}")
    print(f"Sheets of printable vinyl needed: {num_sheets}")
    print(f"  Printable vinyl cost: ~${num_sheets * 1.50:.2f} ({num_sheets} sheets × ~$1.50/sheet)")
    print(f"  Transfer tape cost:   ~${num_sheets * 0.50:.2f} ({num_sheets} sheets × ~$0.50/sheet)")
    print(f"  Total materials:      ~${num_sheets * 2.00:.2f}")
    print(f"\n  (Assumes Orajet/Starcraft printable vinyl + standard transfer tape)")


if __name__ == "__main__":
    main()
