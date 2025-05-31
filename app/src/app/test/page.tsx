'use client';

import { useEffect, useRef, useState } from 'react';
import { SVG } from '@svgdotjs/svg.js';

export default function TestPage() {
  const svgRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgGenerated, setSvgGenerated] = useState(false);

  useEffect(() => {
    try {
      if (svgRef.current) {
        console.log('Creating SVG document...');
        const draw = SVG().addTo(svgRef.current).size(300, 300);
        
        console.log('Drawing circle...');
        draw.circle(100).center(150, 150).fill('#f06');
        
        console.log('Adding text...');
        draw.text('SVG Test').move(100, 50).font({ size: 20 });
        
        setSvgGenerated(true);
        console.log('SVG generation complete');
      }
    } catch (err) {
      console.error('Error generating SVG:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dependency Test Page</h1>
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
      <div ref={svgRef} className="border border-gray-300 rounded-lg p-4" />
    </div>
  );
} 