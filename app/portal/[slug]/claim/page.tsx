'use client';

/**
 * CLAIM PORTAL ACCESS PAGE
 *
 * Client enters their invite code and creates a password
 * to claim access to their personal chart portal.
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Key, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#D0C5E8',
  border: '#4A3D5C',
  error: '#D98B8B',
};

export default function ClaimPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/portal/${slug}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Failed to claim portal access');
        setLoading(false);
        return;
      }

      // Success - redirect to their chart
      router.push(`/portal/${slug}/my-chart`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
            <Sparkles className="w-6 h-6" style={{ color: colors.gold }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          </div>

          <h1 className="font-display text-3xl tracking-wide mb-4" style={{ color: colors.starlight }}>
            Unlock Your Portal
          </h1>
          <p className="text-lg" style={{ color: colors.muted }}>
            Enter the code your astrologer gave you to access your chart.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl p-8 backdrop-blur-xl space-y-5"
          style={{
            background: `linear-gradient(135deg, rgba(45, 38, 64, 0.6), rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          {/* Invite Code */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{ color: colors.muted }}>
              <Key className="w-4 h-4" />
              <span>Invite Code</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="STAR-XXXX-XXXX-XXXX"
              required
              className="w-full rounded-xl px-4 py-3 outline-none transition-all font-mono tracking-wider"
              style={{
                background: 'rgba(13, 11, 20, 0.6)',
                border: `1px solid ${colors.border}`,
                color: colors.starlight,
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{ color: colors.muted }}>
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl px-4 py-3 outline-none transition-all"
              style={{
                background: 'rgba(13, 11, 20, 0.6)',
                border: `1px solid ${colors.border}`,
                color: colors.starlight,
              }}
            />
            <p className="text-xs mt-1" style={{ color: colors.muted }}>
              For password recovery
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{ color: colors.muted }}>
              <Lock className="w-4 h-4" />
              <span>Create Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full rounded-xl px-4 py-3 outline-none transition-all"
              style={{
                background: 'rgba(13, 11, 20, 0.6)',
                border: `1px solid ${colors.border}`,
                color: colors.starlight,
              }}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium mb-2" style={{ color: colors.muted }}>
              <Lock className="w-4 h-4" />
              <span>Confirm Password</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full rounded-xl px-4 py-3 outline-none transition-all"
              style={{
                background: 'rgba(13, 11, 20, 0.6)',
                border: `1px solid ${colors.border}`,
                color: colors.starlight,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center space-x-2 p-3 rounded-lg"
              style={{ backgroundColor: `${colors.error}20`, color: colors.error }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !code || !email || !password || !confirmPassword}
            className="w-full py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
            style={{
              backgroundColor: colors.gold,
              color: colors.void,
              boxShadow: `0 4px 20px ${colors.gold}40`,
            }}
          >
            <span>{loading ? 'Claiming...' : 'Claim My Portal'}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Already have access */}
        <div className="text-center mt-6">
          <p className="text-sm" style={{ color: colors.muted }}>
            Already claimed your portal?{' '}
            <Link
              href={`/portal/${slug}/client-signin`}
              className="underline hover:no-underline"
              style={{ color: colors.gold }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
