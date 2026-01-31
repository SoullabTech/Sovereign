'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

export default function RootPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();

    // NATIVE iOS: Do nothing here - redirect is handled by index.html ONLY
    // This prevents redirect loops from multiple scripts competing
    if (isNative) {
      console.log('[ROOT PAGE] Native detected - no redirect (handled by index.html)');
      return;
    }

    // WEB ONLY: One-shot redirect guard
    const onceKey = 'maia_root_redirect_once';
    if (sessionStorage.getItem(onceKey) === '1') {
      console.warn('[ROOT PAGE] Redirect guard tripped');
      setDebugInfo('Session error. Please refresh.');
      return;
    }
    sessionStorage.setItem(onceKey, '1');

    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      router.replace('/maia');
      return;
    }

    const hasAnyMaiaData = Object.keys(localStorage).some(key =>
      key.includes('maia') || key.includes('explorer') || key.includes('beta')
    );

    if (hasAnyMaiaData) {
      router.replace('/welcome-back');
    } else {
      router.replace('/begin');
    }
  }, [router]);

  // Show absolutely nothing on native - just a blank teal screen during instant redirect
  // On web, only show message if redirect guard trips
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #A0C4C7, #7FB5B3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {debugInfo && (
        <p style={{ fontSize: '14px', color: '#1a4a4a', textAlign: 'center' }}>{debugInfo}</p>
      )}
    </div>
  );
}
