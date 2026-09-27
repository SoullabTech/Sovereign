'use client';

import { useSearchParams } from 'next/navigation';
import Pc3LiveWriteHost from './Pc3LiveWriteHost';
import Pc3LiveReviewHost from './Pc3LiveReviewHost';

export default function Pc3LiveStudioHost() {
  const params = useSearchParams();
  return params?.get('mode') === 'review'
    ? <Pc3LiveReviewHost />
    : <Pc3LiveWriteHost />;
}
