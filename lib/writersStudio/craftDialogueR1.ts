import type { RebuildEditorialThread } from './rebuild/editorialCollaboration';

export type CraftDialogueSpeaker = 'writer' | 'maia' | 'action';

export interface CraftSendOptions {
  readonly proposalPolicy?: 'allow' | 'reply_only' | 'require';
  readonly proposalRequested?: boolean;
  /** What the writer should see in the Craft conversation, never prompt scaffolding. */
  readonly displayText?: string;
  readonly skipCanvasCommands?: boolean;
  readonly suppressWriterEcho?: boolean;
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
  const last = turns.at(-1);
  if (turn.speaker === 'action' && last?.speaker === 'action' && last.body === turn.body) return turns;
  if (turns.some((candidate) => candidate.key === turn.key)) return turns;
  const next = [...turns, turn];
  return next.length > limit ? next.slice(next.length - limit) : next;
}

/** Use the persisted wire turn identity, never a render/list index. A reply-only
 * turn has no proposal/version ID but must still reach the conversation. */
export function craftMaiaDialogueTurn(
  threadId: string,
  turn: RebuildEditorialThread['turns'][number] | null | undefined,
): CraftDialogueTurn | null {
  if (!threadId || !turn || turn.speaker !== 'maia'
    || !Number.isSafeInteger(turn.turnIndex) || turn.turnIndex < 0
    || !turn.body.trim()) return null;
  return {
    key: `maia:${threadId}:${turn.turnIndex}`,
    speaker: 'maia',
    body: turn.body,
  };
}
