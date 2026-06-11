// SoulComms — notification preference shapes (client-safe, NO database import).
// Split out from notificationPreferences.ts so the settings panel (a client
// component) can import labels/types without pulling in `pg`.

export type NotificationEventType =
  | 'dm_received'
  | 'mentioned'
  | 'thread_reply'
  | 'channel_activity';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export const NOTIFICATION_EVENT_TYPES: NotificationEventType[] = [
  'dm_received',
  'mentioned',
  'thread_reply',
  'channel_activity',
];

// in_app = the existing Co-lab badge (always default-on). email = live in v1.
// sms + push are defined for the schema/UI shape but are NOT delivered until their
// own activation (sms = carrier + A2P; push = VAPID keys). Both default OFF and stay
// dormant — the prefs API rejects writes and the UI hides the column until configured.
export const NOTIFICATION_CHANNELS: NotificationChannel[] = ['in_app', 'email', 'sms', 'push'];

// Human-readable labels for the settings panel.
export const EVENT_LABELS: Record<NotificationEventType, { title: string; detail: string }> = {
  dm_received: { title: 'Direct messages', detail: 'When someone sends you a DM' },
  mentioned: { title: 'Mentions', detail: 'When someone @-mentions you in a channel' },
  thread_reply: { title: 'Thread replies', detail: 'When someone replies to your message' },
  channel_activity: { title: 'Channel activity', detail: 'Every new message in your channels' },
};

// ── Code-resolved defaults ───────────────────────────────────────────────────
// The product's consent posture. DMs / mentions / thread replies are personal or
// intentional → email ON. Channel activity is ambient → email OFF (opt-in). This
// is the pattern most collaboration tools converge toward: the moment Co-lab
// succeeds, blanket email-per-message gets muted; distinct classes of attention
// get distinct defaults. push (and sms) default OFF for every event — opt-in only.
const DEFAULTS: Record<NotificationEventType, Record<NotificationChannel, boolean>> = {
  dm_received: { in_app: true, email: true, sms: false, push: false },
  mentioned: { in_app: true, email: true, sms: false, push: false },
  thread_reply: { in_app: true, email: true, sms: false, push: false },
  channel_activity: { in_app: true, email: false, sms: false, push: false },
};

export function defaultPreference(
  event: NotificationEventType,
  channel: NotificationChannel
): boolean {
  return DEFAULTS[event]?.[channel] ?? false;
}

export interface ResolvedPreference {
  event_type: NotificationEventType;
  channel: NotificationChannel;
  enabled: boolean;
  isDefault: boolean; // true = no explicit override stored (still on the code default)
}
