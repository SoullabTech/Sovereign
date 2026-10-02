/** O5-R4 evidence-return contract. Reuses O5-R1 vocabulary; adds no authority vocabulary. */
import {
  EVIDENCE_KINDS,
  O1_CANDIDATE_STANDING,
  CONSEQUENCE_FINDING_FIELDS,
  CONSEQUENCE_FORBIDDEN_FIELDS,
  URGENCY,
} from '../jarvis-o5-r1/contract.mjs';

export { EVIDENCE_KINDS, O1_CANDIDATE_STANDING, CONSEQUENCE_FINDING_FIELDS, CONSEQUENCE_FORBIDDEN_FIELDS, URGENCY };

export const PROPOSAL_FIELDS = Object.freeze(['kind', 'source_act', 'summary', 'proposed_kind']);
export const ORDINARY_FINDING_FIELDS = Object.freeze(['kind', 'source_act', 'summary', 'urgency']);
export const ADMISSION_STATE = 'EXECUTING';
export const PROPOSAL_SOURCE = 'executor-proposal';
export const PROPOSAL_SOURCE_PREFIX = 'w4-proposal:sha256:';

export const CONSEQUENCE_SOURCE = 'executor-consequence-finding';
export const CONSEQUENCE_SOURCE_PREFIX = 'w4-finding:sha256:';
export const CONSEQUENCE_PROJECTION_FIELDS = Object.freeze(['target_lane','source','source_ref','evidence']);
