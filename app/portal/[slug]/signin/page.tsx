'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function SigninContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug;
  const justClaimed = searchParams.get('claimed') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<{ label: string; href: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorAction(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/portal/${slug}/client-auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 401 || res.status === 403) {
          setError('We didn\'t recognise that email or password. Please try again.');
        } else if (res.status === 404) {
          setError('No portal account found. Check your invitation email to get started.');
          setErrorAction({ label: 'Go back to your invitation email →', href: `/portal/${slug}/claim` });
        } else if (res.status === 429) {
          setError('Too many attempts. Please wait a moment and try again.');
        } else {
          const msg = data?.message || data?.error || '';
          setError(msg || `Sign-in failed (${res.status}). Please try again or contact your practitioner.`);
        }
        return;
      }

      router.push(`/portal/${slug}/thread`);
    } catch (err) {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      setError(isOffline
        ? 'You appear to be offline. Please check your connection and try again.'
        : 'Unable to reach the server. Please try again in a moment.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0B14] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div style={card}>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.span
              className="text-[#D4AF37] text-xl tracking-widest block mb-5"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              ✦ ✦ ✦
            </motion.span>
            <h1 style={titleStyle}>Welcome Back</h1>
            <p className="text-[#A89FC4] text-sm leading-relaxed mt-3">
              Sign in to your private healing portal
            </p>
          </div>

          {/* Claimed banner */}
          {justClaimed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={claimedBanner}
              className="mb-6"
            >
              <span className="text-[#D4AF37] mr-2">✦</span>
              Your portal is ready. Sign in to begin.
            </motion.div>
          )}

          {/* Form */}
          <style>{`
            .portal-input::placeholder { color: #4A4570; opacity: 1; }
            .portal-input:focus { border-color: rgba(212,175,55,0.5) !important; }
          `}</style>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                className="portal-input"
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                style={inputStyle}
                className="portal-input"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={errorStyle}
              >
                {error}
                {errorAction && (
                  <Link href={errorAction.href} className="block mt-2 text-[#D4AF37] underline text-xs font-medium">
                    {errorAction.label}
                  </Link>
                )}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-sm font-bold tracking-wider !bg-[#D4AF37] text-[#0D0B14]"
              style={{
                fontFamily: "var(--font-cinzel, Georgia, serif)",
                opacity: submitting ? 0.65 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Opening your portal…' : 'Enter Your Portal'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-[#1E1A2E]" />
            <span className="text-[#3D3554] text-xs">✦</span>
            <div className="flex-1 h-px bg-[#1E1A2E]" />
          </div>

          <p className="text-center text-[#4A4465] text-sm">
            Joining for the first time?{' '}
            <Link href={`/portal/${slug}/claim`} className="text-[#D4AF37] hover:underline">
              Use your invitation link
            </Link>
          </p>

        </div>
      </motion.div>
      <p className="mt-8 text-[#3D3554] text-xs tracking-wider">POWERED BY SOULLAB</p>
    </div>
  );
}

export default function PortalSigninPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <span className="text-[#D4AF37] text-sm tracking-wider">Preparing your space…</span>
      </div>
    }>
      <SigninContent />
    </Suspense>
  );
}

// ─── Shared style objects ─────────────────────────────────────────────────────

const card: React.CSSProperties = {
  backgroundColor: '#1C1830',
  border: '1px solid rgba(212, 175, 55, 0.30)',
  borderRadius: '16px',
  padding: '40px 36px',
  boxShadow: '0 0 60px rgba(212, 175, 55, 0.04), 0 20px 60px rgba(0,0,0,0.5)',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-cinzel, Georgia, serif)",
  fontSize: '26px',
  fontWeight: 600,
  color: '#F5F0FF',
  letterSpacing: '0.04em',
  margin: 0,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#6B6490',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: '#0D0B14',
  border: '1px solid rgba(168, 159, 196, 0.2)',
  borderRadius: '8px',
  fontSize: '15px',
  color: '#F5F0FF',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const btnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '13px 20px',
  backgroundColor: '#D4AF37',
  color: '#0D0B14',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.05em',
  textDecoration: 'none',
  boxSizing: 'border-box',
  fontFamily: "var(--font-cinzel, Georgia, serif)",
};

const errorStyle: React.CSSProperties = {
  backgroundColor: 'rgba(180, 60, 60, 0.12)',
  border: '1px solid rgba(180, 60, 60, 0.3)',
  borderRadius: '8px',
  padding: '12px 14px',
  fontSize: '13px',
  color: '#E8A0A0',
  lineHeight: 1.5,
};

const claimedBanner: React.CSSProperties = {
  backgroundColor: 'rgba(212, 175, 55, 0.08)',
  border: '1px solid rgba(212, 175, 55, 0.25)',
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#D4AF37',
  display: 'flex',
  alignItems: 'center',
};
