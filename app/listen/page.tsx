import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { requireMemberId } from '@/lib/auth/session';
import ListenRoom from './ListenRoom';

/** LISTEN-03 ISOLATED REVIEW CANDIDATE — not admitted to release.
 * The feature flag MUST remain disabled unless the existing source owner
 * explicitly opens an authorized fictional/member-verified test session.
 */
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Listening Room · Soullab (review)',
  robots: { index: false, follow: false },
};

export default async function ListenPage() {
  if (process.env.SOULLAB_LISTEN_REVIEW_ENABLED !== '1') notFound();
  try {
    await requireMemberId();
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED')
      redirect('/signin?next=%2Flisten');
    throw error;
  }
  return <ListenRoom />;
}

