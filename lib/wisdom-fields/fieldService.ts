/**
 * Wisdom Fields Service — CRUD operations
 *
 * All queries enforce member_id scoping where applicable.
 * Uses lib/db/postgres.ts (NOT Supabase).
 *
 * Design law: "The intelligence here arises through the
 * community's encounter with the work itself."
 */

import { query, queryOne, transaction } from '@/lib/db/postgres';
import type {
  WisdomFieldRow,
  WisdomFieldMembershipRow,
  WisdomFieldWorkRow,
  WisdomFieldCoreIdeaRow,
  WisdomFieldContributionRow,
  WisdomFieldReplyRow,
  WisdomFieldEvolutionEntryRow,
  ContributionType,
} from './types';

// ── Field queries ────────────────────────────────────────────────

/**
 * List all active fields, optionally filtered by type.
 * Public — no auth required for listing.
 */
export async function listFields(fieldType?: 'wisdom_keeper' | 'masters_field') {
  const params: string[] = [];
  const where = fieldType
    ? `WHERE wf.status = 'active' AND wf.field_type = $${params.push(fieldType)}`
    : `WHERE wf.status = 'active'`;

  const result = await query(
    `SELECT
      wf.id, wf.slug, wf.field_type, wf.ai_posture,
      wf.master_name, wf.master_dates, wf.master_domain,
      wf.orientation, wf.ai_posture_note, wf.visibility,
      COUNT(DISTINCT wfm.id) FILTER (WHERE wfm.status = 'active') AS member_count
    FROM wisdom_fields wf
    LEFT JOIN wisdom_field_memberships wfm ON wfm.field_id = wf.id
    ${where}
    GROUP BY wf.id
    ORDER BY wf.master_name ASC`,
    params
  );

  return result.rows.map(row => ({
    id: row.id,
    slug: row.slug,
    fieldType: row.field_type,
    aiPosture: row.ai_posture,
    masterName: row.master_name,
    masterDates: row.master_dates,
    masterDomain: row.master_domain,
    orientation: row.orientation,
    aiPostureNote: row.ai_posture_note,
    visibility: row.visibility,
    memberCount: Number(row.member_count),
  }));
}

/**
 * Get full field detail by slug, with optional membership status for a member.
 * Returns null if not found or archived.
 */
export async function getFieldBySlug(slug: string, memberId?: string) {
  const field = await queryOne<WisdomFieldRow>(
    `SELECT id, slug, field_type, ai_posture, master_name, master_dates, master_domain,
            orientation, ai_posture_note, visibility, status, created_by, created_at, updated_at
     FROM wisdom_fields
     WHERE slug = $1 AND status = 'active'`,
    [slug]
  );

  if (!field) return null;

  let membership: WisdomFieldMembershipRow | null = null;
  if (memberId) {
    membership = await queryOne<WisdomFieldMembershipRow>(
      `SELECT id, field_id, member_id, role, status, joined_at, updated_at
       FROM wisdom_field_memberships
       WHERE field_id = $1 AND member_id = $2`,
      [field.id, memberId]
    );
  }

  return { field, membership };
}

/**
 * Assert member has active membership in a field.
 * Throws 'FORBIDDEN' if not a member, 'NOT_FOUND' if field missing.
 */
async function requireFieldMembership(
  fieldId: string,
  memberId: string
): Promise<{ field: WisdomFieldRow; membership: WisdomFieldMembershipRow }> {
  const field = await queryOne<WisdomFieldRow>(
    `SELECT id, slug, field_type, ai_posture, master_name, master_dates, master_domain,
            orientation, ai_posture_note, visibility, status, created_by, created_at, updated_at
     FROM wisdom_fields WHERE id = $1 AND status = 'active'`,
    [fieldId]
  );
  if (!field) throw new Error('NOT_FOUND');

  const membership = await queryOne<WisdomFieldMembershipRow>(
    `SELECT id, field_id, member_id, role, status, joined_at, updated_at
     FROM wisdom_field_memberships
     WHERE field_id = $1 AND member_id = $2 AND status = 'active'`,
    [fieldId, memberId]
  );
  if (!membership) throw new Error('FORBIDDEN');

  return { field, membership };
}

// ── Membership ───────────────────────────────────────────────────

/**
 * Join a field. If a left membership exists, reactivates it.
 * For open fields — no token required.
 */
export async function joinField(fieldId: string, memberId: string) {
  const field = await queryOne<WisdomFieldRow>(
    `SELECT id, visibility FROM wisdom_fields WHERE id = $1 AND status = 'active'`,
    [fieldId]
  );
  if (!field) throw new Error('NOT_FOUND');

  return transaction(async (client) => {
    const existing = await client.query(
      `SELECT id, status FROM wisdom_field_memberships
       WHERE field_id = $1 AND member_id = $2`,
      [fieldId, memberId]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.status === 'active') return { alreadyMember: true };
      // Reactivate if previously left
      await client.query(
        `UPDATE wisdom_field_memberships SET status = 'active', updated_at = NOW()
         WHERE id = $1`,
        [row.id]
      );
      return { rejoined: true };
    }

    await client.query(
      `INSERT INTO wisdom_field_memberships (field_id, member_id, role, status)
       VALUES ($1, $2, 'member', 'active')`,
      [fieldId, memberId]
    );
    return { joined: true };
  });
}

// ── Works ────────────────────────────────────────────────────────

/**
 * List Key Works for a field. Public — membership not required.
 */
export async function listFieldWorks(fieldId: string) {
  const result = await query(
    `SELECT id, field_id, title, year, work_type, description, external_url, entry_point, created_at
     FROM wisdom_field_works
     WHERE field_id = $1
     ORDER BY entry_point DESC, year ASC NULLS LAST`,
    [fieldId]
  );
  return result.rows as WisdomFieldWorkRow[];
}

// ── Core Ideas ───────────────────────────────────────────────────

/**
 * List Core Ideas for a field. Public — membership not required.
 */
export async function listFieldCoreIdeas(fieldId: string) {
  const result = await query(
    `SELECT id, field_id, concept, one_line, body, related_concepts, sort_order, created_at
     FROM wisdom_field_core_ideas
     WHERE field_id = $1
     ORDER BY sort_order ASC, concept ASC`,
    [fieldId]
  );
  return result.rows as WisdomFieldCoreIdeaRow[];
}

// ── Contributions ────────────────────────────────────────────────

/**
 * List active (non-revoked) contributions for a field.
 * Requires active membership.
 */
export async function listContributions(
  fieldId: string,
  memberId: string,
  contributionType?: ContributionType
) {
  await requireFieldMembership(fieldId, memberId);

  const params: (string | null)[] = [fieldId];
  const typeFilter = contributionType
    ? `AND fc.contribution_type = $${params.push(contributionType)}`
    : '';

  const result = await query(
    `SELECT
      fc.id, fc.field_id, fc.member_id, fc.contribution_type,
      fc.work_id, fc.source, fc.title, fc.body, fc.created_at,
      m.name AS member_name,
      COUNT(fr.id) FILTER (WHERE fr.revoked_at IS NULL) AS reply_count
    FROM wisdom_field_contributions fc
    LEFT JOIN members m ON m.id = fc.member_id
    LEFT JOIN wisdom_field_replies fr ON fr.contribution_id = fc.id
    WHERE fc.field_id = $1 AND fc.revoked_at IS NULL
    ${typeFilter}
    GROUP BY fc.id, m.name
    ORDER BY fc.created_at DESC`,
    params
  );

  return result.rows.map(row => ({
    id: row.id,
    fieldId: row.field_id,
    memberId: row.member_id,
    memberName: row.member_name,
    contributionType: row.contribution_type,
    workId: row.work_id,
    source: row.source,
    title: row.title,
    body: row.body,
    replyCount: Number(row.reply_count),
    createdAt: row.created_at,
  }));
}

/**
 * Post a contribution to a field.
 * Requires active membership. All contributions must be human-authored.
 */
export async function postContribution(
  fieldId: string,
  memberId: string,
  data: {
    contributionType: ContributionType;
    title?: string | null;
    body: string;
    workId?: string | null;
  }
) {
  await requireFieldMembership(fieldId, memberId);

  const result = await queryOne<WisdomFieldContributionRow>(
    `INSERT INTO wisdom_field_contributions
       (field_id, member_id, contribution_type, title, body, work_id, source)
     VALUES ($1, $2, $3, $4, $5, $6, 'direct')
     RETURNING id, field_id, member_id, contribution_type, title, body, work_id, source, created_at`,
    [fieldId, memberId, data.contributionType, data.title ?? null, data.body, data.workId ?? null]
  );

  return result!;
}

/**
 * List replies for a contribution.
 * Requires active field membership.
 */
export async function listReplies(
  fieldId: string,
  contributionId: string,
  memberId: string
) {
  await requireFieldMembership(fieldId, memberId);

  const result = await query(
    `SELECT fr.id, fr.contribution_id, fr.member_id, fr.body, fr.created_at, m.name AS member_name
     FROM wisdom_field_replies fr
     LEFT JOIN members m ON m.id = fr.member_id
     WHERE fr.contribution_id = $1 AND fr.revoked_at IS NULL
     ORDER BY fr.created_at ASC`,
    [contributionId]
  );

  return result.rows as (WisdomFieldReplyRow & { member_name: string })[];
}

/**
 * Post a reply to a contribution.
 * Requires active field membership.
 */
export async function postReply(
  fieldId: string,
  contributionId: string,
  memberId: string,
  body: string
) {
  await requireFieldMembership(fieldId, memberId);

  const result = await queryOne<WisdomFieldReplyRow>(
    `INSERT INTO wisdom_field_replies (contribution_id, member_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, contribution_id, member_id, body, created_at`,
    [contributionId, memberId, body]
  );

  return result!;
}

// ── Evolution Thread ─────────────────────────────────────────────

/**
 * Get a member's private evolution thread for a field.
 * Returns only their own entries.
 */
export async function getEvolutionThread(fieldId: string, memberId: string) {
  await requireFieldMembership(fieldId, memberId);

  const result = await query(
    `SELECT id, field_id, member_id, body, shared, created_at
     FROM wisdom_field_evolution_entries
     WHERE field_id = $1 AND member_id = $2
     ORDER BY created_at DESC`,
    [fieldId, memberId]
  );

  return result.rows as WisdomFieldEvolutionEntryRow[];
}

/**
 * Add an entry to a member's evolution thread.
 * If shared=true, also creates a contribution row (type=integration, source=evolution_thread).
 */
export async function addEvolutionEntry(
  fieldId: string,
  memberId: string,
  body: string,
  shared: boolean
) {
  await requireFieldMembership(fieldId, memberId);

  return transaction(async (client) => {
    const entryResult = await client.query(
      `INSERT INTO wisdom_field_evolution_entries (field_id, member_id, body, shared)
       VALUES ($1, $2, $3, $4)
       RETURNING id, field_id, member_id, body, shared, created_at`,
      [fieldId, memberId, body, shared]
    );
    const entry = entryResult.rows[0] as WisdomFieldEvolutionEntryRow;

    let contribution = null;
    if (shared) {
      const contribResult = await client.query(
        `INSERT INTO wisdom_field_contributions
           (field_id, member_id, contribution_type, body, source, source_entry_id)
         VALUES ($1, $2, 'integration', $3, 'evolution_thread', $4)
         RETURNING id, contribution_type, body, source, source_entry_id, created_at`,
        [fieldId, memberId, body, entry.id]
      );
      contribution = contribResult.rows[0];
    }

    return { entry, contribution };
  });
}

/**
 * Toggle shared status on an evolution entry.
 * - shared: false → true  creates a contributions row
 * - shared: true → false  does NOT delete the contribution (sovereignty — member retraction handled separately)
 * Member can only toggle their own entries.
 */
export async function setEvolutionEntryShared(
  fieldId: string,
  entryId: string,
  memberId: string,
  shared: boolean
) {
  const entry = await queryOne<WisdomFieldEvolutionEntryRow>(
    `SELECT id, field_id, member_id, body, shared
     FROM wisdom_field_evolution_entries
     WHERE id = $1 AND field_id = $2 AND member_id = $3`,
    [entryId, fieldId, memberId]
  );
  if (!entry) throw new Error('NOT_FOUND');

  return transaction(async (client) => {
    await client.query(
      `UPDATE wisdom_field_evolution_entries SET shared = $1 WHERE id = $2`,
      [shared, entryId]
    );

    // Sharing for the first time — create a contribution
    if (shared && !entry.shared) {
      await client.query(
        `INSERT INTO wisdom_field_contributions
           (field_id, member_id, contribution_type, body, source, source_entry_id)
         VALUES ($1, $2, 'integration', $3, 'evolution_thread', $4)
         ON CONFLICT DO NOTHING`,
        [fieldId, memberId, entry.body, entryId]
      );
    }

    return { entryId, shared };
  });
}
