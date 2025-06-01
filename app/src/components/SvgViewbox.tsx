import { useEffect, useRef, useState } from 'react';
import { SVG, Svg } from '@svgdotjs/svg.js';

/**
 * Represents the viewBox dimensions and position of an SVG.
 */
interface ViewBox {
    /** The left offset of the viewBox */
    left: number;
    /** The top offset of the viewBox */
    top: number;
    /** The width of the viewBox */
    width: number;
    /** The height of the viewBox */
    height: number;
}

interface SvgViewboxProps {
    /** The width of the SVG container in pixels */
    width: number;
    /** The height of the SVG container in pixels */
    height: number;
    /** The initial viewBox configuration */
    initialViewBox: ViewBox;
    /** 
     * A render function that receives the SVG drawing instance.
     * Use this function to draw your SVG content.
     * The function will be called whenever the viewBox changes.
     * 
     * @example
     * ```tsx
     * <SvgViewbox
     *   width={800}
     *   height={800}
     *   initialViewBox={{ left: 0, top: 0, width: 100, height: 100 }}
     * >
     *   {(draw) => {
     *     // Draw a circle at the center
     *     draw.circle(50).center(0, 0);
     *     
     *     // Draw a rectangle
     *     draw.rect(100, 100).move(-50, -50);
     *   }}
     * </SvgViewbox>
     * ```
     */
    children: (draw: Svg) => void;
    /** Optional CSS class name to apply to the container */
    className?: string;
}

/**
 * A reusable SVG component with built-in pan and zoom functionality.
 * 
 * This component creates an SVG container that supports:
 * - Mouse wheel zooming (centered on cursor position)
 * - Click and drag panning
 * - Automatic viewBox management
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SvgViewbox
 *   width={800}
 *   height={800}
 *   initialViewBox={{ left: 0, top: 0, width: 100, height: 100 }}
 * >
 *   {(draw) => {
 *     // Draw your SVG content here
 *     draw.circle(50).center(0, 0);
 *   }}
 * </SvgViewbox>
 * 
 * // With custom styling
 * <SvgViewbox
 *   width={800}
 *   height={800}
 *   initialViewBox={{ left: 0, top: 0, width: 100, height: 100 }}
 *   className="border-2 border-blue-500"
 * >
 *   {(draw) => {
 *     // Draw your SVG content here
 *   }}
 * </SvgViewbox>
 * ```
 */
export default function SvgViewbox({ 
    width, 
    height, 
    initialViewBox, 
    children,
    className = ''
}: SvgViewboxProps) {
    const svgRef = useRef<HTMLDivElement>(null);
    const [viewBox, setViewBox] = useState<ViewBox>(initialViewBox);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        
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
        
        setViewBox({
            left: newLeft,
            top: newTop,
            width: newWidth,
            height: newHeight
        });
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

    useEffect(() => {
        if (!svgRef.current) return;

        try {
            // Clear previous SVG
            svgRef.current.innerHTML = '';
            
            // Create SVG drawing
            const draw = SVG().addTo(svgRef.current).size(width, height) as Svg;
            
            // Set viewBox
            draw.viewbox(viewBox.left, viewBox.top, viewBox.width, viewBox.height);

            // Call children function with the draw instance
            children(draw);
        } catch (error) {
            console.error('Error creating SVG:', error);
        }
    }, [viewBox, width, height, children]);

    return (
        <div 
            ref={svgRef} 
            className={`border border-gray-300 cursor-grab active:cursor-grabbing ${className}`}
        />
    );
} 