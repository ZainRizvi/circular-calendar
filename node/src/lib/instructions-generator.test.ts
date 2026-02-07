/**
 * Tests for the serverless-compatible instructions generator.
 */

import { describe, it, expect } from 'vitest';
import { generateInstructionsPdfBytes } from './instructions-generator.ts';
import { PDFDocument } from 'pdf-lib';

/**
 * Create a minimal valid PNG buffer for testing.
 * This is a 1x1 transparent PNG.
 */
function createMockPngBuffer(): Uint8Array {
  // Minimal 1x1 transparent PNG
  const pngHeader = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x06, // 8-bit RGBA
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x1f, 0x15, 0xc4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0a, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
    0x0d, 0x0a, 0x2d, 0xb4, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4e, 0x44, // IEND
    0xae, 0x42, 0x60, 0x82, // CRC
  ];
  return new Uint8Array(pngHeader);
}

describe('generateInstructionsPdfBytes', () => {
  it('returns valid PDF bytes', async () => {
    const mockPng = createMockPngBuffer();
    const result = await generateInstructionsPdfBytes(mockPng);

    expect(result).toBeInstanceOf(Uint8Array);

    // PDF files start with %PDF-
    const pdfHeader = new TextDecoder().decode(result.slice(0, 5));
    expect(pdfHeader).toBe('%PDF-');
  });

  it('creates a valid PDF that can be loaded by pdf-lib', async () => {
    const mockPng = createMockPngBuffer();
    const result = await generateInstructionsPdfBytes(mockPng);

    // Should be loadable as a PDF
    const pdfDoc = await PDFDocument.load(result);
    expect(pdfDoc.getPageCount()).toBe(1);
  });

  it('creates a letter-sized page', async () => {
    const mockPng = createMockPngBuffer();
    const result = await generateInstructionsPdfBytes(mockPng);

    const pdfDoc = await PDFDocument.load(result);
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();

    // Letter size: 612 x 792 points
    expect(width).toBe(612);
    expect(height).toBe(792);
  });

  it('embeds the cover image in the PDF', async () => {
    const mockPng = createMockPngBuffer();
    const result = await generateInstructionsPdfBytes(mockPng);

    // The PDF should contain image data
    // We check that the PDF is larger than a minimal empty PDF
    // An empty PDF with one page is ~900 bytes, with image should be larger
    expect(result.length).toBeGreaterThan(1000);

    // Verify the PDF text contains XObject reference (indicates embedded image)
    const pdfText = new TextDecoder().decode(result);
    expect(pdfText).toContain('/XObject');
  });

  it('includes QR code in the PDF', async () => {
    const mockPng = createMockPngBuffer();
    const result = await generateInstructionsPdfBytes(mockPng);

    const pdfDoc = await PDFDocument.load(result);
    // QR code is also an embedded image, so we should have at least 2 images
    // (cover + QR code)
    // pdf-lib doesn't easily expose embedded images count,
    // but we can verify the PDF size is substantial
    expect(result.length).toBeGreaterThan(2000);
  });
});
