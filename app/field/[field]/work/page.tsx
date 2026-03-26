export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import FieldNav from '@/components/field/FieldNav';
import FieldWorkWithMe from '@/components/field/FieldWorkWithMe';

export default function FieldWorkPage() {
  return (
    <>
      <FieldNav />
      <FieldWorkWithMe />
    </>
  );
}
