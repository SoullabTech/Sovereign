/**
 * Calendar-backed Microsoft Teams meeting — payload + response shaping.
 *
 * Proves the core of the Teams-invite feature without a live tenant: the Graph event is created
 * via the CALENDAR EVENT route with isOnlineMeeting + onlineMeetingProvider (not standalone
 * /onlineMeetings), attendees are mapped to Graph's emailAddress shape, and the Teams join URL is
 * read back from onlineMeeting.joinUrl.
 *
 * Runnable mirror (no jest needed): scripts/repro/teams_online_meeting_proof.mts
 */

import { buildEventPayload, parseCreatedEvent } from '../graphEventPayload';

const baseEvent = {
  summary: 'Studio session — Soullab Team Build',
  description: 'Welcome',
  start: new Date('2026-07-01T17:00:00.000Z'),
  end: new Date('2026-07-01T18:00:00.000Z'),
  location: 'Online',
  attendees: [
    { email: 'cececampbell@gmail.com', name: 'Cece Campbell' },
    { email: 'nathan@soullab.life', name: 'Nathan Kane', type: 'optional' as const },
  ],
  isOnlineMeeting: true,
};

describe('graphEventPayload — calendar-backed Teams meeting', () => {
  it('enables a Teams online meeting on the calendar event', () => {
    const p = buildEventPayload(baseEvent);
    expect(p.isOnlineMeeting).toBe(true);
    expect(p.onlineMeetingProvider).toBe('teamsForBusiness');
  });

  it('maps attendees to Graph emailAddress shape, defaulting type to required', () => {
    const p = buildEventPayload(baseEvent);
    expect(p.attendees).toEqual([
      { emailAddress: { address: 'cececampbell@gmail.com', name: 'Cece Campbell' }, type: 'required' },
      { emailAddress: { address: 'nathan@soullab.life', name: 'Nathan Kane' }, type: 'optional' },
    ]);
  });

  it('sends start/end as Graph dateTime (no trailing Z) plus a timeZone', () => {
    const p = buildEventPayload(baseEvent);
    expect(p.start.dateTime).toBe('2026-07-01T17:00:00.000');
    expect(p.end.dateTime).toBe('2026-07-01T18:00:00.000');
    expect(typeof p.start.timeZone).toBe('string');
  });

  it('omits online-meeting fields when not requested', () => {
    const p = buildEventPayload({ ...baseEvent, isOnlineMeeting: false });
    expect(p.isOnlineMeeting).toBeUndefined();
    expect(p.onlineMeetingProvider).toBeUndefined();
  });

  it('reads the Teams join URL from onlineMeeting.joinUrl', () => {
    const parsed = parseCreatedEvent({
      id: 'AAMkAGI2-evt-123',
      webLink: 'https://outlook.office365.com/owa/?itemid=evt-123',
      onlineMeeting: { joinUrl: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc/0' },
    });
    expect(parsed).toEqual({
      eventId: 'AAMkAGI2-evt-123',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc/0',
      webLink: 'https://outlook.office365.com/owa/?itemid=evt-123',
    });
  });

  it('returns a null joinUrl when the created event has no online meeting', () => {
    const parsed = parseCreatedEvent({ id: 'evt-no-teams' });
    expect(parsed.joinUrl).toBeNull();
    expect(parsed.eventId).toBe('evt-no-teams');
  });
});
