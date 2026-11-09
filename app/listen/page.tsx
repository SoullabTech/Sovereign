import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { requireMemberId } from '@/lib/auth/session';
import { hasListenBetaAccess } from '@/lib/listening/listenBetaAccess';
import ListenRoom from './ListenRoom';

/** LISTEN-03 ISOLATED REVIEW CANDIDATE — not admitted to release.
 * The feature flag MUST remain disabled unless the existing source owner
 * explicitly opens an authorized fictional/member-verified test session.
 * Named beta (2026-11-09): with the flag on, only founders and members in
 * SOULLAB_LISTEN_BETA_MEMBER_IDS enter; every other member gets the same 404.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Sound Studio · Soullab (review)',
  robots: { index: false, follow: false },
};

export default async function ListenPage() {
  if (process.env.SOULLAB_LISTEN_REVIEW_ENABLED !== '1') notFound();
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED')
      redirect('/signin?next=%2Flisten');
    throw error;
  }
  if (!hasListenBetaAccess(memberId)) notFound();
  return <ListenRoom />;
}

