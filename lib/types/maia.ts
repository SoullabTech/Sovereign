// backend: lib/types/maia.ts

/**
 * MAIA TRAINING DATA TYPES
 *
 * Clean TypeScript interfaces for MAIA's learning nervous system
 */

import type {
  BloomLevel,
  BloomDetection
} from '../consciousness/bloomCognition';

/**
 * Bloom's Taxonomy Cognitive Level Metadata
 * Tracks HOW users think (cognitive process) not just WHAT they know
 */
export interface BloomCognitionMeta {
  bloomLevel: BloomLevel;
  bloomNumericLevel: 1 | 2 | 3 | 4 | 5 | 6;
  bloomScore: number;
  rationale: string[];
}

export type MaiaTurnLogEntry = {
  sessionId: string;      // uuid from maia_sessions
  turnIndex: number;      // 0,1,2...

  userText: string;
  maiaText: string;

  processingProfile: 'FAST' | 'CORE' | 'DEEP';
  depthRequested?: 'surface' | 'medium' | 'deep' | 'unknown';
  depthDetected?: 'surface' | 'medium' | 'deep' | 'unknown';

  primaryEngine: string;      // e.g. 'deepseek-r1:8b'
  secondaryEngine?: string;   // optional
  usedClaudeConsult: boolean;

  latencyMs?: number;

  ruptureFlag?: boolean;
  repairFlag?: boolean;

  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  facet?: string;
  topicTags?: string[];

  // Bloom's Taxonomy cognitive detection
  cognition?: BloomCognitionMeta;
};

export type MaiaTurnFeedbackPayload = {
  turnId: number;
  sourceType: 'user' | 'tester' | 'dev' | 'auto';

  feltSeenScore?: number;              // 1–5
  attunementScore?: number;            // 1–5
  safetyScore?: number;                // 1–5
  depthAppropriatenessScore?: number;  // 1–5

  ruptureMark?: boolean;
  idealForRepair?: boolean;

  tags?: string[];
  comment?: string;
  idealMaiaReply?: string;
};

// Response types
export interface TurnLogResponse {
  turnId: number;
  success: boolean;
}

export interface FeedbackResponse {
  feedbackId: number;
  success: boolean;
}

// Training export types
export interface GoldTurn {
  turn_id: number;
  session_id: string;
  turn_index: number;
  user_text: string;
  maia_text: string;
  processing_profile: string;
  element: string | null;
  facet: string | null;
  topic_tags: string[] | null;
  felt_seen_score: number;
  attunement_score: number;
  safety_score: number;
  depth_appropriateness_score: number;
  feedback_tags: string[] | null;
  feedback_comment: string | null;
  feedback_created_at: Date;
}

export interface RuptureEvent {
  turn_id: number;
  session_id: string;
  turn_index: number;
  user_text: string;
  maia_text: string;
  processing_profile: string;
  element: string | null;
  facet: string | null;
  topic_tags: string[] | null;
  source_type: string;
  felt_seen_score: number;
  attunement_score: number;
  safety_score: number;
  depth_appropriateness_score: number;
  rupture_mark: boolean;
  ideal_for_repair: boolean;
  feedback_tags: string[] | null;
  feedback_comment: string | null;
  ideal_maia_reply: string | null;
  feedback_created_at: Date;
}

export interface TrainingExportRow {
  turn_id: number;
  session_id: string;
  turn_index: number;
  user_text: string;
  maia_text: string;
  processing_profile: string;
  element: string | null;
  facet: string | null;
  topic_tags: string[] | null;
  source_type: string;
  felt_seen_score: number;
  attunement_score: number;
  safety_score: number;
  depth_appropriateness_score: number;
  rupture_mark: boolean;
  ideal_for_repair: boolean;
  feedback_tags: string[] | null;
  feedback_comment: string | null;
  ideal_maia_reply: string | null;
  feedback_created_at: Date;
  label: 'gold' | 'rupture' | 'neutral';
}