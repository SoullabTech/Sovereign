import type { Metadata } from 'next';

// `app/maia/page.tsx` is a Client Component, so it cannot export metadata.
// This server-component layout carries the route's share metadata. The card
// image comes from the colocated opengraph-image.tsx (auto-injected by Next).
const title = 'MAIA — A Sovereign Consciousness Companion';
const description =
  'A consciousness companion for coherence and inner guidance. Private by design, yours alone.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function MaiaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
