/**
 * Calendar month rendering functions.
 * Ported from Python calendar_drawings.py
 */

import type { MonthInstance } from './calendar-data.ts';
import {
  Point,
  CurvedText,
  TextCenteredAroundPoint,
  Circle,
  Drawable,
} from './primitives.ts';
import { getDimensionalArc, getArc } from './geometry.ts';

export const DATE_FILL_COLOR = '#fbebb3';

/**
 * Generate drawable elements for a single month.
 *
 * @param month - Month instance with rendering settings
 * @param daysInYear - Total days in the year (365 or 366)
 * @param origin - Center point of the circle
 * @returns Array of drawable elements
 */
export function getMonth(
  month: MonthInstance,
  daysInYear: number,
  origin: Point
): Drawable[] {
  const monthWidthDegrees = (360 * month.numDays) / daysInYear;

  // Center start and stop angles around -90 degrees (12 o'clock)
  const angleOffset = monthWidthDegrees / 2;
  const centerAngle = -90;
  const startAngle = centerAngle - angleOffset;
  const stopAngle = centerAngle + angleOffset;

  const drawingElements: Drawable[] = [];

  // Background arc
  const background = getDimensionalArc(
    origin,
    month.innerRadius,
    month.outerRadius,
    startAngle,
    stopAngle,
    'black',
    month.color
  );
  drawingElements.push(background);

  // Date box positioning
  let dateInnerRadius: number;
  let dateOuterRadius: number;
  let monthTextRadius: number;

  if (month.dateOnTop) {
    dateInnerRadius = month.outerRadius - month.dateBoxHeight;
    dateOuterRadius = month.outerRadius;
    monthTextRadius = (dateInnerRadius + month.innerRadius) / 2;
  } else {
    dateInnerRadius = month.innerRadius;
    dateOuterRadius = month.innerRadius + month.dateBoxHeight;
    monthTextRadius = (dateOuterRadius + month.outerRadius) / 2;
  }

  // Month name text arc - reverse if upside down
  const monthTextArc = getArc(
    origin,
    monthTextRadius,
    month.nameUpsideDown ? stopAngle : startAngle,
    month.nameUpsideDown ? startAngle : stopAngle
  );

  // Month name
  const monthNameHeight =
    (month.outerRadius - month.innerRadius - month.dateBoxHeight) / 2;
  const monthText = new CurvedText(monthTextArc, month.name, monthNameHeight);
  drawingElements.push(monthText);

  // Date boxes
  const dateWidthDegrees = monthWidthDegrees / month.numDays;
  let currDateEndAngle = startAngle;

  for (let i = 0; i < month.numDays; i++) {
    const currDateStartAngle = currDateEndAngle;
    currDateEndAngle = currDateStartAngle + dateWidthDegrees;

    // Date box background
    const dateBackground = getDimensionalArc(
      origin,
      dateInnerRadius,
      dateOuterRadius,
      currDateStartAngle,
      currDateEndAngle,
      'black',
      DATE_FILL_COLOR
    );
    drawingElements.push(dateBackground);

    // Date number position (centered in date box)
    const dateCenter = new Point(
      (dateBackground.innerArc.start.x + dateBackground.outerArc.start.x) / 2,
      (dateBackground.innerArc.start.y + dateBackground.outerArc.start.y) / 2 +
        (dateBackground.innerArc.start.y - dateBackground.outerArc.start.y) * 0.0
    );

    const dateSize = (dateOuterRadius - dateInnerRadius) * 0.6;

    // Highlight circle (commented out in original, but kept for reference)
    // const highlightCircle = new Circle(dateSize * 0.7, dateCenter);
    // drawingElements.push(highlightCircle);

    // Date text
    const dateText = new TextCenteredAroundPoint(
      dateCenter,
      `${i + 1}`, // date number
      dateSize,
      month.dateAngleOffset
    );
    drawingElements.push(dateText);
  }

  return drawingElements;
}
