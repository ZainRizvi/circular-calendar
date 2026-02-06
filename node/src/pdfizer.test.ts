/**
 * Tests for pdfizer module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { concatPdfs, createPdfFromPng, pngBufferToPdf } from './pdfizer.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';

// Test output directory
const TEST_OUT_DIR = path.join(process.cwd(), 'test_output');

describe('pdfizer', () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_OUT_DIR, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_OUT_DIR, { recursive: true });
    } catch {
      // Ignore errors during cleanup
    }
  });

  describe('pngBufferToPdf', () => {
    it('should convert PNG buffer to PDF bytes', async () => {
      // Create a minimal valid PNG (1x1 red pixel)
      const pngBuffer = createMinimalPng();

      const pdfBytes = await pngBufferToPdf(pngBuffer, 100, 100);

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);

      // Verify it's a valid PDF
      const pdf = await PDFDocument.load(pdfBytes);
      expect(pdf.getPageCount()).toBe(1);
    });

    it('should create PDF with correct dimensions', async () => {
      const pngBuffer = createMinimalPng();
      const width = 200;
      const height = 300;

      const pdfBytes = await pngBufferToPdf(pngBuffer, width, height);
      const pdf = await PDFDocument.load(pdfBytes);
      const page = pdf.getPage(0);

      const { width: pageWidth, height: pageHeight } = page.getSize();
      expect(pageWidth).toBe(width);
      expect(pageHeight).toBe(height);
    });
  });

  describe('createPdfFromPng', () => {
    it('should create PDF file from PNG buffer', async () => {
      const pngBuffer = createMinimalPng();
      const outputPath = path.join(TEST_OUT_DIR, 'test.pdf');

      await createPdfFromPng(pngBuffer, outputPath, 100, 100);

      // Verify file exists
      const stat = await fs.stat(outputPath);
      expect(stat.size).toBeGreaterThan(0);

      // Verify it's a valid PDF
      const pdfBytes = await fs.readFile(outputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      expect(pdf.getPageCount()).toBe(1);
    });
  });

  describe('concatPdfs', () => {
    it('should concatenate multiple PDFs', async () => {
      // Create two test PDFs
      const pngBuffer = createMinimalPng();

      const pdf1Path = path.join(TEST_OUT_DIR, 'pdf1.pdf');
      const pdf2Path = path.join(TEST_OUT_DIR, 'pdf2.pdf');
      const outputPath = path.join(TEST_OUT_DIR, 'merged.pdf');

      await createPdfFromPng(pngBuffer, pdf1Path, 100, 100);
      await createPdfFromPng(pngBuffer, pdf2Path, 200, 200);

      await concatPdfs([pdf1Path, pdf2Path], outputPath);

      // Verify merged PDF has 2 pages
      const mergedBytes = await fs.readFile(outputPath);
      const mergedPdf = await PDFDocument.load(mergedBytes);
      expect(mergedPdf.getPageCount()).toBe(2);
    });

    it('should preserve page order', async () => {
      const pngBuffer = createMinimalPng();

      const pdf1Path = path.join(TEST_OUT_DIR, 'page1.pdf');
      const pdf2Path = path.join(TEST_OUT_DIR, 'page2.pdf');
      const pdf3Path = path.join(TEST_OUT_DIR, 'page3.pdf');
      const outputPath = path.join(TEST_OUT_DIR, 'ordered.pdf');

      // Create PDFs with different sizes to distinguish them
      await createPdfFromPng(pngBuffer, pdf1Path, 100, 100);
      await createPdfFromPng(pngBuffer, pdf2Path, 200, 200);
      await createPdfFromPng(pngBuffer, pdf3Path, 300, 300);

      await concatPdfs([pdf1Path, pdf2Path, pdf3Path], outputPath);

      const mergedBytes = await fs.readFile(outputPath);
      const mergedPdf = await PDFDocument.load(mergedBytes);

      expect(mergedPdf.getPageCount()).toBe(3);
      expect(mergedPdf.getPage(0).getSize().width).toBe(100);
      expect(mergedPdf.getPage(1).getSize().width).toBe(200);
      expect(mergedPdf.getPage(2).getSize().width).toBe(300);
    });

    it('should handle single PDF passthrough', async () => {
      const pngBuffer = createMinimalPng();

      const pdf1Path = path.join(TEST_OUT_DIR, 'single.pdf');
      const outputPath = path.join(TEST_OUT_DIR, 'single_out.pdf');

      await createPdfFromPng(pngBuffer, pdf1Path, 100, 100);
      await concatPdfs([pdf1Path], outputPath);

      const mergedBytes = await fs.readFile(outputPath);
      const mergedPdf = await PDFDocument.load(mergedBytes);
      expect(mergedPdf.getPageCount()).toBe(1);
    });
  });
});

/**
 * Create a minimal valid PNG (1x1 transparent pixel).
 * This is a complete, valid PNG file.
 */
function createMinimalPng(): Buffer {
  // Minimal valid 1x1 PNG (transparent pixel)
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR type
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, // bit depth: 8
    0x02, // color type: RGB
    0x00, // compression method
    0x00, // filter method
    0x00, // interlace method
    0x90, 0x77, 0x53, 0xde, // CRC
    0x00, 0x00, 0x00, 0x0c, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT type
    0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0xff, 0x00, 0x05, 0xfe, 0x02, 0xfe, // compressed data
    0xa3, 0x6c, 0x4f, 0x1c, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4e, 0x44, // IEND type
    0xae, 0x42, 0x60, 0x82, // CRC
  ]);
}
