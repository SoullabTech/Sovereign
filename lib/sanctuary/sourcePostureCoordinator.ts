/** Coordinates MAIA settings events with the separate source-save posture.
 * This is notification, not evidence that MAIA's ordinary conversation mode
 * is authorized to persist material. Source writes remain server-blocked.
 */
import { notifySourcePersistenceSanctuary } from './sourcePostureClient';

type SettingsEvent = { detail?: unknown };
export function sanctuaryFromSettingsEvent(event: SettingsEvent): boolean | null {
  const detail = event?.detail;
  if (!detail || typeof detail !== 'object') return null;
  const value = (detail as Record<string, unknown>).sanctuary;
  return typeof value === 'boolean' ? value : null;
}

/** Install once for a MAIA room lifetime. Never reads untrusted local OFF as authority. */
export function coordinateSourcePosture(
  target: Pick<Window, 'addEventListener' | 'removeEventListener'>,
  notify: (active: boolean) => Promise<unknown> = notifySourcePersistenceSanctuary,
  currentSetting?: () => boolean | null,
): () => void {
  const listener = (event: Event) => {
    const sanctuary = sanctuaryFromSettingsEvent(event as Event & SettingsEvent);
    if (sanctuary === true) void notify(true).catch(() => undefined);
    // `false` has no effect: leaving Sanctuary must be acknowledged through
    // the future governed UI, not minted by a local settings event.
  };
  // A member might have entered Sanctuary before this room was mounted.
  // Reaffirm only a known ON state; never infer permission from absent/OFF.
  try { if (currentSetting?.() === true) void notify(true).catch(() => undefined); } catch { /* fail closed */ }
  target.addEventListener('maia-settings-changed', listener);
  return () => target.removeEventListener('maia-settings-changed', listener);
}
