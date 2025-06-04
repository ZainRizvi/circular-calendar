import { SVG } from '@svgdotjs/svg.js';
import { 
  Point, 
  Arc, 
  DimensionalArc, 
  TextCenteredAroundPoint, 
  CurvedText, 
  Circle,
  ArcDrawMode 
} from './primitives';

// Mock SVG.js
jest.mock('@svgdotjs/svg.js', () => ({
  SVG: jest.fn(() => ({
    path: jest.fn().mockReturnValue({
      stroke: jest.fn().mockReturnThis(),
      fill: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis()
    }),
    text: jest.fn().mockReturnValue({
      attr: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      center: jest.fn().mockReturnThis(),
      add: jest.fn().mockReturnThis()
    }),
    circle: jest.fn().mockReturnValue({
      center: jest.fn().mockReturnThis(),
      fill: jest.fn().mockReturnThis()
    }),
    element: jest.fn().mockReturnValue({
      attr: jest.fn().mockReturnThis(),
      node: {
        textContent: ''
      }
    })
  }))
}));

describe('Point', () => {
  it('should create a point with x and y coordinates', () => {
    const point = new Point(10, 20);
    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
  });

  it('should convert to path text format', () => {
    const point = new Point(10, 20);
    expect(point.pathText()).toBe('10,20');
  });
});

describe('Arc', () => {
  it('should create an arc with start, stop, radius and params', () => {
    const start = new Point(0, 0);
    const stop = new Point(10, 0);
    const arc = new Arc(start, stop, 5, '0 0 1');
    
    expect(arc.start).toBe(start);
    expect(arc.stop).toBe(stop);
    expect(arc.radius).toBe(5);
    expect(arc.params).toBe('0 0 1');
  });

  it('should generate path with NEW mode', () => {
    const start = new Point(0, 0);
    const stop = new Point(10, 0);
    const arc = new Arc(start, stop, 5, '0 0 1');
    
    expect(arc.path(ArcDrawMode.NEW)).toBe('m 0,0 A 5,5 0 0 1 10,0');
  });

  it('should generate path with LINE_TO mode', () => {
    const start = new Point(0, 0);
    const stop = new Point(10, 0);
    const arc = new Arc(start, stop, 5, '0 0 1');
    
    expect(arc.path(ArcDrawMode.LINE_TO)).toBe('L 0,0 A 5,5 0 0 1 10,0');
  });

  it('should throw error for invalid mode', () => {
    const start = new Point(0, 0);
    const stop = new Point(10, 0);
    const arc = new Arc(start, stop, 5, '0 0 1');
    
    expect(() => arc.path(999 as ArcDrawMode)).toThrow('Invalid mode 999');
  });

  it('should generate a drawn path', () => {
    const start = new Point(0, 0);
    const stop = new Point(10, 0);
    const arc = new Arc(start, stop, 5, '0 0 1');
    
    const drawnPath = arc.drawnPath();
    expect(drawnPath).toBeDefined();
    expect(SVG).toHaveBeenCalled();
  });
});

describe('DimensionalArc', () => {
  it('should create a dimensional arc with inner and outer arcs', () => {
    const start1 = new Point(0, 0);
    const stop1 = new Point(10, 0);
    const outerArc = new Arc(start1, stop1, 10, '0 0 1');
    
    const start2 = new Point(10, 0);
    const stop2 = new Point(0, 0);
    const innerArc = new Arc(start2, stop2, 5, '0 0 0');
    
    const dimArc = new DimensionalArc(outerArc, innerArc, 'black', 'blue');
    
    expect(dimArc.outerArc).toBe(outerArc);
    expect(dimArc.innerArc).toBe(innerArc);
    expect(dimArc.stroke).toBe('black');
    expect(dimArc.fill).toBe('blue');
  });

  it('should generate a complete path', () => {
    const start1 = new Point(0, 0);
    const stop1 = new Point(10, 0);
    const outerArc = new Arc(start1, stop1, 10, '0 0 1');
    
    const start2 = new Point(10, 0);
    const stop2 = new Point(0, 0);
    const innerArc = new Arc(start2, stop2, 5, '0 0 0');
    
    const dimArc = new DimensionalArc(outerArc, innerArc);
    
    const path = dimArc.path();
    expect(path).toBe('m 0,0 A 10,10 0 0 1 10,0L 10,0 A 5,5 0 0 0 0,0L 0,0');
  });

  it('should generate a drawn path', () => {
    const start1 = new Point(0, 0);
    const stop1 = new Point(10, 0);
    const outerArc = new Arc(start1, stop1, 10, '0 0 1');
    
    const start2 = new Point(10, 0);
    const stop2 = new Point(0, 0);
    const innerArc = new Arc(start2, stop2, 5, '0 0 0');
    
    const dimArc = new DimensionalArc(outerArc, innerArc);
    
    const drawnPath = dimArc.drawnPath();
    expect(drawnPath).toBeDefined();
    expect(SVG).toHaveBeenCalled();
  });
});

describe('TextCenteredAroundPoint', () => {
  it('should create text centered around a point', () => {
    const point = new Point(50, 50);
    const text = new TextCenteredAroundPoint(point, 'Hello', 12, 45);
    
    expect(text.point).toBe(point);
    expect(text.text).toBe('Hello');
    expect(text.font_size).toBe(12);
    expect(text.rotation).toBe(45);
  });

  it('should generate a drawn path', () => {
    const point = new Point(50, 50);
    const text = new TextCenteredAroundPoint(point, 'Hello', 12, 45);
    
    const drawnPath = text.drawnPath();
    expect(drawnPath).toBeDefined();
    expect(SVG).toHaveBeenCalled();
  });
});

describe('CurvedText', () => {
  it('should create curved text along an arc', () => {
    const start = new Point(0, 0);
    const stop = new Point(100, 0);
    const arc = new Arc(start, stop, 50, '0 0 1');
    const curvedText = new CurvedText(arc, 'Curved Text', 14);
    
    expect(curvedText.arc).toBe(arc);
    expect(curvedText.text).toBe('Curved Text');
    expect(curvedText.font_size).toBe(14);
  });

  it('should generate a drawn path', () => {
    const start = new Point(0, 0);
    const stop = new Point(100, 0);
    const arc = new Arc(start, stop, 50, '0 0 1');
    const curvedText = new CurvedText(arc, 'Curved Text');
    
    const drawnPath = curvedText.drawnPath();
    expect(drawnPath).toBeDefined();
    expect(Array.isArray(drawnPath)).toBe(true);
    expect(drawnPath.length).toBe(2);
    expect(SVG).toHaveBeenCalled();
  });
});

describe('Circle', () => {
  it('should create a circle with radius and center point', () => {
    const center = new Point(50, 50);
    const circle = new Circle(25, center);
    
    expect(circle.radius).toBe(25);
    expect(circle.center).toBe(center);
  });

  it('should generate a drawn path', () => {
    const center = new Point(50, 50);
    const circle = new Circle(25, center);
    
    const drawnPath = circle.drawnPath();
    expect(drawnPath).toBeDefined();
    expect(SVG).toHaveBeenCalled();
  });
});