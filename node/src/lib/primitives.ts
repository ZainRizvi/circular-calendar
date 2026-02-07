/**
 * Core primitives for SVG generation.
 */

/**
 * @deprecated Use LayoutConfig.scaleFactor and ComputedLayout.strokeWidth instead.
 * Kept for backward compatibility during migration.
 */
export const SCALE_FACTOR = 0.7;

/**
 * @deprecated Use ComputedLayout.strokeWidth instead.
 * Kept for backward compatibility during migration.
 */
export const STROKE_WIDTH = 0.1 * SCALE_FACTOR;

/**
 * Default stroke width used when none is specified.
 */
export const DEFAULT_STROKE_WIDTH = STROKE_WIDTH;

/**
 * 2D Point with x,y coordinates
 */
export class Point {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  pathText(): string {
    return `${this.x},${this.y}`;
  }
}

/**
 * Drawing mode for arc paths
 */
export enum ArcDrawMode {
  NEW = 'NEW', // Move drawer to starting point
  LINE_TO = 'LINE_TO', // Draw line to starting point
}

/**
 * A linear arc segment
 */
export class Arc {
  constructor(
    public readonly start: Point,
    public readonly stop: Point,
    public readonly radius: number,
    public readonly params: string
  ) {}

  /**
   * Generate SVG path string for this arc
   */
  path(mode: ArcDrawMode): string {
    const startingMode = mode === ArcDrawMode.NEW ? 'm' : 'L';
    return (
      `${startingMode} ${this.start.pathText()} ` +
      `A ${this.radius},${this.radius} ${this.params} ${this.stop.pathText()} `
    );
  }

  /**
   * Generate SVG path element
   * @param stroke - Stroke color (default: 'black')
   * @param fill - Fill color (default: 'none')
   * @param strokeWidth - Stroke width (default: DEFAULT_STROKE_WIDTH)
   */
  drawnPath(
    stroke: string = 'black',
    fill: string = 'none',
    strokeWidth: number = DEFAULT_STROKE_WIDTH
  ): string {
    return `<path d="${this.path(ArcDrawMode.NEW)}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>`;
  }
}

/**
 * A 2D arc (ring segment) with inner and outer arcs
 */
export class DimensionalArc {
  constructor(
    public readonly outerArc: Arc,
    public readonly innerArc: Arc,
    public readonly stroke: string,
    public readonly fill: string
  ) {}

  /**
   * Generate closed path combining outer and inner arcs
   */
  path(): string {
    return (
      this.outerArc.path(ArcDrawMode.NEW) +
      this.innerArc.path(ArcDrawMode.LINE_TO) +
      `L ${this.outerArc.start.pathText()} ` // close off the shape
    );
  }

  /**
   * Generate SVG path element
   * @param strokeWidth - Stroke width (default: DEFAULT_STROKE_WIDTH)
   */
  drawnPath(strokeWidth: number = DEFAULT_STROKE_WIDTH): string {
    return `<path d="${this.path()}" stroke="${this.stroke}" stroke-width="${strokeWidth}" fill="${this.fill}"/>`;
  }
}

/**
 * Text centered around a point with rotation
 */
export class TextCenteredAroundPoint {
  constructor(
    public readonly point: Point,
    public readonly text: string,
    public readonly fontSize: number,
    public readonly rotation: number
  ) {}

  /**
   * Generate SVG text element
   */
  drawnPath(): string {
    // The extra offset for y will correctly center the text vertically
    const y = this.point.y + this.fontSize * 0.1;
    return (
      `<text x="${this.point.x}" y="${y}" ` +
      `font-size="${this.fontSize}" ` +
      `text-anchor="middle" ` +
      `dominant-baseline="middle" ` +
      `transform="rotate(${this.rotation}, ${this.point.x}, ${this.point.y})"` +
      `>${this.text}</text>`
    );
  }
}

// Counter for generating unique IDs for textPath references
let textPathIdCounter = 0;

/**
 * Reset the textPath ID counter (useful for tests)
 */
export function resetTextPathIdCounter(): void {
  textPathIdCounter = 0;
}

/**
 * Text that follows a curved arc path
 */
export class CurvedText {
  constructor(
    public readonly arc: Arc,
    public readonly text: string,
    public readonly fontSize: number = 30
  ) {}

  /**
   * Generate SVG path and text elements
   * Returns [path element, text element with textPath]
   */
  drawnPath(): [string, string] {
    const pathId = `textpath-${textPathIdCounter++}`;

    // Path element (invisible, just for text to follow)
    const pathSvg = `<path id="${pathId}" d="${this.arc.path(ArcDrawMode.NEW)}" stroke="none" fill="none"/>`;

    // Text element with textPath reference
    const textSvg =
      `<text font-size="${this.fontSize}" font-family="Arimo, Arial, Helvetica, sans-serif">` +
      `<textPath href="#${pathId}" startOffset="50%" method="align" text-anchor="middle" dominant-baseline="middle">` +
      `${this.text}` +
      `</textPath>` +
      `</text>`;

    return [pathSvg, textSvg];
  }
}

/**
 * Circle shape
 */
export class Circle {
  constructor(
    public readonly radius: number,
    public readonly center: Point
  ) {}

  /**
   * Generate SVG circle element
   */
  drawnPath(): [string] {
    return [
      `<circle cx="${this.center.x}" cy="${this.center.y}" r="${this.radius}" fill="red"/>`,
    ];
  }
}

/**
 * Interface for drawable elements
 */
export interface Drawable {
  drawnPath(): string | string[];
}
