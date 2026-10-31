import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';
import { founderPreviewEnabled, founderPreviewMemberAllowed } from '@/lib/astrology/founderOnlyPreviewAccess';
import ProAstrologyExperience from './ProAstrologyExperience';

/**
 * Explicitly opt-in isolated preview, not an entitlement or a public Pro tier.
 * Disabled by default, even if this branch were accidentally included in a build.
 * Real production access will require separate entitlement and privacy gates.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Astrology Pro · Relational Observatory Preview · Soullab',
  description: 'A member-authored, chart-first exploration of celestial and symbolic relationships. Private development preview.',
  robots: { index: false, follow: false },
};

export default async function AstrologyProPreviewPage() {
  if (!founderPreviewEnabled(process.env)) notFound();

  // A signed-in account's identity is resolved by its server-issued,
  // unrevoked, unexpired session; never by the member-id claim cookie.
  // Browser navigation requires a cookie. Native header-only access to the
  // page is a separate, held integration problem; the API independently
  // verifies x-session-token and remains fail-closed.
  let memberId: string | null = null;
  try {
    const sessionCookie = (await cookies()).get('maia_session')?.value;
    memberId = await getMemberIdFromSessionToken(sessionCookie);
  } catch {
    notFound();
  }
  if (!founderPreviewMemberAllowed(memberId, process.env)) notFound();
  return <ProAstrologyExperience />;
}
