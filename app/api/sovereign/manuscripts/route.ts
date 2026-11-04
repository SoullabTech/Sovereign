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
import { query, transaction, type TransactionClient } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  segment,
  MAX_SECTIONS,
  type SectionInput,
  type HeadingDepth,
  type HeadingSignal,
} from '@/lib/manuscript/ingest/segment';
import { memberRef } from '@/lib/privacy/memberRef';
import {
  claimArrivalWithClient,
  prepareArrivalClaim,
  recordSuppliedArrivalWithClient,
  type ArrivalClaimContext,
} from '@/lib/manuscript/source/arrivals';
import { detectOmission, omissionMarker } from '@/lib/manuscript/source/omission';
import { cabinStore, cabinMemberFromRequest, setCabinSessionCookie } from '@/lib/cabin/request';

const MAX_TEXT_CHARS = 2_000_000; // ~a very long book; hard cap for sanity

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const { member, issuedToken } = cabinMemberFromRequest(store, request);
      const manuscripts = store.listManuscripts(member.id).map((manuscript) => {
        const sections = store.listManuscriptSections(member.id, manuscript.id);
        return {
          id: manuscript.id,
          title: manuscript.title,
          createdAt: manuscript.createdAt,
          sectionCount: sections.length,
          charCount: sections.reduce((sum, section) => sum + section.body.length, 0),
          keepCount: 0,
          lastMemberDraftActivityAt: null,
          draftCharCount: null,
          hasDraftWriting: false,
          hasWriting: sections.some((section) => /\S/.test(section.body)),
          hasCurrentMemberContribution: sections.some((section) => /\S/.test(section.body)),
        };
      });
      const response = NextResponse.json({ manuscripts });
      setCabinSessionCookie(response, issuedToken);
      return response;
    } finally {
      store.close();
    }
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
              --
              -- NOT btrim(). PostgreSQL's one-argument btrim strips ORDINARY
              -- SPACES only, so a draft of tabs or newlines would have passed as
              -- writing while the design said it must not. The POSIX class is the
              -- predicate the design actually describes: does any non-whitespace
              -- character exist at all?
              (SELECT d.content ~ '[^[:space:]]'
                 FROM manuscript_working_drafts d
                WHERE d.manuscript_id = m.id) IS TRUE AS has_draft_writing,

              -- Writing exists in EITHER lifecycle layer. Deliberately an OR and
              -- not the CASE the extent uses: an emptied draft over a Source that
              -- still holds the book is not "no writing".
              ((SELECT d.content ~ '[^[:space:]]'
                  FROM manuscript_working_drafts d
                 WHERE d.manuscript_id = m.id) IS TRUE
               OR EXISTS (SELECT 1 FROM manuscript_sections s
                           WHERE s.manuscript_id = m.id AND s.body ~ '[^[:space:]]'))
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
        lastMemberDraftActivityAt: r.last_written_at,
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

/**
 * D4 - the original is claimed INSIDE the transaction that creates the Work. If it cannot be bound, this is thrown, the whole
 * transaction rolls back, and nothing is saved: no Work, no sections, no declaration, and (for a pasted import) no orphan supplied
 * arrival. The member keeps their writing on screen and can try again; a file-backed upload stays an unclaimed upload they can see
 * and remove. The message is a fixed code, never content, because the transaction helper logs it.
 */
/**
 * WHY a file-backed claim came back false. A retry of the same save can only ever succeed for a transient cause, so the three are
 * told apart and the member is never offered a retry that cannot work:
 *   - 'transient'            the claim threw, or no cause was established: a retry may succeed.
 *   - 'already_attached'     this member's own Work already holds that original (a first save landed and its response was lost).
 *   - 'original_unavailable' no unclaimed original of theirs is held under that reference (removed, never existed, or its bytes no
 *                            longer verify). The lookup is member-bound, so it cannot reveal anyone else's data.
 */
type UnboundCause = 'transient' | 'already_attached' | 'original_unavailable';

class CustodyNotBound extends Error {
  constructor(
    readonly reason: 'claim_not_bound' | 'claim_threw',
    readonly errorName?: string,
    readonly unboundCause: UnboundCause = 'transient',
  ) {
    super(`source_custody_not_bound:${reason}`);
    this.name = 'CustodyNotBound';
  }
}

const CUSTODY_REFUSAL = {
  error: 'Your writing was not saved, because it could not be stored together with its source. Nothing was changed. You can try again.',
  code: 'source_custody_not_bound',
  retryable: true,
} as const;

const CUSTODY_ALREADY_ATTACHED = {
  error: 'That original is already attached to a Work in your library, so a second Work was not created. Nothing new was saved.',
  code: 'source_already_attached',
  retryable: false,
} as const;

const CUSTODY_ORIGINAL_UNAVAILABLE = {
  error: 'The original you uploaded is no longer available, so this Work was not saved. Nothing was changed. Choose the file again to continue.',
  code: 'source_original_unavailable',
  retryable: false,
} as const;

function custodyRefusalFor(cause: UnboundCause) {
  if (cause === 'already_attached') return CUSTODY_ALREADY_ATTACHED;
  if (cause === 'original_unavailable') return CUSTODY_ORIGINAL_UNAVAILABLE;
  return CUSTODY_REFUSAL;
}

/** Why `claimArrivalWithClient` returned false for a file arrival. Member-bound read inside the transaction about to roll back. */
async function classifyUnboundFileArrival(
  client: TransactionClient,
  arrivalId: string,
  memberId: string,
): Promise<UnboundCause> {
  const row = await client.query<{ manuscript_id: string | null }>(
    'SELECT manuscript_id FROM manuscript_source_arrivals WHERE id = $1 AND member_id = $2',
    [arrivalId, memberId],
  );
  if (row.rows.length === 1 && row.rows[0]!.manuscript_id !== null) return 'already_attached';
  return 'original_unavailable';
}

/** Content-free trace of a refused import: a pseudonymous reference, a reason code and an error NAME. Never a message. */
function noteUnboundCustody(
  memberId: string,
  reason: 'claim_not_bound' | 'claim_threw',
  errorName?: string,
  cause: UnboundCause = 'transient',
): void {
  console.warn('[press/manuscripts] import refused: source custody not bound', {
    memberRef: memberRef(memberId),
    reason,
    cause,
    ...(errorName ? { errorName } : {}),
  });
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const { member, issuedToken } = cabinMemberFromRequest(store, request);

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }

      const input = (body ?? {}) as {
        title?: unknown;
        text?: unknown;
        sections?: unknown;
        createWork?: unknown;
      };

      if (typeof input.title !== 'string' || input.title.trim().length === 0) {
        return NextResponse.json({ error: 'title is required' }, { status: 400 });
      }

      if (typeof input.text === 'string') {
        if (input.text.trim().length === 0) {
          return NextResponse.json({ error: 'text is empty' }, { status: 400 });
        }
        if (input.text.length > MAX_TEXT_CHARS) {
          return NextResponse.json({ error: 'manuscript too large (2MB text max)' }, { status: 400 });
        }
        return NextResponse.json({ preview: segment(input.text), lossless: true });
      }

      if (!Array.isArray(input.sections) || input.sections.length === 0) {
        return NextResponse.json(
          { error: 'Provide { title, text } to preview or { title, sections } to save' },
          { status: 400 },
        );
      }
      if (input.sections.length > MAX_SECTIONS) {
        return NextResponse.json({ error: 'too many sections' }, { status: 400 });
      }

      const sections = input.sections
        .map((section, index) => {
          const item = section as { heading?: unknown; body?: unknown };
          if (typeof item.body !== 'string' || item.body.trim().length === 0) return null;
          return {
            position: index,
            heading: typeof item.heading === 'string' && item.heading.trim() ? item.heading : null,
            body: item.body,
          };
        })
        .filter((section): section is { position: number; heading: string | null; body: string } => section !== null);

      if (sections.length === 0) {
        return NextResponse.json({ error: 'no non-empty sections' }, { status: 400 });
      }

      // Cabin has its own SQLite custody path. Until that path can commit
      // the declaration atomically, refuse the new request before any import
      // write rather than returning an unlinked manuscript as a new Work.
      if (input.createWork === true) {
        return NextResponse.json(
          { error: 'Creating a Work during Cabin import is not available. No manuscript was saved.' },
          { status: 501 },
        );
      }

      const manuscript = store.createManuscript(member.id, {
        title: input.title.trim(),
        provenance: 'member_uploaded',
      });
      store.addManuscriptSections(member.id, manuscript.id, sections);

      const response = NextResponse.json(
        {
          id: manuscript.id,
          sectionCount: sections.length,
          sourceCustody: 'local_cabin',
        },
        { status: 201 },
      );
      setCabinSessionCookie(response, issuedToken);
      return response;
    } finally {
      store.close();
    }
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
    const { title, text, sections, sourceArrivalId, confirmedText, createWork } = (body ?? {}) as {
      title?: unknown;
      text?: unknown;
      sections?: unknown;
      sourceArrivalId?: unknown;
      /** Save step only: the exact text the member supplied, for a paste. */
      confirmedText?: unknown;
      /** An explicit member declaration from the Writer import confirmation. */
      createWork?: unknown;
    };

    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (createWork !== undefined && typeof createWork !== 'boolean') {
      return NextResponse.json({ error: 'createWork must be true or false' }, { status: 400 });
    }
    if (createWork === true && title.trim().length > 300) {
      return NextResponse.json({ error: 'Work title is longer than 300 characters' }, { status: 400 });
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

    /* WS-01 / D4 - what is to be bound to the new manuscript, decided BEFORE anything is written.
     *
     * Two paths, and the difference between them is provenance, not plumbing:
     *
     *   a file-backed import already has an arrival, taken into custody at ingest before the member could edit
     *   anything. It is claimed in the transaction below.
     *
     *   a pasted or typed import has no artifact and must never be given one. Its authoritative source is the exact
     *   text the member supplied at THIS act - the confirmation - which is why it is recorded now, in the same
     *   transaction, rather than captured earlier from a textarea the member had not finished with.
     *
     * Neither path may leave a manuscript claiming a custody it does not have, and neither may lose the member's
     * words. Both are met by making the binding part of the same all-or-nothing act as the save. */
    const fileArrivalId = typeof sourceArrivalId === 'string' && sourceArrivalId.length > 0 ? sourceArrivalId : null;
    // A file arrival wins when both are present: the transaction below tries the file path first and only otherwise records the paste.
    const pastedSourceText = typeof confirmedText === 'string' && confirmedText.trim().length > 0 ? confirmedText : null;
    let claimContext: ArrivalClaimContext = null;
    if (fileArrivalId) {
      try {
        claimContext = await prepareArrivalClaim(fileArrivalId, memberId);
      } catch (err) {
        noteUnboundCustody(memberId, 'claim_threw', err instanceof Error ? err.name : 'unknown');
        return NextResponse.json(CUSTODY_REFUSAL, { status: 409 });
      }
    }

    // The member's explicit import confirmation may also declare a new Work.
    // Keep that declaration, its exact manuscript AND the binding of its original
    // together: a failed section, Work, expression or claim write must never
    // leave a partial import.
    let created: { manuscriptId: string; workId: string | null; custody: string };
    try {
      created = await transaction(async (client) => {
        const ms = await client.query<{ id: string }>(
          `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
          [memberId, title.trim()],
        );
        if (ms.rows.length !== 1) throw new Error('import_manuscript_unconfirmed');
        const manuscriptId = ms.rows[0]!.id;
        for (const s of clean) {
          const inserted = await client.query<{ id: string }>(
            `INSERT INTO manuscript_sections (manuscript_id, position, heading, body, heading_depth, heading_signal)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [manuscriptId, s.position, s.heading, s.body, s.headingDepth ?? null, s.headingSignal ?? null],
          );
          if (inserted.rows.length !== 1) throw new Error('import_section_unconfirmed');
        }

        let workId: string | null = null;
        if (createWork === true) {
          const work = await client.query<{ id: string }>(
            `INSERT INTO living_works (member_id, title)
             VALUES ($1, $2) RETURNING id`,
            [memberId, title.trim()],
          );
          if (work.rows.length !== 1) throw new Error('import_work_unconfirmed');
          workId = work.rows[0]!.id;
          const declaration = await client.query<{ id: string }>(
            `INSERT INTO living_work_expressions
               (living_work_id, expression_type, expression_id, declared_by)
             VALUES ($1, 'manuscript', $2, $3)
             RETURNING id`,
            [workId, manuscriptId, memberId],
          );
          if (declaration.rows.length !== 1) throw new Error('import_work_declaration_unconfirmed');
        }
        let custody = 'legacy_interpreted_import';
        if (fileArrivalId || pastedSourceText) {
          let bound = false;
          let cause: UnboundCause = 'transient';
          try {
            if (fileArrivalId) {
              bound = await claimArrivalWithClient(client, fileArrivalId, manuscriptId, memberId, claimContext);
              if (!bound) cause = await classifyUnboundFileArrival(client, fileArrivalId, memberId);
            } else {
              const arrival = await recordSuppliedArrivalWithClient(client, { memberId, sourceText: pastedSourceText! });
              bound = await claimArrivalWithClient(client, arrival.id, manuscriptId, memberId, null);
            }
          } catch (err) {
            // The held bytes are gone from the vault: no retry of this save can bring them back, so it is not "transient".
            const gone = fileArrivalId !== null && (err as NodeJS.ErrnoException | null)?.code === 'ENOENT';
            throw new CustodyNotBound('claim_threw', err instanceof Error ? err.name : 'unknown', gone ? 'original_unavailable' : 'transient');
          }
          if (!bound) throw new CustodyNotBound('claim_not_bound', undefined, cause);
          custody = 'source_custodied';
        }
        return { manuscriptId, workId, custody };
      });
    } catch (err) {
      if (err instanceof CustodyNotBound) {
        noteUnboundCustody(memberId, err.reason, err.errorName, err.unboundCause);
        return NextResponse.json(custodyRefusalFor(err.unboundCause), { status: 409 });
      }
      throw err;
    }
    const { manuscriptId, workId, custody } = created;

    // Log marker: counts and provenance only, never content.
    console.log(
      `[MAIA/press] manuscript saved { memberRef: ${memberRef(memberId)}, ` +
        `manuscriptId: ${manuscriptId}, sections: ${clean.length}, custody: ${custody} }`,
    );
    return NextResponse.json(
      { id: manuscriptId, ...(workId ? { workId } : {}), sectionCount: clean.length, sourceCustody: custody },
      { status: 201 },
    );
  } catch (err) {
    console.error('[press/manuscripts] POST error:', err);
    return NextResponse.json({ error: 'Failed to save manuscript' }, { status: 500 });
  }
}
