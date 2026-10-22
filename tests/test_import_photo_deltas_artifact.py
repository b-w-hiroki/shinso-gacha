import importlib.util
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("photo_delta_import", ROOT / "scripts/import-photo-deltas-artifact.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
CHUNK = b"VP8 " + (2).to_bytes(4, "little") + b"\x00\x00"
WEBP = b"RIFF" + (4 + len(CHUNK)).to_bytes(4, "little") + b"WEBP" + CHUNK


class ArtifactBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / "artifact"
        self.target = self.root / "checkout" / "assets" / "observation" / "photo-deltas"
        self.source.mkdir()
        for name in MODULE.EXPECTED:
            (self.source / name).write_bytes(WEBP)

    def test_imports_only_expected_webp_files(self):
        MODULE.import_deltas(self.source, self.target)
        self.assertEqual({p.name for p in self.target.iterdir()}, MODULE.EXPECTED)

    def test_rejects_unexpected_file_before_writing(self):
        (self.source / "workflow.yml").write_text("untrusted")
        with self.assertRaises(ValueError):
            MODULE.import_deltas(self.source, self.target)
        self.assertFalse(self.target.exists())

    def test_rejects_nested_path_before_writing(self):
        (self.source / ".git").mkdir()
        with self.assertRaises(ValueError):
            MODULE.import_deltas(self.source, self.target)
        self.assertFalse(self.target.exists())

    def test_rejects_invalid_image_before_writing(self):
        (self.source / "cctv-1.webp").write_bytes(b"not a WebP")
        with self.assertRaises(ValueError):
            MODULE.import_deltas(self.source, self.target)
        self.assertFalse(self.target.exists())

    def test_rejects_symlink_before_writing(self):
        original = self.source / "cctv-1.webp"
        original.unlink()
        try:
            original.symlink_to(self.source / "cctv-2.webp")
        except OSError:
            self.skipTest("symlinks unavailable")
        with self.assertRaises(ValueError):
            MODULE.import_deltas(self.source, self.target)
        self.assertFalse(self.target.exists())

    def test_rejects_symlinked_target_image(self):
        self.target.mkdir(parents=True)
        image = self.target / "cctv-1.webp"
        try:
            image.symlink_to(self.root / "outside.webp")
        except OSError:
            self.skipTest("symlinks unavailable")
        with self.assertRaises(ValueError):
            MODULE.import_deltas(self.source, self.target)
        self.assertFalse((self.root / "outside.webp").exists())


if __name__ == "__main__":
    unittest.main()

