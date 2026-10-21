import {
  assertValidResearchField,
  tracePrimaryEvidence,
  type GestaltProjectionNode,
  type GestaltResearchField,
  type PrimaryEvidenceNode,
  type ResearchNode,
} from './a4-gestalt-prototype';

/**
 * A4 model-facing candidate renderers.
 *
 * OFFLINE RESEARCH ONLY. These functions do not call a model and are not serving code.
 * Both conditions receive the exact same primary-evidence ledger. They differ only in
 * how validated derived structure is exposed above that ledger.
 */

export type A4ContextMode = 'compact_narrative' | 'relational_structure';

export interface RenderedA4Context {
  readonly mode: A4ContextMode;
  readonly targetGestaltId: string;
  readonly evidenceRootIds: readonly string[];
  /** Must be byte-identical across candidate renders for the same field/target. */
  readonly evidenceLedger: string;
  readonly text: string;
  readonly charCount: number;
}

function targetGestalt(field: GestaltResearchField, targetId: string): GestaltProjectionNode {
  assertValidResearchField(field);
  const node = field.nodes.find((candidate) => candidate.id === targetId);
  if (!node || node.kind !== 'gestalt') throw new Error(`${targetId} is not a Gestalt projection`);
  return node;
}

function orderedEvidenceRoots(
  field: GestaltResearchField,
  targetId: string,
): readonly PrimaryEvidenceNode[] {
  const traced = tracePrimaryEvidence(field, targetId);
  const ids = new Set(traced.map((node) => node.id));
  return field.nodes.filter(
    (node): node is PrimaryEvidenceNode => node.kind === 'evidence' && ids.has(node.id),
  );
}

function renderEvidenceLedger(roots: readonly PrimaryEvidenceNode[]): string {
  return roots
    .map((node) => {
      const temporal = node.occurredAt
        ? `time=${node.occurredAt}`
        : `sequence=${String(node.sequence)}`;
      const act = node.speechAct && node.speechAct !== 'statement'
        ? ` act=${node.speechAct}${node.targetIds?.length ? ` targets=${node.targetIds.join(',')}` : ''}`
        : '';
      return [
        `EVIDENCE ${node.id}`,
        `standing=${node.authoredBy}/${node.standing}`,
        temporal,
        `source=${node.sourceRef}${act}`,
        `text=${JSON.stringify(node.content)}`,
      ].join(' | ');
    })
    .join('\n');
}


/**
 * Include only the actual derived support closure of the target Gestalt.
 *
 * Root-subset matching is insufficient: an alternate MAIA interpretation may be grounded
 * in the same primary evidence yet not be part of this Gestalt's support chain. Including
 * it in only the relational condition would create a hidden derived-context confound.
 */
function relevantDerivedNodes(
  field: GestaltResearchField,
  targetId: string,
): readonly Exclude<ResearchNode, PrimaryEvidenceNode | GestaltProjectionNode>[] {
  const byId = new Map(field.nodes.map((node) => [node.id, node] as const));
  const seen = new Set<string>();
  const ordered: Exclude<ResearchNode, PrimaryEvidenceNode | GestaltProjectionNode>[] = [];

  const dependencies = (node: ResearchNode): readonly string[] => {
    switch (node.kind) {
      case 'evidence': return [];
      case 'observation': return node.evidenceIds;
      case 'relation': return [node.fromId, node.toId, ...(node.evidenceIds ?? [])];
      case 'configuration': return node.memberIds;
      case 'temporal_change': return [...node.beforeIds, ...node.afterIds, ...(node.evidenceIds ?? [])];
      case 'gestalt': return [...node.supportIds, ...(node.tensionIds ?? [])];
    }
  };

  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const node = byId.get(id);
    if (!node) throw new Error(`missing A4 renderer dependency ${id}`);
    for (const depId of dependencies(node)) visit(depId);
    if (node.kind !== 'evidence' && node.kind !== 'gestalt') ordered.push(node);
  };

  visit(targetId);
  return ordered;
}

function renderDerivedNode(node: Exclude<ResearchNode, PrimaryEvidenceNode | GestaltProjectionNode>): string {
  switch (node.kind) {
    case 'observation':
      return `OBS ${node.id} [provisional] evidence=${node.evidenceIds.join(',')} :: ${node.claim}`;
    case 'relation':
      return `REL ${node.id} [${node.relation}; provisional] ${node.fromId} -> ${node.toId}${node.evidenceIds?.length ? ` evidence=${node.evidenceIds.join(',')}` : ''} :: ${node.claim}`;
    case 'configuration':
      return `CFG ${node.id} [${node.label}; provisional] members=${node.memberIds.join(',')} :: ${node.claim}`;
    case 'temporal_change':
      return `TIME ${node.id} [${node.change}; provisional] before=${node.beforeIds.join(',')} after=${node.afterIds.join(',')}${node.evidenceIds?.length ? ` evidence=${node.evidenceIds.join(',')}` : ''} :: ${node.claim}`;
  }
}

export function renderCompactNarrativeContext(
  field: GestaltResearchField,
  targetId: string,
): RenderedA4Context {
  const gestalt = targetGestalt(field, targetId);
  const roots = orderedEvidenceRoots(field, targetId);
  const evidenceLedger = renderEvidenceLedger(roots);
  const text = [
    'A4 CONDITION: COMPACT NARRATIVE GESTALT',
    'STATUS: DERIVED · PROVISIONAL · REVISABLE · NOT PRIMARY EVIDENCE',
    '',
    'CURRENT GESTALT',
    gestalt.claim,
    '',
    'PRIMARY EVIDENCE LEDGER — SOURCE STANDING PRESERVED',
    evidenceLedger,
  ].join('\n');

  return {
    mode: 'compact_narrative',
    targetGestaltId: targetId,
    evidenceRootIds: roots.map((node) => node.id),
    evidenceLedger,
    text,
    charCount: text.length,
  };
}

export function renderRelationalStructureContext(
  field: GestaltResearchField,
  targetId: string,
): RenderedA4Context {
  const gestalt = targetGestalt(field, targetId);
  const roots = orderedEvidenceRoots(field, targetId);
  const evidenceLedger = renderEvidenceLedger(roots);
  const derived = relevantDerivedNodes(field, targetId).map(renderDerivedNode).join('\n');
  const text = [
    'A4 CONDITION: RELATIONAL STRUCTURE GESTALT',
    'STATUS: DERIVED · PROVISIONAL · REVISABLE · NOT PRIMARY EVIDENCE',
    '',
    'DIFFERENTIATED DERIVED STRUCTURE',
    derived,
    '',
    'CURRENT GESTALT',
    gestalt.claim,
    '',
    'PRIMARY EVIDENCE LEDGER — SOURCE STANDING PRESERVED',
    evidenceLedger,
  ].join('\n');

  return {
    mode: 'relational_structure',
    targetGestaltId: targetId,
    evidenceRootIds: roots.map((node) => node.id),
    evidenceLedger,
    text,
    charCount: text.length,
  };
}

export function assertEvidenceIdentical(
  left: RenderedA4Context,
  right: RenderedA4Context,
): void {
  if (left.targetGestaltId !== right.targetGestaltId) {
    throw new Error('A4 candidate contexts target different Gestalt projections');
  }
  if (JSON.stringify(left.evidenceRootIds) !== JSON.stringify(right.evidenceRootIds)) {
    throw new Error('A4 candidate contexts do not carry identical primary-evidence roots');
  }
  if (left.evidenceLedger !== right.evidenceLedger) {
    throw new Error('A4 candidate contexts do not carry a byte-identical evidence ledger');
  }
}
