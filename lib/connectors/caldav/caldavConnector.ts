/**
 * CALDAV CONNECTOR
 *
 * Wraps CalDAVService with connector DB integration.
 * Handles credential retrieval, client instantiation, and health tracking.
 */

import { CalDAVService } from '@/lib/calendar/CalDAVService';
import type { CalDAVConfig, CalendarEvent, CalendarSummary } from '@/lib/calendar/CalDAVService';
import { getConnector, upsertConnector, touchLastUsed } from '@/lib/connectors/connectorDb';
import type { CalDAVConnectorConfig, CalDAVMetadata } from './types';

/**
 * Build a CalDAVService client from stored connector config.
 */
export async function getCalDAVClient(
  memberId: string,
  options?: { requireHealthy?: boolean }
): Promise<CalDAVService> {
  const connector = await getConnector(memberId, 'caldav');

  if (!connector || connector.status !== 'connected') {
    throw new Error('CalDAV is not configured');
  }

  if (options?.requireHealthy) {
    const meta = connector.metadata as CalDAVMetadata;
    if (meta.health === 'error') {
      throw new Error('CalDAV connection is unhealthy. Reconfigure in Settings.');
    }
  }

  const config = connector.config as unknown as CalDAVConnectorConfig;
  const password = (connector.configEncrypted?.password as string) ?? '';

  const caldavConfig: CalDAVConfig = {
    serverUrl: config.serverUrl,
    principalUrl: config.principalUrl,
    calendarHomeUrl: config.calendarHomeUrl,
    defaultCalendarUrl: config.defaultCalendarUrl,
    username: config.username,
    password,
  };

  return new CalDAVService(caldavConfig);
}

/**
 * Configure CalDAV connection — validates, discovers calendars, stores.
 */
export async function configureCalDAV(
  memberId: string,
  config: CalDAVConnectorConfig,
  password: string
): Promise<{ calendars: CalendarSummary[] }> {
  // Create service to test + discover
  const service = new CalDAVService({
    serverUrl: config.serverUrl,
    principalUrl: config.principalUrl,
    calendarHomeUrl: config.calendarHomeUrl,
    defaultCalendarUrl: config.defaultCalendarUrl,
    username: config.username,
    password,
  });

  // Test connection
  const test = await service.testConnection();
  if (!test.ok) {
    throw new Error(test.error ?? 'Connection failed');
  }

  // Discover calendars
  let calendars: CalendarSummary[] = [];
  try {
    calendars = await service.discoverCalendars();
  } catch {
    // Discovery may fail on some servers — not fatal
  }

  // If no default calendar set and we found calendars, use the first one
  if (!config.defaultCalendarUrl && calendars.length > 0) {
    config.defaultCalendarUrl = calendars[0].url;
  }

  const metadata: CalDAVMetadata = {
    calendars: calendars.map((c) => ({ url: c.url, displayName: c.displayName, color: c.color })),
    lastVerifiedAt: new Date().toISOString(),
    health: 'ok',
    providerDisplayName: test.displayName,
  };

  // Store connector
  await upsertConnector(memberId, 'caldav', {
    connectorClass: 'credential',
    status: 'connected',
    displayName: `CalDAV — ${config.provider}`,
    capabilities: ['create_calendar_event', 'read_calendar'],
    config: config as unknown as Record<string, unknown>,
    configEncrypted: { password },
    metadata: metadata as unknown as Record<string, unknown>,
  });

  return { calendars };
}

/**
 * List calendars from the CalDAV server.
 */
export async function listMemberCalendars(
  memberId: string,
  password: string
): Promise<CalendarSummary[]> {
  const connector = await getConnector(memberId, 'caldav');
  if (!connector || connector.status !== 'connected') {
    throw new Error('CalDAV is not configured');
  }

  const config = connector.config as unknown as CalDAVConnectorConfig;
  const service = new CalDAVService({
    serverUrl: config.serverUrl,
    calendarHomeUrl: config.calendarHomeUrl,
    username: config.username,
    password,
  });

  return service.discoverCalendars();
}

/**
 * Create an event on the member's default CalDAV calendar.
 */
export async function createMemberEvent(
  memberId: string,
  password: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<string> {
  const connector = await getConnector(memberId, 'caldav');
  if (!connector || connector.status !== 'connected') {
    throw new Error('CalDAV is not configured');
  }

  const config = connector.config as unknown as CalDAVConnectorConfig;
  const service = new CalDAVService({
    serverUrl: config.serverUrl,
    defaultCalendarUrl: config.defaultCalendarUrl,
    username: config.username,
    password,
  });

  const eventId = await service.createEvent(event);
  touchLastUsed(memberId, 'caldav');
  return eventId;
}

/**
 * Set the default calendar URL for a member.
 */
export async function setDefaultCalendar(
  memberId: string,
  calendarUrl: string
): Promise<void> {
  const connector = await getConnector(memberId, 'caldav');
  if (!connector) throw new Error('CalDAV is not configured');

  const config = connector.config as unknown as CalDAVConnectorConfig;
  config.defaultCalendarUrl = calendarUrl;

  await upsertConnector(memberId, 'caldav', {
    connectorClass: 'credential',
    config: config as unknown as Record<string, unknown>,
  });
}
