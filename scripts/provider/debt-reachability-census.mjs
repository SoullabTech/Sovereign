#!/usr/bin/env node
// PROVIDER DEBT REACHABILITY CENSUS — read-only.
//
// Question (founder, 2026-09-14):
//   For every allowlisted OpenAI migration-debt surface, what is its CURRENT CLASS
//     production-reachable · explicitly lab-gated · dormant/no importers · legacy-unreachable
//   and CAN ITS CLASS WORSEN without `check:no-openai` failing?
//
// ⛔ This is a census, not a guard. It enforces nothing and changes nothing.
// ⭐ Self-exclusion: this instrument is excluded from every graph it builds (six prior
//    self-contamination incidents in the adjacent lane; the exclusion belongs to the instrument).

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const SELF = 'scripts/provider/debt-reachability-census.mjs';
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' })
  .split('\n').map(s => s.trim()).filter(Boolean)
  .filter(f => EXT.includes(path.extname(f)))
  .filter(f => f !== SELF);
const trackedSet = new Set(tracked);

// ---- resolve a specifier to a repo-relative file ----------------------------------
function resolve(spec, fromFile) {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec));
  else return null;                                  // bare package specifier
  const cands = [base, ...EXT.map(e => base + e), ...EXT.map(e => `${base}/index${e}`)];
  return cands.find(c => trackedSet.has(c)) || null;
}

const IMPORT_RE = /(?:import\s[^'"]*from\s*|import\s*|export\s[^'"]*from\s*|require\(\s*|import\(\s*)['"]([^'"]+)['"]/g;
const forward = new Map();   // file -> Set(files it imports)
const reverse = new Map();   // file -> Set(files that import it)
for (const f of tracked) {
  let src = '';
  try { src = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
  const outs = new Set();
  for (const m of src.matchAll(IMPORT_RE)) {
    const t = resolve(m[1], f);
    if (t && t !== f) outs.add(t);
  }
  forward.set(f, outs);
  for (const t of outs) {
    if (!reverse.has(t)) reverse.set(t, new Set());
    reverse.get(t).add(f);
  }
}

// ---- production roots --------------------------------------------------------------
const isTest   = (f) => /(^|\/)(__tests__|__mocks__)\//.test(f) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(f);
const isScript = (f) => f.startsWith('scripts/');
const isRoot   = (f) => (f === 'middleware.ts' || /^app\/.*\/(route|page|layout)\.tsx?$/.test(f) || /^app\/(page|layout)\.tsx$/.test(f))
                        && !isTest(f);
const roots = tracked.filter(isRoot);

// BFS forward from production roots
const prodReach = new Set();
const q = [...roots];
while (q.length) {
  const f = q.pop();
  if (prodReach.has(f)) continue;
  prodReach.add(f);
  for (const t of (forward.get(f) || [])) if (!prodReach.has(t)) q.push(t);
}

// ---- debt surfaces from the policy -------------------------------------------------
const policy = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/provider-policy.json'), 'utf8'));
const groups = policy.openai_removal || {};
const debt = [];
for (const [group, g] of Object.entries(groups)) {
  if (!g || typeof g !== 'object') continue;
  for (const f of (g.files || [])) debt.push({ group, file: f });
  for (const p of (g.path_prefixes || []))
    for (const f of tracked.filter(x => x.startsWith(p))) debt.push({ group, file: f, bulk: p });
}

// shortest production path to a debt file, for evidence
function pathFromProduction(target) {
  const seen = new Set([target]);
  let frontier = [[target]];
  for (let depth = 0; depth < 12; depth++) {
    const next = [];
    for (const chain of frontier) {
      const head = chain[0];
      for (const imp of (reverse.get(head) || [])) {
        if (seen.has(imp)) continue;
        seen.add(imp);
        const c = [imp, ...chain];
        if (isRoot(imp)) return c;
        next.push(c);
      }
    }
    if (!next.length) break;
    frontier = next;
  }
  return null;
}

const classify = (f) => {
  if (!trackedSet.has(f)) return 'ABSENT (not tracked)';
  const importers = reverse.get(f) || new Set();
  const nonTest = [...importers].filter(x => !isTest(x));
  if (prodReach.has(f)) return 'PRODUCTION-REACHABLE';
  if (nonTest.length === 0 && importers.size === 0) return 'DORMANT · no importers';
  if (nonTest.length === 0) return 'TEST-ONLY importers';
  if (nonTest.every(isScript)) return 'SCRIPT-ONLY importers';
  return 'REACHABLE, not from a production root';
};

const buckets = new Map();
console.log('PROVIDER DEBT REACHABILITY CENSUS — read-only');
console.log(`root: ${ROOT}   HEAD: ${execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim()}`);
console.log(`graph: ${tracked.length} tracked source files · ${roots.length} production roots · ${prodReach.size} production-reachable\n`);

const named = debt.filter(d => !d.bulk);
const bulk  = debt.filter(d => d.bulk);
console.log(`NAMED debt surfaces: ${named.length}   ·   BULK prefix surfaces: ${bulk.length}\n`);
console.log('── NAMED SURFACES (each one an explicit policy entry) ──');
for (const { group, file } of named) {
  const cls = classify(file);
  buckets.set(cls, (buckets.get(cls) || 0) + 1);
  const importers = [...(reverse.get(file) || [])];
  let line = `  ${cls.padEnd(34)} ${file}`;
  if (cls === 'PRODUCTION-REACHABLE') {
    const p = pathFromProduction(file);
    line += p ? `\n${' '.repeat(38)}via ${p.join(' → ')}` : '';
  } else if (importers.length) {
    line += `\n${' '.repeat(38)}importers: ${importers.slice(0, 3).join(', ')}${importers.length > 3 ? ` (+${importers.length - 3})` : ''}`;
  }
  console.log(line);
}

console.log('\nSUMMARY · NAMED SURFACES');
for (const [k, v] of [...buckets].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);
console.log(`  ${String(named.length).padStart(3)}  TOTAL named debt surfaces`);

const bb = new Map();
for (const { file } of bulk) { const c = classify(file); bb.set(c, (bb.get(c) || 0) + 1); }
console.log('\nSUMMARY · BULK PREFIX (legacy_backend) — aggregate only');
for (const [k, v] of [...bb].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log(`  ${String(bulk.length).padStart(4)}  TOTAL prefix-covered surfaces`);
const bulkProd = bulk.filter(d => prodReach.has(d.file));
if (bulkProd.length) {
  console.log('\n  ⚠️ PRODUCTION-REACHABLE inside the legacy prefix:');
  for (const d of bulkProd.slice(0, 15)) {
    const pth = pathFromProduction(d.file);
    console.log(`     ${d.file}${pth ? `\n        via ${pth.join(' → ')}` : ''}`);
  }
  if (bulkProd.length > 15) console.log(`     … +${bulkProd.length - 15} more`);
}
