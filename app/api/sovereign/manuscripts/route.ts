// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Soullab Press — Manuscripts (list + ingest).
 *
 * GET  — the member's own manuscripts (id, title, counts). Member-scoped by
 *        credential; no parameter can name another member.
 * POST — two-step ingest, so segmentation is member-confirmed:
 *        { title, text }              → { preview: sections[] }  (nothing saved)
 *        { title, sections: [...] }   → saves manuscript + sections as confirmed
 *
 * DOCTRINE:
 *   - provenance = 'member_uploaded': MEMBER-ASSERTED authorship. Recorded,
 *     never verified or doubted. The upload act is the assertion.
 *   - Segmentation is MECHANICAL ONLY (markdown/plain-text heading detection).
 *     The member confirms or redraws the cuts before save — chapter boundaries
 *     are structure, structure is authorship. The system never segments
 *     semantically and never invents headings.
 *   - Body text is stored verbatim (no trim, no normalization).
 *
 * Authority: docs/specs/MANUSCRIPT_INGEST_SPEC_2026-07-21.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  segment,
  MAX_SECTIONS,
  type SectionInput,
  type HeadingDepth,
  type HeadingSignal,
} from '@/lib/manuscript/ingest/segment';
import { memberRef } from '@/lib/privacy/memberRef';
import { recordSuppliedArrival } from '@/lib/manuscript/source/arrivals';
import { extractRepresentation } from '@/lib/manuscript/source/lifecycle';
import { detectOmission, omissionMarker } from '@/lib/manuscript/source/omission';

const MAX_TEXT_CHARS = 2_000_000; // ~a very long book; hard cap for sanity

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await query<{
      id: string;
      title: string | null;
      created_at: string;
      section_count: string;
      char_count: string;
      keep_count: string;
      last_written_at: string | null;
    }>(
      `SELECT m.id, m.title, m.created_at,
/* PT-3 §IV — the sections of a Work are the sections of its OPERATIVE representation.
   Re-extraction and replacement can leave several representations standing; this scopes
   the read to the one the lifecycle history says is current. COALESCE falls back to
   today's behaviour when no lifecycle act is known, so a Work is never hidden from its
   author by an absent record. */
(SELECT count(*) FROM manuscript_sections s WHERE s.manuscript_id = m.id
                 AND s.representation_id = COALESCE(source_operative_representation(m.id), s.representation_id)) AS section_count,
              (SELECT coalesce(sum(length(s.body)), 0) FROM manuscript_sections s WHERE s.manuscript_id = m.id
                 AND s.representation_id = COALESCE(source_operative_representation(m.id), s.representation_id)) AS char_count,
              (SELECT count(*) FROM manuscript_keeps k WHERE k.manuscript_id = m.id) AS keep_count,
              -- WRITING ACTIVITY — a member act, not a row mutation.
              --
              -- ⚠️ CORRECTED 2026-08-14. The previous version returned the raw
              -- working-draft updated_at and its comment claimed that column
              -- "moves when the member actually writes". Production disproved
              -- that: manuscript 33a9233c carries 374,697 characters with
              -- created_at == updated_at == 08-06 18:02:42 — manuscript, draft
              -- and its only revision all written in the SAME SECOND by the
              -- import path, and never touched since. Studio Home would have
              -- offered to "continue writing" a book nobody had written a word
              -- of in this system.
              --
              -- The discriminator is exact rather than heuristic, and rests on
              -- an enumeration of every writer to this column on this SHA:
              --   draft INSERT (seed from sections) — no updated_at → == created
              --   blank INSERT (empty page)         — no updated_at → == created
              --   draft UPDATE (save / autosave)    — updated_at = now()  MEMBER
              --   revisions UPDATE (restore)        — updated_at = now()  MEMBER
              -- No migration backfills the column. So updated_at can only have
              -- advanced past created_at through a member act, and equality
              -- means the row has only ever been created.
              --
              -- ⛔ If a future migration, normalisation job, or import-completion
              -- step ever writes updated_at, this stops being authority and the
              -- Home needs a dedicated authored-activity signal. Re-run the
              -- enumeration before trusting it again.
              --
              -- NULL = no writing has happened here. Studio Home requires this
              -- AND charCount > 0 before a Work is continuable, and never uses
              -- living_works.updated_at, which a rename moves.
              (SELECT CASE WHEN d.updated_at > d.created_at THEN d.updated_at END
                 FROM manuscript_working_drafts d
                WHERE d.manuscript_id = m.id) AS last_written_at
         FROM member_manuscripts m
        WHERE m.member_id = $1
        ORDER BY m.created_at DESC`,
      [memberId],
    );
    return NextResponse.json({
      manuscripts: result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        sectionCount: Number(r.section_count),
        charCount: Number(r.char_count),
        keepCount: Number(r.keep_count),
        lastWrittenAt: r.last_written_at,
      })),
    });
  } catch (err) {
    console.error('[press/manuscripts] GET error:', err);
    return NextResponse.json({ error: 'Failed to load manuscripts' }, { status: 500 });
  }
}

const HEADING_SIGNALS: ReadonlySet<string> = new Set(['markdown', 'chapter', 'caps', 'member']);

/** WS2-08A — coerce a confirmed section's depth fields; never throw. */
function classifyDepth(
  depth: unknown,
  signal: unknown,
): { depth: HeadingDepth | null; signal: HeadingSignal | null } {
  const d = depth === 1 || depth === 2 || depth === 3 ? depth : null;
  const sig = typeof signal === 'string' && HEADING_SIGNALS.has(signal) ? (signal as HeadingSignal) : null;
  // An explicit depth always names its cause; a caps/member boundary never carries one.
  if (d !== null && (sig === null || sig === 'caps')) return { depth: null, signal: sig };
  if (d === null && (sig === 'markdown' || sig === 'chapter')) return { depth: null, signal: null };
  return { depth: d, signal: sig };
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { title, text, sections, sourceArrivalId, confirmedText } = (body ?? {}) as {
      title?: unknown;
      text?: unknown;
      sections?: unknown;
      sourceArrivalId?: unknown;
      /** Save step only: the exact text the member supplied, for a paste. */
      confirmedText?: unknown;
    };

    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    // Preview step: mechanical segmentation only; nothing is saved.
    if (typeof text === 'string') {
      if (text.trim().length === 0) {
        return NextResponse.json({ error: 'text is empty' }, { status: 400 });
      }
      if (text.length > MAX_TEXT_CHARS) {
        return NextResponse.json({ error: 'manuscript too large (2MB text max)' }, { status: 400 });
      }
      /* WS-01 — the segmentation runs under an omission control.
       *
       * This is where arriving text used to disappear: an orphan heading hit
       * the empty-body skip and was dropped, silently, before the member ever
       * saw the cuts. The control compares what arrived against what the cuts
       * account for, and reports rather than repairs — a segmentation that
       * loses text is a defect to be seen, not smoothed over. It is a log
       * marker and a response field, never a member-facing error, because the
       * member's own path must not become the place a machine defect surfaces. */
      const preview = segment(text);
      const omission = detectOmission(text, preview);
      if (!omission.lossless) {
        console.error(
          `[MAIA/press] SEGMENTATION LOSS { memberRef: ${memberRef(memberId)}, ${omissionMarker(omission)} }`,
        );
      }
      return NextResponse.json({ preview, lossless: omission.lossless });
    }

    // Save step: member-confirmed sections.
    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json(
        { error: 'Provide { title, text } to preview or { title, sections } to save' },
        { status: 400 },
      );
    }
    if (sections.length > MAX_SECTIONS) {
      return NextResponse.json({ error: `too many sections (max ${MAX_SECTIONS})` }, { status: 400 });
    }
    const clean: SectionInput[] = [];
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i] as {
        heading?: unknown;
        body?: unknown;
        headingDepth?: unknown;
        headingSignal?: unknown;
      };
      if (typeof s?.body !== 'string' || s.body.trim().length === 0) continue;
      const heading = typeof s.heading === 'string' && s.heading.trim().length > 0 ? s.heading : null;
      /* WS2-08A — the depth the preview carried survives the member's
       * confirmation. Anything malformed reads as unclassified rather than
       * refusing the save: these fields describe the heading, they are not
       * custody of text, and a member must never lose a book to them. A
       * section with no heading has nothing to classify. */
      const { depth, signal } = heading ? classifyDepth(s.headingDepth, s.headingSignal) : { depth: null, signal: null };
      clean.push({
        position: clean.length,
        heading,
        body: s.body,
        headingDepth: depth,
        headingSignal: signal,
      });
    }
    if (clean.length === 0) {
      return NextResponse.json({ error: 'no non-empty sections' }, { status: 400 });
    }

    /* PT-3 (founder ruling 2026-09-08, §II) — representation and custody are ONE act.
     *
     * This block used to write the sections first (before the claim) and then attempt custody in a
     * try/catch that was allowed to fail, leaving the manuscript labelled `legacy_interpreted_import`
     * by column DEFAULT. The 2026-09-08 design found that ordering: an uncustodied representation
     * was not an edge case but the state a row received when nothing said otherwise.
     *
     * Now: the arrival is established FIRST, and the seam creates the representation together with
     * its custody or creates neither. `legacy_interpreted_import` is left to describe genuine legacy
     * history — it is no longer the fallback meaning of a new import whose custody failed.
     *
     * The arrival is deliberately recorded OUTSIDE the transaction. An arrival is append-only and
     * self-witnessing, and an unclaimed one is a state the schema already documents ("the member
     * uploaded, then abandoned before saving"). So if the save below rolls back, what remains is a
     * legitimate unclaimed arrival rather than a half-made Work.
     */
    let arrivalId: string;
    if (typeof sourceArrivalId === 'string' && sourceArrivalId.length > 0) {
      arrivalId = sourceArrivalId;
    } else {
      /* No artifact, so no artifact is invented. The authoritative source of a pasted or typed
       * import is the exact text the member confirmed at THIS act — which is the text below, and
       * nothing else. */
      const suppliedText =
        typeof confirmedText === 'string' && confirmedText.trim().length > 0
          ? confirmedText
          : clean.map((s) => (s.heading ? `${s.heading}\n\n${s.body}` : s.body)).join('\n\n');
      const arrival = await recordSuppliedArrival({ memberId, sourceText: suppliedText });
      arrivalId = arrival.id;
    }

    let manuscriptId: string;
    try {
      manuscriptId = await transaction(async (tx) => {
        const ms = await tx.query<{ id: string }>(
          `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
          [memberId, title.trim()],
        );
        const id = ms.rows[0].id;
        await extractRepresentation(
          id,
          memberId,
          arrivalId,
          clean.map((s) => ({
            heading: s.heading,
            body: s.body,
            heading_depth: s.headingDepth ?? null,
            heading_signal: s.headingSignal ?? null,
          })),
          tx,
        );
        return id;
      });
    } catch (err) {
      /* Custody is no longer additive: without it there is no representation to save. The refusal
       * is reported rather than swallowed, because a silent fallback is precisely what produced the
       * uncustodied default this repair removes. */
      console.error('[press/manuscripts] source custody refused the import', err);
      return NextResponse.json(
        { error: 'could not establish source custody for this import' },
        { status: 409 },
      );
    }
    const custody = 'source_custodied';

    // Log marker: counts and provenance only, never content.
    console.log(
      `[MAIA/press] manuscript saved { memberRef: ${memberRef(memberId)}, ` +
        `manuscriptId: ${manuscriptId}, sections: ${clean.length}, custody: ${custody} }`,
    );
    return NextResponse.json(
      { id: manuscriptId, sectionCount: clean.length, sourceCustody: custody },
      { status: 201 },
    );
  } catch (err) {
    console.error('[press/manuscripts] POST error:', err);
    return NextResponse.json({ error: 'Failed to save manuscript' }, { status: 500 });
  }
}
