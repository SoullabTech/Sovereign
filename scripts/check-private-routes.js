#!/usr/bin/env node
/**
 * Private Folder Route Guardrail
 *
 * Ensures no Next.js "special" route files (page.tsx, route.ts, etc.)
 * exist inside app/api/_backend/** - these would be dead/confusing
 * since private folders are excluded from routing.
 *
 * Run: node scripts/check-private-routes.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'app', 'api', '_backend');

// Next.js "special" files that imply routing/segments
const SPECIAL = new Set([
  'route.ts', 'route.js',
  'page.tsx', 'page.jsx', 'page.ts', 'page.js',
  'layout.tsx', 'layout.jsx', 'layout.ts', 'layout.js',
  'loading.tsx', 'loading.jsx', 'loading.ts', 'loading.js',
  'error.tsx', 'error.jsx', 'error.ts', 'error.js',
  'template.tsx', 'template.jsx', 'template.ts', 'template.js',
  'not-found.tsx', 'not-found.jsx', 'not-found.ts', 'not-found.js'
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    console.log('check-private-routes: app/api/_backend does not exist (ok)');
    process.exit(0);
  }

  const hits = walk(TARGET_DIR)
    .filter((f) => SPECIAL.has(path.basename(f)))
    .map((f) => path.relative(ROOT, f));

  if (hits.length) {
    console.error('\n❌ Found routable/special Next files inside app/api/_backend (dead/confusing):');
    for (const h of hits) console.error('  -', h);
    console.error('\nMove these to app/api/** (real routes) or rename them (e.g. route.logic.ts).');
    process.exit(1);
  }

  console.log('✅ check-private-routes: no Next special route files in app/api/_backend');
  process.exit(0);
}

main();
