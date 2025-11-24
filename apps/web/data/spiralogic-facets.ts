// Simplified spiralogic facets data for the holoflower components

export const SPIRALOGIC_FACETS = [
  {
    id: 'fire-vision',
    element: 'fire',
    stage: 1,
    essence: 'Creative Vision',
    practice: 'Ignite your creative flame',
    angle: { start: 0, end: Math.PI / 6 },
    color: { glow: '#ff6b35' }
  },
  {
    id: 'fire-action',
    element: 'fire', 
    stage: 2,
    essence: 'Inspired Action',
    practice: 'Channel fire into form',
    angle: { start: Math.PI / 6, end: Math.PI / 3 },
    color: { glow: '#ff8c42' }
  },
  {
    id: 'air-communication',
    element: 'air',
    stage: 3,
    essence: 'Clear Communication',
    practice: 'Speak your truth',
    angle: { start: Math.PI / 3, end: Math.PI / 2 },
    color: { glow: '#4ecdc4' }
  },
  {
    id: 'air-wisdom',
    element: 'air',
    stage: 4,
    essence: 'Higher Wisdom',
    practice: 'Rise above the patterns',
    angle: { start: Math.PI / 2, end: 2 * Math.PI / 3 },
    color: { glow: '#45b7d1' }
  },
  {
    id: 'water-emotion',
    element: 'water',
    stage: 5,
    essence: 'Emotional Flow',
    practice: 'Feel without drowning',
    angle: { start: 2 * Math.PI / 3, end: 5 * Math.PI / 6 },
    color: { glow: '#6a4c93' }
  },
  {
    id: 'water-intuition',
    element: 'water',
    stage: 6,
    essence: 'Deep Intuition',
    practice: 'Trust your inner knowing',
    angle: { start: 5 * Math.PI / 6, end: Math.PI },
    color: { glow: '#9b59b6' }
  },
  {
    id: 'earth-grounding',
    element: 'earth',
    stage: 7,
    essence: 'Sacred Grounding',
    practice: 'Root into presence',
    angle: { start: Math.PI, end: 7 * Math.PI / 6 },
    color: { glow: '#8b4513' }
  },
  {
    id: 'earth-manifestation',
    element: 'earth',
    stage: 8,
    essence: 'Physical Manifestation',
    practice: 'Bring spirit into matter',
    angle: { start: 7 * Math.PI / 6, end: 4 * Math.PI / 3 },
    color: { glow: '#d4b896' }
  }
];

export function getFacetById(id: string) {
  return SPIRALOGIC_FACETS.find(facet => facet.id === id) || SPIRALOGIC_FACETS[0];
}
