/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A4
 *
 * OFFLINE RESEARCH ONLY. This module is intentionally located under scripts/research
 * and must not be imported by a serving path.
 *
 * The representation follows the programme pipeline in one direction only:
 *
 *   primary evidence
 *     -> differentiated observation
 *     -> typed relation
 *     -> optional higher-order configuration
 *     -> temporal change
 *     -> provisional Gestalt projection
 *
 * Every derived claim must descend to primary evidence. A Gestalt projection is a
 * terminal interpretation: it may supersede an earlier Gestalt, but it may never use
 * an earlier Gestalt as evidence for a new claim.
 */

export type NodeId = string;

export type EvidenceAuthor =
  | 'member'
  | 'maia'
  | 'practitioner'
  | 'system'
  | 'house'
  | 'collective';

export type EvidenceStanding =
  | 'self_report'
  | 'authored'
  | 'witnessed'
  | 'computed'
  | 'inferred'
  | 'recorded';

export interface PrimaryEvidenceNode {
  readonly kind: 'evidence';
  readonly id: NodeId;
  /** Pointer to the unrewritten source record or synthetic fixture. */
  readonly sourceRef: string;
  readonly occurredAt: string;
  readonly authoredBy: EvidenceAuthor;
  readonly standing: EvidenceStanding;
  readonly admissibility: string;
  /** Raw source text. Derived nodes never replace this. */
  readonly content: string;
}

export interface ObservationNode {
  readonly kind: 'observation';
  readonly id: NodeId;
  readonly claim: string;
  /** Observations are directly accountable to primary evidence. */
  readonly evidenceIds: readonly NodeId[];
  readonly provisional: true;
}

export type RelationKind =
  | 'echoes'
  | 'contrasts'
  | 'develops'
  | 'corrects'
  | 'adopts'
  | 'withdraws'
  | 'situates'
  | 'transforms'
  | 'co_occurs'
  | 'other';

export interface RelationNode {
  readonly kind: 'relation';
  readonly id: NodeId;
  readonly relation: RelationKind;
  readonly fromId: NodeId;
  readonly toId: NodeId;
  readonly claim: string;
  /** Extra direct evidence, if the relation itself depends on a source beyond its endpoints. */
  readonly evidenceIds?: readonly NodeId[];
  readonly provisional: true;
}

export interface ConfigurationNode {
  readonly kind: 'configuration';
  readonly id: NodeId;
  /** Deliberately free-form: A4 does not constitutionalize a configuration taxonomy. */
  readonly label: string;
  readonly claim: string;
  readonly memberIds: readonly NodeId[];
  readonly provisional: true;
}

export type TemporalChangeKind =
  | 'emerged'
  | 'persisted'
  | 'strengthened'
  | 'weakened'
  | 'reversed'
  | 'reorganized'
  | 'displaced'
  | 'other';

export interface TemporalChangeNode {
  readonly kind: 'temporal_change';
  readonly id: NodeId;
  readonly change: TemporalChangeKind;
  readonly claim: string;
  readonly beforeIds: readonly NodeId[];
  readonly afterIds: readonly NodeId[];
  readonly evidenceIds?: readonly NodeId[];
  readonly provisional: true;
}

export interface GestaltProjectionNode {
  readonly kind: 'gestalt';
  readonly id: NodeId;
  readonly asOf: string;
  readonly claim: string;
  /** Positive support for the current projection. Must be non-Gestalt nodes. */
  readonly supportIds: readonly NodeId[];
  /** Preserved contradiction/tension that the projection must not synthesize away. */
  readonly tensionIds?: readonly NodeId[];
  /** Revision lineage only. These ids are NOT evidentiary dependencies. */
  readonly supersedesGestaltIds?: readonly NodeId[];
  readonly provisional: true;
}

export type ResearchNode =
  | PrimaryEvidenceNode
  | ObservationNode
  | RelationNode
  | ConfigurationNode
  | TemporalChangeNode
  | GestaltProjectionNode;

export interface GestaltResearchField {
  readonly version: 'A4.v0';
  readonly nodes: readonly ResearchNode[];
}

export type ValidationIssueCode =
  | 'duplicate_id'
  | 'missing_dependency'
  | 'empty_dependency_set'
  | 'non_reversible_stage_order'
  | 'gestalt_as_evidence'
  | 'invalid_supersedes_target'
  | 'self_supersedes'
  | 'no_primary_evidence_descent';

export interface ValidationIssue {
  readonly code: ValidationIssueCode;
  readonly nodeId: NodeId;
  readonly detail: string;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ValidationIssue[];
}

const STAGE_RANK: Record<ResearchNode['kind'], number> = {
  evidence: 0,
  observation: 1,
  relation: 2,
  configuration: 3,
  temporal_change: 4,
  gestalt: 5,
};

function dependenciesOf(node: ResearchNode): readonly NodeId[] {
  switch (node.kind) {
    case 'evidence':
      return [];
    case 'observation':
      return node.evidenceIds;
    case 'relation':
      return [node.fromId, node.toId, ...(node.evidenceIds ?? [])];
    case 'configuration':
      return node.memberIds;
    case 'temporal_change':
      return [...node.beforeIds, ...node.afterIds, ...(node.evidenceIds ?? [])];
    case 'gestalt':
      return [...node.supportIds, ...(node.tensionIds ?? [])];
  }
}

function requiresDependencies(node: ResearchNode): boolean {
  return node.kind !== 'evidence';
}

/**
 * Validate reversibility without assigning truth to any derived claim.
 *
 * Stage order is strict. A later interpretive layer may depend only on earlier layers.
 * This makes cycles and derived-self-bootstrapping invalid by construction while still
 * allowing a later Gestalt to supersede an earlier Gestalt as non-evidentiary lineage.
 */
export function validateResearchField(field: GestaltResearchField): ValidationResult {
  const issues: ValidationIssue[] = [];
  const byId = new Map<NodeId, ResearchNode>();
  const issueKeys = new Set<string>();

  const addIssue = (issue: ValidationIssue) => {
    const key = `${issue.code}:${issue.nodeId}:${issue.detail}`;
    if (issueKeys.has(key)) return;
    issueKeys.add(key);
    issues.push(issue);
  };

  for (const node of field.nodes) {
    if (byId.has(node.id)) {
      addIssue({
        code: 'duplicate_id',
        nodeId: node.id,
        detail: `node id ${node.id} occurs more than once`,
      });
      continue;
    }
    byId.set(node.id, node);
  }

  for (const node of field.nodes) {
    const deps = dependenciesOf(node);

    if (requiresDependencies(node) && deps.length === 0) {
      addIssue({
        code: 'empty_dependency_set',
        nodeId: node.id,
        detail: `${node.kind} must cite at least one earlier node`,
      });
    }

    for (const depId of deps) {
      const dep = byId.get(depId);
      if (!dep) {
        addIssue({
          code: 'missing_dependency',
          nodeId: node.id,
          detail: `dependency ${depId} does not exist`,
        });
        continue;
      }

      if (dep.kind === 'gestalt') {
        addIssue({
          code: 'gestalt_as_evidence',
          nodeId: node.id,
          detail: `derived Gestalt ${depId} cannot be evidentiary support`,
        });
      }

      if (STAGE_RANK[dep.kind] >= STAGE_RANK[node.kind]) {
        addIssue({
          code: 'non_reversible_stage_order',
          nodeId: node.id,
          detail: `${node.kind} cannot depend on same/later-stage ${dep.kind} ${depId}`,
        });
      }
    }

    if (node.kind === 'gestalt') {
      for (const supersededId of node.supersedesGestaltIds ?? []) {
        if (supersededId === node.id) {
          addIssue({
            code: 'self_supersedes',
            nodeId: node.id,
            detail: 'a Gestalt cannot supersede itself',
          });
          continue;
        }

        const superseded = byId.get(supersededId);
        if (!superseded || superseded.kind !== 'gestalt') {
          addIssue({
            code: 'invalid_supersedes_target',
            nodeId: node.id,
            detail: `supersedes target ${supersededId} is not an existing Gestalt`,
          });
        }
      }
    }
  }

  const primaryMemo = new Map<NodeId, Set<NodeId>>();

  const collectPrimary = (nodeId: NodeId): Set<NodeId> => {
    const cached = primaryMemo.get(nodeId);
    if (cached) return new Set(cached);

    const node = byId.get(nodeId);
    if (!node) return new Set<NodeId>();
    if (node.kind === 'evidence') {
      const only = new Set<NodeId>([node.id]);
      primaryMemo.set(nodeId, only);
      return new Set(only);
    }

    const result = new Set<NodeId>();
    for (const depId of dependenciesOf(node)) {
      const dep = byId.get(depId);
      if (!dep || dep.kind === 'gestalt') continue;
      for (const evidenceId of collectPrimary(depId)) result.add(evidenceId);
    }
    primaryMemo.set(nodeId, result);
    return new Set(result);
  };

  for (const node of field.nodes) {
    if (node.kind === 'evidence') continue;
    if (collectPrimary(node.id).size === 0) {
      addIssue({
        code: 'no_primary_evidence_descent',
        nodeId: node.id,
        detail: `${node.kind} does not descend to any primary evidence`,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}

export function assertValidResearchField(field: GestaltResearchField): void {
  const result = validateResearchField(field);
  if (result.ok) return;
  const details = result.issues
    .map((issue) => `${issue.code}(${issue.nodeId}): ${issue.detail}`)
    .join('\n');
  throw new Error(`invalid A4 research field:\n${details}`);
}

/** Return the primary evidence records to which a node is reversibly accountable. */
export function tracePrimaryEvidence(
  field: GestaltResearchField,
  nodeId: NodeId,
): readonly PrimaryEvidenceNode[] {
  assertValidResearchField(field);
  const byId = new Map(field.nodes.map((node) => [node.id, node] as const));
  if (!byId.has(nodeId)) throw new Error(`unknown A4 node: ${nodeId}`);

  const evidenceIds = new Set<NodeId>();
  const visit = (id: NodeId) => {
    const node = byId.get(id);
    if (!node) return;
    if (node.kind === 'evidence') {
      evidenceIds.add(node.id);
      return;
    }
    for (const depId of dependenciesOf(node)) visit(depId);
  };

  visit(nodeId);

  return [...evidenceIds]
    .map((id) => byId.get(id))
    .filter((node): node is PrimaryEvidenceNode => node?.kind === 'evidence');
}

/**
 * Compare the evidentiary roots of two Gestalt projections without treating either
 * projection as evidence. Useful for FS-F6 Gestalt-reversal replay.
 */
export function compareGestaltEvidenceRoots(
  field: GestaltResearchField,
  earlierGestaltId: NodeId,
  laterGestaltId: NodeId,
): {
  readonly earlier: readonly NodeId[];
  readonly later: readonly NodeId[];
  readonly added: readonly NodeId[];
  readonly dropped: readonly NodeId[];
} {
  const earlier = tracePrimaryEvidence(field, earlierGestaltId).map((node) => node.id);
  const later = tracePrimaryEvidence(field, laterGestaltId).map((node) => node.id);
  const earlierSet = new Set(earlier);
  const laterSet = new Set(later);

  return {
    earlier,
    later,
    added: later.filter((id) => !earlierSet.has(id)),
    dropped: earlier.filter((id) => !laterSet.has(id)),
  };
}
