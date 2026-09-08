/**
 * SEL-0 — the developmental selector's falsifiers.
 *
 * SYNTHETIC OBSERVATIONS ONLY. Nothing here is drawn from Manifest B, Manifest
 * C or the source snapshot, and nothing here was tuned against them. The
 * implementation must exist before its author sees the benchmark stimulus, so
 * these fixtures are invented — deliberately dull, deliberately not the Work.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { DevelopmentalObservation } from '../../developmentalReading/contract';
import type { ReadingAssessment } from '../../developmentalReading/assess';
import type { Standing } from '../../standing/contract';
import { parseSelectionCommission } from '../selectionCommission';
import type { F7Verdict } from '../../developmentalReading/contract';
import { applyBoundary } from '../../boundary/candidateEligibility';
import {
  canonicalise, selectDevelopmental, __systemForTest, SELECTOR_CONFIDENCE_FLOOR,
} from '../developmentalSelector';

jest.mock('../../../ai/structured/router', () => ({ runStructured: jest.fn() }));
import { runStructured } from '../../../ai/structured/router';
const mockRun = runStructured as unknown as jest.Mock;

const ROOT = join(__dirname, '..', '..', '..', '..');

/* ── synthetic fixtures ─────────────────────────────────────────────────── */

function obs(key: string): DevelopmentalObservation {
  return {
    key,
    lens: 'development',
    evidenceRefs: [{ kind: 'section', sectionId: `sec-${key}` }] as never,
    observation: `A synthetic noticing labelled ${key}.`,
    doesNotEstablish: ['synthetic-limit'] as never,
    structureDependency: { kind: 'independent' },
  };
}

type State = 'current' | 'superseded' | 'unmeasured';
function assessmentOf(states: Record<string, State>): ReadingAssessment {
  const observations: Record<string, { state: State }> = {};
  for (const [k, s] of Object.entries(states)) observations[k] = { state: s };
  return { observations } as unknown as ReadingAssessment;
}
function boundary(opts: {
  keys: string[];
  states?: Record<string, State>;
  standings?: Record<string, Standing>;
  offered?: string[];
  eligible?: string[];
}) {
  const keys = opts.keys;
  const eligible = new Set(opts.eligible ?? keys);
  const standings = Object.entries(opts.standings ?? {}) as [string, Standing][];
  return applyBoundary({
    observations: keys.map(obs),
    assessment: assessmentOf(opts.states ?? Object.fromEntries(keys.map((k) => [k, 'current' as State]))),
    dismissed: new Set(standings.filter(([, v]) => v === 'dismiss').map(([k]) => k)),
    f7: (k) => (eligible.has(k) ? 'eligible' : 'unestablished') as F7Verdict,
    offered: new Set(opts.offered ?? []),
  });
}

function answered(text: string) {
  mockRun.mockResolvedValueOnce({ ok: true, result: { content: [{ type: 'text', text }] } });
}
const selectorInput = (keys: string[], writerTurn = 'what is worth looking at?') => ({
  candidates: keys.map(obs),
  writerTurn,
  commissionedLens: 'development',
  withStructure: false,
  sectionsRead: 12,
  revisionNumber: 3,
  openThreads: new Set<string>(),
});

beforeEach(() => mockRun.mockReset());

/* ── 1 · writer precedence, as far as it can be asserted TODAY ───────────── */

/**
 * ⛔ THE ROUTE WIRING IS NOT PRESENT, AND THESE TESTS SAY SO RATHER THAN
 * PRETENDING OTHERWISE.
 *
 * The selector cannot yet be invoked from the ask route: the ratified candidate
 * boundary requires `standing != 'dismiss'`, and D5 — an equally ratified
 * module-graph gate — makes the standing store unreachable from that route
 * because it is a cognition root. Both instruments are ratified and they cannot
 * both be satisfied as written, so the wiring is withheld pending a founder
 * ruling and the product gap stays open.
 *
 * What CAN be asserted today is that nothing about the ask route has been
 * loosened in anticipation: the anchor boundary is untouched, and a commission
 * is not an anchor.
 */
describe('the anchor boundary is untouched and a commission is not an anchor', () => {
  const route = readFileSync(
    join(ROOT, 'app/api/sovereign/manuscripts/[id]/ask/route.ts'), 'utf8');

  it('SUPPORTED_ANCHORS is unchanged', () => {
    expect(route).toMatch(/const SUPPORTED_ANCHORS = \['question', 'uncertainty', 'division'\] as const;/);
  });

  it('neither anchor parser knows anything about a commission', () => {
    const parsers = route.slice(route.indexOf('function parseAnchor'), route.indexOf('function parseAnyAnchor'));
    expect(parsers).not.toMatch(/commission/i);
  });

  it('the route reaches the selector through the real ask path', () => {
    expect(route).toMatch(/developmentalSelector/);
    expect(route).toMatch(/selectionCommission/);
    expect(route).toMatch(/developmentalSelectionTurn/);
  });

  it('the commission is only read when no anchor was parsed, and never on a resumed thread', () => {
    expect(route).toMatch(
      /const commission = threadId \|\| anchor \? null : parseSelectionCommission\(body\.selectionCommission\)/);
  });

  it('the observation anchor still branches to the exact-key turn', () => {
    expect(route).toMatch(/if \(effectiveAnchor\.on === 'observation'\)/);
  });

  it('an explicitly addressed observation still resolves exactly, never by nearest match', () => {
    const anchorSrc = readFileSync(join(ROOT, 'lib/manuscript/ask/developmentalAnchor.ts'), 'utf8');
    expect(anchorSrc).toMatch(/Never a nearest match/);
  });
});

/* ── 2 · no explicit commission is never permission ──────────────────────── */

describe('absence of an observationKey is not permission to select', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['a string', 'what do you notice?'],
    ['an empty object', {}],
    ['an anchor', { on: 'observation', readingId: 'r', observationKey: 'o1' }],
    ['a commission with an extra field', { readingId: 'r', commissionId: 'c', offered: [], engagement: 1 }],
    ['a commission missing offered', { readingId: 'r', commissionId: 'c' }],
    ['a commission with a non-string offer', { readingId: 'r', commissionId: 'c', offered: [7] }],
  ])('%s does not parse as a commission', (_label, v) => {
    expect(parseSelectionCommission(v)).toBeNull();
  });

  it('an explicit, well-formed commission does parse', () => {
    expect(parseSelectionCommission({ readingId: 'r', commissionId: 'c', offered: ['o1'] }))
      .toEqual({ readingId: 'r', commissionId: 'c', offered: ['o1'] });
  });
});

/* ── 3 · the boundary gates, in the contract's order ─────────────────────── */

describe('the lawful candidate boundary', () => {
  it('reports SELECTION_BOUNDARY_UNMEASURED when any observation is unmeasured', () => {
    expect(boundary({ keys: ['o1', 'o2'], states: { o1: 'current', o2: 'unmeasured' } }))
      .toEqual({ gate: 'SELECTION_BOUNDARY_UNMEASURED' });
  });

  it('prefers the boundary gate over an empty candidate set', () => {
    /* Both conditions hold. The boundary gate must win, or a confident
       "nothing lawful" would be computed from an unestablished boundary. */
    expect(boundary({
      keys: ['o1'], states: { o1: 'unmeasured' }, standings: { o1: 'dismiss' },
    })).toEqual({ gate: 'SELECTION_BOUNDARY_UNMEASURED' });
  });

  it('reports NO_LAWFUL_CANDIDATE when nothing survives', () => {
    expect(boundary({ keys: ['o1'], standings: { o1: 'dismiss' } }))
      .toEqual({ gate: 'NO_LAWFUL_CANDIDATE' });
  });

  it('excludes a dismissed observation and keeps keep / unresolved', () => {
    const out = boundary({ keys: ['o1', 'o2', 'o3'], standings: { o1: 'dismiss', o2: 'keep', o3: 'unresolved' } });
    expect(out.gate).toBeNull();
    expect((out as { lawfulKeys: string[] }).lawfulKeys).toEqual(['o2', 'o3']);
  });

  it('excludes a superseded observation', () => {
    const out = boundary({ keys: ['o1', 'o2'], states: { o1: 'superseded', o2: 'current' } });
    expect((out as { lawfulKeys: string[] }).lawfulKeys).toEqual(['o2']);
  });

  it('excludes an observation whose F-7 eligibility is unestablished', () => {
    expect(boundary({ keys: ['o1'], eligible: [] })).toEqual({ gate: 'NO_LAWFUL_CANDIDATE' });
  });

  it('reports NO_REMAINING_CANDIDATE_THIS_COMMISSION when all lawful ones were offered', () => {
    expect(boundary({ keys: ['o1', 'o2'], offered: ['o1', 'o2'] }))
      .toEqual({ gate: 'NO_REMAINING_CANDIDATE_THIS_COMMISSION' });
  });
});

/* ── 4 · "what else?" advances; a later commission starts clean ──────────── */

describe('commission-scoped offer memory', () => {
  it('does not re-offer inside the same commission', () => {
    const out = boundary({ keys: ['o1', 'o2', 'o3'], offered: ['o2'] });
    expect((out as { lawfulKeys: string[] }).lawfulKeys).toEqual(['o1', 'o3']);
  });

  it('a later commission is not narrowed by an earlier one', () => {
    /* A new commission carries a new record; the old one is not reachable. */
    const later = boundary({ keys: ['o1', 'o2', 'o3'], offered: [] });
    expect((later as { lawfulKeys: string[] }).lawfulKeys).toEqual(['o1', 'o2', 'o3']);
  });

  it('being offered is not a standing act', () => {
    /* An offered observation is skipped this commission, but its standing is
       untouched — the boundary reads standing from the standing map alone. */
    const out = boundary({ keys: ['o1', 'o2'], offered: ['o1'], standings: {} });
    expect(out.gate).toBeNull();
  });
});

/* ── 5 · the selector's own outcomes ─────────────────────────────────────── */

describe('selectDevelopmental', () => {
  it('can decline with exactly one lawful candidate', async () => {
    answered('{"decision":"decline","confidence":0.2}');
    const r = await selectDevelopmental(selectorInput(['o1']));
    expect(r.kind).toBe('decline');
  });

  it('declines when confidence is below the frozen floor, whatever it decided', async () => {
    answered(`{"decision":"order","order":["o1","o2"],"confidence":${SELECTOR_CONFIDENCE_FLOOR - 0.01}}`);
    const r = await selectDevelopmental(selectorInput(['o1', 'o2']));
    expect(r.kind).toBe('decline');
  });

  it('produces a TOTAL, deterministic ordering over exactly the candidates', async () => {
    answered('{"decision":"order","order":["o10","o2"],"confidence":0.9}');
    const r = await selectDevelopmental(selectorInput(['o2', 'o10', 'o1', 'o3']));
    expect(r.kind).toBe('ordering');
    expect((r as { ordering: string[] }).ordering).toEqual(['o10', 'o2', 'o1', 'o3']);
  });

  it('is deterministic given the same model answer', async () => {
    answered('{"decision":"order","order":["o3"],"confidence":0.8}');
    const a = await selectDevelopmental(selectorInput(['o1', 'o2', 'o3']));
    answered('{"decision":"order","order":["o3"],"confidence":0.8}');
    const b = await selectDevelopmental(selectorInput(['o1', 'o2', 'o3']));
    expect((a as { ordering: string[] }).ordering).toEqual((b as { ordering: string[] }).ordering);
  });

  it('a malformed answer is unreachable, never a decline', async () => {
    answered('I would look at the third one.');
    expect((await selectDevelopmental(selectorInput(['o1']))).kind).toBe('unreachable');
  });

  it('a transport failure is unreachable, never a decline', async () => {
    mockRun.mockResolvedValueOnce({ ok: false, refusal: 'unreachable' });
    expect((await selectDevelopmental(selectorInput(['o1']))).kind).toBe('unreachable');
  });

  it('drops keys that were never candidates rather than ordering a different set', () => {
    expect(canonicalise(['o1', 'o2'], ['o9', 'o2', 'o2', 'o1'])).toEqual(['o2', 'o1']);
  });

  it('completes a partial ordering by the frozen numeric-aware tie-break', () => {
    expect(canonicalise(['o1', 'o2', 'o10'], [])).toEqual(['o1', 'o2', 'o10']);
  });
});

/* ── 6 · no prohibited signal reaches the request ────────────────────────── */

describe('prohibited inputs cannot enter the selector', () => {
  const system = __systemForTest(selectorInput(['o1', 'o2']));

  /* SCAN THE DATA, NOT THE PROHIBITION.
     The standing prompt NAMES the forbidden signals in order to forbid them, so
     a scan of the whole string fails on a prompt precisely because it is
     compliant — the C21 false positive this repository has already paid for
     once. What must be absent is the DATA: everything the assembler appends
     after the standing text is where a prohibited signal could actually
     travel, and that is what is scanned. */
  const data = system.slice(system.indexOf('--- THE READING ---'));

  it('the assembled data carries no engagement, dwell, retention or usage signal', () => {
    for (const banned of ['dwell', 'retention', 'engagement', 'session count', 'time spent', 'last opened']) {
      expect(data.toLowerCase()).not.toContain(banned);
    }
  });

  it('the assembled data carries no cross-member or aggregate signal', () => {
    for (const banned of ['other writers', 'compared to other', 'percentile', 'average', 'cohort']) {
      expect(data.toLowerCase()).not.toContain(banned);
    }
  });

  it('the assembled data carries no benchmark annotation, threshold or founder ranking', () => {
    for (const banned of ['sel-0', 'manifest', 'benchmark', 'founder', 'threshold', 'top-5', 'rank']) {
      expect(data.toLowerCase()).not.toContain(banned);
    }
  });

  it('the selector reads nothing from a benchmark or evaluation path', () => {
    /* Comments stripped first, for the same reason: this file documents the
       ban it obeys, and a scan of raw source would read that as the ban broken. */
    const src = readFileSync(join(ROOT, 'lib/manuscript/ask/developmentalSelector.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    expect(src).not.toMatch(/sel-0|manifest|benchmark|scripts\//i);
  });

  it('the falsifier can fail: an injected prohibited term is caught', () => {
    const poisoned = `${data}\n  dwell: 42s`;
    expect(poisoned.toLowerCase()).toContain('dwell');
  });
});

/* ── 7 · one observation, conversationally ───────────────────────────────── */

describe('the selector yields one observation, and nothing rankable', () => {
  it('an ordering is produced internally and its head is the single offer', async () => {
    answered('{"decision":"order","order":["o2","o1"],"confidence":0.9}');
    const r = await selectDevelopmental(selectorInput(['o1', 'o2']));
    expect((r as { ordering: string[] }).ordering[0]).toBe('o2');
  });

  it('the route sends the room one key, and neither the ordering nor the confidence', () => {
    const route = readFileSync(join(ROOT, 'app/api/sovereign/manuscripts/[id]/ask/route.ts'), 'utf8');
    const turn = route.slice(route.indexOf('async function developmentalSelectionTurn'));
    expect(turn).toMatch(/const chosen = result\.ordering\[0\]!/);
    expect(turn).toMatch(/observationKey: chosen/);
    expect(turn).not.toMatch(/ordering:\s/);
    expect(turn).not.toMatch(/confidence/);
  });

  it('the room never renders a confidence', () => {
    /* COMMENTS STRIPPED FIRST. The room's own comment documents that no
       confidence arrives, and a raw scan reads that as one arriving — the same
       false positive that has now appeared three times in this lane, and for
       the same reason each time: prose about a ban is not the ban broken. */
    const room = readFileSync(join(ROOT, 'app/writers-studio/develop/DevelopRoom.tsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    expect(room).not.toMatch(/confidence/i);
  });

  it('FALSIFIER · a rendered confidence would be caught', () => {
    const poisoned = '<span>{selection.confidence}</span>';
    expect(poisoned).toMatch(/confidence/i);
  });
});
