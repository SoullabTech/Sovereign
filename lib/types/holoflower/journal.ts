/**
 * Holoflower Journal Types
 * Ported from MAIA-PAI to MAIA-SOVEREIGN
 */

export type ConfigurationMethod =
  | 'manual'
  | 'voice'
  | 'conversational'
  | 'iching'
  | 'survey';

export interface PetalConfiguration {
  petal: string;
  intensity: number;
  element?: string | null;
}

export interface SpiralStage {
  element: string;
  stage: string;
  description?: string | null;
  code?: string | null;
  name?: string | null;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'maia';
  content: string;
  timestamp?: string | Date;
}

export interface HoloflowerJournalEntry {
  id: string;
  user_id: string;
  intention?: string;
  configuration_method: ConfigurationMethod;
  petal_intensities: PetalConfiguration[];
  spiral_stage: SpiralStage;
  archetype?: string;
  shadow_archetype?: string;
  conversation_messages: ConversationMessage[];
  tags: string[];
  is_favorite: boolean;
  visibility: 'private' | 'shared' | 'public';
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntryInput {
  intention?: string;
  configuration_method: ConfigurationMethod;
  petal_intensities: PetalConfiguration[];
  spiral_stage: SpiralStage;
  archetype?: string;
  shadow_archetype?: string;
  conversation_messages: ConversationMessage[];
  tags?: string[];
  is_favorite?: boolean;
  visibility?: 'private' | 'shared' | 'public';
  elemental_alchemy?: any;
  reflection?: string | null;
  practice?: string | null;
  conversation_summary?: string | null;
  soulprint_url?: string | null;
}

export interface UpdateJournalEntryInput {
  intention?: string;
  petal_intensities?: PetalConfiguration[];
  spiral_stage?: SpiralStage;
  archetype?: string;
  shadow_archetype?: string;
  conversation_messages?: ConversationMessage[];
  tags?: string[];
  is_favorite?: boolean;
  visibility?: 'private' | 'shared' | 'public';
}

export interface SoulPattern {
  id: string;
  user_id: string;
  pattern_type: 'dominant_element' | 'growth_trajectory' | 'recurring_archetype' | 'shadow_integration';
  pattern_data: Record<string, any>;
  confidence_score?: number;
  observations_count?: number;
  maia_interpretation?: string;
  first_detected: string;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSoulPatternInput {
  pattern_type: 'dominant_element' | 'growth_trajectory' | 'recurring_archetype' | 'shadow_integration';
  pattern_data: Record<string, any>;
  confidence_score?: number;
  observations_count?: number;
  maia_interpretation?: string;
  first_observed?: string | null;
  last_observed?: string | null;
  insight?: string | null;
}

export interface UpdateSoulPatternInput {
  pattern_data?: Record<string, any>;
  confidence_score?: number;
  observations_count?: number;
  maia_interpretation?: string;
}
