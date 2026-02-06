/**
 * Convert SVG to PNG using resvg-js (Rust-based WASM).
 * Ported from Python svg_to_png.py
 */

import { Resvg } from '@resvg/resvg-js';

/**
 * Dimensions returned from SVG to PNG conversion.
 */
export interface SvgDimensions {
  widthPts: number;
  heightPts: number;
  widthPx: number;
  heightPx: number;
  dpi: number;
  pngBuffer: Buffer;
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
 * Convert SVG string to PNG buffer.
 *
 * @param svgString - SVG content as string
 * @param dpi - Output DPI (default 150)
 * @returns PNG buffer and dimension metadata
 */
export async function svgToPng(
  svgString: string,
  dpi: number = 150
): Promise<SvgDimensions> {
  // Extract width/height from SVG
  const widthMatch = svgString.match(/width="([^"]+)"/);
  const heightMatch = svgString.match(/height="([^"]+)"/);

  const widthPts = parseSizeToPoints(widthMatch?.[1]);
  const heightPts = parseSizeToPoints(heightMatch?.[1]);

  // Calculate pixel dimensions based on DPI
  const scale = dpi / 72;
  const widthPx = Math.round(widthPts * scale);
  const heightPx = Math.round(heightPts * scale);

  // Use resvg to render SVG to PNG
  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: 'width',
      value: widthPx,
    },
    font: {
      loadSystemFonts: true,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = Buffer.from(pngData.asPng());

  return {
    widthPts,
    heightPts,
    widthPx,
    heightPx,
    dpi,
    pngBuffer,
  };
}

/**
 * Convert SVG file to PNG file.
 *
 * @param svgPath - Path to SVG file
 * @param pngPath - Output path for PNG file
 * @param dpi - Output DPI (default 150)
 * @returns Dimension metadata
 */
export async function svgFileToPng(
  svgPath: string,
  pngPath: string,
  dpi: number = 150
): Promise<Omit<SvgDimensions, 'pngBuffer'>> {
  const fs = await import('fs/promises');

  const svgContent = await fs.readFile(svgPath, 'utf-8');
  const result = await svgToPng(svgContent, dpi);

  await fs.writeFile(pngPath, result.pngBuffer);

  return {
    widthPts: result.widthPts,
    heightPts: result.heightPts,
    widthPx: result.widthPx,
    heightPx: result.heightPx,
    dpi: result.dpi,
  };
}
