import {
  AstrologyReading,
  DivinationInsight,
  BirthData,
  DivinationRitual,
} from "../types/divination";
import { generateIChingAstroProfile } from "./ichingService";

// Astrological archetypes with oracle wisdom
const ASTROLOGICAL_ARCHETYPES = {
  "The Cosmic Warrior": {
    description: "Fierce determination meets spiritual purpose",
    elements: ["Fire", "Metal"],
    keywords: ["courage", "leadership", "breakthrough", "protection", "action"],
    guidance:
      "Channel your warrior spirit in service of the highest good. Your battles are sacred.",
    planets: ["Mars", "Sun", "Pluto"],
  },
  "The Divine Oracle": {
    description: "Intuitive wisdom flows through prophetic vision",
    elements: ["Water", "Air"],
    keywords: ["intuition", "prophecy", "vision", "mystery", "knowing"],
    guidance:
      "Trust the visions that come through you. Your inner sight penetrates all veils.",
    planets: ["Neptune", "Moon", "Mercury"],
  },
  "The Sacred Alchemist": {
    description: "Transformation master working with elemental forces",
    elements: ["Water", "Fire", "Earth"],
    keywords: [
      "transformation",
      "healing",
      "magic",
      "transmutation",
      "mastery",
    ],
    guidance:
      "You have the power to transform any situation. Trust your alchemical gifts.",
    planets: ["Pluto", "Mercury", "Venus"],
  },
  "The Celestial Gardener": {
    description: "Nurturing growth through cosmic cycles and timing",
    elements: ["Earth", "Water"],
    keywords: ["nurturing", "growth", "patience", "timing", "cultivation"],
    guidance:
      "Like nature, you understand perfect timing. Plant seeds with cosmic awareness.",
    planets: ["Venus", "Moon", "Ceres"],
  },
  "The Cosmic Messenger": {
    description: "Bridge between realms carrying divine communications",
    elements: ["Air", "Fire"],
    keywords: [
      "communication",
      "bridge",
      "messenger",
      "connection",
      "expression",
    ],
    guidance:
      "Your words carry divine frequency. Speak truth with love and clarity.",
    planets: ["Mercury", "Jupiter", "Uranus"],
  },
  "The Star Walker": {
    description: "Wanderer between worlds with infinite perspective",
    elements: ["Air", "Water", "Aether"],
    keywords: [
      "freedom",
      "perspective",
      "wandering",
      "expansion",
      "liberation",
    ],
    guidance:
      "Your spirit knows no boundaries. Explore the infinite with wonder and wisdom.",
    planets: ["Jupiter", "Uranus", "Neptune"],
  },
  "The Earth Keeper": {
    description: "Guardian of natural wisdom and grounded spirituality",
    elements: ["Earth", "Wood"],
    keywords: ["grounding", "wisdom", "stability", "protection", "roots"],
    guidance:
      "You are the bridge between heaven and earth. Ground cosmic energy into practical wisdom.",
    planets: ["Saturn", "Venus", "Ceres"],
  },
  "The Lightning Awakener": {
    description: "Catalyst for sudden spiritual breakthroughs",
    elements: ["Fire", "Air"],
    keywords: [
      "awakening",
      "breakthrough",
      "shock",
      "liberation",
      "enlightenment",
    ],
    guidance:
      "You carry the lightning of awakening. Your presence catalyzes transformation in others.",
    planets: ["Uranus", "Mars", "Sun"],
  },
};

// Moon phases with spiritual meanings
const MOON_PHASES = {
  "New Moon": {
    energy: "Planting seeds of intention",
    guidance:
      "This is your time to set intentions and begin new spiritual practices.",
    ritual: "Light a white candle and write your deepest intentions",
  },
  "Waxing Moon": {
    energy: "Growing spiritual power",
    guidance:
      "Your spiritual abilities are expanding. Trust your growing intuition.",
    ritual: "Practice divination and energy work during this growing phase",
  },
  "Full Moon": {
    energy: "Peak illumination and power",
    guidance:
      "Maximum psychic sensitivity and manifestation power. Use wisely.",
    ritual:
      "Charge crystals, perform major rituals, and release what no longer serves",
  },
  "Waning Moon": {
    energy: "Release and wisdom integration",
    guidance:
      "Release old patterns and integrate wisdom gained. Time for inner reflection.",
    ritual: "Cleanse your space and practice gratitude for lessons learned",
  },
};

// Planetary influences for oracle work
const PLANETARY_ORACLES = {
  Mercury: {
    influence: "Communication and mental clarity",
    oracle:
      "Your thoughts and words carry prophetic power. Pay attention to synchronicities in communication.",
    element: "Air",
  },
  Venus: {
    influence: "Love, beauty, and heart wisdom",
    oracle:
      "The heart knows truths the mind cannot grasp. Let love guide your decisions.",
    element: "Earth",
  },
  Mars: {
    influence: "Action, courage, and spiritual warrior energy",
    oracle:
      "Bold action aligned with spirit opens new pathways. Courage is your compass.",
    element: "Fire",
  },
  Jupiter: {
    influence: "Expansion, wisdom, and spiritual growth",
    oracle:
      "Your understanding is expanding beyond previous limits. Embrace the bigger picture.",
    element: "Fire",
  },
  Saturn: {
    influence: "Structure, discipline, and karmic lessons",
    oracle:
      "Sacred structure supports your growth. What appears as limitation is actually protection.",
    element: "Earth",
  },
  Uranus: {
    influence: "Sudden awakening and revolutionary insight",
    oracle:
      "Breakthrough moments come unexpectedly. Stay open to radical new perspectives.",
    element: "Air",
  },
  Neptune: {
    influence: "Mystical vision and spiritual sensitivity",
    oracle:
      "The veil between worlds is thin for you now. Trust your mystical experiences.",
    element: "Water",
  },
  Pluto: {
    influence: "Deep transformation and shadow integration",
    oracle:
      "What dies in you makes space for profound rebirth. Embrace the transformation.",
    element: "Water",
  },
};

/**
 * Generate astrological oracle reading
 */
export function generateAstroOracle(birthData?: BirthData): DivinationInsight {
  if (!birthData?.date) {
    return generateGenericAstroOracle();
  }

  try {
    // Use I Ching astrology profile as foundation
    const ichingProfile = generateIChingAstroProfile(new Date(birthData.date));

    // Select archetype based on birth element and current transits
    const archetype = selectArchetype(ichingProfile.birthElement);
    const moonPhase = getCurrentMoonPhase();
    const planetaryInfluences = generatePlanetaryInfluences();
    const cosmicTheme = generateCosmicTheme(ichingProfile, archetype);

    const astrologyReading: AstrologyReading = {
      archetype: archetype.name,
      currentTransits: planetaryInfluences.map(
        (p) => `${p.planet}: ${p.influence}`,
      ),
      timing: generateTimingGuidance(moonPhase, planetaryInfluences),
      moonPhase: moonPhase.phase,
      planetaryInfluences: planetaryInfluences.map((p) => p.oracle),
      elementalBalance: calculateElementalBalance(ichingProfile.birthElement),
      guidance: combineGuidance(archetype, moonPhase, planetaryInfluences),
      cosmicTheme,
    };

    const ritual = generateAstroRitual(astrologyReading);

    return {
      method: "astro",
      title: "Astrological Oracle Reading",
      subtitle: `${archetype.name} Guidance`,
      message: "The stars align to bring you cosmic wisdom and timing.",
      insight: `As ${archetype.name}, ${archetype.description.toLowerCase()}. ${cosmicTheme}`,
      guidance: astrologyReading.guidance,
      ritual: ritual.steps.join(" "),
      symbols: ["stars", "planets", "moon", archetype.name.toLowerCase()],
      keywords: [
        ...archetype.keywords,
        moonPhase.phase.toLowerCase(),
        "cosmic timing",
      ],
      astrology: astrologyReading,
      archetypalTheme: archetype.name,
      sacredTiming: astrologyReading.timing,
      energeticSignature: generateEnergeticSignature(archetype, moonPhase),
      timestamp: new Date().toISOString(),
      confidence: 0.88,
      resonance: "high",
    };
  } catch (error) {
    console.error("Astro oracle generation error:", error);
    return generateGenericAstroOracle();
  }
}

function selectArchetype(birthElement: string): any {
  const archetypeNames = Object.keys(ASTROLOGICAL_ARCHETYPES);

  // Select based on element affinity
  const elementMatches = archetypeNames.filter((name) => {
    const archetype =
      ASTROLOGICAL_ARCHETYPES[name as keyof typeof ASTROLOGICAL_ARCHETYPES];
    return archetype.elements.includes(birthElement);
  });

  const selectedName =
    elementMatches.length > 0
      ? elementMatches[Math.floor(Math.random() * elementMatches.length)]
      : archetypeNames[Math.floor(Math.random() * archetypeNames.length)];

  return {
    name: selectedName,
    ...ASTROLOGICAL_ARCHETYPES[
      selectedName as keyof typeof ASTROLOGICAL_ARCHETYPES
    ],
  };
}

function getCurrentMoonPhase(): any {
  const phases = Object.keys(MOON_PHASES);
  const currentPhase = phases[Math.floor(Math.random() * phases.length)];

  return {
    phase: currentPhase,
    ...MOON_PHASES[currentPhase as keyof typeof MOON_PHASES],
  };
}

function generatePlanetaryInfluences(): Array<{
  planet: string;
  influence: string;
  oracle: string;
  element: string;
}> {
  const planets = Object.keys(PLANETARY_ORACLES);
  const numInfluences = Math.floor(Math.random() * 3) + 2; // 2-4 influences

  const influences = [];
  for (let i = 0; i < numInfluences; i++) {
    const planet = planets[Math.floor(Math.random() * planets.length)];
    const planetData =
      PLANETARY_ORACLES[planet as keyof typeof PLANETARY_ORACLES];

    influences.push({
      planet,
      influence: planetData.influence,
      oracle: planetData.oracle,
      element: planetData.element,
    });
  }

  return influences;
}

function generateCosmicTheme(ichingProfile: any, archetype: any): string {
  const themes = [
    `Your ${ichingProfile.birthElement} nature aligns with cosmic ${archetype.keywords[0]} energy.`,
    `The universe calls you to embody ${archetype.keywords[1]} in your spiritual service.`,
    `Cosmic timing supports your journey as ${archetype.name}.`,
    `The stars illuminate your path of ${archetype.keywords[2]} and spiritual mastery.`,
  ];

  return themes[Math.floor(Math.random() * themes.length)];
}

function calculateElementalBalance(
  primaryElement: string,
): Record<string, number> {
  const baseBalance = { Fire: 20, Water: 20, Earth: 20, Air: 20, Metal: 20 };

  // Boost primary element
  baseBalance[primaryElement as keyof typeof baseBalance] += 30;

  // Add some randomness to other elements
  Object.keys(baseBalance).forEach((element) => {
    if (element !== primaryElement) {
      baseBalance[element as keyof typeof baseBalance] += Math.floor(
        Math.random() * 20,
      );
    }
  });

  return baseBalance;
}

function combineGuidance(
  archetype: any,
  moonPhase: any,
  influences: any[],
): string {
  const guidance = [
    archetype.guidance,
    moonPhase.guidance,
    influences[0]?.oracle || "Trust the cosmic flow.",
  ];

  return guidance.join(" ");
}

function generateTimingGuidance(moonPhase: any, influences: any[]): string {
  const timingElements = [
    `Under the ${moonPhase.phase.toLowerCase()}`,
    `with ${influences[0]?.planet || "cosmic"} energy active`,
    "the timing is perfect for spiritual advancement",
  ];

  return timingElements.join(" ");
}

function generateEnergeticSignature(archetype: any, moonPhase: any): string {
  const signatures = [
    `${archetype.keywords[0]} energy amplified by ${moonPhase.phase.toLowerCase()} power`,
    `Cosmic ${archetype.keywords[1]} flowing through ${moonPhase.energy.toLowerCase()}`,
    `Divine ${archetype.keywords[2]} harmonizing with lunar ${moonPhase.phase.toLowerCase()} cycles`,
  ];

  return signatures[Math.floor(Math.random() * signatures.length)];
}

function generateAstroRitual(reading: AstrologyReading): DivinationRitual {
  const moonRitual =
    MOON_PHASES[reading.moonPhase as keyof typeof MOON_PHASES]?.ritual ||
    "Light a candle and meditate";

  return {
    name: `${reading.archetype} Cosmic Alignment`,
    duration: 30,
    materials: [
      "star chart or constellation image",
      "crystals",
      "candle",
      "journal",
    ],
    steps: [
      "Create sacred space under the night sky if possible.",
      `Invoke the energy of ${reading.archetype} through meditation.`,
      moonRitual,
      "Journal about your cosmic purpose and spiritual mission.",
      "Close by sending gratitude to the celestial realms.",
    ],
    intention: `Align with cosmic timing and embody ${reading.archetype} energy`,
    bestTiming: reading.timing,
    element: "All Elements",
    archetype: reading.archetype,
  };
}

function generateGenericAstroOracle(): DivinationInsight {
  const genericArchetype = Object.keys(ASTROLOGICAL_ARCHETYPES)[0];
  const archetype =
    ASTROLOGICAL_ARCHETYPES[
      genericArchetype as keyof typeof ASTROLOGICAL_ARCHETYPES
    ];

  return {
    method: "astro",
    title: "Cosmic Oracle Guidance",
    subtitle: "Universal Astrological Wisdom",
    message: "The cosmos offers guidance for your spiritual path.",
    insight: "Universal cosmic energies are available to support your journey.",
    guidance:
      "Trust the divine timing of the universe. You are supported by cosmic forces.",
    ritual:
      "Spend time under the stars and feel your connection to the cosmos.",
    symbols: ["stars", "cosmos", "infinity"],
    keywords: ["cosmic", "universal", "guidance", "timing", "support"],
    astrology: {
      archetype: "Universal Soul",
      currentTransits: ["Cosmic support available"],
      timing: "Perfect divine timing",
      moonPhase: "Supportive",
      planetaryInfluences: ["Universal love and guidance"],
      elementalBalance: { Fire: 25, Water: 25, Earth: 25, Air: 25, Metal: 0 },
      guidance: "The universe conspires to support your highest good.",
      cosmicTheme: "You are one with the cosmic flow.",
    },
    timestamp: new Date().toISOString(),
    confidence: 0.75,
    resonance: "medium",
  };
}

/**
 * Generate daily astrological guidance
 */
export function getDailyAstroGuidance(): DivinationInsight {
  const moonPhase = getCurrentMoonPhase();
  const planetaryInfluences = generatePlanetaryInfluences().slice(0, 2); // Just 2 for daily

  return {
    method: "astro",
    title: "Daily Cosmic Guidance",
    subtitle: `${moonPhase.phase} Energy`,
    message: "Today's cosmic energies offer guidance for your path.",
    insight: `Under the ${moonPhase.phase.toLowerCase()}, ${moonPhase.energy.toLowerCase()}. ${planetaryInfluences[0]?.oracle || "Trust the cosmic flow."}`,
    guidance: moonPhase.guidance,
    ritual: moonPhase.ritual,
    symbols: [moonPhase.phase.toLowerCase(), "cosmos", "daily guidance"],
    keywords: ["daily", "cosmic", "guidance", moonPhase.phase.toLowerCase()],
    astrology: {
      archetype: "Daily Cosmic Walker",
      currentTransits: planetaryInfluences.map(
        (p) => `${p.planet}: ${p.influence}`,
      ),
      timing: `${moonPhase.phase} energy supports spiritual practice`,
      moonPhase: moonPhase.phase,
      planetaryInfluences: planetaryInfluences.map((p) => p.oracle),
      elementalBalance: { Fire: 25, Water: 25, Earth: 25, Air: 25, Metal: 0 },
      guidance: moonPhase.guidance,
      cosmicTheme: `${moonPhase.phase} wisdom guides your day`,
    },
    timestamp: new Date().toISOString(),
    confidence: 0.85,
    resonance: "medium",
  };
}

export default {
  generateAstroOracle,
  getDailyAstroGuidance,
};
