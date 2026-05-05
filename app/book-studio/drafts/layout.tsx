/**
 * Founder gate for /book-studio/drafts/*.
 *
 * Drafts imported from MAIA Ideas are private to the author —
 * founder-only until per-member draft persistence lands.
 */

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

export default async function DraftsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/book-studio/drafts');
    }
    return <FounderGateScreen reason="Drafts are private to the author." />;
  }
  return <>{children}</>;
}
