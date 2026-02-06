/**
 * Islamic Calendar Alignment Module
 *
 * Calculates alignment parameters for overlaying the Islamic (Hijri) calendar
 * on the Gregorian calendar, automatically determining the current Islamic month
 * and its position relative to January 1.
 *
 * Ported from Python islamic_alignment.py
 */

import type { Month } from './calendar-data.ts';

/**
 * Canonical Islamic month names (1-indexed, Muharram is month 1)
 */
export const ISLAMIC_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi ath-Thani',
  'Jumada al-Awwal',
  'Jumada ath-Thani',
  'Rajab',
  "Sha'baan",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qa'dah",
  'Dhu al-Hijja',
];

/**
 * Parameters needed to align the Islamic calendar.
 */
export interface AlignmentParams {
  currentMonthIndex: number; // 0-based index of current Islamic month (0=Muharram)
  daysElapsed: number; // Days from Jan 1 to start of current Islamic month
  rotationOffset: number; // Rotation offset for date numbers (approx -daysElapsed)
  gregorianDate: Date; // The Gregorian date used for calculation
  hijriMonth: number; // 1-based Hijri month number
  hijriYear: number; // Hijri year
}

/**
 * Input options for Hijri date specification.
 */
export interface HijriDateInput {
  hijriYear: number;
  hijriMonth: number;
  hijriDay: number;
}

/**
 * Calculate alignment parameters for the Islamic calendar.
 *
 * @param gregorianDate - Gregorian date to align to (defaults to today)
 * @param hijriDate - Optional Hijri date to use instead
 * @returns AlignmentParams with all values needed for calendar generation
 */
export function getAlignmentParams(
  gregorianDate?: Date,
  hijriDate?: HijriDateInput
): AlignmentParams {
  // Use heuristic calculation (no external library dependency)
  return getAlignmentHeuristic(gregorianDate, hijriDate);
}

/**
 * Average lunar month length in days.
 */
const LUNAR_MONTH_DAYS = 29.530588853;

/**
 * Calculate alignment using a heuristic based on a known reference point.
 *
 * Reference: Sha'ban 1, 1447 AH = January 20, 2026
 */
export function getAlignmentHeuristic(
  gregorianDate?: Date,
  hijriDate?: HijriDateInput
): AlignmentParams {
  // Handle Hijri date input
  if (hijriDate) {
    // Convert Hijri date to approximate Gregorian date
    const referenceDate = new Date('2026-01-20');
    const referenceHijriYear = 1447;
    const referenceHijriMonth = 8; // Sha'ban

    // Calculate months from reference to target Hijri date
    const targetMonthsFromMuharram =
      (hijriDate.hijriYear - 1) * 12 + (hijriDate.hijriMonth - 1);
    const refMonthsFromMuharram =
      (referenceHijriYear - 1) * 12 + (referenceHijriMonth - 1);
    const monthsDiff = targetMonthsFromMuharram - refMonthsFromMuharram;

    // Add days for the specific day in the month
    const daysDiff = monthsDiff * LUNAR_MONTH_DAYS + (hijriDate.hijriDay - 1);
    gregorianDate = new Date(referenceDate.getTime() + daysDiff * 86400000);
  }

  if (!gregorianDate) {
    gregorianDate = new Date();
  }

  // Reference point: Sha'ban 1, 1447 AH = January 20, 2026
  const referenceDate = new Date('2026-01-20');
  const referenceHijriYear = 1447;
  const referenceHijriMonth = 8; // Sha'ban

  // Days since reference
  const daysDiff = Math.floor(
    (gregorianDate.getTime() - referenceDate.getTime()) / 86400000
  );

  // Calculate months elapsed (can be negative for dates before reference)
  const monthsElapsed = daysDiff / LUNAR_MONTH_DAYS;

  // Calculate month offset from Sha'ban
  let monthOffset: number;
  if (monthsElapsed >= 0) {
    monthOffset = Math.floor(monthsElapsed);
  } else {
    monthOffset =
      monthsElapsed === Math.floor(monthsElapsed)
        ? Math.floor(monthsElapsed)
        : Math.floor(monthsElapsed);
  }

  // Calculate current Hijri month (1-12)
  const currentHijriMonth =
    ((referenceHijriMonth - 1 + monthOffset) % 12 + 12) % 12 + 1;

  // Calculate Hijri year
  const totalMonthsFromMuharramRef = referenceHijriMonth - 1 + monthOffset;
  const yearOffset = Math.floor(totalMonthsFromMuharramRef / 12);
  const currentHijriYear = referenceHijriYear + yearOffset;

  // Estimate first day of current Islamic month
  const daysSinceRefStart = monthOffset * LUNAR_MONTH_DAYS;
  const firstOfCurrentMonth = new Date(
    referenceDate.getTime() + daysSinceRefStart * 86400000
  );

  // Days from Jan 1
  const jan1 = new Date(gregorianDate.getFullYear(), 0, 1);
  const daysElapsed = Math.floor(
    (firstOfCurrentMonth.getTime() - jan1.getTime()) / 86400000
  );

  const currentMonthIndex = currentHijriMonth - 1;
  const rotationOffset = -Math.round(daysElapsed);

  return {
    currentMonthIndex,
    daysElapsed: daysElapsed + 0.5, // Add 0.5 for visual centering
    rotationOffset,
    gregorianDate,
    hijriMonth: currentHijriMonth,
    hijriYear: currentHijriYear,
  };
}

/**
 * Rotate a list of months so that startMonthIndex becomes first.
 *
 * @param months - List of Month objects in canonical order (Muharram first)
 * @param startMonthIndex - 0-based index of month to place first
 * @returns New list with months rotated and numbers reassigned for correct orientation
 */
export function rotateMonths(months: Month[], startMonthIndex: number): Month[] {
  const n = months.length;
  const rotated: Month[] = [];

  for (let i = 0; i < n; i++) {
    const originalIndex = (startMonthIndex + i) % n;
    const originalMonth = months[originalIndex];

    // Reassign number (1-12) based on new position for text orientation
    // Numbers 4-9 will be upside down (bottom half of circle)
    const newNumber = i + 1;

    // Create new Month with updated number but same name/color
    rotated.push({
      ...originalMonth,
      number: newNumber,
    });
  }

  return rotated;
}

/**
 * Get Islamic month name by 0-based index.
 */
export function getMonthName(index: number): string {
  return ISLAMIC_MONTHS[index];
}

/**
 * Print alignment parameters for debugging/verification.
 */
export function printAlignmentInfo(params: AlignmentParams): void {
  const monthName = ISLAMIC_MONTHS[params.currentMonthIndex];
  console.log('=== Islamic Calendar Alignment ===');
  console.log(`Gregorian date: ${params.gregorianDate.toISOString().split('T')[0]}`);
  console.log(`Hijri date: ${monthName} ${params.hijriYear} AH`);
  console.log(`Current month index: ${params.currentMonthIndex} (${monthName})`);
  console.log(`Days elapsed from Jan 1: ${params.daysElapsed.toFixed(1)}`);
  console.log(`Rotation offset: ${params.rotationOffset}`);
  console.log('==================================');
}
