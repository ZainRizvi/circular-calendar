#!/usr/bin/env node
/**
 * Main entry point for circular calendar generation.
 * Ported from Python make_cal.py
 */

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';

import { SCALE_FACTOR, Point, resetTextPathIdCounter } from './primitives.js';
import { inchToMillimeter, getVerticalPageCanvas, drawMonthParts, groupWithMonthParts } from './arc-drawing.js';
import { getMonth } from './calendar-drawings.js';
import {
  type MonthInstance,
  type Month,
  solarYear,
  islamicYearCanonical,
} from './calendar-data.js';
import {
  getAlignmentParams,
  rotateMonths,
  printAlignmentInfo,
  type AlignmentParams,
} from './islamic-alignment.js';
import { svgToPng } from './svg-to-png.js';
import { createPdfFromPng, concatPdfs } from './pdfizer.js';
import { generateInstructionsPdf } from './generate-instructions.js';

// ============================================================
// CLI Argument Parsing
// ============================================================

export interface ParsedArgs {
  date?: string;
  hijri?: string;
}

export function parseArgs(args: string[]): ParsedArgs {
  const program = new Command();
  program
    .option('--date <date>', 'Gregorian date (YYYY-MM-DD)')
    .option('--hijri <date>', 'Hijri date (YYYY-MM-DD)')
    .parse(['node', 'make-cal', ...args]);

  return program.opts();
}

export function getAlignmentFromArgs(args: ParsedArgs): AlignmentParams {
  if (args.hijri) {
    const parts = args.hijri.split('-');
    if (parts.length !== 3) {
      throw new Error('Hijri date must be in YYYY-MM-DD format');
    }
    return getAlignmentParams(undefined, {
      hijriYear: parseInt(parts[0]),
      hijriMonth: parseInt(parts[1]),
      hijriDay: parseInt(parts[2]),
    });
  } else if (args.date) {
    const parts = args.date.split('-');
    if (parts.length !== 3) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }
    return getAlignmentParams(
      new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    );
  }
  return getAlignmentParams();
}

// ============================================================
// Layout Configuration
// ============================================================

const scaleFactor = SCALE_FACTOR;
const canvasWidth = 11 * scaleFactor;
const width = inchToMillimeter(8 * scaleFactor);
const outermostRadius = width / (2 * 3.14 / 12);
const innerRadius = outermostRadius * 9.2 / 10;
const monthThickness = outermostRadius - innerRadius;
const dateBoxHeight = monthThickness * 0.2;

const extraWidthOffset = 10;
const widthCenter = inchToMillimeter(canvasWidth) / 2 + extraWidthOffset;
const verticalOffset = 30 * scaleFactor;

// Layout configuration based on scale factor
const NUM_ROWS = scaleFactor <= 0.5 ? 5 : scaleFactor < 0.75 ? 4 : 2;
const NUM_COLUMNS = scaleFactor <= 0.5 ? 2 : 1;

const DAYS_IN_YEAR = 366;

// ============================================================
// Month Instance Creation
// ============================================================

/**
 * Calculate date rotation offset for a month.
 */
export function dateRotation(month: Month): number {
  return -1 * (month.number - 1) * (360 / 12);
}

/**
 * Create MonthInstance array for solar (Gregorian) months.
 */
export function createSolarMonthInstances(): MonthInstance[] {
  const solarMonths: MonthInstance[] = [];

  for (let index = 0; index < solarYear.months.length; index++) {
    const month = solarYear.months[index];
    const nameUpsideDown = index >= 3 && index < 9;

    solarMonths.push({
      name: month.name,
      numDays: month.numDays[0],
      color: month.color,
      nameUpsideDown,
      dateOnTop: false, // Outer month
      dateBoxHeight,
      innerRadius,
      outerRadius: outermostRadius,
      dateAngleOffset: dateRotation(month),
    });
  }

  return solarMonths;
}

/**
 * Create MonthInstance array for Islamic months.
 */
export function createIslamicMonthInstances(alignment: AlignmentParams): MonthInstance[] {
  // Rotate Islamic months to start with current month
  const rotatedMonths = rotateMonths(
    islamicYearCanonical.months,
    alignment.currentMonthIndex
  );

  const islamicMonths: MonthInstance[] = [];
  const islamicRotationOffset = alignment.rotationOffset;

  for (const month of rotatedMonths) {
    const nameUpsideDown = month.number > 3 && month.number <= 9;

    islamicMonths.push({
      name: month.name,
      numDays: month.numDays[0],
      color: month.color,
      nameUpsideDown,
      dateOnTop: true, // Inner month
      dateBoxHeight,
      innerRadius: innerRadius - monthThickness,
      outerRadius: outermostRadius - monthThickness,
      dateAngleOffset: dateRotation(month) + islamicRotationOffset,
    });
  }

  return islamicMonths;
}

// ============================================================
// SVG Generation
// ============================================================

/**
 * Generate SVG for a calendar page (linear strips).
 */
export function generateCalendarSvg(
  solarMonths: MonthInstance[],
  islamicMonths: MonthInstance[]
): string {
  resetTextPathIdCounter();

  const monthOffset = 4 * scaleFactor;
  const originFirst = new Point(widthCenter, outermostRadius + verticalOffset);

  const svgElements: string[] = [];

  // SVG header
  const pageWidth = inchToMillimeter(8.5);
  const pageHeight = inchToMillimeter(11);
  svgElements.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}">`
  );

  let origin = new Point(originFirst.x, originFirst.y);

  for (let i = 0; i < solarMonths.length; i++) {
    // Draw solar month
    const solarParts = getMonth(solarMonths[i], DAYS_IN_YEAR, origin);
    svgElements.push(drawMonthParts(solarParts));

    origin = new Point(origin.x, origin.y + monthOffset);

    // Draw Islamic month
    if (i < islamicMonths.length) {
      const islamicParts = getMonth(islamicMonths[i], DAYS_IN_YEAR, origin);
      svgElements.push(drawMonthParts(islamicParts));
    }

    origin = new Point(origin.x, origin.y + (monthThickness + monthOffset) * 2.3);
  }

  svgElements.push('</svg>');
  return svgElements.join('\n');
}

/**
 * Apply circular transform to a group of month parts.
 */
function circleFormFactor(
  svgContent: string,
  month: MonthInstance,
  daysElapsed: number,
  origin: Point,
  originFirst: Point
): string {
  const rotation = (360.0 * (daysElapsed + month.numDays / 2)) / DAYS_IN_YEAR;
  const translateY = originFirst.y - origin.y;

  return `<g transform="translate(75, 50) scale(0.3) rotate(${rotation}, ${origin.x}, ${origin.y}) translate(0, ${translateY})">
${svgContent}
</g>`;
}

/**
 * Generate SVG for the circular cover page.
 */
export function generateCircleCoverSvg(
  solarMonths: MonthInstance[],
  islamicMonths: MonthInstance[],
  daysElapsedIslamicBase: number
): string {
  resetTextPathIdCounter();

  const originFirst = new Point(widthCenter, outermostRadius + verticalOffset);
  const svgElements: string[] = [];

  // SVG header
  const pageWidth = inchToMillimeter(8.5);
  const pageHeight = inchToMillimeter(11);
  svgElements.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}">`
  );

  let daysElapsed = -solarMonths[0].numDays / 2;
  let daysElapsedIslamic = daysElapsedIslamicBase - islamicMonths[0].numDays / 2;

  const origin = new Point(originFirst.x, originFirst.y);

  for (let i = 0; i < solarMonths.length; i++) {
    // Draw solar month in circular form
    const solarParts = getMonth(solarMonths[i], DAYS_IN_YEAR, origin);
    const solarSvg = drawMonthParts(solarParts);
    svgElements.push(
      circleFormFactor(solarSvg, solarMonths[i], daysElapsed, origin, originFirst)
    );
    daysElapsed += solarMonths[i].numDays;

    // Draw Islamic month in circular form
    if (i < islamicMonths.length) {
      const islamicParts = getMonth(islamicMonths[i], DAYS_IN_YEAR, origin);
      const islamicSvg = drawMonthParts(islamicParts);
      svgElements.push(
        circleFormFactor(islamicSvg, islamicMonths[i], daysElapsedIslamic, origin, originFirst)
      );
      daysElapsedIslamic += islamicMonths[i].numDays;
    }
  }

  svgElements.push('</svg>');
  return svgElements.join('\n');
}

// ============================================================
// Main Entry Point
// ============================================================

async function svgToPdf(svgContent: string, pdfPath: string): Promise<void> {
  const result = await svgToPng(svgContent);
  await createPdfFromPng(result.pngBuffer, pdfPath, result.widthPts, result.heightPts);
}

async function main() {
  // Parse arguments
  const args = parseArgs(process.argv.slice(2));
  const alignment = getAlignmentFromArgs(args);
  printAlignmentInfo(alignment);

  // Create output directory
  await fs.mkdir('out', { recursive: true });

  // Create month instances
  const solarMonths = createSolarMonthInstances();
  const islamicMonths = createIslamicMonthInstances(alignment);

  console.log(`Scale factor: ${scaleFactor}`);

  // Generate calendar pages
  const pdfs: string[] = [];
  let pageNum = 0;
  let monthIdx = 0;

  while (monthIdx < solarMonths.length - 1) {
    const startIdx = monthIdx;
    const endIdx = Math.min(monthIdx + NUM_ROWS * NUM_COLUMNS, solarMonths.length);

    const svg = generateCalendarSvg(
      solarMonths.slice(startIdx, endIdx),
      islamicMonths.slice(startIdx, endIdx)
    );

    const svgFile = `out/svg_${scaleFactor}_${pageNum}.svg`;
    const pdfFile = `out/calendar_page_${scaleFactor}_${pageNum}.pdf`;

    await fs.writeFile(svgFile, svg);
    await svgToPdf(svg, pdfFile);
    await fs.unlink(svgFile);

    pdfs.push(pdfFile);
    monthIdx = endIdx;
    pageNum++;
  }

  // Generate circular cover page
  console.log('Generating cover page...');
  const coverSvg = generateCircleCoverSvg(
    solarMonths,
    islamicMonths,
    alignment.daysElapsed
  );

  const coverSvgFile = `out/svg_${scaleFactor}_${pageNum}_cover.svg`;
  const coverPdfFile = `out/calendar_page_${scaleFactor}_${pageNum}_cover.pdf`;

  await fs.writeFile(coverSvgFile, coverSvg);
  await svgToPdf(coverSvg, coverPdfFile);
  await fs.unlink(coverSvgFile);

  // Generate instructions PDF with cover image
  console.log('Generating instructions PDF...');
  const instructionsPdf = 'v3 Instructions.pdf';

  // Convert cover to PNG for instructions
  const coverPngResult = await svgToPng(coverSvg);
  await generateInstructionsPdf(coverPdfFile, instructionsPdf, coverPngResult.pngBuffer);

  // Concatenate all PDFs (instructions first, then calendar pages)
  const outputFile = `out/calendar_pages_${scaleFactor}_COMPLETE.pdf`;
  await concatPdfs([instructionsPdf, ...pdfs], outputFile);
  console.log(`Wrote the concatenated file: ${outputFile}`);

  // Clean up intermediate PDFs
  for (const pdf of pdfs) {
    console.log(`Removing ${pdf}...`);
    await fs.unlink(pdf);
  }
  console.log(`Removing ${coverPdfFile}...`);
  await fs.unlink(coverPdfFile);
  await fs.unlink(instructionsPdf);

  console.log('Done!');
  console.log(`Scale factor: ${scaleFactor}`);
}

// Run main if executed directly
const isMain = process.argv[1]?.endsWith('make-cal.ts') || process.argv[1]?.endsWith('make-cal.js');
if (isMain) {
  main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
}
