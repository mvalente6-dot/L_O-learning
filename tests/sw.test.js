const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('the phone asks for the newest page before it uses the saved one', () => {
  assert.match(sw, /req\.mode === 'navigate'/);
  assert.match(sw, /cache: 'no-store'/);
  assert.match(sw, /searchParams\.set\('fresh'/);
  assert.match(sw, /new Response/);
  assert.doesNotMatch(sw, /if \(saved\) return saved;\s*const fresh = await fetch\(event\.request\)/);
  assert.match(html, /updateViaCache: 'none'/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /apple-mobile-web-app-status-bar-style" content="black-translucent"/);
  const oldName = 'Kids Learning Game - 2026-06-04.html';
  assert.equal(fs.readlinkSync(path.join(root, oldName)), 'index.html');
  const manifest = fs.readFileSync(path.join(root, 'manifest.json'), 'utf8');
  assert.match(manifest, /"display": "fullscreen"/);
});
