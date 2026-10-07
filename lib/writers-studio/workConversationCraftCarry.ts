import { query } from '@/lib/db/postgres';
import { loadThread } from '@/lib/manuscript/ask/threadStore';

export interface WorkConversationCarryTurn {
  readonly turnIndex: number;
  readonly body: string;
}

export interface ResolvedWorkConversationCraftCarry {
  readonly kind: 'WORK_CONVERSATION_CRAFT';
  readonly sourceThreadId: string;
  readonly sourceMaiaTurnIndex: number;
  readonly manuscriptId: string;
  /** The Develop conversation may be Work-anchored or observation-anchored. */
  readonly sourceAnchorKind: 'work' | 'observation';
  readonly memberTurns: readonly WorkConversationCarryTurn[];
  readonly maiaTurns: readonly WorkConversationCarryTurn[];
  readonly sourceTurnCount: number;
  readonly producerIds: readonly [
    'member.writer_prior_work_conversation',
    'system.writer_prior_work_conversation',
  ];
}

export type WorkConversationCraftCarryResult =
  | { readonly ok: true; readonly carry: ResolvedWorkConversationCraftCarry }
  | {
      readonly ok: false;
      readonly reason:
        | 'source_thread_not_found'
        | 'source_thread_mismatch'
        | 'source_not_work_conversation'
        | 'source_turn_not_found'
        | 'source_turn_not_maia'
        | 'source_conversation_empty';
    };

const MAX_TURNS = 12;
const MAX_CHARS_PER_AUTHOR = 9000;

function bounded(turns: readonly WorkConversationCarryTurn[]): WorkConversationCarryTurn[] {
  const out: WorkConversationCarryTurn[] = [];
  let chars = 0;
  for (const turn of [...turns].reverse()) {
    const next = Array.from(turn.body).length;
    if (out.length > 0 && chars + next > MAX_CHARS_PER_AUTHOR) break;
    out.push(turn);
    chars += next;
  }
  return out.reverse();
}

/**
 * R8J — resolve one prior Develop conversation into authorship-separated craft
 * context. The browser supplies only the source thread id. Ownership,
 * manuscript identity, source anchor kind and exact turns are re-derived here.
 *
 * A body-authorized observation conversation is still a conversation about this
 * Work. Permission changes what MAIA may read for that turn; it must not sever
 * the relational thread when the writer crosses into Craft.
 */
export async function resolveWorkConversationCraftCarry(input: {
  memberId: string;
  receiverThreadId: string;
  sourceThreadId: string;
  sourceMaiaTurnIndex: number;
}): Promise<WorkConversationCraftCarryResult> {
  const receiver = await query<{ manuscript_id: string; proposal_chain_id: string | null }>(
    `SELECT manuscript_id, proposal_chain_id FROM ask_threads
      WHERE id = $1 AND member_id = $2`,
    [input.receiverThreadId, input.memberId],
  );
  if (receiver.rows.length !== 1 || receiver.rows[0]!.proposal_chain_id === null) {
    return { ok: false, reason: 'source_thread_mismatch' };
  }
  const thread = await loadThread(input.sourceThreadId, input.memberId);
  if (!thread) return { ok: false, reason: 'source_thread_not_found' };
  if (thread.manuscriptId !== receiver.rows[0]!.manuscript_id) {
    return { ok: false, reason: 'source_thread_mismatch' };
  }
  if (thread.anchor.on !== 'work' && thread.anchor.on !== 'observation') {
    return { ok: false, reason: 'source_not_work_conversation' };
  }
  const boundary = thread.turns.find((turn) => turn.index === input.sourceMaiaTurnIndex);
  if (!boundary) return { ok: false, reason: 'source_turn_not_found' };
  if (boundary.speaker !== 'maia') return { ok: false, reason: 'source_turn_not_maia' };

  const recent = thread.turns
    .filter((turn) => turn.index <= input.sourceMaiaTurnIndex)
    .slice(-MAX_TURNS);
  if (recent.length === 0) return { ok: false, reason: 'source_conversation_empty' };

  const memberTurns = bounded(
    recent
      .filter((turn) => turn.speaker === 'author')
      .map((turn) => ({ turnIndex: turn.index, body: turn.body })),
  );
  const maiaTurns = bounded(
    recent
      .filter((turn) => turn.speaker === 'maia')
      .map((turn) => ({ turnIndex: turn.index, body: turn.body })),
  );

  if (memberTurns.length === 0 && maiaTurns.length === 0) {
    return { ok: false, reason: 'source_conversation_empty' };
  }

  return {
    ok: true,
    carry: {
      kind: 'WORK_CONVERSATION_CRAFT',
      sourceThreadId: thread.id,
      sourceMaiaTurnIndex: input.sourceMaiaTurnIndex,
      manuscriptId: thread.manuscriptId,
      sourceAnchorKind: thread.anchor.on,
      memberTurns,
      maiaTurns,
      sourceTurnCount: recent.length,
      producerIds: [
        'member.writer_prior_work_conversation',
        'system.writer_prior_work_conversation',
      ],
    },
  };
}
