/**
 * SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — the Press Keep request, built from the
 * member's CURRENT posture.
 *
 * The POST to /api/sovereign/manuscripts/[id]/keeps IS the member's explicit
 * recognition gesture; no additional client assertion (e.g. a `memberConfirmed`
 * flag) adds authority and none is sent. What the request must carry is the
 * one thing the server cannot know on its own: the member's Sanctuary posture
 * at the moment they pressed Keep.
 *
 *   resolved posture   → { sectionId, text, sanctuary: boolean }
 *   unresolved posture → no request. The caller does not POST and does not
 *                        invent a boolean. (The server refuses a missing
 *                        posture independently; this is the honest client
 *                        side of the same law.)
 *
 * Pure. No storage read happens here — the posture is passed in, read by the
 * caller at gesture time via `readCurrentSanctuaryPosture()`.
 */

import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';

export interface KeepCard {
  readonly sectionId: string;
  readonly text: string;
}

export interface KeepRequestBody {
  readonly sectionId: string;
  readonly text: string;
  readonly sanctuary: boolean;
}

export type KeepRequest =
  | { readonly ok: true; readonly body: KeepRequestBody }
  | { readonly ok: false; readonly reason: 'posture_unresolved' };

export function buildKeepRequestBody(card: KeepCard, posture: CurrentPostureRead): KeepRequest {
  if (!posture.resolved) return { ok: false, reason: 'posture_unresolved' };
  return {
    ok: true,
    body: { sectionId: card.sectionId, text: card.text, sanctuary: posture.sanctuary },
  };
}

/** What the server's reply means for the member. */
export type KeepOutcome = 'kept' | 'not_persisted_sanctuary' | 'posture_required' | 'failed';

export function interpretKeepReply(status: number, json: unknown): KeepOutcome {
  const j = (json ?? {}) as Record<string, unknown>;
  if (status === 201 && j['keep']) return 'kept';
  if (status === 200 && j['sanctuary'] === true && j['persisted'] === false) return 'not_persisted_sanctuary';
  if (status === 400 && j['error'] === 'posture_required') return 'posture_required';
  return 'failed';
}
