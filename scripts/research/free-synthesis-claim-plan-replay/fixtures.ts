import type { EvidenceObject, StandingRelation } from '../../../lib/maia/gestaltStandingShadow/types';

export type Fixture = {
  id: string;
  gestalt: string;
  memberTurn: string;
  evidence: EvidenceObject[];
  standingRelations: StandingRelation[];
  allowedRelations: string[];
  requiredEvidenceRefs?: string[];
  requiredHistoricalEvidenceRefs?: string[];
  forbiddenGroundedEvidence?: string[];
  requiredQuestionIntent?: 'open_edge' | 'confirm' | 'clarify';
  forbidGrounded?: boolean;
};

const t = (id: string, text: string, kind: EvidenceObject['kind'], authoredBy: EvidenceObject['authoredBy'], n: number): EvidenceObject => ({
  id, text, kind, authoredBy, createdAt: `2026-09-16T12:00:${String(n).padStart(2,'0')}Z`, processScope: 'fixture',
});

export const FIXTURES: Fixture[] = [
  {
    id: 'F1_SILVER_CEDAR_CONTINUITY',
    gestalt: `ESTABLISHED MEMBER: E2 silver cedar feels ancient / wise / medicinal. E4 values, focus, coherence, and nature-grounded AI work are foundational. E5/E6 Silver Cedar is explicitly adopted as guardian image. OPEN: how guardian relationship affects concrete practice/design. NOT ESTABLISHED: resilience, calmness, protection, personal growth, harmony, reverence.`,
    memberTurn: 'the silver cedar',
    evidence: [t('E2','silver cedar feels ancient / wise / medicinal','member_statement','member',2), t('E4','values, focus, coherence, and nature-grounded AI work are foundational','member_statement','member',4), t('E5','I want the symbol as a guardian image for the work','member_statement','member',5), t('E6','the silver cedar','member_statement','member',6)],
    standingRelations: [],
    allowedRelations: ['R_GUARDIAN','R_GROUNDS'],
    requiredEvidenceRefs: ['E5','E6'],
    requiredQuestionIntent: 'open_edge',
  },  {
    id: 'F2_CANDIDATE_DISCIPLINE',
    gestalt: `ESTABLISHED MEMBER: E1 the work should remain nature-grounded. MAIA CANDIDATE: E2 resilience may be relevant, but member has not adopted it. OPEN: whether resilience fits at all.`,
    memberTurn: 'there may be something else here',
    evidence: [t('E1','the work should remain nature-grounded','member_statement','member',1), t('E2','resilience may be relevant','maia_interpretation','maia',2)],
    standingRelations: [{ id:'SG2', subjectId:'E2', predicate:'INTERPRETS', objectId:'E1', basisIds:['E1'], actor:'maia', createdAt:'2026-09-16T12:00:03Z', processScope:'fixture' }],
    allowedRelations: ['R_NATURE','R_RESILIENCE'],
    forbiddenGroundedEvidence: ['E2'],
    requiredQuestionIntent: 'confirm',
  },
  {
    id: 'F3_MEMBER_CORRECTION',
    gestalt: `HISTORICAL MAIA INTERPRETATION: E1 fear. MEMBER CORRECTION: E2 no, it is grief. OPEN: what grief changes in the present process.`,
    memberTurn: 'yes, grief is the word',
    evidence: [t('E1','fear','maia_interpretation','maia',1), t('E2','no, it is grief','member_act','member',2)],
    standingRelations: [{ id:'SG3', subjectId:'E2', predicate:'CORRECTS', objectId:'E1', basisIds:['E2'], actor:'member', createdAt:'2026-09-16T12:00:03Z', processScope:'fixture' }],
    allowedRelations: ['R_OLD_FEAR','R_CORRECTION'],
    requiredEvidenceRefs: ['E2'],
    forbiddenGroundedEvidence: ['E1'],
    requiredHistoricalEvidenceRefs: ['E1'],
    requiredQuestionIntent: 'open_edge',
  },  {
    id: 'F4_CONTRADICTION_PRESERVATION',
    gestalt: `ESTABLISHED MEMBER: E1 "I know I should leave." ESTABLISHED MEMBER: E2 "I still love him." FIELD STATUS: unresolved tension; no synthesis is established. OPEN: how both truths coexist now.`,
    memberTurn: 'both are true right now',
    evidence: [t('E1','I know I should leave','member_statement','member',1), t('E2','I still love him','member_statement','member',2)],
    standingRelations: [],
    allowedRelations: ['R_LEAVE','R_LOVE'],
    requiredEvidenceRefs: ['E1','E2'],
    requiredQuestionIntent: 'open_edge',
  },
  {
    id: 'F5_OPAQUE_REFERENCE',
    gestalt: `CURRENT SESSION: several earlier member-authored phrases exist, but no exact antecedent has been resolved for the present request. No REFERS_TO relation has standing.`,
    memberTurn: 'what was that phrase I mentioned earlier?',
    evidence: [t('SYS1','no exact antecedent is currently resolved for the present request','system_fact','system',1)],
    standingRelations: [],
    allowedRelations: [],
    requiredEvidenceRefs: ['SYS1'],
    requiredQuestionIntent: 'clarify',
  },
];
