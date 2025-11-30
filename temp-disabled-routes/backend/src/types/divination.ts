export type DivinationMethod =
  | "tarot"
  | "iching"
  | "yijing"
  | "astro"
  | "unified";

export interface BirthData {
  date?: string;
  time?: string;
  location?: string;
  timezone?: string;
}

export interface DivinationQuery {
  method: DivinationMethod;
  query: string;
  birthData?: BirthData;
  focus?: string;
  spread?: string;
  depth?: "basic" | "detailed" | "comprehensive";
}

export interface HexagramReading {
  number: number;
  name: string;
  keyword: string;
  lines: string[];
  changingLines?: number[];
  transformed?: {
    number: number;
    name: string;
    keyword: string;
  };
  trigrams: {
    upper: string;
    lower: string;
  };
  interpretation: string;
  guidance: string;
  timing?: string;
}

export interface TarotReading {
  cards: TarotCard[];
  spreadName: string;
  spreadType: string;
  positions: string[];
  overallMessage: string;
  advice: string;
}

export interface TarotCard {
  name: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number?: number;
  reversed: boolean;
  position: string;
  meaning: string;
  interpretation: string;
  keywords: string[];
}

export interface AstrologyReading {
  archetype: string;
  currentTransits: string[];
  timing: string;
  moonPhase: string;
  planetaryInfluences: string[];
  elementalBalance: Record<string, number>;
  guidance: string;
  cosmicTheme: string;
}

export interface DivinationInsight {
  method: DivinationMethod;
  title: string;
  subtitle?: string;
  message: string;
  insight: string;
  guidance: string;
  ritual?: string;
  symbols?: string[];
  keywords?: string[];

  // Method-specific data
  hexagram?: HexagramReading;
  tarot?: TarotReading;
  astrology?: AstrologyReading;

  // Unified insights
  synthesis?: string;
  archetypalTheme?: string;
  sacredTiming?: string;
  energeticSignature?: string;

  // Metadata
  timestamp: string;
  confidence: number;
  resonance?: "high" | "medium" | "low";
}

export interface DivinationHistory {
  id: string;
  userId?: string;
  query: DivinationQuery;
  insight: DivinationInsight;
  createdAt: string;
  tags?: string[];
  feedback?: {
    accuracy: number;
    resonance: number;
    helpfulness: number;
    notes?: string;
  };
}

// Sacred symbols and correspondences
export interface SacredSymbol {
  name: string;
  meaning: string;
  element?: string;
  direction?: string;
  archetype?: string;
  keywords: string[];
}

// Unified divination response that can combine multiple methods
export interface UnifiedDivination {
  primaryMethod: DivinationMethod;
  supportingMethods: DivinationMethod[];
  insights: DivinationInsight[];
  synthesis: {
    overallTheme: string;
    keyMessage: string;
    guidance: string;
    ritual: string;
    archetypalPattern: string;
    timingGuidance: string;
  };
  resonanceScore: number;
}

// Ritual and practice suggestions
export interface DivinationRitual {
  name: string;
  duration: number; // minutes
  materials: string[];
  steps: string[];
  intention: string;
  bestTiming?: string;
  element?: string;
  archetype?: string;
}

// Export types as values for runtime use if needed
export const DivinationTypes = {
  DivinationMethod: "DivinationMethod",
  DivinationQuery: "DivinationQuery",
  DivinationInsight: "DivinationInsight",
  HexagramReading: "HexagramReading",
  TarotReading: "TarotReading",
  TarotCard: "TarotCard",
  AstrologyReading: "AstrologyReading",
  DivinationHistory: "DivinationHistory",
  UnifiedDivination: "UnifiedDivination",
  DivinationRitual: "DivinationRitual",
} as const;
