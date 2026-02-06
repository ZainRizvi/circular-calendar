import unittest
from make_cal import *        

class Test_DimensionalArc(unittest.TestCase):
    def test_path(self):
        darc = getDimensionalArc(Point(100,100), 60, 90, -135, -45, fill="red")
        expectedPath = "m 36.36038969321073,36.36038969321072 A 90,90 0 0 1 163.63961030678928,36.36038969321073 L 142.42640687119285,57.573593128807154 A 60,60 0 0 0 57.573593128807154,57.57359312880715 L 36.36038969321073,36.36038969321072 "
        self.assertEqual(darc.path(), expectedPath)

class Test_Arc(unittest.TestCase):
    def test_path(self):
        a = Arc(Point(0,0), Point(5,5), 3, "0 0 1")
        self.assertEqual(a.path(ArcDrawMode.NEW), 'm 0,0 A 3,3 0 0 1 5,5 ')

    def test_arcPath(self):
        # Draw a vertical, curved arc, open to the left
        arc = getArc(Point(100, 100), 50, -45, 45)
        self.assertEqual(arc.path(ArcDrawMode.NEW), "m 135.35533905932738,64.64466094067262 A 50,50 0 0 1 135.35533905932738,135.35533905932738 ")

    def test_equals(self):
        a1 = Arc(Point(0,0), Point(5,5), 3, "0 0 1")
        a2 = Arc(Point(0,0), Point(5,5), 3, "0 0 1")
        a3 = Arc(Point(0,0), Point(5,5), 4, "0 0 1")
        a4 = Arc(Point(1,0), Point(5,5), 3, "0 0 1")
        self.assertEqual(a1, a2)
        self.assertNotEqual(a1, a3)
        self.assertNotEqual(a1, a4)


class Test_Point(unittest.TestCase):

    def test_coordinates(self):
        p = Point(5,2)
        self.assertEqual(p.x, 5)
        self.assertEqual(p.y, 2)

    def test_path(self):
        p = Point(5,2.2)
        self.assertEqual(p.pathText(), "5,2.2")

print("I'm gonna kick some tests")

if __name__ == '__main__':
    unittest.main()
