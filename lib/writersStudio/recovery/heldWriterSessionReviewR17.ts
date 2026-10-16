/**
 * R17 REVIEW-ONLY: bind a prospective held-only Writer's Studio service to a
 * server-verified session, active exact-member invitation and latest consent.
 *
 * This is NOT an active API route. Do not add a route or call R16 storage until
 * independent key custody, PG16/Source recovery, source migrations and founder
 * exact-image release approval are satisfied. Production writing remains OFF.
 */
import type { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { restrictedBetaEnabled } from '@/lib/writersStudio/restrictedBetaAdmission';
import type { HeldStorageSubjectR16 } from './heldPairedStoreR16';

export const R17_REAL_WRITER_SERVICE_ENABLED = false as const;
export const R17_REVIEW_ROUTE = '/api/sovereign/writers-studio/held-pair';
const PROD_ORIGIN = 'https://soullab.life';

export type HeldWriterRequestReviewR17 =
  | { kind: 'held_only'; subject: HeldStorageSubjectR16; origin: typeof PROD_ORIGIN }
  | { kind: 'refused'; status: 401 | 403 | 404 | 405 | 503 };

const refused = (status: 401 | 403 | 404 | 405 | 503): HeldWriterRequestReviewR17 =>
  ({ kind: 'refused', status });

/**
 * A future adapter must call this within a trusted server boundary and must
 * never accept a member ID, role, consent, invitation, signed key or subject
 * from a browser body/header. The only identity source is the existing
 * auth_sessions-backed verification of the member's real session.
 *
 * A genuine founder/CTO witness role is intentionally insufficient to WRITE
 * a manuscript; the applicant must be a separately invited, consented writer.
 * Even a successful response is ONLY a preflight result, never a write grant.
 */
export async function reviewHeldWriterRequestR17(
  request: NextRequest,
): Promise<HeldWriterRequestReviewR17> {
  // Both settings must be explicitly true. Neither is configured by default.
  if (!restrictedBetaEnabled(process.env.WRITERS_STUDIO_RESTRICTED_BETA) ||
      process.env.WRITERS_STUDIO_R17_HELD_SERVICE_REVIEW !== 'true') {
    return refused(404);
  }

  const url = request.nextUrl;
  const host = request.headers.get('host');
  // Refuse alternate virtual hosts, direct HTTP, private-host aliases and
  // any mismatch between the URL and the Host selected by the edge proxy.
  if (url.protocol !== 'https:' || url.host !== 'soullab.life' ||
      host !== 'soullab.life') {
    return refused(403);
  }
  if (url.pathname !== R17_REVIEW_ROUTE || url.search !== '') return refused(404);

  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'POST') return refused(405);
  // A cookie alone cannot authorize cross-origin browser writes.
  if (method === 'POST' && request.headers.get('origin') !== PROD_ORIGIN) {
    return refused(403);
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return refused(401);
    const access = await writersStudioBetaAccess(memberId);
    if (!access.eligible || access.basis !== 'active_beta_tester') return refused(403);

    return {
      kind: 'held_only',
      subject: { memberId, assertedBy: 'server_verified_member_session' },
      origin: PROD_ORIGIN,
    };
  } catch {
    // An unavailable session, consent or invitation authority can never be
    // downgraded to a local role check or a client-asserted member ID.
    return refused(503);
  }
}
