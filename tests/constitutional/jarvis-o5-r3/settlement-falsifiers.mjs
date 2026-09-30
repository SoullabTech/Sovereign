/**
 * JARVIS O5-R3 — ledger-tail, reason-code and settlement-surfacing FALSIFIERS.
 *
 *   R3-T1…T6  tail-tolerant grant-ledger reader + single-write append     (scope item 1)
 *   R3-C1…C3  honest reason for a CLAIMED grant on a ROUTED unit, relabel only (scope item 3)
 *   R3-S1…S3  refused consume / invalidate returns are surfaced          (scope item 4)
 *
 * Scope item 2 (owner-stamped append lock) is carried by the writer lease
 * (lease-falsifiers.mjs); see the record, §4.
 *
 * Fault model, ruled: PROCESS CRASH, not power loss. fsync is deferred and
 * named, not falsified here.
 */
import { facts } from '../jarvis-o5-r2/pathb-falsifiers.mjs';

const expect = (f, cond, msg) => { if (!cond) f.push(msg); };
function run(fn) {
  const failures = [];
  try { fn(failures); } catch (e) { failures.push(`threw: ${e.message}`); }
  return { pass: failures.length === 0, failures };
}
/** Only a corruption refusal counts; an incidental TypeError is not "failing loudly". */
const throws = (fn) => { try { fn(); return false; } catch (e) { return /CORRUPT/.test(String(e?.message)); } };

// ── Tail ──────────────────────────────────────────────────────────────────────
// Subject: { parse(text) → { events, uncommitted_tail: null | { bytes } } (throws on corruption),
//            append(io, record) }  where io = { text, writes[], quarantined[], write(b), truncate(n), quarantine(b) }.
// The newline is the commit marker: a line is committed iff it is newline-terminated.

export function makeIo(text = '') {
  const io = {
    text, writes: [], quarantined: [], truncations: [],
    write(b) { io.writes.push(b); io.text += b; },
    truncate(n) { io.truncations.push(n); io.text = io.text.slice(0, n); },
    quarantine(b) { io.quarantined.push(b); },
  };
  return io;
}

/** R3-T1 — an unterminated final line is an uncommitted write: skipped and recorded, not fatal. */
export const T1 = (s) => run((f) => {
  const r = s.parse('{"e":"ISSUED"}\n{"e":"CLAIMED"}\n{"e":"CONS');
  expect(f, r?.events?.length === 2, `committed events lost around a torn tail (${r?.events?.length})`);
  expect(f, r?.uncommitted_tail?.bytes === '{"e":"CONS', 'the torn tail was not recorded as uncommitted');
  const clean = s.parse('{"e":"ISSUED"}\n');
  expect(f, clean?.uncommitted_tail === null, 'a clean ledger reported an uncommitted tail');
});

/** R3-T2 — a committed (newline-terminated) corrupt line still fails loudly, on read and on append. */
export const T2 = (s) => run((f) => {
  expect(f, throws(() => s.parse('{"a":1}\n{bad\n{"b":2}\n')), 'mid-file corruption was read silently');
  expect(f, throws(() => s.parse('{"a":1}\n{bad\n')), 'a committed corrupt final line was read silently');
  const io = makeIo('{bad\n{"a":1}\n');
  expect(f, throws(() => s.append(io, { e: 'X' })), 'append proceeded over a corrupt ledger');
  expect(f, io.text === '{bad\n{"a":1}\n', 'append altered a corrupt ledger');
});

/** R3-T3 — commitment is the newline, never parse success: an unterminated line that parses is still uncommitted. */
export const T3 = (s) => run((f) => {
  const r = s.parse('{"a":1}\n{"x":1}');
  expect(f, r?.events?.length === 1, 'an unterminated line was treated as committed because it parsed');
  expect(f, r?.uncommitted_tail?.bytes === '{"x":1}', 'the unterminated line was not recorded as uncommitted');
});

/** R3-T4 — record and newline are ONE write, so a crash cannot commit a record without its marker or vice versa. */
export const T4 = (s) => run((f) => {
  const io = makeIo('');
  s.append(io, { e: 'ISSUED' });
  expect(f, io.writes.length === 1, `append issued ${io.writes.length} writes`);
  expect(f, io.writes[0] === '{"e":"ISSUED"}\n', 'the single write is not exactly record + newline');
});

/** R3-T5 — an append after a torn tail never manufactures a committed corrupt line. */
export const T5 = (s) => run((f) => {
  const io = makeIo('{"a":1}\n{"par');
  s.append(io, { b: 2 });
  let r = null;
  try { r = s.parse(io.text); } catch (e) { f.push(`append after a torn tail bricked the ledger: ${e.message}`); return; }
  expect(f, r.events.length === 2 && r.events[1].b === 2 && r.uncommitted_tail === null, 'the ledger is not exactly the committed prefix + the new record');
});

/** R3-T6 — uncommitted bytes are never silently discarded; a clean ledger is never truncated. */
export const T6 = (s) => run((f) => {
  const io = makeIo('{"a":1}\n{"par');
  s.append(io, { b: 2 });
  expect(f, io.quarantined.includes('{"par'), 'the torn fragment was discarded without a quarantine record');
  const clean = makeIo('{"a":1}\n');
  s.append(clean, { b: 2 });
  expect(f, clean.truncations.length === 0 && clean.quarantined.length === 0, 'a clean ledger was truncated or quarantined');
});

export const TAIL_FALSIFIERS = Object.freeze({ 'R3-T1': T1, 'R3-T2': T2, 'R3-T3': T3, 'R3-T4': T4, 'R3-T5': T5, 'R3-T6': T6 });

// ── Reason code (subject: a Path B classifier { classifyWorkUnit }) ────────────
const one = (c, fx) => c.classifyWorkUnit(fx)[0];
const ACTING_FIELDS = ['retire', 'retire_grant', 'settle_grant', 'record', 'append', 'reissue', 'claim', 'invalidate'];
const acting = (d) => d?.action !== 'GATED' || ACTING_FIELDS.some((k) => d?.[k]);

/** R3-C1 — CLAIMED ∧ ROUTED ∧ no witness is named for what it is: never dispatched. */
export const C1 = (c) => run((f) => {
  const d = one(c, facts({ lifecycle: 'ROUTED', witness: 'absent' }));
  expect(f, d?.reason === 'CLAIMED_NEVER_DISPATCHED', `labelled ${d?.reason}`);
  const d2 = one(c, facts({ lifecycle: 'ROUTED', witness: 'none' }));
  expect(f, d2?.reason === 'CLAIMED_NEVER_DISPATCHED', `with no result record at all, labelled ${d2?.reason}`);
});

/** R3-C2 — relabel only: the absence proof licenses no act (retirement is an operator act, out of scope). */
export const C2 = (c) => run((f) => {
  const d = one(c, facts({ lifecycle: 'ROUTED', witness: 'absent' }));
  expect(f, !acting(d), `the never-dispatched grant was acted on (${JSON.stringify(d)})`);
  expect(f, d?.gate === 'NEEDS_OPERATOR_AUTHORITY', `gate moved to ${d?.gate}`);
});

/** R3-C3 — the proof holds ONLY while the unit is ROUTED; everywhere else the old standing stands. */
export const C3 = (c) => run((f) => {
  const exec = one(c, facts({ lifecycle: 'EXECUTING', witness: 'absent' }));
  expect(f, exec?.reason === 'DISPATCHED_WITHOUT_WITNESS_NO_PROBE' && exec?.gate === 'BLOCKED_BY_EVIDENCE', `EXECUTING without witness became ${exec?.reason}`);
  const ready = one(c, facts({ lifecycle: 'EVIDENCE_READY', witness: 'absent' }));
  expect(f, ready?.reason !== 'CLAIMED_NEVER_DISPATCHED', 'a unit past EXECUTING was called never dispatched');
  const inconsistent = one(c, facts({ lifecycle: 'ROUTED', witness: 'present' }));
  expect(f, inconsistent?.reason !== 'CLAIMED_NEVER_DISPATCHED' && inconsistent?.action === 'GATED', 'a ROUTED unit WITH a witness was called never dispatched or acted on');
});

export const REASON_FALSIFIERS = Object.freeze({ 'R3-C1': C1, 'R3-C2': C2, 'R3-C3': C3 });

// ── Settlement surfacing ───────────────────────────────────────────────────────
// Subject: { finish({ consume, appendW4 }) → { w4, settlement: { settled, reason? } },
//            abort({ invalidate })          → { invalidation: { recorded, reason? } } }

function w4Counter() { const log = []; return { log, appendW4: () => { log.push(1); return { ok: true }; } }; }

/** R3-S1 — a refused consume is reported as unsettled with its reason; a successful one as settled. */
export const S1 = (s) => run((f) => {
  const refused = s.finish({ consume: () => ({ ok: false, status: 'REFUSED', reason: 'GRANT_NOT_CLAIMED' }), ...w4Counter() });
  expect(f, refused?.settlement?.settled === false && refused.settlement.reason === 'GRANT_NOT_CLAIMED', `refused consume reported as ${JSON.stringify(refused?.settlement)}`);
  const ok = s.finish({ consume: () => ({ ok: true }), ...w4Counter() });
  expect(f, ok?.settlement?.settled === true, 'a successful consume was not reported settled');
});

/** R3-S2 — surfacing never changes what is recorded: the witnessed result is ledgered exactly once either way. */
export const S2 = (s) => run((f) => {
  for (const consume of [() => ({ ok: false, reason: 'GRANT_NOT_CLAIMED' }), () => ({ ok: true })]) {
    const c = w4Counter();
    s.finish({ consume, appendW4: c.appendW4 });
    expect(f, c.log.length === 1, `W4 appended ${c.log.length} times after consume ${consume().ok ? 'succeeded' : 'refused'}`);
  }
});

/** R3-S3 — a refused invalidation is reported, never assumed recorded. */
export const S3 = (s) => run((f) => {
  const refused = s.abort({ invalidate: () => ({ ok: false, reason: 'GRANT_LEDGER_BUSY' }) });
  expect(f, refused?.invalidation?.recorded === false && refused.invalidation.reason === 'GRANT_LEDGER_BUSY', `refused invalidation reported as ${JSON.stringify(refused?.invalidation)}`);
  const ok = s.abort({ invalidate: () => ({ ok: true }) });
  expect(f, ok?.invalidation?.recorded === true, 'a recorded invalidation was not reported');
});

export const SETTLEMENT_FALSIFIERS = Object.freeze({ 'R3-S1': S1, 'R3-S2': S2, 'R3-S3': S3 });
