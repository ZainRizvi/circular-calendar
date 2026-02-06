/**
 * SVG to PNG renderer using @resvg/resvg-js.
 *
 * This module implements the SvgRenderer interface for Node.js environments
 * using the Rust-based resvg WASM library.
 */

import { Resvg } from '@resvg/resvg-js';
import type { SvgRenderer, SvgRenderResult } from '../lib/types.js';

/**
 * Options for creating a resvg renderer.
 */
export interface ResvgRendererOptions {
  /** Output DPI (default: 150) */
  dpi?: number;
}

/**
 * Parse SVG dimension string to points (1 point = 1/72 inch).
 */
export function parseSizeToPoints(sizeStr: string | null | undefined): number {
  if (!sizeStr) {
    return 612.0; // Default letter width
  }

  const match = sizeStr.match(/[\d.]+/);
  if (!match) {
    return 612.0;
  }

  const num = parseFloat(match[0]);

  if (sizeStr.includes('mm')) {
    return (num * 72) / 25.4;
  }
  if (sizeStr.includes('in')) {
    return num * 72;
  }
  if (sizeStr.includes('pt')) {
    return num;
  }
  if (sizeStr.includes('px')) {
    return (num * 72) / 96;
  }

  // Default: treat as points
  return num;
}

/**
 * Create an SVG renderer using @resvg/resvg-js.
 *
 * @param options - Renderer options
 * @returns SvgRenderer implementation
 */
export function createResvgRenderer(
  options: ResvgRendererOptions = {}
): SvgRenderer {
  const dpi = options.dpi ?? 150;

  return {
    async render(svgContent: string): Promise<SvgRenderResult> {
      // Extract width/height from SVG
      const widthMatch = svgContent.match(/width="([^"]+)"/);
      const heightMatch = svgContent.match(/height="([^"]+)"/);

      const widthPts = parseSizeToPoints(widthMatch?.[1]);
      const heightPts = parseSizeToPoints(heightMatch?.[1]);

      // Calculate pixel dimensions based on DPI
      const scale = dpi / 72;
      const widthPx = Math.round(widthPts * scale);

      // Use resvg to render SVG to PNG
      const resvg = new Resvg(svgContent, {
        fitTo: {
          mode: 'width',
          value: widthPx,
        },
        font: {
          loadSystemFonts: true,
        },
      });

      const pngData = resvg.render();
      const pngBuffer = new Uint8Array(pngData.asPng());

      return {
        pngBuffer,
        widthPts,
        heightPts,
      };
    },
  };
}
