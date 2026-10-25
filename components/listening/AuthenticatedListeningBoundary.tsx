'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { SOULLAB_SESSION_END_EVENT } from '@/lib/listening/audioFocus';
import {
  isOnlineListeningRoute,
  verifiedListeningMemberKey,
} from '@/lib/listening/listeningSessionBoundary';
import { PersistentListeningProvider } from './PersistentListeningProvider';

type ListeningRuntimeMode = 'online' | 'offline';

type AuthenticatedListeningBoundaryProps = {
  children: ReactNode;
  enabled: boolean;
  runtimeMode: ListeningRuntimeMode;
};

/**
 * LISTEN-41 · Browser-first authenticated lifecycle boundary.
 *
 * The root layout spans public and private routes, so the persistent transport
 * may not mount there without an independent member/session and route gate.
 * This boundary keeps ordinary page rendering untouched while mounting exactly
 * one listening transport only for a current, cookie-authenticated online
 * member on an approved Soullab destination.
 *
 * Safari/iOS header-token auth and Cabin-local identity are intentionally not
 * admitted by this candidate. Both fail closed and require separate reviews.
 */
export function AuthenticatedListeningBoundary({
  children,
  enabled,
  runtimeMode,
}: AuthenticatedListeningBoundaryProps) {
  const pathname = usePathname();
  const routeEligible =
    enabled && runtimeMode === 'online' && isOnlineListeningRoute(pathname);
  const [memberKey, setMemberKey] = useState<string | null>(null);
  const requestGeneration = useRef(0);
  const requestController = useRef<AbortController | null>(null);
  const blockedBySessionEnd = useRef(false);

  const clearMember = useCallback(() => {
    requestGeneration.current += 1;
    requestController.current?.abort();
    requestController.current = null;
    setMemberKey(null);
  }, []);

  const verifyCurrentSession = useCallback(async () => {
    if (!routeEligible || blockedBySessionEnd.current) {
      clearMember();
      return;
    }

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    const generation = ++requestGeneration.current;

    try {
      const response = await apiFetch('/api/members/session', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (generation !== requestGeneration.current) return;
      if (!response.ok) {
        setMemberKey(null);
        return;
      }

      const payload: unknown = await response.json();
      if (generation !== requestGeneration.current) return;
      const nextMemberKey = verifiedListeningMemberKey(payload);
      setMemberKey(current => current === nextMemberKey ? current : nextMemberKey);
    } catch {
      // Route changes and newer rechecks intentionally abort older requests.
      // An aborted request is not an authentication failure and must never
      // tear down an otherwise current member's playing transport.
      if (controller.signal.aborted) return;
      if (generation === requestGeneration.current) setMemberKey(null);
    } finally {
      if (generation === requestGeneration.current)
        requestController.current = null;
    }
  }, [clearMember, routeEligible]);

  useEffect(() => {
    if (!routeEligible) {
      blockedBySessionEnd.current = false;
      requestGeneration.current += 1;
      requestController.current?.abort();
      requestController.current = null;
      // Rendering already unmounts the provider immediately on an ineligible
      // route. Retire the cached receipt outside the effect's synchronous body
      // so a later return must pass a fresh session check before remounting.
      const clearReceipt = window.setTimeout(() => setMemberKey(null), 0);
      return () => window.clearTimeout(clearReceipt);
    }
    const verifySession = window.setTimeout(() => {
      void verifyCurrentSession();
    }, 0);
    return () => {
      window.clearTimeout(verifySession);
      // Retire the in-flight request before aborting it. Otherwise its catch
      // can still look current during a fast eligible-route transition and
      // clear the member receipt, unmounting the one persistent transport.
      requestGeneration.current += 1;
      requestController.current?.abort();
      requestController.current = null;
    };
  }, [pathname, routeEligible, verifyCurrentSession]);

  useEffect(() => {
    if (!routeEligible) return;

    const revalidate = () => void verifyCurrentSession();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') revalidate();
    };
    const onSessionEnd = () => {
      blockedBySessionEnd.current = true;
      clearMember();
    };

    window.addEventListener('focus', revalidate);
    window.addEventListener('online', revalidate);
    window.addEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = window.setInterval(revalidate, 60_000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', revalidate);
      window.removeEventListener('online', revalidate);
      window.removeEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [routeEligible, clearMember, verifyCurrentSession]);

  const activeMemberKey = routeEligible ? memberKey : null;
  if (!activeMemberKey) return <>{children}</>;
  return (
    <PersistentListeningProvider
      key={activeMemberKey}
      reviewMemberKey={activeMemberKey}
    >
      {children}
    </PersistentListeningProvider>
  );
}
