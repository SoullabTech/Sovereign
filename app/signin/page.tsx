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
import { Mail, ArrowRightLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import { deviceTrust } from '@/lib/auth/deviceTrust';
import { api, ApiError } from '@/lib/api-client';
import { apiUrl, apiBaseUrl } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';

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

  // Biometric signin
  const [showUsernameHint, setShowUsernameHint] = useState(false);
  const [bioUsername, setBioUsername] = useState('');

  // Password fallback
  const [showPassword, setShowPassword] = useState(false);
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

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);

  // Check biometric availability
  useEffect(() => {
    (async () => {
      const avail = await biometricAuth.getAvailability();
      setBioAvailable(avail.available);
      setBioPlatformAvailable(avail.platformAvailable);
    })();
  }, []);

  // Check for magic link errors, username prefill
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const magicParam = searchParams.get('magic');
    const usernameParam = searchParams.get('username');

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

  // Check if already authenticated
  useEffect(() => {
    const sessionState = betaSession.restoreSession();
    if (sessionState.isAuthenticated && sessionState.user) {
      router.replace('/maia');
    }
  }, [router]);

  // Trust device helper
  async function trustThisDevice() {
    try {
      await deviceTrust.trustDevice(undefined, 'standard');
    } catch {
      // non-blocking
    }
  }

  // Store session helper
  function storeSession(user: { id: string; username: string; name: string; preferredName?: string; preferred_name?: string; onboarded: boolean }) {
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
        setError(res.error || 'Passkey sign-in failed');
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
      let data: { member: { id: string; username: string; name: string; preferredName: string; onboarded: boolean } } | null = null;

      try {
        data = await api.members.signin(username.toLowerCase(), password);
      } catch (err) {
        if (err instanceof ApiError && err.code === 'INVALID_CREDENTIALS') {
          setError('Invalid username or password.');
          setIsLoading(false);
          return;
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

        if (user.onboarded) {
          router.push('/maia');
        } else {
          router.push('/begin');
        }
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
    try {
      if (Capacitor.isNativePlatform()) {
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
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

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveryStatus('sending');

    try {
      const response = await fetch(apiUrl('/api/members/recover'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.toLowerCase() }),
      });

      if (response.ok) {
        setRecoveryStatus('sent');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send recovery email');
        setRecoveryStatus('idle');
      }
    } catch {
      setError('Unable to process recovery request.');
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

  return (
    <>
      {/* Sacred Holoflower */}
      <div className="mb-4 z-10 relative w-full flex justify-center">
        <div className="w-32 h-32 flex items-center justify-center">
          <Holoflower size="lg" glowIntensity="low" animate={true} />
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-6 border max-w-md w-full shadow-xl"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div className="text-center mb-4">
          <div className="text-xs text-teal-700/60 tracking-wider">MAIA • SOVEREIGN</div>
          <h1 className="text-2xl font-semibold text-teal-900 tracking-tight mt-1">Welcome back</h1>
          <p className="text-sm text-teal-800/70 mt-1">
            One tap with biometrics when available
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-100/40 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Primary: Biometric Sign-In */}
        <motion.button
          onClick={handlePasskeySignIn}
          disabled={isLoading || !bioAvailable}
          whileHover={{ scale: bioAvailable ? 1.01 : 1 }}
          whileTap={{ scale: 0.99 }}
          className="w-full rounded-2xl border border-teal-400/40 bg-teal-600/90 px-4 py-4 text-left hover:bg-teal-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          <div className="text-base font-semibold text-white">
            {isLoading ? 'Signing in...' : `Use ${biometricLabel}`}
          </div>
          <div className="mt-1 text-sm text-teal-100/80">
            {bioAvailable
              ? 'Fastest and safest — one tap sign-in'
              : 'Passkeys not available on this device'}
          </div>
        </motion.button>

        {/* Username hint for non-discoverable passkeys */}
        {bioAvailable && (
          <div className="mt-2">
            <button
              onClick={() => setShowUsernameHint(!showUsernameHint)}
              className="text-xs text-teal-700/60 hover:text-teal-800 flex items-center gap-1"
            >
              {showUsernameHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Having trouble? Enter username
            </button>
            {showUsernameHint && (
              <input
                value={bioUsername}
                onChange={(e) => setBioUsername(e.target.value)}
                placeholder="Username (helps find your passkey)"
                className="mt-2 w-full rounded-xl bg-white/30 border border-teal-200/40 px-3 py-2 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
              />
            )}
          </div>
        )}

        {/* OAuth Divider */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-teal-300/40" />
          <span className="text-xs text-teal-600/60">or continue with</span>
          <div className="flex-1 h-px bg-teal-300/40" />
        </div>

        {/* OAuth Buttons */}
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleGoogleNative}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md bg-white/70 hover:bg-white/90 border border-gray-200/60 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700">Google</span>
          </button>

          <button
            type="button"
            onClick={handleAppleNative}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-md bg-black/90 hover:bg-black border border-gray-800 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-white">Apple</span>
          </button>
        </div>

        {/* Magic Link */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowMagicLink(true)}
            className="w-full text-sm font-medium px-4 py-2.5 rounded-xl transition-all hover:shadow-md bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Email me a sign-in link</span>
          </button>
        </div>

        {/* Password Fallback */}
        <div className="mt-4 rounded-xl border border-white/20 bg-white/10 p-3">
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="w-full text-left text-sm text-teal-800/80 hover:text-teal-900 flex items-center justify-between"
          >
            <span>{showPassword ? 'Hide password' : 'Use password'}</span>
            {showPassword ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPassword && (
            <form onSubmit={handlePasswordSignIn} className="mt-3 space-y-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full rounded-xl bg-white/40 border border-teal-200/40 px-3 py-2 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl bg-white/40 border border-teal-200/40 px-3 py-2 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={() => setShowRecovery(true)}
            className="text-sm text-teal-700/60 hover:text-teal-800"
          >
            Forgot your passkey or password?
          </button>

          <div className="pt-2 border-t border-teal-200/30">
            <button
              onClick={() => router.push('/signup')}
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              New to Soullab? Create account
            </button>
          </div>
        </div>
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
            <h2 className="text-lg font-semibold text-teal-900 text-center mb-3">Recover Your Account</h2>

            {recoveryStatus === 'sent' ? (
              <div className="text-center">
                <div className="bg-emerald-100/60 rounded-xl p-4 mb-4">
                  <p className="text-emerald-800">Check your email for recovery instructions.</p>
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
                  type="submit"
                  disabled={recoveryStatus === 'sending'}
                  className="w-full py-2 rounded-xl bg-teal-600 text-white font-medium disabled:opacity-50"
                >
                  {recoveryStatus === 'sending' ? 'Sending...' : 'Send Recovery Email'}
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
                <div className="space-y-2">
                  <button
                    onClick={() => handleMigration(true)}
                    className="w-full py-2 rounded-xl bg-teal-600 text-white font-medium"
                  >
                    Yes, Link My History
                  </button>
                  <button
                    onClick={() => handleMigration(false)}
                    className="w-full text-sm text-teal-700/70"
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
      <div className="mb-4 w-32 h-32 flex items-center justify-center">
        <Holoflower size="lg" glowIntensity="low" animate={true} />
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
