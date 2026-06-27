import { buildEventPayload, parseCreatedEvent } from '../graphEventPayload';

// Unit tests for the pure Graph calendar-event helpers (the Studio-central Teams adapter's
// request/response shaping). Pure — no network, no DB, no live Microsoft call. Proves the
// Teams meeting + attendee-invite payload is formed correctly, that a normal event never
// silently becomes a Teams meeting, and that the join URL is parsed back for Studio to store.

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const base = {
  summary: 'Soullab Team Build',
  start: new Date('2026-07-01T15:00:00.000Z'),
  end: new Date('2026-07-01T16:00:00.000Z'),
};

describe('buildEventPayload — Graph event / Teams-meeting request body', () => {
  it('maps subject + start/end (trailing Z stripped, resolved tz) + default reminder', () => {
    const p = buildEventPayload({ ...base });
    expect(p.subject).toBe('Soullab Team Build');
    expect(p.start).toEqual({ dateTime: '2026-07-01T15:00:00.000', timeZone: tz });
    expect(p.end).toEqual({ dateTime: '2026-07-01T16:00:00.000', timeZone: tz });
    expect(p.isReminderOn).toBe(true);
    expect(p.reminderMinutesBeforeStart).toBe(15);
  });

  it('prefers bodyHtml over description', () => {
    expect(buildEventPayload({ ...base, description: 'plain', bodyHtml: '<b>x</b>' }).body)
      .toEqual({ contentType: 'html', content: '<b>x</b>' });
    expect(buildEventPayload({ ...base, description: 'plain' }).body)
      .toEqual({ contentType: 'text', content: 'plain' });
  });

  it('maps attendees to the Graph emailAddress shape (name→email fallback, type→required default)', () => {
    const p = buildEventPayload({
      ...base,
      attendees: [
        { email: 'nathan@soullab.life' },
        { email: 'cece@example.com', name: 'Cece', type: 'optional' },
      ],
    });
    expect(p.attendees).toEqual([
      { emailAddress: { address: 'nathan@soullab.life', name: 'nathan@soullab.life' }, type: 'required' },
      { emailAddress: { address: 'cece@example.com', name: 'Cece' }, type: 'optional' },
    ]);
  });

  it('omits the attendees key entirely when none are given', () => {
    expect(buildEventPayload({ ...base })).not.toHaveProperty('attendees');
  });

  it('attaches a Teams online meeting ONLY when isOnlineMeeting is true', () => {
    const on = buildEventPayload({ ...base, isOnlineMeeting: true });
    expect(on.isOnlineMeeting).toBe(true);
    expect(on.onlineMeetingProvider).toBe('teamsForBusiness');

    // A normal event must never silently become a Teams meeting.
    const off = buildEventPayload({ ...base });
    expect(off).not.toHaveProperty('isOnlineMeeting');
    expect(off).not.toHaveProperty('onlineMeetingProvider');
  });

  it('maps location to displayName', () => {
    expect(buildEventPayload({ ...base, location: 'Studio' }).location)
      .toEqual({ displayName: 'Studio' });
  });
});

describe('parseCreatedEvent — Graph response → fields Studio stores', () => {
  it('extracts eventId, Teams joinUrl, and webLink from a created Teams event', () => {
    expect(parseCreatedEvent({
      id: 'evt-123',
      webLink: 'https://outlook.office365.com/evt-123',
      onlineMeeting: { joinUrl: 'https://teams.microsoft.com/l/meetup-join/xyz' },
    })).toEqual({
      eventId: 'evt-123',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/xyz',
      webLink: 'https://outlook.office365.com/evt-123',
    });
  });

  it('returns null joinUrl when the event has no online meeting', () => {
    expect(parseCreatedEvent({ id: 'evt-1', webLink: 'w' }))
      .toEqual({ eventId: 'evt-1', joinUrl: null, webLink: 'w' });
  });

  it('returns null webLink when absent', () => {
    expect(parseCreatedEvent({ id: 'evt-1' }).webLink).toBeNull();
  });
});
