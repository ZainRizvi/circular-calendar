/**
 * Tests for make-cal module (main entry point).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseArgs,
  getAlignmentFromArgs,
  createSolarMonthInstances,
  createIslamicMonthInstances,
  dateRotation,
  generateCalendarSvg,
  generateCircleCoverSvg,
} from './make-cal.js';
import { SCALE_FACTOR, resetTextPathIdCounter } from './primitives.js';
import * as path from 'path';
import * as fs from 'fs/promises';

const TEST_OUT_DIR = path.join(process.cwd(), 'test_output_make_cal');

beforeEach(async () => {
  resetTextPathIdCounter();
  await fs.mkdir(TEST_OUT_DIR, { recursive: true });
});

afterEach(async () => {
  try {
    await fs.rm(TEST_OUT_DIR, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
});

describe('parseArgs', () => {
  it('should parse --date argument', () => {
    const args = parseArgs(['--date', '2026-02-05']);
    expect(args.date).toBe('2026-02-05');
    expect(args.hijri).toBeUndefined();
  });

  it('should parse --hijri argument', () => {
    const args = parseArgs(['--hijri', '1447-08-17']);
    expect(args.hijri).toBe('1447-08-17');
    expect(args.date).toBeUndefined();
  });

  it('should return undefined for both when no arguments', () => {
    const args = parseArgs([]);
    expect(args.date).toBeUndefined();
    expect(args.hijri).toBeUndefined();
  });
});

describe('getAlignmentFromArgs', () => {
  it('should use current date when no arguments', () => {
    const alignment = getAlignmentFromArgs({});
    expect(alignment.currentMonthIndex).toBeGreaterThanOrEqual(0);
    expect(alignment.currentMonthIndex).toBeLessThanOrEqual(11);
  });

  it('should use specified Gregorian date', () => {
    const alignment = getAlignmentFromArgs({ date: '2026-02-05' });
    expect(alignment.currentMonthIndex).toBe(7); // Sha'ban
    expect(alignment.hijriMonth).toBe(8);
  });

  it('should use specified Hijri date', () => {
    const alignment = getAlignmentFromArgs({ hijri: '1447-08-17' });
    expect(alignment.hijriMonth).toBe(8);
    expect(alignment.hijriYear).toBe(1447);
  });

  it('should throw on invalid date format', () => {
    expect(() => getAlignmentFromArgs({ date: '2026-02' })).toThrow();
  });

  it('should throw on invalid hijri format', () => {
    expect(() => getAlignmentFromArgs({ hijri: '1447-08' })).toThrow();
  });
});

describe('dateRotation', () => {
  it('should return 0 for month 1', () => {
    const rotation = dateRotation({ number: 1, name: 'Jan', numDays: [31], color: '#fff' });
    expect(rotation).toBeCloseTo(0);
  });

  it('should return -30 for month 2', () => {
    const rotation = dateRotation({ number: 2, name: 'Feb', numDays: [29], color: '#fff' });
    expect(rotation).toBe(-30); // -1 * (2-1) * (360/12) = -30
  });

  it('should return -180 for month 7', () => {
    const rotation = dateRotation({ number: 7, name: 'Jul', numDays: [31], color: '#fff' });
    expect(rotation).toBe(-180); // -1 * (7-1) * (360/12) = -180
  });
});

describe('createSolarMonthInstances', () => {
  it('should create 12 month instances', () => {
    const instances = createSolarMonthInstances();
    expect(instances.length).toBe(12);
  });

  it('should set nameUpsideDown for months 4-9', () => {
    const instances = createSolarMonthInstances();
    // Indices 3-8 should be upside down (April-September)
    expect(instances[0].nameUpsideDown).toBe(false); // Jan
    expect(instances[2].nameUpsideDown).toBe(false); // Mar
    expect(instances[3].nameUpsideDown).toBe(true); // Apr
    expect(instances[8].nameUpsideDown).toBe(true); // Sep
    expect(instances[9].nameUpsideDown).toBe(false); // Oct
  });

  it('should set dateOnTop to false for solar months', () => {
    const instances = createSolarMonthInstances();
    for (const instance of instances) {
      expect(instance.dateOnTop).toBe(false);
    }
  });
});

describe('createIslamicMonthInstances', () => {
  const alignment = getAlignmentFromArgs({ date: '2026-02-05' });

  it('should create 12 month instances', () => {
    const instances = createIslamicMonthInstances(alignment);
    expect(instances.length).toBe(12);
  });

  it('should set dateOnTop to true for Islamic months', () => {
    const instances = createIslamicMonthInstances(alignment);
    for (const instance of instances) {
      expect(instance.dateOnTop).toBe(true);
    }
  });

  it('should apply Islamic rotation offset to dateAngleOffset', () => {
    const instances = createIslamicMonthInstances(alignment);
    // First month should have rotation offset based on days elapsed
    expect(instances[0].dateAngleOffset).not.toBe(0);
  });
});

describe('generateCalendarSvg', () => {
  it('should generate valid SVG string', () => {
    const solarMonths = createSolarMonthInstances();
    const alignment = getAlignmentFromArgs({ date: '2026-02-05' });
    const islamicMonths = createIslamicMonthInstances(alignment);

    const svg = generateCalendarSvg(solarMonths.slice(0, 4), islamicMonths.slice(0, 4));

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should include month arcs', () => {
    const solarMonths = createSolarMonthInstances();
    const alignment = getAlignmentFromArgs({ date: '2026-02-05' });
    const islamicMonths = createIslamicMonthInstances(alignment);

    const svg = generateCalendarSvg(solarMonths.slice(0, 2), islamicMonths.slice(0, 2));

    // Should contain path elements for month arcs
    expect(svg).toContain('<path');
    // Should contain text elements for month names and dates
    expect(svg).toContain('<text');
  });
});

describe('generateCircleCoverSvg', () => {
  it('should generate valid SVG string', () => {
    const solarMonths = createSolarMonthInstances();
    const alignment = getAlignmentFromArgs({ date: '2026-02-05' });
    const islamicMonths = createIslamicMonthInstances(alignment);

    const svg = generateCircleCoverSvg(solarMonths, islamicMonths, alignment.daysElapsed);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should contain transformed groups for circular arrangement', () => {
    const solarMonths = createSolarMonthInstances();
    const alignment = getAlignmentFromArgs({ date: '2026-02-05' });
    const islamicMonths = createIslamicMonthInstances(alignment);

    const svg = generateCircleCoverSvg(solarMonths, islamicMonths, alignment.daysElapsed);

    // Should contain group elements with transforms for circular layout
    expect(svg).toContain('<g');
    expect(svg).toContain('transform=');
  });
});

describe('Integration', () => {
  it('should match expected structure for fixed date', async () => {
    const solarMonths = createSolarMonthInstances();
    const alignment = getAlignmentFromArgs({ date: '2026-02-05' });
    const islamicMonths = createIslamicMonthInstances(alignment);

    // Generate first page SVG
    const svg = generateCalendarSvg(solarMonths.slice(0, 4), islamicMonths.slice(0, 4));

    // Write to test output for inspection
    await fs.writeFile(path.join(TEST_OUT_DIR, 'test_page_0.svg'), svg);

    // Verify basic structure
    expect(svg).toContain('January');
    expect(svg).toContain('February');
    expect(svg).toContain('March');
    expect(svg).toContain('April');

    // Verify Islamic month name appears (Sha'ban should be first due to rotation)
    expect(svg).toContain("Sha'baan");
  });
});
