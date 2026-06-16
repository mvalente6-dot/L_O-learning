# Drop your character images here

Put image files for the Disney category in this folder, then run the build step
from the repo root:

```
python3 -m pip install Pillow      # one time, if needed
python3 build_tools/embed.py
```

Name each file by its character **key** (the part before the extension), e.g.
`stitch.png`, `mickey.jpg`, `nemo.png`. Run `python3 build_tools/embed.py --list`
to print every recognised key.

- Accepted formats: `.png .jpg .jpeg .webp .gif`
- Square-ish images with the character centered look best (they're shown in a
  rounded tile and downscaled to ~260px).
- You only need the characters you want; the category appears once at least 3
  have images. Add more any time and re-run.

The build writes `Kids Learning Game - personal.html` at the repo root — copy
that single file to the phone (email it to yourself, Google Drive / iCloud, or
AirDrop) and open it. It runs fully offline.

**Note:** image files placed here, and the personal HTML build, are git-ignored
on purpose — only use art you have the rights to, and keep it on your own
devices.
