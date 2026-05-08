/**
 * Founder gate for /book-studio/atlas-threshold.
 *
 * The atlas threshold preview is a founder editorial surface — a
 * read-only print-proportion view of the back-matter doorway. Not
 * a public surface; not part of /read.
 */

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

export default async function AtlasThresholdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/book-studio/atlas-threshold');
    }
    return (
      <FounderGateScreen reason="The atlas threshold preview is a founder editorial surface." />
    );
  }
  return <>{children}</>;
}
