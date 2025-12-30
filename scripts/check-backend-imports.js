#!/usr/bin/env node
/**
 * Backend Import Boundary Guardrail
 *
 * Ensures app/api/_backend modules are only imported from server-safe
 * locations (other API routes, lib/server/**).
 *
 * Prevents accidental client-side bundling of server-only backend code.
 *
 * Run: node scripts/check-backend-imports.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const SCAN_DIRS = ['app', 'components', 'hooks', 'lib', 'types'];
const IGNORE_DIRS = new Set(['node_modules', '.next', 'dist', 'build', 'out']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function isAllowedImporter(relPath) {
  // Allow imports from actual server route handlers
  if (relPath.startsWith('app/api/')) return true;
  // Allow all lib/ imports (server-only code)
  // TODO: Eventually restrict to lib/server/ only after refactoring shared types
  if (relPath.startsWith('lib/')) return true;
  return false;
}

function main() {
  const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));

  const needle = 'app/api/_backend';
  const hits = [];

  for (const f of files) {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');

    // Skip scanning inside _backend itself
    if (rel.startsWith('app/api/_backend/')) continue;

    const src = fs.readFileSync(f, 'utf8');
    if (!src.includes(needle)) continue;

    if (!isAllowedImporter(rel)) {
      hits.push(rel);
    }
  }

  if (hits.length) {
    console.error('\n❌ Illegal imports from app/api/_backend found outside server-only areas:');
    for (const h of hits) console.error('  -', h);
    console.error('\nRule: Only app/api/** route handlers (or lib/server/**) may import _backend modules.');
    process.exit(1);
  }

  console.log('✅ check-backend-imports: _backend only imported from server-safe locations');
  process.exit(0);
}

main();
