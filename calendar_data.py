from typing import NamedTuple, List



# Settings to build a specific month.
class MonthInstance(NamedTuple):
    name: str
    num_days: int
    color: str # fill color
    name_upside_down: bool # If the name should be upside down
    date_on_top: bool # should dates be placed up top or down below?
    date_box_height: float # height of the date box
    inner_radius: float
    outer_radius: float

class CalendarSettings(NamedTuple):
    date_on_top: bool # should dates be placed up top or down below?
    date_box_height: float # height of the date box
    inner_radius: float
    outer_radius: float
    days_in_year: int # number of days in the full year

class Month(NamedTuple):
    name: str
    num_days: List[str] # each item results in a different month printed with [item] number of days
    color: str # fill color

class Year(NamedTuple):
    months: List[Month]

color_wheel_ring2 = [
    "#70c3ed", #light blue
    "#8ed0b5", #green
    "#8ec975",
    "#aed361",
    "#f6ed60", #yellow
    "#fdb64e", #orange
    "#f15b40", #red
    "#f15f90", #pink
    "#d671ad",
    "#9a6db0", #purple
    "#756bb0", #violet
    "#6783c2", #dark blue
]


color_wheel_ring3 = [
    "#f68567", #red
    "#f489a7", #pink
    "#df92be",
    "#ac8bc0", #purple
    "#9087c0", #violet
    "#879bce", #dark blue
    "#96d1f3", #light blue
    "#abdac6", #green
    "#abd595",
    "#c1dd89",
    "#f9f18c", #yellow
    "#fec679", #orange
]

pallet1 = [
    "#db64d3",
    "#db6498",
    "#db6c64",
    "#dba864",
    "#d3db64",
    "#98db64",
    "#64db6b",
    "#64dba7",
    "#64d4db",
    "#6498db",
    "#6b64db",
    "#a864db",
]

solar_colors = color_wheel_ring2
solar_year = Year(
    months=[
        Month("January", [31], solar_colors[0]),
        Month("February", [29], solar_colors[1]),
        Month("March", [31], solar_colors[2]),
        Month("April", [30], solar_colors[3]),
        Month("May", [31], solar_colors[4]),
        Month("June", [30], solar_colors[5]),
        Month("July", [31], solar_colors[6]),
        Month("August", [31], solar_colors[7]),
        Month("September", [30], solar_colors[8]),
        Month("October", [31], solar_colors[9]),
        Month("November", [30], solar_colors[10]),
        Month("December", [31], solar_colors[11]),
    ]
)


islamic_colors = color_wheel_ring3
islamic_year = Year(
    months=[
        Month("Muharram", [29], islamic_colors[0]),
        Month("Safar", [29], islamic_colors[1]),
        Month("Rabi al-Awwal", [30], islamic_colors[2]),
        Month("Rabi at-Thani", [30], islamic_colors[3]),
        Month("Jawad al-Awwal", [29], islamic_colors[4]),
        Month("Jawad at-Thani", [30], islamic_colors[5]),
        Month("Rajab", [30], islamic_colors[6]),
        Month("Shabaan", [29], islamic_colors[7]),
        Month("Ramadan", [30], islamic_colors[8]),
        Month("Shawal", [29], islamic_colors[9]),
        Month("Dhu al-Qadah", [30], islamic_colors[10]),
        Month("Dhu al-Hijja", [29], islamic_colors[11]),
    ]
)