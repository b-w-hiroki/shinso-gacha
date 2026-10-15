"""Tests use synthetic frames; no browser, photo overwrite, or fake QA success."""
import importlib.util
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

PATH = Path(__file__).resolve().parents[1] / "scripts" / "observation-visual-audit.py"
spec = importlib.util.spec_from_file_location("observation_visual_audit", PATH)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class ObservationVisualAuditTest(unittest.TestCase):
    def setUp(self):
        self.base = Image.new("RGBA", (200, 100), (35, 40, 46, 255))
        self.targets = [[.5, .5, .15, .25]]

    def test_identical_frame_not_certified_good(self):
        r = audit.visual_metrics(self.base, self.base, self.targets)
        self.assertEqual(r["changed_pixel_fraction"], 0)
        self.assertEqual(r["mean_absolute_rgb_difference"], 0)
        self.assertTrue(r["needs_human_quality_review"])
        self.assertIn("sparse-difference-under-2-percent", r["review_concerns"])
        self.assertEqual(r["difference_near_hotspots_fraction"], 0.0)

    def test_visible_change_near_hotspot_is_detected(self):
        changed = self.base.copy()
        ImageDraw.Draw(changed).rectangle((90, 40, 110, 60), fill=(120, 140, 154, 255))
        r = audit.visual_metrics(self.base, changed, self.targets)
        self.assertGreater(r["changed_pixel_fraction"], .02)
        self.assertGreater(r["difference_near_hotspots_fraction"], .95)

    def test_unrelated_global_change_not_called_targeted(self):
        changed = self.base.copy()
        ImageDraw.Draw(changed).rectangle((0, 0, 30, 20), fill=(220, 230, 240, 255))
        r = audit.visual_metrics(self.base, changed, self.targets)
        self.assertLess(r["difference_near_hotspots_fraction"], .1)
        self.assertIn("change-extends-beyond-hotspots", r["review_concerns"])

    def test_invalid_geometry_never_passes(self):
        with self.assertRaises(ValueError):
            audit.visual_metrics(self.base, self.base, [])
        with self.assertRaises(ValueError):
            audit.visual_metrics(self.base, Image.new("RGB", (300, 100)), self.targets)


if __name__ == "__main__":
    unittest.main()
