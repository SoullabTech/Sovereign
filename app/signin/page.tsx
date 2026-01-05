'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Infinity } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import { betaSession } from '@/lib/auth/betaSession';

export default function SigninPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

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
        // Use preferredName if available, fallback to name with UUID check
        const preferredName = data.member.preferredName || data.member.name || '';
        const isUUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(preferredName);
        const validName = isUUID ? (data.member.username?.charAt(0).toUpperCase() + data.member.username?.slice(1) || 'Friend') : (preferredName || 'Friend');

        // Server auth succeeded - store session locally
        const user = {
          id: data.member.id,
          username: data.member.username,
          name: validName,
          preferredName: validName,
          onboarded: data.member.onboarded,
        };

        localStorage.setItem('beta_user', JSON.stringify(user));
        localStorage.setItem('explorerId', user.id);
        localStorage.setItem('explorerName', validName);
        localStorage.setItem('explorerPreferredName', validName);
        localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');

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
          localStorage.setItem('beta_user', JSON.stringify(user));
          localStorage.setItem('explorerId', user.id || user.username);
          localStorage.setItem('explorerName', user.name || username);
          localStorage.setItem('betaOnboardingComplete', 'true');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">

      {/* Sacred Holoflower */}
      <div className="mb-4 z-10 relative">
        <div className="w-40 h-40 mx-auto">
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
            onClick={() => setShowRecovery(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md bg-white/60 text-slate-500 shadow-sm"
          >
            <span className="text-slate-500">Forgot your passkey or password?</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/begin')}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md bg-white/60 text-slate-500 shadow-sm"
          >
            <span className="text-slate-500">New to Soullab? Begin Journey</span>
          </button>
        </div>
      </motion.div>

      {/* Infinity Loop */}
      <div className="mt-24">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
        </svg>
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

            <p className="text-teal-800/70 text-sm text-center mb-6">
              Enter the email address associated with your account. We'll send your passkey and username.
            </p>

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
    </div>
  );
}