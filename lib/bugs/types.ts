// Bug-report types + constants. Client-safe: NO server imports here, so the
// in-app Report button (a client component) can pull severities without
// dragging the DB/service layer into the browser bundle.

export type BugSource = 'member' | 'claude' | 'system';
export type BugSeverity = 'low' | 'normal' | 'high' | 'critical';
export type BugStatus = 'new' | 'seen' | 'in_progress' | 'resolved' | 'released' | 'wont_fix';

export const BUG_SEVERITIES: BugSeverity[] = ['low', 'normal', 'high', 'critical'];
export const BUG_STATUSES: BugStatus[] = ['new', 'seen', 'in_progress', 'resolved', 'released', 'wont_fix'];

// The Co-lab channel the attention-mirror posts into. Seeded by
// 20260610000001_bug_reports.sql.
export const BUG_MIRROR_CHANNEL_SLUG = 'bugs';

// Immutable audit trail channel. Every status transition and new report is
// echoed here so that #bug-log is a permanent, chronological record.
export const BUG_LOG_CHANNEL_SLUG = 'bug-log';

// Screenshot evidence attached to a bug report. Two shapes, deliberately split:
//   • StoredBugAttachment — what's persisted in the bug_reports.attachments JSONB.
//     Carries `storagePath` (vault-relative) and is SERVER-ONLY: never serialize it
//     to a client.
//   • BugAttachment — the client-facing shape: storagePath dropped, an admin-gated
//     serve `url` added. This is what rides on BugReport.attachments.
export interface StoredBugAttachment {
  id: string;
  kind: 'image';
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  storagePath: string; // vault-relative; SERVER-ONLY — never sent to clients
}

export interface BugAttachment {
  id: string;
  kind: 'image';
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  url: string; // admin-gated serve URL; the vault storagePath is never exposed
}

export interface BugReport {
  id: string;
  title: string | null;
  message: string;
  source: BugSource;
  memberId: string | null;
  reporterName: string | null;
  url: string | null;
  userAgent: string | null;
  context: Record<string, unknown>;
  severity: BugSeverity;
  status: BugStatus;
  resolvedBy: string | null;
  resolvedByName: string | null;
  resolvedAt: string | null;
  adminNote: string | null;
  mirrorChannelSlug: string | null;
  mirroredMessageId: string | null;
  attachments: BugAttachment[];
  ownerId: string | null;
  ownerName: string | null;
  linkedPr: string | null;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBugInput {
  message: string;
  title?: string | null;
  source?: BugSource;
  memberId?: string | null;
  reporterName?: string | null;
  url?: string | null;
  userAgent?: string | null;
  context?: Record<string, unknown>;
  severity?: BugSeverity;
  attachments?: StoredBugAttachment[];
}

export interface BugStatusCounts {
  new: number;
  seen: number;
  in_progress: number;
  resolved: number;
  released: number;
  wont_fix: number;
  total: number;
}
