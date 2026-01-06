'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [mode, setMode] = useState<'loading' | 'request' | 'reset' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setMode('request');
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/members/reset-password?token=${token}`);
      const data = await response.json();

      if (data.valid) {
        setMemberName(data.name || '');
        setMode('reset');
      } else {
        setError(data.error || 'This reset link is invalid or has expired.');
        setMode('error');
      }
    } catch {
      setError('Unable to validate reset link. Please try again.');
      setMode('error');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/members/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMode('success');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch {
      setError('Unable to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/members/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMode('success');
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch {
      setError('Unable to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (mode === 'loading') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <Holoflower size="lg" glowIntensity="medium" animate={true} />
          </div>
          <p className="text-teal-800/70">Validating reset link...</p>
        </div>
      );
    }

    if (mode === 'error') {
      return (
        <div className="space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-xl font-light text-teal-900 text-center">
            Link Expired
          </h2>
          <p className="text-teal-800/70 text-center">
            {error}
          </p>
          <button
            onClick={() => {
              setError('');
              setMode('request');
            }}
            className="w-full py-3 rounded-xl font-medium text-teal-900 transition-all duration-300"
            style={{
              background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
              border: '1px solid rgba(110, 231, 183, 0.4)',
            }}
          >
            Request New Reset Link
          </button>
        </div>
      );
    }

    if (mode === 'success') {
      return (
        <div className="space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-xl font-light text-teal-900 text-center">
            {token ? 'Password Reset Complete' : 'Check Your Email'}
          </h2>
          <p className="text-teal-800/70 text-center">
            {token
              ? 'Your password has been updated. You can now sign in with your new password.'
              : 'If an account exists with this email, we\'ve sent a password reset link.'}
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="w-full py-3 rounded-xl font-medium text-teal-900 transition-all duration-300"
            style={{
              background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
              border: '1px solid rgba(110, 231, 183, 0.4)',
            }}
          >
            Go to Sign In
          </button>
        </div>
      );
    }

    if (mode === 'request') {
      return (
        <div className="space-y-6">
          <div className="flex justify-center">
            <Mail className="w-12 h-12 text-amber-600/80" />
          </div>
          <h2 className="text-xl font-light text-teal-900 text-center tracking-wide">
            Reset Your Password
          </h2>
          <p className="text-teal-800/70 text-sm text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-light text-teal-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/40 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
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
              disabled={isSubmitting || !email.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-medium bg-amber-500/80 hover:bg-amber-500 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </motion.button>

            <button
              type="button"
              onClick={() => router.push('/signin')}
              className="w-full py-2 text-teal-700/70 text-sm font-light hover:text-teal-600 transition-colors duration-300"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      );
    }

    // mode === 'reset'
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <Lock className="w-12 h-12 text-emerald-600/80" />
        </div>
        <h2 className="text-xl font-light text-teal-900 text-center tracking-wide">
          Set New Password
        </h2>
        {memberName && (
          <p className="text-teal-800/70 text-sm text-center">
            Welcome back, {memberName}
          </p>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-light text-teal-800 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/40 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-light text-teal-800 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/40 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              placeholder="Confirm your password"
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
            disabled={isSubmitting || !password || !confirmPassword}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(to right, rgba(110, 231, 183, 0.3), rgba(127, 181, 179, 0.4))',
              border: '1px solid rgba(110, 231, 183, 0.4)',
            }}
          >
            <span className="text-teal-900">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </span>
          </motion.button>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">
      {/* Sacred Holoflower */}
      <div className="mb-4 z-10 relative w-full flex justify-center">
        <div className="w-40 h-40 flex items-center justify-center">
          <Holoflower size="xl" glowIntensity="low" animate={true} />
        </div>
      </div>

      {/* Main Card */}
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
        {renderContent()}
      </motion.div>

      {/* Bottom Holoflower */}
      <div className="mt-8">
        <div className="w-12 h-12 mx-auto opacity-40">
          <Holoflower size="sm" glowIntensity="low" animate={false} />
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4">
      <div className="w-40 h-40 flex items-center justify-center">
        <Holoflower size="xl" glowIntensity="low" animate={true} />
      </div>
      <p className="text-teal-800/70 mt-4">Loading...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
