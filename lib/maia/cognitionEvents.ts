/**
 * MAIA Cognition Events — Types for visible intelligence
 *
 * These events flow from the oracle/conversation processing into the right panel.
 * The right panel is not navigation — it is the visible edge of MAIA's thinking.
 *
 * Types defined now. Full wiring in a later pass.
 * Source signals: participatory reality theme detection, memory system, oracle response metadata.
 */

import type { MaiaWorldId } from '@/lib/navigation/types';
import type { MaiaCapability } from './capabilities';

// --- Cognition Event Types ---

export type MaiaCognitionEvent =
  | { type: 'pattern_detected'; confidence: number; summary: string }
  | { type: 'journal_candidate'; text: string }
  | { type: 'wisdom_resonance'; tradition?: string; prompt: string }
  | { type: 'relationship_thread'; person?: string; summary: string }
  | { type: 'studio_transition_suggested'; reason: string }
  | { type: 'world_shift'; world: MaiaWorldId }
  | { type: 'capability_available'; capabilityId: MaiaCapability; label: string }
  | { type: 'idea_candidate'; title: string; summary: string; confidence: number; fingerprint: string };

// --- Conversation Insight (for right panel rendering) ---

export interface ConversationInsight {
  id: string;
  type: 'pattern-match' | 'prior-thread' | 'sacred-resonance' | 'theme-emergence' | 'capability-offer' | 'idea-candidate';
  title: string;
  summary: string;
  /** 0-1 — controls fade-in timing and opacity */
  relevance: number;
  /** Which world this relates to */
  worldId?: MaiaWorldId;
  /** When this insight emerged */
  timestamp: number;
}
