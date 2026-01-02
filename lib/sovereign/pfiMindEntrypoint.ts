/**
 * CANONICAL MIND ENTRYPOINT - PFI (Panconsciousness Field Intelligence)
 *
 * The ONLY function that generates MAIA's pre-language mind state.
 * All response paths (FAST/CORE/DEEP) call through this.
 *
 * CANON PRINCIPLES (see docs/canon/MAIA_CANON_v1.1.md):
 * - MAIA's mind is the consciousness system (Spiralogic, AIN, field intelligence)
 * - Claude is the mouth - it articulates, never supersedes
 * - autonomyRatio influences only mouth-layer invocation, never mind conclusions
 * - No teleology: we track settling/readiness, not "progress toward breakthrough"
 *
 * FEATURE FLAGS:
 * - MAIA_PFI_MIND=true: Enable PFI mind entrypoint (default: OFF)
 * - MAIA_PFI_FULL_INTEGRATION=true: Enable 50+ system integration (default: OFF)
 */

import { routePanconsciousField, type FieldRoutingDecision } from '../field/panconsciousFieldRouter';
import type { CognitiveProfile } from '../consciousness/cognitiveProfileService';

// Import canonical types from shared location
import type {
  PFIMindState,
  MindContext,
  ConversationTurn,
  ElementName,
  RealmName,
  PFISource,
  PFITelemetryRecord,
} from './types/mindContext';

// Re-export types for consumers
export type { PFIMindState, MindContext, ConversationTurn, ElementName, RealmName, PFISource };

/**
 * Context for generating PFI mind state
 * Extended from MindContext with additional field routing inputs
 */
export interface PFIMindContext {
  userId: string | null;
  sessionId: string;
  input: string;
  conversationHistory: ConversationTurn[];
  cognitiveProfile: CognitiveProfile | null;
  element?: string | null;
  facet?: string | null;
  archetype?: string | null;
  bloomLevel?: number | null;
}

// =============================================================================
// TELEMETRY (Canon-Compliant)
// =============================================================================

// PFITelemetryRecord is imported from ./types/mindContext - no local redefinition

/**
 * Log canon-compliant telemetry (console only, no persistence)
 */
export function logPFITelemetry(
  mindState: PFIMindState,
  path: 'FAST' | 'CORE' | 'DEEP'
): void {
  const record: PFITelemetryRecord = {
    _tag: 'PFI_TELEMETRY',
    source: mindState.source,
    path,
    autonomyRatio: mindState.autonomyRatio,
    coherenceLevel: mindState.coherenceLevel,
    reactivityIndex: mindState.reactivityIndex,
    fieldWorkSafe: mindState.fieldWorkSafe,
    realm: mindState.realm,
    timestamp: Date.now(),
  };

  // Console-only, no persistence, no raw user text
  console.log(JSON.stringify(record));
}

// =============================================================================
// CANONICAL MIND ENTRYPOINT
// =============================================================================

/**
 * Generate PFI Mind State - THE canonical entrypoint for MAIA's mind
 *
 * All response paths (FAST/CORE/DEEP) should call this function.
 * The returned mind state is pre-language: it informs response shaping
 * but does not contain the response itself.
 *
 * @param context - The context for mind state generation
 * @returns PFIMindState - The canonical pre-language field state
 */
export async function generatePFIMindState(
  context: PFIMindContext
): Promise<PFIMindState> {
  const { userId, sessionId, cognitiveProfile, element, facet, archetype, bloomLevel } = context;

  try {
    // ─────────────────────────────────────────────────────────────
    // STEP 1: Panconscious Field Routing (always runs)
    // ─────────────────────────────────────────────────────────────
    const fieldRouting: FieldRoutingDecision = routePanconsciousField({
      cognitiveProfile,
      element: element ?? null,
      facet: facet ?? null,
      archetype: archetype ?? null,
      bloomLevel: bloomLevel ?? null,
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Check for full PFI integration (nested flag)
    // ─────────────────────────────────────────────────────────────
    const useFullIntegration = process.env.MAIA_PFI_FULL_INTEGRATION === 'true';

    if (useFullIntegration && userId) {
      try {
        // Dynamic import to avoid loading heavy modules when not needed
        const { ElementalFieldIntegration } = await import('../consciousness/field/ElementalFieldIntegration');
        const { MAIAConsciousnessFieldIntegration } = await import('../consciousness/autonomy/MAIAConsciousnessFieldIntegration');

        // This would wire the full 50+ system integration
        // For now, we prepare the structure but don't fully wire until tests pass
        console.log(`🧠 [PFI Full] Would integrate 50+ systems (pending canon drift tests)`);

        // Return PFI-full placeholder (actual integration pending tests)
        return buildMindStateFromRouting(fieldRouting, element, 'pfi_full', {
          // Full integration would provide richer values here
          integrationCoverage: 0.8,
          signalQuality: 0.75,
        });
      } catch (err) {
        console.warn('⚠️ [PFI Full] Integration failed, falling back to legacy:', err);
        // Fall through to legacy path
      }
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Legacy path (panconscious router only)
    // ─────────────────────────────────────────────────────────────
    return buildMindStateFromRouting(fieldRouting, element, 'pfi_legacy', {
      integrationCoverage: 0.2, // Only panconscious router active
      signalQuality: 0.7,
    });

  } catch (err) {
    console.error('❌ [PFI Mind] Critical failure, using fallback:', err);
    return buildFallbackMindState();
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build PFI mind state from field routing decision
 */
function buildMindStateFromRouting(
  routing: FieldRoutingDecision,
  element: string | null | undefined,
  source: PFIMindState['source'],
  metrics: { integrationCoverage: number; signalQuality: number }
): PFIMindState {
  // Derive elemental dominance from context or default
  const elementalDominance = normalizeElement(element);

  // Derive reactivity from routing stability signals
  // Lower stability = higher reactivity (more hooked/activated)
  const stabilityScore = routing.fieldWorkSafe ? 0.7 : 0.3;
  const reactivityIndex = 1 - stabilityScore;

  // Derive coherence from field safety (stable = coherent)
  const coherenceLevel = routing.fieldWorkSafe ? 0.7 : 0.4;

  // Integration readiness based on deep work recommendation
  const integrationReadiness = routing.deepWorkRecommended ? 0.8 : 0.5;

  return {
    elementalDominance,
    elementalBalance: 0.6, // Placeholder until full integration
    coherenceLevel,
    resonanceIndex: 0.5, // Placeholder until full integration
    integrationReadiness,
    reactivityIndex,
    autonomyRatio: 1.0, // MAIA fully sovereign (Claude only assists articulation)
    fieldWorkSafe: routing.fieldWorkSafe,
    realm: routing.realm,
    deepWorkRecommended: routing.deepWorkRecommended,
    integrationCoverage: metrics.integrationCoverage,
    signalQuality: metrics.signalQuality,
    source,
  };
}

/**
 * Build fallback mind state when all else fails
 */
function buildFallbackMindState(): PFIMindState {
  return {
    elementalDominance: 'Earth', // Grounding default
    elementalBalance: 0.5,
    coherenceLevel: 0.5,
    resonanceIndex: 0.5,
    integrationReadiness: 0.3,
    reactivityIndex: 0.5,
    autonomyRatio: 1.0, // Full sovereignty in fallback
    fieldWorkSafe: false, // Conservative default
    realm: 'MIDDLEWORLD',
    deepWorkRecommended: false,
    integrationCoverage: 0,
    signalQuality: 0.3,
    source: 'fallback',
  };
}

/**
 * Normalize element string to typed enum
 */
function normalizeElement(
  element: string | null | undefined
): PFIMindState['elementalDominance'] {
  if (!element) return 'Earth'; // Grounding default

  const normalized = element.toLowerCase();
  switch (normalized) {
    case 'fire': return 'Fire';
    case 'water': return 'Water';
    case 'earth': return 'Earth';
    case 'air': return 'Air';
    case 'aether':
    case 'ether':
    case 'spirit':
      return 'Aether';
    default:
      return 'Earth'; // Grounding default for unknown
  }
}

// =============================================================================
// FEATURE FLAG HELPERS
// =============================================================================

/**
 * Check if PFI mind entrypoint is enabled
 */
export function isPFIMindEnabled(): boolean {
  return process.env.MAIA_PFI_MIND === 'true';
}

/**
 * Check if full PFI integration is enabled
 */
export function isPFIFullIntegrationEnabled(): boolean {
  return process.env.MAIA_PFI_FULL_INTEGRATION === 'true';
}
