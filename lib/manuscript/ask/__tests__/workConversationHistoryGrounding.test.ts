/**
 * WS-WORK-CONTINUITY · Part A — history grounding (laws first, implementation NOT yet written).
 * Plan: docs/programme/WS-WORK-CONTINUITY-STANDING-READ-SCOPE_PLAN_DRAFT_2026-11-08.md
 *
 * Three things are proven here, in this order of importance:
 *  1. MATRIX — the conforming reference satisfies every law, and each defeat candidate dies on its NAMED law
 *     (unclassified collateral fails the suite).
 *  2. LIVE (Class A) — the REAL askMaia is checked against the laws. The grounding laws A1a/A1b are EXPECTED RED
 *     today (`it.failing`): when the implementation lands these flip to failures and must be converted to
 *     ordinary passing tests — that is the intended forcing function. A2–A6 pass today and must keep passing.
 *  3. ⚠️ A prompt law is not behaviour. Whether MAIA stops disowning her answers is UNKNOWN until a live walk.
 */
jest.mock('../../../ai/structured/router', () => ({ runStructured: jest.fn() }));
jest.mock('@/lib/writersStudio/workSituation', () => ({
  formatWorkSituationForPrompt: () => 'THE WORK ON THE TABLE (fixture)',
}));

import { runStructured } from '../../../ai/structured/router';
import { askMaia, type AskContext } from '../askReader';
import { UNMEASURED } from '../staleness';
import { LAWS, type LawInput } from '../../../../tests/constitutional/ws-work-continuity/laws';
import { CANDIDATES, REFERENCE } from '../../../../tests/constitutional/ws-work-continuity/candidates';

const mockRun = runStructured as jest.MockedFunction<typeof runStructured>;
const reply = (text: string) => ({
  ok: true as const,
  result: {
    content: [{ type: 'text', text }] as never,
    stopReason: 'end_turn',
    usage: { inputTokens: 1, outputTokens: 1 },
    provenance: { provider: 'anthropic' as const, model: 'm', latencyMs: 1 },
  },
});

function workCtx(withLocus: boolean): AskContext {
  return {
    kind: 'work',
    anchor: { on: 'work' },
    staleness: UNMEASURED,
    facts: {
      work: {} as never,
      manuscript: { id: 'ms-1', draftId: 'd-1', version: 3 },
      sections: [{ id: 'sec-a', position: 1, heading: 'I. The Living Spiral' }],
      locus: withLocus ? { sectionId: 'sec-a', label: 'I. The Living Spiral', body: 'The river kept its own counsel.' } : null,
      writerUnderstanding: '',
      writerCorrections: '',
      continuity: { structure: 'unmeasured', prose: 'unmeasured' },
    },
  } as AskContext;
}

const HISTORY = [
  { speaker: 'author' as const, body: 'What is this story doing?' },
  { speaker: 'maia' as const, body: 'The last line, "That is the joke," lands after the punchline.' },
];

async function liveSystem(withLocus: boolean, withHistory: boolean): Promise<string> {
  mockRun.mockReset();
  mockRun.mockResolvedValue(reply('A reply.'));
  const out = await askMaia(workCtx(withLocus), withHistory ? HISTORY : [], 'Where does that image come back?');
  expect(out.ok).toBe(true);
  return String(mockRun.mock.calls[0][0].system);
}

const failed = (i: LawInput) => LAWS.filter((l) => !l.holds(i)).map((l) => l.id);
const WORLDS = [
  { hasHistory: true, hasLocus: true },
  { hasHistory: true, hasLocus: false },
  { hasHistory: false, hasLocus: true },
  { hasHistory: false, hasLocus: false },
];

describe('MATRIX — the laws are lethal and discriminating', () => {
  let base: string;
  beforeAll(async () => { base = await liveSystem(true, false); });

  it('the conforming reference satisfies every law in every world', () => {
    for (const w of WORLDS) expect(failed({ system: REFERENCE(base, w), ...w })).toEqual([]);
  });

  for (const c of CANDIDATES) {
    it(`${c.id} dies on ${c.named} and on nothing unclassified`, () => {
      const killed = new Set<string>();
      for (const w of WORLDS) failed({ system: c.build(base, w), ...w }).forEach((id) => killed.add(id));
      expect(killed.has(c.named)).toBe(true); // lethal on its named law
      const unclassified = [...killed].filter((id) => id !== c.named && !(id in c.classifiedCollateral));
      expect(unclassified).toEqual([]); // no accidental collateral
    });
  }
});

describe('LIVE (Class A) — the real askMaia against the laws', () => {
  it('A2–A6 hold today and must keep holding', async () => {
    for (const w of WORLDS) {
      const system = await liveSystem(w.hasLocus, w.hasHistory);
      const bad = failed({ system, ...w }).filter((id) => !id.startsWith('A1'));
      expect(bad).toEqual([]);
    }
  });

  // Part A1 implemented: converted from it.failing, as the suite required.
  it('A1a holds with history replayed', async () => {
    const system = await liveSystem(true, true);
    expect(failed({ system, hasHistory: true, hasLocus: true })).not.toContain('A1a-earlier-turns-may-rest-on-absent-text');
  });
  it('A1b holds with history replayed', async () => {
    const system = await liveSystem(true, true);
    expect(failed({ system, hasHistory: true, hasLocus: true })).not.toContain('A1b-absence-is-not-fabrication');
  });
});
