/**
 * Soul Portrait store — Gate 2 `soul_portraits` table access.
 *
 * A generated portrait is stored as a DRAFT: `consent_state = 'pending'`,
 * `published_at = NULL`. It is editable until published (Gate 2's write-once
 * trigger only bites after `published_at`). Persisting records NO consent — the
 * consent ledger (soul_portrait_consents) is written by the separate consent flow.
 */

import { query, queryOne } from '@/lib/db/postgres';
import type { SoulPortrait, PortraitMode } from '@/lib/soulPortrait/schema';

export interface StoredPortrait {
  id: string;
  slug: string;
  ownerMemberId: string;
  subjectMemberId: string | null;
  portraitKind: string;
  consentState: 'pending' | 'active' | 'revoked';
  publishedAt: string | null;
  immutableText: SoulPortrait;
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
    portraitKind: r.portrait_kind,
    consentState: r.consent_state,
    publishedAt: r.published_at ?? null,
    immutableText: typeof r.immutable_text === 'string' ? JSON.parse(r.immutable_text) : r.immutable_text,
    createdAt: r.created_at,
  };
}

export interface CreateDraftInput {
  slug: string;
  ownerMemberId: string;
  subjectMemberId?: string | null;
  mode: PortraitMode;
  isMinor?: boolean;
  subjectAge?: number;
  immutableText: SoulPortrait;
}

/** Insert a generated portrait as a pending, unpublished draft. */
export async function createDraftPortrait(input: CreateDraftInput): Promise<StoredPortrait> {
  const row = await queryOne<any>(
    `INSERT INTO soul_portraits
       (slug, owner_member_id, subject_member_id, subject_is_minor, subject_age,
        portrait_kind, consent_state, immutable_text)
     VALUES ($1,$2,$3,$4,$5,$6,'pending',$7)
     RETURNING *`,
    [
      input.slug,
      input.ownerMemberId,
      input.subjectMemberId ?? null,
      input.isMinor ?? false,
      input.subjectAge ?? null,
      modeToKind(input.mode),
      JSON.stringify(input.immutableText),
    ],
  );
  if (!row) throw new Error('draft_insert_failed');
  return rowToStored(row);
}

export async function getPortraitById(id: string): Promise<StoredPortrait | null> {
  const row = await queryOne<any>(`SELECT * FROM soul_portraits WHERE id = $1`, [id]);
  return row ? rowToStored(row) : null;
}

export async function getPortraitBySlug(slug: string): Promise<StoredPortrait | null> {
  const row = await queryOne<any>(`SELECT * FROM soul_portraits WHERE slug = $1`, [slug]);
  return row ? rowToStored(row) : null;
}
