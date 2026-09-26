const fs = require('fs');
const path = require('path');
const vm = require('vm');

const GAME = path.join(__dirname, '..', 'Kids Learning Game - 2026-06-04.html');

function makeEl(tag){
  const el = {
    tagName: tag || 'div',
    children: [],
    id: '',
    style: {},
    dataset: {},
    onclick: null,
    textContent: '',
    _html: '',
    _classes: new Set(),
  };
  el.classList = {
    add: (...xs) => xs.forEach(x => el._classes.add(x)),
    remove: (...xs) => xs.forEach(x => el._classes.delete(x)),
    toggle: (x, force) => {
      const on = force === undefined ? !el._classes.has(x) : !!force;
      if (on) el._classes.add(x); else el._classes.delete(x);
      return on;
    },
    contains: x => el._classes.has(x),
  };
  Object.defineProperty(el, 'className', {
    get(){ return [...el._classes].join(' '); },
    set(v){ el._classes = new Set(String(v || '').split(/\s+/).filter(Boolean)); },
  });
  Object.defineProperty(el, 'innerHTML', {
    get(){ return el._html; },
    set(v){ el._html = String(v); if (v === '') el.children = []; },
  });
  el.appendChild = c => { el.children.push(c); return c; };
  el.remove = () => {};
  el.addEventListener = (ev, fn) => { el['on' + ev] = fn; };
  el.querySelector = () => null;
  el.querySelectorAll = sel => (sel === 'button' && el._buttons) ? el._buttons : [];
  return el;
}

function memoryStorage(seed){
  const m = new Map(Object.entries(seed || {}));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
  };
}

function loadGame(opts){
  opts = opts || {};
  const html = fs.readFileSync(GAME, 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('script not found');
  const ids = {};
  ['catGrid','sparksEntry','sparkNext','sparkCard','sparkListen','sparkText','sparkProgress','sparkMoon','homeBtn','replay','toggle','holdHint','startBtn','start','stage','choices','starCount','confetti','praise','home','sparks','play'].forEach(id => {
    ids[id] = makeEl('div');
    ids[id].id = id;
  });
  const owen = makeEl('button');
  owen.dataset.level = 'simple';
  owen.className = 'simple on';
  const lucas = makeEl('button');
  lucas.dataset.level = 'complex';
  lucas.className = 'complex';
  ids.toggle._buttons = [lucas, owen];
  const screens = [ids.home, ids.sparks, ids.play];
  const body = makeEl('body');
  const document = {
    body,
    createElement: tag => makeEl(tag),
    querySelector: sel => (String(sel).startsWith('#') ? ids[sel.slice(1)] || null : null),
    querySelectorAll: sel => (sel === '.screen' ? screens : []),
  };
  const storage = opts.storage || memoryStorage();
  const sandbox = {
    document,
    location: { hash: '' },
    console,
    setTimeout: (fn, ms) => { sandbox._later.push({ fn, ms: ms || 0 }); return sandbox._later.length; },
    clearTimeout(){},
    clearInterval(){},
    setInterval(){ return 0; },
    Audio: function(){
      return { play(){ return Promise.resolve(); }, pause(){}, volume: 1, muted: false, currentTime: 0 };
    },
    localStorage: storage,
    _later: [],
    ids,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const tail = `
globalThis.__play = {
  CATS, state, setLevel, onChoice, nextRound, openCategory, onCheck,
  SPARKS, NIGHT, loadSave, addStar, showSpark, setSparkKind, allowed, buildHome
};
`;
  vm.runInContext(m[1] + tail, sandbox, { filename: 'game.html' });
  return { play: sandbox.__play, ids, storage, html, sandbox };
}

module.exports = { loadGame, memoryStorage, GAME };
