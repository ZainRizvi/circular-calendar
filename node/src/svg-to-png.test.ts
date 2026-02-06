/**
 * Tests for svg-to-png module.
 */

import { describe, it, expect } from 'vitest';
import { svgToPng, parseSizeToPoints, SvgDimensions } from './svg-to-png.js';

describe('parseSizeToPoints', () => {
  it('should parse millimeters to points', () => {
    // 1 inch = 25.4mm = 72 points
    // So 25.4mm = 72 points, 1mm = 72/25.4 points
    const result = parseSizeToPoints('25.4mm');
    expect(result).toBeCloseTo(72);
  });

  it('should parse inches to points', () => {
    // 1 inch = 72 points
    const result = parseSizeToPoints('1in');
    expect(result).toBe(72);
  });

  it('should parse points directly', () => {
    const result = parseSizeToPoints('100pt');
    expect(result).toBe(100);
  });

  it('should parse pixels to points', () => {
    // 96 pixels = 72 points (at 96 DPI)
    const result = parseSizeToPoints('96px');
    expect(result).toBe(72);
  });

  it('should handle numeric values without units as points', () => {
    const result = parseSizeToPoints('200');
    expect(result).toBe(200);
  });

  it('should return default for empty/null input', () => {
    expect(parseSizeToPoints('')).toBe(612); // Default letter width
    expect(parseSizeToPoints(null as unknown as string)).toBe(612);
    expect(parseSizeToPoints(undefined as unknown as string)).toBe(612);
  });

  it('should handle decimal values', () => {
    const result = parseSizeToPoints('8.5in');
    expect(result).toBeCloseTo(612); // 8.5 * 72 = 612
  });
});

describe('svgToPng', () => {
  const simpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <rect x="10" y="10" width="80" height="80" fill="blue"/>
  </svg>`;

  const svgWithMmUnits = `<svg xmlns="http://www.w3.org/2000/svg" width="212.5mm" height="275mm" viewBox="0 0 212.5 275">
    <circle cx="100" cy="100" r="50" fill="red"/>
  </svg>`;

  it('should convert simple SVG to PNG buffer', async () => {
    const result = await svgToPng(simpleSvg);
    expect(result.pngBuffer).toBeInstanceOf(Buffer);
    expect(result.pngBuffer.length).toBeGreaterThan(0);

    // Check PNG magic bytes
    expect(result.pngBuffer[0]).toBe(0x89);
    expect(result.pngBuffer[1]).toBe(0x50); // P
    expect(result.pngBuffer[2]).toBe(0x4e); // N
    expect(result.pngBuffer[3]).toBe(0x47); // G
  });

  it('should return correct dimensions', async () => {
    const result = await svgToPng(simpleSvg);
    expect(result.widthPts).toBe(100);
    expect(result.heightPts).toBe(100);
  });

  it('should handle SVG with millimeter units', async () => {
    const result = await svgToPng(svgWithMmUnits);

    // 212.5mm = 212.5 * 72 / 25.4 ≈ 602 points
    expect(result.widthPts).toBeCloseTo(602, 0);

    // 275mm = 275 * 72 / 25.4 ≈ 780 points
    expect(result.heightPts).toBeCloseTo(780, 0);
  });

  it('should scale PNG dimensions based on DPI', async () => {
    const result = await svgToPng(simpleSvg, 150);

    // At 150 DPI, 100pt = 100 * 150/72 ≈ 208.33 pixels
    const expectedWidthPx = Math.round(100 * (150 / 72));
    expect(result.widthPx).toBe(expectedWidthPx);
    expect(result.heightPx).toBe(expectedWidthPx);
  });

  it('should return all dimension info', async () => {
    const result = await svgToPng(simpleSvg, 150);
    expect(result).toHaveProperty('widthPts');
    expect(result).toHaveProperty('heightPts');
    expect(result).toHaveProperty('widthPx');
    expect(result).toHaveProperty('heightPx');
    expect(result).toHaveProperty('dpi');
    expect(result).toHaveProperty('pngBuffer');
    expect(result.dpi).toBe(150);
  });

  it('should use default DPI of 150', async () => {
    const result = await svgToPng(simpleSvg);
    expect(result.dpi).toBe(150);
  });
});
