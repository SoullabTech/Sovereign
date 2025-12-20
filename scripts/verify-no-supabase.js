// backend: scripts/verify-no-supabase.js
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'lib', 'components', 'pages'];
const BAD = [
  '@supabase/supabase-js',
  '@supabase/auth-helpers',
  '/* Removed: Supabase client - use lib/db/postgres.ts instead */ {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue;
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) out.push(p);
  }
  return out;
}

let hits = [];
for (const d of SCAN_DIRS) {
  const dirPath = path.join(ROOT, d);
  if (!fs.existsSync(dirPath)) continue;

  const files = walk(dirPath);
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    for (const bad of BAD) {
      if (txt.toLowerCase().includes(bad.toLowerCase())) {
        hits.push({ file: f.replace(ROOT + path.sep, ''), bad });
      }
    }
  }
}

if (hits.length) {
  console.error('\n❌ Supabase references detected (not allowed):');
  for (const h of hits) console.error(`- ${h.file}  (matched: ${h.bad})`);
  console.error('\nRemove these references and rerun.\n');
  process.exit(1);
}

console.log('✅ No Supabase references found.');
