# Photos and a recorded voice

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tapped emoji and the flat dinosaurs with real photos and lifelike dinosaurs, and play a recorded woman's voice for every spoken line.

**Architecture:** Picture and voice files sit beside the one game page. `speak()` plays a clip for the exact sentence and falls back to the phone voice. A service worker caches files after they load.

**Tech Stack:** The existing single HTML file, vanilla JS, edge-tts (`en-US-JennyNeural`), JPEG photos, MP3 clips.

## Global Constraints

- Keep the game playable from the HTML file with no build step at play time.
- Do not require a child to read, except the Letters category.
- Feeling faces, letters, shapes, home buttons, move cues, and patterns stay as they are.
- Animal-sound recordings stay.
- Missing voice clips fall back to the phone voice.
- Owen and Lucas difficulty behavior stays the same.

---

### Task 1: Media

- [ ] Record every spoken line with Jenny at a slightly slow rate into `assets/voice/`.
- [ ] Add plain-background photos in `assets/photos/` and lifelike dinosaurs in `assets/dinos/`.
- [ ] Keep each picture small enough for a phone.

### Task 2: Game page

- [ ] Point tapped pictures, counting piles, silly pairs, rhyme choices, letter pictures, scenes, and dinosaurs at those files.
- [ ] Play the matching clip from `speak()`, then the animal sound after the line ends.
- [ ] Cache loaded files with `sw.js` when the page is served over the web.

### Task 3: Check

- [ ] `node --test tests/game.test.js` passes.
- [ ] The browser smoke test passes on a phone size and a desktop size.
- [ ] An animal choice is a photo, a dinosaur choice is a lifelike picture, and the start sentence has a clip.
