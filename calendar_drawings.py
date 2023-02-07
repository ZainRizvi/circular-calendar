from calendar_data import *
from arc_drawing import *
from typing import List

DATE_FILL_COLOR = "yellow"
def getMonth(month: MonthInstance, days_in_year: int, origin: Point) -> List[any]:
    month_width_degrees = 360 * month.num_days / days_in_year
    # center start and stop angles around -90 degrees
    angle_offset = month_width_degrees / 2
    center_angle = -90
    start_angle = center_angle - angle_offset
    stop_angle = center_angle + angle_offset

    drawing_elements = []
    background = getDimensionalArc(
        origin=origin,
        inner_radius=month.inner_radius,
        outer_radius=month.outer_radius,
        start_angle=start_angle,
        stop_angle=stop_angle,
        fill=month.color
    )

    drawing_elements.append(background)
    date_width_degrees = month_width_degrees / month.num_days # how many degrees of width the date box should have
    if month.date_on_top:
        date_inner_radius = month.outer_radius - month.date_box_height
        date_outer_radius = month.outer_radius
        month_text_radius = (date_inner_radius + month.inner_radius) / 2
    else:
        date_inner_radius = month.inner_radius
        date_outer_radius = month.inner_radius + month.date_box_height
        month_text_radius = (date_outer_radius + month.outer_radius) / 2

    # Reverse the arc if the text we'll write along it should be upside down
    month_text_arc = getArc(
        origin=origin,
        radius=month_text_radius,
        start_angle=start_angle if not month.name_upside_down else stop_angle,
        stop_angle=stop_angle if not month.name_upside_down else start_angle,
    )

    # Add month name
    month_name_height = (month.outer_radius - month.inner_radius - month.date_box_height) / 2
    month_text = CurvedText(arc=month_text_arc, text=month.name, font_size=month_name_height)
    drawing_elements.append(month_text)

    # Add date boxes
    curr_date_end_angle = start_angle
    for i in range(month.num_days):
        curr_date_start_angle = curr_date_end_angle
        curr_date_end_angle = curr_date_start_angle + date_width_degrees

        date_background = getDimensionalArc(
            origin=origin,
            inner_radius=date_inner_radius,
            outer_radius=date_outer_radius,
            start_angle=curr_date_start_angle,
            stop_angle=curr_date_end_angle,
            fill=DATE_FILL_COLOR
        )

        drawing_elements.append(date_background)

        # Add date inside box
        date_center = Point(
                        (date_background.innerArc.start.x + date_background.outerArc.start.x)/2,
                        (date_background.innerArc.start.y + date_background.outerArc.start.y)/2 + (date_background.innerArc.start.y - date_background.outerArc.start.y) * 0.075)
        date_size = (date_outer_radius - date_inner_radius) * 0.75
        highlight_circle = Circle(radius=date_size/2, center=date_center)
        # drawing_elements.append(highlight_circle)
        date_text = TextCenteredAroundPoint(
            point=date_center, 
            text=f"{i + 1}", # date
            font_size=date_size,
        )
        drawing_elements.append(date_text)
    
    return drawing_elements
