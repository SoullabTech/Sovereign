export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

import FieldNav from '@/components/field/FieldNav';
import FieldBookingShell from '@/components/field/FieldBookingShell';

export default function FieldBookPage() {
  return (
    <>
      <FieldNav />
      <FieldBookingShell />
    </>
  );
}
