'use client';

import { useEffect, useRef, useState } from 'react';
import { SVG } from '@svgdotjs/svg.js';
import { getMonth } from '@/lib/calendar';
import { drawMonthParts } from '@/lib/svg';
import type { MonthInstance } from '@/lib/calendar';
import { Point } from '@/lib/primitives';

export default function CalendarTest() {
    const svgRef = useRef<HTMLDivElement>(null);
    const debugRef = useRef<HTMLPreElement>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [viewBox, setViewBox] = useState({
        left: -50,
        top: -400,
        width: 100,
        height: 150
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        
        // Get mouse position relative to SVG
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convert mouse position to viewBox coordinates
        const viewBoxX = viewBox.left + (mouseX / rect.width) * viewBox.width;
        const viewBoxY = viewBox.top + (mouseY / rect.height) * viewBox.height;
        
        // Calculate zoom factor (negative delta means zoom in)
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        
        // Calculate new viewBox dimensions
        const newWidth = viewBox.width * zoomFactor;
        const newHeight = viewBox.height * zoomFactor;
        
        // Calculate new viewBox position to keep mouse point fixed
        const newLeft = viewBoxX - (mouseX / rect.width) * newWidth;
        const newTop = viewBoxY - (mouseY / rect.height) * newHeight;
        
        // Update viewBox
        const newViewBox = {
            left: newLeft,
            top: newTop,
            width: newWidth,
            height: newHeight
        };
        setViewBox(newViewBox);
    };

    const handleMouseDown = (e: MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Calculate the movement in viewBox coordinates
        const dx = (e.clientX - dragStart.x) * (viewBox.width / rect.width);
        const dy = (e.clientY - dragStart.y) * (viewBox.height / rect.height);

        // Update viewBox position
        setViewBox(prev => ({
            ...prev,
            left: prev.left - dx,
            top: prev.top - dy
        }));

        // Update drag start position
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (!svgRef.current) return;

        // Add event listeners
        svgRef.current.addEventListener('wheel', handleWheel, { passive: false });
        svgRef.current.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            svgRef.current?.removeEventListener('wheel', handleWheel);
            svgRef.current?.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [viewBox, isDragging]);

    const copySvgToClipboard = async () => {
        if (debugRef.current) {
            try {
                await navigator.clipboard.writeText(debugRef.current.textContent || '');
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    useEffect(() => {
        if (!svgRef.current) return;

        try {
            // Clear previous SVG
            svgRef.current.innerHTML = '';
            
            // Create SVG drawing
            const draw = SVG().addTo(svgRef.current).size(800, 800);
            
            // Set viewBox to match Python implementation (0,0 to full dimensions)
            draw.viewbox(viewBox.left, viewBox.top, viewBox.width, viewBox.height);

            // Add a large circle at the origin for debugging
            draw.circle(300)
                .center(0, 0)
                .fill('none')
                .stroke({ color: '#000', width: 2, opacity: 0.5 });

            // Calculate origin point for (0,0) based viewBox
            const origin = new Point(0, 0);

            // Define a sample month (January)
            const month: MonthInstance = {
                name: "January",
                num_days: 31,
                color: '#FF0000',
                name_upside_down: false,
                date_on_top: true,
                date_box_height: 3,
                inner_radius: 300,
                outer_radius: 330,
                date_angle_offset: 0
            };

            // Get the drawing elements for the month
            const monthParts = getMonth(
                month,
                365, // days in year
                origin
            );

            // Draw the month parts
            drawMonthParts(draw, monthParts);

            // Pretty print the SVG for debugging
            if (debugRef.current) {
                const svgString = draw.svg();
                const formattedSvg = new XMLSerializer()
                    .serializeToString(new DOMParser().parseFromString(svgString, 'text/xml'))
                    .replace(/></g, '>\n<');
                debugRef.current.textContent = formattedSvg;
            }
        } catch (error) {
            console.error('Error creating SVG:', error);
        }
    }, [viewBox]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Calendar Test</h1>
            <div ref={svgRef} className="border border-gray-300 mb-4 cursor-grab active:cursor-grabbing" />
            <div className="w-full max-w-4xl">
                <button
                    onClick={copySvgToClipboard}
                    className={`mb-2 px-4 py-2 rounded transition-all duration-200 ${
                        copySuccess 
                            ? 'bg-green-500 text-white scale-105' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
                    }`}
                >
                    {copySuccess ? '✓ Copied!' : 'Copy SVG'}
                </button>
                <pre ref={debugRef} className="bg-gray-100 p-4 rounded-lg overflow-auto max-w-full" />
            </div>
        </div>
    );
} 