import { v4 as uuidv4 } from 'uuid';
import type { SeededRng } from '../seed';
import type { TestCase } from '../types';

const ELEMENTAL_FACETS = [
  { element: 'Fire', phase: 'Vision', key: 'Fire-2', description: 'Transformative energy, creative power, passionate will' },
  { element: 'Fire', phase: 'Ignition', key: 'Fire-1', description: 'Initial spark, beginning impulse, raw energy' },
  { element: 'Water', phase: 'Descent', key: 'Water-2', description: 'Moving into emotional depths, shadow work, dissolution' },
  { element: 'Water', phase: 'Dissolution', key: 'Water-1', description: 'Letting go, emotional release, flow' },
  { element: 'Earth', phase: 'Coagulation', key: 'Earth-3', description: 'Solidification, grounding insights, practical embodiment' },
  { element: 'Earth', phase: 'Foundation', key: 'Earth-1', description: 'Basic needs, physical grounding, stability' },
  { element: 'Air', phase: 'Sublimation', key: 'Air-1', description: 'Rising above, gaining perspective, clarity' },
  { element: 'Air', phase: 'Integration', key: 'Air-3', description: 'Bringing together, synthesis, understanding' },
  { element: 'Aether', phase: 'Unity', key: 'Aether-4', description: 'Transcendence, wholeness, mystery' }
];

const PROMPT_TEMPLATES = [
  (f: typeof ELEMENTAL_FACETS[0]) =>
    `In one sentence, define the ${f.element} element during the ${f.phase} phase. Return JSON {"answer":"","confidence":0-1,"evidence":"","facet":"${f.key}"}.`,

  (f: typeof ELEMENTAL_FACETS[0]) =>
    `A person in ${f.element}/${f.phase} asks for guidance on their current life situation. Provide non-clinical, wisdom-based advice. Return JSON {"answer":"","confidence":0-1,"evidence":"","facet":"${f.key}"}.`,

  (f: typeof ELEMENTAL_FACETS[0]) =>
    `How does ${f.element}/${f.phase} differ from its neighboring phase in the alchemical cycle? Return JSON {"answer":"","confidence":0-1,"evidence":"","facet":"${f.key}"}.`,

  (f: typeof ELEMENTAL_FACETS[0]) =>
    `What wisdom tradition(s) resonate most strongly with ${f.element}/${f.phase}? Return JSON {"answer":"","confidence":0-1,"evidence":"","facet":"${f.key}"}.`,

  (f: typeof ELEMENTAL_FACETS[0]) =>
    `Someone feels stuck in ${f.element}/${f.phase}. What might help them move forward? Return JSON {"answer":"","confidence":0-1,"evidence":"","facet":"${f.key}"}.`
];

export function generateElementalAlchemyCases(rng: SeededRng, count: number): TestCase[] {
  const cases: TestCase[] = [];

  for (let i = 0; i < count; i++) {
    const facet = rng.pick(ELEMENTAL_FACETS);
    const template = rng.pick(PROMPT_TEMPLATES);
    const prompt = template(facet);

    cases.push({
      id: uuidv4(),
      domain: 'alchemy',
      taxonomy: ['retrieval_leakage', 'fact_error', 'speculative_masquerade'],
      prompt,
      context: { facet },
      expected: {
        facetKey: facet.key,
        shouldReferenceFacet: true,
        element: facet.element,
        phase: facet.phase
      },
      difficulty: 'medium'
    });
  }

  return cases;
}