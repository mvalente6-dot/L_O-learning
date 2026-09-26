const path = require('path');
const { chromium } = require('playwright');

const FILE = 'file://' + path.resolve(__dirname, '..', 'Kids Learning Game - 2026-06-04.html');
const NIGHT = [
  'Who gets a goodnight hug?',
  'What was a gentle part of today?',
  'Which toy should sleep beside you?',
  'What do you want to dream about?',
  'What soft sound do you hear?',
  'Who made you smile today?',
  'What should we thank the day for?',
  'Are you cozy?'
];

async function run(width, height, label){
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', err => errors.push(String(err)));
  await page.goto(FILE);
  await page.click('#startBtn');
  await page.waitForTimeout(200);
  const owenTiles = await page.locator('#catGrid .lbl').allTextContents();
  if (owenTiles.includes('Letters')) throw new Error(label + ' Owen sees Letters');
  if (!owenTiles.includes('Move')) throw new Error(label + ' Owen missing Move');
  await page.locator('.cat', { hasText: 'Move' }).click();
  const before = await page.locator('#starCount').textContent();
  await page.locator('#choices .choice').click();
  const after = await page.locator('#starCount').textContent();
  if (before !== '0' || after !== '0') throw new Error(label + ' Move gave a star');
  await page.click('#homeBtn');
  await page.locator('.cat', { hasText: 'Colors' }).click();
  const wrong = page.locator('#choices .choice:not([data-correct="1"])').first();
  await wrong.click();
  await wrong.click();
  const hinted = await page.locator('#choices .choice.hint').count();
  if (hinted !== 1) throw new Error(label + ' hint missing ' + hinted);
  await page.locator('#choices .choice[data-correct="1"]').click({ force: true });
  if (await page.locator('#starCount').textContent() !== '1') throw new Error(label + ' star did not show');
  await page.reload();
  await page.click('#startBtn');
  if (await page.locator('#starCount').textContent() !== '1') throw new Error(label + ' star was forgotten');
  await page.click('#homeBtn');
  await page.locator('#toggle button.complex').click();
  const lucasTiles = await page.locator('#catGrid .lbl').allTextContents();
  if (!lucasTiles.includes('Letters') || !lucasTiles.includes('Rhymes')) throw new Error(label + ' Lucas tiles ' + lucasTiles.join(','));
  await page.locator('.cat', { hasText: 'Letters' }).click();
  if (await page.locator('#choices .choice').count() < 3) throw new Error(label + ' letters had too few choices');
  await page.click('#homeBtn');
  await page.click('#sparksEntry');
  await page.click('#sparkMoon');
  const night = (await page.locator('#sparkText').textContent()).trim();
  if (!NIGHT.includes(night)) throw new Error(label + ' night text: ' + night);
  const progress = (await page.locator('#sparkProgress').textContent()).trim();
  if (progress !== '1 / 8') throw new Error(label + ' night progress ' + progress);
  const shot = path.join('/tmp', 'play-' + label + '.png');
  await page.screenshot({ path: shot, fullPage: true });
  await browser.close();
  if (errors.length) throw new Error(label + ' page errors: ' + errors.join('\n'));
  console.log(label, 'ok', shot);
}

(async () => {
  await run(390, 844, 'phone');
  await run(1280, 800, 'desktop');
})().catch(err => { console.error(err); process.exit(1); });
