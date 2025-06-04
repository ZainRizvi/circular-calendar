import { SVG, Svg, Point as SvgPoint, Path } from '@svgdotjs/svg.js';
import { Point } from './primitives';
import { inchToMillimeter, toRadian, getCoordinatePoint, getArc, getDimensionalArc, drawMonthParts, groupWithMonthParts, PathElement } from './svg';

// Mock SVG.js
jest.mock('@svgdotjs/svg.js', () => ({
  SVG: jest.fn(() => ({
    point: (x: number, y: number) => ({
      x,
      y,
      clone: jest.fn(),
      transform: jest.fn(),
      transformO: jest.fn(),
      toArray: jest.fn(),
    }),
    path: (d: string) => ({ fill: jest.fn().mockReturnThis(), stroke: jest.fn().mockReturnThis() }),
    group: () => ({ add: jest.fn() }),
  })),
}));

describe('SVG Utilities', () => {
  describe('inchToMillimeter', () => {
    it('converts inches to millimeters correctly', () => {
      expect(inchToMillimeter(1)).toBe(25);
      expect(inchToMillimeter(2)).toBe(50);
    });
  });

  describe('toRadian', () => {
    it('converts degrees to radians correctly', () => {
      expect(toRadian(0)).toBe(0);
      expect(toRadian(90)).toBe(Math.PI / 2);
      expect(toRadian(180)).toBe(Math.PI);
    });
  });

  describe('getCoordinatePoint', () => {
    it('calculates a point on a circle correctly', () => {
      const origin = new Point(0, 0);
      const radius = 10;
      const angle = 0;
      const point = getCoordinatePoint(origin, radius, angle);
      expect(point).toEqual({
        x: 10,
        y: 0,
        pathText: expect.any(Function)
      });
    });
  });

  describe('getArc', () => {
    it('generates an arc path correctly', () => {
      const origin = new Point(0, 0);
      const radius = 10;
      const startAngle = 0;
      const stopAngle = 90;
      const arcPath = getArc(origin, radius, startAngle, stopAngle);
      expect(arcPath.start.x).toBeCloseTo(10);
      expect(arcPath.start.y).toBeCloseTo(0);
      expect(arcPath.stop.x).toBeCloseTo(0);
      expect(arcPath.stop.y).toBeCloseTo(10);
      expect(arcPath.radius).toBe(radius);
      expect(arcPath.params).toBe('0 0 1');
    });
  });

  describe('getDimensionalArc', () => {
    it('generates a dimensional arc correctly', () => {
      const origin = new Point(0, 0);
      const innerRadius = 5;
      const outerRadius = 10;
      const startAngle = 0;
      const stopAngle = 90;
      const dimArc = getDimensionalArc(origin, innerRadius, outerRadius, startAngle, stopAngle);
      expect(dimArc).toBeDefined();
    });
  });

  describe('drawMonthParts', () => {
    it('draws month parts into the SVG drawing', () => {
      const drawing = { add: jest.fn() } as unknown as Svg;
      const monthParts = [{ drawnPath: () => ({}) }];
      drawMonthParts(drawing, monthParts);
      expect(drawing.add).toHaveBeenCalled();
    });
  });

  describe('groupWithMonthParts', () => {
    it('groups month parts into a single SVG group', () => {
      const monthParts = [{ drawnPath: () => ({}) }];
      const group = groupWithMonthParts(monthParts);
      expect(group).toBeDefined();
    });
  });

  describe('PathElement', () => {
    it('creates a path element with default stroke and fill', () => {
      const path = 'M 0,0 L 10,10';
      const pathElement = new PathElement(path);
      
      // Use Reflection to access private fields
      const privateProps = Object.getOwnPropertyDescriptors(
        Object.getPrototypeOf(pathElement)
      );
      
      // Check that the path was set correctly
      expect(pathElement['path']).toBe(path);
      expect(pathElement['stroke']).toBe('black');
      expect(pathElement['fill']).toBe('none');
    });

    it('creates a path element with custom stroke and fill', () => {
      const path = 'M 0,0 L 10,10';
      const stroke = 'red';
      const fill = 'blue';
      const pathElement = new PathElement(path, stroke, fill);
      
      // Check that the path was set correctly
      expect(pathElement['path']).toBe(path);
      expect(pathElement['stroke']).toBe(stroke);
      expect(pathElement['fill']).toBe(fill);
    });

    it('generates a drawn path using SVG.js', () => {
      const path = 'M 0,0 L 10,10';
      const pathElement = new PathElement(path);
      
      const drawnPath = pathElement.drawnPath();
      expect(drawnPath).toBeDefined();
      expect(SVG).toHaveBeenCalled();
    });
  });
}); 