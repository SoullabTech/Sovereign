import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Newsreader } from 'next/font/google';
import Pc3LiveStudioHost from './Pc3LiveStudioHost';
import '../writers-studio-full-redesign-review/full-redesign-review.css';

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
  title: 'Founder review · live PC3 Writer’s Studio',
  robots: { index: false, follow: false },
};

export default function Pc3LiveWriterStudioPage() {
  return (
    <div className={`${serif.variable} ${sans.variable} fr-root`}>
      <div className="fr-page">
        <div className="fr-capture-frame" data-capture-frame="">
          <Suspense fallback={<div style={{ padding: 32 }}>Opening your Writer’s Studio…</div>}>
            <Pc3LiveStudioHost />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
