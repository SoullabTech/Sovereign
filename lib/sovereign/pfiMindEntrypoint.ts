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
    routingBasis: mindState.routingBasis,
    fieldWorkSafe: mindState.fieldWorkSafe,
    realm: mindState.realm,
    deepWorkRecommended: mindState.deepWorkRecommended,
    elementalSignal: mindState.elementalDominance === undefined ? 'absent' : 'present',
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

    /**
     * PFI-REPRESENTATION — ⛔ the `pfi_full` identity is RETIRED.
     *
     * This branch imported two integration modules, USED NEITHER, logged that it
     * "would integrate 50+ systems", and returned the same routing-derived state
     * relabelled `pfi_full` with `integrationCoverage: 0.8` instead of `0.2`.
     * The label and two constants were the only difference.
     *
     * ⭐⭐ A requested capability is not an achieved capability.
     *
     * The flag may still be REQUESTED; the receipt can say so truthfully. What it
     * may no longer do is hand cognition an identity claiming an integration that
     * did not occur. The dead imports go with it.
     */
    if (useFullIntegration && userId) {
      console.log('[field-truth] pfi_full_integration', JSON.stringify({
        fullIntegrationRequested: true,
        fullIntegrationAvailable: false,
        actualSource: 'routing_only',
      }));
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Legacy path (panconscious router only)
    // ─────────────────────────────────────────────────────────────
    return buildMindStateFromRouting(fieldRouting, element, 'routing_only');

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
): PFIMindState {
  // Derive elemental dominance from context or default
  const elementalDominance = normalizeElement(element);

  /**
   * PFI-REPRESENTATION — ⛔ three numeric recodings deleted, not repaired:
   *
   *   coherenceLevel      = fieldWorkSafe ? 0.7 : 0.4
   *   reactivityIndex     = 1 - (fieldWorkSafe ? 0.7 : 0.3)
   *   integrationReadiness= deepWorkRecommended ? 0.8 : 0.5
   *
   * ⭐ They do not become booleans named "coherence". The false CONCEPT
   * disappears; `fieldWorkSafe` and `deepWorkRecommended` remain because that is
   * what the system actually decided. Repairing the number while keeping the name
   * would have preserved the semantic inflation.
   */
  return {
    elementalDominance,
    fieldWorkSafe: routing.fieldWorkSafe,
    realm: routing.realm,
    deepWorkRecommended: routing.deepWorkRecommended,
    // PFI-REPRESENTATION-A — taken from the router's own typed basis.
    // ⛔ Was inferred from `routing.reasoning.startsWith('No cognitive profile')`:
    // a human-readable explanation parsed to establish provenance, so a copy edit
    // could silently change the epistemic basis of the result.
    // ⭐⭐ Provenance may be rendered into prose. It may never be recovered from it.
    routingBasis: routing.basis,
    source,
  };
}

/**
 * Build fallback mind state when all else fails
 */
/**
 * FIELD-TRUTH-03 — this is an OPERATIONAL POSTURE, not an observation.
 *
 *   OPERATIONAL DEFAULT   what the system chooses to DO when it cannot know
 *   COGNITIVE SIGNAL      what the system is entitled to say it KNOWS
 *
 * `fieldWorkSafe: false`, `realm: 'MIDDLEWORLD'` and `deepWorkRecommended: false`
 * are lawful conservative policy — "in uncertainty, use the careful posture".
 * ⛔ `elementalDominance: 'Earth'` was NOT policy. It was an unobserved identity
 * travelling as evidence, and it is gone. `source: 'fallback'` is what callers
 * must read before treating any field here as cognition-bearing.
 */
export function buildFallbackMindState(): PFIMindState {
  return {
    // ⛔ No elementalDominance: absence of an elemental reading is not Earth.
    // ⭐ What remains is POSTURE — what the system chooses to do when it cannot
    // know — never a claim that anything about the member was observed.
    fieldWorkSafe: false,
    realm: 'MIDDLEWORLD',
    deepWorkRecommended: false,
    routingBasis: 'conservative_policy_default',
    source: 'fallback',
  };
}

/**
 * Normalize element string to typed enum
 */
/**
 * FIELD-TRUTH-03 — the element is COPIED, not observed here.
 *
 * This function's only job is to case-map an elemental signal that arrived from
 * upstream. It has no evidence of its own, so it may not supply one:
 *
 *   valid signal        → normalized element
 *   absent signal       → absent          (was: 'Earth')
 *   unrecognised value  → absent          (was: 'Earth')
 *
 * ⭐ Honest absence must survive the entire derivation chain. FIELD-TRUTH-02 made
 * the Elemental Oracle return absence; this is the next link, where that absence
 * was being converted straight back into a fabricated identity.
 */
function normalizeElement(
  element: string | null | undefined
): PFIMindState['elementalDominance'] {
  if (!element) return undefined;

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
      return undefined; // FIELD-TRUTH-03: an unrecognised value is not evidence of Earth
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
