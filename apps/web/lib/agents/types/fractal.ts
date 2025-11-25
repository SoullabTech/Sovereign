// lib/agents/types/fractal.ts

export interface FractalContext {
  userId: string;

  session: {
    id?: string;
    isFirstTime: boolean;
    startTime?: Date;
  };

  // Active elemental currents
  activeCurrents: ElementalCurrent[];

  // Spiral detection
  spiral?: {
    theme: string;
    spiralCount: number;
    isRegression: boolean;
    visits: SpiralVisit[];
  };

  // Breakthrough detection
  breakthrough?: {
    isActive: boolean;
    phrase: string;
    context: string;
    timestamp: Date;
  };

  // Trust dynamics
  trustLevel: number; // 0-100
  breathingMode?: "contraction" | "stabilization" | "expansion" | "integration";

  // Archetypal resonance
  arcEchoes?: ArcEcho[];

  // User expression
  userExpression: string;

  // Historical context
  recentSnapshots?: UserStateSnapshot[];
}

export interface ElementalCurrent {
  element: "fire" | "water" | "earth" | "air" | "aether";
  intensity: number; // 0-100
  context?: string; // Where it's showing up (work, relationships, etc.)
}

export interface SpiralVisit {
  timestamp: Date;
  newWisdom: string;
  emotionalTone: string[];
}

export interface ArcEcho {
  arcName: string;
  resonance: number; // 0-1
  evidence: string[];
  active: boolean;
  strength?: number; // Alias for resonance
}

export interface UserStateSnapshot {
  id: string;
  session_id: string;
  user_id: string;
  timestamp: Date;
  currents: string[];
  regression: boolean;
  breakthrough: boolean;
  trust_level: number;
  user_language: string;
  reflection?: string;
  arc_echo?: string;
  parallel_processing?: string[];
  contradictions?: string[];
  system_notes?: string;
  source_agent: string;
}

export interface UserArchetypalProfile {
  user_id: string;
  fire_expressions: Record<string, number>;
  water_expressions: Record<string, number>;
  earth_expressions: Record<string, number>;
  air_expressions: Record<string, number>;
  aether_expressions: Record<string, number>;
  witness_ratio: number;
  pattern_receptivity: number;
  primary_arc?: string;
  spiral_rhythm?: string;
  breakthrough_triggers: string[];
  regression_patterns: string[];
  profile_maturity: number;
  last_major_shift?: Date;
  confidence_score: number;
  arcEchoes?: ArcEcho[];
  lastTrustLevel?: number;
}

export interface SeasonalMetaPattern {
  id: string;
  user_id: string;
  season_start: Date;
  season_end: Date;
  season_name?: string;
  primary_element: string;
  secondary_element: string;
  element_transitions: Record<string, string[]>;
  overarching_theme: string;
  mythic_archetype: string;
  sacred_story: string;
  spiral_frequency: number;
  breakthrough_density: number;
  trust_trajectory: string;
  arc_progression: string[];
  recurring_themes: string[];
  evolutionary_edges: string[];
  maya_observations: string[];
  user_discoveries: string[];
  symbolic_imagery: string[];
  confidence_score: number;
}

export type BreathingMode = "contraction" | "stabilization" | "expansion" | "integration";