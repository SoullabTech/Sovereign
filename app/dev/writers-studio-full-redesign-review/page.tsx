import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import { FullRedesignReviewClient } from './FullRedesignReviewClient';
import { isFixtureState } from '@/app/writers-studio/full-redesign/fixtures';
import './full-redesign-review.css';

/**
 * /dev/writers-studio-full-redesign-review — PC3-S1 founder-review route.
 *
 * ⛔ Isolated, fixture-only. It shares no route authority with
 * /writers-studio/rebuild, imports nothing from the live Studio, reads no
 * member data and writes nothing. It exists so the founder can compare the
 * canonical Light Shell with the original design images at the same state.
 */

// Fonts come through the app's existing next/font path (no binaries committed).
const serif = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--fr-serif', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--fr-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Founder review · fixture data — Writer’s Studio shell (PC3-S1)',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function FullRedesignReviewPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const requested = Array.isArray(params.state) ? params.state[0] : params.state;
  const appearance = (Array.isArray(params.appearance) ? params.appearance[0] : params.appearance) === 'night' ? 'night' : 'light';
  const state = isFixtureState(requested) ? requested : 'develop-themes';

  return (
    <div className={`${serif.variable} ${sans.variable} fr-root`}>
      <FullRedesignReviewClient key={`${state}:${appearance}`} initialState={state} initialAppearance={appearance} />
    </div>
  );
}
