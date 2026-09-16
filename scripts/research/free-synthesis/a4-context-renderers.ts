import { createHash } from 'node:crypto';
import {
  tracePrimaryEvidence,
  validateResearchField,
  type GestaltResearchField,
  type NodeId,
  type ResearchNode,
} from './a4-gestalt-prototype';

export type RenderedGestaltContext = {
  readonly kind: 'narrative' | 'relational';
  readonly gestaltId: NodeId;
  readonly text: string;
  readonly evidenceIds: readonly NodeId[];
  readonly evidenceDigest: string;
  readonly chars: number;
};

function dependenciesOf(node: ResearchNode): readonly NodeId[] {
  switch (node.kind) {
    case 'evidence': return [];
    case 'observation': return node.evidenceIds;
    case 'relation': return [node.fromId, node.toId, ...(node.evidenceIds ?? [])];
    case 'configuration': return node.memberIds;
    case 'temporal_change': return [...node.beforeIds, ...node.afterIds, ...(node.evidenceIds ?? [])];
    case 'gestalt': return [...node.supportIds, ...(node.tensionIds ?? [])];
  }
}

function indexField(field: GestaltResearchField): Map<NodeId, ResearchNode> {
  return new Map(field.nodes.map((node) => [node.id, node] as const));
}

function collectDerivedClosure(field: GestaltResearchField, gestaltId: NodeId): readonly ResearchNode[] {
  const byId = indexField(field);
  const seen = new Set<NodeId>();
  const ordered: ResearchNode[] = [];
  const visit = (id: NodeId) => {
    if (seen.has(id)) return;
    seen.add(id);
    const node = byId.get(id);
    if (!node) throw new Error(`missing context node ${id}`);
    for (const dep of dependenciesOf(node)) visit(dep);
    if (node.kind !== 'evidence') ordered.push(node);
  };
  visit(gestaltId);
  return ordered;
}

function sortedEvidence(field: GestaltResearchField, gestaltId: NodeId) {
  return [...tracePrimaryEvidence(field, gestaltId)].sort((a, b) => {
    if (a.sequence !== undefined && b.sequence !== undefined) return a.sequence - b.sequence;
    if (a.occurredAt && b.occurredAt) return a.occurredAt.localeCompare(b.occurredAt);
    return a.id.localeCompare(b.id);
  });
}

function evidenceAppendix(field: GestaltResearchField, gestaltId: NodeId) {
  const evidence = sortedEvidence(field, gestaltId);
  const lines = evidence.map((node) => {
    const coordinate = node.sequence !== undefined ? `seq=${node.sequence}` : `time=${node.occurredAt ?? 'unknown'}`;
    return `[${node.id} | author=${node.authoredBy} | standing=${node.standing} | ${coordinate}] ${node.content}`;
  });
  const text = lines.join('\n');
  return {
    evidence,
    text,
    digest: createHash('sha256').update(text).digest('hex'),
  };
}

export function renderNarrativeGestalt(
  field: GestaltResearchField,
  gestaltId: NodeId,
): RenderedGestaltContext {
  const validation = validateResearchField(field);
  if (!validation.ok) throw new Error(JSON.stringify(validation.issues, null, 2));
  const byId = indexField(field);
  const gestalt = byId.get(gestaltId);
  if (!gestalt || gestalt.kind !== 'gestalt') throw new Error(`${gestaltId} is not a Gestalt`);
  const derived = collectDerivedClosure(field, gestaltId);
  const configurations = derived.filter((node) => node.kind === 'configuration');
  const temporal = derived.filter((node) => node.kind === 'temporal_change');
  const appendix = evidenceAppendix(field, gestaltId);

  const text = [
    'DERIVED CONVERSATIONAL GESTALT — PROVISIONAL / MAIA-AUTHORED',
    'This projection organizes evidence; it is not primary evidence and does not override member self-report.',
    '',
    `Current projection: ${gestalt.claim}`,
    '',
    'Developmental organization:',
    ...configurations.map((node) => `- ${node.claim}`),
    ...temporal.map((node) => `- Change: ${node.claim}`),
    '',
    'PRIMARY EVIDENCE — SOURCE STANDING PRESERVED',
    appendix.text,
  ].join('\n');

  return {
    kind: 'narrative', gestaltId, text,
    evidenceIds: appendix.evidence.map((node) => node.id),
    evidenceDigest: appendix.digest,
    chars: text.length,
  };
}

export function renderRelationalGestalt(
  field: GestaltResearchField,
  gestaltId: NodeId,
): RenderedGestaltContext {
  const validation = validateResearchField(field);
  if (!validation.ok) throw new Error(JSON.stringify(validation.issues, null, 2));
  const byId = indexField(field);
  const gestalt = byId.get(gestaltId);
  if (!gestalt || gestalt.kind !== 'gestalt') throw new Error(`${gestaltId} is not a Gestalt`);
  const derived = collectDerivedClosure(field, gestaltId);
  const appendix = evidenceAppendix(field, gestaltId);

  const observations = derived.filter((node) => node.kind === 'observation');
  const relations = derived.filter((node) => node.kind === 'relation');
  const configurations = derived.filter((node) => node.kind === 'configuration');
  const temporal = derived.filter((node) => node.kind === 'temporal_change');

  const text = [
    'DERIVED RELATIONAL FIELD — PROVISIONAL / MAIA-AUTHORED',
    'Relations and configurations organize evidence; they do not become member-authored facts.',
    '',
    `GESTALT ${gestalt.id}: ${gestalt.claim}`,
    '',
    'OBSERVATIONS',
    ...observations.map((node) => `- ${node.id}: ${node.claim}`),
    '',
    'RELATIONS',
    ...relations.map((node) => `- ${node.id} [${node.relation}] ${node.fromId} → ${node.toId}: ${node.claim}`),
    '',
    'CONFIGURATIONS',
    ...configurations.map((node) => `- ${node.id} [${node.label}] members=${node.memberIds.join(',')}: ${node.claim}`),
    '',
    'TEMPORAL CHANGE',
    ...temporal.map((node) => `- ${node.id} [${node.change}]: ${node.claim}`),
    '',
    'PRIMARY EVIDENCE — SOURCE STANDING PRESERVED',
    appendix.text,
  ].join('\n');

  return {
    kind: 'relational', gestaltId, text,
    evidenceIds: appendix.evidence.map((node) => node.id),
    evidenceDigest: appendix.digest,
    chars: text.length,
  };
}
