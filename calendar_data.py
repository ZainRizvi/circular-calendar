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
    "#aebbff", # jan
    "#9ce3ff", # feb
    "#a1fec5", # mar
    "#caff8b", # apr
    "#fdff92", # may
    "#fef087", # jun
    "#ffdb8d", # jul
    "#ffc08d", # aug
    "#ffa290", # sep
    "#ff90c0", # oct
    "#feabf1", # nov
    "#caa8fe", # dec
]

color_wheel_classic_mod = [
    "#87cdff", # jan
    "#9ce3ff", # feb
    "#a1fec5", # mar
    "#caff8b", # apr
    "#fdff87", # may
    "#fef097", # jun
    "#ffcb8d", # jul
    "#ffb09d", # aug
    "#ff92a0", # sep
    "#ff7080", # oct
    "#feabf1", # nov
    "#caa8fe", # dec
]

color_wheel_classic_mod2 = [
    "#9ce3ff", # jan
    "#9ce3ff", # feb
    "#a1fec5", # mar
    "#caff8b", # apr
    "#fdff92", # may
    "#fef087", # jun
    "#ffdb8d", # jul
    "#ffc08d", # aug
    "#ffa290", # sep
    "#FF4A4C", # oct
    "#feabf1", # nov
    "#caa8fe", # dec
]

color_harmony = [
    "#FF9CB1", # jun
    "#FFB99C", # jul
    "#FFEA9C", # aug
    "#E3FF9C", # sep
    "#B1FF9C", # oct
    "#9CFFB8", # nov
    "#9CFFEA", # dec
    "#9CE3FF", # jan
    "#9CB2FF", # feb
    "#B89CFF", # mar
    "#EA9CFF", # apr
    "#FF9CE3", # may
]
#color_harmony.reverse()


color_harmony_mod = [
    "#9CB2FF", # feb
    "#B89CFF", # mar
    "#ff9577", # apr
    "#FF9CE3", # may
    "#FF9CB1", # jun
    "#FFB99C", # jul
    "#FFEA9C", # aug
    "#E3FF9C", # sep
    "#B1FF9C", # oct
    "#9CFFB8", # nov
    "#9CFFEA", # dec
    "#9CE3FF", # jan
]
color_harmony_mod.reverse()

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


color_wheel_classic_islam = [
    "#FF5959", # oct
    "#F1948A", # nov
    "#caa8fe", # dec
    "#aebbff", # jan
    "#9ce3ff", # feb
    "#a1fec5", # mar
    "#caff8b", # apr
    "#fdff92", # may
    "#fef087", # jun
    "#ffdb8d", # jul
    "#ffc08d", # aug
    "#ffa290", # sep
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

# Maryam's colors: color_wheel_classic_mod2
solar_colors = color_wheel_classic #color_wheel_classic color_harmony# color_wheel_classic_mod
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


islamic_colors = color_harmony # color_wheel_ring3 # color_wheel_classic_islam #color_wheel_ring2
islamic_year = Year(
    months=[
        Month(2, "Sha'baan", [30], islamic_colors[7]),
        Month(3, "Ramadan", [30], islamic_colors[8]),
        Month(4, "Shawwal", [30], islamic_colors[9]),
        Month(5, "Dhu al-Qa'dah", [30], islamic_colors[10]),
        Month(6, "Dhu al-Hijja", [30], islamic_colors[11]),
        Month(7 ,"Muharram", [30], islamic_colors[0]),
        Month(8, "Safar", [30], islamic_colors[1]),
        Month(9, "Rabi al-Awwal", [30], islamic_colors[2]),
        Month(10, "Rabi ath-Thani", [30], islamic_colors[3]),
        Month(11, "Jumada al-Awwal", [30], islamic_colors[4]),
        Month(12, "Jumada ath-Thani", [30], islamic_colors[5]),
        Month(1, "Rajab", [30], islamic_colors[6]),
    ]
)