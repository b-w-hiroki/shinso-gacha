#!/usr/bin/env python3
"""Prepare non-published 2:1 photo / sparse RGBA / precomposed SSR candidates.

NEVER overwrite production assets. A candidate is not a released game asset.
Input A: existing front-view dash WebP (legacy in-repo).
Input B: CC0 photograph "Quiet Before the Lesson" by Yvanille, Wikimedia Commons.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
from pathlib import Path
import urllib.request

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SIZE = (1440, 720)
COMMONS_URL = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Quiet_Before_the_Lesson.jpg"
COMMONS_PAGE = "https://commons.wikimedia.org/wiki/File:Quiet_Before_the_Lesson.jpg"
TARGETS = {
    "dash": [(0.20, 0.29), (0.43, 0.42), (0.59, 0.54)],
    "photo": [(0.40, 0.36), (0.70, 0.82), (0.59, 0.065)],
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encode(image: Image.Image, quality=91) -> bytes:
    dst = io.BytesIO()
    image.save(dst, format="WEBP", quality=quality, method=6)
    return dst.getvalue()


def at(x: float, y: float) -> tuple[int, int]:
    return round(x * SIZE[0]), round(y * SIZE[1])


def graded_night(original: Image.Image, mode: str) -> Image.Image:
    """Single, fixed camera transformation; no per-rarity transforms."""
    image = original.convert("RGB")
    image = ImageEnhance.Color(image).enhance(.42 if mode == "dash" else .29)
    image = ImageEnhance.Contrast(image).enhance(1.07)
    image = ImageEnhance.Brightness(image).enhance(.48 if mode == "dash" else .54)
    # Bluish-green twilight film tone, no fake light sources baked into baseline.
    tint = Image.new("RGB", SIZE, (14, 35, 49))
    image = Image.blend(image, tint, .15 if mode == "dash" else .18)
    # Vignetting is an independent, non-destructive atmosphere pass.
    vignette = Image.new("L", SIZE, 0)
    data = vignette.load()
    for y in range(SIZE[1]):
        ny = (y - SIZE[1] * .48) / (SIZE[1] * .70)
        for x in range(SIZE[0]):
            nx = (x - SIZE[0] * .5) / (SIZE[0] * .85)
            data[x, y] = max(0, min(90, round(64 * (nx * nx + ny * ny))))
    image.paste(Image.new("RGB", SIZE, (5, 12, 16)), (0, 0), vignette)
    return image


def dash_from_legacy(file: Path) -> Image.Image:
    with Image.open(file) as image:
        w, h = image.size
        if w < 1700 or h < 600:
            raise ValueError("Unexpected legacy stereo dash source; refuse a blind crop")
        # The first stereo pane contains an authentic forward road-level viewpoint.
        panel = image.crop((0, 0, w // 2, h))
        w2, h2 = panel.size
        crop_h = min(h2, int(w2 / 2))
        top = round((h2 - crop_h) * .68)
        image = panel.crop((0, top, w2, top + crop_h))
        image = image.resize(SIZE, Image.Resampling.LANCZOS)
    return graded_night(image, "dash")


def download_classroom() -> tuple[Image.Image, dict]:
    headers = {"User-Agent": "birdman-studio-observation-asset-candidate/1.0 (research, CC0)", "Accept": "image/jpeg"}
    with urllib.request.urlopen(urllib.request.Request(COMMONS_URL, headers=headers), timeout=40) as resp:
        source = resp.read()
    if len(source) < 100000:
        raise ValueError("Source photograph unusually small")
    with Image.open(io.BytesIO(source)) as original:
        w, h = original.size
        if w < 2000 or h < 1300:
            raise ValueError("Original classroom photo is not high resolution")
        # Wide natural school-room photograph; no hallucinated objects added.
        crop_h = round(w * SIZE[1] / SIZE[0])
        top = round((h - crop_h) * .39)
        top = max(0, min(h - crop_h, top))
        room = original.crop((0, top, w, top + crop_h)).resize(SIZE, Image.Resampling.LANCZOS)
    return graded_night(room, "photo"), {
        "type": "external-photo", "author": "Yvanille", "license": "CC0-1.0",
        "source": COMMONS_PAGE, "download": COMMONS_URL,
        "original_dimensions": [w, h], "original_sha256": sha(source)
    }


def ellipse_mask(cx, cy, rx, ry, alpha, blur=12) -> Image.Image:
    mask = Image.new("L", SIZE)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=alpha)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def paint_shape(layer: Image.Image, color: tuple[int, int, int], mask: Image.Image):
    patch = Image.new("RGBA", SIZE, (*color, 0))
    patch.putalpha(mask)
    layer.alpha_composite(patch)


def anomalies(mode: str, rarity: int) -> Image.Image:
    """Sparse independent RGBA changes; hotspots stay EXACTLY unchanged."""
    if mode not in TARGETS or rarity not in (1, 2, 3):
        raise ValueError("Unknown candidate state")
    layer = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    x, y = at(*TARGETS[mode][rarity - 1])
    if mode == "dash":
        if rarity == 1:
            paint_shape(layer, (192, 202, 197), ellipse_mask(x, y, 22, 72, 135, 18))
            paint_shape(layer, (4, 14, 16), ellipse_mask(x, y + 20, 12, 56, 106, 9))
        elif rarity == 2:
            for dx in (-27, 27):
                paint_shape(layer, (187, 213, 211), ellipse_mask(x + dx, y, 11, 8, 145, 7))
                paint_shape(layer, (87, 133, 143), ellipse_mask(x + dx, y + 15, 13, 24, 48, 16))
        else:
            paint_shape(layer, (4, 12, 16), ellipse_mask(x, y, 30, 78, 136, 9))
            paint_shape(layer, (112, 142, 147), ellipse_mask(x + 5, y + 44, 12, 68, 32, 15))
    else:
        if rarity == 1:
            paint_shape(layer, (5, 12, 18), ellipse_mask(x, y + 18, 58, 101, 161, 17))
            paint_shape(layer, (13, 18, 23), ellipse_mask(x, y - 45, 19, 27, 72, 9))
        elif rarity == 2:
            paint_shape(layer, (7, 14, 19), ellipse_mask(x, y, 49, 25, 148, 8))
            paint_shape(layer, (155, 168, 179), ellipse_mask(x, y - 15, 17, 34, 33, 11))
        else:
            # Unexplained pale paperwork above the first row; no baked text.
            paint_shape(layer, (190, 202, 197), ellipse_mask(x, y, 78, 15, 84, 12))
            paint_shape(layer, (9, 14, 20), ellipse_mask(x, y + 6, 36, 5, 120, 3))
    return layer


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, default=ROOT / "docs/qa-observation-candidates")
    args = parser.parse_args()
    output = args.output_dir.resolve()
    output.mkdir(parents=True, exist_ok=True)
    room, source_room = download_classroom()
    dash_path = ROOT / "assets/observation/dash.webp"
    photos = {"dash": dash_from_legacy(dash_path), "photo": room}
    manifest = {"schema": 1, "status": "candidate-only-not-integrated", "size": list(SIZE),
      "photos": [], "states": [], "sources": {
        "dash": {"type": "legacy-in-repo-stereo-crop", "path": "assets/observation/dash.webp",
                 "sha256": sha(dash_path.read_bytes()), "license": "provenance-review-needed"},
        "photo": source_room}}
    canvas = Image.new("RGB", (2 * SIZE[0], 4 * SIZE[1]), (13, 20, 23))
    for idx, (mode, photo) in enumerate(photos.items()):
        photo_bin = encode(photo)
        out = output / f"{mode}-native-candidate.webp"
        out.write_bytes(photo_bin)
        manifest["photos"].append({"mode": mode, "name": out.name, "sha256": sha(photo_bin), "bytes": len(photo_bin)})
        for rarity in range(4):
            if rarity:
                layer = anomalies(mode, rarity)
                image = Image.alpha_composite(photo.convert("RGBA"), layer).convert("RGB")
                delta_bytes = encode(layer, 96)
                delta_name = f"{mode}-{rarity}-delta-candidate.webp"
                (output / delta_name).write_bytes(delta_bytes)
                manifest["states"].append({"mode": mode, "rarity": rarity, "file": delta_name,
                   "sha256": sha(delta_bytes), "hotspot": TARGETS[mode][rarity - 1],
                   "transparent_background": True})
            else:
                image = photo
            image_bytes = encode(image, 90)
            combined_name = f"{mode}-{rarity}-preview.webp"
            (output / combined_name).write_bytes(image_bytes)
            canvas.paste(image, (idx * SIZE[0], rarity * SIZE[1]))
    canvas.resize((1440, 1440), Image.Resampling.LANCZOS).save(
        output / "two-sites-8-state-comparison.webp", "WEBP", quality=85)
    (output / "candidate-manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    assert len(manifest["states"]) == 6
    print("Generated 2 candidate photo masters, 6 independent alpha deltas, 8 previews.")
    print("CANDIDATE ONLY: No app image, save file, source manifest or game ID overwritten.")


if __name__ == "__main__":
    main()
