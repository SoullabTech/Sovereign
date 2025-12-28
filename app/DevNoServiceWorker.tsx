'use client';

import { useEffect } from 'react';

export function DevNoServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    (async () => {
      try {
        // Unregister any existing service workers
        const regs = await navigator.serviceWorker?.getRegistrations?.();
        await Promise.all((regs ?? []).map(r => r.unregister()));

        // Nuke cache storage (this is where old bundles hang out)
        const keys = await caches?.keys?.();
        await Promise.all((keys ?? []).map(k => caches.delete(k)));

        console.log('🧹 [DEV] Cleared service workers + caches');
      } catch (e) {
        console.warn('🧹 [DEV] SW cleanup failed', e);
      }
    })();
  }, []);

  return null;
}
