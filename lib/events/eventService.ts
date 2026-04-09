/**
 * Event Service
 *
 * Thin data layer for Event Arc. Keeps logic minimal — extend later.
 */

import db from '@/lib/db/postgres';
import { deriveEventPhase } from './eventPhaseService';
import type {
  ActiveEventContext,
  EventAttendeeRecord,
  EventPhase,
  EventRecord,
} from './types';

/**
 * Post-event integration window. After end_date + this many days,
 * MAIA stops treating the event as "active" for context purposes.
 */
const POST_EVENT_WINDOW_DAYS = 14;

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  const result = await db.query<EventRecord>(
    `SELECT * FROM events WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return result.rows[0] ?? null;
}

export async function getEventById(eventId: string): Promise<EventRecord | null> {
  const result = await db.query<EventRecord>(
    `SELECT * FROM events WHERE id = $1 LIMIT 1`,
    [eventId]
  );
  return result.rows[0] ?? null;
}

export async function listPractitionerEvents(
  practitionerId: string
): Promise<EventRecord[]> {
  const result = await db.query<EventRecord>(
    `SELECT * FROM events
     WHERE practitioner_id = $1
     ORDER BY start_date ASC`,
    [practitionerId]
  );
  return result.rows;
}

export async function registerAttendee(params: {
  eventId: string;
  memberId?: string | null;
  email: string;
  fullName?: string | null;
}): Promise<EventAttendeeRecord> {
  const { eventId, memberId, email, fullName } = params;

  const result = await db.query<EventAttendeeRecord>(
    `INSERT INTO event_attendees (event_id, member_id, email, full_name, status)
     VALUES ($1, $2, $3, $4, 'registered')
     ON CONFLICT (event_id, email)
     DO UPDATE SET
       member_id = COALESCE($2, event_attendees.member_id),
       full_name = COALESCE($4, event_attendees.full_name),
       updated_at = NOW()
     RETURNING *`,
    [eventId, memberId ?? null, email, fullName ?? null]
  );

  return result.rows[0];
}

/**
 * Active event context for a member.
 *
 * Priority order:
 *   1. 'during' event (highest — currently in the field)
 *   2. Most recent 'pre' event (preparation phase)
 *   3. Most recent 'post' event within POST_EVENT_WINDOW_DAYS (integration)
 *
 * Returns null if no relevant event. Graceful fallback on error is the
 * caller's responsibility — this function may throw.
 */
export async function getMemberActiveEventContext(
  memberId: string
): Promise<ActiveEventContext | null> {
  // Fetch all events this member is attending (non-cancelled).
  // Use the idx_event_attendees_member_active index.
  const result = await db.query<{
    event_id: string;
    title: string;
    start_date: string;
    end_date: string;
    practitioner_id: string;
  }>(
    `SELECT e.id as event_id, e.title, e.start_date, e.end_date, e.practitioner_id
     FROM event_attendees ea
     JOIN events e ON e.id = ea.event_id
     WHERE ea.member_id = $1
       AND ea.status NOT IN ('cancelled')
       AND e.status IN ('open', 'closed')
       AND e.end_date >= CURRENT_DATE - ($2 || ' days')::interval`,
    [memberId, POST_EVENT_WINDOW_DAYS]
  );

  if (result.rows.length === 0) return null;

  const now = new Date();

  // Classify each event by phase.
  type Scored = {
    event: typeof result.rows[0];
    phase: EventPhase;
    priority: number;
    sortKey: number;
  };

  const scored: Scored[] = result.rows.map((event) => {
    const phase = deriveEventPhase(event.start_date, event.end_date, now);
    // Priority: during(1) > pre(2) > post(3)
    const priority = phase === 'during' ? 1 : phase === 'pre' ? 2 : 3;
    // Within same priority: sort by proximity to now
    // during: most recently started; pre: soonest start; post: most recent end
    let sortKey = 0;
    if (phase === 'during') {
      sortKey = -new Date(event.start_date).getTime();
    } else if (phase === 'pre') {
      sortKey = new Date(event.start_date).getTime();
    } else {
      sortKey = -new Date(event.end_date).getTime();
    }
    return { event, phase, priority, sortKey };
  });

  scored.sort((a, b) => a.priority - b.priority || a.sortKey - b.sortKey);
  const winner = scored[0];
  if (!winner) return null;

  // Normalize dates to YYYY-MM-DD strings (Postgres DATE returns as Date object)
  const normalizeDate = (d: string | Date): string => {
    if (d instanceof Date) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return d.slice(0, 10);
  };

  return {
    eventId: winner.event.event_id,
    title: winner.event.title,
    phase: winner.phase,
    startDate: normalizeDate(winner.event.start_date),
    endDate: normalizeDate(winner.event.end_date),
    practitionerId: winner.event.practitioner_id,
  };
}
