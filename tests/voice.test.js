const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadGame } = require('./load-game.js');
const { collect } = require('../voice/collect.js');

const LINES = require('../voice/lines.json');
const MANIFEST = path.join(__dirname, '..', 'audio', 'voice', 'manifest.json');

test('every line the game says is in voice/lines.json', () => {
  const known = new Set(LINES.map(l => l.text));
  const missing = collect({ rounds: 3000, seed: 11 }).map(l => l.text).filter(t => !known.has(t));
  assert.deepStrictEqual(missing, [], 'Spoken lines changed. Run: node voice/lines.js');
});

test('every fixed speak(...) line in the game is listed', () => {
  const { html } = loadGame();
  const known = new Set(LINES.map(l => l.text));
  const fixed = [...html.matchAll(/speak\('([^']+)'\)/g)].map(m => m[1]);
  assert.ok(fixed.length >= 3);
  assert.deepStrictEqual(fixed.filter(t => !known.has(t)), []);
});

test('each line has its own clip name, matching the game', () => {
  const { play } = loadGame();
  assert.strictEqual(new Set(LINES.map(l => l.key)).size, LINES.length);
  for (const l of LINES) assert.strictEqual(play.voiceKey(l.text), l.key);
  assert.strictEqual(play.voiceKey('  Find   the dog. '), play.voiceKey('Find the dog.'));
});

function withAudio(){
  const g = loadGame();
  const made = [];
  g.sandbox.Audio = function(src){
    const a = { src: src || '', muted: false, volume: 1, paused: true, plays: 0,
      play(){ a.plays++; a.paused = false; return { catch(){} }; }, pause(){ a.paused = true; } };
    made.push(a);
    return a;
  };
  const spoken = [];
  g.sandbox.speechSynthesis = { speaking: false, pending: false, cancel(){}, getVoices: () => [], speak: u => spoken.push(u.text) };
  g.sandbox.SpeechSynthesisUtterance = function(t){ this.text = t; };
  return { g, play: g.play, made, spoken };
}

test('a line with a clip plays the recording, not the phone voice', () => {
  const { play, spoken } = withAudio();
  const key = play.voiceKey('Find the dog.');
  play.setVoiceClips([key]);
  play.speak('Find the dog.');
  const a = play.voicePlayer();
  assert.ok(a && a.src === 'audio/voice/' + key + '.mp3');
  assert.strictEqual(a.plays, 1);
  assert.deepStrictEqual(spoken, []);
  play.stopTalk();
  assert.strictEqual(a.paused, true);
});

test('a line without a clip, or with no clip list, uses the phone voice', () => {
  const { g, play, spoken } = withAudio();
  play.speak('Find the cat.');                       // no list loaded (offline)
  play.setVoiceClips([play.voiceKey('Find the dog.')]);
  play.speak('Find the cow.');                       // list loaded, line not recorded
  g.sandbox._later.forEach(t => t.fn());
  assert.deepStrictEqual(spoken, ['Find the cat.', 'Find the cow.']);
});

test('a clip that fails to load falls back to the phone voice', () => {
  const { g, play, spoken } = withAudio();
  const key = play.voiceKey('Find the dog.');
  play.setVoiceClips([key]);
  play.speak('Find the dog.');
  play.voicePlayer().onerror();
  g.sandbox._later.forEach(t => t.fn());
  assert.deepStrictEqual(spoken, ['Find the dog.']);
  spoken.length = 0;
  play.speak('Find the dog.');                       // dropped from the list after failing
  g.sandbox._later.forEach(t => t.fn());
  assert.deepStrictEqual(spoken, ['Find the dog.']);
});

test('the clip list only names recordings that exist', { skip: !fs.existsSync(MANIFEST) }, () => {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const keys = new Set(LINES.map(l => l.key));
  for (const k of m.clips){
    assert.ok(keys.has(k), k + ' is not a current line');
    assert.ok(fs.existsSync(path.join(path.dirname(MANIFEST), k + '.mp3')), k + '.mp3 missing');
  }
});
