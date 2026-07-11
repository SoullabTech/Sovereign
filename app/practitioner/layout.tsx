import type { Metadata } from 'next';

// Protected og:title for /practitioner/* so the share text matches the
// protected card image (root's marketing title would otherwise win).
const title = 'Private Soullab Session';
const description = 'This protected session is available only to authorized participants.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function PractitionerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
