/**
 * Apple Calendar Integration via CalDAV
 * Provides two-way sync with Apple Calendar/iCloud Calendar
 */

// @ts-ignore - ical.js doesn't have proper TypeScript definitions
import ical from 'ical.js';

export interface CalDAVConfig {
  serverUrl: string; // iCloud: https://caldav.icloud.com
  username: string; // Apple ID
  password: string; // App-specific password
  calendarId: string; // Calendar UUID
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

export class AppleCalendarSync {
  private config: CalDAVConfig;

  constructor(config: CalDAVConfig) {
    this.config = config;
  }

  /**
   * Fetch events from Apple Calendar for a date range
   */
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      // CalDAV REPORT request to fetch events
      const reportBody = this.createCalDAVReportXML(startISO, endISO);

      const response = await fetch(`${this.config.serverUrl}/${this.config.calendarId}/`, {
        method: 'REPORT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`,
          'Content-Type': 'text/xml; charset=utf-8',
          'Depth': '1'
        },
        body: reportBody
      });

      if (!response.ok) {
        throw new Error(`CalDAV request failed: ${response.status}`);
      }

      const xmlData = await response.text();
      return this.parseCalDAVResponse(xmlData);

    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  /**
   * Create a new event in Apple Calendar
   */
  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<string> {
    try {
      const eventId = this.generateEventId();
      const icalData = this.createICalEvent({ ...event, id: eventId });

      const response = await fetch(`${this.config.serverUrl}/${this.config.calendarId}/${eventId}.ics`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`,
          'Content-Type': 'text/calendar; charset=utf-8',
          'If-None-Match': '*'
        },
        body: icalData
      });

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.status}`);
      }

      return eventId;

    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event in Apple Calendar
   */
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    try {
      // First fetch the existing event
      const response = await fetch(`${this.config.serverUrl}/${this.config.calendarId}/${eventId}.ics`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Event not found: ${eventId}`);
      }

      const existingIcal = await response.text();
      const etag = response.headers.get('ETag');

      // Parse and update the event
      const updatedIcal = this.updateICalEvent(existingIcal, event);

      // Update the event
      const updateResponse = await fetch(`${this.config.serverUrl}/${this.config.calendarId}/${eventId}.ics`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`,
          'Content-Type': 'text/calendar; charset=utf-8',
          'If-Match': etag || '*'
        },
        body: updatedIcal
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update event: ${updateResponse.status}`);
      }

    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from Apple Calendar
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.serverUrl}/${this.config.calendarId}/${eventId}.ics`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete event: ${response.status}`);
      }

    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  /**
   * Check for calendar conflicts
   */
  async checkForConflicts(startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    const events = await this.fetchEvents(startTime, endTime);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // Check for overlap
      return (
        (startTime >= eventStart && startTime < eventEnd) ||
        (endTime > eventStart && endTime <= eventEnd) ||
        (startTime <= eventStart && endTime >= eventEnd)
      );
    });
  }

  /**
   * Generate CalDAV REPORT XML for fetching events
   */
  private createCalDAVReportXML(startDate: string, endDate: string): string {
    return `<?xml version="1.0" encoding="utf-8" ?>
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
        <C:time-range start="${startDate}" end="${endDate}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;
  }

  /**
   * Parse CalDAV response and extract events
   */
  private parseCalDAVResponse(xmlData: string): CalendarEvent[] {
    // This is a simplified parser - in production you'd use a proper XML parser
    const events: CalendarEvent[] = [];

    try {
      // Extract iCal data from XML response
      const icalMatches = xmlData.match(/<calendar-data[^>]*>([\s\S]*?)<\/calendar-data>/gi);

      if (!icalMatches) return events;

      for (const match of icalMatches) {
        const icalData = match.replace(/<[^>]*>/g, '').trim();
        const parsedEvent = this.parseICalEvent(icalData);
        if (parsedEvent) {
          events.push(parsedEvent);
        }
      }

    } catch (error) {
      console.error('Error parsing CalDAV response:', error);
    }

    return events;
  }

  /**
   * Parse iCal event data
   */
  private parseICalEvent(icalData: string): CalendarEvent | null {
    try {
      const jcalData = ical.parse(icalData);
      const comp = new ical.Component(jcalData);
      const vevent = comp.getFirstSubcomponent('vevent');

      if (!vevent) return null;

      const event = new ical.Event(vevent);

      return {
        id: event.uid,
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        startTime: event.startDate.toJSDate(),
        endTime: event.endDate.toJSDate(),
        location: event.location || '',
        attendees: event.attendees.map((attendee: any) => attendee.getParameter('cn') || attendee.getFirstValue()),
        status: this.mapICalStatus(event.getFirstPropertyValue('status'))
      };

    } catch (error) {
      console.error('Error parsing iCal event:', error);
      return null;
    }
  }

  /**
   * Create iCal event data
   */
  private createICalEvent(event: CalendarEvent): string {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Soullab//Session Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}
DTSTART:${this.formatDateForICal(startTime)}
DTEND:${this.formatDateForICal(endTime)}
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

  /**
   * Update iCal event data
   */
  private updateICalEvent(existingIcal: string, updates: Partial<CalendarEvent>): string {
    // This is a simplified implementation
    // In production, you'd parse the existing iCal and update specific fields
    let updatedIcal = existingIcal;

    if (updates.title) {
      updatedIcal = updatedIcal.replace(/SUMMARY:.*$/m, `SUMMARY:${updates.title}`);
    }

    if (updates.description) {
      updatedIcal = updatedIcal.replace(/DESCRIPTION:.*$/m, `DESCRIPTION:${updates.description}`);
    }

    if (updates.startTime) {
      updatedIcal = updatedIcal.replace(/DTSTART:.*$/m, `DTSTART:${this.formatDateForICal(updates.startTime)}`);
    }

    if (updates.endTime) {
      updatedIcal = updatedIcal.replace(/DTEND:.*$/m, `DTEND:${this.formatDateForICal(updates.endTime)}`);
    }

    return updatedIcal;
  }

  /**
   * Format date for iCal format (YYYYMMDDTHHMMSSZ)
   */
  private formatDateForICal(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@soullab.life`;
  }

  /**
   * Map iCal status to our status format
   */
  private mapICalStatus(status: string): 'confirmed' | 'tentative' | 'cancelled' {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'confirmed';
      case 'TENTATIVE': return 'tentative';
      case 'CANCELLED': return 'cancelled';
      default: return 'confirmed';
    }
  }

  /**
   * Map our status to iCal status format
   */
  private mapStatusToICal(status: 'confirmed' | 'tentative' | 'cancelled'): string {
    switch (status) {
      case 'confirmed': return 'CONFIRMED';
      case 'tentative': return 'TENTATIVE';
      case 'cancelled': return 'CANCELLED';
      default: return 'CONFIRMED';
    }
  }

  /**
   * Test connection to Apple Calendar
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.serverUrl}/${this.config.calendarId}/`, {
        method: 'PROPFIND',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`,
          'Content-Type': 'text/xml; charset=utf-8',
          'Depth': '0'
        },
        body: `<?xml version="1.0" encoding="utf-8" ?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:displayname/>
    <C:calendar-description/>
  </D:prop>
</D:propfind>`
      });

      return response.ok;

    } catch (error) {
      console.error('Apple Calendar connection test failed:', error);
      return false;
    }
  }
}