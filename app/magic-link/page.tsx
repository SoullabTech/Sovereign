'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';

/**
 * Magic Link Landing Page
 *
 * Email links point here (/magic-link?token=xxx) instead of directly to the API.
 * This prevents email security scanners from consuming the token via prefetch —
 * scanners fetch HTML pages but don't click buttons.
 *
 * The token is only redeemed when the user explicitly clicks "Sign In".
 */

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');

  const handleSignIn = () => {
    if (!token) {
      router.push('/magic-link-error?reason=no_token');
      return;
    }
    setStatus('loading');
    window.location.href = `/api/members/magic-link?token=${encodeURIComponent(token)}`;
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-maia-ink-100 text-lg font-light mb-6">That link appears to be incomplete.</p>
        <button
          onClick={() => router.push('/magic-link-error?reason=no_token')}
          className="px-6 py-3 rounded-xl bg-maia-spice-500 hover:bg-maia-spice-400 text-white font-semibold transition"
        >
          Request a new link
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-maia-ink-100 text-2xl font-light mb-3 leading-snug">
        Welcome back.
      </h1>
      <p className="text-maia-ink-60 text-sm font-light leading-relaxed mb-8">
        Click below to sign in to Soullab.
      </p>

      <button
        onClick={handleSignIn}
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl bg-maia-spice-500 hover:bg-maia-spice-400 text-white font-semibold text-base shadow-lg transition focus:outline-none focus:ring-2 focus:ring-maia-spice-400/40 disabled:opacity-50"
      >
        {status === 'loading' ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-maia-ink-40 text-xs mt-4 font-light">
        This link expires in 1 hour and can only be used once.
      </p>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <AuthLayout
      holoflowerSize="lg"
      holoflowerGlow="medium"
      holoflowerAnimate
      loadingText="Verifying link..."
    >
      <MagicLinkContent />
    </AuthLayout>
  );
}
