// src/constants/elementalFacetMap.ts

export const elementalFacetMap = {
  fire: {
    name: "Fire",
    facets: [
      {
        id: "fire-1",
        name: "Spark",
        phase: "Intelligence",
        description: "Initial inspiration, ignition, or instinctive drive.",
        tarot: "The Fool",
        hexagram: "1 - Creative Force",
      },
      {
        id: "fire-2",
        name: "Flame",
        phase: "Intention",
        description: "Focused energy, courage, passion, and risk-taking.",
        tarot: "Strength",
        hexagram: "30 - Radiance",
      },
      {
        id: "fire-3",
        name: "Inferno",
        phase: "Goal",
        description:
          "Transformation through trial, willpower, and breakthrough.",
        tarot: "Tower",
        hexagram: "49 - Revolution",
      },
    ],
  },
  water: {
    name: "Water",
    facets: [
      {
        id: "water-1",
        name: "Tide",
        phase: "Intelligence",
        description: "Emotion, intuition, and deep receptivity.",
        tarot: "Moon",
        hexagram: "29 - Abyss",
      },
      {
        id: "water-2",
        name: "Abyss",
        phase: "Intention",
        description: "Shadow work, death and rebirth, deep transformation.",
        tarot: "Death",
        hexagram: "59 - Dispersion",
      },
      {
        id: "water-3",
        name: "Spring",
        phase: "Goal",
        description: "Regeneration, compassion, and emotional clarity.",
        tarot: "Star",
        hexagram: "3 - Sprouting",
      },
    ],
  },
  earth: {
    name: "Earth",
    facets: [
      {
        id: "earth-1",
        name: "Seed",
        phase: "Intelligence",
        description: "Stability, core values, and grounded beginning.",
        tarot: "Empress",
        hexagram: "2 - Receptive Force",
      },
      {
        id: "earth-2",
        name: "Structure",
        phase: "Intention",
        description: "Discipline, form, and manifestation of plans.",
        tarot: "Emperor",
        hexagram: "52 - Keeping Still",
      },
      {
        id: "earth-3",
        name: "Harvest",
        phase: "Goal",
        description: "Completion, abundance, and sustainable results.",
        tarot: "World",
        hexagram: "11 - Peace",
      },
    ],
  },
  air: {
    name: "Air",
    facets: [
      {
        id: "air-1",
        name: "Idea",
        phase: "Intelligence",
        description: "Conceptual clarity, insight, and mental spark.",
        tarot: "Magician",
        hexagram: "43 - Breakthrough",
      },
      {
        id: "air-2",
        name: "Dialogue",
        phase: "Intention",
        description: "Communication, learning, and shared understanding.",
        tarot: "Lovers",
        hexagram: "20 - Contemplation",
      },
      {
        id: "air-3",
        name: "Vision",
        phase: "Goal",
        description: "Integration of knowledge into guiding principles.",
        tarot: "Judgement",
        hexagram: "9 - Taming Power of the Small",
      },
    ],
  },
  aether: {
    name: "Aether",
    facets: [
      {
        id: "aether-1",
        name: "Presence",
        phase: "Intelligence",
        description: "Unified awareness, soul signal, and coherence.",
        tarot: "High Priestess",
        hexagram: "61 - Inner Truth",
      },
      {
        id: "aether-2",
        name: "Essence",
        phase: "Intention",
        description: "Soul purpose, spiritual alignment, and resonance.",
        tarot: "Hermit",
        hexagram: "24 - Return",
      },
      {
        id: "aether-3",
        name: "Source",
        phase: "Goal",
        description: "Return to origin, transcendence, and wisdom embodiment.",
        tarot: "Hierophant",
        hexagram: "50 - Cauldron",
      },
    ],
  },
} as const;

export type ElementName = keyof typeof elementalFacetMap;

export function getFacetById(id: string) {
  for (const elementKey in elementalFacetMap) {
    const element = elementalFacetMap[elementKey as ElementName];
    const match = element.facets.find((f) => f.id === id);
    if (match) return match;
  }
  return null;
}

export function getFacetsByPhase(phase: string) {
  const matches = [];
  for (const element of Object.values(elementalFacetMap)) {
    matches.push(...element.facets.filter((f) => f.phase === phase));
  }
  return matches;
}

export function getAllFacets() {
  const allFacets: any[] = [];
  Object.values(elementalFacetMap).forEach((e) => {
    allFacets.push(...e.facets);
  });
  return allFacets;
}
