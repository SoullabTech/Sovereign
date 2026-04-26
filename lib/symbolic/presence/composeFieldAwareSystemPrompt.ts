/**
 * Field-Aware System Prompt Composer
 *
 * When the Astrologer field is requested or active, integrative system-prompt
 * blocks must be SUPPRESSED. Otherwise Knowledge Field's 12-domain registry,
 * Council Insights, Collective Wisdom, and similar would smuggle non-
 * astrological systems back into the prompt — directly contradicting the
 * brief's cross-system refusal.
 *
 * Containment principle (per docs/canon/MAIA_THE_ASTROLOGER_ROUTE_INTEGRATION.md §4):
 * while in field, the system prompt is NOT integrative. The base identity +
 * Astrologer presence block + situational context only.
 *
 * Used by both the normal LLM path and the repair path. Single helper, single
 * suppression rule, single ordering.
 */

import {
  getAstrologerPresenceAddendum,
  type AstrologerFieldState,
} from '@/lib/symbolic/presence/astrologicalMaia';

/**
 * The set of system-prompt blocks the route assembles for `finalSystemPrompt`.
 * Each block is optional; missing/empty values are dropped.
 */
export interface SystemPromptBlocks {
  /** Base identity (sacred-attending). Always kept. */
  base: string;
  /** Ask MAIA orientation stance. Suppressed in field. */
  orientationBlock?: string;
  /** Practitioner-environment block. Kept (situational, not integrative). */
  cmEnvironmentBlock?: string;
  /** 12-domain knowledge field registry. Suppressed in field. */
  knowledgeFieldBlock?: string;
  /** Active spiralogic report context. Kept. */
  reportContextBlock?: string;
  /** Participatory theme block. Suppressed in field. */
  activeThemeBlock?: string;
  /** Council perspectives. Suppressed in field. */
  councilInsights?: string;
  /** Collective wisdom patterns. Suppressed in field. */
  collectiveWisdom?: string;
  /** Event-arc situational context. Kept. */
  eventArcBlock?: string;
  /** Relational context (synastry-relevant). Kept. */
  relationalContextBlock?: string;
}

export interface ComposedSystemPrompt {
  /** Final system-prompt string ready to pass to the LLM. */
  systemPrompt: string;
  /**
   * Names of blocks that WERE present in the input but were suppressed by
   * field containment. Used by the route for the
   * `astrologer.field.suppression` telemetry log.
   */
  suppressed: string[];
  /** True iff the Astrologer presence addendum was prepended. */
  fieldAddendumIncluded: boolean;
}

/** Block keys that are dropped while the field is non-inactive. */
export const SUPPRESSED_IN_FIELD = [
  'orientationBlock',
  'knowledgeFieldBlock',
  'activeThemeBlock',
  'councilInsights',
  'collectiveWisdom',
] as const satisfies ReadonlyArray<keyof SystemPromptBlocks>;

/** Composition order when state === 'inactive' — matches the existing route. */
export const COMPOSITION_ORDER_INACTIVE: ReadonlyArray<keyof SystemPromptBlocks> = [
  'base',
  'orientationBlock',
  'cmEnvironmentBlock',
  'knowledgeFieldBlock',
  'reportContextBlock',
  'activeThemeBlock',
  'councilInsights',
  'collectiveWisdom',
  'eventArcBlock',
  'relationalContextBlock',
];

/** Composition order when state !== 'inactive' — Astrologer addendum prepended after base. */
export const COMPOSITION_ORDER_IN_FIELD: ReadonlyArray<keyof SystemPromptBlocks> = [
  'base',
  // Astrologer presence addendum is injected here by composeFieldAwareSystemPrompt.
  'cmEnvironmentBlock',
  'reportContextBlock',
  'eventArcBlock',
  'relationalContextBlock',
];

/**
 * Compose the final system prompt with field-state-aware suppression.
 *
 * - state === 'inactive': passthrough composition matching the existing
 *   route order. No presence addendum, no suppression.
 * - state !== 'inactive': Astrologer presence addendum prepended after `base`,
 *   integrative blocks (knowledge field, orientation, council, collective,
 *   participatory themes) suppressed. Returned `suppressed` lists the blocks
 *   that were present in the input but dropped — for telemetry.
 */
export function composeFieldAwareSystemPrompt(
  state: AstrologerFieldState,
  blocks: SystemPromptBlocks,
): ComposedSystemPrompt {
  if (state === 'inactive') {
    const parts: string[] = [];
    for (const key of COMPOSITION_ORDER_INACTIVE) {
      const value = blocks[key];
      if (value) parts.push(value);
    }
    return {
      systemPrompt: parts.join(''),
      suppressed: [],
      fieldAddendumIncluded: false,
    };
  }

  // In field: prepend addendum, suppress integrative blocks
  const addendum = getAstrologerPresenceAddendum(state);
  const parts: string[] = [];
  if (blocks.base) parts.push(blocks.base);
  parts.push(addendum);

  for (const key of COMPOSITION_ORDER_IN_FIELD) {
    if (key === 'base') continue; // already added
    const value = blocks[key];
    if (value) parts.push(value);
  }

  // Track which suppressible blocks were present-but-dropped (for telemetry)
  const suppressed: string[] = [];
  for (const key of SUPPRESSED_IN_FIELD) {
    if (blocks[key as keyof SystemPromptBlocks]) suppressed.push(key);
  }

  return {
    systemPrompt: parts.join(''),
    suppressed,
    fieldAddendumIncluded: true,
  };
}
