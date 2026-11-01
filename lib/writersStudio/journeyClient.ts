import { apiFetch } from '@/lib/http/apiBase';
import type { ColabKind, JourneyAnswer, JourneyAnswerForFounder } from './journey';

export type ColabAvailability = 'open' | 'colab_not_open' | 'not_a_member';

type Fail = { ok: false; refusal: string };

async function call<T>(path: string, init?: RequestInit): Promise<({ ok: true } & T) | Fail> {
  try {
    const response = await apiFetch(path, init);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, refusal: String(body?.refusal ?? `http_${response.status}`) };
    return { ok: true, ...(body as T) };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function readOwnJourney() {
  return call<{ answers: JourneyAnswer[]; colab: ColabAvailability; founder: boolean }>(
    '/api/sovereign/writers-studio/journey', { method: 'GET' });
}

export function readFounderJourney() {
  return call<{ answers: JourneyAnswerForFounder[] }>(
    '/api/sovereign/writers-studio/journey?scope=all', { method: 'GET' });
}

export function sendJourneyAnswer(input: {
  promptKey: string; choice?: string; answer: string; supersedes?: string; manuscriptId?: string;
}) {
  return call<{ answer: JourneyAnswer }>('/api/sovereign/writers-studio/journey', {
    method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(input),
  });
}

export function withdrawJourneyAnswer(answerId: string) {
  return call<{ withdrawn: number }>(`/api/sovereign/writers-studio/journey/${encodeURIComponent(answerId)}`, {
    method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ action: 'withdraw' }),
  });
}

export function shareJourneyAnswer(answerId: string, kind: ColabKind) {
  return call<{ answer: JourneyAnswer }>(`/api/sovereign/writers-studio/journey/${encodeURIComponent(answerId)}`, {
    method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify({ action: 'share', kind }),
  });
}
