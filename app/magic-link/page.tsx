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
      // /magic-link-error was removed (5cf5c9f86); all token errors route to
      // /signin?link=<reason>, same as the API route's error redirects.
      router.push('/signin?link=no_token');
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
          onClick={() => router.push('/signin?link=no_token')}
          className="px-6 py-3 rounded-xl bg-white/85 text-teal-950 font-semibold"
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
      <p className="text-teal-100/70 text-sm font-light leading-relaxed mb-8">
        Click below to sign in to Soullab.
      </p>

      <button
        onClick={handleSignIn}
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl bg-white/85 hover:bg-white text-teal-950 font-semibold text-base shadow-lg transition focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50"
      >
        {status === 'loading' ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-teal-100/40 text-xs mt-4 font-light">
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
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-6">
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
        className="rounded-2xl p-8 shadow-2xl border max-w-sm w-full"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.18), rgba(110,231,183,0.05), rgba(255,255,255,0.15))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 0 60px rgba(251,191,36,0.3), 0 0 100px rgba(245,158,11,0.2)',
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <MagicLinkContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
