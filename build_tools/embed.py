#!/usr/bin/env python3
"""
Downscale fetched renders to ~200px and emit:
  - /tmp/disney/verify_*.png  montage sheets for visual QA
  - /tmp/disney/disney_data.js  the DISNEY[] array literal (base64 data URIs)

Each character keeps its movie/tag groups so the Lucas grouping rounds
("Who is from Frozen?", etc.) can pick correct vs distractor characters.
"""
import base64, glob, io, os
from PIL import Image, ImageDraw, ImageFont

RAW = "/tmp/disney/raw"
MAXDIM = 200          # longest side after downscale
JPEG_Q = 82

# key -> (display name, movie/tag groups). 'princess' is an extra tag.
META = [
    ("mickey",  "Mickey Mouse",      ["classic"]),
    ("minnie",  "Minnie Mouse",      ["classic"]),
    ("donald",  "Donald Duck",       ["classic"]),
    ("goofy",   "Goofy",             ["classic"]),
    ("pluto",   "Pluto",             ["classic"]),
    ("simba",   "Simba",             ["lionking"]),
    ("nala",    "Nala",              ["lionking"]),
    ("pumbaa",  "Pumbaa",            ["lionking"]),
    ("timon",   "Timon",             ["lionking"]),
    ("rafiki",  "Rafiki",            ["lionking"]),
    ("elsa",    "Elsa",              ["frozen", "princess"]),
    ("anna",    "Anna",              ["frozen", "princess"]),
    ("olaf",    "Olaf",              ["frozen"]),
    ("woody",   "Woody",             ["toystory"]),
    ("buzz",    "Buzz Lightyear",    ["toystory"]),
    ("jessie",  "Jessie",            ["toystory"]),
    ("mcqueen", "Lightning McQueen", ["cars"]),
    ("mater",   "Mater",             ["cars"]),
    ("mike",    "Mike Wazowski",     ["monsters"]),
    ("sulley",  "Sulley",            ["monsters"]),
    ("nemo",    "Nemo",              ["nemo"]),
    ("dory",    "Dory",              ["nemo"]),
    ("stitch",  "Stitch",            ["stitch"]),
    ("walle",   "WALL-E",            ["walle"]),
    ("moana",   "Moana",             ["moana", "princess"]),
]

def find_raw(key):
    for ext in ("png", "jpg", "jpeg", "webp", "gif"):
        p = os.path.join(RAW, f"{key}.{ext}")
        if os.path.exists(p):
            return p
    hits = glob.glob(os.path.join(RAW, f"{key}.*"))
    return hits[0] if hits else None

def downscaled(path):
    """Return (PIL RGB image on white, data_uri jpeg) downscaled to MAXDIM."""
    img = Image.open(path)
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")
    img.thumbnail((MAXDIM, MAXDIM), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=JPEG_Q, optimize=True)
    uri = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    return img, uri

def main():
    entries, thumbs = [], []
    missing = []
    for key, name, groups in META:
        path = find_raw(key)
        if not path:
            missing.append(key)
            print(f"{key}: MISSING raw image", flush=True)
            continue
        img, uri = downscaled(path)
        thumbs.append((key, name, img))
        g = "[" + ",".join(f"'{x}'" for x in groups) + "]"
        entries.append(f"  {{name:'{name}', groups:{g}, photo:'{uri}'}}")
        print(f"{key}: {img.size}  {len(uri)//1024}KB", flush=True)

    js = "const DISNEY = [\n" + ",\n".join(entries) + "\n];\n"
    open("/tmp/disney/disney_data.js", "w").write(js)
    print(f"\nwrote disney_data.js  ({len(js)//1024}KB, {len(entries)} chars)")
    if missing:
        print("MISSING:", missing)

    # verification montage: 5 per row, labeled
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except Exception:
        font = ImageFont.load_default()
    CELL, PAD, COLS = MAXDIM, 16, 5
    rows = (len(thumbs) + COLS - 1) // COLS
    W = PAD + COLS * (CELL + PAD)
    H = PAD + rows * (CELL + 26 + PAD)
    sheet = Image.new("RGB", (W, H), (235, 235, 235))
    d = ImageDraw.Draw(sheet)
    for i, (key, name, img) in enumerate(thumbs):
        r, c = divmod(i, COLS)
        x = PAD + c * (CELL + PAD)
        y = PAD + r * (CELL + 26 + PAD)
        ox = x + (CELL - img.width) // 2
        sheet.paste(img, (ox, y))
        d.text((x, y + CELL + 4), name, fill=(0, 0, 0), font=font)
    sheet.save("/tmp/disney/verify.png")
    print("wrote verify.png", W, H)

if __name__ == "__main__":
    main()
