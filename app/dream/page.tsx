'use client';

import { useSearchParams } from 'next/navigation';
import DreamRoom from './DreamRoom';

export default function DreamPage() {
  const searchParams = useSearchParams();
  const dreamId = searchParams?.get('dream') || null;
  const from = searchParams?.get('from') || null;
  return <DreamRoom initialDreamId={dreamId} from={from} />;
}
