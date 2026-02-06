#!/usr/bin/env python
"""Generate the instructions PDF with the circular calendar cover image."""

import io
import os
import pypdfium2 as pdfium
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, ListFlowable, ListItem
from reportlab.lib.enums import TA_CENTER


def pdf_to_png_bytes(pdf_path: str, dpi: int = 150) -> bytes:
    """Convert first page of PDF to PNG bytes using pypdfium2 (pure Python)."""
    pdf = pdfium.PdfDocument(pdf_path)
    page = pdf[0]
    scale = dpi / 72  # 72 is the default PDF DPI
    bitmap = page.render(scale=scale)
    pil_image = bitmap.to_pil()

    # Convert to bytes
    img_bytes = io.BytesIO()
    pil_image.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes.getvalue()


def generate_instructions_pdf(cover_pdf_path: str, output_path: str):
    """Generate instructions PDF with cover image embedded at bottom of same page."""

    # Convert cover PDF to PNG bytes
    cover_png_bytes = pdf_to_png_bytes(cover_pdf_path, dpi=150)

    # Create PDF document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=1*inch,
        rightMargin=1*inch,
        topMargin=0.75*inch,
        bottomMargin=0.5*inch
    )

    # Define styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=26,
        alignment=TA_CENTER,
        spaceAfter=6,
        fontName='Helvetica'
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        spaceAfter=18,
        textColor=HexColor('#333333')
    )

    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=13,
        spaceBefore=12,
        spaceAfter=6,
        textColor=HexColor('#1a73e8'),
        fontName='Helvetica'
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=11,
        leading=15,
        textColor=HexColor('#333333')
    )

    link_style = ParagraphStyle(
        'Link',
        parent=body_style,
        spaceBefore=12,
        spaceAfter=6
    )

    # Build content
    story = []

    # Title
    story.append(Paragraph("Intuitive Circle Calendar", title_style))
    story.append(Paragraph("An annual calendar that's easy for little kids (and adults) to understand.", subtitle_style))

    # Instructions heading
    story.append(Paragraph("Instructions", heading_style))

    # Instructions list
    instructions = [
        "Print out the pdf",
        "Cut out all the months",
        "Stick the months of the solar calendar on the wall in a circle (sticky putty works great here). If it's not a leap year, then cover up the 29<super>th</super> of Feb with May 1<super>st</super>.",
        "Place the Islamic months on the inner ring, aligning each day with it's corresponding day on the solar calendar. Use an Islamic calendar or moonsighting.com to figure out if the month should have 29 or 30 days. If it should have 29 days, cover up the 30<super>th</super> day with the 1<super>st</super> of the next month.",
        "You'll end up with a small gap in the Islamic calendar's circle, since the Islamic year has fewer days. As each Islamic month ends, you can shift it counter clockwise to cover up the gap."
    ]

    instruction_items = [ListItem(Paragraph(item, body_style), leftIndent=20) for item in instructions]
    story.append(ListFlowable(instruction_items, bulletType='1', start=1))

    # Optional heading
    story.append(Paragraph("Optional", heading_style))

    # Optional list
    optional_items = [
        "Laminate the pages before cutting out the months to make the calendar more durable",
        "Cut out an arrow to point to the current day",
        "Cut out arrow shaped tags to mark key events like important Islamic days, birthdays, etc"
    ]

    optional_list_items = [ListItem(Paragraph(item, body_style), leftIndent=20) for item in optional_items]
    story.append(ListFlowable(optional_list_items, bulletType='bullet'))

    # Footer link
    story.append(Paragraph(
        'Latest version of this calendar is available at <link href="http://zainrizvi.io/calendar"><u>http://zainrizvi.io/calendar</u></link>',
        link_style
    ))

    # Add some space before image
    story.append(Spacer(1, 12))

    # Add cover image
    img = Image(io.BytesIO(cover_png_bytes))
    # Scale image to fit width while maintaining aspect ratio, max height 3.5 inches
    img_width = 6.5 * inch  # Available width (letter - margins)
    img.drawWidth = img_width
    img.drawHeight = img_width * img.imageHeight / img.imageWidth
    if img.drawHeight > 3.5 * inch:
        img.drawHeight = 3.5 * inch
        img.drawWidth = img.drawHeight * img.imageWidth / img.imageHeight
    img.hAlign = 'CENTER'
    story.append(img)

    # Build PDF
    doc.build(story)

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
