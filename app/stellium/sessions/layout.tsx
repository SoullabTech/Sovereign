import type { Metadata } from 'next';

const title = 'Private Soullab Session';
const description = 'This protected session is available only to authorized participants.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function StelliumSessionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
