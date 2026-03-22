'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

// 🔍 MODULE BEACON — fires if this JS chunk loads at all (no React needed)
// If you never see this in Safari console, the chunk itself isn't executing.
if (typeof window !== 'undefined') {
  console.log('[ENTER:chunk] loaded url=' + window.location.pathname + ' t=' + Date.now());
}

async function hideSplash() {
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch {
    // Not running in Capacitor — no-op
  }
}

export default function EnterPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  // 🔍 RENDER BEACON — fires synchronously if React mounts this component.
  // If you see [ENTER:chunk] but NOT [ENTER:render], React is failing before mount.
  if (typeof document !== 'undefined') {
    (window as any).__maia_enter_rendered = true;
    document.documentElement.setAttribute('data-maia-enter', '1');
    console.log('[ENTER:render] component mounted t=' + Date.now());
  }

  useEffect(() => {
    // Hide splash immediately — this page is the iOS entry point.
    // If we don't call this here, the brown splash stays forever because
    // this page routes without painting, and WKWebView never gets unblocked.
    hideSplash();
    // NATIVE: On iOS, app-open is always a fresh start — clear web signout latch.
    // The web signout latch prevents auto-redirects on the browser, but native iOS
    // app restarts are not web-session restores. Clearing it lets the normal
    // routing logic run (beta_user → /maia, clean → /begin, etc.)
    if (Capacitor.isNativePlatform()) {
      localStorage.removeItem('maia_signed_out');
      console.log('[ENTER PAGE] Native: cleared web signout latch');
    }

    // ONE-SHOT REDIRECT GUARD: Redirect once per app session, then become inert
    // Uses sessionStorage (cleared on app restart, survives page reloads)
    const onceKey = 'maia_root_redirect_once';
    if (sessionStorage.getItem(onceKey) === '1') {
      console.warn('[ENTER PAGE] Redirect guard tripped — routing to safe destination');
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        router.replace('/maia');
      } else {
        router.replace('/signin');
      }
      return;
    }
    sessionStorage.setItem(onceKey, '1');

    console.log('[ENTER PAGE] ===== ROUTING START =====');
    console.log('[ENTER PAGE] location:', window.location.href);

    // SIGNOUT LATCH: If user explicitly signed out, route to signin immediately
    // This latch survives iOS WebView restore and overrides all "returning user" logic
    // NOTE: On native iOS this is cleared above; this path only runs on web builds.
    const signedOut = localStorage.getItem('maia_signed_out') === '1';
    if (signedOut) {
      console.log('[NAV] /enter -> /signin (reason: signout latch active)');
      // Use router.replace (client-side) — never window.location on iOS because
      // full document reloads re-trigger index.html → /enter → infinite loop.
      router.replace('/signin');
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

    console.log('[ENTER PAGE] localStorage state:', {
      betaUser: betaUser ? 'present' : 'null',
      betaOnboardingComplete,
      explorerId,
      explorerName,
    });

    // Case 1: User has ACTIVE SESSION - go straight to MAIA
    if (betaUser) {
      console.log('[NAV] /enter -> /maia (reason: active session)');
      router.replace('/maia');
      return;
    }

    // Case 2: Detect ANY MAIA-related data in localStorage = returning user
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
      console.log('[NAV] /enter -> /welcome-back (reason: returning user)');
      router.replace('/welcome-back');
      return;
    }

    // Case 3: Completely clean localStorage - brand new user
    console.log('[NAV] /enter -> /begin (reason: fresh install)');
    router.replace('/begin');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0b0f1c' }}>
      {/* Breathing aura */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.0) 70%)',
        animation: 'maiaBreath 2.5s ease-in-out infinite',
        marginBottom: 24,
      }} />
      <style>{`
        @keyframes maiaBreath {
          0%   { transform: scale(0.88); opacity: 0.5; }
          50%  { transform: scale(1.10); opacity: 0.9; }
          100% { transform: scale(0.88); opacity: 0.5; }
        }
      `}</style>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, letterSpacing: '0.12em' }}>
        Listening…
      </p>
    </div>
  );
}
