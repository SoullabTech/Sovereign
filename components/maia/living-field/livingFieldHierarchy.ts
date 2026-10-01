export type FieldDatum = {
  key: string
  label: string
  inquiry: string
  essence?: string
  children?: FieldDatum[]
}

type View = [number, number, number]

export const FIELD_TREE: FieldDatum = {
  key: 'root',
  label: 'Living Field',
  inquiry: 'What is calling from the field?',
  essence: 'A living field of questions, processes, relationships, and possibility.',
  children: [
    {
      key: 'fire',
      label: 'Fire',
      inquiry: 'What wants to begin?',
      essence: 'activation · desire · vision · creation',
      children: [
        {
          key: 'fire-beginning',
          label: 'Beginning',
          inquiry: 'What is becoming alive enough to begin?',
          children: [
            { key: 'ignition', label: 'Ignition', inquiry: 'What has just become alive?' },
            { key: 'courage', label: 'Courage', inquiry: 'What asks to be met directly?' },
            { key: 'desire', label: 'Desire', inquiry: 'What draws life forward?' },
          ],
        },
        {
          key: 'fire-vision',
          label: 'Vision',
          inquiry: 'What is becoming imaginable?',
          children: [
            { key: 'possibility', label: 'Possibility', inquiry: 'What might exist?' },
            { key: 'direction', label: 'Direction', inquiry: 'What gives the energy a direction?' },
            { key: 'image', label: 'Image', inquiry: 'What form can already be sensed?' },
          ],
        },
        {
          key: 'fire-creation',
          label: 'Creation',
          inquiry: 'What wants to enter the world?',
          children: [
            { key: 'prototype', label: 'Prototype', inquiry: 'What small form could teach something?' },
            { key: 'expression', label: 'Expression', inquiry: 'What wants a voice or form?' },
            { key: 'experiment', label: 'Experiment', inquiry: 'What can experience reveal?' },
          ],
        },
      ],
    },
    {
      key: 'water',
      label: 'Water',
      inquiry: 'What is moving, softening, or changing form?',
      essence: 'feeling · relationship · change · release',
      children: [
        {
          key: 'water-feeling',
          label: 'Feeling',
          inquiry: 'What wants to be felt more fully?',
          children: [
            { key: 'longing', label: 'Longing', inquiry: 'What continues to call?' },
            { key: 'tenderness', label: 'Tenderness', inquiry: 'What becomes gentle when approached closely?' },
            { key: 'joy', label: 'Joy', inquiry: 'What is quietly alive here?' },
          ],
        },
        {
          key: 'water-change',
          label: 'Change',
          inquiry: 'What is taking another form?',
          children: [
            { key: 'dissolution', label: 'Dissolution', inquiry: 'What is loosening its former shape?' },
            { key: 'surrender', label: 'Surrender', inquiry: 'What opens through release?' },
            { key: 'threshold', label: 'Threshold', inquiry: 'What is being crossed?' },
          ],
        },
        {
          key: 'water-relationship',
          label: 'Relationship',
          inquiry: 'What is happening in the bond?',
          children: [
            {
              key: 'grief',
              label: 'Grief',
              inquiry: 'What mattered here, and how is relationship changing?',
              children: [
                { key: 'continuing-relation', label: 'Continuing Relation', inquiry: 'How is relationship continuing in a new form?' },
                { key: 'remembrance', label: 'Remembrance', inquiry: 'What is being carried forward?' },
                { key: 'ritual', label: 'Ritual', inquiry: 'What wants form, witness, or honoring?' },
              ],
            },
            { key: 'belonging', label: 'Belonging', inquiry: 'Where is connection felt?' },
            { key: 'intimacy', label: 'Intimacy', inquiry: 'What becomes possible through closeness?' },
          ],
        },
      ],
    },
    {
      key: 'earth',
      label: 'Earth',
      inquiry: 'What wants enough form to become livable?',
      essence: 'form · body · boundary · practice',
      children: [
        {
          key: 'earth-form',
          label: 'Form',
          inquiry: 'What shape could hold this?',
          children: [
            { key: 'vessel', label: 'Vessel', inquiry: 'What can hold this well?' },
            { key: 'structure', label: 'Structure', inquiry: 'What arrangement supports it?' },
            { key: 'boundary', label: 'Boundary', inquiry: 'What limit supports integrity?' },
          ],
        },
        {
          key: 'earth-body',
          label: 'Body',
          inquiry: 'How is this lived physically?',
          children: [
            { key: 'embodiment', label: 'Embodiment', inquiry: 'How does this become lived?' },
            { key: 'rhythm', label: 'Rhythm', inquiry: 'What cadence supports life here?' },
            { key: 'rest', label: 'Rest', inquiry: 'What restores capacity?' },
          ],
        },
        {
          key: 'earth-practice',
          label: 'Practice',
          inquiry: 'What becomes known through doing?',
          children: [
            { key: 'repetition', label: 'Repetition', inquiry: 'What becomes trustworthy through return?' },
            { key: 'craft', label: 'Craft', inquiry: 'What wants careful making?' },
            { key: 'stewardship', label: 'Stewardship', inquiry: 'What asks to be tended over time?' },
          ],
        },
      ],
    },
    {
      key: 'air',
      label: 'Air',
      inquiry: 'What wants to become clearer or more distinct?',
      essence: 'clarity · language · perspective · distinction',
      children: [
        {
          key: 'air-clarity',
          label: 'Clarity',
          inquiry: 'What wants clearer distinction?',
          children: [
            { key: 'differentiation', label: 'Differentiation', inquiry: 'What becomes clearer when seen separately?' },
            { key: 'naming', label: 'Naming', inquiry: 'What changes when it can be named?' },
            { key: 'discernment', label: 'Discernment', inquiry: 'What matters among the possibilities?' },
          ],
        },
        {
          key: 'air-perspective',
          label: 'Perspective',
          inquiry: 'What changes when seen from elsewhere?',
          children: [
            { key: 'reflection', label: 'Reflection', inquiry: 'What did experience reveal?' },
            {
              key: 'identity',
              label: 'Identity',
              inquiry: 'What feels authentic here?',
              children: [
                { key: 'calling', label: 'Calling', inquiry: 'What asks for wholehearted participation?' },
                { key: 'integrity', label: 'Integrity', inquiry: 'What needs to remain aligned?' },
                { key: 'role', label: 'Role', inquiry: 'What role is being inhabited or outgrown?' },
              ],
            },
            { key: 'reframing', label: 'Reframing', inquiry: 'What changes through another frame?' },
          ],
        },
        {
          key: 'air-meaning',
          label: 'Meaning',
          inquiry: 'What becomes intelligible here?',
          children: [
            { key: 'story', label: 'Story', inquiry: 'How is this being narrated?' },
            { key: 'language', label: 'Language', inquiry: 'What words make this more precise?' },
            { key: 'values', label: 'Values', inquiry: 'What matters enough to orient around?' },
          ],
        },
      ],
    },
    {
      key: 'aether',
      label: 'Aether',
      inquiry: 'What is becoming possible between distinct parts?',
      essence: 'relation · integration · emergence · whole',
      children: [
        {
          key: 'aether-relation',
          label: 'Relation',
          inquiry: 'What is happening in the between?',
          children: [
            { key: 'reciprocity', label: 'Reciprocity', inquiry: 'What is moving both ways?' },
            { key: 'participation', label: 'Participation', inquiry: 'How are the parts shaping one another?' },
            { key: 'coherence', label: 'Coherence', inquiry: 'What is beginning to belong together?' },
          ],
        },
        {
          key: 'aether-emergence',
          label: 'Emergence',
          inquiry: 'What is appearing that was not present before?',
          children: [
            { key: 'integration', label: 'Integration', inquiry: 'What can belong together while remaining distinct?' },
            { key: 'synthesis', label: 'Synthesis', inquiry: 'What new possibility is becoming visible?' },
            { key: 'novelty', label: 'Novelty', inquiry: 'What genuinely new form is appearing?' },
          ],
        },
        {
          key: 'aether-whole',
          label: 'Whole',
          inquiry: 'What changes when the larger field is perceived?',
          children: [
            { key: 'pattern', label: 'Pattern', inquiry: 'What repeats across different places?' },
            { key: 'field', label: 'Field', inquiry: 'What becomes visible between the parts?' },
            { key: 'mystery', label: 'Mystery', inquiry: 'What remains open beyond naming?' },
          ],
        },
      ],
    },
  ],
}



export const PHYSICS_NODE_TO_FIELD_KEY: Record<string, string> = {
  vision: 'fire-vision',
  creation: 'fire-creation',
  courage: 'courage',
  relationship: 'water-relationship',
  belonging: 'belonging',
  grief: 'grief',
  continuing: 'continuing-relation',
  stewardship: 'stewardship',
  boundary: 'boundary',
  practice: 'earth-practice',
  embodiment: 'embodiment',
  identity: 'identity',
  calling: 'calling',
  perspective: 'air-perspective',
  discernment: 'discernment',
  integration: 'integration',
  emergence: 'aether-emergence',
  coherence: 'coherence',
  synthesis: 'synthesis',
}

export function flattenFieldTree(root: FieldDatum = FIELD_TREE) {
  const out: FieldDatum[] = []
  const visit = (node: FieldDatum) => {
    out.push(node)
    node.children?.forEach(visit)
  }
  visit(root)
  return out
}

export const FIELD_NODE_BY_KEY = new Map(
  flattenFieldTree().map((node) => [node.key, node]),
)

export function fieldNodeForPhysicsNode(nodeId: string) {
  const key = PHYSICS_NODE_TO_FIELD_KEY[nodeId] ?? nodeId
  return FIELD_NODE_BY_KEY.get(key) ?? null
}
