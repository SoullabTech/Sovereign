/**
 * Writer's Studio pilot roster — pure derivation, no I/O.
 *
 * Answers two founder questions: who has made it in, and who is engaging. It is
 * built from COUNTS AND TIMESTAMPS ONLY. Nothing here reads, stores or returns a
 * word of anyone's writing, a reading's observations, or an Ask turn's body.
 *
 * Stage is derived from positive facts only. A stage never asserts a negative the
 * database cannot prove: "no activity recorded" is not "disengaged". Browsing,
 * reading and time-on-page are not captured anywhere, so they cannot appear here.
 */

export const PILOT_INVITE_NOTE = "Writer's Studio beta tester";

/** Activity inside this window counts as "engaging". */
export const ENGAGING_WINDOW_DAYS = 7;

export type PilotStage =
  | 'invited'
  | 'invite_expired'
  | 'signed_up'
  | 'started_writing'
  | 'engaging';

export type PilotMemberRow = {
  id: string;
  name: string | null;
  username: string | null;
  created_at: string | Date | null;
  last_sign_in: string | Date | null;
  studio_access: boolean | null;
  works: number | string | null;
  revisions: number | string | null;
  revisions_7d: number | string | null;
  last_revision_at: string | Date | null;
  readings: number | string | null;
  last_reading_at: string | Date | null;
  asks: number | string | null;
  last_ask_at: string | Date | null;
};

export type PilotInviteRow = {
  id: string;
  intended_name: string | null;
  intended_email: string | null;
  status: string | null;
  expires_at: string | Date | null;
  created_at: string | Date | null;
};

export type PilotRosterEntry = {
  kind: 'member' | 'invite';
  key: string;
  name: string;
  username: string | null;
  email: string | null;
  stage: PilotStage;
  studioAccess: boolean | null;
  joinedAt: string | null;
  lastSignIn: string | null;
  lastActivityAt: string | null;
  inviteExpiresAt: string | null;
  works: number;
  revisions: number;
  revisions7d: number;
  readings: number;
  asks: number;
};

export type PilotSummary = {
  total: number;
  invited: number;
  inviteExpired: number;
  signedUp: number;
  startedWriting: number;
  engaging: number;
  /** Signed up but not yet given Writer's Studio access: the founder's next act. */
  awaitingAccess: number;
};

function num(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function ms(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

function iso(value: string | Date | null | undefined): string | null {
  const t = ms(value);
  return t === null ? null : new Date(t).toISOString();
}

function latest(...values: Array<string | Date | null | undefined>): string | null {
  let best: number | null = null;
  for (const v of values) {
    const t = ms(v);
    if (t !== null && (best === null || t > best)) best = t;
  }
  return best === null ? null : new Date(best).toISOString();
}

export function deriveMemberStage(row: PilotMemberRow, now: Date): PilotStage {
  const works = num(row.works);
  const revisions = num(row.revisions);
  const readings = num(row.readings);
  const asks = num(row.asks);
  const lastActivity = ms(latest(row.last_revision_at, row.last_reading_at, row.last_ask_at));
  const windowStart = now.getTime() - ENGAGING_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  if (lastActivity !== null && lastActivity >= windowStart) return 'engaging';
  if (works > 0 || revisions > 0 || readings > 0 || asks > 0) return 'started_writing';
  return 'signed_up';
}

export function deriveInviteStage(row: PilotInviteRow, now: Date): PilotStage {
  const expires = ms(row.expires_at);
  if (row.status === 'expired' || (expires !== null && expires < now.getTime())) {
    return 'invite_expired';
  }
  return 'invited';
}

const STAGE_ORDER: Record<PilotStage, number> = {
  engaging: 0,
  started_writing: 1,
  signed_up: 2,
  invited: 3,
  invite_expired: 4,
};

export function buildPilotRoster(
  members: PilotMemberRow[],
  invites: PilotInviteRow[],
  now: Date = new Date(),
): { entries: PilotRosterEntry[]; summary: PilotSummary } {
  const entries: PilotRosterEntry[] = [
    ...members.map<PilotRosterEntry>((row) => ({
      kind: 'member',
      key: row.id,
      name: row.name || row.username || 'Unnamed member',
      username: row.username,
      email: null,
      stage: deriveMemberStage(row, now),
      studioAccess: row.studio_access === true,
      joinedAt: iso(row.created_at),
      lastSignIn: iso(row.last_sign_in),
      lastActivityAt: latest(row.last_revision_at, row.last_reading_at, row.last_ask_at),
      inviteExpiresAt: null,
      works: num(row.works),
      revisions: num(row.revisions),
      revisions7d: num(row.revisions_7d),
      readings: num(row.readings),
      asks: num(row.asks),
    })),
    ...invites.map<PilotRosterEntry>((row) => ({
      kind: 'invite',
      key: row.id,
      name: row.intended_name || row.intended_email || 'Invited writer',
      username: null,
      email: row.intended_email,
      stage: deriveInviteStage(row, now),
      studioAccess: null,
      joinedAt: null,
      lastSignIn: null,
      lastActivityAt: null,
      inviteExpiresAt: iso(row.expires_at),
      works: 0,
      revisions: 0,
      revisions7d: 0,
      readings: 0,
      asks: 0,
    })),
  ];

  entries.sort((a, b) => {
    const byStage = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
    if (byStage !== 0) return byStage;
    const ta = ms(a.lastActivityAt) ?? ms(a.lastSignIn) ?? 0;
    const tb = ms(b.lastActivityAt) ?? ms(b.lastSignIn) ?? 0;
    return tb - ta || a.name.localeCompare(b.name);
  });

  const count = (stage: PilotStage) => entries.filter((e) => e.stage === stage).length;
  return {
    entries,
    summary: {
      total: entries.length,
      invited: count('invited'),
      inviteExpired: count('invite_expired'),
      signedUp: count('signed_up'),
      startedWriting: count('started_writing'),
      engaging: count('engaging'),
      awaitingAccess: entries.filter((e) => e.kind === 'member' && e.studioAccess === false).length,
    },
  };
}
