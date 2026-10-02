import {
  PHYSICS_RELATIONS,
  type PhysicsRelation,
} from './physicsFieldData'

export type RelationKind =
  | 'resonance'
  | 'support'
  | 'qualification'
  | 'constraint'
  | 'tension'
  | 'contradiction'
  | 'transformation'
  | 'contextual'

export type SharedMeaningCandidate = {
  label: string
  rationale: string
}

export type RelationResolutionMetadata = {
  kind: RelationKind
  context: string
  provenance: string
  revisability: 'open' | 'member-revisable'
  temporalStanding: 'current prototype'
  counterevidence?: string
  sharedMeaning?: SharedMeaningCandidate
}
export const R2C_PROTOTYPE_RELATIONS: PhysicsRelation[] = [
  {
    id: 'vision-boundary-tension',
    source: 'vision',
    target: 'boundary',
    verb: 'presses against',
    rationale:
      'Vision may ask for expansion while boundary protects integrity. The tension can remain meaningful without immediate resolution.',
    standing: 'prototype',
    strength: 0.66,
    distance: 220,
  },
]

export const R2C_RELATIONS: PhysicsRelation[] = [
  ...PHYSICS_RELATIONS,
  ...R2C_PROTOTYPE_RELATIONS,
]

const DEFAULT_META: RelationResolutionMetadata = {
  kind: 'support',
  context: 'controlled R2C witness field',
  provenance: 'existing controlled prototype relation',
  revisability: 'open',
  temporalStanding: 'current prototype',
}
const META: Record<string, Partial<RelationResolutionMetadata>> = {
  'vision-calling': { kind: 'resonance' },
  'calling-stewardship': {
    kind: 'support',
    sharedMeaning: {
      label: 'Responsible Participation',
      rationale:
        'A calling may become more inhabitable when wholehearted participation is held together with stewardship.',
    },
  },
  'stewardship-boundary': { kind: 'constraint' },
  'boundary-relationship': { kind: 'constraint' },
  'relationship-belonging': { kind: 'resonance' },
  'relationship-grief': { kind: 'transformation' },
  'grief-continuing': { kind: 'transformation' },
  'identity-calling': { kind: 'support' },
  'perspective-discernment': { kind: 'qualification' },
  'creation-launch': { kind: 'transformation' },
  'launch-stewardship': { kind: 'support' },
  'creation-practice': { kind: 'transformation' },
  'practice-embodiment': { kind: 'transformation' },
  'boundary-practice': { kind: 'constraint' },
  'calling-emergence': { kind: 'transformation' },
  'emergence-synthesis': { kind: 'transformation' },
  'coherence-integration': { kind: 'support' },
  'synthesis-vision': { kind: 'resonance' },
  'continuing-integration': { kind: 'support' },
  'discernment-boundary': { kind: 'qualification' },
  'vision-boundary-tension': {
    kind: 'tension',
    provenance: 'R2C witness relation introduced solely to prove productive-tension grammar',
    counterevidence:
      'No claim is made that vision and boundary are always in tension. The relation exists only inside this controlled witness.',
  },
}

export function relationResolution(relation: PhysicsRelation): RelationResolutionMetadata {
  return {
    ...DEFAULT_META,
    ...(META[relation.id] ?? {}),
  }
}
export function r2cRelatedRelations(nodeId: string) {
  return R2C_RELATIONS.filter(
    (relation) => relation.source === nodeId || relation.target === nodeId,
  )
}

export function r2cRelatedNodeIds(nodeId: string) {
  const ids = new Set<string>([nodeId])

  for (const relation of r2cRelatedRelations(nodeId)) {
    ids.add(relation.source)
    ids.add(relation.target)
  }

  return ids
}

export function relationDash(kind: RelationKind) {
  switch (kind) {
    case 'resonance':
      return '2 7'
    case 'qualification':
      return '8 5'
    case 'constraint':
      return '4 4'
    case 'tension':
      return '1.5 4'
    case 'contradiction':
      return '10 4 2 4'
    case 'contextual':
      return '3 6'
    default:
      return undefined
  }
}

export function relationKindLabel(kind: RelationKind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}
