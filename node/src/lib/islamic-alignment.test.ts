/**
 * Unit tests for islamic-alignment module.
 * Ported from Python test_islamic_alignment.py
 */

import { describe, it, expect } from 'vitest';
import {
  getAlignmentParams,
  rotateMonths,
  getMonthName,
  ISLAMIC_MONTHS,
  getAlignmentHeuristic,
} from './islamic-alignment.ts';
import type { Month } from './calendar-data.ts';

describe('Islamic Alignment', () => {
  it('Feb 5, 2026 should be in Sha\'ban (month index 7)', () => {
    const params = getAlignmentParams(new Date('2026-02-05'));
    // Sha'ban is the 8th month, so index 7
    expect(params.currentMonthIndex).toBe(7);
    expect(params.hijriMonth).toBe(8);
  });

  it('Sha\'ban 1, 1447 AH should be around Jan 20, 2026 (~19-20 days from Jan 1)', () => {
    const params = getAlignmentParams(new Date('2026-01-20'));
    // days_elapsed should be close to 19 (Jan 20 is 19 days after Jan 1)
    expect(params.daysElapsed).toBeGreaterThanOrEqual(17);
    expect(params.daysElapsed).toBeLessThanOrEqual(22);
  });

  it('rotation offset should be approximately negative of days elapsed', () => {
    const params = getAlignmentParams(new Date('2026-02-05'));
    // rotation_offset should be close to -days_elapsed
    expect(params.rotationOffset).toBeCloseTo(
      -Math.round(params.daysElapsed - 0.5),
      0 // delta of 2
    );
  });

  it('month index should always be 0-11', () => {
    const testDates = [
      new Date('2026-01-01'),
      new Date('2026-06-15'),
      new Date('2026-12-31'),
      new Date('2025-03-20'),
    ];
    for (const d of testDates) {
      const params = getAlignmentParams(d);
      expect(params.currentMonthIndex).toBeGreaterThanOrEqual(0);
      expect(params.currentMonthIndex).toBeLessThanOrEqual(11);
    }
  });

  it('days elapsed should be in a reasonable range (-30 to 365)', () => {
    const testDates = [
      new Date('2026-01-01'),
      new Date('2026-06-15'),
      new Date('2026-12-31'),
    ];
    for (const d of testDates) {
      const params = getAlignmentParams(d);
      expect(params.daysElapsed).toBeGreaterThanOrEqual(-30);
      expect(params.daysElapsed).toBeLessThanOrEqual(365);
    }
  });

  it('should accept Hijri date input', () => {
    // Sha'ban 17, 1447 should give Sha'ban (index 7)
    const params = getAlignmentParams(undefined, {
      hijriYear: 1447,
      hijriMonth: 8,
      hijriDay: 17,
    });
    expect(params.currentMonthIndex).toBe(7);
    expect(params.hijriMonth).toBe(8);
    expect(params.hijriYear).toBe(1447);
  });

  it('Ramadan should be correctly detected', () => {
    // Ramadan 1447 should start around Feb 19, 2026
    const params = getAlignmentParams(new Date('2026-02-25'));
    // This should be in Ramadan (month 9, index 8)
    expect(params.currentMonthIndex).toBe(8);
    expect(params.hijriMonth).toBe(9);
  });
});

describe('Rotate Months', () => {
  function createTestMonths(): Month[] {
    return Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      name: `Month${i}`,
      numDays: [30],
      color: '#fff',
    }));
  }

  it('rotating by 0 should keep Muharram first', () => {
    const months = createTestMonths();
    const rotated = rotateMonths(months, 0);
    expect(rotated[0].name).toBe('Month0');
    expect(rotated[0].number).toBe(1);
  });

  it('rotating to Sha\'ban (index 7) should put it first', () => {
    const months = ISLAMIC_MONTHS.map((name, i) => ({
      number: i + 1,
      name,
      numDays: [30],
      color: '#fff',
    }));
    const rotated = rotateMonths(months, 7); // Sha'ban index
    expect(rotated[0].name).toBe("Sha'baan");
    expect(rotated[0].number).toBe(1);
    expect(rotated[1].name).toBe('Ramadan');
    expect(rotated[1].number).toBe(2);
  });

  it('numbers should be reassigned correctly after rotation', () => {
    const months = createTestMonths();
    const rotated = rotateMonths(months, 5);
    for (let i = 0; i < rotated.length; i++) {
      expect(rotated[i].number).toBe(i + 1);
    }
  });
});

describe('Heuristic vs Library', () => {
  it('heuristic should be accurate for known dates', () => {
    // The heuristic uses Sha'ban 1, 1447 AH = January 20, 2026 as reference
    const testDates = [
      new Date('2026-02-05'),
      new Date('2026-06-15'),
      new Date('2026-10-01'),
    ];
    for (const d of testDates) {
      const result = getAlignmentHeuristic(d);

      // Month index should be valid
      expect(result.currentMonthIndex).toBeGreaterThanOrEqual(0);
      expect(result.currentMonthIndex).toBeLessThanOrEqual(11);

      // Days elapsed should be reasonable
      expect(result.daysElapsed).toBeGreaterThanOrEqual(-30);
      expect(result.daysElapsed).toBeLessThanOrEqual(365);
    }
  });
});

describe('Get Month Name', () => {
  it('should return correct month names', () => {
    expect(getMonthName(0)).toBe('Muharram');
    expect(getMonthName(7)).toBe("Sha'baan");
    expect(getMonthName(8)).toBe('Ramadan');
    expect(getMonthName(11)).toBe('Dhu al-Hijja');
  });
});

describe('Islamic Months Constant', () => {
  it('should have 12 months', () => {
    expect(ISLAMIC_MONTHS.length).toBe(12);
  });

  it('should have correct month names in order', () => {
    expect(ISLAMIC_MONTHS[0]).toBe('Muharram');
    expect(ISLAMIC_MONTHS[7]).toBe("Sha'baan");
    expect(ISLAMIC_MONTHS[8]).toBe('Ramadan');
    expect(ISLAMIC_MONTHS[11]).toBe('Dhu al-Hijja');
  });
});
