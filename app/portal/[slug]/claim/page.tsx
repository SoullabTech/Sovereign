'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';

function ClaimContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug;
  const code = useMemo(() => searchParams.get('code') || '', [searchParams]);
  const prefillEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<{ label: string; href?: string; onClick?: () => void } | null>(null);

  function setErrorWithAction(msg: string, action?: { label: string; href?: string; onClick?: () => void }) {
    setError(msg);
    setErrorAction(action ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorAction(null);

    if (!code) { setError('This invite link is incomplete.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 8) { setError('Please choose a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Your passwords do not match.'); return; }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/portal/${slug}/invites/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errCode = data?.error || '';
        const errMsg = data?.message || '';

        if (errCode === 'already_claimed') {
          setErrorWithAction('This portal is already set up. Please sign in.', {
            label: 'Sign in →',
            href: `/portal/${slug}/signin`,
          });
        } else if (errCode === 'expired') {
          setErrorWithAction('This invitation link has expired. Please contact your practitioner for a fresh one.', {
            label: 'Request a new invite →',
            href: `mailto:?subject=${encodeURIComponent('Portal invite request')}`,
          });
        } else if (errCode === 'invalid' || res.status === 410) {
          setErrorWithAction('This invitation is no longer active. Please contact your practitioner.', {
            label: 'Request a new invite →',
            href: `mailto:?subject=${encodeURIComponent('Portal invite request')}`,
          });
        } else if (errCode === 'email_mismatch') {
          setErrorWithAction('This email doesn\'t match the one used for the booking.', {
            label: 'Try a different email address',
            onClick: () => { setEmail(''); setError(null); setErrorAction(null); },
          });
        } else if (res.status === 404 || errMsg.toLowerCase().includes('invalid invite')) {
          setErrorWithAction('This invitation link is invalid or has expired. Please check your email for the correct link.', {
            label: 'Go back to your invitation email',
            onClick: () => { setError(null); setErrorAction(null); },
          });
        } else if (res.status === 400) {
          setErrorWithAction(errMsg || 'Please check your details and try again.');
        } else {
          // Show the actual server message if present, otherwise a safe fallback
          setErrorWithAction(errMsg || errCode || `Unable to claim access (${res.status}). Please contact your practitioner.`);
        }
        return;
      }
      router.push(`/portal/${slug}/signin?claimed=1`);
    } catch (err) {
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      setErrorWithAction(isOffline
        ? 'You appear to be offline. Please check your connection and try again.'
        : 'Unable to reach the server. Please try again in a moment.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-[#0D0B14] flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div style={card}>
            <div className="text-center mb-8">
              <span className="text-[#D4AF37] text-xl tracking-widest block mb-5">✦ ✦ ✦</span>
              <h1 style={titleStyle}>Invitation Incomplete</h1>
              <p className="text-[#A89FC4] text-sm leading-relaxed mt-3">
                This link appears to be missing its invitation code.<br />
                Please use the full link from your email.
              </p>
            </div>
            <Link href={`/portal/${slug}/signin`} className="block text-center w-full py-3 rounded-lg text-sm font-bold tracking-wider bg-[#D4AF37] text-[#0D0B14]" style={{ fontFamily: "var(--font-cinzel, Georgia, serif)" }}>
              Go to Sign In
            </Link>
          </div>
        </motion.div>
        <p className="mt-8 text-[#3D3554] text-xs tracking-wider">POWERED BY SOULLAB</p>
      </div>
    );
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
            <h1 style={titleStyle}>Your Healing Space Awaits</h1>
            <p className="text-[#A89FC4] text-sm leading-relaxed mt-3">
              Your practitioner has created a private portal for your journey together.
              Create a password to step inside.
            </p>
          </div>

          {/* Form */}
          <style>{`
            .portal-input::placeholder { color: #4A4570; opacity: 1; }
            .portal-input:focus { border-color: rgba(212,175,55,0.5) !important; }
          `}</style>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label style={labelStyle}>Your Email</label>
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
              <p className="text-[#4A4465] text-xs mt-1.5">Use the email address you booked with</p>
            </div>

            <div>
              <label style={labelStyle}>Create a Password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                style={inputStyle}
                className="portal-input"
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your password again"
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
                  errorAction.href
                    ? <Link href={errorAction.href} className="block mt-2 text-[#D4AF37] underline text-xs font-medium">
                        {errorAction.label}
                      </Link>
                    : <button type="button" onClick={errorAction.onClick} className="block mt-2 text-[#D4AF37] underline text-xs font-medium text-left bg-transparent border-none p-0 cursor-pointer">
                        {errorAction.label}
                      </button>
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
              {submitting ? 'Opening your portal…' : 'Step Into Your Portal'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-[#1E1A2E]" />
            <span className="text-[#3D3554] text-xs">✦</span>
            <div className="flex-1 h-px bg-[#1E1A2E]" />
          </div>

          <p className="text-center text-[#4A4465] text-sm">
            Already have access?{' '}
            <Link href={`/portal/${slug}/signin`} className="text-[#D4AF37] hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </motion.div>
      <p className="mt-8 text-[#3D3554] text-xs tracking-wider">POWERED BY SOULLAB</p>
    </div>
  );
}

export default function PortalClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <span className="text-[#D4AF37] text-sm tracking-wider">Preparing your space…</span>
      </div>
    }>
      <ClaimContent />
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
  fontSize: '22px',
  fontWeight: 600,
  color: '#F5F0FF',
  letterSpacing: '0.04em',
  margin: 0,
  lineHeight: 1.3,
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
