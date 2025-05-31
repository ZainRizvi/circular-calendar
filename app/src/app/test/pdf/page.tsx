'use client';

import { useEffect, useRef, useState } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import { PDFDocument, rgb } from 'pdf-lib';

export default function PDFTestPage() {
  const svgRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgGenerated, setSvgGenerated] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  // Helper to convert SVG to PNG for embedding in PDF
  async function svgToPngDataUrl(svgElement: SVGElement): Promise<{dataUrl: string, width: number, height: number}> {
    // Get width/height from SVG attributes or viewBox
    let width = parseFloat(svgElement.getAttribute('width') || '') || 300;
    let height = parseFloat(svgElement.getAttribute('height') || '') || 300;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+|,/);
      if (parts.length === 4) {
        width = parseFloat(parts[2]);
        height = parseFloat(parts[3]);
      }
    }
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Could not get canvas context');
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  const generatePDF = async (svgElement: SVGElement) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([400, 400]);
      page.drawText('Test PDF Generation', { x: 50, y: 370, size: 18, color: rgb(0, 0.2, 0.7) });
      page.drawText('SVG Preview:', { x: 50, y: 340, size: 14, color: rgb(0, 0, 0) });

      // Convert SVG to PNG and embed in PDF
      const { dataUrl: pngDataUrl, width: svgW, height: svgH } = await svgToPngDataUrl(svgElement);
      const maxW = 300, maxH = 300;
      // Scale to fit maxW x maxH while preserving aspect ratio
      const scale = Math.min(maxW / svgW, maxH / svgH, 1);
      const drawW = svgW * scale;
      const drawH = svgH * scale;
      const x = 50 + (maxW - drawW) / 2;
      const y = 100 + (maxH - drawH) / 2;
      const pngImageBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngImageBytes);
      page.drawImage(pngImage, { x, y, width: drawW, height: drawH });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test.pdf';
      link.click();
      URL.revokeObjectURL(url);
      setPdfGenerated(true);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  useEffect(() => {
    try {
      if (svgRef.current) {
        const draw = SVG().addTo(svgRef.current).size(300, 300);
        draw.circle(100).center(150, 150).fill('#f06');
        draw.text('SVG Test').move(100, 50).font({ size: 20 });
        setSvgGenerated(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PDF Generation Test (Browser)</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      {svgGenerated && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          SVG generated successfully!
        </div>
      )}
      {pdfGenerated && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          PDF generated and download started!
        </div>
      )}
      <div ref={svgRef} className="border border-gray-300 rounded-lg p-4 mb-4" />
      <button
        onClick={() => {
          const svgElement = svgRef.current?.querySelector('svg');
          if (svgElement) {
            generatePDF(svgElement);
          }
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generate PDF
      </button>
    </div>
  );
} 