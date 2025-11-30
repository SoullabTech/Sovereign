const ELEMENT_KEYWORDS = {
  fire: ["ignite", "burn", "action", "passion"],
  water: ["feel", "flow", "grief", "tears"],
  air: ["thought", "idea", "pattern", "speak"],
  earth: ["ground", "build", "stable", "slow"],
  aether: ["mystery", "spirit", "void", "soul"],
};

const EMOTION_KEYWORDS = {
  grief: ["loss", "mourning", "ache"],
  joy: ["gratitude", "light", "celebrate"],
  fear: ["worry", "anxiety", "panic"],
  awe: ["wonder", "cosmic", "transcend"],
  longing: ["desire", "yearning", "missing"],
};

const SYMBOLS = [
  "phoenix",
  "mirror",
  "labyrinth",
  "doorway",
  "seed",
  "flame",
  "ocean",
  "star",
];

export function extractElementIndex(text: string): Record<string, number> {
  const index: Record<string, number> = {};
  for (const [element, words] of Object.entries(ELEMENT_KEYWORDS)) {
    index[element] = words.reduce(
      (acc, word) => acc + countOccurrences(text, word),
      0,
    );
  }
  return index;
}

export function extractEmotionalTone(text: string): Record<string, number> {
  const tone: Record<string, number> = {};
  for (const [emotion, triggers] of Object.entries(EMOTION_KEYWORDS)) {
    tone[emotion] = triggers.reduce(
      (acc, word) => acc + countOccurrences(text, word),
      0,
    );
  }
  return tone;
}

export function extractSymbols(text: string): string[] {
  return SYMBOLS.filter((sym) => text.toLowerCase().includes(sym)).slice(0, 5);
}

function countOccurrences(text: string, word: string): number {
  return (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, "g")) || [])
    .length;
}
