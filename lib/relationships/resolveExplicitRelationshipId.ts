/**
 * Explicit relationship attachment — server-side ownership resolution.
 *
 * WHY THIS EXISTS. A Relationship Room turn carries `consciousnessContext.
 * relationshipId` — the member's declaration "I am in this person's room".
 * Until now every live conversation route dropped it, and the relational
 * observer resolved unconditionally to the member's `Unresolved Relational
 * Field` catch-all. Material spoken about a named person was filed nowhere.
 *
 * WHAT A CLIENT-SUPPLIED ID IS. An assertion, never an authorization. The
 * conversation routes resolve their member as
 * `userId || x-member-id || session?.id` — i.e. they PREFER a body-supplied
 * id. Validating a body `relationshipId` against a body `userId` would be
 * circular and would authorize nothing, so the ownership predicate here binds
 * to `getCurrentSession()` — the server-resolved member — and to nothing else.
 *
 * WHY VALIDATION LIVES HERE AND NOT IN THE OBSERVER. `observeRelationalContent`
 * is fire-and-forget `void`; a refusal raised inside it is swallowed by its own
 * `.catch`. Validation must happen where a refusal is still observable.
 *
 * REFUSAL IS NOT A SILENT DOWNGRADE. A refused turn is recorded as refused, so
 * "no context was offered" stays distinguishable from "context was offered and
 * rejected". Under no circumstance may a relationship owned by another member,
 * or an archived one, receive a write.
 *
 * WHAT CORRECT ATTACHMENT ESTABLISHES. Which relationship the material
 * concerns — and nothing else. Authorship, provenance, epistemic status and
 * confidence are untouched: an observer-generated entry attached to the right
 * person is correctly FILED, not more TRUE, and does not become member-declared.
 */

import { queryOne } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export type RelationshipAttachment =
  /** No relationship context was offered — ordinary conversation. */
  | { status: 'none' }
  /** Offered, well-formed, owned by the session member, not archived. */
  | { status: 'attached'; relationshipId: string }
  /** Offered and rejected. Never silently downgraded — the refusal is recorded. */
  | {
      status: 'refused';
      reason: 'malformed' | 'unauthenticated' | 'not-owned' | 'lookup-failed';
    };

/** Pull a candidate id out of the request meta. Shape-tolerant, trust-free. */
export function readRequestedRelationshipId(meta: unknown): string | null {
  const ctx = (meta as { consciousnessContext?: unknown } | null | undefined)
    ?.consciousnessContext;
  if (!ctx || typeof ctx !== 'object') return null;
  const raw = (ctx as { relationshipId?: unknown }).relationshipId;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolve the request's explicit relationship context to an id this member
 * provably owns — or to a recorded refusal. Fail-closed at every branch.
 */
export async function resolveExplicitRelationshipId(
  meta: unknown,
): Promise<RelationshipAttachment> {
  const requested = readRequestedRelationshipId(meta);
  if (!requested) return { status: 'none' };
  if (!UUID_RE.test(requested)) return { status: 'refused', reason: 'malformed' };

  try {
    // Bind to the SERVER-RESOLVED member. Not the body's `userId`, not the
    // `x-member-id` header — both are client-supplied and would be circular.
    const session = await getCurrentSession();
    if (!session?.memberId) return { status: 'refused', reason: 'unauthenticated' };

    // Same predicate the relationship detail route uses, archived-exclusion
    // inherited deliberately: a room the member has put away does not receive
    // new writes.
    const owned = await queryOne(
      `SELECT id FROM member_relationships
       WHERE id = $1 AND member_id = $2 AND archived_at IS NULL`,
      [requested, session.memberId],
    );
    if (!owned) return { status: 'refused', reason: 'not-owned' };

    return { status: 'attached', relationshipId: String(owned.id) };
  } catch (err) {
    console.warn(
      '[relationalAttach] ownership lookup failed (non-blocking):',
      (err as Error)?.message || err,
    );
    return { status: 'refused', reason: 'lookup-failed' };
  }
}

/**
 * Record a refusal distinguishably. The turn still proceeds as an ordinary
 * unattached turn — but the record must not make that look like a turn where
 * no context was ever offered.
 */
export function logAttachmentOutcome(
  routeTag: string,
  attachment: RelationshipAttachment,
): void {
  if (attachment.status === 'refused') {
    console.warn(
      `🔗 [relationalAttach] REFUSED route=${routeTag} reason=${attachment.reason} — ` +
        'no write to the named relationship; turn treated as unattached',
    );
  } else if (attachment.status === 'attached') {
    console.log(
      `🔗 [relationalAttach] attached route=${routeTag} relationship=${attachment.relationshipId}`,
    );
  }
}
