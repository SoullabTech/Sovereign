// src/utils/facetUtil.ts

// Keyword mapping to Spiralogic facets
const keywordFacetMap: Record<string, string> = {
  purpose: "fire1",
  passion: "fire2",
  vision: "fire3",
  identity: "fire1",
  creativity: "fire2",
  expansion: "fire3",

  emotion: "water1",
  emotions: "water1",
  healing: "water2",
  shadow: "water2",
  subconscious: "water3",
  dreams: "water3",

  structure: "earth2",
  body: "earth1",
  health: "earth3",
  stability: "earth2",
  work: "earth1",
  finances: "earth2",
  routine: "earth3",

  communication: "air1",
  relationships: "air2",
  insight: "air3",
  thinking: "air3",
  clarity: "air1",
  listening: "air2",

  integration: "aether",
  soul: "aether",
  transcendence: "aether",
  wholeness: "aether",
};

// Facet descriptions
const facetDescriptions: Record<string, string> = {
  fire1: "Awakening purpose and identity",
  fire2: "Expressing passion and play",
  fire3: "Expanding vision and higher learning",
  water1: "Emotional intelligence and sensitivity",
  water2: "Healing, transformation, and shadow work",
  water3: "Mystical wisdom and deep unconscious insights",
  earth1: "Grounding through vocation and embodiment",
  earth2: "Stability, structure, and resource alignment",
  earth3: "Resilience through daily rhythms and well-being",
  air1: "Clarity, focus, and personal voice",
  air2: "Relational dynamics and social presence",
  air3: "Mental clarity, higher logic, and imaginative insight",
  aether: "Integration, soul purpose, and unified awareness",
};

/**
 * Detects the likely Spiralogic facet based on input text.
 */
export function detectFacetFromInput(input: string): string {
  const lower = input.toLowerCase();

  for (const keyword in keywordFacetMap) {
    if (lower.includes(keyword)) {
      return keywordFacetMap[keyword];
    }
  }

  return "aether"; // Default fallback
}

/**
 * Retrieves a description for a given Spiralogic facet.
 */
export function getFacetDescription(facet: string): string {
  return facetDescriptions[facet] || "Elemental phase of transformation";
}
