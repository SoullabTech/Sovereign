import {
  NODE_BY_ID,
  type PhysicsGroupKey,
  type PhysicsRelation,
} from './physicsFieldData'
import {
  R2C_RELATIONS,
  relationResolution,
  type RelationKind,
} from './livingFieldRelationResolution'

export type CondensationMode = 'specific' | 'bundle' | 'bridge' | 'pattern'
export type RelationStanding = PhysicsRelation['standing']

export type RelationBundle = {
  id: string
  sourceGroup: PhysicsGroupKey
  targetGroup: PhysicsGroupKey
  relationIds: string[]
  relationCount: number
  kindCounts: Partial<Record<RelationKind, number>>
  standingCounts: Partial<Record<RelationStanding, number>>
  kinds: RelationKind[]
  unresolved: boolean
}

export type CondensedPattern = {
  relationCount: number
  crossWorldRelationCount: number
  bridgeCount: number
  unresolvedBridgeCount: number
  kindCounts: Partial<Record<RelationKind, number>>
  standingCounts: Partial<Record<RelationStanding, number>>
  bridgeIds: string[]
}

const GROUP_ORDER: PhysicsGroupKey[] = ['fire', 'water', 'earth', 'air', 'aether']
function normalizedGroupPair(a: PhysicsGroupKey, b: PhysicsGroupKey) {
  const ai = GROUP_ORDER.indexOf(a)
  const bi = GROUP_ORDER.indexOf(b)
  return ai <= bi ? ([a, b] as const) : ([b, a] as const)
}

export function condensationModeForScale(scale: number): CondensationMode {
  if (scale >= 1.58) return 'specific'
  if (scale >= 1.42) return 'bundle'
  if (scale >= 0.92) return 'bridge'
  return 'pattern'
}

export function buildRelationBundles(
  relations: PhysicsRelation[] = R2C_RELATIONS,
): RelationBundle[] {
  const grouped = new Map<string, RelationBundle>()

  for (const relation of relations) {
    const source = NODE_BY_ID.get(relation.source)
    const target = NODE_BY_ID.get(relation.target)
    if (!source || !target || source.group === target.group) continue

    const [sourceGroup, targetGroup] = normalizedGroupPair(source.group, target.group)
    const id = `${sourceGroup}--${targetGroup}`
    const kind = relationResolution(relation).kind
    const current = grouped.get(id) ?? {
      id,
      sourceGroup,
      targetGroup,
      relationIds: [],
      relationCount: 0,
      kindCounts: {},
      standingCounts: {},
      kinds: [],
      unresolved: false,
    }

    current.relationIds.push(relation.id)
    current.relationCount += 1
    current.kindCounts[kind] = (current.kindCounts[kind] ?? 0) + 1
    current.standingCounts[relation.standing] =
      (current.standingCounts[relation.standing] ?? 0) + 1
    if (!current.kinds.includes(kind)) current.kinds.push(kind)
    if (kind === 'tension' || kind === 'contradiction') current.unresolved = true

    grouped.set(id, current)
  }

  return [...grouped.values()].sort((a, b) => a.id.localeCompare(b.id))
}
export function buildCondensedPattern(
  relations: PhysicsRelation[] = R2C_RELATIONS,
): CondensedPattern {
  const bundles = buildRelationBundles(relations)
  const kindCounts: Partial<Record<RelationKind, number>> = {}
  const standingCounts: Partial<Record<RelationStanding, number>> = {}
  let crossWorldRelationCount = 0

  for (const bundle of bundles) {
    crossWorldRelationCount += bundle.relationCount

    for (const [kind, count] of Object.entries(bundle.kindCounts)) {
      const typed = kind as RelationKind
      kindCounts[typed] = (kindCounts[typed] ?? 0) + (count ?? 0)
    }

    for (const [standing, count] of Object.entries(bundle.standingCounts)) {
      const typed = standing as RelationStanding
      standingCounts[typed] = (standingCounts[typed] ?? 0) + (count ?? 0)
    }
  }

  return {
    relationCount: relations.length,
    crossWorldRelationCount,
    bridgeCount: bundles.length,
    unresolvedBridgeCount: bundles.filter((bundle) => bundle.unresolved).length,
    kindCounts,
    standingCounts,
    bridgeIds: bundles.map((bundle) => bundle.id),
  }
}

export function unfoldBundle(
  bundle: RelationBundle,
  relations: PhysicsRelation[] = R2C_RELATIONS,
) {
  const byId = new Map(relations.map((relation) => [relation.id, relation]))
  return bundle.relationIds.flatMap((id) => {
    const relation = byId.get(id)
    return relation ? [relation] : []
  })
}

export function crossWorldRelationCount(relations: PhysicsRelation[] = R2C_RELATIONS) {
  return relations.filter((relation) => {
    const source = NODE_BY_ID.get(relation.source)
    const target = NODE_BY_ID.get(relation.target)
    return Boolean(source && target && source.group !== target.group)
  }).length
}
