import {
  EVIDENCE_KINDS, O1_CANDIDATE_STANDING, CONSEQUENCE_FINDING_FIELDS, URGENCY,
  PROPOSAL_FIELDS, ORDINARY_FINDING_FIELDS, ADMISSION_STATE, PROPOSAL_SOURCE, PROPOSAL_SOURCE_PREFIX,
  CONSEQUENCE_SOURCE, CONSEQUENCE_SOURCE_PREFIX,
} from './contract.mjs';
import { digest, stable } from './substrate.mjs';
import { execFileSync } from 'node:child_process';

const clone=(v)=>structuredClone(v);
const nonblank=(v)=>typeof v==='string' && v.trim().length>0;
const exactFields=(entry, fields)=>Object.keys(entry).sort().join('|')===([...fields].sort()).join('|');

function classifyFinding(entry) {
  if (exactFields(entry, CONSEQUENCE_FINDING_FIELDS)) return 'consequence';
  if (exactFields(entry, ORDINARY_FINDING_FIELDS)) return 'ordinary';
  return null;
}
function validEntry(entry) {
  if (!entry || !EVIDENCE_KINDS.includes(entry.kind) || !nonblank(entry.source_act)) return false;
  if (entry.kind==='proposal') return exactFields(entry, PROPOSAL_FIELDS) && nonblank(entry.summary) && nonblank(entry.proposed_kind);
  const shape=classifyFinding(entry);
  if (!shape || !URGENCY.includes(entry.urgency)) return false;
  if (shape==='ordinary') return nonblank(entry.summary);
  return nonblank(entry.affected_lane) && nonblank(entry.reason) && Array.isArray(entry.evidence_refs) && entry.evidence_refs.every(nonblank);
}
export function evidenceIdentity(entry) { return digest(entry); }

export function appendEvidence(env, entry) {
  if (env?.work_unit?.state?.lifecycle_state!==ADMISSION_STATE) return { ok:false, reason:'LEDGER_STATE_NOT_ADMITTED', envelope:env };
  if (!validEntry(entry)) return { ok:false, reason:'INVALID_EVIDENCE_RECORD', envelope:env };
  const next=clone(env); const bucket=entry.kind==='proposal'?'proposals':'findings'; const id=evidenceIdentity(entry);
  const existing=next.work_unit.evaluation[bucket].find((r)=>r._evidence_identity===id);
  if (existing) return { ok:false, reason:'DUPLICATE_EVIDENCE_RECORD', envelope:env };
  next.work_unit.evaluation[bucket].push(Object.freeze({ ...clone(entry), _evidence_identity:id }));
  return { ok:true, envelope:next, evidence_identity:id };
}

export function projectProposal(entry) {
  if (!validEntry(entry) || entry.kind!=='proposal') return null;
  return Object.freeze({ standing:O1_CANDIDATE_STANDING, raw_utterance:entry.summary, source:PROPOSAL_SOURCE,
    source_ref:PROPOSAL_SOURCE_PREFIX+evidenceIdentity(entry), authority_grants:Object.freeze([]) });
}
export function projectProposalSet(entries) {
  const out=[]; const seen=new Set();
  for (const entry of entries) { const c=projectProposal(entry); if (!c || seen.has(c.source_ref)) continue; seen.add(c.source_ref); out.push(c); }
  return Object.freeze(out);
}
export function projectConsequenceFinding(entry) {
  if (!validEntry(entry) || entry.kind !== 'finding' || classifyFinding(entry) !== 'consequence') return null;
  return Object.freeze({
    target_lane: entry.affected_lane,
    source: CONSEQUENCE_SOURCE,
    source_ref: CONSEQUENCE_SOURCE_PREFIX + evidenceIdentity(entry),
    evidence: Object.freeze(clone(entry)),
  });
}

export function applyProjection(programme, candidates) { const next=clone(programme); next.o1Candidates=[...candidates]; return next; }
export const equal=(a,b)=>stable(a)===stable(b);

export function v1RuntimeCallers() {
  const out=execFileSync('rg',['-n','work-unit-ledger-v1\\.mjs','scripts','jarvis-desktop/src','lib'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  return out.filter((line)=>!line.includes('__tests__')&&!line.includes('/test/'));
}
