/**
 * Multi-Spiral State Formatter
 *
 * CRITICAL: Single Source of Truth Pattern
 * =========================================
 * This formatter takes a pre-fetched list of active spirals and returns BOTH:
 * 1. Formatted text for prompt injection
 * 2. Metadata for response logging
 *
 * By using the SAME list instance for both, drift is impossible by construction.
 * The formatter does NOT fetch data - it only formats what it receives.
 *
 * Usage:
 *   const activeSpirals = await SpiralStateService.getActiveSpiralsForInjection(userId);
 *   const result = formatMultiSpiralState(activeSpirals);
 *   // result.text → inject into prompt
 *   // result.metadata → attach to response
 */

import { SpiralState } from "./spiralStateUtils";

/**
 * Maximum number of active spirals to inject into prompts.
 * This is the contract: "top 3" spirals.
 */
export const DEFAULT_INJECTION_LIMIT = 3;

export interface MultiSpiralMetadata {
  injected: boolean;
  activeSpirals: SpiralState[]; // EXACT list used for formatting (top 3)
  totalActive: number; // Total active count (may be > 3)
  totalSpirals?: number; // Total spirals (active + inactive)
}

export interface MultiSpiralInjectionResult {
  text: string;
  metadata: MultiSpiralMetadata;
}

/**
 * Format active spirals for prompt injection.
 *
 * This function implements the single source of truth pattern:
 * - Accepts pre-fetched list (does not fetch)
 * - Returns both formatted text AND metadata
 * - Uses SAME list for both (drift impossible)
 *
 * @param activeSpirals - Pre-sorted, pre-limited list of active spirals (typically top 3)
 * @param totalActive - Total count of active spirals (optional, for metadata)
 * @param totalSpirals - Total count of all spirals (optional, for metadata)
 */
export function formatMultiSpiralState(
  activeSpirals: SpiralState[],
  totalActive?: number,
  totalSpirals?: number
): MultiSpiralInjectionResult {
  // No spirals case
  if (!activeSpirals.length) {
    return {
      text: "",
      metadata: {
        injected: false,
        activeSpirals: [],
        totalActive: totalActive ?? 0,
        totalSpirals,
      },
    };
  }

  // Build prompt injection text
  const lines = [
    "--- ACTIVE SPIRALS (Top 3) ---",
    "",
  ];

  activeSpirals.slice(0, DEFAULT_INJECTION_LIMIT).forEach((spiral, idx) => {
    const rank = idx + 1;
    const facetStr = spiral.facet || `${spiral.element} ${spiral.phase}`;
    const arcStr = spiral.arc ? ` (${spiral.arc})` : "";
    const confidence = Math.round((spiral.confidence || 0) * 100);

    lines.push(
      `${rank}. ${spiral.spiralKey}: ${facetStr}${arcStr} [${confidence}% confidence]`
    );
    lines.push(`   Updated: ${new Date(spiral.updatedAt).toLocaleDateString()}`);
    lines.push("");
  });

  lines.push("INSTRUCTION: Reference these spirals when relevant. Do not invent spiral states not listed here.");
  lines.push("--- END ACTIVE SPIRALS ---");

  return {
    text: lines.join("\n"),
    metadata: {
      injected: true,
      activeSpirals: activeSpirals.slice(0, DEFAULT_INJECTION_LIMIT), // EXACT list used in prompt
      totalActive: totalActive ?? activeSpirals.length,
      totalSpirals,
    },
  };
}

/**
 * Helper function to build complete spiral injection with fetched data.
 * This is the typical usage pattern for MAIA service integration.
 *
 * Example:
 *   const result = await buildSpiralInjection(userId);
 *   // Append result.text to system prompt
 *   // Attach result.metadata to response
 */
export async function buildSpiralInjection(
  userId: string,
  limit: number = DEFAULT_INJECTION_LIMIT
): Promise<MultiSpiralInjectionResult> {
  // Import dynamically to avoid circular dependencies
  const { SpiralStateService } = await import("./SpiralStateService");

  // Fetch spirals
  const allSpirals = await SpiralStateService.getSpiralStates(userId);
  const activeSpirals = await SpiralStateService.getActiveSpiralsForInjection(userId, limit);

  // Count totals
  const totalActive = allSpirals.spirals.filter(s => s.activeNow).length;
  const totalSpirals = allSpirals.spirals.length;

  // Format using single source of truth
  return formatMultiSpiralState(activeSpirals, totalActive, totalSpirals);
}
