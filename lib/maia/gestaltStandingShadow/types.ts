export type Authorship = 'member' | 'maia' | 'system' | 'practitioner' | 'house';

export type EvidenceKind =
  | 'member_statement'
  | 'member_act'
  | 'system_fact'
  | 'maia_observation'
  | 'maia_interpretation'
  | 'practitioner_observation'
  | 'house_source';

export type RelationPredicate =
  | 'REFERS_TO' | 'RESTATES' | 'EVIDENCES' | 'ORIGINATES_FROM'
  | 'INTERPRETS' | 'SUPPORTS' | 'CONTESTS' | 'CONFIRMS' | 'ADOPTS'
  | 'CORRECTS' | 'REFINES' | 'SUPERSEDES' | 'UNCERTAIN'
  | 'DEVELOPS_INTO' | 'RETURNS_TO' | 'TRANSFORMS' | 'REOPENS'
  | 'NAMES_SYMBOL' | 'EVOKES' | 'CONNECTS_TO' | 'GROUNDS' | 'ADOPTED_AS' | 'ORIENTS'
  | 'BELONGS_TO' | 'INITIATES' | 'CONTINUES' | 'CLOSES';

export type UseAs =
  | 'established'
  | 'adopted'
  | 'provisional'
  | 'unresolved'
  | 'historical_only'
  | 'question_only'
  | 'inadmissible';

export interface EvidenceObject {
  readonly id: string;
  readonly text: string;
  readonly kind: EvidenceKind;
  readonly authoredBy: Authorship;
  readonly createdAt: string;
  readonly processScope?: string;
  readonly temporalScope?: string;
}
export interface StandingRelation {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: RelationPredicate;
  readonly objectId: string;
  readonly basisIds: readonly string[];
  readonly actor: Authorship;
  readonly createdAt: string;
  readonly processScope?: string;
  readonly temporalScope?: string;
}

export interface ResolveContext {
  readonly processScope?: string;
  readonly temporalScope?: string;
  readonly asOf?: string;
}

export interface ResolvedStanding {
  readonly objectId: string;
  readonly origin: Authorship;
  readonly useAs: UseAs;
  readonly governingRelationIds: readonly string[];
  readonly counterRelationIds: readonly string[];
  readonly evidencePath: readonly string[];
  readonly explanationCodes: readonly string[];
  readonly currentScope?: string;
}

export interface RelationalField {
  readonly evidence: readonly EvidenceObject[];
  readonly relations: readonly StandingRelation[];
  readonly standing: readonly ResolvedStanding[];
  readonly processScope?: string;
  readonly asOf?: string;
}
export interface GestaltProjection {
  readonly established: readonly string[];
  readonly adopted: readonly string[];
  readonly provisional: readonly string[];
  readonly unresolved: readonly string[];
  readonly historicalOnly: readonly string[];
  readonly open: readonly string[];
  readonly relationIds: readonly string[];
  readonly evidenceIds: readonly string[];
}

export type ClaimSpeechAct = 'GROUNDED' | 'CANDIDATE' | 'QUESTION';

export interface ResponseClaim {
  readonly id: string;
  readonly text: string;
  readonly speechAct: ClaimSpeechAct;
  readonly objectRefs: readonly string[];
  readonly relationRefs: readonly string[];
  readonly presupposedObjectRefs?: readonly string[];
  readonly reopenedObjectRefs?: readonly string[];
}

export type AdmissionClass = 'grounded' | 'candidate' | 'question' | 'unadmitted';

export interface ClaimAdmission {
  readonly claimId: string;
  readonly admission: AdmissionClass;
  readonly reasonCodes: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly relationRefs: readonly string[];
}