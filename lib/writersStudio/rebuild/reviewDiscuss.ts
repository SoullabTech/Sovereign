import { apiFetch } from '@/lib/http/apiBase';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';

export type ReviewDiscussionState =
  | { readonly kind: 'composing'; readonly findingId: string }
  | { readonly kind: 'pending'; readonly findingId: string; readonly ask: string; readonly gen: number }
  | { readonly kind: 'answered'; readonly findingId: string; readonly ask: string; readonly reply: string; readonly threadId: string; readonly posture: 'AS_READ' }
  | { readonly kind: 'refused'; readonly findingId: string; readonly ask: string; readonly copy: string };

export interface ReviewDiscussInput {
  readonly manuscriptId: string;
  readonly readingId: string;
  readonly observationKey: string;
  readonly question: string;
}

export type ReviewDiscussOutcome =
  | { readonly ok: true; readonly reply: string; readonly threadId: string; readonly posture: 'AS_READ' }
  | { readonly ok: false; readonly reason: 'posture_unresolved' | 'sanctuary_unavailable' | 'unavailable' | 'refused' };

export const REVIEW_DISCUSS_COPY = Object.freeze({
  waiting: 'MAIA is staying with this observation as it was read…',
  failed: 'MAIA could not discuss this observation just now. Nothing about the reading or your Work changed.',
  sanctuary: 'Review Discuss is unavailable while Sanctuary is on.',
  posture: 'Your current privacy posture could not be resolved, so nothing was sent.',
});

export async function commissionReviewDiscuss(
  input: ReviewDiscussInput,
  posture: CurrentPostureRead,
): Promise<ReviewDiscussOutcome> {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(input.manuscriptId)}/review-discuss`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          readingId: input.readingId,
          observationKey: input.observationKey,
          question: input.question,
          sanctuary: posture.sanctuary,
        }),
      },
    );
    const body = await res.json().catch(() => null);
    if (res.status === 409 && body?.refusal === 'sanctuary_unavailable') {
      return { ok: false, reason: 'sanctuary_unavailable' };
    }
    if (!res.ok) return { ok: false, reason: body?.refusal ? 'refused' : 'unavailable' };
    if (!body || typeof body.answer !== 'string' || typeof body.threadId !== 'string' || body.posture !== 'AS_READ') {
      return { ok: false, reason: 'unavailable' };
    }
    return { ok: true, reply: body.answer, threadId: body.threadId, posture: 'AS_READ' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
