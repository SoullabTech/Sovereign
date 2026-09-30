/**
 * JARVIS O5-R3 — reference doubles, CURRENT-CODE adapters (Class A) and defeat
 * candidates for the tail, reason-code and settlement falsifiers.
 *
 * ⛔ The references are test doubles that prove mutual satisfiability, never
 * implementations. The CURRENT adapters wrap the real code as it stands, so the
 * matrix can show which falsifiers the canonical code fails today (known-bad RED).
 */
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as REAL_CLASSIFIER from '../../../scripts/builder/o5-recovery-path-b-v1.mjs';
import { readCanonicalGrantEventsV1 } from '../../../scripts/builder/canonical-provider-execution-grant-store-v1.mjs';

// ── Tail ──────────────────────────────────────────────────────────────────────
function parseCommitted(text) {
  const cut = text.lastIndexOf('\n') + 1;
  const committed = text.slice(0, cut);
  const tail = text.slice(cut);
  const events = [];
  let n = 0;
  for (const line of committed.split('\n')) {
    n += 1;
    if (!line.trim()) continue;
    try { events.push(JSON.parse(line)); } catch { throw new Error(`GRANT_LEDGER_CORRUPT at committed line ${n}`); }
  }
  return { events, uncommitted_tail: tail.length ? { bytes: tail } : null };
}

export const TAIL_REFERENCE = Object.freeze({
  parse: parseCommitted,
  append(io, record) {
    const { uncommitted_tail } = parseCommitted(io.text); // throws on committed corruption before touching anything
    if (uncommitted_tail) {
      io.quarantine(uncommitted_tail.bytes);
      io.truncate(io.text.length - uncommitted_tail.bytes.length);
    }
    io.write(JSON.stringify(record) + '\n');
  },
});

/** The canonical grant-ledger reader as it stands (append is not exported, so tail-append laws are N/A). */
export const TAIL_CURRENT = Object.freeze({
  parse(text) {
    const home = mkdtempSync(path.join(os.tmpdir(), 'o5r3-tail-'));
    try {
      mkdirSync(path.join(home, 'work-units-v2', 'execution-grants'), { recursive: true });
      writeFileSync(path.join(home, 'work-units-v2', 'execution-grants', 'wu-o5r3.jsonl'), text);
      return { events: readCanonicalGrantEventsV1('wu-o5r3', { home }), uncommitted_tail: null };
    } finally { rmSync(home, { recursive: true, force: true }); }
  },
});

/** Respects the commit marker, but skips committed lines it cannot parse. */
const lenientCommitted = (text) => {
  const cut = text.lastIndexOf('\n') + 1;
  const events = [];
  for (const line of text.slice(0, cut).split('\n')) { if (!line.trim()) continue; try { events.push(JSON.parse(line)); } catch { /* skipped silently */ } }
  return { events, uncommitted_tail: text.slice(cut).length ? { bytes: text.slice(cut) } : null };
};
const parseSuccessCommits = (text) => {
  const lines = text.split('\n');
  const last = lines.pop();
  const r = parseCommitted(lines.length ? lines.join('\n') + '\n' : '');
  if (!last) return r;
  try { r.events.push(JSON.parse(last)); return r; } catch { return { ...r, uncommitted_tail: { bytes: last } }; }
};

export const TAIL_CANDIDATES = Object.freeze([
  { id: 'DC-T0', named: 'R3-T1', law: 'the current strict reader: any unparseable line, even an uncommitted tail, bricks the unit',
    subject: { parse: (t) => ({ ...TAIL_CURRENT.parse(t) }), append: TAIL_REFERENCE.append },
    collateral: { 'R3-T3': 'with no commit marker a parseable unterminated line is committed by construction; the reader cannot separate the two tails without ceasing to be the current reader' } },
  { id: 'DC-T1', named: 'R3-T2', law: 'tail tolerance generalised: committed corrupt lines are skipped too, so mid-file corruption goes silent',
    subject: { parse: lenientCommitted, append: TAIL_REFERENCE.append }, collateral: {} },
  { id: 'DC-T2', named: 'R3-T3', law: 'parse success is taken as commitment',
    subject: { parse: parseSuccessCommits, append: TAIL_REFERENCE.append }, collateral: {} },
  { id: 'DC-T3', named: 'R3-T4', law: 'the record and its newline are two writes',
    subject: { parse: parseCommitted, append(io, r) { const t = parseCommitted(io.text).uncommitted_tail; if (t) { io.quarantine(t.bytes); io.truncate(io.text.length - t.bytes.length); } io.write(JSON.stringify(r)); io.write('\n'); } },
    collateral: {} },
  { id: 'DC-T4', named: 'R3-T5', law: 'append concatenates onto an uncommitted tail, committing a corrupt line',
    subject: { parse: parseCommitted, append(io, r) { parseCommitted(io.text); io.write(JSON.stringify(r) + '\n'); } },
    collateral: { 'R3-T6': 'concatenating onto the fragment is exactly not quarantining it' } },
  { id: 'DC-T5', named: 'R3-T6', law: 'the torn tail is truncated silently, with no record of the discarded bytes',
    subject: { parse: parseCommitted, append(io, r) { const t = parseCommitted(io.text).uncommitted_tail; if (t) io.truncate(io.text.length - t.bytes.length); io.write(JSON.stringify(r) + '\n'); } },
    collateral: {} },
]);

// ── Reason code ────────────────────────────────────────────────────────────────
const lifecycleOf = (fx) => fx?.envelope?.work_unit?.state?.lifecycle_state;
const noWitness = (fx, grantId) => !fx?.results?.[grantId] || fx.results[grantId].present === false;

export function relabel(classify, { anyLifecycle = false, act = false } = {}) {
  return {
    classifyWorkUnit(fx) {
      return classify(fx).map((d) => {
        const g = fx.grants?.find((x) => x.grant?.grant_id === d.grant_id);
        const eligible = g?.standing === 'CLAIMED' && noWitness(fx, d.grant_id)
          && (anyLifecycle ? d.action === 'GATED' : lifecycleOf(fx) === 'ROUTED' && d.reason === 'W2_NOT_EXECUTING');
        if (!eligible) return d;
        const out = { ...d, reason: 'CLAIMED_NEVER_DISPATCHED', phase: 'never_dispatched' };
        return act ? { ...out, action: 'RETIRE', retire_grant: true } : out;
      });
    },
  };
}

export const REASON_REFERENCE = relabel(REAL_CLASSIFIER.classifyWorkUnit);
export const REASON_CURRENT = REAL_CLASSIFIER;

export const REASON_CANDIDATES = Object.freeze([
  { id: 'DC-C1', named: 'R3-C1', law: 'the current classifier: a proven-undispatched grant is labelled "authority no longer sufficient"',
    subject: REAL_CLASSIFIER, collateral: {} },
  { id: 'DC-C2', named: 'R3-C2', law: 'relabel AND retire: the absence proof is used as licence to act',
    subject: relabel(REAL_CLASSIFIER.classifyWorkUnit, { act: true }), collateral: {} },
  { id: 'DC-C3', named: 'R3-C3', law: 'never-dispatched whenever there is no witness, whatever the lifecycle',
    subject: relabel(REAL_CLASSIFIER.classifyWorkUnit, { anyLifecycle: true }), collateral: {} },
]);

// ── Settlement surfacing ───────────────────────────────────────────────────────
export const SETTLEMENT_REFERENCE = Object.freeze({
  finish({ consume, appendW4 }) {
    const c = consume();
    const w4 = appendW4();
    return { w4, settlement: c?.ok ? { settled: true } : { settled: false, reason: c?.reason ?? 'UNKNOWN' } };
  },
  abort({ invalidate }) {
    const r = invalidate();
    return { invalidation: r?.ok ? { recorded: true } : { recorded: false, reason: r?.reason ?? 'UNKNOWN' } };
  },
});

/** The shape canonicalConfirmAuthorizedExecution has today: both returns ignored. */
const IGNORES = Object.freeze({
  finish({ consume, appendW4 }) { consume(); return { w4: appendW4(), settlement: { settled: true } }; },
  abort({ invalidate }) { invalidate(); return { invalidation: { recorded: true } }; },
});

export const SETTLEMENT_CANDIDATES = Object.freeze([
  { id: 'DC-S1', named: 'R3-S1', law: 'the consume return is ignored (today\'s B7)',
    subject: { finish: IGNORES.finish, abort: SETTLEMENT_REFERENCE.abort }, collateral: {} },
  { id: 'DC-S2', named: 'R3-S2', law: 'surfacing by suppression: a refused consume drops the witnessed W4 record',
    subject: { finish({ consume, appendW4 }) { const c = consume(); if (!c?.ok) return { w4: null, settlement: { settled: false, reason: c?.reason } }; return { w4: appendW4(), settlement: { settled: true } }; },
      abort: SETTLEMENT_REFERENCE.abort }, collateral: {} },
  { id: 'DC-S3', named: 'R3-S3', law: 'the invalidate return is ignored (today\'s B1/B2/B5)',
    subject: { finish: SETTLEMENT_REFERENCE.finish, abort: IGNORES.abort }, collateral: {} },
]);
