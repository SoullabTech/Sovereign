'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Simple routing: new users go to begin, returning users go to welcome-back
    const betaUser = localStorage.getItem('beta_user');

    if (betaUser) {
      router.replace('/welcome-back');
    } else {
      router.replace('/begin');
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Redirecting...</p>
    </div>
  );
}