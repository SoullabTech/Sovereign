import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Newsreader } from 'next/font/google';
import P4R1StudioHost from '../dev/writers-studio-p4r1/P4R1StudioHost';
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
export default function WritersStudioPage() {
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
