/**
 * WS2-07 · BUILD-07F — the standing resource, from the room.
 *
 * A FAILED LOOKUP IS NOT AN EMPTY ONE. `fetchStandings` never degrades to `[]`
 * on error: the room must be able to tell UNKNOWN from UNSET, and a client that
 * swallowed the difference would make that impossible however careful the
 * component was afterwards.
 *
 * NO RETRY LIVES HERE. A 409 is returned as a refusal for the writer to see and
 * act on again deliberately; retrying it would make machine scheduling the
 * ordering authority over two member acts (design §4).
 */

import { apiFetch } from '@/lib/http/apiBase';
import type { StandingWire } from './observationStanding';

const url = (manuscriptId: string, readingId: string) =>
  `/api/sovereign/manuscripts/${manuscriptId}/readings/${readingId}/standings`;

export type StandingsFetchOutcome =
  | { ok: true; standings: readonly StandingWire[] }
  | { ok: false; refusal: string };

export async function fetchStandings(
  manuscriptId: string, readingId: string,
): Promise<StandingsFetchOutcome> {
  try {
    const res = await apiFetch(url(manuscriptId, readingId), { method: 'GET' });
    if (!res.ok) return { ok: false, refusal: `http_${res.status}` };
    const body = (await res.json()) as { standings?: unknown };
    if (!Array.isArray(body?.standings)) return { ok: false, refusal: 'malformed' };
    return { ok: true, standings: body.standings as StandingWire[] };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export type RecordStandingOutcome =
  | { ok: true; outcome: 'appended' | 'unchanged'; standing: StandingWire }
  | { ok: false; refusal: string };

/** One member gesture, one event. The three-field envelope and nothing else. */
export async function postStanding(
  manuscriptId: string, readingId: string,
  body: { observationKey: string; standing: StandingWire['standing']; expectedCurrentEventId: string | null },
): Promise<RecordStandingOutcome> {
  try {
    const res = await apiFetch(url(manuscriptId, readingId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = (await res.json().catch(() => null)) as
      { outcome?: 'appended' | 'unchanged'; standing?: StandingWire; refusal?: string } | null;
    if (!res.ok || !payload?.outcome || !payload.standing) {
      return { ok: false, refusal: payload?.refusal ?? `http_${res.status}` };
    }
    return { ok: true, outcome: payload.outcome, standing: payload.standing };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
