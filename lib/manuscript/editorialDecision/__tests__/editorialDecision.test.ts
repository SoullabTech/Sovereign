/**
 * EDITORIAL-DECISION-01 — ED-1 … ED-18, predeclared by the founder BEFORE the build.
 *
 *   Standing records what you decide about an observation.
 *   Editorial decisions record what you decide about the Work.
 *
 * ⭐ THE FAKE IS FAITHFUL FROM THE START. FOCUS-W7 cost four rounds because
 * successive fakes each blocked a path for a reason production did not have.
 * So this one stores what is inserted, returns what was stored, enforces the
 * real UNIQUE, and RAISES on UPDATE/DELETE exactly as the triggers do.
 *
 * ⛔ ED-3 and ED-17 are additionally asserted over the MIGRATION TEXT, because
 * a trigger modelled in a fake proves the fake. The artifact that will be
 * applied is the thing to check.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Row { [k: string]: unknown }
const events: Row[] = [];
const governs: Row[] = [];
const readings: { id: string; member_id: string; manuscript_id: string; keys: string[] }[] = [];
/** ⭐ ED-7 · every statement that touched the standing table, for the coupling law. */
const standingWrites: string[] = [];
let uuidSeq = 0;

const run = async (sql: string, params: unknown[] = []): Promise<{ rows: Row[]; rowCount: number }> => {
  if (/developmental_observation_standing_events/.test(sql)) {
    standingWrites.push(sql);
    return { rows: [], rowCount: 0 };
  }

  if (/UPDATE|DELETE/.test(sql) && /editorial_decision/.test(sql)) {
    const err = new Error('editorial decisions are append-only');
    (err as { code?: string }).code = '23001';
    throw err;
  }

  if (/FROM developmental_readings/.test(sql)) {
    /**
     * ⛔⭐ THE FAKE FOLLOWS THE QUERY; IT DOES NOT SUBSTITUTE FOR IT.
     *
     * The first version matched member_id and manuscript_id in JavaScript
     * whatever the SQL said — so mutation M10, which DELETED the ownership
     * qualification from the statement, left the suite green. The fake was
     * enforcing the very law the code is supposed to enforce, which is the
     * FIFTH time in this programme that a fixture has quietly done the
     * implementation's job and reported it as a pass.
     *
     * So the filters applied here are exactly the ones the statement asks for.
     * Remove a predicate from the SQL and this fake stops applying it.
     */
    const [readingId, memberId, workId, key] = params as string[];
    const asksMember = /r\.member_id\s*=\s*\$2/.test(sql);
    const asksWork = /r\.manuscript_id\s*=\s*\$3/.test(sql);
    const r = readings.find((x) => x.id === readingId
      && (!asksMember || x.member_id === memberId)
      && (!asksWork || x.manuscript_id === workId));
    return r ? { rows: [{ resolves: r.keys.includes(key) }], rowCount: 1 } : { rows: [], rowCount: 0 };
  }

  if (/INSERT INTO editorial_decision_events/.test(sql)) {
    const [chainId, eventIndex, memberId, workId, statement, intent, principle,
      draftId, draftVersion, authorship] = params as never[];
    const chain = (chainId as string | null) ?? `00000000-0000-4000-8000-${String(++uuidSeq).padStart(12, '0')}`;
    /* The real UNIQUE (decision_chain_id, event_index). */
    if (events.some((e) => e.decision_chain_id === chain && e.event_index === eventIndex)) {
      const err = new Error('duplicate key'); (err as { code?: string }).code = '23505'; throw err;
    }
    const row: Row = {
      id: `e-${events.length + 1}`, decision_chain_id: chain, event_index: eventIndex,
      member_id: memberId, work_id: workId, statement, intent, principle,
      authorship, working_draft_id: draftId, working_draft_version: draftVersion,
      recorded_at: new Date('2026-09-13T12:00:00Z'),
    };
    events.push(row);
    return { rows: [row], rowCount: 1 };
  }

  if (/INSERT INTO editorial_decision_event_observations/.test(sql)) {
    const [chain, idx, readingId, key] = params as string[];
    governs.push({ decision_chain_id: chain, event_index: idx, reading_id: readingId,
      observation_key: key, relation: 'governs' });
    return { rows: [], rowCount: 1 };
  }

  if (/FROM editorial_decision_event_observations/.test(sql)) {
    const [chain, idx] = params as never[];
    const rows = governs.filter((g) => g.decision_chain_id === chain && g.event_index === idx);
    return { rows, rowCount: rows.length };
  }

  if (/DISTINCT ON \(decision_chain_id\)/.test(sql)) {
    const [memberId, workId] = params as string[];
    const mine = events.filter((e) => e.member_id === memberId && e.work_id === workId);
    const byChain = new Map<string, Row>();
    for (const e of mine) {
      const cur = byChain.get(e.decision_chain_id as string);
      if (!cur || (e.event_index as number) > (cur.event_index as number)) {
        byChain.set(e.decision_chain_id as string, e);
      }
    }
    return { rows: [...byChain.values()], rowCount: byChain.size };
  }

  if (/FROM editorial_decision_events/.test(sql)) {
    const [memberId, chain] = params as string[];
    const mine = events.filter((e) => e.member_id === memberId && e.decision_chain_id === chain);
    const asc = /event_index ASC/.test(sql);
    mine.sort((a, b) => (asc ? 1 : -1) * ((a.event_index as number) - (b.event_index as number)));
    return { rows: /LIMIT 1/.test(sql) ? mine.slice(0, 1) : mine, rowCount: mine.length };
  }

  return { rows: [], rowCount: 0 };
};

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn((sql: string, params?: unknown[]) => run(sql, params)),
  transaction: jest.fn(async (cb: (tx: { query: typeof run }) => Promise<unknown>) =>
    cb({ query: run })),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const store = require('../store');
import {
  parseRecordDecision, decisionsFor, mayRecord,
  type RecordDecisionRequest,
} from '../contract';

const MIGRATION = fs.readFileSync(path.join(process.cwd(),
  'database/migrations/20260913000001_editorial_decision_events.sql'), 'utf8');
const MIGRATION_CODE = MIGRATION.replace(/^\s*--.*$/gm, '');
const SRC = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

/**
 * ⛔⭐ THE C21 CLASS, AND IT BIT AGAIN HERE. A ban asserted over a whole file
 * matches the COMMENTS that document the ban: this file's first draft failed
 * because the migration says "No superseded_by" and the store says it mirrors
 * `manuscript/standing/store.ts`. Prose documenting compliance, read as the
 * violation returning.
 *
 * Every behaviour scan below therefore reads CODE, never prose — the same
 * discipline C6 and C21 have used since R4, for the same reason.
 */
const CODE = (rel: string) => SRC(rel)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*--.*$/gm, '')
  .replace(/^\s*\/\/.*$/gm, '');

const M = 'aaaaaaaa-0000-4000-8000-00000000000a';   // member
const W = 'bbbbbbbb-0000-4000-8000-00000000000b';   // work
const R = 'cccccccc-0000-4000-8000-00000000000c';   // reading of W
const OTHER_W = 'dddddddd-0000-4000-8000-00000000000d';
const R_OTHER_WORK = 'eeeeeeee-0000-4000-8000-00000000000e';
const R_OTHER_MEMBER = 'ffffffff-0000-4000-8000-00000000000f';

const CAMPFIRE: RecordDecisionRequest = {
  expectedCurrentEventId: null,
  body: {
    statement: 'Keep the campfire recurrence. Each return must advance rather than merely repeat.',
    intent: 'The lived campfire experience remains phenomenological first.',
    principle: 'lived scene → interpretation → presence → sustaining → embers',
  },
  governs: [{ readingId: R, observationKey: 'o1' }],
  authorship: 'member_confirmed_maia_proposal',
  workingDraftId: '99999999-0000-4000-8000-000000000009',
  workingDraftVersion: 34,
};

beforeEach(() => {
  events.length = 0; governs.length = 0; readings.length = 0;
  standingWrites.length = 0; uuidSeq = 0;
  readings.push(
    { id: R, member_id: M, manuscript_id: W, keys: ['o1', 'o4', 'o21', 'o22'] },
    { id: R_OTHER_WORK, member_id: M, manuscript_id: OTHER_W, keys: ['o1'] },
    { id: R_OTHER_MEMBER, member_id: 'someone-else', manuscript_id: W, keys: ['o1'] },
  );
});

/* ══ ED-1 · ED-2 — the body ═════════════════════════════════════════════ */

describe('ED-1 — statement is required and non-blank', () => {
  it('a blank or whitespace-only statement is refused at the contract', () => {
    for (const statement of ['', '   ', '\n\t']) {
      expect(parseRecordDecision({ ...wire(), statement }).ok).toBe(false);
    }
  });
  it('a real ruling parses', () => {
    expect(parseRecordDecision(wire()).ok).toBe(true);
  });
});

describe('ED-2 — intent and principle are optional', () => {
  it('a decision with neither is lawful', async () => {
    const r = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, body: { statement: 'Cut the second telling.' },
    });
    expect(r.outcome).toBe('appended');
    expect(r.event.intent).toBeUndefined();
    expect(r.event.principle).toBeUndefined();
  });
});

/* ══ ED-3 · ED-17 — append-only, on BOTH tables ════════════════════════ */

describe('ED-3 — the event table is append-only, ENFORCED', () => {
  it('⛔ a trigger refuses UPDATE and DELETE — not a convention', () => {
    expect(MIGRATION).toMatch(/BEFORE UPDATE OR DELETE ON editorial_decision_events/);
    expect(MIGRATION).toMatch(/RAISE EXCEPTION/);
  });
});

describe('ED-17 — the GOVERNED SET is append-only too', () => {
  /**
   * ⭐⭐ FOUNDER FINDING D3. The design said the governed set "is immutable with
   * the event" while only the parent carried a trigger, so the database still
   * permitted: event 1 governs {o1, o4} → DELETE the o4 row → event 1 now reads
   * {o1}. That rewrites member authority with no successor and no trace.
   */
  it('⛔ the scope table carries the same trigger', () => {
    expect(MIGRATION).toMatch(/BEFORE UPDATE OR DELETE ON editorial_decision_event_observations/);
  });

  it('⛔ and an ordinary reading deletion cannot silently erase scope', () => {
    /* CASCADE here would let a routine delete rewrite what a member governed.
       A constitutional erasure purge is a SEPARATE authority. */
    expect(MIGRATION).toMatch(/REFERENCES developmental_readings\(id\) ON DELETE RESTRICT/);
    expect(MIGRATION).not.toMatch(/REFERENCES developmental_readings\(id\) ON DELETE CASCADE/);
  });

  it('the store never issues an UPDATE or DELETE against either table', () => {
    const src = CODE('lib/manuscript/editorialDecision/store.ts');
    expect(src).not.toMatch(/UPDATE editorial_decision|DELETE FROM editorial_decision/);
  });
});

/* ══ ED-4 · ED-13 · ED-16 — successor-carried time ═════════════════════ */

describe('ED-4 — current is the highest event_index; no superseded_by is stored', () => {
  it('a successor becomes current and the prior event remains', async () => {
    const first = await store.recordEditorialDecision(M, W, CAMPFIRE);
    const chain = first.event.decisionChainId;
    const second = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, decisionChainId: chain, expectedCurrentEventId: first.event.id,
      body: { statement: 'Revised: the campfire becomes progressively conceptual.' },
    });
    expect(second.outcome).toBe('appended');
    expect(second.event.eventIndex).toBe(1);
    const current = await store.currentDecision(M, chain);
    expect(current.eventIndex).toBe(1);
    expect(current.statement).toMatch(/progressively conceptual/);
  });

  it('⛔ no `superseded_by` exists in the schema or the code', () => {
    expect(MIGRATION_CODE).not.toMatch(/superseded_by/);
    expect(CODE('lib/manuscript/editorialDecision/store.ts')).not.toMatch(/superseded_by|supersededBy/);
  });
});

describe('ED-13 — widening scope is a SUCCESSOR, not a mutation', () => {
  it('⭐ {o1} → {o1, o4} appends; the prior event still governs {o1}', async () => {
    const first = await store.recordEditorialDecision(M, W, CAMPFIRE);
    const chain = first.event.decisionChainId;
    await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, decisionChainId: chain, expectedCurrentEventId: first.event.id,
      governs: [{ readingId: R, observationKey: 'o1' }, { readingId: R, observationKey: 'o4' }],
    });
    const history = await store.decisionHistory(M, chain);
    expect(history).toHaveLength(2);
    expect(history[0].governs.map((g: { observationKey: string }) => g.observationKey)).toEqual(['o1']);
    expect(history[1].governs.map((g: { observationKey: string }) => g.observationKey).sort())
      .toEqual(['o1', 'o4']);
  });
});

describe('ED-16 — a revised ruling does not erase the one before it', () => {
  it('history is readable, oldest first', async () => {
    const first = await store.recordEditorialDecision(M, W, CAMPFIRE);
    await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, decisionChainId: first.event.decisionChainId,
      expectedCurrentEventId: first.event.id,
      body: { statement: 'Revised: progressively conceptual.' },
    });
    const h = await store.decisionHistory(M, first.event.decisionChainId);
    expect(h[0].statement).toMatch(/must advance/);
    expect(h[1].statement).toMatch(/progressively conceptual/);
  });
});

/* ══ ED-5 — concurrency ════════════════════════════════════════════════ */

describe('ED-5 — the expected-current test refuses rather than retries', () => {
  it('a stale token is refused', async () => {
    const first = await store.recordEditorialDecision(M, W, CAMPFIRE);
    const stale = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, decisionChainId: first.event.decisionChainId,
      expectedCurrentEventId: null,
      body: { statement: 'Something else entirely.' },
    });
    expect(stale).toEqual({ outcome: 'refused', reason: 'stale_expectation' });
  });

  it('⛔ and nothing in the store retries', () => {
    const src = CODE('lib/manuscript/editorialDecision/store.ts');
    expect(src).not.toMatch(/retry|attempt\s*\+\+|for \(let i = 0; i < \d/i);
  });

  it('re-recording an identical ruling is `unchanged`, not a new decision', async () => {
    const first = await store.recordEditorialDecision(M, W, CAMPFIRE);
    const again = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, decisionChainId: first.event.decisionChainId,
      expectedCurrentEventId: first.event.id,
    });
    expect(again.outcome).toBe('unchanged');
    expect(events).toHaveLength(1);
  });
});

/* ══ ED-6 — UNKNOWN ≠ UNSET ════════════════════════════════════════════ */

describe('ED-6 — a failed lookup is never rendered as “no decisions”', () => {
  it('unavailable and loading are UNKNOWN; available-and-empty is NONE', () => {
    expect(decisionsFor({ state: 'loading', workId: W }, W).state).toBe('unknown');
    expect(decisionsFor({ state: 'unavailable', workId: W }, W).state).toBe('unknown');
    expect(decisionsFor({ state: 'available', workId: W, decisions: [] }, W).state).toBe('none');
  });

  it('⛔ the act is not offerable while the state is unknown', () => {
    expect(mayRecord(decisionsFor({ state: 'unavailable', workId: W }, W))).toBe(false);
    expect(mayRecord(decisionsFor({ state: 'available', workId: W, decisions: [] }, W))).toBe(true);
  });

  it('a lookup for another Work is UNKNOWN, never NONE', () => {
    expect(decisionsFor({ state: 'available', workId: OTHER_W, decisions: [] }, W))
      .toEqual({ state: 'unknown', reason: 'other-work' });
  });
});

/* ══ ED-7 — ⭐⭐ THE COUPLING LAW ══════════════════════════════════════ */

describe('ED-7 — recording a decision writes NO standing', () => {
  it('⭐⭐ zero statements touch the standing table', async () => {
    await store.recordEditorialDecision(M, W, CAMPFIRE);
    expect(standingWrites).toEqual([]);
  });

  it('⛔ and the module does not import the standing store at all', () => {
    const src = CODE('lib/manuscript/editorialDecision/store.ts');
    expect(src).not.toMatch(/standing\/store|recordStanding/);
  });
});

/* ══ ED-8 — the body is not executable ════════════════════════════════ */

describe('ED-8 — no field a rewrite could travel in', () => {
  it('⛔ the recorded event has exactly the declared keys', async () => {
    const r = await store.recordEditorialDecision(M, W, CAMPFIRE);
    expect(Object.keys(r.event).sort()).toEqual([
      'authorship', 'decisionChainId', 'eventIndex', 'governs', 'id', 'intent',
      'principle', 'recordedAt', 'statement', 'workId', 'workingDraftId',
      'workingDraftVersion',
    ]);
  });

  it('⛔ the contract declares no prose, range, diff or operation field', () => {
    const src = CODE('lib/manuscript/editorialDecision/contract.ts');
    for (const forbidden of [/readonly proposedText/, /readonly replacement/,
      /readonly range\b/, /readonly diff/, /readonly operation/, /readonly hunks/]) {
      expect(src).not.toMatch(forbidden);
    }
  });

  it('⛔ an unknown field is REFUSED, not ignored — it cannot arrive by tolerance', () => {
    expect(parseRecordDecision({ ...wire(), proposedText: 'the rewritten paragraph' }).ok).toBe(false);
    expect(parseRecordDecision({ ...wire(), range: { start: 0, end: 10 } }).ok).toBe(false);
  });
});

/* ══ ED-9 · ED-10 — governs is explicit ═══════════════════════════════ */

describe('ED-9 — `governs` is never derived', () => {
  it('⛔ nothing reads sections, digests or evidence refs to build scope', () => {
    const src = CODE('lib/manuscript/editorialDecision/store.ts')
      + CODE('lib/manuscript/editorialDecision/contract.ts');
    for (const forbidden of [/evidenceRefs/, /sectionId/, /digest/, /locateCurrent/,
      /manuscript_draft_sections/, /readState/]) {
      expect(src).not.toMatch(forbidden);
    }
  });

  it('only the observations the member named are recorded', async () => {
    await store.recordEditorialDecision(M, W, CAMPFIRE);
    expect(governs).toHaveLength(1);
    expect(governs[0].observation_key).toBe('o1');
  });
});

describe('ED-10 — a decision may govern observations sharing NO sections', () => {
  it('⭐ o1 and o22 share no section, and governance is still lawful', async () => {
    const r = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE,
      governs: [{ readingId: R, observationKey: 'o1' }, { readingId: R, observationKey: 'o22' }],
    });
    expect(r.outcome).toBe('appended');
    expect(r.event.governs).toHaveLength(2);
  });
});

/* ══ ED-11 · ED-12 — authority ════════════════════════════════════════ */

describe('ED-11 — authorship is one of two, and authority is MEMBER in both', () => {
  it('both values are accepted and anything else is refused', () => {
    for (const authorship of ['member_authored', 'member_confirmed_maia_proposal']) {
      expect(parseRecordDecision({ ...wire(), authorship }).ok).toBe(true);
    }
    for (const authorship of ['maia_authored', 'system', 'inferred', '']) {
      expect(parseRecordDecision({ ...wire(), authorship }).ok).toBe(false);
    }
  });
});

describe('ED-12 — MAIA may propose wording; she may not ratify', () => {
  it('⛔ every write path takes a memberId as its first authority', () => {
    const src = CODE('lib/manuscript/editorialDecision/store.ts');
    expect(src).toMatch(/recordEditorialDecision\(\s*memberId: string/);
    /* ⛔ No default, no fallback, no system actor. */
    expect(src).not.toMatch(/memberId\s*=\s*['"]/);
    expect(src).not.toMatch(/SYSTEM_MEMBER|'system'|maiaId/);
  });

  it('⛔ `member_confirmed_maia_proposal` is still a MEMBER act, not a MAIA one', async () => {
    const r = await store.recordEditorialDecision(M, W, CAMPFIRE);
    expect(r.event.authorship).toBe('member_confirmed_maia_proposal');
    expect(events[0].member_id).toBe(M);
  });
});

/* ══ ED-14 · ED-15 — the rest ═════════════════════════════════════════ */

describe('ED-14 — the structural digest machinery is untouched', () => {
  it('this lane adds nothing to and reads nothing from it', () => {
    const src = CODE('lib/manuscript/editorialDecision/store.ts');
    expect(src).not.toMatch(/development\/resolve|readState|sha256/);
    expect(MIGRATION_CODE).not.toMatch(/manuscript_draft_sections|working_draft_revisions/);
  });
});

describe('ED-15 — the decision records the state of the Work it was made against', () => {
  it('the draft id and version are carried, and are whole or absent', async () => {
    const r = await store.recordEditorialDecision(M, W, CAMPFIRE);
    expect(r.event.workingDraftVersion).toBe(34);
    /* A version with no draft names nothing. */
    expect(parseRecordDecision({ ...wire(), workingDraftId: null, workingDraftVersion: 34 }).ok)
      .toBe(false);
  });
});

/* ══ ED-18 — ⭐⭐ same member, same Work ══════════════════════════════ */

describe('ED-18 — a governed observation must belong to this member and this Work', () => {
  it('⛔ a reading from ANOTHER Work refuses', async () => {
    const r = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, governs: [{ readingId: R_OTHER_WORK, observationKey: 'o1' }],
    });
    expect(r).toEqual({ outcome: 'refused', reason: 'address_unresolved' });
    expect(events).toHaveLength(0);
  });

  it('⛔ another member’s reading refuses, and is INDISTINGUISHABLE from absent', async () => {
    const other = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, governs: [{ readingId: R_OTHER_MEMBER, observationKey: 'o1' }],
    });
    const absent = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, governs: [{ readingId: '11111111-0000-4000-8000-000000000001', observationKey: 'o1' }],
    });
    expect(other).toEqual(absent);
  });

  it('an unresolvable key in a qualifying reading is its own refusal', async () => {
    const r = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE, governs: [{ readingId: R, observationKey: 'o99' }],
    });
    expect(r).toEqual({ outcome: 'refused', reason: 'observation_unknown' });
  });

  it('⛔ qualification happens BEFORE anything is written — a mixed set writes nothing', async () => {
    const r = await store.recordEditorialDecision(M, W, {
      ...CAMPFIRE,
      governs: [{ readingId: R, observationKey: 'o1' },
        { readingId: R_OTHER_WORK, observationKey: 'o1' }],
    });
    expect(r.outcome).toBe('refused');
    expect(events).toHaveLength(0);
    expect(governs).toHaveLength(0);
  });
});

/* ══ the first specimen ═══════════════════════════════════════════════ */

describe('the first real record — D1, the campfire', () => {
  it('⭐ records exactly what the founder specified, and nothing more', async () => {
    const r = await store.recordEditorialDecision(M, W, CAMPFIRE);
    expect(r.outcome).toBe('appended');
    expect(r.event.statement).toMatch(/Each return must advance/);
    expect(r.event.governs).toEqual([{ readingId: R, observationKey: 'o1' }]);
    expect(r.event.workingDraftVersion).toBe(34);
    expect(r.event.authorship).toBe('member_confirmed_maia_proposal');
    /* ⛔ No o4. No standing. No manuscript touched. */
    expect(r.event.governs.some((g: { observationKey: string }) => g.observationKey === 'o4')).toBe(false);
    expect(standingWrites).toEqual([]);
  });
});

function wire() {
  return {
    expectedCurrentEventId: null,
    statement: CAMPFIRE.body.statement,
    intent: CAMPFIRE.body.intent,
    principle: CAMPFIRE.body.principle,
    governs: [{ readingId: R, observationKey: 'o1' }],
    authorship: 'member_confirmed_maia_proposal',
    workingDraftId: CAMPFIRE.workingDraftId,
    workingDraftVersion: 34,
  };
}
