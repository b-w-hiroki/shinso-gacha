#!/usr/bin/env python3
"""Validate and optionally integrate two AI-generated observation scenes.

No network, tokens, automatic merge, or GitHub writes. By default this script
ONLY validates a user-provided ZIP. --apply modifies a local feature checkout;
commit generated binaries and provenance through an authorized Git push/PR.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import subprocess
import sys
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MODES = ("dash", "photo")
SHAPE = (1440, 720)
ASSET = "assets/observation/"
FILE_NAMES = {
    f"{ASSET}{mode}-coast-road-native.webp" if mode == "dash"
    else f"{ASSET}photo-classroom-native.webp": (mode, 0)
    for mode in MODES
}
FILE_NAMES.update({
    f"{ASSET}photo-deltas/{mode}-{rarity}.webp": (mode, rarity)
    for mode in MODES for rarity in (1, 2, 3)
})
SOURCES = {
    "dash": "dash-coast-road-native.webp",
    "photo": "photo-classroom-native.webp",
}
SOURCE_MASTERS = {
    "dash": "a_cinematic_moody_nighttime_coastal_road_scene_vi.png",
    "photo": "a_wide_moody_cinematic_night_time_empty_classro.png",
}
ID = re.compile(r"^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$")


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def game_hotspots(repo: Path):
    # The runtime owns contact geometry; release tooling must not redefine it.
    code = ("const m=require('./assets/observation-location-model.js');"
            "console.log(JSON.stringify(Object.fromEntries("
            "['dash','photo'].map(mode=>[mode,Object.fromEntries("
            "[1,2,3].map(r=>[r,m.targets(mode,r)]))]))))")
    out = subprocess.run(["node", "-e", code], cwd=repo, check=True,
                         capture_output=True, text=True).stdout
    return json.loads(out)


def read_and_validate(archive: Path, hotspots: dict) -> tuple[dict, dict[str, bytes]]:
    if archive.stat().st_size > 15 * 1024 * 1024:
        raise ValueError("ZIP exceeds safe 15MB limit")
    with zipfile.ZipFile(archive) as z:
        items = z.infolist()
        names = [i.filename for i in items]
        if len(set(names)) != len(names):
            raise ValueError("Duplicate ZIP paths")
        if len(items) > 40 or sum(i.file_size for i in items) > 22 * 1024 * 1024:
            raise ValueError("Oversized ZIP contents")
        if any(i.filename.startswith("/") or ".." in Path(i.filename).parts
               or i.file_size > 4 * 1024 * 1024 for i in items):
            raise ValueError("Unsafe ZIP path or decompressed payload")
        info = json.loads(z.read("generated-art-manifest.json"))
        if info.get("schema") != 1 or tuple(info.get("resolution", ())) != SHAPE:
            raise ValueError("Generated art manifest has incompatible schema/size")
        sources = info.get("generated_sources", {})
        if set(sources) != set(MODES):
            raise ValueError("Missing generated photo provenance")
        for mode in MODES:
            source = sources[mode]
            if source.get("origin") != "OpenAI-generated artwork, original":
                raise ValueError("Unverified generated source provenance")
            if not ID.fullmatch(str(source.get("image_generation_id", ""))):
                raise ValueError("Invalid image generation ID")
            file = "source-originals/" + SOURCE_MASTERS[mode]
            if source.get("original_file_name") != SOURCE_MASTERS[mode]:
                raise ValueError("Unexpected original image name")
            if digest(z.read(file)) != source.get("original_sha256"):
                raise ValueError("PNG original hash mismatch: " + mode)
        declared = info.get("files", [])
        if len(declared) != len(FILE_NAMES) or {x.get("file") for x in declared} != set(FILE_NAMES):
            raise ValueError("Missing, duplicated, or unexpected production assets")
        payloads: dict[str, bytes] = {}
        for item in declared:
            target = item["file"]
            mode, rarity = FILE_NAMES[target]
            if item.get("mode") != mode or item.get("rarity") != rarity:
                raise ValueError("Wrong mode or rarity: " + target)
            raw = z.read(target)
            if not 1000 <= len(raw) <= 2 * 1024 * 1024 or len(raw) != item.get("bytes"):
                raise ValueError("Invalid candidate bytes: " + target)
            if digest(raw) != item.get("sha256"):
                raise ValueError("Candidate hash mismatch: " + target)
            with Image.open(io.BytesIO(raw)) as image:
                image.load()
                if image.size != SHAPE or image.format != "WEBP":
                    raise ValueError("Incorrect native image dimensions/format: " + target)
                if rarity:
                    if "A" not in image.getbands():
                        raise ValueError("Layer not transparent RGBA: " + target)
                    point = hotspots[mode][str(rarity)]
                    if len(point) != 1 or len(point[0]) != 4:
                        raise ValueError("Unexpected game touch regions: " + target)
                    x, y = [round(value * n) for value, n in zip(point[0][:2], SHAPE)]
                    if image.convert("RGBA").getchannel("A").getpixel((x, y)) == 0:
                        raise ValueError("Anomaly missing at real game hotspot: " + target)
                    if image.convert("RGBA").getchannel("A").getpixel((0, 719)) != 0:
                        raise ValueError("Anomaly opacity leaks beyond target: " + target)
                elif "A" in image.getbands():
                    raise ValueError("Master should be a flattened photograph: " + target)
            payloads[target] = raw
        for mode in MODES:
            path = ASSET + SOURCES[mode]
            if digest(payloads[path]) != sources[mode].get("output_master_sha256"):
                raise ValueError("Master provenance hash mismatch for " + mode)
    return info, payloads


def integration_records(repo: Path, info: dict, payloads: dict[str, bytes]):
    source_path = repo / "docs/observation-native-sources.json"
    report_path = repo / "docs/qa-incursions/native-photo-source-report.json"
    source = json.loads(source_path.read_text("utf8"))
    report = json.loads(report_path.read_text("utf8"))
    for mode in MODES:
        gen = info["generated_sources"][mode]
        uri = "generated://openai/imagegen/" + gen["image_generation_id"]
        master = ASSET + SOURCES[mode]
        s = next(x for x in source["sources"] if x["mode"] == mode)
        r = next(x for x in report if x["mode"] == mode)
        s.update(name=f"Generated {mode} observation / 2026-10-16",
                 author="birdman studio (AI-assisted)", source=uri,
                 license="AI-generated-original", original_sha256=gen["original_sha256"],
                 generation_id=gen["image_generation_id"])
        s.pop("brightness", None)
        s.pop("teal", None)
        r.update(source=uri, license="AI-generated-original",
                 author="birdman studio (AI-assisted)",
                 original_sha256=gen["original_sha256"],
                 generation_id=gen["image_generation_id"],
                 native_original=[1774, 887], output=SOURCES[mode],
                 size=list(SHAPE), bytes=len(payloads[master]),
                 sha256=digest(payloads[master]))
    return {source_path: json.dumps(source, indent=2, ensure_ascii=False) + "\n",
            report_path: json.dumps(report, indent=2, ensure_ascii=False) + "\n"}


def apply_to_feature_branch(repo: Path, info: dict, payloads: dict[str, bytes]) -> None:
    # Require a named feature branch and a clean checkout before any write.
    branch = subprocess.run(["git", "branch", "--show-current"], cwd=repo,
                            check=True, capture_output=True, text=True).stdout.strip()
    if not branch or branch in ("main", "master"):
        raise ValueError("--apply must run on an explicitly checked-out feature branch")
    dirty = subprocess.run(["git", "status", "--porcelain"], cwd=repo,
                           check=True, capture_output=True, text=True).stdout.strip()
    if dirty:
        raise ValueError("--apply refuses a dirty working tree")
    modified = {repo / path: data for path, data in payloads.items()}
    for path, text in integration_records(repo, info, payloads).items():
        modified[path] = text.encode("utf8")
    for path in modified:
        if not path.is_file():
            raise FileNotFoundError("Missing production file: " + str(path))
    backup = {path: path.read_bytes() for path in modified}
    try:
        for path, data in modified.items():
            path.write_bytes(data)
        subprocess.run([sys.executable, str(repo / "scripts/build-ssr-composites.py")],
                       cwd=repo, check=True)
        subprocess.run([sys.executable, str(repo / "scripts/build-ssr-composites.py"), "--check"],
                       cwd=repo, check=True)
        subprocess.run(["node", "tests/observation-photo-asset-audit.cjs"], cwd=repo, check=True)
        subprocess.run(["node", "tests/ssr-composite-asset-audit.cjs"], cwd=repo, check=True)
    except Exception:
        for path, original in backup.items():
            path.write_bytes(original)
        # Rebuild the old composite assets and reports from restored masters.
        subprocess.run([sys.executable, str(repo / "scripts/build-ssr-composites.py")],
                       cwd=repo, check=True)
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--repo", type=Path, default=ROOT)
    parser.add_argument("--apply", action="store_true", help="modify local feature checkout; never auto-push")
    args = parser.parse_args()
    root = args.repo.resolve()
    info, images = read_and_validate(args.archive, game_hotspots(root))
    print("VALIDATED 2 AI-generated masters + 6 transparent anomaly layers; unchanged IDs")
    if args.apply:
        apply_to_feature_branch(root, info, images)
        print("STAGED in local checkout; review git diff and commit with approved GitHub credentials")
    else:
        print("READ-ONLY validation. Nothing was changed. --apply requires a feature branch.")


if __name__ == "__main__":
    main()
