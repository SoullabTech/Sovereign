import type { Metadata } from 'next';

// Member portal + circles. Protected title; the public /commons/join page
// overrides this with its own invitation title.
const title = 'A Private Soullab Circle';
const description = 'This protected space is available only to invited members.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function CommonsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
