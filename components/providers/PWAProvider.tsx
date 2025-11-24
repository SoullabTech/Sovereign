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

            // Check for updates periodically
            setInterval(() => {
              reg.update();
            }, 60 * 60 * 1000); // Check every hour

            // Handle updates - Auto-update without user interaction
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                    console.log('🆕 New version available! Auto-updating...');
                    // Auto-update instead of showing popup
                    handleAutoUpdate(reg);
                  }
                });
              }
            });
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

  const handleAutoUpdate = (registration: ServiceWorkerRegistration) => {
    console.log('🔄 Auto-update initiated, registration:', registration);

    if (registration?.waiting) {
      console.log('✅ Waiting worker found, sending SKIP_WAITING');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Listen for controlling state change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Controller changed, auto-reloading...');
        // Auto-reload silently (in both dev and production)
        window.location.reload();
      });
    } else {
      // Fallback: just reload if no waiting worker
      console.log('⚠️ No waiting worker, forcing reload');
      window.location.reload();
    }
  };

  return (
    <>
      {children}
      {/* Popup removed - auto-update happens silently */}
    </>
  );
}