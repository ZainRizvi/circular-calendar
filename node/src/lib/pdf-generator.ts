/**
 * PDF generation module with dependency injection for rendering.
 *
 * This module provides PDF generation capabilities that work in both
 * Node.js and browser environments by accepting an injected SvgRenderer.
 * All functions return Uint8Array - no file I/O.
 */

import { PDFDocument } from 'pdf-lib';
import type { SvgRenderer } from './types.js';

/**
 * Options for creating a PDF generator.
 */
export interface PdfGeneratorOptions {
  /** SVG renderer implementation */
  renderer: SvgRenderer;
}

/**
 * PDF generator interface.
 */
export interface PdfGenerator {
  /** Convert a single SVG to PDF */
  svgToPdf(svgContent: string): Promise<Uint8Array>;
  /** Convert multiple SVGs to a multi-page PDF */
  generateMultiPagePdf(svgContents: string[]): Promise<Uint8Array>;
}

/**
 * Convert PNG buffer to PDF bytes.
 *
 * @param pngBuffer - PNG image data
 * @param widthPts - Page width in points
 * @param heightPts - Page height in points
 * @returns PDF document as Uint8Array
 */
export async function pngBufferToPdf(
  pngBuffer: Uint8Array,
  widthPts: number,
  heightPts: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBuffer);

  const page = pdfDoc.addPage([widthPts, heightPts]);

  // Draw image to fill the page
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: widthPts,
    height: heightPts,
  });

  return pdfDoc.save();
}

/**
 * Concatenate PDF byte arrays into a single PDF.
 *
 * @param pdfByteArrays - Array of PDF documents as Uint8Arrays
 * @returns Merged PDF as Uint8Array
 */
export async function concatPdfBytes(
  pdfByteArrays: Uint8Array[]
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const pdfBytes of pdfByteArrays) {
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  return mergedPdf.save();
}

/**
 * Create a PDF generator with injected renderer.
 *
 * @param options - Generator options including renderer
 * @returns PdfGenerator implementation
 */
export function createPdfGenerator(options: PdfGeneratorOptions): PdfGenerator {
  const { renderer } = options;

  return {
    /**
     * Convert a single SVG to PDF.
     *
     * @param svgContent - SVG string content
     * @returns PDF as Uint8Array
     */
    async svgToPdf(svgContent: string): Promise<Uint8Array> {
      const result = await renderer.render(svgContent);
      return pngBufferToPdf(result.pngBuffer, result.widthPts, result.heightPts);
    },

    /**
     * Convert multiple SVGs to a multi-page PDF.
     *
     * @param svgContents - Array of SVG strings
     * @returns Multi-page PDF as Uint8Array
     */
    async generateMultiPagePdf(svgContents: string[]): Promise<Uint8Array> {
      const pdfPages: Uint8Array[] = [];

      for (const svg of svgContents) {
        const result = await renderer.render(svg);
        const pdfPage = await pngBufferToPdf(
          result.pngBuffer,
          result.widthPts,
          result.heightPts
        );
        pdfPages.push(pdfPage);
      }

      return concatPdfBytes(pdfPages);
    },
  };
}
