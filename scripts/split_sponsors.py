from PIL import Image
import os

SRC = "public/sponsors/PREVIEW-grid.png"
OUT_DIR = "public/sponsors"

# 6 columns x 3 rows (matches the preview layout)
COLS = 6
ROWS = 3

names = [
  # Row 1
  "wicks_contracting",
  "mundell_plumbing",
  "kahlen_real_estate",
  "kingston_masonry_services",
  "lakins_painting_decorating",
  "kingston_billiards_games",
  # Row 2
  "mo_brothers_inc",
  "rep_windows_doors",
  "versus_forms_labels",
  "grekos_pizzeria",
  "oyyc",
  "nht_excavations",
  # Row 3
  "full_house_roofing",
  "in_the_pitts_disc_golf",
  "connie_mel_hagerty",
  "jayz_automotive_service",
  "in_the_pitts_helpers",
  "sponsor_spot_available",
]

def smart_trim(im, pad=10):
  # Trim big white margins safely (keeps internal whites)
  gray = im.convert("L")
  # Find non-white pixels (anything < 250)
  bbox = gray.point(lambda p: 255 if p < 250 else 0).getbbox()
  if not bbox:
    return im
  l, t, r, b = bbox
  l = max(0, l - pad); t = max(0, t - pad)
  r = min(im.width, r + pad); b = min(im.height, b + pad)
  return im.crop((l, t, r, b))

def main():
  if not os.path.exists(SRC):
    raise SystemExit(f"Can't find {SRC}. Make sure the file exists.")

  os.makedirs(OUT_DIR, exist_ok=True)

  img = Image.open(SRC).convert("RGBA")
  tile_w = img.width // COLS
  tile_h = img.height // ROWS

  if len(names) != COLS * ROWS:
    raise SystemExit("names list length must equal COLS*ROWS")

  i = 0
  for r in range(ROWS):
    for c in range(COLS):
      left = c * tile_w
      top = r * tile_h
      right = (c + 1) * tile_w
      bottom = (r + 1) * tile_h

      tile = img.crop((left, top, right, bottom))
      tile = smart_trim(tile, pad=12)

      out_path = os.path.join(OUT_DIR, f"{names[i]}.png")
      tile.save(out_path)
      print("Wrote", out_path)
      i += 1

if __name__ == "__main__":
  main()
