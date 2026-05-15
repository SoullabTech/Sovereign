import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

/**
 * Lab Tools — founder/practitioner only.
 * Consciousness tools & experiments live here; not a member-facing surface.
 */
export default async function LabToolsLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/labtools');
    }
    return <FounderGateScreen />;
  }
  return <MaiaBoundaryLayout boundary="labtools">{children}</MaiaBoundaryLayout>;
}
