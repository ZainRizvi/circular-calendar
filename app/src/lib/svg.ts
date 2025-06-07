import { SVG, Svg } from '@svgdotjs/svg.js';
import { Point, Arc, DimensionalArc, Length, Angle, ArcDrawMode } from './primitives';

// Convert inches to millimeters
export function inchToMillimeter(i: number): number {
  return i * 25;
}

// Convert angle in degrees to radians
export function toRadian(angle: number): number {
  return angle * Math.PI / 180;
}

// Calculate a point on a circle given origin, radius, and angle
export function getCoordinatePoint(origin: Point, radius: number, angle: number): Point {
  const rise = radius * Math.sin(toRadian(angle));
  const run = radius * Math.cos(toRadian(angle));
  // Note: Y increases downward, but we're also having the angle increase clockwise instead of counter-clockwise
  return new Point(origin.x + run, origin.y + rise);
}

// Generate an arc path using SVG path commands
export function getArc(origin: Point, radius: number, startAngle: number, stopAngle: number): Arc {
  const start = getCoordinatePoint(origin, radius, startAngle);
  const stop = getCoordinatePoint(origin, radius, stopAngle);
  // Calculate large-arc-flag: 0 if the arc spans less than or equal to 180 degrees, 1 if greater
  const largeArcFlag = Math.abs(stopAngle - startAngle) <= 180 ? 0 : 1;
  // Calculate sweep-flag: 1 if we're drawing clockwise (startAngle < stopAngle), 0 if counterclockwise
  const sweepFlag = startAngle < stopAngle ? 1 : 0;
  const params = `0 ${largeArcFlag} ${sweepFlag}`; // Include x-axis-rotation (0) like in Python
  return new Arc(start, stop, radius, params);
}

// Helper to generate arc path with custom prefix ("M" for move, "L" for line)
function getArcPath(origin: Point, radius: number, startAngle: number, stopAngle: number, prefix: 'M' | 'L'): string {
  const start = getCoordinatePoint(origin, radius, startAngle);
  const stop = getCoordinatePoint(origin, radius, stopAngle);
  const largeArcFlag = Math.abs(stopAngle - startAngle) <= 180 ? 0 : 1;
  // Calculate sweep flag based on angle order, just like in Python
  const sweepFlag = startAngle < stopAngle ? 1 : 0;
  return `${prefix} ${start.pathText()} A ${radius},${radius} 0 ${largeArcFlag} ${sweepFlag} ${stop.pathText()} `;
}

// Class to wrap SVG path strings
export class PathElement {
    private path: string;
    private stroke: string;
    private fill: string;

    constructor(path: string, stroke: string = 'black', fill: string = 'none') {
        this.path = path;
        this.stroke = stroke;
        this.fill = fill;
    }

    drawnPath(): any {
        return SVG().path(this.path)
            .stroke(this.stroke)
            .fill(this.fill);
    }
}

// Generate a dimensional arc (inner and outer arcs)
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
  const innerArc = getArc(origin, innerRadius, stopAngle, startAngle);
  return new DimensionalArc(outerArc, innerArc, stroke, fill);
}

// Draw a list of month parts (SVG elements) into the provided SVG drawing
export function drawMonthParts(drawing: Svg, monthParts: any[]): void {
  for (const part of monthParts) {
    const drawnPath = part.drawnPath();
    const components = Array.isArray(drawnPath) ? drawnPath : [drawnPath];
    for (const component of components) {
      if (typeof component === 'string') {
        drawing.add(drawing.path(component));
      } else {
        drawing.add(component);
      }
    }
  }
}

// Group a list of month parts into a single SVG group
export function groupWithMonthParts(monthParts: any[]): any {
  const group = SVG().group();
  for (const part of monthParts) {
    const drawnPath = part.drawnPath();
    const components = Array.isArray(drawnPath) ? drawnPath : [drawnPath];
    for (const component of components) {
      if (typeof component === 'string') {
        group.add(group.path(component));
      } else {
        group.add(component);
      }
    }
  }
  return group;
}