#!/usr/bin/env python3
"""Render a read-only 4x4 observation-art comparison, not a browser screenshot.

The diagnostic metrics are NOT a substitute for judging camera perspective,
photo realism, darkness, anomaly discoverability, or mobile interactions.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
import subprocess
from pathlib import Path

import cairosvg
from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
MODES = ("cctv", "photo", "vision", "dash")
SOURCES = {
    "cctv": "cctv-underground-native.webp",
    "photo": "photo-classroom-native.webp",
    "vision": "vision-crossing-native.webp",
    "dash": "dash-coast-road-native.webp",
}
IMAGE_SIZE = (1440, 720)
SAMPLE_SIZE = (180, 90)
PREVIEW_SIZE = (360, 180)


def checksum(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_rgba(path: Path, size=IMAGE_SIZE) -> Image.Image:
    with Image.open(path) as raw:
        if raw.size != size:
            raise ValueError(f"{path}: expected {size}, received {raw.size}")
        return raw.convert("RGBA")


def svg_layer(path: Path, size) -> Image.Image:
    source = path.read_text("utf8")
    if any(x in source.lower() for x in ("<script", "<foreignobject", "<image")):
        raise ValueError(f"{path}: external or executable SVG content")
    data = cairosvg.svg2png(bytestring=source.encode(), output_width=size[0], output_height=size[1])
    with Image.open(io.BytesIO(data)) as raw:
        return raw.convert("RGBA")


def visual_metrics(base: Image.Image, composed: Image.Image, targets: list[list[float]]) -> dict:
    """Localize actual pixel changes around recorded hotspots, without grading quality."""
    if base.size != composed.size:
        raise ValueError("base and composed dimensions differ")
    if not targets:
        raise ValueError("a comparison requires valid touch targets")
    difference = ImageChops.difference(base.convert("RGB"), composed.convert("RGB"))
    sample = difference.resize(SAMPLE_SIZE, Image.Resampling.BOX)
    all_energy, near_energy, changed = 0.0, 0.0, 0
    for y in range(SAMPLE_SIZE[1]):
        for x in range(SAMPLE_SIZE[0]):
            red, green, blue = sample.getpixel((x, y))
            magnitude = (red + green + blue) / 3
            all_energy += magnitude
            changed += magnitude >= 8
            u, v = (x + 0.5) / SAMPLE_SIZE[0], (y + 0.5) / SAMPLE_SIZE[1]
            if any(((u - t[0]) / max(.001, 1.5 * t[2])) ** 2 +
                   ((v - t[1]) / max(.001, 1.5 * t[3])) ** 2 <= 1 for t in targets):
                near_energy += magnitude
    total = SAMPLE_SIZE[0] * SAMPLE_SIZE[1]
    coverage = changed / total
    locality = near_energy / all_energy if all_energy else 0.0
    # Non-gating prompts for visual inspection: no arbitrary 'quality pass' score.
    concerns = []
    if coverage < .02:
        concerns.append("sparse-difference-under-2-percent")
    if all_energy and locality < .65:
        concerns.append("change-extends-beyond-hotspots")
    return {
        "mean_absolute_rgb_difference": round(all_energy / total, 3),
        "changed_pixel_fraction": round(coverage, 4),
        "difference_near_hotspots_fraction": round(locality, 4),
        "review_concerns": concerns,
        "needs_human_quality_review": True,
    }


def game_targets(root: Path) -> dict:
    # Source of truth: live, normalized in-game hotspots, never a copied asset table.
    expression = ("const m=require('./assets/observation-location-model.js');"
                  "console.log(JSON.stringify(Object.fromEntries("
                  "['cctv','photo','vision','dash'].map(mode=>[mode,Object.fromEntries("
                  "[1,2,3].map(r=>[r,m.targets(mode,r)]))]))))")
    stdout = subprocess.run(["node", "-e", expression], cwd=root, capture_output=True,
                            text=True, check=True).stdout
    return json.loads(stdout)


def audit(root: Path, output: Path) -> dict:
    assets = root / "assets" / "observation"
    targets = game_targets(root)
    output.mkdir(parents=True, exist_ok=True)
    width, height, header, gap, pad = 360, 180, 26, 12, 18
    contact = Image.new("RGB", (2 * pad + 4 * width + 3 * gap,
                                2 * pad + 4 * (height + header) + 3 * gap), "#111a1b")
    draw = ImageDraw.Draw(contact)
    font = ImageFont.load_default()
    entries = []
    for row, mode in enumerate(MODES):
        base_path = assets / SOURCES[mode]
        master = load_rgba(base_path)
        for column, rarity in enumerate((0, 1, 2, 3)):
            normal = master.resize(PREVIEW_SIZE, Image.Resampling.LANCZOS)
            frame = normal.copy()
            item = {"mode": mode, "rarity": rarity, "source": SOURCES[mode],
                    "source_sha256": checksum(base_path)}
            if rarity:
                delta_path = assets / "photo-deltas" / f"{mode}-{rarity}.webp"
                clue_path = assets / "alt-overlays" / f"{mode}-{rarity}.svg"
                delta = load_rgba(delta_path).resize(PREVIEW_SIZE, Image.Resampling.LANCZOS)
                clue = svg_layer(clue_path, PREVIEW_SIZE)
                frame = Image.alpha_composite(Image.alpha_composite(frame, delta), clue)
                item.update({
                    "delta_sha256": checksum(delta_path), "clue_sha256": checksum(clue_path),
                    "hotspot_centers": [t[:2] for t in targets[mode][str(rarity)]],
                    "metrics": visual_metrics(normal, frame, targets[mode][str(rarity)]),
                })
            x = pad + column * (width + gap)
            y = pad + row * (height + header + gap)
            draw.text((x + 4, y + 4), f"{mode.upper()} / {['N','R','SR','SSR'][column]}",
                      fill="#e7dbc5", font=font)
            contact.paste(frame.convert("RGB"), (x, y + header))
            entries.append(item)
    contact.save(output / "observation-4x4-art-contact-sheet.webp",
                 format="WEBP", quality=90, method=6)
    report = {
        "schema": 1, "purpose": "Original photo, delta WebP, and SVG pixel comparison; NOT browser/human QA",
        "dimensions": list(IMAGE_SIZE), "states": 16, "deltas": 12, "entries": entries,
    }
    (output / "observation-visual-metrics.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "docs" / "qa-observation-assets")
    args = parser.parse_args()
    result = audit(args.root.resolve(), args.output_dir.resolve())
    assert len(result["entries"]) == 16
    print("Generated 4 x 4 observation image comparison and 12 hotspot-difference metrics.")
    for row in result["entries"]:
        if row["rarity"] and row["metrics"]["review_concerns"]:
            print("::notice title=Observation artwork requires human review::"
                  + row["mode"] + " rarity " + str(row["rarity"])
                  + " - " + ", ".join(row["metrics"]["review_concerns"]))
    print("No final image quality, mobile QA, or production artwork approval is implied.")
