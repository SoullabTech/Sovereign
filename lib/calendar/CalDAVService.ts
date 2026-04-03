/**
 * CALDAV SERVICE
 *
 * Generic CalDAV client for any provider: Proton, Nextcloud, Fastmail, iCloud, etc.
 * Supports calendar discovery, event CRUD, and connection testing.
 *
 * Refactored from AppleCalendarSync.ts to be provider-agnostic.
 */

// Lightweight iCal parsing — no external dependency needed.
// Generation is string-template based; parsing uses regex extraction.

// ─────────────────────────────────────────────────────────────────────────────
// Error types
// ─────────────────────────────────────────────────────────────────────────────

export type CalDAVErrorCode =
  | 'AUTH_FAILED'
  | 'SERVER_UNREACHABLE'
  | 'TIMEOUT'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

export class CalDAVError extends Error {
  code: CalDAVErrorCode;
  statusCode?: number;

  constructor(code: CalDAVErrorCode, message?: string, statusCode?: number) {
    super(message ?? code);
    this.name = 'CalDAVError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CalDAVConfig {
  serverUrl: string;              // base or principal URL
  principalUrl?: string;          // discovered via PROPFIND
  calendarHomeUrl?: string;       // where calendars live
  defaultCalendarUrl?: string;    // actual calendar collection URL (canonical ID)
  username: string;
  password: string;               // app-specific password recommended
  timeoutMs?: number;             // request timeout, default 8000
}

export interface CalendarSummary {
  url: string;                    // canonical ID — the calendar collection URL
  displayName: string;
  description?: string;
  color?: string;
  ctag?: string;                  // change tag for sync detection
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  status: 'confirmed' | 'tentative' | 'cancelled';
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 8000;

export class CalDAVService {
  private config: CalDAVConfig;
  private authHeader: string;
  private timeout: number;

  constructor(config: CalDAVConfig) {
    this.config = config;
    this.authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
    this.timeout = config.timeoutMs ?? DEFAULT_TIMEOUT;
  }

  // ── Request helper with timeout + error normalization ─────────────────────

  private async request(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'Authorization': this.authHeader,
          ...init.headers,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new CalDAVError('AUTH_FAILED', 'Authentication failed. Check username and password.', response.status);
      }
      if (response.status === 404) {
        throw new CalDAVError('NOT_FOUND', `Resource not found: ${url}`, 404);
      }
      if (!response.ok && response.status >= 400) {
        throw new CalDAVError('INVALID_RESPONSE', `Server returned ${response.status}`, response.status);
      }

      return response;
    } catch (err: any) {
      if (err instanceof CalDAVError) throw err;
      if (err.name === 'AbortError') {
        throw new CalDAVError('TIMEOUT', `Request timed out after ${this.timeout}ms`);
      }
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.cause?.code === 'ECONNREFUSED') {
        throw new CalDAVError('SERVER_UNREACHABLE', `Cannot reach ${url}`);
      }
      throw new CalDAVError('UNKNOWN', err.message);
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Connection test ───────────────────────────────────────────────────────

  async testConnection(): Promise<{ ok: boolean; displayName?: string; error?: string }> {
    const url = this.config.defaultCalendarUrl || this.config.serverUrl;

    try {
      const response = await this.request(`${url}${url.endsWith('/') ? '' : '/'}`, {
        method: 'PROPFIND',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Depth': '0',
        },
        body: `<?xml version="1.0" encoding="utf-8" ?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:displayname/>
    <C:calendar-description/>
  </D:prop>
</D:propfind>`,
      });

      const xml = await response.text();
      const nameMatch = xml.match(/<D:displayname[^>]*>([^<]*)<\/D:displayname>/i)
        ?? xml.match(/<displayname[^>]*>([^<]*)<\/displayname>/i);

      return { ok: true, displayName: nameMatch?.[1] ?? undefined };
    } catch (err: any) {
      return { ok: false, error: err.message ?? 'Connection failed' };
    }
  }

  // ── Calendar discovery ────────────────────────────────────────────────────

  async discoverCalendars(): Promise<CalendarSummary[]> {
    const baseUrl = this.config.calendarHomeUrl || this.config.serverUrl;

    const response = await this.request(`${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}`, {
      method: 'PROPFIND',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Depth': '1',
      },
      body: `<?xml version="1.0" encoding="utf-8" ?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/" xmlns:IC="http://apple.com/ns/ical/">
  <D:prop>
    <D:displayname/>
    <C:calendar-description/>
    <D:resourcetype/>
    <IC:calendar-color/>
    <CS:getctag/>
  </D:prop>
</D:propfind>`,
    });

    const xml = await response.text();
    return this.parseCalendarList(xml, baseUrl);
  }

  private parseCalendarList(xml: string, baseUrl: string): CalendarSummary[] {
    const calendars: CalendarSummary[] = [];

    // Split by response elements
    const responses = xml.split(/<D:response>|<response>/i).slice(1);

    for (const resp of responses) {
      // Must be a calendar resource
      if (!resp.includes('calendar') || resp.includes('<D:collection/>') && !resp.includes('calendar')) {
        // Check for calendar resourcetype
        if (!resp.match(/resourcetype[^>]*>[\s\S]*?calendar/i)) continue;
      }

      const hrefMatch = resp.match(/<D:href[^>]*>([^<]*)<\/D:href>/i)
        ?? resp.match(/<href[^>]*>([^<]*)<\/href>/i);
      const nameMatch = resp.match(/<D:displayname[^>]*>([^<]*)<\/D:displayname>/i)
        ?? resp.match(/<displayname[^>]*>([^<]*)<\/displayname>/i);
      const descMatch = resp.match(/<C:calendar-description[^>]*>([^<]*)<\/C:calendar-description>/i)
        ?? resp.match(/<calendar-description[^>]*>([^<]*)<\/calendar-description>/i);
      const colorMatch = resp.match(/<IC:calendar-color[^>]*>([^<]*)<\/IC:calendar-color>/i)
        ?? resp.match(/<calendar-color[^>]*>([^<]*)<\/calendar-color>/i);
      const ctagMatch = resp.match(/<CS:getctag[^>]*>([^<]*)<\/CS:getctag>/i)
        ?? resp.match(/<getctag[^>]*>([^<]*)<\/getctag>/i);

      if (!hrefMatch) continue;

      // Resolve relative URL to absolute
      let calUrl = hrefMatch[1];
      if (calUrl.startsWith('/')) {
        const origin = new URL(baseUrl).origin;
        calUrl = `${origin}${calUrl}`;
      } else if (!calUrl.startsWith('http')) {
        calUrl = `${baseUrl.replace(/\/$/, '')}/${calUrl}`;
      }

      calendars.push({
        url: calUrl,
        displayName: nameMatch?.[1] ?? 'Untitled Calendar',
        description: descMatch?.[1] ?? undefined,
        color: colorMatch?.[1] ?? undefined,
        ctag: ctagMatch?.[1] ?? undefined,
      });
    }

    return calendars;
  }

  // ── Event CRUD ────────────────────────────────────────────────────────────

  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const calUrl = this.config.defaultCalendarUrl;
    if (!calUrl) throw new CalDAVError('NOT_FOUND', 'No default calendar configured');

    const reportBody = `<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data>
      <C:comp name="VCALENDAR">
        <C:prop name="VERSION"/>
        <C:comp name="VEVENT">
          <C:prop name="SUMMARY"/>
          <C:prop name="UID"/>
          <C:prop name="DTSTART"/>
          <C:prop name="DTEND"/>
          <C:prop name="DESCRIPTION"/>
          <C:prop name="LOCATION"/>
          <C:prop name="STATUS"/>
          <C:prop name="ATTENDEE"/>
        </C:comp>
      </C:comp>
    </C:calendar-data>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${startDate.toISOString()}" end="${endDate.toISOString()}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

    const response = await this.request(`${calUrl}${calUrl.endsWith('/') ? '' : '/'}`, {
      method: 'REPORT',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Depth': '1',
      },
      body: reportBody,
    });

    const xmlData = await response.text();
    return this.parseCalDAVResponse(xmlData);
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    const calUrl = this.config.defaultCalendarUrl;
    if (!calUrl) throw new CalDAVError('NOT_FOUND', 'No default calendar configured');

    const eventId = this.generateEventId();
    const icalData = this.createICalEvent({ ...event, id: eventId });

    await this.request(`${calUrl}${calUrl.endsWith('/') ? '' : '/'}${eventId}.ics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'If-None-Match': '*',
      },
      body: icalData,
    });

    return eventId;
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    const calUrl = this.config.defaultCalendarUrl;
    if (!calUrl) throw new CalDAVError('NOT_FOUND', 'No default calendar configured');

    const eventUrl = `${calUrl}${calUrl.endsWith('/') ? '' : '/'}${eventId}.ics`;

    // Fetch existing
    const response = await this.request(eventUrl, { method: 'GET' });
    const existingIcal = await response.text();
    const etag = response.headers.get('ETag');

    // Update fields
    const updatedIcal = this.updateICalEvent(existingIcal, event);

    await this.request(eventUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'If-Match': etag || '*',
      },
      body: updatedIcal,
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    const calUrl = this.config.defaultCalendarUrl;
    if (!calUrl) throw new CalDAVError('NOT_FOUND', 'No default calendar configured');

    try {
      await this.request(`${calUrl}${calUrl.endsWith('/') ? '' : '/'}${eventId}.ics`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.code === 'NOT_FOUND') return; // already deleted
      throw err;
    }
  }

  async checkForConflicts(startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    const events = await this.fetchEvents(startTime, endTime);
    return events.filter((event) => {
      const es = new Date(event.startTime);
      const ee = new Date(event.endTime);
      return (startTime >= es && startTime < ee) || (endTime > es && endTime <= ee) || (startTime <= es && endTime >= ee);
    });
  }

  // ── iCal parsing ──────────────────────────────────────────────────────────

  private parseCalDAVResponse(xmlData: string): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const icalMatches = xmlData.match(/<(?:C:)?calendar-data[^>]*>([\s\S]*?)<\/(?:C:)?calendar-data>/gi);
    if (!icalMatches) return events;

    for (const match of icalMatches) {
      const icalData = match.replace(/<[^>]*>/g, '').trim();
      const parsed = this.parseICalEvent(icalData);
      if (parsed) events.push(parsed);
    }
    return events;
  }

  private parseICalEvent(icalData: string): CalendarEvent | null {
    try {
      // Lightweight regex extraction — no ical.js dependency
      const getProp = (name: string): string => {
        const re = new RegExp(`^${name}[;:](.*)$`, 'mi');
        const match = icalData.match(re);
        return match?.[1]?.trim() ?? '';
      };

      const uid = getProp('UID');
      if (!uid) return null;

      const dtstart = getProp('DTSTART');
      const dtend = getProp('DTEND');
      if (!dtstart) return null;

      return {
        id: uid,
        title: getProp('SUMMARY') || 'Untitled Event',
        description: getProp('DESCRIPTION') || '',
        startTime: this.parseICalDate(dtstart),
        endTime: dtend ? this.parseICalDate(dtend) : this.parseICalDate(dtstart),
        location: getProp('LOCATION') || '',
        attendees: [],
        status: this.mapICalStatus(getProp('STATUS')),
      };
    } catch {
      return null;
    }
  }

  private parseICalDate(dateStr: string): Date {
    // Handle both 20260402T140000Z and TZID=...:20260402T140000 formats
    const raw = dateStr.includes(':') ? dateStr.split(':').pop()! : dateStr;
    const cleaned = raw.replace(/[^0-9TZ]/g, '');
    // Convert YYYYMMDDTHHMMSS(Z) to ISO
    const iso = cleaned.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/,
      '$1-$2-$3T$4:$5:$6$7'
    );
    return new Date(iso || dateStr);
  }

  private createICalEvent(event: CalendarEvent): string {
    const now = new Date();
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Soullab//MAIA Sovereign//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}
DTSTART:${this.formatDateForICal(new Date(event.startTime))}
DTEND:${this.formatDateForICal(new Date(event.endTime))}
DTSTAMP:${this.formatDateForICal(now)}
CREATED:${this.formatDateForICal(now)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
STATUS:${this.mapStatusToICal(event.status)}
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  }

  private updateICalEvent(existingIcal: string, updates: Partial<CalendarEvent>): string {
    let updated = existingIcal;
    if (updates.title) updated = updated.replace(/SUMMARY:.*$/m, `SUMMARY:${updates.title}`);
    if (updates.description) updated = updated.replace(/DESCRIPTION:.*$/m, `DESCRIPTION:${updates.description}`);
    if (updates.startTime) updated = updated.replace(/DTSTART:.*$/m, `DTSTART:${this.formatDateForICal(updates.startTime)}`);
    if (updates.endTime) updated = updated.replace(/DTEND:.*$/m, `DTEND:${this.formatDateForICal(updates.endTime)}`);
    return updated;
  }

  private formatDateForICal(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private generateEventId(): string {
    return `maia-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@soullab.life`;
  }

  private mapICalStatus(status: string): 'confirmed' | 'tentative' | 'cancelled' {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'confirmed';
      case 'TENTATIVE': return 'tentative';
      case 'CANCELLED': return 'cancelled';
      default: return 'confirmed';
    }
  }

  private mapStatusToICal(status: 'confirmed' | 'tentative' | 'cancelled'): string {
    switch (status) {
      case 'confirmed': return 'CONFIRMED';
      case 'tentative': return 'TENTATIVE';
      case 'cancelled': return 'CANCELLED';
      default: return 'CONFIRMED';
    }
  }
}
