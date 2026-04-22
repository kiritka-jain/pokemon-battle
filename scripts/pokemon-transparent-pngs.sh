#!/usr/bin/env bash
# Optional: batch white -> transparent using ImageMagick (no Node).
# macOS: brew install imagemagick
#
# If `magick` is missing, use the Sharp-based pipeline instead:
#   cd pokepath && npm run pokemon:transparent
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/pokepath/public/pokemon"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick (magick) not found. Run: cd pokepath && npm run pokemon:transparent"
  exit 1
fi

FUZZ="${FUZZ:-12%}"
echo "Processing PNGs in $DIR (fuzz=$FUZZ)"
shopt -s nullglob
for f in "$DIR"/*.png; do
  base="$(basename "$f")"
  tmp="$(mktemp -t "pokemon-XXXXXX.png")"
  magick "$f" -alpha on -fuzz "$FUZZ" -transparent white "$tmp"
  mv "$tmp" "$f"
  echo "  $base"
done
echo "Done."
