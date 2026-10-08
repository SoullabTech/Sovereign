/** Advisory coordination of MAIA Sanctuary gestures with the separate source-save gate.
 * Failures cannot authorize saving: server source POST/PATCH remain fail-closed.
 * An ordinary UI gesture is NOT permission to unlock the source persistence gate.
 */
import { apiFetch } from '@/lib/http/apiBase';
export async function notifySourcePersistenceSanctuary(enabled: boolean): Promise<'acknowledged' | 'held' | 'unavailable'> {
  if (!enabled) return 'held';
  try {
    const response = await apiFetch('/api/writers-studio/source-posture', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posture: 'sanctuary' }),
    });
    return response.ok ? 'acknowledged' : 'unavailable';
  } catch { return 'unavailable'; }
}
