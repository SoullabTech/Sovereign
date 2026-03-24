'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import { apiUrl } from '@/lib/http/apiBase';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!searchParams) return null;

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
      const response = await fetch(apiUrl(`/api/members/reset-password?token=${token}`));
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
      const response = await fetch(apiUrl('/api/members/reset-password'), {
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
      const response = await fetch(apiUrl('/api/members/reset-password'), {
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
          <p className="text-white/50">Validating reset link...</p>
        </div>
      );
    }

    if (mode === 'error') {
      return (
        <div className="space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white text-center tracking-tight">
            Link Expired
          </h2>
          <p className="text-white/50 text-sm text-center">
            {error}
          </p>
          <button
            onClick={() => {
              setError('');
              setMode('request');
            }}
            className="w-full py-3 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-400 shadow-lg transition"
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
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white text-center tracking-tight">
            {token ? 'Password Reset Complete' : 'Check Your Email'}
          </h2>
          <p className="text-white/50 text-sm text-center">
            {token
              ? 'Your password has been updated. You can now sign in.'
              : 'If an account exists with this email, we\'ve sent a reset link.'}
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="w-full py-3 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-400 shadow-lg transition"
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
            <Mail className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white text-center tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-white/50 text-sm text-center">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-amber-400/50 focus:bg-white/15 transition"
                placeholder="your@email.com"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-400 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </motion.button>

            <button
              type="button"
              onClick={() => router.push('/signin')}
              className="w-full text-sm font-medium text-white/40 hover:text-white/70 transition"
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
          <Lock className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold text-white text-center tracking-tight">
          Set New Password
        </h2>
        {memberName && (
          <p className="text-white/50 text-sm text-center">
            Welcome back, {memberName}
          </p>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-amber-400/50 focus:bg-white/15 transition"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-amber-400/50 focus:bg-white/15 transition"
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting || !password || !confirmPassword}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-semibold text-black bg-amber-500 hover:bg-amber-400 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center px-4">
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
        className="rounded-2xl p-8 max-w-md w-full shadow-2xl bg-[#121833] border border-white/10"
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
    <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center px-4">
      <div className="w-40 h-40 flex items-center justify-center">
        <Holoflower size="xl" glowIntensity="low" animate={true} />
      </div>
      <p className="text-white/50 mt-4">Loading...</p>
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
