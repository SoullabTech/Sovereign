import {
  TarotCard,
  TarotReading,
  DivinationInsight,
  DivinationRitual,
} from "../types/divination";

// Major Arcana cards with full symbolic correspondences
const MAJOR_ARCANA: Omit<
  TarotCard,
  "position" | "reversed" | "meaning" | "interpretation"
>[] = [
  {
    name: "The Fool",
    arcana: "major",
    number: 0,
    keywords: [
      "new beginnings",
      "spontaneity",
      "innocence",
      "faith",
      "adventure",
    ],
  },
  {
    name: "The Magician",
    arcana: "major",
    number: 1,
    keywords: [
      "manifestation",
      "resourcefulness",
      "power",
      "inspired action",
      "willpower",
    ],
  },
  {
    name: "The High Priestess",
    arcana: "major",
    number: 2,
    keywords: [
      "intuition",
      "sacred knowledge",
      "divine feminine",
      "subconscious",
      "inner voice",
    ],
  },
  {
    name: "The Empress",
    arcana: "major",
    number: 3,
    keywords: ["fertility", "femininity", "beauty", "nature", "abundance"],
  },
  {
    name: "The Emperor",
    arcana: "major",
    number: 4,
    keywords: [
      "authority",
      "father figure",
      "structure",
      "control",
      "leadership",
    ],
  },
  {
    name: "The Hierophant",
    arcana: "major",
    number: 5,
    keywords: [
      "spiritual wisdom",
      "religious beliefs",
      "conformity",
      "tradition",
      "institutions",
    ],
  },
  {
    name: "The Lovers",
    arcana: "major",
    number: 6,
    keywords: [
      "love",
      "harmony",
      "relationships",
      "values alignment",
      "choices",
    ],
  },
  {
    name: "The Chariot",
    arcana: "major",
    number: 7,
    keywords: ["control", "willpower", "success", "determination", "direction"],
  },
  {
    name: "Strength",
    arcana: "major",
    number: 8,
    keywords: ["strength", "courage", "persuasion", "influence", "compassion"],
  },
  {
    name: "The Hermit",
    arcana: "major",
    number: 9,
    keywords: [
      "soul searching",
      "seeking truth",
      "inner guidance",
      "solitude",
      "introspection",
    ],
  },
  {
    name: "Wheel of Fortune",
    arcana: "major",
    number: 10,
    keywords: ["good luck", "karma", "life cycles", "destiny", "turning point"],
  },
  {
    name: "Justice",
    arcana: "major",
    number: 11,
    keywords: ["justice", "fairness", "truth", "cause and effect", "law"],
  },
  {
    name: "The Hanged Man",
    arcana: "major",
    number: 12,
    keywords: [
      "suspension",
      "restriction",
      "letting go",
      "sacrifice",
      "new perspective",
    ],
  },
  {
    name: "Death",
    arcana: "major",
    number: 13,
    keywords: [
      "endings",
      "beginnings",
      "change",
      "transformation",
      "transition",
    ],
  },
  {
    name: "Temperance",
    arcana: "major",
    number: 14,
    keywords: ["balance", "moderation", "patience", "purpose", "meaning"],
  },
  {
    name: "The Devil",
    arcana: "major",
    number: 15,
    keywords: [
      "bondage",
      "addiction",
      "sexuality",
      "materialism",
      "playfulness",
    ],
  },
  {
    name: "The Tower",
    arcana: "major",
    number: 16,
    keywords: ["sudden change", "upheaval", "chaos", "revelation", "awakening"],
  },
  {
    name: "The Star",
    arcana: "major",
    number: 17,
    keywords: ["hope", "faith", "purpose", "renewal", "spirituality"],
  },
  {
    name: "The Moon",
    arcana: "major",
    number: 18,
    keywords: ["illusion", "fear", "anxiety", "subconscious", "intuition"],
  },
  {
    name: "The Sun",
    arcana: "major",
    number: 19,
    keywords: ["positivity", "fun", "warmth", "success", "vitality"],
  },
  {
    name: "Judgement",
    arcana: "major",
    number: 20,
    keywords: [
      "judgement",
      "rebirth",
      "inner calling",
      "absolution",
      "awakening",
    ],
  },
  {
    name: "The World",
    arcana: "major",
    number: 21,
    keywords: [
      "completion",
      "accomplishment",
      "travel",
      "cosmic consciousness",
      "fulfillment",
    ],
  },
];

// Minor Arcana suits with elemental correspondences
const MINOR_ARCANA_SUITS = {
  wands: {
    element: "Fire",
    keywords: ["creativity", "passion", "energy", "career", "growth"],
  },
  cups: {
    element: "Water",
    keywords: [
      "emotions",
      "relationships",
      "intuition",
      "spirituality",
      "love",
    ],
  },
  swords: {
    element: "Air",
    keywords: [
      "thoughts",
      "communication",
      "conflict",
      "intellect",
      "challenges",
    ],
  },
  pentacles: {
    element: "Earth",
    keywords: ["material", "money", "career", "health", "manifestation"],
  },
};

// Tarot spreads with positional meanings
const TAROT_SPREADS = {
  "three-card": {
    name: "Three-Card Spread",
    positions: ["Past/Foundation", "Present/Challenge", "Future/Outcome"],
    description: "Classic past-present-future reading",
  },
  "celtic-cross": {
    name: "Celtic Cross",
    positions: [
      "Present Situation",
      "Challenge/Cross",
      "Distant Past/Foundation",
      "Possible Outcome",
      "Crown/Possible Future",
      "Immediate Future",
      "Your Approach",
      "External Influences",
      "Hopes and Fears",
      "Final Outcome",
    ],
    description: "Comprehensive 10-card reading",
  },
  relationship: {
    name: "Relationship Spread",
    positions: ["You", "Partner", "Relationship", "Challenges", "Potential"],
    description: "Five-card spread for relationship insights",
  },
  chakra: {
    name: "Chakra Spread",
    positions: [
      "Root",
      "Sacral",
      "Solar Plexus",
      "Heart",
      "Throat",
      "Third Eye",
      "Crown",
    ],
    description: "Seven-card energy center reading",
  },
  "year-ahead": {
    name: "Year Ahead",
    positions: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Year Theme",
    ],
    description: "Thirteen-card annual forecast",
  },
};

/**
 * Generate a random tarot card with interpretation
 */
function drawCard(position: string, isReversed?: boolean): TarotCard {
  const reversed = isReversed ?? Math.random() < 0.3; // 30% chance of reversal

  // 70% chance for Major Arcana, 30% for Minor
  if (Math.random() < 0.7) {
    const cardTemplate =
      MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
    return {
      ...cardTemplate,
      position,
      reversed,
      meaning: generateCardMeaning(cardTemplate, reversed, position),
      interpretation: generateCardInterpretation(
        cardTemplate,
        reversed,
        position,
      ),
    };
  } else {
    // Generate Minor Arcana card
    const suits = Object.keys(MINOR_ARCANA_SUITS) as Array<
      keyof typeof MINOR_ARCANA_SUITS
    >;
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const number = Math.floor(Math.random() * 14) + 1; // 1-14 (Ace to King)

    const cardName = generateMinorArcanaName(suit, number);
    const keywords = MINOR_ARCANA_SUITS[suit].keywords;

    const card: TarotCard = {
      name: cardName,
      arcana: "minor",
      suit,
      number,
      position,
      reversed,
      keywords,
      meaning: generateMinorMeaning(suit, number, reversed),
      interpretation: generateMinorInterpretation(
        suit,
        number,
        reversed,
        position,
      ),
    };

    return card;
  }
}

function generateMinorArcanaName(suit: string, number: number): string {
  const faceCards = {
    11: "Page",
    12: "Knight",
    13: "Queen",
    14: "King",
  };

  if (number === 1)
    return `Ace of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
  if (number > 10)
    return `${faceCards[number as keyof typeof faceCards]} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
  return `${number} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`;
}

function generateCardMeaning(
  card: any,
  reversed: boolean,
  position: string,
): string {
  const reversalText = reversed ? " (Reversed)" : "";
  const baseKeywords = reversed
    ? card.keywords
        .map((k: string) => `blocked ${k}` || `imbalanced ${k}`)
        .slice(0, 3)
    : card.keywords.slice(0, 3);

  return `${card.name}${reversalText} in ${position}: ${baseKeywords.join(", ")}`;
}

function generateCardInterpretation(
  card: any,
  reversed: boolean,
  position: string,
): string {
  const interpretations: Record<string, Record<string, string>> = {
    "The Fool": {
      "false":
        "New beginnings and fresh opportunities await. Trust your instincts and take that leap of faith.",
      "true": "Recklessness or poor judgment may be holding you back. Consider your choices more carefully.",
    },
    "The Magician": {
      "false":
        "You have all the tools you need to manifest your desires. Focus your will and take action.",
      "true": "Manipulation or misuse of power may be at play. Examine your motivations honestly.",
    },
    "The High Priestess": {
      "false":
        "Trust your intuition and inner wisdom. The answers you seek lie within your subconscious.",
      "true": "You may be disconnected from your intuition or ignoring important inner messages.",
    },
    "The Tower": {
      "false":
        "Sudden change brings liberation from limiting structures. Embrace the transformation.",
      "true": "Avoiding necessary change may lead to greater upheaval. Accept what must fall away.",
    },
    "The Star": {
      "false":
        "Hope, healing, and spiritual guidance illuminate your path forward. Stay inspired.",
      "true": "Loss of faith or direction may be clouding your vision. Reconnect with your higher purpose.",
    },
  };

  return (
    interpretations[card.name]?.[String(reversed)] ||
    `The energy of ${card.name} ${reversed ? "in reverse" : ""} brings ${card.keywords[0]} to your ${position.toLowerCase()}.`
  );
}

function generateMinorMeaning(
  suit: string,
  number: number,
  reversed: boolean,
): string {
  const element =
    MINOR_ARCANA_SUITS[suit as keyof typeof MINOR_ARCANA_SUITS].element;
  const reversalText = reversed ? "blocked or imbalanced" : "flowing";
  return `${element} energy is ${reversalText} in matters of ${MINOR_ARCANA_SUITS[suit as keyof typeof MINOR_ARCANA_SUITS].keywords[0]}`;
}

function generateMinorInterpretation(
  suit: string,
  number: number,
  reversed: boolean,
  position: string,
): string {
  const suitMeanings = {
    wands: reversed
      ? "Creative blocks or burnout in your endeavors"
      : "Passionate energy fuels your creative projects",
    cups: reversed
      ? "Emotional imbalance or relationship challenges"
      : "Emotional fulfillment and loving connections",
    swords: reversed
      ? "Mental confusion or communication breakdown"
      : "Clear thinking and honest communication",
    pentacles: reversed
      ? "Financial or material instability"
      : "Material success and practical achievements",
  };

  return (
    suitMeanings[suit as keyof typeof suitMeanings] +
    ` influence your ${position.toLowerCase()}.`
  );
}

/**
 * Perform a tarot reading with specified spread
 */
export function getTarotReading(
  query: string,
  spreadType: string = "three-card",
): DivinationInsight {
  const spread =
    TAROT_SPREADS[spreadType as keyof typeof TAROT_SPREADS] ||
    TAROT_SPREADS["three-card"];

  // Draw cards for each position
  const cards = spread.positions.map((position) => drawCard(position));

  // Generate overall reading
  const tarotReading: TarotReading = {
    cards,
    spreadName: spread.name,
    spreadType,
    positions: spread.positions,
    overallMessage: generateOverallMessage(cards, query),
    advice: generateAdvice(cards),
  };

  // Create ritual suggestion
  const ritual = generateTarotRitual(cards);

  return {
    method: "tarot",
    title: `${spread.name} Reading`,
    subtitle: `Guidance for: "${query}"`,
    message: "The cards have been drawn and their wisdom revealed.",
    insight: tarotReading.overallMessage,
    guidance: tarotReading.advice,
    ritual: ritual.steps.join(" "),
    symbols: cards.map((card) => card.name),
    keywords: cards.flatMap((card) => card.keywords).slice(0, 8),
    tarot: tarotReading,
    timestamp: new Date().toISOString(),
    confidence: 0.85,
    resonance: "high",
  };
}

function generateOverallMessage(cards: TarotCard[], query: string): string {
  const themes = cards.flatMap((card) => card.keywords);
  const dominantTheme =
    themes.find((theme) => themes.filter((t) => t === theme).length > 1) ||
    themes[0];

  const hasReversals = cards.some((card) => card.reversed);
  const reversalNote = hasReversals
    ? " Pay attention to what needs to be released or transformed."
    : " The energy flows favorably for your question.";

  return `Regarding "${query}", the cards reveal a pattern of ${dominantTheme} influencing your situation.${reversalNote} The key theme emerging is one of ${themes.slice(0, 3).join(", ")}.`;
}

function generateAdvice(cards: TarotCard[]): string {
  const adviceElements = [
    "Trust the wisdom of the cards and your own intuition.",
    "The patterns shown reflect both challenges and opportunities.",
    "Consider how these energies manifest in your daily life.",
    "Use this insight as guidance, not absolute prediction.",
  ];

  const specificAdvice = cards
    .map((card) => {
      if (card.reversed) {
        return `Address the ${card.keywords[0]} that may be blocked or imbalanced.`;
      } else {
        return `Embrace the ${card.keywords[0]} energy available to you.`;
      }
    })
    .join(" ");

  return `${specificAdvice} ${adviceElements[Math.floor(Math.random() * adviceElements.length)]}`;
}

function generateTarotRitual(cards: TarotCard[]): DivinationRitual {
  const majorArcanaCount = cards.filter(
    (card) => card.arcana === "major",
  ).length;
  const hasReversals = cards.some((card) => card.reversed);

  let ritual: DivinationRitual;

  if (majorArcanaCount >= 2) {
    ritual = {
      name: "Major Arcana Integration",
      duration: 20,
      materials: ["candle", "journal", "crystals or stones"],
      steps: [
        "Light a candle and arrange your cards in front of you.",
        "Meditate on each Major Arcana card for 3 minutes.",
        "Journal about how these archetypal energies appear in your life.",
        "Close by expressing gratitude to the divine wisdom revealed.",
      ],
      intention: "Integrate the major life lessons and archetypal energies",
      bestTiming: "During quiet evening hours",
      element: "Spirit",
      archetype: "The Seeker",
    };
  } else if (hasReversals) {
    ritual = {
      name: "Shadow Release Ceremony",
      duration: 15,
      materials: ["black candle", "paper", "pen", "fireproof bowl"],
      steps: [
        "Write down what the reversed cards suggest you need to release.",
        "Light the black candle mindfully.",
        "Burn the paper safely, visualizing the release of blocked energy.",
        "Sit in meditation as the candle burns down.",
      ],
      intention: "Release blocked energies and embrace transformation",
      bestTiming: "During the new moon",
      element: "Fire",
      archetype: "The Transformer",
    };
  } else {
    ritual = {
      name: "Tarot Gratitude Practice",
      duration: 10,
      materials: ["white candle", "fresh flowers", "cards"],
      steps: [
        "Arrange the cards with flowers and light the white candle.",
        "Speak aloud your gratitude for each message received.",
        "Visualize the positive energies flowing into your life.",
        "Keep one card with you as a daily reminder.",
      ],
      intention: "Anchor the positive energies and guidance received",
      bestTiming: "Morning or evening",
      element: "Air",
      archetype: "The Grateful Heart",
    };
  }

  return ritual;
}

/**
 * Get daily tarot card draw
 */
export function getDailyTarot(): DivinationInsight {
  const card = drawCard("Daily Guidance");

  return {
    method: "tarot",
    title: "Daily Tarot Card",
    subtitle: card.name + (card.reversed ? " (Reversed)" : ""),
    message: "Your daily card has been drawn.",
    insight: card.interpretation,
    guidance: `Today, focus on the energy of ${card.keywords[0]}. ${card.meaning}`,
    ritual: `Carry the intention of ${card.name} with you today.`,
    symbols: [card.name],
    keywords: card.keywords,
    tarot: {
      cards: [card],
      spreadName: "Daily Draw",
      spreadType: "single-card",
      positions: ["Daily Guidance"],
      overallMessage: card.interpretation,
      advice: `Let ${card.name} guide your actions and decisions today.`,
    },
    timestamp: new Date().toISOString(),
    confidence: 0.9,
    resonance: "medium",
  };
}

/**
 * Get card meanings for reference
 */
export function getCardMeanings(cardName: string): TarotCard | null {
  const majorCard = MAJOR_ARCANA.find(
    (card) => card.name.toLowerCase() === cardName.toLowerCase(),
  );

  if (majorCard) {
    return {
      ...majorCard,
      position: "Reference",
      reversed: false,
      meaning: `${majorCard.name}: ${majorCard.keywords.join(", ")}`,
      interpretation: generateCardInterpretation(majorCard, false, "your life"),
    };
  }

  return null;
}

/**
 * Available spread types
 */
export function getAvailableSpreads(): Array<{
  name: string;
  description: string;
  positions: number;
}> {
  return Object.entries(TAROT_SPREADS).map(([key, spread]) => ({
    name: spread.name,
    description: spread.description,
    positions: spread.positions.length,
  }));
}

export default {
  getTarotReading,
  getDailyTarot,
  getCardMeanings,
  getAvailableSpreads,
};
