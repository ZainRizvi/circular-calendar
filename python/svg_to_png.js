#!/usr/bin/env node
/**
 * Convert SVG file to PNG using Puppeteer (headless Chrome).
 * Usage: node svg_to_png.js input.svg output.png [dpi]
 *
 * DPI defaults to 150 for print-quality output.
 * Also outputs dimensions in points to stdout as JSON for the caller.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function svgToPng(svgPath, pngPath, dpi = 150) {
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    // Extract width and height from SVG
    const widthMatch = svgContent.match(/width="([^"]+)"/);
    const heightMatch = svgContent.match(/height="([^"]+)"/);

    // Parse dimensions to points (1 point = 1/72 inch)
    const parseSizeToPoints = (str) => {
        if (!str) return 612; // default letter width
        const num = parseFloat(str);
        if (str.includes('mm')) return num * 72 / 25.4; // mm to points
        if (str.includes('in')) return num * 72; // inches to points
        if (str.includes('pt')) return num; // already points
        if (str.includes('px')) return num * 72 / 96; // px to points (assuming 96dpi screen)
        return num; // assume points if no unit
    };

    const widthPts = parseSizeToPoints(widthMatch?.[1]);
    const heightPts = parseSizeToPoints(heightMatch?.[1]);

    // Convert points to pixels at the requested DPI
    const scale = dpi / 72;
    const widthPx = Math.ceil(widthPts * scale);
    const heightPx = Math.ceil(heightPts * scale);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to match SVG dimensions at requested DPI
    await page.setViewport({
        width: widthPx,
        height: heightPx,
        deviceScaleFactor: 1
    });

    // Create HTML that displays the SVG at full size
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { margin: 0; padding: 0; }
                body {
                    width: ${widthPx}px;
                    height: ${heightPx}px;
                    background: white;
                }
                svg {
                    width: ${widthPx}px;
                    height: ${heightPx}px;
                }
            </style>
        </head>
        <body>${svgContent}</body>
        </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.screenshot({
        path: pngPath,
        type: 'png',
        fullPage: true,
        omitBackground: false
    });

    await browser.close();

    // Output dimensions in points as JSON for the Python caller
    console.log(JSON.stringify({
        widthPts: widthPts,
        heightPts: heightPts,
        widthPx: widthPx,
        heightPx: heightPx,
        dpi: dpi
    }));
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: node svg_to_png.js input.svg output.png [scale]');
    process.exit(1);
}

const [svgPath, pngPath, scale] = args;
svgToPng(svgPath, pngPath, parseFloat(scale) || 2)
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
