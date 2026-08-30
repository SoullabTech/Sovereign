/**
 * WS2-05B step 2 - StructureInterpretation, as a host-controlled protocol.
 *
 * THE READING IS NOT ONE MODEL CALL. MAIA is asked, and may answer with a
 * reading OR with a typed request for specific sections and a reason. The HOST
 * retrieves exactly those bodies and asks again. Three properties follow, and
 * none of them survive if the reading is a single opaque call:
 *
 *   1 - Coverage is mechanically true. MAIA cannot later be recorded as having
 *       read a section the host never supplied, because the host builds the
 *       coverage record from what it actually handed over.
 *   2 - The read stays minimal. One Work resolves from headings; another needs
 *       the neighbourhoods of six boundaries. Neither pays for the other.
 *   3 - `interpretationInputHash` is straightforward: the headings, plus
 *       exactly the bodies supplied.
 *
 * THE EVIDENCE / INTERPRETATION BOUNDARY SURVIVES PASS 2. When bodies arrive, a
 * deterministic algorithm run over them produces MECHANICAL OBSERVATIONS with
 * their own `doesNotEstablish` - it does not become interpretation merely by
 * having happened during the interpreter's pass.
 *
 * THE HOST VALIDATES THE READING. A reader that returns a tree while claiming
 * no structure is evident, or names sections this draft does not hold, or
 * proposes overlapping siblings, is REFUSED. `unaccountedSectionIds` is derived
 * by the host and never accepted from the reader: what a reading failed to
 * explain is not the reading's own account to give.
 */

import type { EvidenceCoverage, StructureEvidence, HeadedSection } from './evidence';
import { observeTransitions } from './evidence';

export type ProposedUncertainty =
  | 'start-boundary'
  | 'end-boundary'
  | 'kind'
  | 'hierarchy'
  | 'possible-scaffold-contamination'
  | 'competing-interpretation';

export interface ProposedUnit {
  /** The member's own words where possible. Null is honest; invented is not. */
  title: string | null;
  /** Free text, never an enum. Null rather than a manufactured "Chapter". */
  kind: string | null;
  /** STABLE SECTION IDS. Positions move; ids do not. */
  fromSectionId: string;
  toSectionId: string;
  children: ProposedUnit[];
  rationale: string;
  /** Observation ids from the evidence. Checkable, not restated. */
  evidenceRefs: string[];
  uncertainty: ProposedUncertainty[];
}

export interface UncertainRegion {
  fromSectionId: string;
  toSectionId: string;
  why: string;
}

interface Common {
  /** MAIA's account of this Work's grammar, in her words. */
  account: string;
  /** Built by the host from what it supplied. Never from the reader. */
  coverage: EvidenceCoverage;
  /** Derived by the host. Never accepted from the reader. */
  unaccountedSectionIds: string[];
  uncertainRegions: UncertainRegion[];
}

/**
 * Six first-class outcomes.
 *
 * `none` and `ambiguous` HAVE NO `units` FIELD AT ALL. Not an empty array - no
 * field. A shape that cannot hold a tree cannot be filled with one by a reader
 * under pressure to produce something, and cannot be rendered as one by a
 * surface that forgot to check.
 */
export type StructureInterpretation =
  | ({ form: 'stable' } & Common & { units: ProposedUnit[] })
  | ({ form: 'partial' } & Common & { units: ProposedUnit[] })
  | ({ form: 'flat' } & Common & { units: ProposedUnit[] })
  | ({ form: 'mixed' } & Common & { units: ProposedUnit[] })
  | ({ form: 'ambiguous' } & Common & {
      alternatives: { label: string; units: ProposedUnit[]; why: string }[];
    })
  | ({ form: 'none' } & Common);

/** What the reader may return. The host completes it into an interpretation. */
export type ReaderReading =
  | { form: 'stable' | 'partial' | 'flat' | 'mixed'; account: string;
      units: ProposedUnit[]; uncertainRegions?: UncertainRegion[] }
  | { form: 'ambiguous'; account: string;
      alternatives: { label: string; units: ProposedUnit[]; why: string }[];
      uncertainRegions?: UncertainRegion[] }
  | { form: 'none'; account: string; uncertainRegions?: UncertainRegion[] };

export type ReaderOutput =
  | { status: 'interpreted'; reading: ReaderReading }
  /** "I need these sections, and here is why." */
  | { status: 'read-request'; sectionIds: string[]; why: string };

export interface ReaderInput {
  pass: 1 | 2 | 3;
  evidence: StructureEvidence;
  sections: readonly HeadedSection[];
  /** Only what the host has supplied so far. Empty on pass 1. */
  bodies: ReadonlyMap<string, string>;
  /** Why the previous pass asked for more, carried forward for context. */
  previousRequest?: { sectionIds: string[]; why: string };
}

export type StructureReader = (input: ReaderInput) => Promise<ReaderOutput>;

export type InterpretRefusal =
  | 'read-request-exhausted'
  | 'unknown-section'
  | 'inverted-range'
  | 'overlapping-siblings'
  | 'child-outside-parent'
  | 'unknown-evidence-ref'
  | 'ambiguous-without-alternatives'
  | 'empty-account';

export type InterpretResult =
  | { status: 'ok'; interpretation: StructureInterpretation;
      interpretationInputHash: string }
  | { status: 'refused'; refusal: InterpretRefusal; detail?: string };

/* -- the host loop ------------------------------------------------------- */

export interface InterpretOptions {
  /** Supplies bodies for exactly the ids requested. */
  fetchBodies: (sectionIds: readonly string[]) => Promise<Map<string, string>>;
  /** Deterministic observations over newly supplied bodies. Optional. */
  observeBodies?: (
    sections: readonly HeadedSection[],
    bodies: ReadonlyMap<string, string>,
  ) => StructureEvidence['observations'];
  maxPasses?: 1 | 2 | 3;
}

export async function interpretStructure(
  evidence: StructureEvidence,
  sections: readonly HeadedSection[],
  reader: StructureReader,
  opts: InterpretOptions,
): Promise<InterpretResult> {
  const maxPasses = opts.maxPasses ?? 3;
  const bodies = new Map<string, string>();
  const known = new Set(sections.map((s) => s.id));
  let working = evidence;
  let previousRequest: { sectionIds: string[]; why: string } | undefined;

  for (let pass = 1 as 1 | 2 | 3; pass <= maxPasses; pass = (pass + 1) as 1 | 2 | 3) {
    const out = await reader({ pass, evidence: working, sections, bodies, previousRequest });

    if (out.status === 'interpreted') {
      return complete(out.reading, working, sections, bodies);
    }

    /* A request naming sections this draft does not hold is refused rather
       than quietly narrowed: a reader asking for something that is not there
       has misunderstood the Work, and proceeding would hide that. */
    const unknown = out.sectionIds.find((id) => !known.has(id));
    if (unknown) return { status: 'refused', refusal: 'unknown-section', detail: unknown };

    if (pass === maxPasses) {
      /* No fabricated answer. The caller is told the reading did not settle. */
      return { status: 'refused', refusal: 'read-request-exhausted', detail: out.why };
    }

    const supplied = await opts.fetchBodies(out.sectionIds);
    for (const [id, text] of supplied) bodies.set(id, text);

    if (opts.observeBodies) {
      /* Deterministic, and therefore EVIDENCE - carrying its own limits - even
         though it happened inside the interpreter's loop. */
      working = {
        ...working,
        observations: [...working.observations, ...opts.observeBodies(sections, bodies)],
      };
    }
    previousRequest = { sectionIds: out.sectionIds, why: out.why };
  }

  return { status: 'refused', refusal: 'read-request-exhausted' };
}

/* -- host-side completion and validation --------------------------------- */

function unitsOf(r: ReaderReading): ProposedUnit[] {
  if (r.form === 'none') return [];
  if (r.form === 'ambiguous') return r.alternatives.flatMap((a) => a.units);
  return r.units;
}

function walk(units: readonly ProposedUnit[], fn: (u: ProposedUnit) => void): void {
  for (const u of units) { fn(u); walk(u.children, fn); }
}

function complete(
  reading: ReaderReading,
  evidence: StructureEvidence,
  sections: readonly HeadedSection[],
  bodies: ReadonlyMap<string, string>,
): InterpretResult {
  if (!reading.account.trim()) return { status: 'refused', refusal: 'empty-account' };
  if (reading.form === 'ambiguous' && reading.alternatives.length < 2) {
    return { status: 'refused', refusal: 'ambiguous-without-alternatives' };
  }

  const position = new Map(sections.map((s) => [s.id, s.position]));
  const evidenceIds = new Set(evidence.observations.map((o) => o.id));

  let refusal: { refusal: InterpretRefusal; detail?: string } | null = null;
  const rangeOf = (u: ProposedUnit): [number, number] | null => {
    const a = position.get(u.fromSectionId);
    const b = position.get(u.toSectionId);
    if (a === undefined) { refusal ??= { refusal: 'unknown-section', detail: u.fromSectionId }; return null; }
    if (b === undefined) { refusal ??= { refusal: 'unknown-section', detail: u.toSectionId }; return null; }
    if (a > b) { refusal ??= { refusal: 'inverted-range', detail: u.title ?? u.fromSectionId }; return null; }
    return [a, b];
  };

  const validate = (siblings: readonly ProposedUnit[]) => {
    const ranges: [number, number][] = [];
    for (const u of siblings) {
      const r = rangeOf(u);
      if (!r) return;
      for (const ref of u.evidenceRefs) {
        if (!evidenceIds.has(ref)) refusal ??= { refusal: 'unknown-evidence-ref', detail: ref };
      }
      for (const child of u.children) {
        const cr = rangeOf(child);
        if (cr && (cr[0] < r[0] || cr[1] > r[1])) {
          refusal ??= { refusal: 'child-outside-parent', detail: child.title ?? child.fromSectionId };
        }
      }
      ranges.push(r);
      validate(u.children);
    }
    ranges.sort((x, y) => x[0] - y[0]);
    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i][0] <= ranges[i - 1][1]) {
        refusal ??= { refusal: 'overlapping-siblings', detail: `${ranges[i - 1]} / ${ranges[i]}` };
      }
    }
  };

  if (reading.form === 'ambiguous') reading.alternatives.forEach((a) => validate(a.units));
  else if (reading.form !== 'none') validate(reading.units);

  if (refusal) return { status: 'refused', ...refusal };

  /* DERIVED, never accepted from the reader. What a reading failed to explain
     is not the reading's own account to give. For an ambiguous reading nothing
     is accounted for, because no alternative has been chosen. */
  const covered = new Set<string>();
  if (reading.form !== 'ambiguous') {
    walk(unitsOf(reading), (u) => {
      const a = position.get(u.fromSectionId)!;
      const b = position.get(u.toSectionId)!;
      for (const s of sections) if (s.position >= a && s.position <= b) covered.add(s.id);
    });
  }
  const unaccountedSectionIds = sections
    .filter((s) => !covered.has(s.id))
    .sort((x, y) => x.position - y.position)
    .map((s) => s.id);

  const coverage: EvidenceCoverage = {
    headings: 'all',
    bodies: bodies.size === 0
      ? { mode: 'none', sectionIds: [] }
      : bodies.size === sections.length
        ? { mode: 'all', sectionIds: [...bodies.keys()] }
        : { mode: 'selected', sectionIds: [...bodies.keys()] },
    passes: bodies.size === 0 ? 1 : bodies.size === sections.length ? 3 : 2,
  };

  const common: Common = {
    account: reading.account,
    coverage,
    unaccountedSectionIds,
    uncertainRegions: reading.uncertainRegions ?? [],
  };

  const interpretation: StructureInterpretation =
    reading.form === 'none' ? { form: 'none', ...common }
      : reading.form === 'ambiguous'
        ? { form: 'ambiguous', ...common, alternatives: reading.alternatives }
        : { form: reading.form, ...common, units: reading.units };

  return {
    status: 'ok',
    interpretation,
    interpretationInputHash: interpretationInputHash(sections, bodies),
  };
}

/**
 * Exactly what was interpreted: every heading, plus the bodies actually
 * supplied. Changing an unread body leaves this alone; changing a heading or a
 * body MAIA read marks the proposal stale-as-read.
 */
export function interpretationInputHash(
  sections: readonly HeadedSection[],
  bodies: ReadonlyMap<string, string>,
): string {
  const heads = [...sections]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.id}:${s.heading ?? ''}`)
    .join('');
  const read = [...bodies.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([id, text]) => `${id}:${text.length}:${simpleDigest(text)}`)
    .join('');
  return `${simpleDigest(heads)}~${simpleDigest(read)}`;
}

/** FNV-1a. Not cryptography: a change detector, and it says so. */
function simpleDigest(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Pass-2 body observations, deterministic and carrying their own limits. */
export function observeSuppliedBodies(
  sections: readonly HeadedSection[],
  bodies: ReadonlyMap<string, string>,
): StructureEvidence['observations'] {
  const withText = sections.filter((s) => bodies.has(s.id));
  if (withText.length < 10) return [];
  /* The same vocabulary-shift measure that could not discriminate over
     headings, now over prose, where it has something to measure. */
  return observeTransitions(
    withText.map((s) => ({ ...s, heading: bodies.get(s.id)!.slice(0, 400) })),
  );
}
