// lib/types/ai.ts
// AI-related type definitions

export interface AIResponse {
  content: string;
  element?: string;
  energy?: string;
  metadata?: {
    model?: string;
    temperature?: number;
    tokens?: number;
    timestamp?: Date;
  };
  /**
   * Allow forward-compatible extra properties while we refactor response schemas
   */
  [key: string]: any;
}

export interface AIContext {
  userId?: string;
  sessionId?: string;
  history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  element?: string;
  mood?: string;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
}

// === Relational Routing v1 ===

export type MaiaIntent =
  | 'journal_entry'
  | 'reflection_mark'
  | 'idea_emergence'
  | 'decision_point'
  | 'change_process'
  | 'pattern_encounter'
  | 'journey_recognition'
  | 'depth_emergence'
  | 'unknown';

export type RoutedCapability =
  | 'journal'
  | 'reflection'
  | 'ideas'
  | 'decisions'
  | 'changes'
  | 'patterns'
  | 'journey'
  | 'depth'
  | 'conversation';

export interface IntentRoute {
  intent: MaiaIntent;
  capability: RoutedCapability;
  openUi: 'none' | 'panel' | 'card';
}

export interface MaiaUiAction {
  type:
    | 'open_journal'
    | 'open_reflection'
    | 'open_ideas'
    | 'open_decisions'
    | 'open_changes'
    | 'enter_patterns'
    | 'enter_journey'
    | 'enter_depth'
    | 'none';
  label?: string;
  leadIn?: string;
  confidence?: number;
  /** True for world-entry doorways (distinct from process doorways) */
  isWorldDoorway?: boolean;
}