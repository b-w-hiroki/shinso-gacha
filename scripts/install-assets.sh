#!/usr/bin/env bash
set -euo pipefail
# Run at the root of a local clone of b-w-hiroki/shinso-gacha.
ZIP="${1:-shinso_assets.zip}"
test -f "$ZIP" || { echo "ZIP not found: $ZIP" >&2; exit 1; }
unzip -oq "$ZIP" 'assets/*' -d .
for f in desk-background.webp envelope.png button-paper.png button-red.png button-locked.png classified-files.png surveillance-photo.png red-lamp.png film-canister.png cassette.png; do
  test -s "assets/$f" || { echo "Missing assets/$f" >&2; exit 1; }
done
git add assets/
echo "Assets installed and staged. Review changes, then commit and push."
