from PIL import Image, ImageFilter, ImageChops
import os

SRC_DIR = "public/tile-icons"
OUT_SIZE = 512  # big, clean, then browsers downscale
PAD = 0         # keep artwork as-is (we'll center-crop square)

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

def center_crop_square(im: Image.Image) -> Image.Image:
    w, h = im.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    return im.crop((left, top, left + s, top + s))

def make_antialiased_circle_mask(size: int) -> Image.Image:
    # Draw at 4x and downsample for clean anti-aliased edge
    big = size * 4
    mask_big = Image.new("L", (big, big), 0)
    # circle: white inside
    from PIL import ImageDraw
    d = ImageDraw.Draw(mask_big)
    d.ellipse((0, 0, big - 1, big - 1), fill=255)
    mask = mask_big.resize((size, size), Image.Resampling.LANCZOS)

    # Slightly shrink + blur edge to kill fringe pixels
    mask = mask.filter(ImageFilter.GaussianBlur(radius=0.8))
    return mask

def premultiply_alpha(im: Image.Image) -> Image.Image:
    # Removes white/dirty halos by premultiplying RGB by alpha
    r, g, b, a = im.split()
    r = ImageChops.multiply(r, a)
    g = ImageChops.multiply(g, a)
    b = ImageChops.multiply(b, a)
    return Image.merge("RGBA", (r, g, b, a))

def process(path: str):
    im = Image.open(path).convert("RGBA")

    im = center_crop_square(im)

    # upscale/downscale to a consistent clean size
    im = im.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)

    # apply circle mask (true transparency outside circle)
    mask = make_antialiased_circle_mask(OUT_SIZE)
    r, g, b, _a = im.split()
    im = Image.merge("RGBA", (r, g, b, mask))

    # premultiply to remove edge halos
    im = premultiply_alpha(im)

    im.save(path, optimize=True)
    print(f"Rebuilt: {path}")

def main():
    for fn in sorted(os.listdir(SRC_DIR)):
        if fn.lower() in ALLOW:
            process(os.path.join(SRC_DIR, fn))

if __name__ == "__main__":
    main()
