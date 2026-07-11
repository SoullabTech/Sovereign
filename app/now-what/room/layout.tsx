import type { Metadata } from 'next';

const title = 'A Private Soullab Space';
const description = 'This protected space is available only to authorized participants.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function NowWhatRoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
