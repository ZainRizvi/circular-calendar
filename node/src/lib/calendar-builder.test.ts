/**
 * Tests for calendar-builder module.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCalendarBuilder,
  dateRotation,
  type CalendarBuilder,
} from './calendar-builder.ts';
import { DEFAULT_LAYOUT_CONFIG, computeLayout } from './config.ts';
import { resetTextPathIdCounter } from './primitives.ts';
import { getAlignmentParams } from './islamic-alignment.ts';

beforeEach(() => {
  resetTextPathIdCounter();
});

describe('dateRotation', () => {
  it('should return 0 for month number 1', () => {
    expect(dateRotation({ number: 1 })).toBeCloseTo(0);
  });

  it('should return -30 for month number 2', () => {
    // -1 * (2-1) * (360/12) = -1 * 1 * 30 = -30
    expect(dateRotation({ number: 2 })).toBe(-30);
  });

  it('should return -330 for month number 12', () => {
    // -1 * (12-1) * (360/12) = -1 * 11 * 30 = -330
    expect(dateRotation({ number: 12 })).toBe(-330);
  });
});

describe('CalendarBuilder', () => {
  let builder: CalendarBuilder;

  beforeEach(() => {
    const config = DEFAULT_LAYOUT_CONFIG;
    const layout = computeLayout(config);
    builder = createCalendarBuilder(config, layout);
  });

  describe('createSolarMonthInstances', () => {
    it('should create 12 month instances', () => {
      const months = builder.createSolarMonthInstances();
      expect(months.length).toBe(12);
    });

    it('should set dateOnTop to false for solar months', () => {
      const months = builder.createSolarMonthInstances();
      for (const month of months) {
        expect(month.dateOnTop).toBe(false);
      }
    });

    it('should set nameUpsideDown for months 4-9 (index 3-8)', () => {
      const months = builder.createSolarMonthInstances();
      // Months at indices 3-8 should be upside down
      expect(months[0].nameUpsideDown).toBe(false); // Jan
      expect(months[2].nameUpsideDown).toBe(false); // Mar
      expect(months[3].nameUpsideDown).toBe(true); // Apr
      expect(months[8].nameUpsideDown).toBe(true); // Sep
      expect(months[9].nameUpsideDown).toBe(false); // Oct
    });

    it('should include correct month names', () => {
      const months = builder.createSolarMonthInstances();
      expect(months[0].name).toBe('January');
      expect(months[11].name).toBe('December');
    });
  });

  describe('createIslamicMonthInstances', () => {
    it('should create 12 month instances', () => {
      const alignment = getAlignmentParams(new Date('2026-02-05'));
      const months = builder.createIslamicMonthInstances(alignment);
      expect(months.length).toBe(12);
    });

    it('should set dateOnTop to true for Islamic months', () => {
      const alignment = getAlignmentParams(new Date('2026-02-05'));
      const months = builder.createIslamicMonthInstances(alignment);
      for (const month of months) {
        expect(month.dateOnTop).toBe(true);
      }
    });

    it('should rotate to current month', () => {
      // Feb 5, 2026 is in Sha'ban
      const alignment = getAlignmentParams(new Date('2026-02-05'));
      const months = builder.createIslamicMonthInstances(alignment);
      expect(months[0].name).toBe("Sha'baan");
    });
  });

  describe('generateCalendarSvg', () => {
    it('should generate valid SVG', () => {
      const solarMonths = builder.createSolarMonthInstances().slice(0, 2);
      const alignment = getAlignmentParams(new Date('2026-02-05'));
      const islamicMonths = builder
        .createIslamicMonthInstances(alignment)
        .slice(0, 2);

      const svg = builder.generateCalendarSvg(solarMonths, islamicMonths);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    it('should include month names', () => {
      const solarMonths = builder.createSolarMonthInstances().slice(0, 1);
      const alignment = getAlignmentParams(new Date('2026-02-05'));
      const islamicMonths = builder
        .createIslamicMonthInstances(alignment)
        .slice(0, 1);

      const svg = builder.generateCalendarSvg(solarMonths, islamicMonths);

      expect(svg).toContain('January');
      expect(svg).toContain("Sha'baan");
    });
  });

  describe('generateCircleCoverSvg', () => {
    it('should generate valid SVG', () => {
      const solarMonths = builder.createSolarMonthInstances();
      const alignment = getAlignmentParams(new Date('2026-02-05'));
      const islamicMonths = builder.createIslamicMonthInstances(alignment);

      const svg = builder.generateCircleCoverSvg(
        solarMonths,
        islamicMonths,
        alignment.daysElapsed
      );

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should include rotation transforms', () => {
      const solarMonths = builder.createSolarMonthInstances();
      const alignment = getAlignmentParams(new Date('2026-02-05'));
      const islamicMonths = builder.createIslamicMonthInstances(alignment);

      const svg = builder.generateCircleCoverSvg(
        solarMonths,
        islamicMonths,
        alignment.daysElapsed
      );

      expect(svg).toContain('rotate(');
      expect(svg).toContain('scale(');
    });
  });
});
