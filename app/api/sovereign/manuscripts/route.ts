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
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  segment,
  MAX_SECTIONS,
  type SectionInput,
  type HeadingDepth,
  type HeadingSignal,
} from '@/lib/manuscript/ingest/segment';
import { memberRef } from '@/lib/privacy/memberRef';
import { claimArrival, recordSuppliedArrival } from '@/lib/manuscript/source/arrivals';
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
      draft_char_count: string | null;
      has_draft_writing: boolean;
      has_writing: boolean;
      has_current_member_contribution: boolean;
    }>(
      `SELECT m.id, m.title, m.created_at,
              (SELECT count(*) FROM manuscript_sections s WHERE s.manuscript_id = m.id) AS section_count,
              (SELECT coalesce(sum(length(s.body)), 0) FROM manuscript_sections s WHERE s.manuscript_id = m.id) AS char_count,
              (SELECT count(*) FROM manuscript_keeps k WHERE k.manuscript_id = m.id) AS keep_count,
              -- ⛔ DRAFT ACTIVITY — a member act, but NOT NECESSARILY WRITING.
              --
              -- ⚠️ CORRECTED 2026-09-08 (STUDIO-WRITING-PRESENCE-01). The
              -- previous version of this comment enumerated the writers to
              -- updated_at and concluded that the column advances only when
              -- the member actually writes. That enumeration was INCOMPLETE and
              -- the conclusion was FALSE:
              --
              --   draft/checkpoint/route.ts:145  UPDATE manuscript_working_drafts
              --      SET version, revision_count, updated_at, last_idempotency_*
              --      ⛔ and NO content.
              --
              -- So a member may import a book, let the draft be seeded verbatim,
              -- press "Keep a version", and advance BOTH updated_at and the
              -- revision trail without authoring a single character. The two
              -- signals are not independent evidence of authorship; they report
              -- the same weaker fact — that a post-creation draft act occurred.
              --
              -- What this column therefore establishes is MEMBER DRAFT ACTIVITY:
              -- saving, checkpointing, restoring, or editing. It does not
              -- establish writing, and nothing may render it as a writing time.
              -- Authorship is established below, by
              -- has_current_member_contribution, against the durable
              -- revision-1 baseline.
              --
              -- Kept as last_written_at on the wire only to avoid unrelated
              -- compatibility work. ⛔ It may not be used as authority for
              -- continuability and may not render as "written <when>".
              (SELECT CASE WHEN d.updated_at > d.created_at THEN d.updated_at END
                 FROM manuscript_working_drafts d
                WHERE d.manuscript_id = m.id) AS last_written_at,

              -- STUDIO-WRITING-PRESENCE-01 · three truths, none standing in for
              -- another. char_count above is SOURCE extent and stays that.
              (SELECT length(d.content) FROM manuscript_working_drafts d
                WHERE d.manuscript_id = m.id) AS draft_char_count,

              -- Substantive draft presence. Whitespace is not writing; this is a
              -- PRESENCE TEST ONLY and alters nothing that is stored or shown.
              (SELECT coalesce(btrim(d.content), '') <> ''
                 FROM manuscript_working_drafts d
                WHERE d.manuscript_id = m.id) IS TRUE AS has_draft_writing,

              -- Writing exists in EITHER lifecycle layer. Deliberately an OR and
              -- not the CASE the extent uses: an emptied draft over a Source that
              -- still holds the book is not "no writing".
              ((SELECT coalesce(btrim(d.content), '') <> ''
                  FROM manuscript_working_drafts d
                 WHERE d.manuscript_id = m.id) IS TRUE
               OR EXISTS (SELECT 1 FROM manuscript_sections s
                           WHERE s.manuscript_id = m.id AND btrim(s.body) <> ''))
                AS has_writing,

              -- ⭐ AUTHORSHIP: does the current draft diverge from the baseline
              -- every creation path writes as revision 1 ('Started writing' for a
              -- blank page, 'Initialized verbatim from source' for a seeded one)?
              -- Nothing prunes revisions, so the baseline is durable.
              --
              -- ⛔ FAILS CLOSED. A draft with no revision 1 — a legacy row
              -- predating both creation paths — yields FALSE. A Work must not
              -- become continuable because its evidence is absent.
              --
              -- The length test is first so a genuine edit short-circuits before
              -- two long texts are compared; equal-length cases (a verbatim seed,
              -- a checkpoint) fall through to the content comparison, which is
              -- what actually decides them.
              (SELECT length(d.content) IS DISTINCT FROM length(r1.content)
                   OR d.content IS DISTINCT FROM r1.content
                 FROM manuscript_working_drafts d
                 JOIN working_draft_revisions r1
                   ON r1.draft_id = d.id AND r1.revision_number = 1
                WHERE d.manuscript_id = m.id) IS TRUE
                AS has_current_member_contribution
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
        draftCharCount: r.draft_char_count === null ? null : Number(r.draft_char_count),
        hasDraftWriting: r.has_draft_writing === true,
        hasWriting: r.has_writing === true,
        hasCurrentMemberContribution: r.has_current_member_contribution === true,
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

    const ms = await query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, title.trim()],
    );
    const manuscriptId = ms.rows[0].id;
    for (const s of clean) {
      await query(
        `INSERT INTO manuscript_sections (manuscript_id, position, heading, body, heading_depth, heading_signal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [manuscriptId, s.position, s.heading, s.body, s.headingDepth ?? null, s.headingSignal ?? null],
      );
    }

    /* WS-01 — bind the manuscript to its arrival.
     *
     * Two paths, and the difference between them is provenance, not plumbing:
     *
     *   a file-backed import already has an arrival, taken into custody at
     *   ingest before the member could edit anything. It is claimed here.
     *
     *   a pasted or typed import has no artifact and must never be given one.
     *   Its authoritative source is the exact text the member supplied at THIS
     *   act — the confirmation — which is why it is recorded now rather than
     *   captured earlier from a textarea the member had not finished with.
     *
     * A manuscript whose arrival cannot be bound stays labelled
     * `legacy_interpreted_import` by the column default. It is not failed and
     * not deleted — the member's words are saved either way — but neither is it
     * allowed to claim a custody it does not have. */
    let custody = 'legacy_interpreted_import';
    try {
      if (typeof sourceArrivalId === 'string' && sourceArrivalId.length > 0) {
        if (await claimArrival(sourceArrivalId, manuscriptId, memberId)) {
          custody = 'source_custodied';
        }
      } else if (typeof confirmedText === 'string' && confirmedText.trim().length > 0) {
        const arrival = await recordSuppliedArrival({ memberId, sourceText: confirmedText });
        if (await claimArrival(arrival.id, manuscriptId, memberId)) {
          custody = 'source_custodied';
        }
      }
    } catch (err) {
      // Custody is additive: failing to record it must not lose the member's
      // manuscript, which is already saved. The label stays honest instead.
      console.error('[press/manuscripts] source custody binding failed', err);
    }

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
