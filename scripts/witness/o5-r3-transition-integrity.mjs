/**
 * O5-R3 — C6A AUTHORIZED TRANSITION INTEGRITY. Read-only.
 *
 * Founder ruling (2026-10-01, option b): the admission statement claims "a single authorized
 * acquisition". Frozen C8 proves only byte-identity ACROSS the refused second writer, so this
 * law brings the instrument up to the claim. C8 is untouched; this is a distinct question:
 *
 *   pre-write standing (C6-pre) → authorized transition integrity (C6A)
 *     → post-write current-holder proof (C6) → second-writer refusal integrity (C7, C8)
 *
 * LAW — from the saved pre-write baseline to the post-write state:
 *   T1  exactly one new lease generation exists, numbered max(before)+1
 *   T2  that generation is held by THIS Desktop incarnation (host + pid + process start time)
 *   T3  prior lease history is unchanged (every earlier generation byte-identical, none removed)
 *   T4  grant ledgers are append-only (none removed, none shortened)
 *   T5  prior ledger bytes are unchanged (the old bytes are an exact prefix)
 *   T6  no more than one Work Unit ledger changed (a new ledger file counts as changed)
 *   T7  no other governed artifact changed (quarantine, append locks, lease temp files, anything else
 *       under the governed roots)
 *
 * SCOPE (founder refinement): only the governed state of this witness, never the whole home.
 *   grant-writer-lease/ · work-units-v2/execution-grants/ · execution-grants/ · grant-ledger-quarantine/
 * The append lock <wu>.lock is transient (created exclusively, unlinked after the append), so a
 * lock that survives a clean write IS a governed change.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const GOVERNED_ROOTS = Object.freeze([
  'grant-writer-lease',
  path.join('work-units-v2', 'execution-grants'),
  'execution-grants',
  'grant-ledger-quarantine',
]);
const LEASE_ROOT = 'grant-writer-lease';
const LEDGER_ROOTS = [path.join('work-units-v2', 'execution-grants'), 'execution-grants'];
const GEN_RE = /^g-(\d{12})\.json$/;

const sha = (buf) => 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');

/** Every file under the governed roots: { rel: { size, sha } }. Read-only. */
export function captureGoverned(home) {
  const files = {};
  const walk = (abs) => {
    let ents = [];
    try { ents = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = path.join(abs, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) { const b = fs.readFileSync(p); files[path.relative(home, p)] = { size: b.length, sha: sha(b) }; }
    }
  };
  for (const r of GOVERNED_ROOTS) walk(path.join(home, r));
  return { version: 'O5R3TI.v1', roots: GOVERNED_ROOTS, files: Object.fromEntries(Object.entries(files).sort()) };
}

/** Kind of a governed path. */
export function kindOf(rel) {
  const dir = path.dirname(rel);
  const base = path.basename(rel);
  if (dir === LEASE_ROOT && GEN_RE.test(base)) return { kind: 'lease', gen: Number(GEN_RE.exec(base)[1]) };
  if (LEDGER_ROOTS.includes(dir) && base.endsWith('.jsonl')) return { kind: 'ledger', workUnit: base.slice(0, -'.jsonl'.length) };
  return { kind: 'other' };
}

const readBytes = (home, rel) => { try { return fs.readFileSync(path.join(home, rel)); } catch { return null; } };

// ── The decisions. The shipped judge uses exactly these; tests may substitute one to build a defeat candidate.
export const DECISIONS = Object.freeze({
  /** SCOPE: what is captured is what is governed (the four roots, never the whole home). */
  capture: captureGoverned,
  /** T1 */
  newGenerationLawful: (beforeGens, afterGens) => {
    const added = afterGens.filter((g) => !beforeGens.includes(g));
    const expected = (beforeGens.length ? Math.max(...beforeGens) : 0) + 1;
    if (added.length !== 1) return { ok: false, detail: `${added.length} new lease generations (${added.join(', ') || 'none'})` };
    if (added[0] !== expected) return { ok: false, detail: `new generation ${added[0]} is not the next generation ${expected}` };
    return { ok: true, gen: added[0] };
  },
  /** T2 */
  heldByThisIncarnation: (record, gen, binding) => !!record && record.released !== true && record.generation === gen
    && typeof record.owner_nonce === 'string'
    && record.host === binding.host && record.pid === binding.pid
    && record.process_start_time != null && record.process_start_time === binding.processStartTime,
  /** T3 */
  historyUnchanged: (b, nowBytes) => !!nowBytes && sha(nowBytes) === b.sha,
  /** T4 + T5 */
  appendOnly: (b, nowBytes) => {
    if (!nowBytes) return { ok: false, rule: 'T4', detail: 'ledger removed' };
    if (nowBytes.length < b.size) return { ok: false, rule: 'T4', detail: `ledger shortened ${b.size} → ${nowBytes.length}` };
    if (sha(nowBytes.subarray(0, b.size)) !== b.sha) return { ok: false, rule: 'T5', detail: 'prior ledger bytes changed' };
    return { ok: true, grew: nowBytes.length > b.size };
  },
  /** T6: which ledgers changed (grew, or are new). */
  changedLedgers: (grown, created) => [...grown, ...created],
  maxChangedLedgers: 1,
  /** T7 */
  otherUnchanged: (b, a) => !!b && !!a && b.sha === a.sha,
});

export function judgeTransitionWith(D) {
  return function judgeTransition(before, home, binding) {
    const violations = [];
    const v = (rule, detail) => violations.push({ rule, detail });
    const bFiles = before.files;
    const aFiles = D.capture(home).files;
    const all = [...new Set([...Object.keys(bFiles), ...Object.keys(aFiles)])].sort();

    const beforeGens = Object.keys(bFiles).map(kindOf).filter((k) => k.kind === 'lease').map((k) => k.gen);
    const afterGens = Object.keys(aFiles).map(kindOf).filter((k) => k.kind === 'lease').map((k) => k.gen);

    // T1 + T2
    const t1 = D.newGenerationLawful(beforeGens, afterGens);
    if (!t1.ok) v('T1', t1.detail);
    else {
      const rel = path.join(LEASE_ROOT, `g-${String(t1.gen).padStart(12, '0')}.json`);
      let record = null;
      try { record = JSON.parse(readBytes(home, rel)?.toString('utf8') ?? 'null'); } catch { record = null; }
      // T1 guarantees the new generation is max(before)+1 and the only addition, so it is the latest.
      if (!D.heldByThisIncarnation(record, t1.gen, binding)) {
        v('T2', record ? `generation ${t1.gen} held by ${record.host}/${record.pid}/${record.process_start_time}${record.released === true ? ' (a release)' : ''}` : `generation ${t1.gen} unreadable`);
      }
    }

    const grown = []; const created = [];
    for (const rel of all) {
      const k = kindOf(rel);
      const b = bFiles[rel]; const a = aFiles[rel];
      if (k.kind === 'lease') {
        if (b && !D.historyUnchanged(b, a ? readBytes(home, rel) : null)) v('T3', `lease history ${path.basename(rel)} ${a ? 'rewritten' : 'removed'}`);
      } else if (k.kind === 'ledger') {
        if (!b) { created.push(rel); continue; }
        const r = D.appendOnly(b, a ? readBytes(home, rel) : null);
        if (!r.ok) v(r.rule, `${rel}: ${r.detail}`);
        else if (r.grew) grown.push(rel);
      } else if (!D.otherUnchanged(b, a)) {
        v('T7', `${rel} ${!b ? 'appeared' : !a ? 'removed' : 'changed'}`);
      }
    }
    const changed = D.changedLedgers(grown, created);
    if (changed.length > D.maxChangedLedgers) v('T6', `${changed.length} Work Unit ledgers changed: ${changed.join(', ')}`);

    return {
      ok: violations.length === 0,
      violations,
      summary: { new_generation: t1.ok ? t1.gen : null, changed_ledgers: changed, governed_files_before: Object.keys(bFiles).length, governed_files_after: Object.keys(aFiles).length },
    };
  };
}

export const judgeTransition = judgeTransitionWith(DECISIONS);
