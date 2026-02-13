/**
 * Contextual Guidance System — Types
 *
 * Types for the in-app guidance layer.
 * Maps to guidance_content, guidance_member_state, and guidance_signals tables.
 */

export type GuidanceDepth = 'tooltip' | 'micro' | 'deep' | 'article';

export type GuidanceAudience = 'all' | 'personal' | 'practice' | 'admin';

export type GuidanceStatus = 'unseen' | 'seen' | 'dismissed' | 'saved';

export type GuidanceSignalType =
  | 'tooltip_open'
  | 'learn_more_click'
  | 'search_help'
  | 'error_state'
  | 'whisper_served'
  | 'whisper_dismissed'
  | 'whisper_explore';

/** A single piece of guidance content at one depth level */
export interface GuidanceItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  depth: GuidanceDepth;
  featureKey: string;
  audience: GuidanceAudience;
  bodyMd?: string;
  videoUrl?: string;
  isEnabled: boolean;
  sortRank: number;
}

/** API response for content lookup */
export interface GuidanceContentResponse {
  featureKey: string;
  items: GuidanceItem[];
}

/** A signal event (structural confusion signal, no content capture) */
export interface GuidanceSignal {
  featureKey: string;
  signalType: GuidanceSignalType;
  context?: string;
}

// ---------------------------------------------------------------------------
// Guide Whisper (Phase 3) — dynamic, member-centric contextual insight
// ---------------------------------------------------------------------------

/** A suggested action the member can take from the whisper */
export interface WhisperAction {
  label: string;         // e.g. "Capture", "Name it", "Explore with MAIA"
  intent: string;        // machine-readable: 'capture' | 'name' | 'explore_maia' | 'leave_it'
}

/** A dynamically generated contextual whisper */
export interface GuideWhisper {
  whisper: string;                // 1-2 sentence insight, max ~30 words
  actions: WhisperAction[];       // 1-3 suggested next moves
  contextSummary?: string;        // brief label like "3 visits, nothing named yet"
}

/** API response for /api/guidance/insight */
export interface GuideInsightResponse {
  featureKey: string;
  whisper: GuideWhisper | null;   // null if no context to generate from
  fallbackTitle?: string;         // static tooltip title (always available)
  fallbackSummary?: string;       // static tooltip summary (always available)
}
