/**
 * Snapshot verification tests.
 *
 * Compares generated SVG and PNG output against stored snapshots
 * for three fixed dates to ensure consistency.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  createCalendarBuilder,
  computeLayout,
  DEFAULT_LAYOUT_CONFIG,
  getAlignmentParams,
  resetTextPathIdCounter,
} from './lib/index.ts';
import { createResvgRenderer } from './renderers/index.ts';

const SNAPSHOT_DATES = ['2024-10-06', '2026-02-06', '2027-06-06'];
const SNAPSHOTS_DIR = path.join(process.cwd(), 'test_snapshots');

interface GeneratedFiles {
  svgs: Map<string, string>;
  pngs: Map<string, Buffer>;
}

async function generateFilesForDate(dateStr: string): Promise<GeneratedFiles> {
  const date = new Date(dateStr);
  const svgs = new Map<string, string>();
  const pngs = new Map<string, Buffer>();

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

    svgs.set(`page_${pageNum}.svg`, svg);
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
  svgs.set('cover.svg', coverSvg);

  // Generate PNGs
  const renderer = createResvgRenderer({ dpi: 150 });
  for (const [name, svg] of svgs) {
    const result = await renderer.render(svg);
    const pngName = name.replace('.svg', '.png');
    pngs.set(pngName, Buffer.from(result.pngBuffer));
  }

  return { svgs, pngs };
}

async function loadSnapshots(dateStr: string): Promise<GeneratedFiles> {
  const dateDir = path.join(SNAPSHOTS_DIR, dateStr);
  const svgs = new Map<string, string>();
  const pngs = new Map<string, Buffer>();

  const files = await fs.readdir(dateDir);
  for (const file of files) {
    const filePath = path.join(dateDir, file);
    if (file.endsWith('.svg')) {
      svgs.set(file, await fs.readFile(filePath, 'utf-8'));
    } else if (file.endsWith('.png')) {
      pngs.set(file, await fs.readFile(filePath));
    }
  }

  return { svgs, pngs };
}

describe.each(SNAPSHOT_DATES)('Snapshots for %s', (dateStr) => {
  let generated: GeneratedFiles;
  let snapshots: GeneratedFiles;

  beforeAll(async () => {
    generated = await generateFilesForDate(dateStr);
    snapshots = await loadSnapshots(dateStr);
  });

  describe('SVG snapshots', () => {
    it('should have same number of SVG files', () => {
      expect(generated.svgs.size).toBe(snapshots.svgs.size);
    });

    it('should have matching SVG filenames', () => {
      const generatedNames = Array.from(generated.svgs.keys()).sort();
      const snapshotNames = Array.from(snapshots.svgs.keys()).sort();
      expect(generatedNames).toEqual(snapshotNames);
    });

    it.each(['page_0.svg', 'page_1.svg', 'page_2.svg', 'cover.svg'])(
      '%s should match snapshot',
      (filename) => {
        const generatedSvg = generated.svgs.get(filename);
        const snapshotSvg = snapshots.svgs.get(filename);

        expect(generatedSvg).toBeDefined();
        expect(snapshotSvg).toBeDefined();
        expect(generatedSvg).toBe(snapshotSvg);
      }
    );
  });

  // PNG snapshots are skipped in CI because font rendering differs between platforms
  // (macOS vs Linux). SVG snapshots are platform-independent and sufficient for CI.
  describe.skipIf(process.env.CI)('PNG snapshots', () => {
    it('should have same number of PNG files', () => {
      expect(generated.pngs.size).toBe(snapshots.pngs.size);
    });

    it('should have matching PNG filenames', () => {
      const generatedNames = Array.from(generated.pngs.keys()).sort();
      const snapshotNames = Array.from(snapshots.pngs.keys()).sort();
      expect(generatedNames).toEqual(snapshotNames);
    });

    it.each(['page_0.png', 'page_1.png', 'page_2.png', 'cover.png'])(
      '%s should match snapshot',
      (filename) => {
        const generatedPng = generated.pngs.get(filename);
        const snapshotPng = snapshots.pngs.get(filename);

        expect(generatedPng).toBeDefined();
        expect(snapshotPng).toBeDefined();
        expect(generatedPng!.equals(snapshotPng!)).toBe(true);
      }
    );
  });
});
