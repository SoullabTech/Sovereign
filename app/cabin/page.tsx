import { notFound } from 'next/navigation';

import { readCabinExperienceContext } from '@/lib/cabin/experienceContext';
import CabinArrival from './CabinArrival';

export const dynamic = 'force-dynamic';

export default function CabinPage() {
  if (process.env.MAIA_CABIN_MODE !== 'offline') {
    notFound();
  }

  const context = readCabinExperienceContext();

  return <CabinArrival context={context} />;
}
