import {
  FIELD_NODE_BY_KEY,
  FIELD_TREE,
  PHYSICS_NODE_TO_FIELD_KEY,
  type FieldDatum,
} from '../livingFieldHierarchy'
import { NODE_BY_ID } from './physicsFieldData'

export type FieldNavigationPlan = {
  targetKey: string
  rootPhysicsNodeId: string
  recursivePathKeys: string[]
  leafKey: string | null
}

const FIELD_KEY_TO_PHYSICS_NODE = new Map(
  Object.entries(PHYSICS_NODE_TO_FIELD_KEY).map(([nodeId, fieldKey]) => [fieldKey, nodeId]),
)

export function contextPathForKey(
  targetKey: string,
  node: FieldDatum = FIELD_TREE,
  path: FieldDatum[] = [],
): FieldDatum[] | null {
  const next = [...path, node]
  if (node.key === targetKey) return next

  for (const child of node.children ?? []) {
    const found = contextPathForKey(targetKey, child, next)
    if (found) return found
  }

  return null
}
function physicsNodeForFieldKey(key: string) {
  if (NODE_BY_ID.has(key)) return key
  return FIELD_KEY_TO_PHYSICS_NODE.get(key) ?? null
}

export function navigationPlanForFieldKey(
  targetKey: string,
): FieldNavigationPlan | null {
  const contextPath = contextPathForKey(targetKey)
  if (!contextPath) return null

  let rootIndex = -1
  let rootPhysicsNodeId: string | null = null

  for (let index = 1; index < contextPath.length; index += 1) {
    const physicsNodeId = physicsNodeForFieldKey(contextPath[index].key)
    if (!physicsNodeId) continue
    rootIndex = index
    rootPhysicsNodeId = physicsNodeId
    break
  }

  if (rootIndex < 0 || !rootPhysicsNodeId) return null

  const target = contextPath[contextPath.length - 1]
  const segment = contextPath.slice(rootIndex)
  const targetCanContain = Boolean(target.children?.length)

  const recursiveNodes = targetCanContain
    ? segment
    : segment.slice(0, -1)

  return {
    targetKey,
    rootPhysicsNodeId,
    recursivePathKeys: recursiveNodes
      .filter((node) => Boolean(node.children?.length))
      .map((node) => node.key),
    leafKey: targetCanContain ? null : target.key,
  }
}
export function resolveNavigationNodes(plan: FieldNavigationPlan) {
  return {
    recursivePath: plan.recursivePathKeys.flatMap((key) => {
      const node = FIELD_NODE_BY_KEY.get(key)
      return node ? [node] : []
    }),
    leaf: plan.leafKey
      ? FIELD_NODE_BY_KEY.get(plan.leafKey) ?? null
      : null,
  }
}
