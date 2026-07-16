/**
 * Soul Portrait store — Gate 2 `soul_portraits` table access (Stage 1 hardened).
 *
 * A generated portrait is stored as a DRAFT: `consent_state = 'pending'`,
 * `published_at = NULL`. It is editable until published (Gate 2's write-once
 * trigger only bites after `published_at`). Persisting records NO consent — the
 * consent ledger (soul_portrait_consents) is written by the separate consent flow.
 *
 * OWNER-SCOPING IS STRUCTURAL (Stage 1). Every read accessor here filters by
 * `owner_member_id`, so a practitioner can only ever read a portrait they own.
 * There is deliberately NO unscoped read accessor — a fork would have to hand-write
 * raw SQL to read across owners. This is the refusal Stage 1 rests on.
 *   Verifier: __tests__/soul-portrait-owner-scoping.test.ts
 *   Boundary: docs/architecture/SOUL_PORTRAIT_STUDIO_STAGE1_BOUNDARY.md
 *
 * A portrait's SUBJECT ("who it is about") has two orthogonal, nullable links:
 *   · subjectPersonId  → studio_people (the practitioner's directory; a client/friend
 *                        who may have no MAIA account)   ← Stage 1 client linkage
 *   · subjectMemberId  → a MAIA member account, when one exists
 * Stage 1 is INTERNAL-ONLY: no delivery/client surface reads this store.
 */

import { query, queryOne } from '@/lib/db/postgres';
import type { SoulPortrait, PortraitMode } from '@/lib/soulPortrait/schema';

export interface StoredPortrait {
  id: string;
  slug: string;
  ownerMemberId: string;
  subjectMemberId: string | null;
  subjectPersonId: string | null;
  portraitKind: string;
  subjectIsMinor: boolean;
  consentState: 'pending' | 'active' | 'revoked';
  publishedAt: string | null;
  immutableText: SoulPortrait;
  /** Which engine wrote the draft (e.g. 'anthropic'/'ollama') — null on pre-provenance rows. */
  generationProvider: string | null;
  generationModel: string | null;
  createdAt: string;
}

/** SoulPortrait.mode ('parent-child') → DB CHECK value ('parent_child'). */
function modeToKind(mode: PortraitMode): string {
  return mode === 'parent-child' ? 'parent_child' : mode;
}

function rowToStored(r: any): StoredPortrait {
  return {
    id: r.id,
    slug: r.slug,
    ownerMemberId: r.owner_member_id,
    subjectMemberId: r.subject_member_id ?? null,
    subjectPersonId: r.subject_person_id ?? null,
    portraitKind: r.portrait_kind,
    subjectIsMinor: r.subject_is_minor === true,
    consentState: r.consent_state,
    publishedAt: r.published_at ?? null,
    immutableText: typeof r.immutable_text === 'string' ? JSON.parse(r.immutable_text) : r.immutable_text,
    generationProvider: r.generation_provider ?? null,
    generationModel: r.generation_model ?? null,
    createdAt: r.created_at,
  };
}

export interface CreateDraftInput {
  slug: string;
  ownerMemberId: string;
  subjectMemberId?: string | null;
  /** studio_people.id — the practitioner-directory record the portrait is about. */
  subjectPersonId?: string | null;
  mode: PortraitMode;
  isMinor?: boolean;
  subjectAge?: number;
  immutableText: SoulPortrait;
  /** Engine provenance from the generator — required for new drafts; the label travels with the row. */
  generationProvider?: string | null;
  generationModel?: string | null;
}

/** Insert a generated portrait as a pending, unpublished draft, owned by the caller. */
export async function createDraftPortrait(input: CreateDraftInput): Promise<StoredPortrait> {
  const row = await queryOne<any>(
    `INSERT INTO soul_portraits
       (slug, owner_member_id, subject_member_id, subject_person_id, subject_is_minor,
        subject_age, portrait_kind, consent_state, immutable_text,
        generation_provider, generation_model)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9,$10)
     RETURNING *`,
    [
      input.slug,
      input.ownerMemberId,
      input.subjectMemberId ?? null,
      input.subjectPersonId ?? null,
      input.isMinor ?? false,
      input.subjectAge ?? null,
      modeToKind(input.mode),
      JSON.stringify(input.immutableText),
      input.generationProvider ?? null,
      input.generationModel ?? null,
    ],
  );
  if (!row) throw new Error('draft_insert_failed');
  return rowToStored(row);
}

// ── Reads — owner-scoped ONLY. `owner_member_id = $N` is the structural refusal. ──

/** Read one portrait the caller owns. Non-owner or unknown id → null (never leaks). */
export async function getOwnedPortrait(id: string, ownerMemberId: string): Promise<StoredPortrait | null> {
  const row = await queryOne<any>(
    `SELECT * FROM soul_portraits WHERE id = $1 AND owner_member_id = $2`,
    [id, ownerMemberId],
  );
  return row ? rowToStored(row) : null;
}

/** Read one portrait the caller owns, by slug. Non-owner or unknown slug → null. */
export async function getOwnedPortraitBySlug(slug: string, ownerMemberId: string): Promise<StoredPortrait | null> {
  const row = await queryOne<any>(
    `SELECT * FROM soul_portraits WHERE slug = $1 AND owner_member_id = $2`,
    [slug, ownerMemberId],
  );
  return row ? rowToStored(row) : null;
}

/** List the portraits the caller owns. Never returns another practitioner's rows. */
export async function listOwnedPortraits(ownerMemberId: string): Promise<StoredPortrait[]> {
  const res = await query<any>(
    `SELECT * FROM soul_portraits WHERE owner_member_id = $1 ORDER BY created_at DESC`,
    [ownerMemberId],
  );
  return res.rows.map(rowToStored);
}

/**
 * A portrait plus a display name for its subject: the linked studio_people
 * record when one exists, otherwise the name written into the portrait itself
 * (immutable_text.person.name — required at generation, so every generated
 * draft has one). Null only for legacy rows missing both.
 */
export interface StoredPortraitWithSubject extends StoredPortrait {
  subjectName: string | null;
}

/**
 * Return surface (the Studio "Your Soul Portraits" index): the caller's own portraits,
 * newest first, with the linked studio_people subject name resolved for display.
 *
 * Owner-scoped by the SAME structural refusal as listOwnedPortraits
 * (`sp.owner_member_id = $1`). The LEFT JOIN only resolves a name for a subject the
 * OWNER already linked; it never widens the row set to another practitioner's portraits.
 * Cross-Co-Lab subject linkage is refused at WRITE time (see lib/soulPortrait/subjectScope.ts).
 */
export async function listOwnedPortraitsWithSubject(
  ownerMemberId: string,
): Promise<StoredPortraitWithSubject[]> {
  const res = await query<any>(
    `SELECT sp.*, ppl.name AS subject_name
       FROM soul_portraits sp
       LEFT JOIN studio_people ppl ON ppl.id = sp.subject_person_id
      WHERE sp.owner_member_id = $1
      ORDER BY sp.created_at DESC`,
    [ownerMemberId],
  );
  return res.rows.map((r) => {
    const stored = rowToStored(r);
    return { ...stored, subjectName: r.subject_name ?? stored.immutableText?.person?.name ?? null };
  });
}

// ── Gate 4 — publish + delivery read ────────────────────────────────────────

/**
 * Publish a portrait the caller owns: stamps `published_at` (arming Gate 2's
 * write-once trigger on immutable_text). Owner-scoped like every write here.
 * Idempotent — an already-published portrait keeps its original timestamp.
 * Publishing does NOT record consent; callers pair this with the consent
 * ledger write (lib/soulPortrait/consentRecord.ts).
 */
export async function publishOwnedPortrait(id: string, ownerMemberId: string): Promise<StoredPortrait | null> {
  const row = await queryOne<any>(
    `UPDATE soul_portraits
        SET published_at = COALESCE(published_at, NOW()), updated_at = NOW()
      WHERE id = $1 AND owner_member_id = $2
      RETURNING *`,
    [id, ownerMemberId],
  );
  return row ? rowToStored(row) : null;
}

/**
 * Correct the minor flag on an UNPUBLISHED draft the caller owns.
 *
 * The flag lives in TWO places and they must never diverge: the
 * `subject_is_minor` column (what the send route's guardian refusal gates on)
 * and `immutable_text.person.isMinor` (written at generation) — both are
 * updated in one statement. Owner-scoped like every write here, and
 * additionally gated on `published_at IS NULL`: a published portrait is
 * write-once (Gate 2 trigger), so the refusal is structural in the WHERE
 * clause, not left to the trigger's exception. Non-owner, unknown id, or
 * already-published → null (caller distinguishes by reading first).
 */
export async function setOwnedDraftMinorFlag(
  id: string,
  ownerMemberId: string,
  isMinor: boolean,
): Promise<StoredPortrait | null> {
  const row = await queryOne<any>(
    `UPDATE soul_portraits
        SET subject_is_minor = $3,
            immutable_text = jsonb_set(immutable_text, '{person,isMinor}', to_jsonb($3::boolean), true),
            updated_at = NOW()
      WHERE id = $1 AND owner_member_id = $2 AND published_at IS NULL
      RETURNING *`,
    [id, ownerMemberId, isMinor],
  );
  return row ? rowToStored(row) : null;
}

/**
 * DELIVERY READ — the one deliberate exception to owner-scoping, for the
 * recipient-facing route (/soul-portrait/view/[slug]). It is narrow by
 * construction: only PUBLISHED rows resolve, and the route MUST additionally
 * gate on ledger consent-liveness (isPortraitConsentLive) before rendering —
 * the un-guessable slug is defense-in-depth, never the gate (Path B invariant).
 */
export async function getDeliveredPortraitBySlug(slug: string): Promise<StoredPortrait | null> {
  const row = await queryOne<any>(
    `SELECT * FROM soul_portraits WHERE slug = $1 AND published_at IS NOT NULL`,
    [slug],
  );
  return row ? rowToStored(row) : null;
}
