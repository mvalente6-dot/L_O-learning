// Records the game's lines with a Google Gemini voice, one MP3 per line.
//
//   GEMINI_API_KEY=... node voice/render.js samples   # a few lines in each sample voice
//   GEMINI_API_KEY=... node voice/render.js all       # every line not recorded yet
//
// Normally run by .github/workflows/voice.yml, which reads the key from the
// repository secret GEMINI_API_KEY. Needs Node 18+ and ffmpeg. Safe to stop and
// rerun: it skips lines that already have a clip, and stops cleanly when Google's
// daily limit is reached so the next run picks up where this one left off.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const LINES = JSON.parse(fs.readFileSync(path.join(__dirname, 'lines.json'), 'utf8'));
const CLIPS = path.join(ROOT, 'audio', 'voice');
const SAMPLES = path.join(ROOT, 'audio', 'voice-samples');
const API = process.env.VOICE_API || 'https://generativelanguage.googleapis.com/v1beta/models/';
const KEY = process.env.GEMINI_API_KEY;
const MAX_MINUTES = Number(process.env.VOICE_MAX_MINUTES || 300);
const started = Date.now();

const sleep = ms => new Promise(r => setTimeout(r, ms));
class DailyLimit extends Error {}

let models = CONFIG.models.slice();

async function synth(text, voiceName){
  const body = {
    contents: [{ parts: [{ text: `${CONFIG.style} ${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  };
  for (let attempt = 0; ; attempt++){
    const model = models[0];
    if (!model) throw new Error('None of the voice models in voice/config.json worked.');
    const res = await fetch(API + model + ':generateContent', {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let json = null; try { json = JSON.parse(raw); } catch (e) {}
    if (res.ok){
      const part = (json && json.candidates && json.candidates[0] && json.candidates[0].content
        && (json.candidates[0].content.parts || []).find(p => p.inlineData && p.inlineData.data));
      if (part) return { model, mime: part.inlineData.mimeType || '', data: Buffer.from(part.inlineData.data, 'base64') };
      if (attempt < 3){ await sleep(2000); continue; }        // came back with no audio: try again
      throw new Error('No audio came back for: ' + text);
    }
    const msg = (json && json.error && json.error.message) || raw.slice(0, 300);
    if (res.status === 404 || (res.status === 400 && /not (found|supported)|does not support|unknown model/i.test(msg))){
      console.log(`Model ${model} isn't available (${res.status}); trying the next one.`);
      models.shift();
      continue;
    }
    if (res.status === 402) throw new Error('This key\'s Google project is on prepaid billing with no credit left. Use a key from a project without billing (free tier), or add credit in AI Studio. Google said: ' + msg);
    if (res.status === 401 || res.status === 403) throw new Error(`Google refused the key (${res.status}): ${msg}`);
    if (res.status === 429){
      if (/per ?day|PerDay|daily/i.test(raw)) throw new DailyLimit(msg);
      const hint = /"retryDelay":\s*"(\d+(?:\.\d+)?)s"/.exec(raw);
      const wait = hint ? Math.ceil(Number(hint[1]) * 1000) + 500 : Math.min(60000, 5000 * 2 ** attempt);
      if (attempt >= 8) throw new DailyLimit('still rate limited after several waits: ' + msg);
      console.log(`Rate limited; waiting ${Math.round(wait / 1000)}s.`);
      await sleep(wait);
      continue;
    }
    if (res.status >= 500 && attempt < 4){ await sleep(3000 * (attempt + 1)); continue; }
    throw new Error(`Google error ${res.status}: ${msg}`);
  }
}

// Gemini returns 24 kHz 16-bit mono PCM (sometimes already in a WAV wrapper).
// Trim the silence at both ends and save a small mono MP3.
function toMp3(audio, out){
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'voice-'));
  const input = path.join(tmp, 'in');
  const isWav = audio.data.slice(0, 4).toString('latin1') === 'RIFF';
  const data = !isWav && audio.data.length % 2 ? audio.data.slice(0, -1) : audio.data;   // whole 16-bit samples only
  fs.writeFileSync(input, data);
  const rate = (/rate=(\d+)/i.exec(audio.mime) || [0, '24000'])[1];
  const inArgs = isWav ? ['-i', input] : ['-f', 's16le', '-ar', rate, '-ac', '1', '-i', input];
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.12';
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inArgs, '-af', trim, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '48k', out]);
  fs.rmSync(tmp, { recursive: true, force: true });
}

function seconds(file){
  try {
    return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
  } catch (e) { return 0; }
}

function writeManifest(voice, model){
  const have = LINES.filter(l => fs.existsSync(path.join(CLIPS, l.key + '.mp3')));
  const m = { voice, model, recorded: have.length, total: LINES.length, clips: have.map(l => l.key) };
  fs.writeFileSync(path.join(CLIPS, 'manifest.json'), JSON.stringify(m) + '\n');
  return m;
}

async function samples(){
  fs.mkdirSync(SAMPLES, { recursive: true });
  const list = [];
  for (const voice of CONFIG.sampleVoices){
    for (const [i, text] of CONFIG.sampleLines.entries()){
      const file = `${voice}-${i + 1}.mp3`;
      if (!fs.existsSync(path.join(SAMPLES, file))){
        const audio = await synth(text, voice);
        toMp3(audio, path.join(SAMPLES, file));
        console.log(`${voice} ${i + 1}: ${text}`);
      }
      list.push({ voice, text, file });
    }
  }
  fs.writeFileSync(path.join(SAMPLES, 'samples.json'), JSON.stringify({ model: models[0], style: CONFIG.style, samples: list }, null, 1) + '\n');
  console.log(`Samples ready in audio/voice-samples (${list.length} clips, model ${models[0]}).`);
}

async function all(){
  const voice = process.env.VOICE || CONFIG.voice;
  if (!voice) throw new Error('Pick a voice first: set "voice" in voice/config.json.');
  fs.mkdirSync(CLIPS, { recursive: true });
  // ONLY (e.g. "start,school") limits a run to lines from those modes; empty = every line.
  const only = String(process.env.ONLY || '').split(',').map(x => x.trim()).filter(Boolean);
  const todo = LINES.filter(l => (!only.length || only.includes(l.from)) && !fs.existsSync(path.join(CLIPS, l.key + '.mp3')));
  if (only.length) console.log('Only recording lines from: ' + only.join(', '));
  console.log(`${LINES.length - todo.length} of ${LINES.length} lines already recorded; ${todo.length} to go, voice ${voice}.`);
  let done = 0, odd = [];
  try {
    for (const line of todo){
      if ((Date.now() - started) / 60000 > MAX_MINUTES){ console.log('Time is up for this run; the next run continues.'); break; }
      const audio = await synth(line.text, voice);
      const out = path.join(CLIPS, line.key + '.mp3');
      toMp3(audio, out);
      const s = seconds(out);
      // A clip far longer than its words usually means the voice wandered off script.
      if (s > 3 + line.text.length * 0.18 || s < 0.25) odd.push(`${s.toFixed(1)}s  ${line.text}`);
      done++;
      if (done % 25 === 0){ writeManifest(voice, models[0]); console.log(`${done} recorded this run.`); }
    }
  } catch (e){
    if (!(e instanceof DailyLimit)) { writeManifest(voice, models[0]); throw e; }
    console.log('Google\'s daily limit reached: ' + e.message);
  }
  const m = writeManifest(voice, models[0]);
  if (odd.length) console.log('Worth a listen (unusual length):\n  ' + odd.join('\n  '));
  console.log(`Recorded ${done} this run; ${m.recorded} of ${m.total} lines now have a clip.`);
}

(async () => {
  if (!KEY) { console.error('GEMINI_API_KEY is not set. Add it as a repository secret named GEMINI_API_KEY.'); process.exit(1); }
  const mode = process.argv[2] || 'samples';
  if (mode === 'samples') await samples();
  else if (mode === 'all') await all();
  else throw new Error('Use "samples" or "all".');
})().catch(e => { console.error(e.message || e); process.exit(1); });
