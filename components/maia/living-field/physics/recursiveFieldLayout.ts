import type { FieldDatum } from '../livingFieldHierarchy'

export type RecursivePoint = { x: number; y: number; z: number }

export function recursiveChildHome(
  parent: FieldDatum,
  childKey: string,
): RecursivePoint | null {
  const children = parent.children ?? []
  const index = children.findIndex((child) => child.key === childKey)
  if (index < 0) return null

  const count = Math.max(children.length, 1)
  const angle = -Math.PI / 2 + index * (Math.PI * 2 / count)
  const ring = count <= 3 ? 1.35 : 1.55

  return {
    x: Math.cos(angle) * ring,
    y: Math.sin(angle) * ring,
    z: 0.58,
  }
}

export function recursivePathOffset(path: FieldDatum[]): RecursivePoint {
  const point = { x: 0, y: 0, z: 0 }

  for (let index = 0; index < path.length - 1; index += 1) {
    const home = recursiveChildHome(path[index], path[index + 1].key)
    if (!home) continue
    point.x += home.x
    point.y += home.y
    point.z += 0.15
  }

  return point
}
