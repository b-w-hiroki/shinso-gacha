"""Local synthetic tests: never modify repo masters or download an image."""
import hashlib
import importlib.util
import io
import json
import tempfile
import unittest
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parents[1]
SCRIPT = HERE / "scripts/import-generated-observation.py"
spec = importlib.util.spec_from_file_location("observation_generated_importer", SCRIPT)
M = importlib.util.module_from_spec(spec)
spec.loader.exec_module(M)

HOTSPOTS = {
    "dash": {str(n): [[x, y, .2, .2]] for n, (x, y) in enumerate(
        ((.20, .29), (.43, .42), (.59, .54)), start=1)},
    "photo": {str(n): [[x, y, .2, .2]] for n, (x, y) in enumerate(
        ((.40, .36), (.70, .82), (.59, .065)), start=1)}
}
GEN_IDS = {
    "dash": "4211af05-6ca3-479b-be18-5ddb414401f8",
    "photo": "eadc6b95-ded9-4717-9852-2936687034f0"
}


def webp(img):
    data = io.BytesIO()
    img.save(data, format="WEBP", quality=92)
    return data.getvalue()


def png(img):
    data = io.BytesIO()
    img.save(data, format="PNG")
    return data.getvalue()


def make_fixture(location: Path):
    members = {}
    sources, entries = {}, []
    for mode in M.MODES:
        original_name = M.SOURCE_MASTERS[mode]
        original = png(Image.new("RGB", (1774, 887), "#25303c"))
        members["source-originals/" + original_name] = original
        master = webp(Image.new("RGB", M.SHAPE, "#1c2630"))
        master_path = M.ASSET + M.SOURCES[mode]
        members[master_path] = master
        sources[mode] = {
            "origin": "OpenAI-generated artwork, original",
            "original_file_name": original_name,
            "original_sha256": M.digest(original),
            "image_generation_id": GEN_IDS[mode],
            "output_master_sha256": M.digest(master)
        }
        entries.append({"file": master_path, "mode": mode, "rarity": 0,
                        "bytes": len(master), "sha256": M.digest(master)})
        for r in (1, 2, 3):
            canvas = Image.new("RGBA", M.SHAPE, (0, 0, 0, 0))
            px, py = HOTSPOTS[mode][str(r)][0][:2]
            x, y = round(px * M.SHAPE[0]), round(py * M.SHAPE[1])
            ImageDraw.Draw(canvas).ellipse((x-25, y-25, x+25, y+25),
                                           fill=(45, 66, 87, 180))
            blob = webp(canvas)
            path = M.ASSET + f"photo-deltas/{mode}-{r}.webp"
            members[path] = blob
            entries.append({"file": path, "mode": mode, "rarity": r,
                            "bytes": len(blob), "sha256": M.digest(blob)})
    manifest = {"schema": 1, "resolution": list(M.SHAPE),
                "generated_sources": sources, "files": entries}
    members["generated-art-manifest.json"] = json.dumps(manifest).encode()
    with zipfile.ZipFile(location, "w") as archive:
        for path, data in members.items():
            archive.writestr(path, data)
    return manifest, members


class GeneratedObservationReleaseTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.archive = Path(self.directory.name) / "art.zip"
        self.meta, self.files = make_fixture(self.archive)

    def mutate(self, func):
        info = json.loads(json.dumps(self.meta))
        data = dict(self.files)
        func(info, data)
        data["generated-art-manifest.json"] = json.dumps(info).encode()
        with zipfile.ZipFile(self.archive, "w") as z:
            for file, b in data.items():
                z.writestr(file, b)

    def test_good_eight_assets_have_expected_dimensions_and_hotspots(self):
        info, blobs = M.read_and_validate(self.archive, HOTSPOTS)
        self.assertEqual(info["schema"], 1)
        self.assertEqual(set(blobs), set(M.FILE_NAMES))
        self.assertEqual(len(blobs), 8)

    def test_forged_master_hash_rejected(self):
        def bad(meta, data):
            meta["files"][0]["sha256"] = "0" * 64
        self.mutate(bad)
        with self.assertRaisesRegex(ValueError, "hash mismatch"):
            M.read_and_validate(self.archive, HOTSPOTS)

    def test_missing_alpha_and_moved_anomaly_rejected(self):
        path = M.ASSET + "photo-deltas/dash-2.webp"
        def opaque(meta, data):
            wrong = webp(Image.new("RGB", M.SHAPE, "red"))
            data[path] = wrong
            row = next(r for r in meta["files"] if r["file"] == path)
            row["bytes"], row["sha256"] = len(wrong), M.digest(wrong)
        self.mutate(opaque)
        with self.assertRaisesRegex(ValueError, "transparent"):
            M.read_and_validate(self.archive, HOTSPOTS)

    def test_incorrect_generation_provenance_rejected(self):
        self.mutate(lambda meta, data: meta["generated_sources"]["photo"].update(
            origin="CC0-1.0"))
        with self.assertRaisesRegex(ValueError, "provenance"):
            M.read_and_validate(self.archive, HOTSPOTS)

    def test_missing_target_or_original_rejected(self):
        self.mutate(lambda meta, data: data.pop("source-originals/" + M.SOURCE_MASTERS["photo"]))
        with self.assertRaises(KeyError):
            M.read_and_validate(self.archive, HOTSPOTS)

    def test_unsafe_zip_member_rejected(self):
        with zipfile.ZipFile(self.archive, "a") as z:
            z.writestr("../escape", "invalid")
        with self.assertRaisesRegex(ValueError, "Unsafe ZIP"):
            M.read_and_validate(self.archive, HOTSPOTS)

    def test_wrong_rarity_and_missing_mode_rejected(self):
        self.mutate(lambda meta, data: meta["files"][-1].update(rarity=9))
        with self.assertRaisesRegex(ValueError, "Wrong mode"):
            M.read_and_validate(self.archive, HOTSPOTS)


if __name__ == "__main__":
    unittest.main()
