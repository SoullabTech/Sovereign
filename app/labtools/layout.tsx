import { redirect } from 'next/navigation';
import { requireLabAccess } from '@/lib/access/labAccess';
import { MaiaBoundaryLayout } from '@/components/maia/MaiaBoundaryLayout';
import GateScreen from '@/components/access/FounderGateScreen';

/**
 * Lab Tools — the internal development and research environment.
 *
 * AUTHORITY (founder ruling 2026-09-04): gated on requireLabAccess(), NOT
 * requireFounder(). Lab Tools is open to the founder and to founding members;
 * FOUNDER_MEMBER_IDS is the authority for founder-PRIVATE surfaces (the
 * /api/founder/* console, Book Studio drafts and uploads, the render
 * pipeline), and admitting a founding member there to get them through this
 * door would hand them the founder's private material as a side effect. Two
 * authorities, each named for what it is — see lib/access/labAccess.ts.
 *
 * IDENTITY: the refusal screen used to be components/book-studio's, so anyone
 * refused here was told they had reached Soullab Press's private editorial
 * environment and offered manuscript navigation. Lab Tools is not Book Studio.
 * It now names itself.
 *
 * ⛔ Lab Tools is NOT a member surface. It stays ruled out of the House
 * (lib/navigation/houseDispositions.ts → labtools) and out of member
 * navigation. A capability members use as part of their own experience belongs
 * on a member surface — which is why Reflections left for /reflections rather
 * than being admitted through this door.
 */
export default async function LabToolsLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireLabAccess();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/labtools');
    }
    return (
      <GateScreen
        eyebrow="Soullab Lab Tools"
        title="Internal development and research environment"
        description="Lab Tools holds Soullab's internal instruments and experiments."
        reason="Access is limited to the founder and founding members."
      />
    );
  }
  return <MaiaBoundaryLayout boundary="labtools">{children}</MaiaBoundaryLayout>;
}
