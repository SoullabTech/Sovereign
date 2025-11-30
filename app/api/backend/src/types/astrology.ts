/**
 * Astrology Type Definitions
 * Complete type system for astrological calculations and birth charts
 */

export interface PlanetData {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  house: number;
  retrograde: boolean;
  aspects?: AspectData[];
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
  applying: boolean;
}

export interface HouseData {
  number: number;
  sign: string;
  degree: number;
  ruler: string;
  planets: string[];
  cusps?: number[];
}

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
}

export interface ComprehensiveBirthChart {
  // Core chart data
  planets: Record<string, PlanetData>;
  houses: {
    list: HouseData[];
    cusps: number[];
    system: string;
  };
  aspects: AspectData[];
  
  // Calculated properties
  dominantElements: ElementBalance;
  dominantModalities: ModalityBalance;
  dominantPlanets: string[];
  
  // Chart metadata
  ascendant: number;
  midheaven: number;
  descendant: number;
  ic: number;
  vertex?: number;
  
  // User data
  birthDate: Date;
  birthTime: string;
  birthPlace: {
    latitude: number;
    longitude: number;
    timezone: string;
    location: string;
  };
  
  // Analysis
  chartPattern?: string;
  soulPurpose?: string;
  elementalSignature?: string;
}

export interface TransitData {
  planet: string;
  currentPosition: number;
  natalPosition: number;
  aspect: string;
  exactDate: Date;
  orbInfluence: number;
  interpretation: string;
}

export interface ProgressionData {
  planet: string;
  progressedPosition: number;
  natalPosition: number;
  yearsProgressed: number;
  interpretation: string;
}

export interface SynastrySynopsis {
  person1: string;
  person2: string;
  compatibility: number;
  strongestAspects: AspectData[];
  challenges: string[];
  harmonies: string[];
  compositeElements: ElementBalance;
}

export interface AstrologicalProfile {
  chart: ComprehensiveBirthChart;
  personality: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    dominantElement: string;
    dominantModality: string;
  };
  life: {
    currentTransits: TransitData[];
    progressions: ProgressionData[];
    solarReturn?: ComprehensiveBirthChart;
  };
  spiritual: {
    northNode: PlanetData;
    southNode: PlanetData;
    chiron: PlanetData;
    lilith?: PlanetData;
    purpose: string;
    lessons: string[];
  };
}

export interface ChartRequest {
  birthDate: string;
  birthTime: string;
  birthPlace: {
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  houseSystem?: 'Placidus' | 'Koch' | 'Equal' | 'Whole';
  includeAsteroids?: boolean;
  includeFixedStars?: boolean;
}

export interface ChartInterpretation {
  summary: string;
  personality: string;
  career: string;
  relationships: string;
  spirituality: string;
  challenges: string;
  gifts: string;
  currentPhase: string;
}

// Zodiac signs and their properties
export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// Sign elements and modalities
export const SIGN_ELEMENTS: Record<ZodiacSign, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire',
  Taurus: 'earth',
  Gemini: 'air',
  Cancer: 'water',
  Leo: 'fire',
  Virgo: 'earth',
  Libra: 'air',
  Scorpio: 'water',
  Sagittarius: 'fire',
  Capricorn: 'earth',
  Aquarius: 'air',
  Pisces: 'water'
};

export const SIGN_MODALITIES: Record<ZodiacSign, 'cardinal' | 'fixed' | 'mutable'> = {
  Aries: 'cardinal',
  Taurus: 'fixed',
  Gemini: 'mutable',
  Cancer: 'cardinal',
  Leo: 'fixed',
  Virgo: 'mutable',
  Libra: 'cardinal',
  Scorpio: 'fixed',
  Sagittarius: 'mutable',
  Capricorn: 'cardinal',
  Aquarius: 'fixed',
  Pisces: 'mutable'
};

// Aspect types
export const ASPECTS = {
  CONJUNCTION: { angle: 0, orb: 8, symbol: '☌' },
  SEXTILE: { angle: 60, orb: 6, symbol: '⚹' },
  SQUARE: { angle: 90, orb: 8, symbol: '□' },
  TRINE: { angle: 120, orb: 8, symbol: '△' },
  OPPOSITION: { angle: 180, orb: 8, symbol: '☍' },
  QUINCUNX: { angle: 150, orb: 3, symbol: '⚻' }
} as const;

export type AspectType = keyof typeof ASPECTS;