import type {
  EvidenceObject,
  RelationalField,
  ResolveContext,
  ResolvedStanding,
  StandingRelation,
  UseAs,
} from './types';

const MEMBER_STANDING = new Set(['ADOPTS', 'CONFIRMS', 'CORRECTS', 'REFINES', 'SUPERSEDES']);
const GROUNDING_RELATIONS = new Set(['INTERPRETS', 'EVIDENCES', 'ORIGINATES_FROM', 'REFERS_TO']);

function appliesScope(relation: StandingRelation, context: ResolveContext): boolean {
  if (context.asOf && relation.createdAt > context.asOf) return false;
  if (relation.processScope && context.processScope && relation.processScope !== context.processScope) return false;
  if (relation.temporalScope && context.temporalScope && relation.temporalScope !== context.temporalScope) return false;
  return true;
}

function baseline(object: EvidenceObject): UseAs {
  if (object.authoredBy === 'member' && (object.kind === 'member_statement' || object.kind === 'member_act')) {
    return 'established';
  }
  if (object.kind === 'system_fact') return 'established';
  if (object.kind === 'maia_observation' || object.kind === 'maia_interpretation') return 'provisional';
  if (object.kind === 'practitioner_observation') return 'provisional';
  return 'provisional';
}

function sortRelations(relations: readonly StandingRelation[]): StandingRelation[] {
  return [...relations].sort((a, b) => {
    const byTime = a.createdAt.localeCompare(b.createdAt);
    return byTime !== 0 ? byTime : a.id.localeCompare(b.id);
  });
}
export function resolveStandingForObject(
  object: EvidenceObject,
  evidence: readonly EvidenceObject[],
  relations: readonly StandingRelation[],
  context: ResolveContext = {},
): ResolvedStanding {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const applicable = sortRelations(relations.filter((r) => appliesScope(r, context)));
  const incoming = applicable.filter((r) => r.objectId === object.id);
  const outgoingGrounding = applicable.filter(
    (r) => r.subjectId === object.id && GROUNDING_RELATIONS.has(r.predicate),
  );

  let useAs = baseline(object);
  const governing: string[] = [];
  const counters: string[] = [];
  const explanations: string[] = [`baseline:${useAs}`];
  const evidencePath = new Set<string>();

  if (object.authoredBy === 'member' || object.kind === 'system_fact') evidencePath.add(object.id);
  for (const relation of outgoingGrounding) {
    const validBasis = relation.basisIds.filter((id) => evidenceById.has(id));
    if (validBasis.length !== relation.basisIds.length) {
      explanations.push(`invalid-basis:${relation.id}`);
      continue;
    }
    governing.push(relation.id);
    validBasis.forEach((id) => evidencePath.add(id));
    if (evidenceById.has(relation.objectId)) evidencePath.add(relation.objectId);
  }

  if (
    (object.kind === 'maia_interpretation' || object.kind === 'maia_observation') &&
    evidencePath.size === 0
  ) {
    useAs = 'inadmissible';
    explanations.push('no-evidence-descent');
  }
  for (const relation of incoming) {
    const subject = evidenceById.get(relation.subjectId);
    const validBasis = relation.basisIds.every((id) => evidenceById.has(id));
    if (!subject || !validBasis) {
      explanations.push(`invalid-relation:${relation.id}`);
      continue;
    }

    const isMemberAct = relation.actor === 'member' && subject.authoredBy === 'member';
    if (MEMBER_STANDING.has(relation.predicate) && !isMemberAct) {
      explanations.push(`non-member-standing-act:${relation.id}`);
      continue;
    }

    relation.basisIds.forEach((id) => evidencePath.add(id));
    evidencePath.add(subject.id);

    switch (relation.predicate) {
      case 'ADOPTS':
      case 'CONFIRMS':
        useAs = 'adopted';
        governing.push(relation.id);
        explanations.push(`member-${relation.predicate.toLowerCase()}`);
        break;
      case 'CORRECTS':
      case 'SUPERSEDES':
      case 'REFINES':
        useAs = 'historical_only';
        governing.push(relation.id);
        explanations.push(`member-${relation.predicate.toLowerCase()}`);
        break;
      case 'CONTESTS':
        useAs = 'unresolved';
        counters.push(relation.id);
        explanations.push('contested');
        break;
      case 'UNCERTAIN':
        useAs = 'question_only';
        counters.push(relation.id);
        explanations.push('uncertain');
        break;
      default:
        break;
    }
  }
  return {
    objectId: object.id,
    origin: object.authoredBy,
    useAs,
    governingRelationIds: [...new Set(governing)],
    counterRelationIds: [...new Set(counters)],
    evidencePath: [...evidencePath],
    explanationCodes: explanations,
    currentScope: context.processScope ?? object.processScope,
  };
}

export function assembleRelationalField(
  evidence: readonly EvidenceObject[],
  relations: readonly StandingRelation[],
  context: ResolveContext = {},
): RelationalField {
  const visibleEvidence = evidence.filter((item) => {
    if (context.asOf && item.createdAt > context.asOf) return false;
    if (item.processScope && context.processScope && item.processScope !== context.processScope) return false;
    if (item.temporalScope && context.temporalScope && item.temporalScope !== context.temporalScope) return false;
    return true;
  });

  return {
    evidence: visibleEvidence,
    relations: relations.filter((r) => appliesScope(r, context)),
    standing: visibleEvidence.map((object) =>
      resolveStandingForObject(object, visibleEvidence, relations, context),
    ),
    processScope: context.processScope,
    asOf: context.asOf,
  };
}