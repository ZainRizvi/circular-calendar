/**
 * Tests for pdf-generator module.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createPdfGenerator,
  pngBufferToPdf,
  concatPdfBytes,
} from './pdf-generator.ts';
import type { SvgRenderer, SvgRenderResult } from './types.ts';
import { PDFDocument } from 'pdf-lib';

// Create a mock renderer for testing
function createMockRenderer(
  result?: Partial<SvgRenderResult>
): SvgRenderer {
  // Create a simple 1x1 red PNG (minimal valid PNG)
  const minimalPng = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, // PNG signature
    0, 0, 0, 13, 73, 72, 68, 82, // IHDR chunk length and type
    0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0, // 1x1, RGB, no interlace
    144, 119, 83, 222, // IHDR CRC
    0, 0, 0, 12, 73, 68, 65, 84, // IDAT chunk
    8, 215, 99, 248, 207, 192, 0, 0, 0, 3, 0, 1, // compressed data
    0, 24, 221, 141, // IDAT CRC
    0, 0, 0, 0, 73, 69, 78, 68, // IEND chunk
    174, 66, 96, 130, // IEND CRC
  ]);

  return {
    render: vi.fn().mockResolvedValue({
      pngBuffer: minimalPng,
      widthPts: 612,
      heightPts: 792,
      ...result,
    }),
  };
}

describe('pngBufferToPdf', () => {
  it('should convert PNG buffer to PDF bytes', async () => {
    // Create a minimal valid PNG (1x1 red pixel)
    const minimalPng = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10,
      0, 0, 0, 13, 73, 72, 68, 82,
      0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0,
      144, 119, 83, 222,
      0, 0, 0, 12, 73, 68, 65, 84,
      8, 215, 99, 248, 207, 192, 0, 0, 0, 3, 0, 1,
      0, 24, 221, 141,
      0, 0, 0, 0, 73, 69, 78, 68,
      174, 66, 96, 130,
    ]);

    const pdfBytes = await pngBufferToPdf(minimalPng, 612, 792);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    // Verify it's a valid PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBe(1);
  });
});

describe('concatPdfBytes', () => {
  it('should concatenate multiple PDFs', async () => {
    // Create two simple PDFs
    const pdf1 = await PDFDocument.create();
    pdf1.addPage([100, 100]);
    const pdf1Bytes = await pdf1.save();

    const pdf2 = await PDFDocument.create();
    pdf2.addPage([200, 200]);
    const pdf2Bytes = await pdf2.save();

    const mergedBytes = await concatPdfBytes([pdf1Bytes, pdf2Bytes]);

    const mergedPdf = await PDFDocument.load(mergedBytes);
    expect(mergedPdf.getPageCount()).toBe(2);
  });

  it('should handle single PDF', async () => {
    const pdf1 = await PDFDocument.create();
    pdf1.addPage([100, 100]);
    const pdf1Bytes = await pdf1.save();

    const mergedBytes = await concatPdfBytes([pdf1Bytes]);

    const mergedPdf = await PDFDocument.load(mergedBytes);
    expect(mergedPdf.getPageCount()).toBe(1);
  });
});

describe('createPdfGenerator', () => {
  it('should create a PDF generator with renderer', () => {
    const renderer = createMockRenderer();
    const generator = createPdfGenerator({ renderer });

    expect(generator).toHaveProperty('svgToPdf');
    expect(generator).toHaveProperty('generateMultiPagePdf');
  });

  describe('svgToPdf', () => {
    it('should convert SVG to PDF using injected renderer', async () => {
      const renderer = createMockRenderer();
      const generator = createPdfGenerator({ renderer });

      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>';
      const pdfBytes = await generator.svgToPdf(svg);

      expect(renderer.render).toHaveBeenCalledWith(svg);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      // Verify it's a valid PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      expect(pdfDoc.getPageCount()).toBe(1);
    });
  });

  describe('generateMultiPagePdf', () => {
    it('should generate multi-page PDF from multiple SVGs', async () => {
      const renderer = createMockRenderer();
      const generator = createPdfGenerator({ renderer });

      const svgs = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>',
      ];
      const pdfBytes = await generator.generateMultiPagePdf(svgs);

      expect(renderer.render).toHaveBeenCalledTimes(2);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      // Verify page count
      const pdfDoc = await PDFDocument.load(pdfBytes);
      expect(pdfDoc.getPageCount()).toBe(2);
    });
  });
});
