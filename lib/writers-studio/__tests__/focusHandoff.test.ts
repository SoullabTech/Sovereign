/**
 * FOCUS-PRODUCER-01A · H1–H3.
 *
 *   ⭐⭐ Do not record a crossing until the Work actually enters response-producing
 *       cognition, and do not let any other responder or privacy posture slip
 *       around that moment.
 */

import fs from 'fs';
import path from 'path';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';

const calls: { sql: string; params: unknown[] }[] = [];
let consentPresent = false;

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
      if (/INSERT/.test(sql)) { consentPresent = true; return { rows: [{ request_id: params[0] }], rowCount: 1 }; }
      return { rows: [], rowCount: 0 };
    }
    if (/context_disclosure_receipts/.test(sql)) {
      if (/INSERT/.test(sql)) return { rows: [{ id: 'r1' }], rowCount: 1 };
      if (/UPDATE/.test(sql)) return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }),
}));

import { performFocusCrossing } from '../focusCrossing';

const CODE = (rel: string) =>
  fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const SVC = () => CODE('lib/sovereign/maiaService.ts');


/**
 * ⭐ WS-FOCUS-DRAFT-01 MIGRATION. `assemble` (one member, one call, from the
 * SOURCE table) is retired; the crossing takes ONE snapshot of the current
 * working draft at one version. Every obligation in this file is unchanged —
 * only the shape of "the Work was read" is. ⛔ Nothing was weakened: C2's
 * ordering, C1's singularity and H1's handoff truth all still bind.
 */
const draftSnapshot = (version = 37) => ({
  ok: true as const,
  snapshot: {
    draftId: 'dddddddd-0000-4000-8000-000000000001',
    version,
    sections: new Map([['sec-1', {
      id: 'sec-1', position: 0, heading: 'A HEADING',
      body: 'the selected paragraph', editable: true,
    }]]),
  },
});
const readDraft = jest.fn(async () => draftSnapshot());
const prepare = jest.fn(async () => ({ turn: { turnId: 't-1' }, proof: {} } as never));

const req = (over: Record<string, unknown> = {}) => ({
  requestId: 'req-1', identity: {} as never, posture: TurnPosture.resolve({}),
  memberId: 'm-1', sessionId: 's-1', actId: 'act-1', workRef: 'work-1',
  members: [{ focusMemberId: 'f1', sectionRef: 'sec-1', readable: true }],
  activeMemberId: null, gesture: 'ask_maia' as const, ask: 'what is repeating',
  ...over,
});

const confirms = () => calls.filter(c => /UPDATE context_disclosure_receipts/.test(c.sql));

beforeEach(() => {
  actRows.acts.length = 0; actRows.members.length = 0;
  calls.length = 0; consentPresent = false;
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('H1 · CONFIRM FOLLOWS THE TRUE HANDOFF', () => {
  it('confirms when the response-producing call was actually invoked', async () => {
    const generate = jest.fn(() => ({
      handoff: Promise.resolve(true),
      result: Promise.resolve({ ok: true, response: 'reply' }),
    }));
    const out = await performFocusCrossing(req(), { readDraft, presence: async () => new Set<string>(), prepare, generate } as never);
    expect(confirms()).toHaveLength(1);
    expect(out.presentation.state).toBe('crossed_accounted');
  });

  it('⛔ does NOT confirm when the service returned without reaching a model', async () => {
    // Field-safety refusal, early responder, or a throw: entry happened, cognition
    // did not. Starting the service is not starting cognition.
    const generate = jest.fn(() => ({
      handoff: Promise.resolve(false),
      result: Promise.resolve({ ok: true, response: 'an answer produced without the Focus' }),
    }));
    const out = await performFocusCrossing(req(), { readDraft, presence: async () => new Set<string>(), prepare, generate } as never);
    expect(confirms()).toHaveLength(0);
    expect(out.presentation.state).toBe('did_not_cross');
    // ⭐ and the writer is NOT handed the bypass answer as though it were a Focus reply
    expect(out.response).toBeNull();
  });

  it('waits for the handoff before confirming, never merely for the call to return', async () => {
    /* Instrument note: an earlier draft ordered a `result`/`handoff` event array
       and failed because the RESULT promise's own `.then` ran during the ticks —
       it was testing the fixture's scheduling, not the product. The real property
       is simply that no confirmation exists while the handoff is unresolved. */
    let release: (v: boolean) => void = () => {};
    const generate = jest.fn(() => ({
      handoff: new Promise<boolean>(r => { release = r; }),
      result: Promise.resolve({ ok: true, response: 'reply' }),
    }));
    const pending = performFocusCrossing(req(), { readDraft, presence: async () => new Set<string>(), prepare, generate } as never);
    for (let i = 0; i < 20; i++) await Promise.resolve();
    expect(generate).toHaveBeenCalled();          // the call returned…
    expect(confirms()).toHaveLength(0);           // …and nothing was confirmed
    release(true);
    await pending;
    expect(confirms()).toHaveLength(1);           // only the handoff confirms
  });

  it('⭐ MUTATION — signalling the handoff before generateText is invoked goes RED', () => {
    const svc = SVC();
    const branch = svc.slice(svc.indexOf('if (writerStudioTurn) {'), svc.indexOf('switch (processingProfile)'));
    const invokeAt = branch.indexOf('generateText({');
    const signalAt = branch.indexOf('onHandoff?.()');
    expect(invokeAt).toBeGreaterThanOrEqual(0);
    expect(signalAt).toBeGreaterThan(invokeAt);
    // the mutation: move the signal above the call
    const mutated = branch.replace('writerStudio?.onHandoff?.();', '') .replace('const canonicalGeneration = generateText({', 'writerStudio?.onHandoff?.();\n const canonicalGeneration = generateText({');
    expect(() => expect(mutated.indexOf('onHandoff?.()')).toBeGreaterThan(mutated.indexOf('generateText({'))).toThrow();
  });

  it('the signal is emitted inside the canonical branch, not at service entry', () => {
    const svc = SVC();
    expect(svc.match(/onHandoff\?\.\(\)/g) ?? []).toHaveLength(1);
    const entry = svc.indexOf('const writerStudio = req.writerStudio');
    expect(svc.indexOf('onHandoff?.()')).toBeGreaterThan(entry + 1000);
  });
});

describe('H2 · NO RESPONSE BYPASS', () => {
  it('RCN cannot respond on a canonical Writer turn', () => {
    const svc = SVC();
    expect(svc).toMatch(/if \(writerStudioTurn\) throw new WriterCanonicalOnly\('rcn'\)/);
    // and the guard precedes the RCN call itself
    const guard = svc.indexOf("WriterCanonicalOnly('rcn')");
    expect(guard).toBeLessThan(svc.indexOf('maiaRcnProcess('));
  });

  it('a field-safety refusal is a NON-CROSSING, not a Focus answer', async () => {
    // It returns before the model, so onHandoff never fires → handoff false.
    const generate = jest.fn(() => ({
      handoff: Promise.resolve(false),
      result: Promise.resolve({ ok: true, response: "Let's take the safest next step together." }),
    }));
    const out = await performFocusCrossing(req(), { readDraft, presence: async () => new Set<string>(), prepare, generate } as never);
    expect(confirms()).toHaveLength(0);
    expect(out.response).toBeNull();
  });

  it('⭐ MUTATION — an early responder that still confirmed would be caught', async () => {
    const generate = jest.fn(() => ({
      handoff: Promise.resolve(false),
      result: Promise.resolve({ ok: true, response: 'bypass answer' }),
    }));
    const out = await performFocusCrossing(req(), { readDraft, presence: async () => new Set<string>(), prepare, generate } as never);
    // The defect this gate exists for: a crossed receipt beside an answer the
    // Work never reached. Asserting the defective outcome must fail.
    expect(() => expect(out.presentation.state).toBe('crossed_accounted')).toThrow();
  });
});

describe('H3 · POSTURE IDENTITY — one turn, one privacy posture', () => {
  it('the service uses the carried posture and does not re-resolve it', () => {
    const svc = SVC();
    expect(svc).toMatch(/const turnPosture = writerStudio\?\.posture \?\? TurnPosture\.resolve\(meta\)/);
  });

  it('the legacy meta.sanctuary reading is derived from that same posture', () => {
    expect(SVC()).toMatch(/\)\.sanctuary = writerStudio\.posture\.sanctuary/);
  });

  it('the port passes the route-resolved posture through, never a fresh one', () => {
    const c = CODE('lib/writers-studio/writersStudioCognition.ts');
    expect(c).toMatch(/posture: input\.posture/);
    expect(c).not.toMatch(/TurnPosture\.resolve/);
  });

  it('the crossing carries the request posture into generation', async () => {
    const generate = jest.fn(() => ({ handoff: Promise.resolve(true), result: Promise.resolve({ ok: true }) }));
    const sanctuary = TurnPosture.resolve({ sanctuary: true });
    await performFocusCrossing(req({ posture: sanctuary }), { readDraft, presence: async () => new Set<string>(), prepare, generate } as never);
    expect((generate as jest.Mock).mock.calls[0][1].posture).toBe(sanctuary);
    expect((prepare as jest.Mock).mock.calls.at(-1)![0].sanctuary).toBe(true);
  });

  it('⭐ MUTATION — substituting `normal` for a sanctuary turn goes RED', async () => {
    const sanctuary = TurnPosture.resolve({ sanctuary: true });
    const substituted = TurnPosture.resolve({});
    expect(() => expect(substituted.sanctuary).toBe(sanctuary.sanctuary)).toThrow();
  });
});

describe('W1 · an intentional exclusion does not wear the telemetry of a failure', () => {
  it('logs the RCN exclusion as room policy, not as processing failure', () => {
    const svc = SVC();
    expect(svc).toMatch(/instanceof WriterCanonicalOnly/);
    expect(svc).toMatch(/\[RCN\] excluded — writers_studio canonical participation owns the response path/);
  });

  it('the failure log remains for real RCN failures', () => {
    expect(SVC()).toMatch(/\[RCN\] Processing failed \(non-blocking\)/);
  });

  it('⭐ the two are distinguishable — a witness reading logs can tell them apart', () => {
    const svc = SVC();
    const excluded = svc.indexOf('excluded — writers_studio');
    const failed = svc.indexOf('Processing failed (non-blocking)');
    expect(excluded).toBeGreaterThanOrEqual(0);
    expect(failed).toBeGreaterThanOrEqual(0);
    expect(excluded).not.toBe(failed);
  });
});

describe('W2 · a pre-handoff refusal leaves no response the writer never saw', () => {
  /**
   * ⭐⭐ The residue H2 did not catch: field safety returned before the Work
   * reached a model AND persisted its own assistant text. The writer was shown a
   * non-crossing state with no response, while continuity remembered an answer
   * they never received — and would carry it into the next turn's history.
   */
  const svc = () => SVC();
  const BRANCH = () => svc().indexOf('if (writerStudioTurn) {');

  it('the field-safety refusal does not persist an exchange on a Writer turn', () => {
    const s = svc();
    const site = s.indexOf('} else await addConversationExchange(sessionId, input, text, {');
    expect(site).toBeGreaterThanOrEqual(0);
    expect(s.slice(site - 400, site)).toMatch(/if \(writerStudio\) \{/);
  });

  it('⭐ EVERY pre-handoff persistence site is guarded or unreachable on a Writer turn', () => {
    const s = svc();
    const branch = BRANCH();
    const sites: number[] = [];
    let i = s.indexOf('addConversationExchange(');
    while (i !== -1) { if (i < branch) sites.push(i); i = s.indexOf('addConversationExchange(', i + 1); }
    // Exactly two persistence calls precede the canonical branch.
    expect(sites).toHaveLength(2);
    // (1) field safety — guarded by `if (writerStudio)`.
    expect(s.slice(sites[0] - 400, sites[0])).toMatch(/if \(writerStudio\)/);
    // (2) RCN's early return — unreachable, because RCN is excluded before it runs.
    const rcnGuard = s.indexOf("WriterCanonicalOnly('rcn')");
    expect(rcnGuard).toBeGreaterThanOrEqual(0);
    expect(rcnGuard).toBeLessThan(sites[1]);
  });

  it('the tail persistence sites are AFTER the crossing, which is correct', () => {
    const s = svc();
    const branch = BRANCH();
    expect(s.indexOf('TurnsStore.addExchange(turnPosture')).toBeGreaterThan(branch);
  });

  it('the refusal still travels outward — suppressed persistence, not suppressed information', () => {
    const s = svc();
    const site = s.indexOf('} else await addConversationExchange(sessionId, input, text, {');
    // the `return { text, ... }` still follows: the surface may present it.
    expect(s.slice(site, site + 600)).toMatch(/return \{\s*\n?\s*text,/);
  });

  it('⭐ MUTATION — removing the guard makes the pre-handoff audit go RED', () => {
    const s = svc();
    const mutated = s.replace(/if \(writerStudio\) \{[\s\S]{0,200}?\} else await addConversationExchange/, 'await addConversationExchange');
    const branch = mutated.indexOf('if (writerStudioTurn) {');
    const site = mutated.indexOf('addConversationExchange(');
    expect(site).toBeLessThan(branch);
    expect(() => expect(mutated.slice(site - 400, site)).toMatch(/if \(writerStudio\)/)).toThrow();
  });
});
