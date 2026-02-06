#!/usr/bin/env npx tsx
/**
 * Generate SVG and PNG snapshots for testing.
 *
 * Usage: npx tsx scripts/generate-snapshots.ts
 *
 * Generates snapshots for three fixed dates:
 * - 2024-10-06 (past)
 * - 2026-02-06 (present)
 * - 2027-06-06 (future)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  createCalendarBuilder,
  computeLayout,
  DEFAULT_LAYOUT_CONFIG,
  getAlignmentParams,
  resetTextPathIdCounter,
} from '../src/lib/index.js';
import { createResvgRenderer } from '../src/renderers/index.js';

const SNAPSHOT_DATES = ['2024-10-06', '2026-02-06', '2027-06-06'];
const SNAPSHOTS_DIR = path.join(process.cwd(), 'test_snapshots');

async function generateSnapshotsForDate(dateStr: string): Promise<void> {
  const date = new Date(dateStr);
  const dateDir = path.join(SNAPSHOTS_DIR, dateStr);

  console.log(`\nGenerating snapshots for ${dateStr}...`);

  // Create directory
  await fs.mkdir(dateDir, { recursive: true });

  // Set up builder
  const config = DEFAULT_LAYOUT_CONFIG;
  const layout = computeLayout(config);
  const builder = createCalendarBuilder(config, layout);
  const alignment = getAlignmentParams(date);

  // Create month instances
  const solarMonths = builder.createSolarMonthInstances();
  const islamicMonths = builder.createIslamicMonthInstances(alignment);

  // Generate calendar page SVGs
  let pageNum = 0;
  let monthIdx = 0;

  while (monthIdx < solarMonths.length - 1) {
    resetTextPathIdCounter();

    const startIdx = monthIdx;
    const endIdx = Math.min(
      monthIdx + layout.numRows * layout.numColumns,
      solarMonths.length
    );

    const svg = builder.generateCalendarSvg(
      solarMonths.slice(startIdx, endIdx),
      islamicMonths.slice(startIdx, endIdx)
    );

    const svgFile = path.join(dateDir, `page_${pageNum}.svg`);
    await fs.writeFile(svgFile, svg);
    console.log(`  Created ${path.basename(svgFile)}`);

    monthIdx = endIdx;
    pageNum++;
  }

  // Generate cover SVG
  resetTextPathIdCounter();
  const coverSvg = builder.generateCircleCoverSvg(
    solarMonths,
    islamicMonths,
    alignment.daysElapsed
  );
  const coverSvgFile = path.join(dateDir, 'cover.svg');
  await fs.writeFile(coverSvgFile, coverSvg);
  console.log(`  Created cover.svg`);

  // Generate PNG snapshots from SVGs
  const renderer = createResvgRenderer({ dpi: 150 });

  const svgFiles = await fs.readdir(dateDir);
  for (const file of svgFiles) {
    if (file.endsWith('.svg')) {
      const svgPath = path.join(dateDir, file);
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      const result = await renderer.render(svgContent);

      const pngFile = path.join(dateDir, file.replace('.svg', '.png'));
      await fs.writeFile(pngFile, Buffer.from(result.pngBuffer));
      console.log(`  Created ${path.basename(pngFile)}`);
    }
  }
}

async function main(): Promise<void> {
  console.log('Generating test snapshots...');
  console.log(`Output directory: ${SNAPSHOTS_DIR}`);

  // Clean existing snapshots (but keep old format for now during migration)
  for (const dateStr of SNAPSHOT_DATES) {
    const dateDir = path.join(SNAPSHOTS_DIR, dateStr);
    try {
      await fs.rm(dateDir, { recursive: true });
    } catch {
      // Directory may not exist
    }
  }

  // Generate snapshots for each date
  for (const dateStr of SNAPSHOT_DATES) {
    await generateSnapshotsForDate(dateStr);
  }

  console.log('\nDone! Snapshots generated successfully.');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
