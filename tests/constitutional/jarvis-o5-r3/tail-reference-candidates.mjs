/**
 * JARVIS O5-R3 — tail REFERENCE double, CURRENT-reader adapter (Class A) and DEFEAT CANDIDATES.
 *
 * ⛔ The reference is a test double proving R3-T1…T10 mutually satisfiable, never an implementation.
 * ⛔ Every defeat candidate is PINNED here as code. None imports the live store, so implementing the
 * real reader cannot make a known-bad candidate silently start passing. The live reader is imported
 * only by TAIL_CURRENT, which the unfrozen matrix runs as Class A evidence.
 *
 * ⚠️ Model limit: the io text is a JS string, so a torn write that splits a multi-byte UTF-8
 * sequence cannot be represented. The implementation must quarantine the raw bytes losslessly
 * (for example base64), not a decoded string.
 */
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readCanonicalGrantEventsV1 } from '../../../scripts/builder/canonical-provider-execution-grant-store-v1.mjs';

export const QUARANTINE_REASON = 'UNCOMMITTED_TERMINAL_FRAGMENT';

function split(text) {
  const buf = Buffer.from(text, 'utf8');
  const cut = buf.lastIndexOf(0x0a) + 1;
  return { committed: buf.subarray(0, cut).toString('utf8'), tail: buf.subarray(cut).toString('utf8'), offset: cut };
}

function parseCommitted(text) {
  const { committed, tail, offset } = split(text);
  const events = [];
  let n = 0;
  for (const line of committed.split('\n')) {
    n += 1;
    if (!line.trim()) continue;
    try { events.push(JSON.parse(line)); } catch { throw new Error(`GRANT_LEDGER_CORRUPT at committed line ${n}`); }
  }
  return { events, uncommitted_tail: tail.length ? { bytes: tail, offset } : null };
}

const quarantineRecord = (ctx, t) => ({
  ledger: ctx.ledger, offset: t.offset, bytes: t.bytes, encoding: 'utf8',
  reason: QUARANTINE_REASON, lease: ctx.lease?.owner_nonce, at: ctx.now,
});

/** Reference append, with one decision per option so each candidate replaces exactly one. */
function makeAppend(o = {}) {
  return function append(io, record, ctx) {
    if (!o.noLeaseCheck && !ctx.holdsLease()) throw new Error('WRITER_LEASE_NOT_HELD');
    let parsed;
    if (o.repairAnywhere) {
      try { parsed = parseCommitted(io.text); } catch {
        // "repair": cut the ledger back to just before the first bad committed line
        const lines = io.text.split('\n');
        let at = 0;
        for (const line of lines) { if (line.trim()) { try { JSON.parse(line); } catch { break; } } at += Buffer.byteLength(line, 'utf8') + 1; }
        io.quarantine({ ...quarantineRecord(ctx, { offset: at, bytes: Buffer.from(io.text).subarray(at).toString() }), reason: 'CORRUPTION_REPAIRED' });
        io.truncate(at);
        io.write(JSON.stringify(record) + '\n');
        return;
      }
    } else {
      parsed = parseCommitted(io.text); // throws on committed corruption before touching anything
    }
    const t = parsed.uncommitted_tail;
    if (t && !o.concatenate) {
      if (o.completeFragment) {
        try { JSON.parse(t.bytes + '}'); io.quarantine(quarantineRecord(ctx, t)); io.write('}\n'); io.write(JSON.stringify(record) + '\n'); return; } catch { /* not completable */ }
      }
      const cutAt = o.charOffset ? io.text.length - t.bytes.length : t.offset;
      const rec = o.bareQuarantine ? { bytes: t.bytes } : { ...quarantineRecord(ctx, t), offset: cutAt };
      if (o.silentTruncate) {
        io.truncate(cutAt);
      } else if (o.truncateFirst) {
        io.truncate(cutAt); io.quarantine(rec);
      } else if (o.ignoreQuarantineFailure) {
        try { io.quarantine(rec); } catch { /* proceed anyway */ }
        io.truncate(cutAt);
      } else {
        io.quarantine(rec); // throws on failure: nothing below runs
        io.truncate(cutAt);
      }
    }
    if (o.twoWrites) { io.write(JSON.stringify(record)); io.write('\n'); } else io.write(JSON.stringify(record) + '\n');
  };
}

export const TAIL_REFERENCE = Object.freeze({ parse: parseCommitted, append: makeAppend() });

/** The canonical grant-ledger reader AS IT STANDS (Class A only; never a candidate). */
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

/** Pinned snapshot of today's reader semantics: every unparseable line is fatal, and there is no commit marker. */
const strictSnapshot = (text) => {
  const events = [];
  let n = 0;
  for (const line of text.split('\n')) {
    n += 1;
    if (!line.trim()) continue;
    try { events.push(JSON.parse(line)); } catch { throw new Error(`CANONICAL_EXECUTION_GRANT_LEDGER_CORRUPT at line ${n}`); }
  }
  return { events, uncommitted_tail: null };
};
const lenientCommitted = (text) => {
  const { committed, tail, offset } = split(text);
  const events = [];
  for (const line of committed.split('\n')) { if (!line.trim()) continue; try { events.push(JSON.parse(line)); } catch { /* skipped silently */ } }
  return { events, uncommitted_tail: tail.length ? { bytes: tail, offset } : null };
};
const parseSuccessCommits = (text) => {
  const { tail, offset } = split(text);
  const r = parseCommitted(text);
  if (!r.uncommitted_tail) return r;
  try { r.events.push(JSON.parse(tail)); return { events: r.events, uncommitted_tail: null }; } catch { return { ...r, uncommitted_tail: { bytes: tail, offset } }; }
};

const cand = (id, named, law, subject, collateral = {}) => ({ id, named, law, subject, collateral });
const withAppend = (o) => ({ parse: parseCommitted, append: makeAppend(o) });
const NO_QUARANTINE = 'a candidate that never quarantines cannot preserve, order, describe or refuse to merge the fragment';

export const TAIL_CANDIDATES = Object.freeze([
  cand('DC-T0', 'R3-T1', 'today\'s strict reader (pinned snapshot): any unparseable line, even an uncommitted tail, bricks the unit',
    { parse: strictSnapshot, append: makeAppend() },
    { 'R3-T3': 'with no commit marker a parseable unterminated line is committed by construction' }),
  cand('DC-T1', 'R3-T2', 'tail tolerance generalised: committed corrupt lines are skipped too, so mid-file corruption goes silent',
    { parse: lenientCommitted, append: makeAppend() }),
  cand('DC-T11', 'R3-T2', 'repair anywhere: committed corruption is "fixed" by cutting the ledger back to the first bad line',
    withAppend({ repairAnywhere: true })),
  cand('DC-T2', 'R3-T3', 'parse success is taken as commitment',
    { parse: parseSuccessCommits, append: makeAppend() }),
  cand('DC-T3', 'R3-T4', 'the record and its newline are two writes', withAppend({ twoWrites: true })),
  cand('DC-T4', 'R3-T5', 'append concatenates onto the uncommitted tail, committing a corrupt line',
    withAppend({ concatenate: true }),
    { 'R3-T6': NO_QUARANTINE, 'R3-T7': NO_QUARANTINE, 'R3-T8': NO_QUARANTINE, 'R3-T10': 'concatenating onto the fragment IS merging it with the next append' }),
  cand('DC-T5', 'R3-T6', 'the torn tail is truncated silently, with no record of the discarded bytes',
    withAppend({ silentTruncate: true }),
    { 'R3-T7': NO_QUARANTINE, 'R3-T8': NO_QUARANTINE, 'R3-T10': NO_QUARANTINE }),
  cand('DC-T6', 'R3-T7', 'truncate first, quarantine after', withAppend({ truncateFirst: true })),
  cand('DC-T7', 'R3-T7', 'a failed quarantine is swallowed and truncation proceeds', withAppend({ ignoreQuarantineFailure: true })),
  cand('DC-T8a', 'R3-T8', 'the quarantine record keeps the bytes but no ledger, offset, reason, lease or time', withAppend({ bareQuarantine: true })),
  cand('DC-T8b', 'R3-T8', 'the boundary is a character offset, not a byte offset (the unit hazard of R3-R7, in the ledger)',
    withAppend({ charOffset: true }),
    { 'R3-T5': 'truncating at a character offset in a multi-byte prefix removes committed bytes',
      'R3-T10': 'the removed committed newline merges the last record with the next append' }),
  cand('DC-T9', 'R3-T9', 'tail recovery without the lease', withAppend({ noLeaseCheck: true })),
  cand('DC-T10', 'R3-T10', 'semantic repair: a completable fragment is completed into a record', withAppend({ completeFragment: true })),
]);
