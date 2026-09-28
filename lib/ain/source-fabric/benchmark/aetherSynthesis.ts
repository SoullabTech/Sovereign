import {
  ablateAetherSource,
  type AetherInput,
  type AetherRelationCandidate,
} from './aetherInput';

export type AetherCandidateDisposition =
  | 'admitted_provisional'
  | 'refused_relation'
  | 'refused_support'
  | 'refused_permission';

export interface AetherSynthesisCandidate {
  candidateRef: string;
  inquiryRef: string;
  relationRef: string;
  proposition: string;
  predicate: AetherRelationCandidate['predicate'];
  supportRefs: string[];
  criticalSupportRefs: string[];
  counterevidenceRefs: string[];
  temporalNeed: AetherRelationCandidate['claimTemporalNeed'];
  uncertainty: number;
  provisional: true;
  persistenceAuthority: false;
  disposition: AetherCandidateDisposition;
  refusalReasons: string[];
}

export interface AetherCandidateAblation {
  candidateRef: string;
  removedSourceRef: string;
  before: 'present' | 'refused';
  after: 'present' | 'absent';
  critical: boolean;
  relationInvalidated: boolean;
}

const SYNTHESIZABLE = new Set<AetherRelationCandidate['predicate']>([
  'comparison',
  'resonance',
  'tension',
  'contrast',
  'possible_continuity',
  'symbolic_correspondence',
  'temporal_sequence',
  'explanatory_possibility',
]);

function propositionFor(relation: AetherRelationCandidate): string {
  const [a, b] = relation.endpointRefs;
  const pair = [a, b].filter(Boolean).join(' ↔ ');
  switch (relation.predicate) {
    case 'resonance': return `A provisional resonance may be explored across ${pair}.`;
    case 'tension': return `A provisional tension may be held across ${pair}.`;
    case 'contrast': return `A provisional contrast may clarify differences across ${pair}.`;
    case 'possible_continuity': return `A possible continuity may be explored across ${pair}.`;
    case 'symbolic_correspondence': return `A symbolic correspondence may be explored across ${pair}.`;
    case 'temporal_sequence': return `A temporal relation is recorded across ${pair}.`;
    case 'explanatory_possibility': return `An explanatory possibility may be explored across ${pair}.`;
    default: return `A provisional comparison may be explored across ${pair}.`;
  }
}

export function generateAetherCandidates(input: AetherInput): AetherSynthesisCandidate[] {
  return input.relations.map((relation) => {
    const reasons: string[] = [];
    if (!input.synthesisPermissions.allowCreativeRelation) reasons.push('creative_relation_not_permitted');
    if (!SYNTHESIZABLE.has(relation.predicate)) reasons.push('predicate_not_synthesizable');
    if (relation.status === 'rejected' || relation.status === 'superseded') reasons.push('relation_not_active');
    if (relation.introducedBy === 'aether_candidate' && new Set(relation.supportRefs).size < 2) {
      reasons.push('insufficient_cross_source_support');
    }
    const sources = new Map(input.sources.map((source) => [source.sourceRef, source]));
    for (const ref of relation.supportRefs) {
      const source = sources.get(ref);
      if (!source || source.permission !== 'admitted' || source.status === 'revoked') {
        reasons.push('support_not_admitted:' + ref);
      }
      if (relation.claimTemporalNeed === 'current' && source?.status === 'superseded') {
        reasons.push('current_claim_uses_superseded_support:' + ref);
      }
    }
    const disposition: AetherCandidateDisposition = reasons.length === 0
      ? 'admitted_provisional'
      : reasons.some((r) => r.startsWith('support_') || r.startsWith('current_claim_'))
        ? 'refused_support'
        : reasons.includes('creative_relation_not_permitted')
          ? 'refused_permission'
          : 'refused_relation';

    return {
      candidateRef: 'aether-synthesis:' + relation.relationRef,
      inquiryRef: input.inquiryRef,
      relationRef: relation.relationRef,
      proposition: propositionFor(relation),
      predicate: relation.predicate,
      supportRefs: [...relation.supportRefs],
      criticalSupportRefs: [...relation.criticalSupportRefs],
      counterevidenceRefs: [...relation.counterevidenceRefs],
      temporalNeed: relation.claimTemporalNeed,
      uncertainty: Math.max(relation.uncertainty, 0.2),
      provisional: true,
      persistenceAuthority: false,
      disposition,
      refusalReasons: reasons,
    };
  });
}

export function ablateSynthesisCandidate(
  input: AetherInput,
  candidate: AetherSynthesisCandidate,
  sourceRef: string,
): AetherCandidateAblation {
  const result = ablateAetherSource(input, sourceRef);
  const invalidated = result.invalidatedRelations.includes(candidate.relationRef);
  const critical = candidate.criticalSupportRefs.includes(sourceRef);
  return {
    candidateRef: candidate.candidateRef,
    removedSourceRef: sourceRef,
    before: candidate.disposition === 'admitted_provisional' ? 'present' : 'refused',
    after: candidate.disposition === 'admitted_provisional' && !invalidated ? 'present' : 'absent',
    critical,
    relationInvalidated: invalidated,
  };
}

export function validateSynthesisFalsification(
  input: AetherInput,
  candidates = generateAetherCandidates(input),
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const candidate of candidates) {
    if (!candidate.provisional) errors.push('candidate_not_provisional:' + candidate.candidateRef);
    if (candidate.persistenceAuthority) errors.push('candidate_has_persistence_authority:' + candidate.candidateRef);
    if (candidate.disposition !== 'admitted_provisional') continue;
    if (candidate.criticalSupportRefs.length === 0) {
      errors.push('candidate_has_no_critical_support:' + candidate.candidateRef);
      continue;
    }
    for (const ref of candidate.criticalSupportRefs) {
      const ablation = ablateSynthesisCandidate(input, candidate, ref);
      if (ablation.after !== 'absent' || !ablation.relationInvalidated) {
        errors.push('critical_ablation_failed:' + candidate.candidateRef + ':' + ref);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
