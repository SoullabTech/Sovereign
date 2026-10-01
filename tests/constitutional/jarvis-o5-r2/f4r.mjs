/**
 * JARVIS O5-R2A — F4-R · failure-code inventory, WIDENED (additive beside frozen F4).
 *
 * Founder act 2026-09-30: approve F4-R; do not alter the frozen suite; fail
 * closed if the extractor ever sees fewer codes than the measured baseline, so
 * the inventory itself cannot silently regress.
 *
 * Frozen F4 (O5-R1 @ af2f0203) reads `failure_class` literals and
 * `fail(` / `nativeRefusal(` call sites. The O5-R2 census measured 16 live codes
 * it cannot see, reaching `failure_class` through two other routes:
 *   (1) the `DELEGATE_EXIT_FAILURES` exit-code table (+ the `error?.code || '…'`
 *       fallback literal) in jarvis-runtime-pipeline.mjs;
 *   (2) `error.code = "…"` assignments in jarvis-native-prompt.mjs, surfaced by
 *       `fail(error?.code || …)`.
 * F4-R = frozen F4's inventory ∪ those routes. The LAW is F4's, unchanged:
 * preservation, one-of-seven cause, lawful response, no authority, unknown
 * fails closed. Only the REACH widens.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAUSES, CAUSE_RESPONSE, CLASSIFICATION_FORBIDDEN_FIELDS } from '../jarvis-o5-r1/contract.mjs';
import { existingFailureCodes } from '../jarvis-o5-r1/falsifiers.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/**
 * The explicit decision record (failure-code-inventory.json). F4-R requires the
 * live inventory to EQUAL it — not merely to exceed a floor:
 *   · a live code absent from the record  → FAIL: a new code needs an explicit mapping decision;
 *   · a recorded code no longer live      → FAIL: a retired code needs an explicit retirement,
 *                                            and an extractor that silently loses reach is caught here.
 * (Founder, 2026-09-30: the baseline must not be a permanent magic number.)
 */
export function decisionRecord() {
  return JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'failure-code-inventory.json'), 'utf8')).codes;
}

export const EXTENDED_SOURCES = Object.freeze({
  exitTable: 'scripts/builder/jarvis-runtime-pipeline.mjs',
  thrownCodes: Object.freeze(['scripts/builder/jarvis-native-prompt.mjs']),
});

const read = (rel) => readFileSync(path.join(REPO_ROOT, rel), 'utf8');

export function extendedFailureCodes() {
  const codes = new Set(existingFailureCodes());
  const pipeline = read(EXTENDED_SOURCES.exitTable);
  const table = pipeline.match(/DELEGATE_EXIT_FAILURES\s*=\s*\{([\s\S]*?)\};/);
  if (!table) throw new Error('F4-R instrument: DELEGATE_EXIT_FAILURES table not found');
  for (const m of table[1].matchAll(/['"]([A-Z][A-Z0-9_]{2,})['"]/g)) codes.add(m[1]);
  for (const m of pipeline.matchAll(/\bfail\(\s*[a-zA-Z_$.?]+\s*\|\|\s*['"]([A-Z][A-Z0-9_]{2,})['"]/g)) codes.add(m[1]);
  for (const rel of EXTENDED_SOURCES.thrownCodes) {
    for (const m of read(rel).matchAll(/\.code\s*=\s*['"]([A-Z][A-Z0-9_]{2,})['"]/g)) codes.add(m[1]);
  }
  return [...codes].sort();
}

export function F4R(d, { extract = extendedFailureCodes, record = decisionRecord } = {}) {
  const f = [];
  let codes;
  try { codes = extract(); } catch (e) { return { id: 'F4-R', pass: false, failures: [`instrument: ${e.message}`] }; }
  const recorded = new Set(record());
  const live = new Set(codes);
  for (const c of live) if (!recorded.has(c)) f.push(`${c}: live but not in the decision record — a new code requires an explicit mapping decision`);
  for (const c of recorded) if (!live.has(c)) f.push(`${c}: in the decision record but not live — retire it explicitly, or the extractor lost reach (fail closed)`);
  for (const code of codes) {
    let c;
    try { c = d.classify(code); } catch (e) { f.push(`${code}: classifier threw ${e.message}`); continue; }
    if (!c || c.code !== code) { f.push(`${code}: specific code not preserved (got ${c?.code})`); continue; }
    if (!CAUSES.includes(c.cause)) f.push(`${code}: cause ${c.cause} not one of the seven`);
    else if (c.response !== CAUSE_RESPONSE[c.cause]) f.push(`${code}: response ${c.response} ≠ lawful ${CAUSE_RESPONSE[c.cause]}`);
    for (const k of CLASSIFICATION_FORBIDDEN_FIELDS) if (k in c) f.push(`${code}: classification carries '${k}'`);
  }
  const u = d.classify('O5_R2_SYNTHETIC_UNKNOWN_CODE');
  if (u?.code !== 'O5_R2_SYNTHETIC_UNKNOWN_CODE' || u?.cause !== null || u?.classified !== false || u?.response !== 'STOP') {
    f.push('unknown code not failed closed');
  }
  return { id: 'F4-R', pass: f.length === 0, failures: f, count: codes.length };
}
