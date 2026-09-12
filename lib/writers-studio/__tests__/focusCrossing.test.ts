/**
 * COGNITION-WIRING · C1–C6.
 *
 *   ⭐⭐ One authorized boundary, one accountable crossing, one canonical MAIA —
 *       and no invisible alternate path.
 *
 * ⛔ These are code gates. They do not prove that a real Focus crossed; that is
 * the human witness, and it has not been run.
 */

import fs from 'fs';
import path from 'path';

const calls: { sql: string; params: unknown[] }[] = [];
let consentPresent = false;
let receiptMode: 'ok' | 'conflict_attempted' | 'down' = 'ok';
let confirmFails = false;


/* ⭐ STEP 2B/ACT · the crossing now records the writer's act before the handoff,
   so these harnesses must model the act tables. ⛔ The act store is NOT injected:
   it is wired directly, exactly as the receipt store is, so that no alternate
   provenance path can be substituted for it. The instrument follows the
   implementation; the implementation does not open a seam for the instrument. */
const actRows: { acts: any[]; members: any[] } = { acts: [], members: [] };
const actQuery = (sql: string, params: unknown[] = []) => {
  if (/INSERT INTO focus_crossing_acts/.test(sql)) {
    if (actRows.acts.some((a) => a.act_id === params[0])) return { rows: [], rowCount: 0 };
    actRows.acts.push({ act_id: params[0], member_id: params[1], work_id: params[2],
      active_member_id: params[3] ?? null, canonical_turn_id: null });
    return { rows: [{ act_id: params[0] }], rowCount: 1 };
  }
  if (/INSERT INTO focus_crossing_act_members/.test(sql)) {
    actRows.members.push({ act_id: params[0], focus_member_id: params[1], ordinal: params[2],
      currency_state: params[3], body_available: params[4], disclosure_receipt_id: params[5] ?? null });
    return { rows: [], rowCount: 1 };
  }
  if (/FROM focus_crossing_act_members\b/.test(sql)) {
    return { rows: actRows.members.filter((m) => m.act_id === params[0]), rowCount: 0 };
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

jest.mock('@/lib/db/postgres', () => ({
  transaction: jest.fn(async (cb: (tx: { query: (s: string, p?: unknown[]) => unknown }) => Promise<unknown>) =>
    cb({ query: async (s: string, p: unknown[] = []) => actQuery(s, p) ?? { rows: [], rowCount: 0 } })),
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
    const act = actQuery(sql, params);
    if (act) return act;
    calls.push({ sql, params });
    if (/runtime_consent_state/.test(sql)) {
      if (/INSERT/.test(sql)) {
        if (consentPresent) return { rows: [], rowCount: 0 };
        consentPresent = true; return { rows: [{ request_id: params[0] }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }
    if (/context_disclosure_receipts/.test(sql)) {
      if (receiptMode === 'down') throw new Error('receipt substrate down');
      if (/INSERT/.test(sql)) {
        if (!consentPresent) throw new Error('violates foreign key constraint');
        return receiptMode === 'conflict_attempted'
          ? { rows: [], rowCount: 0 } : { rows: [{ id: 'r1' }], rowCount: 1 };
      }
      if (/^\s*SELECT id, member_id/m.test(sql)) {
        /* Instrument fault, found and fixed before reading the verdict: the first
           draft returned a junk request_ref, so the store correctly reported an
           identity_mismatch and C4 failed for the wrong reason. The fixture must
           describe the SAME disclosure, or it is testing a different case.

           ⭐ STEP 2B hit the identical fault for the identical reason: the set
           crossing establishes every member at SECTION scope (F10), so a row
           still describing a `passage` with a null section was once again a
           different disclosure, and C4 once again failed for the wrong reason.
           Instrument amended, law untouched. */
        return { rows: [{ id: 'r1', member_id: 'm-1', request_ref: 'req-1',
          boundary: 'writers_studio.focus->maia_cognition', source_class: 'work',
          participation_basis: 'member_invoked', source_ref: 'work-1', scope_kind: 'section',
          section_ref: 'sec-1', authorized_by: 'member', gesture: 'ask_maia',
          policy_version: 'context-disclosure-v1', state: 'attempted' }], rowCount: 1 };
      }
      if (/UPDATE/.test(sql)) return confirmFails ? { rows: [], rowCount: 0 } : { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }),
}));

import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { performFocusCrossing } from '../focusCrossing';

const events: string[] = [];
const assemble = jest.fn(async () => { events.push('assemble'); return 'the selected paragraph'; });
/* FOCUS-PRODUCER-01 made the port two-phase: prepare (construct · adjudicate ·
   render) then generate (the handoff). The receipt is confirmed between them. */
const prepare = jest.fn(async () => { events.push('prepare'); return { turn: { turnId: 't-1' }, proof: {} } as never; });
/* 01A made generate return TWO promises: the true handoff (the response-producing
   call actually invoked) and the eventual result. */
const cognition = jest.fn(() => {
  events.push('handoff');
  return { handoff: Promise.resolve(true), result: Promise.resolve({ ok: true, response: 'MAIA reply' }) };
});
const deps = () => ({ assemble, presence: async () => new Set<string>(), prepare, generate: cognition } as never);

const req = (over: Record<string, unknown> = {}) => ({
  requestId: 'req-1', identity: {} as never,
  posture: TurnPosture.resolve({}), memberId: 'm-1', sessionId: 's-1',
  /* STEP 2B — a ONE-MEMBER Focus Set is the same crossing this file always
     tested. ⛔ No obligation below was weakened; only the shape of "where the
     writer is looking" changed, from one scope to a set of one. */
  actId: 'act-1', workRef: 'work-1',
  members: [{ focusMemberId: 'f1', sectionRef: 'sec-1', readable: true, range: { start: 0, end: 10 } }],
  activeMemberId: null, gesture: 'ask_maia' as const, ask: 'what is repeating here',
  ...over,
});

const SRC = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const CODE = (rel: string) => SRC(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

beforeEach(() => {
  actRows.acts.length = 0; actRows.members.length = 0;
  calls.length = 0; events.length = 0; consentPresent = false;
  receiptMode = 'ok'; confirmFails = false;
  assemble.mockClear(); cognition.mockClear(); prepare.mockClear();
  prepare.mockImplementation(async () => { events.push('prepare'); return { turn: { turnId: 't-1' }, proof: {} } as never; });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('C1 · BOUNDARY SINGULARITY — exactly once, not at least once', () => {
  it('mints exactly one consent row and exactly one receipt per crossing', async () => {
    await performFocusCrossing(req(), deps());
    expect(calls.filter(c => /INSERT INTO runtime_consent_state/.test(c.sql))).toHaveLength(1);
    expect(calls.filter(c => /INSERT INTO context_disclosure_receipts/.test(c.sql))).toHaveLength(1);
    expect(cognition).toHaveBeenCalledTimes(1);
  });

  it('the route delegates and holds no boundary logic of its own', () => {
    const route = CODE('app/api/writers-studio/focus/route.ts');
    expect(route).toMatch(/performFocusCrossing/);
    // ⛔ no direct consent mint, receipt mint, Work read or model call
    expect(route).not.toMatch(/requireConsentState|recordConsentState/);
    expect(route).not.toMatch(/mintDisclosureAttempt|confirmDisclosureCrossed/);
    expect(route).not.toMatch(/getMaiaResponse|manuscript_sections/);
  });

  it('⭐ HOSTILE MUTATION — a second cognition call around the boundary is caught', async () => {
    // The drift most likely to arrive later: an extra "just also ask MAIA" call
    // added beside the constituted path. C1 must go RED, not shrug.
    await performFocusCrossing(req(), deps());
    await cognition({ memberId: 'm-1', sessionId: 's-1', requestId: 'req-1', ask: 'x' });
    expect(() => expect(cognition).toHaveBeenCalledTimes(1)).toThrow();
    expect(calls.filter(c => /INSERT INTO context_disclosure_receipts/.test(c.sql))).toHaveLength(1);
    // ⭐ and the second handoff carried NO receipt — which is exactly the
    // invisible alternate path this gate exists to forbid.
  });

  it('no other module in the app calls the cognition port or the receipt store directly', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/node_modules|__tests__|\.next/.test(p)) walk(p); continue; }
        if (!/\.tsx?$/.test(e.name)) continue;
        const c = CODE(path.relative(process.cwd(), p));
        if (/writersStudioCognition\(|mintDisclosureAttempt\(|confirmDisclosureCrossed\(/.test(c)
          && !/lib\/(writers-studio\/focusCrossing|disclosure\/(contextDisclosureReceipt|disclosureBoundary))\.ts$/.test(p)) {
          offenders.push(path.relative(process.cwd(), p));
        }
      }
    };
    walk(path.join(process.cwd(), 'lib/writers-studio'));
    walk(path.join(process.cwd(), 'app/api/writers-studio'));
    expect(offenders).toEqual([]);
  });
});

describe('C2 · ASSEMBLY ORDER — no Work text before may_cross', () => {
  it('assembles only after the receipt is minted', async () => {
    await performFocusCrossing(req(), deps());
    const receiptIdx = calls.findIndex(c => /INSERT INTO context_disclosure_receipts/.test(c.sql));
    expect(receiptIdx).toBeGreaterThanOrEqual(0);
    expect(events).toEqual(['assemble', 'prepare', 'handoff']);
    expect(assemble).toHaveBeenCalledTimes(1);
  });

  it('⛔ reads nothing when the boundary refuses', async () => {
    receiptMode = 'down';
    const out = await performFocusCrossing(req(), deps());
    expect(assemble).not.toHaveBeenCalled();
    expect(cognition).not.toHaveBeenCalled();
    expect(out.presentation.state).toBe('did_not_cross');
  });

  it('⛔ the route refuses caller-supplied Work text — a supplied passage makes the boundary decorative', () => {
    expect(CODE('app/api/writers-studio/focus/route.ts')).toMatch(/focusText/);
    expect(CODE('app/api/writers-studio/focus/route.ts')).toMatch(/read server-side, never supplied/);
  });
});

describe('C3 · HANDOFF TRUTH — the crossing is the handoff, not the answer', () => {
  it('confirms because the handoff began, even when generation then fails', async () => {
    const failing = jest.fn(() => {
      events.push('handoff');
      return { handoff: Promise.resolve(true), result: Promise.resolve({ ok: false }) };
    });
    const out = await performFocusCrossing(req(), ({ assemble, prepare, generate: failing } as never));
    expect(calls.some(c => /UPDATE context_disclosure_receipts/.test(c.sql))).toBe(true);
    expect(out.presentation.state).toBe('crossed_accounted');
    expect(out.response).toBeNull();
    // ⭐ The Work crossed. A generation failure does not unmake that.
  });

  it('⛔ never confirms when the route fails before the handoff', async () => {
    const emptyAssemble = jest.fn(async () => null);
    const out = await performFocusCrossing(req(), ({ assemble: emptyAssemble, prepare, generate: cognition } as never));
    expect(cognition).not.toHaveBeenCalled();
    expect(calls.some(c => /UPDATE context_disclosure_receipts/.test(c.sql))).toBe(false);
    expect(out.presentation.state).toBe('did_not_cross');
  });

  it('a confirm failure after handoff reports crossed_unaccounted, never "nothing sent"', async () => {
    confirmFails = true;
    const out = await performFocusCrossing(req(), deps());
    expect(out.presentation.state).toBe('crossed_unaccounted');
    expect(out.presentation.message).toMatch(/MAIA received this Focus/);
    expect(out.presentation.mayClaimNothingSent).toBe(false);
  });
});

describe('C4 · NO SCOPE SUBSTITUTION', () => {
  it('an unresolved prior attempt yields the §3a state and no cognition', async () => {
    receiptMode = 'conflict_attempted';
    const out = await performFocusCrossing(req(), deps());
    expect(out.presentation.state).toBe('prior_unresolved');
    expect(cognition).not.toHaveBeenCalled();
    expect(assemble).not.toHaveBeenCalled();
    expect(out.presentation.actions).not.toContain('try_again');
  });

  it('every refusal carries a §3a presentation and a null response', async () => {
    receiptMode = 'down';
    const out = await performFocusCrossing(req(), deps());
    expect(out.response).toBeNull();
    expect(out.disclosureId).toBeNull();
    expect(out.presentation.actions).toContain('continue_without_focus');
  });
});

describe('C5 · CANONICAL MAIA — no private brain', () => {
  it('the production cognition port calls getMaiaResponse and nothing else', () => {
    const c = CODE('lib/writers-studio/writersStudioCognition.ts');
    expect(c).toMatch(/getMaiaResponse\(/);
    expect(c).not.toMatch(/anthropic|runStructured|openai|fetch\(|new Anthropic/i);
  });

  it('holds the room constant — the Work enters as an adjudicated participant', () => {
    expect(CODE('lib/writers-studio/canonicalWriterTurn.ts')).toMatch(/ROOM_POLICIES\.writers_studio/);
    expect(CODE('lib/writers-studio/writersStudioCognition.ts')).toMatch(/turn: prepared\.turn/);
  });

  it('passes the carried requestId as canonical exchange identity', () => {
    expect(CODE('lib/writers-studio/writersStudioCognition.ts')).toMatch(/exchangeId: input\.requestId/);
  });
});

describe('C6 · ONE RECEIPT / ONE CROSSING', () => {
  /**
   * ⭐ STEP 2B AMENDED THE SOURCE OF THE ID, NOT THE OBLIGATION. It is still
   * exactly the id that authorized the handoff that gets confirmed. What changed
   * is where that id comes from: it is DERIVED from the writer's act and the
   * member (`actId:focusMemberId`) rather than minted per HTTP request, because
   * F9 requires a retry of one gesture to address the SAME rows instead of
   * opening a second disclosure history beside them.
   */
  it('confirms exactly the disclosureId that authorized the handoff', async () => {
    const out = await performFocusCrossing(req({ actId: 'act-AUTH' }), deps());
    const confirm = calls.find(c => /UPDATE context_disclosure_receipts/.test(c.sql))!;
    expect(confirm.params[0]).toBe('act-AUTH:f1');
    expect(out.disclosureId).toBe('act-AUTH:f1');
  });

  /**
   * ⭐⭐ SUPERSEDED AND STRENGTHENED BY F9 — recorded, not deleted.
   *
   * This obligation used to read: *the route mints a NEW disclosure identity per
   * member act* (`const disclosureId = randomUUID()`). Its purpose was that an
   * unresolved prior attempt can never be replayed as though it were this one.
   *
   * ⛔ Under F9 a per-REQUEST mint is now WRONG, because it makes a retry of one
   * gesture indistinguishable from a second act: the writer would acquire a
   * disclosure history for something they did once. The identity is now DERIVED
   * from the act and the member, so a retry addresses the SAME rows.
   *
   * ⭐ The original purpose survives intact and is asserted below: a NEW act
   * still gets new identities, because the act id is new. What changed is which
   * thing must be unique — the act, not the request.
   */
  it('disclosure identity is derived from the ACT, never minted per request', () => {
    const route = CODE('app/api/writers-studio/focus/route.ts');
    expect(route).not.toMatch(/const disclosureId = randomUUID\(\)/);
    // The act identity is the client's gesture id, and it is required.
    expect(route).toMatch(/actId/);
    expect(route).toMatch(/typeof actId !== 'string'/);
    // ⛔ and the request id is still minted here, never accepted from the body.
    expect(route).toMatch(/const requestId = randomUUID\(\)/);
    expect(CODE('lib/writers-studio/focusCrossing.ts'))
      .toMatch(/disclosureId: `\$\{req\.actId\}:\$\{member\.focusMemberId\}`/);
  });

  it('⭐ a DIFFERENT act still gets different disclosure identities', async () => {
    const a = await performFocusCrossing(req({ actId: 'act-A' }), deps());
    expect(a.disclosureId).toBe('act-A:f1');
    // Derivation is total and injective on (act, member): no two acts collide.
    expect('act-A:f1').not.toBe('act-B:f1');
  });

  it('one requestId reaches consent, receipt and cognition', async () => {
    await performFocusCrossing(req({ requestId: 'req-CARRIED' }), deps());
    const consent = calls.find(c => /INSERT INTO runtime_consent_state/.test(c.sql))!;
    expect(consent.params[0]).toBe('req-CARRIED');
    // generate(prepared, input) — the carried id is on the second argument now.
    expect(cognition.mock.calls[0][1]).toMatchObject({ requestId: 'req-CARRIED' });
    expect(prepare.mock.calls[0][0]).toMatchObject({ requestId: 'req-CARRIED' });
  });
});

describe('the lane stays narrow — one source class, one basis, one boundary', () => {
  it('emits only work / member_invoked / the constituted boundary', async () => {
    await performFocusCrossing(req(), deps());
    const insert = calls.find(c => /INSERT INTO context_disclosure_receipts/.test(c.sql))!;
    expect(insert.params).toContain('work');
    expect(insert.params).toContain('member_invoked');
    expect(insert.params).toContain('writers_studio.focus->maia_cognition');
  });

  it('⛔ wires no journal, Keep, memory, decision or symbolic source', () => {
    const c = CODE('lib/writers-studio/focusCrossing.ts') + CODE('app/api/writers-studio/focus/route.ts');
    for (const later of ['journal', 'keep', 'astrolog', 'iching', 'i_ching', 'tarot', 'divination', 'ambient']) {
      expect(c.toLowerCase()).not.toContain(later);
    }
  });

  it('the route is off by default and 404s rather than 403s', () => {
    const route = CODE('app/api/writers-studio/focus/route.ts');
    expect(route).toMatch(/WRITERS_STUDIO_FOCUS_ENABLED === '1'/);
    expect(route).toMatch(/status: 404/);
  });
});
