/** A conservative, read-only presentation of the separately governed source gate.
 * MAIA conversation mode and permission to persist a manuscript source are NOT
 * the same thing. Unknown, failed and stale responses never display Writable.
 */
import { apiFetch } from '@/lib/http/apiBase';
export type SourcePostureDisplay = 'sanctuary' | 'ordinary-unverified' | 'unavailable';
export function deriveSourcePostureDisplay(value: unknown): SourcePostureDisplay {
  if (!value || typeof value !== 'object') return 'unavailable';
  const posture = (value as Record<string, unknown>).posture;
  if (posture === 'sanctuary') return 'sanctuary';
  if (posture === 'ordinary') return 'ordinary-unverified';
  return 'unavailable';
}
export async function readSourcePostureDisplay(): Promise<SourcePostureDisplay> {
  try {
    const response = await apiFetch('/api/writers-studio/source-posture', { method: 'GET', cache: 'no-store' });
    if (!response.ok) return 'unavailable';
    return deriveSourcePostureDisplay(await response.json());
  } catch { return 'unavailable'; }
}
