/**
 * Proposal executor — the SOLE writer for calendar proposals (Art. 2 of
 * docs/canon/MAIA_CONSENT_GATES.md).
 *
 * MAIA's tools construct proposals and have no write capability. Nothing reaches
 * this module except a member-confirmed proposal arriving through the
 * consent-gated confirm route. Do NOT call this from the LLM / turn-generation
 * path — that would defeat the structural enforcement of "never silently act."
 *
 * Events are written scoped to the authenticated member (Art. 3, member-scoped).
 */

import { query } from '@/lib/db/postgres';
import type { CalendarEventPayload } from './types';

export interface ExecutionContext {
  /** Authenticated member id. Events are scoped to them. */
  memberId: string;
}

export interface ExecutedCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
  createdAt: string;
}

/** Thrown on a bad payload; the confirm route maps this to HTTP 400. */
export class ProposalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProposalValidationError';
  }
}

/**
 * Write a member-confirmed calendar-event proposal to their calendar.
 *
 * INTERNAL / LOCAL-ONLY BY GUARANTEE: this path pins sync_status='local_only' and
 * calendar_disclosure='private' so a proposal-created row can never propagate to an
 * external calendar (Gate 0 §1.3 of docs/specs/CALENDAR_AUTHORIZED_ACTION_SPEC_2026-06-18.md).
 * It shares validation with the studio calendar route but DELIBERATELY diverges from it on
 * disclosure/sync — the studio path is external-capable, this one is not. Do not
 * "consolidate" the two write paths back together without revisiting §1.3.
 */
export async function executeCalendarEventProposal(
  payload: CalendarEventPayload,
  ctx: ExecutionContext,
): Promise<ExecutedCalendarEvent> {
  if (!ctx.memberId) {
    throw new ProposalValidationError('memberId is required to execute a proposal');
  }

  const title = (payload?.title ?? '').trim();
  if (!title) {
    throw new ProposalValidationError('title is required');
  }

  const startDate = new Date(payload.start);
  const endDate = new Date(payload.end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ProposalValidationError('Invalid date format. Use ISO 8601.');
  }

  const allDay = payload.allDay ?? false;
  if (!allDay && endDate <= startDate) {
    throw new ProposalValidationError('End time must be after start time.');
  }

  // Gate 0 structural hardening (spec §1.3): pin local-only/private so a proposal-created
  // row cannot escape via the shared calendar_events table — not left to the externally-
  // leaning table defaults (sync_status default 'local_only', calendar_disclosure default
  // 'generic' = would sync as "Busy"). syncEventToCalDAV() short-circuits on 'private'.
  const result = await query(
    `INSERT INTO calendar_events (
       member_id, title, description, start_time, end_time, all_day, location,
       sync_status, calendar_disclosure
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'local_only', 'private')
     RETURNING id, title, description, start_time, end_time, all_day, location, created_at`,
    [
      ctx.memberId,
      title,
      payload.description?.trim() || null,
      startDate.toISOString(),
      endDate.toISOString(),
      allDay,
      payload.location?.trim() || null,
    ],
  );

  const row = result.rows[0];
  if (!row) {
    // query() degrades gracefully (empty rows) when a table is missing.
    throw new Error('calendar event write returned no row (is the calendar_events table present?)');
  }

  // Discoverable runtime marker, consistent with other [MAIA/...] log lines.
  console.log(
    `[MAIA/proposal] calendar event executed { memberIdPrefix: ${ctx.memberId.slice(0, 8)}, eventId: ${row.id} }`,
  );

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    start: row.start_time,
    end: row.end_time,
    allDay: row.all_day,
    location: row.location,
    createdAt: row.created_at,
  };
}
