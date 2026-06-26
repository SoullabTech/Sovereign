import type { Metadata } from 'next';

// Clean title for a mobile home-screen shortcut. A client component (page.tsx)
// can't export metadata, so the route-segment title lives here.
export const metadata: Metadata = {
  title: 'Arrival · MAIA',
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
