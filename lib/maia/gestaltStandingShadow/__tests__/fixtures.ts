import type { Authorship, EvidenceKind, EvidenceObject, RelationPredicate, StandingRelation } from '../types';

export const SCOPE = 'silver-cedar-process';

export function evidence(
  id: string,
  text: string,
  kind: EvidenceKind = 'member_statement',
  authoredBy: Authorship = 'member',
  createdAt = `2026-09-16T14:${id.replace(/\D/g, '').padStart(2, '0')}:00.000Z`,
  processScope = SCOPE,
): EvidenceObject {
  return { id, text, kind, authoredBy, createdAt, processScope };
}

export function relation(
  id: string,
  subjectId: string,
  predicate: RelationPredicate,
  objectId: string,
  basisIds: readonly string[],
  actor: Authorship,
  createdAt: string,
  processScope = SCOPE,
): StandingRelation {
  return { id, subjectId, predicate, objectId, basisIds, actor, createdAt, processScope };
}

export const silverCedarEvidence: EvidenceObject[] = [
  evidence('E1', 'Silver cedar is an image that has been on my mind today.'),
  evidence('E2', 'It feels ancient and wise and medicinal on a soul level.'),
  evidence('E3', 'I am reaching back to what is foundational and important for me in this work and my life.'),
  evidence('E4', 'Values, focus, coherence, and a firm supporting nature-based foundation for AI work.'),  evidence('E5', 'I want to hold its symbolic representation as a guardian image for my work and for me.'),
  evidence('E6', 'The silver cedar.'),
  evidence('I1', 'Silver Cedar represents resilience.', 'maia_interpretation', 'maia', '2026-09-16T14:47:00.000Z'),
  evidence('M7', 'Yes, resilience is exactly part of it.', 'member_act', 'member', '2026-09-16T14:48:00.000Z'),
  evidence('M8', "Actually, resilience isn't what matters.", 'member_act', 'member', '2026-09-16T14:49:00.000Z'),
];

export const silverCedarBaseRelations: StandingRelation[] = [
  relation('R1', 'E1', 'NAMES_SYMBOL', 'E1', ['E1'], 'member', '2026-09-16T14:43:10.000Z'),
  relation('R2', 'E2', 'EVOKES', 'E1', ['E1', 'E2'], 'member', '2026-09-16T14:44:00.000Z'),
  relation('R3', 'E3', 'CONNECTS_TO', 'E1', ['E1', 'E3'], 'member', '2026-09-16T14:45:00.000Z'),
  relation('R4', 'E4', 'GROUNDS', 'E3', ['E3', 'E4'], 'member', '2026-09-16T14:45:30.000Z'),
  relation('R5', 'E6', 'ADOPTED_AS', 'E5', ['E5', 'E6'], 'member', '2026-09-16T14:46:50.000Z'),
  relation('RI1', 'I1', 'INTERPRETS', 'E2', ['E2', 'E3', 'E4'], 'maia', '2026-09-16T14:47:05.000Z'),
];

export const adoptionRelation = relation(
  'RA1', 'M7', 'ADOPTS', 'I1', ['M7'], 'member', '2026-09-16T14:48:05.000Z',
);

export const correctionRelation = relation(
  'RC1', 'M8', 'CORRECTS', 'I1', ['M8'], 'member', '2026-09-16T14:49:05.000Z',
);
