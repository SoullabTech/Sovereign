export type PhysicsGroupKey = 'fire' | 'water' | 'earth' | 'air' | 'aether'

export type PhysicsGroup = {
  id: PhysicsGroupKey
  label: string
  essence: string
}

export type PhysicsNodeDatum = {
  id: string
  label: string
  inquiry: string
  essence: string
  group: PhysicsGroupKey
}

export type PhysicsRelation = {
  id: string
  source: string
  target: string
  verb: string
  rationale: string
  standing: 'canonical' | 'prototype'
  strength: number
  distance: number
}

export const PHYSICS_GROUPS: PhysicsGroup[] = [
  { id: 'fire', label: 'Fire', essence: 'activation · vision · creation' },
  { id: 'water', label: 'Water', essence: 'feeling · relationship · change' },
  { id: 'earth', label: 'Earth', essence: 'form · stewardship · practice' },
  { id: 'air', label: 'Air', essence: 'clarity · identity · perspective' },
  { id: 'aether', label: 'Aether', essence: 'relation · integration · emergence' },
]

export const GROUP_GEOMETRY: Record<PhysicsGroupKey, { x: number; y: number; r: number }> = {
  earth: { x: 500, y: 150, r: 155 },
  water: { x: 245, y: 340, r: 155 },
  air: { x: 755, y: 340, r: 155 },
  aether: { x: 345, y: 555, r: 155 },
  fire: { x: 655, y: 555, r: 155 },
}

export const PHYSICS_NODES: PhysicsNodeDatum[] = [
  { id: 'vision', label: 'Vision', inquiry: 'What is becoming imaginable?', essence: 'a sensed future taking shape', group: 'fire' },
  { id: 'creation', label: 'Creation', inquiry: 'What wants to enter the world?', essence: 'bringing forth what was not yet formed', group: 'fire' },
  { id: 'courage', label: 'Courage', inquiry: 'What asks to be met directly?', essence: 'energy willing to cross a threshold', group: 'fire' },
  { id: 'launch', label: 'Launch', inquiry: 'What is ready to meet the world?', essence: 'a beginning crossing into public reality', group: 'fire' },

  { id: 'relationship', label: 'Relationship', inquiry: 'What is happening in the bond?', essence: 'the lived reality of the between', group: 'water' },
  { id: 'belonging', label: 'Belonging', inquiry: 'Where is connection felt?', essence: 'participation in a larger relational field', group: 'water' },
  { id: 'grief', label: 'Grief', inquiry: 'What mattered, and how is relationship changing?', essence: 'love meeting irreversible change', group: 'water' },
  { id: 'continuing', label: 'Continuing Relation', inquiry: 'How does relationship continue in a new form?', essence: 'relation carried forward through altered presence', group: 'water' },

  { id: 'stewardship', label: 'Stewardship', inquiry: 'What asks to be tended over time?', essence: 'responsibility for what has been entrusted', group: 'earth' },
  { id: 'boundary', label: 'Boundary', inquiry: 'What limit supports integrity?', essence: 'a form that protects what matters', group: 'earth' },
  { id: 'practice', label: 'Practice', inquiry: 'What becomes known through doing?', essence: 'repeated embodied participation', group: 'earth' },
  { id: 'embodiment', label: 'Embodiment', inquiry: 'How does this become lived?', essence: 'meaning given bodily and practical form', group: 'earth' },

  { id: 'identity', label: 'Identity', inquiry: 'What feels authentically mine?', essence: 'the continuity through which self is recognized', group: 'air' },
  { id: 'calling', label: 'Calling', inquiry: 'What asks for wholehearted participation?', essence: 'a direction experienced as deeply meaningful', group: 'air' },
  { id: 'perspective', label: 'Perspective', inquiry: 'What changes when this is seen from elsewhere?', essence: 'another angle of regard', group: 'air' },
  { id: 'discernment', label: 'Discernment', inquiry: 'What matters among the possibilities?', essence: 'clearer distinction among competing directions', group: 'air' },

  { id: 'integration', label: 'Integration', inquiry: 'What can belong together while remaining distinct?', essence: 'coherence that preserves difference', group: 'aether' },
  { id: 'emergence', label: 'Emergence', inquiry: 'What is appearing that was not present before?', essence: 'novelty arising through relation', group: 'aether' },
  { id: 'coherence', label: 'Coherence', inquiry: 'What is beginning to belong together?', essence: 'a pattern that holds without flattening difference', group: 'aether' },
  { id: 'synthesis', label: 'Synthesis', inquiry: 'What new possibility becomes visible between these?', essence: 'a generative relation producing another possibility', group: 'aether' },
]

export const PHYSICS_RELATIONS: PhysicsRelation[] = [
  {
    id: 'vision-calling',
    source: 'vision',
    target: 'calling',
    verb: 'invites',
    rationale: 'A vision can become more consequential when it begins to feel like a calling rather than only an idea.',
    standing: 'prototype',
    strength: 0.9,
    distance: 150,
  },
  {
    id: 'calling-stewardship',
    source: 'calling',
    target: 'stewardship',
    verb: 'asks for',
    rationale: 'What feels called into being also asks how it will be held, tended, and made responsible.',
    standing: 'prototype',
    strength: 1,
    distance: 145,
  },
  {
    id: 'stewardship-boundary',
    source: 'stewardship',
    target: 'boundary',
    verb: 'requires',
    rationale: 'Stewardship often becomes practical through limits that protect attention, responsibility, and integrity.',
    standing: 'prototype',
    strength: 0.95,
    distance: 115,
  },
  {
    id: 'boundary-relationship',
    source: 'boundary',
    target: 'relationship',
    verb: 'protects',
    rationale: 'A boundary can give relationship enough differentiation for both sides to remain present.',
    standing: 'prototype',
    strength: 0.9,
    distance: 145,
  },
  {
    id: 'relationship-belonging',
    source: 'relationship',
    target: 'belonging',
    verb: 'deepens',
    rationale: 'Relationship can become a lived sense of participation and belonging.',
    standing: 'prototype',
    strength: 0.8,
    distance: 110,
  },
  {
    id: 'relationship-grief',
    source: 'relationship',
    target: 'grief',
    verb: 'is changed by',
    rationale: 'Grief can reveal how strongly relationship matters when its form changes.',
    standing: 'prototype',
    strength: 0.9,
    distance: 115,
  },
  {
    id: 'grief-continuing',
    source: 'grief',
    target: 'continuing',
    verb: 'opens toward',
    rationale: 'Grief may open inquiry into the ways relationship continues through memory, influence, ritual, or love.',
    standing: 'prototype',
    strength: 0.9,
    distance: 115,
  },
  {
    id: 'identity-calling',
    source: 'identity',
    target: 'calling',
    verb: 'expresses through',
    rationale: 'Calling may become one way an emerging identity seeks participation in the world.',
    standing: 'prototype',
    strength: 0.95,
    distance: 110,
  },
  {
    id: 'perspective-discernment',
    source: 'perspective',
    target: 'discernment',
    verb: 'clarifies',
    rationale: 'A wider perspective can create enough distance to distinguish what matters.',
    standing: 'prototype',
    strength: 0.75,
    distance: 110,
  },
  {
    id: 'creation-launch',
    source: 'creation',
    target: 'launch',
    verb: 'moves toward',
    rationale: 'Creation becomes public when something is ready to cross from making into encounter.',
    standing: 'prototype',
    strength: 0.9,
    distance: 115,
  },
  {
    id: 'launch-stewardship',
    source: 'launch',
    target: 'stewardship',
    verb: 'depends on',
    rationale: 'A launch becomes sustainable when the work can be tended after the threshold is crossed.',
    standing: 'prototype',
    strength: 0.95,
    distance: 150,
  },
  {
    id: 'creation-practice',
    source: 'creation',
    target: 'practice',
    verb: 'becomes',
    rationale: 'Repeated practice can turn creative impulse into a form that can live over time.',
    standing: 'prototype',
    strength: 0.8,
    distance: 150,
  },
  {
    id: 'practice-embodiment',
    source: 'practice',
    target: 'embodiment',
    verb: 'grounds',
    rationale: 'Practice becomes embodied as learning moves from concept into lived capacity.',
    standing: 'prototype',
    strength: 0.85,
    distance: 110,
  },
  {
    id: 'boundary-practice',
    source: 'boundary',
    target: 'practice',
    verb: 'structures',
    rationale: 'Boundaries can create the repeatable conditions in which a practice becomes possible.',
    standing: 'prototype',
    strength: 0.78,
    distance: 110,
  },
  {
    id: 'calling-emergence',
    source: 'calling',
    target: 'emergence',
    verb: 'may catalyze',
    rationale: 'A calling can draw several existing strands into a form that did not previously exist.',
    standing: 'prototype',
    strength: 0.72,
    distance: 160,
  },
  {
    id: 'emergence-synthesis',
    source: 'emergence',
    target: 'synthesis',
    verb: 'opens into',
    rationale: 'Emergence becomes synthesis when a new relation can be named and held without erasing its sources.',
    standing: 'prototype',
    strength: 0.85,
    distance: 110,
  },
  {
    id: 'coherence-integration',
    source: 'coherence',
    target: 'integration',
    verb: 'supports',
    rationale: 'Coherence can make integration possible while preserving the distinctions that matter.',
    standing: 'prototype',
    strength: 0.8,
    distance: 110,
  },
  {
    id: 'synthesis-vision',
    source: 'synthesis',
    target: 'vision',
    verb: 'renews',
    rationale: 'A synthesis can reopen vision by revealing a possibility that was not visible before.',
    standing: 'prototype',
    strength: 0.72,
    distance: 155,
  },
  {
    id: 'continuing-integration',
    source: 'continuing',
    target: 'integration',
    verb: 'participates in',
    rationale: 'Continuing relation may become part of a larger integration rather than remaining isolated as memory.',
    standing: 'prototype',
    strength: 0.65,
    distance: 160,
  },
  {
    id: 'discernment-boundary',
    source: 'discernment',
    target: 'boundary',
    verb: 'informs',
    rationale: 'Discernment can reveal which limits support integrity and which merely constrain movement.',
    standing: 'prototype',
    strength: 0.75,
    distance: 145,
  },
]

export const NODE_BY_ID = new Map(PHYSICS_NODES.map((node) => [node.id, node]))
export const GROUP_BY_ID = new Map(PHYSICS_GROUPS.map((group) => [group.id, group]))

export function relatedRelations(nodeId: string) {
  return PHYSICS_RELATIONS.filter((relation) => relation.source === nodeId || relation.target === nodeId)
}

export function relatedNodeIds(nodeId: string) {
  const ids = new Set<string>([nodeId])
  for (const relation of relatedRelations(nodeId)) {
    ids.add(relation.source)
    ids.add(relation.target)
  }
  return ids
}
