/**
 * Tests for CLI argument parsing.
 */

import { describe, it, expect } from 'vitest';
import { parseArgs, getAlignmentFromArgs, type ParsedArgs } from './args.js';

describe('parseArgs', () => {
  it('should parse empty args', () => {
    const result = parseArgs([]);
    expect(result.date).toBeUndefined();
    expect(result.hijri).toBeUndefined();
  });

  it('should parse --date flag', () => {
    const result = parseArgs(['--date', '2026-02-05']);
    expect(result.date).toBe('2026-02-05');
  });

  it('should parse --hijri flag', () => {
    const result = parseArgs(['--hijri', '1447-08-17']);
    expect(result.hijri).toBe('1447-08-17');
  });

  it('should handle both flags', () => {
    const result = parseArgs(['--date', '2026-02-05', '--hijri', '1447-08-17']);
    expect(result.date).toBe('2026-02-05');
    expect(result.hijri).toBe('1447-08-17');
  });
});

describe('getAlignmentFromArgs', () => {
  it('should return today alignment for empty args', () => {
    const args: ParsedArgs = {};
    const alignment = getAlignmentFromArgs(args);

    expect(alignment).toHaveProperty('currentMonthIndex');
    expect(alignment).toHaveProperty('daysElapsed');
    expect(alignment).toHaveProperty('rotationOffset');
    expect(alignment).toHaveProperty('gregorianDate');
  });

  it('should handle --date flag', () => {
    const args: ParsedArgs = { date: '2026-02-05' };
    const alignment = getAlignmentFromArgs(args);

    // Feb 5, 2026 is in Sha'ban (month 8, index 7)
    expect(alignment.currentMonthIndex).toBe(7);
    expect(alignment.hijriMonth).toBe(8);
  });

  it('should handle --hijri flag', () => {
    const args: ParsedArgs = { hijri: '1447-08-17' };
    const alignment = getAlignmentFromArgs(args);

    expect(alignment.currentMonthIndex).toBe(7);
    expect(alignment.hijriMonth).toBe(8);
    expect(alignment.hijriYear).toBe(1447);
  });

  it('should prefer --hijri over --date', () => {
    const args: ParsedArgs = { date: '2026-01-01', hijri: '1447-08-17' };
    const alignment = getAlignmentFromArgs(args);

    // Should use the hijri date
    expect(alignment.currentMonthIndex).toBe(7);
    expect(alignment.hijriYear).toBe(1447);
  });

  it('should throw on invalid date format', () => {
    const args: ParsedArgs = { date: '2026-02' };
    expect(() => getAlignmentFromArgs(args)).toThrow('YYYY-MM-DD');
  });

  it('should throw on invalid hijri format', () => {
    const args: ParsedArgs = { hijri: '1447-08' };
    expect(() => getAlignmentFromArgs(args)).toThrow('YYYY-MM-DD');
  });
});
