/**
 * MICROSOFT GRAPH SERVICE
 *
 * OAuth-based Microsoft 365 Calendar integration.
 * Handles event creation, scheduling, and reminders via Microsoft Graph API.
 *
 * Setup required:
 * 1. Register app at https://portal.azure.com → App registrations
 * 2. Add redirect URI: https://soullab.life/api/auth/microsoft/callback
 * 3. Enable API permissions: Calendars.ReadWrite, User.Read, offline_access
 * 4. Create client secret
 * 5. Set env vars: MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET
 *
 * Sovereignty: Data stays in PostgreSQL, Microsoft is execution layer only.
 */

import { query, findOne, insertOne, updateOne } from '@/lib/db/postgres';

// ============================================================================
// Types
// ============================================================================

interface MicrosoftTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
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

interface MicrosoftCalendar {
  id: string;
  name: string;
  color?: string;
  isDefaultCalendar?: boolean;
  canEdit?: boolean;
}

interface StoredCredentials {
  id: string;
  member_id: string;
  provider: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: Date | null;
  calendar_email: string | null;
  default_calendar_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Configuration
// ============================================================================

// Microsoft identity platform endpoints
const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';

const SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'Calendars.ReadWrite',
  'User.Read',
];

function getConfig() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri =
    process.env.MICROSOFT_REDIRECT_URI || 'https://soullab.life/api/auth/microsoft/callback';

  if (!clientId || !clientSecret) {
    console.warn('[MicrosoftGraph] Missing MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET');
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
export function getAuthUrl(memberId: string): string | null {
  const config = getConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    response_mode: 'query',
    state: memberId, // Pass memberId to identify user after callback
    prompt: 'consent', // Force consent to get refresh token
  });

  return `${MICROSOFT_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<MicrosoftTokens | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        scope: SCOPES.join(' '),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[MicrosoftGraph] Token exchange failed:', error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[MicrosoftGraph] Token exchange error:', error);
    return null;
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<MicrosoftTokens | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: SCOPES.join(' '),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[MicrosoftGraph] Token refresh failed:', error);
      return null;
    }

    const tokens = await response.json();
    // Microsoft may return a new refresh token
    return {
      ...tokens,
      refresh_token: tokens.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error('[MicrosoftGraph] Token refresh error:', error);
    return null;
  }
}

// ============================================================================
// Token Storage
// ============================================================================

/**
 * Store tokens for a member
 */
export async function storeTokens(memberId: string, tokens: MicrosoftTokens): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Check if member already has Microsoft credentials
    const existing = await query(
      `SELECT id FROM calendar_credentials WHERE member_id = $1 AND provider = 'microsoft'`,
      [memberId]
    );

    if (existing.rows.length > 0) {
      await query(
        `UPDATE calendar_credentials
         SET access_token = $1, refresh_token = COALESCE($2, refresh_token),
             token_expires_at = $3, updated_at = NOW()
         WHERE member_id = $4 AND provider = 'microsoft'`,
        [tokens.access_token, tokens.refresh_token || null, expiresAt, memberId]
      );
    } else {
      await query(
        `INSERT INTO calendar_credentials
         (member_id, provider, access_token, refresh_token, token_expires_at)
         VALUES ($1, 'microsoft', $2, $3, $4)`,
        [memberId, tokens.access_token, tokens.refresh_token || null, expiresAt]
      );
    }

    console.log(`[MicrosoftGraph] Tokens stored for member ${memberId}`);
  } catch (error) {
    console.error('[MicrosoftGraph] Error storing tokens:', error);
    throw error;
  }
}

/**
 * Get valid access token for a member (refreshing if needed)
 */
export async function getValidAccessToken(memberId: string): Promise<string | null> {
  try {
    const result = await query(
      `SELECT access_token, refresh_token, token_expires_at
       FROM calendar_credentials
       WHERE member_id = $1 AND provider = 'microsoft'`,
      [memberId]
    );

    const creds = result.rows[0];
    if (!creds) {
      console.log(`[MicrosoftGraph] No credentials for member ${memberId}`);
      return null;
    }

    // Check if token is expired (with 5 min buffer)
    const expiresAt = creds.token_expires_at ? new Date(creds.token_expires_at) : new Date(0);
    if (expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
      console.log(`[MicrosoftGraph] Refreshing expired token for member ${memberId}`);

      if (!creds.refresh_token) {
        console.error(`[MicrosoftGraph] No refresh token for member ${memberId}`);
        return null;
      }

      const newTokens = await refreshAccessToken(creds.refresh_token);
      if (!newTokens) {
        console.error(`[MicrosoftGraph] Failed to refresh token for member ${memberId}`);
        return null;
      }

      await storeTokens(memberId, newTokens);
      return newTokens.access_token;
    }

    return creds.access_token;
  } catch (error) {
    console.error('[MicrosoftGraph] Error getting access token:', error);
    return null;
  }
}

/**
 * Check if member has connected Microsoft Calendar
 */
export async function isConnected(memberId: string): Promise<boolean> {
  try {
    const result = await query(
      `SELECT refresh_token FROM calendar_credentials
       WHERE member_id = $1 AND provider = 'microsoft'`,
      [memberId]
    );
    return !!result.rows[0]?.refresh_token;
  } catch (error) {
    return false;
  }
}

/**
 * Disconnect Microsoft Calendar (remove credentials)
 */
export async function disconnect(memberId: string): Promise<boolean> {
  try {
    await query(
      `DELETE FROM calendar_credentials WHERE member_id = $1 AND provider = 'microsoft'`,
      [memberId]
    );
    console.log(`[MicrosoftGraph] Disconnected for member ${memberId}`);
    return true;
  } catch (error) {
    console.error('[MicrosoftGraph] Disconnect error:', error);
    return false;
  }
}

// ============================================================================
// User Info
// ============================================================================

/**
 * Get user's email address from Microsoft Graph
 */
export async function getUserEmail(memberId: string): Promise<string | null> {
  const accessToken = await getValidAccessToken(memberId);
  if (!accessToken) return null;

  try {
    const response = await fetch(`${GRAPH_API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error('[MicrosoftGraph] Failed to get user info');
      return null;
    }

    const user = await response.json();
    const email = user.mail || user.userPrincipalName;

    // Store email for future reference
    if (email) {
      await query(
        `UPDATE calendar_credentials SET calendar_email = $1 WHERE member_id = $2 AND provider = 'microsoft'`,
        [email, memberId]
      );
    }

    return email;
  } catch (error) {
    console.error('[MicrosoftGraph] Error getting user info:', error);
    return null;
  }
}

// ============================================================================
// Calendar API
// ============================================================================

/**
 * List all calendars the user has access to
 */
export async function listCalendars(memberId: string): Promise<MicrosoftCalendar[]> {
  const accessToken = await getValidAccessToken(memberId);
  if (!accessToken) return [];

  try {
    const response = await fetch(`${GRAPH_API_URL}/me/calendars`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error('[MicrosoftGraph] Failed to list calendars');
      return [];
    }

    const data = await response.json();
    return (data.value || []).map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      color: cal.hexColor,
      isDefaultCalendar: cal.isDefaultCalendar || false,
      canEdit: cal.canEdit || true,
    }));
  } catch (error) {
    console.error('[MicrosoftGraph] Error listing calendars:', error);
    return [];
  }
}

/**
 * Create a calendar event
 */
export async function createEvent(
  memberId: string,
  event: CalendarEvent,
  calendarId?: string
): Promise<string | null> {
  const accessToken = await getValidAccessToken(memberId);
  if (!accessToken) {
    console.error('[MicrosoftGraph] No valid access token for event creation');
    return null;
  }

  // Use specified calendar or default
  const calendar = calendarId || 'primary';
  const endpoint =
    calendar === 'primary'
      ? `${GRAPH_API_URL}/me/calendar/events`
      : `${GRAPH_API_URL}/me/calendars/${calendar}/events`;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: event.summary,
        body: {
          contentType: 'text',
          content: event.description || '',
        },
        start: {
          dateTime: event.start.toISOString().slice(0, -1), // Remove Z for Graph API
          timeZone: timezone,
        },
        end: {
          dateTime: event.end.toISOString().slice(0, -1),
          timeZone: timezone,
        },
        location: event.location ? { displayName: event.location } : undefined,
        // Microsoft uses isReminderOn and reminderMinutesBeforeStart
        isReminderOn: true,
        reminderMinutesBeforeStart: 15,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[MicrosoftGraph] Event creation failed:', error);
      return null;
    }

    const result = await response.json();
    console.log(`[MicrosoftGraph] Event created: ${result.id}`);
    return result.id;
  } catch (error) {
    console.error('[MicrosoftGraph] Event creation error:', error);
    return null;
  }
}

/**
 * Update a calendar event
 */
export async function updateEvent(
  memberId: string,
  eventId: string,
  event: Partial<CalendarEvent>,
  calendarId?: string
): Promise<boolean> {
  const accessToken = await getValidAccessToken(memberId);
  if (!accessToken) return false;

  const calendar = calendarId || 'primary';
  const endpoint =
    calendar === 'primary'
      ? `${GRAPH_API_URL}/me/calendar/events/${eventId}`
      : `${GRAPH_API_URL}/me/calendars/${calendar}/events/${eventId}`;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const body: Record<string, any> = {};

    if (event.summary) body.subject = event.summary;
    if (event.description) body.body = { contentType: 'text', content: event.description };
    if (event.start)
      body.start = {
        dateTime: event.start.toISOString().slice(0, -1),
        timeZone: timezone,
      };
    if (event.end)
      body.end = {
        dateTime: event.end.toISOString().slice(0, -1),
        timeZone: timezone,
      };
    if (event.location) body.location = { displayName: event.location };

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return response.ok;
  } catch (error) {
    console.error('[MicrosoftGraph] Event update error:', error);
    return false;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(
  memberId: string,
  eventId: string,
  calendarId?: string
): Promise<boolean> {
  const accessToken = await getValidAccessToken(memberId);
  if (!accessToken) return false;

  const calendar = calendarId || 'primary';
  const endpoint =
    calendar === 'primary'
      ? `${GRAPH_API_URL}/me/calendar/events/${eventId}`
      : `${GRAPH_API_URL}/me/calendars/${calendar}/events/${eventId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.ok || response.status === 404;
  } catch (error) {
    console.error('[MicrosoftGraph] Event delete error:', error);
    return false;
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(
  memberId: string,
  days: number = 7,
  calendarId?: string
): Promise<any[]> {
  const accessToken = await getValidAccessToken(memberId);
  if (!accessToken) return [];

  const calendar = calendarId || 'primary';
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    $filter: `start/dateTime ge '${now.toISOString()}' and start/dateTime le '${end.toISOString()}'`,
    $orderby: 'start/dateTime',
    $top: '50',
  });

  const endpoint =
    calendar === 'primary'
      ? `${GRAPH_API_URL}/me/calendar/events?${params}`
      : `${GRAPH_API_URL}/me/calendars/${calendar}/events?${params}`;

  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error('[MicrosoftGraph] Failed to fetch events');
      return [];
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('[MicrosoftGraph] Error fetching events:', error);
    return [];
  }
}

// ============================================================================
// Export
// ============================================================================

export const MicrosoftGraphService = {
  // OAuth
  getAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  storeTokens,
  getValidAccessToken,
  isConnected,
  disconnect,

  // User
  getUserEmail,

  // Calendar API
  listCalendars,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
};

export default MicrosoftGraphService;
