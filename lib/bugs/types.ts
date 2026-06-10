// Bug-report types + constants. Client-safe: NO server imports here, so the
// in-app Report button (a client component) can pull severities without
// dragging the DB/service layer into the browser bundle.

export type BugSource = 'member' | 'claude' | 'system';
export type BugSeverity = 'low' | 'normal' | 'high' | 'critical';
export type BugStatus = 'new' | 'seen' | 'resolved' | 'wont_fix';

export const BUG_SEVERITIES: BugSeverity[] = ['low', 'normal', 'high', 'critical'];
export const BUG_STATUSES: BugStatus[] = ['new', 'seen', 'resolved', 'wont_fix'];

// The Co-lab channel the attention-mirror posts into. Seeded by
// 20260610000001_bug_reports.sql.
export const BUG_MIRROR_CHANNEL_SLUG = 'bugs';

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
}

export interface BugStatusCounts {
  new: number;
  seen: number;
  resolved: number;
  wont_fix: number;
  total: number;
}
