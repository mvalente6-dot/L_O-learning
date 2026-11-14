# Photos and a recorded voice

## Goal

The kids tap real photos, the dinosaurs look lifelike, and the game speaks with one recorded woman's voice instead of the phone's built-in voice.

## Pictures

- Real photos on a plain background for animals, counting things, letter pictures, rhyme pictures, silly pairs, and the objects in the in/on/under scenes.
- The six dinosaurs are lifelike, full body, calm, mouth closed, on a plain background: Brachiosaurus, T-Rex, Stegosaurus, Triceratops, Pterodactyl, Raptor.
- Feeling faces stay the simple drawings. Letters stay letters. Shapes stay simple colored shapes. Home buttons, move cues, patterns, and the check mark stay as they are.
- Picture files live in `assets/photos/` and `assets/dinos/`. The game page loads each one when a round needs it.

## Voice

- Every line the game can say, including parent conversation questions and the goodnight questions, is a whole recorded sentence.
- One voice: `en-US-JennyNeural`, a warm woman's voice, a little slower than normal.
- Clips live in `assets/voice/`. `speak()` plays the clip when that exact sentence has one.
- If a clip is missing or will not play, the phone's own voice says the line.
- Real animal-sound recordings stay as they are. They start after the spoken line finishes.
- The first Start tap still unlocks sound.

## Offline

- The page, pictures, and voice files sit next to each other.
- Opening the file from a folder works with no internet.
- On the published site, a small service worker stores each file after the first time it loads, so a later visit still works if the connection drops.

## Checks

- Existing game tests still pass.
- A phone-sized and a desktop pass through the start button, a round, a wrong tap, a right tap, and a parent Listen button, with no console errors.
- An animal round shows a photo. A dinosaur round shows a lifelike picture. The start line has a recording.
