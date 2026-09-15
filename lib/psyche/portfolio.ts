/**
 * Psyche Engagement Layer — Portfolio Service (Phase 1)
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
 * Spec:
 *   - docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
 *
 * Service shape:
 *   This module is a ritual gesture interpreter, NOT a CRUD wrapper.
 *   Reads are CRUD-shaped. Writes are gesture-shaped.
 *
 * Hard invariants (enforced by the absence of corresponding functions):
 *   - No updateMemoryAtom(patch)
 *   - No inferRegisters()
 *   - No inferLenses()
 *   - No surfaceRecallCandidates()       (Phase 2)
 *   - No synthesizeAcrossAtoms()         (Phase 3)
 *   - No computeDevelopmentalState()     (out of scope structurally)
 *
 * The only public write surface is a member gesture. Every write keeps
 * crossing_allowed = false. The DB CHECK constraint backstops the discipline.
 */

import { query } from '@/lib/db/postgres';
import {
  memberConferredReturn,
  returnPreferenceValue,
  type AuthorizedReturnPreference,
} from './returnAuthority';
import { resolveCapsuleDeclarationSource } from '@/lib/psyche/sources/capsule';
import type {
  AtomGesture,
  CrystallizedMemory,
  ElementalLens,
  KeepGestureInput,
  LensPass,
  LensPassInput,
  MemberResponseStatus,
  MemoryAtomSourceType,
  MemoryRegister,
  PortfolioSourceCandidate,
  PortfolioView,
  ReturnPreference,
} from './types';

// ════════════════════════════════════════════════════════════════════════════
// Row types (raw DB shape)
// ════════════════════════════════════════════════════════════════════════════

interface AtomRow {
  id: string;
  member_id: string;
  source_type: MemoryAtomSourceType;
  source_id: string | null;
  title: string;
  body: string | null;
  primary_register: MemoryRegister | null;
  registers: MemoryRegister[];
  elemental_lenses: ElementalLens[];
  thread_ids: string[];
  status: CrystallizedMemory['status'];
  return_preference: ReturnPreference;
  last_surfaced_at: string | null;
  surface_count: number;
  member_response_status: MemberResponseStatus | null;
  member_response_at: string | null;
  kept_at: string;
  last_touched_at: string;
  created_at: string;
  updated_at: string;
  crossing_allowed: boolean;
}

interface LensPassRow {
  id: string;
  member_id: string;
  memory_atom_id: string;
  lens: ElementalLens;
  prompt: string;
  member_response: string;
  created_at: string;
}

// ════════════════════════════════════════════════════════════════════════════
// Row → Domain mapping
// ════════════════════════════════════════════════════════════════════════════

function rowToAtom(row: AtomRow): CrystallizedMemory {
  return {
    id: row.id,
    memberId: row.member_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    body: row.body,
    primaryRegister: row.primary_register,
    registers: row.registers ?? [],
    elementalLenses: row.elemental_lenses ?? [],
    threadIds: row.thread_ids ?? [],
    status: row.status,
    returnPreference: row.return_preference,
    lastSurfacedAt: row.last_surfaced_at,
    surfaceCount: row.surface_count,
    memberResponseStatus: row.member_response_status ?? null,
    memberResponseAt: row.member_response_at ?? null,
    keptAt: row.kept_at,
    lastTouchedAt: row.last_touched_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // ReverberationGuard is derived, not stored.
    // crossing_allowed is enforced at the DB level (CHECK = FALSE).
    reverberationGuard: {
      interpretationStatus: 'uninterpreted', // Phase 1 default
      voiceEligibility: row.status === 'protected' ? 'record_only' : 'invitable',
      crossingAllowed: false,
    },
  };
}

function rowToLensPass(row: LensPassRow): LensPass {
  return {
    id: row.id,
    memberId: row.member_id,
    memoryAtomId: row.memory_atom_id,
    lens: row.lens,
    prompt: row.prompt,
    memberResponse: row.member_response,
    createdAt: row.created_at,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Public reads
// ════════════════════════════════════════════════════════════════════════════

const ATOM_COLUMNS = `
  id, member_id, source_type, source_id, title, body,
  primary_register, registers, elemental_lenses, thread_ids,
  status, return_preference, last_surfaced_at, surface_count,
  member_response_status, member_response_at,
  kept_at, last_touched_at, created_at, updated_at, crossing_allowed
`;

export async function getAtom(
  memberId: string,
  atomId: string,
): Promise<CrystallizedMemory | null> {
  const result = await query<AtomRow>(
    `SELECT ${ATOM_COLUMNS}
       FROM member_memory_atoms
      WHERE member_id = $1 AND id = $2`,
    [memberId, atomId],
  );
  const row = result.rows[0];
  return row ? rowToAtom(row) : null;
}

/**
 * Look up the atom a member already minted from a specific source row.
 *
 * The unique index `idx_memory_atoms_unique_source (member_id, source_type,
 * source_id) WHERE source_id IS NOT NULL` guarantees at most one row, so this
 * is the read side of "has this source already been declared?".
 *
 * ⛔ THIS IS A READ, NOT A GUARD. It must never be used as a preflight before
 * declaring: under concurrency several requests all read absent, all proceed,
 * and the unique index — not this function — is what converges them onto one
 * row. `keepSource()` decides created-vs-existing inside the write itself.
 * Use this to *show* a member what they already declared, not to decide
 * whether to declare.
 *
 * `spontaneous` atoms have a NULL source_id and are therefore never findable
 * here — by design; they have no source to be declared from.
 */
export async function getAtomBySource(
  memberId: string,
  sourceType: MemoryAtomSourceType,
  sourceId: string,
): Promise<CrystallizedMemory | null> {
  const result = await query<AtomRow>(
    `SELECT ${ATOM_COLUMNS}
       FROM member_memory_atoms
      WHERE member_id = $1 AND source_type = $2 AND source_id = $3`,
    [memberId, sourceType, sourceId],
  );
  const row = result.rows[0];
  return row ? rowToAtom(row) : null;
}

export async function listAtoms(
  memberId: string,
  view: PortfolioView,
): Promise<CrystallizedMemory[]> {
  let sql: string;
  let params: unknown[];

  switch (view.kind) {
    case 'chronological':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 ORDER BY kept_at DESC`;
      params = [memberId];
      break;
    case 'still_alive':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 AND status = 'still_alive'
              ORDER BY last_touched_at DESC`;
      params = [memberId];
      break;
    case 'set_aside':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 AND status = 'set_aside'
              ORDER BY last_touched_at DESC`;
      params = [memberId];
      break;
    case 'protected':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 AND status = 'protected'
              ORDER BY last_touched_at DESC`;
      params = [memberId];
      break;
    case 'archived':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 AND status = 'archived'
              ORDER BY last_touched_at DESC`;
      params = [memberId];
      break;
    case 'by_source':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 AND source_type = $2
              ORDER BY last_touched_at DESC`;
      params = [memberId, view.sourceType];
      break;
    case 'by_register':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1
                AND ($2 = primary_register OR $2 = ANY(registers))
              ORDER BY last_touched_at DESC`;
      params = [memberId, view.register];
      break;
    case 'by_lens':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 AND $2 = ANY(elemental_lenses)
              ORDER BY last_touched_at DESC`;
      params = [memberId, view.lens];
      break;
    case 'by_thread':
      sql = `SELECT ${ATOM_COLUMNS} FROM member_memory_atoms
              WHERE member_id = $1 AND $2::uuid = ANY(thread_ids)
              ORDER BY last_touched_at DESC`;
      params = [memberId, view.threadId];
      break;
  }

  const result = await query<AtomRow>(sql, params);
  return result.rows.map(rowToAtom);
}

export async function listLensPasses(
  memberId: string,
  atomId: string,
): Promise<LensPass[]> {
  const result = await query<LensPassRow>(
    `SELECT id, member_id, memory_atom_id, lens, prompt, member_response, created_at
       FROM member_lens_passes
      WHERE member_id = $1 AND memory_atom_id = $2
      ORDER BY created_at DESC`,
    [memberId, atomId],
  );
  return result.rows.map(rowToLensPass);
}

/**
 * Read candidates from a source surface that the member could choose to keep.
 *
 * Phase 1 bridges only `idea` and `idea_block`. Other source types return
 * empty until their tables exist.
 *
 * Each candidate carries `alreadyKept` so the UI can mark what's already
 * been kept and what's still available.
 */
export async function listSourceCandidates(
  memberId: string,
  sourceType: MemoryAtomSourceType,
): Promise<PortfolioSourceCandidate[]> {
  if (sourceType === 'idea') {
    const result = await query<{
      source_id: string;
      title: string;
      preview: string;
      created_at: string;
      kept_atom_id: string | null;
    }>(
      `SELECT
         mi.id           AS source_id,
         mi.title        AS title,
         COALESCE(mi.framing, '') AS preview,
         mi.created_at   AS created_at,
         mma.id          AS kept_atom_id
       FROM member_ideas mi
       LEFT JOIN member_memory_atoms mma
         ON mma.member_id = mi.member_id
        AND mma.source_type = 'idea'
        AND mma.source_id = mi.id
        AND mma.status != 'archived'
       WHERE mi.member_id = $1
       ORDER BY mi.last_entered_at DESC`,
      [memberId],
    );
    return result.rows.map((r) => ({
      sourceType: 'idea',
      sourceId: r.source_id,
      title: r.title,
      preview: r.preview,
      createdAt: r.created_at,
      alreadyKept: r.kept_atom_id !== null,
      keptAtomId: r.kept_atom_id,
    }));
  }

  if (sourceType === 'idea_block') {
    const result = await query<{
      source_id: string;
      title: string;
      preview: string;
      created_at: string;
      kept_atom_id: string | null;
    }>(
      `SELECT
         mib.id          AS source_id,
         LEFT(mib.content, 80) AS title,
         mib.content     AS preview,
         mib.created_at  AS created_at,
         mma.id          AS kept_atom_id
       FROM member_idea_blocks mib
       LEFT JOIN member_memory_atoms mma
         ON mma.member_id = mib.member_id
        AND mma.source_type = 'idea_block'
        AND mma.source_id = mib.id
        AND mma.status != 'archived'
       WHERE mib.member_id = $1
       ORDER BY mib.created_at DESC
       LIMIT 200`,
      [memberId],
    );
    return result.rows.map((r) => ({
      sourceType: 'idea_block',
      sourceId: r.source_id,
      title: r.title,
      preview: r.preview,
      createdAt: r.created_at,
      alreadyKept: r.kept_atom_id !== null,
      keptAtomId: r.kept_atom_id,
    }));
  }

  // Other source types: tables don't exist yet (journal, dream, reflection,
  // decision, change, session_excerpt). Return empty for Phase 1.
  // Spontaneous never has candidates — it's created directly via keepSource.
  return [];
}

// ════════════════════════════════════════════════════════════════════════════
// Public writes — gesture-shaped only
// ════════════════════════════════════════════════════════════════════════════

/**
 * The formation event: a member keeps material into the portfolio.
 *
 * Arrival ≠ keeping. Source material exists; this gesture is the act of
 * the member choosing to hold it. After this, the atom is portfolio memory.
 *
 * crossing_allowed defaults to FALSE at the DB level and is never written
 * by the service.
 */
export async function keepSource(
  memberId: string,
  input: KeepGestureInput,
): Promise<CrystallizedMemory & { wasCreated: boolean }> {
  if (input.memberId !== memberId) {
    throw new Error('keepSource: memberId mismatch between session and input');
  }

  // Practitioner observations carry practitioner attribution (facilitator_id) and
  // are written ONLY through the facilitated With-Me path, never the member-keep
  // gesture. keepSource has no facilitator context, so a practitioner atom written
  // here would be unattributable — and the loader's PRACTITIONER_ATTRIBUTION_GUARD
  // bars unattributed practitioner atoms from surfacing. Reject at the door.
  // (Bridge-verification finding 2026-06-24; canon: facilitator_id is canonical.)
  if (input.sourceType === 'practitioner_observation') {
    throw new Error(
      "keepSource: 'practitioner_observation' atoms must be written through the " +
        'facilitated With-Me path (which sets facilitator_id), not the member-keep gesture.',
    );
  }

  // Spontaneous requires body; sourced requires sourceId (DB enforces too)
  if (input.sourceType === 'spontaneous') {
    if (!input.body) {
      throw new Error('keepSource: spontaneous entries require a body');
    }
  } else {
    if (!input.sourceId) {
      throw new Error(`keepSource: source_id required for sourceType '${input.sourceType}'`);
    }
  }

  // A capsule must exist, be the member's own, and be eligible — resolved here,
  // where every caller converges, rather than in whichever surface hosts the
  // gesture.
  //
  // The capsule's own table knowledge lives in its resolver, not inline here.
  // keepSource enforces the universal rules — member identity, atom shape,
  // provenance, privacy defaults, database idempotency, created-vs-existing —
  // and stays the single governed minting capability. A source resolver may
  // verify and read; it never inserts. See lib/psyche/sources/capsule.ts for
  // the eligibility, identity-boundary and refusal-symmetry reasoning.
  if (input.sourceType === 'capsule') {
    await resolveCapsuleDeclarationSource(memberId, input.sourceId!);
  }

  // Declaring the same source twice returns the first declaration.
  //
  // The member presses once. A double-tap, a retry after a dropped response, or
  // two open tabs must all leave ONE Field Object — and no amount of care in
  // the UI can promise that: two concurrent requests both pass a
  // read-before-write check, and both insert. ON CONFLICT makes the second one
  // lose inside the database, which is the only place the race is decidable.
  //
  // Scoped to the partial index (source_id IS NOT NULL). Spontaneous keeps
  // carry no source and stay genuinely repeatable — a member may keep the same
  // thought twice, and that is two acts, not a duplicate.
  //
  // DO UPDATE SET member_id = EXCLUDED.member_id is a deliberate no-op write:
  // it changes nothing, and it is the only way to make ON CONFLICT RETURN the
  // existing row. DO NOTHING returns zero rows, which would make a retry
  // indistinguishable from a failure.
  //
  // `(xmax = 0) AS was_created` reports which branch the statement took, from
  // inside the statement itself, so the caller learns created-vs-existing from
  // the SAME atomic operation that decided it.
  //
  // A read before the write cannot answer this. Under concurrent declarations
  // both requests read "absent", both proceed, the index correctly converges
  // them onto one row — and both would report "created". The row would be
  // right and the answer would be a lie.
  //
  // ⚠️ WHAT GOVERNS THIS IS THE TEST, NOT THIS EXPLANATION. `xmax` is PostgreSQL
  // tuple metadata, not a domain field: the reasoning below is why we expect it
  // to work, and expectations about storage internals are exactly the kind of
  // thing that quietly stops being true. The governing contract is the
  // concurrency case in scripts/repro/c3probe.ts — five simultaneous
  // declarations yield exactly one created and four existing, same id, one row
  // — which must be re-run against the server version actually deployed
  // (production runs PostgreSQL 16.13; local dev runs 17.x, so a local green is
  // not evidence for production). If that test ever fails, replace the
  // mechanism; do not repair the explanation.
  //
  // The reasoning, for whoever does that work: on a fresh INSERT the row has no
  // updating transaction, so xmax is 0; on the ON CONFLICT path the row was
  // locked and updated, so xmax carries the updating xid.
  // P6 — RETURN AUTHORITY IS NOW EXPLICIT AT THE WRITE SITE.
  //
  // This INSERT used to omit `return_preference` and inherit the column
  // DEFAULT, which migration 20260523000001 flipped to `contextual_doorway`
  // ("Keeping is the consent act. Return is the default meaning of keeping.").
  //
  // That doctrine is UNCHANGED and this call preserves it exactly: a member
  // keeping their own material confers contextual return by the keep gesture.
  // What changed is that the permission is now CONSTRUCTED from the member's
  // identity rather than inherited from a column default that applied to
  // whoever happened to be writing. `memberConferredReturn` throws unless the
  // acting principal is the subject, so no non-member writer can reach this
  // value by omission.
  const keepReturnAuthority: AuthorizedReturnPreference = memberConferredReturn(
    'contextual_doorway',
    { actingMemberId: memberId, subjectMemberId: memberId, gesture: 'keep' },
  );

  const result = await query<AtomRow & { was_created: boolean }>(
    `INSERT INTO member_memory_atoms (
       member_id, source_type, source_id, title, body,
       primary_register, registers, elemental_lenses, thread_ids,
       status,
       kept_at, last_touched_at,
       posture_at_creation, generated_by,
       return_preference
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       'active',
       NOW(), NOW(),
       'normal', 'member-gesture',
       $10
     )
     ON CONFLICT (member_id, source_type, source_id) WHERE source_id IS NOT NULL
       DO UPDATE SET member_id = EXCLUDED.member_id
     RETURNING ${ATOM_COLUMNS}, (xmax = 0) AS was_created`,
    [
      memberId,
      input.sourceType,
      input.sourceId ?? null,
      input.title,
      input.body ?? null,
      input.primaryRegister ?? null,
      input.registers ?? [],
      input.elementalLenses ?? [],
      input.threadIds ?? [],
      returnPreferenceValue(keepReturnAuthority),
    ],
  );

  const atom = rowToAtom(result.rows[0]);

  // Carried as an extra property rather than a changed return type, so the
  // three existing callers are untouched: they assign to CrystallizedMemory and
  // never look at this. Only a caller that must distinguish creation from
  // convergence — the declaration route, which owes the member a truthful 201
  // vs 200 — reads it.
  const wasCreated = result.rows[0].was_created === true;

  // Fire-and-forget: index affinities to Living Field dimensions.
  // Never awaited — atom creation must not block on this.
  //
  // Only on creation. A retry or a losing concurrent declaration converges on
  // an atom that was already indexed; re-running would be work whose only
  // effect is load.
  if (wasCreated) {
    import('@/lib/maia/living-field/indexAtom').then(({ indexAtomAffinities }) => {
      indexAtomAffinities(atom.id, memberId);
    }).catch(() => { /* silent */ });
  }

  return Object.assign(atom, { wasCreated });
}

/**
 * Apply a member gesture to an existing atom.
 *
 * This is the only mutation surface for kept atoms (besides keepSource for
 * creation). Each gesture is intentional; there is no generic patch.
 *
 * crossing_allowed is never written by this function. The DB CHECK
 * constraint will reject any attempt to flip it.
 */
export async function applyAtomGesture(
  memberId: string,
  atomId: string,
  gesture: AtomGesture,
): Promise<CrystallizedMemory> {
  let sql: string;
  let params: unknown[];

  switch (gesture.kind) {
    case 'mark_still_alive':
      sql = `UPDATE member_memory_atoms
                SET status = 'still_alive', last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId];
      break;

    case 'set_aside':
      sql = `UPDATE member_memory_atoms
                SET status = 'set_aside', last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId];
      break;

    case 'protect':
      sql = `UPDATE member_memory_atoms
                SET status = 'protected', last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId];
      break;

    case 'archive':
      sql = `UPDATE member_memory_atoms
                SET status = 'archived', last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId];
      break;

    case 'return_to_active':
      sql = `UPDATE member_memory_atoms
                SET status = 'active', last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId];
      break;

    case 'replace_primary_register':
      sql = `UPDATE member_memory_atoms
                SET primary_register = $3, last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, gesture.register];
      break;

    case 'add_register':
      // Idempotent: only add if not already present.
      sql = `UPDATE member_memory_atoms
                SET registers = (
                      SELECT ARRAY(SELECT DISTINCT unnest(registers || ARRAY[$3]))
                    ),
                    last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, gesture.register];
      break;

    case 'remove_register':
      sql = `UPDATE member_memory_atoms
                SET registers = array_remove(registers, $3),
                    last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, gesture.register];
      break;

    case 'add_lens':
      sql = `UPDATE member_memory_atoms
                SET elemental_lenses = (
                      SELECT ARRAY(SELECT DISTINCT unnest(elemental_lenses || ARRAY[$3]))
                    ),
                    last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, gesture.lens];
      break;

    case 'remove_lens':
      sql = `UPDATE member_memory_atoms
                SET elemental_lenses = array_remove(elemental_lenses, $3),
                    last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, gesture.lens];
      break;

    case 'add_thread':
      sql = `UPDATE member_memory_atoms
                SET thread_ids = (
                      SELECT ARRAY(SELECT DISTINCT unnest(thread_ids || ARRAY[$3::uuid]))
                    ),
                    last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, gesture.threadId];
      break;

    case 'remove_thread':
      sql = `UPDATE member_memory_atoms
                SET thread_ids = array_remove(thread_ids, $3::uuid),
                    last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, gesture.threadId];
      break;

    case 'set_return_preference': {
      // P6 — the ONE member-conferred assignment path.
      //
      // The value goes through the same boundary as every other writer, so the
      // member's own act and a non-member's attempt are not two code paths that
      // merely happen to differ. `applyAtomGesture` runs with the authenticated
      // principal and the row is scoped to that same member, so acting
      // principal and subject are the same person by construction here — which
      // is exactly what the constructor requires and enforces.
      const authorized = memberConferredReturn(gesture.preference, {
        actingMemberId: memberId,
        subjectMemberId: memberId,
        gesture: 'set_return_preference',
      });
      sql = `UPDATE member_memory_atoms
                SET return_preference = $3, last_touched_at = NOW()
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId, returnPreferenceValue(authorized)];
      break;
    }

    case 'touch':
      // The "Still here" gesture: member-explicit witness.
      // Increments still_here_count alongside last_touched_at.
      // Witness-as-gesture counter (vs lens-pass count = translation).
      sql = `UPDATE member_memory_atoms
                SET last_touched_at = NOW(),
                    still_here_count = still_here_count + 1
              WHERE member_id = $1 AND id = $2
              RETURNING ${ATOM_COLUMNS}`;
      params = [memberId, atomId];
      break;
  }

  const result = await query<AtomRow>(sql, params);
  if (result.rows.length === 0) {
    throw new Error(`applyAtomGesture: atom not found for member ${memberId}, atom ${atomId}`);
  }
  return rowToAtom(result.rows[0]);
}

/**
 * Record a lens pass — the member encountered a kept atom through a lens.
 *
 * The lens is an ACTION. The pass is the record of the encounter.
 * The member is NEVER stored as a lens-type by this function.
 */
export async function createLensPass(
  memberId: string,
  input: LensPassInput,
): Promise<LensPass> {
  if (input.memberId !== memberId) {
    throw new Error('createLensPass: memberId mismatch');
  }

  // Verify the atom belongs to the member before recording a pass against it.
  // This is also enforced by the FK + member_id column on member_lens_passes.
  const atom = await getAtom(memberId, input.memoryAtomId);
  if (!atom) {
    throw new Error(`createLensPass: atom ${input.memoryAtomId} not found for member ${memberId}`);
  }

  const result = await query<LensPassRow>(
    `INSERT INTO member_lens_passes (
       member_id, memory_atom_id, lens, prompt, member_response
     ) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, member_id, memory_atom_id, lens, prompt, member_response, created_at`,
    [memberId, input.memoryAtomId, input.lens, input.prompt, input.memberResponse],
  );

  // Update last_touched_at on the atom (encounter via lens IS continued presence).
  // NOTE: direct UPDATE — does NOT use the 'touch' gesture, which is reserved
  // for the member-explicit "Still here" affordance and increments still_here_count.
  // We want lens passes to reflect liveness without inflating the witness counter.
  await query(
    `UPDATE member_memory_atoms
        SET last_touched_at = NOW()
      WHERE member_id = $1 AND id = $2`,
    [memberId, input.memoryAtomId],
  );

  return rowToLensPass(result.rows[0]);
}

// ════════════════════════════════════════════════════════════════════════════
// Observation response — the refusal that completes the surfacing capability
// ════════════════════════════════════════════════════════════════════════════

/**
 * The member declines a practitioner-authored observation surfaced about them.
 *
 * The loader surfaces practitioner_observation atoms with an explicit invitation
 * to "confirm, reject, or refine" (lib/maia/memoryAtomsLoader.ts). This gesture
 * is the RECORD of a reject — the missing half that lets the invitation mean
 * something. It sets member_response_status = 'rejected' + member_response_at;
 * the loader then excludes the atom (member_response_status IS DISTINCT FROM
 * 'rejected'), so a declined observation is RELEASED, not silently re-carried.
 * This is the Right to Remain Unpossessed made structural — the member may
 * decline what is held about them, and the system releases it.
 *
 * Scoped to practitioner_observation atoms: a member's OWN placed material is
 * curated via status gestures (set_aside / archive), never "rejected." Targeting
 * any other source_type matches 0 rows and returns null — the misapplication is
 * structurally refused, not honored.
 *
 * Idempotent: re-declining preserves the first member_response_at (COALESCE),
 * so the moment of declining stays recoverable.
 *
 * Returns the updated atom, or null if no owned practitioner_observation atom
 * with that id exists for the member.
 */
export async function declineObservation(
  memberId: string,
  atomId: string,
): Promise<CrystallizedMemory | null> {
  const result = await query<AtomRow>(
    `UPDATE member_memory_atoms
        SET member_response_status = 'rejected',
            member_response_at = COALESCE(member_response_at, NOW()),
            last_touched_at = NOW()
      WHERE member_id = $1 AND id = $2
        AND source_type = 'practitioner_observation'
      RETURNING ${ATOM_COLUMNS}`,
    [memberId, atomId],
  );
  return result.rows[0] ? rowToAtom(result.rows[0]) : null;
}

/**
 * The member withdraws a prior decline (changed their mind).
 *
 * Sovereignty is reversible: declining is not a punishment or a permanent
 * verdict. Clearing the response (→ NULL) lets the observation surface again.
 * Only clears a 'rejected' response — it never fabricates a 'confirmed', and it
 * will not touch a verdict this path did not set. If the atom is not currently
 * declined, this matches 0 rows and returns null (nothing to withdraw).
 *
 * Returns the updated atom, or null if no owned, currently-declined
 * practitioner_observation atom with that id exists for the member.
 */
export async function clearObservationResponse(
  memberId: string,
  atomId: string,
): Promise<CrystallizedMemory | null> {
  const result = await query<AtomRow>(
    `UPDATE member_memory_atoms
        SET member_response_status = NULL,
            member_response_at = NULL,
            last_touched_at = NOW()
      WHERE member_id = $1 AND id = $2
        AND source_type = 'practitioner_observation'
        AND member_response_status = 'rejected'
      RETURNING ${ATOM_COLUMNS}`,
    [memberId, atomId],
  );
  return result.rows[0] ? rowToAtom(result.rows[0]) : null;
}
