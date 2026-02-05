#!/usr/bin/env python
"""Generate the instructions PDF with the circular calendar cover image."""

import os
import subprocess
import base64
from weasyprint import HTML, CSS
from pypdf import PdfWriter, PdfReader

def generate_instructions_pdf(cover_pdf_path: str, output_path: str):
    """Generate instructions PDF with cover image embedded at bottom of same page."""

    # First convert the cover PDF to PNG for embedding
    cover_png_path = "out/cover_temp.png"
    subprocess.run([
        "inkscape", cover_pdf_path,
        "--export-filename=" + cover_png_path,
        "--export-type=png",
        "--export-dpi=150"
    ], check=True, capture_output=True)

    # Read and base64 encode the image
    with open(cover_png_path, "rb") as f:
        img_data = base64.b64encode(f.read()).decode('utf-8')

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page {{
                size: letter;
                margin: 0.75in 1in 0.5in 1in;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.4;
                color: #333;
            }}
            h1 {{
                text-align: center;
                font-size: 26pt;
                font-weight: normal;
                margin-bottom: 0.3em;
                margin-top: 0;
                color: #000;
            }}
            .subtitle {{
                text-align: center;
                margin-bottom: 1em;
                font-size: 10pt;
            }}
            h2 {{
                font-size: 13pt;
                font-weight: normal;
                margin-top: 1em;
                margin-bottom: 0.3em;
                color: #1a73e8;
            }}
            ol, ul {{
                margin-left: 0;
                padding-left: 1.5em;
                margin-top: 0.3em;
                margin-bottom: 0.3em;
            }}
            li {{
                margin-bottom: 0.5em;
            }}
            a {{
                color: #1a73e8;
            }}
            .footer {{
                margin-top: 1em;
                margin-bottom: 0.5em;
            }}
            .calendar-image {{
                text-align: center;
                margin-top: 0.5em;
            }}
            .calendar-image img {{
                max-width: 100%;
                height: auto;
                max-height: 3.5in;
            }}
        </style>
    </head>
    <body>
        <h1>Intuitive Circle Calendar</h1>
        <p class="subtitle">An annual calendar that's easy for little kids (and adults) to understand.</p>

        <h2>Instructions</h2>
        <ol>
            <li>Print out the pdf</li>
            <li>Cut out all the months</li>
            <li>Stick the months of the solar calendar on the wall in a circle (sticky putty works great here). If it's not a leap year, then cover up the 29<sup>th</sup> of Feb with May 1<sup>st</sup>.</li>
            <li>Place the Islamic months on the inner ring, aligning each day with it's corresponding day on the solar calendar. Use an Islamic calendar or moonsighting.com to figure out if the month should have 29 or 30 days. If it should have 29 days, cover up the 30<sup>th</sup> day with the 1<sup>st</sup> of the next month.</li>
            <li>You'll end up with a small gap in the Islamic calendar's circle, since the Islamic year has fewer days. As each Islamic month ends, you can shift it counter clockwise to cover up the gap.</li>
        </ol>

        <h2>Optional</h2>
        <ul>
            <li>Laminate the pages before cutting out the months to make the calendar more durable</li>
            <li>Cut out an arrow to point to the current day</li>
            <li>Cut out arrow shaped tags to mark key events like important Islamic days, birthdays, etc</li>
        </ul>

        <p class="footer">Latest version of this calendar is available at <a href="http://zainrizvi.io/calendar">http://zainrizvi.io/calendar</a></p>

        <div class="calendar-image">
            <img src="data:image/png;base64,{img_data}" alt="Circle Calendar Preview">
        </div>
    </body>
    </html>
    """

    # Generate the instructions page as PDF
    HTML(string=html_content).write_pdf(output_path)

    # Clean up temp file
    os.remove(cover_png_path)

    print(f"Generated: {output_path}")


if __name__ == "__main__":
    import sys
    scale_factor = 0.7
    cover_pdf = f"out/calendar_page_{scale_factor}_3_cover.pdf"
    output_pdf = "v3 Instructions.pdf"

    if not os.path.exists(cover_pdf):
        print(f"Error: Cover PDF not found at {cover_pdf}")
        print("Run make_cal.py first to generate the cover page.")
        sys.exit(1)

    generate_instructions_pdf(cover_pdf, output_pdf)
