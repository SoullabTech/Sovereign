'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChangesSheet } from '@/components/maia/changes/ChangesSheet';
import ChangeRoom from '@/components/maia/changes/ChangeRoom';
import type { FacetCarryRef } from '@/components/house/FacetCarryNotice';

export default function ChangesThresholdPage() {
  const searchParams = useSearchParams();
  const [memberId, setMemberId] = useState('');

  useEffect(() => {
    const id = window.localStorage.getItem('memberId') || window.localStorage.getItem('beta_user') || '';
    setMemberId(id.replace(/^"|"$/g, ''));
  }, []);

  const initialChangeId = searchParams?.get('change') || null;

  const carrySourceRef = useMemo<FacetCarryRef | null>(() => {
    const sourceFacet = searchParams?.get('sourceFacet');
    const sourceRefId = searchParams?.get('sourceRefId');
    const crossingId = searchParams?.get('crossingId');
    if (
      (sourceFacet === 'journal' || sourceFacet === 'reflections' || sourceFacet === 'ideas' || sourceFacet === 'relationships') &&
      sourceRefId &&
      crossingId
    ) {
      return { sourceFacet, sourceRefId, crossingId };
    }
    return null;
  }, [searchParams]);

  if (!memberId) return <main style={{minHeight:'100vh',background:'#15120f',color:'#b9aa98',display:'grid',placeItems:'center'}}><Link href="/signin" style={{color:'inherit'}}>Sign in to enter Changes →</Link></main>;

  if (initialChangeId && !carrySourceRef) {
    return <ChangeRoom changeId={initialChangeId} />;
  }

  return (
    <ChangesSheet
      isOpen
      onClose={() => { window.location.href = '/house'; }}
      memberId={memberId}
      carrySourceRef={carrySourceRef}
      initialChangeId={initialChangeId}
      presentationMode="room"
    />
  );
}
