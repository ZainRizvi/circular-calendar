'use client';

import { drawCalendarPage } from '@/lib/make_lib';
import SvgViewbox from '@/components/SvgViewbox';
import { Svg } from '@svgdotjs/svg.js';
import { inchToMillimeter } from '@/lib/svg';
import { useRef, useState } from 'react';

export default function CalendarTestPage() {
  const [copySuccess, setCopySuccess] = useState(false);
  const debugRef = useRef<HTMLPreElement>(null);

  const copySvgToClipboard = async () => {
    if (debugRef.current) {
      try {
        await navigator.clipboard.writeText(debugRef.current.textContent || '');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const renderCalendar = (draw: Svg) => {
    drawCalendarPage(draw, { scaleFactor: 0.7, page: 0 });

    // Pretty print SVG for copy/debug panel
    if (debugRef.current) {
      const svgString = draw.svg();
      const formattedSvg = new XMLSerializer()
        .serializeToString(new DOMParser().parseFromString(svgString, 'text/xml'))
        .replace(/></g, '>\n<');
      debugRef.current.textContent = formattedSvg;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 min-h-screen">
      <h1 className="text-2xl font-bold">Full Calendar Page</h1>
      <SvgViewbox
        width={900}
        height={1200}
        initialViewBox={{
          left: 0,
          top: 0,
          width: inchToMillimeter(8.5),
          height: inchToMillimeter(11),
        }}
        className="border shadow-lg"
      >
        {renderCalendar}
      </SvgViewbox>

      <button
        onClick={copySvgToClipboard}
        className={`px-4 py-2 rounded transition-all duration-200 ${
          copySuccess ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {copySuccess ? '✓ Copied!' : 'Copy SVG'}
      </button>
      <pre ref={debugRef} className="bg-gray-100 p-4 rounded-lg overflow-auto max-w-full w-full" />
    </div>
  );
}