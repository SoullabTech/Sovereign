import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Newsreader } from 'next/font/google';
import P4R1StudioHost from './P4R1StudioHost';
import { StudioAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import '../writers-studio-full-redesign-review/full-redesign-review.css';
import '../../writers-studio/insight/insight.css';
import './p4r1-live.css';

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
  title: 'Founder review · P4R1 Writer’s Studio',
  robots: { index: false, follow: false },
};

export default function P4R1WriterStudioPage() {
  return (
    <div className={`${serif.variable} ${sans.variable} fr-root p4r1-root`}>
      <div className="fr-page">
        <div className="fr-capture-frame" data-capture-frame="">
          <StudioAtmosphere defaultAtmosphere="day">
            <Suspense fallback={<div style={{ padding: 32 }}>Opening your Writer’s Studio…</div>}>
              <P4R1StudioHost />
            </Suspense>
          </StudioAtmosphere>
        </div>
      </div>
    </div>
  );
}
