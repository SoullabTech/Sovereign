/**
 * FOCUS-W7A — `continued` is non-generative, tested AT the act boundary.
 *
 * ⭐⭐ FOUNDER RULING 2026-09-13:
 *
 *   One human act may cause at most one response-producing generation.
 *   Not "one row". Not "one receipt set". And not "probably one, because a
 *   uniqueness constraint in another subsystem happens to collide first."
 *
 * ── ⛔ WHY THIS FILE EXISTS SEPARATELY FROM focusActReplay.test.ts ─────────
 *
 * That file drives the WHOLE crossing and cannot reach this branch. With the
 * receipt store modelled faithfully — `ON CONFLICT (disclosure_id) DO NOTHING`
 * followed by a SELECT and an identity comparison — every route to `continued`
 * is closed earlier by a real production guard:
 *
 *   same requestId       `runtime_consent_state.request_id` is unique
 *   different requestId  the stored receipt's `request_ref` no longer matches
 *
 * ⚠️ SO THE HAZARD IS LATENT, NOT LIVE, and the earlier claim that a replay
 * "produces two generations" is WITHDRAWN: it came from a probe whose fake
 * made the receipt INSERT always succeed and echoed back whatever request_ref
 * was asked for — a world that does not exist.
 *
 * ⛔ BUT THE BRANCH IS STILL UNGUARDED AT THE LAYER THAT OWNS THE LAW, and a
 * property that holds only because two other subsystems happen to refuse first
 * is not a property anyone decided. This file stubs the act store so execution
 * arrives at `continued` directly, and asserts what must then be true.
 *
 *   If execution ever reaches `continued`, cognition is impossible.
 */

const openOutcome: { kind: string } = { kind: 'opened' };

jest.mock('../focusCrossingAct', () => ({
  openFocusCrossingAct: jest.fn(async () => (
    openOutcome.kind === 'opened'
      ? { kind: 'opened', act: { actId: 'act-1', memberId: 'm-1', workId: 'work-1',
          workingDraftId: 'd1', workingDraftVersion: 34, activeMemberId: null,
          members: [], canonicalTurnId: null } }
      : openOutcome
  )),
  completeFocusCrossingAct: jest.fn(async () => true),
  readFocusCrossingAct: jest.fn(async () => null),
}));

jest.mock('@/lib/disclosure/disclosureBoundary', () => ({
  establishDisclosureBoundary: jest.fn(async (opts: { disclosureId: string }) => ({
    kind: 'may_cross', disclosureId: opts.disclosureId, receiptId: 'r1',
  })),
  mayCrossBoundary: (o: { kind: string }) => o.kind === 'may_cross',
  confirmDisclosureCrossed: jest.fn(async () => true),
}));

/* ⛔ `confirmDisclosureCrossed` lives in the RECEIPT module, not the boundary
   module. Mocking only the boundary left the real one running against a stub
   database, where it threw AFTER generation — which is why the positive
   control failed while the law tests passed. */
jest.mock('@/lib/disclosure/contextDisclosureReceipt', () => ({
  confirmDisclosureCrossed: jest.fn(async () => true),
}));

jest.mock('@/lib/db/postgres', () => ({
  transaction: jest.fn(async (cb: never) => cb),
  query: jest.fn(async () => ({ rows: [], rowCount: 0 })),
}));

import { TurnPosture } from '@/lib/sanctuary/turnPosture';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { performFocusCrossing } = require('../focusCrossing');

let prepares = 0;
let handoffs = 0;

const deps = () => ({
  readDraft: async () => ({ ok: true, snapshot: { draftId: 'd1', version: 34,
    sections: new Map([['sec-1', { id: 'sec-1', position: 44, heading: 'A HEADING',
      storedText: 'A HEADING\n\nthe selected paragraph',
      body: 'the selected paragraph', editable: true }]]) } }),
  resolveCurrency: async ({ members }: { members: readonly { focusMemberId: string; sectionRef: string }[] }) => ({
    members: members.map((m) => ({ ...m, currency: 'ready' as const })),
    resolvedAgainstDraftVersion: 34,
  }),
  presence: async () => new Set<string>(),
  prepare: async () => { prepares += 1; return { turn: { turnId: 't-1' }, proof: {} }; },
  generate: () => { handoffs += 1; return { handoff: Promise.resolve(true), result: Promise.resolve({}) }; },
} as never);

const req = () => ({
  requestId: 'req-1', identity: {} as never, posture: TurnPosture.resolve({}),
  memberId: 'm-1', sessionId: 's-1', actId: 'act-1', workRef: 'work-1',
  readingId: 'r-1', observationKey: 'o1',
  members: [{ focusMemberId: 'f1', sectionRef: 'sec-1',
    range: { space: 'stored_section_text' as const, start: 11, end: 21 } }],
  activeMemberId: null, gesture: 'ask_maia' as const, ask: 'q',
});

beforeEach(() => {
  prepares = 0; handoffs = 0; openOutcome.kind = 'opened';
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('W7A-1 — `opened` is the ONLY outcome that may reach cognition', () => {
  it('an opened act generates exactly once', async () => {
    const out = await performFocusCrossing(req(), deps());
    expect({ failure: out.failure, act: out.act, prepares, handoffs })
      .toEqual({ failure: null, act: 'opened', prepares: 1, handoffs: 1 });
  });
});

describe('W7A-2 — `continued` is terminal', () => {
  it('⭐⭐ THE LAW · prepare and generate are NEVER called', async () => {
    openOutcome.kind = 'continued';
    const out = await performFocusCrossing(req(), deps());
    expect(prepares).toBe(0);
    expect(handoffs).toBe(0);
    expect(out.act).toBe('continued');
    expect(out.failure).toBe('act_already_processed');
  });

  it('⛔ and it is NOT reported as a contradiction — the request agreed', async () => {
    openOutcome.kind = 'continued';
    const out = await performFocusCrossing(req(), deps());
    expect(out.failure).not.toBe('act_contradiction');
  });
});

describe('W7A-3 — every non-opened outcome stops before cognition', () => {
  for (const kind of ['continued', 'contradiction', 'refused', 'unavailable']) {
    it(`${kind} → zero generations`, async () => {
      openOutcome.kind = kind;
      await performFocusCrossing(req(), deps());
      expect(prepares).toBe(0);
      expect(handoffs).toBe(0);
    });
  }
});

describe('W7A-4 — the guard is at the act layer, not inherited', () => {
  it('⭐ it holds with the disclosure boundary fully permissive', async () => {
    /* The boundary mock above says `may_cross` for EVERY call, including a
       replayed disclosureId. So nothing upstream can be refusing here: the
       only thing that can stop generation is the act guard itself. */
    openOutcome.kind = 'continued';
    await performFocusCrossing(req(), deps());
    expect(handoffs).toBe(0);
  });
});
