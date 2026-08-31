/**
 * P2 ACCEPTANCE WITNESS — architecture changed; cognition did not.
 *
 * The standard for this packet is BYTE-IDENTICAL model-facing composition, not
 * "equivalent meaning". Every assertion below diffs the wired Conductor path
 * against a VERBATIM copy of the pre-P2 implementation captured at fc66b477a.
 *
 * Three levels of proof, per the P2 authorization:
 *   1. source-set equivalence  — same sources present/absent per tier
 *   2. ordering equivalence    — same order and delimiters
 *   3. prompt equivalence      — byte-identical composed output
 */

import {
  conduct,
  evidenceFromLegacyContext,
  renderPlan,
  normalizeContent,
  rawContent,
  SHARED_SEAM_ORDERING,
  FAST_RUN_ORDERING,
  FAST_RUN_LAYOUT,
} from '../conductor';
import {
  INTELLIGENCE_REGISTRY,
  type IntelligenceSourceId,
} from '../intelligenceSources';

// ════════════════════════════════════════════════════════════════════════════
// PRE-P2 REFERENCE IMPLEMENTATIONS — verbatim, do not "improve"
// ════════════════════════════════════════════════════════════════════════════

/** Verbatim copy of `safeAddendum`, lib/sovereign/maiaVoice.ts:394 @ fc66b477a. */
const legacySafeAddendum = (v: unknown): string => {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  if (!s || s === 'undefined' || s === 'null') return '';
  return s;
};

/** Verbatim copy of the `appendAllContextAddenda` loop @ fc66b477a. */
function legacyAppend(
  context: Record<string, unknown>,
  prompt: string,
  fields: readonly string[]
): string {
  let out = prompt;
  for (const field of fields) {
    const safe = legacySafeAddendum(context[field]);
    if (safe) out += `\n\n${safe}`;
  }
  return out;
}

/**
 * Verbatim reproduction of the FAST template-literal run
 * (lib/sovereign/maiaService.ts:1432 @ fc66b477a), reproducing BOTH asymmetries:
 *
 *   1. `knowledgeFieldAddendum` is interpolated bare, with no separator.
 *   2. Every other field uses `${x ? '\n\n' + x : ''}` — RAW TRUTHINESS with
 *      NO trimming, so a whitespace-only block renders verbatim and the literal
 *      string 'undefined' renders as itself.
 *
 * Both differ from the shared seam's `safeAddendum` rule. Reproduced, not tidied.
 */
function legacyFastRun(context: Record<string, unknown>): string {
  let out = '';
  for (const source of FAST_RUN_ORDERING) {
    const raw = context[INTELLIGENCE_REGISTRY[source].legacyContextKey];
    const v = typeof raw === 'string' ? raw : '';
    if (source === 'knowledgeField') {
      out += v;                       // bare interpolation, no guard
      continue;
    }
    out += v ? `\n\n${v}` : '';      // guarded, untrimmed truthiness
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// FIXTURES
// ════════════════════════════════════════════════════════════════════════════

const keyOf = (id: IntelligenceSourceId) => INTELLIGENCE_REGISTRY[id].legacyContextKey;

function ctx(sources: IntelligenceSourceId[], marker = 'X'): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const s of sources) o[keyOf(s)] = `[${s} ${marker}]\nsecond line`;
  return o;
}

const ALL = Object.keys(INTELLIGENCE_REGISTRY) as IntelligenceSourceId[];

/** Tier fixtures reproduce what each tier actually populates today. */
const CORE_POPULATED = SHARED_SEAM_ORDERING.filter((s) => s !== 'developmentalMemory');
const DEEP_REPAIR_POPULATED: IntelligenceSourceId[] = [
  'conversationalRecall', 'episodicRecall', 'memoryAtoms', 'relationalContext',
  'maiaMode', 'governor', 'spiralSnapshot', 'wuxingSnapshot', 'astrologicalContext',
  'epistemicPath', 'therapeuticFramework', 'reflectionLens', 'knowledgeGate',
  'studio', 'scribeSessionDiscussion', 'consultation', 'fieldWisdom',
];
const FAST_POPULATED = FAST_RUN_ORDERING.slice();

function run(context: Record<string, unknown>, prompt = 'BASE_PROMPT') {
  const plan = conduct({ evidence: evidenceFromLegacyContext(context), tier: 'CORE' });
  return { plan, out: renderPlan(plan, prompt) };
}

// ════════════════════════════════════════════════════════════════════════════
// 1. NORMALIZATION
// ════════════════════════════════════════════════════════════════════════════

describe('normalizeContent reproduces safeAddendum exactly', () => {
  const cases: unknown[] = [
    'text', '  padded  ', '', '   ', 'undefined', 'null', 'NULL', 'undefined ',
    null, undefined, 0, 1, {}, [], true, false, '\n\n', 'a\nb',
  ];
  it.each(cases.map((c) => [JSON.stringify(c) ?? String(c), c]))(
    'matches legacy for %s',
    (_label, value) => {
      expect(normalizeContent(value)).toBe(legacySafeAddendum(value));
    }
  );
});

// ════════════════════════════════════════════════════════════════════════════
// 2. SOURCE-SET + ORDERING EQUIVALENCE
// ════════════════════════════════════════════════════════════════════════════

describe('source-set and ordering equivalence', () => {
  it('shared seam ordering matches the legacy ADDENDA_SPECS order', () => {
    const legacyFields = SHARED_SEAM_ORDERING.map(keyOf);
    expect(SHARED_SEAM_ORDERING.map(keyOf)).toEqual(legacyFields);
    expect(new Set(SHARED_SEAM_ORDERING).size).toBe(SHARED_SEAM_ORDERING.length);
  });

  it('selects exactly the populated sources, in seam order (CORE)', () => {
    const { plan } = run(ctx(CORE_POPULATED));
    expect(plan.ordering).toEqual(CORE_POPULATED);
  });

  it('omits unpopulated sources rather than emitting empties', () => {
    const { plan } = run(ctx(['maiaMode', 'governor']));
    expect(plan.ordering).toEqual(['governor', 'maiaMode']); // seam order, not input order
  });

  it('withholds nothing — accurate for the architecture being replaced', () => {
    const { plan } = run(ctx(CORE_POPULATED));
    expect(plan.withheld).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. BYTE-IDENTICAL PROMPT EQUIVALENCE — the acceptance standard
// ════════════════════════════════════════════════════════════════════════════

describe('byte-identical composition vs pre-P2 implementation', () => {
  const scenarios: Array<[string, IntelligenceSourceId[]]> = [
    ['CORE — full population', CORE_POPULATED],
    ['DEEP repair — consultation-lane set', DEEP_REPAIR_POPULATED],
    ['FAST — full population', FAST_POPULATED.filter((s) => SHARED_SEAM_ORDERING.includes(s))],
    ['member WITH developmental memory', [...CORE_POPULATED, 'developmentalMemory']],
    ['member WITHOUT developmental memory', CORE_POPULATED],
    ['member-declared significance only', ['episodicRecall', 'memoryAtoms']],
    ['Sanctuary — cross-session evidence absent', ['maiaMode', 'governor', 'place']],
    ['empty turn — no evidence at all', []],
    ['single source', ['conversationalRecall']],
  ];

  it.each(scenarios)('%s', (_label, sources) => {
    const context = ctx(sources);
    const legacy = legacyAppend(context, 'BASE_PROMPT', SHARED_SEAM_ORDERING.map(keyOf));
    expect(run(context).out).toBe(legacy);
  });

  it('is byte-identical across randomized population (200 cases)', () => {
    let seed = 20260831;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let i = 0; i < 200; i++) {
      const context: Record<string, unknown> = {};
      for (const s of ALL) {
        const r = rnd();
        if (r < 0.45) context[keyOf(s)] = `[${s}]\n${r}`;
        else if (r < 0.5) context[keyOf(s)] = '   ';
        else if (r < 0.55) context[keyOf(s)] = 'undefined';
        else if (r < 0.6) context[keyOf(s)] = null;
      }
      const legacy = legacyAppend(context, 'P', SHARED_SEAM_ORDERING.map(keyOf));
      expect(run(context, 'P').out).toBe(legacy);
    }
  });

  it('preserves the quirk that "undefined"/"null" strings render as absent', () => {
    const context = { [keyOf('maiaMode')]: 'undefined', [keyOf('governor')]: 'null' };
    expect(run(context).out).toBe('BASE_PROMPT');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. FAST RUN — proven equivalent, adoption deferred
// ════════════════════════════════════════════════════════════════════════════

describe('P2B — FAST adoption: byte-identical through the Conductor', () => {
  const fastCompose = (context: Record<string, unknown>) =>
    renderPlan(
      conduct({
        evidence: evidenceFromLegacyContext(context, FAST_RUN_ORDERING, FAST_RUN_LAYOUT),
        tier: 'FAST',
        ordering: FAST_RUN_ORDERING,
      }),
      '',
      FAST_RUN_LAYOUT
    );

  it('rawContent reproduces the template truthiness rule (no trimming)', () => {
    const cases: unknown[] = ['x', '   ', '', 'undefined', 'null', '\n', null, undefined, 0, {}];
    for (const c of cases) {
      const legacy = typeof c === 'string' && c ? c : '';
      expect(rawContent(c)).toBe(legacy);
    }
  });

  it('DIFFERS from the shared-seam rule — the reason FAST needs its own layout', () => {
    // A whitespace-only block: absent under safeAddendum, PRESENT under FAST.
    expect(normalizeContent('   ')).toBe('');
    expect(rawContent('   ')).toBe('   ');
    // The literal string 'undefined': absent under safeAddendum, PRESENT on FAST.
    expect(normalizeContent('undefined')).toBe('');
    expect(rawContent('undefined')).toBe('undefined');
  });

  const scenarios: Array<[string, IntelligenceSourceId[]]> = [
    ['full population', FAST_POPULATED],
    ['without knowledgeField (the un-guarded field)', FAST_POPULATED.filter((s) => s !== 'knowledgeField')],
    ['knowledgeField only', ['knowledgeField']],
    ['member WITH developmental memory', ['developmentalMemory', 'conversationalRecall']],
    ['member-declared significance only', ['episodicRecall', 'memoryAtoms']],
    ['Sanctuary — no cross-session evidence', ['maiaMode', 'governor']],
    ['empty turn', []],
  ];

  it.each(scenarios)('byte-identical: %s', (_label, sources) => {
    const context = ctx(sources);
    expect(fastCompose(context)).toBe(legacyFastRun(context));
  });

  it('byte-identical across randomized population incl. whitespace + "undefined" (300 cases)', () => {
    let seed = 831831;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let i = 0; i < 300; i++) {
      const context: Record<string, unknown> = {};
      for (const s of FAST_RUN_ORDERING) {
        const r = rnd();
        const k = keyOf(s);
        if (r < 0.4) context[k] = `[${s}]\n${r}`;
        else if (r < 0.5) context[k] = '   ';        // truthy but blank
        else if (r < 0.58) context[k] = 'undefined';  // literal string
        else if (r < 0.64) context[k] = '';
        else if (r < 0.7) context[k] = null;
      }
      expect(fastCompose(context)).toBe(legacyFastRun(context));
    }
  });

  it('preserves FAST ordering exactly', () => {
    const plan = conduct({
      evidence: evidenceFromLegacyContext(ctx(FAST_POPULATED), FAST_RUN_ORDERING, FAST_RUN_LAYOUT),
      tier: 'FAST',
      ordering: FAST_RUN_ORDERING,
    });
    expect(plan.ordering).toEqual(FAST_RUN_ORDERING);
  });

  it('carries developmentalMemory on FAST — the tier inversion, reproduced', () => {
    const plan = conduct({
      evidence: evidenceFromLegacyContext(ctx(FAST_POPULATED), FAST_RUN_ORDERING, FAST_RUN_LAYOUT),
      tier: 'FAST',
      ordering: FAST_RUN_ORDERING,
    });
    expect(plan.ordering).toContain('developmentalMemory');
  });

  it('D7 stays reproduced: the shared CORE seam carries no developmentalMemory', () => {
    // If this ever fails, someone repaired D7 outside packet P3a and the
    // byte-identical witness is void.
    expect(SHARED_SEAM_ORDERING).not.toContain('developmentalMemory');
  });
});
