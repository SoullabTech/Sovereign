/**
 * GOOGLE CALENDAR SERVICE
 *
 * OAuth-based Google Calendar integration for focus tools.
 * Handles event creation, scheduling, and reminders.
 *
 * Setup required:
 * 1. Create project at https://console.cloud.google.com
 * 2. Enable Google Calendar API
 * 3. Create OAuth 2.0 credentials (Web application)
 * 4. Add redirect URI: https://soullab.life/api/auth/google/callback
 * 5. Set env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */

import { query, insertOne, findOne, updateOne } from '@/lib/db/postgres';

// ============================================================================
// Types
// ============================================================================

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
  };
}

interface StoredCredentials {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Configuration
// ============================================================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.send',  // Send emails on user's behalf
  'https://www.googleapis.com/auth/userinfo.email',  // Get user's email address
  'https://www.googleapis.com/auth/contacts.readonly',  // Read contacts for client import
];

function getConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://soullab.life/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    console.warn('[GoogleCalendar] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

// ============================================================================
// OAuth Flow
// ============================================================================

/**
 * Generate the OAuth authorization URL
 */
export function getAuthUrl(userId: string): string | null {
  const config = getConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: userId, // Pass userId to identify user after callback
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[GoogleCalendar] Token exchange failed:', error);
      return null;
    }

    const tokens = await response.json();
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: Date.now() + tokens.expires_in * 1000,
      token_type: tokens.token_type,
      scope: tokens.scope,
    };
  } catch (error) {
    console.error('[GoogleCalendar] Token exchange error:', error);
    return null;
  }
}

/**
 * Refresh an expired access token
 */
// Sentinel indicating the refresh token has been permanently revoked
export const TOKEN_REVOKED = Symbol('TOKEN_REVOKED');

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens | null | typeof TOKEN_REVOKED> {
  const config = getConfig();
  if (!config) return null;

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Detect permanently revoked tokens — stop retrying
      if (errorText.includes('invalid_grant')) {
        console.warn(`[GoogleCalendar] Token permanently revoked (invalid_grant). Will mark as disconnected.`);
        return TOKEN_REVOKED;
      }
      console.error('[GoogleCalendar] Token refresh failed:', errorText);
      return null;
    }

    const tokens = await response.json();
    return {
      access_token: tokens.access_token,
      refresh_token: refreshToken, // Keep original refresh token
      expiry_date: Date.now() + tokens.expires_in * 1000,
      token_type: tokens.token_type,
      scope: tokens.scope,
    };
  } catch (error) {
    console.error('[GoogleCalendar] Token refresh error:', error);
    return null;
  }
}

// ============================================================================
// Token Storage
// ============================================================================

/**
 * Store tokens for a user
 */
export async function storeTokens(userId: string, tokens: GoogleTokens): Promise<void> {
  try {
    // Check if user already has tokens
    const existing = await findOne<StoredCredentials>('google_calendar_credentials', 'user_id', userId);

    if (existing) {
      await updateOne('google_calendar_credentials', existing.id, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || existing.refresh_token,
        expiry_date: tokens.expiry_date,
      });
    } else {
      await insertOne('google_calendar_credentials', {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      });
    }

    console.log(`[GoogleCalendar] Tokens stored for user ${userId}`);
  } catch (error) {
    console.error('[GoogleCalendar] Error storing tokens:', error);
    throw error;
  }
}

/**
 * Get valid access token for a user (refreshing if needed)
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  try {
    const creds = await findOne<StoredCredentials>('google_calendar_credentials', 'user_id', userId);

    if (!creds) {
      console.log(`[GoogleCalendar] No credentials for user ${userId}`);
      return null;
    }

    // Check if token is expired (with 5 min buffer)
    if (creds.expiry_date < Date.now() + 5 * 60 * 1000) {
      console.log(`[GoogleCalendar] Refreshing expired token for user ${userId}`);

      const result = await refreshAccessToken(creds.refresh_token);

      // Token permanently revoked — delete credentials so isConnected() returns false
      if (result === TOKEN_REVOKED) {
        console.warn(`[GoogleCalendar] Marking user ${userId} as disconnected (token revoked). Removing credentials.`);
        await query('DELETE FROM google_calendar_credentials WHERE id = $1', [creds.id]);
        return null;
      }

      if (!result) {
        console.error(`[GoogleCalendar] Failed to refresh token for user ${userId}`);
        return null;
      }

      await storeTokens(userId, result);
      return result.access_token;
    }

    return creds.access_token;
  } catch (error) {
    console.error('[GoogleCalendar] Error getting access token:', error);
    return null;
  }
}

/**
 * Check if user has connected Google Calendar
 */
export async function isConnected(userId: string): Promise<boolean> {
  try {
    const creds = await findOne<StoredCredentials>('google_calendar_credentials', 'user_id', userId);
    return !!creds?.refresh_token;
  } catch (error) {
    console.error('[GoogleCalendar] isConnected error:', error);
    return false;
  }
}

// ============================================================================
// Calendar API
// ============================================================================

interface CalendarInfo {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * List all calendars the user has access to
 */
export async function listCalendars(userId: string): Promise<CalendarInfo[]> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return [];

  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleCalendar] Failed to list calendars:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    return (data.items || []).map((cal: any) => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description,
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor,
    }));
  } catch (error) {
    console.error('[GoogleCalendar] Error listing calendars:', error);
    return [];
  }
}

/**
 * Create a new calendar
 */
export async function createCalendar(
  userId: string,
  name: string,
  description?: string
): Promise<{ id: string; summary: string } | null> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return null;

  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: name,
        description: description || `Created by MAIA`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[GoogleCalendar] Calendar creation failed:', error);
      return null;
    }

    const result = await response.json();
    console.log(`[GoogleCalendar] Calendar created: ${result.id}`);
    return { id: result.id, summary: result.summary };
  } catch (error) {
    console.error('[GoogleCalendar] Calendar creation error:', error);
    return null;
  }
}

/**
 * Create a calendar event
 */
export async function createEvent(
  userId: string,
  event: CalendarEvent,
  calendarId: string = 'primary'
): Promise<string | null> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) {
    console.error('[GoogleCalendar] No valid access token for event creation');
    return null;
  }

  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: event.reminders || {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 10 },
            { method: 'popup', minutes: 30 },
          ],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[GoogleCalendar] Event creation failed:', error);
      return null;
    }

    const result = await response.json();
    console.log(`[GoogleCalendar] Event created: ${result.id}`);
    return result.id;
  } catch (error) {
    console.error('[GoogleCalendar] Event creation error:', error);
    return null;
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(userId: string, maxResults = 10): Promise<any[]> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return [];

  try {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      timeMin: new Date().toISOString(),
      orderBy: 'startTime',
      singleEvents: 'true',
    });

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      console.error('[GoogleCalendar] Failed to fetch events');
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('[GoogleCalendar] Error fetching events:', error);
    return [];
  }
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status: string;
}

/**
 * Get events within a date range across all calendars
 */
export async function getEventsInRange(
  userId: string,
  from: Date,
  to: Date,
  calendarIds?: string[]
): Promise<Array<GoogleCalendarEvent & { calendarId: string; calendarName: string }>> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return [];

  try {
    // Get list of calendars if not specified
    let calendarsToFetch = calendarIds || [];
    if (!calendarIds || calendarIds.length === 0) {
      const calendars = await listCalendars(userId);
      if (calendars.length > 0) {
        // Include ALL calendars the user has access to
        calendarsToFetch = calendars.map(cal => cal.id);
      } else {
        // Fallback to primary if no calendars found
        calendarsToFetch = ['primary'];
      }
    }

    const allEvents: Array<GoogleCalendarEvent & { calendarId: string; calendarName: string }> = [];
    const calendarMap = new Map<string, string>();

    // Get calendar names for display
    const calendars = await listCalendars(userId);
    calendars.forEach(cal => calendarMap.set(cal.id, cal.summary));

    // Fetch events from each calendar in parallel
    const eventPromises = calendarsToFetch.map(async (calendarId) => {
      const params = new URLSearchParams({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        orderBy: 'startTime',
        singleEvents: 'true',
        maxResults: '100',
      });

      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        console.error(`[GoogleCalendar] Failed to fetch events for calendar ${calendarId}:`, response.status);
        return [];
      }

      const data = await response.json();
      const calendarName = calendarMap.get(calendarId) || calendarId;

      return (data.items || [])
        .filter((event: GoogleCalendarEvent) => event.status !== 'cancelled')
        .map((event: GoogleCalendarEvent) => ({
          ...event,
          calendarId,
          calendarName,
        }));
    });

    const results = await Promise.all(eventPromises);
    results.forEach(events => allEvents.push(...events));

    // Sort by start time
    allEvents.sort((a, b) => {
      const aStart = a.start.dateTime || a.start.date || '';
      const bStart = b.start.dateTime || b.start.date || '';
      return aStart.localeCompare(bStart);
    });

    return allEvents;
  } catch (error) {
    console.error('[GoogleCalendar] Error fetching events in range:', error);
    return [];
  }
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(userId: string, eventId: string): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return false;

  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.ok || response.status === 404;
  } catch (error) {
    console.error('[GoogleCalendar] Error deleting event:', error);
    return false;
  }
}

// ============================================================================
// Focus Tools Integration
// ============================================================================

/**
 * Create a focus block (for Next Step Builder "schedule" action)
 */
export async function createFocusBlock(
  userId: string,
  task: string,
  nextStep: string,
  startTime: Date,
  durationMinutes: number,
  calendarId: string = 'primary'
): Promise<string | null> {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  return createEvent(userId, {
    summary: `🎯 ${nextStep}`,
    description: `Focus block for: ${task}\n\nNext step: ${nextStep}\n\nCreated by MAIA Focus`,
    start: startTime,
    end: endTime,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 5 },
        { method: 'popup', minutes: 0 },
      ],
    },
  }, calendarId);
}

/**
 * Create a follow-up reminder event (for Avoidance Breaker)
 */
export async function createFollowUpReminder(
  userId: string,
  recipient: string,
  situation: string,
  followUpDate: Date,
  calendarId: string = 'primary'
): Promise<string | null> {
  // Create a 15-minute reminder block
  const endTime = new Date(followUpDate.getTime() + 15 * 60 * 1000);

  return createEvent(userId, {
    summary: `📬 Follow up with ${recipient}`,
    description: `Situation: ${situation}\n\nThis is your reminder to follow up.\n\nCreated by MAIA Focus`,
    start: followUpDate,
    end: endTime,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 }, // 1 hour before
        { method: 'popup', minutes: 0 },  // At the time
      ],
    },
  }, calendarId);
}

// ============================================================================
// Export
// ============================================================================

export const GoogleCalendarService = {
  // OAuth
  getAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  storeTokens,
  getValidAccessToken,
  isConnected,

  // Calendar API
  listCalendars,
  createCalendar,
  createEvent,
  getUpcomingEvents,
  getEventsInRange,
  deleteEvent,

  // Focus Tools
  createFocusBlock,
  createFollowUpReminder,
};

export default GoogleCalendarService;
