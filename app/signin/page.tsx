'use client';

import React, { useState, useEffect } from 'react';
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

export default function SigninPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">

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
        className="rounded-2xl p-8 shadow-2xl border max-w-md w-full"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.3), 0 0 100px rgba(245, 158, 11, 0.2), 0 0 140px rgba(217, 119, 6, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        }}
      >
        <h1 className="text-2xl font-extralight text-teal-900 mb-6 text-center tracking-[0.2em]">
          Sign In
        </h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-light text-teal-800 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/40 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-light text-teal-800 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/40 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
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
            className="w-full py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
              border: '1px solid rgba(110, 231, 183, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span className="text-teal-900">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </span>
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

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowRecovery(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md bg-white/60 text-slate-500 shadow-sm"
          >
            <span className="text-slate-500">Forgot your passkey or password?</span>
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={() => router.push('/begin')}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md bg-white/60 text-slate-500 shadow-sm"
          >
            <span className="text-slate-500">New to Soullab? Begin Journey</span>
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
              <Mail className="w-12 h-12 text-amber-600/80" />
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
                    className="w-full px-4 py-3 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
                  className="w-full py-3 rounded-xl font-medium bg-amber-500/80 hover:bg-amber-500 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <ArrowRightLeft className="w-12 h-12 text-amber-600/80" />
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

                <div className="bg-amber-50/60 rounded-lg p-4 mb-6 border border-amber-200/40">
                  <p className="text-amber-800/80 text-xs font-medium mb-2">Data to link:</p>
                  <ul className="text-amber-700/70 text-xs space-y-1">
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
                    className="w-full py-3 rounded-xl font-medium bg-amber-500/80 hover:bg-amber-500 text-white transition-all duration-300"
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
                <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
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
    </div>
  );
}