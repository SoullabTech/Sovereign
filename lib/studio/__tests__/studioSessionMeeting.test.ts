import {
  buildStudioSessionEvent,
  createStudioSessionMeeting,
  type MeetingCreator,
} from '../studioSessionMeeting';

// Tests the Studio-domain wrapper: the pure session→calendar mapping, and the wrapper's delegation
// to an injected provider. No schema, no UI, no live Microsoft call (the provider is mocked).

const base = {
  organizerMemberId: 'member-jondi',
  title: 'Sustained Advanced Tapping — Session 1',
  start: new Date('2026-07-02T17:00:00.000Z'),
  end: new Date('2026-07-02T18:00:00.000Z'),
};

describe('buildStudioSessionEvent — Studio session → calendar-event shape (pure)', () => {
  it('maps title, times, notes, location, participants; marks it an online meeting', () => {
    const ev = buildStudioSessionEvent({
      ...base,
      notes: 'bring your tapping points',
      location: 'Online',
      participants: [{ email: 'nathan@soullab.life', name: 'Nathan' }, { email: 'cece@example.com' }],
    });
    expect(ev.summary).toBe(base.title);
    expect(ev.start).toBe(base.start);
    expect(ev.end).toBe(base.end);
    expect(ev.description).toBe('bring your tapping points');
    expect(ev.location).toBe('Online');
    expect(ev.attendees).toEqual([
      { email: 'nathan@soullab.life', name: 'Nathan' },
      { email: 'cece@example.com' },
    ]);
    expect(ev.isOnlineMeeting).toBe(true);
  });

  it('always marks a Studio session as an online meeting', () => {
    expect(buildStudioSessionEvent({ ...base }).isOnlineMeeting).toBe(true);
  });

  it('leaves attendees undefined when there are no participants', () => {
    expect(buildStudioSessionEvent({ ...base }).attendees).toBeUndefined();
  });
});

describe('createStudioSessionMeeting — delegates to the injected provider (no live call)', () => {
  it('calls the provider with the organizer + mapped event and returns its result', async () => {
    const result = {
      eventId: 'evt-9',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/x',
      webLink: 'https://outlook.office365.com/x',
    };
    const createMeeting = jest.fn() as jest.MockedFunction<MeetingCreator>;
    createMeeting.mockResolvedValue(result);
    const input = { ...base, participants: [{ email: 'nathan@soullab.life' }] };

    const out = await createStudioSessionMeeting(input, createMeeting);

    expect(createMeeting).toHaveBeenCalledTimes(1);
    expect(createMeeting).toHaveBeenCalledWith('member-jondi', buildStudioSessionEvent(input));
    expect(out).toBe(result);
  });

  it('passes a null provider result straight through', async () => {
    const createMeeting = jest.fn() as jest.MockedFunction<MeetingCreator>;
    createMeeting.mockResolvedValue(null);
    expect(await createStudioSessionMeeting({ ...base }, createMeeting)).toBeNull();
  });
});
