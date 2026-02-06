/**
 * Layout configuration and computation for calendar rendering.
 *
 * This module centralizes all layout calculations that were previously
 * scattered across make-cal.ts. The LayoutConfig is injectable, allowing
 * different contexts (CLI, web app) to customize dimensions.
 */

import { inchToMillimeter } from './geometry.js';

/**
 * Injectable layout configuration.
 */
export interface LayoutConfig {
  /** Scale factor for the entire layout (0.5-1.0) */
  scaleFactor: number;
  /** Canvas width in inches (default: 11) */
  canvasWidthInches: number;
  /** Days in the year (365 or 366) */
  daysInYear: number;
  /** Extra width offset for centering (default: 10) */
  extraWidthOffset: number;
  /** Vertical offset for first month (default: 30) */
  verticalOffset: number;
}

/**
 * Computed layout values derived from LayoutConfig.
 */
export interface ComputedLayout {
  /** Outermost radius of the month arcs */
  outermostRadius: number;
  /** Inner radius of the outer month ring */
  innerRadius: number;
  /** Thickness of each month arc */
  monthThickness: number;
  /** Height of the date number boxes */
  dateBoxHeight: number;
  /** Center X coordinate in mm */
  widthCenter: number;
  /** Vertical offset scaled by scaleFactor */
  verticalOffsetScaled: number;
  /** Number of rows per page */
  numRows: number;
  /** Number of columns per page */
  numColumns: number;
  /** Stroke width for drawing */
  strokeWidth: number;
  /** Month offset for layout spacing */
  monthOffset: number;
}

/**
 * Default layout configuration matching the original CLI behavior.
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  scaleFactor: 0.7,
  canvasWidthInches: 11,
  daysInYear: 366,
  extraWidthOffset: 10,
  verticalOffset: 30,
};

/**
 * Compute derived layout values from configuration.
 */
export function computeLayout(config: LayoutConfig): ComputedLayout {
  const { scaleFactor, canvasWidthInches, extraWidthOffset, verticalOffset } =
    config;

  const canvasWidth = canvasWidthInches * scaleFactor;
  const width = inchToMillimeter(8 * scaleFactor);
  const outermostRadius = width / ((2 * 3.14) / 12);
  const innerRadius = (outermostRadius * 9.2) / 10;
  const monthThickness = outermostRadius - innerRadius;
  const dateBoxHeight = monthThickness * 0.2;

  const widthCenter = inchToMillimeter(canvasWidth) / 2 + extraWidthOffset;
  const verticalOffsetScaled = verticalOffset * scaleFactor;

  // Layout configuration based on scale factor
  let numRows: number;
  let numColumns: number;
  if (scaleFactor <= 0.5) {
    numRows = 5;
    numColumns = 2;
  } else if (scaleFactor < 0.75) {
    numRows = 4;
    numColumns = 1;
  } else {
    numRows = 2;
    numColumns = 1;
  }

  const strokeWidth = 0.1 * scaleFactor;
  const monthOffset = 4 * scaleFactor;

  return {
    outermostRadius,
    innerRadius,
    monthThickness,
    dateBoxHeight,
    widthCenter,
    verticalOffsetScaled,
    numRows,
    numColumns,
    strokeWidth,
    monthOffset,
  };
}
