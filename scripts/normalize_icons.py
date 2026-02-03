#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageChops

ICON_DIR = Path("public/tile-icons")
OUT_SIZE = 512

# How big the "visible content" should be inside the 512 canvas.
# 0.88 means the largest dimension of the trimmed content becomes ~451px.
TARGET_FILL = 0.88

# Alpha threshold: ignore faint shadow/halo when measuring size
ALPHA_THRESH = 25


def bbox_from_alpha(im: Image.Image):
    """Return bbox based on thresholded alpha (ignores faint halo)."""
    a = im.split()[-1]
    a = a.point(lambda v: 255 if v > ALPHA_THRESH else 0)
    return a.getbbox()


def normalize_one(path: Path):
    im = Image.open(path).convert("RGBA")

    bbox = bbox_from_alpha(im)
    if not bbox:
        raise RuntimeError("No alpha bbox found")

    cropped = im.crop(bbox)

    # Scale so the *largest* content dimension matches TARGET_FILL of canvas
    cw, ch = cropped.size
    target = int(OUT_SIZE * TARGET_FILL)
    scale = target / float(max(cw, ch))

    new_w = max(1, int(round(cw * scale)))
    new_h = max(1, int(round(ch * scale)))
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Center on square transparent canvas
    canvas = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
    canvas.paste(resized, ((OUT_SIZE - new_w) // 2, (OUT_SIZE - new_h) // 2), resized)

    # Save back
    canvas.save(path, "PNG")
    return (cw, ch), (new_w, new_h)


def main():
    pngs = sorted([p for p in ICON_DIR.glob("*.png") if p.is_file()])
    print(f"Normalizing {len(pngs)} PNG(s) in: {ICON_DIR}")

    backup_dir = ICON_DIR / "_backup_originals"
    backup_dir.mkdir(exist_ok=True)

    # First-run backups (don’t overwrite existing backups)
    for p in pngs:
        b = backup_dir / p.name
        if not b.exists():
            b.write_bytes(p.read_bytes())

    ok = 0
    for p in pngs:
        try:
            before, after = normalize_one(p)
            print(f"OK: {p.name:16} crop={before} -> scaled={after}")
            ok += 1
        except Exception as e:
            print(f"ERROR: {p.name}: {e}")

    print(f"Done. Normalized {ok}/{len(pngs)} file(s).")
    print(f"Backups stored in: {backup_dir}")


if __name__ == "__main__":
    main()
