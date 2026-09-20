/**
 * Synthetic fixtures for I2 falsification.
 *
 * Synthetic data only. No member, client, clinical, PHI, Sanctuary, production,
 * or private practitioner material (ACT 12A §9). Every proposition here is an
 * invented placeholder.
 */

import type {
  AdoptionAct,
  Authorship,
  Endpoint,
  EvaluationRequest,
  JoinEnvelope,
  OperativeBoundary,
  SemanticComponent,
  StandingAct,
  Warrant,
} from '../types';

export const SYNTHETIC_MEMBER = 'synthetic-member-001';

export const author = (partial: Partial<Authorship> = {}): Authorship => ({
  authorClass: 'SOURCE_AUTHORED',
  roleExercised: 'source',
  authorRef: 'synthetic-source-A',
  ...partial,
});

export const boundary = (id: string, live = true): OperativeBoundary => ({
  boundaryId: id,
  statement: `synthetic boundary ${id}`,
  live,
});

export const endpoint = (id: string, partial: Partial<Endpoint> = {}): Endpoint => ({
  endpointId: id,
  proposition: `synthetic endpoint proposition ${id}`,
  authorship: author(),
  provenanceRef: `prov:${id}`,
  standing: 'WARRANTED',
  jurisdiction: 'scientific_evidence',
  boundaries: [],
  mode: 'reliance',
  ...partial,
});

export const warrant = (id: string, partial: Partial<Warrant> = {}): Warrant => ({
  warrantId: id,
  warrantClass: 'DIRECT_SOURCE_RELATION',
  proposition: `synthetic warrant proposition ${id}`,
  authorship: author(),
  provenanceRef: `prov:${id}`,
  jurisdiction: 'scientific_evidence',
  licensesTransferInto: [],
  licensedRelationSemantics: ['association'],
  uncertainty: null,
  boundaries: [],
  liveness: 'live',
  standingCeiling: 'WARRANTED',
  composite: null,
  ...partial,
});

export const component = (id: string, partial: Partial<SemanticComponent> = {}): SemanticComponent => ({
  componentId: id,
  proposition: `synthetic component proposition ${id}`,
  kind: 'member_meaning',
  authorship: author({ authorClass: 'MAIA_PROPOSED', roleExercised: 'maia', authorRef: 'maia' }),
  jurisdiction: 'member_personal_meaning',
  claimedSemantics: ['psychological_meaning'],
  warrantRef: null,
  ...partial,
});

export const envelope = (partial: Partial<JoinEnvelope> = {}): JoinEnvelope => {
  const endpoints = partial.endpoints ?? [endpoint('e1'), endpoint('e2')];
  return {
    joinId: 'join-1',
    memberScope: SYNTHETIC_MEMBER,
    endpoints,
    relationProposition: 'synthetic relation: e1 is associated with e2',
    relationPredicate: 'is_associated_with',
    directional: false,
    claimedSemantics: ['association'],
    operation: 'WARRANTED_JOIN',
    authorship: author(),
    provenance: {
      introducedBy: author(),
      inquiryContext: 'synthetic inquiry context',
      reliedUponRefs: endpoints.filter((e) => e.mode === 'reliance').map((e) => e.endpointId),
      referenceOnlyRefs: endpoints.filter((e) => e.mode === 'reference').map((e) => e.endpointId),
      transformationStep: 'synthetic transformation: source asserts the relation directly',
    },
    jurisdiction: 'scientific_evidence',
    offeredWarrantRefs: ['w1'],
    components: [],
    boundaries: [],
    uncertainty: null,
    ...partial,
  };
};

export const standingAct = (partial: Partial<StandingAct> = {}): StandingAct => ({
  actId: 'act-1',
  joinId: 'join-1',
  componentId: null,
  claimedStanding: 'WARRANTED',
  basis: 'warrant_admission',
  warrantRef: 'w1',
  authorship: author(),
  jurisdiction: 'scientific_evidence',
  supersedesActId: null,
  ...partial,
});

export const adoptionAct = (partial: Partial<AdoptionAct> = {}): AdoptionAct => ({
  actId: 'adopt-1',
  joinId: 'join-1',
  adoptedComponentIds: [],
  adopter: author({ authorClass: 'MEMBER_CONFIRMED', roleExercised: 'member', authorRef: SYNTHETIC_MEMBER }),
  adopterJurisdiction: 'member_personal_meaning',
  propositionAsPut: 'synthetic proposition as put to the adopter',
  originalProposer: author({ authorClass: 'MAIA_PROPOSED', roleExercised: 'maia', authorRef: 'maia' }),
  ...partial,
});

/** A fully lawful warranted join. Each falsifier perturbs exactly one thing. */
export const lawfulRequest = (partial: Partial<EvaluationRequest> = {}): EvaluationRequest => ({
  envelope: envelope(),
  warrants: [warrant('w1')],
  standingActs: [standingAct()],
  adoptionActs: [],
  requestedStanding: 'WARRANTED',
  requestedJurisdiction: 'scientific_evidence',
  ...partial,
});

export const codesOf = (refusals: readonly { readonly code: string }[]): string[] =>
  refusals.map((r) => r.code);
