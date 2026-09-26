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
  while (g.sandbox._later.length && guard++ < 40) g.sandbox._later.shift().fn();
}
function pastLook(g){
  if (g.play.state.current && /^Look/.test(g.play.state.current.say)) settle(g);
  return g.play.state.current;
}
function levelBtn(g, level){
  return g.ids.toggle._buttons.find(b => b.dataset.level === level);
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
  assert.match(more.say, /Which has more/);
  const same = open(g, 'numbers', 'complex', 'same');
  assert.equal(same.say, 'Tap same if they match.');
  assert.equal(same.choices.filter(c => c.correct).length, 1);
  assert.match(same.choices.find(c => c.correct).render, /same-tile/);
  const sameWrongs = same.choices.filter(c => !c.correct).map(c => c.render);
  assert.equal(sameWrongs.length, 2);
  assert.notEqual(sameWrongs[0], sameWrongs[1]);
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
  const lucasBtn = levelBtn(g, 'complex');
  const owenBtn = levelBtn(g, 'simple');
  g.play.setLevel(lucasBtn);
  assert.equal(g.play.state.stars, 0);
  g.play.addStar();
  g.play.setLevel(owenBtn);
  assert.equal(g.play.state.stars, 2);
  g.play.setLevel(lucasBtn);
  const g2 = fresh(storage);
  assert.equal(g2.play.state.level, 'complex');
  assert.equal(g2.play.state.stars, 1);
  const saved = memoryStorage();
  const g3 = fresh(saved);
  g3.play.state.level = 'simple';
  g3.play.state.stars = 0;
  g3.play.state.starBank = { simple: 0, complex: 0 };
  g3.play.addStar();
  const g4 = fresh(saved);
  assert.equal(g4.play.state.level, 'simple');
  assert.equal(g4.play.state.stars, 1);
  g2.play.setLevel(levelBtn(g2, 'simple'));
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

test('Silly is a picture, and Lucas sits before Owen', () => {
  const g = fresh();
  assert.match(g.html, /data-level="complex">Lucas<\/button>\s*<button class="simple on" data-level="simple">Owen/);
  assert.match(g.sandbox.speak.toString(), /setTimeout\(say, 80\)/);
  assert.match(g.sandbox.loadVoice.toString(), /full\(enUS\)/);
  for (const level of ['simple', 'complex']){
    for (let i = 0; i < 8; i++){
      const round = open(g, 'silly', level, null);
      assert.match(round.say, /Which one is silly/);
      assert.match(round.praiseSay, /^(A|An) /);
      assert.equal(round.choices.length, level === 'simple' ? 2 : 3);
      assert.equal(round.choices.filter(c => c.correct).length, 1);
      round.choices.forEach(c => assert.match(c.render, /silly-pic/));
      round.choices.filter(c => !c.correct).forEach(c => {
        assert.doesNotMatch(c.render, /🎩|🛁|🍦|🚲|🚗/);
      });
      const stars = g.play.state.stars;
      correctBtn(g).onclick();
      assert.equal(g.play.state.stars, stars + 1);
    }
  }
});

test('shapes stay visible on the white card', () => {
  const g = fresh();
  for (const level of ['simple', 'complex']){
    for (let i = 0; i < 30; i++){
      open(g, 'shapes', level, null).choices.forEach(c => {
        assert.doesNotMatch(c.render, /#ffffff/i);
      });
    }
  }
});

test('a second tap does not skip, and the old line stops', () => {
  const g = fresh();
  open(g, 'move', 'simple', null);
  const heard = [];
  g.sandbox.speak = t => heard.push(t);
  g.ids.choices.children[0].onclick({ type:'click' });
  g.ids.choices.children[0].onclick({ type:'click' });
  assert.match(g.play.state.current.say, /Touch your toes/);
  settle(g);
  assert.deepEqual(heard, ['Touch your toes.']);
});

test('Who left shows the empty spot, and never turns into colors', () => {
  const g = fresh();
  open(g, 'wholeft', 'simple', null);
  const look = g.play.state.current;
  assert.match(look.say, /Look at them/);
  assert.equal(look.choices.length, 0);
  assert.equal(look.stage.includes('who-gone'), false);
  assert.equal((look.stage.match(/seq-item/g) || []).length, 2);
  const round = pastLook(g);
  assert.match(round.say, /Who left/);
  assert.match(round.praiseSay, /left/);
  assert.equal(round.choices.length, 2);
  assert.equal(round.stage.includes('who-gone'), true);
  const gone = round.choices.find(c => c.correct);
  const stayed = round.choices.find(c => !c.correct);
  assert.equal(round.stage.includes(gone.emoji), false);
  assert.equal(round.stage.includes(stayed.emoji), true);
  const stars = g.play.state.stars;
  correctBtn(g).onclick();
  assert.equal(g.play.state.stars, stars + 1);
  open(g, 'wholeft', 'complex', 'lights');
  assert.match(g.play.state.current.say, /Look at them/);
  assert.equal(g.play.state.current.sequence, undefined);
  const lucas = pastLook(g);
  assert.equal(lucas.choices.length, 3);
  assert.equal(lucas.stage.includes('who-gone'), true);
  assert.equal(lucas.choices.some(c => /background:/.test(c.render)), false);
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
  for (let i = 0; i < 5; i++) g.ids.choices.children[0].onclick();
  assert.match(g.play.state.current.say, /sharp claws/);
  assert.match(g.play.state.current.say, /rapter/);
  assert.doesNotMatch(g.play.state.current.say, /this raptor/i);
  g.ids.choices.children[0].onclick();
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
  assert.match(says[7], /cookies/);
  assert.doesNotMatch(says[7], /cracker/);
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

test('going home stops the old question', () => {
  const g = fresh();
  const heard = [];
  g.sandbox.speak = t => heard.push(t);
  open(g, 'colors', 'simple', null);
  const say = g.play.state.current.say;
  g.ids.homeBtn.onclick();
  settle(g);
  assert.equal(heard.includes(say), false);
});

test('the dinosaur name has time to finish', () => {
  const g = fresh();
  open(g, 'dinos', 'simple', null);
  correctBtn(g).onclick();
  const waits = g.sandbox._later.map(t => t.ms);
  assert.ok(waits.some(ms => ms >= 2400));
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

test('a newer line replaces one that was still waiting', () => {
  const g = fresh();
  const said = [];
  let speaking = false;
  g.sandbox.SpeechSynthesisUtterance = function(text){ this.text = text; };
  g.sandbox.speechSynthesis = {
    get speaking(){ return speaking; },
    pending: false,
    cancel(){ speaking = false; },
    speak(u){ speaking = true; said.push(u.text); },
    getVoices(){ return []; },
  };
  g.sandbox.speak('Look at them.');
  assert.deepEqual(said, ['Look at them.']);
  g.sandbox.speak('Who left?');
  g.sandbox.speak('The dog left.');
  settle(g);
  assert.deepEqual(said, ['Look at them.', 'The dog left.']);
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
