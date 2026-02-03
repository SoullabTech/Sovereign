/**
 * Capture Mode Store
 *
 * Session-based note capture for devlogs and content creation.
 * Stores timestamped notes that export to Descript chapters + Patreon drafts.
 */

import { query } from '@/lib/db/postgres';
import { randomUUID } from 'crypto';

export type CaptureTag = 'ship' | 'fix' | 'decision' | 'blocked' | 'next';

export interface CaptureSession {
  id: string;
  org_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  auto_started: boolean;
  title: string | null;
  created_at: string;
}

export interface CaptureNote {
  id: string;
  session_id: string;
  org_id: string;
  user_id: string;
  created_at: string;
  offset_ms: number;
  tag: CaptureTag;
  text: string;
  meta: Record<string, unknown>;
}

export interface ExportFormat {
  descript_chapters: string;
  patreon_md: string;
}

// Max session duration: 12 hours (prevents offset weirdness)
const MAX_OFFSET_MS = 12 * 60 * 60 * 1000;

/**
 * Start a new capture session
 */
export async function startSession(
  userId: string,
  orgId: string = 'soullab',
  autoStarted: boolean = false
): Promise<CaptureSession> {
  const id = `cap_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  const result = await query<CaptureSession>(`
    INSERT INTO capture_sessions (id, org_id, user_id, auto_started)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [id, orgId, userId, autoStarted]);

  console.log(`🎬 [Capture] Session started: ${id} (auto=${autoStarted})`);
  return result.rows[0];
}

/**
 * Stop an active capture session
 */
export async function stopSession(sessionId: string): Promise<CaptureSession | null> {
  const result = await query<CaptureSession>(`
    UPDATE capture_sessions
    SET ended_at = NOW()
    WHERE id = $1 AND ended_at IS NULL
    RETURNING *
  `, [sessionId]);

  if (result.rows.length === 0) {
    return null;
  }

  console.log(`🎬 [Capture] Session stopped: ${sessionId}`);
  return result.rows[0];
}

/**
 * Get active session for user (if any)
 */
export async function getActiveSession(
  userId: string,
  orgId: string = 'soullab'
): Promise<CaptureSession | null> {
  const result = await query<CaptureSession>(`
    SELECT * FROM capture_sessions
    WHERE user_id = $1 AND org_id = $2 AND ended_at IS NULL
    ORDER BY started_at DESC
    LIMIT 1
  `, [userId, orgId]);

  return result.rows[0] || null;
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<CaptureSession | null> {
  const result = await query<CaptureSession>(`
    SELECT * FROM capture_sessions WHERE id = $1
  `, [sessionId]);

  return result.rows[0] || null;
}

/**
 * Add a note to a capture session
 */
export async function addNote(
  sessionId: string,
  userId: string,
  tag: CaptureTag,
  text: string,
  clientTsMs?: number,
  orgId: string = 'soullab'
): Promise<CaptureNote> {
  // Get session to calculate offset
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  // Calculate offset from session start
  let offsetMs = 0;
  if (clientTsMs) {
    const sessionStartMs = new Date(session.started_at).getTime();
    offsetMs = Math.max(0, Math.min(clientTsMs - sessionStartMs, MAX_OFFSET_MS));
  }

  const id = `note_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  const result = await query<CaptureNote>(`
    INSERT INTO capture_notes (id, session_id, org_id, user_id, offset_ms, tag, text)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [id, sessionId, orgId, userId, offsetMs, tag, text]);

  console.log(`📝 [Capture] Note added: ${tag.toUpperCase()}: ${text.slice(0, 50)}...`);
  return result.rows[0];
}

/**
 * Get all notes for a session
 */
export async function getSessionNotes(sessionId: string): Promise<CaptureNote[]> {
  const result = await query<CaptureNote>(`
    SELECT * FROM capture_notes
    WHERE session_id = $1
    ORDER BY offset_ms ASC, created_at ASC
  `, [sessionId]);

  return result.rows;
}

/**
 * Format milliseconds as timestamp
 * - MM:SS for sessions < 1 hour
 * - HH:MM:SS for sessions >= 1 hour
 */
function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Only show hours if session is >= 1 hour
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Export session in Descript chapters format
 * Format: "MM:SS — TAG — Note text"
 */
export function formatDescriptChapters(notes: CaptureNote[]): string {
  return notes
    .map(note => `${formatTimestamp(note.offset_ms)} — ${note.tag.toUpperCase()} — ${note.text}`)
    .join('\n');
}

/**
 * Export session in Patreon markdown format
 */
export function formatPatreonDraft(
  session: CaptureSession,
  notes: CaptureNote[]
): string {
  const date = new Date(session.started_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const byTag: Record<CaptureTag, CaptureNote[]> = {
    ship: [],
    fix: [],
    decision: [],
    blocked: [],
    next: []
  };

  notes.forEach(note => {
    byTag[note.tag].push(note);
  });

  const sections: string[] = [];

  // Title
  const title = session.title || 'Daily Devlog';
  sections.push(`# ${title}`);
  sections.push(`*${date}*`);
  sections.push('');

  // What shipped
  if (byTag.ship.length > 0) {
    sections.push('## What Shipped');
    byTag.ship.forEach(note => sections.push(`- ${note.text}`));
    sections.push('');
  }

  // Fixes
  if (byTag.fix.length > 0) {
    sections.push('## Fixes');
    byTag.fix.forEach(note => sections.push(`- ${note.text}`));
    sections.push('');
  }

  // Decisions
  if (byTag.decision.length > 0) {
    sections.push('## Decisions Made');
    byTag.decision.forEach(note => sections.push(`- ${note.text}`));
    sections.push('');
  }

  // Blocks
  if (byTag.blocked.length > 0) {
    sections.push('## Blockers');
    byTag.blocked.forEach(note => sections.push(`- ${note.text}`));
    sections.push('');
  }

  // What's next
  if (byTag.next.length > 0) {
    sections.push('## What\'s Next');
    byTag.next.forEach(note => sections.push(`- ${note.text}`));
    sections.push('');
  }

  // Footer
  sections.push('---');
  sections.push('*Questions? Drop them in the comments!*');

  return sections.join('\n');
}

/**
 * Export session in both formats
 */
export async function exportSession(sessionId: string): Promise<ExportFormat | null> {
  const session = await getSession(sessionId);
  if (!session) {
    return null;
  }

  const notes = await getSessionNotes(sessionId);

  return {
    descript_chapters: formatDescriptChapters(notes),
    patreon_md: formatPatreonDraft(session, notes)
  };
}

/**
 * Get recent sessions for a user
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 10,
  orgId: string = 'soullab'
): Promise<CaptureSession[]> {
  const result = await query<CaptureSession>(`
    SELECT * FROM capture_sessions
    WHERE user_id = $1 AND org_id = $2
    ORDER BY started_at DESC
    LIMIT $3
  `, [userId, orgId, limit]);

  return result.rows;
}
