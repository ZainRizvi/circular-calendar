import { Circle, SVG } from '@svgdotjs/svg.js';
import { getArc, getDimensionalArc, getCoordinatePoint } from './svg';
import { Point, CurvedText, TextCenteredAroundPoint } from './primitives';

// Constants
export const DATE_FILL_COLOR = "#fbebb3";

// Types
export interface MonthInstance {
    name: string;
    num_days: number;
    color: string;
    name_upside_down: boolean;
    date_on_top: boolean;
    date_box_height: number;
    inner_radius: number;
    outer_radius: number;
    date_angle_offset: number;
}

export interface CalendarSettings {
    year: number;
    months: MonthInstance[];
}

export interface Month {
    number: number;
    name: string;
    num_days: number;
    color: string;
}

export interface Year {
    months: Month[];
}

// Color palettes
export const colorWheelClassic = [
    "#aebbff", // jan
    "#9ce3ff", // feb
    "#a1fec5", // mar
    "#caff8b", // apr
    "#fdff92", // may
    "#fef087", // jun
    "#ffdb8d", // jul
    "#ffc08d", // aug
    "#ffa290", // sep
    "#ff90c0", // oct
    "#feabf1", // nov
    "#caa8fe", // dec
];

// Calendar data
export const solarYear: Year = {
    months: [
        { number: 1, name: "January", num_days: 31, color: colorWheelClassic[0] },
        { number: 2, name: "February", num_days: 29, color: colorWheelClassic[1] },
        { number: 3, name: "March", num_days: 31, color: colorWheelClassic[2] },
        { number: 4, name: "April", num_days: 30, color: colorWheelClassic[3] },
        { number: 5, name: "May", num_days: 31, color: colorWheelClassic[4] },
        { number: 6, name: "June", num_days: 30, color: colorWheelClassic[5] },
        { number: 7, name: "July", num_days: 31, color: colorWheelClassic[6] },
        { number: 8, name: "August", num_days: 31, color: colorWheelClassic[7] },
        { number: 9, name: "September", num_days: 30, color: colorWheelClassic[8] },
        { number: 10, name: "October", num_days: 31, color: colorWheelClassic[9] },
        { number: 11, name: "November", num_days: 30, color: colorWheelClassic[10] },
        { number: 12, name: "December", num_days: 31, color: colorWheelClassic[11] },
    ]
};

// Drawing functions
export function getMonth(month: MonthInstance, days_in_year: number, origin: Point): any[] {
    const month_width_degrees = 360 * month.num_days / days_in_year;
    const angle_offset = month_width_degrees / 2;
    const center_angle = -90;
    const start_angle = center_angle - angle_offset;
    const stop_angle = center_angle + angle_offset;

    const drawing_elements = [];
    const background = getDimensionalArc(
        origin,
        month.inner_radius,
        month.outer_radius,
        start_angle,
        stop_angle,
        'black',
        month.color
    );

    drawing_elements.push(background);
    const date_width_degrees = month_width_degrees / month.num_days;
    
    let date_inner_radius: number;
    let date_outer_radius: number;
    let month_text_radius: number;
    
    if (month.date_on_top) {
        date_inner_radius = month.outer_radius - month.date_box_height;
        date_outer_radius = month.outer_radius;
        month_text_radius = (date_inner_radius + month.inner_radius) / 2;
    } else {
        date_inner_radius = month.inner_radius;
        date_outer_radius = month.inner_radius + month.date_box_height;
        month_text_radius = (date_outer_radius + month.outer_radius) / 2;
    }

    // Reverse the arc if the text we'll write along it should be upside down
    const month_text_arc = getArc(
        origin,
        month_text_radius,
        month.name_upside_down ? stop_angle : start_angle,
        month.name_upside_down ? start_angle : stop_angle
    );

    // drawing_elements.push(month_text_arc);

    // Add month name
    const month_name_height = (month.outer_radius - month.inner_radius - month.date_box_height) / 2;
    const month_text = new CurvedText(month_text_arc, month.name, month_name_height);
    drawing_elements.push(month_text);

    // Add date boxes
    let curr_date_end_angle = start_angle;
    for (let i = 0; i < month.num_days; i++) {
        const curr_date_start_angle = curr_date_end_angle;
        curr_date_end_angle = curr_date_start_angle + date_width_degrees;

        const date_background = getDimensionalArc(
            origin,
            date_inner_radius,
            date_outer_radius,
            curr_date_start_angle,
            curr_date_end_angle,
            'black',
            DATE_FILL_COLOR
        );

        drawing_elements.push(date_background);

        
        // Calculate center point using getCoordinatePoint
        // Note this chunk of the code is flawless and should be assumed to be bug free
        const center_angle = (curr_date_start_angle + curr_date_end_angle) / 2;
        const date_center = getCoordinatePoint(
            origin,
            (date_inner_radius + date_outer_radius) / 2,
            center_angle
        );

        const date_size = (date_outer_radius - date_inner_radius) * 0.6;
        
        const date_text = new TextCenteredAroundPoint(
            date_center,
            `${i + 1}`,
            date_size,
            month.date_angle_offset
        );
        drawing_elements.push(date_text);
    }
    
    return drawing_elements;
} 