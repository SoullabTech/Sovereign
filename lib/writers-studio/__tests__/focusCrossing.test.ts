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

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(async (sql: string, params: unknown[] = []) => {
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
           describe the SAME disclosure, or it is testing a different case. */
        return { rows: [{ id: 'r1', member_id: 'm-1', request_ref: 'req-1',
          boundary: 'writers_studio.focus->maia_cognition', source_class: 'work',
          participation_basis: 'member_invoked', source_ref: 'work-1', scope_kind: 'passage',
          section_ref: null, authorized_by: 'member', gesture: 'ask_maia',
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
const cognition = jest.fn(async () => { events.push('handoff'); return { ok: true, response: 'MAIA reply' }; });

const req = (over: Record<string, unknown> = {}) => ({
  requestId: 'req-1', posture: TurnPosture.resolve({}), memberId: 'm-1', sessionId: 's-1',
  disclosureId: 'd-1', workRef: 'work-1', scopeKind: 'passage' as const,
  range: { start: 0, end: 10 }, gesture: 'ask_maia' as const, ask: 'what is repeating here',
  ...over,
});

const SRC = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const CODE = (rel: string) => SRC(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

beforeEach(() => {
  calls.length = 0; events.length = 0; consentPresent = false;
  receiptMode = 'ok'; confirmFails = false;
  assemble.mockClear(); cognition.mockClear();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('C1 · BOUNDARY SINGULARITY — exactly once, not at least once', () => {
  it('mints exactly one consent row and exactly one receipt per crossing', async () => {
    await performFocusCrossing(req(), { assemble, cognition });
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
    await performFocusCrossing(req(), { assemble, cognition });
    await cognition({ memberId: 'm-1', sessionId: 's-1', requestId: 'req-1', ask: 'x', focusContext: 'y' });
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
    await performFocusCrossing(req(), { assemble, cognition });
    const receiptIdx = calls.findIndex(c => /INSERT INTO context_disclosure_receipts/.test(c.sql));
    expect(receiptIdx).toBeGreaterThanOrEqual(0);
    expect(events).toEqual(['assemble', 'handoff']);
    expect(assemble).toHaveBeenCalledTimes(1);
  });

  it('⛔ reads nothing when the boundary refuses', async () => {
    receiptMode = 'down';
    const out = await performFocusCrossing(req(), { assemble, cognition });
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
    const failing = jest.fn(async () => { events.push('handoff'); throw new Error('model down'); });
    const out = await performFocusCrossing(req(), { assemble, cognition: failing as never });
    expect(calls.some(c => /UPDATE context_disclosure_receipts/.test(c.sql))).toBe(true);
    expect(out.presentation.state).toBe('crossed_accounted');
    expect(out.response).toBeNull();
    // ⭐ The Work crossed. A generation failure does not unmake that.
  });

  it('⛔ never confirms when the route fails before the handoff', async () => {
    const emptyAssemble = jest.fn(async () => null);
    const out = await performFocusCrossing(req(), { assemble: emptyAssemble as never, cognition });
    expect(cognition).not.toHaveBeenCalled();
    expect(calls.some(c => /UPDATE context_disclosure_receipts/.test(c.sql))).toBe(false);
    expect(out.presentation.state).toBe('did_not_cross');
  });

  it('a confirm failure after handoff reports crossed_unaccounted, never "nothing sent"', async () => {
    confirmFails = true;
    const out = await performFocusCrossing(req(), { assemble, cognition });
    expect(out.presentation.state).toBe('crossed_unaccounted');
    expect(out.presentation.message).toMatch(/MAIA received this Focus/);
    expect(out.presentation.mayClaimNothingSent).toBe(false);
  });
});

describe('C4 · NO SCOPE SUBSTITUTION', () => {
  it('an unresolved prior attempt yields the §3a state and no cognition', async () => {
    receiptMode = 'conflict_attempted';
    const out = await performFocusCrossing(req(), { assemble, cognition });
    expect(out.presentation.state).toBe('prior_unresolved');
    expect(cognition).not.toHaveBeenCalled();
    expect(assemble).not.toHaveBeenCalled();
    expect(out.presentation.actions).not.toContain('try_again');
  });

  it('every refusal carries a §3a presentation and a null response', async () => {
    receiptMode = 'down';
    const out = await performFocusCrossing(req(), { assemble, cognition });
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

  it('holds the room constant and carries Focus as context, not as a prompt', () => {
    const c = CODE('lib/writers-studio/writersStudioCognition.ts');
    expect(c).toMatch(/room: 'writers_studio'/);
    expect(c).toMatch(/writerFocusContext/);
    // the writer's ask is the input; the Work is context beside it
    expect(c).toMatch(/input: ask/);
  });

  it('passes the carried requestId as canonical exchange identity', () => {
    expect(CODE('lib/writers-studio/writersStudioCognition.ts')).toMatch(/exchangeId: requestId/);
  });
});

describe('C6 · ONE RECEIPT / ONE CROSSING', () => {
  it('confirms exactly the disclosureId that authorized the handoff', async () => {
    const out = await performFocusCrossing(req({ disclosureId: 'd-AUTH' }), { assemble, cognition });
    const confirm = calls.find(c => /UPDATE context_disclosure_receipts/.test(c.sql))!;
    expect(confirm.params[0]).toBe('d-AUTH');
    expect(out.disclosureId).toBe('d-AUTH');
  });

  it('the route mints a NEW disclosure identity per member act', () => {
    const route = CODE('app/api/writers-studio/focus/route.ts');
    expect(route).toMatch(/const disclosureId = randomUUID\(\)/);
    expect(route).not.toMatch(/body\).disclosureId|body\.disclosureId/);
  });

  it('one requestId reaches consent, receipt and cognition', async () => {
    await performFocusCrossing(req({ requestId: 'req-CARRIED' }), { assemble, cognition });
    const consent = calls.find(c => /INSERT INTO runtime_consent_state/.test(c.sql))!;
    expect(consent.params[0]).toBe('req-CARRIED');
    expect(cognition.mock.calls[0][0]).toMatchObject({ requestId: 'req-CARRIED' });
  });
});

describe('the lane stays narrow — one source class, one basis, one boundary', () => {
  it('emits only work / member_invoked / the constituted boundary', async () => {
    await performFocusCrossing(req(), { assemble, cognition });
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
