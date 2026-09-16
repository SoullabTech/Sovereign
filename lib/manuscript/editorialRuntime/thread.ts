/**
 * WS-EDITORIAL-UI-01 · THE EDITORIAL RELATIONSHIP DOOR — open, and read.
 *
 * ⭐⭐ THE MINIMUM THE VISIBLE SURFACE NEEDS, AND NOT ONE OBJECT MORE.
 *
 * ⛔ NO NEW ONTOLOGY. Everything here is derived from the already-ruled
 * `ask_threads ↔ proposal_chain` relationship and the locus that W5 defined.
 * ⛔ No second conversation store. ⛔ No generic chat history.
 *
 * ── ⛔ WHY `openThread()` IS NOT REUSED ───────────────────────────────────
 *
 * `openThread` takes an `AskAnchor` and has no way to name a proposal chain, so
 * it structurally cannot produce an editorial thread — anchor NULL, chain set.
 * ⛔ Widening it with an optional `proposalChainId` would be the worse repair:
 * the ANCHORED path would then be able to pass a chain, and the two subjects
 * would stop being two constructors and become one function with a flag.
 *
 * ⭐ Two thread shapes, two constructors, neither able to express the other's —
 * the same law the Direction store uses for authorship.
 */

import { query, transaction } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import { projectEditorialSelection, type EditorialSelectionRange } from './selection';
import { locusIsAdoptable } from '../proposalChain/legacyLocus';
import { openChainWithExecutor } from '../proposalChain/store';
import { readProposalWork } from '../proposalChain/proposalWork';
import type { VersionAuthor } from '../proposalChain/contract';
import type { VerifiedIdentity } from './turn';

export interface OpenEditorialInput {
  readonly identity: VerifiedIdentity;
  /**
   * ⭐ THE ONLY THING THE MEMBER NAMES: the section they selected.
   * ⛔ The locus — work, draft, base version, expected text — is DERIVED here,
   * never accepted, for the same reason the turn route refuses a `chainId`.
   */
  readonly sectionId: string;
}

export interface OpenEditorialSelectionInput extends OpenEditorialInput {
  /** Unicode code points inside the projected section body. Prose never travels. */
  readonly range: EditorialSelectionRange;
  /** The draft version the browser selected against. Used only to refuse stale coordinates. */
  readonly revisionNumber: number;
}

/**
 * ⭐ EDITORIAL-LOCUS-ALIGNMENT-01 · PHASE B — two refusals where the passage
 * cannot be named.
 *
 * ⛔ `section_unprojectable` — the stored slice is not in the shape this cut
 * knows how to project, so there is no editable passage to point at. ⭐ Refusing
 * to OPEN is the honest answer: a relationship whose locus can never be located
 * would later report a manuscript fact that is not true.
 *
 * ⚠️ `section_has_no_body` IS A JUDGMENT CALL, FLAGGED. A section that is only a
 * heading projects to the empty string, and `occurrences(body, '')` is 0 by the
 * exact-text law's own zero-length guard — so such a chain could never match,
 * ever, and would reproduce exactly the defect this act closes. It is named
 * separately rather than folded into the one above, because *cannot be
 * projected* and *projects to nothing* are two different facts about the
 * writer's page.
 */
export type OpenEditorialRefusal =
  | 'section_not_found'
  | 'section_unprojectable'
  | 'section_has_no_body'
  | 'selection_stale'
  | 'selection_invalid'
  | 'selection_ambiguous'
  | 'chain_refused';

export type OpenEditorialResult =
  | { readonly ok: true; readonly threadId: string; readonly chainId: string }
  | { readonly ok: false; readonly reason: OpenEditorialRefusal; readonly detail?: string };

/**
 * ⭐⭐ ONE DURABLE ACT. The chain and the conversation about it are opened
 * together or not at all — the W5-4 law: *failure may leave neither half
 * pretending the other happened.*
 */
export async function openEditorialRelationship(
  input: OpenEditorialInput,
): Promise<OpenEditorialResult> {
  return openEditorialRelationshipResolved(input, null);
}

/**
 * Rebuild-only passage door. The member names coordinates, never manuscript
 * prose. The server rereads the section under ownership, verifies that the
 * draft has not advanced since selection, derives the exact characters, and
 * opens the same governed chain/thread pair the section door opens.
 */
export async function openEditorialRelationshipAtSelection(
  input: OpenEditorialSelectionInput,
): Promise<OpenEditorialResult> {
  return openEditorialRelationshipResolved(input, {
    range: input.range, revisionNumber: input.revisionNumber,
  });
}

async function openEditorialRelationshipResolved(
  input: OpenEditorialInput,
  selection: { readonly range: EditorialSelectionRange; readonly revisionNumber: number } | null,
): Promise<OpenEditorialResult> {
  const memberId = input.identity.memberId;
  try {
    return await transaction(async (tx) => {
      const s = await tx.query<{
        draft_id: string; manuscript_id: string; revision_count: number; draft_version: string;
        text: string; heading: string | null;
      }>(
        `SELECT s.draft_id, d.manuscript_id, d.revision_count, d.version AS draft_version,
                s.text, ms.heading
           FROM manuscript_draft_sections s
           JOIN manuscript_working_drafts d ON d.id = s.draft_id
           LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
          WHERE s.id = $1 AND d.member_id = $2`,
        [input.sectionId, memberId]);
      if (s.rows.length === 0) throw new OpenRefused('section_not_found');
      const row = s.rows[0]!;

      const split = splitStoredSection(row.text, row.heading);
      if (!split) throw new OpenRefused('section_unprojectable');
      if (split.body.length === 0) throw new OpenRefused('section_has_no_body');

      let expectedText = split.body;
      if (selection) {
        if (!Number.isInteger(selection.revisionNumber)
            || Number(row.draft_version) !== selection.revisionNumber) {
          throw new OpenRefused('selection_stale');
        }
        const projected = projectEditorialSelection(split.body, selection.range);
        if (!projected.ok) {
          const reason = projected.reason === 'selection_ambiguous'
            ? 'selection_ambiguous' : 'selection_invalid';
          throw new OpenRefused(reason);
        }
        expectedText = projected.text;
      }

      const chain = await openChainWithExecutor(tx, memberId, {
        locus: {
          workId: row.manuscript_id,
          draftId: row.draft_id,
          baseVersion: Number(row.revision_count),
          targetSectionId: input.sectionId,
          expectedText,
        },
      });

      const t = await tx.query<{ id: string }>(
        `INSERT INTO ask_threads
           (manuscript_id, member_id, anchor, reading_identity,
            canonical_at_open, initiated_by, proposal_chain_id)
         VALUES ($1, $2, NULL, NULL, $3, 'author', $4)
         RETURNING id`,
        [row.manuscript_id, memberId, `draft:${row.draft_id}@${row.revision_count}`, chain.id]);

      return { ok: true as const, threadId: t.rows[0]!.id, chainId: chain.id };
    });
  } catch (e) {
    if (e instanceof OpenRefused) return { ok: false, reason: e.reason, detail: e.detail };
    throw e;
  }
}

class OpenRefused extends Error {
  constructor(readonly reason: OpenEditorialRefusal, readonly detail?: string) { super(reason); }
}

/* ══════════════════════════════════════════════════════════════════════════
   READ — what the surface renders
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * ⭐ One rendered turn. The adjunct is the RELATIONSHIP the binding records —
 * ⛔ never inferred from what the turn happens to say.
 */
export interface EditorialThreadTurn {
  readonly turnIndex: number;
  readonly speaker: 'author' | 'maia';
  readonly body: string;
  readonly at: string;
  readonly adjunct:
    | null
    | { readonly kind: 'direction'; readonly id: string; readonly instruction: string; readonly refersTo: string | null }
    | { readonly kind: 'version'; readonly id: string; readonly wording: string; readonly supersedes: string | null };
}

/**
 * ⭐ One formulation in the authored succession.
 *
 * ⛔ THIS IS NOT A TURN, and the two are deliberately different structures:
 *
 *     turns      conversation order
 *     versions   authored succession
 *
 * ⛔ They are never merged into one timestamped feed. A version authored in the
 * composer has no turn at all, and a chronological merge would have to invent a
 * position for it among things that were said.
 */
export interface EditorialThreadVersion {
  readonly id: string;
  readonly author: VersionAuthor;
  readonly wording: string;
  readonly supersedes: string | null;
  readonly rationale: string | null;
}

export interface EditorialThreadView {
  readonly threadId: string;
  readonly chainId: string;
  /** ⭐ The writer's own wording at the locus, as the chain froze it. */
  readonly locusText: string;
  /**
   * ⭐ ADOPTION-01 · PHASE B — WHERE THIS EXCHANGE IS ABOUT, named by the
   * server. The id is the chain's own target; the label is the writer's own
   * heading for it.
   *
   * ⛔ `sectionLabel` is `null` when the section carries no heading, and it is
   * NEVER filled with a manufactured name. A confirmation that invents a place
   * name is the browser interpreting manuscript location, which is exactly what
   * the `ChangeLocator` law forbids.
   */
  readonly targetSectionId: string | null;
  readonly sectionLabel: string | null;
  /**
   * ⚠️ EDITORIAL-LEGACY-LOCUS-DISPOSITION-01 — this relationship's frozen locus
   * was written in the pre-alignment stored coordinate space and can never be
   * located in the projected one.
   *
   * ⭐ THE SURFACE NEEDS IT BEFORE SHE CHOOSES. Without it she would pick a
   * version, confirm an adoption, and only then meet a refusal — so the fact
   * that belongs to the relationship is reported with the relationship.
   *
   * ⛔ It withholds adoption and NOTHING ELSE. The exchange stays readable and
   * comparable; the chain is untouched; ⛔ nothing here says her Work moved.
   */
  readonly legacyLocus: boolean;
  readonly turns: readonly EditorialThreadTurn[];
  /**
   * ⭐⭐ THE COMPLETE STRUCTURAL LINEAGE, in succession order.
   *
   * ⚠️ UI-01 exposed versions ONLY through turn bindings, so a formulation
   * authored in a composer — which lawfully has no turn — would have been
   * DURABLE AND INVISIBLE. ⛔ The repair is not chronology: it is the chain's
   * own validated succession, read through `readProposalWork`, which already
   * owns read → validateChain → lineage. ⛔ No second ordering algorithm.
   */
  readonly versions: readonly EditorialThreadVersion[];
  /** ⭐ The head of that succession, or `null` when nothing is authored yet. */
  readonly headVersionId: string | null;
}

export type ReadEditorialRefusal = 'thread_not_found' | 'not_editorial' | 'chain_unreadable';

export type ReadEditorialResult =
  | { readonly ok: true; readonly view: EditorialThreadView }
  | { readonly ok: false; readonly reason: ReadEditorialRefusal };

/**
 * ⭐⭐ THE CONVERSATION IS SERVER STATE. This is the whole reason the surface
 * survives close, reopen and navigation: nothing below is reconstructed from a
 * component, and there is no client transcript to disagree with it.
 */
export async function readEditorialThread(
  identity: VerifiedIdentity, threadId: string,
): Promise<ReadEditorialResult> {
  const memberId = identity.memberId;
  /* ⭐ ADOPTION-01 · PHASE B — the target section and the writer's own name for
     it, DERIVED HERE, in the read that already proves thread ownership.
     ⛔ The browser must never name the place a change belongs; that is the
     `ChangeLocator` law one layer up, and it starts with the label. */
  const t = await query<{
    proposal_chain_id: string | null; expected_text: string | null;
    target_section_id: string | null; heading: string | null;
  }>(
    `SELECT th.proposal_chain_id, c.expected_text, c.target_section_id, ms.heading
       FROM ask_threads th
       LEFT JOIN proposal_chains c ON c.id = th.proposal_chain_id
       LEFT JOIN manuscript_draft_sections ds ON ds.id = c.target_section_id
       LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
      WHERE th.id = $1 AND th.member_id = $2`,
    [threadId, memberId]);
  if (t.rows.length === 0) return { ok: false, reason: 'thread_not_found' };
  const chainId = t.rows[0]!.proposal_chain_id;
  if (chainId === null) return { ok: false, reason: 'not_editorial' };

  /* ⭐ ONE READ, LEFT-JOINED THROUGH THE BINDING. The adjunct arrives because a
     binding names it — ⛔ not because a turn's text resembles one. */
  const rows = await query<{
    turn_index: number; speaker: string; body: string; created_at: Date;
    direction_id: string | null; instruction: string | null; refers_to_version_id: string | null;
    version_id: string | null; formulation: string | null; supersedes: string | null;
  }>(
    `SELECT tu.turn_index, tu.speaker, tu.body, tu.created_at,
            b.direction_id, d.instruction, d.refers_to_version_id,
            b.version_id, v.formulation, v.supersedes
       FROM ask_turns tu
       LEFT JOIN editorial_turn_bindings b
              ON b.thread_id = tu.thread_id AND b.turn_index = tu.turn_index
       LEFT JOIN proposal_chain_directions d ON d.id = b.direction_id
       LEFT JOIN proposal_versions v ON v.id = b.version_id
      WHERE tu.thread_id = $1
      ORDER BY tu.turn_index`,
    [threadId]);

  const turns: EditorialThreadTurn[] = rows.rows.map((r) => ({
    turnIndex: Number(r.turn_index),
    speaker: r.speaker === 'maia' ? 'maia' : 'author',
    body: r.body,
    at: new Date(r.created_at).toISOString(),
    adjunct: r.direction_id
      ? { kind: 'direction', id: r.direction_id, instruction: r.instruction ?? '', refersTo: r.refers_to_version_id }
      : r.version_id
        ? { kind: 'version', id: r.version_id, wording: r.formulation ?? '', supersedes: r.supersedes }
        : null,
  }));

  /* ⭐ THE SUCCESSION, FROM THE READ THAT ALREADY VALIDATES IT. A corrupt chain
     REFUSES here exactly as it refuses there — ⛔ a view that quietly worked
     around broken succession would show the writer a history nobody authored. */
  const work = await readProposalWork(memberId, chainId);
  if (!work.ok) return { ok: false, reason: 'chain_unreadable' };
  const versions: EditorialThreadVersion[] = work.work.versions.map((v) => ({
    id: v.id,
    author: v.author,
    wording: v.replacementText,
    supersedes: v.supersedes,
    rationale: v.rationale ?? null,
  }));

  return {
    ok: true,
    view: {
      threadId, chainId,
      locusText: t.rows[0]!.expected_text ?? '',
      targetSectionId: t.rows[0]!.target_section_id,
      sectionLabel: t.rows[0]!.heading,
      /* ⭐ THE SAME PURE PREDICATE THE ADOPTION SEAM ASKS — one implementation,
         so the panel and the act can never disagree about which relationships
         are adoptable. */
      legacyLocus: !locusIsAdoptable(t.rows[0]!.expected_text ?? '', t.rows[0]!.heading),
      turns,
      versions,
      /* ⛔ Read off the LINEAGE, never off `versions[length-1]` of an unordered
         read — `readProposalWork` returns them in succession order. */
      headVersionId: versions.length ? versions[versions.length - 1]!.id : null,
    },
  };
}
