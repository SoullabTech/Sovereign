/**
 * MAIA-TEACHING-APPLICATIONS-01 / A2 — pure constitutional application contract.
 *
 * Test-only. No I/O, retrieval, model/provider calls, persistence, mutation,
 * routing, UI, deployment, or production effect.
 */
import { TEACHING_ACTS, type TeachingAct } from '../../../lib/maia/teaching/TeachingActContract';
import {
  CORE_TEACHING_DOMAIN_REGISTRY,
} from '../../../lib/maia/teaching/TeachingCompositionContract';
import {
  resolveTeachingPlatformBinding,
  type TeachingSurface,
  type TeachingSurfaceRoute,
} from '../../../lib/maia/teaching/TeachingPlatformBindingContract';

export const SURFACE_AUTHORITY_BASES = [
  'SERVER_ADJUDICATED_CURRENT_TURN',
  'SERVER_BOUND_HOST_ROUTE_CURRENT_INTERACTION',
] as const;
export type SurfaceAuthorityBasis = (typeof SURFACE_AUTHORITY_BASES)[number];

export type SourcePlane =
  | 'INHERITED_SHARED_ROUTE'
  | 'NO_GOVERNED_SOURCE_WIRING';

export type RetrievalAuthority =
  | 'INHERITED_ONLY_NO_NEW_ACQUISITION'
  | 'NO_NEW_ACQUISITION';

export type DownstreamHandoff =
  | 'NONE'
  | 'NONE_TERMINAL_EDUCATION'
  | 'EXISTING_WRITERS_EDITORIAL_CHAIN_REFERENCE_ONLY';

export type AuthorityOwner =
  | 'member'
  | 'writer'
  | 'practitioner'
  | 'researcher'
  | 'none';

export interface StructuralAuthorityEvidence {
  readonly serverEstablishedMember: true;
  readonly serverEstablishedHostObject: true;
  readonly canonicalFixedTuple: true;
  readonly clientSelectable: false;
  readonly elevatedProfessionalOrResearchRole: false;
  readonly expiresWithHostInteraction: true;
}

export interface TeachingApplicationProfile {
  readonly applicationId: string;
  readonly teacherIdentity: 'MAIA_SHARED_TEACHER';
  readonly hostSurface: TeachingSurface;
  readonly hostRoute: TeachingSurfaceRoute;
  readonly context: string;
  readonly audience: string;
  readonly teachingPurpose: string;
  readonly boundedWorkObject: string;
  readonly allowedTeachingActs: readonly TeachingAct[];
  readonly surfaceAuthorityBasis: SurfaceAuthorityBasis;
  readonly surfaceAuthorityStanding: 'CURRENT_INTERACTION_ONLY';
  readonly structuralAuthorityEvidence: StructuralAuthorityEvidence | null;
  readonly sourcePlane: SourcePlane;
  readonly allowedSourceClasses: readonly string[];
  readonly retrievalAuthority: RetrievalAuthority;
  readonly learnerAuthorityOwner: AuthorityOwner;
  readonly artifactAuthorshipOwner: AuthorityOwner;
  readonly professionalJudgmentOwner: AuthorityOwner;
  readonly scientificJudgmentOwner: AuthorityOwner;
  readonly mutationAuthority: 'NONE';
  readonly providerRoutingAuthority: 'NONE';
  readonly learnerPersistenceAuthority: 'NONE';
  readonly scientificExecutionAuthority: 'NONE';
  readonly downstreamHandoff: DownstreamHandoff;
  readonly handoffAuthorityOwner: AuthorityOwner;
  readonly domainKeys: readonly string[];
  readonly domainAuthorityScope: 'SURFACE_SCOPED_NO_UNION';
}

type SurfaceTuple = {
  route: TeachingSurfaceRoute;
  context: string;
  audience: string;
};

export const SURFACE_TUPLES: Readonly<Record<TeachingSurface, SurfaceTuple>> = {
  general_maia: {
    route: 'sovereign_maia_list',
    context: 'general_maia',
    audience: 'member',
  },
  writers_studio: {
    route: 'writers_studio_editorial',
    context: 'writers_studio',
    audience: 'writer',
  },
  coaching_practice: {
    route: 'sovereign_maia_list',
    context: 'coaching_practice',
    audience: 'coach',
  },
  therapist_practitioner: {
    route: 'sovereign_maia_list',
    context: 'therapist_practitioner',
    audience: 'therapist_practitioner',
  },
  research_lab: {
    route: 'sovereign_maia_list',
    context: 'research_lab',
    audience: 'researcher',
  },
};

export function canonicalDomainKeys(surface: TeachingSurface): readonly string[] {
  const tuple = SURFACE_TUPLES[surface];
  return Object.keys(CORE_TEACHING_DOMAIN_REGISTRY).filter((domainKey) => {
    try {
      resolveTeachingPlatformBinding({
        surface,
        route: tuple.route,
        context: tuple.context as any,
        audience: tuple.audience as any,
        domainKey,
      });
      return true;
    } catch {
      return false;
    }
  });
}

export function canonicalSourceClasses(surface: TeachingSurface): readonly string[] {
  const tuple = SURFACE_TUPLES[surface];
  const domainKey = canonicalDomainKeys(surface)[0];
  if (!domainKey) throw new Error(`no canonical domain for ${surface}`);
  return resolveTeachingPlatformBinding({
    surface,
    route: tuple.route,
    context: tuple.context as any,
    audience: tuple.audience as any,
    domainKey,
  }).allowedSourceClasses;
}

const STRUCTURAL_WRITER_AUTHORITY: StructuralAuthorityEvidence = Object.freeze({
  serverEstablishedMember: true,
  serverEstablishedHostObject: true,
  canonicalFixedTuple: true,
  clientSelectable: false,
  elevatedProfessionalOrResearchRole: false,
  expiresWithHostInteraction: true,
});

function profile(
  surface: TeachingSurface,
  overrides: Partial<TeachingApplicationProfile>,
): TeachingApplicationProfile {
  const tuple = SURFACE_TUPLES[surface];
  return Object.freeze({
    applicationId: `maia-teaching-${surface}`,
    teacherIdentity: 'MAIA_SHARED_TEACHER',
    hostSurface: surface,
    hostRoute: tuple.route,
    context: tuple.context,
    audience: tuple.audience,
    teachingPurpose: 'bounded teaching',
    boundedWorkObject: 'current interaction',
    allowedTeachingActs: Object.freeze([...TEACHING_ACTS]),
    surfaceAuthorityBasis: 'SERVER_ADJUDICATED_CURRENT_TURN',
    surfaceAuthorityStanding: 'CURRENT_INTERACTION_ONLY',
    structuralAuthorityEvidence: null,
    sourcePlane: 'INHERITED_SHARED_ROUTE',
    allowedSourceClasses: Object.freeze([...canonicalSourceClasses(surface)]),
    retrievalAuthority: 'INHERITED_ONLY_NO_NEW_ACQUISITION',
    learnerAuthorityOwner: 'member',
    artifactAuthorshipOwner: 'member',
    professionalJudgmentOwner: 'none',
    scientificJudgmentOwner: 'none',
    mutationAuthority: 'NONE',
    providerRoutingAuthority: 'NONE',
    learnerPersistenceAuthority: 'NONE',
    scientificExecutionAuthority: 'NONE',
    downstreamHandoff: 'NONE',
    handoffAuthorityOwner: 'none',
    domainKeys: Object.freeze([...canonicalDomainKeys(surface)]),
    domainAuthorityScope: 'SURFACE_SCOPED_NO_UNION',
    ...overrides,
  });
}

export const APPLICATION_PROFILES: Readonly<Record<TeachingSurface, TeachingApplicationProfile>> =
  Object.freeze({
    general_maia: profile('general_maia', {}),
    writers_studio: profile('writers_studio', {
      teachingPurpose: 'teach writing craft in relation to the writer-owned manuscript',
      boundedWorkObject: 'current member-bound editorial interaction',
      surfaceAuthorityBasis: 'SERVER_BOUND_HOST_ROUTE_CURRENT_INTERACTION',
      structuralAuthorityEvidence: STRUCTURAL_WRITER_AUTHORITY,
      sourcePlane: 'NO_GOVERNED_SOURCE_WIRING',
      retrievalAuthority: 'NO_NEW_ACQUISITION',
      learnerAuthorityOwner: 'writer',
      artifactAuthorshipOwner: 'writer',
      downstreamHandoff: 'EXISTING_WRITERS_EDITORIAL_CHAIN_REFERENCE_ONLY',
      handoffAuthorityOwner: 'writer',
    }),
    coaching_practice: profile('coaching_practice', {
      teachingPurpose: 'educational coaching-practice learning',
      learnerAuthorityOwner: 'practitioner',
      artifactAuthorshipOwner: 'practitioner',
      professionalJudgmentOwner: 'practitioner',
      downstreamHandoff: 'NONE_TERMINAL_EDUCATION',
      handoffAuthorityOwner: 'practitioner',
    }),
    therapist_practitioner: profile('therapist_practitioner', {
      teachingPurpose: 'educational practitioner learning without case authority',
      learnerAuthorityOwner: 'practitioner',
      artifactAuthorshipOwner: 'practitioner',
      professionalJudgmentOwner: 'practitioner',
      downstreamHandoff: 'NONE_TERMINAL_EDUCATION',
      handoffAuthorityOwner: 'practitioner',
    }),
    research_lab: profile('research_lab', {
      teachingPurpose: 'research-informed teaching without research execution',
      learnerAuthorityOwner: 'researcher',
      artifactAuthorshipOwner: 'researcher',
      scientificJudgmentOwner: 'researcher',
    }),
  });

export type ContractError = {
  readonly code: string;
  readonly detail: string;
};

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value) => b.includes(value));
}

export function validateApplicationProfile(
  p: TeachingApplicationProfile,
): readonly ContractError[] {
  const errors: ContractError[] = [];
  const tuple = SURFACE_TUPLES[p.hostSurface];

  if (p.teacherIdentity !== 'MAIA_SHARED_TEACHER') {
    errors.push({ code: 'PARALLEL_TEACHER', detail: 'application must use MAIA_SHARED_TEACHER' });
  }
  if (p.hostRoute !== tuple.route || p.context !== tuple.context || p.audience !== tuple.audience) {
    errors.push({ code: 'SURFACE_TUPLE_DRIFT', detail: 'surface/route/context/audience tuple drifted' });
  }
  if (!sameSet(p.allowedTeachingActs, TEACHING_ACTS)) {
    errors.push({ code: 'TEACHING_GRAMMAR_DRIFT', detail: 'application teaching grammar differs from T1' });
  }
  if (!sameSet(p.domainKeys, canonicalDomainKeys(p.hostSurface))) {
    errors.push({ code: 'DOMAIN_SCOPE_DRIFT', detail: 'domain set differs from canonical T7 surface law' });
  }
  if (!sameSet(p.allowedSourceClasses, canonicalSourceClasses(p.hostSurface))) {
    errors.push({ code: 'SOURCE_CLASS_DRIFT', detail: 'source classes differ from canonical T7 surface law' });
  }
  if (p.mutationAuthority !== 'NONE'
      || p.providerRoutingAuthority !== 'NONE'
      || p.learnerPersistenceAuthority !== 'NONE'
      || p.scientificExecutionAuthority !== 'NONE') {
    errors.push({ code: 'AUTHORITY_WIDENING', detail: 'A2 default authority was widened' });
  }
  if (p.domainAuthorityScope !== 'SURFACE_SCOPED_NO_UNION') {
    errors.push({ code: 'DOMAIN_AUTHORITY_UNION', detail: 'domain authority must remain surface-scoped' });
  }

  if (p.hostSurface === 'writers_studio') {
    if (p.surfaceAuthorityBasis !== 'SERVER_BOUND_HOST_ROUTE_CURRENT_INTERACTION') {
      errors.push({ code: 'WRITER_AUTHORITY_BASIS', detail: 'Writer Studio requires bounded structural authority' });
    }
    if (!p.structuralAuthorityEvidence
        || !p.structuralAuthorityEvidence.serverEstablishedMember
        || !p.structuralAuthorityEvidence.serverEstablishedHostObject
        || !p.structuralAuthorityEvidence.canonicalFixedTuple
        || p.structuralAuthorityEvidence.clientSelectable
        || p.structuralAuthorityEvidence.elevatedProfessionalOrResearchRole
        || !p.structuralAuthorityEvidence.expiresWithHostInteraction) {
      errors.push({ code: 'WRITER_STRUCTURAL_EVIDENCE', detail: 'Writer Studio structural authority evidence incomplete' });
    }
    if (p.sourcePlane !== 'NO_GOVERNED_SOURCE_WIRING'
        || p.retrievalAuthority !== 'NO_NEW_ACQUISITION') {
      errors.push({ code: 'WRITER_RETRIEVAL_WIDENING', detail: 'Writer Studio may not infer retrieval from source classes' });
    }
    if (p.artifactAuthorshipOwner !== 'writer'
        || p.downstreamHandoff !== 'EXISTING_WRITERS_EDITORIAL_CHAIN_REFERENCE_ONLY'
        || p.handoffAuthorityOwner !== 'writer') {
      errors.push({ code: 'WRITER_CUSTODY_DRIFT', detail: 'Writer custody/handoff law changed' });
    }
  } else {
    if (p.surfaceAuthorityBasis !== 'SERVER_ADJUDICATED_CURRENT_TURN') {
      errors.push({ code: 'SHARED_SURFACE_AUTHORITY_BASIS', detail: 'shared-route surfaces require T8B adjudication' });
    }
    if (p.structuralAuthorityEvidence !== null) {
      errors.push({ code: 'STRUCTURAL_AUTHORITY_LEAK', detail: 'structural Writer authority may not leak to shared surfaces' });
    }
  }

  if (p.hostSurface === 'coaching_practice' || p.hostSurface === 'therapist_practitioner') {
    if (p.professionalJudgmentOwner !== 'practitioner'
        || p.downstreamHandoff !== 'NONE_TERMINAL_EDUCATION') {
      errors.push({ code: 'PRACTITIONER_ACTION_CAPTURE', detail: 'practitioner teaching must remain terminal education' });
    }
  }

  if (p.hostSurface === 'research_lab'
      && (p.scientificJudgmentOwner !== 'researcher' || p.scientificExecutionAuthority !== 'NONE')) {
    errors.push({ code: 'RESEARCH_AUTHORITY_CAPTURE', detail: 'research teaching may not execute science' });
  }

  return Object.freeze(errors);
}

export type TransitionDecision =
  | 'CONTINUE_WITHIN_CURRENT_ENVELOPE'
  | 'READJUDICATE_SURFACE_OR_REFRAIN'
  | 'ROUTE_OUTWARD_PLATFORM_BINDING';

export function transitionDecision(
  current: TeachingApplicationProfile,
  nextSurface: TeachingSurface,
  nextDomain: string,
): TransitionDecision {
  if (nextSurface !== current.hostSurface) return 'READJUDICATE_SURFACE_OR_REFRAIN';
  if (!current.domainKeys.includes(nextDomain)) return 'ROUTE_OUTWARD_PLATFORM_BINDING';
  return 'CONTINUE_WITHIN_CURRENT_ENVELOPE';
}

export type RequestedEffect =
  | TeachingAct
  | 'MANUSCRIPT_MUTATION'
  | 'DURABLE_RECORD_MUTATION'
  | 'NEW_SOURCE_RETRIEVAL'
  | 'NEW_PROVIDER_ROUTE'
  | 'ROLE_OR_ACCESS_CHANGE'
  | 'DIAGNOSIS'
  | 'TREATMENT_DIRECTION'
  | 'CLIENT_ACTION'
  | 'RESEARCH_EXECUTION'
  | 'LEARNER_STATE_PERSISTENCE';

export type EffectDecision =
  | 'TEACHING_ALLOWED'
  | 'HANDOFF_EXISTING_HOST_AUTHORITY'
  | 'STOP_RETRIEVAL_GOVERNANCE'
  | 'STOP_HOST_OR_CORE_AUTHORITY';

export function effectDecision(
  profile: TeachingApplicationProfile,
  effect: RequestedEffect,
): EffectDecision {
  if ((TEACHING_ACTS as readonly string[]).includes(effect)) return 'TEACHING_ALLOWED';
  if (effect === 'MANUSCRIPT_MUTATION'
      && profile.hostSurface === 'writers_studio'
      && profile.downstreamHandoff === 'EXISTING_WRITERS_EDITORIAL_CHAIN_REFERENCE_ONLY') {
    return 'HANDOFF_EXISTING_HOST_AUTHORITY';
  }
  if (effect === 'NEW_SOURCE_RETRIEVAL') return 'STOP_RETRIEVAL_GOVERNANCE';
  return 'STOP_HOST_OR_CORE_AUTHORITY';
}
