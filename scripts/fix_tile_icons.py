from PIL import Image, ImageChops
import os

SRC_DIR = "public/tile-icons"

# Only process the icons actually used on the home grid
ALLOW = {
    "checkin.png",
    "membership.png",
    "events.png",
    "chat.png",
    "stats.png",
    "leaderboard.png",
    "reviews.png",
    "sponsors.png",
    "youtube.png",
    "facebook.png",
    "dgv.png",
}

OUT_SIZE = 512        # output PNG size
PAD = 12              # outer padding
INNER = OUT_SIZE - PAD * 2

def has_alpha(img: Image.Image) -> bool:
    return img.mode in ("RGBA", "LA") or ("transparency" in img.info)

def ensure_rgba(img: Image.Image) -> Image.Image:
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    return img

def circle_alpha(size: int) -> Image.Image:
    # Create a clean circular alpha mask
    mask = Image.new("L", (size, size), 0)
    # Use a high-res mask for smoother edges, then downsample
    scale = 4
    big = Image.new("L", (size * scale, size * scale), 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(big)
    d.ellipse((0, 0, size * scale - 1, size * scale - 1), fill=255)
    big = big.resize((size, size), resample=Image.LANCZOS)
    return big

def crop_to_nontransparent(img: Image.Image) -> Image.Image:
    # Crop to non-transparent bbox if possible
    if not has_alpha(img):
        return img
    a = img.split()[-1]
    bbox = a.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

def process(path: str) -> None:
    img = Image.open(path)
    img = ensure_rgba(img)

    # If it already has transparency, crop down to the non-transparent area
    img = crop_to_nontransparent(img)

    # Fit into inner square while preserving aspect ratio
    img.thumbnail((INNER, INNER), resample=Image.LANCZOS)

    # Center on a square canvas
    canvas = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
    x = (OUT_SIZE - img.size[0]) // 2
    y = (OUT_SIZE - img.size[1]) // 2
    canvas.paste(img, (x, y), img)

    # Apply a hard circular alpha mask to the entire output
    mask = circle_alpha(OUT_SIZE)
    r, g, b, a = canvas.split()
    a = ImageChops.multiply(a, mask)
    out = Image.merge("RGBA", (r, g, b, a))

    out.save(path, "PNG", optimize=True)
    print("Fixed:", path)

def main():
    if not os.path.isdir(SRC_DIR):
        raise SystemExit(f"Missing folder: {SRC_DIR}")

    for fn in sorted(os.listdir(SRC_DIR)):
        if fn.lower().endswith(".png") and fn in ALLOW:
            process(os.path.join(SRC_DIR, fn))

if __name__ == "__main__":
    main()

