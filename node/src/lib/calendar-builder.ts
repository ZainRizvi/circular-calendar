/**
 * Calendar builder module for generating calendar SVG content.
 *
 * This module extracts the calendar generation logic from make-cal.ts
 * to create a reusable, configurable calendar builder.
 */

import { Point, resetTextPathIdCounter } from './primitives.js';
import { inchToMillimeter, drawMonthParts } from './geometry.js';
import { getMonth } from './month-renderer.js';
import {
  type MonthInstance,
  type Month,
  solarYear,
  islamicYearCanonical,
} from './calendar-data.js';
import { rotateMonths, type AlignmentParams } from './islamic-alignment.js';
import { type LayoutConfig, type ComputedLayout } from './config.js';

/**
 * Calculate date rotation offset for a month.
 */
export function dateRotation(month: { number: number }): number {
  return -1 * (month.number - 1) * (360 / 12);
}

/**
 * Interface for the calendar builder.
 */
export interface CalendarBuilder {
  config: LayoutConfig;
  layout: ComputedLayout;
  createSolarMonthInstances(): MonthInstance[];
  createIslamicMonthInstances(alignment: AlignmentParams): MonthInstance[];
  generateCalendarSvg(
    solarMonths: MonthInstance[],
    islamicMonths: MonthInstance[]
  ): string;
  generateCircleCoverSvg(
    solarMonths: MonthInstance[],
    islamicMonths: MonthInstance[],
    daysElapsedIslamicBase: number
  ): string;
}

/**
 * Create a calendar builder with the given configuration.
 */
export function createCalendarBuilder(
  config: LayoutConfig,
  layout: ComputedLayout
): CalendarBuilder {
  const {
    outermostRadius,
    innerRadius,
    monthThickness,
    dateBoxHeight,
    widthCenter,
    verticalOffsetScaled,
    monthOffset,
  } = layout;

  /**
   * Create MonthInstance array for solar (Gregorian) months.
   */
  function createSolarMonthInstances(): MonthInstance[] {
    const solarMonths: MonthInstance[] = [];

    for (let index = 0; index < solarYear.months.length; index++) {
      const month = solarYear.months[index];
      const nameUpsideDown = index >= 3 && index < 9;

      solarMonths.push({
        name: month.name,
        numDays: month.numDays[0],
        color: month.color,
        nameUpsideDown,
        dateOnTop: false, // Outer month
        dateBoxHeight,
        innerRadius,
        outerRadius: outermostRadius,
        dateAngleOffset: dateRotation(month),
      });
    }

    return solarMonths;
  }

  /**
   * Create MonthInstance array for Islamic months.
   */
  function createIslamicMonthInstances(
    alignment: AlignmentParams
  ): MonthInstance[] {
    // Rotate Islamic months to start with current month
    const rotatedMonths = rotateMonths(
      islamicYearCanonical.months,
      alignment.currentMonthIndex
    );

    const islamicMonths: MonthInstance[] = [];
    const islamicRotationOffset = alignment.rotationOffset;

    for (const month of rotatedMonths) {
      const nameUpsideDown = month.number > 3 && month.number <= 9;

      islamicMonths.push({
        name: month.name,
        numDays: month.numDays[0],
        color: month.color,
        nameUpsideDown,
        dateOnTop: true, // Inner month
        dateBoxHeight,
        innerRadius: innerRadius - monthThickness,
        outerRadius: outermostRadius - monthThickness,
        dateAngleOffset: dateRotation(month) + islamicRotationOffset,
      });
    }

    return islamicMonths;
  }

  /**
   * Generate SVG for a calendar page (linear strips).
   */
  function generateCalendarSvg(
    solarMonths: MonthInstance[],
    islamicMonths: MonthInstance[]
  ): string {
    resetTextPathIdCounter();

    const originFirst = new Point(
      widthCenter,
      outermostRadius + verticalOffsetScaled
    );

    const svgElements: string[] = [];

    // SVG header
    const pageWidth = inchToMillimeter(8.5);
    const pageHeight = inchToMillimeter(11);
    svgElements.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}">`
    );

    let origin = new Point(originFirst.x, originFirst.y);

    for (let i = 0; i < solarMonths.length; i++) {
      // Draw solar month
      const solarParts = getMonth(solarMonths[i], config.daysInYear, origin);
      svgElements.push(drawMonthParts(solarParts));

      origin = new Point(origin.x, origin.y + monthOffset);

      // Draw Islamic month
      if (i < islamicMonths.length) {
        const islamicParts = getMonth(
          islamicMonths[i],
          config.daysInYear,
          origin
        );
        svgElements.push(drawMonthParts(islamicParts));
      }

      origin = new Point(
        origin.x,
        origin.y + (monthThickness + monthOffset) * 2.3
      );
    }

    svgElements.push('</svg>');
    return svgElements.join('\n');
  }

  /**
   * Apply circular transform to a group of month parts.
   */
  function circleFormFactor(
    svgContent: string,
    month: MonthInstance,
    daysElapsed: number,
    origin: Point,
    originFirst: Point
  ): string {
    const rotation =
      (360.0 * (daysElapsed + month.numDays / 2)) / config.daysInYear;
    const translateY = originFirst.y - origin.y;

    return `<g transform="translate(75, 50) scale(0.3) rotate(${rotation}, ${origin.x}, ${origin.y}) translate(0, ${translateY})">
${svgContent}
</g>`;
  }

  /**
   * Generate SVG for the circular cover page.
   */
  function generateCircleCoverSvg(
    solarMonths: MonthInstance[],
    islamicMonths: MonthInstance[],
    daysElapsedIslamicBase: number
  ): string {
    resetTextPathIdCounter();

    const originFirst = new Point(
      widthCenter,
      outermostRadius + verticalOffsetScaled
    );
    const svgElements: string[] = [];

    // SVG header
    const pageWidth = inchToMillimeter(8.5);
    const pageHeight = inchToMillimeter(11);
    svgElements.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}mm" height="${pageHeight}mm" viewBox="0 0 ${pageWidth} ${pageHeight}">`
    );

    let daysElapsed = -solarMonths[0].numDays / 2;
    let daysElapsedIslamic =
      daysElapsedIslamicBase - islamicMonths[0].numDays / 2;

    const origin = new Point(originFirst.x, originFirst.y);

    for (let i = 0; i < solarMonths.length; i++) {
      // Draw solar month in circular form
      const solarParts = getMonth(solarMonths[i], config.daysInYear, origin);
      const solarSvg = drawMonthParts(solarParts);
      svgElements.push(
        circleFormFactor(solarSvg, solarMonths[i], daysElapsed, origin, originFirst)
      );
      daysElapsed += solarMonths[i].numDays;

      // Draw Islamic month in circular form
      if (i < islamicMonths.length) {
        const islamicParts = getMonth(
          islamicMonths[i],
          config.daysInYear,
          origin
        );
        const islamicSvg = drawMonthParts(islamicParts);
        svgElements.push(
          circleFormFactor(
            islamicSvg,
            islamicMonths[i],
            daysElapsedIslamic,
            origin,
            originFirst
          )
        );
        daysElapsedIslamic += islamicMonths[i].numDays;
      }
    }

    svgElements.push('</svg>');
    return svgElements.join('\n');
  }

  return {
    config,
    layout,
    createSolarMonthInstances,
    createIslamicMonthInstances,
    generateCalendarSvg,
    generateCircleCoverSvg,
  };
}
