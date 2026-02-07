/**
 * Generate the instructions PDF with the circular calendar cover image.
 * Ported from Python generate_instructions.py
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';
import * as fs from 'fs/promises';

export const GUMROAD_URL = 'https://zainrizvi.gumroad.com/l/circle-calendar';

// Letter size in points (8.5" x 11")
const LETTER_WIDTH = 612;
const LETTER_HEIGHT = 792;
const MARGIN = 72; // 1 inch

/**
 * Generate a QR code image as PNG buffer.
 */
export async function generateQrCode(url: string, size: number = 150): Promise<Uint8Array> {
  const pngBuffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: size,
    margin: 1,
    errorCorrectionLevel: 'L',
  });
  return new Uint8Array(pngBuffer);
}

/**
 * Wrap text to fit within a given width.
 */
function wrapText(
  text: string,
  maxWidth: number,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  fontSize: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Generate instructions PDF with cover image embedded at bottom of same page.
 *
 * In-memory version that returns PDF bytes directly.
 *
 * @param coverPngBuffer - PNG image of the cover to embed
 * @returns PDF document as Uint8Array
 */
export async function generateInstructionsPdfBytes(
  coverPngBuffer: Uint8Array
): Promise<Uint8Array> {
  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([LETTER_WIDTH, LETTER_HEIGHT]);

  // Embed fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const textColor = rgb(0.2, 0.2, 0.2);
  const blueColor = rgb(0.102, 0.451, 0.91); // #1a73e8

  // Starting position (top of page with margin)
  let y = LETTER_HEIGHT - MARGIN;
  const contentWidth = LETTER_WIDTH - 2 * MARGIN;

  // Title
  const titleSize = 24;
  const titleText = 'Intuitive Circle Calendar';
  const titleWidth = helvetica.widthOfTextAtSize(titleText, titleSize);
  page.drawText(titleText, {
    x: (LETTER_WIDTH - titleWidth) / 2,
    y: y - titleSize,
    size: titleSize,
    font: helvetica,
    color: textColor,
  });
  y -= titleSize + 8;

  // Subtitle
  const subtitleSize = 10;
  const subtitleText =
    "An annual calendar that's easy for little kids (and adults) to understand.";
  const subtitleWidth = helvetica.widthOfTextAtSize(subtitleText, subtitleSize);
  page.drawText(subtitleText, {
    x: (LETTER_WIDTH - subtitleWidth) / 2,
    y: y - subtitleSize,
    size: subtitleSize,
    font: helvetica,
    color: textColor,
  });
  y -= subtitleSize + 16;

  // Instructions heading
  const headingSize = 12;
  page.drawText('Instructions', {
    x: MARGIN,
    y: y - headingSize,
    size: headingSize,
    font: helvetica,
    color: blueColor,
  });
  y -= headingSize + 8;

  // Instructions list
  const bodySize = 10;
  const lineHeight = 13;
  const instructions = [
    '1. Print out the pdf',
    '2. Cut out all the months',
    "3. Stick the months of the solar calendar on the wall in a circle (sticky putty works great here). If it's not a leap year, cover up the 29th of Feb with May 1st.",
    '4. Place the Islamic months on the inner ring, aligning each day with its corresponding day on the solar calendar. Use moonsighting.com to figure out if the month should have 29 or 30 days.',
    "5. You'll end up with a small gap in the Islamic calendar's circle. As each Islamic month ends, you can shift it counter clockwise to cover up the gap.",
  ];

  for (const instruction of instructions) {
    const lines = wrapText(instruction, contentWidth - 20, helvetica, bodySize);
    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], {
        x: MARGIN + (i === 0 ? 0 : 15),
        y: y - bodySize,
        size: bodySize,
        font: helvetica,
        color: textColor,
      });
      y -= lineHeight;
    }
  }

  y -= 4;

  // Optional heading
  page.drawText('Optional', {
    x: MARGIN,
    y: y - headingSize,
    size: headingSize,
    font: helvetica,
    color: blueColor,
  });
  y -= headingSize + 8;

  // Optional items
  const optionalItems = [
    '• Laminate the pages before cutting out the months to make the calendar more durable',
    '• Cut out an arrow to point to the current day',
    '• Cut out arrow shaped tags to mark key events like important Islamic days, birthdays, etc',
  ];

  for (const item of optionalItems) {
    const lines = wrapText(item, contentWidth - 20, helvetica, bodySize);
    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], {
        x: MARGIN + (i === 0 ? 0 : 15),
        y: y - bodySize,
        size: bodySize,
        font: helvetica,
        color: textColor,
      });
      y -= lineHeight;
    }
  }

  y -= 4;

  // Footer link
  page.drawText(
    'Latest version of this calendar is available at http://zainrizvi.io/calendar',
    {
      x: MARGIN,
      y: y - bodySize,
      size: bodySize,
      font: helvetica,
      color: textColor,
    }
  );
  y -= lineHeight + 8;

  // Review request heading
  page.drawText('Enjoying the Calendar?', {
    x: MARGIN,
    y: y - headingSize,
    size: headingSize,
    font: helvetica,
    color: blueColor,
  });
  y -= headingSize + 8;

  // Generate and embed QR code
  const qrBuffer = await generateQrCode(GUMROAD_URL);
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  const qrSize = 54; // 0.75 inches

  page.drawImage(qrImage, {
    x: MARGIN,
    y: y - qrSize,
    width: qrSize,
    height: qrSize,
  });

  // Review text (next to QR code)
  const reviewTextX = MARGIN + qrSize + 12;
  const reviewTextWidth = contentWidth - qrSize - 12;
  const reviewText =
    'If you found this calendar helpful, please leave a 5-star review on Gumroad! ' +
    'Your feedback helps others discover this resource. Scan the QR code or visit the product page.';

  const reviewLines = wrapText(reviewText, reviewTextWidth, helvetica, bodySize);
  let reviewY = y - bodySize;
  for (const line of reviewLines) {
    page.drawText(line, {
      x: reviewTextX,
      y: reviewY,
      size: bodySize,
      font: helvetica,
      color: textColor,
    });
    reviewY -= lineHeight;
  }

  y -= qrSize + 12;

  // Calculate maximum height for cover image
  // Use all available space from bottom margin up to just below the QR code
  const maxImgHeight = y - MARGIN;

  // Embed cover image
  const coverImage = await pdfDoc.embedPng(coverPngBuffer);
  const coverAspect = coverImage.width / coverImage.height;

  // Calculate image size to fit width while respecting max height
  let imgWidth = contentWidth;
  let imgHeight = imgWidth / coverAspect;

  if (imgHeight > maxImgHeight) {
    imgHeight = maxImgHeight;
    imgWidth = imgHeight * coverAspect;
  }

  // Center image horizontally
  const imgX = (LETTER_WIDTH - imgWidth) / 2;
  const imgY = MARGIN; // Place at bottom margin

  page.drawImage(coverImage, {
    x: imgX,
    y: imgY,
    width: imgWidth,
    height: imgHeight,
  });

  // Return PDF bytes
  return pdfDoc.save();
}

/**
 * Generate instructions PDF and write to file.
 *
 * File-based wrapper around generateInstructionsPdfBytes for CLI usage.
 *
 * @param coverPdfPath - Path to cover PDF file (unused, kept for API compatibility)
 * @param outputPath - Output path for instructions PDF
 * @param coverPngBuffer - PNG buffer of cover image
 */
export async function generateInstructionsPdf(
  coverPdfPath: string,
  outputPath: string,
  coverPngBuffer: Buffer
): Promise<void> {
  const pdfBytes = await generateInstructionsPdfBytes(new Uint8Array(coverPngBuffer));
  await fs.writeFile(outputPath, pdfBytes);
  console.log(`Generated: ${outputPath}`);
}
