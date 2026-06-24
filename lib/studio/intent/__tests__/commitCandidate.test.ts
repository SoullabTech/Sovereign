import { buildCalendarEventPayload } from '../commitCandidate';
import type { CaptureCandidate } from '../parseCapture';

const example: CaptureCandidate = {
  kind: 'calendar_event',
  confidence: 'high',
  title: 'Meeting with Nathan',
  fields: {
    date: '2026-06-20',
    startTime: '10:00',
    person: 'Nathan',
    location: 'Common Ground Coffee Shop',
    city: 'Branford, MA',
    travelNote: '20 minutes away',
  },
};

describe('buildCalendarEventPayload', () => {
  it('maps the canonical example into a calendar writer payload', () => {
    const p = buildCalendarEventPayload(example, { timezone: 'America/New_York' });
    expect(p).not.toBeNull();
    expect(p!.title).toBe('Meeting with Nathan');
    // wall-clock 10:00 preserved in the member's timezone (EDT = -04:00 in June)
    expect(p!.start).toMatch(/^2026-06-20T10:00:00\.000-04:00$/);
    // defaults to a 60-minute block when no end time given
    expect(p!.end).toMatch(/^2026-06-20T11:00:00\.000-04:00$/);
    expect(new Date(p!.start).getTime()).toBeLessThan(new Date(p!.end).getTime());
    expect(p!.allDay).toBe(false);
    expect(p!.location).toBe('Common Ground Coffee Shop, Branford, MA');
    expect(p!.description).toContain('With Nathan');
    expect(p!.description).toContain('Travel: 20 minutes away');
  });

  it('returns null without a date and time (never commits an under-specified event)', () => {
    expect(
      buildCalendarEventPayload({ ...example, fields: { person: 'Nathan' } }, { timezone: 'UTC' }),
    ).toBeNull();
  });

  it('returns null for non-calendar kinds', () => {
    expect(
      buildCalendarEventPayload(
        { kind: 'accompaniment', confidence: 'low', fields: {} },
        { timezone: 'UTC' },
      ),
    ).toBeNull();
  });

  it('falls back to a 60-minute block when end is not after start', () => {
    const p = buildCalendarEventPayload(
      { ...example, fields: { date: '2026-06-20', startTime: '10:00', endTime: '09:00' } },
      { timezone: 'America/New_York' },
    );
    expect(p!.end).toMatch(/T11:00/);
  });
});
