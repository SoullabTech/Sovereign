/**
 * JARVIS-KP-01 · I2 — Pure Constitutional Epistemic Join Evaluator · closed types.
 *
 * Controlling law: NO SEMANTIC JOIN WITHOUT A WARRANT.
 *
 * Canonical operation grammar (ACT 11 §2.5, unchanged by ACT 11A §3):
 *   REFERENCE -> REPORT/MOVE -> COMPARE/JUXTAPOSE -> HYPOTHESIZE
 *     -> WARRANTED JOIN -> PROMOTE/DISCHARGE
 *
 * These vocabularies are CLOSED on purpose. A join whose authorship, jurisdiction,
 * warrant class, composition method, or relation semantics cannot be named inside
 * this file is not thereby admissible by default: it is unnameable, and an
 * unnameable relation fails closed for standing elevation (I1 §10).
 *
 * This module is constitutional computation only. It holds no persistence,
 * projection, prompt, memory, graph, or representation authority. The seams named
 * in I1 §2.1 as later work — a persistence adapter and a read-model projection —
 * are deliberately ABSENT from this candidate rather than present and disabled.
 */

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export type JoinId = string;
export type ComponentId = string;
export type WarrantId = string;
export type EndpointId = string;
export type ActId = string;
export type MemberScope = string;

// ---------------------------------------------------------------------------
// Standing (ACT 11 §3 · I1 §3.5)
// ---------------------------------------------------------------------------

/**
 * The closed standing vocabulary. NONE..PROMOTED form an elevation ladder;
 * DISCHARGED and SUPERSEDED are terminal dispositions for the proposition as
 * asserted, never rungs above PROMOTED.
 */
export type RelationStanding =
  | 'NONE_UNASSERTED'
  | 'CANDIDATE_UNESTABLISHED'
  | 'PROVISIONAL'
  | 'WARRANTED'
  | 'PROMOTED'
  | 'DISCHARGED'
  | 'SUPERSEDED';

/** Rank on the elevation ladder. Terminal dispositions have no rank. */
export const ELEVATION_LADDER: readonly RelationStanding[] = [
  'NONE_UNASSERTED',
  'CANDIDATE_UNESTABLISHED',
  'PROVISIONAL',
  'WARRANTED',
  'PROMOTED',
] as const;

export const TERMINAL_STANDINGS: readonly RelationStanding[] = ['DISCHARGED', 'SUPERSEDED'] as const;

// ---------------------------------------------------------------------------
// Operation stage (ACT 11 §2.5)
// ---------------------------------------------------------------------------

export type EpistemicOperation =
  | 'REFERENCE'
  | 'REPORT_MOVE'
  | 'COMPARE_JUXTAPOSE'
  | 'HYPOTHESIZE'
  | 'WARRANTED_JOIN'
  | 'PROMOTE'
  | 'DISCHARGE';

// ---------------------------------------------------------------------------
// Authorship (ACT 11 §2.3)
// ---------------------------------------------------------------------------

export type JoinAuthorClass =
  | 'SOURCE_AUTHORED'
  | 'MEMBER_AUTHORED'
  | 'MEMBER_CONFIRMED'
  | 'PRACTITIONER_AUTHORED'
  | 'JARVIS_AUTHORED'
  | 'MAIA_PROPOSED'
  | 'OTHER_DECLARED_AUTHORITY';

/** Authorities that may hold an epistemic role. The same human may occupy several. */
export type AuthorityRole = 'member' | 'practitioner' | 'maia' | 'jarvis' | 'source' | 'other_declared';

export interface Authorship {
  readonly authorClass: JoinAuthorClass;
  /** The role actually exercised for THIS act, not every role the actor could hold. */
  readonly roleExercised: AuthorityRole;
  /** Stable identity of the author within its role. */
  readonly authorRef: string;
}

// ---------------------------------------------------------------------------
// Jurisdiction (ACT 11 §7)
// ---------------------------------------------------------------------------

export type Jurisdiction =
  | 'member_lived_account'
  | 'member_personal_meaning'
  | 'practitioner_interpretation'
  | 'scientific_evidence'
  | 'named_philosophical_system'
  | 'product_design_analysis'
  | 'jarvis_research_analysis'
  | 'maia_conversational_inquiry'
  | 'historical_record'
  | 'metaphysical'
  | 'clinical_diagnostic';

// ---------------------------------------------------------------------------
// Relation semantics — the epistemic force actually claimed (ACT 11 §2.2, §4)
// ---------------------------------------------------------------------------

export type RelationSemantics =
  | 'co_presence'
  | 'comparison'
  | 'association'
  | 'correlation'
  | 'conflict'
  | 'explanatory_fit'
  | 'symbolic_correspondence'
  | 'temporal_sequence'
  | 'causation'
  | 'direction'
  | 'equivalence'
  | 'identity'
  | 'permanence'
  | 'psychological_meaning'
  | 'universality'
  | 'outcome';

// ---------------------------------------------------------------------------
// Reference vs reliance (ACT 11 §12 · INV-10)
// ---------------------------------------------------------------------------

/**
 * REFERENCE: material is named, displayed, cited, or used illustratively.
 * RELIANCE: a downstream proposition materially depends upon it.
 *
 * The distinction is declared, never inferred from the fact of mention.
 */
export type DependenceMode = 'reference' | 'reliance';

export interface OperativeBoundary {
  readonly boundaryId: string;
  readonly statement: string;
  /** True while the boundary has not been discharged by genuinely new evidence. */
  readonly live: boolean;
}

export interface Uncertainty {
  readonly statement: string;
  /**
   * Material conditions that block stronger standing (ACT 11 §6). Non-empty here
   * caps standing at PROVISIONAL; it never disappears into synthesis.
   */
  readonly blocksStrongerStanding: boolean;
}

// ---------------------------------------------------------------------------
// Endpoints (ACT 11 §2.1 · INV-01)
// ---------------------------------------------------------------------------

export interface Endpoint {
  readonly endpointId: EndpointId;
  readonly proposition: string;
  readonly authorship: Authorship;
  readonly provenanceRef: string;
  readonly standing: RelationStanding;
  readonly jurisdiction: Jurisdiction;
  readonly boundaries: readonly OperativeBoundary[];
  /** Whether the proposed relation RELIES on this endpoint or merely REFERENCES it. */
  readonly mode: DependenceMode;
}

// ---------------------------------------------------------------------------
// Semantic components (ACT 11A §2.4 · A11A-INV-08)
// ---------------------------------------------------------------------------

/**
 * The epistemic kind of a semantic component. This is what decides whether an
 * adopter's jurisdiction reaches the component — never the sentence it sits in.
 */
export type ComponentKind =
  | 'member_experience'
  | 'member_meaning'
  | 'member_value'
  | 'member_preference'
  | 'member_intention'
  | 'member_interpretation'
  | 'practitioner_interpretation'
  | 'external_motive'
  | 'external_intention'
  | 'external_causal_mechanism'
  | 'diagnostic'
  | 'scientific'
  | 'historical'
  | 'metaphysical'
  | 'universal_law';

/**
 * Component kinds inside a member's own epistemic jurisdiction (ACT 11A §2.2).
 * Closed by law: adoption may elevate these and nothing else.
 */
export const MEMBER_AUTHORITATIVE_KINDS: readonly ComponentKind[] = [
  'member_experience',
  'member_meaning',
  'member_value',
  'member_preference',
  'member_intention',
  'member_interpretation',
] as const;

export interface SemanticComponent {
  readonly componentId: ComponentId;
  readonly proposition: string;
  readonly kind: ComponentKind;
  readonly authorship: Authorship;
  readonly jurisdiction: Jurisdiction;
  /** The relation force this component itself asserts. */
  readonly claimedSemantics: readonly RelationSemantics[];
  /** Warrant relied upon for THIS component, where one is offered. */
  readonly warrantRef: WarrantId | null;
}

// ---------------------------------------------------------------------------
// Warrants (ACT 11 §4 · ACT 11A §1.2)
// ---------------------------------------------------------------------------

export type WarrantClass =
  | 'DIRECT_SOURCE_RELATION'
  | 'MEMBER_AUTHORED_RELATION'
  | 'MEMBER_CONFIRMATION'
  | 'PRACTITIONER_INTERPRETATION'
  | 'EMPIRICAL_RELATION_EVIDENCE'
  | 'FORMAL_ENTAILMENT'
  | 'THEORETICAL_ARGUMENT'
  | 'BOUNDARY_DISCHARGE_EVIDENCE'
  | 'OTHER_DECLARED_WARRANT';

export type WarrantLiveness = 'live' | 'disputed' | 'weakened' | 'defeated';

/**
 * How a support set is combined into a composite inference (ACT 11A §1.2).
 *
 * The last four are named so they can be REFUSED. Mere accumulation is not a
 * warrant: agreement, count, prestige, and restatement are not methods.
 */
export type CompositionMethod =
  | 'declared_formal_entailment'
  | 'convergent_independent_measurement'
  | 'explanatory_coherence'
  | 'mere_agreement'
  | 'source_count'
  | 'source_prestige'
  | 'restatement';

export const NON_METHODS: readonly CompositionMethod[] = [
  'mere_agreement',
  'source_count',
  'source_prestige',
  'restatement',
] as const;

/**
 * One relied-upon element of a composite support set. `sharedOriginRef` is how
 * pseudo-independence becomes inspectable: two entries carrying the same origin
 * are not independent, whatever the composition method claims.
 */
export interface SupportEntry {
  readonly supportId: string;
  readonly proposition: string;
  readonly provenanceRef: string;
  readonly mode: DependenceMode;
  readonly authorship: Authorship;
  readonly jurisdiction: Jurisdiction;
  readonly boundaries: readonly OperativeBoundary[];
  /** Shared upstream origin, where one exists. Null asserts nothing; it declares nothing known. */
  readonly sharedOriginRef: string | null;
  /** A nested composite warrant this entry stands on, if any. */
  readonly nestedWarrantRef: WarrantId | null;
}

export interface DependenceAssumptions {
  /** Explicitly claimed independence among support entries. */
  readonly claimedIndependent: boolean;
  /** Declared, resolved account of shared origin / redundancy / correlation. */
  readonly resolved: boolean;
  readonly statement: string;
}

/**
 * A warrant is evidence whose OWN standing licenses the relation being asserted.
 * A composite warrant is a separately authored inference over a support set; it
 * is never identical to that support set (A11A-INV-01).
 */
export interface Warrant {
  readonly warrantId: WarrantId;
  readonly warrantClass: WarrantClass;
  /** The relation or inferential claim this warrant supports. */
  readonly proposition: string;
  readonly authorship: Authorship;
  readonly provenanceRef: string;
  readonly jurisdiction: Jurisdiction;
  /** Cross-jurisdiction transfer must be declared, never inferred (ACT 11 §7). */
  readonly licensesTransferInto: readonly Jurisdiction[];
  readonly licensedRelationSemantics: readonly RelationSemantics[];
  readonly uncertainty: Uncertainty | null;
  readonly boundaries: readonly OperativeBoundary[];
  readonly liveness: WarrantLiveness;
  /** Highest standing this warrant can license, whatever an act requests. */
  readonly standingCeiling: RelationStanding;
  /** Present only for composite inference. A bare support set is not a composite. */
  readonly composite: {
    readonly supportSet: readonly SupportEntry[];
    readonly compositionMethod: CompositionMethod;
    readonly dependenceAssumptions: DependenceAssumptions;
  } | null;
}

// ---------------------------------------------------------------------------
// Append-only acts (I1 §1.5, §3.5 · standing is DERIVED, never assigned)
// ---------------------------------------------------------------------------

export type StandingActBasis =
  | 'initial_proposal'
  | 'warrant_admission'
  | 'new_evidence'
  | 'adoption'
  | 'conflict_emerged'
  | 'warrant_defeated'
  | 'superseded_by_later_proposition'
  | 'authority_withdrawal';

/**
 * An append-only assertion that a standing was claimed for a join (or one of its
 * components) on a stated basis. The act is a request, not an authority: the
 * evaluator caps it by what the warrants license.
 */
export interface StandingAct {
  readonly actId: ActId;
  readonly joinId: JoinId;
  /** Null scopes the act to the whole join. */
  readonly componentId: ComponentId | null;
  readonly claimedStanding: RelationStanding;
  readonly basis: StandingActBasis;
  readonly warrantRef: WarrantId | null;
  readonly authorship: Authorship;
  readonly jurisdiction: Jurisdiction;
  /** Null marks the root act for this subject. One root per subject. */
  readonly supersedesActId: ActId | null;
}

/**
 * An adoption act names the EXACT components adopted. Whole-sentence
 * confirmation cannot promote every component it contains (ACT 11A §2.4).
 */
export interface AdoptionAct {
  readonly actId: ActId;
  readonly joinId: JoinId;
  readonly adoptedComponentIds: readonly ComponentId[];
  readonly adopter: Authorship;
  readonly adopterJurisdiction: Jurisdiction;
  /** The proposition as put to the adopter, preserved for provenance (A11A-INV-10). */
  readonly propositionAsPut: string;
  /** Who originally proposed it. Never rewritten by adoption. */
  readonly originalProposer: Authorship;
}

// ---------------------------------------------------------------------------
// The join envelope (ACT 11 §2 · I1 §3)
// ---------------------------------------------------------------------------

export interface JoinProvenance {
  /** Who or what introduced the RELATION — not where the endpoints came from. */
  readonly introducedBy: Authorship;
  readonly inquiryContext: string;
  /** Endpoint/support material actually relied upon for the relation. */
  readonly reliedUponRefs: readonly string[];
  /** Material merely referenced. Kept separate by law (INV-10). */
  readonly referenceOnlyRefs: readonly string[];
  readonly transformationStep: string;
}

export interface JoinEnvelope {
  readonly joinId: JoinId;
  readonly memberScope: MemberScope;
  readonly endpoints: readonly Endpoint[];
  /** The relation stated explicitly enough to inspect. Hidden verbs are still claims. */
  readonly relationProposition: string;
  readonly relationPredicate: string;
  readonly directional: boolean;
  readonly claimedSemantics: readonly RelationSemantics[];
  readonly operation: EpistemicOperation;
  readonly authorship: Authorship;
  readonly provenance: JoinProvenance;
  readonly jurisdiction: Jurisdiction;
  /** Warrants offered for the relation itself. An empty set is a lawful input. */
  readonly offeredWarrantRefs: readonly WarrantId[];
  readonly components: readonly SemanticComponent[];
  readonly boundaries: readonly OperativeBoundary[];
  readonly uncertainty: Uncertainty | null;
}

// ---------------------------------------------------------------------------
// Evaluator input / output
// ---------------------------------------------------------------------------

export interface EvaluationRequest {
  readonly envelope: JoinEnvelope;
  readonly warrants: readonly Warrant[];
  readonly standingActs: readonly StandingAct[];
  readonly adoptionActs: readonly AdoptionAct[];
  /** The standing whose admissibility is being asked about. */
  readonly requestedStanding: RelationStanding;
  /** The jurisdiction in which that standing is requested. */
  readonly requestedJurisdiction: Jurisdiction;
}

/** Closed refusal / limitation vocabulary. Every refusal names its exact law. */
export type RefusalCode =
  | 'no_warrant_offered'
  | 'join_provenance_incomplete'
  | 'warrant_unknown'
  | 'warrant_not_live'
  | 'reference_offered_as_reliance'
  | 'reliance_not_declared'
  | 'support_set_offered_as_composite_warrant'
  | 'composite_method_is_mere_accumulation'
  | 'composite_missing_dependence_resolution'
  | 'composite_pseudo_independence'
  | 'composite_circular_support'
  | 'composite_nested_standing_ceiling'
  | 'composite_method_does_not_license_semantics'
  | 'jurisdiction_mismatch'
  | 'cross_jurisdiction_transfer_undeclared'
  | 'semantics_not_licensed'
  | 'boundary_loss'
  | 'uncertainty_blocks_elevation'
  | 'standing_exceeds_warrant_ceiling'
  | 'endpoint_evidence_offered_as_relation_evidence'
  | 'authorship_composition_attempted'
  | 'adoption_outside_adopter_jurisdiction'
  | 'adoption_component_unknown'
  | 'adoption_provenance_lost'
  | 'operation_stage_below_requested_standing'
  | 'terminal_standing_not_re_elevable'
  | 'member_scope_violation';

export interface Refusal {
  readonly code: RefusalCode;
  /** The law under pressure, cited by invariant id. */
  readonly invariant: string;
  readonly detail: string;
}

export interface ComponentEvaluation {
  readonly componentId: ComponentId;
  readonly kind: ComponentKind;
  readonly jurisdiction: Jurisdiction;
  readonly requestedStanding: RelationStanding;
  readonly admittedStanding: RelationStanding;
  readonly warrantIdsReliedUpon: readonly WarrantId[];
  readonly adoptedBy: readonly AuthorityRole[];
  readonly refusals: readonly Refusal[];
  readonly lowerStandingRepresentationPermitted: boolean;
}

export interface JoinEvaluation {
  readonly joinId: JoinId;
  readonly memberScope: MemberScope;
  readonly relationProposition: string;
  readonly requestedStanding: RelationStanding;
  /** The standing actually earned. Never above the warrant ceiling. */
  readonly admittedStanding: RelationStanding;
  readonly requestedJurisdiction: Jurisdiction;
  readonly admittedJurisdiction: Jurisdiction | null;
  readonly operation: EpistemicOperation;
  readonly warrantIdsReliedUpon: readonly WarrantId[];
  /** Whether every declared reliance was actually declared as reliance. */
  readonly relianceValid: boolean;
  readonly compositeWarrantRequired: boolean;
  readonly compositeWarrantSatisfied: boolean;
  readonly carriedBoundaries: readonly OperativeBoundary[];
  readonly carriedUncertainty: readonly Uncertainty[];
  readonly admissionReasons: readonly string[];
  readonly refusals: readonly Refusal[];
  readonly components: readonly ComponentEvaluation[];
  /** A refused promotion never erases meaning (INV-13). */
  readonly lowerStandingRepresentationPermitted: boolean;
  readonly permittedLowerStandingOperation: EpistemicOperation | null;
  /**
   * Structurally false in I2. Representation authority is closed: admission is
   * not representation, and no downstream surface is authorized by this result.
   */
  readonly downstreamRepresentationAuthorized: false;
  readonly representationAuthority: 'closed';
}

/**
 * Structural malformation — the input is not a well-formed epistemic object.
 *
 * Distinct from a refusal: a refusal is a lawful verdict on a well-formed
 * object that did not earn standing. This is raised only when the input cannot
 * be evaluated at all without the evaluator inventing something (an unknown
 * reference, a duplicate act id, a branched standing chain).
 */
export class EpistemicJoinMalformed extends Error {
  readonly reason: string;
  readonly where: string;

  constructor(reason: string, where: string) {
    super(`epistemic join input malformed: ${reason} (${where})`);
    this.name = 'EpistemicJoinMalformed';
    this.reason = reason;
    this.where = where;
  }
}
