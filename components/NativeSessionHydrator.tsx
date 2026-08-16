'use client';

/**
 * NativeSessionHydrator — durable session restore on Capacitor cold start.
 *
 * On native (iOS/Android), localStorage is fragile across WebView resets,
 * low-memory eviction, and app backgrounding. This component runs once on
 * mount, hydrates identity-bearing keys from @capacitor/preferences into
 * localStorage, then refreshes the BetaSessionManager in-memory state.
 *
 * Web: no-op. localStorage is durable enough on browsers; the hydrator
 * resolves immediately and never touches state.
 *
 * Design rules (mirrors CapacitorBoot):
 *   - Dynamic import only (prevents SSR crash from window/Capacitor refs)
 *   - Silent fail — never blocks the app if hydration fails
 *   - Cancel token — avoids state update warnings if component unmounts
 *
 * Mounted in app/layout.tsx adjacent to <CapacitorBoot />.
 */
import { useEffect } from 'react';

export function NativeSessionHydrator() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { hydrateNativeSession } = await import('@/lib/storage/nativeSessionStorage');
        await hydrateNativeSession();

        if (cancelled) return;

        // Refresh BetaSessionManager's in-memory currentUser from the now-hydrated
        // localStorage. Without this, the singleton constructed at module-load time
        // still holds currentUser = null from its initial empty-localStorage read.
        const { betaSession } = await import('@/lib/auth/betaSession');
        betaSession.restoreSession();
      } catch (e) {
        if (!cancelled) {
          console.warn('[NativeSessionHydrator] hydrate failed (non-fatal):', e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
