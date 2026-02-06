/**
 * CLI argument parsing for the calendar generator.
 */

import { Command } from 'commander';
import {
  getAlignmentParams,
  type AlignmentParams,
} from '../lib/islamic-alignment.js';

/**
 * Parsed CLI arguments.
 */
export interface ParsedArgs {
  /** Gregorian date in YYYY-MM-DD format */
  date?: string;
  /** Hijri date in YYYY-MM-DD format */
  hijri?: string;
}

/**
 * Parse command line arguments.
 *
 * @param args - Array of command line arguments (without node and script name)
 * @returns Parsed arguments
 */
export function parseArgs(args: string[]): ParsedArgs {
  const program = new Command();
  program
    .option('--date <date>', 'Gregorian date (YYYY-MM-DD or YY-MM-DD)')
    .option('--hijri <date>', 'Hijri date (YYYY-MM-DD or YY-MM-DD)')
    .parse(['node', 'make-cal', ...args]);

  return program.opts();
}

/**
 * Parse a year string, interpreting 2-digit years as 2000s.
 * @param yearStr - Year string (YY or YYYY)
 * @param century - Century to add for 2-digit years (2000 for Gregorian, 1400 for Hijri)
 */
function parseYear(yearStr: string, century: number): number {
  const year = parseInt(yearStr);
  if (yearStr.length <= 2) {
    return century + year;
  }
  return year;
}

/**
 * Convert parsed args to AlignmentParams.
 *
 * @param args - Parsed CLI arguments
 * @returns AlignmentParams for calendar generation
 */
export function getAlignmentFromArgs(args: ParsedArgs): AlignmentParams {
  if (args.hijri) {
    const parts = args.hijri.split('-');
    if (parts.length !== 3) {
      throw new Error('Hijri date must be in YYYY-MM-DD or YY-MM-DD format');
    }
    return getAlignmentParams(undefined, {
      hijriYear: parseYear(parts[0], 1400),
      hijriMonth: parseInt(parts[1]),
      hijriDay: parseInt(parts[2]),
    });
  } else if (args.date) {
    const parts = args.date.split('-');
    if (parts.length !== 3) {
      throw new Error('Date must be in YYYY-MM-DD or YY-MM-DD format');
    }
    const year = parseYear(parts[0], 2000);
    return getAlignmentParams(
      new Date(year, parseInt(parts[1]) - 1, parseInt(parts[2]))
    );
  }
  return getAlignmentParams();
}
