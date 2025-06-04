import { Svg, SVG } from '@svgdotjs/svg.js';
import { inchToMillimeter, drawMonthParts } from './svg';
import { solarYear, MonthInstance } from './month';
import { Point } from './primitives';
import { getMonth } from './month';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

export interface CalendarDrawOptions {
  /**
   * Main scaling factor that the original Python code supports. Defaults to `0.7`.
   */
  scaleFactor?: number;

  /**
   * Which page of the calendar to render (zero-indexed). Defaults to `0`.
   */
  page?: number;
}

// Color palette ported from the original Python implementation ( `color_harmony` )
const ISLAMIC_COLORS = [
  '#FF9CB1', // Jun in original harmony ordering but we keep the exact list
  '#FFB99C',
  '#FFEA9C',
  '#E3FF9C',
  '#B1FF9C',
  '#9CFFB8',
  '#9CFFEA',
  '#9CE3FF',
  '#9CB2FF',
  '#B89CFF',
  '#EA9CFF',
  '#FF9CE3',
] as const;

// Minimal Islamic calendar data (ported 1-to-1 from python/calendar_data.py)
const ISLAMIC_YEAR = {
  months: [
    { number: 10, name: 'Jumada al-Awwal', num_days: 30, color: ISLAMIC_COLORS[4] },
    { number: 11, name: 'Jumada ath-Thani', num_days: 30, color: ISLAMIC_COLORS[5] },
    { number: 12, name: 'Rajab', num_days: 30, color: ISLAMIC_COLORS[6] },
    { number: 1, name: "Sha'baan", num_days: 30, color: ISLAMIC_COLORS[7] },
    { number: 2, name: 'Ramadan', num_days: 30, color: ISLAMIC_COLORS[8] },
    { number: 3, name: 'Shawwal', num_days: 30, color: ISLAMIC_COLORS[9] },
    { number: 4, name: "Dhu al-Qa'dah", num_days: 30, color: ISLAMIC_COLORS[10] },
    { number: 5, name: 'Dhu al-Hijja', num_days: 30, color: ISLAMIC_COLORS[11] },
    { number: 6, name: 'Muharram', num_days: 30, color: ISLAMIC_COLORS[0] },
    { number: 7, name: 'Safar', num_days: 30, color: ISLAMIC_COLORS[1] },
    { number: 8, name: 'Rabi al-Awwal', num_days: 30, color: ISLAMIC_COLORS[2] },
    { number: 9, name: 'Rabi ath-Thani', num_days: 30, color: ISLAMIC_COLORS[3] },
  ],
} as const;

// ---------------------------------------------------------------------------
// Helper utility functions
// ---------------------------------------------------------------------------

function createMonthInstances(scaleFactor: number) {
  // Geometry calculations lifted straight from python/make_cal.py
  const width = inchToMillimeter(8 * scaleFactor);
  const outermostRadius = width / (2 * Math.PI / 12);
  const innerRadius = (outermostRadius * 9.2) / 10;
  const monthThickness = outermostRadius - innerRadius;
  const dateBoxHeight = monthThickness * 0.2;

  // Helper to compute date rotation identical to Python version
  const dateRotation = (month: { number: number }) => -1 * (month.number - 1) * (360 / 12);
  const islamicDateRotationOffset = -15; // Empirically set in the source notebook

  const solarMonths: MonthInstance[] = [];
  solarYear.months.forEach((m, idx) => {
    const nameUpsideDown = idx >= 3 && idx < 9;
    solarMonths.push({
      name: m.name,
      num_days: m.num_days,
      color: m.color,
      name_upside_down: nameUpsideDown,
      date_on_top: false,
      date_box_height: dateBoxHeight,
      inner_radius: innerRadius,
      outer_radius: outermostRadius,
      date_angle_offset: dateRotation(m),
    });
  });

  const islamicMonths: MonthInstance[] = [];
  ISLAMIC_YEAR.months.forEach((m) => {
    const nameUpsideDown = m.number > 3 && m.number <= 9;
    islamicMonths.push({
      name: m.name,
      num_days: m.num_days,
      color: m.color,
      name_upside_down: nameUpsideDown,
      date_on_top: true,
      date_box_height: dateBoxHeight,
      inner_radius: innerRadius - monthThickness,
      outer_radius: outermostRadius - monthThickness,
      date_angle_offset: dateRotation(m) + islamicDateRotationOffset,
    });
  });

  return {
    solarMonths,
    islamicMonths,
    outermostRadius,
    monthThickness,
  };
}

function offsetPointBy(p: Point, dx: number, dy: number): Point {
  return new Point(p.x + dx, p.y + dy);
}

// ---------------------------------------------------------------------------
// Core drawing routine – mirrors python/make_cal.py (SVG only)
// ---------------------------------------------------------------------------

export function drawCalendarPage(
  draw: Svg,
  { scaleFactor = 0.7, page = 0 }: CalendarDrawOptions = {}
) {
  // Build month instances & commonly used geometry measurements
  const { solarMonths, islamicMonths, outermostRadius, monthThickness } =
    createMonthInstances(scaleFactor);

  // Page layout setup (replicating python logic)
  const monthOffset = 4 * scaleFactor;
  const extraWidthOffset = 10;
  const widthCenter = inchToMillimeter(11 * scaleFactor) / 2 + extraWidthOffset;
  const verticalOffset = 30 * scaleFactor;
  const originFirst = new Point(widthCenter, outermostRadius + verticalOffset);
  const daysInYear = 366;

  // Decide rows / cols based on scaleFactor – exactly like python code
  let NUM_ROWS: number;
  let NUM_COLUMNS: number;
  if (scaleFactor <= 0.5) {
    NUM_ROWS = 5;
    NUM_COLUMNS = 2;
  } else if (scaleFactor < 0.75) {
    NUM_ROWS = 4;
    NUM_COLUMNS = 1;
  } else {
    NUM_ROWS = 2;
    NUM_COLUMNS = 1;
  }

  let monthIdx = 0;
  // Compute the first month index of this page
  monthIdx = NUM_ROWS * NUM_COLUMNS * page;

  // Only draw while we have more months to place on this page
  for (let col = 0; col < NUM_COLUMNS; col++) {
    let originCol = new Point(originFirst.x + col * inchToMillimeter(8 * scaleFactor) * 1.05, originFirst.y);

    for (let row = 0; row < NUM_ROWS; row++) {
      const currentIdx = row + NUM_ROWS * col + NUM_ROWS * NUM_COLUMNS * page;

      // Solar month
      if (currentIdx < solarMonths.length) {
        const monthParts = getMonth(solarMonths[currentIdx], daysInYear, originCol);
        drawMonthParts(draw, monthParts);
        originCol = offsetPointBy(originCol, 0, monthOffset);
      }

      // Islamic month – same row index (they alternate)
      if (currentIdx < islamicMonths.length) {
        const monthParts = getMonth(islamicMonths[currentIdx], daysInYear, originCol);
        drawMonthParts(draw, monthParts);
        originCol = offsetPointBy(originCol, 0, (monthThickness + monthOffset) * 2.3);
      }
    }
  }
}

// Convenience wrapper that builds a standalone <svg> element as a string
export function generateCalendarPageSvg(options: CalendarDrawOptions = {}): string {
  const widthMm = inchToMillimeter(8.5);
  const heightMm = inchToMillimeter(11);

  // Create a detached svg drawing (not added to DOM)
  const draw = SVG().size(`${widthMm}mm`, `${heightMm}mm`).viewbox(0, 0, widthMm, heightMm) as Svg;
  drawCalendarPage(draw, options);
  // Return serialized SVG markup
  return draw.svg();
}