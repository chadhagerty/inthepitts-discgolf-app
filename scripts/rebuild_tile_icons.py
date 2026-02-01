from PIL import Image, ImageDraw
import os

SRC_DIR = "public/tile-icons"
OUT_DIR = "public/tile-icons"

ALLOW = [
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
]

OUT_SIZE = 1024  # high-res output for clean downscaling on phones
RADIUS = int(OUT_SIZE * 0.46)  # circle radius
CENTER = OUT_SIZE // 2

def make_circle_mask(size):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((CENTER - RADIUS, CENTER - RADIUS, CENTER + RADIUS, CENTER + RADIUS), fill=255)
    return mask

def contain_fit(im, size):
    # Fit image inside square without cropping (keeps your exact artwork)
    im = im.convert("RGBA")
    w, h = im.size
    scale = min(size / w, size / h)
    nw, nh = int(w * scale), int(h * scale)
    return im.resize((nw, nh), Image.LANCZOS)

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    mask = make_circle_mask(OUT_SIZE)

    for fn in ALLOW:
        src = os.path.join(SRC_DIR, fn)
        if not os.path.exists(src):
            print("Missing:", src)
            continue

        im = Image.open(src).convert("RGBA")

        # Build a brand new clean canvas each time
        canvas = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))

        fitted = contain_fit(im, int(OUT_SIZE * 0.92))
        x = (OUT_SIZE - fitted.width) // 2
        y = (OUT_SIZE - fitted.height) // 2
        canvas.alpha_composite(fitted, (x, y))

        # HARD remove anything outside the circle
        out = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
        out.paste(canvas, (0, 0), mask)

        out_path = os.path.join(OUT_DIR, fn)
        out.save(out_path, optimize=True)
        print("Rebuilt:", out_path)

if __name__ == "__main__":
    main()
