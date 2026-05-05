/**
 * Soul Mirror — Routing Logic
 *
 * State → Element → Doorway. Nothing more.
 *
 * Core principle:
 *   The system does not tell the user who they are.
 *   It reflects what is already present.
 *
 * Constraints:
 *   - No scoring, no percentages, no profiles
 *   - Element label is never shown to the user in MVP
 *   - Polarity blocks are excluded from first encounters
 *
 * See: docs/book-studio/SOUL_MIRROR_ROUTING.md
 */

import { PASSAGE_BLOCKS, blocksFor, blockById, type PassageBlock, type Element } from './passageBlocks';
import { FELT_AFFINITY } from './affinity';

export type FeltInput =
  | 'alive'
  | 'overwhelmed'
  | 'grounding'
  | 'disconnected'
  | 'still'
  | 'unsure';

export interface FeltOption {
  id: FeltInput;
  label: string;
}

/**
 * The six felt-state options shown on the entry screen.
 * Worded as states present, not categories.
 */
export const FELT_OPTIONS: readonly FeltOption[] = [
  { id: 'alive', label: 'Something feels alive or urgent' },
  { id: 'overwhelmed', label: 'I feel overwhelmed or emotional' },
  { id: 'grounding', label: 'I need grounding or direction' },
  { id: 'disconnected', label: 'I feel scattered or disconnected' },
  { id: 'still', label: 'I feel quiet, still, or complete' },
  { id: 'unsure', label: "I'm not sure" },
];

/**
 * Recognition lines — one line returned before the doorway.
 * Names what is present without naming the user.
 * Tone: quiet recognition, not diagnosis.
 */
export const RECOGNITION: Record<FeltInput, string> = {
  alive: 'Something in you is rising. It may not need to be contained.',
  overwhelmed: 'Something in you is asking to be felt, not solved.',
  grounding: 'Something in you is returning to the body, not the plan.',
  disconnected: 'Something in you wants to be heard before it is explained.',
  still: 'Nothing here needs to be added. It is already resting.',
  unsure: "Something is moving. You don't have to name it yet.",
};

/**
 * Map a felt input to an element. Element is never shown to the user.
 * "unsure" softly alternates between water and aether.
 */
export function mapToElement(input: FeltInput): Element {
  switch (input) {
    case 'alive':
      return 'fire';
    case 'overwhelmed':
      return 'water';
    case 'grounding':
      return 'earth';
    case 'disconnected':
      return 'air';
    case 'still':
      return 'aether';
    case 'unsure':
      return Math.random() < 0.5 ? 'water' : 'aether';
  }
}

export interface SoulMirrorResponse {
  /** The recognition line shown before the doorway. */
  recognition: string;
  /** The passage block presented. */
  block: PassageBlock;
  /** Internal — never displayed to the user in MVP. */
  element: Element;
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Select a doorway block for the given felt input.
 *
 * Routing order (each step filters out blocks recently shown):
 *   1. Felt-state affinity — blocks whose felt-vector matches the input.
 *   2. General element pool — non-polarity blocks in the matching element.
 *   3. Final fallback — any non-polarity block in the element, ignoring recency.
 *
 * Polarity blocks (e.g. FIRE-07 "Burns Too Hot") never surface as first
 * doorways. They are reserved for later encounters or context-driven surfacing.
 */
function selectBlock(input: FeltInput, recentlyShown: readonly string[] = []): PassageBlock {
  const recent = new Set(recentlyShown.slice(-3));

  // 1. Affinity-aligned blocks
  const affinityIds = FELT_AFFINITY[input] ?? [];
  const affinityPool = affinityIds
    .map((id) => blockById(id))
    .filter((b): b is PassageBlock => !!b)
    .filter((b) => !recent.has(b.id));

  if (affinityPool.length > 0) {
    return pickRandom(affinityPool);
  }

  // 2. General element pool, excluding recently shown
  const element = mapToElement(input);
  const elementPool = blocksFor(element, { includePolarity: false }).filter(
    (b) => !recent.has(b.id)
  );

  if (elementPool.length > 0) {
    return pickRandom(elementPool);
  }

  // 3. Final fallback — any non-polarity block in the element
  return pickRandom(blocksFor(element, { includePolarity: false }));
}

/**
 * Main entry point. Maps a felt input to a recognition + a doorway.
 *
 * @param input - the user's selected felt state
 * @param recentlyShown - block IDs the user has recently encountered (avoid repeats)
 */
export function routeSoulMirror(
  input: FeltInput,
  recentlyShown: readonly string[] = []
): SoulMirrorResponse {
  const block = selectBlock(input, recentlyShown);
  const recognition = RECOGNITION[input];
  return { recognition, block, element: block.element };
}
