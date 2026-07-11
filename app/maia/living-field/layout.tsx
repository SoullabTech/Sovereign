import type { Metadata } from 'next';

// Gated member field surface. Overrides the inherited public "/maia" card/title.
const title = 'A Private Soullab Field';
const description = 'This field is available only to its member.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function LivingFieldLayout({ children }: { children: React.ReactNode }) {
  return children;
}
