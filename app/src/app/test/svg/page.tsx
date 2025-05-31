"use client";
import React, { useEffect, useRef } from "react";
import { SVG } from "@svgdotjs/svg.js";
import { getArc, getDimensionalArc, drawMonthParts, groupWithMonthParts } from "@/lib/svg";

function ensurePathString(path: any): string {
  return typeof path === 'string' ? path : path?.toString?.() ?? '';
}

export default function SvgTestPage() {
  const arcRef = useRef<HTMLDivElement>(null);
  const dimArcRef = useRef<HTMLDivElement>(null);
  const monthPartsRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // getArc
    if (arcRef.current) {
      arcRef.current.innerHTML = "";
      const draw = SVG().size(120, 120);
      const origin = { x: 60, y: 60 };
      const radius = 50;
      const startAngle = 0;
      const stopAngle = 120;
      const arcPath = ensurePathString(getArc(origin as any, radius, startAngle, stopAngle));
      draw.circle(120).center(60, 60).fill('none').stroke({ color: '#eee', width: 1 }); // reference
      draw.path(arcPath).fill('none').stroke({ color: '#1976d2', width: 3 });
      arcRef.current.appendChild(draw.node);
    }
    // getDimensionalArc
    if (dimArcRef.current) {
      dimArcRef.current.innerHTML = "";
      const draw = SVG().size(120, 120);
      const origin = { x: 60, y: 60 };
      const innerRadius = 30;
      const outerRadius = 50;
      const startAngle = 0;
      const stopAngle = 120;
      const dimArcPath = ensurePathString(getDimensionalArc(origin as any, innerRadius, outerRadius, startAngle, stopAngle));
      console.log('getDimensionalArc path:', dimArcPath);
      draw.circle(120).center(60, 60).fill('none').stroke({ color: '#eee', width: 1 }); // reference
      draw.path(dimArcPath).fill('#ff9800aa').stroke({ color: '#ff9800', width: 2 });
      dimArcRef.current.appendChild(draw.node);
    }
    // drawMonthParts
    if (monthPartsRef.current) {
      monthPartsRef.current.innerHTML = "";
      const draw = SVG().size(120, 120);
      // Fake month parts: 3 arcs
      const origin = { x: 60, y: 60 };
      const innerRadius = 30;
      const outerRadius = 50;
      const angles = [0, 120, 240];
      draw.circle(120).center(60, 60).fill('none').stroke({ color: '#eee', width: 1 }); // reference
      angles.forEach((start, i) => {
        const pathStr = ensurePathString(getDimensionalArc(origin as any, innerRadius, outerRadius, start, start + 100));
        console.log(`drawMonthParts arc ${i}:`, pathStr);
        draw.path(pathStr).fill(["#4caf50", "#e91e63", "#2196f3"][i]).stroke({ color: '#333', width: 1 });
      });
      monthPartsRef.current.appendChild(draw.node);
    }
    // groupWithMonthParts
    if (groupRef.current) {
      groupRef.current.innerHTML = "";
      const draw = SVG().size(120, 120);
      const origin = { x: 60, y: 60 };
      const innerRadius = 30;
      const outerRadius = 50;
      const angles = [0, 120, 240];
      draw.circle(120).center(60, 60).fill('none').stroke({ color: '#eee', width: 1 }); // reference
      angles.forEach((start, i) => {
        const pathStr = ensurePathString(getDimensionalArc(origin as any, innerRadius, outerRadius, start, start + 100));
        console.log(`groupWithMonthParts arc ${i}:`, pathStr);
        draw.path(pathStr).fill(["#ffeb3b", "#8bc34a", "#00bcd4"][i]).stroke({ color: '#333', width: 1 });
      });
      groupRef.current.appendChild(draw.node);
    }
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 className="text-2xl font-bold mb-6">SVG Generation Functions Visual Test</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
        <div>
          <div ref={arcRef} />
          <div className="text-center mt-2">getArc</div>
        </div>
        <div>
          <div ref={dimArcRef} />
          <div className="text-center mt-2">getDimensionalArc</div>
        </div>
        <div>
          <div ref={monthPartsRef} />
          <div className="text-center mt-2">drawMonthParts</div>
        </div>
        <div>
          <div ref={groupRef} />
          <div className="text-center mt-2">groupWithMonthParts</div>
        </div>
      </div>
    </div>
  );
} 