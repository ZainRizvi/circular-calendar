/**
 * PDF creation and concatenation utilities.
 * Ported from Python pdfizer.py
 */

import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';

/**
 * Convert PNG buffer to PDF bytes.
 *
 * @param pngBuffer - PNG image data
 * @param widthPts - Page width in points
 * @param heightPts - Page height in points
 * @returns PDF document as Uint8Array
 */
export async function pngBufferToPdf(
  pngBuffer: Buffer,
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
 * Create a PDF file from a PNG buffer.
 *
 * @param pngBuffer - PNG image data
 * @param outputPath - Output PDF file path
 * @param widthPts - Page width in points
 * @param heightPts - Page height in points
 */
export async function createPdfFromPng(
  pngBuffer: Buffer,
  outputPath: string,
  widthPts: number,
  heightPts: number
): Promise<void> {
  const pdfBytes = await pngBufferToPdf(pngBuffer, widthPts, heightPts);
  await fs.writeFile(outputPath, pdfBytes);
}

/**
 * Concatenate multiple PDF files into a single PDF.
 *
 * @param pdfPaths - Array of PDF file paths to concatenate
 * @param outputPath - Output file path for merged PDF
 */
export async function concatPdfs(
  pdfPaths: string[],
  outputPath: string
): Promise<void> {
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  const mergedBytes = await mergedPdf.save();
  await fs.writeFile(outputPath, mergedBytes);
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
