/**
 * Biometric-First Sign In Page
 *
 * One-tap authentication with Face ID / Touch ID as primary.
 * Falls back to OAuth, magic link, or password.
 */
'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRightLeft, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import EthosFooter from '@/components/shared/EthosFooter';
import { betaSession } from '@/lib/auth/betaSession';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import { deviceTrust } from '@/lib/auth/deviceTrust';
import { setPractitionerContext } from '@/lib/auth/practitionerAuth';
import { api, ApiError } from '@/lib/api-client';
import { apiUrl, apiBaseUrl } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';
import { getFeatureFlag } from '@/lib/features/flags';

interface MigrationPreview {
  oldUserId: string;
  totalRecords: number;
  tables: { table: string; count: number }[];
}

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioPlatformAvailable, setBioPlatformAvailable] = useState(false);

  // Biometric signin (username optional for discoverable credentials)
  const [bioUsername, setBioUsername] = useState('');

  // Password visibility toggle
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Recovery
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Magic link
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkStatus, setMagicLinkStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Migration
  const [showMigration, setShowMigration] = useState(false);
  const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'done' | 'error'>('idle');
  const [pendingUser, setPendingUser] = useState<{ id: string; onboarded: boolean } | null>(null);

  // Passkey prompt after password signin
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [passkeyPromptStatus, setPasskeyPromptStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // Passkey renewal modal (for users with old/invalid passkeys)
  const [showPasskeyRenewal, setShowPasskeyRenewal] = useState(false);

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);

  // Feature flags - cached once per render
  const nativeOAuthEnabled = getFeatureFlag('NATIVE_OAUTH');

  // Check biometric availability
  useEffect(() => {
    (async () => {
      const avail = await biometricAuth.getAvailability();
      setBioAvailable(avail.available);
      setBioPlatformAvailable(avail.platformAvailable);
    })();
  }, []);

  // Check for magic link errors, username prefill, and auth reason codes
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    const magicParam = searchParams?.get('magic');
    const usernameParam = searchParams?.get('username');
    const reasonParam = searchParams?.get('reason');

    // Handle reason codes from middleware/auth redirects
    if (reasonParam) {
      const reasonMessages: Record<string, string> = {
        'no_session_cookie': 'Please sign in to continue.',
        'invalid_session': 'Your session is invalid. Please sign in again.',
        'expired_session': 'Your session has expired. Please sign in again.',
        'revoked_session': 'Your session was ended. Please sign in again.',
        'missing_credentials': 'Please enter your credentials to continue.',
      };
      const reasonError = reasonMessages[reasonParam];
      if (reasonError) {
        setError(reasonError);
      }
    }

    if (errorParam === 'invalid_token') {
      setError('Your sign-in link has expired or is invalid. Try requesting a new one.');
    } else if (errorParam === 'no_token') {
      setError('Invalid sign-in link. Try requesting a new one.');
    } else if (errorParam === 'verification_failed') {
      setError('Something went wrong verifying your link. Try again or use password.');
    }

    if (usernameParam) {
      setUsername(usernameParam);
      setBioUsername(usernameParam);
    }

    if (magicParam === 'true') {
      setShowMagicLink(true);
    }
  }, [searchParams]);

  // Check if already authenticated via SERVER SESSION (not localStorage)
  // This is the single source of truth - localStorage is just UI cache
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    async function checkServerSession() {
      try {
        const res = await fetch('/api/auth/whoami', { credentials: 'include' });
        const data = await res.json();
        if (data.authed) {
          // Server says we're authenticated - redirect to intended destination
          const next = searchParams?.get('next') || '/maia';
          router.replace(next);
          return;
        }
      } catch (e) {
        console.error('[Signin] Failed to check server session:', e);
      }
      setCheckingAuth(false);
    }
    checkServerSession();
  }, [router, searchParams]);

  // Trust device helper
  async function trustThisDevice() {
    try {
      await deviceTrust.trustDevice(undefined, 'standard');
    } catch {
      // non-blocking
    }
  }

  // Store session helper
  function storeSession(user: { id: string; username: string; name: string; preferredName?: string; preferred_name?: string; onboarded: boolean; tier?: 'free' | 'personal' | 'pro'; subscriptionActive?: boolean; subscriptionExpiresAt?: string | null }) {
    const displayName = user.preferredName || user.preferred_name || user.name || 'Friend';
    localStorage.setItem('beta_user', JSON.stringify(user));
    localStorage.setItem('explorerId', user.id);
    localStorage.setItem('explorerName', displayName);
    localStorage.setItem('explorerPreferredName', displayName);
    localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');
    localStorage.setItem('maia_session_version', '2');
    localStorage.setItem('signup_completed', 'true');
  }

  // Passkey sign-in (biometric)
  async function handlePasskeySignIn() {
    setError('');
    setIsLoading(true);

    try {
      const res = await biometricAuth.authenticate(bioUsername || undefined);

      if (!res.success) {
        // Show dedicated renewal UI for domain mismatch errors
        if (res.code === 'RPID_MISMATCH' || res.code === 'ORIGIN_MISMATCH') {
          setShowPasskeyRenewal(true);
          setIsLoading(false);
          return;
        }

        // Provide helpful guidance based on error code
        let errorMessage = res.error || 'Passkey sign-in failed';

        if (res.code === 'CREDENTIAL_NOT_FOUND') {
          errorMessage = 'No passkey found for this account. Sign in with password, then enable Face ID/Touch ID in Settings.';
        } else if (res.code === 'CHALLENGE_EXPIRED' || res.code === 'CHALLENGE_INVALID') {
          errorMessage = 'Session expired. Please try again.';
        } else if (res.code === 'USER_CANCELLED') {
          errorMessage = 'Sign-in was cancelled. Tap to try again.';
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (res.member) {
        storeSession({
          id: res.member.id,
          username: res.member.username,
          name: res.member.name,
          preferredName: res.member.preferredName,
          onboarded: res.member.onboarded
        });

        await trustThisDevice();

        if (res.member.onboarded) {
          router.push('/maia');
        } else {
          router.push('/begin');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Passkey sign-in failed');
    } finally {
      setIsLoading(false);
    }
  }

  // Password sign-in
  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let data: { member: { id: string; username: string; name: string; preferredName: string; onboarded: boolean; hasWebauthn?: boolean; tier?: 'free' | 'personal' | 'pro'; subscriptionActive?: boolean; subscriptionExpiresAt?: string | null }; practitioner?: { id: string; slug: string; name: string } | null; needsPasswordChange?: boolean } | null = null;

      try {
        // Use apiUrl() for correct path - /api/members/signin (not /v1/)
        const response = await fetch(apiUrl('/api/members/signin'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: username.toLowerCase(), password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401) {
            setError('Invalid username or password.');
            setIsLoading(false);
            return;
          }
          console.warn('[SignIn] API error:', response.status, errorData);
          throw new Error(errorData.error || 'Sign in failed');
        }

        data = await response.json();
      } catch (err) {
        if ((err as Error)?.message?.includes('Invalid username')) {
          return; // Already handled above
        }
        console.warn('[SignIn] API error:', err);
      }

      if (data) {
        const preferredName = data.member.preferredName || data.member.name || '';
        const isUUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(preferredName);
        const genericNames = ['user', 'guest', 'anonymous', 'explorer', 'test', 'admin'];
        const isGeneric = genericNames.includes(preferredName.toLowerCase());
        const capitalizedUsername = data.member.username
          ? data.member.username.charAt(0).toUpperCase() + data.member.username.slice(1)
          : '';
        const validName = (isUUID || isGeneric)
          ? (capitalizedUsername && !genericNames.includes(capitalizedUsername.toLowerCase()) ? capitalizedUsername : 'Friend')
          : (preferredName || capitalizedUsername || 'Friend');

        const user = {
          id: data.member.id,
          username: data.member.username,
          name: validName,
          preferredName: validName,
          onboarded: data.member.onboarded,
          tier: data.member.tier || 'free',
          subscriptionActive: data.member.subscriptionActive || false,
          subscriptionExpiresAt: data.member.subscriptionExpiresAt || null,
        };

        // Check for existing local data that could be migrated
        const existingExplorerId = localStorage.getItem('explorerId');
        const hasExistingData = existingExplorerId && existingExplorerId !== user.id;

        if (hasExistingData) {
          try {
            const previewResponse = await fetch(apiUrl(`/api/members/migrate-data?oldUserId=${encodeURIComponent(existingExplorerId)}`));
            if (previewResponse.ok) {
              const preview = await previewResponse.json();
              if (preview.totalRecords > 0) {
                setMigrationPreview(preview);
                setPendingUser({ id: user.id, onboarded: user.onboarded });
                setShowMigration(true);
                setIsLoading(false);
                localStorage.setItem('beta_user', JSON.stringify(user));
                localStorage.setItem('explorerName', validName);
                localStorage.setItem('explorerPreferredName', validName);
                localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');
                localStorage.setItem('maia_session_version', '2');
                return;
              }
            }
          } catch {
            // Continue with normal flow
          }
        }

        storeSession(user);

        // Store practitioner context if user is a practitioner
        if (data.practitioner) {
          setPractitionerContext({
            id: data.practitioner.id,
            slug: data.practitioner.slug,
            name: data.practitioner.name,
          });
        }

        let redirectPath = user.onboarded ? '/maia' : '/begin';

        // If beta tester needs to change default password, add query param
        if (data.needsPasswordChange && user.onboarded) {
          redirectPath = '/maia?changePassword=true';
        }

        // Skip passkey prompt - users can enable later in settings
        router.push(redirectPath);
        return;
      }

      setError('Invalid username or password.');
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Native OAuth handlers for Capacitor iOS
  const handleGoogleNative = async () => {
    // Feature flag gate: NATIVE_OAUTH must be enabled
    if (!nativeOAuthEnabled) {
      setError('Google sign-in is not enabled in this build.');
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const { GoogleAuth } = await import('@southdevs/capacitor-google-auth');
        await GoogleAuth.initialize({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
        const result = await GoogleAuth.signIn();
        const idToken = result.authentication?.idToken;

        if (!idToken) {
          throw new Error('Missing Google idToken');
        }

        const res = await fetch(apiUrl('/api/auth/google/native-callback'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            idToken,
            email: result.email,
            name: result.name,
            imageUrl: result.imageUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Google sign-in failed');
        }

        if (data.member) {
          storeSession(data.member);
          router.push(data.member.onboarded ? '/maia' : '/begin');
        }
        return;
      }

      window.location.href = '/api/auth/google/list';
    } catch (e) {
      setError('Google sign-in failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleAppleNative = async () => {
    // Feature flag gate: NATIVE_OAUTH must be enabled
    if (!nativeOAuthEnabled) {
      setError('Apple sign-in is not enabled in this build.');
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
        const result = await SignInWithApple.authorize({
          clientId: 'life.soullab.maia',
          scopes: 'email name',
          redirectURI: '',
        });

        const identityToken = result?.response?.identityToken;
        if (!identityToken) {
          throw new Error('Missing Apple identityToken');
        }

        const res = await fetch(apiUrl('/api/auth/apple/native-callback'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            identityToken,
            authorizationCode: result.response?.authorizationCode,
            email: result.response?.email,
            givenName: result.response?.givenName,
            familyName: result.response?.familyName,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Apple sign-in failed');
        }

        if (data.member) {
          storeSession(data.member);
          router.push(data.member.onboarded ? '/maia' : '/begin');
        }
        return;
      }

      window.location.href = '/api/auth/apple/list';
    } catch (e) {
      setError('Apple sign-in failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleRecovery = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    setError('');
    setRecoveryStatus('sending');

    try {
      const response = await fetch(apiUrl('/api/members/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.toLowerCase() }),
      });

      if (response.ok) {
        setRecoveryStatus('sent');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send reset email');
        setRecoveryStatus('idle');
      }
    } catch {
      setError('Unable to process reset request.');
      setRecoveryStatus('idle');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMagicLinkStatus('sending');

    try {
      const response = await fetch(apiUrl('/api/members/magic-link'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: magicLinkEmail.toLowerCase() }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMagicLinkStatus('sent');
      } else {
        setError(data.error || 'Failed to send magic link.');
        setMagicLinkStatus('idle');
      }
    } catch {
      setError('Unable to send magic link.');
      setMagicLinkStatus('idle');
    }
  };

  const handleMigration = async (migrate: boolean) => {
    if (!pendingUser || !migrationPreview) return;

    if (migrate) {
      setMigrationStatus('migrating');
      try {
        const response = await fetch(apiUrl('/api/members/migrate-data'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldUserId: migrationPreview.oldUserId,
            newUserId: pendingUser.id,
          }),
        });

        if (response.ok) {
          setMigrationStatus('done');
          localStorage.setItem('explorerId', pendingUser.id);
          setTimeout(() => {
            router.push(pendingUser.onboarded ? '/maia' : '/begin');
          }, 1500);
        } else {
          setMigrationStatus('error');
        }
      } catch {
        setMigrationStatus('error');
      }
    } else {
      localStorage.setItem('explorerId', pendingUser.id);
      setShowMigration(false);
      router.push(pendingUser.onboarded ? '/maia' : '/begin');
    }
  };

  // Handle passkey registration after password signin
  const handlePasskeySetup = async (setup: boolean) => {
    if (!pendingRedirect) return;

    if (setup) {
      setPasskeyPromptStatus('registering');
      try {
        const result = await biometricAuth.register();
        if (result.success) {
          setPasskeyPromptStatus('success');
          setTimeout(() => {
            router.push(pendingRedirect);
          }, 1500);
        } else {
          setPasskeyPromptStatus('error');
          console.error('[Passkey] Registration failed:', result.error);
        }
      } catch (err) {
        setPasskeyPromptStatus('error');
        console.error('[Passkey] Registration error:', err);
      }
    } else {
      // User skipped - continue to destination
      setShowPasskeyPrompt(false);
      router.push(pendingRedirect);
    }
  };

  // Show loading while checking server session
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-emerald-50/30 to-amber-50/20">
        <div className="text-teal-600/60 animate-pulse">Checking session...</div>
      </div>
    );
  }

  return (
    <>
      {/* Soullab Brand + Holoflower */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-10 z-10 relative flex flex-col items-center"
      >
        <h1 className="text-5xl font-extralight text-teal-900/70 tracking-[0.12em] mb-4">
          Soullab
        </h1>
        <div className="w-44 h-44 flex items-center justify-center">
          <Holoflower size="xxl" glowIntensity="medium" animate={true} />
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl p-8 max-w-sm w-full"
        style={{
          background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.25))',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-xl font-light text-teal-900 tracking-tight">Welcome back</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-100/40 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Primary: Password Sign-In */}
        <form onSubmit={handlePasswordSignIn} className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="w-full rounded-xl bg-white/50 border border-teal-200/40 px-4 py-3 text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60 focus:bg-white/60 transition-all"
          />
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPasswordText ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full rounded-xl bg-white/50 border border-teal-200/40 px-4 py-3 pr-11 text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60 focus:bg-white/60 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPasswordText(!showPasswordText)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-teal-600/50 hover:text-teal-700 transition-colors"
              tabIndex={-1}
            >
              {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading || !username || !password}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </motion.button>
        </form>

        {/* Biometric Option */}
        {bioAvailable && (
          <motion.button
            onClick={handlePasskeySignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="mt-3 w-full rounded-xl border border-teal-300/40 bg-white/30 px-4 py-3 text-center hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <span className="text-sm font-medium text-teal-800">
              Use {biometricLabel}
            </span>
          </motion.button>
        )}

        {/* Divider */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-teal-300/30" />
          <span className="text-xs text-teal-600/50 uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-teal-300/30" />
        </div>

        {/* Secondary Options */}
        <div className="mt-4 flex justify-center gap-3">
          {/* Magic Link */}
          <button
            type="button"
            onClick={() => setShowMagicLink(true)}
            title="Email me a sign-in link"
            className="w-11 h-11 rounded-xl bg-white/30 hover:bg-white/50 border border-teal-200/30 flex items-center justify-center transition-all"
          >
            <Mail className="w-5 h-5 text-teal-700/70" />
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleNative}
            disabled={!nativeOAuthEnabled}
            title={nativeOAuthEnabled ? 'Continue with Google' : 'Coming soon'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              nativeOAuthEnabled
                ? 'bg-white/40 hover:bg-white/60 border border-teal-200/30'
                : 'bg-white/20 border border-white/20 opacity-40 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={handleAppleNative}
            disabled={!nativeOAuthEnabled}
            title={nativeOAuthEnabled ? 'Continue with Apple' : 'Coming soon'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              nativeOAuthEnabled
                ? 'bg-black/60 hover:bg-black/80 border border-black/20'
                : 'bg-black/30 border border-black/10 opacity-40 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            onClick={() => setShowRecovery(true)}
            className="text-sm text-teal-700/50 hover:text-teal-700 transition-colors"
          >
            Forgot password?
          </button>

          <div className="pt-3 border-t border-teal-200/20">
            <button
              onClick={() => router.push('/signup')}
              className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
            >
              New to Soullab? Create account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Ethos footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6"
      >
        <EthosFooter
          isDayMode={true}
          showLearnMore={false}
          className="text-teal-700/50"
        />
      </motion.div>

      {/* Recovery Modal */}
      {showRecovery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => recoveryStatus !== 'sending' && setShowRecovery(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl p-6 max-w-md w-full shadow-2xl bg-white/95 border border-white/30"
          >
            <div className="flex justify-center mb-4">
              <Mail className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-teal-900 text-center mb-3">Reset Your Password</h2>

            {recoveryStatus === 'sent' ? (
              <div className="text-center">
                <div className="bg-emerald-100/60 rounded-xl p-4 mb-4">
                  <p className="text-emerald-800">Check your email for a password reset link.</p>
                </div>
                <button onClick={() => setShowRecovery(false)} className="text-teal-600 text-sm">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecovery} className="space-y-3">
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={handleRecovery}
                  disabled={recoveryStatus === 'sending' || !recoveryEmail}
                  className="w-full py-2 rounded-xl font-medium !bg-teal-600 !text-white hover:!bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                >
                  {recoveryStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setShowRecovery(false)} className="w-full text-sm text-teal-700/70">
                  Cancel
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Magic Link Modal */}
      {showMagicLink && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => magicLinkStatus !== 'sending' && setShowMagicLink(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl p-6 max-w-md w-full shadow-2xl bg-white/95 border border-white/30"
          >
            <div className="flex justify-center mb-4">
              <Sparkles className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-teal-900 text-center mb-2">Sign In with Magic Link</h2>
            <p className="text-sm text-teal-700/70 text-center mb-4">
              We'll send you a link to sign in instantly.
            </p>

            {magicLinkStatus === 'sent' ? (
              <div className="text-center">
                <div className="bg-emerald-100/60 rounded-xl p-4 mb-4">
                  <p className="text-emerald-800">Check your email for the magic link!</p>
                  <p className="text-emerald-600/70 text-xs mt-1">Link expires in 15 minutes.</p>
                </div>
                <button onClick={() => setShowMagicLink(false)} className="text-teal-600 text-sm">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={magicLinkStatus === 'sending' || !magicLinkEmail}
                  className="w-full py-2 rounded-xl bg-teal-600 text-white font-medium disabled:opacity-50"
                >
                  {magicLinkStatus === 'sending' ? 'Sending...' : 'Send Magic Link'}
                </button>
                <button type="button" onClick={() => setShowMagicLink(false)} className="w-full text-sm text-teal-700/70">
                  Use password instead
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Migration Modal */}
      {showMigration && migrationPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 max-w-md w-full shadow-2xl bg-white/95 border border-white/30"
          >
            <div className="flex justify-center mb-4">
              <ArrowRightLeft className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-teal-900 text-center mb-3">Link Your History</h2>

            {migrationStatus === 'idle' && (
              <>
                <p className="text-sm text-teal-800/70 text-center mb-4">
                  Found <strong>{migrationPreview.totalRecords}</strong> records from previous sessions.
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleMigration(true)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 14,
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      fontSize: 16,
                      fontWeight: 700,
                      border: '1px solid rgba(0,0,0,0.12)',
                      boxShadow: '0 8px 18px rgba(0,0,0,0.14)',
                      cursor: 'pointer',
                      opacity: 1,
                      WebkitTextFillColor: '#ffffff',
                    }}
                  >
                    Yes, Link My History
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMigration(false)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      fontSize: 15,
                      fontWeight: 700,
                      border: '1px solid rgba(15,23,42,0.16)',
                      cursor: 'pointer',
                      opacity: 1,
                      WebkitTextFillColor: '#0f172a',
                    }}
                  >
                    No thanks, start fresh
                  </button>
                </div>
              </>
            )}

            {migrationStatus === 'migrating' && (
              <div className="text-center py-4">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-teal-700">Linking your history...</p>
              </div>
            )}

            {migrationStatus === 'done' && (
              <div className="text-center py-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-600 text-xl">✓</span>
                </div>
                <p className="text-emerald-800 font-medium">History linked!</p>
              </div>
            )}

            {migrationStatus === 'error' && (
              <div className="text-center py-4">
                <p className="text-red-700 mb-3">Something went wrong.</p>
                <button onClick={() => handleMigration(false)} className="text-teal-600 text-sm">
                  Continue without linking
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Passkey Setup Prompt */}
      {showPasskeyPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 max-w-md w-full shadow-2xl bg-white/95 border border-white/30"
          >
            {passkeyPromptStatus === 'idle' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-teal-600" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-teal-900 text-center mb-2">
                  Enable {biometricLabel}?
                </h2>
                <p className="text-sm text-teal-800/70 text-center mb-5">
                  Sign in with one tap next time. Faster and more secure than passwords.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handlePasskeySetup(true)}
                    className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-500 transition-colors"
                  >
                    Yes, enable {biometricLabel}
                  </button>
                  <button
                    onClick={() => handlePasskeySetup(false)}
                    className="w-full py-2 text-sm text-teal-700/70 hover:text-teal-800"
                  >
                    Maybe later
                  </button>
                </div>
              </>
            )}

            {passkeyPromptStatus === 'registering' && (
              <div className="text-center py-6">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-teal-700 font-medium">Setting up {biometricLabel}...</p>
                <p className="text-sm text-teal-600/70 mt-1">Follow the prompts on your device</p>
              </div>
            )}

            {passkeyPromptStatus === 'success' && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-600 text-2xl">✓</span>
                </div>
                <p className="text-emerald-800 font-medium text-lg">{biometricLabel} enabled!</p>
                <p className="text-sm text-emerald-600/70 mt-1">You can now sign in with one tap</p>
              </div>
            )}

            {passkeyPromptStatus === 'error' && (
              <div className="text-center py-4">
                <p className="text-red-700 mb-4">Setup didn&apos;t complete. You can try again later in settings.</p>
                <button
                  onClick={() => handlePasskeySetup(false)}
                  className="text-teal-600 font-medium"
                >
                  Continue anyway
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Passkey Renewal Modal */}
      {showPasskeyRenewal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-6 max-w-md w-full shadow-2xl bg-white/95 border border-white/30"
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔑</span>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-teal-900 text-center mb-2">
              Passkey needs to be renewed
            </h2>
            <p className="text-sm text-teal-800/70 text-center mb-5">
              This passkey was created before the SOULLAB upgrade, so it can&apos;t be used here anymore.
              <br /><span className="text-teal-700 font-medium">No worries — your account is still safe.</span>
            </p>

            <div className="bg-teal-50/80 rounded-xl p-4 mb-5 border border-teal-200/50">
              <div className="text-sm text-teal-800 space-y-2">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-semibold">1</span>
                  <span><strong>Sign in with Google or password</strong></span>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-semibold">2</span>
                  <span>Go to <strong>Settings → Security</strong></span>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-semibold">3</span>
                  <span>Select <strong>Add passkey</strong> and name it <strong>SOULLAB-[YourName]</strong></span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {/* Google escape hatch - fastest path */}
              {nativeOAuthEnabled && (
                <button
                  onClick={() => {
                    setShowPasskeyRenewal(false);
                    handleGoogleNative();
                  }}
                  className="w-full py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              )}
              <button
                onClick={() => setShowPasskeyRenewal(false)}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-500 transition-colors"
              >
                Use password instead
              </button>
              <button
                onClick={() => setShowPasskeyRenewal(false)}
                className="w-full py-2 text-sm text-teal-700/70 hover:text-teal-800"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-teal-600/60 text-center mt-4">
              If you don&apos;t see &quot;Add passkey&quot; in Settings, update iOS/macOS and try again.
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* API indicator */}
      <div className="fixed bottom-2 left-2 text-xs text-teal-900/30 font-mono">
        {apiBaseUrl() || '(rel)'}
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <>
      <div className="mb-10 flex flex-col items-center">
        <h1 className="text-5xl font-extralight text-teal-900/70 tracking-[0.12em] mb-4">
          Soullab
        </h1>
        <div className="w-44 h-44 flex items-center justify-center">
          <Holoflower size="xxl" glowIntensity="medium" animate={true} />
        </div>
      </div>
      <div className="rounded-2xl p-6 border max-w-md w-full animate-pulse"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
        <div className="h-6 bg-teal-200/30 rounded w-32 mx-auto mb-4" />
        <div className="space-y-3">
          <div className="h-14 bg-teal-200/20 rounded-xl" />
          <div className="h-10 bg-teal-200/20 rounded-xl" />
          <div className="h-10 bg-teal-200/20 rounded-xl" />
        </div>
      </div>
    </>
  );
}

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4 py-8">
      <Suspense fallback={<LoadingFallback />}>
        <SigninContent />
      </Suspense>
    </div>
  );
}
