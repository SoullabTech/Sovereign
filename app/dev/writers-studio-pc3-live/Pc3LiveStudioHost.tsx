'use client';

import { useSearchParams } from 'next/navigation';
import Pc3LiveWriteHost from './Pc3LiveWriteHost';
import Pc3LiveReviewHost from './Pc3LiveReviewHost';
import Pc3LiveDevelopHost from './Pc3LiveDevelopHost';
import ListenPilot from './ListenPilot';

export default function Pc3LiveStudioHost() {
  const params = useSearchParams();
  const mode = params?.get('mode');
  if (mode === 'listen') return <ListenPilot />;
  if (mode === 'review') return <Pc3LiveReviewHost />;
  if (mode === 'develop') return <Pc3LiveDevelopHost />;
  return <Pc3LiveWriteHost />;
}
