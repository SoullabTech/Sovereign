/**
 * GANESHA–PRO–BOUNDARY-01-B / G1
 *
 * Resolve a real professional context from the authenticated session, not
 * localStorage, a member's preference, a submitted practitionerId, or the
 * legacy personal-portal compatibility row.
 *
 * This is a protective lane for existing Pro/legacy Stellium routes, not the
 * future standalone product entitlement resolver. Product upgrades, clinical
 * authority and org delegation require separate authorization.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export interface ProfessionalContext {
  memberId: string;
  practitionerId: string;
  portalType: string;
}

export type ProfessionalContextResult =
  | { ok: true; context: ProfessionalContext }
  | { ok: false; response: NextResponse };

export async function requireProfessionalContext(
  request: NextRequest,
  claimedPractitionerId?: unknown,
): Promise<ProfessionalContextResult> {
  // Match Node's validated-session membership, tier and roles against actual
  // active practitioner standing. Pro payment / "is_practitioner" alone is
  // insufficient; a personal studio compatibility row is never professional.
  const access = await deriveVerifiedAccess(request);
  if (!access.authenticated || !access.memberId) {
    return { ok: false, response: NextResponse.json(
      { error: 'Authentication required' }, { status: 401 }) };
  }
  if (access.tier !== 'pro' || !access.roles.some(
    (role) => role === 'practitioner' || role === 'admin',
  )) {
    return { ok: false, response: NextResponse.json(
      { error: 'Professional access is not authorized' }, { status: 403 }) };
  }
  const identity = await getCurrentPractitioner(request);
  if (!identity || identity.memberId !== access.memberId ||
      identity.portalType === 'personal') {
    return { ok: false, response: NextResponse.json(
      { error: 'An active professional context is required' }, { status: 403 }) };
  }
  if (claimedPractitionerId !== undefined &&
      (typeof claimedPractitionerId !== 'string' ||
        claimedPractitionerId !== identity.practitionerId)) {
    // Never disclose whether another practitioner's ID exists.
    return { ok: false, response: NextResponse.json(
      { error: 'Practitioner not found' }, { status: 404 }) };
  }
  return { ok: true, context: {
    memberId: access.memberId,
    practitionerId: identity.practitionerId,
    portalType: identity.portalType,
  }};
}
