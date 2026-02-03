/**
 * MAIA MindContext Types
 *
 * Type-safe interfaces for threading PFI mind state through response paths.
 * Replaces (meta as any) patterns with explicit, canon-aligned typing.
 *
 * CANON PRINCIPLES (see docs/canon/MAIA_CANON_v1.1.md):
 * - Type safety is part of canon: linguistic/structural integrity prevents drift
 * - No teleology in field names (readiness, not "breakthrough")
 * - autonomyRatio governs articulation assistance, never mind conclusions
 * - All fields serve remembrance, not steering
 */

import type { CognitiveProfile } from '../../consciousness/cognitiveProfileService';

// =============================================================================
// ELEMENT TYPES
// =============================================================================

/** Elemental domains in the Spiralogic system */
export type ElementName = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

/** Field realms for routing consciousness work (aligned with FieldRealm in panconsciousFieldRouter) */
export type RealmName = 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC' | 'UNDERWORLD';

/** Source of PFI mind state generation */
export type PFISource = 'pfi_full' | 'pfi_legacy' | 'fallback';

/**
 * PFI Mind State - Field-derived pre-language state
 *
 * CANON: This state can influence settling/tone and articulation assistance,
 * but must NEVER steer conclusions, create convergence, or amplify certainty.
 */
export interface PFIMindState {
  // Field-derived state (pre-language)
  elementalDominance: ElementName;
  elementalBalance: number;        // 0-1 (balance vs skew)
  coherenceLevel: number;          // 0-1 (settling/stability, NOT alignment)
  resonanceIndex: number;          // 0-1
  integrationReadiness: number;    // 0-1 (process readiness, NOT "breakthrough")
  reactivityIndex: number;         // 0-1 (how hooked/activated the field appears)

  // Sovereignty/autonomy
  autonomyRatio: number;           // 0-1 (sovereignty over external articulation support)
  fieldWorkSafe: boolean;

  // Routing guidance
  realm: RealmName;
  deepWorkRecommended: boolean;

  // Integration metrics
  integrationCoverage: number;     // 0-1 (how much of PFI is contributing)
  signalQuality: number;           // 0-1

  // Source tracking
  source: PFISource;
}

/**
 * Conversation Turn - minimal structure for history
 */
export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  userMessage?: string;
  maiaResponse?: string;
}

/**
 * Mind Context - unified context for MAIA's mind generation
 *
 * CANON: This context provides field awareness without steering.
 * It serves recognition, not persuasion.
 */
export interface MindContext {
  // Core inputs for mind generation
  userId: string | null;
  sessionId: string;
  input: string;
  conversationHistory: ConversationTurn[];
  cognitiveProfile: CognitiveProfile | null;

  // Optional PFI mind state (feature-flagged)
  pfiMindState?: PFIMindState;

  // Canon-relevant derived flags (optional; safe scalars only)
  canonFlags?: {
    enemyFrameDetected?: boolean;
    persuasionPressure?: boolean;
    highHeatInput?: boolean;
  };
}

// =============================================================================
// TELEMETRY TYPES
// =============================================================================

/**
 * Canon-compliant telemetry record
 *
 * CONSTRAINTS:
 * - Console-only, no persistence
 * - No raw user text
 * - No engagement proxies (session length, time on platform, share intent)
 * - Only canon-relevant scalars
 */
export interface PFITelemetryRecord {
  _tag: 'PFI_TELEMETRY';
  source: PFISource;
  path: 'FAST' | 'CORE' | 'DEEP';
  autonomyRatio: number;
  coherenceLevel: number;
  reactivityIndex: number;
  fieldWorkSafe: boolean;
  realm: RealmName;
  timestamp: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Default fallback mind state for when PFI is unavailable
 *
 * CANON: Fallback maintains full autonomy and grounded presence.
 */
export function getDefaultMindState(): PFIMindState {
  return {
    elementalDominance: 'Earth',
    elementalBalance: 0.5,
    coherenceLevel: 0.7,
    resonanceIndex: 0.5,
    integrationReadiness: 0.5,
    reactivityIndex: 0.3,
    autonomyRatio: 1.0,  // Full autonomy in fallback
    fieldWorkSafe: true,
    realm: 'MIDDLEWORLD',
    deepWorkRecommended: false,
    integrationCoverage: 0,
    signalQuality: 0,
    source: 'fallback'
  };
}
