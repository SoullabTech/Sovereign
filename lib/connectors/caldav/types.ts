/**
 * CALDAV CONNECTOR TYPES
 *
 * Configuration for CalDAV calendar connections.
 * Supports Proton Calendar, Nextcloud, Fastmail, iCloud, and any CalDAV server.
 */

export type CalDAVProvider = 'proton' | 'nextcloud' | 'fastmail' | 'icloud' | 'other';

/** Per-member CalDAV configuration (stored in service_connectors.config) */
export interface CalDAVConnectorConfig {
  serverUrl: string;                // base or principal URL
  principalUrl?: string;            // discovered via PROPFIND
  calendarHomeUrl?: string;         // where calendars live
  defaultCalendarUrl?: string;      // actual calendar collection URL (canonical ID)
  username: string;
  defaultCalendarId?: string;       // deprecated — use defaultCalendarUrl
  provider: CalDAVProvider;
}

/** Known CalDAV server URLs */
export const CALDAV_PRESETS: Record<CalDAVProvider, {
  serverUrl: string;
  label: string;
  helpText: string;
}> = {
  proton: {
    serverUrl: 'https://calendar.proton.me/api/calendars',
    label: 'Proton Calendar',
    helpText: 'Requires Proton Bridge running locally.',
  },
  nextcloud: {
    serverUrl: '',
    label: 'Nextcloud',
    helpText: 'Use your server URL + /remote.php/dav',
  },
  fastmail: {
    serverUrl: 'https://caldav.fastmail.com/dav',
    label: 'Fastmail',
    helpText: 'Use an app-specific password from Settings > Privacy & Security.',
  },
  icloud: {
    serverUrl: 'https://caldav.icloud.com',
    label: 'iCloud',
    helpText: 'Use an app-specific password from appleid.apple.com.',
  },
  other: {
    serverUrl: '',
    label: 'Other CalDAV Server',
    helpText: 'Enter your CalDAV server URL.',
  },
};

/** Connector metadata shape for health tracking */
export interface CalDAVMetadata {
  calendars?: Array<{
    url: string;
    displayName: string;
    color?: string;
  }>;
  lastVerifiedAt?: string;
  health?: 'ok' | 'error' | 'unknown';
  providerDisplayName?: string;
}
