import type { PhysicsNodeDatum } from './physicsFieldData'

export type SemanticLod = 0 | 1 | 2 | 3 | 4 | 5

export type PortalCue = {
  nodeId: string
  roomId: string
  roomLabel: string
  rationale: string
  standing: 'prototype'
}

export const LOD_LABELS: Record<SemanticLod, string> = {
  0: 'Whole ecology',
  1: 'Worlds',
  2: 'Regional cells',
  3: 'Local neighborhood',
  4: 'Relational meaning',
  5: 'Evidence / provenance',
}
export function resolveSemanticLod(
  scale: number,
  hasWorldFocus: boolean,
  hasNodeFocus: boolean,
  hasRelationFocus = false,
): SemanticLod {
  let lod: SemanticLod =
    scale < 1.08 ? 0 :
    scale < 1.36 ? 1 :
    scale < 1.76 ? 2 :
    scale < 2.18 ? 3 :
    scale < 2.72 ? 4 : 5

  if (hasWorldFocus && lod < 2) lod = 2
  if (hasNodeFocus && lod < 3) lod = 3
  if (hasRelationFocus && lod < 4) lod = 4

  return lod
}

export function nodeLabelStanding(
  node: PhysicsNodeDatum,
  lod: SemanticLod,
  isActive: boolean,
  isFocusedWorld: boolean,
) {
  if (isActive) return 1
  if (lod <= 0) return 0
  if (lod === 1) return isFocusedWorld ? 0.62 : 0
  if (lod === 2) return isFocusedWorld ? 0.88 : 0.18
  return isFocusedWorld ? 0.94 : 0.34
}

export const PORTAL_CUES: PortalCue[] = [
  {
    nodeId: 'relationship',
    roomId: 'relationships',
    roomLabel: 'Relationships',
    rationale: 'This inquiry is already about the lived between. The Relationships room can continue it in a dedicated relational workspace.',
    standing: 'prototype',
  },
  {
    nodeId: 'practice',
    roomId: 'practice',
    roomLabel: 'Practice',
    rationale: 'This locus concerns what becomes known through doing. Practice can continue the inquiry through enactment rather than reflection alone.',
    standing: 'prototype',
  },
  {
    nodeId: 'vision',
    roomId: 'vision-studio',
    roomLabel: 'Vision Studio',
    rationale: 'This locus concerns what is becoming imaginable. Vision Studio can continue that emerging possibility in its own working space.',
    standing: 'prototype',
  },
  {
    nodeId: 'grief',
    roomId: 'journal',
    roomLabel: 'Journal',
    rationale: 'This locus carries lived experience and changing meaning. Journal can continue it through member-authored reflection.',
    standing: 'prototype',
  },
]

export const PORTAL_BY_NODE = new Map(
  PORTAL_CUES.map((portal) => [portal.nodeId, portal]),
)
