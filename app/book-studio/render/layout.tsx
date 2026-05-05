/**
 * Founder gate for /book-studio/render.
 *
 * The render trigger generates print PDF + EPUB from the sealed
 * manuscript — a founder editorial action, not a public surface.
 */

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

export default async function RenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/book-studio/render');
    }
    return <FounderGateScreen reason="The render pipeline is a founder editorial action." />;
  }
  return <>{children}</>;
}
