#!/usr/bin/env node
/**
 * Record SHA existence check.
 *
 * Every git object a constitutional FREEZE.json names must exist in this
 * repository as the type its field claims. A SHA typed from memory that is
 * wrong breaks the chain of evidence as badly as a missing record.
 *
 * Fail-closed: a 40-hex value under a key that is not classified below is an
 * error, so a new hash-bearing field forces a decision about what it names.
 * Refuses on a shallow clone (missing objects would read as false failures).
 *
 * Markdown records under docs/programme/ and docs/ops/ write commit references
 * as commit:`<hex>` (7-40 hex). Each must resolve to a commit object; any other
 * text inside commit:`…` fails as MALFORMED rather than being skipped. Only that
 * marked form is checked, so content hashes (sha256 digests, blob hashes in
 * prose) are never mistaken for commits.
 *
 * Exit: 0 all present · 1 missing / wrong type / unclassified · 2 cannot check.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const SCAN = join(ROOT, 'tests/constitutional');
const COMMIT_KEYS = new Set(['commit', 'base', 'freeze_commit', 'previous_freeze_commit', 'previous_canonical_merge']);
const BLOB_KEYS = new Set(['blob', 'previous_blob', 'new_blob']);
// A `frozen` object maps a repository path to the git blob hash of that file's bytes.
const BLOB_MAPS = new Set(['frozen']);
const HEX40 = /^[0-9a-f]{40}$/i;
const MD_DIRS = ['docs/programme', 'docs/ops'];
// Match every commit:`…` and judge its shape afterwards: a narrower pattern would
// silently skip a malformed reference (e.g. a 41-char SHA) instead of failing it.
const MD_COMMIT = /commit:`([^`]*)`/gi;
const COMMIT_SHAPE = /^[0-9a-f]{7,40}$/i;

function classify(key, parent) {
  if (BLOB_MAPS.has(parent) || BLOB_KEYS.has(key)) return 'blob';
  if (COMMIT_KEYS.has(key) || key.endsWith('_commit')) return 'commit';
  return null;
}

function git(args) {
  try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return null; }
}

if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
  console.error('CANNOT CHECK: shallow clone. Fetch full history (actions/checkout fetch-depth: 0).');
  process.exit(2);
}

function freezeFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...freezeFiles(p));
    else if (name === 'FREEZE.json') out.push(p);
  }
  return out;
}

function walk(node, path, parent, found) {
  if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}[${i}]`, parent, found));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string' && HEX40.test(v)) found.push({ key: k, parent, value: v, path: `${path}.${k}` });
    else walk(v, `${path}.${k}`, k, found);
  }
}

let bad = 0, checked = 0;
for (const file of freezeFiles(SCAN)) {
  const rel = relative(ROOT, file);
  const found = [];
  walk(JSON.parse(readFileSync(file, 'utf8')), '$', null, found);
  for (const { key, parent, value, path } of found) {
    const want = classify(key, parent);
    checked++;
    if (!want) { bad++; console.error(`UNCLASSIFIED ${rel} ${path} = ${value} (classify the key in check-record-shas.mjs)`); continue; }
    const got = git(['cat-file', '-t', value]);
    if (got !== want) { bad++; console.error(`${got ? 'WRONG TYPE' : 'MISSING'} ${rel} ${path} = ${value} (want ${want}${got ? `, got ${got}` : ''})`); }
  }
}
function markdownFiles(dir) {
  const out = [];
  let names;
  try { names = readdirSync(dir); } catch { return out; }
  for (const name of names) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...markdownFiles(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

for (const dir of MD_DIRS) for (const file of markdownFiles(join(ROOT, dir))) {
  const rel = relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(MD_COMMIT)) {
      checked++;
      if (!COMMIT_SHAPE.test(m[1])) { bad++; console.error(`MALFORMED ${rel}:${i + 1} commit:\`${m[1]}\` (want 7-40 hex)`); continue; }
      const got = git(['cat-file', '-t', m[1]]);
      if (got !== 'commit') { bad++; console.error(`${got ? 'WRONG TYPE' : 'MISSING OR AMBIGUOUS'} ${rel}:${i + 1} commit:\`${m[1]}\`${got ? ` (got ${got})` : ''}`); }
    }
  });
}

if (bad) { console.error(`RECORD SHAS: ${bad} of ${checked} failed`); process.exit(1); }
console.log(`RECORD SHAS: ${checked} of ${checked} present with the claimed type`);
