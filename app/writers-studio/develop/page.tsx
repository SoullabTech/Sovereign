import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Newsreader } from 'next/font/google';
import Pc3LiveDevelopHost from '@/app/dev/writers-studio-pc3-live/Pc3LiveDevelopHost';
import '@/app/dev/writers-studio-full-redesign-review/full-redesign-review.css';

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
  title: 'Develop · Writer’s Studio',
};

export default function DevelopPage() {
  return (
    <div className={`${serif.variable} ${sans.variable} fr-root`}>
      <div className="fr-page">
        <div className="fr-capture-frame" data-capture-frame="">
          <Suspense fallback={<div style={{ padding: 32 }}>Opening Develop…</div>}>
            <Pc3LiveDevelopHost />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
