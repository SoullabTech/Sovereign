// Aether Facets - The Transcendent States Beyond the Wheel

export const AETHER_FACETS = {
  aether1: {
    name: "Aether 1: Expansive",
    essence: "Vastness Meeting Personal Patterns",
    archetype: "The Void Dancer",
    keywords: ["infinity", "dissolution", "cosmic awareness", "boundlessness"],
    questions: [
      "What dissolves when you touch the infinite?",
      "How does your smallness relate to the vastness?",
      "What patterns persist even in expansion?"
    ],
    practices: [
      "Sky gazing meditation",
      "Breathing with the cosmos",
      "Dissolving boundaries practice"
    ],
    description: "The state where personal identity meets cosmic vastness, creating an expansive awareness that both includes and transcends the self."
  },
  
  aether2: {
    name: "Aether 2: Contractive",
    essence: "Witnessing Without Pushing Forward",
    archetype: "The Witness",
    keywords: ["stillness", "observation", "neutral presence", "pause"],
    questions: [
      "What emerges when you stop pushing?",
      "How does witnessing change what's witnessed?",
      "What wants to contract before expanding again?"
    ],
    practices: [
      "Pure witnessing meditation",
      "The art of sacred pause",
      "Contraction as preparation"
    ],
    description: "The state of pure witnessing where action pauses, creating space for deep observation and allowing natural rhythms to emerge."
  },
  
  aether3: {
    name: "Aether 3: Stillness",
    essence: "Perfect Pause Between Breaths",
    archetype: "The Still Point",
    keywords: ["silence", "void", "potential", "zero point"],
    questions: [
      "What exists in perfect stillness?",
      "How does silence speak?",
      "What is born from the void?"
    ],
    practices: [
      "Gap meditation (between breaths)",
      "Entering the silence",
      "Zero point awareness"
    ],
    description: "The state of absolute stillness where all potentials exist simultaneously, the pause that contains all movement, the silence that holds all sound."
  }
};

// Helper function to get Aether stage data
export function getAetherStage(stage: 1 | 2 | 3) {
  const key = `aether${stage}` as keyof typeof AETHER_FACETS;
  return AETHER_FACETS[key];
}

// Check if input suggests Aether state
export function detectAetherResonance(text: string): boolean {
  const aetherKeywords = [
    "transcendent", "transcendence", "mystical", "non-dual", "nondual",
    "silence", "vastness", "void", "infinite", "infinity", "boundless",
    "witness", "witnessing", "stillness", "liminal", "between worlds",
    "cosmic", "universal", "absolute", "emptiness", "fullness",
    "dissolution", "unity consciousness", "oneness", "presence",
    "spaciousness", "timeless", "eternal", "beyond", "ineffable"
  ];
  
  const lowercaseText = text.toLowerCase();
  return aetherKeywords.some(keyword => lowercaseText.includes(keyword));
}