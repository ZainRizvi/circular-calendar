/**
 * Serverless-compatible calendar generation pipeline.
 *
 * Generates the complete calendar PDF in-memory without file I/O.
 * Suitable for use in serverless environments like Vercel.
 */

import {
  createCalendarBuilder,
  computeLayout,
  createPdfGenerator,
  concatPdfBytes,
  type LayoutConfig,
  type AlignmentParams,
  type SvgRenderer,
} from './index.ts';
import { generateInstructionsPdfBytes } from '../generate-instructions.ts';

/**
 * Options for serverless calendar generation.
 */
export interface ServerlessPipelineOptions {
  /** Layout configuration */
  config: LayoutConfig;
  /** Islamic calendar alignment */
  alignment: AlignmentParams;
  /** SVG renderer implementation */
  renderer: SvgRenderer;
}

/**
 * Generate the complete calendar PDF in-memory.
 *
 * @param options - Pipeline options including config, alignment, and renderer
 * @returns Complete PDF as Uint8Array
 */
export async function generateCalendarPdfBytes(
  options: ServerlessPipelineOptions
): Promise<Uint8Array> {
  const { config, alignment, renderer } = options;

  // Set up builder and PDF generator
  const layout = computeLayout(config);
  const builder = createCalendarBuilder(config, layout);
  const pdfGenerator = createPdfGenerator({ renderer });

  // Create month instances
  const solarMonths = builder.createSolarMonthInstances();
  const islamicMonths = builder.createIslamicMonthInstances(alignment);

  // Generate calendar page PDFs
  const calendarPdfs: Uint8Array[] = [];
  let monthIdx = 0;

  while (monthIdx < solarMonths.length - 1) {
    const startIdx = monthIdx;
    const endIdx = Math.min(
      monthIdx + layout.numRows * layout.numColumns,
      solarMonths.length
    );

    const svg = builder.generateCalendarSvg(
      solarMonths.slice(startIdx, endIdx),
      islamicMonths.slice(startIdx, endIdx)
    );

    const pdfBytes = await pdfGenerator.svgToPdf(svg);
    calendarPdfs.push(pdfBytes);

    monthIdx = endIdx;
  }

  // Generate circular cover page SVG and render to PNG
  const coverSvg = builder.generateCircleCoverSvg(
    solarMonths,
    islamicMonths,
    alignment.daysElapsed
  );
  const coverPngResult = await renderer.render(coverSvg);

  // Generate instructions PDF with cover image
  const instructionsPdf = await generateInstructionsPdfBytes(
    coverPngResult.pngBuffer
  );

  // Concatenate all PDFs: instructions first, then calendar pages
  const allPdfs = [instructionsPdf, ...calendarPdfs];
  return concatPdfBytes(allPdfs);
}
