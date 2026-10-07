export type CraftDialogueSpeaker = 'writer' | 'maia';

export interface CraftSendOptions {
  readonly proposalPolicy?: 'allow' | 'reply_only';
  readonly proposalRequested?: boolean;
  /** What the writer should see in the Craft conversation, never prompt scaffolding. */
  readonly displayText?: string;
}

export interface CraftDialogueTurn {
  readonly key: string;
  readonly speaker: CraftDialogueSpeaker;
  readonly body: string;
}

/**
 * Presentation-only Craft dialogue.
 *
 * Editorial turns may contain internal prompt scaffolding that belongs to the
 * orchestration substrate, not to the writer-facing conversation. This stream
 * therefore stores only the writer's visible intent and MAIA's actual reply.
 */
export function appendCraftDialogue(
  turns: readonly CraftDialogueTurn[],
  turn: CraftDialogueTurn,
  limit = 24,
): readonly CraftDialogueTurn[] {
  if (!turn.body.trim()) return turns;
  if (turns.some((candidate) => candidate.key === turn.key)) return turns;
  const next = [...turns, turn];
  return next.length > limit ? next.slice(next.length - limit) : next;
}
