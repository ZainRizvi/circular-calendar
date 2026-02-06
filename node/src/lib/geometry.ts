/**
 * Geometric utilities for arc generation and SVG canvas.
 * Ported from Python arc_drawing.py
 */

import {
  Point,
  Arc,
  DimensionalArc,
  Drawable,
} from './primitives.ts';

/**
 * Convert inches to millimeters (using 25mm per inch approximation).
 */
export function inchToMillimeter(inches: number): number {
  return inches * 25;
}

/**
 * Convert angle from degrees to radians.
 */
export function toRadian(angleDegrees: number): number {
  return (angleDegrees * Math.PI) / 180;
}

/**
 * Get Cartesian coordinate from polar coordinates.
 *
 * Coordinate system:
 * - 0° is at 3 o'clock position (positive x)
 * - 90° is at 6 o'clock position (positive y)
 * - -90° (or 270°) is at 12 o'clock position (top)
 */
export function getCoordinatePoint(
  origin: Point,
  radius: number,
  angleDegrees: number
): Point {
  const angleRad = toRadian(angleDegrees);
  const rise = radius * Math.sin(angleRad);
  const run = radius * Math.cos(angleRad);
  return new Point(origin.x + run, origin.y + rise);
}

/**
 * Create an SVG arc between two angles.
 */
export function getArc(
  origin: Point,
  radius: number,
  startAngle: number,
  stopAngle: number
): Arc {
  // Calculate arc points
  const start = getCoordinatePoint(origin, radius, startAngle);
  const stop = getCoordinatePoint(origin, radius, stopAngle);

  // Calculate arc params
  const xAxisRotation = 0; // useless for circular arcs
  // Whether to draw the larger portion of the circle
  const largeArcFlag = Math.abs(startAngle - stopAngle) <= 180 ? 0 : 1;
  // Whether to draw the clockwise or counter clockwise portion
  const sweepFlag = startAngle < stopAngle ? 1 : 0;

  const params = `${xAxisRotation} ${largeArcFlag} ${sweepFlag}`;

  return new Arc(start, stop, radius, params);
}

/**
 * Create a 2D (ring) arc with inner and outer boundaries.
 */
export function getDimensionalArc(
  origin: Point,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  stopAngle: number,
  stroke: string = 'black',
  fill: string = 'none'
): DimensionalArc {
  const outerArc = getArc(origin, outerRadius, startAngle, stopAngle);
  // Inner arc is reversed for proper path closing
  const innerArc = getArc(origin, innerRadius, stopAngle, startAngle);

  return new DimensionalArc(outerArc, innerArc, stroke, fill);
}

/**
 * Create SVG canvas for horizontal page (11" x 8.5").
 */
export function getPageCanvas(): string {
  const width = inchToMillimeter(11);
  const height = inchToMillimeter(8.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}">`;
}

/**
 * Create SVG canvas for vertical page (8.5" x 11").
 */
export function getVerticalPageCanvas(): string {
  const width = inchToMillimeter(8.5);
  const height = inchToMillimeter(11);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}">`;
}

/**
 * Concatenate SVG elements from an array of drawable objects.
 */
export function drawMonthParts(monthParts: Drawable[]): string {
  const elements: string[] = [];

  for (const part of monthParts) {
    const drawing = part.drawnPath();
    // Some drawn parts return a list of multiple things to draw
    if (Array.isArray(drawing)) {
      elements.push(...drawing);
    } else {
      elements.push(drawing);
    }
  }

  return elements.join('\n');
}

/**
 * Wrap SVG elements in a group with optional transform.
 */
export function groupWithMonthParts(
  monthParts: Drawable[],
  transform?: string
): string {
  const content = drawMonthParts(monthParts);
  if (transform) {
    return `<g transform="${transform}">\n${content}\n</g>`;
  }
  return `<g>\n${content}\n</g>`;
}
