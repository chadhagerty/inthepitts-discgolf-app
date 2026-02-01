from PIL import Image, ImageDraw
import os

SRC_DIR = "public/tile-icons"
OUT_SIZE = 512  # rebuild clean and consistent

ALLOW = {
    "checkin.png","membership.png","events.png","chat.png",
    "stats.png","leaderboard.png","reviews.png","sponsors.png",
    "youtube.png","facebook.png","dgv.png",
}

# icons were clipped from a WHITE background originally
MATTE = (255, 255, 255)

def center_crop_square(im):
    w, h = im.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    return im.crop((left, top, left + s, top + s))

def make_circle_alpha(size):
    alpha = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(alpha)
    d.ellipse((0, 0, size-1, size-1), fill=255)
    return alpha

def defringe_white(im_rgba):
    # removes white matte from semi-transparent edge pixels
    im = im_rgba.copy()
    px = im.load()
    w, h = im.size
    mr, mg, mb = MATTE

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if a < 255:
                af = a / 255.0
                r2 = int(round((r - mr*(1-af)) / af))
                g2 = int(round((g - mg*(1-af)) / af))
                b2 = int(round((b - mb*(1-af)) / af))
                px[x, y] = (max(0,min(255,r2)), max(0,min(255,g2)), max(0,min(255,b2)), a)
    return im

def process(path):
    im = Image.open(path).convert("RGBA")
    im = center_crop_square(im)
    im = im.resize((OUT_SIZE, OUT_SIZE), Image.Resampling.LANCZOS)

    im = defringe_white(im)              # 1) FIX EDGE PIXELS
    r, g, b, _a = im.split()
    circle = make_circle_alpha(OUT_SIZE) # 2) TRUE CIRCLE ALPHA
    out = Image.merge("RGBA", (r, g, b, circle))

    out.save(path, optimize=True)
    print("Fixed:", path)

def main():
    for fn in sorted(os.listdir(SRC_DIR)):
        if fn.lower() in ALLOW:
            process(os.path.join(SRC_DIR, fn))

if __name__ == "__main__":
    main()
