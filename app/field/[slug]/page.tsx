export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import FieldNav from '@/components/field/FieldNav';
import FieldThreshold from '@/components/field/FieldThreshold';

export default function FieldThresholdPage() {
  return (
    <>
      <FieldNav />
      <FieldThreshold />
    </>
  );
}
