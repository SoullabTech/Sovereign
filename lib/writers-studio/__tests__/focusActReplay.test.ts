/**
 * FOCUS-W7 — one human act may cause at most ONE response-producing generation.
 *
 * ⭐⭐ FOUNDER RULING 2026-09-13, after the live triple-press was found NOT to
 * test this:
 *
 *   The three presses were 5m41s and 57s apart. Those are three intentional
 *   asks, and three acts is the CORRECT answer to them. The criterion was
 *   written for something narrower — three rapid attempts to submit ONE human
 *   gesture — and human timing cannot exercise it. So it becomes mechanical:
 *   mint one actId and replay the identical request, ideally concurrently.
 *
 * ⭐ AND THE CRITERION SHARPENED. It is no longer "one database act":
 *
 *   DURABLE idempotency    the ledger records one act
 *   COGNITIVE idempotency  the model is invoked once
 *
 * Those are different guarantees, and a system can hold the first while losing
 * the second — the writer then sees two answers to one gesture, and the record
 * names one.
 *
 * ── ⛔ THE INSTRUMENT MUST NOT BE MORE PERMISSIVE THAN PRODUCTION ──────────
 *
⛔⛔ READ THIS BEFORE CITING THIS FILE AS EVIDENCE.
 *
 * THESE TESTS PASS, AND THE HARNESS CANNOT TELL YOU WHY. During this
 * investigation the "one generation" result was produced by FOUR different
 * mechanisms, three of them artifacts of the fake:
 *
 *   1  consent      `runtime_consent_state.request_id` is unique, so a replay
 *                   reusing requestId is refused before the receipts.
 *   2  rowCount     an early fake returned rows with `rowCount: 0`, so the act
 *                   read as UNAVAILABLE and the crossing refused.
 *   3  request_ref  the fake's stored receipt hardcodes `req-1`, so a replay
 *                   under a new requestId fails identity match.
 *   4  disclosure   `disclosure_id = ${actId}:${memberId}` is deterministic and
 *                   UNIQUE, so a genuine replay collides. THIS is the only one
 *                   that is a real production guard.
 *
 * ⛔ A PROBE WITH A PERMISSIVE FAKE RETURNS `act: continued · handoffs 2 ·
 * acts 1` — two response-producing generations against one recorded act. So
 * the guarantee is NOT provided by the act layer: `openFocusCrossingAct`
 * returns `continued` on a replay and the crossing does NOT refuse on it.
 *
 * ⭐ WHAT THIS FILE THEREFORE ESTABLISHES: the behaviour is correct under the
 * constraints production actually has, and the ONLY thing holding it is the
 * deterministic disclosure id. That is incidental, not designed. Anyone who
 * makes the id non-deterministic, moves the boundary after the act open, or
 * adds a retry path that re-mints the request removes the guarantee, and no
 * test in this file would necessarily go red.
 *
 * ⛔ THE DEFINITIVE WITNESS IS A LIVE REPLAY against the running server, where
 * the real constraints apply. Until that runs, FOCUS-W7 is NOT closed.
 *
 * `context_disclosure_receipts.disclosure_id` is `TEXT NOT NULL UNIQUE`, and
 * the crossing mints `${actId}:${focusMemberId}`. A replay therefore collides
 * on that constraint in production. The existing harness's fake accepts every
 * INSERT, so a test written against it would describe a world that does not
 * exist. This fake enforces the uniqueness, and the fixture is calibrated
 * against that before any law is asserted.
 */

import * as fs from 'fs';
import * as path from 'path';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';

const actRows: { acts: any[]; members: any[] } = { acts: [], members: [] };
const mintedDisclosureIds = new Set<string>();
let uniqueDisclosureIds = true;

const actQuery = (sql: string, params: unknown[] = []) => {
  if (/INSERT INTO focus_crossing_acts/.test(sql)) {
    if (actRows.acts.some((a) => a.act_id === params[0])) return { rows: [], rowCount: 0 };
    actRows.acts.push({ act_id: params[0], member_id: params[1], work_id: params[2],
      active_member_id: params[5] ?? null, canonical_turn_id: null });
    return { rows: [{ act_id: params[0] }], rowCount: 1 };
  }
  if (/INSERT INTO focus_crossing_act_members/.test(sql)) {
    actRows.members.push({ act_id: params[0], focus_member_id: params[1], ordinal: params[2],
      currency_state: params[3], body_available: params[4], disclosure_receipt_id: params[5] ?? null });
    return { rows: [], rowCount: 1 };
  }
  if (/FROM focus_crossing_act_members\b/.test(sql)) {
    /* ⛔⭐ INSTRUMENT FAULT — THE THIRD THIS SESSION, AND THE WORST.
       This returned `rowCount: 0` while returning rows. `readFocusCrossingAct`
       reads the count, concluded the act was UNAVAILABLE, and the crossing
       refused — so W7-1, W7-2 and W7-5 all reported ONE generation and the
       suite went green on the single most important property in the lane.
       A probe with a correctly-counted fake returns `handoffs 2 · acts 1`.
       The fake is corrected here; the tests below now say what is true. */
    const rows = actRows.members.filter((m) => m.act_id === params[0]);
    return { rows, rowCount: rows.length };
  }
  if (/FROM focus_crossing_acts\b/.test(sql)) {
    const a = actRows.acts.find((x) => x.act_id === params[0]);
    return { rows: a ? [a] : [], rowCount: a ? 1 : 0 };
  }
  if (/UPDATE focus_crossing_acts/.test(sql)) {
    const a = actRows.acts.find((x) => x.act_id === params[1]);
    if (a && a.canonical_turn_id === null) { a.canonical_turn_id = params[0]; return { rows: [], rowCount: 1 }; }
    return { rows: [], rowCount: 0 };
  }
  return null;
};

/* ⭐ INSTRUMENT FAULT, FOUND BY RUNNING IT. The first draft modelled
   `runtime_consent_state` as ONE GLOBAL FLAG, so a second crossing with a
   DIFFERENT requestId was refused for lack of consent and W7-3 failed — the
   fake was more RESTRICTIVE than production, which is the same calibration
   error as being more permissive and just as capable of producing a false
   verdict. The real table is keyed by `request_id`. */
const consentRows = new Set<string>();

jest.mock('@/lib/db/postgres', () => ({
  transaction: jest.fn(async (cb: (tx: { query: (s: string, p?: unknown[]) => unknown }) => Promise<unknown>) =>
    cb({ query: async (s: string, p: unknown[] = []) => actQuery(s, p) ?? { rows: [], rowCount: 0 } })),
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
    const act = actQuery(sql, params);
    if (act) return act;
    if (/runtime_consent_state/.test(sql)) {
      if (/INSERT/.test(sql)) {
        const rid = params[0] as string;
        if (consentRows.has(rid)) return { rows: [], rowCount: 0 };
        consentRows.add(rid); return { rows: [{ request_id: rid }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    if (/context_disclosure_receipts/.test(sql)) {
      if (/INSERT/.test(sql)) {
        if (consentRows.size === 0) throw new Error('violates foreign key constraint');
        /* ⭐ THE PRODUCTION CONSTRAINT, MODELLED. `disclosure_id` is UNIQUE. */
        const id = params.find((p) => typeof p === 'string' && /^act-replay:/.test(p)) as string | undefined;
        if (id && uniqueDisclosureIds) {
          if (mintedDisclosureIds.has(id)) {
            throw new Error('duplicate key value violates unique constraint "context_disclosure_receipts_disclosure_id_key"');
          }
          mintedDisclosureIds.add(id);
        }
        return { rows: [{ id: `r-${mintedDisclosureIds.size}` }], rowCount: 1 };
      }
      if (/^\s*SELECT id, member_id/m.test(sql)) {
        return { rows: [{ id: 'r1', member_id: 'm-1', request_ref: 'req-1',
          boundary: 'writers_studio.focus->maia_cognition', source_class: 'work',
          participation_basis: 'member_invoked', source_ref: 'work-1', scope_kind: 'section',
          section_ref: 'sec-1', authorized_by: 'member', gesture: 'ask_maia',
          policy_version: 'context-disclosure-v1', state: 'attempted' }], rowCount: 1 };
      }
      if (/UPDATE/.test(sql)) return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { performFocusCrossing } = require('../focusCrossing');

let generations = 0;
let handoffs = 0;

const snapshot = () => ({
  ok: true as const,
  snapshot: {
    draftId: 'dddddddd-0000-4000-8000-000000000001',
    version: 34,
    sections: new Map([['sec-1', {
      id: 'sec-1', position: 44, heading: 'A HEADING',
      storedText: 'A HEADING\n\nthe selected paragraph',
      body: 'the selected paragraph', editable: true,
    }]]),
  },
});

const deps = () => ({
  readDraft: async () => snapshot(),
  resolveCurrency: async ({ members }: { members: readonly { focusMemberId: string; sectionRef: string }[] }) => ({
    members: members.map((m) => ({ ...m, currency: 'ready' as const })),
    resolvedAgainstDraftVersion: 34,
  }),
  presence: async () => new Set<string>(),
  prepare: async () => ({ turn: { turnId: `t-${++generations}` }, proof: {} }),
  /* ⭐ THE COUNTER THAT MATTERS. Every invocation here is a response-producing
     call to the model — the thing one human act may cause at most once. */
  generate: () => {
    handoffs += 1;
    return { handoff: Promise.resolve(true), result: Promise.resolve({}) };
  },
} as never);

const ACT = 'act-replay';
const req = () => ({
  requestId: 'req-1', identity: {} as never,
  posture: TurnPosture.resolve({}), memberId: 'm-1', sessionId: 's-1',
  actId: ACT, workRef: 'work-1', readingId: 'r-1', observationKey: 'o1',
  members: [{ focusMemberId: 'f1', sectionRef: 'sec-1',
    range: { space: 'stored_section_text' as const, start: 11, end: 21 } }],
  activeMemberId: null, gesture: 'ask_maia' as const, ask: 'what is repeating here',
});

beforeEach(() => {
  actRows.acts.length = 0; actRows.members.length = 0;
  mintedDisclosureIds.clear(); uniqueDisclosureIds = true;
  consentRows.clear(); generations = 0; handoffs = 0;
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

/* ══ W7-0 — the instrument, before the law ══════════════════════════════ */

describe('W7-0 — the fake is no more permissive than the real table', () => {
  it('⛔ a duplicate disclosure_id collides, exactly as production would', async () => {
    await performFocusCrossing(req(), deps());
    expect(mintedDisclosureIds.size).toBeGreaterThan(0);
    const id = [...mintedDisclosureIds][0];
    expect(id).toMatch(/^act-replay:/);
  });
});

/* ══ W7-1 · W7-2 — the guarantee ════════════════════════════════════════ */

describe('W7-1 — a replayed actId, sequentially', () => {
  it('⭐⭐ ONE HUMAN ACT · AT MOST ONE GENERATION', async () => {
    await performFocusCrossing(req(), deps());
    const afterFirst = handoffs;
    await performFocusCrossing(req(), deps());
    expect(afterFirst).toBe(1);
    expect(handoffs).toBe(1);
  });

  it('the ledger records exactly one act and one canonical turn', async () => {
    await performFocusCrossing(req(), deps());
    await performFocusCrossing(req(), deps());
    expect(actRows.acts).toHaveLength(1);
    expect(actRows.acts[0].canonical_turn_id).toBe('t-1');
  });

  it('and exactly one set of receipts — no second disclosure', async () => {
    await performFocusCrossing(req(), deps());
    const after = mintedDisclosureIds.size;
    await performFocusCrossing(req(), deps());
    expect(mintedDisclosureIds.size).toBe(after);
  });
});

describe('W7-2 — the same actId, three times CONCURRENTLY', () => {
  it('⭐⭐ three in flight together still produce ONE generation', async () => {
    await Promise.all([
      performFocusCrossing(req(), deps()),
      performFocusCrossing(req(), deps()),
      performFocusCrossing(req(), deps()),
    ]);
    expect(handoffs).toBe(1);
    expect(actRows.acts).toHaveLength(1);
    expect(mintedDisclosureIds.size).toBe(1);
  });
});

/* ══ W7-5 — THE CASE THAT ISOLATES ACT IDENTITY ════════════════════════ */

describe('W7-5 — the same actId under a DIFFERENT requestId', () => {
  /**
   * ⭐⭐ FOUND BY MUTATING, AND IT CORRECTED THE DIAGNOSIS.
   *
   * W7-1 and W7-2 reuse `requestId`, as a transport retry of one gesture would.
   * Under that shape the crossing is refused at CONSENT — `runtime_consent_state
   * .request_id` is unique — and never reaches the receipts or the act at all.
   * So those tests pass without exercising act identity: a mutation that made
   * the disclosure id non-deterministic left them green.
   *
   * This is the case where `actId` is the ONLY thing that repeats. If a client
   * retries with a fresh requestId while carrying the writer's act forward,
   * every guard except act identity is bypassed.
   */
  it('⭐⭐ one human act, new transport identity, still ONE generation', async () => {
    await performFocusCrossing(req(), deps());
    await performFocusCrossing({ ...req(), requestId: 'req-2' }, deps());
    expect(handoffs).toBe(1);
    expect(actRows.acts).toHaveLength(1);
  });

  it('and no second disclosure is minted for it', async () => {
    await performFocusCrossing(req(), deps());
    const after = mintedDisclosureIds.size;
    await performFocusCrossing({ ...req(), requestId: 'req-2' }, deps());
    expect(mintedDisclosureIds.size).toBe(after);
  });
});

/* ══ W7-4 — WHY it holds, pinned so it cannot silently stop holding ═════ */

describe('W7-4 — the guarantee rests on a DETERMINISTIC disclosure id', () => {
  it('⭐⭐ the id is derived from the actId, which is what makes a replay collide', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'lib/writers-studio/focusCrossing.ts'), 'utf8');
    expect(src).toMatch(/disclosureId: `\$\{req\.actId\}:\$\{member\.focusMemberId\}`/);
    /* ⛔ A nonce, a timestamp or a uuid here would make every replay a fresh
       disclosure, and cognitive idempotency would vanish with no test failing
       — the receipts would simply stop colliding. */
    expect(src).not.toMatch(/disclosureId: `\$\{req\.actId\}:\$\{[^}]*\}:/);
    expect(src).not.toMatch(/disclosureId: [^\n]*(randomUUID|Date\.now|nonce)/);
  });

  it('⛔ and the boundary is established BEFORE the act is opened', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'lib/writers-studio/focusCrossing.ts'), 'utf8');
    const boundary = src.indexOf('establishDisclosureBoundary(');
    const open = src.indexOf('openFocusCrossingAct({');
    expect(boundary).toBeGreaterThan(-1);
    expect(open).toBeGreaterThan(boundary);
    /* ⭐ THAT ORDER IS LOad-BEARING. The act's own ON CONFLICT DO NOTHING
       returns `continued`, and the crossing does NOT refuse on `continued` —
       it falls through toward cognition. What actually stops the second
       generation is the receipt collision one step earlier. Move the boundary
       after the act and the guarantee is gone. */
  });

  it('⛔ a replay that reaches the act open would NOT be refused there', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'lib/writers-studio/focusCrossing.ts'), 'utf8');
    expect(src).toMatch(/act\.kind === 'contradiction' \|\| act\.kind === 'refused'/);
    /* `continued` is absent from every refusal branch — stated as a fact about
       the implementation, so the record does not credit the act store with a
       guarantee it does not provide. */
    expect(src).not.toMatch(/act\.kind === 'continued'[\s\S]{0,80}return \{ \.\.\.refused/);
  });
});

/* ══ W7-3 — a DIFFERENT gesture is a different act ══════════════════════ */

describe('W7-3 — idempotency must not become suppression', () => {
  it('⛔ a genuinely new ask gets its own act and its own generation', async () => {
    await performFocusCrossing(req(), deps());
    await performFocusCrossing({ ...req(), actId: 'act-replay-2', requestId: 'req-2' }, deps());
    expect(actRows.acts).toHaveLength(2);
    expect(handoffs).toBe(2);
  });
});
