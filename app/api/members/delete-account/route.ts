// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';


import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * POST /api/members/delete-account
 * R4J review-only containment: authenticate and validate the member's request,
 * then REFUSE automatic deletion until signed R20 recovery is qualified.
 *
 * The caller may confirm intent; the caller may not select whose account is
 * deleted. No destructive transaction exists in this isolated route.
 *
 * BEFORE (2026-07-28): the target was taken from a body-supplied `memberId`,
 * with no session resolution at all. The only barrier was `confirmUsername`
 * having to match that member's username — a display identifier, not a secret,
 * and member UUIDs are already exposed to clients. Any caller who knew a
 * username and id could permanently destroy that account and its data.
 *
 * AFTER: the target IS the member resolved from the verified session. A
 * body-supplied `memberId` no longer selects anything; it is accepted only so a
 * disagreement can be refused before any deletion runs. `confirmUsername`
 * remains, but purely as a destructive-action confirmation — it is compared
 * against the authoritative username of the SESSION-derived member.
 *
 * R4J deliberately removes the inherited partial-delete transaction. A
 * completely new independently approved deletion flow is required before
 * member content, sessions and backups can be erased safely.
 */

/**
 * CONTAINMENT (privacy incident, 2026-07-28) — see
 * docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md.
 *
 * This route deleted the `members` row while leaving the member's personal
 * content behind, then reported "Account and all associated data permanently
 * deleted". Two failures, one of which is worse than the other:
 *
 *   1. Content survives account closure. These tables key on `user_id TEXT`
 *      with no FK to `members`, so nothing cascades.
 *   2. The member was TOLD otherwise, at the one moment they were most
 *      entitled to accuracy.
 *
 * Deleting the `members` row first also destroys the evidence: the
 * `auth_sessions` FK is ON DELETE CASCADE, so the revocation records that
 * would identify an affected member are removed along with the account.
 *
 * R4J refuses deletion even if all known counts return zero: the table list
 * is not exhaustive and a restorable old SQL/Source backup can resurrect
 * member data without independently signed R20 deletion custody.
 * A query failure or missing table is an explicit fail-closed 503, never zero.
 */
/**
 * Member-owned content this route does NOT remove.
 *
 * Sourced from `TABLES_TO_MIGRATE` in app/api/members/migrate-data/route.ts —
 * the repo's existing definition of "data belonging to a member" — plus
 * `episodic_memories` and `reflection_capsules`, which that list omits but the
 * retention inventory found retained.
 *
 * Labels are member-legible categories, deduplicated in the response. A member
 * asking to be deleted should be told what remains in words they can act on,
 * not a table list.
 *
 * ⚠️ This list is "everything currently known", not "everything". A table
 * missing here means the preflight will not see it — which is why the posture
 * is refuse-by-default rather than delete-what-we-know.
 */
const GOVERNED_CONTENT: ReadonlyArray<{ table: string; column: string; label: string }> = [
  // R4I/R20: a member-issued chart transfer is governed privacy material.
  // The authenticated route MUST continue to refuse destructive operations
  // until independently signed R20 erasure/recovery is accepted. The separated
  // no-member origin marker alone is NOT a certificate of complete erasure.
  { table: 'astro_maia_transfer_grants', column: 'member_id',
    label: 'records of private chart sharing' },
  // Conversations with MAIA
  { table: 'conversation_turns', column: 'user_id', label: 'conversations' },
  { table: 'conversation_insights', column: 'user_id', label: 'conversations' },
  { table: 'conversation_themes', column: 'user_id', label: 'conversations' },
  { table: 'conversation_memory_uses', column: 'user_id', label: 'conversations' },
  { table: 'maia_sessions', column: 'user_id', label: 'conversations' },
  { table: 'session_insights', column: 'user_id', label: 'conversations' },
  { table: 'user_session_patterns', column: 'user_id', label: 'conversations' },
  // Journals
  { table: 'quick_journal_entries', column: 'user_id', label: 'journal entries' },
  { table: 'elemental_journal_entries', column: 'user_id', label: 'journal entries' },
  { table: 'holoflower_journal_entries', column: 'user_id', label: 'journal entries' },
  // Remembered moments and derived memory
  { table: 'episodic_memories', column: 'user_id', label: 'remembered moments' },
  { table: 'episodes', column: 'user_id', label: 'remembered moments' },
  { table: 'episode_links', column: 'user_id', label: 'remembered moments' },
  { table: 'breakthrough_moments', column: 'user_id', label: 'remembered moments' },
  { table: 'developmental_memories', column: 'user_id', label: 'remembered moments' },
  { table: 'semantic_memory_vectors', column: 'user_id', label: 'remembered moments' },
  { table: 'pattern_connections', column: 'user_id', label: 'remembered moments' },
  { table: 'consciousness_traces', column: 'user_id', label: 'remembered moments' },
  { table: 'consciousness_expansion_events', column: 'user_id', label: 'remembered moments' },
  { table: 'soul_patterns', column: 'user_id', label: 'remembered moments' },
  { table: 'spiral_stage_transitions', column: 'user_id', label: 'remembered moments' },
  // Reflections and written work
  { table: 'reflection_capsules', column: 'user_id', label: 'reflections' },
  { table: 'scribe_sessions', column: 'user_id', label: 'reflections' },
  { table: 'scribe_artifacts', column: 'user_id', label: 'reflections' },
  // Relationships
  { table: 'relationship_essences', column: 'user_id', label: 'people you noted' },
  { table: 'relationship_events', column: 'user_id', label: 'people you noted' },
  { table: 'relationship_patterns', column: 'user_id', label: 'people you noted' },
  { table: 'user_relationship_context', column: 'user_id', label: 'people you noted' },
  // Tasks and reminders
  { table: 'focus_tasks', column: 'user_id', label: 'tasks and reminders' },
  { table: 'focus_reminders', column: 'user_id', label: 'tasks and reminders' },
  { table: 'focus_message_drafts', column: 'user_id', label: 'tasks and reminders' },
  // Preferences the member set
  { table: 'member_preferences', column: 'user_id', label: 'your preferences' },
  { table: 'preference_confirmations', column: 'user_id', label: 'your preferences' },
  // Field and bardic records
  { table: 'resonance_events', column: 'user_id', label: 'field records' },
  { table: 'field_records', column: 'user_id', label: 'field records' },
  { table: 'teloi', column: 'user_id', label: 'field records' },
  { table: 'bardic_teloi', column: 'user_id', label: 'field records' },
  { table: 'bardic_links', column: 'user_id', label: 'field records' },
  { table: 'bardic_cues', column: 'user_id', label: 'field records' },
  // Records that your writing was shown to MAIA.
  // ⭐ Named here DELIBERATELY. The Focus disclosure receipt is content-free and
  // has no automatic pruning, so without this line it would survive account
  // deletion the way audit_logs does — by nobody having listed it.
  // Retention may be shared by decision. It may not be shared by accident.
  // (docs/programme/FOCUS-DISCLOSURE-RECEIPT_CONTRACT_2026-09-09.md §5)
  { table: 'context_disclosure_receipts', column: 'member_id', label: 'records of when your context was shown to MAIA' },
];

/**
 * R4J: this route has NO authority to complete an automatic account deletion
 * until independent R20 signer/outbox and sealed recovery are qualified.
 * A passing known-table count is not a global SQL/Source/backup inventory.
 * No runtime flag or supplied client field is allowed to bypass this hold.
 */
const R20_ACCOUNT_ERASURE_NOT_QUALIFIED = true as const;

class R4jPrivacyPreflightUnavailable extends Error {
  constructor() {
    super('governed_content_preflight_unavailable');
    this.name = 'R4jPrivacyPreflightUnavailable';
  }
}

/**
 * Count governed content for a member, aggregated into member-legible
 * categories. Read-only — this function never mutates anything, which is the
 * property that makes a refused request safe to retry.
 */
async function governedContentFor(memberId: string): Promise<Array<{ label: string; rows: number }>> {
  const byLabel = new Map<string, number>();
  for (const { table, column, label } of GOVERNED_CONTENT) {
    let result: { rows: Array<{ n: string }> };
    try {
      // Identifiers originate only from the source-owned static allowlist;
      // $1 is always the credential-verified member, never a body claim.
      result = await query<{ n: string }>(
        `SELECT count(*)::text AS n FROM ${table} WHERE ${column} = $1`,
        [memberId],
      );
    } catch (error) {
      // Missing relation, wrong column, lost permission, timeout and outage
      // all mean we CANNOT establish what member material may exist.
      // No user content, SQL error payload or member ID is logged.
      console.error('[R4J] governed content preflight unavailable', {
        category: 'account_erasure',
        sourceTable: table,
        errorType: error instanceof Error ? error.name : 'unknown',
      });
      throw new R4jPrivacyPreflightUnavailable();
    }

    // A malformed count must never be interpreted as zero.
    const raw = result.rows?.length === 1 ? result.rows[0]?.n : undefined;
    if (typeof raw !== 'string' || !/^(0|[1-9][0-9]*)$/.test(raw)) {
      throw new R4jPrivacyPreflightUnavailable();
    }
    const rows = Number(raw);
    if (!Number.isSafeInteger(rows) || rows < 0) {
      throw new R4jPrivacyPreflightUnavailable();
    }
    if (rows > 0) byLabel.set(label, (byLabel.get(label) ?? 0) + rows);
  }
  return [...byLabel.entries()].map(([label, rows]) => ({ label, rows }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const { memberId: claimedMemberId, confirmUsername } = body ?? {};

    // 1. The actor comes from a verified session — never from the request body.
    //    getMemberIdFromRequest resolves an auth_sessions-backed credential and
    //    already rejects a mismatched x-member-id claim as impersonation.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. A body-supplied id is not an input. If one is present and disagrees
    //    with the session, refuse — before any lookup or deletion runs.
    if (
      typeof claimedMemberId === 'string' &&
      claimedMemberId.length > 0 &&
      claimedMemberId !== memberId
    ) {
      return NextResponse.json(
        { error: 'You may only delete your own account' },
        { status: 403 },
      );
    }

    // 3. Confirmation is compared against the SESSION-derived member's
    //    authoritative username. This is a destructive-action confirmation, not
    //    an authorization control — authorization was settled in step 1.
    const memberResult = await query<{ username: string }>(
      `SELECT username FROM members WHERE id = $1`,
      [memberId],
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (confirmUsername !== memberResult.rows[0].username) {
      return NextResponse.json(
        { error: 'Username confirmation does not match' },
        { status: 400 },
      );
    }

    // 3b. Fail closed if a single governed-content table cannot be read.
    // This is still only a partial inventory, not an erasure certificate.
    const governed = await governedContentFor(memberId);

    // 4. Even when known inventory looks empty, there is no independently
    // secured deletion outbox, R20 signer or non-resurrecting SQL/Source restore.
    // The old member-deleting transaction is intentionally removed rather
    // than hidden behind a mutable environment flag.
    if (R20_ACCOUNT_ERASURE_NOT_QUALIFIED) {
      return NextResponse.json(
        {
          error: 'deletion_incomplete_unavailable',
          message:
            "We can't complete full account deletion automatically yet. " +
            'Your account and content have not been changed. ' +
            'Please contact support for a safely governed deletion request.',
          accountChanged: false,
          nextStep: 'contact_support',
          retained: governed,
        },
        { status: 409, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    // Defensive unreachable fallback. Source reviewers must never interpret
    // the count results as authorization to delete a member.
    return NextResponse.json(
      { error: 'deletion_not_authorized', accountChanged: false },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    if (error instanceof R4jPrivacyPreflightUnavailable) {
      return NextResponse.json(
        {
          error: 'privacy_preflight_unavailable',
          message:
            'Account deletion is unavailable while required privacy records cannot be verified. ' +
            'Your account and content have not been changed. Please contact support.',
          accountChanged: false,
          nextStep: 'contact_support',
        },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    console.error('[Delete Account API] Request failed', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    return NextResponse.json(
      { error: 'account_deletion_unavailable', accountChanged: false },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
