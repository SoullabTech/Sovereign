'use strict';
/**
 * JARVIS O-1 Observer — notification channel.
 *
 * Enforces the doctrine already carried in lib/runtime-client.js:
 *
 *     "GET /events (SSE). Notification, never truth (§14) — every handler is
 *      expected to re-fetch REST state."
 *
 * This module makes that structural rather than conventional. An SSE event can
 * do exactly one thing: mark a family stale so the next cycle re-reads it over
 * REST. There is deliberately no API here for an event to carry a value into
 * displayed state — `notify()` accepts an event and ignores its payload.
 *
 * The failure this prevents (N7): a UI that patches itself from event payloads
 * drifts away from REST truth and cannot tell that it has.
 */

class NotificationChannel {
  constructor({ families = ['claims', 'runtime', 'governance', 'git', 'github', 'production'] } = {}) {
    this._families = new Set(families);
    this._invalidated = new Set();
    this._seen = 0;
  }

  /**
   * Accept an SSE event. The payload is intentionally NOT read — only the
   * affected family is taken, and only to request a re-fetch.
   *
   * @returns {{invalidated: string|null, carried_value: false}}
   */
  notify(event) {
    this._seen += 1;
    const family = event && typeof event.family === 'string' ? event.family : inferFamily(event);
    if (family && this._families.has(family)) {
      this._invalidated.add(family);
      return { invalidated: family, carried_value: false };
    }
    // Unknown event shape: invalidate the runtime family rather than guessing a
    // value. Over-refetching is safe; inventing state is not.
    this._invalidated.add('runtime');
    return { invalidated: 'runtime', carried_value: false };
  }

  /** Families needing a REST re-read. */
  pending() { return [...this._invalidated]; }

  /** True when a family must be re-read before it may be presented as current. */
  isStale(family) { return this._invalidated.has(family); }

  /** Called after a successful REST read has replaced the family's Readings. */
  settle(family) { this._invalidated.delete(family); }

  get eventsSeen() { return this._seen; }
}

function inferFamily(event) {
  const t = String((event && (event.type || event.event)) || '').toLowerCase();
  if (t.includes('run') || t.includes('gate')) return 'runtime';
  if (t.includes('claim') || t.includes('session')) return 'claims';
  return null;
}

module.exports = { NotificationChannel };
