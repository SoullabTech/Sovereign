// LISTEN-01 · the review routes use the same three conditions as /listen and the audio route:
// review flag on, a verified member session, and membership of the named beta (founders always pass).
// Anything else is refused exactly as the room is: 404 when the flag is off or the member is not in the beta.
import { requireMemberId } from '@/lib/auth/session';
import { hasListenBetaAccess } from './listenBetaAccess';
import { soundStudioMediaEnabled } from './soundStudioMediaGate';

export type ReviewerGate = { ok: true; memberId: string } | { ok: false; status: 401 | 404 };

export async function requireListenReviewer(): Promise<ReviewerGate> {
  if (!soundStudioMediaEnabled(process.env)) return { ok: false, status: 404 };
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch {
    return { ok: false, status: 401 };
  }
  if (!hasListenBetaAccess(memberId)) return { ok: false, status: 404 };
  return { ok: true, memberId };
}
