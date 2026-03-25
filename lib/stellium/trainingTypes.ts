/**
 * FIELD TRAINING TYPES
 *
 * Types for the persona training system.
 * Training inputs (corrections, examples, preferences) feed into
 * versioned persona builds that the field oracle reads at runtime.
 *
 * Three layers, kept separate in storage:
 *   Voice    — how the practitioner sounds
 *   Stance   — how the practitioner frames, challenges, refrains
 *   Knowledge — what the practitioner knows (V2)
 */

// ============================================
// TRAINING SOURCE TYPES
// ============================================

export interface PersonaCorrection {
  id: string;
  persona_id: string;
  original_response: string;
  correction: string;
  context: Record<string, unknown>;
  created_at: string;
}

export interface PersonaExample {
  id: string;
  persona_id: string;
  user_message: string;
  ideal_response: string;
  layer: TrainingLayer;
  tags: string[];
  created_at: string;
}

export interface PersonaPreference {
  id: string;
  persona_id: string;
  category: PreferenceCategory;
  key: string;
  value: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonaBuild {
  id: string;
  persona_id: string;
  version: number;
  voice_block: string | null;
  stance_block: string | null;
  knowledge_block: string | null;
  system_prompt_block: string;
  base_system_block: string | null;
  build_input_summary: BuildInputSummary;
  is_active: boolean;
  validation_status: ValidationStatus;
  validation_issues: string[];
  created_at: string;
}

// ============================================
// ENUMS / UNIONS
// ============================================

export type TrainingLayer = 'voice' | 'stance' | 'knowledge';
export type PreferenceCategory = 'voice' | 'stance' | 'boundary';
export type ValidationStatus = 'draft' | 'validated' | 'rejected';

// ============================================
// INPUT TYPES (for CRUD)
// ============================================

export interface CreateCorrectionInput {
  original_response: string;
  correction: string;
  context?: Record<string, unknown>;
}

export interface CreateExampleInput {
  user_message: string;
  ideal_response: string;
  layer: TrainingLayer;
  tags?: string[];
}

export interface UpsertPreferenceInput {
  category: PreferenceCategory;
  key: string;
  value: string;
}

// ============================================
// BUILD TYPES
// ============================================

export interface BuildInputSummary {
  corrections_count: number;
  examples_count: { voice: number; stance: number; knowledge: number };
  preferences_count: { voice: number; stance: number; boundary: number };
  corrections_clustered: number;
  corrections_contradictory: number;
  built_at: string;
  previous_version: number | null;
}

export interface BuildDiff {
  corrections_since: number;
  examples_since: { voice: number; stance: number; knowledge: number };
  preferences_since: { voice: number; stance: number; boundary: number };
  last_build_at: string | null;
  last_build_version: number | null;
}

export interface BuildValidationResult {
  valid: boolean;
  issues: string[];
}

// ============================================
// EXPORT BUNDLE (sovereignty portability)
// ============================================

export interface PersonaBundle {
  version: '1.0';
  exported_at: string;
  persona: {
    name: string;
    modality: string;
  };
  corrections: PersonaCorrection[];
  examples: PersonaExample[];
  preferences: PersonaPreference[];
  builds: PersonaBuild[];
}

// ============================================
// PRESET KEYS (for UI suggestions)
// ============================================

export const VOICE_PRESET_KEYS = [
  'tone',
  'warmth',
  'pacing',
  'directness',
  'phrases_to_use',
  'phrases_to_avoid',
  'sentence_length',
  'formality',
] as const;

export const STANCE_PRESET_KEYS = [
  'challenge_level',
  'reflection_depth',
  'question_style',
  'reframe_tendency',
  'silence_comfort',
  'boundary_firmness',
  'directive_vs_exploratory',
] as const;

export const BOUNDARY_PRESET_KEYS = [
  'crisis_protocol',
  'referral_threshold',
  'scope_limits',
  'modality_boundaries',
] as const;
