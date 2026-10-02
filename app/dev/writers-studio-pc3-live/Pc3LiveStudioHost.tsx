'use client';

import { useSearchParams } from 'next/navigation';
import Pc3LiveWriteHost from './Pc3LiveWriteHost';
import Pc3LiveReviewHost from './Pc3LiveReviewHost';
import Pc3LiveDevelopHost from './Pc3LiveDevelopHost';

export default function Pc3LiveStudioHost() {
  const params = useSearchParams();
  const mode = params?.get('mode');
  if (mode === 'review') return <Pc3LiveReviewHost />;
  if (mode === 'develop') return <Pc3LiveDevelopHost />;
  return <Pc3LiveWriteHost />;
}
