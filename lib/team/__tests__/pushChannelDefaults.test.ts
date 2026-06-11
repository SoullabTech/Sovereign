import {
  defaultPreference,
  NOTIFICATION_EVENT_TYPES,
  NOTIFICATION_CHANNELS,
} from '../notificationTypes';

describe('push channel — schema shape + default OFF', () => {
  it('registers push as a known channel', () => {
    expect(NOTIFICATION_CHANNELS).toContain('push');
  });

  it('defaults push = false for EVERY event (opt-in only)', () => {
    for (const event of NOTIFICATION_EVENT_TYPES) {
      expect(defaultPreference(event, 'push')).toBe(false);
    }
  });

  it('does not disturb existing email defaults', () => {
    expect(defaultPreference('dm_received', 'email')).toBe(true);
    expect(defaultPreference('channel_activity', 'email')).toBe(false);
  });
});
