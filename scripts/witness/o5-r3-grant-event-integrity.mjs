/**
 * O5-R3 — C6B GRANT EVENT PURITY. Read-only.
 *
 * RB-A4 (2026-10-01): C6A proves one lawful lease acquisition and at most one
 * append-only ledger change. It does not prove what was appended. A defeated
 * live walk exposed ISSUED + CLAIMED in the same ledger while C6A still passed.
 *
 * LAW — from the saved pre-write governed capture to the first post-write sample:
 *   E1 exactly one grant ledger changed;
 *   E2 its delta is exactly one complete UTF-8 JSONL record;
 *   E3 that record is ISSUED and carries one E1-GRANT.v1 grant;
 *   E4 the grant names the Work Unit encoded by the changed ledger filename;
 *   E5 the grant is one-shot, non-transferable, and records the human
 *      JARVIS_DESKTOP_E1_AUTHORIZE_ONCE act.
 *
 * CLAIMED / CONSUMED / REVOKED / INVALIDATED, a second ISSUED, malformed bytes,
 * or any other extra event before the sample defeats this witness.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const CANONICAL = path.join('work-units-v2', 'execution-grants');
const LEGACY = 'execution-grants';
const sha = (buf) => 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');

export function isLedger(rel) {
  return [CANONICAL, LEGACY].includes(path.dirname(rel)) && path.basename(rel).endsWith('.jsonl');
}

export const DECISIONS = Object.freeze({
  changedLedgers: (beforeFiles, afterFiles) => {
    const all = [...new Set([...Object.keys(beforeFiles), ...Object.keys(afterFiles)])].filter(isLedger).sort();
    return all.filter((rel) => {
      const b = beforeFiles[rel]; const a = afterFiles[rel];
      return !b || !a || b.size !== a.size || b.sha !== a.sha;
    });
  },
  deltaBytes: (home, rel, before) => {
    let now;
    try { now = fs.readFileSync(path.join(home, rel)); } catch { return { ok: false, detail: 'changed ledger unreadable' }; }
    if (!before) return { ok: true, delta: now };
    if (now.length < before.size) return { ok: false, detail: 'changed ledger shortened' };
    if (sha(now.subarray(0, before.size)) !== before.sha) return { ok: false, detail: 'pre-write ledger prefix changed' };
    return { ok: true, delta: now.subarray(before.size) };
  },
  oneCompleteJsonlRecord: (delta) => {
    if (!delta?.length) return { ok: false, detail: 'ledger delta is empty' };
    const text = delta.toString('utf8');
    if (!Buffer.from(text, 'utf8').equals(delta)) return { ok: false, detail: 'ledger delta is not valid UTF-8' };
    if (!text.endsWith('\n')) return { ok: false, detail: 'ledger delta is not newline-terminated' };
    const body = text.slice(0, -1);
    if (!body || body.includes('\n') || body.includes('\r')) return { ok: false, detail: 'ledger delta is not exactly one JSONL record' };
    try { return { ok: true, event: JSON.parse(body) }; }
    catch { return { ok: false, detail: 'ledger delta is not valid JSON' }; }
  },
  issuedEvent: (event) => !!event && event.event === 'ISSUED' && event.grant && typeof event.grant === 'object',
  workUnitMatches: (event, rel) => event.grant.work_unit_id === path.basename(rel, '.jsonl'),
  exactAuthorizationAct: (event) => event.grant.grant_version === 'E1-GRANT.v1'
    && event.grant.one_shot === true && event.grant.non_transferable === true
    && event.grant.actor_kind === 'human'
    && event.grant.authorization_act === 'JARVIS_DESKTOP_E1_AUTHORIZE_ONCE'
    && typeof event.grant.grant_id === 'string' && event.grant.grant_id.length > 0,
});

export function judgeGrantEventPurityWith(D) {
  return function judgeGrantEventPurity(before, after, home) {
    const violations = [];
    const v = (rule, detail) => violations.push({ rule, detail });
    const bFiles = before?.files || {};
    const aFiles = after?.files || {};
    const changed = D.changedLedgers(bFiles, aFiles);

    if (changed.length !== 1) v('E1', `${changed.length} grant ledgers changed: ${changed.join(', ') || 'none'}`);
    let event = null; let rel = changed.length === 1 ? changed[0] : null;
    if (rel) {
      const d = D.deltaBytes(home, rel, bFiles[rel]);
      if (!d.ok) v('E2', `${rel}: ${d.detail}`);
      else {
        const parsed = D.oneCompleteJsonlRecord(d.delta);
        if (!parsed.ok) v('E2', `${rel}: ${parsed.detail}`);
        else {
          event = parsed.event;
          if (!D.issuedEvent(event)) v('E3', `${rel}: appended event is ${event?.event ?? 'missing'}, not one ISSUED grant`);
          else {
            if (!D.workUnitMatches(event, rel)) v('E4', `${rel}: grant work_unit_id ${event.grant.work_unit_id ?? 'missing'} does not match ledger`);
            if (!D.exactAuthorizationAct(event)) v('E5', `${rel}: appended grant is not the exact one-shot human JARVIS_DESKTOP_E1_AUTHORIZE_ONCE act`);
          }
        }
      }
    }

    return {
      ok: violations.length === 0,
      violations,
      summary: {
        changed_ledgers: changed,
        event: event?.event ?? null,
        grant_id: event?.grant?.grant_id ?? null,
        work_unit_id: event?.grant?.work_unit_id ?? null,
      },
    };
  };
}

export const judgeGrantEventPurity = judgeGrantEventPurityWith(DECISIONS);
