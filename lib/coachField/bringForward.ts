/**
 * Bring Forward — the member's gesture that makes the relationship real.
 *
 * Everything else in the coach field describes what a practitioner may know.
 * This is the only place a member decides it. Without it the sovereignty model
 * is a set of boundaries around an empty room: nothing ever crosses, so nothing
 * is ever actually entrusted.
 *
 * The act is not "share" — share sounds like handing over a key. It is placing
 * something into the context of a piece of shared work:
 *
 *     "Bring this into my work with Larry."
 *
 * WHAT IT CREATES
 * Not a permission on the source. Not a copy of the source. A third object with
 * its own lifecycle, authored by the member, referencing the source by opaque
 * lineage. The source stays private and stays unreachable from any
 * practitioner-scoped query — there is no join to it and no FK to follow.
 *
 * A snapshot rather than a live pointer, because a live pointer makes every
 * later edit a synchronisation question the member never asked to be part of.
 * The member declares a version; if they want the practitioner to see something
 * else, they say so again.
 *
 * WHO MAY DO WHAT
 *   member       bring forward · update what is seen · withdraw
 *   practitioner receive · read
 *   practitioner never: edit, remove, or reach the source
 *
 * All of this returns null rather than throwing on a standing failure, so a
 * caller cannot tell "does not exist" from "not yours".
 */

import { query } from '@/lib/db/postgres';
import {
  authorizePractitionerClientRelationship,
  type MemberId,
  type RelationshipId,
} from './identity';
import {
  encryptOfferingSnapshot,
  decryptOfferingSnapshot,
  type OfferingSnapshot,
} from '@/lib/security/phiAccessors/sharedOfferings';

/**
 * ⚠️ TO THE NEXT DEVELOPER — the seam most likely to be broken by good intentions.
 *
 * `coach_client_shared_items.source_id` exists. It is tempting. It looks like an
 * invitation to write:
 *
 *     -- DO NOT
 *     SELECT s.*, t.content
 *       FROM coach_client_shared_items s
 *       JOIN member_field_note_threads t ON t.id = s.source_id
 *
 * That single join recreates practitioner access to the member's private field
 * and undoes everything this module exists for. It would look like a
 * convenience ("hydrate the full source") and read like a bug fix ("the
 * offering is missing its content").
 *
 * It is neither. The offering IS the content the member chose to give. The
 * source is a different object with a different owner, and the missing FK is
 * the reason it stays that way — the absence is load-bearing, not an oversight
 * someone forgot to fill in.
 *
 * `source_id` is therefore never returned to any caller: it is not on
 * SharedOffering, and nothing above this layer can see it. It exists so a
 * MEMBER can trace their own lineage, and for no other purpose.
 *
 * This is enforced, not merely requested: `verify-bring-forward.ts` fails if any
 * file under lib/ app/ components/ mentions this table alongside a member-owned
 * source table. If you have a legitimate reason, that assertion is where the
 * conversation happens.
 */

export type OfferingKind = 'reflection' | 'question' | 'commitment' | 'moment';

export interface SharedOffering {
  id: string;
  kind: OfferingKind;
  /** The member's declared snapshot, decrypted for an authorized reader. */
  snapshot: OfferingSnapshot;
  snapshotVersion: number;
  offeredAt: string;
  status: 'active' | 'withdrawn';
  /** Lineage only — the practitioner cannot follow this anywhere. */
  origin: string;
}

/**
 * The member places something into the shared work.
 *
 * Authority comes from the relationship, not the request: the actor must be the
 * CLIENT in it. A practitioner cannot bring something forward on a member's
 * behalf — that would be authoring in their voice.
 */
export async function bringForward(
  actorMemberId: MemberId,
  relationshipId: RelationshipId,
  input: { kind: OfferingKind; snapshot: OfferingSnapshot; origin?: string; sourceId?: string }
): Promise<SharedOffering | null> {
  const auth = await authorizePractitionerClientRelationship(actorMemberId, relationshipId);
  if (!auth) return null;
  if (auth.role !== 'client') return null;
  if (auth.status !== 'active' && auth.status !== 'paused') return null;

  // The row must exist before its content can be encrypted: the additional
  // authenticated data binds ciphertext to this id, so encrypting against a
  // placeholder would produce a row that can never be decrypted.
  const { rows: created } = await query<{ id: string; offered_at: string }>(
    `INSERT INTO coach_client_shared_items
       (relationship_id, offered_by_member_id, kind, origin, source_id,
        snapshot_enc, snapshot_enc_meta)
     VALUES ($1,$2,$3,$4,$5,'','{}'::jsonb)
     RETURNING id, offered_at`,
    [relationshipId, actorMemberId, input.kind, input.origin ?? 'field_note_thread',
     input.sourceId ?? null]
  );
  const id = created[0].id;

  const { ciphertext, meta } = encryptOfferingSnapshot(input.snapshot, {
    rowId: id,
    memberId: actorMemberId,
  });
  await query(
    `UPDATE coach_client_shared_items
        SET snapshot_enc = $2, snapshot_enc_meta = $3::jsonb, updated_at = NOW()
      WHERE id = $1`,
    [id, ciphertext, meta]
  );

  return {
    id,
    kind: input.kind,
    snapshot: input.snapshot,
    snapshotVersion: 1,
    offeredAt: created[0].offered_at,
    status: 'active',
    origin: input.origin ?? 'field_note_thread',
  };
}

/**
 * What a practitioner has been offered in this relationship.
 *
 * Larry does not browse Maya. He receives what she brought. Withdrawn offerings
 * are gone from this list entirely — not greyed out, not tombstoned. A record
 * that a person changed their mind is not the practitioner's to hold.
 */
export async function receiveOfferings(
  actorMemberId: MemberId,
  relationshipId: RelationshipId
): Promise<SharedOffering[] | null> {
  const auth = await authorizePractitionerClientRelationship(actorMemberId, relationshipId);
  if (!auth) return null;
  if (auth.role !== 'practitioner') return null;
  if (auth.status === 'ended') return null;
  // Never true while the invitation is unclaimed: there is no person yet to
  // have consented to anything.
  if (!auth.canReadMemberShared) return [];

  return readOfferings(relationshipId, 'active');
}

/** What the member themselves has brought forward, including nothing at all. */
export async function listMyOfferings(
  actorMemberId: MemberId,
  relationshipId: RelationshipId
): Promise<SharedOffering[] | null> {
  const auth = await authorizePractitionerClientRelationship(actorMemberId, relationshipId);
  if (!auth || auth.role !== 'client') return null;
  return readOfferings(relationshipId, 'active');
}

/**
 * The member changes what the practitioner sees. A new declaration, not a sync:
 * the version increments so it is legible that the member spoke again.
 */
export async function updateOffering(
  actorMemberId: MemberId,
  offeringId: string,
  snapshot: OfferingSnapshot
): Promise<boolean> {
  const owned = await assertOfferedByActor(actorMemberId, offeringId);
  if (!owned) return false;

  const { ciphertext, meta } = encryptOfferingSnapshot(snapshot, {
    rowId: offeringId,
    memberId: actorMemberId,
  });
  const { rowCount } = await query(
    `UPDATE coach_client_shared_items
        SET snapshot_enc = $2,
            snapshot_enc_meta = $3::jsonb,
            snapshot_version = snapshot_version + 1,
            updated_at = NOW()
      WHERE id = $1 AND status = 'active'`,
    [offeringId, ciphertext, meta]
  );
  return (rowCount ?? 0) > 0;
}

/**
 * The member takes it back. Silent by ruling: no notification, no event
 * surfaced to the practitioner, no "Maya withdrew something" in anyone's feed.
 * Private sovereignty is silent; only the resulting state is visible.
 */
export async function withdrawOffering(
  actorMemberId: MemberId,
  offeringId: string
): Promise<boolean> {
  const owned = await assertOfferedByActor(actorMemberId, offeringId);
  if (!owned) return false;

  const { rowCount } = await query(
    `UPDATE coach_client_shared_items
        SET status = 'withdrawn', withdrawn_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status = 'active'`,
    [offeringId]
  );
  return (rowCount ?? 0) > 0;
}

// ── internals ─────────────────────────────────────────────────────────────

async function assertOfferedByActor(
  actorMemberId: MemberId,
  offeringId: string
): Promise<boolean> {
  const { rows } = await query<{ offered_by_member_id: string }>(
    `SELECT offered_by_member_id FROM coach_client_shared_items WHERE id = $1`,
    [offeringId]
  );
  return rows.length > 0 && rows[0].offered_by_member_id === actorMemberId;
}

async function readOfferings(
  relationshipId: RelationshipId,
  status: 'active' | 'withdrawn'
): Promise<SharedOffering[]> {
  const { rows } = await query<{
    id: string;
    kind: OfferingKind;
    origin: string;
    snapshot_enc: string;
    snapshot_enc_meta: any;
    snapshot_version: number;
    offered_at: string;
    offered_by_member_id: string;
    status: 'active' | 'withdrawn';
  }>(
    `SELECT id, kind, origin, snapshot_enc, snapshot_enc_meta,
            snapshot_version, offered_at, offered_by_member_id, status
       FROM coach_client_shared_items
      WHERE relationship_id = $1 AND status = $2
      ORDER BY offered_at DESC`,
    [relationshipId, status]
  );

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    snapshot: decryptOfferingSnapshot(r.snapshot_enc, r.snapshot_enc_meta, {
      rowId: r.id,
      memberId: r.offered_by_member_id as MemberId,
    }),
    snapshotVersion: r.snapshot_version,
    offeredAt: r.offered_at,
    status: r.status,
    origin: r.origin,
  }));
}
