# Play & Learn — Kids Learning Game

A single-file, offline HTML learning game for two young kids, built to scale with their ages.

## Run it

Open `Kids Learning Game - 2026-06-04.html` in any phone or desktop browser. No internet, install, or build step — it's fully self-contained. Tap **Start** once to enable the voice, then play.

## What it does

- **Two levels**, switched with the top toggle: **Owen** (younger, ~2.5) and **Lucas** (older, ~4.5).
  - On the home screen the toggle is a single tap; **inside a game it requires a press-and-hold** so a kid can't flip it mid-session by accident.
- **Categories:** Numbers, Colors, Shapes, Animals, Dinos (plus **Letters** and **Patterns**, which appear for Lucas only).
- **School** (Lucas only, first tile): kindergarten screening practice. Letters big and little in a D'Nealian-style slanted print, letter sounds both ways, numbers 0 to 20, rhymes (pick the rhyme, and "do these rhyme?"), colors, and finger tracing of letters and numbers. Rounds rotate so every skill comes up before any repeats.
- Every prompt is **spoken aloud** (Web Speech API) — no reading required except single letters.
- **Recorded voice:** when served from GitHub Pages, prompts play as recordings of a Google Gemini voice from `audio/voice/` (one MP3 per line). Any line without a recording, or the file opened offline, falls back to the device voice. See *Recorded voice* below.
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
| School | — | screening practice: D'Nealian-style letters, sounds, numbers 0–20, rhymes, colors, tracing |

## Credits

Animal sounds are sourced from Wikimedia Commons under CC0 / CC BY / CC BY-SA licenses. Per-sound attribution is in a comment block at the bottom of the HTML file.

The School letters use **Edu QLD Beginner** by the AU School Handwriting Fonts Project Authors, embedded under the SIL Open Font License 1.1 (`docs/fonts/EduQLDBeginner-OFL.txt`). It is a slanted beginner print close to D'Nealian, not D'Nealian itself.

## Recorded voice

Every line the game says is listed in `voice/lines.json`, each with the clip name the game looks up (`voiceKey()` in the HTML). The GitHub Action **Record voice clips** (`.github/workflows/voice.yml`) records them with a Google Gemini text-to-speech voice and commits the MP3s plus `audio/voice/manifest.json`.

- **One-time setup:** create a key in Google AI Studio and add it to this repo as the Actions secret `GEMINI_API_KEY`.
- **Pick a voice:** run the action with `samples` (or set `voice/request.json` to `{ "mode": "samples" }` on a branch) to get `audio/voice-samples/`, then put the chosen name in `"voice"` in `voice/config.json`.
- **Record:** run it with `all`. Lines that already have a clip are skipped, so if Google's daily limit stops a run, the next run (the action also runs daily on `main`) finishes the rest. Until then those lines use the device voice.
- **Changed what the game says?** Run `node voice/lines.js`; the tests fail until you do. New lines get recorded on the next run.

