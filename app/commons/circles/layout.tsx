import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';

/**
 * Circles — founder/practitioner only for v1.
 * Member-facing maturity not yet confirmed; gated until invocation system lands.
 */
export default async function CirclesLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/commons/circles');
    }
    return <FounderGateScreen />;
  }
  return <MaiaBoundaryLayout boundary="circles">{children}</MaiaBoundaryLayout>;
}
