'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  useEffect(() => {
    // ONE-SHOT REDIRECT GUARD: Redirect once per app session, then become inert
    // Uses sessionStorage (cleared on app restart, survives page reloads)
    const onceKey = 'maia_root_redirect_once';
    if (sessionStorage.getItem(onceKey) === '1') {
      console.warn('[ROOT PAGE] Redirect guard tripped — refusing to redirect again this session');
      setDebugInfo('Redirect already performed this session. Staying on root page.');
      return;
    }
    sessionStorage.setItem(onceKey, '1');

    console.log('[ROOT PAGE] ===== ROUTING START =====');
    console.log('[ROOT PAGE] location:', window.location.href);

    // SIGNOUT LATCH: If user explicitly signed out, route to signin immediately
    // This latch survives iOS WebView restore and overrides all "returning user" logic
    const signedOut = localStorage.getItem('maia_signed_out') === '1';
    if (signedOut) {
      console.log('[NAV] / -> /signin (reason: signout latch active)');
      window.location.replace('/signin?from=signed_out_latch');
      return;
    }

    // THREE-WAY ROUTING LOGIC:
    // 1. User currently authenticated (active session) → /maia
    // 2. User has ANY prior MAIA data (signed out) → /welcome-back (returning user)
    // 3. Completely empty localStorage → /begin (brand new user)

    const betaUser = localStorage.getItem('beta_user');
    const betaOnboardingComplete = localStorage.getItem('betaOnboardingComplete');
    const explorerId = localStorage.getItem('explorerId');
    const explorerName = localStorage.getItem('explorerName');

    console.log('[ROOT PAGE] localStorage state:', {
      betaUser: betaUser ? 'present' : 'null',
      betaOnboardingComplete,
      explorerId,
      explorerName,
    });

    // Case 1: User has ACTIVE SESSION - go straight to MAIA
    if (betaUser) {
      console.log('[NAV] / -> /maia (reason: active session)');
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
      console.log('[NAV] / -> /welcome-back (reason: returning user)');
      router.replace('/welcome-back');
      return;
    }

    // Case 3: Completely clean localStorage - brand new user
    console.log('[NAV] / -> /begin (reason: fresh install)');
    router.replace('/begin');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <p style={{ marginBottom: '10px' }}>Redirecting...</p>
      <p style={{ fontSize: '12px', color: '#666', maxWidth: '300px', textAlign: 'center' }}>{debugInfo}</p>
    </div>
  );
}