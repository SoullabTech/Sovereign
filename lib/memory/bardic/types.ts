/**
 * Bardic Memory Types
 *
 * Fire-Air time-intelligence: memory as re-entry, future as teleology
 */

export interface Episode {
  id: string;
  user_id: string;
  occurred_at: Date;

  // Cues
  place_cue?: string;
  sense_cues?: string[];
  people?: string[];

  // Affect signature
  affect_valence?: number; // -5 to +5
  affect_arousal?: number; // 0 to 10

  // Elemental state
  elemental_state: {
    fire: number;    // 0-1
    air: number;     // 0-1
    water: number;   // 0-1
    earth: number;   // 0-1
    aether: number;  // 0-1
  };

  // Scene stanza (poetic compression)
  scene_stanza?: string; // ≤300 chars

  // Sacred flag
  sacred_flag: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface EpisodeVector {
  id: string;
  episode_id: string;
  embedding: number[]; // 1536-dim
  similarity_hash?: string;
  decay_rate: number;
  created_at: Date;
}

export type EpisodeRelation = 'echoes' | 'contrasts' | 'fulfills' | 'co_occurs';

export interface EpisodeLink {
  id: string;
  src_episode_id: string;
  dst_episode_id: string;
  relation: EpisodeRelation;
  weight: number; // 0-1
  created_at: Date;
}

export type CueType = 'place' | 'scent' | 'music' | 'ritual' | 'threshold';

export interface Cue {
  id: string;
  user_id: string;
  type: CueType;
  media_ref?: string; // URL or reference
  user_words?: string; // how user describes it
  created_at: Date;
}

export interface EpisodeCue {
  episode_id: string;
  cue_id: string;
  potency: number; // 0-1, how strong this cue is for this episode
}

export interface Telos {
  id: string;
  user_id: string;
  phrase: string; // concise statement
  origin_episode?: string; // where it first emerged
  strength: number; // 0-1, current pull intensity
  horizon_days?: number; // temporal horizon
  signals?: string[]; // observable markers
  created_at: Date;
  updated_at: Date;
}

export interface TelosAlignment {
  id: string;
  episode_id: string;
  telos_id: string;
  delta: number; // -1 to +1 (diverging to converging)
  notes?: string;
  created_at: Date;
}

export interface Microact {
  id: string;
  user_id: string;
  description: string;
  context?: string; // when/where to do this
  element_bias?: 'fire' | 'air' | 'water' | 'earth' | 'aether';
  created_at: Date;
}

export type MicroactResult = 'ease' | 'friction';

export interface MicroactLog {
  id: string;
  timestamp: Date;
  episode_id?: string;
  microact_id: string;
  result?: MicroactResult;
  affect_shift?: number; // -3 to +3
  notes?: string;
}

export interface FieldEdge {
  node_a: string;
  node_b: string;
  relation_weight: number;
}

// ═══════════════════════════════════════════════════════════
// Service Input/Output Types
// ═══════════════════════════════════════════════════════════

export interface RecognitionInput {
  userId: string;
  recentText: string;
  affect?: {
    valence: number; // -5 to +5
    arousal: number; // 0 to 10
  };
  softCues?: string[]; // e.g., ["dusk", "cedar", "ocean"]
}

export interface EpisodeCandidate {
  episodeId: string;
  score: number;
  why: string; // human-readable justification
  episode: Episode;
}

export interface ReentryResult {
  allowed: boolean;
  reason?: string; // if not allowed
  stanza?: string;
  cue?: Cue;
  episode?: Episode;
}

export interface RecallResult {
  episode: Episode;
  artifacts?: {
    transcript?: string;
    insights?: string[];
    microacts?: Microact[];
  };
}

export interface TeleologyExtraction {
  teloi: Array<{
    phrase: string;
    horizon_days: number;
    signals: string[];
    strength: number;
  }>;
}

export interface BalanceCheck {
  imbalance?: 'projection_outruns_continuity' | 'continuity_stalls_telos';
  recommendation?: {
    type: 'ground' | 'crystallize';
    stanza?: string;
    microact?: Microact;
    telos?: Telos;
    horizon_hours?: number;
  };
}

// ═══════════════════════════════════════════════════════════
// Elemental Types
// ═══════════════════════════════════════════════════════════

export interface ElementalState {
  fire: number;   // vision, projection, teleology
  air: number;    // continuity, language, meaning
  water: number;  // affect, depth, feeling
  earth: number;  // embodiment, practice, habit
  aether: number; // witness, coherence, field
}

export type Element = 'fire' | 'air' | 'water' | 'earth' | 'aether';
