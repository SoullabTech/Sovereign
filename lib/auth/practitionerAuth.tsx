"use client";

/**
 * PRACTITIONER AUTH PROVIDER
 *
 * Handles authentication and authorization for practitioner admin pages
 * Validates practitioner ownership and provides context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Practitioner } from '@/lib/stellium/types';

/**
 * Shape of practitioner context stored in localStorage
 */
interface StoredPractitionerContext {
  id: string;
  slug: string;
  name: string;
}

/**
 * Hook return type for usePractitionerContext
 */
interface PractitionerContextResult {
  practitionerId: string | null;
  practitionerName: string;
  practitionerSlug: string | null;
  isLoading: boolean;
}

/**
 * Simple hook to get practitioner context from localStorage
 * Redirects to signup if no practitioner context exists
 *
 * Use this for stellium pages that need the practitioner ID
 * without making an API call to validate.
 */
export function usePractitionerContext(redirectOnMissing = true): PractitionerContextResult {
  const router = useRouter();
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [practitionerName, setPractitionerName] = useState<string>('there');
  const [practitionerSlug, setPractitionerSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for practitioner_context
    const storedContext = localStorage.getItem('practitioner_context');
    if (storedContext) {
      try {
        const ctx: StoredPractitionerContext = JSON.parse(storedContext);

        // SAFETY TRIPWIRE: Reject demo/placeholder IDs
        // This ensures no "demo-practitioner" fallback ever sneaks back into production
        const isDemoId = !ctx.id || ctx.id.includes('demo') || ctx.id === 'demo-practitioner';
        const isDemoSlug = ctx.slug?.includes('demo') || ctx.slug === 'demo-practitioner';

        if (isDemoId || isDemoSlug) {
          console.warn('[usePractitionerContext] Rejected demo practitioner context - clearing and redirecting');
          localStorage.removeItem('practitioner_context');
          // Leave breadcrumb so signup page can explain what happened
          sessionStorage.setItem('practitioner_context_reset_reason', 'demo_id_detected');
          if (redirectOnMissing) {
            router.push('/practitioners/signup');
          }
          setIsLoading(false);
          return;
        }

        // Validate required fields
        if (!ctx.id || !ctx.slug) {
          console.warn('[usePractitionerContext] Invalid context (missing id or slug) - clearing');
          localStorage.removeItem('practitioner_context');
        } else {
          setPractitionerId(ctx.id);
          setPractitionerName(ctx.name || 'there');
          setPractitionerSlug(ctx.slug);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('[usePractitionerContext] Failed to parse context:', e);
        localStorage.removeItem('practitioner_context');
      }
    }

    // No valid practitioner context found
    setIsLoading(false);
    if (redirectOnMissing) {
      router.push('/practitioners/signup');
    }
  }, [router, redirectOnMissing]);

  return { practitionerId, practitionerName, practitionerSlug, isLoading };
}

/**
 * Validates practitioner context is not a demo/placeholder
 * Returns true if valid, false if demo/invalid
 */
function isValidPractitionerContext(ctx: StoredPractitionerContext): boolean {
  if (!ctx.id || !ctx.slug) return false;

  const isDemoId = ctx.id.includes('demo') || ctx.id === 'demo-practitioner';
  const isDemoSlug = ctx.slug.includes('demo') || ctx.slug === 'demo-practitioner';

  return !isDemoId && !isDemoSlug;
}

/**
 * Utility to set practitioner context in localStorage
 * Called after practitioner creation/signup
 *
 * SAFETY: Rejects demo/placeholder IDs at write time
 * - Development: throws error (developer pain is good)
 * - Production: refuses write + redirects to signup (user always lands somewhere valid)
 */
export function setPractitionerContext(ctx: StoredPractitionerContext): void {
  if (!isValidPractitionerContext(ctx)) {
    console.error('[setPractitionerContext] Rejected invalid/demo context:', ctx);
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Cannot store demo or invalid practitioner context');
    }
    // Production: refuse write, leave breadcrumb, redirect to signup
    sessionStorage.setItem('practitioner_context_reset_reason', 'invalid_context_write');
    window.location.href = '/practitioners/signup';
    return;
  }
  localStorage.setItem('practitioner_context', JSON.stringify(ctx));
}

/**
 * Utility to clear practitioner context (e.g., on logout)
 */
export function clearPractitionerContext(): void {
  localStorage.removeItem('practitioner_context');
}

interface PractitionerAuthContextType {
  practitioner: Practitioner | null;
  practitionerId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PractitionerAuthContext = createContext<PractitionerAuthContextType>({
  practitioner: null,
  practitionerId: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  refetch: async () => {},
});

export function usePractitionerAuth() {
  const context = useContext(PractitionerAuthContext);
  if (!context) {
    throw new Error('usePractitionerAuth must be used within a PractitionerAuthProvider');
  }
  return context;
}

interface PractitionerAuthProviderProps {
  slug: string;
  children: ReactNode;
}

export function PractitionerAuthProvider({ slug, children }: PractitionerAuthProviderProps) {
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPractitioner = async () => {
    if (!slug) {
      setError('No practitioner slug provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get member_id from localStorage (set during signin)
      let memberId: string | null = null;
      if (typeof window !== 'undefined') {
        const betaUser = localStorage.getItem('beta_user');
        if (betaUser) {
          try {
            const user = JSON.parse(betaUser);
            memberId = user.id;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      const response = await fetch(`/api/portal/${slug}/auth`, {
        headers: memberId ? { 'x-member-id': memberId } : {},
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to access this page');
        } else if (response.status === 403) {
          setError('You do not have permission to access this page');
        } else if (response.status === 404) {
          setError('Practitioner not found');
        } else {
          setError('Failed to authenticate');
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setPractitioner(data.practitioner);
    } catch (err) {
      console.error('[PractitionerAuth] Error:', err);
      setError('Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPractitioner();
  }, [slug]);

  const value: PractitionerAuthContextType = {
    practitioner,
    practitionerId: practitioner?.id || null,
    isLoading,
    isAuthenticated: !!practitioner,
    error,
    refetch: fetchPractitioner,
  };

  return (
    <PractitionerAuthContext.Provider value={value}>
      {children}
    </PractitionerAuthContext.Provider>
  );
}

/**
 * HOC to require practitioner authentication
 */
export function withPractitionerAuth<P extends object>(
  Component: React.ComponentType<P & { practitioner: Practitioner }>
) {
  return function AuthenticatedComponent(props: P) {
    const { practitioner, isLoading, error, isAuthenticated } = usePractitionerAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-sacred-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      );
    }

    if (error || !isAuthenticated || !practitioner) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-6">{error || 'You need to sign in to access this page.'}</p>
            <a
              href="/signin"
              className="inline-flex items-center px-6 py-3 bg-sacred-gold text-gray-900 rounded-lg font-medium hover:bg-sacred-gold/90 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} practitioner={practitioner} />;
  };
}
