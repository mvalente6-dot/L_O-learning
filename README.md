# Play & Learn — Kids Learning Game

A single-file, offline HTML learning game for two young kids, built to scale with their ages.

## Run it

Open `Kids Learning Game - 2026-06-04.html` in any phone or desktop browser. No internet, install, or build step — it's fully self-contained. Tap **Start** once to enable the voice, then play.

## What it does

- **Two levels**, switched with the top toggle: **Owen** (younger, ~2.5) and **Lucas** (older, ~4.5).
  - On the home screen the toggle is a single tap; **inside a game it requires a press-and-hold** so a kid can't flip it mid-session by accident.
- **Categories:** Numbers, Colors, Shapes, Animals, Dinos (plus **Letters** and **Patterns**, which appear for Lucas only). An optional **Disney** category can be enabled with your own images — see below.
- Every prompt is **spoken aloud** (Web Speech API) — no reading required except single letters.
- **Real animal-sound recordings** play on the "who says this?" question and as a reward for a correct tap.
- Dinosaurs are hand-built inline SVG illustrations; feedback chimes are generated with the Web Audio API. No external asset files.

## Difficulty scaling

| Category | Owen (younger) | Lucas (older) |
|---|---|---|
| Numbers | recognize / count 1–5 | count to 10, addition (sums ≤10) |
| Colors | tap the named color | light vs. dark shades |
| Shapes | find the basic shape | which shape has N sides |
| Letters | — | letter find, phonics, upper/lowercase |
| Animals | find the animal | who says this? / farm animal |
| Dinos | find the dinosaur (3 choices) | find the dinosaur (4 choices) |
| Disney* | find the character (3 choices) | find the character / "who is from <movie>?" (4 choices) |
| Patterns | — | complete the repeating pattern |

\* Optional — appears only after you add your own images (see below).

## Optional: Disney category

The game ships with **no Disney images**, so the category is hidden by default.
To enable it, supply your own character images and build a personal copy:

```
python3 -m pip install Pillow        # one time, if needed
# drop images in build_tools/images/, named by character key (e.g. stitch.png)
python3 build_tools/embed.py --list  # list recognised keys
python3 build_tools/embed.py         # writes "Kids Learning Game - personal.html"
```

Copy `Kids Learning Game - personal.html` to the phone (email / Drive / AirDrop)
and open it — it stays fully offline. Your images and the personal build are
git-ignored; only use art you have the rights to. Details in
`build_tools/NOTES.md`.

## Credits

Animal sounds are sourced from Wikimedia Commons under CC0 / CC BY / CC BY-SA licenses. Per-sound attribution is in a comment block at the bottom of the HTML file.
