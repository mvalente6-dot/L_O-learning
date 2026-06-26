# Play & Learn — Kids Learning Game

A single-file, offline HTML learning game for two young kids, built to scale with their ages.

## Run it

Open `Kids Learning Game - 2026-06-04.html` in any phone or desktop browser. No internet, install, or build step — it's fully self-contained. Tap **Start** once to enable the voice, then play.

## What it does

- **Two levels**, switched with the top toggle: **Owen** (younger, ~2.5) and **Lucas** (older, ~4.5).
  - On the home screen the toggle is a single tap; **inside a game it requires a press-and-hold** so a kid can't flip it mid-session by accident.
- **Categories:** Numbers, Colors, Shapes, Animals, Dinos (plus **Letters** and **Patterns**, which appear for Lucas only).
- Every prompt is **spoken aloud** (Web Speech API) — no reading required except single letters.
- **Real animal-sound recordings** play on the "who says this?" question and as a reward for a correct tap.
- Dinosaurs are hand-built inline SVG illustrations; feedback chimes are generated with the Web Audio API. No external asset files.
- **Conversation Sparks** — a low-key button at the bottom of the home screen opens a parent tool: one open-ended "spark" question at a time ("What superpower would you pick?"). Tap **🔊 Listen** to have it read aloud, **Next ➜** (or the card) to advance. One shuffled deck of 60, no scoring.

## Difficulty scaling

| Category | Owen (younger) | Lucas (older) |
|---|---|---|
| Numbers | recognize / count 1–5 | count to 10, addition (sums ≤10) |
| Colors | tap the named color | light vs. dark shades |
| Shapes | find the basic shape | which shape has N sides |
| Letters | — | letter find, phonics, upper/lowercase |
| Animals | find the animal | who says this? / farm animal |
| Dinos | find the dinosaur (3 choices) | find the dinosaur (4 choices) |
| Patterns | — | complete the repeating pattern |

## Credits

Animal sounds are sourced from Wikimedia Commons under CC0 / CC BY / CC BY-SA licenses. Per-sound attribution is in a comment block at the bottom of the HTML file.
