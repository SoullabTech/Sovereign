/**
 * Holoflower Journal Types
 * Soul-level memory system for MAIA's deepening understanding
 */

export interface PetalConfiguration {
  id: string;
  name: string;
  intensity: number; // 1-10
  element: 'fire' | 'water' | 'earth' | 'air';
  stage: number; // 1, 2, 3
  affirmation: string;
  color: string;
}

export interface SpiralStage {
  element: string;
  stage: string;
  description: string;
}

export interface ElementalAlchemy {
  strengths: string[];
  opportunities: string[];
}

export interface ConversationMessage {
  role: 'user' | 'maia';
  content: string;
  timestamp: Date;
}

export type ConfigurationMethod = 'manual' | 'iching' | 'survey';

export interface HoloflowerJournalEntry {
  id: string;
  user_id: string;

  // Core Reading Data
  intention?: string;
  configuration_method: ConfigurationMethod;
  petal_intensities: PetalConfiguration[];

  // Oracle Reading
  spiral_stage: SpiralStage;
  archetype?: string;
  shadow_archetype?: string;
  elemental_alchemy?: ElementalAlchemy;
  reflection?: string;
  practice?: string;

  // Conversation Data
  conversation_messages: ConversationMessage[];
  conversation_summary?: string;

  // Metadata
  created_at: string;
  updated_at: string;

  // Soulprint
  soulprint_url?: string;

  // Tagging & Search
  tags: string[];
  is_favorite: boolean;

  // Privacy
  visibility: 'private' | 'community' | 'public';
}

export interface SoulPattern {
  id: string;
  user_id: string;

  // Pattern Recognition
  pattern_type: string; // 'dominant_element', 'recurring_archetype', 'growth_trajectory', etc.
  pattern_data: Record<string, any>;

  // Confidence & Frequency
  confidence_score?: number; // 0-1
  occurrence_count: number;

  // Time Range
  first_observed: string;
  last_observed: string;

  // MAIA's Insight
  insight?: string;

  created_at: string;
  updated_at: string;
}

// For creating new journal entries
export type CreateJournalEntryInput = Omit<HoloflowerJournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// For updating existing entries (conversation continues, tags added, etc.)
export type UpdateJournalEntryInput = Partial<Pick<HoloflowerJournalEntry,
  'conversation_messages' |
  'conversation_summary' |
  'tags' |
  'is_favorite' |
  'visibility' |
  'soulprint_url'
>>;
