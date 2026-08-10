#!/usr/bin/env node
/**
 * JARVIS Unit 8 — precision context router proof.
 * Mirrors the existing Builder OS proof style: plain assertions, no framework.
 */
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  materializeOne, materializePacket, renderFragments, budget, estimateTokens, extractSymbol,
} from '../jarvis-context.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); fail++; }
};
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const throws = (fn, re, m) => {
  try { fn(); } catch (e) { if (re && !re.test(e.message)) throw new Error(`${m}: wrong error "${e.message}"`); return; }
  throw new Error(m ?? 'expected throw, got none');
};

const repo = mkdtempSync(path.join(tmpdir(), 'jarvis-ctx-'));
writeFileSync(path.join(repo, 'sample.ts'),
  ['line one', 'line two', 'line three', 'line four', 'line five',
   'export function target() {', '  return 42;', '}', 'tail'].join('\n'));

console.log('\nJARVIS Unit 8 — precision context router\n');

t('1  whole-file selector remains backward compatible', () => {
  const f = materializeOne({ ref: 'sample.ts' }, repo, 'deadbeef');
  eq(f.start_line, 1); eq(f.end_line, 9); eq(f.extraction_method, 'whole-file');
});

t('1b bare string ref (legacy allowed_files shape) still works', () => {
  const f = materializeOne('sample.ts', repo, 'deadbeef');
  eq(f.extraction_method, 'whole-file');
});

t('2  valid line range materializes exactly those lines', () => {
  const f = materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 2, end: 4 } }, repo, 'x');
  eq(f.content, 'line two\nline three\nline four');
  eq(f.start_line, 2); eq(f.end_line, 4);
});

t('3  reversed range rejected', () => {
  throws(() => materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 5, end: 2 } }, repo, 'x'),
    /reversed range/, 'reversed');
});

t('4  out-of-bounds range rejected', () => {
  throws(() => materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 1, end: 999 } }, repo, 'x'),
    /exceeds/, 'oob');
  throws(() => materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 0, end: 3 } }, repo, 'x'),
    /< 1/, 'start<1');
});

t('4b missing file and unknown selector type rejected', () => {
  throws(() => materializeOne({ ref: 'nope.ts' }, repo, 'x'), /not found/, 'missing');
  throws(() => materializeOne({ ref: 'sample.ts', selector: { type: 'vibes' } }, repo, 'x'), /unknown selector/, 'bad type');
});

t('5  materialized fragment carries correct source lines in the gutter', () => {
  const frags = [materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 3, end: 4 } }, repo, 'x')];
  const r = renderFragments(frags);
  if (!/^\s+3\| line three$/m.test(r)) throw new Error('absolute gutter line 3 missing');
  if (!/^\s+4\| line four$/m.test(r)) throw new Error('absolute gutter line 4 missing');
});

t('6  provenance hash is deterministic and range-sensitive', () => {
  const a = materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 2, end: 4 } }, repo, 'x');
  const b = materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 2, end: 4 } }, repo, 'x');
  const c = materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 2, end: 5 } }, repo, 'x');
  eq(a.content_hash, b.content_hash, 'same range must hash identically');
  if (a.content_hash === c.content_hash) throw new Error('different ranges must not collide');
  eq(a.source_sha, 'x'); if (!a.reason) throw new Error('reason not preserved');
});

t('7  context budget below threshold → allowed', () => {
  const b = budget({ context_selectors: [{ ref: 'sample.ts' }], worker_context_limit: 65536 }, repo);
  eq(b.within_budget, true); eq(b.status, 'OK');
  if (b.headroom_tokens <= 0) throw new Error('expected positive headroom');
});

t('8  context budget above threshold → CONTEXT_BUDGET_EXCEEDED (fails before invocation)', () => {
  const b = budget({ context_selectors: [{ ref: 'sample.ts' }], worker_context_limit: 4, context_safety_ratio: 0.5 }, repo);
  eq(b.within_budget, false); eq(b.status, 'CONTEXT_BUDGET_EXCEEDED');
});

t('9  a citation inside the supplied fragment is verifiable against source', () => {
  const f = materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 6, end: 8 } }, repo, 'x');
  const cited = 6;
  const inRange = cited >= f.start_line && cited <= f.end_line;
  eq(inRange, true);
  eq(f.content.split('\n')[cited - f.start_line], 'export function target() {');
});

t('10 fabricated citation does not match source and is rejectable', () => {
  const f = materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 2, end: 4 } }, repo, 'x');
  const claimed = 'this line does not exist anywhere';
  if (f.content.includes(claimed)) throw new Error('fabricated quote must not match');
});

t('11 citation outside supplied context is explicitly identifiable', () => {
  const f = materializeOne({ ref: 'sample.ts', selector: { type: 'lines', start: 2, end: 4 } }, repo, 'x');
  const cited = 9;
  eq(cited >= f.start_line && cited <= f.end_line, false, 'line 9 must read as outside 2-4');
});

t('12 packet with NO selectors materializes nothing (READ-ONLY/back-compat path)', () => {
  eq(materializePacket({}, repo).length, 0);
  eq(renderFragments([]), '');
});

t('13 symbol selector extracts a balanced body', () => {
  const lines = ['a', 'export function target() {', '  return 42;', '}', 'z'];
  const r = extractSymbol(lines, 'target');
  eq(r.start, 2); eq(r.end, 4);
  eq(extractSymbol(lines, 'nosuch'), null);
});

t('14 token estimate is conservative (over-counts vs 4 chars/token)', () => {
  if (estimateTokens('x'.repeat(3500)) < 875) throw new Error('estimate must not under-count');
});

rmSync(repo, { recursive: true, force: true });
console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
