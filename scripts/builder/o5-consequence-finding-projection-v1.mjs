/**
 * O5-R4 consequence-finding lane projection — pure evidence targeting only.
 *
 * This module does not persist an inbox, create work, grant authority, mutate a
 * lane, or interpret prose. It converts one authentic W4.v2 consequence-finding
 * record into a closed evidence projection naming exactly the affected lane.
 */
import { evidenceRecordIdV2 } from './work-unit-ledger-v2.mjs';

export const CONSEQUENCE_PROJECTION_VERSION = 'O5-R4-E9.v1';
export const CONSEQUENCE_SOURCE = 'executor-consequence-finding';
export const CONSEQUENCE_FIELDS = Object.freeze([
  'kind', 'source_act', 'affected_lane', 'reason', 'evidence_refs', 'urgency',
]);
export const PROJECTION_FIELDS = Object.freeze([
  'target_lane', 'source', 'source_ref', 'evidence',
]);
export const URGENCY = Object.freeze(['low', 'normal', 'high']);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)]));
  return value;
}
function nonBlank(value) { return typeof value === 'string' && value.trim().length > 0; }
function exactFields(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const got=Object.keys(value).sort(); const expected=[...fields].sort();
  return got.length===expected.length && got.every((k,i)=>k===expected[i]);
}

export function isAuthenticConsequenceFindingRecordV1(record) {
  if (!record || typeof record !== 'object') return false;
  if (record.ledger_version !== 'W4.v2' || record.kind !== 'finding') return false;
  if (!/^sha256:[0-9a-f]{64}$/i.test(record.id || '')) return false;
  const e=record.entry;
  if (!exactFields(e, CONSEQUENCE_FIELDS)) return false;
  if (e.kind !== 'finding' || !nonBlank(e.source_act) || !nonBlank(e.affected_lane) || !nonBlank(e.reason)) return false;
  if (!Array.isArray(e.evidence_refs) || e.evidence_refs.length===0 || e.evidence_refs.some((x)=>!nonBlank(x))) return false;
  if (!URGENCY.includes(e.urgency)) return false;
  return record.id === evidenceRecordIdV2('finding', e);
}

export function projectConsequenceFindingV1(record) {
  if (!isAuthenticConsequenceFindingRecordV1(record)) return null;
  const evidence=clone(record.entry);
  return deepFreeze({
    target_lane: evidence.affected_lane,
    source: CONSEQUENCE_SOURCE,
    source_ref: 'w4-finding:' + record.id,
    evidence,
  });
}
