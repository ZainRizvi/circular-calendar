/**
 * SVG to PNG renderer using @resvg/resvg-js.
 *
 * This module implements the SvgRenderer interface for Node.js environments
 * using the Rust-based resvg WASM library.
 */

import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { SvgRenderer, SvgRenderResult } from '../lib/types.ts';

/**
 * Options for creating a resvg renderer.
 */
export interface ResvgRendererOptions {
  /** Output DPI (default: 150) */
  dpi?: number;
  /** Custom font data to load (for serverless environments without system fonts) */
  fontData?: Uint8Array;
}

// Cache for temp font file path
let tempFontPath: string | null = null;

// Cleanup temp font file on process exit
function cleanupTempFont(): void {
  if (tempFontPath) {
    try {
      fs.unlinkSync(tempFontPath);
    } catch {
      // Ignore cleanup errors
    }
    tempFontPath = null;
  }
}

process.on('exit', cleanupTempFont);
process.on('SIGINT', () => {
  cleanupTempFont();
  process.exit(130);
});
process.on('SIGTERM', () => {
  cleanupTempFont();
  process.exit(143);
});

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
  const { dpi = 150, fontData } = options;

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

      // Configure font options based on whether custom font data is provided
      // Note: We use fontFiles instead of fontBuffers because of a resvg-js bug
      // where fitTo scaling is ignored when using fontBuffers.
      let fontOptions: { loadSystemFonts: boolean; fontFiles?: string[] };

      if (fontData) {
        // Write font to temp file if not already done
        // (fontFiles works correctly with fitTo, fontBuffers does not)
        if (!tempFontPath) {
          tempFontPath = path.join(os.tmpdir(), `resvg-font-${Date.now()}.ttf`);
          await fs.promises.writeFile(tempFontPath, fontData);
        }
        fontOptions = {
          loadSystemFonts: false,
          fontFiles: [tempFontPath],
        };
      } else {
        fontOptions = {
          loadSystemFonts: true,
        };
      }

      // Use resvg to render SVG to PNG
      const resvg = new Resvg(svgContent, {
        fitTo: {
          mode: 'width',
          value: widthPx,
        },
        font: fontOptions,
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
