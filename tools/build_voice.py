#!/usr/bin/env python3
"""Record every line the game can say. Writes assets/voice/*.mp3 and voice-clips.js."""
import asyncio
import hashlib
import pathlib
import sys

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "voice"
VOICE = "en-US-JennyNeural"
RATE = "-8%"

COUNT = {
    "apple": ("apple", "apples"),
    "banana": ("banana", "bananas"),
    "star": ("star", "stars"),
    "fish": ("fish", "fish"),
    "flower": ("flower", "flowers"),
    "car": ("car", "cars"),
    "balloon": ("balloon", "balloons"),
    "bee": ("bee", "bees"),
    "strawberry": ("strawberry", "strawberries"),
    "butterfly": ("butterfly", "butterflies"),
}
NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
ANIMALS = ["dog", "cat", "cow", "pig", "frog", "lion", "duck", "horse", "sheep", "monkey", "elephant", "bear"]
COLORS = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "white"]
LETTERS = [chr(c) for c in range(ord("A"), ord("Z") + 1)]
PICTURES = [
    ("A", "apple"), ("B", "ball"), ("C", "cat"), ("D", "dog"), ("E", "egg"),
    ("F", "fish"), ("G", "goat"), ("H", "hat"), ("J", "juice"), ("K", "kite"),
    ("L", "lion"), ("M", "moon"), ("N", "nose"), ("O", "octopus"), ("P", "pig"),
    ("R", "rabbit"), ("S", "sun"), ("T", "turtle"), ("U", "umbrella"), ("V", "violin"),
    ("W", "whale"), ("Y", "yo-yo"), ("Z", "zebra"),
]
RHYMES = ["cat", "dog", "bee", "cake", "star", "box", "sock", "mouse"]
DINO_CLUE = [
    "the one with a long neck",
    "the one with tiny arms",
    "the one with plates on its back",
    "the one with three horns",
    "the one with wings",
]
DINO_NAME = ["Brachiosaurus", "T Rex", "Stegosaurus", "Triceratops", "Pterodactyl", "Raptor"]
DINO_SAY = [
    "Brack ee oh sore us", "tee rex", "steg oh sore us",
    "try sair uh tops", "ter oh dack till", "rapter",
]
MUSEUM = [
    ("Look at the long neck.", "Brack ee oh sore us", "It ate plants."),
    ("Look at the tiny arms.", "tee rex", "It ate meat."),
    ("Look at the plates on its back.", "steg oh sore us", "It ate plants."),
    ("Look at the three horns.", "try sair uh tops", "It ate plants."),
    ("Look at the wings.", "ter oh dack till", "It could fly."),
    ("Look at the sharp claws.", "rapter", "It ate meat."),
]
MOVES = [
    "Reach up high.", "Touch your toes.", "Jump. Jump.", "Spin around.",
    "March. March. March.", "Wiggle your body.", "Stomp your feet.", "Tiptoe. Shh.",
    "Flap like a bird.", "Clap three times.", "Clap five times.", "Stand on one foot.",
    "All done. Your body did it.",
]
SILLY = [
    "A fish in a tree.", "A cow up in the clouds.", "An elephant in a tiny tub.",
    "A dog driving a car.", "A pig on a bike.", "A lion in a bed.",
    "A dinosaur eating ice cream.", "A frog in a fancy hat.",
]
STORIES = [
    ("You got a big hug. How do you feel?", "Who hugged you?"),
    ("Your balloon flew away. How do you feel?", "What could we do next?"),
    ("Someone knocked your blocks down. How do you feel?", "What helps when you feel mad?"),
    ("A door slammed loud. How do you feel?", "You are safe. What helps you feel safe?"),
    ("You zipped your coat all by yourself. How do you feel?", "What else can you do all by yourself?"),
    ("A puppy was behind the door. How do you feel?", "What did you think it was?"),
]
FEEL = ["happy", "sad", "mad", "scared", "proud", "surprised"]
PLACES = [
    "Ball in the box.", "Ball on the box.", "Ball under the box.",
    "Apple in the bowl.", "Cat on the bed.", "Duck under the hat.",
]
TURNS = [
    "Owen's turn. Find the dog.",
    "Lucas's turn. Find the elephant.",
    "Owen's turn. Find the sheep.",
    "Lucas's turn. How many fish?",
    "Owen's turn. How many stars?",
    "Lucas's turn. Find L.",
    "Owen's turn. Find O.",
    "Lucas's turn. Three cookies. Eat one. How many are left?",
    "All done.",
]
SPARKS = [
    "What superpower would you pick, and what would you do with it?",
    "If you could fly, where would you go first?",
    "If you could turn invisible for one day, what would you do?",
    "If you had a magic wand, what would you make appear?",
    "What would you name a pet dragon?",
    "If you could be any size, would you be tiny or giant? Why?",
    "If you could talk to one animal, which one would it be?",
    "What would your superhero costume look like?",
    "If your toys came to life at night, what would they do?",
    "If you could build any kind of robot, what would it help you with?",
    "What's the best food in the whole world?",
    "What color makes you happy?",
    "What's your favorite song to dance to?",
    "What's the best animal at the zoo?",
    "What's your favorite thing to do outside?",
    "If we could have any ice cream flavor, what would you pick?",
    "What's the best part of going to the park?",
    "What's your favorite book or story?",
    "What's the coziest place in our house?",
    "What's your favorite kind of weather?",
    "If animals could talk, which one would be the funniest?",
    "What's the silliest sound you can make?",
    "If you could put sprinkles on anything, what would it be?",
    "What would happen if it rained jelly beans?",
    "If a giraffe wore a hat, where would it put it?",
    "What's the funniest word you know?",
    "If your shoes could talk, what would they say?",
    "What would a dinosaur eat for breakfast?",
    "If you had a tail, what would you do with it?",
    "What's the wackiest thing you could put on a pizza?",
    "What makes you feel cozy and safe?",
    "How can we make someone smile today?",
    "What's something that makes you laugh really hard?",
    "Who is someone you love, and why?",
    "What do you do when you feel sad?",
    "What's a kind thing someone did for you?",
    "How can we be a good friend to someone?",
    "What makes you feel proud of yourself?",
    "What's something that makes you feel brave?",
    "What's a way we can help each other at home?",
    "If you had a magic boat, where would it take us?",
    "What do you want to be when you grow up?",
    "If you could build a treehouse, what would be inside?",
    "If you found a treasure chest, what would be in it?",
    "If you could visit the moon, what would you bring?",
    "What kind of adventure would you like to go on?",
    "If you had your own spaceship, where would you fly?",
    "If you could make up a brand new holiday, what would it be?",
    "If you could live anywhere, where would you live?",
    "What would your dream playground look like?",
    "What was the best part of today?",
    "What's something fun we could do together this weekend?",
    "What made you smile today?",
    "What's something new you learned recently?",
    "What's your favorite thing about our family?",
    "What game should we play together next?",
    "What's something you'd like to try for the first time?",
    "If we made dinner together, what would we cook?",
    "What's a place you'd love for us to visit?",
    "What was the funniest thing that happened today?",
]
NIGHT = [
    "Who gets a goodnight hug?",
    "What was a gentle part of today?",
    "Which toy should sleep beside you?",
    "What do you want to dream about?",
    "What soft sound do you hear?",
    "Who made you smile today?",
    "What should we thank the day for?",
    "Are you cozy?",
]


def cap(word):
    return word[:1].upper() + word[1:]


def lines():
    out = []
    add = out.append
    add("Lets play and learn!")
    add("Find the red circle. Great job!")
    add("Which has more?")
    add("Which has less?")
    add("Tap same if they match.")
    add("What comes next?")
    add("Which one is silly?")
    add("Look at them.")
    add("Which one does not belong?")
    add("Who says this?")
    add("Which one is a farm animal?")
    add("Which one lives in the wild?")
    add("Which letter is in your name?")
    add("O. W. E. N. Owen.")
    add("L. U. C. A. S. Lucas.")
    add("All done.")
    for name, pair in COUNT.items():
        add(f"Count the {pair[1]}. How many are there?")
        add(f"How many {pair[1]}?")
        for start in range(1, 6):
            word = pair[0] if start == 1 else pair[1]
            for eat in range(1, start + 1):
                add(f"{cap(NUM[start])} {word}. Eat {NUM[eat]}. How many are left?")
    for n in range(1, 6):
        add(f"Find the number {n}.")
    for a in range(1, 6):
        for b in range(1, 6):
            add(f"What is {a} plus {b}?")
    for k in (2, 3):
        add(f"Same. They both have {NUM[k]}.")
    for color in COLORS:
        add(f"Tap the {color} one.")
    for which in ("pale", "dark"):
        for color in ("blue", "green", "purple"):
            add(f"Tap the {which} {color} one.")
    for shape in ("circle", "square", "triangle", "star", "heart"):
        add(f"Find the {shape}.")
    for sides in (3, 4, 5):
        add(f"Which shape has {sides} sides?")
    for letter in LETTERS:
        add(f"Find the letter {letter}.")
        add(f"This is big {letter}. Find the little {letter}.")
        add(f"Find {letter}.")
        add(f"Tap {letter}.")
    for letter, word in PICTURES:
        add(f"Which letter says {letter}, {word}?")
    for name in ANIMALS:
        add(f"Find the {name}.")
        add(f"The {name} left.")
    for clue in DINO_CLUE:
        add(f"Find {clue}.")
    for name in DINO_NAME:
        add(f"Find the {name}.")
    for said in DINO_SAY:
        add(said)
    for look, said, fact in MUSEUM:
        add(f"{look} This is {said}. {fact}")
    for line in MOVES + SILLY + PLACES + TURNS + SPARKS + NIGHT:
        add(line)
    for say, follow in STORIES:
        add(say)
        add(follow)
    for face in FEEL:
        add(f"Tap the {face} face.")
    for word in RHYMES:
        add(f"Which one rhymes with {word}?")
    # unique, stable order
    seen = set()
    unique = []
    for line in out:
        if line not in seen:
            seen.add(line)
            unique.append(line)
    return unique


def clip_name(text):
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16] + ".mp3"


async def record(items):
    OUT.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(6)

    async def one(text):
        path = OUT / clip_name(text)
        if path.exists() and path.stat().st_size > 400:
            return
        async with sem:
            for attempt in range(4):
                try:
                    comm = edge_tts.Communicate(text, VOICE, rate=RATE)
                    await comm.save(str(path))
                    if path.stat().st_size > 400:
                        return
                except Exception as exc:
                    print("retry", attempt, text[:40], exc, file=sys.stderr)
                    await asyncio.sleep(1.5 * (attempt + 1))
            raise SystemExit("failed: " + text)

    await asyncio.gather(*(one(text) for text in items))


def write_js(items):
    body = [f"{js_string(text)}:{js_string('assets/voice/' + clip_name(text))}" for text in items]
    js = "const VOICE_CLIPS = {\n" + ",\n".join(body) + "\n};\n"
    (ROOT / "tools" / "voice-clips.js").write_text(js, encoding="utf-8")
    print(f"{len(items)} lines")


def js_string(text):
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    items = lines()
    if "--list" in sys.argv:
        print("\n".join(items))
        print(f"\n{len(items)} lines", file=sys.stderr)
        return
    asyncio.run(record(items))
    write_js(items)


if __name__ == "__main__":
    main()
