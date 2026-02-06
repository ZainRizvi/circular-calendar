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
    .option('--date <date>', 'Gregorian date (YYYY-MM-DD)')
    .option('--hijri <date>', 'Hijri date (YYYY-MM-DD)')
    .parse(['node', 'make-cal', ...args]);

  return program.opts();
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
      throw new Error('Hijri date must be in YYYY-MM-DD format');
    }
    return getAlignmentParams(undefined, {
      hijriYear: parseInt(parts[0]),
      hijriMonth: parseInt(parts[1]),
      hijriDay: parseInt(parts[2]),
    });
  } else if (args.date) {
    const parts = args.date.split('-');
    if (parts.length !== 3) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }
    return getAlignmentParams(
      new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    );
  }
  return getAlignmentParams();
}
