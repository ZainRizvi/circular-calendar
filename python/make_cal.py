#!/usr/bin/env python
# coding: utf-8

# In[1]:


def is_notebook() -> bool:
    try:
        shell = get_ipython().__class__.__name__
        if shell == 'ZMQInteractiveShell':
            return True   # Jupyter notebook or qtconsole
        elif shell == 'TerminalInteractiveShell':
            return False  # Terminal running IPython
        else:
            return False  # Other type (?)
    except NameError:
        return False      # Probably standard Python interpreter

if is_notebook():
    get_ipython().run_line_magic('load_ext', 'autoreload')
    get_ipython().run_line_magic('autoreload', '2')

import argparse
import math
import os
from datetime import date
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

try:
    from IPython.display import SVG
except ImportError:
    SVG = None

# custom libs
from primitives import *
from arc_drawing import *
from calendar_data import *
from calendar_drawings import *
from layout import (
    calculate_layout_params,
    date_rotation,
    offset_point_by as offsetPointBy,
    build_solar_month_instances,
    build_islamic_month_instances,
    calculate_circle_rotation,
)
import islamic_alignment
import pdfizer


def svg_to_pdf(svg_path: str, pdf_path: str):
    """Convert SVG file to PDF using svglib and reportlab (pure Python)."""
    drawing = svg2rlg(svg_path)
    renderPDF.drawToFile(drawing, pdf_path)


def parse_args():
    """Parse command-line arguments for date specification."""
    parser = argparse.ArgumentParser(
        description="Generate circular calendar with Islamic/Gregorian overlay"
    )
    parser.add_argument(
        "--date",
        type=str,
        help="Gregorian date to align to (YYYY-MM-DD format). Defaults to today.",
    )
    parser.add_argument(
        "--hijri",
        type=str,
        help="Hijri date to align to (YYYY-MM-DD format, e.g., 1447-08-17 for Sha'ban 17, 1447).",
    )
    return parser.parse_args() if not is_notebook() else argparse.Namespace(date=None, hijri=None)


def get_alignment_from_args(args) -> islamic_alignment.AlignmentParams:
    """Get alignment parameters based on CLI arguments."""
    if args.hijri:
        parts = args.hijri.split("-")
        if len(parts) != 3:
            raise ValueError("Hijri date must be in YYYY-MM-DD format")
        hijri_year, hijri_month, hijri_day = int(parts[0]), int(parts[1]), int(parts[2])
        return islamic_alignment.get_alignment_params(
            hijri_year=hijri_year, hijri_month=hijri_month, hijri_day=hijri_day
        )
    elif args.date:
        parts = args.date.split("-")
        if len(parts) != 3:
            raise ValueError("Date must be in YYYY-MM-DD format")
        gregorian_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
        return islamic_alignment.get_alignment_params(gregorian_date=gregorian_date)
    else:
        return islamic_alignment.get_alignment_params()


def main():
    # Parse arguments and calculate alignment
    args = parse_args()
    alignment = get_alignment_from_args(args)
    islamic_alignment.print_alignment_info(alignment)

    # Rotate Islamic months to start with current month
    islamic_year = Year(
        months=islamic_alignment.rotate_months(
            islamic_year_canonical.months, alignment.current_month_index
        )
    )

    # Derived alignment values
    islamic_date_rotation_offset = alignment.rotation_offset
    days_elapsed_islamic_base = alignment.days_elapsed


    # In[2]:


    # make the out dir
    os.makedirs("out", exist_ok=True)


    # In[3]:


    # Calculate layout
    layout = calculate_layout_params()
    scale_factor = layout.scale_factor

    print(scale_factor)

    solarMonths = build_solar_month_instances(
        solar_year, layout.date_box_height, layout.inner_radius, layout.outermost_radius
    )

    islamicMonths = build_islamic_month_instances(
        islamic_year, layout.date_box_height, layout.inner_radius,
        layout.outermost_radius, layout.month_thickness, islamic_date_rotation_offset
    )


    # In[4]:


    origin_first = layout.origin

    days_in_year = 366

    NUM_ROWS = layout.num_rows
    NUM_COLUMNS = layout.num_columns

    month_idx = 0
    page_num = 0
    pdfs = []

    # Draw full scale pages
    while month_idx < len(solarMonths) - 1:
        dwg = getVerticalPageCanvas() # getPageCanvas()
        origin = origin_first
        for col_num in range(NUM_COLUMNS):
            for row_num in range(NUM_ROWS):
                month_idx = row_num + NUM_ROWS*col_num + NUM_ROWS * NUM_COLUMNS * page_num

                if month_idx < len(solarMonths):
                    drawMonthParts(dwg, getMonth(solarMonths[month_idx], days_in_year, origin))
                    origin = offsetPointBy(origin, 0, layout.month_offset)

                if month_idx < len(islamicMonths):
                    drawMonthParts(dwg, getMonth(islamicMonths[month_idx], days_in_year, origin))
                    origin = offsetPointBy(origin, 0, (layout.month_thickness + layout.month_offset)*2.3)

            # move to next column
            origin = offsetPointBy(origin_first, layout.width * 1.05, 0)

        svg_file = f"out/svg_{scale_factor}_{page_num}.svg"
        pdf_file = f"out/calendar_page_{scale_factor}_{page_num}.pdf"

        dwg.saveas(svg_file, pretty=True)
        svg_to_pdf(svg_file, pdf_file)
        os.remove(svg_file)
        pdfs.append(pdf_file)

        page_num += 1



    # Draw summary page
    def circle_form_factor(g, month, days_elapsed, days_in_year, origin):
        g.translate(75, 50)
        g.scale(0.3)
        rot = calculate_circle_rotation(days_elapsed, month.num_days, days_in_year)
        g.rotate(rot, center=origin)
        g.translate(0, origin_first.y - origin.y)

    month_idx = 0
    page_num = 0
    days_elapsed = 0 - solarMonths[0].num_days/2

    # days_elapsed_islamic is now calculated dynamically from alignment params
    # The base value comes from islamic_alignment module; we just adjust for centering
    days_elapsed_islamic = days_elapsed_islamic_base - islamicMonths[0].num_days/2

    dwg = getVerticalPageCanvas() # getPageCanvas()
    origin_first = Point(layout.width_center, layout.outermost_radius + layout.vertical_offset)

    while month_idx < len(solarMonths) - 1:
        origin = Point(origin_first.x, origin_first.y)
        for col_num in range(NUM_COLUMNS):
            for row_num in range(NUM_ROWS):
                month_idx = row_num + NUM_ROWS*col_num + NUM_ROWS * NUM_COLUMNS * page_num

                if month_idx < len(solarMonths):
                    month = solarMonths[month_idx]
                    g = groupWithMonthParts(getMonth(month, days_in_year, origin))
                    circle_form_factor(g, month, days_elapsed, days_in_year, origin)
                    days_elapsed += month.num_days
                    dwg.add(g)
                    #origin = offsetPointBy(origin, 0, month_offset)


                if month_idx < len(islamicMonths):
                    month = islamicMonths[month_idx]
                    g = groupWithMonthParts(getMonth(month, days_in_year, origin))
                    circle_form_factor(g, month, days_elapsed_islamic, days_in_year, origin)
                    days_elapsed_islamic += month.num_days
                    dwg.add(g)
                    #origin = offsetPointBy(origin, 0, month_thickness*2.3)

            # move to next column
            #origin = offsetPointBy(origin_first, width * 1.05, 0)

        page_num += 1

    print("saving pdf")
    svg_file = f"out/svg_{scale_factor}_{page_num}_cover.svg"
    pdf_file = f"out/calendar_page_{scale_factor}_{page_num}_cover.pdf"

    dwg.saveas(svg_file, pretty=True)
    svg_to_pdf(svg_file, pdf_file)
    os.remove(svg_file)
    pdfs.insert(0, pdf_file)

    # Generate the instructions PDF with the cover image embedded
    import generate_instructions
    cover_pdf = f"out/calendar_page_{scale_factor}_{page_num}_cover.pdf"
    instructions_pdf = "v3 Instructions.pdf"
    generate_instructions.generate_instructions_pdf(cover_pdf, instructions_pdf)

    # Remove cover from pdfs list since it's now embedded in instructions
    pdfs.remove(cover_pdf)

    date_suffix = alignment.gregorian_date.strftime("%Y-%m-%d")
    pdfizer.concat_pdfs([instructions_pdf] + pdfs, f"out/calendar_pages_{scale_factor}_COMPLETE_{date_suffix}.pdf")
    print("Wrote the concatenated file!")

    # Clean up intermediate PDFs
    for pdf in pdfs:
        print(f"removing {pdf}...")
        os.remove(pdf)
    print(f"removing {cover_pdf}...")
    os.remove(cover_pdf)
    print("and removed old pdfs")

    print(scale_factor)
    if SVG:
        SVG(dwg.tostring())


if __name__ == "__main__" or is_notebook():
    main()
