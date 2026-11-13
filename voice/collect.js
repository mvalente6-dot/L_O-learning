// Lists every line the game speaks, by running each mode's round builder many
// times with a fixed random seed. Shared by voice/lines.js and the tests.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadGame } = require('../tests/load-game.js');

// Lines spoken outside a round (Start, tracing, the #tune sample).
const EXTRA = ['Lets play and learn!', 'Stay on the gray line. Try again.', 'Find the red circle. Great job!'];
// Recorded first, so a partial run covers what Lucas and Owen hear most.
const ORDER = ['start', 'school', 'letters', 'numbers', 'colors', 'shapes', 'animals'];

function seed(sandbox, n){
  vm.runInContext(`(() => { let s = ${n >>> 0} || 1; Math.random = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; })()`, sandbox);
}

function collect(opts){
  const rounds = (opts && opts.rounds) || 3000;
  const g = loadGame();
  const p = g.play;
  seed(g.sandbox, (opts && opts.seed) || 7);
  const found = new Map();            // text -> mode it came from
  const add = (t, from) => { if (typeof t === 'string' && t.trim() && !found.has(t)) found.set(t, from); };
  EXTRA.forEach(t => add(t, 'start'));
  for (const level of ['complex', 'simple']){
    for (const k of Object.keys(p.CATS)){
      p.state.level = level; p.state.category = k; p.state.bag = {}; p.state.step = 0;
      for (let i = 0; i < rounds; i++){
        let r;
        try { r = p.CATS[k].build(); } catch (e) { p.state.step = 0; p.state.bag = {}; continue; }
        if (!r) continue;
        add(r.say, k); add(r.praiseSay, k); add(r.follow, k);
        p.state.step++;
        if (r.reset || p.state.step > 40) p.state.step = 0;
      }
    }
  }
  const cards = (list, from) => list.forEach(s => add(typeof s === 'string' ? s : (s && (s.q || s.text)), from));
  cards(p.SPARKS, 'sparks'); cards(p.NIGHT, 'night');
  const rank = f => { const i = ORDER.indexOf(f); return i < 0 ? ORDER.length : i; };
  return [...found].map(([text, from], i) => ({ text, from, i }))
    .sort((a, b) => rank(a.from) - rank(b.from) || a.i - b.i)
    .map(({ text, from }) => ({ key: p.voiceKey(text), from, text }));
}

module.exports = { collect, LINES_FILE: path.join(__dirname, 'lines.json') };
