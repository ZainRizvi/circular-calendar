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
    date_angle_offset: int

class CalendarSettings(NamedTuple):
    date_on_top: bool # should dates be placed up top or down below?
    date_box_height: float # height of the date box
    inner_radius: float
    outer_radius: float
    days_in_year: int # number of days in the full year

class Month(NamedTuple):
    number: int
    name: str
    num_days: List[str] # each item results in a different month printed with [item] number of days
    color: str # fill color

class Year(NamedTuple):
    months: List[Month]
    
color_wheel_classic = [
    "#b4bcf9",
    "#b7e2fc",
    "#c2fbc9",
    "#d9fc98",
    "#fcfd9f",
    "#f8ef94",
    "#f3db97",
    "#edc294",
    "#edc294",
    "#e597be",
    "#eab0ed",
    "#c3acf9",
]

color_wheel_classic_mod = [
    "#b7e2fc",
    "#b7e2fc",
    "#c2fbc9",
    "#d9fc98",
    "#fcfd9f",
    "#f8ef94",
    "#f3db97",
    "#edc294",
    "#edc294",
    "#ff0000",
    "#eab0ed",
    "#c3acf9",
]

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

solar_colors = color_wheel_classic_mod
solar_year = Year(
    months=[
        Month(1, "January", [31], solar_colors[0]),
        Month(2, "February", [29], solar_colors[1]),
        Month(3, "March", [31], solar_colors[2]),
        Month(4, "April", [30], solar_colors[3]),
        Month(5, "May", [31], solar_colors[4]),
        Month(6, "June", [30], solar_colors[5]),
        Month(7, "July", [31], solar_colors[6]),
        Month(8, "August", [31], solar_colors[7]),
        Month(9, "September", [30], solar_colors[8]),
        Month(10, "October", [31], solar_colors[9]),
        Month(11, "November", [30], solar_colors[10]),
        Month(12, "December", [31], solar_colors[11]),
    ]
)


islamic_colors = color_wheel_ring2
islamic_year = Year(
    months=[
        Month(1, "Jamad at-Thani", [30], islamic_colors[5]),
        Month(2, "Rajab", [30], islamic_colors[6]),
        Month(3, "Shabaan", [30], islamic_colors[7]),
        Month(4, "Ramadan", [30], islamic_colors[8]),
        Month(5, "Shawal", [30], islamic_colors[9]),
        Month(6, "Dhu al-Qadah", [30], islamic_colors[10]),
        Month(7, "Dhu al-Hijja", [30], islamic_colors[11]),
        Month(8 ,"Muharram", [30], islamic_colors[0]),
        Month(9, "Safar", [30], islamic_colors[1]),
        Month(10, "Rabi al-Awwal", [30], islamic_colors[2]),
        Month(11, "Rabi at-Thani", [30], islamic_colors[3]),
        Month(12, "Jamad al-Awwal", [30], islamic_colors[4]),
    ]
)