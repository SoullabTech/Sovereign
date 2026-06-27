/**
 * Pure Microsoft Graph calendar-event payload helpers.
 *
 * Extracted from MicrosoftGraphService so the request/response shaping for a calendar-backed
 * Teams meeting can be unit-tested WITHOUT the database. There are deliberately no '@/...'
 * imports here, so a raw `node --experimental-strip-types` proof can import this module directly.
 *
 * Calendar-backed online meeting (NOT standalone /onlineMeetings): setting isOnlineMeeting +
 * onlineMeetingProvider on the calendar event makes it show on attendees' calendars and only
 * requires the already-granted Calendars.ReadWrite scope. The Teams join URL comes back on the
 * created event's onlineMeeting.joinUrl.
 */

export interface GraphCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  /** Optional HTML body (e.g. to embed the join link). Takes precedence over description. */
  bodyHtml?: string;
  start: Date;
  end: Date;
  location?: string;
  /** Invited attendees. Invite-only — never used to join/admit a live call. */
  attendees?: Array<{ email: string; name?: string; type?: 'required' | 'optional' }>;
  /** When true, attach a Microsoft Teams online meeting to the calendar event. */
  isOnlineMeeting?: boolean;
}

/**
 * Build the Microsoft Graph event JSON from a calendar event. Pure & deterministic except for the
 * caller's local timezone (which Graph requires alongside the dateTime).
 */
export function buildEventPayload(event: GraphCalendarEvent): Record<string, any> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const payload: Record<string, any> = {
    subject: event.summary,
    body: {
      contentType: event.bodyHtml ? 'html' : 'text',
      content: event.bodyHtml || event.description || '',
    },
    start: {
      dateTime: event.start.toISOString().slice(0, -1), // Remove Z for Graph API
      timeZone: timezone,
    },
    end: {
      dateTime: event.end.toISOString().slice(0, -1),
      timeZone: timezone,
    },
    // Microsoft uses isReminderOn and reminderMinutesBeforeStart
    isReminderOn: true,
    reminderMinutesBeforeStart: 15,
  };

  if (event.location) {
    payload.location = { displayName: event.location };
  }

  if (event.attendees && event.attendees.length > 0) {
    payload.attendees = event.attendees.map((a) => ({
      emailAddress: { address: a.email, name: a.name || a.email },
      type: a.type || 'required',
    }));
  }

  if (event.isOnlineMeeting) {
    payload.isOnlineMeeting = true;
    payload.onlineMeetingProvider = 'teamsForBusiness';
  }

  return payload;
}

/**
 * Parse a created Graph event into the fields Studio stores: the event id, the Teams join URL
 * (from onlineMeeting.joinUrl), and the Outlook web link.
 */
export function parseCreatedEvent(
  result: any
): { eventId: string; joinUrl: string | null; webLink: string | null } {
  return {
    eventId: result?.id,
    joinUrl: result?.onlineMeeting?.joinUrl || null,
    webLink: result?.webLink || null,
  };
}
