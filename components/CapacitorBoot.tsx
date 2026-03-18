'use client';

/**
 * CapacitorBoot — global iOS splash hide safety net.
 *
 * Runs on every page load, not just /enter. This means even if the
 * /enter route fails to hydrate or the user deep-links directly to
 * another route, the native SplashScreen is still dismissed.
 *
 * Design rules:
 * - Dynamic import only (prevents SSR crash from window/Capacitor references)
 * - Instant hide (fadeOutDuration: 0) — no animation race with routing
 * - Silent fail — never blocks the app if the plugin is unavailable
 * - Cancel token — avoids state update warnings if component unmounts
 */
import { useEffect } from 'react';

export function CapacitorBoot() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { SplashScreen } = await import('@capacitor/splash-screen');
        if (!cancelled) {
          await SplashScreen.hide({ fadeOutDuration: 0 });
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('[CapacitorBoot] SplashScreen.hide failed (non-fatal):', e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
