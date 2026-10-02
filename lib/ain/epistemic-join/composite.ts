/**
 * JARVIS-KP-01 · I2 — composite-warrant validation (ACT 11A §1).
 *
 *   MERE ACCUMULATION IS NOT A WARRANT.
 *   partial(A) + partial(B) + partial(C) != warranted(R)
 *
 * unless a new, separately governed composite inference exists whose own
 * standing licenses R. This module holds both halves of ACT 12A §7's double
 * constraint: accumulation cannot become warrant, AND a genuinely governed
 * multi-source inference is not forbidden merely because its sources are
 * individually partial.
 *
 * Pure. No clock, no randomness, no I/O.
 */

import { capStanding, exceeds } from './standing';
import {
  NON_METHODS,
  type CompositionMethod,
  type Refusal,
  type RelationSemantics,
  type RelationStanding,
  type SupportEntry,
  type Warrant,
  type WarrantId,
} from './types';

/**
 * The relation semantics each governed composition method can license.
 *
 * This is the method-semantic escalation guard: a method that can carry
 * correlation does not thereby carry causation, and a method that can carry
 * explanatory coherence does not thereby establish empirical truth
 * (ACT 11A §1.4).
 */
const METHOD_LICENSES: Readonly<Record<CompositionMethod, readonly RelationSemantics[]>> = {
  declared_formal_entailment: ['comparison', 'association', 'equivalence', 'identity', 'direction', 'temporal_sequence'],
  convergent_independent_measurement: ['association', 'correlation', 'conflict', 'temporal_sequence'],
  explanatory_coherence: ['explanatory_fit', 'comparison', 'symbolic_correspondence'],
  mere_agreement: [],
  source_count: [],
  source_prestige: [],
  restatement: [],
};

export function semanticsLicensedByMethod(method: CompositionMethod): readonly RelationSemantics[] {
  return METHOD_LICENSES[method];
}

export interface CompositeAssessment {
  readonly warrantId: WarrantId;
  readonly satisfied: boolean;
  /** Highest standing this composite may license after assessment. */
  readonly standingCeiling: RelationStanding;
  readonly licensedSemantics: readonly RelationSemantics[];
  readonly refusals: readonly Refusal[];
}

const refusal = (code: Refusal['code'], invariant: string, detail: string): Refusal => ({ code, invariant, detail });

/**
 * Assess one composite warrant.
 *
 * `warrantsById` is needed because a support entry may stand on a NESTED
 * composite warrant, whose standing and boundaries travel upward: a parent
 * cannot outrun a provisional child (ACT 11 §11, A11A-INV-04).
 */
export function assessComposite(
  warrant: Warrant,
  warrantsById: ReadonlyMap<WarrantId, Warrant>,
  visiting: readonly WarrantId[] = [],
): CompositeAssessment {
  const composite = warrant.composite;
  if (composite === null) {
    return {
      warrantId: warrant.warrantId,
      satisfied: false,
      standingCeiling: 'CANDIDATE_UNESTABLISHED',
      licensedSemantics: [],
      refusals: [
        refusal(
          'support_set_offered_as_composite_warrant',
          'A11A-INV-01',
          `warrant ${warrant.warrantId} is not a composite inference; a support set is not a warrant`,
        ),
      ],
    };
  }

  const refusals: Refusal[] = [];
  let ceiling: RelationStanding = warrant.standingCeiling;

  // Circularity: a composite may not stand on itself, directly or through a
  // nested chain. Detected before anything else, because a cycle would
  // otherwise let a warrant supply its own support.
  if (visiting.includes(warrant.warrantId)) {
    return {
      warrantId: warrant.warrantId,
      satisfied: false,
      standingCeiling: 'CANDIDATE_UNESTABLISHED',
      licensedSemantics: [],
      refusals: [
        refusal(
          'composite_circular_support',
          'A11A-INV-03',
          `warrant ${warrant.warrantId} appears within its own support chain`,
        ),
      ],
    };
  }

  // Relabeling: a declared composite whose "method" is accumulation is the
  // forbidden shape wearing the permitted name (ACT 11A §1.5).
  if (NON_METHODS.includes(composite.compositionMethod)) {
    refusals.push(
      refusal(
        'composite_method_is_mere_accumulation',
        'A11A-INV-05',
        `composition method "${composite.compositionMethod}" is accumulation, not inference`,
      ),
    );
  }

  // The composite must be distinguishable from its support set: its own
  // proposition and its own author (A11A-INV-01, A11A-INV-02).
  if (!warrant.proposition.trim()) {
    refusals.push(
      refusal('support_set_offered_as_composite_warrant', 'A11A-INV-01', 'composite declares no warrant proposition'),
    );
  }
  if (!warrant.authorship.authorRef.trim()) {
    refusals.push(
      refusal('support_set_offered_as_composite_warrant', 'A11A-INV-02', 'composite declares no author'),
    );
  }

  const relied = composite.supportSet.filter((entry) => entry.mode === 'reliance');
  if (relied.length === 0) {
    refusals.push(
      refusal(
        'reliance_not_declared',
        'INV-10',
        'composite support set contains no relied-upon entry; reference alone is not support',
      ),
    );
  }

  // Provenance of every relied-upon entry must be recoverable (A11A-INV-03).
  for (const entry of relied) {
    if (!entry.provenanceRef.trim()) {
      refusals.push(
        refusal('composite_missing_dependence_resolution', 'A11A-INV-03', `support ${entry.supportId} has no provenance`),
      );
    }
  }

  // Dependence: shared origin among relied-upon entries defeats a claim of
  // independence unless it is explicitly resolved (ACT 11A §1.4).
  const sharedOrigins = new Map<string, string[]>();
  for (const entry of relied) {
    if (entry.sharedOriginRef !== null) {
      const bucket = sharedOrigins.get(entry.sharedOriginRef) ?? [];
      bucket.push(entry.supportId);
      sharedOrigins.set(entry.sharedOriginRef, bucket);
    }
  }
  const collapsedOrigins = [...sharedOrigins.entries()].filter(([, ids]) => ids.length > 1);

  if (!composite.dependenceAssumptions.resolved) {
    refusals.push(
      refusal(
        'composite_missing_dependence_resolution',
        'A11A-INV-04',
        'dependence assumptions are unresolved; sources may not be treated as independent',
      ),
    );
  }
  if (composite.dependenceAssumptions.claimedIndependent && collapsedOrigins.length > 0) {
    const detail = collapsedOrigins
      .map(([origin, ids]) => `${origin}:[${ids.join(',')}]`)
      .join(' ');
    refusals.push(
      refusal(
        'composite_pseudo_independence',
        'A11A-INV-05',
        `independence claimed while support entries share an origin (${detail})`,
      ),
    );
  }

  // Nested composites: the child's assessed ceiling and refusals travel up.
  const nestedSemantics: RelationSemantics[][] = [];
  for (const entry of relied) {
    if (entry.nestedWarrantRef === null) continue;
    const nested = warrantsById.get(entry.nestedWarrantRef);
    if (nested === undefined) {
      refusals.push(
        refusal('warrant_unknown', 'A11A-INV-03', `nested warrant ${entry.nestedWarrantRef} is not present`),
      );
      continue;
    }
    const nestedAssessment = assessComposite(nested, warrantsById, [...visiting, warrant.warrantId]);
    nestedSemantics.push([...nestedAssessment.licensedSemantics]);
    if (!nestedAssessment.satisfied) {
      refusals.push(
        refusal(
          'composite_nested_standing_ceiling',
          'A11A-INV-04',
          `nested warrant ${nested.warrantId} did not satisfy composite law: ` +
            nestedAssessment.refusals.map((r) => r.code).join(','),
        ),
      );
    }
    if (exceeds(ceiling, nestedAssessment.standingCeiling)) {
      ceiling = nestedAssessment.standingCeiling;
    }
  }

  // Semantics: the intersection of what the method licenses and what the
  // warrant declares it licenses. Declaration cannot exceed method.
  const methodLicensed = semanticsLicensedByMethod(composite.compositionMethod);
  const declaredBeyondMethod = warrant.licensedRelationSemantics.filter((s) => !methodLicensed.includes(s));
  if (declaredBeyondMethod.length > 0) {
    refusals.push(
      refusal(
        'composite_method_does_not_license_semantics',
        'A11A-INV-04',
        `method "${composite.compositionMethod}" does not license: ${declaredBeyondMethod.join(',')}`,
      ),
    );
  }
  let licensedSemantics = warrant.licensedRelationSemantics.filter((s) => methodLicensed.includes(s));
  for (const nested of nestedSemantics) {
    licensedSemantics = licensedSemantics.filter((s) => nested.includes(s));
  }

  // Unresolved uncertainty narrows standing rather than disappearing (ACT 11 §6).
  if (warrant.uncertainty !== null && warrant.uncertainty.blocksStrongerStanding) {
    ceiling = capStanding(ceiling, 'PROVISIONAL');
  }

  const satisfied = refusals.length === 0;
  return {
    warrantId: warrant.warrantId,
    satisfied,
    standingCeiling: satisfied ? ceiling : 'CANDIDATE_UNESTABLISHED',
    licensedSemantics: satisfied ? licensedSemantics : [],
    refusals,
  };
}
