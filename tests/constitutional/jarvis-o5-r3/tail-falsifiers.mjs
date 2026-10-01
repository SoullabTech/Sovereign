/**
 * JARVIS O5-R3 — grant-ledger TAIL falsifiers (R3-T1…T10), scope item 1.
 *
 * Founder rulings R3-R5 / R3-R6 (2026-09-30):
 *   Recovery may remove bytes that never became a ledger record. It may not rewrite ledger history.
 *   Only bytes after the last proven committed boundary may be removed; they are preserved first,
 *   durably, in a separate quarantine record; if that fails, nothing is truncated; no committed record
 *   is changed; nothing is reconstructed, completed or merged; corruption anywhere else STOPS.
 *
 * The newline is the commit marker. "Durably" is read under the ruled fault model (process crash,
 * fsync deferred): a quarantine or truncation is durable once the call that performs it has returned.
 *
 * Subject contract:
 *   parse(text) → { events, uncommitted_tail: null | { bytes, offset } }   offset = UTF-8 BYTE offset
 *                 of the last committed boundary; throws /CORRUPT/ on committed corruption.
 *   append(io, record, ctx)   ctx = { ledger, lease, holdsLease(), now }
 *   io = makeIo(text): { text, ops[], writes[], quarantined[], truncations[], quarantineFails,
 *                        write(str), truncate(byteOffset), quarantine(record) }
 */
const expect = (f, cond, msg) => { if (!cond) f.push(msg); };
function run(fn) {
  const failures = [];
  try { fn(failures); } catch (e) { failures.push(`threw: ${e.message}`); }
  return { pass: failures.length === 0, failures };
}
/** Only the named refusal counts; an incidental TypeError is not "failing loudly". */
const refuses = (fn, pattern) => { try { fn(); return false; } catch (e) { return pattern.test(String(e?.message)); } };
const bytes = (s) => Buffer.byteLength(s, 'utf8');

export const LEDGER_ID = 'work-units-v2/execution-grants/wu-o5r3.jsonl';
export const ctxHeld = (patch = {}) => ({ ledger: LEDGER_ID, lease: { owner_nonce: 'n-holder' }, holdsLease: () => true, now: '2026-09-30T00:00:00Z', ...patch });

export function makeIo(text = '', { quarantineFails = false } = {}) {
  const io = {
    text, ops: [], writes: [], quarantined: [], truncations: [], quarantineFails,
    write(str) { io.ops.push('write'); io.writes.push(str); io.text += str; },
    truncate(n) { io.ops.push('truncate'); io.truncations.push(n); io.text = Buffer.from(io.text, 'utf8').subarray(0, n).toString('utf8'); },
    quarantine(rec) {
      if (io.quarantineFails) throw new Error('QUARANTINE_WRITE_FAILED');
      io.ops.push('quarantine'); io.quarantined.push(rec);
    },
  };
  return io;
}

// Committed prefix carries a multi-byte character, so a character offset and a byte offset differ.
const PREFIX = '{"e":"ISSUED","note":"café"}\n{"e":"CLAIMED"}\n';
const TORN = PREFIX + '{"e":"CONS';

/** R3-T1 — an unterminated final line is uncommitted: skipped and recorded with its boundary, not fatal. */
export const T1 = (s) => run((f) => {
  const r = s.parse(TORN);
  expect(f, r?.events?.length === 2, `committed events lost around a torn tail (${r?.events?.length})`);
  expect(f, r?.uncommitted_tail?.bytes === '{"e":"CONS', 'the torn tail was not recorded as uncommitted');
  expect(f, r?.uncommitted_tail?.offset === bytes(PREFIX), `boundary offset ${r?.uncommitted_tail?.offset}, expected byte offset ${bytes(PREFIX)}`);
  expect(f, s.parse(PREFIX)?.uncommitted_tail === null, 'a clean ledger reported an uncommitted tail');
});

/** R3-T2 — committed corruption anywhere is a STOP: loud on read and on append, and nothing is repaired. */
export const T2 = (s) => run((f) => {
  expect(f, refuses(() => s.parse('{"a":1}\n{bad\n{"b":2}\n'), /CORRUPT/), 'mid-file corruption was read silently');
  expect(f, refuses(() => s.parse('{"a":1}\n{bad\n'), /CORRUPT/), 'a committed corrupt final line was read silently');
  for (const text of ['{bad\n{"a":1}\n', '{"a":1}\n{bad\n{"b":2}\n{"c":']) {
    const io = makeIo(text);
    expect(f, refuses(() => s.append(io, { e: 'X' }, ctxHeld()), /CORRUPT/), `append proceeded over committed corruption (${JSON.stringify(text)})`);
    expect(f, io.text === text && io.ops.length === 0, `committed corruption was "repaired" (${io.ops.join(',') || 'text changed'})`);
  }
});

/** R3-T3 — commitment is the newline, never parse success. */
export const T3 = (s) => run((f) => {
  const r = s.parse('{"a":1}\n{"x":1}');
  expect(f, r?.events?.length === 1, 'an unterminated line was treated as committed because it parsed');
  expect(f, r?.uncommitted_tail?.bytes === '{"x":1}', 'the unterminated line was not recorded as uncommitted');
});

/** R3-T4 — record and newline are ONE write. */
export const T4 = (s) => run((f) => {
  const io = makeIo('');
  s.append(io, { e: 'ISSUED' }, ctxHeld());
  expect(f, io.writes.length === 1, `append issued ${io.writes.length} writes`);
  expect(f, io.writes[0] === '{"e":"ISSUED"}\n', 'the single write is not exactly record + newline');
});

/** R3-T5 — after a torn tail, the ledger is EXACTLY the committed prefix bytes + the new record. */
export const T5 = (s) => run((f) => {
  const io = makeIo(TORN);
  s.append(io, { b: 2 }, ctxHeld());
  expect(f, Buffer.from(io.text).subarray(0, bytes(PREFIX)).equals(Buffer.from(PREFIX)), 'committed pre-fragment bytes were not preserved exactly');
  expect(f, io.text === PREFIX + '{"b":2}\n', `the ledger is not the committed prefix + the new record: ${JSON.stringify(io.text)}`);
});

/** R3-T6 — the fragment is preserved verbatim; a clean ledger is never truncated or quarantined. */
export const T6 = (s) => run((f) => {
  const io = makeIo(TORN);
  s.append(io, { b: 2 }, ctxHeld());
  expect(f, io.quarantined.some((q) => q?.bytes === '{"e":"CONS'), 'the torn fragment was discarded without being preserved verbatim');
  const clean = makeIo(PREFIX);
  s.append(clean, { b: 2 }, ctxHeld());
  expect(f, clean.truncations.length === 0 && clean.quarantined.length === 0, 'a clean ledger was truncated or quarantined');
});

/** R3-T7 — quarantine BEFORE truncate; if quarantine fails, nothing is truncated and nothing appended. */
export const T7 = (s) => run((f) => {
  const io = makeIo(TORN);
  s.append(io, { b: 2 }, ctxHeld());
  const q = io.ops.indexOf('quarantine');
  const t = io.ops.indexOf('truncate');
  expect(f, q >= 0 && t > q, `order was ${io.ops.join(' → ')}`);
  const failing = makeIo(TORN, { quarantineFails: true });
  const threw = refuses(() => s.append(failing, { b: 2 }, ctxHeld()), /QUARANTINE/);
  expect(f, threw, 'a quarantine failure was not surfaced');
  expect(f, failing.text === TORN && failing.truncations.length === 0 && failing.writes.length === 0, 'the ledger was truncated or appended after the quarantine failed');
});

/** R3-T8 — the quarantine record carries ledger · byte offset · exact bytes · reason · lease identity · time. */
export const T8 = (s) => run((f) => {
  const io = makeIo(TORN);
  const ctx = ctxHeld();
  s.append(io, { b: 2 }, ctx);
  const rec = io.quarantined[0] ?? {};
  expect(f, rec.ledger === ctx.ledger, 'quarantine record does not name the ledger');
  expect(f, rec.offset === bytes(PREFIX), `quarantine offset ${rec.offset}, expected the byte boundary ${bytes(PREFIX)}`);
  expect(f, rec.bytes === '{"e":"CONS', 'quarantine record does not carry the exact fragment');
  expect(f, typeof rec.reason === 'string' && rec.reason.length > 0, 'quarantine record carries no reason');
  expect(f, rec.lease === ctx.lease.owner_nonce, 'quarantine record does not name the lease incarnation that removed the bytes');
  expect(f, rec.at === ctx.now, 'quarantine record carries no recovery time');
});

/** R3-T9 — tail recovery is a mutation: without the lease nothing is quarantined, truncated or written. */
export const T9 = (s) => run((f) => {
  for (const text of [TORN, PREFIX]) {
    const io = makeIo(text);
    const threw = refuses(() => s.append(io, { b: 2 }, ctxHeld({ holdsLease: () => false })), /LEASE/);
    expect(f, threw, 'a writer without the lease was not refused');
    expect(f, io.text === text && io.ops.length === 0, `a writer without the lease changed the ledger (${io.ops.join(',')})`);
  }
});

/** R3-T10 — no semantic repair: a fragment that COULD be completed is never completed, reconstructed or merged. */
export const T10 = (s) => run((f) => {
  const completable = PREFIX + '{"e":"CONSUMED"';
  const io = makeIo(completable);
  s.append(io, { b: 2 }, ctxHeld());
  let r = null;
  try { r = s.parse(io.text); } catch (e) { f.push(`the ledger was left corrupt: ${e.message}`); return; }
  expect(f, r.events.length === 3 && r.events.every((e) => e.e !== 'CONSUMED'), 'the torn fragment became a ledger record');
  expect(f, io.quarantined.some((q) => q?.bytes === '{"e":"CONSUMED"'), 'the completable fragment was not preserved verbatim');
});

export const TAIL_FALSIFIERS = Object.freeze({
  'R3-T1': T1, 'R3-T2': T2, 'R3-T3': T3, 'R3-T4': T4, 'R3-T5': T5,
  'R3-T6': T6, 'R3-T7': T7, 'R3-T8': T8, 'R3-T9': T9, 'R3-T10': T10,
});
