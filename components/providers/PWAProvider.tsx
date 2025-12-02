'use client';

import { useEffect, useState } from 'react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw-enhanced.js')
          .then((reg) => {
            console.log('✅ PWA Service Worker registered:', reg.scope);
            setRegistration(reg);

            // Disable automatic updates - removed to prevent glitches
            // Updates will only happen on manual page refresh
            console.log('✅ PWA registered without auto-updates to prevent glitches');
          })
          .catch((error) => {
            console.error('❌ PWA Service Worker registration failed:', error);
          });
      });
    }

    // iOS specific: Check if running in standalone mode
    if ((window.navigator as any).standalone && document?.documentElement) {
      document.documentElement.classList.add('ios-standalone');
    }

    // Add install state to body for CSS hooks
    if (window.matchMedia('(display-mode: standalone)').matches && document?.documentElement) {
      document.documentElement.classList.add('pwa-installed');
    }
  }, []);

  // Auto-update function removed to prevent glitches
  // Updates now only happen on manual page refresh

  return (
    <>
      {children}
      {/* Popup removed - auto-update happens silently */}
    </>
  );
}