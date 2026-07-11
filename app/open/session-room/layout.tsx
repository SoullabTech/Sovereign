import type { Metadata } from 'next';

// Public Session Room (middleware bypasses /open/). Named title, but NO
// per-room data — a shared open-room link is recognizable without revealing
// anything about the session.
const title = 'Soullab Session Room — A Held Space for Guided Work';
const description = 'A threshold for focused, held, one-to-one work.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export default function OpenSessionRoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
