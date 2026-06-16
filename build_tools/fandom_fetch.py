#!/usr/bin/env python3
"""
Fetch clean official character renders for the Disney category from Fandom.

Requires network egress to:
  - disney.fandom.com            (MediaWiki API: discover the page lead image)
  - static.wikia.nocookie.net    (download the actual image file)

Strategy: use the Fandom MediaWiki API `pageimages` (piprop=original) which
returns the article's representative image (the clean official render). Falls
back to `prop=images` + imageinfo if needed. Saves originals to RAW for the
downscale/embed step (embed.py).
"""
import json, os, urllib.parse, urllib.request, io
from PIL import Image

UA = "KidsLearningGame/1.0 (educational offline game; mvalente6@gmail.com)"
RAW = "/tmp/disney/raw"
os.makedirs(RAW, exist_ok=True)

API = "https://disney.fandom.com/api.php"

# key -> (Fandom article title on disney.fandom.com).
# Titles chosen to land on the character's main page (official render in infobox).
CHARS = [
    ("mickey",  "Mickey Mouse"),
    ("minnie",  "Minnie Mouse"),
    ("donald",  "Donald Duck"),
    ("goofy",   "Goofy"),
    ("pluto",   "Pluto"),
    ("simba",   "Simba"),
    ("nala",    "Nala"),
    ("pumbaa",  "Pumbaa"),
    ("timon",   "Timon"),
    ("rafiki",  "Rafiki"),
    ("elsa",    "Elsa"),
    ("anna",    "Anna"),
    ("olaf",    "Olaf"),
    ("woody",   "Woody"),
    ("buzz",    "Buzz Lightyear"),
    ("jessie",  "Jessie"),
    ("mcqueen", "Lightning McQueen"),
    ("mater",   "Mater"),
    ("mike",    "Mike Wazowski"),
    ("sulley",  "James P. Sullivan"),
    ("nemo",    "Nemo"),
    ("dory",    "Dory"),
    ("stitch",  "Stitch"),
    ("walle",   "WALL-E"),
    ("moana",   "Moana (character)"),
]

def api(params):
    params = dict(params); params["format"] = "json"
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)

def page_image(title):
    """Return the URL of the article's representative (lead) image."""
    d = api({"action": "query", "titles": title, "redirects": "1",
             "prop": "pageimages", "piprop": "original|thumbnail",
             "pithumbsize": "600"})
    pages = d.get("query", {}).get("pages", {})
    for p in pages.values():
        orig = p.get("original", {}).get("source")
        if orig:
            return orig, p.get("title", title)
        thumb = p.get("thumbnail", {}).get("source")
        if thumb:
            return thumb, p.get("title", title)
    return None, title

def dl(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def main():
    report = {}
    for key, title in CHARS:
        try:
            url, resolved = page_image(title)
            if not url:
                print(f"{key}: NO IMAGE for '{title}'", flush=True)
                report[key] = None
                continue
            raw = dl(url)
            img = Image.open(io.BytesIO(raw))
            ext = (img.format or "PNG").lower()
            path = os.path.join(RAW, f"{key}.{ 'png' if ext=='png' else 'jpg' }")
            # keep originals; normalize to RGBA/RGB on embed step
            with open(path, "wb") as f:
                f.write(raw)
            print(f"{key}: OK  '{resolved}'  {img.size}  -> {path}", flush=True)
            report[key] = {"title": resolved, "url": url, "size": img.size}
        except Exception as e:
            print(f"{key}: ERROR {e}", flush=True)
            report[key] = {"error": str(e)}
    json.dump(report, open("/tmp/disney/fetch_report.json", "w"), indent=1)
    print("done")

if __name__ == "__main__":
    main()
