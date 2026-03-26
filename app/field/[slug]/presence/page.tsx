export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import FieldNav from '@/components/field/FieldNav';
import FieldPresence from '@/components/field/FieldPresence';

export default function FieldPresencePage() {
  return (
    <>
      <FieldNav />
      <FieldPresence />
    </>
  );
}
