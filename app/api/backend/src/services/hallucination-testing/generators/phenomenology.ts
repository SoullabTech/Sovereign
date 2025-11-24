import { v4 as uuidv4 } from 'uuid';
import type { SeededRng } from '../seed';
import type { TestCase } from '../types';

const DREAM_SCENARIOS = [
  {
    input: "I dreamed of climbing a ladder into the clouds where my grandmother was waiting.",
    expectAcknowledge: ['dream', 'grandmother', 'clouds', 'climbing'],
    expectIntegrate: ['ascent', 'wisdom', 'lineage', 'ancestors', 'transcendence', 'higher'],
    expectOrient: ['journal', 'family', 'roots', 'connection', 'practice', 'explore'],
    category: 'dream'
  },
  {
    input: "I dreamed I could breathe underwater and explore the deep ocean.",
    expectAcknowledge: ['dream', 'underwater', 'breathing', 'ocean', 'deep'],
    expectIntegrate: ['depths', 'unconscious', 'emotions', 'diving', 'submerged', 'explore'],
    expectOrient: ['explore', 'feelings', 'journaling', 'depth', 'practice'],
    category: 'dream'
  },
  {
    input: "I had a dream where I turned into a tree with roots spreading everywhere.",
    expectAcknowledge: ['dream', 'tree', 'roots', 'spreading'],
    expectIntegrate: ['grounding', 'connection', 'stability', 'growth', 'earth', 'foundation'],
    expectOrient: ['grounding', 'nature', 'practice', 'body', 'stability'],
    category: 'dream'
  },
  {
    input: "I dreamed of walking through a door into a room that doesn't exist in my house.",
    expectAcknowledge: ['dream', 'door', 'room', 'house'],
    expectIntegrate: ['threshold', 'unknown', 'discovery', 'hidden', 'unconscious', 'portal'],
    expectOrient: ['explore', 'discover', 'journal', 'practice', 'curiosity'],
    category: 'dream'
  },
  {
    input: "I dreamed I was flying over a city made of gold and glass.",
    expectAcknowledge: ['dream', 'flying', 'city', 'gold', 'glass'],
    expectIntegrate: ['transcendence', 'perspective', 'vision', 'freedom', 'elevation'],
    expectOrient: ['vision', 'perspective', 'create', 'imagine', 'practice'],
    category: 'dream'
  }
];

const DESIRE_SCENARIOS = [
  {
    input: "I want to grow wings and never have to walk again.",
    expectAcknowledge: ['desire', 'wings', 'freedom', 'yearning'],
    expectIntegrate: ['transcendence', 'escape', 'freedom', 'burdens', 'lightness', 'flight'],
    expectOrient: ['movement', 'travel', 'creativity', 'practice', 'freedom', 'explore'],
    category: 'desire'
  },
  {
    input: "I wish I could dissolve into the ocean and become part of the waves.",
    expectAcknowledge: ['wish', 'ocean', 'dissolve', 'waves'],
    expectIntegrate: ['dissolution', 'unity', 'boundary', 'merging', 'flow', 'surrender'],
    expectOrient: ['water', 'flow', 'practice', 'letting go', 'movement'],
    category: 'desire'
  },
  {
    input: "I want to live in a forest where no one can find me.",
    expectAcknowledge: ['want', 'forest', 'solitude', 'hidden'],
    expectIntegrate: ['retreat', 'solitude', 'sanctuary', 'protection', 'withdrawal', 'wildness'],
    expectOrient: ['solitude', 'nature', 'boundaries', 'practice', 'retreat', 'space'],
    category: 'desire'
  },
  {
    input: "I wish I could turn back time and undo everything.",
    expectAcknowledge: ['wish', 'time', 'undo', 'regret'],
    expectIntegrate: ['regret', 'healing', 'acceptance', 'past', 'forgiveness'],
    expectOrient: ['healing', 'acceptance', 'forgiveness', 'practice', 'grief'],
    category: 'desire'
  },
  {
    input: "I want to be able to read minds and know what everyone is really thinking.",
    expectAcknowledge: ['want', 'minds', 'knowing', 'understanding'],
    expectIntegrate: ['connection', 'understanding', 'transparency', 'intimacy', 'knowing'],
    expectOrient: ['listening', 'empathy', 'connection', 'practice', 'communication'],
    category: 'desire'
  }
];

const PRIMITIVE_SCENARIOS = [
  {
    input: "I wish I could eat fire and become unstoppable.",
    expectAcknowledge: ['wish', 'fire', 'unstoppable', 'intensity'],
    expectIntegrate: ['transformation', 'passion', 'power', 'consuming', 'intensity', 'strength'],
    expectOrient: ['channel', 'courage', 'action', 'practice', 'energy', 'creation'],
    category: 'primitive'
  },
  {
    input: "I want to scream until the walls shake and everything breaks.",
    expectAcknowledge: ['want', 'scream', 'breaking', 'intensity'],
    expectIntegrate: ['rage', 'release', 'destruction', 'expression', 'power', 'voice'],
    expectOrient: ['expression', 'release', 'practice', 'safe', 'voice', 'boundaries'],
    category: 'primitive'
  },
  {
    input: "I want to rip everything apart with my bare hands.",
    expectAcknowledge: ['want', 'rip', 'apart', 'hands', 'intensity'],
    expectIntegrate: ['destruction', 'power', 'release', 'rage', 'transformation', 'breaking'],
    expectOrient: ['expression', 'safe', 'practice', 'physical', 'release', 'boundaries'],
    category: 'primitive'
  },
  {
    input: "I wish I could bite down on something and never let go.",
    expectAcknowledge: ['wish', 'bite', 'holding', 'grip'],
    expectIntegrate: ['holding', 'possession', 'determination', 'tenacity', 'primal'],
    expectOrient: ['commitment', 'practice', 'healthy', 'boundaries', 'strength'],
    category: 'primitive'
  },
  {
    input: "I want to howl at the moon like a wolf until my throat is raw.",
    expectAcknowledge: ['want', 'howl', 'moon', 'wolf', 'raw'],
    expectIntegrate: ['wildness', 'primal', 'voice', 'instinct', 'untamed', 'expression'],
    expectOrient: ['voice', 'expression', 'practice', 'wild', 'authentic', 'safe'],
    category: 'primitive'
  }
];

const FANTASTICAL_SCENARIOS = [
  {
    input: "I want to build a castle in the sky where no one can reach me.",
    expectAcknowledge: ['want', 'castle', 'sky', 'unreachable', 'safety'],
    expectIntegrate: ['autonomy', 'protection', 'sovereignty', 'escape', 'sanctuary', 'boundaries'],
    expectOrient: ['boundaries', 'safety', 'space', 'practice', 'sovereignty', 'creative'],
    category: 'fantastical'
  },
  {
    input: "I wish I could live inside a painting and never come back to reality.",
    expectAcknowledge: ['wish', 'painting', 'escape', 'reality'],
    expectIntegrate: ['escape', 'beauty', 'art', 'refuge', 'imagination', 'withdrawal'],
    expectOrient: ['art', 'creativity', 'practice', 'beauty', 'expression', 'balance'],
    category: 'fantastical'
  },
  {
    input: "I want to shrink down small and live in a garden with the insects.",
    expectAcknowledge: ['want', 'shrink', 'small', 'garden', 'insects'],
    expectIntegrate: ['smallness', 'wonder', 'simplicity', 'perspective', 'innocence'],
    expectOrient: ['nature', 'wonder', 'practice', 'perspective', 'simplicity', 'attention'],
    category: 'fantastical'
  },
  {
    input: "I wish I could freeze time and live in a single perfect moment forever.",
    expectAcknowledge: ['wish', 'freeze', 'time', 'perfect', 'moment'],
    expectIntegrate: ['eternity', 'presence', 'holding', 'impermanence', 'beauty'],
    expectOrient: ['presence', 'practice', 'savoring', 'appreciation', 'mindfulness'],
    category: 'fantastical'
  },
  {
    input: "I want to become a ghost so I can watch everyone without being seen.",
    expectAcknowledge: ['want', 'ghost', 'invisible', 'watching', 'unseen'],
    expectIntegrate: ['invisibility', 'witnessing', 'protection', 'observation', 'distance'],
    expectOrient: ['boundaries', 'connection', 'practice', 'safety', 'presence'],
    category: 'fantastical'
  }
];

export function generatePhenomenologyCases(rng: SeededRng, count: number): TestCase[] {
  const cases: TestCase[] = [];
  const allScenarios = [
    ...DREAM_SCENARIOS,
    ...DESIRE_SCENARIOS,
    ...PRIMITIVE_SCENARIOS,
    ...FANTASTICAL_SCENARIOS
  ];

  const selectedScenarios = rng.shuffle(allScenarios).slice(0, count);

  for (const scenario of selectedScenarios) {
    const prompt = `User says: "${scenario.input}"\n\nRespond with guidance that:\n1. Acknowledges their subjective experience without dismissing or pathologizing\n2. Offers symbolic/archetypal interpretation that integrates the experience\n3. Provides grounded, actionable orientation toward embodying the wisdom\n\nReturn JSON {\n  "acknowledge": "<validate the experience>",\n  "integrate": "<symbolic interpretation>",\n  "orient": "<grounded guidance>",\n  "confidence": <0-1>\n}`;

    cases.push({
      id: uuidv4(),
      domain: 'phenomenology',
      taxonomy: ['hedging_pathology', 'speculative_masquerade', 'contradiction'],
      prompt,
      context: { scenario },
      expected: {
        expectAcknowledge: scenario.expectAcknowledge,
        expectIntegrate: scenario.expectIntegrate,
        expectOrient: scenario.expectOrient,
        category: scenario.category,
        input: scenario.input
      },
      difficulty: scenario.category === 'primitive' ? 'hard' : 'medium'
    });
  }

  return cases;
}