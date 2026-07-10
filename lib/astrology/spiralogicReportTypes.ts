/**
 * Spiralogic Evolutionary Report — Type Definitions
 *
 * These types describe the full structure of a generated report.
 * They are shared between the generator (server) and the renderer (client).
 */

export interface SpiralogicFacetReport {
  house: number;
  element: string;
  stage: string; // phase display name from PHASE_DISPLAY_NAMES (lib/spiralogic/interpretation, Finding 6 ruling)
  label: string;
  planets: string[]; // planets present in this house
  planetSigns: Record<string, string>; // planet name -> sign
  keyTheme: string;
  leanInto: string;
  watchFor: string;
  narrative: string; // AI-generated paragraph
}

export interface ElementReport {
  element: string; // fire | water | earth | air
  emoji: string;
  subtitle: string; // e.g. "Vision, Activation, and Willpower"
  percentage: number;
  facets: SpiralogicFacetReport[]; // 3 facets per element
}

export interface KarmicInsights {
  southNode: { sign: string; house: number; description: string };
  northNode: { sign: string; house: number; description: string };
  saturn: { sign: string; house: number; lesson: string };
  pluto: { sign: string; house: number; transformation: string };
  twelfthHousePlanets: string[];
  narrative: string; // AI-generated
}

export interface CurrentPhaseInsight {
  majorTransits: Array<{ planet: string; house: number; theme: string }>;
  majorLesson: string;
  narrative: string; // AI-generated
}

export interface ElementalBalanceInsight {
  /**
   * From the single versioned dominance rule (lib/spiralogic/interpretation).
   * Null = no stable dominance / no unique quietest element — a valid
   * verdict; renderers must say balanced/none, never invent a crown.
   */
  dominant: string | null;
  underactive: string | null;
  percentages: { fire: number; water: number; earth: number; air: number };
  integrationPractices: string[];
  narrative: string; // AI-generated
}

export interface TransitForecast {
  period: string; // e.g. "April–June 2026"
  themes: string;
}

export interface SpiralogicEvolutionaryReportData {
  version: '1.0';
  generatedAt: string; // ISO timestamp
  memberName: string;
  birthDate: string;
  birthLocation: string;
  big3: { sun: string; moon: string; rising: string };
  introduction: string; // AI-generated
  currentPhase: CurrentPhaseInsight;
  elements: ElementReport[]; // fire, water, earth, air in order
  karmicInsights: KarmicInsights;
  elementalBalance: ElementalBalanceInsight;
  practicalRituals: Array<{ planet: string; title: string; practice: string }>;
  timeline: TransitForecast[];
  closing: string; // AI-generated
}
