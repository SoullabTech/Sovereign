import { createHash } from 'node:crypto';
import type {
  CurrentActProjection,
  CurrentActProjectionCandidate,
  CurrentActRelation,
  MaterialityClass,
  OrdinaryRelation,
  RelationalFieldPacket,
  StandingEvidence,
} from './types';

export const H8_CURRENT_ACT_ARCHITECTURE_VERSION = 'h8-current-act-shadow-01@proposal-v1+h7j-155d759a+r1-469b67a7' as const;
export const H8_CURRENT_ACT_MODEL_NAME = 'deterministic-h7j-r1' as const;
export const H7J_ACQUISITION_RULE_SHA256 = '155d759a7a8a25dba337cd151812700da95f8e1064c3def8a14a78e478fa24c8' as const;
export const H7I_R1_SPEC_SHA256 = '469b67a7400e15572b2d2731963961876fd32950ae490ed464910212f5d0b47c' as const;
export const H8_ORDINARY_RELATION_PROPOSAL_VERSION = 'ordinary-relation-proposal-v1' as const;

const STOP = new Set([
  'a','an','and','are','as','at','be','been','being','but','by','can','could','did','do','does','for','from',
  'had','has','have','he','her','here','hers','him','his','how','i','if','in','into','is','it','its','me','my',
  'of','on','or','our','ours','she','should','so','that','the','their','theirs','them','there','they','this',
  'to','us','was','we','were','what','when','where','which','who','why','will','with','would','you','your','yours',
]);

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');
const round = (value: number): number => Number(value.toFixed(6));

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((token) => token.length > 1 && !STOP.has(token));
}

function tokenSet(text: string): Set<string> {
  return new Set(tokens(text));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

function tfidfCosines(texts: readonly string[]): number[] {
  const docs = texts.map(tokens);
  const n = docs.length;
  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const token of new Set(doc)) df.set(token, (df.get(token) ?? 0) + 1);
  }

  const vectors = docs.map((doc) => {
    const counts = new Map<string, number>();
    for (const token of doc) counts.set(token, (counts.get(token) ?? 0) + 1);
    const denom = Math.max(1, doc.length);
    const vector = new Map<string, number>();
    for (const [token, count] of counts) {
      const idf = Math.log((n + 1) / ((df.get(token) ?? 0) + 1)) + 1;
      vector.set(token, (count / denom) * idf);
    }
    return vector;
  });

  const cosine = (a: Map<string, number>, b: Map<string, number>): number => {
    let dot = 0;
    let an = 0;
    let bn = 0;
    for (const value of a.values()) an += value * value;
    for (const value of b.values()) bn += value * value;
    for (const [token, value] of a) dot += value * (b.get(token) ?? 0);
    return an > 0 && bn > 0 ? dot / Math.sqrt(an * bn) : 0;
  };

  return vectors.slice(1).map((vector) => cosine(vectors[0], vector));
}

export function proposeOrdinaryRelation(text: string): OrdinaryRelation {
  const s = text.toLowerCase();
  if (/\b(actually|i mean|correction|changed my mind|rather than)\b|\bnot\b.{0,48}\bbut\b/i.test(s)) return 'CORRECTION';
  if (/\b(do not|don't|never|must not|cannot|can't|should not|shouldn't|may not)\b/i.test(s)) return 'PROHIBITION';
  if (/\b(must|need to|needs to|have to|required|requires|only if|before .{0,40} can)\b/i.test(s)) return 'REQUIREMENT';
  if (/\b(authorize|authorized|permission|allowed|okay to|ok to|may\b|can\b)\b/i.test(s)) return 'AUTHORIZATION';
  if (/\b(because|therefore|so that|which is why|causes?|caused|leads? to|results? in)\b/i.test(s)) return 'CAUSAL';
  if (/\b(however|although|except|unless|despite|even if|while|but)\b/i.test(s)) return 'QUALIFIER';
  if (/\b(means|defined as|is not a|are not a|isn't a|aren't a)\b/i.test(s)) return 'DEFINITION';
  if (/\b(currently|already|still|remains?|dormant|live|closed|open|working|partial|status)\b/i.test(s)) return 'STATUS';
  return 'HISTORY';
}

function acquireCurrentActRelation(ordinary: OrdinaryRelation, relevant: boolean): CurrentActRelation {
  if (!relevant) return 'BACKGROUND';
  switch (ordinary) {
    case 'PROHIBITION':
    case 'AUTHORIZATION':
    case 'DEFINITION':
      return 'ANSWERS';
    case 'STATUS':
      return 'GOVERNS_CURRENT_ACT';
    case 'REQUIREMENT':
      return 'REQUIRES_FOR_CURRENT_ACT';
    case 'CORRECTION':
      return 'CORRECTS_CURRENT_ACT';
    case 'CAUSAL':
      return 'CAUSES_CURRENT_ACT';
    case 'QUALIFIER':
      return 'QUALIFIES_CURRENT_ACT';
    default:
      return 'BACKGROUND';
  }
}

function materiality(relation: CurrentActRelation): {
  materialityClass: MaterialityClass;
  strength: number;
  anchorPriority: number;
} {
  switch (relation) {
    case 'ANSWERS':
      return { materialityClass: 'GOVERNS', strength: 1, anchorPriority: 1 };
    case 'CORRECTS_CURRENT_ACT':
      return { materialityClass: 'CORRECTS', strength: 1, anchorPriority: 0.98 };
    case 'GOVERNS_CURRENT_ACT':
      return { materialityClass: 'GOVERNS', strength: 0.9, anchorPriority: 0.95 };
    case 'REQUIRES_FOR_CURRENT_ACT':
      return { materialityClass: 'REQUIRED_FOR_VALIDITY', strength: 1, anchorPriority: 0 };
    case 'CAUSES_CURRENT_ACT':
      return { materialityClass: 'CAUSALLY_MATERIAL', strength: 0.85, anchorPriority: 0 };
    case 'QUALIFIES_CURRENT_ACT':
      return { materialityClass: 'QUALIFIES', strength: 0.75, anchorPriority: 0 };
    default:
      return { materialityClass: 'NON_MATERIAL', strength: 0, anchorPriority: 0 };
  }
}

function standingWeight(evidence: StandingEvidence): number {
  if (evidence.authoredBy === 'member') return 1;
  if (evidence.authoredBy === 'practitioner') return 0.95;
  if (evidence.authoredBy === 'house') return 0.9;
  if (evidence.authoredBy === 'collective') return 0.85;
  return evidence.authority === 'compute' ? 0.8 : 0.75;
}

function stableSort(rows: readonly CurrentActProjectionCandidate[], field: 'baselineScore' | 'materialityScore') {
  return [...rows].sort((a, b) => b[field] - a[field] || a.evidenceId.localeCompare(b.evidenceId));
}

export function buildCurrentActProjection(packet: RelationalFieldPacket): CurrentActProjection {
  const current = packet.evidence.find((e) => e.id === packet.currentEvidenceId);
  if (!current) throw new Error('h8_current_evidence_missing');

  const candidates = packet.evidence.filter((e) => e.id !== packet.currentEvidenceId);
  if (candidates.length === 0) {
    const core = {
      architectureVersion: H8_CURRENT_ACT_ARCHITECTURE_VERSION,
      researchLineage: {
        h7jAcquisitionRuleSha256: H7J_ACQUISITION_RULE_SHA256,
        h7iR1SpecSha256: H7I_R1_SPEC_SHA256,
        ordinaryRelationProposalVersion: H8_ORDINARY_RELATION_PROPOSAL_VERSION,
      },
      projectionStatus: 'no_prior_evidence' as const,
      currentEvidenceId: packet.currentEvidenceId,
      anchorEvidenceId: null,
      selectedEvidenceIds: [] as string[],
      candidates: [] as CurrentActProjectionCandidate[],
    };
    return { ...core, projectionDigest: sha256(JSON.stringify(core)) };
  }

  const similarities = tfidfCosines([current.text, ...candidates.map((candidate) => candidate.text)]);
  const currentTokens = tokenSet(current.text);

  const projected = candidates.map((evidence, index): CurrentActProjectionCandidate => {
    const similarity = similarities[index] ?? 0;
    const entityOverlap = jaccard(currentTokens, tokenSet(evidence.text));
    const relevant = similarity >= 0.035 || entityOverlap >= 0.08;
    const ordinaryRelation = proposeOrdinaryRelation(evidence.text);
    const currentActRelation = acquireCurrentActRelation(ordinaryRelation, relevant);
    const m = materiality(currentActRelation);
    const baselineScore = similarity + 0.2 * standingWeight(evidence);
    const materialityScore = baselineScore + 0.35 * m.strength;
    return {
      evidenceId: evidence.id,
      ordinaryRelation,
      similarity: round(similarity),
      entityOverlap: round(entityOverlap),
      relevant,
      currentActRelation,
      materialityClass: m.materialityClass,
      materialityStrength: m.strength,
      anchorPriority: m.anchorPriority,
      baselineScore: round(baselineScore),
      materialityScore: round(materialityScore),
    };
  });

  const eligibleAnchors = projected
    .filter((candidate) => candidate.anchorPriority > 0)
    .sort((a, b) =>
      b.anchorPriority - a.anchorPriority ||
      b.baselineScore - a.baselineScore ||
      a.evidenceId.localeCompare(b.evidenceId));

  const anchor = eligibleAnchors[0] ?? null;
  const remaining = anchor
    ? projected.filter((candidate) => candidate.evidenceId !== anchor.evidenceId)
    : projected;
  const materialRanked = stableSort(remaining, 'materialityScore');
  const selected = anchor
    ? [anchor, ...materialRanked.slice(0, 2)]
    : stableSort(projected, 'materialityScore').slice(0, 3);

  const core = {
    architectureVersion: H8_CURRENT_ACT_ARCHITECTURE_VERSION,
    researchLineage: {
      h7jAcquisitionRuleSha256: H7J_ACQUISITION_RULE_SHA256,
      h7iR1SpecSha256: H7I_R1_SPEC_SHA256,
      ordinaryRelationProposalVersion: H8_ORDINARY_RELATION_PROPOSAL_VERSION,
    },
    projectionStatus: anchor ? 'projected' as const : 'no_direct_anchor' as const,
    currentEvidenceId: packet.currentEvidenceId,
    anchorEvidenceId: anchor?.evidenceId ?? null,
    selectedEvidenceIds: selected.map((candidate) => candidate.evidenceId),
    candidates: projected,
  };
  return { ...core, projectionDigest: sha256(JSON.stringify(core)) };
}
