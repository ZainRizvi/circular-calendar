/**
 * CLI pipeline for generating the complete calendar PDF.
 *
 * This module orchestrates the full generation process including:
 * - Calendar page generation
 * - Cover page generation
 * - Instructions PDF generation
 * - PDF concatenation
 * - File I/O
 */

import * as fs from 'fs/promises';
import {
  createCalendarBuilder,
  computeLayout,
  createPdfGenerator,
  printAlignmentInfo,
  type LayoutConfig,
  type AlignmentParams,
} from '../lib/index.js';
import { createResvgRenderer } from '../renderers/index.js';
import { generateInstructionsPdf } from '../generate-instructions.js';
import { concatPdfs } from '../pdfizer.js';

/**
 * Options for the calendar generation pipeline.
 */
export interface PipelineOptions {
  /** Layout configuration */
  config: LayoutConfig;
  /** Islamic calendar alignment */
  alignment: AlignmentParams;
  /** Output directory (default: 'out') */
  outputDir?: string;
  /** Print verbose info */
  verbose?: boolean;
}

/**
 * Result of the pipeline execution.
 */
export interface PipelineResult {
  /** Path to the final PDF */
  outputPath: string;
  /** Paths to intermediate files (for cleanup) */
  intermediateFiles: string[];
}

/**
 * Run the full calendar generation pipeline.
 */
export async function runPipeline(
  options: PipelineOptions
): Promise<PipelineResult> {
  const { config, alignment, outputDir = 'out', verbose = true } = options;

  // Print alignment info
  if (verbose) {
    printAlignmentInfo(alignment);
    console.log(`Scale factor: ${config.scaleFactor}`);
  }

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Set up builder and PDF generator
  const layout = computeLayout(config);
  const builder = createCalendarBuilder(config, layout);
  const renderer = createResvgRenderer({ dpi: 150 });
  const pdfGenerator = createPdfGenerator({ renderer });

  // Create month instances
  const solarMonths = builder.createSolarMonthInstances();
  const islamicMonths = builder.createIslamicMonthInstances(alignment);

  // Generate calendar pages
  const pdfs: string[] = [];
  const intermediateFiles: string[] = [];
  let pageNum = 0;
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

    const pdfFile = `${outputDir}/calendar_page_${config.scaleFactor}_${pageNum}.pdf`;
    const pdfBytes = await pdfGenerator.svgToPdf(svg);
    await fs.writeFile(pdfFile, pdfBytes);

    pdfs.push(pdfFile);
    intermediateFiles.push(pdfFile);
    monthIdx = endIdx;
    pageNum++;
  }

  // Generate circular cover page
  if (verbose) {
    console.log('Generating cover page...');
  }

  const coverSvg = builder.generateCircleCoverSvg(
    solarMonths,
    islamicMonths,
    alignment.daysElapsed
  );

  const coverPdfFile = `${outputDir}/calendar_page_${config.scaleFactor}_${pageNum}_cover.pdf`;
  const coverPdfBytes = await pdfGenerator.svgToPdf(coverSvg);
  await fs.writeFile(coverPdfFile, coverPdfBytes);
  intermediateFiles.push(coverPdfFile);

  // Generate instructions PDF with cover image
  if (verbose) {
    console.log('Generating instructions PDF...');
  }

  const instructionsPdf = `${outputDir}/instructions.pdf`;
  const coverPngResult = await renderer.render(coverSvg);
  await generateInstructionsPdf(
    coverPdfFile,
    instructionsPdf,
    Buffer.from(coverPngResult.pngBuffer)
  );
  intermediateFiles.push(instructionsPdf);

  // Concatenate all PDFs (instructions first, then calendar pages)
  const outputFile = `${outputDir}/calendar_pages_${config.scaleFactor}_COMPLETE.pdf`;
  await concatPdfs([instructionsPdf, ...pdfs], outputFile);

  if (verbose) {
    console.log(`Wrote the concatenated file: ${outputFile}`);
  }

  return {
    outputPath: outputFile,
    intermediateFiles: [...intermediateFiles, coverPdfFile],
  };
}

/**
 * Clean up intermediate files.
 */
export async function cleanupIntermediateFiles(
  files: string[],
  verbose: boolean = true
): Promise<void> {
  for (const file of files) {
    try {
      if (verbose) {
        console.log(`Removing ${file}...`);
      }
      await fs.unlink(file);
    } catch {
      // File may not exist, ignore
    }
  }
}
