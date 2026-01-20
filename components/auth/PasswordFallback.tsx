/**
 * Password Fallback
 *
 * Collapsible password sign-in for users without biometrics.
 */
'use client';

import { useState } from 'react';

type Props = {
  onSuccess?: (payload: unknown) => void;
  onError?: (msg: string | null) => void;
};

export function PasswordFallback({ onSuccess, onError }: Props) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signin() {
    onError?.(null);
    setLoading(true);
    try {
      const r = await fetch('/api/members/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        onError?.(data?.error || 'Invalid username or password');
        return;
      }
      onSuccess?.(data);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left text-sm text-white/80 hover:text-white"
      >
        {open ? 'Hide password' : 'Use password'}
      </button>

      {open ? (
        <div className="mt-3 space-y-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
          />
          <button
            disabled={loading}
            onClick={signin}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
