/**
 * JARVIS-KP-01 · I2 — the pure constitutional epistemic-join evaluator.
 *
 *   NO SEMANTIC JOIN WITHOUT A WARRANT.
 *
 * `evaluateJoin` answers exactly one question: does an explicitly supplied
 * proposed semantic relation have sufficient epistemic warrant for a specified
 * standing in a specified jurisdiction?
 *
 * It answers that question and stops. It persists nothing, publishes nothing,
 * injects nothing, remembers nothing, displays nothing, and authorizes nothing
 * downstream. `downstreamRepresentationAuthorized` is typed as the literal
 * `false`: in I2 there is no value this function could return that says
 * otherwise. Admission is not representation.
 *
 * Pipeline order is the I1 §5 order:
 *   NORMALIZE ENVELOPE -> VALIDATE AUTHORSHIP + PROVENANCE
 *     -> VALIDATE JURISDICTION -> VALIDATE WARRANT -> CAP RELATION SEMANTICS
 *     -> CAP STANDING -> DERIVE
 *
 * PURITY: deterministic for identical inputs. No database, no network, no
 * provider call, no clock, no randomness, no environment read, no filesystem,
 * no module-level mutable state. Ordering is taken from declared succession,
 * never from a timestamp.
 */

import { assessComposite } from './composite';
import { resolveAdoption } from './adoption';
import { capStanding, elevationRank, exceeds, isTerminal, resolveStanding, subjectKey } from './standing';
import {
  EpistemicJoinMalformed,
  type AuthorityRole,
  type ComponentEvaluation,
  type EpistemicOperation,
  type EvaluationRequest,
  type JoinAuthorClass,
  type JoinEvaluation,
  type OperativeBoundary,
  type Refusal,
  type RefusalCode,
  type RelationSemantics,
  type RelationStanding,
  type Uncertainty,
  type Warrant,
  type WarrantClass,
  type WarrantId,
} from './types';

// ---------------------------------------------------------------------------
// Static law tables
// ---------------------------------------------------------------------------

/**
 * The strongest standing each operation stage can carry (ACT 11 §2.5).
 * Comparison is not a weak relation; it is not a relation claim at all.
 */
const STAGE_CEILING: Readonly<Record<EpistemicOperation, RelationStanding>> = {
  REFERENCE: 'NONE_UNASSERTED',
  REPORT_MOVE: 'NONE_UNASSERTED',
  COMPARE_JUXTAPOSE: 'CANDIDATE_UNESTABLISHED',
  HYPOTHESIZE: 'CANDIDATE_UNESTABLISHED',
  WARRANTED_JOIN: 'WARRANTED',
  PROMOTE: 'PROMOTED',
  DISCHARGE: 'DISCHARGED',
};

/** The author class each exercised role may claim without an adoption act. */
const ROLE_FOR_AUTHOR_CLASS: Readonly<Record<JoinAuthorClass, AuthorityRole | null>> = {
  SOURCE_AUTHORED: 'source',
  MEMBER_AUTHORED: 'member',
  // MEMBER_CONFIRMED is the one class an agent may legitimately introduce,
  // because its legitimacy comes from a separate adoption act, not from the
  // proposer. That is checked below rather than here.
  MEMBER_CONFIRMED: null,
  PRACTITIONER_AUTHORED: 'practitioner',
  JARVIS_AUTHORED: 'jarvis',
  MAIA_PROPOSED: 'maia',
  OTHER_DECLARED_AUTHORITY: 'other_declared',
};

/**
 * The outer limit of relation semantics a warrant CLASS can license, whatever
 * its own declaration says.
 *
 * A warrant that establishes relatedness does not automatically establish
 * causation, direction, permanence, identity, equivalence, psychological
 * meaning, universality, or outcome (ACT 11 §4). "Automatically" is the load-
 * bearing word: where a class can in principle bear on causation, the warrant
 * must still DECLARE it, and the declaration is then intersected with the claim.
 * Theoretical standing stays theoretical; member meaning stays member meaning.
 */
const CLASS_MAX_SEMANTICS: Readonly<Record<WarrantClass, readonly RelationSemantics[]>> = {
  DIRECT_SOURCE_RELATION: [
    'co_presence', 'comparison', 'association', 'correlation', 'conflict', 'explanatory_fit',
    'symbolic_correspondence', 'temporal_sequence', 'causation', 'direction', 'equivalence',
    'identity', 'permanence', 'psychological_meaning', 'universality', 'outcome',
  ],
  MEMBER_AUTHORED_RELATION: [
    'co_presence', 'comparison', 'association', 'conflict', 'symbolic_correspondence',
    'temporal_sequence', 'psychological_meaning',
  ],
  MEMBER_CONFIRMATION: [
    'co_presence', 'comparison', 'association', 'conflict', 'symbolic_correspondence',
    'temporal_sequence', 'psychological_meaning',
  ],
  PRACTITIONER_INTERPRETATION: [
    'comparison', 'association', 'conflict', 'explanatory_fit', 'symbolic_correspondence',
    'psychological_meaning',
  ],
  EMPIRICAL_RELATION_EVIDENCE: [
    'co_presence', 'comparison', 'association', 'correlation', 'conflict', 'temporal_sequence',
    'direction', 'causation', 'outcome',
  ],
  FORMAL_ENTAILMENT: [
    'comparison', 'association', 'equivalence', 'identity', 'direction', 'temporal_sequence',
  ],
  THEORETICAL_ARGUMENT: [
    'comparison', 'association', 'explanatory_fit', 'symbolic_correspondence',
  ],
  BOUNDARY_DISCHARGE_EVIDENCE: [
    'comparison', 'association', 'correlation', 'conflict', 'temporal_sequence', 'direction',
    'causation', 'outcome',
  ],
  OTHER_DECLARED_WARRANT: [
    'co_presence', 'comparison', 'association', 'correlation', 'conflict', 'explanatory_fit',
    'symbolic_correspondence', 'temporal_sequence', 'causation', 'direction', 'equivalence',
    'identity', 'permanence', 'psychological_meaning', 'universality', 'outcome',
  ],
};

const refusal = (code: RefusalCode, invariant: string, detail: string): Refusal => ({ code, invariant, detail });

/**
 * A component-scoped limitation, not a defect of the join: the adopter simply
 * holds no authority over that component, which keeps whatever standing its own
 * warrant supports.
 */
const NON_BLOCKING: readonly RefusalCode[] = ['adoption_outside_adopter_jurisdiction'];

/**
 * CEILING refusals say the requested standing is too strong. They narrow the
 * result to what the evidence licenses, because uncertainty must narrow standing
 * rather than delete meaning (ACT 11 §6): "when uncertain, lower standing before
 * deleting meaning."
 *
 * Every other refusal is an epistemic DEFECT — a missing warrant, an unlicensed
 * semantic, a jurisdiction jump, a dropped boundary, a reference passed off as
 * reliance, composed authorship, accumulation — and those fail closed.
 */
const CEILING_REFUSALS: readonly RefusalCode[] = [
  'uncertainty_blocks_elevation',
  'standing_exceeds_warrant_ceiling',
  'operation_stage_below_requested_standing',
];

function blocksElevation(refusals: readonly Refusal[]): boolean {
  return refusals.some((r) => !NON_BLOCKING.includes(r.code));
}

/** True when nothing worse than a ceiling narrowing was found. */
function onlyNarrows(refusals: readonly Refusal[]): boolean {
  return refusals.every((r) => CEILING_REFUSALS.includes(r.code) || NON_BLOCKING.includes(r.code));
}

// ---------------------------------------------------------------------------
// Warrant assessment (non-composite and composite)
// ---------------------------------------------------------------------------

interface WarrantAssessment {
  readonly warrantId: WarrantId;
  readonly usable: boolean;
  readonly standingCeiling: RelationStanding;
  readonly licensedSemantics: readonly RelationSemantics[];
  readonly boundaries: readonly OperativeBoundary[];
  readonly uncertainty: Uncertainty | null;
  readonly isComposite: boolean;
  readonly refusals: readonly Refusal[];
}

function assessWarrant(
  warrant: Warrant,
  warrantsById: ReadonlyMap<WarrantId, Warrant>,
  requestedJurisdiction: EvaluationRequest['requestedJurisdiction'],
): WarrantAssessment {
  const refusals: Refusal[] = [];
  let ceiling: RelationStanding = warrant.standingCeiling;

  if (warrant.liveness === 'defeated') {
    refusals.push(refusal('warrant_not_live', 'INV-07', `warrant ${warrant.warrantId} is defeated`));
  } else if (warrant.liveness === 'disputed' || warrant.liveness === 'weakened') {
    // Uncertainty narrows standing rather than disappearing (ACT 11 §6).
    ceiling = capStanding(ceiling, 'PROVISIONAL');
  }

  // Jurisdiction: a warrant valid in one jurisdiction does not silently acquire
  // standing in another. Transfer must be declared by the warrant itself.
  if (warrant.jurisdiction !== requestedJurisdiction) {
    if (warrant.licensesTransferInto.includes(requestedJurisdiction)) {
      // Declared transfer. Permitted, and still bounded by everything else.
    } else {
      refusals.push(
        refusal(
          'jurisdiction_mismatch',
          'INV-08',
          `warrant jurisdiction "${warrant.jurisdiction}" does not cover requested "${requestedJurisdiction}"`,
        ),
      );
      refusals.push(
        refusal(
          'cross_jurisdiction_transfer_undeclared',
          'INV-08',
          `warrant ${warrant.warrantId} declares no transfer into "${requestedJurisdiction}"`,
        ),
      );
    }
  }

  // Declared semantics may not exceed what the warrant CLASS can license.
  const classMax = CLASS_MAX_SEMANTICS[warrant.warrantClass];
  const overDeclared = warrant.licensedRelationSemantics.filter((s) => !classMax.includes(s));
  if (overDeclared.length > 0) {
    refusals.push(
      refusal(
        'semantics_not_licensed',
        'INV-07',
        `warrant class ${warrant.warrantClass} cannot license: ${overDeclared.join(',')}`,
      ),
    );
  }
  let licensedSemantics = warrant.licensedRelationSemantics.filter((s) => classMax.includes(s));

  const boundaries = warrant.boundaries.filter((b) => b.live);

  if (warrant.composite !== null) {
    const composite = assessComposite(warrant, warrantsById);
    refusals.push(...composite.refusals);
    if (exceeds(ceiling, composite.standingCeiling)) ceiling = composite.standingCeiling;
    licensedSemantics = licensedSemantics.filter((s) => composite.licensedSemantics.includes(s));
    for (const entry of warrant.composite.supportSet) {
      if (entry.mode !== 'reliance') continue;
      boundaries.push(...entry.boundaries.filter((b) => b.live));
    }
  }

  if (warrant.uncertainty !== null && warrant.uncertainty.blocksStrongerStanding) {
    ceiling = capStanding(ceiling, 'PROVISIONAL');
  }

  const usable = refusals.length === 0;
  return {
    warrantId: warrant.warrantId,
    usable,
    standingCeiling: usable ? ceiling : 'CANDIDATE_UNESTABLISHED',
    licensedSemantics: usable ? licensedSemantics : [],
    boundaries,
    uncertainty: warrant.uncertainty,
    isComposite: warrant.composite !== null,
    refusals,
  };
}

// ---------------------------------------------------------------------------
// The evaluator
// ---------------------------------------------------------------------------

export function evaluateJoin(request: EvaluationRequest): JoinEvaluation {
  const { envelope, warrants, standingActs, adoptionActs, requestedStanding, requestedJurisdiction } = request;

  // --- NORMALIZE ENVELOPE --------------------------------------------------
  if (!envelope.joinId.trim()) throw new EpistemicJoinMalformed('blank_identifier', 'envelope.joinId');
  if (!envelope.memberScope.trim()) throw new EpistemicJoinMalformed('blank_identifier', 'envelope.memberScope');
  if (!envelope.relationProposition.trim()) {
    throw new EpistemicJoinMalformed('relation_proposition_absent', 'envelope.relationProposition');
  }
  if (envelope.endpoints.length < 2) {
    throw new EpistemicJoinMalformed('relation_requires_two_endpoints', 'envelope.endpoints');
  }
  const endpointIds = new Set(envelope.endpoints.map((e) => e.endpointId));
  if (endpointIds.size !== envelope.endpoints.length) {
    throw new EpistemicJoinMalformed('duplicate_endpoint_id', 'envelope.endpoints');
  }
  for (const act of standingActs) {
    if (act.joinId !== envelope.joinId) {
      throw new EpistemicJoinMalformed('standing_act_for_other_join', act.actId);
    }
  }
  for (const act of adoptionActs) {
    if (act.joinId !== envelope.joinId) {
      throw new EpistemicJoinMalformed('adoption_act_for_other_join', act.actId);
    }
  }
  const warrantsById = new Map<WarrantId, Warrant>();
  for (const warrant of warrants) {
    if (warrantsById.has(warrant.warrantId)) {
      throw new EpistemicJoinMalformed('duplicate_warrant_id', warrant.warrantId);
    }
    warrantsById.set(warrant.warrantId, warrant);
  }

  const refusals: Refusal[] = [];
  const admissionReasons: string[] = [];

  // --- VALIDATE AUTHORSHIP + PROVENANCE ------------------------------------
  const introducedByRole = envelope.provenance.introducedBy.roleExercised;
  const requiredRole = ROLE_FOR_AUTHOR_CLASS[envelope.authorship.authorClass];
  if (requiredRole !== null && introducedByRole !== requiredRole) {
    // Premise authorship never composes into relation authorship: an agent that
    // introduced the relation cannot present it as human-authored.
    refusals.push(
      refusal(
        'authorship_composition_attempted',
        'INV-03',
        `author class ${envelope.authorship.authorClass} requires the relation to be introduced by ` +
          `"${requiredRole}", but it was introduced by "${introducedByRole}"`,
      ),
    );
  }
  if (envelope.authorship.authorClass === 'MEMBER_CONFIRMED' && adoptionActs.length === 0) {
    refusals.push(
      refusal(
        'authorship_composition_attempted',
        'INV-11',
        'MEMBER_CONFIRMED authorship claimed with no adoption act; agent generation cannot impersonate adoption',
      ),
    );
  }
  if (!envelope.provenance.transformationStep.trim() || !envelope.provenance.inquiryContext.trim()) {
    refusals.push(
      refusal('join_provenance_incomplete', 'INV-04', 'join provenance does not record how the relation came to exist'),
    );
  }

  // Reference and reliance are different relations to the same material and may
  // not name the same ref (ACT 11 §12).
  const reliedRefs = new Set(envelope.provenance.reliedUponRefs);
  const referenceOnlyRefs = new Set(envelope.provenance.referenceOnlyRefs);
  for (const ref of reliedRefs) {
    if (referenceOnlyRefs.has(ref)) {
      refusals.push(
        refusal('reference_offered_as_reliance', 'INV-10', `ref "${ref}" is declared both relied-upon and reference-only`),
      );
    }
  }

  let relianceValid = true;
  for (const endpoint of envelope.endpoints) {
    const declaredRelied = reliedRefs.has(endpoint.endpointId);
    if (endpoint.mode === 'reliance' && !declaredRelied) {
      relianceValid = false;
      refusals.push(
        refusal(
          'reliance_not_declared',
          'INV-10',
          `endpoint ${endpoint.endpointId} is relied upon but absent from join provenance reliance set`,
        ),
      );
    }
    if (endpoint.mode === 'reference' && declaredRelied) {
      relianceValid = false;
      refusals.push(
        refusal(
          'reference_offered_as_reliance',
          'INV-10',
          `endpoint ${endpoint.endpointId} is reference-only but is offered as relied-upon support`,
        ),
      );
    }
  }

  // Another member may not adopt into this member's field.
  for (const act of adoptionActs) {
    if (act.adopter.roleExercised === 'member' && act.adopter.authorRef !== envelope.memberScope) {
      refusals.push(
        refusal(
          'member_scope_violation',
          'INV-11',
          `adopter ${act.adopter.authorRef} is not the member scope of this join`,
        ),
      );
    }
  }

  // --- VALIDATE WARRANT ----------------------------------------------------
  const offered = envelope.offeredWarrantRefs;
  const assessments: WarrantAssessment[] = [];
  for (const ref of offered) {
    const warrant = warrantsById.get(ref);
    if (warrant === undefined) {
      refusals.push(refusal('warrant_unknown', 'INV-04', `offered warrant ${ref} is not present in the evaluation input`));
      continue;
    }
    assessments.push(assessWarrant(warrant, warrantsById, requestedJurisdiction));
  }
  const usable = assessments.filter((a) => a.usable);
  for (const assessment of assessments) {
    if (!assessment.usable) refusals.push(...assessment.refusals);
  }

  const requestedIsTerminal = isTerminal(requestedStanding);
  const requestedRank = elevationRank(requestedStanding) ?? 0;
  const wantsElevation = !requestedIsTerminal && requestedRank > (elevationRank('CANDIDATE_UNESTABLISHED') ?? 0);

  if (offered.length === 0 && wantsElevation) {
    refusals.push(
      refusal('no_warrant_offered', 'ACT10', 'no warrant is offered for the relation itself'),
    );
    const strongEndpoints = envelope.endpoints.filter(
      (e) => e.mode === 'reliance' && (e.standing === 'WARRANTED' || e.standing === 'PROMOTED'),
    );
    if (strongEndpoints.length >= 2) {
      refusals.push(
        refusal(
          'endpoint_evidence_offered_as_relation_evidence',
          'INV-05',
          'endpoint evidence does not transfer to the edge: evidence(A) + evidence(B) != evidence(A -R-> B)',
        ),
      );
    }
  }

  // Accumulation across warrants: the ceiling is the MAXIMUM of individual
  // ceilings, never their sum. N individually insufficient warrants therefore
  // cannot reach a standing none of them licenses, and asking for that is
  // named rather than silently downgraded (ACT 11A §1.5).
  let warrantCeiling: RelationStanding = 'NONE_UNASSERTED';
  for (const assessment of usable) {
    if (exceeds(assessment.standingCeiling, warrantCeiling)) warrantCeiling = assessment.standingCeiling;
  }
  const anyComposite = assessments.some((a) => a.isComposite);
  const accumulationAttempted =
    usable.length >= 2 && !anyComposite && !requestedIsTerminal && exceeds(requestedStanding, warrantCeiling);
  if (accumulationAttempted) {
    refusals.push(
      refusal(
        'support_set_offered_as_composite_warrant',
        'A11A-INV-05',
        `${usable.length} warrants each licensing at most ${warrantCeiling} cannot sum to ${requestedStanding}; ` +
          'a separately authored composite inference is required',
      ),
    );
  }
  const compositeWarrantRequired = anyComposite || accumulationAttempted;
  const compositeWarrantSatisfied =
    compositeWarrantRequired && anyComposite && assessments.filter((a) => a.isComposite).every((a) => a.usable);

  // --- CAP RELATION SEMANTICS ----------------------------------------------
  const licensedSemantics = new Set<RelationSemantics>();
  for (const assessment of usable) {
    for (const semantic of assessment.licensedSemantics) licensedSemantics.add(semantic);
  }
  const unlicensed = envelope.claimedSemantics.filter((s) => !licensedSemantics.has(s));
  if (unlicensed.length > 0 && wantsElevation) {
    refusals.push(
      refusal(
        'semantics_not_licensed',
        'INV-07',
        `claimed relation semantics not licensed by any usable warrant: ${unlicensed.join(',')}`,
      ),
    );
  }

  // --- BOUNDARY CARRIAGE ---------------------------------------------------
  const carried: OperativeBoundary[] = [];
  const seenBoundaryIds = new Set<string>();
  const addBoundary = (boundary: OperativeBoundary): void => {
    if (seenBoundaryIds.has(boundary.boundaryId)) return;
    seenBoundaryIds.add(boundary.boundaryId);
    carried.push(boundary);
  };
  for (const endpoint of envelope.endpoints) {
    if (endpoint.mode !== 'reliance') continue;
    for (const boundary of endpoint.boundaries) if (boundary.live) addBoundary(boundary);
  }
  for (const assessment of assessments) {
    for (const boundary of assessment.boundaries) addBoundary(boundary);
  }
  const declaredBoundaryIds = new Set(envelope.boundaries.map((b) => b.boundaryId));
  const droppedBoundaries = carried.filter((b) => !declaredBoundaryIds.has(b.boundaryId));
  if (droppedBoundaries.length > 0) {
    refusals.push(
      refusal(
        'boundary_loss',
        'INV-09',
        `relied-upon boundaries dropped by the join: ${droppedBoundaries.map((b) => b.boundaryId).join(',')}`,
      ),
    );
  }

  const carriedUncertainty: Uncertainty[] = [];
  if (envelope.uncertainty !== null) carriedUncertainty.push(envelope.uncertainty);
  for (const assessment of assessments) {
    if (assessment.uncertainty !== null) carriedUncertainty.push(assessment.uncertainty);
  }
  const uncertaintyBlocks = carriedUncertainty.some((u) => u.blocksStrongerStanding);

  // --- CAP STANDING --------------------------------------------------------
  let ceiling = warrantCeiling;
  // A proposal needs no warrant to be a proposal. Absence of relation evidence
  // does not force silence; it forces CANDIDATE standing (INV-13).
  if (exceeds('CANDIDATE_UNESTABLISHED', ceiling)) ceiling = 'CANDIDATE_UNESTABLISHED';
  ceiling = capStanding(ceiling, STAGE_CEILING[envelope.operation]);
  if (uncertaintyBlocks) {
    ceiling = capStanding(ceiling, 'PROVISIONAL');
    if (exceeds(requestedStanding, 'PROVISIONAL')) {
      refusals.push(
        refusal('uncertainty_blocks_elevation', 'INV-07', 'unresolved uncertainty keeps this relation provisional'),
      );
    }
  }
  if (!requestedIsTerminal && exceeds(requestedStanding, STAGE_CEILING[envelope.operation])) {
    refusals.push(
      refusal(
        'operation_stage_below_requested_standing',
        'INV-06',
        `operation ${envelope.operation} cannot carry ${requestedStanding}`,
      ),
    );
  }
  if (!requestedIsTerminal && exceeds(requestedStanding, warrantCeiling) && offered.length > 0 && !accumulationAttempted) {
    refusals.push(
      refusal(
        'standing_exceeds_warrant_ceiling',
        'INV-07',
        `requested ${requestedStanding} exceeds warrant ceiling ${warrantCeiling}`,
      ),
    );
  }

  // --- DERIVE STANDING FROM APPEND-ONLY ACTS -------------------------------
  const resolved = resolveStanding(standingActs);
  const wholeJoin = resolved.bySubject.get(subjectKey(envelope.joinId, null));
  const derivedClaim: RelationStanding = wholeJoin?.claimedStanding ?? 'NONE_UNASSERTED';

  let admittedStanding: RelationStanding;
  let admittedJurisdiction: EvaluationRequest['requestedJurisdiction'] | null = null;

  if (requestedIsTerminal) {
    // Corrigibility is never gated by warrant: later evidence must always be
    // able to weaken, supersede, or discharge a relation (INV-12).
    admittedStanding = requestedStanding;
    admittedJurisdiction = requestedJurisdiction;
    admissionReasons.push(
      `corrigibility: ${requestedStanding} requires no warrant, and the prior standing remains recoverable in history`,
    );
  } else if (isTerminal(derivedClaim)) {
    admittedStanding = derivedClaim;
    refusals.push(
      refusal(
        'terminal_standing_not_re_elevable',
        'INV-12',
        `current derived standing is ${derivedClaim}; re-elevation requires a new authorized act with new evidence`,
      ),
    );
  } else if (blocksElevation(refusals) && !onlyNarrows(refusals)) {
    // FAIL CLOSED for elevation. The claim is not erased: it is held at the
    // highest standing that needs no warrant.
    admittedStanding = capStanding(derivedClaim, 'CANDIDATE_UNESTABLISHED');
  } else {
    const base = derivedClaim === 'NONE_UNASSERTED' ? requestedStanding : derivedClaim;
    admittedStanding = capStanding(capStanding(requestedStanding, base), ceiling);
    admittedJurisdiction = requestedJurisdiction;
    admissionReasons.push(
      `warrant(s) ${usable.map((a) => a.warrantId).join(',') || '(none required)'} license ${admittedStanding} ` +
        `in jurisdiction ${requestedJurisdiction}`,
    );
    if (envelope.claimedSemantics.length > 0) {
      admissionReasons.push(`licensed relation semantics: ${envelope.claimedSemantics.join(',')}`);
    }
    if (refusals.length > 0) {
      admissionReasons.push(
        `standing narrowed from requested ${requestedStanding} to ${admittedStanding} by: ` +
          refusals.map((r) => r.code).join(','),
      );
    }
  }

  // --- COMPONENTS (mixed jurisdiction / component-scoped adoption) ---------
  const adoption = resolveAdoption(envelope.components, adoptionActs);
  refusals.push(...adoption.actRefusals);

  const components: ComponentEvaluation[] = envelope.components.map((component) => {
    const componentRefusals: Refusal[] = [];
    const outcome = adoption.byComponentId.get(component.componentId);
    componentRefusals.push(...(outcome?.refusals ?? []));

    const componentWarrantIds: WarrantId[] = [];
    let componentCeiling: RelationStanding = 'NONE_UNASSERTED';
    let componentLicensed: readonly RelationSemantics[] = [];

    if (component.warrantRef !== null) {
      const warrant = warrantsById.get(component.warrantRef);
      if (warrant === undefined) {
        componentRefusals.push(
          refusal('warrant_unknown', 'INV-04', `component warrant ${component.warrantRef} is not present`),
        );
      } else {
        const assessment = assessWarrant(warrant, warrantsById, component.jurisdiction);
        if (assessment.usable) {
          componentWarrantIds.push(warrant.warrantId);
          componentCeiling = assessment.standingCeiling;
          componentLicensed = assessment.licensedSemantics;
        } else {
          componentRefusals.push(...assessment.refusals);
        }
      }
    }

    // Adoption inside the adopter's jurisdiction is itself a warrant for the
    // adopted component, and only for it.
    if (outcome !== undefined && outcome.elevationPermitted) {
      componentWarrantIds.push('member_confirmation:adoption_act');
      const adoptionCeiling: RelationStanding = 'WARRANTED';
      if (exceeds(adoptionCeiling, componentCeiling)) componentCeiling = adoptionCeiling;
      componentLicensed = [...new Set([...componentLicensed, ...CLASS_MAX_SEMANTICS.MEMBER_CONFIRMATION])];
    }

    const componentUnlicensed = component.claimedSemantics.filter((s) => !componentLicensed.includes(s));
    if (componentUnlicensed.length > 0 && exceeds(requestedStanding, 'CANDIDATE_UNESTABLISHED')) {
      componentRefusals.push(
        refusal(
          'semantics_not_licensed',
          'A11A-INV-09',
          `component claims semantics no warrant licenses: ${componentUnlicensed.join(',')}`,
        ),
      );
    }

    const componentSubject = resolved.bySubject.get(subjectKey(envelope.joinId, component.componentId));
    const componentDerived: RelationStanding = componentSubject?.claimedStanding ?? 'NONE_UNASSERTED';

    let componentAdmitted: RelationStanding;
    if (blocksElevation(componentRefusals) && !onlyNarrows(componentRefusals)) {
      componentAdmitted = capStanding(componentDerived, 'CANDIDATE_UNESTABLISHED');
    } else {
      const base = componentDerived === 'NONE_UNASSERTED' ? requestedStanding : componentDerived;
      componentAdmitted = capStanding(capStanding(requestedStanding, base), componentCeiling);
    }

    return {
      componentId: component.componentId,
      kind: component.kind,
      jurisdiction: component.jurisdiction,
      requestedStanding,
      admittedStanding: componentAdmitted,
      warrantIdsReliedUpon: componentWarrantIds,
      adoptedBy: outcome?.adoptedBy ?? [],
      refusals: componentRefusals,
      lowerStandingRepresentationPermitted: true,
    };
  });

  // A refused promotion leaves the relation available at lower standing. Failure
  // to warrant is not an instruction to forget (INV-13).
  const lowerStandingRepresentationPermitted = !isTerminal(admittedStanding);
  const permittedLowerStandingOperation: EpistemicOperation | null = lowerStandingRepresentationPermitted
    ? envelope.operation === 'PROMOTE' || envelope.operation === 'WARRANTED_JOIN'
      ? 'HYPOTHESIZE'
      : envelope.operation
    : null;

  return {
    joinId: envelope.joinId,
    memberScope: envelope.memberScope,
    relationProposition: envelope.relationProposition,
    requestedStanding,
    admittedStanding,
    requestedJurisdiction,
    admittedJurisdiction,
    operation: envelope.operation,
    warrantIdsReliedUpon: usable.map((a) => a.warrantId),
    relianceValid,
    compositeWarrantRequired,
    compositeWarrantSatisfied,
    carriedBoundaries: carried,
    carriedUncertainty,
    admissionReasons,
    refusals,
    components,
    lowerStandingRepresentationPermitted,
    permittedLowerStandingOperation,
    // I2 grants no representation authority anywhere. This is a literal type,
    // not a runtime decision: there is no input for which it differs.
    downstreamRepresentationAuthorized: false,
    representationAuthority: 'closed',
  };
}
