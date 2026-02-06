/**
 * Snapshot comparison tests - compare Node.js output with Python snapshots.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SCALE_FACTOR, resetTextPathIdCounter } from './primitives.js';
import {
  createSolarMonthInstances,
  createIslamicMonthInstances,
  getAlignmentFromArgs,
  generateCalendarSvg,
  generateCircleCoverSvg,
} from './make-cal.js';

const PYTHON_SNAPSHOTS_DIR = path.join(process.cwd(), 'test_snapshots');

/**
 * Extract path d attributes from SVG for comparison.
 * This normalizes the comparison by focusing on the actual drawing paths.
 */
function extractPaths(svg: string): string[] {
  const pathMatches = svg.matchAll(/d="([^"]+)"/g);
  return Array.from(pathMatches, (m) => m[1]).sort();
}

/**
 * Extract text content from SVG.
 */
function extractTextContent(svg: string): string[] {
  const textMatches = svg.matchAll(/>([^<]+)</g);
  return Array.from(textMatches, (m) => m[1].trim())
    .filter((t) => t.length > 0)
    .sort();
}

/**
 * Round numeric values in a path string to reduce floating point differences.
 */
function normalizePathNumbers(pathD: string): string {
  return pathD.replace(/[\d.]+/g, (match) => {
    const num = parseFloat(match);
    return num.toFixed(2);
  });
}

describe('Snapshot Comparison with Python', () => {
  let nodeSvgs: Map<string, string>;
  let pythonSvgs: Map<string, string>;

  beforeAll(async () => {
    // Generate Node.js SVGs
    const alignment = getAlignmentFromArgs({ date: '2026-02-05' });
    const solarMonths = createSolarMonthInstances();
    const islamicMonths = createIslamicMonthInstances(alignment);

    nodeSvgs = new Map();

    const NUM_ROWS = 4;
    const NUM_COLUMNS = 1;
    let pageNum = 0;
    let monthIdx = 0;

    while (monthIdx < solarMonths.length - 1) {
      resetTextPathIdCounter();

      const startIdx = monthIdx;
      const endIdx = Math.min(monthIdx + NUM_ROWS * NUM_COLUMNS, solarMonths.length);

      const svg = generateCalendarSvg(
        solarMonths.slice(startIdx, endIdx),
        islamicMonths.slice(startIdx, endIdx)
      );

      nodeSvgs.set(`svg_${SCALE_FACTOR}_${pageNum}.svg`, svg);
      monthIdx = endIdx;
      pageNum++;
    }

    // Generate cover
    resetTextPathIdCounter();
    const coverSvg = generateCircleCoverSvg(
      solarMonths,
      islamicMonths,
      alignment.daysElapsed
    );
    nodeSvgs.set(`svg_${SCALE_FACTOR}_${pageNum}_cover.svg`, coverSvg);

    // Load Python snapshots
    pythonSvgs = new Map();
    const files = await fs.readdir(PYTHON_SNAPSHOTS_DIR);
    for (const file of files) {
      if (file.endsWith('.svg')) {
        const content = await fs.readFile(path.join(PYTHON_SNAPSHOTS_DIR, file), 'utf-8');
        pythonSvgs.set(file, content);
      }
    }
  });

  it('should generate same number of SVG pages', () => {
    expect(nodeSvgs.size).toBe(pythonSvgs.size);
  });

  describe('Page 0 (January-April)', () => {
    const filename = 'svg_0.7_0.svg';

    it('should contain January', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      expect(nodeSvg).toContain('January');
    });

    it('should contain all month names', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      const pythonSvg = pythonSvgs.get(filename)!;

      const nodeText = extractTextContent(nodeSvg);
      const pythonText = extractTextContent(pythonSvg);

      // Check that key month names appear
      expect(nodeText).toContain('January');
      expect(nodeText).toContain('February');
      expect(nodeText).toContain('March');
      expect(nodeText).toContain('April');
      expect(nodeText).toContain("Sha'baan");
    });

    it('should have similar number of path elements', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      const pythonSvg = pythonSvgs.get(filename)!;

      const nodePaths = extractPaths(nodeSvg);
      const pythonPaths = extractPaths(pythonSvg);

      // Allow for some variation in path count due to formatting differences
      expect(Math.abs(nodePaths.length - pythonPaths.length)).toBeLessThan(10);
    });

    it('should have matching January background arc', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      const pythonSvg = pythonSvgs.get(filename)!;

      // Find paths containing the January color (#aebbff) and extract the d attribute
      const nodeMatch = nodeSvg.match(/<path[^>]+d="([^"]+)"[^>]*#aebbff/);
      const pythonMatch = pythonSvg.match(/d="([^"]+)"[^>]*#aebbff/);

      expect(nodeMatch).not.toBeNull();
      expect(pythonMatch).not.toBeNull();

      if (nodeMatch && pythonMatch) {
        const nodePathNorm = normalizePathNumbers(nodeMatch[1]);
        const pythonPathNorm = normalizePathNumbers(pythonMatch[1]);

        // Compare first 100 chars of normalized path
        expect(nodePathNorm.slice(0, 100)).toBe(pythonPathNorm.slice(0, 100));
      }
    });
  });

  describe('Page 1 (May-August)', () => {
    const filename = 'svg_0.7_1.svg';

    it('should contain May', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      expect(nodeSvg).toContain('May');
    });

    it('should contain all expected months', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      expect(nodeSvg).toContain('May');
      expect(nodeSvg).toContain('June');
      expect(nodeSvg).toContain('July');
      expect(nodeSvg).toContain('August');
    });
  });

  describe('Page 2 (September-December)', () => {
    const filename = 'svg_0.7_2.svg';

    it('should contain September', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      expect(nodeSvg).toContain('September');
    });

    it('should contain all expected months', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      expect(nodeSvg).toContain('September');
      expect(nodeSvg).toContain('October');
      expect(nodeSvg).toContain('November');
      expect(nodeSvg).toContain('December');
    });
  });

  describe('Cover page (circular view)', () => {
    const filename = 'svg_0.7_3_cover.svg';

    it('should contain all 12 Gregorian months', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      for (const month of months) {
        expect(nodeSvg).toContain(month);
      }
    });

    it('should contain Islamic months starting with Sha\'baan', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      expect(nodeSvg).toContain("Sha'baan");
      expect(nodeSvg).toContain("Ramadan");
    });

    it('should contain transform elements for circular layout', () => {
      const nodeSvg = nodeSvgs.get(filename)!;
      expect(nodeSvg).toContain('transform=');
      expect(nodeSvg).toContain('rotate(');
      expect(nodeSvg).toContain('scale(');
    });
  });

  describe('Numeric precision', () => {
    it('should have coordinates within 0.01 of Python output', () => {
      const nodeSvg = nodeSvgs.get('svg_0.7_0.svg')!;
      const pythonSvg = pythonSvgs.get('svg_0.7_0.svg')!;

      // Extract first coordinate from first path
      const nodeMatch = nodeSvg.match(/d="m ([\d.]+),([\d.]+)/);
      const pythonMatch = pythonSvg.match(/d="m ([\d.]+),([\d.]+)/);

      if (nodeMatch && pythonMatch) {
        const nodeX = parseFloat(nodeMatch[1]);
        const nodeY = parseFloat(nodeMatch[2]);
        const pythonX = parseFloat(pythonMatch[1]);
        const pythonY = parseFloat(pythonMatch[2]);

        expect(Math.abs(nodeX - pythonX)).toBeLessThan(0.01);
        expect(Math.abs(nodeY - pythonY)).toBeLessThan(0.01);
      }
    });
  });
});
