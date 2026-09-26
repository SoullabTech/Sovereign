'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';

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
    // Navigate directly — the browser follows all redirects naturally.
    // fetch() can't be used here because the API returns a server-side redirect
    // to /magic-link-success which sets a session cookie; fetch would swallow it.
    window.location.href = `/api/members/magic-link?token=${encodeURIComponent(token)}`;
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-white text-lg font-light mb-6">That link appears to be incomplete.</p>
        <button
          onClick={() => router.push('/magic-link-error?reason=no_token')}
          className="px-6 py-3 rounded-xl bg-maia-navy-700 hover:bg-maia-navy-600 text-white font-medium transition-all shadow-lg"
        >
          Request a new link
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-white text-2xl font-light mb-3 leading-snug">
        Welcome back.
      </h1>
      <p className="text-slate-400 text-sm font-light leading-relaxed mb-8">
        Click below to sign in to Soullab.
      </p>

      <button
        onClick={handleSignIn}
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl bg-maia-navy-700 hover:bg-maia-navy-600 text-white font-medium text-base shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-maia-navy-600 disabled:opacity-50"
      >
        {status === 'loading' ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-slate-500 text-xs mt-4 font-light">
        This link expires in 1 hour and can only be used once.
      </p>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
  );
}

export default function MagicLinkPage() {
  return (
    <div className="min-h-[100dvh] bg-soullab-core flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="w-24 h-24 mx-auto">
          <Holoflower size="lg" glowIntensity="medium" animate={true} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="rounded-2xl p-8 max-w-sm w-full"
        style={{
          background: 'linear-gradient(165deg, rgba(15, 29, 50, 0.8), rgba(10, 22, 40, 0.6))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(30, 58, 95, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(30, 58, 95, 0.3)',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <MagicLinkContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
