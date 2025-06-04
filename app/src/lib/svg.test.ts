import { SVG, Svg } from '@svgdotjs/svg.js';
import { Point } from './primitives';
import { inchToMillimeter, toRadian, getCoordinatePoint, getArc, getDimensionalArc, drawMonthParts, groupWithMonthParts, PathElement } from './svg';

// Mock SVG.js since it requires a browser environment
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
    path: jest.fn().mockReturnValue({
      fill: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis()
    }),
    group: jest.fn().mockReturnValue({
      add: jest.fn()
    }),
  })),
}));

// Mock the PathElement class
jest.mock('../lib/svg', () => {
  const originalModule = jest.requireActual('../lib/svg');
  
  // Override the PathElement class
  class MockPathElement extends originalModule.PathElement {
    drawnPath() {
      return { mockedPath: true };
    }
  }
  
  return {
    ...originalModule,
    PathElement: MockPathElement
  };
});

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

    it('calculates a point at different angles', () => {
      const origin = new Point(0, 0);
      const radius = 10;
      
      // Test at 90 degrees
      let point = getCoordinatePoint(origin, radius, 90);
      expect(point.x).toBeCloseTo(0);
      expect(point.y).toBeCloseTo(10);
      
      // Test at 180 degrees
      point = getCoordinatePoint(origin, radius, 180);
      expect(point.x).toBeCloseTo(-10);
      expect(point.y).toBeCloseTo(0);
      
      // Test at 270 degrees
      point = getCoordinatePoint(origin, radius, 270);
      expect(point.x).toBeCloseTo(0);
      expect(point.y).toBeCloseTo(-10);
    });

    it('calculates a point with non-origin center', () => {
      const origin = new Point(10, 20);
      const radius = 5;
      const angle = 0;
      const point = getCoordinatePoint(origin, radius, angle);
      expect(point.x).toBeCloseTo(15);
      expect(point.y).toBeCloseTo(20);
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

    it('handles arcs spanning more than 180 degrees', () => {
      const origin = new Point(0, 0);
      const radius = 10;
      const startAngle = 0;
      const stopAngle = 200;
      const arcPath = getArc(origin, radius, startAngle, stopAngle);
      expect(arcPath.params).toBe('0 1 1'); // large-arc-flag should be 1
    });

    it('handles counter-clockwise arcs', () => {
      const origin = new Point(0, 0);
      const radius = 10;
      const startAngle = 90;
      const stopAngle = 0;
      const arcPath = getArc(origin, radius, startAngle, stopAngle);
      expect(arcPath.params).toBe('0 0 0'); // sweep-flag should be 0
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
      expect(dimArc.outerArc.radius).toBe(outerRadius);
      expect(dimArc.innerArc.radius).toBe(innerRadius);
    });

    it('allows custom stroke and fill', () => {
      const origin = new Point(0, 0);
      const innerRadius = 5;
      const outerRadius = 10;
      const startAngle = 0;
      const stopAngle = 90;
      const stroke = 'red';
      const fill = 'blue';
      const dimArc = getDimensionalArc(origin, innerRadius, outerRadius, startAngle, stopAngle, stroke, fill);
      expect(dimArc.stroke).toBe(stroke);
      expect(dimArc.fill).toBe(fill);
    });
  });

  describe('drawMonthParts', () => {
    it('draws month parts into the SVG drawing', () => {
      // Create a mock SVG drawing
      const drawing = { add: jest.fn() } as unknown as Svg;
      const mockDrawnPath = {};
      const monthParts = [{ drawnPath: () => mockDrawnPath }];
      
      drawMonthParts(drawing, monthParts);
      expect(drawing.add).toHaveBeenCalledWith(mockDrawnPath);
    });

    it('handles array of drawn paths', () => {
      // Create a mock SVG drawing
      const drawing = { add: jest.fn(), path: jest.fn() } as unknown as Svg;
      const mockDrawnPath1 = {};
      const mockDrawnPath2 = {};
      const monthParts = [{ drawnPath: () => [mockDrawnPath1, mockDrawnPath2] }];
      
      drawMonthParts(drawing, monthParts);
      expect(drawing.add).toHaveBeenCalledWith(mockDrawnPath1);
      expect(drawing.add).toHaveBeenCalledWith(mockDrawnPath2);
    });

    it('handles string paths', () => {
      // Create a mock SVG drawing
      const mockPath = {};
      const drawing = { 
        add: jest.fn(), 
        path: jest.fn().mockReturnValue(mockPath) 
      } as unknown as Svg;
      const monthParts = [{ drawnPath: () => 'M 0,0 L 10,10' }];
      
      drawMonthParts(drawing, monthParts);
      expect(drawing.path).toHaveBeenCalledWith('M 0,0 L 10,10');
      expect(drawing.add).toHaveBeenCalledWith(mockPath);
    });
  });

  describe('groupWithMonthParts', () => {
    it('groups month parts into a single SVG group', () => {
      const mockGroup = { add: jest.fn() };
      (SVG as jest.Mock).mockReturnValue({
        group: jest.fn().mockReturnValue(mockGroup)
      });
      
      const mockDrawnPath = {};
      const monthParts = [{ drawnPath: () => mockDrawnPath }];
      
      const group = groupWithMonthParts(monthParts);
      expect(group).toBe(mockGroup);
      expect(mockGroup.add).toHaveBeenCalledWith(mockDrawnPath);
    });
  });

  describe('PathElement', () => {
    it('creates a path element with default stroke and fill', () => {
      const path = 'M 0,0 L 10,10';
      const pathElement = new PathElement(path);
      
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

    // Skipping this test as it requires a DOM environment
    it.skip('generates a drawn path', () => {
      const path = 'M 0,0 L 10,10';
      const pathElement = new PathElement(path);
      
      const drawnPath = pathElement.drawnPath();
      expect(drawnPath).toBeDefined();
    });
  });
}); 