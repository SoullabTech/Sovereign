import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';
import GateScreen from '@/components/access/FounderGateScreen';

/**
 * Circles — founder/practitioner only for v1.
 * Member-facing maturity not yet confirmed; gated until invocation system lands.
 *
 * The refusal screen used to be Book Studio's, so a member refused here was told
 * they had reached Soullab Press's editorial workspace and was offered
 * manuscript navigation. Circles is not Book Studio; it now names itself
 * (founder ruling 2026-09-04). Authorization is unchanged.
 */
export default async function CirclesLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/commons/circles');
    }
    return (
      <GateScreen
        eyebrow="Circles"
        title="Shared field"
        description="Circles is not open for v1."
        reason="Access is limited while the invocation system is being built."
      />
    );
  }
  return <MaiaBoundaryLayout boundary="circles">{children}</MaiaBoundaryLayout>;
}
