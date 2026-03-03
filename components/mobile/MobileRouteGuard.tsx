'use client';

/**
 * MobileRouteGuard
 *
 * Enforces the mobile route allowlist and entitlement gates in the Capacitor app.
 * Has zero effect on web (returns children immediately when not native).
 *
 * Three outcomes for a given route on iOS:
 *
 *   1. Allowed + entitled       → render children
 *   2. Web-only route           → render <OpenInWebScreen> (no auth needed)
 *   3. Studio route + no access → render <StudioUpsellScreen>
 *
 * Approach:
 *   - Synchronous path: uses localStorage beta_user.tier for instant Studio gate
 *   - Async path: fetches /api/members/me once per session to get roles (beta_tester)
 *   - Web-only routes bypass the async path entirely (immediate decision)
 *
 * On web (non-native Capacitor): passes children through with no computation.
 */

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  isMobileRoute,
  isWebOnlyRoute,
  isStudioMobileRoute,
  WEB_STUDIO_BASE_URL,
} from '@/lib/mobile/mobileAllowlist';
import {
  getMobileEntitlements,
  type MobileMemberData,
  type MobileEntitlements,
} from '@/lib/mobile/mobileEntitlements';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';
import { apiFetch } from '@/lib/http/apiBase';

// ─── Lazy Capacitor import ────────────────────────────────────────────────────
// Capacitor is a native-only dependency. Import lazily so SSR / web builds
// don't try to resolve it.

function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Capacitor } = require('@capacitor/core');
    return Boolean(Capacitor?.isNativePlatform?.());
  } catch {
    return false;
  }
}

// ─── Module-level session cache ───────────────────────────────────────────────
// Avoid re-fetching on every navigation within a session.
let _cachedEntitlements: MobileEntitlements | null = null;
let _fetchPromise: Promise<MobileEntitlements> | null = null;

function getLocalTier(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('beta_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.tier ?? null;
  } catch {
    return null;
  }
}

async function fetchEntitlements(): Promise<MobileEntitlements> {
  if (_cachedEntitlements) return _cachedEntitlements;

  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    try {
      const memberId = getLocalMemberId();
      const res = await apiFetch('/api/members/me', {
        headers: memberId ? { 'x-member-id': memberId } : undefined,
      });
      const data = await res.json();
      const member: MobileMemberData = {
        tier: data?.member?.tier ?? getLocalTier(),
        roles: data?.member?.roles ?? null,
      };
      _cachedEntitlements = getMobileEntitlements(member);
    } catch {
      // Fallback: derive from localStorage tier only (no roles = no beta_tester)
      _cachedEntitlements = getMobileEntitlements({ tier: getLocalTier() });
    }
    _fetchPromise = null;
    return _cachedEntitlements!;
  })();

  return _fetchPromise;
}

/** Reset the cache (call on sign-out or sign-in). */
export function resetMobileEntitlementsCache() {
  _cachedEntitlements = null;
  _fetchPromise = null;
}

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function OpenInWebScreen({ pathname }: { pathname: string }) {
  const webUrl = `${WEB_STUDIO_BASE_URL}${pathname}`;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-amber-100 px-8 text-center gap-6">
      <div className="text-4xl">🌐</div>
      <h1 className="text-xl font-semibold text-amber-200">Available in Web Studio</h1>
      <p className="text-sm text-zinc-400 max-w-xs">
        This tool is part of the full Studio experience. Open it in your browser to continue.
      </p>
      <a
        href={webUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 px-6 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40
                   text-amber-200 text-sm font-medium hover:bg-amber-500/30 transition-colors"
      >
        Open in Web Studio →
      </a>
    </div>
  );
}

function StudioUpsellScreen() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-amber-100 px-8 text-center gap-6">
      <div className="text-4xl">⚡</div>
      <h1 className="text-xl font-semibold text-amber-200">Studio Access</h1>
      <p className="text-sm text-zinc-400 max-w-xs">
        Studio tools are available on the Pro plan. Upgrade to manage clients, sessions, and practice operations.
      </p>
      <button
        onClick={() => router.push('/maia')}
        className="mt-2 px-6 py-3 rounded-xl bg-zinc-800 border border-zinc-700
                   text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
      >
        Back to MAIA
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type GuardState =
  | 'checking'    // async fetch in flight
  | 'allow'       // render children
  | 'web-only'    // show OpenInWeb
  | 'upsell';     // show Studio upsell

interface MobileRouteGuardProps {
  children: React.ReactNode;
}

export function MobileRouteGuard({ children }: MobileRouteGuardProps) {
  const pathname = usePathname();
  const [state, setState] = useState<GuardState>('checking');
  const currentPath = useRef(pathname);

  useEffect(() => {
    currentPath.current = pathname;

    // No-op on web — this guard only runs in the Capacitor shell
    if (!isNativePlatform()) {
      setState('allow');
      return;
    }

    // Route not in allowlist at all — decide immediately without server call
    if (!isMobileRoute(pathname)) {
      setState(isWebOnlyRoute(pathname) ? 'web-only' : 'web-only');
      return;
    }

    // MAIA core and onboarding routes — allow immediately from localStorage
    if (!isStudioMobileRoute(pathname)) {
      setState('allow');
      return;
    }

    // Studio route — needs entitlement check
    // Optimistic: use localStorage tier for instant decision while server fetch resolves
    const localTier = getLocalTier();
    const optimistic = getMobileEntitlements({ tier: localTier });

    if (optimistic.canAccessStudio) {
      // Already entitled by tier — allow immediately and verify async
      setState('allow');
    }

    // Fetch authoritative entitlements (may upgrade access for beta_tester)
    fetchEntitlements().then((ent) => {
      // Guard path may have changed during async fetch; abort stale check
      if (currentPath.current !== pathname) return;

      if (ent.canAccessStudio) {
        setState('allow');
      } else {
        setState('upsell');
      }
    });
  }, [pathname]);

  if (state === 'checking') {
    // Show nothing while checking (avoids flash of wrong screen)
    // For Studio routes this is sub-second; MAIA routes skip to 'allow' synchronously
    return null;
  }

  if (state === 'web-only') {
    return <OpenInWebScreen pathname={pathname} />;
  }

  if (state === 'upsell') {
    return <StudioUpsellScreen />;
  }

  return <>{children}</>;
}
