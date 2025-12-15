'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // THREE-WAY ROUTING LOGIC:
    // 1. User currently authenticated (active session) → /maia
    // 2. User has ANY prior MAIA data (signed out) → /welcome-back (returning user)
    // 3. Completely empty localStorage → /begin (brand new user)

    const betaUser = localStorage.getItem('beta_user');
    const betaOnboardingComplete = localStorage.getItem('betaOnboardingComplete');
    const explorerId = localStorage.getItem('explorerId');
    const explorerName = localStorage.getItem('explorerName');

    // Case 1: User has ACTIVE SESSION - go straight to MAIA
    if (betaUser) {
      router.replace('/maia');
      return;
    }

    // Case 2: Detect ANY MAIA-related data in localStorage = returning user
    // Check for common MAIA keys to detect if user has been here before
    const hasAnyMaiaData =
      betaOnboardingComplete ||
      explorerId ||
      explorerName ||
      localStorage.getItem('maiaPermanentUser') ||
      localStorage.getItem('betaUserId') ||
      localStorage.getItem('beta_user') ||
      Object.keys(localStorage).some(key =>
        key.includes('maia') ||
        key.includes('explorer') ||
        key.includes('beta')
      );

    if (hasAnyMaiaData) {
      router.replace('/welcome-back');
      return;
    }

    // Case 3: Completely clean localStorage - brand new user
    router.replace('/begin');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Redirecting...</p>
    </div>
  );
}