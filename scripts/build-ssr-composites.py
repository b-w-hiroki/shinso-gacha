#!/usr/bin/env python3
"""Deterministically precompose SSR observation evidence into one WebP per site.

Keep original CC0 photo, alpha WebP perturbation, and SVG clue as masters.
The browser needs one decoded photo instead of three separate 1440x720
textures for SSR; image-space target coordinates are unchanged.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSET = ROOT / "assets" / "observation"
OUTPUT = ASSET / "ssr-composites"
REPORT = ROOT / "docs" / "qa-incursions" / "ssr-composite-build.json"
SOURCES = {
    "cctv": "cctv-underground-native.webp",
    "photo": "photo-classroom-native.webp",
    "vision": "vision-crossing-native.webp",
    "dash": "dash-coast-road-native.webp",
}
SIZE = (1440, 720)


def checksum(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compose(mode: str, source: str) -> tuple[bytes, dict]:
    photo_path = ASSET / source
    delta_path = ASSET / "photo-deltas" / f"{mode}-3.webp"
    svg_path = ASSET / "alt-overlays" / f"{mode}-3.svg"
    master_bytes = photo_path.read_bytes()
    delta_bytes = delta_path.read_bytes()
    svg_bytes = svg_path.read_bytes()
    with Image.open(io.BytesIO(master_bytes)) as opened:
        master = opened.convert("RGBA")
    with Image.open(io.BytesIO(delta_bytes)) as opened:
        delta = opened.convert("RGBA")
    if master.size != SIZE or delta.size != SIZE:
        raise ValueError(f"{mode}: photo and anomaly must remain native 1440x720")
    svg_png = cairosvg.svg2png(
        bytestring=svg_bytes, output_width=SIZE[0], output_height=SIZE[1]
    )
    with Image.open(io.BytesIO(svg_png)) as opened:
        clue = opened.convert("RGBA")
    # CSS stacking order: top SVG, middle transparent WebP, bottom photo.
    composed = Image.alpha_composite(Image.alpha_composite(master, delta), clue)
    output = io.BytesIO()
    composed.convert("RGB").save(output, format="WEBP", quality=92, method=6)
    result = output.getvalue()
    with Image.open(io.BytesIO(result)) as check:
        if check.size != SIZE:
            raise ValueError(f"{mode}: generated image has unexpected size")
    return result, {
        "mode": mode,
        "source": source,
        "photo_sha256": checksum(master_bytes),
        "delta_sha256": checksum(delta_bytes),
        "clue_sha256": checksum(svg_bytes),
        "output": f"{mode}-3.webp",
        "output_sha256": checksum(result),
        "bytes": len(result),
        "width": SIZE[0],
        "height": SIZE[1],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true",
                        help="verify committed assets exactly match masters")
    args = parser.parse_args()
    records = []
    for mode, source in SOURCES.items():
        result, record = compose(mode, source)
        dest = OUTPUT / record["output"]
        if args.check:
            if not dest.is_file() or dest.read_bytes() != result:
                raise SystemExit(f"{mode}: composite missing/stale; regenerate")
        else:
            OUTPUT.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(result)
        records.append(record)
    report = {"version": 1, "purpose": "SSR 3-to-1 precomposition; no new rewards",
              "source_layers": ["photo", "photo-deltas", "alt-overlays"],
              "size": list(SIZE), "entries": records}
    payload = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not REPORT.is_file() or REPORT.read_text("utf-8") != payload:
            raise SystemExit("SSR provenance report does not match masters")
    else:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(payload, "utf-8")
    print("SSR composites:", len(records), "modes",
          sum(x["bytes"] for x in records), "bytes; check =", args.check)


if __name__ == "__main__":
    main()
