/**
 * Tests for resvg-renderer module.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import { createResvgRenderer, parseSizeToPoints } from './resvg-renderer.ts';
import type { SvgRenderer } from '../lib/types.js';

describe('parseSizeToPoints', () => {
  it('should parse mm values', () => {
    // 25.4mm = 1 inch = 72 points
    expect(parseSizeToPoints('25.4mm')).toBeCloseTo(72);
  });

  it('should parse inch values', () => {
    expect(parseSizeToPoints('1in')).toBe(72);
    expect(parseSizeToPoints('8.5in')).toBe(612);
  });

  it('should parse pt values', () => {
    expect(parseSizeToPoints('72pt')).toBe(72);
  });

  it('should parse px values', () => {
    // 96px = 72pt
    expect(parseSizeToPoints('96px')).toBe(72);
  });

  it('should treat plain numbers as points', () => {
    expect(parseSizeToPoints('100')).toBe(100);
  });

  it('should return default for null/undefined', () => {
    expect(parseSizeToPoints(null)).toBe(612);
    expect(parseSizeToPoints(undefined)).toBe(612);
  });
});

describe('createResvgRenderer', () => {
  it('should create a renderer with default DPI', () => {
    const renderer = createResvgRenderer();
    expect(renderer).toHaveProperty('render');
  });

  it('should create a renderer with custom DPI', () => {
    const renderer = createResvgRenderer({ dpi: 300 });
    expect(renderer).toHaveProperty('render');
  });

  it('should implement SvgRenderer interface', () => {
    const renderer: SvgRenderer = createResvgRenderer();
    expect(typeof renderer.render).toBe('function');
  });
});

describe('ResvgRenderer.render', () => {
  it('should render simple SVG to PNG', async () => {
    const renderer = createResvgRenderer({ dpi: 72 });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="red"/>
    </svg>`;

    const result = await renderer.render(svg);

    expect(result).toHaveProperty('pngBuffer');
    expect(result).toHaveProperty('widthPts');
    expect(result).toHaveProperty('heightPts');
    expect(result.pngBuffer).toBeInstanceOf(Uint8Array);
    expect(result.pngBuffer.length).toBeGreaterThan(0);
  });

  it('should return correct dimensions for mm-based SVG', async () => {
    const renderer = createResvgRenderer({ dpi: 72 });
    // 212.5mm = 8.5 inches = 612 points
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="212.5mm" height="275mm">
      <rect x="0" y="0" width="100" height="100" fill="blue"/>
    </svg>`;

    const result = await renderer.render(svg);

    // 212.5mm * 72 / 25.4 ≈ 602.36, 275mm * 72 / 25.4 ≈ 779.53
    expect(result.widthPts).toBeCloseTo(602.36, 0);
    expect(result.heightPts).toBeCloseTo(779.53, 0);
  });

  it('should handle SVG with text elements', async () => {
    const renderer = createResvgRenderer({ dpi: 72 });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
      <text x="10" y="50" font-size="20">Hello World</text>
    </svg>`;

    const result = await renderer.render(svg);

    expect(result.pngBuffer.length).toBeGreaterThan(0);
  });

  it('should scale correctly when using fontData option', async () => {
    // This test verifies the workaround for resvg-js native builds:
    // fontBuffers is WASM-only, so we use fontFiles via temp file.
    // If the workaround breaks, fitTo scaling would fail.
    const fontPath = path.join(__dirname, '../fonts/Arimo-Regular.ttf');
    const fontData = new Uint8Array(fs.readFileSync(fontPath));

    // Render at 2x DPI (144 instead of 72) with fontData
    const renderer = createResvgRenderer({ dpi: 144, fontData });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="white"/>
      <text x="50" y="60" font-family="Arimo, Arial" font-size="20" text-anchor="middle">Test</text>
    </svg>`;

    const result = await renderer.render(svg);

    // Parse the PNG to verify actual pixel dimensions
    const png = PNG.sync.read(Buffer.from(result.pngBuffer));

    // At 144 DPI, a 100pt SVG should render to 200px (100 * 144/72 = 200)
    expect(png.width).toBe(200);
    expect(png.height).toBe(200);
  });
});
