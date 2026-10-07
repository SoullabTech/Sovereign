import { query } from '@/lib/db/postgres';
import { loadThread } from '@/lib/manuscript/ask/threadStore';
import { priorWorkConversationCraftCandidates, type EditorialCandidateBlock } from '@/lib/manuscript/editorialDiscourse/contract';

export interface ResolvedCraftPassCarry {
  readonly sourceThreadId: string;
  readonly sourceTurnIndex: number;
  readonly omittedTurnCount: number;
  readonly memberTurns: readonly { turnIndex: number; body: string }[];
  readonly maiaTurns: readonly { turnIndex: number; body: string }[];
}
export type CraftPassCarryResult =
  | { ok: true; carry: ResolvedCraftPassCarry }
  | { ok: false; reason: 'craft_pass_source_unavailable' | 'craft_pass_scope_mismatch' | 'craft_pass_boundary_missing' | 'craft_pass_context_too_large' };

/** Source identity only crosses HTTP. Both owners, both Works, both editorial
 * anchors and the precise historical boundary are re-derived before any write. */
export async function resolveCraftPassCarry(input: {
  memberId: string; receiverThreadId: string; sourceThreadId: string; sourceTurnIndex: number;
}): Promise<CraftPassCarryResult> {
  const rows = await query<{ id: string; manuscript_id: string; proposal_chain_id: string | null }>(
    `SELECT id, manuscript_id, proposal_chain_id FROM ask_threads
      WHERE member_id = $1 AND id = ANY($2::uuid[])`,
    [input.memberId, [input.receiverThreadId, input.sourceThreadId]],
  );
  const receiver = rows.rows.find(row => row.id === input.receiverThreadId);
  const source = rows.rows.find(row => row.id === input.sourceThreadId);
  if (!receiver || !source) return { ok: false, reason: 'craft_pass_source_unavailable' };
  if (!receiver.proposal_chain_id || !source.proposal_chain_id
    || receiver.manuscript_id !== source.manuscript_id) return { ok: false, reason: 'craft_pass_scope_mismatch' };
  const thread = await loadThread(input.sourceThreadId, input.memberId);
  if (!thread || thread.manuscriptId !== receiver.manuscript_id) return { ok: false, reason: 'craft_pass_scope_mismatch' };
  const boundary = thread.turns.find(t => t.index === input.sourceTurnIndex && t.speaker === 'maia');
  if (!boundary) return { ok: false, reason: 'craft_pass_boundary_missing' };
  const history = thread.turns.filter(t => t.index <= input.sourceTurnIndex);
  // Carry a bounded, contiguous suffix of exact turns. Never summarize or cut
  // an author's sentence to fit. Dropped older turns are disclosed below.
  let turns = history.slice(-12);
  while (turns.reduce((n, t) => n + Array.from(t.body).length, 0) > 36000) {
    const nextAuthor = turns.findIndex((t, index) => index > 0 && t.speaker === 'author');
    if (nextAuthor < 0) return { ok: false, reason: 'craft_pass_context_too_large' };
    turns = turns.slice(nextAuthor);
  }
  if (turns[0]?.speaker === 'maia' && turns.length > 1) turns = turns.slice(1);
  const omittedTurnCount = history.length - turns.length;
  const project = (speaker: 'author' | 'maia') => turns.filter(t => t.speaker === speaker)
    .map(t => ({ turnIndex: t.index, body: t.body }));
  return { ok: true, carry: { sourceThreadId: input.sourceThreadId, sourceTurnIndex: input.sourceTurnIndex, omittedTurnCount,
    memberTurns: project('author'), maiaTurns: project('maia') } };
}

export function craftPassCandidates(carry: ResolvedCraftPassCarry): EditorialCandidateBlock[] {
  return priorWorkConversationCraftCandidates(carry).map(block => ({ ...block,
    text: `[Earlier passage in this Craft pass · thread ${carry.sourceThreadId} · through MAIA turn ${carry.sourceTurnIndex}]\n`
      + `Context coverage: ${carry.memberTurns.length + carry.maiaTurns.length} recent exact turns carried; ${carry.omittedTurnCount} older turns omitted. This is not the full conversation.\n`
      + 'These server-resolved historical turns explain the previous focus. They do not authorize editing that old focus or replacing the new target.\n'
      + block.text,
  }));
}
