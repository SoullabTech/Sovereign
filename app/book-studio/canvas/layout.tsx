/**
 * Founder gate for /book-studio/canvas.
 *
 * The canvas is the visual page-layout tool — Soullab Press's private
 * editorial workspace. Per the access matrix:
 *   - /book-studio (index)         → public
 *   - /book-studio/read            → public
 *   - /book-studio/canvas          → founder-only (this layout)
 *   - /book-studio/render          → founder-only
 *   - /book-studio/drafts/*        → founder-only
 *
 * Auth requirements come from FOUNDER_MEMBER_IDS env var on production.
 */

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

export default async function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/book-studio/canvas');
    }
    return <FounderGateScreen />;
  }
  return <>{children}</>;
}
