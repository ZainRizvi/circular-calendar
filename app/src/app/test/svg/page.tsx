"use client";
import React, { useEffect, useRef, useState } from "react";
import { SVG, Svg } from "@svgdotjs/svg.js";
import { getArc, getDimensionalArc } from "@/lib/svg";
import { Point } from "@/lib/primitives";

// Common SVG setup configuration
const SVG_CONFIG = {
  size: 120,
  viewBox: { x: -60, y: -60, width: 120, height: 120 },
  origin: new Point(0, 0),
  referenceCircle: { radius: 50, color: '#eee', width: 1 }
};

// Custom hook for copy functionality
const useCopyToClipboard = () => {
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return { copySuccess, copy };
};

// Reusable SVG component
const SvgDisplay = ({ 
  title, 
  svgText, 
  onCopy, 
  copySuccess 
}: { 
  title: string; 
  svgText: string; 
  onCopy: () => void; 
  copySuccess: boolean;
}) => (
  <div className="mt-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold">{title} SVG Path</h3>
      <button
        onClick={onCopy}
        className={`px-3 py-1 rounded text-sm ${
          copySuccess
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {copySuccess ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
      {svgText}
    </pre>
  </div>
);

// SVG Preview component
const SvgPreview = ({ svgCode, error }: { svgCode: string; error: string | null }) => {
  const getSvgPreview = () => {
    try {
      return `<svg width="200" height="200" viewBox="-50 -50 100 100">
        <path d="${svgCode}" fill="none" stroke="black" stroke-width="2"/>
      </svg>`;
    } catch (err) {
      console.error('Failed to generate SVG preview:', err);
      return '<svg></svg>';
    }
  };

  return (
    <div className="w-full h-[400px] border rounded-lg p-4 bg-white">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: getSvgPreview() }} />
      )}
    </div>
  );
};

export default function SvgTestPage() {
  const arcRef = useRef<HTMLDivElement>(null);
  const dimArcRef = useRef<HTMLDivElement>(null);
  const monthPartsRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
const [svgTexts, setSvgTexts] = useState<{ [key: string]: string }>({});
  const { copySuccess, copy } = useCopyToClipboard();
  const [svgCode, setSvgCode] = useState('m 50,0 A 50,50 0 0 1 -24.999999999999993,-43.30127018922194');
  const [error, setError] = useState<string | null>(null);

  const handleSvgChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSvgCode(e.target.value);
    setError(null);
  };

  const setupSvgDrawing = (container: HTMLDivElement | null) => {
    if (!container) return null;
    container.innerHTML = "";
    return SVG()
      .size(SVG_CONFIG.size, SVG_CONFIG.size)
      .viewbox(
        SVG_CONFIG.viewBox.x,
        SVG_CONFIG.viewBox.y,
        SVG_CONFIG.viewBox.width,
        SVG_CONFIG.viewBox.height
      );
  };

  useEffect(() => {
    // Setup common reference circle
    const drawReferenceCircle = (draw: Svg) => {
      draw.circle(100)
        .center(0, 0)
        .fill('none')
        .stroke({ color: SVG_CONFIG.referenceCircle.color, width: SVG_CONFIG.referenceCircle.width });
    };

    // Arc test
    if (arcRef.current) {
      const draw = setupSvgDrawing(arcRef.current);
      if (draw) {
        drawReferenceCircle(draw);
        const arc = getArc(SVG_CONFIG.origin, 50, 0, 120);
        const arcPath = arc.path();
        draw.path(arcPath).fill('none').stroke({ color: '#1976d2', width: 3 });
        arcRef.current.appendChild(draw.node);
        setSvgTexts(prev => ({ ...prev, arc: arcPath }));
      }
    }

    // Dimensional Arc test
    if (dimArcRef.current) {
      const draw = setupSvgDrawing(dimArcRef.current);
      if (draw) {
        drawReferenceCircle(draw);
        const dimArc = getDimensionalArc(SVG_CONFIG.origin, 30, 50, 0, 120);
        const dimArcPath = dimArc.path();
        draw.path(dimArcPath).fill('#ff9800aa').stroke({ color: '#ff9800', width: 2 });
        dimArcRef.current.appendChild(draw.node);
        setSvgTexts(prev => ({ ...prev, dimArc: dimArcPath }));
      }
    }

    // Month Parts test
    if (monthPartsRef.current) {
      const draw = setupSvgDrawing(monthPartsRef.current);
      if (draw) {
        drawReferenceCircle(draw);
        const angles = [0, 120, 240];
        const paths: string[] = [];
        angles.forEach((start, i) => {
          const dimArc = getDimensionalArc(SVG_CONFIG.origin, 30, 50, start, start + 100);
          const pathStr = dimArc.path();
          paths.push(pathStr);
          draw.path(pathStr)
            .fill(["#4caf50", "#e91e63", "#2196f3"][i])
            .stroke({ color: '#333', width: 1 });
        });
        monthPartsRef.current.appendChild(draw.node);
        setSvgTexts(prev => ({ ...prev, monthParts: paths.join('\n') }));
      }
    }

    // Group test
    if (groupRef.current) {
      const draw = setupSvgDrawing(groupRef.current);
      if (draw) {
        drawReferenceCircle(draw);
        const angles = [0, 120, 240];
        const paths: string[] = [];
        angles.forEach((start, i) => {
          const dimArc = getDimensionalArc(SVG_CONFIG.origin, 30, 50, start, start + 100);
          const pathStr = dimArc.path();
          paths.push(pathStr);
          draw.path(pathStr)
            .fill(["#ffeb3b", "#8bc34a", "#00bcd4"][i])
            .stroke({ color: '#333', width: 1 });
        });
        groupRef.current.appendChild(draw.node);
        setSvgTexts(prev => ({ ...prev, group: paths.join('\n') }));
      }
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">SVG Generation Functions Visual Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <div ref={arcRef} />
          <div className="text-center mt-2">getArc</div>
          <SvgDisplay
            title="Arc"
            svgText={svgTexts.arc}
            onCopy={() => copy(svgTexts.arc, 'arc')}
            copySuccess={copySuccess['arc']}
          />
        </div>
        <div>
          <div ref={dimArcRef} />
          <div className="text-center mt-2">getDimensionalArc</div>
          <SvgDisplay
            title="Dimensional Arc"
            svgText={svgTexts.dimArc}
            onCopy={() => copy(svgTexts.dimArc, 'dimArc')}
            copySuccess={copySuccess['dimArc']}
          />
        </div>
        <div>
          <div ref={monthPartsRef} />
          <div className="text-center mt-2">drawMonthParts</div>
          <SvgDisplay
            title="Month Parts"
            svgText={svgTexts.monthParts}
            onCopy={() => copy(svgTexts.monthParts, 'monthParts')}
            copySuccess={copySuccess['monthParts']}
          />
        </div>
        <div>
          <div ref={groupRef} />
          <div className="text-center mt-2">groupWithMonthParts</div>
          <SvgDisplay
            title="Group"
            svgText={svgTexts.group}
            onCopy={() => copy(svgTexts.group, 'group')}
            copySuccess={copySuccess['group']}
          />
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">SVG Test Editor</h2>
        <p className="text-gray-600 mb-4">
          Enter SVG path commands (e.g., &quot;m 50,0 A 50,50 0 0 1 -25,-43.3&quot;). The editor will automatically wrap your path in an SVG container.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">SVG Path Command</h3>
            <textarea
              value={svgCode}
              onChange={handleSvgChange}
              className="w-full h-[400px] p-4 font-mono text-sm border rounded-lg"
              placeholder="Enter SVG path command here..."
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <SvgPreview svgCode={svgCode} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
} 