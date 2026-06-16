# Disney category — build notes

The 🏰 **Disney** category is wired into `Kids Learning Game - 2026-06-04.html`
and is available in **both** the Owen (simple) and Lucas (complex) sections.

The committed game ships with **no character images**, so the category stays
hidden until you build a personal copy with your own art. This keeps the
repository free of third-party images; only code lives here.

## How it works

- `DISNEY_META` in the game file is the roster: each character's key, display
  name, and movie group(s).
- `DISNEY_PHOTOS` is an (empty) map of `key -> image data URI`. The build step
  fills it in a personal copy of the HTML.
- `const DISNEY` keeps only characters whose photo is present, so partial sets
  work. The category appears on the home screen once `DISNEY.length >= 3`.

## Build a phone-ready copy

```
python3 -m pip install Pillow        # one time, if needed
# put images in build_tools/images/, named by character key (e.g. stitch.png)
python3 build_tools/embed.py --list  # show recognised keys
python3 build_tools/embed.py         # writes "Kids Learning Game - personal.html"
```

Then copy `Kids Learning Game - personal.html` to the phone (email it to
yourself, Google Drive / iCloud, or AirDrop) and open it. It is fully
self-contained and runs offline — the PC is only needed to produce the file.

`build_tools/images/` and the personal HTML are git-ignored on purpose. Use
only images you have the rights to; they stay on your own devices.

## Gameplay (mirrors the Animals category's level scaling)

- **Owen** (simple, 3 choices): name recognition — "Find Mickey Mouse."
- **Lucas** (4 choices): name recognition plus grouping rounds — "Who is from
  Frozen?", "Who is from Toy Story?", "Who is from Cars?", "Who is from the Lion
  King?", "Who is from Monsters, Inc.?", "Who is from Finding Nemo?" — one
  correct in-group character against out-group distractors. A grouping round is
  only offered when enough embedded characters exist to build it.

## Roster keys

classic:   mickey, minnie, donald, goofy, pluto
lionking:  simba, nala, pumbaa, timon, rafiki
frozen:    elsa, anna, olaf
toystory:  woody, buzz, jessie
cars:      mcqueen, mater
monsters:  mike, sulley
nemo:      nemo, dory
stitch:    stitch
walle:     walle
moana:     moana
