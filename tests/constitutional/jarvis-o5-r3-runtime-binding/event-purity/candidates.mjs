/** RB-A4 C6B — real subject + one-decision defeat candidates. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ROOT } from './falsifiers.mjs';

const EP = await import(pathToFileURL(path.join(ROOT, 'scripts/witness/o5-r3-grant-event-integrity.mjs')).href);
export const REAL = Object.freeze({ judge: EP.judgeGrantEventPurity });
const variant = (over) => {
  const D = Object.freeze({ ...EP.DECISIONS, ...over });
  return Object.freeze({ judge: EP.judgeGrantEventPurityWith(D) });
};
const sha = (b) => 'sha256:' + crypto.createHash('sha256').update(b).digest('hex');

function parseLines(delta) {
  const text = delta.toString('utf8');
  if (!text.endsWith('\n')) return null;
  const lines = text.slice(0, -1).split('\n');
  try { return lines.map((line) => JSON.parse(line)); } catch { return null; }
}

export const EP_CANDIDATES = [
  {
    id: 'DC-EP1', named: 'EP-1 exactly one lawful ISSUED delta passes', collateral: {},
    law: 'new Work Unit ledgers are forbidden even when their first and only event is the lawful ISSUED act',
    subject: variant({ deltaBytes: (home, rel, before) => before ? EP.DECISIONS.deltaBytes(home, rel, before) : { ok: false, detail: 'new ledger forbidden' } }),
  },

  {
    id: 'DC-EP2', named: 'EP-2 two grant ledgers changed', collateral: {},
    law: 'only the first changed ledger counts; a second changed Work Unit is ignored',
    subject: variant({ changedLedgers: (b, a) => EP.DECISIONS.changedLedgers(b, a).slice(0, 1) }),
  },
  {
    id: 'DC-EP3', named: 'EP-3 ISSUE plus CLAIM is not one authorization event', collateral: {},
    law: 'a trailing CLAIMED event is treated as bookkeeping and ignored',
    subject: variant({ oneCompleteJsonlRecord: (delta) => {
      const rows = parseLines(delta);
      if (rows?.length === 2 && rows[0]?.event === 'ISSUED' && rows[1]?.event === 'CLAIMED') return { ok: true, event: rows[0] };
      return EP.DECISIONS.oneCompleteJsonlRecord(delta);
    } }),
  },
  {
    id: 'DC-EP4', named: 'EP-4 non-ISSUED single event is refused', collateral: {},
    law: 'any event carrying a grant object is treated as an issuance',
    subject: variant({ issuedEvent: (event) => !!event?.grant }),
  },

  {
    id: 'DC-EP5', named: 'EP-5 malformed or incomplete delta is refused', collateral: {},
    law: 'a valid JSON object need not be newline-terminated to count as a complete JSONL event',
    subject: variant({ oneCompleteJsonlRecord: (delta) => {
      const text = delta.toString('utf8');
      try {
        const event = JSON.parse(text.endsWith('\n') ? text.slice(0, -1) : text);
        return { ok: true, event };
      } catch { return EP.DECISIONS.oneCompleteJsonlRecord(delta); }
    } }),
  },
  {
    id: 'DC-EP6', named: 'EP-6 grant must name its ledger Work Unit', collateral: {},
    law: 'the grant work_unit_id is trusted without binding it to the ledger name',
    subject: variant({ workUnitMatches: () => true }),
  },
  {
    id: 'DC-EP7', named: 'EP-7 exact one-shot human authorization semantics required', collateral: {},
    law: 'grant version alone is enough; actor, act, one-shot and transferability are ignored',
    subject: variant({ exactAuthorizationAct: (event) => event?.grant?.grant_version === 'E1-GRANT.v1' }),
  },

  {
    id: 'DC-EP8', named: 'EP-8 prior bytes define the delta boundary', collateral: {},
    law: 'the prior byte count is used as an offset but its prefix hash is never verified',
    subject: variant({ deltaBytes: (home, rel, before) => {
      const now = fs.readFileSync(path.join(home, rel));
      if (!before) return { ok: true, delta: now };
      if (now.length < before.size) return { ok: false, detail: 'shortened' };
      return { ok: true, delta: now.subarray(before.size) };
    } }),
  },
  {
    id: 'DC-EP9', named: 'EP-9 two ISSUED events are still two events', collateral: {},
    law: 'two consecutive ISSUED records are collapsed into the first authorization',
    subject: variant({ oneCompleteJsonlRecord: (delta) => {
      const rows = parseLines(delta);
      if (rows?.length === 2 && rows.every((row) => row?.event === 'ISSUED')) return { ok: true, event: rows[0] };
      return EP.DECISIONS.oneCompleteJsonlRecord(delta);
    } }),
  },
];
