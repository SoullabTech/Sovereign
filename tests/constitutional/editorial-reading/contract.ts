/**
 * `WRITERS-STUDIO-EDITORIAL-READING-01 / A2` — the Editorial Reading contract.
 *
 * ⭐ Founder act 2026-09-22, against canonical `fe65f803`. This types the
 * OBSERVABLE contract of the primitive: what may be composed, from what, under
 * what warrant, and when composition must refuse. ⛔ It types no storage — no
 * table, no column, no migration, no route, no prompt. The law at the boundary,
 * not the machine behind it (the S3 B-i discipline, carried forward through
 * OBSERVATION-IDENTITY-01).
 *
 * ⭐⭐ THE ARCHITECTURE
 *
 *      ADMITTED DEVELOPMENTAL READINGS
 *        → (revision law · warrant · inheritance)
 *          → EDITORIAL READING   |   REFUSAL
 *
 *   ⛔ NOT: manuscript → model call → confident whole-book verdict.
 *
 * ⭐ THE GOVERNING SENTENCE (A0, canonical):
 *   *MAIA may say more about the Work only when recorded reading evidence earns
 *   the right to say it. Seeing comes before changing.*
 *
 * ── THREE THINGS ARE CARRIED DELIBERATELY SO THE WRONG ARCHITECTURE IS
 *    BUILDABLE, AND THEREFORE KILLABLE (the S3 `authoredText` lesson) ───────
 *
 *   `CompositionContext.rawProse`
 *        the manuscript text a composer COULD read. Without it, A0 §XIII
 *        falsifier 3 (`raw-prose bypass`) is a sentence no test can break.
 *   `CompositionContext.existingEditorialSynthesis`
 *        the structure reader's object. Without it, A1→A2 Ruling 1
 *        (anti-aliasing) cannot be violated by construction, so it cannot be
 *        proved enforced.
 *   `EditorialClaim.text`
 *        inert to every law here. A conforming composer never derives identity,
 *        provenance or warrant from it.
 *
 * ⛔ A conforming composer touches none of the three.
 */

/* ── vocabulary borrowed from canonical law, never redeclared ───────────── */

/** `lib/manuscript/developmentalReader/contract.ts:92` — the closed eight. */
export type NonConclusion =
  | 'outside-coverage' | 'across-unread-span' | 'whole-work-pattern'
  | 'authored-structure-relation' | 'chronology' | 'author-intent'
  | 'reader-effect' | 'editorial-consequence';

export const NON_CONCLUSIONS: readonly NonConclusion[] = [
  'outside-coverage', 'across-unread-span', 'whole-work-pattern',
  'authored-structure-relation', 'chronology', 'author-intent',
  'reader-effect', 'editorial-consequence',
];

/**
 * ⭐ CONVERGENCE step 6, canonical: coverage may discharge ONLY these three,
 * and only on complete body-depth coverage.
 */
export const COVERAGE_DISCHARGEABLE: readonly NonConclusion[] = [
  'whole-work-pattern', 'across-unread-span', 'outside-coverage',
];

/**
 * ⛔ PERMANENT. A0 §VI as ratified: coverage never licenses these, and no
 * separate constitution is contemplated by this act.
 *   `editorial-consequence` bars defect, importance, priority, or that
 *   anything should change — its full ratified meaning, not a gloss.
 */
export const PERMANENT_NON_CONCLUSIONS: readonly NonConclusion[] = [
  'author-intent', 'reader-effect', 'editorial-consequence',
];

export type DevelopmentalLens =
  | 'structure' | 'development' | 'continuity' | 'arc' | 'voice' | 'coherence' | 'reader';

/** `lib/manuscript/development/readState.ts:119`. */
export type ReadDepth = 'position' | 'body';

/** Opaque. `OBSERVATION-IDENTITY-01 §II` — minted at admission, never derived. */
export type ObservationId = string;

/* ── inputs: admitted readings only ─────────────────────────────────────── */

/**
 * `OBSERVATION-IDENTITY-01 §5` — the earliest position across cited refs.
 * ⚠️ `null` is LAWFUL: a structural observation names authored divisions and
 * has no place in the prose.
 */
export interface ManuscriptPosition {
  readonly sectionId: string;
  readonly codePointStart: number;
}

export interface AdmittedObservation {
  readonly observationId: ObservationId;
  readonly admissionIndex: number;
  readonly doesNotEstablish: readonly NonConclusion[];
  readonly citedSectionIds: readonly string[];
  readonly position: ManuscriptPosition | null;
  /** Inert to every law here. Carried so a text-keyed composer is buildable. */
  readonly text: string;
}

/**
 * One admitted `DevelopmentalReading`. ⛔ A composer may consume nothing else:
 * an unadmitted reader result is not an input (A0 §V).
 */
export interface AdmittedReading {
  readonly readingId: string;
  readonly manuscriptId: string;
  readonly commissionedLens: DevelopmentalLens;
  /** The ONE immutable revision this reading was taken from. */
  readonly revisionDigest: string;
  /** Every section in the topology, with the depth it was read at. */
  readonly coverage: Readonly<Record<string, ReadDepth>>;
  readonly observations: readonly AdmittedObservation[];
}

/**
 * The authored structure of the target revision. ⭐ Required for a whole-Work
 * warrant: "every in-scope authored section" is not decidable without it.
 */
export interface AuthoredStructure {
  readonly revisionDigest: string;
  readonly sectionIds: readonly string[];
}

/** ⚠️ Everything here except `readings`/`structure`/`commissionedWarrant` is a
 *  trap. See header. */
export interface CompositionContext {
  readonly readings: readonly AdmittedReading[];
  readonly structure: AuthoredStructure;
  /**
   * ⭐ A2R1 — WHAT THE MEMBER ASKED FOR. Absent means the operation was not
   * commissioned to a particular warrant and a `covered-span` result is a
   * lawful answer to it.
   *
   * ⛔ This is REQUEST FIDELITY, not coverage semantics. The warrant predicate
   * says what the evidence CAN support; this says what was ASKED. A result may
   * be lawful as an object and still not be an answer to the question.
   */
  readonly commissionedWarrant?: Warrant['kind'];
  readonly rawProse?: string;
  readonly existingEditorialSynthesis?: { readonly thesis: string };
}

/* ── warrant ────────────────────────────────────────────────────────────── */

export type Warrant =
  | { readonly kind: 'whole-work'; readonly revisionDigest: string }
  | { readonly kind: 'covered-span'; readonly coveredSectionIds: readonly string[] };

/**
 * ⭐⭐ THE WARRANT PREDICATE — explicit and decidable over admitted coverage.
 * ⛔ No prose, model intuition, fluency or confidence may substitute for it.
 *
 * A whole-Work warrant requires, for the ONE target revision:
 *   · every authored section of that revision read at `body` depth
 *   · by at least one constituent reading
 *
 * ⛔ `position` depth never contributes: reading where a section sits is not
 * reading what it says.
 */
export function deriveWarrant(ctx: CompositionContext): Warrant {
  const bodyRead = new Set<string>();
  for (const r of ctx.readings) {
    for (const [sectionId, depth] of Object.entries(r.coverage)) {
      if (depth === 'body') bodyRead.add(sectionId);
    }
  }
  const complete = ctx.structure.sectionIds.every((id) => bodyRead.has(id));
  if (complete && ctx.structure.sectionIds.length > 0) {
    return { kind: 'whole-work', revisionDigest: ctx.structure.revisionDigest };
  }
  const covered = ctx.structure.sectionIds.filter((id) => bodyRead.has(id));
  return { kind: 'covered-span', coveredSectionIds: covered };
}

/* ── return precision ───────────────────────────────────────────────────── */

/**
 * A1→A2 Ruling 4. ⛔ No offset, paragraph or span is ever inferred to make a
 * return appear more precise.
 */
export type ReturnPrecision =
  | { readonly kind: 'SECTION_AND_POSITION'; readonly sectionId: string; readonly codePointStart: number }
  | { readonly kind: 'SECTION_RESOLVED_POSITION_UNRESOLVED'; readonly sectionId: string }
  | { readonly kind: 'NO_SECTION_PRECISE_RETURN' };

export function returnPrecisionOf(o: AdmittedObservation): ReturnPrecision {
  if (o.position !== null) {
    return {
      kind: 'SECTION_AND_POSITION',
      sectionId: o.position.sectionId,
      codePointStart: o.position.codePointStart,
    };
  }
  const first = o.citedSectionIds[0];
  if (first !== undefined) return { kind: 'SECTION_RESOLVED_POSITION_UNRESOLVED', sectionId: first };
  return { kind: 'NO_SECTION_PRECISE_RETURN' };
}

/* ── the output ─────────────────────────────────────────────────────────── */

/** Ruling 1 — a distinct canonical identity. ⛔ Never `editorialSynthesis`. */
export const EDITORIAL_READING_KIND = 'editorial-reading' as const;

export interface SourceRef {
  readonly readingId: string;
  readonly observationId: ObservationId;
}

export interface EditorialClaim {
  /** Inert to every law. */
  readonly text: string;
  readonly scope: Warrant['kind'];
  /** ⭐ Inherited upward, never narrowed except by a discharged coverage term. */
  readonly doesNotEstablish: readonly NonConclusion[];
  /** ⭐ Exact constituent identities. ⛔ Never a count, never a summary. */
  readonly sources: readonly SourceRef[];
  readonly returnTo: ReturnPrecision;
}

export interface EditorialReading {
  readonly kind: typeof EDITORIAL_READING_KIND;
  readonly manuscriptId: string;
  readonly revisionDigest: string;
  readonly warrant: Warrant;
  readonly claims: readonly EditorialClaim[];
  /** ⭐ A0 §IX — every constituent observation stays reachable. */
  readonly constituentObservations: readonly SourceRef[];
  readonly constituentReadingIds: readonly string[];
}

/* ── refusal ────────────────────────────────────────────────────────────── */

/**
 * ⛔⛔ REFUSE, NEVER REPAIR BY INFERENCE. A refusal says the composition could
 * not lawfully be made; it never says the Work is defective, and it is never an
 * occasion to disclose.
 */
export type RefusalCode =
  | 'AMBIGUOUS_OBSERVATION_ID'
  | 'MIXED_REVISION_DIGEST'
  | 'INSUFFICIENT_WHOLE_WORK_COVERAGE'
  | 'UNRESOLVED_REQUIRED_EVIDENCE'
  | 'NO_ADMITTED_INPUT';

export interface EditorialRefusal {
  readonly code: RefusalCode;
  /** Identities only. ⛔ No prose, no excerpt, no digest of authored text. */
  readonly offending: readonly string[];
}

export type CompositionOutcome =
  | { readonly outcome: 'reading'; readonly value: EditorialReading }
  | { readonly outcome: 'refused'; readonly refusal: EditorialRefusal };

/* ── the laws, as pure decidable functions ──────────────────────────────── */

/** Ruling 2 — one exact `revisionDigest` across every constituent reading. */
export function revisionRefusal(ctx: CompositionContext): EditorialRefusal | null {
  const digests = new Set(ctx.readings.map((r) => r.revisionDigest));
  if (digests.size > 1) {
    return { code: 'MIXED_REVISION_DIGEST', offending: [...digests].sort() };
  }
  const only = [...digests][0];
  if (only !== undefined && only !== ctx.structure.revisionDigest) {
    return { code: 'MIXED_REVISION_DIGEST', offending: [only, ctx.structure.revisionDigest].sort() };
  }
  return null;
}

/**
 * Ruling 5 — a duplicate identity is REPRESENTABLE in the durable record.
 * ⛔ Never deduplicate, choose, merge, or silently equate. REFUSE.
 */
export function identityRefusal(ctx: CompositionContext): EditorialRefusal | null {
  const seen = new Map<ObservationId, number>();
  for (const r of ctx.readings) {
    for (const o of r.observations) seen.set(o.observationId, (seen.get(o.observationId) ?? 0) + 1);
  }
  const dup = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id).sort();
  return dup.length > 0 ? { code: 'AMBIGUOUS_OBSERVATION_ID', offending: dup } : null;
}

/**
 * ⭐ Inheritance. The union of every source's non-conclusions flows upward.
 * A coverage-dischargeable term is dropped ONLY under a whole-Work warrant.
 * ⛔ A permanent term is never dropped, whatever the coverage.
 */
export function inheritNonConclusions(
  sources: readonly AdmittedObservation[], warrant: Warrant,
): readonly NonConclusion[] {
  const union = new Set<NonConclusion>();
  for (const s of sources) for (const n of s.doesNotEstablish) union.add(n);
  if (warrant.kind === 'whole-work') {
    for (const d of COVERAGE_DISCHARGEABLE) union.delete(d);
  }
  for (const p of PERMANENT_NON_CONCLUSIONS) {
    if (sources.some((s) => s.doesNotEstablish.includes(p))) union.add(p);
  }
  return [...union].sort();
}

/**
 * ⭐⭐ A2R1 — WHOLE-WORK COMMISSION FIDELITY (founder ruling, 2026-09-22).
 *
 *   requested covered-span + lawful covered-span evidence → may issue
 *   requested whole-work  + predicate satisfied           → may issue
 *   requested whole-work  + predicate NOT satisfied       → REFUSE
 *
 * ⛔⛔ NEVER: whole-work requested → silently downgrade to covered-span and
 * return it as though the request had been fulfilled. A `covered-span` reading
 * remains a perfectly lawful OBJECT; it is simply not an ANSWER to a whole-Work
 * commission, and returning one as if it were misrepresents what was earned.
 */
export function commissionRefusal(
  ctx: CompositionContext, derived: Warrant,
): EditorialRefusal | null {
  if (ctx.commissionedWarrant !== 'whole-work') return null;
  if (derived.kind === 'whole-work') return null;
  const bodyRead = new Set<string>();
  for (const r of ctx.readings) {
    for (const [sectionId, depth] of Object.entries(r.coverage)) {
      if (depth === 'body') bodyRead.add(sectionId);
    }
  }
  return {
    code: 'INSUFFICIENT_WHOLE_WORK_COVERAGE',
    offending: ctx.structure.sectionIds.filter((id) => !bodyRead.has(id)),
  };
}

/** ⭐ The conforming composer. ⛔ A test double: no store, no model, no route. */
export function composeEditorialReading(ctx: CompositionContext): CompositionOutcome {
  if (ctx.readings.length === 0) {
    return { outcome: 'refused', refusal: { code: 'NO_ADMITTED_INPUT', offending: [] } };
  }
  const rev = revisionRefusal(ctx);
  if (rev) return { outcome: 'refused', refusal: rev };
  const ident = identityRefusal(ctx);
  if (ident) return { outcome: 'refused', refusal: ident };

  const known = new Set(ctx.structure.sectionIds);
  const unresolved: string[] = [];
  for (const r of ctx.readings) {
    for (const o of r.observations) {
      for (const s of o.citedSectionIds) if (!known.has(s)) unresolved.push(o.observationId);
    }
  }
  if (unresolved.length > 0) {
    return {
      outcome: 'refused',
      refusal: { code: 'UNRESOLVED_REQUIRED_EVIDENCE', offending: [...new Set(unresolved)].sort() },
    };
  }

  const warrant = deriveWarrant(ctx);
  const commission = commissionRefusal(ctx, warrant);
  if (commission) return { outcome: 'refused', refusal: commission };

  const claims: EditorialClaim[] = [];
  const all: SourceRef[] = [];
  for (const r of ctx.readings) {
    for (const o of r.observations) {
      all.push({ readingId: r.readingId, observationId: o.observationId });
      claims.push({
        text: '',
        scope: warrant.kind,
        doesNotEstablish: inheritNonConclusions([o], warrant),
        sources: [{ readingId: r.readingId, observationId: o.observationId }],
        returnTo: returnPrecisionOf(o),
      });
    }
  }
  const first = ctx.readings[0];
  if (first === undefined) {
    return { outcome: 'refused', refusal: { code: 'NO_ADMITTED_INPUT', offending: [] } };
  }
  return {
    outcome: 'reading',
    value: {
      kind: EDITORIAL_READING_KIND,
      manuscriptId: first.manuscriptId,
      revisionDigest: ctx.structure.revisionDigest,
      warrant,
      claims,
      constituentObservations: all,
      constituentReadingIds: ctx.readings.map((r) => r.readingId),
    },
  };
}

export type Composer = (ctx: CompositionContext) => CompositionOutcome;
