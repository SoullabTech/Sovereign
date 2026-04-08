/**
 * Event Phase derivation
 *
 * Time defines the container. Phase is derived from the event's date bounds.
 * Later, phase can be overridden manually for long integrations.
 */

import type { EventPhase } from './types';

export function deriveEventPhase(
  startDate: string,
  endDate: string,
  now: Date = new Date()
): EventPhase {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);

  if (now < start) return 'pre';
  if (now > end) return 'post';
  return 'during';
}
