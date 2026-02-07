/**
 * Tests for the serverless-compatible calendar generation pipeline.
 */

import { describe, it, expect } from 'vitest';
import { generateCalendarPdfBytes } from './serverless-pipeline.ts';
import { DEFAULT_LAYOUT_CONFIG, getAlignmentParams } from './index.ts';
import { createResvgRenderer } from '../renderers/index.js';
import { PDFDocument } from 'pdf-lib';

describe('generateCalendarPdfBytes', () => {
  // Use lower DPI for faster tests
  const createTestRenderer = () => createResvgRenderer({ dpi: 150 });

  it('returns valid PDF bytes for default date', async () => {
    const renderer = createTestRenderer();
    const result = await generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment: getAlignmentParams(),
      renderer,
    });

    expect(result).toBeInstanceOf(Uint8Array);

    // PDF files start with %PDF-
    const pdfHeader = new TextDecoder().decode(result.slice(0, 5));
    expect(pdfHeader).toBe('%PDF-');

    // Multi-page PDF should be substantial in size
    expect(result.length).toBeGreaterThan(50000);
  }, 60000); // 60s timeout for PDF generation

  it('creates a valid PDF loadable by pdf-lib', async () => {
    const renderer = createTestRenderer();
    const result = await generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment: getAlignmentParams(),
      renderer,
    });

    const pdfDoc = await PDFDocument.load(result);
    // Should have multiple pages: instructions + calendar pages
    expect(pdfDoc.getPageCount()).toBeGreaterThan(1);
  }, 60000);

  it('generates PDF for specific Gregorian date', async () => {
    const renderer = createTestRenderer();
    const specificDate = new Date('2026-02-05');
    const result = await generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment: getAlignmentParams(specificDate),
      renderer,
    });

    expect(result).toBeInstanceOf(Uint8Array);

    // Verify it's a valid PDF
    const pdfDoc = await PDFDocument.load(result);
    expect(pdfDoc.getPageCount()).toBeGreaterThan(1);
  }, 60000);

  it('generates PDF for specific Hijri date', async () => {
    const renderer = createTestRenderer();
    const alignment = getAlignmentParams(undefined, {
      hijriYear: 1447,
      hijriMonth: 8,
      hijriDay: 17,
    });

    const result = await generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment,
      renderer,
    });

    expect(result).toBeInstanceOf(Uint8Array);

    // Verify it's a valid PDF
    const pdfHeader = new TextDecoder().decode(result.slice(0, 5));
    expect(pdfHeader).toBe('%PDF-');
  }, 60000);

  it('includes instructions page as first page', async () => {
    const renderer = createTestRenderer();
    const result = await generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment: getAlignmentParams(),
      renderer,
    });

    const pdfDoc = await PDFDocument.load(result);
    const firstPage = pdfDoc.getPage(0);
    const { width, height } = firstPage.getSize();

    // Instructions page is letter size (612 x 792 points)
    expect(width).toBe(612);
    expect(height).toBe(792);
  }, 60000);
});
