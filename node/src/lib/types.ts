/**
 * Shared interfaces for the calendar library.
 */

/**
 * Result of SVG to PNG rendering.
 */
export interface SvgRenderResult {
  pngBuffer: Uint8Array;
  widthPts: number;
  heightPts: number;
}

/**
 * Interface for SVG rendering strategies.
 * Implementations can use different backends (resvg-js, canvas, etc.)
 */
export interface SvgRenderer {
  render(svgContent: string): Promise<SvgRenderResult>;
}
