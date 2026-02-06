/**
 * Calendar data structures and constants.
 * Ported from Python calendar_data.py
 */

/**
 * Settings to build a specific month for rendering.
 */
export interface MonthInstance {
  name: string;
  numDays: number;
  color: string; // fill color
  nameUpsideDown: boolean; // if the name should be upside down
  dateOnTop: boolean; // should dates be placed up top or down below?
  dateBoxHeight: number; // height of the date box
  innerRadius: number;
  outerRadius: number;
  dateAngleOffset: number;
}

/**
 * Shared layout settings for calendar rendering.
 */
export interface CalendarSettings {
  dateOnTop: boolean;
  dateBoxHeight: number;
  innerRadius: number;
  outerRadius: number;
  daysInYear: number;
}

/**
 * Month definition in canonical order.
 */
export interface Month {
  number: number; // 1-12
  name: string;
  numDays: number[]; // each item results in a different month printed with [item] number of days
  color: string; // fill color
}

/**
 * Container for 12 months.
 */
export interface Year {
  months: Month[];
}

// ============================================================
// Color Palettes
// ============================================================

export const colorWheelClassic = [
  '#aebbff', // jan
  '#9ce3ff', // feb
  '#a1fec5', // mar
  '#caff8b', // apr
  '#fdff92', // may
  '#fef087', // jun
  '#ffdb8d', // jul
  '#ffc08d', // aug
  '#ffa290', // sep
  '#ff90c0', // oct
  '#feabf1', // nov
  '#caa8fe', // dec
];

export const colorWheelClassicMod = [
  '#87cdff', // jan
  '#9ce3ff', // feb
  '#a1fec5', // mar
  '#caff8b', // apr
  '#fdff87', // may
  '#fef097', // jun
  '#ffcb8d', // jul
  '#ffb09d', // aug
  '#ff92a0', // sep
  '#ff7080', // oct
  '#feabf1', // nov
  '#caa8fe', // dec
];

export const colorWheelClassicMod2 = [
  '#9ce3ff', // jan
  '#9ce3ff', // feb
  '#a1fec5', // mar
  '#caff8b', // apr
  '#fdff92', // may
  '#fef087', // jun
  '#ffdb8d', // jul
  '#ffc08d', // aug
  '#ffa290', // sep
  '#FF4A4C', // oct
  '#feabf1', // nov
  '#caa8fe', // dec
];

export const colorHarmony = [
  '#FF9CB1', // jun
  '#FFB99C', // jul
  '#FFEA9C', // aug
  '#E3FF9C', // sep
  '#B1FF9C', // oct
  '#9CFFB8', // nov
  '#9CFFEA', // dec
  '#9CE3FF', // jan
  '#9CB2FF', // feb
  '#B89CFF', // mar
  '#EA9CFF', // apr
  '#FF9CE3', // may
];

export const colorHarmonyMod = [
  '#9CE3FF', // jan
  '#9CB2FF', // feb
  '#B89CFF', // mar
  '#ff9577', // apr
  '#FF9CE3', // may
  '#FF9CB1', // jun
  '#FFB99C', // jul
  '#FFEA9C', // aug
  '#E3FF9C', // sep
  '#B1FF9C', // oct
  '#9CFFB8', // nov
  '#9CFFEA', // dec
].reverse();

export const colorWheelRing2 = [
  '#70c3ed', // light blue
  '#8ed0b5', // green
  '#8ec975',
  '#aed361',
  '#f6ed60', // yellow
  '#fdb64e', // orange
  '#f15b40', // red
  '#f15f90', // pink
  '#d671ad',
  '#9a6db0', // purple
  '#756bb0', // violet
  '#6783c2', // dark blue
];

export const colorWheelRing3 = [
  '#f68567', // red
  '#f489a7', // pink
  '#df92be',
  '#ac8bc0', // purple
  '#9087c0', // violet
  '#879bce', // dark blue
  '#96d1f3', // light blue
  '#abdac6', // green
  '#abd595',
  '#c1dd89',
  '#f9f18c', // yellow
  '#fec679', // orange
];

export const colorWheelClassicIslam = [
  '#FF5959', // oct
  '#F1948A', // nov
  '#caa8fe', // dec
  '#aebbff', // jan
  '#9ce3ff', // feb
  '#a1fec5', // mar
  '#caff8b', // apr
  '#fdff92', // may
  '#fef087', // jun
  '#ffdb8d', // jul
  '#ffc08d', // aug
  '#ffa290', // sep
];

export const pallet1 = [
  '#db64d3',
  '#db6498',
  '#db6c64',
  '#dba864',
  '#d3db64',
  '#98db64',
  '#64db6b',
  '#64dba7',
  '#64d4db',
  '#6498db',
  '#6b64db',
  '#a864db',
];

// ============================================================
// Solar Year (Gregorian)
// ============================================================

export const solarColors = colorWheelClassic;

export const solarYear: Year = {
  months: [
    { number: 1, name: 'January', numDays: [31], color: solarColors[0] },
    { number: 2, name: 'February', numDays: [29], color: solarColors[1] },
    { number: 3, name: 'March', numDays: [31], color: solarColors[2] },
    { number: 4, name: 'April', numDays: [30], color: solarColors[3] },
    { number: 5, name: 'May', numDays: [31], color: solarColors[4] },
    { number: 6, name: 'June', numDays: [30], color: solarColors[5] },
    { number: 7, name: 'July', numDays: [31], color: solarColors[6] },
    { number: 8, name: 'August', numDays: [31], color: solarColors[7] },
    { number: 9, name: 'September', numDays: [30], color: solarColors[8] },
    { number: 10, name: 'October', numDays: [31], color: solarColors[9] },
    { number: 11, name: 'November', numDays: [30], color: solarColors[10] },
    { number: 12, name: 'December', numDays: [31], color: solarColors[11] },
  ],
};

// ============================================================
// Islamic Year (Hijri)
// ============================================================

export const islamicColors = colorHarmony;

/**
 * Canonical Islamic month order (Muharram first).
 * Month numbers are placeholders; they get reassigned at runtime
 * when rotating to the current month.
 */
export const islamicYearCanonical: Year = {
  months: [
    { number: 1, name: 'Muharram', numDays: [30], color: islamicColors[0] },
    { number: 2, name: 'Safar', numDays: [30], color: islamicColors[1] },
    { number: 3, name: 'Rabi al-Awwal', numDays: [30], color: islamicColors[2] },
    { number: 4, name: 'Rabi ath-Thani', numDays: [30], color: islamicColors[3] },
    { number: 5, name: 'Jumada al-Awwal', numDays: [30], color: islamicColors[4] },
    { number: 6, name: 'Jumada ath-Thani', numDays: [30], color: islamicColors[5] },
    { number: 7, name: 'Rajab', numDays: [30], color: islamicColors[6] },
    { number: 8, name: "Sha'baan", numDays: [30], color: islamicColors[7] },
    { number: 9, name: 'Ramadan', numDays: [30], color: islamicColors[8] },
    { number: 10, name: 'Shawwal', numDays: [30], color: islamicColors[9] },
    { number: 11, name: "Dhu al-Qa'dah", numDays: [30], color: islamicColors[10] },
    { number: 12, name: 'Dhu al-Hijja', numDays: [30], color: islamicColors[11] },
  ],
};

/**
 * Helper to create a MonthInstance from a Month with additional rendering settings.
 */
export function createMonthInstance(
  month: Month,
  settings: {
    nameUpsideDown: boolean;
    dateOnTop: boolean;
    dateBoxHeight: number;
    innerRadius: number;
    outerRadius: number;
    dateAngleOffset: number;
  }
): MonthInstance {
  return {
    name: month.name,
    numDays: month.numDays[0],
    color: month.color,
    ...settings,
  };
}
