export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import FieldNav from '@/components/field/FieldNav';
import { FieldGroupsSection } from '@/components/field/FieldGroupsSection';

export default function FieldGroupsPage() {
  return (
    <>
      <FieldNav />
      <FieldGroupsSection />
    </>
  );
}
