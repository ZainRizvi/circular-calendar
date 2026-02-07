/**
 * Integration test verifying API and CLI produce identical PDFs.
 *
 * This test:
 * 1. Starts the Next.js dev server
 * 2. Generates a PDF via the /api/generate endpoint
 * 3. Generates a PDF via the serverless pipeline (same as CLI)
 * 4. Verifies both PDFs have identical structure and content
 *
 * Note: PDFs are compared structurally (pages, sizes, embedded images) rather than
 * byte-for-byte since pdf-lib generates unique document IDs and timestamps.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import {
  DEFAULT_LAYOUT_CONFIG,
  getAlignmentParams,
  generateCalendarPdfBytes,
} from '@calendar-lib/index';
import { createResvgRenderer, loadBundledFont } from '@calendar-renderers/index';

const APP_DIR = path.resolve(__dirname, '../..');
const SERVER_PORT = 3457; // Use non-default port to avoid conflicts
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Use a fixed date for deterministic output
const TEST_DATE = '2026-02-05';

describe('API and CLI PDF parity', () => {
  let serverProcess: ChildProcess | null = null;

  /**
   * Start the Next.js dev server and wait for it to be ready.
   */
  async function startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      serverProcess = spawn('npm', ['run', 'dev', '--', '-p', String(SERVER_PORT)], {
        cwd: APP_DIR,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'development' },
      });

      let output = '';
      const timeout = setTimeout(() => {
        reject(new Error(`Server failed to start within timeout. Output: ${output}`));
      }, 60000);

      serverProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
        // Next.js 15 prints "Ready" when the server is ready
        if (output.includes('Ready') || output.includes(`localhost:${SERVER_PORT}`)) {
          clearTimeout(timeout);
          // Give it a moment to fully initialize
          setTimeout(resolve, 1000);
        }
      });

      serverProcess.stderr?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      serverProcess.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      serverProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          clearTimeout(timeout);
          reject(new Error(`Server exited with code ${code}. Output: ${output}`));
        }
      });
    });
  }

  /**
   * Stop the dev server.
   */
  function stopServer(): void {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
      serverProcess = null;
    }
  }

  /**
   * Fetch PDF from the API endpoint.
   */
  async function fetchPdfFromApi(date: string): Promise<Uint8Array> {
    const url = `${SERVER_URL}/api/generate?gregorian=${date}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API request failed: ${response.status} ${text}`);
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Generate PDF using the serverless pipeline (same code path as CLI).
   */
  async function generatePdfViaPipeline(date: string): Promise<Uint8Array> {
    const fontData = await loadBundledFont();
    const renderer = createResvgRenderer({ dpi: 600, fontData });
    const alignment = getAlignmentParams(new Date(date));

    return generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment,
      renderer,
    });
  }

  beforeAll(async () => {
    await startServer();
  }, 90000); // 90s timeout for server startup

  afterAll(() => {
    stopServer();
  });

  it('produces identical PDFs from API and CLI for a fixed date', async () => {
    // Generate PDF via API
    const apiPdf = await fetchPdfFromApi(TEST_DATE);

    // Generate PDF via pipeline (same as CLI)
    const cliPdf = await generatePdfViaPipeline(TEST_DATE);

    // Both should be valid PDFs
    const apiHeader = new TextDecoder().decode(apiPdf.slice(0, 5));
    const cliHeader = new TextDecoder().decode(cliPdf.slice(0, 5));
    expect(apiHeader).toBe('%PDF-');
    expect(cliHeader).toBe('%PDF-');

    // Load PDFs for structural comparison
    const apiDoc = await PDFDocument.load(apiPdf);
    const cliDoc = await PDFDocument.load(cliPdf);

    // Same number of pages
    expect(apiDoc.getPageCount()).toBe(cliDoc.getPageCount());

    // Same page dimensions for each page
    for (let i = 0; i < apiDoc.getPageCount(); i++) {
      const apiPage = apiDoc.getPage(i);
      const cliPage = cliDoc.getPage(i);
      const apiSize = apiPage.getSize();
      const cliSize = cliPage.getSize();

      expect(apiSize.width).toBe(cliSize.width);
      expect(apiSize.height).toBe(cliSize.height);
    }

    // Compare embedded images (the actual calendar content)
    // PDF internally stores images as XObjects - comparing their data ensures identical visual output
    const apiImages = extractEmbeddedImageData(apiPdf);
    const cliImages = extractEmbeddedImageData(cliPdf);

    expect(apiImages.length).toBe(cliImages.length);
    for (let i = 0; i < apiImages.length; i++) {
      expect(
        Buffer.from(apiImages[i]).equals(Buffer.from(cliImages[i])),
        `Embedded image ${i} differs between API and CLI PDFs`
      ).toBe(true);
    }
  }, 120000); // 2 minute timeout for PDF generation
});

/**
 * Extract embedded PNG image data from a PDF.
 *
 * The calendar PDFs embed PNG images (rendered from SVG) into pages.
 * By comparing the embedded image bytes, we verify the visual content is identical
 * even if PDF metadata (IDs, timestamps) differs.
 */
function extractEmbeddedImageData(pdfBytes: Uint8Array): Uint8Array[] {
  // PNG files start with this magic number
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  const images: Uint8Array[] = [];
  const data = pdfBytes;

  // Scan for PNG signatures in the PDF stream
  for (let i = 0; i < data.length - PNG_SIGNATURE.length; i++) {
    let match = true;
    for (let j = 0; j < PNG_SIGNATURE.length; j++) {
      if (data[i + j] !== PNG_SIGNATURE[j]) {
        match = false;
        break;
      }
    }

    if (match) {
      // Find the end of the PNG (IEND chunk)
      // IEND is: 00 00 00 00 49 45 4E 44 AE 42 60 82
      const iendSignature = [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82];
      let endIndex = i;

      for (let k = i; k < data.length - iendSignature.length; k++) {
        let foundEnd = true;
        for (let l = 0; l < iendSignature.length; l++) {
          if (data[k + l] !== iendSignature[l]) {
            foundEnd = false;
            break;
          }
        }
        if (foundEnd) {
          endIndex = k + iendSignature.length;
          break;
        }
      }

      if (endIndex > i) {
        images.push(data.slice(i, endIndex));
        i = endIndex - 1; // Skip past this PNG
      }
    }
  }

  return images;
}
