#!/usr/bin/env python
import cairosvg

svg_file = "sample_output/calendar_cover_auto_rotated.svg"
png_file = "sample_output/calendar_cover_auto_rotated.png"

print(f"Converting {svg_file} to PNG...")
cairosvg.svg2png(url=svg_file, write_to=png_file, scale=2.0)
print(f"✓ Created {png_file}")
