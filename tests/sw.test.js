const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'Kids Learning Game - 2026-06-04.html'), 'utf8');

test('the phone asks for the newest page before it uses the saved one', () => {
  assert.match(sw, /req\.mode === 'navigate'/);
  assert.match(sw, /cache: 'no-store'/);
  assert.match(sw, /searchParams\.set\('fresh'/);
  assert.doesNotMatch(sw, /if \(saved\) return saved;\s*const fresh = await fetch\(event\.request\)/);
  assert.match(html, /updateViaCache: 'none'/);
});
