/**
 * Studio session meeting — a thin Studio-domain wrapper over the calendar infrastructure.
 *
 * Layer separation: Microsoft / Graph semantics stay in lib/calendar; Studio semantics
 * (a facilitation session and its participants) stay here. This module maps a Studio session into
 * the calendar-event shape and delegates creation to an INJECTED meeting provider
 * (createOnlineMeetingEvent by default) — so the provider stays swappable and MAIA isn't wired
 * around one vendor.
 *
 * Invite-only: this never admits or joins anyone to a live call. Lobby / admission lives in the
 * provider, not here.
 */

import type { GraphCalendarEvent } from '../calendar/graphEventPayload';
import { createOnlineMeetingEvent } from '../calendar/MicrosoftGraphService';

export interface StudioSessionMeetingInput {
  /** The practitioner's MAIA member id — whose connected calendar the meeting is created on. */
  organizerMemberId: string;
  /** Studio session title → calendar event subject. */
  title: string;
  start: Date;
  end: Date;
  /** Participants to invite (group members / clients). Invite-only — never admitted to a live call here. */
  participants?: Array<{ email: string; name?: string }>;
  /** Optional notes shown in the invite body. */
  notes?: string;
  /** Optional location label (the session is still an online meeting). */
  location?: string;
}

/** The provider boundary: anything that can turn a calendar event into a created online meeting. */
export type MeetingCreator = (
  organizerMemberId: string,
  event: GraphCalendarEvent,
) => Promise<{ eventId: string; joinUrl: string | null; webLink: string | null } | null>;

/** Pure: map a Studio session into the calendar-event shape the Graph layer understands. */
export function buildStudioSessionEvent(input: StudioSessionMeetingInput): GraphCalendarEvent {
  return {
    summary: input.title,
    description: input.notes,
    start: input.start,
    end: input.end,
    location: input.location,
    attendees: input.participants?.map((p) => ({ email: p.email, name: p.name })),
    isOnlineMeeting: true,
  };
}

/**
 * Create the online meeting for a Studio session by delegating to the calendar provider.
 * The provider is injected (default: Teams via createOnlineMeetingEvent) so Studio stays
 * provider-agnostic and this stays unit-testable without a live call.
 */
export async function createStudioSessionMeeting(
  input: StudioSessionMeetingInput,
  createMeeting: MeetingCreator = createOnlineMeetingEvent,
): Promise<{ eventId: string; joinUrl: string | null; webLink: string | null } | null> {
  return createMeeting(input.organizerMemberId, buildStudioSessionEvent(input));
}
