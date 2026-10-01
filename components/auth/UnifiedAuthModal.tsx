/**
 * Unified Auth Modal
 *
 * Biometric-first authentication with OAuth and password fallbacks.
 * Used by both signin and signup pages.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import { deviceTrust } from '@/lib/auth/deviceTrust';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { PasswordFallback } from '@/components/auth/PasswordFallback';

type Mode = 'signin' | 'signup';

type Props = {
  mode: Mode;
  onSuccess?: (payload: unknown) => void;
};

export function UnifiedAuthModal({ mode, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioPlatformAvailable, setBioPlatformAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional username field (helps if no discoverable credential yet)
  const [username, setUsername] = useState('');

  // Signup fields (password-based initial creation; passkey added right after)
  const [email, setEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);

  useEffect(() => {
    (async () => {
      const avail = await biometricAuth.getAvailability();
      setBioAvailable(avail.available);
      setBioPlatformAvailable(avail.platformAvailable);
    })();
  }, []);

  // Store session token for Safari/iOS before calling onSuccess
  function storeSessionAndNotify(payload: unknown) {
    const data = payload as { session?: { token?: string }; member?: { id: string } };
    if (data?.session?.token) {
      localStorage.setItem('maia_session_token', data.session.token);
      console.log('[UnifiedAuthModal] Stored session token for header-based auth');
    }
    if (data?.member?.id) {
      localStorage.setItem('memberId', data.member.id);
    }
    onSuccess?.(payload);
  }

  async function trustThisDevice() {
    try {
      await deviceTrust.trustDevice(undefined, 'standard');
    } catch {
      // non-blocking
    }
  }

  async function handlePasskeySignIn() {
    setError(null);
    setLoading(true);
    try {
      const res = await biometricAuth.authenticate(username ? username : undefined);

      if (!res.success) {
        setError(res.error || 'Passkey sign-in failed');
        return;
      }

      await trustThisDevice();

      storeSessionAndNotify(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Passkey sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupPasswordThenPasskey() {
    setError(null);
    setLoading(true);
    try {
      // 1) Create account via existing register endpoint
      const r = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: signupUsername,
          password,
          name,
          email,
          preferredName: name,
        }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data?.error || 'Signup failed');
        return;
      }

      // 2) Immediately add passkey (now we have a session cookie)
      if (bioAvailable && bioPlatformAvailable) {
        await biometricAuth.register();
      }

      // 3) Trust device (optional)
      await trustThisDevice();

      storeSessionAndNotify(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-white/70">
          {mode === 'signin'
            ? 'One tap if your device supports passkeys.'
            : 'Two steps. Personalization is skippable.'}
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {/* Primary: Passkey */}
      <button
        onClick={mode === 'signin' ? handlePasskeySignIn : handleSignupPasswordThenPasskey}
        disabled={loading || (mode === 'signin' && !bioAvailable)}
        className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-left hover:bg-white/15 disabled:opacity-50"
      >
        <div className="text-base font-medium">
          {mode === 'signin' ? `Use ${biometricLabel}` : `Create account${bioAvailable ? ` + add ${biometricLabel}` : ''}`}
        </div>
        <div className="mt-1 text-sm text-white/70">
          {bioAvailable
            ? mode === 'signin'
              ? 'Fastest and safest.'
              : 'We\'ll create your account, then add a passkey.'
            : mode === 'signin'
              ? 'Passkeys not available on this device/browser.'
              : 'Create your account with password.'}
        </div>
      </button>

      {/* Optional username for signin (helps non-discoverable cases) */}
      {mode === 'signin' ? (
        <div className="mt-3">
          <label className="mb-1 block text-xs text-white/60">Username (optional)</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Only needed if passkey isn't discoverable"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Username</label>
            <input
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Password (fallback)</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
            />
          </div>
        </div>
      )}

      {/* OAuth */}
      <div className="mt-5">
        <OAuthButtons />
      </div>

      {/* Magic link option */}
      <div className="mt-4">
        <MagicLinkForm />
      </div>

      {/* Password fallback (signin only) */}
      {mode === 'signin' ? (
        <div className="mt-4">
          <PasswordFallback onError={setError} onSuccess={onSuccess} />
        </div>
      ) : null}

      <div className="mt-5 text-xs text-white/50">
        Prefer not to use biometrics? Use OAuth, magic link, or password.
      </div>
    </div>
  );
}
