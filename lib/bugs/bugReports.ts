// Bug-report service — the "shared monitor field".
//
// Two surfaces, deliberately split:
//   • bug_reports table  = MEMORY  (status, search, ownership, history) — the source of truth.
//   • #bugs Co-lab channel = ATTENTION (a place already watched) — a lightweight mirror.
//
// createBugReport() persists the row FIRST, then attempts the mirror. The mirror
// is best-effort and never throws back into the caller: a saved report is the
// durable part; a missed chat notice is recoverable. The table owns status; the
// channel owns visibility.
//
// Phase 2 adds: lifecycle states (reviewing/fixed/released), owner_id, linked_pr,
// released_at, and an immutable audit trail echoed to #bug-log on every status
// transition and on every new report.

import { query, queryOne } from '@/lib/db/postgres';
import { getChannelBySlug, sendMessage } from '@/lib/team/ChannelService';
import { parseStoredBugAttachments, toClientBugAttachments } from './attachments';
import { getDefaultTeamId } from '@/lib/team/colabTeams';
import {
  BUG_MIRROR_CHANNEL_SLUG,
  BUG_LOG_CHANNEL_SLUG,
  type BugReport,
  type BugStatus,
  type BugSeverity,
  type BugStatusCounts,
  type CreateBugInput,
  type StoredBugAttachment,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Mapping
// ─────────────────────────────────────────────────────────────────────────────

const iso = (v: unknown): string | null =>
  v instanceof Date ? v.toISOString() : (typeof v === 'string' ? v : null);

function rowToBugReport(row: Record<string, any>): BugReport {
  return {
    id: row.id,
    title: row.title ?? null,
    message: row.message,
    source: row.source,
    memberId: row.member_id ?? null,
    reporterName: row.reporter_name ?? null,
    url: row.url ?? null,
    userAgent: row.user_agent ?? null,
    context: (row.context as Record<string, unknown>) ?? {},
    severity: row.severity as BugSeverity,
    status: row.status as BugStatus,
    resolvedBy: row.resolved_by ?? null,
    resolvedByName: row.resolver_name ?? row.resolver_username ?? null,
    resolvedAt: iso(row.resolved_at),
    adminNote: row.admin_note ?? null,
    mirrorChannelSlug: row.mirror_channel_slug ?? null,
    mirroredMessageId: row.mirrored_message_id ?? null,
    // Stored attachments (with vault storagePath) → client-facing (admin-gated serve URL).
    // storagePath never leaves this mapping, so it never reaches a client.
    attachments: toClientBugAttachments(row.id, parseStoredBugAttachments(row.attachments)),
    ownerId: row.owner_id ?? null,
    ownerName: row.owner_name || row.owner_username || null,
    linkedPr: row.linked_pr ?? null,
    releasedAt: iso(row.released_at),
    createdAt: iso(row.created_at) ?? '',
    updatedAt: iso(row.updated_at) ?? '',
  };
}

async function lookupMemberName(memberId: string): Promise<string | null> {
  const row = await queryOne<{ name: string | null; username: string | null }>(
    `SELECT name, username FROM members WHERE id = $1`,
    [memberId],
  );
  return row ? row.name || row.username || null : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mirror (attention surface)
// ─────────────────────────────────────────────────────────────────────────────

function summarizeUserAgent(ua: string | null): string | null {
  if (!ua) return null;
  const os = /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
      ? 'Android'
      : /Macintosh|Mac OS/i.test(ua)
        ? 'macOS'
        : /Windows/i.test(ua)
          ? 'Windows'
          : null;
  const browser = /CriOS|Chrome|Chromium/i.test(ua)
    ? 'Chrome'
    : /Firefox/i.test(ua)
      ? 'Firefox'
      : /Safari/i.test(ua)
        ? 'Safari'
        : null;
  const parts = [os, browser].filter(Boolean);
  return parts.length ? parts.join(' · ') : ua.slice(0, 60);
}

function buildMirrorBody(bug: BugReport): string {
  const who = bug.reporterName || 'Someone';
  const lines = [`🐞 New bug report from ${who}`];
  if (bug.severity && bug.severity !== 'normal') lines.push(`Severity: ${bug.severity}`);
  lines.push(`Route: ${bug.url || '—'}`);
  const ua = summarizeUserAgent(bug.userAgent);
  if (ua) lines.push(`Browser: ${ua}`);
  // Flag the screenshot count only — the bytes are admin-gated evidence, not posted
  // into the channel (a shot can contain whatever was on the reporter's screen).
  if (bug.attachments.length) {
    lines.push(`📎 ${bug.attachments.length} screenshot${bug.attachments.length === 1 ? '' : 's'} attached`);
  }
  lines.push('');
  const body = bug.message.length > 600 ? `${bug.message.slice(0, 600)}…` : bug.message;
  lines.push(`"${body}"`);
  lines.push('');
  lines.push(`→ /admin/monitor?bug=${bug.id}`);
  return lines.join('\n');
}

/**
 * Best-effort post into the #bugs channel. Returns the new message id (and the
 * channel slug it landed in) on success, or null if the channel is missing,
 * there is no valid sender, or anything throws. NEVER propagates an error.
 *
 * Sender resolution: the reporting member when present, else the channel's
 * creator (every channel has a NOT-NULL created_by). This keeps the post
 * attributable without needing a dedicated "system" member row.
 */
async function mirrorBugToChannel(
  bug: BugReport,
): Promise<{ channelSlug: string; messageId: string } | null> {
  try {
    // #bugs is a system channel that lives in the default Co-Lab workspace.
    const channel = await getChannelBySlug(BUG_MIRROR_CHANNEL_SLUG, await getDefaultTeamId());
    if (!channel) return null;
    const senderId = bug.memberId || channel.createdBy;
    if (!senderId) return null;
    const msg = await sendMessage(channel.id, senderId, buildMirrorBody(bug));
    return { channelSlug: channel.slug, messageId: msg.id };
  } catch (err) {
    console.error('[bugReports] mirror to #bugs failed (non-fatal):', err);
    return null;
  }
}

/**
 * Best-effort post of the initial new-report message into #bug-log.
 * This seeds the immutable audit trail. Does NOT update mirror_channel_slug
 * (that back-reference belongs to #bugs). NEVER propagates an error.
 */
async function logNewBugToAuditChannel(bug: BugReport): Promise<void> {
  try {
    const teamId = await getDefaultTeamId();
    const channel = await getChannelBySlug(BUG_LOG_CHANNEL_SLUG, teamId);
    if (!channel) return;
    const senderId = bug.memberId || channel.createdBy;
    if (!senderId) return;
    await sendMessage(channel.id, senderId, buildMirrorBody(bug));
  } catch (err) {
    console.error('[bugReports] audit-log echo to #bug-log failed (non-fatal):', err);
  }
}

/**
 * Post a status-transition entry to #bug-log. Best-effort, never throws.
 */
async function logTransitionToBugLog(
  bug: BugReport,
  from: string | undefined,
  to: BugStatus,
  linkedPr?: string | null,
): Promise<void> {
  try {
    const teamId = await getDefaultTeamId();
    const channel = await getChannelBySlug(BUG_LOG_CHANNEL_SLUG, teamId);
    if (!channel) return;
    const senderId = bug.memberId || channel.createdBy;
    if (!senderId) return;

    const prefix = to === 'released' ? '🚀 Released' : `🔄 Status: ${from ?? '?'} → ${to}`;
    const excerpt = bug.message.slice(0, 80) || '(screenshot only)';
    const lines = [
      prefix,
      `Bug: ${excerpt}`,
      `→ /admin/monitor?bug=${bug.id}`,
    ];
    if (to === 'fixed' && linkedPr) lines.push(`🔗 PR: ${linkedPr}`);

    await sendMessage(channel.id, senderId, lines.join('\n'));
  } catch (err) {
    console.error('[bugReports] transition log to #bug-log failed (non-fatal):', err);
  }
}

/**
 * Post a PR-linked entry to #bug-log when a PR is attached without a status change.
 * Best-effort, never throws.
 */
async function logPrLinkedToBugLog(bug: BugReport, pr: string): Promise<void> {
  try {
    const teamId = await getDefaultTeamId();
    const channel = await getChannelBySlug(BUG_LOG_CHANNEL_SLUG, teamId);
    if (!channel) return;
    const senderId = bug.memberId || channel.createdBy;
    if (!senderId) return;

    const excerpt = bug.message.slice(0, 80) || '(screenshot only)';
    const body = `🔗 PR linked: ${pr}\nBug: ${excerpt}\n→ /admin/monitor?bug=${bug.id}`;
    await sendMessage(channel.id, senderId, body);
  } catch (err) {
    console.error('[bugReports] PR-link log to #bug-log failed (non-fatal):', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────────────────────

export async function createBugReport(input: CreateBugInput): Promise<BugReport> {
  const source = input.source ?? 'member';
  const severity: BugSeverity = input.severity ?? 'normal';

  let reporterName = input.reporterName ?? null;
  if (!reporterName && source === 'claude') reporterName = 'Claude';
  if (!reporterName && source === 'system') reporterName = 'System';
  if (!reporterName && input.memberId) reporterName = await lookupMemberName(input.memberId);
  if (!reporterName) reporterName = 'Anonymous';

  const result = await query<Record<string, any>>(
    `INSERT INTO bug_reports
       (title, message, source, member_id, reporter_name, url, user_agent, context, severity, attachments)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb)
     RETURNING *`,
    [
      input.title ?? null,
      input.message,
      source,
      input.memberId ?? null,
      reporterName,
      input.url ?? null,
      input.userAgent ?? null,
      JSON.stringify(input.context ?? {}),
      severity,
      JSON.stringify(input.attachments ?? []),
    ],
  );

  const bug = rowToBugReport(result.rows[0]);

  // Attention mirror — best-effort, after the durable write.
  const mirror = await mirrorBugToChannel(bug);
  if (mirror) {
    await query(
      `UPDATE bug_reports SET mirror_channel_slug = $1, mirrored_message_id = $2 WHERE id = $3`,
      [mirror.channelSlug, mirror.messageId, bug.id],
    ).catch((err) => console.error('[bugReports] mirror back-reference update failed (non-fatal):', err));
    bug.mirrorChannelSlug = mirror.channelSlug;
    bug.mirroredMessageId = mirror.messageId;
  }

  // Audit trail — same initial message to #bug-log (fire-and-forget).
  logNewBugToAuditChannel(bug).catch(() => {});

  return bug;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────────────────────────────────

const SELECT_WITH_RESOLVER = `
  SELECT b.*,
    rm.name AS resolver_name, rm.username AS resolver_username,
    om.name AS owner_name, om.username AS owner_username
    FROM bug_reports b
    LEFT JOIN members rm ON rm.id = b.resolved_by
    LEFT JOIN members om ON om.id = b.owner_id`;

export async function getBugReport(id: string): Promise<BugReport | null> {
  const row = await queryOne<Record<string, any>>(`${SELECT_WITH_RESOLVER} WHERE b.id = $1`, [id]);
  return row ? rowToBugReport(row) : null;
}

/**
 * Server-only: resolve one stored attachment (including its vault storagePath) for
 * a bug, for the admin-gated serve route. The storagePath never leaves the server —
 * it is read here, used to stream bytes, and discarded.
 */
export async function getBugAttachmentStored(
  bugId: string,
  attachmentId: string,
): Promise<StoredBugAttachment | null> {
  const row = await queryOne<{ attachments: unknown }>(
    `SELECT attachments FROM bug_reports WHERE id = $1`,
    [bugId],
  );
  if (!row) return null;
  return parseStoredBugAttachments(row.attachments).find((a) => a.id === attachmentId) ?? null;
}

export interface ListBugFilter {
  status?: string;
  source?: string;
  q?: string;
  limit?: number;
}

export async function listBugReports(
  filter: ListBugFilter = {},
): Promise<{ bugs: BugReport[]; counts: BugStatusCounts }> {
  const where: string[] = [];
  const params: any[] = [];
  let i = 1;

  if (filter.status) {
    where.push(`b.status = $${i++}`);
    params.push(filter.status);
  }
  if (filter.source) {
    where.push(`b.source = $${i++}`);
    params.push(filter.source);
  }
  if (filter.q) {
    where.push(`(b.message ILIKE $${i} OR b.title ILIKE $${i})`);
    params.push(`%${filter.q}%`);
    i++;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = Math.min(Math.max(filter.limit ?? 100, 1), 500);
  params.push(limit);

  const result = await query<Record<string, any>>(
    `${SELECT_WITH_RESOLVER} ${whereClause} ORDER BY b.created_at DESC LIMIT $${i}`,
    params,
  );

  // Global status counts (unfiltered) so the tab badges always show the true
  // distribution regardless of the active filter.
  const countRows = await query<{ status: string; n: number }>(
    `SELECT status, COUNT(*)::int AS n FROM bug_reports GROUP BY status`,
  );
  const counts: BugStatusCounts = { new: 0, seen: 0, reviewing: 0, fixed: 0, released: 0, resolved: 0, wont_fix: 0, total: 0 };
  for (const r of countRows.rows) {
    if (r.status in counts) (counts as any)[r.status] = r.n;
    counts.total += r.n;
  }

  return { bugs: result.rows.map(rowToBugReport), counts };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update (admin)
// ─────────────────────────────────────────────────────────────────────────────

export interface BugPatch {
  status?: BugStatus;
  severity?: BugSeverity;
  adminNote?: string;
  resolvedBy?: string | null;
  ownerId?: string | null;
  linkedPr?: string | null;
}

export async function updateBugReport(id: string, patch: BugPatch): Promise<BugReport | null> {
  const sets: string[] = [];
  const params: any[] = [];
  let i = 1;

  // Capture prior state before mutating, so we can emit audit entries after.
  let fromStatus: string | undefined;
  if (patch.status !== undefined) {
    const prev = await queryOne<{ status: string; owner_id: string | null }>(
      'SELECT status, owner_id FROM bug_reports WHERE id = $1',
      [id],
    );
    fromStatus = prev?.status;

    sets.push(`status = $${i++}`);
    params.push(patch.status);
    // Terminal statuses stamp resolved_at/released_at once; non-terminal clears them.
    if (patch.status === 'resolved' || patch.status === 'wont_fix') {
      sets.push(`resolved_at = COALESCE(resolved_at, now())`);
    } else if (patch.status === 'released') {
      sets.push(`released_at = COALESCE(released_at, now())`);
      sets.push(`resolved_at = NULL`);
      sets.push(`resolved_by = NULL`);
    } else {
      // new, seen, reviewing, fixed — not terminal; clear both timestamps.
      sets.push(`resolved_at = NULL`);
      sets.push(`released_at = NULL`);
      sets.push(`resolved_by = NULL`);
    }
  }
  if (patch.severity !== undefined) {
    sets.push(`severity = $${i++}`);
    params.push(patch.severity);
  }
  if (patch.adminNote !== undefined) {
    sets.push(`admin_note = $${i++}`);
    params.push(patch.adminNote);
  }
  if (patch.resolvedBy !== undefined) {
    sets.push(`resolved_by = $${i++}`);
    params.push(patch.resolvedBy);
  }
  if (patch.ownerId !== undefined) {
    sets.push(`owner_id = $${i++}`);
    params.push(patch.ownerId);
  }
  if (patch.linkedPr !== undefined) {
    sets.push(`linked_pr = $${i++}`);
    params.push(patch.linkedPr);
  }

  if (sets.length === 0) return getBugReport(id);

  sets.push(`updated_at = now()`);
  params.push(id);

  const updated = await query<{ id: string }>(
    `UPDATE bug_reports SET ${sets.join(', ')} WHERE id = $${i} RETURNING id`,
    params,
  );
  if (updated.rowCount === 0) return null;

  // Re-read with the resolver/owner join so the caller gets resolved names.
  const bug = await getBugReport(id);
  if (!bug) return null;

  // Audit trail — fire-and-forget, never blocks the caller.
  const statusChanged = patch.status !== undefined && patch.status !== fromStatus;
  if (statusChanged) {
    logTransitionToBugLog(bug, fromStatus, patch.status!, patch.linkedPr).catch(() => {});
  } else if (patch.linkedPr != null && patch.linkedPr !== '') {
    // PR linked without a status change → standalone audit entry.
    logPrLinkedToBugLog(bug, patch.linkedPr).catch(() => {});
  }

  return bug;
}
