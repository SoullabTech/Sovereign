import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Newsreader } from 'next/font/google';
import P4R1StudioHost from '../dev/writers-studio-p4r1/P4R1StudioHost';
import { getMemberIdIfAuthenticated } from '@/lib/auth/session';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { listenBetaAdmitted } from '@/lib/writersStudio/listen/listenBetaAdmission';
import '../dev/writers-studio-full-redesign-review/full-redesign-review.css';
import './insight/insight.css';
import '../dev/writers-studio-p4r1/p4r1-live.css';

const serif = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--fr-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--fr-sans',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Writer’s Studio · Soullab',
  robots: { index: false, follow: false },
};

/**
 * C11 — canonical Writer's Studio host.
 *
 * The PC3/V10 unified organism now owns /writers-studio locally.
 *
 * This page is a host promotion only:
 * - Home is the canonical default.
 * - Write / Develop / Review are query-addressed modes of the same organism.
 * - Source Intake, Canvas, historical structure-proposal Review, and donor
 *   routes remain separately addressable until separately retired.
 * - No route is deleted or redirected here.
 */
export default async function WritersStudioPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string | string[] }>;
}) {
  const params = await searchParams;
  if (params?.mode === 'listen') {
    const memberId = await getMemberIdIfAuthenticated();
    const access = memberId
      ? await writersStudioBetaAccess(memberId)
      : { eligible: false as const, basis: 'not_in_pilot' as const };
    if (!listenBetaAdmitted(
      memberId, access,
      process.env.WRITERS_STUDIO_LISTEN_BETA_MEMBER_IDS,
      process.env.WRITERS_STUDIO_LISTEN_WITNESS_MEMBER_IDS,
    )) {
      return (
        <main style={{ padding: '48px 28px', maxWidth: 680, margin: '0 auto' }}>
          <h1>Listen is in a small private beta.</h1>
          <p>This account has not been admitted to the Listen recording pilot. Your existing work is unchanged.</p>
          <a href="/writers-studio?mode=write">Return to Writer’s Studio</a>
        </main>
      );
    }
  }
  return (
    <div className={`${serif.variable} ${sans.variable} fr-root p4r1-root`}>
      <div className="fr-page">
        <div className="fr-capture-frame" data-capture-frame="">
          <Suspense fallback={<div style={{ padding: 32 }}>Opening your Writer’s Studio…</div>}>
            <P4R1StudioHost defaultMode="home" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
