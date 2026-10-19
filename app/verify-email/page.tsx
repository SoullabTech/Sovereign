'use client';

/**
 * Verified email — explicit, scanner-safe confirmation threshold.
 *
 * New messages carry a 256-bit token in #token, never in GET query.
 * Legacy ?token links are accepted, removed from the address bar immediately,
 * and must STILL be deliberately confirmed by the recipient. Nothing redeems
 * the token in a mount effect, request prefetch, image or link preview.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MailCheck, ShieldCheck } from 'lucide-react';

const TOKEN_SHAPE = /^[0-9a-f]{64}$/i;

export default function VerifyEmailPage() {
  const captured = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'verified' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (captured.current) return; // StrictMode effect replay must not discard the token.
    captured.current = true;
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const next = fragment.get('token') ?? query.get('token');
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (!next || !TOKEN_SHAPE.test(next)) {
      setStatus('invalid');
      return;
    }
    setToken(next);
    setStatus('ready');
  }, []);

  async function verify() {
    if (!token || status !== 'ready') return;
    setStatus('verifying');
    setMessage('');
    try {
      const result = await fetch('/api/members/verify-email', {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = await result.json().catch(() => ({}));
      if (!result.ok || body.success !== true) {
        throw new Error('This verification link is invalid, expired or already used.');
      }
      setToken(null);
      setStatus('verified');
    } catch {
      setToken(null);
      setStatus('invalid');
      setMessage('This verification link could not be confirmed. Request a new verification email.');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#102821] via-[#173B33] to-[#274B47] px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-emerald-200/15 bg-slate-950/50 p-7 shadow-2xl">
        <header className="space-y-3">
          <div className="inline-flex rounded-xl bg-emerald-500/15 p-3">
            <MailCheck className="h-7 w-7 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-semibold">Verify your Soullab email</h1>
          <p className="text-sm leading-relaxed text-slate-300">
            Confirm that you control the email address associated with your account.
            Verification is separate from changing your password.
          </p>
        </header>

        {status === 'loading' && <p className="text-sm text-slate-300">Preparing verification…</p>}
        {status === 'ready' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-200">
              Continue only if you requested verification for your Soullab account.
              Nothing has been confirmed by merely opening this link.
            </p>
            <button type="button" onClick={verify}
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950">
              Verify email
            </button>
          </div>
        )}
        {status === 'verifying' && (
          <p role="status" className="text-sm text-slate-200">Confirming your email…</p>
        )}
        {status === 'verified' && (
          <div role="status" className="space-y-4">
            <p className="flex items-center gap-2 text-emerald-200">
              <ShieldCheck className="h-5 w-5" /> Your email has been verified.
            </p>
            <Link href="/signin" className="inline-flex rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950">
              Return to sign in
            </Link>
          </div>
        )}
        {status === 'invalid' && (
          <div role="alert" className="space-y-3">
            <p className="text-sm text-amber-200">
              {message || 'This verification link is missing or invalid. Request a new verification email.'}
            </p>
            <Link href="/signin" className="text-sm text-emerald-300 underline">Return to sign in</Link>
          </div>
        )}
      </div>
    </main>
  );
}
