/**
 * Founder gate for /book-studio/workbench.
 *
 * Matches the access pattern from /book-studio/canvas:
 *   - founder-only via requireFounder() → FOUNDER_MEMBER_IDS env allowlist
 *   - 401 → redirect to /signin
 *   - 403 → FounderGateScreen
 *
 * v0: founder-only by design. The Workbench is the founder's arrangement
 * surface (curation, structure, meaning-making). Phase B widens access.
 */

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

export default async function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/book-studio/workbench');
    }
    return <FounderGateScreen />;
  }
  return <>{children}</>;
}
