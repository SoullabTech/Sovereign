import { z } from "zod";

export const elementalThemeSchema = z.enum([
  "fire",
  "water",
  "earth",
  "air",
  "aether",
]);
export type ElementalTheme = z.infer<typeof elementalThemeSchema>;

export interface StoryRequest {
  focusArea: string;
  elementalTheme: ElementalTheme;
  archetype: string;
  emotionalTone?: string;
  spiralPhase?: string;
  depthLevel?: number;
}

export interface StoryResponse {
  narrative: string;
  reflections: string[];
  symbols: string[];
}

export interface OracleContext {
  elementalProfile: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  crystalFocus?: {
    type: string;
    challenges: string;
    aspirations: string;
  };
  currentPhase?: string;
}

// Spiralogic Report Types
export interface ChartData {
  sun: { sign: string; house: number };
  moon: { sign: string; house: number };
  rising: string;
  northNode: { sign: string; house: number };
  southNode: { sign: string; house: number };
}

export type ArchetypalElement = "fire" | "water" | "earth" | "air" | "aether";

// I Ching Astrology Types
export type IChingElement = "Wood" | "Fire" | "Earth" | "Metal" | "Water";

export interface TrigramArchetype {
  name: string;
  symbol: string;
  element: IChingElement;
  direction: string;
  attribute: string;
  archetype: string;
  description: string;
  keywords: string[];
}

export interface IChingAstroProfile {
  baseNumber: number;
  birthTrigram: string;
  birthElement: IChingElement;
  currentTrigramCycle: string;
  hexagramMapping: string[];
  currentYearNumber: number;
  cyclePosition: string;
  fractalPhase: string;
  yearlyGuidance: string;
}

export interface IChingCompatibility {
  compatibility: number;
  description: string;
}

export interface IChingInsight {
  profile: IChingAstroProfile;
  birthArchetype: TrigramArchetype;
  currentArchetype: TrigramArchetype;
  compatibility?: IChingCompatibility;
  dailyGuidance?: string;
  ritualSuggestion?: string;
}

export interface SpiralogicReportInput {
  userId: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthLocation: string; // City, Country
  timezone?: string;
  chartData: ChartData;
  dominantElement: ArchetypalElement;
  underactiveElement: ArchetypalElement;
  archetypes: string[];
  lifeStage?: string;
  personalityNotes?: string[];
}

export interface SpiralogicReportOutput {
  success: boolean;
  report: {
    content: string;
    sections: Record<string, string>;
    metadata: {
      userId: string;
      reportType: string;
      birthChart: {
        date: string;
        time: string;
        location: string;
        timezone?: string;
      };
      elements: {
        dominant: ArchetypalElement;
        underactive: ArchetypalElement;
      };
      archetypes: string[];
      lifeStage?: string;
      sectionCount: number;
      wordCount: number;
      generationModel: string;
      timestamp: string;
    };
    generatedAt: string;
    version: string;
  };
}

export interface SpiralogicReportSection {
  title: string;
  content: string;
  symbols?: string[];
  rituals?: string[];
  affirmations?: string[];
}
