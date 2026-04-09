/**
 * Event Phase derivation
 *
 * Time defines the container. Phase is derived from the event's date bounds.
 * Later, phase can be overridden manually for long integrations.
 */

import type { EventPhase } from './types';

/**
 * Normalize a date input to YYYY-MM-DD string.
 * Handles:
 *   - JS Date objects (from Postgres DATE columns)
 *   - ISO strings like "2026-04-13T00:00:00.000Z"
 *   - Plain YYYY-MM-DD strings
 */
function toDateKey(input: string | Date): string {
  if (input instanceof Date) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, '0');
    const d = String(input.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Already a string — strip any time portion
  return input.slice(0, 10);
}

export function deriveEventPhase(
  startDate: string | Date,
  endDate: string | Date,
  now: Date = new Date()
): EventPhase {
  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);

  // Compare today's YYYY-MM-DD against the event's date keys — avoids TZ drift.
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const nowKey = `${y}-${m}-${d}`;

  if (nowKey < startKey) return 'pre';
  if (nowKey > endKey) return 'post';
  return 'during';
}
