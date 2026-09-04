/**
 * BUILD-07D — DEVELOP SURFACE · the client's three calls.
 *
 * Nothing about the Work goes up any of these wires. A commission carries the
 * lens and the member's identity; the server owns the read end to end. There
 * is no poll, no refetch on focus, no timer: the surface reads when it opens
 * and when the writer acts, and at no other time (07D: no automatic refresh).
 */

import { apiFetch } from '@/lib/http/apiBase';
import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { DevelopmentalReading } from '@/lib/manuscript/developmentalReading/contract';
import type { ReadingAssessment } from '@/lib/manuscript/developmentalReading/assess';
import type { ReadingSummary } from '@/lib/manuscript/developmentalReading/store';
import type { SectionLabelSource } from './developPresentation';

export type { ReadingSummary };

export type ListOutcome =
  | { ok: true; readings: ReadingSummary[] }
  | { ok: false; refusal: 'unauthorized' | 'unreachable' | string };

export async function fetchReadingSummaries(manuscriptId: string): Promise<ListOutcome> {
  try {
    const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/readings`, { method: 'GET' });
    if (res.status === 401) return { ok: false, refusal: 'unauthorized' };
    if (!res.ok) return { ok: false, refusal: `http_${res.status}` };
    const body = await res.json();
    return { ok: true, readings: Array.isArray(body?.readings) ? (body.readings as ReadingSummary[]) : [] };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export interface ReadingPayload {
  reading: DevelopmentalReading;
  assessment: ReadingAssessment;
  sections: SectionLabelSource[];
}

export type ReadingFetchOutcome =
  | { ok: true; payload: ReadingPayload }
  | { ok: false; refusal: 'unauthorized' | 'not_found' | 'unreachable' | string };

export async function fetchReading(manuscriptId: string, readingId: string): Promise<ReadingFetchOutcome> {
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${manuscriptId}/readings/${readingId}`, { method: 'GET' });
    if (res.status === 401) return { ok: false, refusal: 'unauthorized' };
    if (res.status === 404) return { ok: false, refusal: 'not_found' };
    if (!res.ok) return { ok: false, refusal: `http_${res.status}` };
    const payload = (await res.json()) as ReadingPayload;
    if (!payload?.reading?.id || !payload?.assessment) return { ok: false, refusal: 'malformed' };
    return { ok: true, payload };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export type CommissionStageName = 'capture' | 'recover' | 'read' | 'classify' | 'freeze' | 'store';

export type CommissionOutcome =
  | { ok: true; readingId: string; outcome: 'reading' | 'none'; observationCount: number }
  | { ok: false; refusal: string; stage: CommissionStageName | null; detail?: string };

/** One member gesture, one reading. The server refuses rather than retries. */
export async function requestDevelopmentalReading(
  manuscriptId: string,
  lens: DevelopmentalLens,
): Promise<CommissionOutcome> {
  try {
    const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/readings`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lens }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`),
        stage: (body?.stage as CommissionStageName | undefined) ?? null,
        ...(body?.detail ? { detail: String(body.detail) } : {}) };
    }
    if (typeof body?.readingId !== 'string') return { ok: false, refusal: 'malformed', stage: null };
    return { ok: true, readingId: body.readingId, outcome: body.outcome, observationCount: Number(body.observationCount ?? 0) };
  } catch {
    return { ok: false, refusal: 'unreachable', stage: null };
  }
}
