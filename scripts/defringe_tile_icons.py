
from PIL import Image, ImageDraw
import os

SRC_DIR = "public/tile-icons"
OUT_SIZE = 512

ALLOW = {
    "checkin.png","membership.png","events.png","chat.png",
    "stats.png","leaderboard.png","reviews.png","sponsors.png",
    "youtube.png","facebook.png","dgv.png",
}

MATTE = (0, 0, 0)  # <-- BLACK MATTE (this is the key)

def center_crop_square(im):
    w, h = im.size
    s = min(w, h)
    return im.crop(((w-s)//2, (h-s)//2, (w+s)//2, (h+s)//2))

def circle_alpha(size):
    a = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(a)
    d.ellipse((0, 0, size-1, size-1), fill=255)
    return a

def defringe_black(im):
    px = im.load()
    w, h = im.size
    mr, mg, mb = MATTE

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if 0 < a < 255:
                af = a / 255.0
                r = int((r - mr*(1-af)) / af)
                g = int((g - mg*(1-af)) / af)
                b = int((b - mb*(1-af)) / af)
                px[x, y] = (max(0,min(255,r)), max(0,min(255,g)), max(0,min(255,b)), a)
    return im

def process(path):
    im = Image.open(path).convert("RGBA")
    im = center_crop_square(im)
    im = im.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)

    im = defringe_black(im)           # REMOVE BLACK MATTE
    r,g,b,_ = im.split()
    im = Image.merge("RGBA", (r,g,b,circle_alpha(OUT_SIZE)))

    im.save(path, optimize=True)
    print("Fixed:", path)

def main():
    for fn in sorted(os.listdir(SRC_DIR)):
        if fn.lower() in ALLOW:
            process(os.path.join(SRC_DIR, fn))

if __name__ == "__main__":
    main()
