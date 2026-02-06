/**
 * Tests for generate-instructions module.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateQrCode, generateInstructionsPdf, GUMROAD_URL } from './generate-instructions.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import { createPdfFromPng } from './pdfizer.js';

// Test output directory
const TEST_OUT_DIR = path.join(process.cwd(), 'test_output_instructions');

describe('generate-instructions', () => {
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

  describe('GUMROAD_URL', () => {
    it('should be the correct Gumroad product URL', () => {
      expect(GUMROAD_URL).toBe('https://zainrizvi.gumroad.com/l/circle-calendar');
    });
  });

  describe('generateQrCode', () => {
    it('should generate a QR code PNG buffer', async () => {
      const qrBuffer = await generateQrCode('https://example.com');

      expect(qrBuffer).toBeInstanceOf(Buffer);
      expect(qrBuffer.length).toBeGreaterThan(0);

      // Check PNG magic bytes
      expect(qrBuffer[0]).toBe(0x89);
      expect(qrBuffer[1]).toBe(0x50); // P
      expect(qrBuffer[2]).toBe(0x4e); // N
      expect(qrBuffer[3]).toBe(0x47); // G
    });

    it('should generate QR code for GUMROAD_URL', async () => {
      const qrBuffer = await generateQrCode(GUMROAD_URL);
      expect(qrBuffer.length).toBeGreaterThan(100); // Should be a reasonable size
    });
  });

  describe('generateInstructionsPdf', () => {
    it('should generate a PDF file', async () => {
      // Create a mock cover PDF
      const coverPdfPath = path.join(TEST_OUT_DIR, 'cover.pdf');
      const outputPath = path.join(TEST_OUT_DIR, 'instructions.pdf');

      // Create a minimal cover PDF
      const pngBuffer = createMinimalPng();
      await createPdfFromPng(pngBuffer, coverPdfPath, 612, 792);

      await generateInstructionsPdf(coverPdfPath, outputPath);

      // Verify file exists and is a valid PDF
      const stat = await fs.stat(outputPath);
      expect(stat.size).toBeGreaterThan(0);

      const pdfBytes = await fs.readFile(outputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      expect(pdf.getPageCount()).toBe(1);
    });

    it('should create PDF with letter-size page', async () => {
      const coverPdfPath = path.join(TEST_OUT_DIR, 'cover2.pdf');
      const outputPath = path.join(TEST_OUT_DIR, 'instructions2.pdf');

      const pngBuffer = createMinimalPng();
      await createPdfFromPng(pngBuffer, coverPdfPath, 612, 792);

      await generateInstructionsPdf(coverPdfPath, outputPath);

      const pdfBytes = await fs.readFile(outputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const page = pdf.getPage(0);
      const { width, height } = page.getSize();

      // Letter size is 612 x 792 points
      expect(width).toBeCloseTo(612, 0);
      expect(height).toBeCloseTo(792, 0);
    });
  });
});

/**
 * Create a minimal valid PNG (1x1 pixel).
 */
function createMinimalPng(): Buffer {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x01,
    0x08,
    0x02,
    0x00,
    0x00,
    0x00,
    0x90, 0x77, 0x53, 0xde,
    0x00, 0x00, 0x00, 0x0c,
    0x49, 0x44, 0x41, 0x54,
    0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0xff, 0x00, 0x05, 0xfe, 0x02, 0xfe,
    0xa3, 0x6c, 0x4f, 0x1c,
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4e, 0x44,
    0xae, 0x42, 0x60, 0x82,
  ]);
}
