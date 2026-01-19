'use client';

import { useState, useCallback } from 'react';
import { clearIdentityCache, healIdentity, HealResult } from '@/lib/identity/healIdentity';

interface ConnectionRecoveryProps {
  error?: string;
  correlationId?: string;
  onRetry?: () => void;
  onRecovered?: () => void;
  showResetOption?: boolean;
}

/**
 * Circuit Breaker UI Component
 *
 * Shows when the app can't reach MAIA, with:
 * - Retry button (one silent retry, then show this)
 * - Reset Local Cache button (in-app, no Safari inspector)
 * - Correlation ID for debugging
 *
 * Usage:
 *   <ConnectionRecovery
 *     error="Unable to load settings"
 *     correlationId="req_abc123"
 *     onRetry={() => refetch()}
 *     onRecovered={() => setError(null)}
 *   />
 */
export function ConnectionRecovery({
  error = 'Unable to reach MAIA',
  correlationId,
  onRetry,
  onRecovered,
  showResetOption = true,
}: ConnectionRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [healResult, setHealResult] = useState<HealResult | null>(null);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setHealResult(null);

    try {
      // First, try to heal identity
      const result = await healIdentity({ timeout: 5000, retries: 1 });
      setHealResult(result);

      if (result.status === 'healed' || result.status === 'healthy') {
        // Identity is good, trigger retry of original action
        onRetry?.();
        onRecovered?.();
      } else if (result.status === 'reauth_required') {
        // Need to re-authenticate - redirect to sign in
        window.location.href = '/signin';
      }
      // For 'offline' or 'error', we just show the result
    } catch (err) {
      console.error('[ConnectionRecovery] Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, onRecovered]);

  const handleResetCache = useCallback(() => {
    setIsResetting(true);

    try {
      // Clear all identity-related local storage
      clearIdentityCache();

      // Also clear any other app caches that might be corrupted
      const additionalKeys = [
        'voice_settings',
        'maia_presence',
        'last_conversation_id',
      ];
      additionalKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore errors
        }
      });

      // Redirect to sign in after clearing
      setTimeout(() => {
        window.location.href = '/signin?reset=true';
      }, 500);
    } catch (err) {
      console.error('[ConnectionRecovery] Reset failed:', err);
      setIsResetting(false);
    }
  }, []);

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-amber-200">Connection Issue</h3>
          <p className="text-sm text-stone-400">{error}</p>
        </div>
      </div>

      {/* Heal Result Feedback */}
      {healResult && healResult.status !== 'healed' && healResult.status !== 'healthy' && (
        <div className="mb-4 p-3 rounded bg-stone-800/50 text-sm">
          {healResult.status === 'offline' && (
            <p className="text-stone-300">
              Service is temporarily unavailable. Please check your connection and try again.
            </p>
          )}
          {healResult.status === 'reauth_required' && (
            <p className="text-amber-300">
              Your session has expired. You'll be redirected to sign in.
            </p>
          )}
          {healResult.status === 'error' && (
            <p className="text-red-300">
              An error occurred. If this persists, try resetting your local cache.
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleRetry}
          disabled={isRetrying || isResetting}
          className="w-full px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isRetrying ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Reconnecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
            </>
          )}
        </button>

        {showResetOption && (
          <button
            onClick={handleResetCache}
            disabled={isRetrying || isResetting}
            className="w-full px-4 py-2.5 rounded-lg border border-stone-600 hover:border-stone-500 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-stone-300 font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isResetting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Resetting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Reset Local Cache
              </>
            )}
          </button>
        )}
      </div>

      {/* Correlation ID for debugging */}
      {correlationId && (
        <p className="mt-4 text-xs text-stone-500 text-center font-mono">
          Reference: {correlationId}
        </p>
      )}

      {/* Help text */}
      <p className="mt-4 text-xs text-stone-500 text-center">
        If this keeps happening, try "Reset Local Cache" to clear stored data and sign in fresh.
      </p>
    </div>
  );
}

export default ConnectionRecovery;
