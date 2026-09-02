/**
 * Soullab Press — Working Draft (Author Environment R1 foundation)
 *
 * "This is where your manuscript lives."
 *
 * - Source stays immutable: POST initializes the draft VERBATIM from the
 *   manuscript's source sections; the sections themselves are never touched.
 *   base_source_hash records exactly which words the draft began from.
 * - Only the author writes the draft: every handler is member-scoped, with the
 *   same no-existence-leak 404 gate as the render route.
 * - Autosave (PUT) updates the draft in place; a checkpoint (PUT with
 *   checkpoint: true) additionally preserves an append-only revision.
 *
 * SECTION-ADDRESSABLE DRAFT LIVENESS (WS2-07 prerequisite, Option 3).
 *
 * A draft is section-addressable once `section_addressable_at` is set. From
 * that moment the SECTIONS are the writable truth and `content` is their
 * flattening — enforced at COMMIT by two deferred constraint triggers
 * (migration 20260830000001). Before this unit, no handler here wrote
 * `manuscript_draft_sections` at all, so a converted draft was not merely
 * stale on save: its next content-only write ABORTED at commit. It was
 * unwritable. That is the liveness defect this closes.
 *
 * Every rule about what may be written is decided in `lib/manuscript/
 * draftSections.ts` — a pure module with no database and no request — so a
 * defect in the contract is a unit-test failure rather than a 500 a member
 * discovers. This file does transport, authority and persistence; it does not
 * re-decide the contract, and it MUST NOT infer a boundary from text.
 *
 * ONE COMPOSITION AUTHORITY. The draft's starting text used to be composed by
 * a private `composeDraftText` here. It is gone: composition now happens once,
 * in `composeDraftSlices`, which returns the text AND the exact slice each
 * source section contributes. Two functions that merely agree today are two
 * chances to disagree tomorrow, and the disagreement would land as a
 * mis-assigned durable section identity.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  computeSourceHash,
  type MemberBookSection,
} from '@/lib/manuscript/render/renderMemberBook';
import {
  composeDraftSlices,
  flattenSections,
  partitionFromSections,
  planConversion,
  validateSectionSave,
  type DraftSectionState,
  type SourceSection,
} from '@/lib/manuscript/draftSections';
import {
  conflictBody,
  payloadHash,
  normalizeVersion,
  precheck,
  readGuard,
  type DraftGuardRow,
} from '@/lib/manuscript/draftConcurrency';

export const dynamic = 'force-dynamic';

/** A source section as stored, with the identity conversion records as provenance. */
type SourceRow = SourceSection & MemberBookSection;

/**
 * A finished HTTP answer raised from inside a transaction.
 *
 * ⛔ WHY THIS EXISTS AS A THROW. `transaction()` COMMITs when its callback
 * RETURNS and ROLLBACKs only when it THROWS. Returning a refusal from inside
 * one therefore commits whatever partial work preceded it while telling the
 * caller the request failed — the exact defect found in the first structure
 * adoption route, where a half-adopted outline was committed alongside a
 * failure response and locked the member out permanently. Every non-success
 * exit inside a transaction here is a throw, without exception.
 */
class DraftHttp extends Error {
  constructor(readonly status: number, readonly body: unknown) {
    super(`draft ${status}`);
  }
}

function answer(e: unknown): NextResponse | null {
  return e instanceof DraftHttp ? NextResponse.json(e.body as object, { status: e.status }) : null;
}

/** The draft's sections, in document order. */
async function loadSections(
  run: (sql: string, params?: unknown[]) => Promise<{ rows: DraftSectionState[] }>,
  draftId: string,
): Promise<DraftSectionState[]> {
  const r = await run(
    `SELECT id, text FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position ASC`,
    [draftId],
  );
  return r.rows;
}

/* ── POST — create, or convert an existing draft ──────────────────────────── */

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  /* A body is optional: creation sends none. `convert: true` is the EXPLICIT
     command that partitions an existing draft. It is a separate command on
     purpose — a conversion assigns durable identities that authored structure
     and developmental evidence both depend on, and D9 forbids smuggling that
     into an ordinary save. */
  let convert = false;
  try {
    const raw = await request.text();
    if (raw.trim().length > 0) {
      const parsed = JSON.parse(raw) as { convert?: unknown };
      convert = parsed?.convert === true;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const ms = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (ms.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const existing = await query<{
      id: string;
      content: string;
      version: string;
      section_addressable_at: string | null;
    }>(
      `SELECT id, content, version, section_addressable_at
         FROM manuscript_working_drafts WHERE manuscript_id = $1`,
      [id]
    );

    const sections = await query<SourceRow>(
      `SELECT id, heading, body FROM manuscript_sections
        WHERE manuscript_id = $1 ORDER BY position ASC`,
      [id]
    );

    if (existing.rows.length > 0) {
      if (!convert) {
        return NextResponse.json({ error: 'Draft already exists' }, { status: 409 });
      }
      return await convertExistingDraft(existing.rows[0], sections.rows);
    }

    if (sections.rows.length === 0) {
      return NextResponse.json({ error: 'Manuscript has no sections' }, { status: 409 });
    }

    /* D6 — a new draft is born section-addressable. Working draft, its
       partition and its immutable first revision are ONE transaction: a draft
       that exists without its sections is a draft the triggers will refuse to
       write, so the two must never be separately observable. */
    const { content, slices } = composeDraftSlices(sections.rows);
    const baseSourceHash = computeSourceHash(sections.rows);

    const created = await transaction(async (tx) => {
      const draft = await tx.query(
        `INSERT INTO manuscript_working_drafts
           (manuscript_id, member_id, content, base_source_hash, revision_count,
            section_addressable_at, section_conversion_version)
         VALUES ($1, $2, $3, $4, 1, now(), 1)
         RETURNING id`,
        [id, memberId, content, baseSourceHash]
      );
      const draftId = draft.rows[0].id as string;

      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text, source_section_id)
         SELECT $1, ord - 1, t.text, t.source_id
           FROM unnest($2::text[], $3::uuid[]) WITH ORDINALITY AS t(text, source_id, ord)`,
        [draftId, slices.map((s) => s.text), slices.map((s) => s.sourceSectionId)]
      );

      /* Read back BEFORE the revision is written: the ids are server-minted
         here, and the revision's partition is expressed in them. Writing the
         revision first would leave the draft's very first state unrecoverable
         at section granularity — the one revision every later comparison is
         measured from. */
      const written = await tx.query(
        `SELECT id, text FROM manuscript_draft_sections
          WHERE draft_id = $1 ORDER BY position ASC`,
        [draftId]
      );
      const sectionRows = written.rows as DraftSectionState[];

      await tx.query(
        `INSERT INTO working_draft_revisions
           (draft_id, revision_number, content, saved_by, note, section_partition)
         VALUES ($1, 1, $2, $3, 'Initialized verbatim from source', $4::jsonb)`,
        [draftId, content, memberId, JSON.stringify(partitionFromSections(sectionRows))]
      );

      return { draftId, sections: sectionRows };
    });

    return NextResponse.json(
      {
        id: created.draftId,
        manuscriptId: id,
        baseSourceHash,
        revisionCount: 1,
        revisionId: 1,
        sectionAddressable: true,
        sections: created.sections,
        content,
      },
      { status: 201 }
    );
  } catch (error) {
    const typed = answer(error);
    if (typed) return typed;
    console.error('[manuscripts/draft] create failed', error);
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
  }
}

/**
 * Requirement A — convert an EXISTING draft, and only where the boundaries are
 * mechanically exact.
 *
 * ⛔ LOSSLESS IS BYTE EQUALITY, NOT RESEMBLANCE. `planConversion` admits the
 * conversion only when the draft's current content is byte-identical to the
 * flattening of the source-derived partition. Heading matching, similarity and
 * diff attribution are a different claim and are refused, typed, with zero
 * writes. A wrong boundary here is invisible at write time and silently
 * transfers a durable identity.
 */
async function convertExistingDraft(
  draft: { id: string; content: string; version: string; section_addressable_at: string | null },
  sourceRows: SourceRow[],
): Promise<NextResponse> {
  if (draft.section_addressable_at !== null) {
    return NextResponse.json(
      { error: 'Draft is already section-addressable', sectionAddressable: true },
      { status: 409 }
    );
  }

  const plan = planConversion(draft.content, sourceRows);
  if (plan.status === 'refused') {
    return NextResponse.json({ refusal: plan.refusal, detail: plan.detail }, { status: 409 });
  }

  const baseVersion = normalizeVersion(draft.version);

  const result = await transaction(async (tx) => {
    /* The flag write comes FIRST so this transaction holds the draft row's
       lock before any section exists. A content save that committed between
       our read and here fails the version predicate and we abort — otherwise
       the partition would describe text the draft no longer holds, and the
       deferred trigger would surface it to the member as a 500. */
    const claimed = await tx.query(
      `UPDATE manuscript_working_drafts
          SET section_addressable_at = now(), section_conversion_version = version
        WHERE id = $1 AND version = $2 AND section_addressable_at IS NULL
        RETURNING version`,
      [draft.id, baseVersion]
    );
    if (claimed.rows.length === 0) {
      throw new DraftHttp(409, conflictBody('stale_base', baseVersion));
    }

    await tx.query(
      `INSERT INTO manuscript_draft_sections (draft_id, position, text, source_section_id)
       SELECT $1, ord - 1, t.text, t.source_id
         FROM unnest($2::text[], $3::uuid[]) WITH ORDINALITY AS t(text, source_id, ord)`,
      [draft.id, plan.slices.map((s) => s.text), plan.slices.map((s) => s.sourceSectionId)]
    );

    return await loadSections(tx.query, draft.id);
  });

  /* ⛔ NO BACKFILL. The revisions written before this conversion were partitioned
     by nothing — their boundaries were never observed, and NULL says so. Stamping
     today's partition onto them would be an inference wearing a record's clothes,
     and restore would then rebuild sections the member never had. */

  return NextResponse.json({
    id: draft.id,
    sectionAddressable: true,
    sections: result,
    content: draft.content,
    revisionId: baseVersion,
    converted: true,
  });
}

/* ── GET — the D9 load contract ───────────────────────────────────────────── */

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const draft = await query<{
      id: string;
      content: string;
      base_source_hash: string;
      revision_count: number;
      version: number;
      section_addressable_at: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, content, base_source_hash, revision_count, version,
              section_addressable_at, created_at, updated_at
       FROM manuscript_working_drafts
       WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (draft.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const row = draft.rows[0];

    /* D9 — the client cannot hold section-native state unless the server first
       gives it the identities. It never invents or re-derives them, so a
       converted draft ALWAYS ships its sections; `content` travels alongside
       as a derived display projection, not as something the client may send
       back. `sectionAddressable` discriminates the two representations
       explicitly rather than leaving the client to sniff for a key. */
    const sectionAddressable = row.section_addressable_at !== null;
    const sections = sectionAddressable ? await loadSections(query, row.id) : null;

    return NextResponse.json({
      id: row.id,
      manuscriptId: id,
      sectionAddressable,
      ...(sections ? { sections } : {}),
      content: row.content,
      baseSourceHash: row.base_source_hash,
      revisionCount: row.revision_count,
      revisionId: Number(row.version),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('[manuscripts/draft] get failed', error);
    return NextResponse.json({ error: 'Failed to load draft' }, { status: 500 });
  }
}

/* ── PUT — the ordinary save ──────────────────────────────────────────────── */

export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { content, checkpoint, note } = body as {
    content?: unknown;
    checkpoint?: unknown;
    note?: unknown;
  };
  if (note !== undefined && note !== null && typeof note !== 'string') {
    return NextResponse.json({ error: 'note must be a string' }, { status: 400 });
  }

  const guard = readGuard(body as Record<string, unknown>);
  if ('error' in guard) {
    return NextResponse.json({ error: guard.error }, { status: 400 });
  }
  const trimmedNote = typeof note === 'string' && note.trim().length > 0 ? note.trim() : null;

  try {
    const current = await query<DraftGuardRow & { id: string; section_addressable_at: string | null }>(
      `SELECT id, version, section_addressable_at, last_idempotency_key, last_idempotency_op,
              last_idempotency_payload_hash, last_idempotency_response
         FROM manuscript_working_drafts
        WHERE manuscript_id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (current.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (current.rows[0].section_addressable_at !== null) {
      return await saveSectionAddressable({
        manuscriptId: id,
        memberId,
        draftId: current.rows[0].id,
        body: body as Record<string, unknown>,
        guard,
        checkpoint: checkpoint === true,
        note: trimmedNote,
      });
    }

    /* An unconverted draft keeps its existing contract, unchanged — but a
       `sections` payload against it is a disagreement about WHICH draft this
       is, not a save. Answering with the draft's actual representation lets
       the client reload rather than guess; writing nothing is the point. */
    if (Object.prototype.hasOwnProperty.call(body as object, 'sections')) {
      return NextResponse.json(
        {
          error: 'this draft is not section-addressable; send content',
          sectionAddressable: false,
        },
        { status: 409 }
      );
    }
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'content must be a string' }, { status: 400 });
    }

    const hash = payloadHash('save', { content, checkpoint: checkpoint === true, note: trimmedNote });
    const draftId = current.rows[0].id;

    /* `version` is bigint, and node-postgres returns bigint as a STRING to
       avoid silent precision loss past 2^53. precheck compares it with !==
       against a number, so an unconverted "1" never equals 1 and EVERY write
       was rejected as stale_base. Coerced at the driver boundary, which is the
       only place the string form is real. */
    const guardRow = { ...current.rows[0], version: normalizeVersion(current.rows[0].version) };
    const decision = precheck(guardRow, 'save', guard.idempotencyKey, hash, guard.baseRevisionId);
    if (decision.kind === 'replay') {
      return NextResponse.json(decision.response as object);
    }
    if (decision.kind === 'conflict') {
      return NextResponse.json(conflictBody(decision.reason, decision.currentRevisionId), { status: 409 });
    }

    // Compare-and-advance, recording the idempotency result in the SAME
    // statement. The version predicate is what makes this safe: a client that
    // raced us between the SELECT above and here matches zero rows. Recording
    // the key separately would leave a window in which a successful save
    // answers stale_base to its own retry. SET expressions read the OLD column
    // values, so version + 1 is exactly the version being written, and now()
    // is one timestamp for the whole statement.
    const updated = await query<{
      revision_count: number;
      version: number;
      last_idempotency_response: unknown;
    }>(
      `UPDATE manuscript_working_drafts
          SET content = $3,
              version = version + 1,
              revision_count = revision_count + CASE WHEN $5::boolean THEN 1 ELSE 0 END,
              updated_at = now(),
              last_idempotency_key = $6,
              last_idempotency_op = 'save',
              last_idempotency_payload_hash = $7,
              last_idempotency_response = jsonb_build_object(
                'revisionCount', revision_count + CASE WHEN $5::boolean THEN 1 ELSE 0 END,
                'revisionId', version + 1,
                'updatedAt', now(),
                'checkpointed', $5::boolean
              )
        WHERE manuscript_id = $1 AND member_id = $2 AND version = $4
      RETURNING revision_count, version, last_idempotency_response`,
      [id, memberId, content, guard.baseRevisionId, checkpoint === true, guard.idempotencyKey, hash]
    );
    if (updated.rows.length === 0) {
      const now = await query<{ version: number }>(
        `SELECT version FROM manuscript_working_drafts WHERE manuscript_id = $1 AND member_id = $2`,
        [id, memberId]
      );
      if (now.rows.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(conflictBody('stale_base', normalizeVersion(now.rows[0].version)), { status: 409 });
    }
    const row = updated.rows[0];

    if (checkpoint === true) {
      await query(
        `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [draftId, row.revision_count, content, memberId, trimmedNote]
      );
    }

    // Reply with the stored record itself, so a first response and its replay
    // are byte-identical rather than merely equivalent.
    return NextResponse.json(row.last_idempotency_response as object);
  } catch (error) {
    const typed = answer(error);
    if (typed) return typed;
    console.error('[manuscripts/draft] save failed', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

/**
 * Requirement B — the section-native save.
 *
 * ONE TRANSACTION, because the round-trip invariant is checked at COMMIT: the
 * section rows and the derived content must land together or not at all.
 *
 * ⛔ THE TRIGGER IS THE BACKSTOP, NOT THE VALIDATOR. Every refusal is decided
 * by `validateSectionSave` before a single write, and content is DERIVED from
 * the accepted sections by `flattenSections`, so the invariant holds by
 * construction. If the trigger ever fires here, the contract is wrong — it is
 * not a way for the member to be told their save was malformed.
 */
async function saveSectionAddressable(args: {
  manuscriptId: string;
  memberId: string;
  draftId: string;
  body: Record<string, unknown>;
  guard: { idempotencyKey: string; baseRevisionId: number };
  checkpoint: boolean;
  note: string | null;
}): Promise<NextResponse> {
  const { manuscriptId, memberId, draftId, body, guard, checkpoint, note } = args;

  const result = await transaction(async (tx) => {
    /* Read under the row lock. The section identities the payload is judged
       against must be the ones the write will land on, not the ones that were
       true a moment ago. */
    const locked = await tx.query(
      `SELECT version, last_idempotency_key, last_idempotency_op,
              last_idempotency_payload_hash, last_idempotency_response
         FROM manuscript_working_drafts
        WHERE id = $1 AND member_id = $2
        FOR UPDATE`,
      [draftId, memberId]
    );
    if (locked.rows.length === 0) {
      throw new DraftHttp(404, { error: 'Not found' });
    }

    const currentSections = await loadSections(tx.query, draftId);
    const check = validateSectionSave(body, currentSections.map((s) => s.id));
    if (!check.ok) {
      /* Typed, zero writes, and never a database exception wearing a 500.
         The transaction is rolled back by the throw; nothing has been written
         before this point in any case. */
      throw new DraftHttp(409, { refusal: check.refusal, ...(check.detail ? { detail: check.detail } : {}) });
    }
    const sections = check.value;

    /* Content is derived here and only here. The client never sends it, so
       there is no second claim about the same text to reconcile. */
    const content = flattenSections(sections);

    /* The hash covers the SECTION payload, not the derived content: two
       different partitions can flatten to the same characters, and an
       idempotency key must bind to exactly one request body. */
    const hash = payloadHash('save', { sections, checkpoint, note });

    const guardRow = {
      ...(locked.rows[0] as DraftGuardRow),
      version: normalizeVersion((locked.rows[0] as DraftGuardRow).version),
    };
    const decision = precheck(guardRow, 'save', guard.idempotencyKey, hash, guard.baseRevisionId);
    if (decision.kind === 'replay') {
      /* A success, but one that must write nothing. Raised rather than
         returned so the transaction rolls back instead of committing. */
      throw new DraftHttp(200, decision.response);
    }
    if (decision.kind === 'conflict') {
      throw new DraftHttp(409, conflictBody(decision.reason, decision.currentRevisionId));
    }

    const updated = await tx.query(
      `UPDATE manuscript_working_drafts
          SET content = $3,
              version = version + 1,
              revision_count = revision_count + CASE WHEN $5::boolean THEN 1 ELSE 0 END,
              updated_at = now(),
              last_idempotency_key = $6,
              last_idempotency_op = 'save',
              last_idempotency_payload_hash = $7,
              last_idempotency_response = jsonb_build_object(
                'revisionCount', revision_count + CASE WHEN $5::boolean THEN 1 ELSE 0 END,
                'revisionId', version + 1,
                'updatedAt', now(),
                'checkpointed', $5::boolean
              )
        WHERE manuscript_id = $1 AND member_id = $2 AND version = $4
      RETURNING revision_count, version, last_idempotency_response`,
      [manuscriptId, memberId, content, guard.baseRevisionId, checkpoint, guard.idempotencyKey, hash]
    );
    if (updated.rows.length === 0) {
      throw new DraftHttp(409, conflictBody('stale_base', guardRow.version));
    }

    /* Positions do not move: the payload was proven complete, unique and in
       current order, so every id maps onto the row it already occupies. This
       endpoint cannot change topology, and this statement cannot either — it
       writes text and nothing else. */
    const written = await tx.query(
      `UPDATE manuscript_draft_sections s
          SET text = v.text, updated_at = now()
         FROM (SELECT unnest($2::uuid[]) AS id, unnest($3::text[]) AS text) v
        WHERE s.id = v.id AND s.draft_id = $1`,
      [draftId, sections.map((s) => s.id), sections.map((s) => s.text)]
    );
    if (written.rowCount !== sections.length) {
      throw new DraftHttp(409, { refusal: 'unknown_section_id', detail: 'a section changed during the save' });
    }

    /* D7 — the checkpoint still preserves the flattened whole draft in the
       append-only revision store, inside this same transaction. That store is
       the one BUILD-07A will locate evidence into; a checkpoint that could
       commit without its section write would break that locator. */
    if (checkpoint) {
      /* The partition is frozen FROM THE SECTIONS THIS SAVE ACCEPTED, not
         re-derived from the content afterwards. Re-deriving would be a second
         claim about the same boundaries, and the two could differ exactly
         where it matters least visibly. */
      await tx.query(
        `INSERT INTO working_draft_revisions
           (draft_id, revision_number, content, saved_by, note, section_partition)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [draftId, updated.rows[0].revision_count, content, memberId, note,
         JSON.stringify(partitionFromSections(sections))]
      );
    }

    return updated.rows[0].last_idempotency_response;
  });

  return NextResponse.json(result as object);
}
