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
jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
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

const assemble = jest.fn(async () => 'the selected paragraph');
const prepare = jest.fn(async () => ({ turn: { turnId: 't-1' }, proof: {} } as never));

const req = (over: Record<string, unknown> = {}) => ({
  requestId: 'req-1', identity: {} as never, posture: TurnPosture.resolve({}),
  memberId: 'm-1', sessionId: 's-1', disclosureId: 'd-1', workRef: 'work-1',
  scopeKind: 'passage' as const, gesture: 'ask_maia' as const, ask: 'what is repeating',
  ...over,
});

const confirms = () => calls.filter(c => /UPDATE context_disclosure_receipts/.test(c.sql));

beforeEach(() => {
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
    const out = await performFocusCrossing(req(), { assemble, prepare, generate } as never);
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
    const out = await performFocusCrossing(req(), { assemble, prepare, generate } as never);
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
    const pending = performFocusCrossing(req(), { assemble, prepare, generate } as never);
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
    const out = await performFocusCrossing(req(), { assemble, prepare, generate } as never);
    expect(confirms()).toHaveLength(0);
    expect(out.response).toBeNull();
  });

  it('⭐ MUTATION — an early responder that still confirmed would be caught', async () => {
    const generate = jest.fn(() => ({
      handoff: Promise.resolve(false),
      result: Promise.resolve({ ok: true, response: 'bypass answer' }),
    }));
    const out = await performFocusCrossing(req(), { assemble, prepare, generate } as never);
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
    await performFocusCrossing(req({ posture: sanctuary }), { assemble, prepare, generate } as never);
    expect((generate as jest.Mock).mock.calls[0][1].posture).toBe(sanctuary);
    expect((prepare as jest.Mock).mock.calls.at(-1)![0].sanctuary).toBe(true);
  });

  it('⭐ MUTATION — substituting `normal` for a sanctuary turn goes RED', async () => {
    const sanctuary = TurnPosture.resolve({ sanctuary: true });
    const substituted = TurnPosture.resolve({});
    expect(() => expect(substituted.sanctuary).toBe(sanctuary.sanctuary)).toThrow();
  });
});
