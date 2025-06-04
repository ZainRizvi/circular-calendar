import { SVG, Path as SvgPath, Text as SvgText, Circle as SvgCircle } from '@svgdotjs/svg.js';

// Types
export class Point {
    constructor(
        public x: number,
        public y: number
    ) {}

    pathText(): string {
        return `${this.x},${this.y}`;
    }
}

export type Length = number;
export type Angle = number;

// Constants
const SCALE_FACTOR = 0.7;
const STROKE_WIDTH = 0.1 * SCALE_FACTOR;

// Enums
export enum ArcDrawMode {
    NEW = 1,
    LINE_TO = 2 // Draw a line from wherever the path last ended to the start of this Arc
}

// Classes

/**
 * A linear arc
 */
export class Arc {
    constructor(
        public start: Point,
        public stop: Point,
        public radius: Length,
        public params: string
    ) {}

    path(mode: ArcDrawMode = ArcDrawMode.NEW): string {
        if (!Object.values(ArcDrawMode).includes(mode)) {
            throw new Error(`Invalid mode ${mode}`);
        }

        let startingMode: string;
        if (mode === ArcDrawMode.NEW) {
            startingMode = "m"; // move drawer to starting point
        } else if (mode === ArcDrawMode.LINE_TO) {
            startingMode = "L"; // draw line to starting point
        } else {
            throw new Error(`Invalid mode ${mode}`);
        }
        return `${startingMode} ${this.start.pathText()} A ${this.radius},${this.radius} ${this.params} ${this.stop.pathText()}`;
    }

    drawnPath(stroke: string = 'black', fill: string = 'none'): SvgPath {
        return SVG()
            .path(this.path(ArcDrawMode.NEW))
            .stroke({ color: stroke, width: STROKE_WIDTH })
            .fill(fill);
    }
}

/**
 * A 2D arc
 */
export class DimensionalArc {
    constructor(
        public outerArc: Arc,
        public innerArc: Arc,
        public stroke: string = 'black',
        public fill: string = 'none'
    ) {}

    path(): string {
        return this.outerArc.path(ArcDrawMode.NEW) +
               this.innerArc.path(ArcDrawMode.LINE_TO) +
               `L ${this.outerArc.start.pathText()}`; // close off the shape
    }

    drawnPath(): SvgPath {
        return SVG()
            .path(this.path())
            .stroke({ color: this.stroke, width: STROKE_WIDTH })
            .fill(this.fill);
    }
}

/**
 * Text centered around a point
 */
export class TextCenteredAroundPoint {
    constructor(
        public point: Point,
        public text: string,
        public font_size: number,
        public rotation: number /* in degrees */
    ) {}

    drawnPath(): SvgText {
        return SVG().text(this.text)
            .attr({
                'font-size': this.font_size,
                'transform': `rotate(${this.rotation}, ${this.point.x}, ${this.point.y})`
            })
            .center(this.point.x, this.point.y);
    }
}

/**
 * Text that follows a curved path
 */
export class CurvedText {
    constructor(
        public arc: Arc,
        public text: string,
        public font_size: number = 30
    ) {}

    drawnPath(): [SvgPath, SvgText] {
        // Create the path with an ID
        const path = this.arc.drawnPath("none");
        const pathId = `curve-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        path.attr('id', pathId);
        
        // Create text element
        const textElement = SVG().text("")
            .font({ size: this.font_size, family: "Arial, Helvetica, sans-serif" });
        
        // Create textPath element manually using SVG element creation
        const textPath = SVG().element('textPath');
        textPath.attr('href', `#${pathId}`);
        
        // Set text content using the node's textContent property
        textPath.node.textContent = this.text;
        
        textPath.attr({
            'startOffset': '50%',
            'method': 'align',
            'text-anchor': 'middle',
            'dominant-baseline': 'middle'
        });
        
        // Add the textPath to the text element
        textElement.add(textPath);

        return [path, textElement];
    }
}

/**
 * A circle shape
 */
export class Circle {
    constructor(
        public radius: number,
        public center: Point
    ) {}

    drawnPath(): SvgCircle {
        return SVG().circle(this.radius * 2)
            .center(this.center.x, this.center.y)
            .fill('red');
    }
} 