import { describe, it, expect, beforeEach } from 'vitest';
import {
  toRadian,
  getCoordinatePoint,
  getArc,
  getDimensionalArc,
  inchToMillimeter,
  getPageCanvas,
  getVerticalPageCanvas,
  drawMonthParts,
  groupWithMonthParts,
} from './geometry.ts';
import { Point, resetTextPathIdCounter } from './primitives.ts';

beforeEach(() => {
  resetTextPathIdCounter();
});

describe('toRadian', () => {
  it('should convert 0 degrees to 0 radians', () => {
    expect(toRadian(0)).toBe(0);
  });

  it('should convert 90 degrees to π/2 radians', () => {
    expect(toRadian(90)).toBeCloseTo(Math.PI / 2);
  });

  it('should convert 180 degrees to π radians', () => {
    expect(toRadian(180)).toBeCloseTo(Math.PI);
  });

  it('should convert 360 degrees to 2π radians', () => {
    expect(toRadian(360)).toBeCloseTo(2 * Math.PI);
  });

  it('should convert -90 degrees to -π/2 radians', () => {
    expect(toRadian(-90)).toBeCloseTo(-Math.PI / 2);
  });
});

describe('inchToMillimeter', () => {
  it('should convert 1 inch to 25mm', () => {
    expect(inchToMillimeter(1)).toBe(25);
  });

  it('should convert 11 inches to 275mm', () => {
    expect(inchToMillimeter(11)).toBe(275);
  });

  it('should convert 8.5 inches to 212.5mm', () => {
    expect(inchToMillimeter(8.5)).toBe(212.5);
  });
});

describe('getCoordinatePoint', () => {
  const origin = new Point(100, 100);
  const radius = 50;

  it('should return point to the right at 0 degrees', () => {
    // 0° is at 3 o'clock position (positive x direction)
    const point = getCoordinatePoint(origin, radius, 0);
    expect(point.x).toBeCloseTo(150); // origin.x + radius
    expect(point.y).toBeCloseTo(100); // origin.y (no vertical change)
  });

  it('should return point below at 90 degrees', () => {
    // 90° is at 6 o'clock position (positive y direction)
    const point = getCoordinatePoint(origin, radius, 90);
    expect(point.x).toBeCloseTo(100); // origin.x
    expect(point.y).toBeCloseTo(150); // origin.y + radius
  });

  it('should return point to the left at 180 degrees', () => {
    // 180° is at 9 o'clock position (negative x direction)
    const point = getCoordinatePoint(origin, radius, 180);
    expect(point.x).toBeCloseTo(50); // origin.x - radius
    expect(point.y).toBeCloseTo(100); // origin.y
  });

  it('should return point above at -90 degrees (top of circle)', () => {
    // -90° is at 12 o'clock position (top)
    const point = getCoordinatePoint(origin, radius, -90);
    expect(point.x).toBeCloseTo(100); // origin.x
    expect(point.y).toBeCloseTo(50); // origin.y - radius
  });

  it('should handle 270 degrees same as -90 degrees', () => {
    const point = getCoordinatePoint(origin, radius, 270);
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(50);
  });

  it('should handle 45 degrees correctly', () => {
    const point = getCoordinatePoint(origin, radius, 45);
    const expected = radius * Math.cos(Math.PI / 4);
    expect(point.x).toBeCloseTo(100 + expected);
    expect(point.y).toBeCloseTo(100 + expected);
  });
});

describe('getArc', () => {
  const origin = new Point(100, 100);

  it('should create arc from 0 to 90 degrees', () => {
    const arc = getArc(origin, 50, 0, 90);

    // Start point at 0° (3 o'clock)
    expect(arc.start.x).toBeCloseTo(150);
    expect(arc.start.y).toBeCloseTo(100);

    // Stop point at 90° (6 o'clock)
    expect(arc.stop.x).toBeCloseTo(100);
    expect(arc.stop.y).toBeCloseTo(150);

    expect(arc.radius).toBe(50);
  });

  it('should set large_arc_flag=0 for arcs <= 180 degrees', () => {
    const arc = getArc(origin, 50, 0, 90);
    // params format: "x_axis_rotation large_arc_flag sweep_flag"
    const params = arc.params.split(' ');
    expect(params[1]).toBe('0'); // large_arc_flag
  });

  it('should set large_arc_flag=1 for arcs > 180 degrees', () => {
    const arc = getArc(origin, 50, 0, 270);
    const params = arc.params.split(' ');
    expect(params[1]).toBe('1'); // large_arc_flag
  });

  it('should set sweep_flag=1 when start < stop (clockwise)', () => {
    const arc = getArc(origin, 50, 0, 90);
    const params = arc.params.split(' ');
    expect(params[2]).toBe('1'); // sweep_flag
  });

  it('should set sweep_flag=0 when start > stop (counter-clockwise)', () => {
    const arc = getArc(origin, 50, 90, 0);
    const params = arc.params.split(' ');
    expect(params[2]).toBe('0'); // sweep_flag
  });

  it('should set x_axis_rotation=0', () => {
    const arc = getArc(origin, 50, 0, 90);
    const params = arc.params.split(' ');
    expect(params[0]).toBe('0'); // x_axis_rotation
  });
});

describe('getDimensionalArc', () => {
  const origin = new Point(100, 100);

  it('should create dimensional arc with outer and inner arcs', () => {
    const dimArc = getDimensionalArc(
      origin,
      40, // inner radius
      60, // outer radius
      0,
      90,
      'black',
      'blue'
    );

    expect(dimArc.outerArc.radius).toBe(60);
    expect(dimArc.innerArc.radius).toBe(40);
    expect(dimArc.stroke).toBe('black');
    expect(dimArc.fill).toBe('blue');
  });

  it('should reverse inner arc angles for proper closing', () => {
    const dimArc = getDimensionalArc(origin, 40, 60, 0, 90, 'black', 'blue');

    // Outer arc: 0° to 90° (normal direction)
    expect(dimArc.outerArc.start.x).toBeCloseTo(160); // at 0°
    expect(dimArc.outerArc.stop.x).toBeCloseTo(100); // at 90°

    // Inner arc: 90° to 0° (reversed direction)
    expect(dimArc.innerArc.start.x).toBeCloseTo(100); // at 90°
    expect(dimArc.innerArc.stop.x).toBeCloseTo(140); // at 0°
  });

  it('should use default stroke and fill', () => {
    const dimArc = getDimensionalArc(origin, 40, 60, 0, 90);
    expect(dimArc.stroke).toBe('black');
    expect(dimArc.fill).toBe('none');
  });
});

describe('getPageCanvas', () => {
  it('should create horizontal page (11" x 8.5")', () => {
    const canvas = getPageCanvas();
    expect(canvas).toContain('width="275mm"'); // 11 * 25
    expect(canvas).toContain('height="212.5mm"'); // 8.5 * 25
    expect(canvas).toContain('viewBox="0 0 275 212.5"');
  });
});

describe('getVerticalPageCanvas', () => {
  it('should create vertical page (8.5" x 11")', () => {
    const canvas = getVerticalPageCanvas();
    expect(canvas).toContain('width="212.5mm"'); // 8.5 * 25
    expect(canvas).toContain('height="275mm"'); // 11 * 25
    expect(canvas).toContain('viewBox="0 0 212.5 275"');
  });
});

describe('drawMonthParts', () => {
  it('should concatenate SVG elements from drawables', () => {
    const mockDrawable1 = { drawnPath: () => '<rect x="0" y="0"/>' };
    const mockDrawable2 = { drawnPath: () => '<circle cx="10" cy="10"/>' };

    const result = drawMonthParts([mockDrawable1, mockDrawable2]);
    expect(result).toContain('<rect x="0" y="0"/>');
    expect(result).toContain('<circle cx="10" cy="10"/>');
  });

  it('should handle drawables that return arrays', () => {
    const mockDrawable = {
      drawnPath: () => ['<path d="M 0 0"/>', '<text>Hello</text>'],
    };

    const result = drawMonthParts([mockDrawable]);
    expect(result).toContain('<path d="M 0 0"/>');
    expect(result).toContain('<text>Hello</text>');
  });
});

describe('groupWithMonthParts', () => {
  it('should wrap elements in a group', () => {
    const mockDrawable = { drawnPath: () => '<rect x="0" y="0"/>' };

    const result = groupWithMonthParts([mockDrawable]);
    expect(result).toMatch(/^<g>[\s\S]*<\/g>$/);
    expect(result).toContain('<rect x="0" y="0"/>');
  });

  it('should accept optional transform', () => {
    const mockDrawable = { drawnPath: () => '<rect x="0" y="0"/>' };

    const result = groupWithMonthParts([mockDrawable], 'translate(10, 20)');
    expect(result).toContain('transform="translate(10, 20)"');
  });
});
