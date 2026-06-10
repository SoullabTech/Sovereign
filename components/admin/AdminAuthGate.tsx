'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getAdminPassword, setAdminPassword } from '@/lib/admin/adminFetch';

/**
 * Shared admin password gate. Wrap any admin dashboard whose routes are guarded
 * by isAdminRequest. Captures the admin password once (validated via
 * POST /api/admin/auth against LABTOOLS_ADMIN_PASSWORD), stores it via
 * setAdminPassword (sessionStorage), then renders children. adminFetch() then
 * injects it as `x-admin-password` on /api/admin/* calls.
 *
 * Single admin client path — replaces per-page password fields and the retired
 * `maia_admin_token` flow. The legacy auth route still validates the password;
 * we keep the password (not the throwaway token it returns).
 */
export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthed(!!getAdminPassword());
    setChecking(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAdminPassword(password);
        setPassword('');
        setAuthed(true);
      } else {
        setError('Invalid admin password');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;
  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-100 mb-6">Admin access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 mb-4"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminAuthGate;
