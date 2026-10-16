"""Game art candidates: independent RGBA evidence; no production assets changed."""
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
from unittest import mock
from PIL import Image

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "build-observation-photo-candidates.py"
spec = importlib.util.spec_from_file_location("asset_candidate_module", MODULE)
C = importlib.util.module_from_spec(spec)
spec.loader.exec_module(C)


class PhotoCandidateTest(unittest.TestCase):
    def test_six_sparse_alpha_layers_align_with_existing_hotspots(self):
        for mode in ("dash", "photo"):
            for rarity in (1, 2, 3):
                with self.subTest(mode=mode, rarity=rarity):
                    layer = C.anomalies(mode, rarity)
                    self.assertEqual(layer.size, (1440, 720))
                    self.assertEqual(layer.mode, "RGBA")
                    x, y = C.at(*C.TARGETS[mode][rarity - 1])
                    self.assertGreater(layer.getchannel("A").getpixel((x, y)), 3)
                    self.assertEqual(layer.getchannel("A").getpixel((0, 719)), 0)
                    out = C.encode(layer)
                    with Image.open(io.BytesIO(out)) as reopened:
                        self.assertEqual(reopened.size, C.SIZE)
                        self.assertIn("A", reopened.getbands())

    def test_rejects_unrecognized_states(self):
        with self.assertRaises(ValueError):
            C.anomalies("vision", 1)
        with self.assertRaises(ValueError):
            C.anomalies("dash", 0)
        with self.assertRaises(ValueError):
            C.anomalies("photo", 4)

    def test_classroom_seed_is_hash_pinned_and_works_without_network(self):
        with mock.patch("urllib.request.urlopen", side_effect=RuntimeError("No network allowed")):
            room, source = C.download_classroom()
        self.assertEqual(room.size, C.SIZE)
        self.assertEqual(source["license"], "CC0-1.0")
        self.assertTrue(source["no_network_fetch"])
        self.assertEqual(len(source["seed_sha256"]), 64)
        self.assertEqual(source["seed_sha256"], C.sha(
            (C.ROOT / source["seed_path"]).read_bytes()))

    def test_invalid_classroom_source_must_not_fall_back_to_network(self):
        with tempfile.TemporaryDirectory() as root:
            with mock.patch.object(C, "ROOT", Path(root)), \\
                 mock.patch("urllib.request.urlopen", side_effect=AssertionError("unexpected fetch")):
                with self.assertRaises(FileNotFoundError):
                    C.download_classroom()

    def test_legacy_road_crop_requires_plausible_stereo_source(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "legacy.webp"
            Image.new("RGB", (100, 100), "grey").save(path, format="WEBP")
            with self.assertRaises(ValueError):
                C.dash_from_legacy(path)


if __name__ == "__main__":
    unittest.main()
