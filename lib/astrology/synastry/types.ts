/**
 * Synastry Types
 *
 * Type definitions for synastry (chart comparison) calculations.
 */

export type SynastryAspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx';

export interface SynastryOptions {
  aspects?: SynastryAspectType[];
  orbs?: Partial<Record<SynastryAspectType, number>>;
  includeAngles?: boolean;
  includeNodes?: boolean;
  maxAspects?: number;
}

export interface SynastryAspect {
  aBody: string;      // Planet from chart A (e.g., "Sun", "Venus")
  bBody: string;      // Planet from chart B (e.g., "Mars", "Moon")
  aspect: SynastryAspectType;
  exactDeg: number;   // The exact angle for this aspect (0, 60, 90, 120, 150, 180)
  deltaDeg: number;   // Actual angular separation between planets
  orbDeg: number;     // How far from exact (abs(delta - exact))
  strength: number;   // 0..1, tighter orb = higher strength
  tags: string[];     // e.g., ["synastry", "luminaries", "personal"]
  interpretationKey?: string; // e.g., "synastry.sun_trine_moon"
}

export interface SynastryScores {
  attraction: number;  // Conjunctions (magnetic pull)
  harmony: number;     // Trines + Sextiles (ease)
  friction: number;    // Squares + Oppositions (tension/growth)
  growth: number;      // Quincunxes (adjustment/evolution)
}

export interface SynastryResult {
  aspects: SynastryAspect[];
  highlights: SynastryAspect[];  // Top N most significant
  scores: SynastryScores;
  notes: string[];  // e.g., ["missing_birth_time_affects_angles"]
}

// Request body for POST /api/astrology/synastry
export interface SynastryRequest {
  a: {
    memberId?: string;
    birth?: {
      date: string;       // YYYY-MM-DD
      time?: string;      // HH:mm (optional - affects angles/Moon accuracy)
      timezone?: string;  // IANA timezone
      lat?: number;
      lng?: number;
    };
  };
  b: {
    memberId?: string;
    birth?: {
      date: string;
      time?: string;
      timezone?: string;
      lat?: number;
      lng?: number;
    };
  };
  options?: SynastryOptions;
}

export interface SynastryResponse {
  success: boolean;
  synastry?: SynastryResult;
  chartA?: { memberId?: string; sunSign?: string; moonSign?: string };
  chartB?: { memberId?: string; sunSign?: string; moonSign?: string };
  error?: string;
}
