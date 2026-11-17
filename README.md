# Play & Learn — Kids Learning Game

A single-file, offline HTML learning game for two young kids, built to scale with their ages.

## Run it

On a phone or tablet, open:

**https://mvalente6-dot.github.io/L_O-learning/**

Tap **Start** once to turn the sound on, then play. The first open needs internet. After that, it keeps working if the connection drops.

On an iPhone, open that address in Safari. Tap the Share button, then **Add to Home Screen**. Leave **Open as Web App** turned on, and tap Add. The game then fills the screen. If an older icon still shows Safari’s buttons, delete that icon and add it again the same way.

To play it from a folder on a computer, open `index.html`. The pictures and the recorded voice sit in the `assets` folder next to that file.

## On an Amazon Fire tablet

Type the address once in Silk (the tablet’s browser). Then tap the menu (three dots) and choose **Add to Home Screen**, and name it Play & Learn. It then opens like an app.

For a child’s profile, the tablet will not open it until you allow the site:

1. On the child’s profile, tap the grown-up menu (the profile picture) and enter your PIN.
2. Open **Other Settings**, then **Manage Web Content**, then **Websites**.
3. Tap **+**, paste `https://mvalente6-dot.github.io/L_O-learning/`, and tap **Allow**.
4. Leave the browser on **Hand-Selected Websites** so only sites you allow are open.

The child then finds Play & Learn in the kids browser. The same allow covers the whole address, so you do not add the long name.

## What it does

- **Two levels**, switched with the top toggle: **Owen** (younger, ~2.5) and **Lucas** (older, ~4.5).
  - On the home screen the toggle is a single tap; **inside a game it requires a press-and-hold** so a kid can't flip it mid-session by accident.
- **Categories:** Numbers, Colors, Shapes, Animals, Dinos (plus **Letters**, **Patterns**, and **School**, which appear for Lucas only).
- **School** (Lucas only, first tile): kindergarten screening practice. Letters big and little in a slanted beginner print, letter sounds both ways, numbers 0 to 20, rhymes, colors, and finger tracing of letters and numbers.
- Every prompt is **spoken in a recorded woman's voice**. If a line is missing, the phone's own voice fills in. No reading required except single letters.
- **Real animal-sound recordings** play on the "who says this?" question and as a reward for a correct tap.
- The things kids tap are real photos. Dinosaurs are lifelike pictures. Feeling faces, letters, and shapes stay simple. Feedback chimes are generated with the Web Audio API.
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
| School | — | screening practice: slanted letters, sounds, numbers 0–20, rhymes, colors, tracing |

## Credits

Animal sounds are sourced from Wikimedia Commons under CC0 / CC BY / CC BY-SA licenses. Per-sound attribution is in a comment block at the bottom of the HTML file.

The School letters use **Edu QLD Beginner** by the AU School Handwriting Fonts Project Authors, embedded under the SIL Open Font License 1.1 (`docs/fonts/EduQLDBeginner-OFL.txt`). It is a slanted beginner print close to D'Nealian, not D'Nealian itself.
