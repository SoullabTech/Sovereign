'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { useState } from 'react';

// ─── Error copy — human language, not technical codes ───────────────────────

const ERROR_COPY: Record<string, { headline: string; body: string; cta: 'resend' | 'signin' | 'begin' }> = {
  already_used: {
    headline: 'This link was already used.',
    body: 'Sign-in links are single-use for your security. Request a new one below and we\'ll send it right away.',
    cta: 'resend',
  },
  expired: {
    headline: 'This link has expired.',
    body: 'Sign-in links expire after 1 hour. Request a fresh one — it only takes a moment.',
    cta: 'resend',
  },
  no_token: {
    headline: 'Something went wrong with that link.',
    body: 'The link appears to be incomplete. Try opening it again from your email, or request a new one.',
    cta: 'resend',
  },
  verification_failed: {
    headline: 'We couldn\'t verify that link.',
    body: 'Something unexpected happened on our end. Please try again or sign in with your username and password.',
    cta: 'signin',
  },
  invalid_token: {
    headline: 'This link isn\'t valid.',
    body: 'The link may have been altered or is from an older request. Request a fresh one below.',
    cta: 'resend',
  },
};

const DEFAULT_COPY = {
  headline: 'That link didn\'t work.',
  body: 'Request a new sign-in link and try again.',
  cta: 'resend' as const,
};

// ─── Inner content (uses useSearchParams, wrapped in Suspense) ───────────────

function MagicLinkErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams?.get('reason') || 'invalid_token';
  const copy = ERROR_COPY[reason] || DEFAULT_COPY;

  const [email, setEmail] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState('');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setSendError('Please enter your email address.');
      return;
    }

    setSendStatus('sending');
    setSendError('');

    try {
      const res = await fetch('/api/members/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSendError(data.error || 'Unable to send. Please try again.');
        setSendStatus('error');
        return;
      }
      setSendStatus('sent');
    } catch {
      setSendError('Could not send the link. Please check your connection.');
      setSendStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="mb-8"
      >
        <div className="w-20 h-20 mx-auto opacity-80">
          <Holoflower size="lg" glowIntensity="low" animate={false} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-center max-w-sm mx-auto mb-8"
      >
        <h1 className="text-white text-2xl font-light mb-3 leading-snug">
          {copy.headline}
        </h1>
        <p className="text-teal-100/70 text-sm font-light leading-relaxed">
          {copy.body}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="w-full max-w-sm mx-auto"
      >
        {sendStatus === 'sent' ? (
          <div className="text-center">
            <div className="text-3xl mb-4">✉️</div>
            <p className="text-white text-base font-light">
              Check your email — a new link is on its way.
            </p>
            <p className="text-teal-100/50 text-xs mt-2 font-light">
              Link expires in 1 hour.
            </p>
          </div>
        ) : copy.cta === 'resend' ? (
          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={sendStatus === 'sending'}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-teal-100/60 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition disabled:opacity-50"
            />
            {sendError && (
              <p className="text-red-300 text-sm text-center">{sendError}</p>
            )}
            <button
              type="submit"
              disabled={sendStatus === 'sending'}
              className="w-full py-3 rounded-xl bg-white/85 hover:bg-white text-teal-950 font-semibold text-base shadow-lg transition focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50"
            >
              {sendStatus === 'sending' ? 'Sending…' : 'Send me a new link'}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => router.push('/signin')}
              className="w-full py-3 rounded-xl bg-white/85 hover:bg-white text-teal-950 font-semibold text-base shadow-lg transition focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Sign in
            </button>
          </div>
        )}
      </motion.div>

      {/* Secondary options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center space-y-2"
      >
        {copy.cta !== 'signin' && (
          <p className="text-teal-100/50 text-xs font-light">
            <a href="/signin" className="underline underline-offset-2 hover:text-teal-100/80 transition">
              Sign in with username and password instead
            </a>
          </p>
        )}
        <p className="text-teal-100/50 text-xs font-light">
          New here?{' '}
          <a href="/begin" className="underline underline-offset-2 hover:text-teal-100/80 transition">
            Begin your journey
          </a>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function MagicLinkErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <MagicLinkErrorContent />
    </Suspense>
  );
}
