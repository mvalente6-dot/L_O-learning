# Disney category — build notes (resume after session restart)

Goal: add a 🏰 **Disney** category to `Kids Learning Game - 2026-06-04.html`,
available in **both** Owen (simple) and Lucas (complex) sections — **not**
`lucasOnly`. Characters must be the **actual movie/show renders** (clean
official art), **not** park costume photos.

## Why the restart
Only `upload.wikimedia.org` + `commons.wikimedia.org` API were reachable, and
Commons only has free-licensed photos (costumes/statues — rejected). The
official renders live on Fandom. Network egress is fixed at container start, so
`disney.fandom.com` + `static.wikia.nocookie.net` were added to the allowlist
and the session restarted to pick them up.

## Pipeline (run in order from repo root)
```
mkdir -p /tmp/disney/raw
python3 -m pip install Pillow        # if not present
python3 build_tools/fandom_fetch.py  # fetch official renders -> /tmp/disney/raw
python3 build_tools/embed.py         # downscale ~200px -> /tmp/disney/disney_data.js + verify.png
```
Then **Read `/tmp/disney/verify.png`** to confirm every character is the right,
non-costume render. Fix any miss by editing the `CHARS` title in
`fandom_fetch.py` (e.g. add `(character)` disambiguation) and re-run.

## Roster (25) — note: prompt's double-commas after "Elsa,," and
## "Buzz Lightyear,," indicate two missing names; filled with **Anna** and
## **Jessie** (also balances the grouping rounds).
classic:    Mickey, Minnie, Donald, Goofy, Pluto
lionking:   Simba, Nala, Pumbaa, Timon, Rafiki
frozen:     Elsa(princess), Anna(princess), Olaf
toystory:   Woody, Buzz Lightyear, Jessie
cars:       Lightning McQueen, Mater
monsters:   Mike Wazowski, Sulley
nemo:       Nemo, Dory
stitch:     Stitch
walle:      WALL-E
moana:      Moana(princess)

## Gameplay (mirror the Animals category's level scaling)
- Owen (simple, 3 choices): name recognition — "Find Mickey Mouse."
- Lucas (4 choices): mix of name recognition + grouping rounds:
  "Who is from Frozen?", "Who is a Toy Story character?", "Who is from Cars?",
  "Who is from the Lion King?" — pick one correct from the group + distractors
  outside it. Guard: a group round needs >=1 in-group and enough out-group.

## HTML integration points (`Kids Learning Game - 2026-06-04.html`)
- Insert `const DISNEY = [...]` (from disney_data.js) near `const ANIMALS` (~L440).
- Add `photoTile(c)` render helper next to `emojiTile`/`dinoTile` (~L677-680):
  `function photoTile(c){ return '<img class="photo" src="'+c.photo+'" alt="">'; }`
- Add CSS for `.choice .photo` next to `.choice .emoji` (~L146):
  fit within tile, rounded, object-fit:contain.
- Add `disney:` entry to `CATS` (~L470) with `label:'Disney', icon:'🏰',
  color:'#d946ef'` (no lucasOnly), `build()` returning standard round shape.
- Update home subtitle (~L228) and README category list + difficulty table.

## Commit
Branch: `claude/disney-characters-page-pw1d97-0ppj6d`. Remove `build_tools/`
from the final deliverable commit (or keep — decide), then commit & push.
