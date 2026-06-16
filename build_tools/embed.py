#!/usr/bin/env python3
"""
Local build step for the Disney category.

Bakes character images that YOU place in build_tools/images/ into a personal,
self-contained copy of the game that you then transfer to the phone. The repo
itself ships with no images: this script writes a separate, git-ignored file
("Kids Learning Game - personal.html") and never modifies the committed game.

Usage (from the repo root):
    python3 -m pip install Pillow          # one time, if needed
    # put images in build_tools/images/, named by character key, e.g. stitch.png
    python3 build_tools/embed.py

Filenames map to characters by their key (the part before the extension),
matching the keys in DISNEY_META inside the game file. Run with --list to print
the recognised keys. Only characters you provide an image for become playable;
the category needs at least 3 to appear on the home screen.
"""
import base64, glob, io, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
IMG_DIR = os.path.join(HERE, "images")
GAME = os.path.join(ROOT, "Kids Learning Game - 2026-06-04.html")
OUT = os.path.join(ROOT, "Kids Learning Game - personal.html")

MAXDIM = 260          # longest side after downscale
JPEG_Q = 82

# recognised character keys -> display name (mirrors DISNEY_META in the game)
ROSTER = [
    ("mickey", "Mickey Mouse"), ("minnie", "Minnie Mouse"),
    ("donald", "Donald Duck"), ("goofy", "Goofy"), ("pluto", "Pluto"),
    ("simba", "Simba"), ("nala", "Nala"), ("pumbaa", "Pumbaa"),
    ("timon", "Timon"), ("rafiki", "Rafiki"),
    ("elsa", "Elsa"), ("anna", "Anna"), ("olaf", "Olaf"),
    ("woody", "Woody"), ("buzz", "Buzz Lightyear"), ("jessie", "Jessie"),
    ("mcqueen", "Lightning McQueen"), ("mater", "Mater"),
    ("mike", "Mike Wazowski"), ("sulley", "Sulley"),
    ("nemo", "Nemo"), ("dory", "Dory"), ("stitch", "Stitch"),
    ("walle", "WALL-E"), ("moana", "Moana"),
]
KEYS = {k for k, _ in ROSTER}


def data_uri(path):
    """Downscale to MAXDIM, flatten onto white, return a JPEG data URI."""
    from PIL import Image
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
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def collect():
    """Return {key: data_uri} for image files found in IMG_DIR."""
    found, unknown = {}, []
    for path in sorted(glob.glob(os.path.join(IMG_DIR, "*"))):
        ext = os.path.splitext(path)[1].lower().lstrip(".")
        if ext not in ("png", "jpg", "jpeg", "webp", "gif"):
            continue
        key = os.path.splitext(os.path.basename(path))[0].lower()
        if key not in KEYS:
            unknown.append(os.path.basename(path))
            continue
        found[key] = data_uri(path)
        print(f"  embedded {key:8s} {len(found[key]) // 1024} KB", flush=True)
    return found, unknown


def inject(photos):
    with open(GAME, encoding="utf-8") as f:
        html = f.read()
    body = ",\n".join(f"  {k!r}: \"{uri}\"" for k, uri in sorted(photos.items()))
    block = ("/* === DISNEY_PHOTOS_START (build_tools/embed.py replaces this block) === */\n"
             "const DISNEY_PHOTOS = {\n" + body + ("\n" if body else "") + "};\n"
             "/* === DISNEY_PHOTOS_END === */")
    new, n = re.subn(
        r"/\* === DISNEY_PHOTOS_START.*?DISNEY_PHOTOS_END === \*/",
        lambda _m: block, html, count=1, flags=re.DOTALL)
    if n != 1:
        sys.exit("ERROR: DISNEY_PHOTOS markers not found in the game file.")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(new)


def main():
    if "--list" in sys.argv:
        print("Recognised image keys (name the file <key>.png / .jpg):")
        for k, name in ROSTER:
            print(f"  {k:8s} {name}")
        return
    os.makedirs(IMG_DIR, exist_ok=True)
    print(f"Reading images from {IMG_DIR}")
    photos, unknown = collect()
    if not photos:
        print("\nNo recognised images found. Add files named like 'stitch.png' "
              "(see --list) and re-run.")
        return
    inject(photos)
    size_mb = os.path.getsize(OUT) / 1e6
    print(f"\nWrote {OUT}  ({size_mb:.1f} MB, {len(photos)} characters embedded)")
    if unknown:
        print("Ignored (unrecognised key):", ", ".join(unknown), "— see --list")
    missing = [k for k in KEYS if k not in photos]
    if len(photos) < 3:
        print("NOTE: the Disney category needs >=3 characters to appear; add more images.")
    if missing:
        print(f"Not yet provided ({len(missing)}):", ", ".join(sorted(missing)))
    print("\nNext: copy the personal HTML to the phone (email / Drive / AirDrop) and open it.")


if __name__ == "__main__":
    main()
