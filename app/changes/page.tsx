'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChangesSheet } from '@/components/maia/changes/ChangesSheet';

export default function ChangesThresholdPage() {
  const [memberId, setMemberId] = useState('');
  useEffect(() => {
    const id = window.localStorage.getItem('memberId') || window.localStorage.getItem('beta_user') || '';
    setMemberId(id.replace(/^"|"$/g, ''));
  }, []);

  if (!memberId) return <main style={{minHeight:'100vh',background:'#15120f',color:'#b9aa98',display:'grid',placeItems:'center'}}><Link href="/signin" style={{color:'inherit'}}>Sign in to enter Changes →</Link></main>;

  return <ChangesSheet isOpen onClose={() => { window.location.href = '/house'; }} memberId={memberId} />;
}
