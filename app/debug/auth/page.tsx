'use client';

/**
 * AUTH DEBUG PAGE
 *
 * Dev-only diagnostic panel for auth issues.
 * Shows the split between client-side state and server-side truth.
 *
 * Usage: Navigate to /debug/auth to see current auth state.
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { WhoamiResponse } from '@/app/api/auth/whoami/route';

interface LocalStorageState {
  beta_user: any;
  beta_users: any;
  soullab_member: any;
  maia_session_version: string | null;
}

interface CookieInfo {
  maia_member_id: string | null;
  maia_tier: string | null;
  maia_roles: string | null;
  // Note: maia_session is httpOnly, so we can't read it from JS
}

export default function AuthDebugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-gray-100 p-6">Loading...</div>}>
      <AuthDebugContent />
    </Suspense>
  );
}

function AuthDebugContent() {
  const searchParams = useSearchParams();
  const [serverState, setServerState] = useState<WhoamiResponse | null>(null);
  const [localStorageState, setLocalStorageState] = useState<LocalStorageState | null>(null);
  const [cookieInfo, setCookieInfo] = useState<CookieInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectReason = searchParams.get('reason');
  const redirectNext = searchParams.get('next');
  const incidentId = searchParams.get('rid');

  useEffect(() => {
    // Read localStorage
    const readLocalStorage = () => {
      try {
        const betaUser = localStorage.getItem('beta_user');
        const betaUsers = localStorage.getItem('beta_users');
        const soullabMember = localStorage.getItem('soullab_member');
        const sessionVersion = localStorage.getItem('maia_session_version');

        setLocalStorageState({
          beta_user: betaUser ? JSON.parse(betaUser) : null,
          beta_users: betaUsers ? JSON.parse(betaUsers) : null,
          soullab_member: soullabMember ? JSON.parse(soullabMember) : null,
          maia_session_version: sessionVersion,
        });
      } catch (e) {
        console.error('[AuthDebug] localStorage parse error:', e);
        setLocalStorageState(null);
      }
    };

    // Read accessible cookies
    const readCookies = () => {
      const getCookie = (name: string): string | null => {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? decodeURIComponent(match[2]) : null;
      };

      setCookieInfo({
        maia_member_id: getCookie('maia_member_id'),
        maia_tier: getCookie('maia_tier'),
        maia_roles: getCookie('maia_roles'),
      });
    };

    // Fetch server state
    const fetchServerState = async () => {
      try {
        const res = await fetch('/api/auth/whoami', {
          credentials: 'include',
        });
        const data = await res.json();
        setServerState(data);
      } catch (e) {
        setError(`Failed to fetch /api/auth/whoami: ${e}`);
      } finally {
        setLoading(false);
      }
    };

    readLocalStorage();
    readCookies();
    fetchServerState();
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem('beta_user');
    localStorage.removeItem('beta_users');
    localStorage.removeItem('soullab_member');
    localStorage.removeItem('maia_session_version');
    window.location.reload();
  };

  const signOut = async () => {
    try {
      await fetch('/api/members/signout', {
        method: 'POST',
        credentials: 'include',
      });
      clearLocalStorage();
    } catch (e) {
      console.error('[AuthDebug] Signout error:', e);
    }
  };

  // Check for split-brain condition
  const hasSplitBrain = serverState && localStorageState && (
    (serverState.authed && !localStorageState.beta_user) ||
    (!serverState.authed && localStorageState.beta_user) ||
    (serverState.authed && localStorageState.beta_user?.id !== serverState.memberId)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-yellow-400 mb-2">Auth Debug Panel</h1>
        <p className="text-gray-400 text-sm mb-6">
          Dev-only diagnostic for authentication state
        </p>

        {/* Redirect Info */}
        {(redirectReason || redirectNext || incidentId) && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <h2 className="text-red-400 font-semibold mb-2">Redirect Detected</h2>
            {incidentId && (
              <p className="text-sm mb-2">
                <span className="text-gray-400">Incident ID:</span>{' '}
                <code className="bg-yellow-900 px-2 py-0.5 rounded text-yellow-300 font-mono">{incidentId}</code>
                <span className="text-gray-500 text-xs ml-2">(share this for debugging)</span>
              </p>
            )}
            {redirectReason && (
              <p className="text-sm">
                <span className="text-gray-400">Reason:</span>{' '}
                <code className="bg-red-900 px-2 py-0.5 rounded">{redirectReason}</code>
              </p>
            )}
            {redirectNext && (
              <p className="text-sm mt-1">
                <span className="text-gray-400">Intended destination:</span>{' '}
                <code className="bg-gray-800 px-2 py-0.5 rounded">{redirectNext}</code>
              </p>
            )}
          </div>
        )}

        {/* Split Brain Warning */}
        {hasSplitBrain && (
          <div className="bg-amber-900/50 border border-amber-500 rounded-lg p-4 mb-6">
            <h2 className="text-amber-400 font-semibold mb-2">Split Brain Detected</h2>
            <p className="text-sm text-amber-200">
              Client-side state (localStorage) disagrees with server-side session.
              This is the most common cause of "signed in but app acts logged out."
            </p>
            <button
              onClick={clearLocalStorage}
              className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-sm"
            >
              Clear localStorage & Reload
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Server State (Source of Truth) */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Server State (Truth)
            </h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : error ? (
              <p className="text-red-400 text-sm">{error}</p>
            ) : serverState ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Authenticated:</span>{' '}
                  <span className={serverState.authed ? 'text-green-400' : 'text-red-400'}>
                    {serverState.authed ? 'YES' : 'NO'}
                  </span>
                </p>
                {serverState.authed ? (
                  <>
                    <p>
                      <span className="text-gray-400">Member ID:</span>{' '}
                      <code className="text-xs bg-gray-700 px-1 rounded">{serverState.memberId}</code>
                    </p>
                    <p>
                      <span className="text-gray-400">Username:</span> {serverState.username}
                    </p>
                    <p>
                      <span className="text-gray-400">Name:</span> {serverState.preferredName || serverState.name}
                    </p>
                    <p>
                      <span className="text-gray-400">Tier:</span> {serverState.tier}
                    </p>
                    <p>
                      <span className="text-gray-400">Practitioner:</span>{' '}
                      {serverState.isPractitioner ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <span className="text-gray-400">Session expires:</span>{' '}
                      {serverState.expiresAt ? new Date(serverState.expiresAt).toLocaleString() : 'Unknown'}
                    </p>
                  </>
                ) : (
                  <p>
                    <span className="text-gray-400">Reason:</span>{' '}
                    <code className="bg-red-900 px-2 py-0.5 rounded">{serverState.reason}</code>
                  </p>
                )}
                {serverState.debug && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-gray-500 text-xs">
                      Cookie present: {serverState.debug.hasCookie ? 'Yes' : 'No'}
                      {serverState.debug.cookieLength && ` (${serverState.debug.cookieLength} chars)`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No data</p>
            )}
          </div>

          {/* Client State (localStorage) */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Client State (localStorage)
            </h2>
            {localStorageState ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">beta_user:</p>
                  {localStorageState.beta_user ? (
                    <pre className="text-xs bg-gray-700 p-2 rounded overflow-x-auto">
                      {JSON.stringify(localStorageState.beta_user, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-500 text-xs">null</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-400 mb-1">soullab_member:</p>
                  {localStorageState.soullab_member ? (
                    <pre className="text-xs bg-gray-700 p-2 rounded overflow-x-auto max-h-32">
                      {JSON.stringify(localStorageState.soullab_member, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-500 text-xs">null</p>
                  )}
                </div>
                {localStorageState.beta_users && (
                  <div>
                    <p className="text-red-400 mb-1">beta_users (DEPRECATED - contains plaintext passwords!):</p>
                    <p className="text-xs text-red-300">
                      {Object.keys(localStorageState.beta_users).length} user(s) stored
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No localStorage data</p>
            )}
          </div>

          {/* Cookie Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Readable Cookies
            </h2>
            {cookieInfo ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">maia_member_id:</span>{' '}
                  {cookieInfo.maia_member_id ? (
                    <code className="text-xs bg-gray-700 px-1 rounded">{cookieInfo.maia_member_id}</code>
                  ) : (
                    <span className="text-gray-500">not set</span>
                  )}
                </p>
                <p>
                  <span className="text-gray-400">maia_tier:</span>{' '}
                  {cookieInfo.maia_tier || <span className="text-gray-500">not set</span>}
                </p>
                <p>
                  <span className="text-gray-400">maia_roles:</span>{' '}
                  {cookieInfo.maia_roles || <span className="text-gray-500">not set</span>}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Note: maia_session is httpOnly and cannot be read from JavaScript (this is correct for security)
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No cookie data</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-gray-400 font-semibold mb-3">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={clearLocalStorage}
                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-sm"
              >
                Clear localStorage & Reload
              </button>
              <button
                onClick={signOut}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Full Sign Out (Server + Client)
              </button>
              <button
                onClick={() => window.location.href = '/signin'}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        {/* Quick Diagnosis */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-gray-400 font-semibold mb-3">Quick Diagnosis</h2>
          <div className="text-sm space-y-2">
            {serverState && !serverState.authed && serverState.reason === 'no_cookie' && (
              <p className="text-red-300">
                <strong>Problem:</strong> No session cookie present.
                <br />
                <span className="text-gray-400">
                  Possible causes: Never signed in, cookie cleared, cookie not being sent (SameSite/credentials issue).
                </span>
              </p>
            )}
            {serverState && !serverState.authed && serverState.reason === 'expired_session' && (
              <p className="text-amber-300">
                <strong>Problem:</strong> Session expired.
                <br />
                <span className="text-gray-400">
                  Solution: Sign in again.
                </span>
              </p>
            )}
            {serverState && !serverState.authed && serverState.reason === 'revoked_session' && (
              <p className="text-amber-300">
                <strong>Problem:</strong> Session was revoked (password change, manual signout elsewhere).
                <br />
                <span className="text-gray-400">
                  Solution: Sign in again.
                </span>
              </p>
            )}
            {hasSplitBrain && (
              <p className="text-amber-300">
                <strong>Problem:</strong> Split brain - client thinks one thing, server thinks another.
                <br />
                <span className="text-gray-400">
                  Solution: Clear localStorage using button above, then sign in fresh.
                </span>
              </p>
            )}
            {serverState?.authed && !hasSplitBrain && (
              <p className="text-green-300">
                <strong>Status:</strong> Auth state is healthy. Server and client agree.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
