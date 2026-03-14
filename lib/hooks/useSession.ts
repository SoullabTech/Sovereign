'use client';

/**
 * useSession Hook
 *
 * Client-side session management for access control.
 * Reads tier/roles from cookies for immediate UI gating.
 * Can refresh session from server to sync cookies with DB.
 *
 * Usage:
 *   const { tier, roles, refreshSession, isLoading } = useSession();
 *
 *   // After Stripe checkout success:
 *   await refreshSession();
 *
 *   // Check tier for UI gating:
 *   if (tier === 'pro') { ... }
 *
 *   // Check roles:
 *   if (hasRole('practitioner')) { ... }
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Tier, Role } from '@/config/accessMatrix';

interface MemberData {
  id: string;
  username: string;
  name: string;
  preferredName: string;
  onboarded: boolean;
  onboardingStep: string;
  tier: Tier;
  roles: Role[];
}

interface SessionState {
  authenticated: boolean;
  member: MemberData | null;
  tier: Tier;
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Parse a cookie value from document.cookie
 * NOTE: maia_tier and maia_roles are HttpOnly and cannot be read here.
 * Use validateSession() to get authoritative tier/roles from the server.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    authenticated: false,
    member: null,
    tier: 'free',
    roles: ['member'],
    isLoading: true,
    error: null,
  });

  /**
   * Read initial state from cookies (no server call)
   * NOTE: tier/roles are HttpOnly and not readable here — returns defaults.
   * Call validateSession() to get authoritative state from the server.
   */
  const readFromCookies = useCallback(() => {
    // maia_session is HttpOnly, so this will be null — authenticated state
    // comes from validateSession(). Returning safe defaults here.
    setState(prev => ({
      ...prev,
      tier: 'free',
      roles: ['member'],
      authenticated: false,
      isLoading: false,
    }));

    return { tier: 'free' as Tier, roles: ['member'] as Role[], authenticated: false };
  }, []);

  /**
   * Refresh session from server
   * Validates session and syncs cookies with fresh DB data
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/members/session', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.refreshed) {
        setState(prev => ({
          ...prev,
          authenticated: false,
          member: null,
          isLoading: false,
          error: data.reason || 'Session refresh failed',
        }));
        return false;
      }

      setState({
        authenticated: true,
        member: data.member,
        tier: data.member.tier,
        roles: data.member.roles,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Network error',
      }));
      return false;
    }
  }, []);

  /**
   * Validate session with server (GET - doesn't modify cookies)
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/members/session', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.authenticated) {
        setState(prev => ({
          ...prev,
          authenticated: false,
          member: null,
          isLoading: false,
          error: data.reason || null,
        }));
        return false;
      }

      setState({
        authenticated: true,
        member: data.member,
        tier: data.member.tier,
        roles: data.member.roles,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Network error',
      }));
      return false;
    }
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role: Role): boolean => {
    return state.roles.includes(role);
  }, [state.roles]);

  /**
   * Check if user has minimum tier
   */
  const hasTier = useCallback((minTier: Tier): boolean => {
    const tierHierarchy: Tier[] = ['free', 'personal', 'pro'];
    const userTierIndex = tierHierarchy.indexOf(state.tier);
    const minTierIndex = tierHierarchy.indexOf(minTier);
    return userTierIndex >= minTierIndex;
  }, [state.tier]);

  // On mount, validate session with server to get authoritative tier/roles.
  // (maia_tier and maia_roles are HttpOnly — cannot be read client-side.)
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Memoize common checks
  const isPro = useMemo(() => state.tier === 'pro', [state.tier]);
  const isPersonal = useMemo(() => state.tier === 'personal' || state.tier === 'pro', [state.tier]);
  const isPractitioner = useMemo(() => state.roles.includes('practitioner'), [state.roles]);
  const isAdmin = useMemo(() => state.roles.includes('admin'), [state.roles]);
  const isCurator = useMemo(() => state.roles.includes('curator'), [state.roles]);

  return {
    // State
    authenticated: state.authenticated,
    member: state.member,
    tier: state.tier,
    roles: state.roles,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    refreshSession,
    validateSession,
    readFromCookies,

    // Helpers
    hasRole,
    hasTier,

    // Convenience booleans
    isPro,
    isPersonal,
    isPractitioner,
    isAdmin,
    isCurator,
  };
}

export default useSession;
