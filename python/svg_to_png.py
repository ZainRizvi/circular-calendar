"""
Convert SVG file to PNG using Playwright (headless Chromium).

This replaces the Node.js svg_to_png.js with a pure Python solution.
Returns dimensions in points to stdout as JSON for the caller.
"""

import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


def parse_size_to_points(size_str: str | None) -> float:
    """Parse SVG dimension string to points (1 point = 1/72 inch)."""
    if not size_str:
        return 612.0  # default letter width

    match = re.match(r"[\d.]+", size_str)
    if not match:
        return 612.0
    num = float(match.group())

    if "mm" in size_str:
        return num * 72 / 25.4
    if "in" in size_str:
        return num * 72
    if "pt" in size_str:
        return num
    if "px" in size_str:
        return num * 72 / 96
    return num


def svg_to_png(svg_path: str, png_path: str, dpi: int = 150) -> dict:
    """Convert SVG to PNG at specified DPI using Playwright/Chromium."""
    svg_content = Path(svg_path).read_text(encoding="utf-8")

    width_match = re.search(r'width="([^"]+)"', svg_content)
    height_match = re.search(r'height="([^"]+)"', svg_content)

    width_pts = parse_size_to_points(width_match.group(1) if width_match else None)
    height_pts = parse_size_to_points(height_match.group(1) if height_match else None)

    scale = dpi / 72
    width_px = int(width_pts * scale + 0.5)
    height_px = int(height_pts * scale + 0.5)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": width_px, "height": height_px},
            device_scale_factor=1
        )
        page = context.new_page()

        html = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        * {{ margin: 0; padding: 0; }}
        body {{ width: {width_px}px; height: {height_px}px; background: white; }}
        svg {{ width: {width_px}px; height: {height_px}px; }}
    </style>
</head>
<body>{svg_content}</body>
</html>"""

        page.set_content(html, wait_until="networkidle")
        page.screenshot(path=png_path, type="png", full_page=True, omit_background=False)
        browser.close()

    return {
        "widthPts": width_pts,
        "heightPts": height_pts,
        "widthPx": width_px,
        "heightPx": height_px,
        "dpi": dpi
    }


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python svg_to_png.py input.svg output.png [dpi]", file=sys.stderr)
        sys.exit(1)

    svg_path = sys.argv[1]
    png_path = sys.argv[2]
    dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 150

    result = svg_to_png(svg_path, png_path, dpi)
    print(json.dumps(result))
