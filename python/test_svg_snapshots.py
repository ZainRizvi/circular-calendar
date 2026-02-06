"""
SVG and PDF snapshot tests for the circular calendar.

These tests run make_cal.py with a fixed date and verify the SVG and PDF output
matches the expected snapshots. This ensures refactoring doesn't change
the visual output.

To update snapshots when output intentionally changes:
    python test_svg_snapshots.py --update

To run tests:
    pytest test_svg_snapshots.py -v
"""

import io
import os
import sys
import subprocess
import shutil
from pathlib import Path

import pytest
import pypdfium2 as pdfium
from PIL import Image


SNAPSHOT_DIR = Path(__file__).parent / "test_snapshots"
PDF_SNAPSHOT_DIR = SNAPSHOT_DIR / "pdf_pages"
PYTHON_DIR = Path(__file__).parent

# Fixed date for reproducible tests
REFERENCE_DATE = "2026-02-05"


def normalize_svg(svg: str) -> str:
    """Normalize SVG for comparison (handle minor whitespace differences)."""
    lines = [line.rstrip() for line in svg.strip().split('\n')]
    return '\n'.join(lines)


def run_make_cal_and_capture_svgs(date: str, keep_svgs: bool = True) -> dict[str, str]:
    """
    Run make_cal.py with the given date and capture SVG content before deletion.

    Returns dict mapping filename to SVG content.
    """
    # Patch make_cal.py temporarily to not delete SVGs
    make_cal_path = PYTHON_DIR / "make_cal.py"
    original_content = make_cal_path.read_text()

    # Comment out the os.remove(svg_file) lines
    patched_content = original_content.replace(
        "os.remove(svg_file)",
        "pass  # os.remove(svg_file) - disabled for testing"
    )

    try:
        make_cal_path.write_text(patched_content)

        # Run make_cal.py with the fixed date
        result = subprocess.run(
            [sys.executable, "make_cal.py", "--date", date],
            cwd=PYTHON_DIR,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            raise RuntimeError(f"make_cal.py failed with code {result.returncode}")

        # Collect SVG files from out/
        out_dir = PYTHON_DIR / "out"
        svgs = {}
        for svg_file in sorted(out_dir.glob("*.svg")):
            svgs[svg_file.name] = svg_file.read_text()
            if not keep_svgs:
                svg_file.unlink()

        return svgs

    finally:
        # Restore original make_cal.py
        make_cal_path.write_text(original_content)


def load_snapshot(name: str) -> str:
    """Load a reference snapshot file."""
    path = SNAPSHOT_DIR / name
    if not path.exists():
        raise FileNotFoundError(
            f"Snapshot {path} not found. Run with --update to create it."
        )
    return normalize_svg(path.read_text())


def save_snapshot(name: str, content: str):
    """Save a reference snapshot file."""
    SNAPSHOT_DIR.mkdir(exist_ok=True)
    path = SNAPSHOT_DIR / name
    path.write_text(content)
    print(f"Saved snapshot: {path}")


class TestSVGSnapshots:
    """Test that generated SVGs match snapshots."""

    @pytest.fixture(scope="class")
    def generated_svgs(self):
        """Generate SVGs once for all tests in this class."""
        return run_make_cal_and_capture_svgs(REFERENCE_DATE, keep_svgs=False)

    def test_cover_page_svg(self, generated_svgs):
        """Cover page SVG should match snapshot."""
        # Find the cover SVG (ends with _cover.svg)
        cover_files = [f for f in generated_svgs.keys() if f.endswith("_cover.svg")]
        assert len(cover_files) == 1, f"Expected 1 cover file, found: {cover_files}"

        cover_name = cover_files[0]
        assert normalize_svg(generated_svgs[cover_name]) == load_snapshot(cover_name)

    def test_page_0_svg(self, generated_svgs):
        """First calendar page SVG should match snapshot."""
        page_files = [f for f in generated_svgs.keys() if "_0.svg" in f and "cover" not in f]
        assert len(page_files) == 1, f"Expected 1 page 0 file, found: {page_files}"

        page_name = page_files[0]
        assert normalize_svg(generated_svgs[page_name]) == load_snapshot(page_name)

    def test_page_1_svg(self, generated_svgs):
        """Second calendar page SVG should match snapshot."""
        page_files = [f for f in generated_svgs.keys() if "_1.svg" in f and "cover" not in f]
        assert len(page_files) == 1, f"Expected 1 page 1 file, found: {page_files}"

        page_name = page_files[0]
        assert normalize_svg(generated_svgs[page_name]) == load_snapshot(page_name)

    def test_page_2_svg(self, generated_svgs):
        """Third calendar page SVG should match snapshot."""
        page_files = [f for f in generated_svgs.keys() if "_2.svg" in f and "cover" not in f]
        assert len(page_files) == 1, f"Expected 1 page 2 file, found: {page_files}"

        page_name = page_files[0]
        assert normalize_svg(generated_svgs[page_name]) == load_snapshot(page_name)

    def test_all_svgs_have_snapshots(self, generated_svgs):
        """All generated SVGs should have corresponding snapshots."""
        missing = []
        for svg_name in generated_svgs.keys():
            snapshot_path = SNAPSHOT_DIR / svg_name
            if not snapshot_path.exists():
                missing.append(svg_name)

        if missing:
            pytest.fail(
                f"Missing snapshots for: {missing}\n"
                f"Run 'python test_svg_snapshots.py --update' to create them."
            )


def pdf_page_to_png_bytes(pdf_path: Path, page_num: int, dpi: int = 100) -> bytes:
    """Convert a single PDF page to PNG bytes."""
    pdf = pdfium.PdfDocument(str(pdf_path))
    page = pdf[page_num]
    scale = dpi / 72
    bitmap = page.render(scale=scale)
    pil_image = bitmap.to_pil()

    img_bytes = io.BytesIO()
    pil_image.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes.getvalue()


def images_are_identical(img1_bytes: bytes, img2_bytes: bytes) -> bool:
    """Compare two PNG images for pixel-perfect match."""
    img1 = Image.open(io.BytesIO(img1_bytes))
    img2 = Image.open(io.BytesIO(img2_bytes))

    if img1.size != img2.size:
        return False

    # Compare pixel by pixel
    return list(img1.tobytes()) == list(img2.tobytes())


def run_make_cal_and_capture_pdfs(date: str) -> dict[str, bytes]:
    """
    Run make_cal.py with the given date and capture PDF page images.

    Returns dict mapping page name to PNG bytes.
    """
    make_cal_path = PYTHON_DIR / "make_cal.py"
    original_content = make_cal_path.read_text()

    # Patch to keep intermediate PDFs and SVGs
    patched_content = original_content.replace(
        "os.remove(svg_file)",
        "pass  # os.remove(svg_file) - disabled for testing"
    ).replace(
        "os.remove(pdf)",
        "pass  # os.remove(pdf) - disabled for testing"
    ).replace(
        "os.remove(cover_pdf)",
        "pass  # os.remove(cover_pdf) - disabled for testing"
    )

    try:
        make_cal_path.write_text(patched_content)

        result = subprocess.run(
            [sys.executable, "make_cal.py", "--date", date],
            cwd=PYTHON_DIR,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            raise RuntimeError(f"make_cal.py failed with code {result.returncode}")

        # Collect PDF files and convert to PNG
        out_dir = PYTHON_DIR / "out"
        pdfs = {}

        for pdf_file in sorted(out_dir.glob("calendar_page_*.pdf")):
            # Get page count
            pdf_doc = pdfium.PdfDocument(str(pdf_file))
            for page_num in range(len(pdf_doc)):
                page_name = f"{pdf_file.stem}_page{page_num}.png"
                pdfs[page_name] = pdf_page_to_png_bytes(pdf_file, page_num)

            # Clean up
            pdf_file.unlink()

        # Clean up SVGs
        for svg_file in out_dir.glob("*.svg"):
            svg_file.unlink()

        return pdfs

    finally:
        make_cal_path.write_text(original_content)


def load_pdf_snapshot(name: str) -> bytes:
    """Load a reference PDF page snapshot."""
    path = PDF_SNAPSHOT_DIR / name
    if not path.exists():
        raise FileNotFoundError(
            f"PDF snapshot {path} not found. Run with --update to create it."
        )
    return path.read_bytes()


def save_pdf_snapshot(name: str, content: bytes):
    """Save a reference PDF page snapshot."""
    PDF_SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    path = PDF_SNAPSHOT_DIR / name
    path.write_bytes(content)
    print(f"Saved PDF snapshot: {path}")


class TestPDFSnapshots:
    """Test that generated PDFs match snapshots."""

    @pytest.fixture(scope="class")
    def generated_pdfs(self):
        """Generate PDFs once for all tests in this class."""
        return run_make_cal_and_capture_pdfs(REFERENCE_DATE)

    def test_calendar_page_0_pdf(self, generated_pdfs):
        """First calendar page PDF should match snapshot."""
        page_files = [f for f in generated_pdfs.keys() if "page_0.7_0_page0" in f]
        assert len(page_files) == 1, f"Expected 1 page 0 file, found: {page_files}"

        page_name = page_files[0]
        expected = load_pdf_snapshot(page_name)
        assert images_are_identical(generated_pdfs[page_name], expected), \
            f"PDF page {page_name} does not match snapshot"

    def test_calendar_page_1_pdf(self, generated_pdfs):
        """Second calendar page PDF should match snapshot."""
        page_files = [f for f in generated_pdfs.keys() if "page_0.7_1_page0" in f]
        assert len(page_files) == 1, f"Expected 1 page 1 file, found: {page_files}"

        page_name = page_files[0]
        expected = load_pdf_snapshot(page_name)
        assert images_are_identical(generated_pdfs[page_name], expected), \
            f"PDF page {page_name} does not match snapshot"

    def test_calendar_page_2_pdf(self, generated_pdfs):
        """Third calendar page PDF should match snapshot."""
        page_files = [f for f in generated_pdfs.keys() if "page_0.7_2_page0" in f]
        assert len(page_files) == 1, f"Expected 1 page 2 file, found: {page_files}"

        page_name = page_files[0]
        expected = load_pdf_snapshot(page_name)
        assert images_are_identical(generated_pdfs[page_name], expected), \
            f"PDF page {page_name} does not match snapshot"

    def test_cover_page_pdf(self, generated_pdfs):
        """Cover page PDF should match snapshot."""
        page_files = [f for f in generated_pdfs.keys() if "cover_page0" in f]
        assert len(page_files) == 1, f"Expected 1 cover file, found: {page_files}"

        page_name = page_files[0]
        expected = load_pdf_snapshot(page_name)
        assert images_are_identical(generated_pdfs[page_name], expected), \
            f"PDF page {page_name} does not match snapshot"

    def test_all_pdfs_have_snapshots(self, generated_pdfs):
        """All generated PDF pages should have corresponding snapshots."""
        missing = []
        for page_name in generated_pdfs.keys():
            snapshot_path = PDF_SNAPSHOT_DIR / page_name
            if not snapshot_path.exists():
                missing.append(page_name)

        if missing:
            pytest.fail(
                f"Missing PDF snapshots for: {missing}\n"
                f"Run 'python test_svg_snapshots.py --update' to create them."
            )


def update_all_snapshots():
    """Regenerate all snapshot reference files (SVG and PDF)."""
    print(f"Generating SVGs with date {REFERENCE_DATE}...")
    svgs = run_make_cal_and_capture_svgs(REFERENCE_DATE, keep_svgs=False)

    SNAPSHOT_DIR.mkdir(exist_ok=True)

    for name, content in svgs.items():
        save_snapshot(name, content)

    print(f"\nUpdated {len(svgs)} SVG snapshots in {SNAPSHOT_DIR}")

    print(f"\nGenerating PDFs with date {REFERENCE_DATE}...")
    pdfs = run_make_cal_and_capture_pdfs(REFERENCE_DATE)

    for name, content in pdfs.items():
        save_pdf_snapshot(name, content)

    print(f"\nUpdated {len(pdfs)} PDF snapshots in {PDF_SNAPSHOT_DIR}")


if __name__ == "__main__":
    if "--update" in sys.argv:
        update_all_snapshots()
    else:
        print("Run with --update to regenerate snapshots")
        print("Run with pytest to test against existing snapshots")
