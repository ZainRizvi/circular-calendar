/**
 * Font loading utilities for serverless environments.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const FONT_FILENAME = 'Arimo-Regular.ttf';

/**
 * Load the bundled Arimo font for use in serverless environments.
 * Arimo is metrically compatible with Arial.
 *
 * Uses multiple strategies to find the font file:
 * 1. Relative to process.cwd() (works in Next.js)
 * 2. Relative to __dirname (works in Node.js CLI)
 *
 * @returns Font data as Uint8Array
 */
export async function loadBundledFont(): Promise<Uint8Array> {
  // Possible font locations
  const possiblePaths = [
    // Next.js app public directory (works on Vercel and local)
    path.join(process.cwd(), 'public', 'fonts', FONT_FILENAME),
    // When running from app/ directory (Next.js), font is in ../node/src/fonts/
    path.join(process.cwd(), '..', 'node', 'src', 'fonts', FONT_FILENAME),
    // When running from circular-calendar/ root
    path.join(process.cwd(), 'node', 'src', 'fonts', FONT_FILENAME),
    // When running from node/ directory (CLI)
    path.join(process.cwd(), 'src', 'fonts', FONT_FILENAME),
    // Fallback: relative to this file
    path.join(__dirname, '..', 'fonts', FONT_FILENAME),
  ];

  for (const fontPath of possiblePaths) {
    try {
      const buffer = await fs.readFile(fontPath);
      return new Uint8Array(buffer);
    } catch {
      // Try next path
    }
  }

  throw new Error(
    `Could not find ${FONT_FILENAME} font file. Searched paths:\n${possiblePaths.join('\n')}`
  );
}
