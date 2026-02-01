from PIL import Image, ImageDraw
import os

SRC_DIR = "public/tile-icons"

FILES = [
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

OUT_SIZE = 1024  # crisp
def to_square_center(im: Image.Image) -> Image.Image:
    w, h = im.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    return im.crop((left, top, left + s, top + s))

def main():
    for fn in FILES:
        path = os.path.join(SRC_DIR, fn)
        if not os.path.exists(path):
            print("Missing:", path)
            continue

        im = Image.open(path).convert("RGBA")
        im = to_square_center(im)
        im = im.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)

        # Hard circular alpha baked into PNG (no bleed possible)
        mask = Image.new("L", (OUT_SIZE, OUT_SIZE), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, OUT_SIZE, OUT_SIZE), fill=255)

        out = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
        out.paste(im, (0, 0), mask)

        out.save(path, "PNG")
        print("Rebuilt:", path)

if __name__ == "__main__":
    main()
