/**
 * JARVIS-KP-01 / I2
 * Closed constitutional types for the pure epistemic-join evaluator.
 *
 * This module carries no persistence, projection, routing, provider, memory,
 * graph, clock, randomness, filesystem, or network authority.
 */

export type EpistemicStanding =
  | 'NONE'
  | 'CANDIDATE'
  | 'PROVISIONAL'
  | 'WARRANTED'
  | 'PROMOTED'
  | 'DISCHARGED'
  | 'SUPERSEDED';

export type RequestedStanding =
  | 'CANDIDATE'
  | 'PROVISIONAL'
  | 'WARRANTED'
  | 'PROMOTED';

export type AuthorityRole =
  | 'MEMBER'
  | 'PRACTITIONER'
  | 'MAIA'
  | 'JARVIS'
  | 'RESEARCHER'
  | 'EXTERNAL_SOURCE';

export type EpistemicJurisdiction =
  | 'MEMBER_LIVED_EXPERIENCE'
  | 'MEMBER_PERSONAL_MEANING'
  | 'PRACTITIONER_INTERPRETATION'
  | 'EMPIRICAL_EXTERNAL'
  | 'CAUSAL_INFERENCE'
  | 'CLINICAL_DIAGNOSTIC'
  | 'SCIENTIFIC'
  | 'HISTORICAL'
  | 'METAPHYSICAL'
  | 'UNIVERSAL';

export type RelationSemantic =
  | 'PERSONAL_EXPERIENCE'
  | 'PERSONAL_MEANING'
  | 'PERSONAL_VALUE'
  | 'PERSONAL_PREFERENCE'
  | 'PERSONAL_INTENTION'
  | 'EXTERNAL_FACT'
  | 'CAUSAL'
  | 'MOTIVE'
  | 'DIAGNOSTIC'
  | 'SCIENTIFIC'
  | 'HISTORICAL'
  | 'METAPHYSICAL'
  | 'UNIVERSAL'
  | 'PRACTITIONER_INTERPRETATION'
  | 'RELATIONAL_PATTERN';

export type WarrantClass =
  | 'MEMBER_AUTHORITY'
  | 'PRACTITIONER_INTERPRETATION'
  | 'DIRECT_EVIDENCE'
  | 'CAUSAL_EVIDENCE'
  | 'MOTIVE_EVIDENCE'
  | 'DIAGNOSTIC_EVIDENCE'
  | 'SCIENTIFIC_EVIDENCE'
  | 'HISTORICAL_EVIDENCE'
  | 'METAPHYSICAL_ARGUMENT'
  | 'UNIVERSAL_ARGUMENT'
  | 'COMPOSITE_INFERENCE';

export type InferenceKind = 'DIRECT' | 'COMPOSITE';

export interface EpistemicAuthor {
  readonly id: string;
  readonly role: AuthorityRole;
}

export interface EpistemicWarrant {
  readonly id: string;
  readonly warrantClass: WarrantClass;
  readonly proposition: string;
  readonly author: EpistemicAuthor;
  readonly supportRefs: readonly string[];
  readonly reliedUponRefs: readonly string[];
  readonly referenceRefs: readonly string[];
  readonly method: string | null;
  readonly dependenceAssumptions: readonly string[];
  readonly jurisdictions: readonly EpistemicJurisdiction[];
  readonly uncertainty: string;
  readonly boundaries: readonly string[];
  readonly invalidityConditions: readonly string[];
  readonly licensedRelationSemantics: readonly RelationSemantic[];
  readonly standingCeiling: RequestedStanding;
}

export interface SemanticComponent {
  readonly id: string;
  readonly proposition: string;
  readonly semantic: RelationSemantic;
  readonly jurisdiction: EpistemicJurisdiction;
  readonly inferenceKind: InferenceKind;
  /**
   * Sources merely present for context. They do not count as support.
   */
  readonly referenceRefs: readonly string[];
  /**
   * Sources explicitly used as epistemic support.
   */
  readonly relianceRefs: readonly string[];
  /**
   * Warrant objects explicitly relied upon. Available-but-unselected warrants
   * never silently become authority.
   */
  readonly warrantIdsReliedUpon: readonly string[];
}

export interface EpistemicJoinProposal {
  readonly relationId: string;
  readonly proposition: string;
  readonly predicate: string;
  readonly directionality: 'DIRECTED' | 'UNDIRECTED' | 'MIXED';
  readonly components: readonly SemanticComponent[];
  /**
   * Prospective target only. This field is not current-standing authority.
   */
  readonly requestedStanding: RequestedStanding;
}

export interface StandingAct {
  readonly id: string;
  /**
   * Explicit logical succession. No wall clock is consulted.
   */
  readonly ordinal: number;
  readonly standing: EpistemicStanding;
  readonly warrantIds: readonly string[];
}

export interface AdoptionAct {
  readonly id: string;
  readonly ordinal: number;
  /**
   * Exact component scope. Whole-sentence adoption is not inferred.
   */
  readonly componentIds: readonly string[];
  readonly memberWarrantId: string;
}

export interface EvaluateEpistemicJoinInput {
  readonly proposal: EpistemicJoinProposal;
  readonly warrants: readonly EpistemicWarrant[];
  readonly standingActs: readonly StandingAct[];
  readonly adoptionActs: readonly AdoptionAct[];
}

export type EvaluationReason =
  | 'NO_COMPONENTS'
  | 'NO_WARRANT'
  | 'WARRANT_NOT_FOUND'
  | 'WARRANT_STRUCTURE_INVALID'
  | 'WARRANT_AUTHORITY_INVALID'
  | 'WARRANT_BOUNDARY_INCOMPLETE'
  | 'JURISDICTION_MISMATCH'
  | 'RELATION_SEMANTIC_UNLICENSED'
  | 'WARRANT_CLASS_SCOPE_VIOLATION'
  | 'CAUSAL_WARRANT_REQUIRED'
  | 'MOTIVE_WARRANT_REQUIRED'
  | 'DIAGNOSTIC_WARRANT_REQUIRED'
  | 'SCIENTIFIC_WARRANT_REQUIRED'
  | 'HISTORICAL_WARRANT_REQUIRED'
  | 'MEMBER_AUTHORITY_SCOPE_VIOLATION'
  | 'MEMBER_ADOPTION_REQUIRED'
  | 'ADOPTION_UNKNOWN_COMPONENT'
  | 'REFERENCE_ONLY_SUPPORT'
  | 'RELIANCE_NOT_DECLARED'
  | 'RELIANCE_NOT_SUPPORTED'
  | 'COMPOSITE_WARRANT_REQUIRED'
  | 'COMPOSITE_WARRANT_INVALID'
  | 'STANDING_CEILING_INSUFFICIENT'
  | 'STANDING_HISTORY_AMBIGUOUS'
  | 'STANDING_HISTORY_AFTER_TERMINAL'
  | 'TERMINAL_STANDING';

export type CompositeWarrantStatus = 'NOT_REQUIRED' | 'VALID' | 'INVALID';

export interface ComponentEvaluationResult {
  readonly componentId: string;
  readonly jurisdiction: EpistemicJurisdiction;
  readonly semantic: RelationSemantic;
  readonly requestedStanding: RequestedStanding;
  readonly warrantIdsReliedUpon: readonly string[];
  readonly validWarrantIds: readonly string[];
  readonly relianceValid: boolean;
  readonly compositeWarrantStatus: CompositeWarrantStatus;
  readonly memberAdoptionValid: boolean;
  readonly maximumLicensedStanding: RequestedStanding | null;
  readonly uncertainty: readonly string[];
  readonly boundaries: readonly string[];
  readonly reasons: readonly EvaluationReason[];
  readonly requestedStandingAdmissible: boolean;
}

export interface DerivedStandingResult {
  readonly standing: EpistemicStanding;
  readonly valid: boolean;
  readonly reasons: readonly EvaluationReason[];
}

export interface EpistemicJoinEvaluation {
  readonly relationId: string;
  readonly requestedStanding: RequestedStanding;
  readonly derivedCurrentStanding: EpistemicStanding;
  readonly admitted: boolean;
  readonly admittedStanding: RequestedStanding | null;
  readonly jurisdictions: readonly EpistemicJurisdiction[];
  readonly warrantIdsReliedUpon: readonly string[];
  readonly relianceValid: boolean;
  readonly compositeWarrantStatus: CompositeWarrantStatus;
  readonly uncertainty: readonly string[];
  readonly boundaries: readonly string[];
  readonly reasons: readonly EvaluationReason[];
  readonly hypothesisRepresentationPermissible: boolean;
  /**
   * Constitutional constant for I2. Admission is not representation.
   */
  readonly downstreamRepresentationAuthorized: false;
  readonly componentResults: readonly ComponentEvaluationResult[];
}
