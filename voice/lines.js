// Writes voice/lines.json: every line the game speaks, with the clip name for each.
// Run after changing anything the game says:  node voice/lines.js
const fs = require('fs');
const { collect, LINES_FILE } = require('./collect.js');
const lines = collect({ rounds: 20000 });
const keys = new Set(lines.map(l => l.key));
if (keys.size !== lines.length) throw new Error('two lines share a clip name');
fs.writeFileSync(LINES_FILE, JSON.stringify(lines, null, 1) + '\n');
const chars = lines.reduce((n, l) => n + l.text.length, 0);
console.log(`${lines.length} lines, ${chars} characters -> voice/lines.json`);
