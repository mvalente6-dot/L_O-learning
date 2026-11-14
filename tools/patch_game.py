#!/usr/bin/env python3
"""Point the game at photos, lifelike dinosaurs, and recorded voice clips."""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML = ROOT / "Kids Learning Game - 2026-06-04.html"
CLIPS = (ROOT / "tools" / "voice-clips.js").read_text(encoding="utf-8").strip()

text = HTML.read_text(encoding="utf-8")
if "const VOICE_CLIPS" in text:
    sys.exit("already patched")

def swap(old, new, label):
    global text
    n = text.count(old)
    if n != 1:
        sys.exit(f"{label}: found {n}")
    text = text.replace(old, new, 1)

swap(
"""  .choice svg{max-width:90%; max-height:90%;}""",
"""  .choice svg{max-width:90%; max-height:90%;}
  .photo{object-fit:contain; pointer-events:none;}
  .choice .photo{width:min(46vw,190px); height:min(34vw,170px);}
  .choice .photo.dino{width:min(70vw,260px); height:min(36vw,170px);}
  .objects .photo{width:46px; height:46px;}
  .same-tile .objects .photo{width:34px; height:34px;}
  .silly-pic .photo{width:min(18vw,84px); height:min(18vw,84px);}
  .big-show .photo{width:min(46vw,200px); height:min(46vw,200px);}
  .who-row .seq-item{display:flex; align-items:center; justify-content:center;}
  .who-row .photo{width:78%; height:78%;}
  .dino-big .photo{width:min(78vw,340px); height:auto;}""",
"css photos",
)

swap(
"""  .scene{position:relative;width:110px;height:90px;}
  .scene .prop{position:absolute;left:28px;bottom:16px;width:54px;height:36px;border:5px solid #92400e;border-radius:8px;}
  .scene .glyph{position:absolute;font-size:28px;line-height:1;}
  .sc-in .glyph{left:40px;bottom:22px;}
  .sc-on .glyph{left:40px;bottom:52px;}
  .sc-under .glyph{left:40px;bottom:0;}
  .sc-beside .glyph{left:0;bottom:20px;}
  .prop-bowl .prop{border-radius:0 0 28px 28px;border-top:none;}
  .prop-bed .prop{border-radius:10px 10px 4px 4px;background:#bfdbfe;}
  .prop-hat .prop{border-radius:40px 40px 6px 6px;height:24px;background:#f59e0b;}""",
"""  .scene{position:relative;width:180px;height:150px;}
  .scene .prop{position:absolute;left:48px;bottom:30px;width:84px;height:58px;border-radius:8px;background:#fff center/cover no-repeat;}
  .scene .glyph{position:absolute;width:56px;height:56px;}
  .scene .glyph .photo{width:56px;height:56px;}
  .sc-in .glyph{left:62px;bottom:36px;}
  .sc-on .glyph{left:62px;bottom:84px;}
  .sc-under .glyph{left:62px;bottom:0;}
  .sc-beside .glyph{left:4px;bottom:34px;}
  .prop-box .prop{background-image:url('assets/photos/box.jpg');}
  .prop-bowl .prop{background-image:url('assets/photos/bowl.jpg'); border-radius:0 0 28px 28px;}
  .prop-bed .prop{background-image:url('assets/photos/bed.jpg');}
  .prop-hat .prop{background-image:url('assets/photos/hat.jpg'); height:40px;}""",
"css scenes",
)

# The under position in the file may differ. If the swap failed we already exited.
# Fix a possible mismatch by checking. Done via swap count.

swap(
"""   - All prompts are SPOKEN by the device (Web Speech API). No reading needed
     except the Letters category (by design).
   - Visuals are emoji + inline SVG. Feedback sounds are generated tones.""",
"""   - Prompts are recorded in one woman's voice. The phone voice is only a backup.
     No reading needed except the Letters category (by design).
   - Tapped pictures are photos. Dinosaurs are lifelike pictures. Feelings, letters,
     and shapes stay simple. Feedback sounds are generated tones.""",
"header",
)

start = text.find("const DINOS = [")
end = text.find("/* animals: emoji", start)
if start < 0 or end < 0:
    sys.exit("dinos block missing")
text = text[:start] + """const DINOS = [
  {name:'Brachiosaurus', file:'brachiosaurus'},
  {name:'T-Rex', file:'trex'},
  {name:'Stegosaurus', file:'stegosaurus'},
  {name:'Triceratops', file:'triceratops'},
  {name:'Pterodactyl', file:'pterodactyl'},
  {name:'Raptor', file:'raptor'}
];

""" + text[end:]

swap(
"""const COUNT_OBJECTS = ['🍎','🍌','⭐','🐟','🌸','🚗','🎈','🐝','🍓','🦋'];""",
"""const COUNT_OBJECTS = ['apple','banana','star','fish','flower','car','balloon','bee','strawberry','butterfly'];""",
"count objects",
)

swap(
"""const PICTURES = [
  ['A','apple','🍎'],['B','ball','⚽'],['C','cat','🐱'],['D','dog','🐶'],['E','egg','🥚'],
  ['F','fish','🐟'],['G','goat','🐐'],['H','hat','🎩'],['J','juice','🧃'],['K','kite','🪁'],
  ['L','lion','🦁'],['M','moon','🌙'],['N','nose','👃'],['O','octopus','🐙'],['P','pig','🐷'],
  ['R','rabbit','🐰'],['S','sun','☀️'],['T','turtle','🐢'],['U','umbrella','☂️'],['V','violin','🎻'],
  ['W','whale','🐳'],['Y','yo-yo','🪀'],['Z','zebra','🦓']
];""",
"""const PICTURES = [
  ['A','apple','apple'],['B','ball','ball'],['C','cat','cat'],['D','dog','dog'],['E','egg','egg'],
  ['F','fish','fish'],['G','goat','goat'],['H','hat','hat'],['J','juice','juice'],['K','kite','kite'],
  ['L','lion','lion'],['M','moon','moon'],['N','nose','nose'],['O','octopus','octopus'],['P','pig','pig'],
  ['R','rabbit','rabbit'],['S','sun','sun'],['T','turtle','turtle'],['U','umbrella','umbrella'],['V','violin','violin'],
  ['W','whale','whale'],['Y','yo-yo','yoyo'],['Z','zebra','zebra']
];""",
"pictures",
)

swap(
"""const RHYMES = [
  ['cat',[['hat','🎩',true],['dog','🐶',false],['sun','☀️',false]]],
  ['dog',[['frog','🐸',true],['hat','🎩',false],['cake','🎂',false]]],
  ['bee',[['tree','🌳',true],['cat','🐱',false],['ball','⚽',false]]],
  ['cake',[['snake','🐍',true],['pig','🐷',false],['star','⭐',false]]],
  ['star',[['car','🚗',true],['duck','🦆',false],['fish','🐟',false]]],
  ['box',[['fox','🦊',true],['moon','🌙',false],['boat','⛵',false]]],
  ['sock',[['clock','🕐',true],['cup','☕',false],['bird','🐦',false]]],
  ['mouse',[['house','🏠',true],['frog','🐸',false],['apple','🍎',false]]]
];""",
"""const RHYMES = [
  ['cat',[['hat','hat',true],['dog','dog',false],['sun','sun',false]]],
  ['dog',[['frog','frog',true],['hat','hat',false],['cake','cake',false]]],
  ['bee',[['tree','tree',true],['cat','cat',false],['ball','ball',false]]],
  ['cake',[['snake','snake',true],['pig','pig',false],['star','star',false]]],
  ['star',[['car','car',true],['duck','duck',false],['fish','fish',false]]],
  ['box',[['fox','fox',true],['moon','moon',false],['boat','boat',false]]],
  ['sock',[['clock','clock',true],['cup','cup',false],['bird','bird',false]]],
  ['mouse',[['house','house',true],['frog','frog',false],['apple','apple',false]]]
];""",
"rhymes",
)

swap(
"""const SILLY = [
  { yes:'A fish in a tree.', silly:['🐟','🌳'], normal:[['🐟','💧'],['🐦','🌳'],['🦆','💧']] },
  { yes:'A cow up in the clouds.', silly:['🐄','☁️'], normal:[['🐄','🌾'],['🐦','☁️'],['🐑','🌾']] },
  { yes:'An elephant in a tiny tub.', silly:['🐘','🛁'], normal:[['🐘','🌿'],['🦆','💧'],['🐶','🦴']] },
  { yes:'A dog driving a car.', silly:['🐶','🚗'], normal:[['🐶','🦴'],['🐱','🥛'],['🐷','🍎']] },
  { yes:'A pig on a bike.', silly:['🐷','🚲'], normal:[['🐷','🍎'],['🐑','🌾'],['🐮','🌾']] },
  { yes:'A lion in a bed.', silly:['🦁','🛏️'], normal:[['🐱','🛏️'],['🐶','🛏️'],['🦁','🌴']] },
  { yes:'A dinosaur eating ice cream.', silly:['🦖','🍦'], normal:[['🦖','🌿'],['🐻','🍯'],['🐵','🍌']] },
  { yes:'A frog in a fancy hat.', silly:['🐸','🎩'], normal:[['🐸','💧'],['🦆','💧'],['🐶','🦴']] }
];""",
"""const SILLY = [
  { yes:'A fish in a tree.', silly:['fish','tree'], normal:[['fish','water'],['bird','tree'],['duck','water']] },
  { yes:'A cow up in the clouds.', silly:['cow','cloud'], normal:[['cow','wheat'],['bird','cloud'],['sheep','wheat']] },
  { yes:'An elephant in a tiny tub.', silly:['elephant','tub'], normal:[['elephant','plant'],['duck','water'],['dog','bone']] },
  { yes:'A dog driving a car.', silly:['dog','car'], normal:[['dog','bone'],['cat','milk'],['pig','apple']] },
  { yes:'A pig on a bike.', silly:['pig','bike'], normal:[['pig','apple'],['sheep','wheat'],['cow','wheat']] },
  { yes:'A lion in a bed.', silly:['lion','bed'], normal:[['cat','bed'],['dog','bed'],['lion','palm']] },
  { yes:'A dinosaur eating ice cream.', silly:['trex','icecream'], normal:[['trex','plant'],['bear','honey'],['monkey','banana']] },
  { yes:'A frog in a fancy hat.', silly:['frog','hat'], normal:[['frog','water'],['duck','water'],['dog','bone']] }
];""",
"silly",
)

swap(
"""const PLACES = [
  {say:'Ball in the box.', glyph:'⚽', prop:'box', answer:'in', opts:['in','on','under']},
  {say:'Ball on the box.', glyph:'⚽', prop:'box', answer:'on', opts:['in','on','under']},
  {say:'Ball under the box.', glyph:'⚽', prop:'box', answer:'under', opts:['in','on','under']},
  {say:'Apple in the bowl.', glyph:'🍎', prop:'bowl', answer:'in', opts:['in','on','under']},
  {say:'Cat on the bed.', glyph:'🐱', prop:'bed', answer:'on', opts:['on','under','beside']},
  {say:'Duck under the hat.', glyph:'🦆', prop:'hat', answer:'under', opts:['under','on','beside']}
];""",
"""const PLACES = [
  {say:'Ball in the box.', glyph:'ball', prop:'box', answer:'in', opts:['in','on','under']},
  {say:'Ball on the box.', glyph:'ball', prop:'box', answer:'on', opts:['in','on','under']},
  {say:'Ball under the box.', glyph:'ball', prop:'box', answer:'under', opts:['in','on','under']},
  {say:'Apple in the bowl.', glyph:'apple', prop:'bowl', answer:'in', opts:['in','on','under']},
  {say:'Cat on the bed.', glyph:'cat', prop:'bed', answer:'on', opts:['on','under','beside']},
  {say:'Duck under the hat.', glyph:'duck', prop:'hat', answer:'under', opts:['under','on','beside']}
];""",
"places",
)

swap("/* ---------- speech ---------- */", CLIPS + "\n/* ---------- speech ---------- */", "clips")

old_speak = """function stopTalk(){
  talkGen++;
  talking = false;
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
}
function speak(text){
  if (!('speechSynthesis' in window) || !text) return;
  // Cutting a line off and starting the next in the same instant makes iOS
  // drop the chosen voice and fall back to a flatter one. Wait a beat.
  // talkGen drops a line that was still waiting, so it cannot talk over the new one.
  const gen = ++talkGen;
  const say = () => {
    if (gen !== talkGen) return;
    if (!voice) loadVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    else u.lang = 'en-US';
    u.rate = vRate; u.pitch = vPitch; u.volume = 1;
    u.onend = u.onerror = () => { if (gen === talkGen) talking = false; };
    talking = true;
    speechSynthesis.speak(u);
  };
  if (talking){
    talking = false;
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    setTimeout(say, 80);
  } else say();
}"""

new_speak = """let voiceAudio = null;
let voiceWait = 0;
function stopTalk(){
  talkGen++;
  voiceWait++;
  talking = false;
  if (voiceAudio) voiceAudio.pause();
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
}
function onVoiceDone(fn){
  const token = voiceWait;
  if (!voiceAudio) return;
  const a = voiceAudio;
  const finish = () => {
    if (token !== voiceWait) return;
    a.removeEventListener('ended', finish);
    a.removeEventListener('error', finish);
    fn();
  };
  a.addEventListener('ended', finish);
  a.addEventListener('error', finish);
}
function speak(text){
  if (!text) return;
  const gen = ++talkGen;
  voiceWait++;
  const clip = (typeof VOICE_CLIPS !== 'undefined') && VOICE_CLIPS[text];
  // Phone voice is only the backup. The 80ms wait keeps iOS from dropping it.
  const sayDevice = () => {
    if (!('speechSynthesis' in window)) return;
    const say = () => {
      if (gen !== talkGen) return;
      if (!voice) loadVoice();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      else u.lang = 'en-US';
      u.rate = vRate; u.pitch = vPitch; u.volume = 1;
      u.onend = u.onerror = () => { if (gen === talkGen) talking = false; };
      talking = true;
      speechSynthesis.speak(u);
    };
    if (talking){
      talking = false;
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      setTimeout(say, 80);
    } else say();
  };
  if (!clip){ sayDevice(); return; }
  const playClip = () => {
    if (gen !== talkGen) return;
    try {
      if (!voiceAudio) voiceAudio = new Audio();
      const a = voiceAudio;
      a.onended = () => { if (gen === talkGen) talking = false; };
      a.onerror = () => { if (gen === talkGen) sayDevice(); };
      a.src = clip;
      talking = true;
      const started = a.play();
      if (started && started.catch) started.catch(() => { if (gen === talkGen) sayDevice(); });
    } catch (e) { sayDevice(); }
  };
  if (talking){
    talking = false;
    if (voiceAudio) voiceAudio.pause();
    if ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
    setTimeout(playClip, 60);
  } else playClip();
}"""

swap(old_speak, new_speak, "speak")

swap(
"""function objWord(e, n){
  const map = {'🍎':['apple','apples'],'🍌':['banana','bananas'],'⭐':['star','stars'],'🐟':['fish','fish'],'🌸':['flower','flowers'],'🚗':['car','cars'],'🎈':['balloon','balloons'],'🐝':['bee','bees'],'🍓':['strawberry','strawberries'],'🦋':['butterfly','butterflies']};
  const pair = map[e] || ['thing','things'];
  return n === 1 ? pair[0] : pair[1];
}""",
"""function objWord(id, n){
  const map = {apple:['apple','apples'],banana:['banana','bananas'],star:['star','stars'],fish:['fish','fish'],flower:['flower','flowers'],car:['car','cars'],balloon:['balloon','balloons'],bee:['bee','bees'],strawberry:['strawberry','strawberries'],butterfly:['butterfly','butterflies']};
  const pair = map[id] || ['thing','things'];
  return n === 1 ? pair[0] : pair[1];
}
function photoHTML(id){
  const dinos = {trex:1,brachiosaurus:1,stegosaurus:1,triceratops:1,pterodactyl:1,raptor:1};
  const folder = dinos[id] ? 'dinos' : 'photos';
  return `<img class="photo" alt="" src="assets/${folder}/${id}.jpg">`;
}""",
"objWord",
)

swap(
"""function pile(emoji, n){
  if (!n) return '<div class="objects empty"></div>';
  let s = '';
  for (let i = 0; i < n; i++) s += '<span>' + emoji + '</span>';
  return '<div class="objects">' + s + '</div>';
}""",
"""function pile(id, n){
  if (!n) return '<div class="objects empty"></div>';
  let s = '';
  for (let i = 0; i < n; i++) s += '<span>' + photoHTML(id) + '</span>';
  return '<div class="objects">' + s + '</div>';
}""",
"pile",
)

swap(
"""function sillyCard(pair){
  return `<span class="silly-pic"><b>${pair[0]}</b><b>${pair[1]}</b></span>`;
}""",
"""function sillyCard(pair){
  return `<span class="silly-pic"><b>${photoHTML(pair[0])}</b><b>${photoHTML(pair[1])}</b></span>`;
}""",
"sillyCard",
)

swap(
"""function scene(glyph, spot, prop){
  return `<div class="scene sc-${spot} prop-${prop}"><b class="prop"></b><span class="glyph">${glyph}</span></div>`;
}""",
"""function scene(id, spot, prop){
  return `<div class="scene sc-${spot} prop-${prop}"><b class="prop"></b><span class="glyph">${photoHTML(id)}</span></div>`;
}""",
"scene",
)

swap(
"""    ? `<div class="seq-item">${a.emoji}</div>`""",
"""    ? `<div class="seq-item">${photoHTML(a.name)}</div>`""",
"who row",
)

n_animals = text.count("emojiTile(a.emoji)")
if n_animals != 7:
    sys.exit(f"animal tiles: found {n_animals}")
text = text.replace("emojiTile(a.emoji)", "photoHTML(a.name)")

# rhyme choices and letter pictures
swap("emojiTile(item[1])", "photoHTML(item[1])", "rhyme tile")
swap('stage:`<div class="big-show">${row[2]}</div>`',
     'stage:`<div class="big-show">${photoHTML(row[2])}</div>`',
     "letter picture")

swap(
"""function dinoTile(d){ return `<svg viewBox="0 0 120 100">${d.svg}</svg>`; }""",
"""function dinoTile(d){ return `<img class="photo dino" alt="" src="assets/dinos/${d.file}.jpg">`; }""",
"dino tile",
)

swap(
"""stage:`<div class="dino-big"><svg viewBox="0 0 120 100">${d.svg}</svg></div>`""",
"""stage:`<div class="dino-big"><img class="photo" alt="" src="assets/dinos/${d.file}.jpg"></div>`""",
"museum",
)

swap("stage:pile('🐟', 4)", "stage:pile('fish', 4)", "turns fish stage")
swap("choices:[2,3,4,5].map(v => ({render:pile('🐟', v), correct:v === 4}))",
     "choices:[2,3,4,5].map(v => ({render:pile('fish', v), correct:v === 4}))",
     "turns fish choices")
swap("stage:pile('⭐', 2)", "stage:pile('star', 2)", "turns stars stage")
swap("choices:[1,2,3].map(v => ({render:pile('⭐', v), correct:v === 2}))",
     "choices:[1,2,3].map(v => ({render:pile('star', v), correct:v === 2}))",
     "turns stars choices")
swap("stage:pile('🍪', 3)", "stage:pile('cookie', 3)", "turns cookie stage")
swap("choices:[1,2,3,4].map(v => ({render:pile('🍪', v), correct:v === 2}))",
     "choices:[1,2,3,4].map(v => ({render:pile('cookie', v), correct:v === 2}))",
     "turns cookie choices")

swap(
"""return { say:'Which one does not belong?', choices:shuffle(sizes.map(sz => ({ render:`<span class="emoji" style="font-size:${sz}px">⭐</span>`, correct:sz === odd }))) };""",
"""return { say:'Which one does not belong?', choices:shuffle(sizes.map(sz => ({ render:`<img class="photo" alt="" src="assets/photos/star.jpg" style="width:${sz}px;height:${sz}px">`, correct:sz === odd }))) };""",
"odd size",
)

swap(
"""    speak(round.say || '');
    if (round.sound) setTimeout(() => { if (gen === roundGen) playAnimal(round.sound); }, 750);""",
"""    speak(round.say || '');
    if (round.sound){
      let heard = false;
      const kick = () => { if (heard || gen !== roundGen) return; heard = true; playAnimal(round.sound); };
      if (VOICE_CLIPS[round.say]){ onVoiceDone(kick); setTimeout(kick, 6000); }
      else setTimeout(kick, 750);
    }""",
"animal after voice",
)

swap(
"""  speak(state.current.say);
  if (state.current.sound) setTimeout(() => { if (gen === roundGen) playAnimal(state.current.sound); }, 750);""",
"""  speak(state.current.say);
  if (state.current.sound){
    let heard = false;
    const kick = () => { if (heard || gen !== roundGen) return; heard = true; playAnimal(state.current.sound); };
    if (VOICE_CLIPS[state.current.say]){ onVoiceDone(kick); setTimeout(kick, 6000); }
    else setTimeout(kick, 750);
  }""",
"replay animal",
)

swap(
"""  speak('Lets play and learn!');
  unlockAudio();""",
"""  speak('Lets play and learn!');
  unlockAudio();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(()=>{});""",
"service worker",
)

# scene under position: the original file used bottom:0 for under. Confirm the css swap matched.
if "prop-box .prop" not in text:
    sys.exit("scene css missing")
if text.count("emojiTile(a.emoji)") != 0:
    sys.exit("animal emoji left")
if "d.svg" in text:
    sys.exit("svg dino left")

HTML.write_text(text, encoding="utf-8")
print("patched", HTML.name, "bytes", HTML.stat().st_size)
