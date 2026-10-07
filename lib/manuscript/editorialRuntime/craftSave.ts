import { transaction, query } from '@/lib/db/postgres';
import { appendAuthoredVersionWithExecutor } from '../proposalChain/store';
import { openEditorialSelectionWithExecutor } from './thread';
import { splitStoredSection } from '../sections/sectionProjection';
import { projectEditorialSelection } from './selection';
import type { VerifiedIdentity } from './turn';
import type { CraftSaveRequest, SavedCraftVersionReference } from '@/lib/writersStudio/craftSaveContractR1';

class SaveRefused extends Error {
  constructor(readonly reason: string) { super(reason); }
}

/** One Save records a writer-owned formulation, atomically with its initial
 * chain/thread when necessary. No ask_turn, provider call, authorization or
 * manuscript update. Existing predecessors are carried unchanged. */
export async function saveCraftVersion(identity: VerifiedIdentity, input: CraftSaveRequest): Promise<
  { ok: true; threadId: string; versionId: string } | { ok: false; reason: string }
> {
  if (input.sanctuary !== false) return { ok: false, reason: 'sanctuary_unavailable' };
  if (input.threadId === null && input.supersedes !== null) return { ok: false, reason: 'invalid_predecessor' };
  try {
    return await transaction(async tx => {
      let threadId = input.threadId;
      let chainId: string;
      if (threadId === null) {
        const opened = await openEditorialSelectionWithExecutor(tx, {
          identity, sectionId: input.sectionId, range: input.range, revisionNumber: input.revisionNumber,
        });
        if (!opened.ok) throw new SaveRefused(opened.reason);
        threadId = opened.threadId; chainId = opened.chainId;
      } else {
        // Check current owned source, not caller-supplied original prose. Lock
        // source rows before appending so Save cannot certify a drifting locus.
        const found = await tx.query<{
          chain_id: string; expected_text: string; text: string; heading: string | null; version: string;
        }>(`SELECT c.id AS chain_id, c.expected_text, s.text, ms.heading, d.version
             FROM ask_threads th JOIN proposal_chains c ON c.id = th.proposal_chain_id
             JOIN manuscript_draft_sections s ON s.id = c.target_section_id
             JOIN manuscript_working_drafts d ON d.id = s.draft_id
             LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
            WHERE th.id = $1 AND th.member_id = $2 AND c.member_id = $2
              AND d.member_id = $2 AND s.id = $3
              AND d.manuscript_id = th.manuscript_id AND c.work_id = th.manuscript_id
            FOR SHARE OF s, d`, [threadId, identity.memberId, input.sectionId]);
        const row = found.rows[0];
        if (!row) throw new SaveRefused('thread_not_found');
        if (Number(row.version) !== input.revisionNumber) throw new SaveRefused('selection_stale');
        const split = splitStoredSection(row.text, row.heading);
        if (!split) throw new SaveRefused('section_unprojectable');
        const selection = projectEditorialSelection(split.body, input.range);
        if (!selection.ok || selection.text !== row.expected_text) throw new SaveRefused('selection_stale');
        chainId = row.chain_id;
      }
      const appended = await appendAuthoredVersionWithExecutor(tx, identity.memberId, chainId, {
        author: 'member', supersedes: input.supersedes, replacementText: input.replacementText,
        rationale: 'Writer-shaped Craft version',
      });
      // Throw to roll back BOTH new objects when the root append fails.
      if (appended.outcome !== 'appended') throw new SaveRefused(appended.reason);
      return { ok: true as const, threadId, versionId: appended.version.id };
    });
  } catch (error) {
    if (error instanceof SaveRefused) return { ok: false, reason: error.reason };
    throw error;
  }
}

/** Every saved writer version in this owned Work, offered rather than silently
 * choosing a newest thread. This is an index into existing version history. */
export async function savedCraftVersions(identity: VerifiedIdentity, manuscriptId: string): Promise<SavedCraftVersionReference[]> {
  const result = await query<{
    thread_id: string; version_id: string; section_id: string; expected_text: string; excerpt: string;
  }>(`SELECT th.id AS thread_id, v.id AS version_id, c.target_section_id AS section_id,
             c.expected_text, LEFT(v.formulation, 150) AS excerpt
        FROM ask_threads th JOIN proposal_chains c ON c.id = th.proposal_chain_id
        JOIN proposal_versions v ON v.chain_id = c.id
        JOIN manuscript_draft_sections s ON s.id = c.target_section_id
        JOIN manuscript_working_drafts d ON d.id = s.draft_id
       WHERE th.member_id = $1 AND c.member_id = $1 AND d.member_id = $1
         AND th.manuscript_id = $2 AND d.manuscript_id = $2 AND c.work_id = $2 AND v.author = 'member'
       ORDER BY th.opened_at ASC, v.id ASC`, [identity.memberId, manuscriptId]);
  return result.rows.map(r => ({ threadId: r.thread_id, versionId: r.version_id,
    sectionId: r.section_id, locusText: r.expected_text, excerpt: r.excerpt }));
}
