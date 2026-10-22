"""Import the 12 generated WebP deltas from an isolated Actions artifact directory."""

import argparse
from pathlib import Path


EXPECTED = {f"{scene}-{rarity}.webp" for scene in ("cctv", "photo", "vision", "dash") for rarity in (1, 2, 3)}


def import_deltas(source: Path, target: Path) -> None:
    if not source.is_dir() or source.is_symlink():
        raise ValueError("artifact source must be an ordinary directory")
    entries = list(source.iterdir())
    actual = {entry.name for entry in entries}
    if actual != EXPECTED or len(entries) != len(EXPECTED):
        raise ValueError(f"unexpected artifact entries: {sorted(actual ^ EXPECTED)}")
    payloads = {}
    for entry in entries:
        if entry.is_symlink() or not entry.is_file() or entry.resolve().parent != source.resolve():
            raise ValueError(f"artifact entry is not a regular direct child: {entry.name}")
        data = entry.read_bytes()
        if (len(data) < 20 or len(data) > 20_000_000 or data[:4] != b"RIFF"
                or int.from_bytes(data[4:8], "little") != len(data) - 8
                or data[8:12] != b"WEBP" or data[12:16] not in (b"VP8 ", b"VP8L", b"VP8X")):
            raise ValueError(f"invalid WebP artifact: {entry.name}")
        payloads[entry.name] = data
    if target.is_symlink() or any(parent.is_symlink() for parent in target.parents):
        raise ValueError("target path must not cross a symlink")
    if target.exists() and not target.is_dir():
        raise ValueError("target path must be a directory")
    if any((target / name).is_symlink() for name in EXPECTED):
        raise ValueError("target image must not be a symlink")
    target.mkdir(parents=True, exist_ok=True)
    for name, data in payloads.items():
        (target / name).write_bytes(data)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    args = parser.parse_args()
    import_deltas(args.source, args.target)

