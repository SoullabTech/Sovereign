'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRightLeft, Sparkles } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';

interface MigrationPreview {
  oldUserId: string;
  totalRecords: number;
  tables: { table: string; count: number }[];
}

/**
 * Inner component that uses useSearchParams
 * Must be wrapped in Suspense for Next.js static rendering
 */
function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Magic link state
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkStatus, setMagicLinkStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Migration state
  const [showMigration, setShowMigration] = useState(false);
  const [migrationPreview, setMigrationPreview] = useState<MigrationPreview | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'done' | 'error'>('idle');
  const [pendingUser, setPendingUser] = useState<{ id: string; onboarded: boolean } | null>(null);

  // Check for magic link errors and auto-open magic link modal
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const magicParam = searchParams.get('magic');

    if (errorParam === 'invalid_token') {
      setError('Your sign-in link has expired or is invalid. Try requesting a new one.');
    } else if (errorParam === 'no_token') {
      setError('Invalid sign-in link. Try requesting a new one.');
    } else if (errorParam === 'verification_failed') {
      setError('Something went wrong verifying your link. Try again or use password.');
    }

    // Auto-open magic link modal if requested
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First try server-side authentication
      const response = await fetch('/api/members/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Use preferredName if available, fallback to name, then capitalized username
        const preferredName = data.member.preferredName || data.member.name || '';
        const isUUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(preferredName);
        const genericNames = ['user', 'guest', 'anonymous', 'explorer', 'test', 'admin'];
        const isGeneric = genericNames.includes(preferredName.toLowerCase());
        // Priority: preferredName > name > capitalized username > 'Friend'
        const capitalizedUsername = data.member.username
          ? data.member.username.charAt(0).toUpperCase() + data.member.username.slice(1)
          : '';
        const validName = (isUUID || isGeneric)
          ? (capitalizedUsername && !genericNames.includes(capitalizedUsername.toLowerCase()) ? capitalizedUsername : 'Friend')
          : (preferredName || capitalizedUsername || 'Friend');

        // Server auth succeeded - store session locally
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
          // Check if there's data to migrate
          try {
            const previewResponse = await fetch(`/api/members/migrate-data?oldUserId=${encodeURIComponent(existingExplorerId)}`);
            if (previewResponse.ok) {
              const preview = await previewResponse.json();
              if (preview.totalRecords > 0) {
                // There's data to migrate - show the modal
                setMigrationPreview(preview);
                setPendingUser({ id: user.id, onboarded: user.onboarded });
                setShowMigration(true);
                setIsLoading(false);

                // Store user data but don't redirect yet
                localStorage.setItem('beta_user', JSON.stringify(user));
                localStorage.setItem('explorerName', validName);
                localStorage.setItem('explorerPreferredName', validName);
                localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');
                localStorage.setItem('maia_session_version', '2');
                return;
              }
            }
          } catch (previewError) {
            console.warn('Migration preview failed:', previewError);
            // Continue with normal flow if preview fails
          }
        }

        localStorage.setItem('beta_user', JSON.stringify(user));
        localStorage.setItem('explorerId', user.id);
        localStorage.setItem('explorerName', validName);
        localStorage.setItem('explorerPreferredName', validName);
        localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');
        // Set session version to prevent /maia from triggering migration redirect
        localStorage.setItem('maia_session_version', '2');

        // Redirect based on onboarding status
        if (user.onboarded) {
          router.push('/maia');
        } else {
          router.push('/begin');
        }
        return;
      }

      // If server says invalid credentials, show error
      if (response.status === 401) {
        setError('Invalid username or password.');
        setIsLoading(false);
        return;
      }

      // Fall back to localStorage for existing local-only users
      const usersJson = localStorage.getItem('beta_users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const normalizedUsername = username.toLowerCase();
        const user = users[normalizedUsername];

        if (user && user.password === password) {
          // Apply same name validation as server-side auth (filter generic names like 'user', 'guest')
          const genericNames = ['user', 'guest', 'anonymous', 'explorer', 'test', 'admin'];
          const rawName = user.name || username;
          const isUUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(rawName);
          const isGeneric = genericNames.includes(rawName.toLowerCase());
          const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
          const validLocalName = (isUUID || isGeneric)
            ? (isGeneric ? 'Friend' : capitalizedUsername)
            : rawName;

          localStorage.setItem('beta_user', JSON.stringify(user));
          localStorage.setItem('explorerId', user.id || user.username);
          localStorage.setItem('explorerName', validLocalName);
          localStorage.setItem('betaOnboardingComplete', 'true');
          localStorage.setItem('maia_session_version', '2');
          router.push('/maia');
          return;
        }
      }

      setError('Invalid username or password.');
      setIsLoading(false);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveryStatus('sending');

    try {
      const response = await fetch('/api/members/recover', {
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
    } catch (err) {
      console.error('Recovery error:', err);
      setError('Unable to process recovery request. Please try again.');
      setRecoveryStatus('idle');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMagicLinkStatus('sending');

    try {
      const response = await fetch('/api/members/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: magicLinkEmail.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMagicLinkStatus('sent');
      } else {
        setError(data.error || 'Failed to send magic link. Please try again.');
        setMagicLinkStatus('idle');
      }
    } catch (err) {
      console.error('Magic link error:', err);
      setError('Unable to send magic link. Please try again.');
      setMagicLinkStatus('idle');
    }
  };

  const handleMigration = async (migrate: boolean) => {
    if (!pendingUser || !migrationPreview) return;

    if (migrate) {
      setMigrationStatus('migrating');
      try {
        const response = await fetch('/api/members/migrate-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oldUserId: migrationPreview.oldUserId,
            newUserId: pendingUser.id,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Migration complete:', result);
          setMigrationStatus('done');

          // Update explorerId to new member ID
          localStorage.setItem('explorerId', pendingUser.id);

          // Wait a moment to show success, then redirect
          setTimeout(() => {
            if (pendingUser.onboarded) {
              router.push('/maia');
            } else {
              router.push('/begin');
            }
          }, 1500);
        } else {
          console.error('Migration failed');
          setMigrationStatus('error');
        }
      } catch (err) {
        console.error('Migration error:', err);
        setMigrationStatus('error');
      }
    } else {
      // Skip migration - just update explorerId and continue
      localStorage.setItem('explorerId', pendingUser.id);
      setShowMigration(false);

      if (pendingUser.onboarded) {
        router.push('/maia');
      } else {
        router.push('/begin');
      }
    }
  };

  return (
    <>
      {/* Sacred Holoflower */}
      <div className="mb-4 z-10 relative w-full flex justify-center">
        <div className="w-40 h-40 flex items-center justify-center">
          <Holoflower size="xl" glowIntensity="low" animate={true} />
        </div>
      </div>

      {/* Sign In Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-8 border max-w-md w-full shadow-[0_24px_60px_rgba(0,0,0,0.16),0_10px_20px_rgba(0,0,0,0.10)]"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <h1 className="text-2xl font-semibold text-teal-900 mb-6 text-center tracking-tight">
          Sign In
        </h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-teal-800 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-teal-800 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-3 border border-red-200/40">
              {error}
              {(error.toLowerCase().includes('invalid') || error.toLowerCase().includes('expired')) && (
                <div className="mt-2 pt-2 border-t border-red-200/30 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setShowMagicLink(true);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 transition-colors block"
                  >
                    Try a magic link instead
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/reset-password')}
                    className="text-gray-500 hover:text-gray-700 font-medium underline underline-offset-2 transition-colors block"
                  >
                    Reset your password
                  </button>
                </div>
              )}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-600 shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowMagicLink(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md bg-emerald-50/80 text-emerald-700 shadow-sm border border-emerald-200/50 flex items-center justify-center gap-2 w-full"
          >
            <Sparkles className="w-4 h-4" />
            <span>Email me a sign-in link</span>
          </button>
        </div>

        {/* OAuth Divider */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-teal-300/40" />
          <span className="text-xs text-teal-600/60 font-light">or continue with</span>
          <div className="flex-1 h-px bg-teal-300/40" />
        </div>

        {/* OAuth Buttons */}
        <div className="mt-4 flex justify-center gap-3">
          {/* Google Sign-In */}
          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/google'}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:shadow-md bg-white/70 hover:bg-white/90 border border-gray-200/60 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700">Google</span>
          </button>

          {/* Apple Sign-In */}
          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/apple'}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:shadow-md bg-black/90 hover:bg-black border border-gray-800 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-white">Apple</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowRecovery(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md bg-white/60 text-slate-500 shadow-sm"
          >
            <span className="text-slate-500">Forgot your passkey or password?</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-teal-200/30 text-center">
          <button
            onClick={() => router.push('/begin')}
            className="text-sm font-medium text-teal-700/70 hover:text-teal-800 transition"
          >
            New to Soullab? Begin Journey
          </button>
        </div>
      </motion.div>

      {/* Sacred Holoflower */}
      <div className="mt-8">
        <div className="w-12 h-12 mx-auto opacity-40">
          <Holoflower size="sm" glowIntensity="low" animate={false} />
        </div>
      </div>

      {/* Recovery Modal */}
      {showRecovery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => {
            if (recoveryStatus !== 'sending') {
              setShowRecovery(false);
              setRecoveryEmail('');
              setRecoveryStatus('idle');
              setError('');
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div className="flex justify-center mb-6">
              <Mail className="w-12 h-12 text-teal-600" />
            </div>

            <h2 className="text-xl font-light text-teal-900 text-center mb-4 tracking-wide">
              Recover Your Account
            </h2>

            <p className="text-teal-800/70 text-sm text-center mb-4">
              Enter your email to receive your passkey and username.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowRecovery(false);
                router.push('/reset-password');
              }}
              className="w-full mb-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors duration-300 underline underline-offset-2"
            >
              Need to reset your password instead?
            </button>

            {recoveryStatus === 'sent' ? (
              <div className="space-y-4">
                <div className="bg-emerald-100/60 border border-emerald-300/40 rounded-xl p-6 text-center">
                  <p className="text-emerald-800 text-lg font-light">
                    Check your email
                  </p>
                  <p className="text-emerald-700/80 text-sm mt-2">
                    If an account exists with this email, we've sent recovery instructions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryStatus('idle');
                    setRecoveryEmail('');
                  }}
                  className="w-full py-3 rounded-xl font-medium text-teal-900 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
                    border: '1px solid rgba(110, 231, 183, 0.4)',
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleRecovery} className="space-y-4">
                <div>
                  <label htmlFor="recovery-email" className="block text-sm font-light text-teal-800 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="recovery-email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-3 border border-red-200/40">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={recoveryStatus === 'sending' || !recoveryEmail.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-medium bg-teal-600 hover:bg-teal-500 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recoveryStatus === 'sending' ? 'Sending...' : 'Send Recovery Email'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    setRecoveryEmail('');
                    setError('');
                  }}
                  className="w-full py-2 text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300"
                >
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
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => {
            if (magicLinkStatus !== 'sending') {
              setShowMagicLink(false);
              setMagicLinkEmail('');
              setMagicLinkStatus('idle');
              setError('');
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div className="flex justify-center mb-6">
              <Sparkles className="w-12 h-12 text-emerald-600/80" />
            </div>

            <h2 className="text-xl font-light text-teal-900 text-center mb-4 tracking-wide">
              Sign In with Magic Link
            </h2>

            <p className="text-teal-800/70 text-sm text-center mb-6">
              Enter your email and we'll send you a link to sign in instantly — no password needed.
            </p>

            {magicLinkStatus === 'sent' ? (
              <div className="space-y-4">
                <div className="bg-emerald-100/60 border border-emerald-300/40 rounded-xl p-6 text-center">
                  <p className="text-emerald-800 text-lg font-light">
                    Check your email
                  </p>
                  <p className="text-emerald-700/80 text-sm mt-2">
                    We've sent a magic link to <strong>{magicLinkEmail}</strong>. Click the link to sign in.
                  </p>
                  <p className="text-emerald-600/60 text-xs mt-3">
                    Link expires in 15 minutes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMagicLink(false);
                    setMagicLinkStatus('idle');
                    setMagicLinkEmail('');
                  }}
                  className="w-full py-3 rounded-xl font-medium text-teal-900 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
                    border: '1px solid rgba(110, 231, 183, 0.4)',
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="magic-link-email" className="block text-sm font-light text-teal-800 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="magic-link-email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    placeholder="your@email.com"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-3 border border-red-200/40">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={magicLinkStatus === 'sending' || !magicLinkEmail.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-medium bg-emerald-500/80 hover:bg-emerald-500 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {magicLinkStatus === 'sending' ? 'Sending...' : 'Send Magic Link'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMagicLink(false);
                    setMagicLinkEmail('');
                    setError('');
                  }}
                  className="w-full py-2 text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300"
                >
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div className="flex justify-center mb-6">
              <ArrowRightLeft className="w-12 h-12 text-teal-600" />
            </div>

            <h2 className="text-xl font-light text-teal-900 text-center mb-4 tracking-wide">
              Link Your Conversation History
            </h2>

            {migrationStatus === 'idle' && (
              <>
                <p className="text-teal-800/70 text-sm text-center mb-4">
                  We found <span className="font-semibold text-teal-900">{migrationPreview.totalRecords} records</span> from
                  your previous sessions on this device. Would you like to link them to your account?
                </p>

                <div className="bg-teal-50/60 rounded-lg p-4 mb-6 border border-teal-200/40">
                  <p className="text-teal-800/80 text-xs font-medium mb-2">Data to link:</p>
                  <ul className="text-teal-700/70 text-xs space-y-1">
                    {migrationPreview.tables.slice(0, 5).map((t) => (
                      <li key={t.table}>• {t.table.replace(/_/g, ' ')}: {t.count} items</li>
                    ))}
                    {migrationPreview.tables.length > 5 && (
                      <li>• ...and {migrationPreview.tables.length - 5} more categories</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={() => handleMigration(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-medium bg-teal-600 hover:bg-teal-500 text-white transition-all duration-300"
                  >
                    Yes, Link My History
                  </motion.button>

                  <button
                    onClick={() => handleMigration(false)}
                    className="w-full py-2 text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300"
                  >
                    No thanks, start fresh
                  </button>
                </div>
              </>
            )}

            {migrationStatus === 'migrating' && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-teal-800/70">Linking your history...</p>
              </div>
            )}

            {migrationStatus === 'done' && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-600 text-2xl">✓</span>
                </div>
                <p className="text-emerald-800 font-medium">History linked successfully!</p>
                <p className="text-teal-700/60 text-sm mt-2">Redirecting...</p>
              </div>
            )}

            {migrationStatus === 'error' && (
              <div className="text-center py-4">
                <p className="text-red-700 mb-4">Something went wrong. Your data is safe.</p>
                <button
                  onClick={() => handleMigration(false)}
                  className="px-6 py-2 bg-teal-500/80 hover:bg-teal-500 text-white rounded-xl transition-colors"
                >
                  Continue without linking
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/**
 * Loading fallback for Suspense
 */
function LoadingFallback() {
  return (
    <>
      {/* Sacred Holoflower */}
      <div className="mb-4 z-10 relative w-full flex justify-center">
        <div className="w-40 h-40 flex items-center justify-center">
          <Holoflower size="xl" glowIntensity="low" animate={true} />
        </div>
      </div>

      {/* Loading Card */}
      <div
        className="rounded-2xl p-8 border max-w-md w-full shadow-[0_24px_60px_rgba(0,0,0,0.16),0_10px_20px_rgba(0,0,0,0.10)]"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div className="animate-pulse">
          <div className="h-8 bg-teal-200/30 rounded w-32 mx-auto mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-teal-200/20 rounded" />
            <div className="h-12 bg-teal-200/20 rounded" />
            <div className="h-12 bg-teal-200/30 rounded" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">
      <Suspense fallback={<LoadingFallback />}>
        <SigninContent />
      </Suspense>
    </div>
  );
}