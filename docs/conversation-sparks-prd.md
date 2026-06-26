# PRD — "Conversation Sparks" Tab

## 1. Summary
A new, lightweight mode inside the existing Play & Learn app that shows **one
read-aloud conversation-starter question at a time** ("What superpower would you
pick?"). The parent taps to hear the phone speak the question; the question stays
on screen until the parent taps to advance to the next one. Entry is deliberately
**low-prominence** — a small button tucked at the bottom of the home screen,
visually subordinate to the game tiles — so it's a parent tool, not a kid-facing
game module.

## 2. Goals
- Give the parent a one-tap way to pull up a spoken conversation spark at dinner,
  in the car, at bedtime.
- One question, full-screen, no clutter, no scoring, no "right answer."
- Phone reads each question aloud on demand, with an easy replay.
- Advancing is a single deliberate tap by the parent.
- Reuse the app's existing voice, styling, and offline single-file architecture —
  no new dependencies.

## 3. Non-Goals
- Not a game: **no stars, no win/lose, no choices, no difficulty scoring.**
- No internet, accounts, or syncing.
- Not designed for a toddler to drive solo (parent-operated, like a deck of cards).
- No recording/saving of the kids' answers (v1).

## 4. Entry Point & Discoverability
- A **small, muted button pinned at the bottom of the Home screen**, below the
  category grid — `💬 Conversation Sparks` in a quiet pill (smaller font,
  low-contrast/outline style, not a big colorful tile).
- It does **not** appear in the top bar and is **not** affected by the Owen/Lucas
  toggle's visibility rules.
- Rationale: present but easy to overlook for the kids, instantly findable for
  the parent.

**Decision:** bottom-of-home button (not a top-bar icon).

## 5. User Flow
1. Parent is on Home → taps the small **Conversation Sparks** button.
2. App switches to a new `#sparks` screen showing the **first question** (from a
   freshly shuffled deck) on a large card.
3. Parent taps the **🔊 Listen** control → the phone speaks the question aloud.
4. Question **stays on screen indefinitely** — discussion happens.
5. Parent taps **Next ➜** (or the card) → next question appears (silent until 🔊
   is tapped).
6. 🏠 returns to Home at any time.

## 6. Screen Layout
- Reuses the existing top bar (🏠 Home stays usable). The Owen/Lucas toggle and
  star count are **hidden on this screen** since they're irrelevant here.
- Body:
  - Large, centered **question text** (big, high-contrast, wraps cleanly).
  - A subtle **progress hint** (e.g. "12 / 60"), low emphasis.
  - **🔊 Listen** button (reuses the existing `.replay` button style).
  - **Next ➜** affordance: tapping the card or the Next button advances.
- Visual tone: calm and warm, distinct from the game tiles (soft gradient card)
  so it reads as "family talk time," not a quiz.

## 7. Interaction Details
- **Speak on tap only** (not auto-speak): tapping 🔊 Listen speaks the current
  question. Quieter in public; deliberate.
- **Advance:** tap the **Next ➜** button or anywhere on the question card. The new
  question is shown silently (parent taps 🔊 to hear it).
- **Deck ordering:** shuffle the full deck on entry, walk through without repeats;
  when exhausted, reshuffle and continue. No question repeats until the whole deck
  is seen.
- **Re-entry:** each time the parent opens the tab, start a fresh shuffle.
- Advancing or replaying **cancels any in-progress speech** before speaking
  (mirrors the existing `speak()` behavior).

## 8. Content — The Question Deck
A single curated **universal deck** of open-ended, imaginative, kid-friendly
prompts in short, plain language that works read-aloud for both a ~2.5 yo (with
parent help) and a ~4.5 yo.

Authoring categories (for variety only — not shown in the UI):
- **Imagination & superpowers** — "What superpower would you pick, and what would
  you do with it?"
- **Favorites** — "What's the best food in the whole world?"
- **Silly & funny** — "If animals could talk, which one would be the funniest?"
- **Feelings & kindness** — "How can we make someone smile today?"
- **Pretend & dreams** — "If you had a magic boat, where would it take us?"
- **Family & day** — "What was the best part of today?"

**v1 volume:** ~60 questions, stored as a simple array in the file. Easy to expand.

**Decision:** one universal deck (not split by the Owen/Lucas toggle).

## 9. Voice / Audio Behavior
- Reuses `speak()` and the existing voice selection — no new audio code.
- Depends on the **Start gate** having unlocked audio (already required to use the
  app). If audio isn't unlocked, the text still shows; 🔊 attempts to speak.

## 10. Technical Implementation Notes
- Add a new `<section class="screen" id="sparks">` alongside `#home` / `#play`.
- Add the small entry button at the bottom of `#home` (after `#catGrid`), wired
  with `showScreen('sparks')`.
- Add a `SPARKS = [ ... ]` array plus a small controller: `sparkDeck`, `sparkIdx`,
  `nextSpark()`, `showSpark()`, reusing the existing `shuffle()` helper.
- Hide the toggle/stars on `#sparks` via a CSS rule keyed off a body/screen class;
  keep 🏠 functional.
- All additive — **no changes to existing game logic.** Keeps the single-file,
  offline, no-dependency design intact.

## 11. Accessibility & Kid-Safety
- Large text, high contrast, big forgiving tap targets.
- Wholesome, non-scary content by design.
- No external links, data collection, or purchases.

## 12. Future / Out of Scope (v1)
- Per-child decks tied to the age toggle.
- "Favorite this question" / save answers / journal.
- Parent-pickable categories.
- Remembering deck position between sessions.
- In-app question editing.
