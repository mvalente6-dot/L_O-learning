const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame, memoryStorage } = require('./load-game');

function fresh(storage){
  return loadGame({ storage });
}
function open(g, id, level, mode){
  g.play.state.level = level || g.play.state.level;
  g.play.state.mode = mode || null;
  g.play.buildHome();
  g.play.openCategory(id);
  return g.play.state.current;
}
function labels(g){
  g.play.buildHome();
  return g.ids.catGrid.children.map(b => b.innerHTML);
}
function correctBtn(g){
  return g.ids.choices.children.find(b => b.dataset.correct === '1');
}
function wrongBtn(g){
  return g.ids.choices.children.find(b => b.dataset.correct !== '1');
}
function settle(g){
  let guard = 0;
  while (g.sandbox._later.length && guard++ < 40) g.sandbox._later.shift()();
}
function pastLook(g){
  if (g.play.state.current && /^Look/.test(g.play.state.current.say)){
    g.ids.choices.children[0].onclick();
  }
  return g.play.state.current;
}

test('Owen and Lucas see the right pictures at home', () => {
  const g = fresh();
  g.play.state.level = 'simple';
  const owen = labels(g).join('\n');
  for (const name of ['Numbers','Move','Silly','Who left','Feelings','Names','Museum','Turns','Places']){
    assert.match(owen, new RegExp(name));
  }
  assert.doesNotMatch(owen, /Letters/);
  assert.doesNotMatch(owen, /Patterns/);
  assert.doesNotMatch(owen, /Rhymes/);
  assert.doesNotMatch(owen, /Odd one/);
  g.play.state.level = 'complex';
  const lucas = labels(g).join('\n');
  for (const name of ['Letters','Patterns','Rhymes','Odd one','Move']){
    assert.match(lucas, new RegExp(name));
  }
});

test('Start does not greet by name, and a round never sends them home', () => {
  const g = fresh();
  assert.doesNotMatch(g.html, /Hi Owen/);
  assert.doesNotMatch(g.html, /Hi Lucas/);
  assert.doesNotMatch(g.html, /Keep playing/);
  const start = g.ids.startBtn.onclick.toString();
  assert.doesNotMatch(start, /Hi Owen/);
  assert.match(start, /Lets play and learn/);
});

test('Lucas letters mix find, picture sounds, and big/little', () => {
  const g = fresh();
  const modes = new Set();
  for (let i = 0; i < 90; i++){
    const round = open(g, 'letters', 'complex', null);
    if (/Find the letter/.test(round.say)) modes.add('find');
    else if (/little/.test(round.say)) modes.add('case');
    else modes.add('sound');
  }
  assert.deepEqual([...modes].sort(), ['case', 'find', 'sound']);
  const sound = open(g, 'letters', 'complex', 'sound');
  assert.match(sound.say, /Which letter says/);
  assert.doesNotMatch(sound.say, /\b(I|Q|X),/);
  assert.match(sound.stage, /🍎|⚽|🐱|🐶|🥚|🐟|🐐|🎩|🧃|🪁|🦁|🌙|👃|🐙|🐷|🐰|☀️|🐢|☂️|🎻|🐳|🪀|🦓/);
  const find = open(g, 'letters', 'complex', 'find');
  assert.match(find.say, /Find the letter [A-Z]\./);
  const cas = open(g, 'letters', 'complex', 'case');
  assert.match(cas.say, /little/);
  assert.match(cas.stage, />[A-Z]</);
  assert.ok(cas.choices.every(c => /[a-z]/.test(c.render)));
});

test('Lucas counts big pictures, takes away, and compares closer piles', () => {
  const g = fresh();
  const count = open(g, 'numbers', 'complex', 'count');
  assert.match(count.say, /How many/);
  assert.match(count.stage, /class="objects"/);
  assert.ok(count.choices.length >= 3);
  assert.ok(!count.choices.some(c => /font-size:20px/.test(c.render)));
  const take = open(g, 'numbers', 'complex', 'take');
  assert.match(take.say, /How many are left/);
  assert.equal(take.choices.filter(c => c.correct).length, 1);
  const more = open(g, 'numbers', 'complex', 'more');
  assert.match(more.say, /Which has more|Which has less|Tap same if they match/);
  const same = open(g, 'numbers', 'complex', 'same');
  assert.match(same.say, /Tap same if they match/);
  assert.equal(same.choices.filter(c => c.correct).length, 1);
  assert.match(same.choices.find(c => c.correct).render, /same-tile/);
});

test('Owen counts, finds numbers, and compares very different piles', () => {
  const g = fresh();
  const count = open(g, 'numbers', 'simple', 'count');
  assert.match(count.say, /How many/);
  assert.equal(count.choices.length, 3);
  const more = open(g, 'numbers', 'simple', 'more');
  assert.match(more.say, /Which has more|Which has less/);
  assert.equal(more.choices.length, 2);
  const nums = more.choices.map(c => (c.render.match(/<span>/g) || []).length);
  const gap = Math.abs(nums[0] - nums[1]);
  assert.ok(gap >= 2);
});

test('Owen hears who says this, Lucas gets farm and wild', () => {
  const g = fresh();
  const sound = open(g, 'animals', 'simple', 'sound');
  assert.match(sound.say, /Who says this/);
  assert.equal(sound.choices.length, 3);
  assert.ok(sound.sound);
  const farm = open(g, 'animals', 'complex', 'farm');
  assert.match(farm.say, /farm animal/);
  assert.equal(farm.choices.filter(c => c.correct).length, 1);
  const wild = open(g, 'animals', 'complex', 'wild');
  assert.match(wild.say, /wild/);
  assert.equal(wild.choices.filter(c => c.correct).length, 1);
});

test('Owen dinos use look clues and say the real name after', () => {
  const g = fresh();
  for (let i = 0; i < 30; i++){
    const round = open(g, 'dinos', 'simple', null);
    assert.match(round.say, /Find the one with/);
    assert.doesNotMatch(round.say, /Raptor|Brachiosaurus|Stegosaurus|Triceratops|Pterodactyl/);
    assert.ok(round.praiseSay);
    assert.doesNotMatch(round.praiseSay, /Raptor|rapter/);
  }
  const clue = open(g, 'dinos', 'complex', 'clue');
  assert.match(clue.say, /Find the one with/);
  assert.ok(clue.praiseSay);
  const name = open(g, 'dinos', 'complex', 'name');
  assert.match(name.say, /Find the /);
  assert.doesNotMatch(name.say, /one with/);
});

test('two misses pulse the right picture', () => {
  const g = fresh();
  open(g, 'colors', 'simple', null);
  const stars = g.play.state.stars;
  wrongBtn(g).onclick();
  assert.equal(correctBtn(g).classList.contains('hint'), false);
  wrongBtn(g).onclick();
  assert.equal(correctBtn(g).classList.contains('hint'), true);
  assert.equal(g.play.state.stars, stars);
  correctBtn(g).onclick();
  assert.equal(g.play.state.stars, stars + 1);
});

test('the phone remembers each boy and who played last', () => {
  const storage = memoryStorage();
  const g = fresh(storage);
  g.play.state.level = 'simple';
  g.play.state.starBank = { simple: 0, complex: 0 };
  g.play.state.stars = 0;
  g.play.addStar();
  g.play.addStar();
  const lucasBtn = g.ids.toggle._buttons[1];
  const owenBtn = g.ids.toggle._buttons[0];
  g.play.setLevel(lucasBtn);
  assert.equal(g.play.state.stars, 0);
  g.play.addStar();
  g.play.setLevel(owenBtn);
  assert.equal(g.play.state.stars, 2);
  g.play.setLevel(lucasBtn);
  const g2 = fresh(storage);
  assert.equal(g2.play.state.level, 'complex');
  assert.equal(g2.play.state.stars, 1);
  g2.play.setLevel(g2.ids.toggle._buttons[0]);
  assert.equal(g2.play.state.stars, 2);
});

test('Owen colors include black and white; Lucas pale and dark stay obvious', () => {
  const g = fresh();
  let sawBlack = false, sawWhite = false;
  for (let i = 0; i < 80; i++){
    const round = open(g, 'colors', 'simple', null);
    if (/black/.test(round.say)) sawBlack = true;
    if (/white/.test(round.say)) sawWhite = true;
    round.choices.forEach(c => {
      if (/#ffffff/i.test(c.render)) assert.match(c.render, /border/);
    });
  }
  assert.equal(sawBlack && sawWhite, true);
  for (let i = 0; i < 20; i++){
    const round = open(g, 'colors', 'complex', 'shade');
    assert.match(round.say, /Tap the (pale|dark) (blue|green|purple) one/);
    assert.doesNotMatch(round.say, /red|pink|yellow|orange|black|white/);
  }
});

test('Lucas patterns include both lengths', () => {
  const g = fresh();
  const ab = open(g, 'patterns', 'complex', 'ab');
  assert.match(ab.say, /What comes next/);
  assert.equal(ab.choices.length, 3);
  const abc = open(g, 'patterns', 'complex', 'abc');
  assert.equal(abc.choices.length, 4);
  const seen = new Set();
  for (let i = 0; i < 40; i++){
    const round = open(g, 'patterns', 'complex', null);
    seen.add(round.choices.length);
  }
  assert.ok(seen.has(3) && seen.has(4));
});

test('Move is its own activity, unscored, and longer for Lucas', () => {
  const g = fresh();
  const owen = [];
  open(g, 'move', 'simple', null);
  for (let i = 0; i < 9; i++){
    owen.push(g.play.state.current.say);
    assert.equal(g.play.state.current.noStar, true);
    g.ids.choices.children[0].onclick();
  }
  assert.match(g.play.state.current.say, /All done/);
  assert.equal(g.play.state.stars, 0);
  assert.ok(owen.some(s => /Reach up high/.test(s)));
  assert.ok(owen.some(s => /Flap like a bird/.test(s)));
  assert.ok(!owen.some(s => /Clap/.test(s)));
  open(g, 'move', 'complex', null);
  const lucas = [];
  for (let i = 0; i < 12; i++){
    lucas.push(g.play.state.current.say);
    g.ids.choices.children[0].onclick();
  }
  assert.match(g.play.state.current.say, /All done/);
  assert.ok(lucas.some(s => /Clap three times/.test(s)));
  assert.ok(lucas.some(s => /Clap five times/.test(s)));
  assert.ok(lucas.some(s => /Stand on one foot/.test(s)));
});

test('Silly animal has no wrong answer', () => {
  const g = fresh();
  open(g, 'silly', 'simple', null);
  assert.match(g.play.state.current.say, /Pick a color/);
  assert.equal(g.play.state.current.choices.length, 3);
  g.ids.choices.children[0].onclick();
  assert.match(g.play.state.current.say, /Pick an animal/);
  g.ids.choices.children[0].onclick();
  assert.match(g.play.state.current.say, /Tiny or giant/);
  g.ids.choices.children[0].onclick();
  assert.match(g.play.state.current.say, /^A (tiny|giant) /);
  assert.equal(g.play.state.stars, 0);
  open(g, 'silly', 'complex', null);
  g.ids.choices.children[0].onclick();
  g.ids.choices.children[0].onclick();
  g.ids.choices.children[0].onclick();
  assert.match(g.play.state.current.say, /Pick a hat/);
  g.ids.choices.children[0].onclick();
  assert.match(g.play.state.current.say, /with a (party hat|sun hat|winter hat)/);
});

test('Who left and copy the lights', () => {
  const g = fresh();
  open(g, 'wholeft', 'simple', 'left');
  const round = pastLook(g);
  assert.match(round.say, /Who left/);
  assert.equal(round.choices.length, 2);
  const gone = round.choices.find(c => c.correct);
  assert.ok(gone);
  assert.equal(round.stage.includes(gone.emoji), false);
  open(g, 'wholeft', 'complex', 'left');
  const lucas = pastLook(g);
  assert.equal(lucas.choices.length, 4);
  open(g, 'wholeft', 'complex', 'lights');
  assert.equal(g.play.state.current.sequence.length, 2);
  g.play.state.current.sequence.forEach(color => {
    g.ids.choices.children.find(b => b.dataset.value === color).onclick();
  });
  assert.equal(g.play.state.stars, 1);
  assert.equal(g.play.state.current.sequence.length, 3);
});

test('Feelings: Owen taps a face, Lucas gets a story then talk', () => {
  const g = fresh();
  const o = open(g, 'feelings', 'simple', null);
  assert.match(o.say, /Tap the (happy|sad|mad) face/);
  assert.equal(o.choices.length, 3);
  const stars = g.play.state.stars;
  correctBtn(g).onclick();
  assert.equal(g.play.state.stars, stars + 1);
  const l = open(g, 'feelings', 'complex', null);
  assert.match(l.say, /How do you feel/);
  assert.equal(l.choices.length, 4);
  assert.ok(l.follow);
  const before = g.play.state.stars;
  correctBtn(g).onclick();
  assert.equal(g.play.state.stars, before + 1);
  assert.equal(g.play.state.current.noStar, true);
  assert.match(g.play.state.current.say, /.{8,}/);
  g.ids.choices.children[0].onclick();
  assert.equal(g.play.state.stars, before + 1);
});

test('Our names uses Owen and Lucas', () => {
  const g = fresh();
  open(g, 'names', 'simple', null);
  const heard = [];
  for (let i = 0; i < 4; i++){
    heard.push(g.play.state.current.say);
    assert.ok(g.play.state.current.choices.length >= 2);
    assert.ok(g.play.state.current.choices.length <= 3);
    correctBtn(g).onclick();
    settle(g);
  }
  assert.deepEqual(heard, ['Find O.', 'Find W.', 'Find E.', 'Find N.']);
  assert.match(g.play.state.current.say, /Owen/);
  open(g, 'names', 'complex', null);
  const lucas = [];
  for (let i = 0; i < 5; i++){
    lucas.push(g.play.state.current.say);
    correctBtn(g).onclick();
    settle(g);
  }
  assert.deepEqual(lucas, ['Tap L.', 'Tap U.', 'Tap C.', 'Tap A.', 'Tap S.']);
  assert.match(g.play.state.current.say, /Lucas/);
});

test('Dino museum is a tour without stars', () => {
  const g = fresh();
  open(g, 'museum', 'simple', null);
  assert.match(g.play.state.current.say, /long neck/);
  assert.match(g.play.state.current.say, /Brack ee oh sore us/);
  assert.match(g.play.state.current.say, /plants/);
  assert.equal(g.play.state.current.noStar, true);
  for (let i = 0; i < 6; i++) g.ids.choices.children[0].onclick();
  assert.equal(g.play.state.stars, 0);
  assert.match(g.play.state.current.say, /long neck/);
  assert.match(g.play.state.current.stage, /seen/);
});

test('Turns alternate and stay inside what each boy can do', () => {
  const g = fresh();
  open(g, 'turns', 'simple', null);
  const says = [];
  for (let i = 0; i < 8; i++){
    const round = g.play.state.current;
    says.push(round.say);
    if (/Owen/.test(round.say)) assert.ok(round.choices.length <= 3);
    if (/Lucas/.test(round.say)) assert.ok(round.choices.length <= 4);
    correctBtn(g).onclick();
    settle(g);
  }
  assert.match(says[0], /Owen's turn/);
  assert.match(says[1], /Lucas's turn/);
  assert.match(g.play.state.current.say, /All done/);
});

test('Rhymes, odd one out, and places', () => {
  const g = fresh();
  const rhyme = open(g, 'rhymes', 'complex', null);
  assert.match(rhyme.say, /Which one rhymes with/);
  assert.equal(rhyme.choices.length, 3);
  g.play.state.level = 'simple';
  assert.equal(g.play.allowed(g.play.CATS.rhymes), false);
  g.play.state.level = 'complex';
  assert.equal(g.play.allowed(g.play.CATS.rhymes), true);
  const odd = open(g, 'belong', 'complex', null);
  assert.equal(odd.say, 'Which one does not belong?');
  assert.equal(odd.choices.length, 4);
  const place = open(g, 'places', 'simple', null);
  assert.match(place.say, /in the|on the|under the/);
  assert.equal(place.choices.length, 3);
});

test('leaving during the cheer does not skip the next game', () => {
  const g = fresh();
  open(g, 'names', 'simple', null);
  correctBtn(g).onclick();
  open(g, 'move', 'simple', null);
  settle(g);
  assert.match(g.play.state.current.say, /Reach up high/);
  assert.equal(g.play.state.step, 0);
});

test('Goodnight is a separate calm deck and stays quiet until Listen', () => {
  const g = fresh();
  assert.equal(g.play.NIGHT.length, 8);
  assert.ok(g.play.NIGHT.every(q => !/pizza|superpower/i.test(q)));
  assert.ok(g.play.NIGHT.includes('Are you cozy?'));
  g.play.setSparkKind('night');
  assert.ok(g.play.NIGHT.includes(g.ids.sparkText.textContent));
  assert.equal(g.play.showSpark.toString().includes('speak('), false);
  assert.equal(g.ids.sparkListen.onclick.toString().includes('speak('), true);
});
