#!/bin/bash
source .venv/bin/activate
python -m pytest test_svg_snapshots.py test_islamic_alignment.py -v
