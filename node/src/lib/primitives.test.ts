import { describe, it, expect } from 'vitest';
import {
  Point,
  Arc,
  ArcDrawMode,
  DimensionalArc,
  TextCenteredAroundPoint,
  CurvedText,
  Circle,
  SCALE_FACTOR,
  STROKE_WIDTH,
  DEFAULT_STROKE_WIDTH,
} from './primitives.ts';

describe('Point', () => {
  it('should store x and y coordinates', () => {
    const p = new Point(10, 20);
    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
  });

  it('should generate path text', () => {
    const p = new Point(10.5, 20.25);
    expect(p.pathText()).toBe('10.5,20.25');
  });
});

describe('Arc', () => {
  it('should create arc with start, stop, radius, and params', () => {
    const start = new Point(0, 0);
    const stop = new Point(100, 0);
    const arc = new Arc(start, stop, 100, '0 0 1');
    expect(arc.start).toBe(start);
    expect(arc.stop).toBe(stop);
    expect(arc.radius).toBe(100);
    expect(arc.params).toBe('0 0 1');
  });

  it('should generate path with NEW mode (move to start)', () => {
    const start = new Point(10, 20);
    const stop = new Point(30, 40);
    const arc = new Arc(start, stop, 50, '0 0 1');
    const path = arc.path(ArcDrawMode.NEW);
    expect(path).toBe('m 10,20 A 50,50 0 0 1 30,40 ');
  });

  it('should generate path with LINE_TO mode', () => {
    const start = new Point(10, 20);
    const stop = new Point(30, 40);
    const arc = new Arc(start, stop, 50, '0 0 1');
    const path = arc.path(ArcDrawMode.LINE_TO);
    expect(path).toBe('L 10,20 A 50,50 0 0 1 30,40 ');
  });

  it('should generate drawnPath SVG element', () => {
    const start = new Point(10, 20);
    const stop = new Point(30, 40);
    const arc = new Arc(start, stop, 50, '0 0 1');
    const svg = arc.drawnPath('red', 'blue');
    expect(svg).toContain('<path');
    expect(svg).toContain('stroke="red"');
    expect(svg).toContain('fill="blue"');
    expect(svg).toContain(`stroke-width="${STROKE_WIDTH}"`);
    expect(svg).toContain('d="m 10,20 A 50,50 0 0 1 30,40 "');
  });
});

describe('DimensionalArc', () => {
  it('should create dimensional arc with outer and inner arcs', () => {
    const outerStart = new Point(0, 100);
    const outerStop = new Point(100, 0);
    const innerStart = new Point(0, 50);
    const innerStop = new Point(50, 0);

    const outerArc = new Arc(outerStart, outerStop, 100, '0 0 1');
    const innerArc = new Arc(innerStop, innerStart, 50, '0 0 0'); // reversed for closing path

    const dimArc = new DimensionalArc(outerArc, innerArc, 'black', 'green');
    expect(dimArc.outerArc).toBe(outerArc);
    expect(dimArc.innerArc).toBe(innerArc);
    expect(dimArc.stroke).toBe('black');
    expect(dimArc.fill).toBe('green');
  });

  it('should generate closed path', () => {
    const outerStart = new Point(0, 100);
    const outerStop = new Point(100, 0);
    const innerStop = new Point(50, 0);
    const innerStart = new Point(0, 50);

    const outerArc = new Arc(outerStart, outerStop, 100, '0 0 1');
    const innerArc = new Arc(innerStop, innerStart, 50, '0 0 0');

    const dimArc = new DimensionalArc(outerArc, innerArc, 'black', 'green');
    const path = dimArc.path();

    // Should have: outer arc (NEW) + inner arc (LINE_TO) + close back to outer start
    expect(path).toContain('m 0,100 A 100,100 0 0 1 100,0'); // outer arc
    expect(path).toContain('L 50,0 A 50,50 0 0 0 0,50'); // inner arc
    expect(path).toContain('L 0,100'); // close to outer start
  });

  it('should generate drawnPath SVG element', () => {
    const outerArc = new Arc(new Point(0, 100), new Point(100, 0), 100, '0 0 1');
    const innerArc = new Arc(new Point(50, 0), new Point(0, 50), 50, '0 0 0');

    const dimArc = new DimensionalArc(outerArc, innerArc, 'purple', 'yellow');
    const svg = dimArc.drawnPath();

    expect(svg).toContain('<path');
    expect(svg).toContain('stroke="purple"');
    expect(svg).toContain('fill="yellow"');
  });
});

describe('TextCenteredAroundPoint', () => {
  it('should create text element with rotation transform', () => {
    const point = new Point(50, 100);
    const text = new TextCenteredAroundPoint(point, 'Hello', 24, 45);
    const svg = text.drawnPath();

    expect(svg).toContain('<text');
    expect(svg).toContain('Hello');
    expect(svg).toContain('font-size="24"');
    expect(svg).toContain('text-anchor="middle"');
    expect(svg).toContain('dominant-baseline="middle"');
    expect(svg).toContain('transform="rotate(45, 50, 100)"');
  });

  it('should apply slight vertical offset for centering', () => {
    const point = new Point(50, 100);
    const text = new TextCenteredAroundPoint(point, 'Test', 20, 0);
    const svg = text.drawnPath();

    // y position should be point.y + font_size * 0.1 = 100 + 20 * 0.1 = 102
    expect(svg).toContain('x="50"');
    expect(svg).toContain('y="102"');
  });
});

describe('CurvedText', () => {
  it('should return array with path and text elements', () => {
    const arc = new Arc(new Point(0, 100), new Point(100, 0), 100, '0 0 1');
    const curvedText = new CurvedText(arc, 'Curved', 30);
    const result = curvedText.drawnPath();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);

    // First element should be the path (invisible, for text to follow)
    const [pathSvg, textSvg] = result;
    expect(pathSvg).toContain('<path');
    expect(pathSvg).toContain('stroke="none"');

    // Second element should be text with textPath
    expect(textSvg).toContain('<text');
    expect(textSvg).toContain('<textPath');
    expect(textSvg).toContain('Curved');
    expect(textSvg).toContain('startOffset="50%"');
    expect(textSvg).toContain('text-anchor="middle"');
  });

  it('should use default font size of 30', () => {
    const arc = new Arc(new Point(0, 100), new Point(100, 0), 100, '0 0 1');
    const curvedText = new CurvedText(arc, 'Test');
    expect(curvedText.fontSize).toBe(30);
  });
});

describe('Circle', () => {
  it('should generate circle SVG element', () => {
    const center = new Point(100, 100);
    const circle = new Circle(50, center);
    const result = circle.drawnPath();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);

    const svg = result[0];
    expect(svg).toContain('<circle');
    expect(svg).toContain('cx="100"');
    expect(svg).toContain('cy="100"');
    expect(svg).toContain('r="50"');
    expect(svg).toContain('fill="red"');
  });
});

describe('Constants', () => {
  it('SCALE_FACTOR should be 0.7', () => {
    expect(SCALE_FACTOR).toBe(0.7);
  });

  it('STROKE_WIDTH should be 0.1 * SCALE_FACTOR', () => {
    expect(STROKE_WIDTH).toBe(0.1 * 0.7);
  });

  it('DEFAULT_STROKE_WIDTH should equal STROKE_WIDTH', () => {
    expect(DEFAULT_STROKE_WIDTH).toBe(STROKE_WIDTH);
  });
});

describe('Injectable stroke width', () => {
  it('Arc.drawnPath should accept custom strokeWidth', () => {
    const start = new Point(10, 20);
    const stop = new Point(30, 40);
    const arc = new Arc(start, stop, 50, '0 0 1');
    const customWidth = 0.5;
    const svg = arc.drawnPath('black', 'none', customWidth);
    expect(svg).toContain(`stroke-width="${customWidth}"`);
  });

  it('DimensionalArc.drawnPath should accept custom strokeWidth', () => {
    const outerArc = new Arc(new Point(0, 100), new Point(100, 0), 100, '0 0 1');
    const innerArc = new Arc(new Point(50, 0), new Point(0, 50), 50, '0 0 0');
    const dimArc = new DimensionalArc(outerArc, innerArc, 'black', 'green');
    const customWidth = 0.3;
    const svg = dimArc.drawnPath(customWidth);
    expect(svg).toContain(`stroke-width="${customWidth}"`);
  });
});
