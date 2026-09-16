import fs from 'node:fs';
import path from 'node:path';
import { admitClaim } from '../../../lib/maia/gestaltStandingShadow/admission';
import { projectGestalt } from '../../../lib/maia/gestaltStandingShadow/projector';
import { assembleRelationalField } from '../../../lib/maia/gestaltStandingShadow/standingResolver';
import type { EvidenceObject, StandingRelation, ResponseClaim } from '../../../lib/maia/gestaltStandingShadow/types';

const scope = 'silver-cedar-process';
const e = (id: string, text: string, kind: EvidenceObject['kind'] = 'member_statement', authoredBy: EvidenceObject['authoredBy'] = 'member', createdAt = '2026-09-16T14:00:00.000Z'): EvidenceObject =>
  ({ id, text, kind, authoredBy, createdAt, processScope: scope });
const r = (id: string, subjectId: string, predicate: StandingRelation['predicate'], objectId: string, basisIds: string[], actor: StandingRelation['actor'], createdAt: string): StandingRelation =>
  ({ id, subjectId, predicate, objectId, basisIds, actor, createdAt, processScope: scope });

const evidence: EvidenceObject[] = [
  e('E1', 'Silver cedar is an image that has been on my mind today.', 'member_statement', 'member', '2026-09-16T14:43:12.000Z'),
  e('E2', 'It feels ancient and wise and medicinal on a soul level.', 'member_statement', 'member', '2026-09-16T14:43:51.000Z'),
  e('E3', 'I am reaching back to what is foundational and important for me in this work and my life.', 'member_statement', 'member', '2026-09-16T14:44:24.000Z'),
  e('E4', 'Values, focus, coherence, and a firm supporting nature-based foundation for AI work.', 'member_statement', 'member', '2026-09-16T14:45:19.000Z'),
  e('E5', 'I want to hold its symbolic representation as a guardian image for my work and for me.', 'member_statement', 'member', '2026-09-16T14:46:17.000Z'),
  e('E6', 'The silver cedar.', 'member_statement', 'member', '2026-09-16T14:46:41.000Z'),
  e('I1', 'Silver Cedar represents resilience.', 'maia_interpretation', 'maia', '2026-09-16T14:47:00.000Z'),
];
const relations: StandingRelation[] = [
  r('R2', 'E2', 'EVOKES', 'E1', ['E1', 'E2'], 'member', '2026-09-16T14:43:52.000Z'),
  r('R3', 'E3', 'CONNECTS_TO', 'E1', ['E1', 'E3'], 'member', '2026-09-16T14:44:25.000Z'),
  r('R4', 'E4', 'GROUNDS', 'E3', ['E3', 'E4'], 'member', '2026-09-16T14:45:20.000Z'),
  r('R5', 'E6', 'ADOPTED_AS', 'E5', ['E5', 'E6'], 'member', '2026-09-16T14:46:42.000Z'),
  r('RI1', 'I1', 'INTERPRETS', 'E2', ['E2', 'E3', 'E4'], 'maia', '2026-09-16T14:47:01.000Z'),
];

const field = assembleRelationalField(evidence, relations, { processScope: scope });
const projection = projectGestalt(field);

const claims: ResponseClaim[] = [
  {
    id: 'C1', text: 'Silver Cedar is the guardian image you named for this work.', speechAct: 'GROUNDED',
    objectRefs: ['E5', 'E6'], relationRefs: ['R5'],
  },
  {
    id: 'C2', text: 'I wonder whether resilience is part of what the image carries.', speechAct: 'CANDIDATE',
    objectRefs: ['E2', 'E3', 'E4'], relationRefs: ['RI1'],
  },
  {
    id: 'C3', text: 'What is the guardian image?', speechAct: 'QUESTION',
    objectRefs: ['E5'], relationRefs: ['R5'], reopenedObjectRefs: ['E5'],
  },
  {
    id: 'C4', text: 'How might the guardian image change concrete practice or design?', speechAct: 'QUESTION',
    objectRefs: ['E5', 'E6'], relationRefs: ['R5'],
  },
];

const admissions = claims.map((claim) => admitClaim(claim, field));
const out = {
  fixture: 'silver-cedar',
  scope,
  zeroInfluence: true,
  field,
  projection,
  claims,
  admissions,
};

const outputPath = path.join(
  process.cwd(),
  'docs/programme/evidence/gestalt-standing-shadow/S4_SILVER_CEDAR_OFFLINE_2026-09-16.json',
);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({
  outputPath,
  standing: Object.fromEntries(field.standing.map((item) => [item.objectId, item.useAs])),
  admissions: Object.fromEntries(admissions.map((item) => [item.claimId, item.admission])),
}, null, 2));
