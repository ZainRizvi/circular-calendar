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

solar_year = Year(
    months=[
        Month("January", [31], "#68C3C4"), #"blue"),
        Month("February", [29], "#67E168"),
        Month("March", [31], "#C5F567"),
        Month("April", [30], "#FFFF68"),
        Month("May", [31], "pink"),
        Month("June", [30], "green"),
        Month("July", [31], "orange"),
        Month("August", [31], "blue"),
        Month("September", [30], "pink"),
        Month("October", [31], "grey"),
        Month("November", [30], "brown"),
        Month("December", [31], "grey"),
    ]
)

islamic_year = Year(
    months=[
        Month("Muharram", [29], "#9BD6D7"),
        Month("Safar", [29], "#9AEB99"),
        Month("Rabi al-Awwal", [30], "#DAFA9B"),
        Month("Rabi at-Thani", [30], "#FFFF99"),
        Month("Jawad al-Awwal", [29], "pink"),
        Month("Jawad at-Thani", [30], "green"),
        Month("Rajab", [30], "orange"),
        Month("Shabaan", [29], "blue"),
        Month("Ramadan", [30], "pink"),
        Month("Shawal", [29], "grey"),
        Month("Dhu al-Qadah", [30], "brown"),
        Month("Dhu al-Hijja", [29], "grey"),
    ]
)