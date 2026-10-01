import {
  FIELD_NODE_BY_KEY,
  FIELD_TREE,
  PHYSICS_NODE_TO_FIELD_KEY,
  type FieldDatum,
} from '../livingFieldHierarchy'
import {
  GROUP_BY_ID,
  NODE_BY_ID,
  type PhysicsGroupKey,
} from './physicsFieldData'
import {
  R2C_RELATIONS,
  relationResolution,
  type RelationKind,
} from './livingFieldRelationResolution'
import { navigationPlanForFieldKey } from './livingFieldNavigation'

export type IlluminationRelation = {
  id: string
  otherKey: string
  otherLabel: string
  otherGroup: PhysicsGroupKey
  verb: string
  kind: RelationKind
  rationale: string
  standing: 'prototype' | 'canonical'
  context: string
  provenance: string
  counterevidence?: string
}

export type IlluminationModel = {
  key: string
  label: string
  inquiry: string
  essence?: string
  contextPath: FieldDatum[]
  children: FieldDatum[]
  element?: { id: PhysicsGroupKey; label: string; essence: string }
  relations: IlluminationRelation[]
  tensions: IlluminationRelation[]
  relatedFields: Array<{ id: PhysicsGroupKey; label: string; essence: string }>
  spatiallyNavigable: boolean
  canEnter: boolean
  contextPathStanding: 'prototype'
  lineageStanding: 'unbound'
  sourceStanding: 'prototype-unbound'
}
const FIELD_KEY_TO_PHYSICS_NODE = new Map(
  Object.entries(PHYSICS_NODE_TO_FIELD_KEY).map(([nodeId, fieldKey]) => [fieldKey, nodeId]),
)

function findContextPath(targetKey: string, node: FieldDatum = FIELD_TREE, path: FieldDatum[] = []): FieldDatum[] | null {
  const next = [...path, node]
  if (node.key === targetKey) return next

  for (const child of node.children ?? []) {
    const found = findContextPath(targetKey, child, next)
    if (found) return found
  }

  return null
}

function physicsNodeIdForFieldKey(key: string) {
  if (NODE_BY_ID.has(key)) return key
  return FIELD_KEY_TO_PHYSICS_NODE.get(key) ?? null
}

function fieldKeyForPhysicsNode(nodeId: string) {
  return PHYSICS_NODE_TO_FIELD_KEY[nodeId] ?? nodeId
}

export function buildIlluminationModel(key: string): IlluminationModel | null {
  const node = FIELD_NODE_BY_KEY.get(key)
  if (!node) return null

  const contextPath = findContextPath(key) ?? [node]
  const physicsNodeId = physicsNodeIdForFieldKey(key)
  const physicsNode = physicsNodeId ? NODE_BY_ID.get(physicsNodeId) ?? null : null
  const relations = physicsNodeId
    ? R2C_RELATIONS
        .filter((relation) => relation.source === physicsNodeId || relation.target === physicsNodeId)
        .flatMap((relation): IlluminationRelation[] => {
          const otherId = relation.source === physicsNodeId ? relation.target : relation.source
          const other = NODE_BY_ID.get(otherId)
          if (!other) return []

          const meta = relationResolution(relation)
          return [{
            id: relation.id,
            otherKey: fieldKeyForPhysicsNode(otherId),
            otherLabel: other.label,
            otherGroup: other.group,
            verb: relation.verb,
            kind: meta.kind,
            rationale: relation.rationale,
            standing: relation.standing,
            context: meta.context,
            provenance: meta.provenance,
            counterevidence: meta.counterevidence,
          }]
        })
    : []

  const elementId = physicsNode?.group
    ?? contextPath
      .map((item) => item.key)
      .find((item): item is PhysicsGroupKey =>
        item === 'fire' || item === 'water' || item === 'earth' || item === 'air' || item === 'aether',
      )

  const element = elementId ? GROUP_BY_ID.get(elementId) : undefined
  const relatedFields = [...new Map(
    relations
      .filter((relation) => relation.otherGroup !== elementId)
      .map((relation) => {
        const group = GROUP_BY_ID.get(relation.otherGroup)
        return group ? [group.id, group] as const : null
      })
      .filter((entry): entry is readonly [PhysicsGroupKey, NonNullable<typeof element>] => Boolean(entry)),
  ).values()]

  return {
    key: node.key,
    label: node.label,
    inquiry: node.inquiry,
    essence: node.essence ?? physicsNode?.essence,
    contextPath,
    children: node.children ?? [],
    element,
    relations,
    tensions: relations.filter((relation) =>
      relation.kind === 'tension' || relation.kind === 'contradiction',
    ),
    relatedFields,
    spatiallyNavigable: Boolean(navigationPlanForFieldKey(node.key)),
    canEnter: Boolean(node.children?.length && navigationPlanForFieldKey(node.key)),
    contextPathStanding: 'prototype',
    lineageStanding: 'unbound',
    sourceStanding: 'prototype-unbound',
  }
}

export function defaultIlluminationKey() {
  return 'calling'
}
