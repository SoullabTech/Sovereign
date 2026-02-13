/**
 * Contextual Guidance System — Types
 *
 * Types for the in-app guidance layer.
 * Maps to guidance_content, guidance_member_state, and guidance_signals tables.
 */

export type GuidanceDepth = 'tooltip' | 'micro' | 'deep' | 'article';

export type GuidanceAudience = 'all' | 'personal' | 'practice' | 'admin';

export type GuidanceStatus = 'unseen' | 'seen' | 'dismissed' | 'saved';

export type GuidanceSignalType = 'tooltip_open' | 'learn_more_click' | 'search_help' | 'error_state';

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
