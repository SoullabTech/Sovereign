/**
 * FOCUS-ASSEMBLER-CONTRACT-01 — reads the Work the writer is actually writing.
 *
 *   ⭐⭐ Focus reads the Work the writer is actually writing, not the Source it
 *       once came from. Addressability is the boundary that makes "here"
 *       durable enough to disclose.
 *
 * ⛔ CALLED ONLY AFTER `may_cross`.
 *
 * ⚠️ THE DEFECT THIS REPLACES. The first implementation joined a `manuscripts`
 * table that does not exist, on a `user_id` column that does not exist, and read
 * `manuscript_sections` — the SOURCE ingest relation. Every query would have
 * failed, been caught, and produced a truthful non-crossing; the witness would
 * have proved only that the failure path works. ⭐ And the naive repair — renaming
 * the table — would have been WORSE than the bug: it would have worked, while
 * disclosing Source text the member never made section-addressable.
 *
 * READ AUTHORITY (founder ruling, 2026-09-09):
 *
 *   member_manuscripts        identity of the Work            member_id must match
 *   manuscript_working_drafts current authored state          member_id must match
 *                             ⭐ section_addressable_at IS NOT NULL
 *   manuscript_draft_sections section-native writable truth   text, position order
 *   manuscript_sections       ⛔ SOURCE / provenance only — NEVER the payload
 *
 * ⭐ The addressability gate is enforced INSIDE the query, not before it. A
 * predicate a caller could forget is not a boundary — and `section_addressable_at`
 * is conferred by a member act, never by import
 * (`__tests__/sectionAddressabilityLifecycle.test.ts` holds ingest to that).
 */

import { query } from '@/lib/db/postgres';
import { discloseUnder, type DisclosureLocus } from '@/lib/disclosure/disclosureAuthority';
import type { FocusAssembler } from './focusCrossing';

/**
 * The Work's addressable draft, gated. Both ownership hops are asserted: the
 * manuscript's and the draft's — they are separate columns and a future schema
 * change could let them disagree.
 */
const ADDRESSABLE_DRAFT = `
  SELECT d.id
    FROM manuscript_working_drafts d
    JOIN member_manuscripts m ON m.id = d.manuscript_id
   WHERE d.manuscript_id = $1
     AND d.member_id = $2
     AND m.member_id = $2
     AND d.section_addressable_at IS NOT NULL`;

/**
 * ⭐⭐ CAPABILITY-BOUND. Every read below lives inside a closure that
 * `discloseUnder` invokes only after provenance, freshness and exact locus match
 * all hold. A caller without a matching capability does not fail a check here —
 * these queries never run, and no `DisclosedContent` can come into existence.
 *
 *   Authority precedes cognition-bound loading. Not: loaded content receives a
 *   trustworthy type afterward.
 */
export const assembleFocus: FocusAssembler = async ({ authority, memberId, workRef, locus }) => {
  // ⛔ Focus offers three shapes. `unit` and `range` are the commissioned
  // reading's scopes and have their own loader; refusing them here keeps one
  // capability vocabulary without letting one consumer read another's material.
  if (locus.scopeKind === 'unit' || locus.scopeKind === 'range') return null;

  const outcome = await discloseUnder(authority, { memberId, workRef, locus }, async () => {
   try {
    const scopeKind = locus.scopeKind;
    const sectionRef = locus.scopeKind === 'whole_work' ? undefined : locus.sectionRef;
    const range = locus.scopeKind === 'passage' ? locus.range : undefined;
    if (scopeKind === 'whole_work') {
      const r = await query<{ text: string }>(
        `SELECT s.text
           FROM manuscript_draft_sections s
          WHERE s.draft_id IN (${ADDRESSABLE_DRAFT})
          ORDER BY s.position ASC`,
        [workRef, memberId],
      );
      /**
       * ⭐⭐ 01B · WHOLE-WORK FIDELITY. `join('')`, never `join('\n\n')`.
       *
       * The database states the system's own contract: once a draft is
       * section-addressable, `content` MUST equal
       * `string_agg(s.text, '' ORDER BY s.position)` — every character belongs to
       * a section, and concatenating them with NO separator reproduces the draft
       * byte-for-byte (`manuscript_working_drafts_round_trip()`).
       *
       *   ⭐ A Work disclosure must preserve the writer's character stream
       *     exactly. Representation may surround the Work; it may not silently
       *     alter the Work while calling the result the Work.
       *
       * ⛔ AND THE REASON THIS IS NOT COSMETIC: a synthesized `\n\n` is
       * INDISTINGUISHABLE from authored text. A writer whose section genuinely
       * ends in a blank line could not be told apart from the assembler's
       * invention — so the Work's own structure becomes unreadable at exactly the
       * boundary where structure matters. Boundaries belong to
       * `computed.writer_structure`, as structure.
       *
       *   ⭐ Structure may describe boundaries. It may not manufacture characters.
       *
       * ⛔ Do not "fix" a run-together reading by trimming, normalising, or
       * reintroducing a separator here.
       */
      return r.rows.length ? r.rows.map(x => x.text).join('') : null;
    }

    // section and passage both resolve ONE draft section, by draft-section id.
    // The `draft_id IN (…)` clause is what ties that id to this member's
    // addressable draft: a section id alone proves nothing about who may read it.
    if (!sectionRef) return null;
    const r = await query<{ text: string }>(
      `SELECT s.text
         FROM manuscript_draft_sections s
        WHERE s.id = $3
          AND s.draft_id IN (${ADDRESSABLE_DRAFT})`,
      [workRef, memberId, sectionRef],
    );
    const text = r.rows[0]?.text;
    if (!text) return null;
    if (scopeKind === 'section') return text;

    if (!range || !Number.isFinite(range.start) || !Number.isFinite(range.end)) return null;
    /**
     * ⭐ UTF-16 CODE UNITS, matching the browser. A textarea's `selectionStart` /
     * `selectionEnd` are code-unit offsets and Held Focus applies them with plain
     * `.slice()`. The previous `[...body].slice()` converted to CODE POINTS first,
     * so a selection after an emoji silently shifted — the server would read
     * different words than the writer framed.
     * ⛔ Do not "improve" this to code points without changing the capture side.
     */
    const passage = text.slice(Math.max(0, range.start), Math.max(0, range.end));
    return passage.length > 0 ? passage : null;
   } catch (err) {
    console.error('[FOCUS] assembly failed', {
      memberIdPrefix: memberId.slice(0, 8),
      error: err instanceof Error ? err.message : 'unknown',
    });
    return null;
   }
  });

  if (outcome.kind === 'disclosed') return outcome.content;
  if (outcome.kind === 'refused') {
    // ⛔ A refusal here is the capability contract holding, not an outage. The
    // reason names WHICH fact failed — provenance, freshness or applicability —
    // and never the material it was asked about.
    console.error('[FOCUS] disclosure refused', {
      memberIdPrefix: memberId.slice(0, 8), reason: outcome.reason,
    });
  }
  return null;
};
