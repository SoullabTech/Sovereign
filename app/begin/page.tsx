'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Holoflower } from '@/components/ui/Holoflower';
import { Eye, EyeOff } from 'lucide-react';
import { trackOnboarding } from '@/lib/onboarding/telemetry';

// ─── Email collection (default view) ───────────────────────────────────────

function EmailStep() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setStatus('sending');
    setError('');
    trackOnboarding({ event: 'email_submitted', email: trimmed, path: '/begin' });

    try {
      const res = await fetch('/api/members/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('sent');
    } catch {
      setError('Could not send the link. Please check your connection.');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm mx-auto"
      >
        <div className="text-4xl mb-6">✉️</div>
        <h2 className="text-white text-xl font-light mb-3">Check your email</h2>
        <p className="text-teal-100/70 text-sm font-light leading-relaxed">
          We sent a sign-in link to <strong className="text-white">{email}</strong>.
          Open it to enter the field.
        </p>
        <p className="text-teal-100/50 text-xs mt-4 font-light">
          Link expires in 15 minutes.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="w-full max-w-sm mx-auto space-y-3"
    >
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={status === 'sending'}
        autoFocus
        className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-teal-100/60 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition disabled:opacity-50"
      />

      {error && (
        <p className="text-red-300 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full py-3 rounded-xl bg-white/85 hover:bg-white text-teal-950 font-semibold text-base shadow-lg transition focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending…' : 'Send me a sign-in link'}
      </button>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => window.location.href = '/test-elemental'}
          className="text-teal-100/60 hover:text-teal-100 text-sm font-light underline underline-offset-2 transition"
        >
          Have an invite code?
        </button>
      </div>
    </motion.form>
  );
}

// ─── Profile completion (after magic link verification) ──────────────────────

function ProfileStep({ email }: { email: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedName) { setError('Please enter your name.'); return; }
    if (!trimmedUsername || trimmedUsername.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setStatus('submitting');
    setError('');

    try {
      const res = await fetch('/api/members/register-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username: trimmedUsername, password, name: trimmedName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setStatus('error');
        return;
      }

      const member = data.member;

      // Store session — mirrors what magic-link-success sets for consistency
      const sessionData = {
        id: member.id,
        memberId: member.id,
        username: member.username,
        name: member.name,
        preferredName: member.name,
        email,
        onboarded: false,
      };
      localStorage.setItem('beta_user', JSON.stringify(sessionData));
      localStorage.setItem('memberId', member.id);
      localStorage.setItem('explorerId', member.id);
      localStorage.setItem('explorerName', member.name);
      localStorage.setItem('explorerPreferredName', member.name);
      localStorage.setItem('betaOnboardingComplete', 'false');
      localStorage.setItem('signup_completed', 'true');
      localStorage.setItem('maia_session_version', '2');

      // Continue into onboarding (FAQ → onboarding → maia)
      router.push('/faq');
    } catch {
      setError('Could not complete registration. Please check your connection.');
      setStatus('error');
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full max-w-sm mx-auto space-y-3"
    >
      <p className="text-teal-100/70 text-sm text-center font-light mb-5">
        Welcome — you&apos;re verified as <strong className="text-white">{email}</strong>.<br />
        Set up your profile to enter the field.
      </p>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={status === 'submitting'}
        autoFocus
        className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-teal-100/60 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition disabled:opacity-50"
      />

      <input
        type="text"
        placeholder="Choose a username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        disabled={status === 'submitting'}
        autoComplete="username"
        className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-teal-100/60 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition disabled:opacity-50"
      />

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={status === 'submitting'}
          autoComplete="new-password"
          className="w-full px-4 py-3 pr-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-teal-100/60 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-100/60 hover:text-white transition"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p className="text-red-300 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-3 rounded-xl bg-white/85 hover:bg-white text-teal-950 font-semibold text-base shadow-lg transition focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50"
      >
        {status === 'submitting' ? 'Creating your account…' : 'Enter the field'}
      </button>
    </motion.form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function BeginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailParam = searchParams?.get('email') || '';
  // Only show profile step if both flags are present and email looks valid
  const verified = searchParams?.get('verified') === 'true' && emailParam.includes('@');

  // Track page open and redirect already-onboarded members
  useEffect(() => {
    trackOnboarding({ event: 'begin_opened', path: verified ? '/begin?verified=true' : '/begin' });
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const u = JSON.parse(betaUser);
        if (u.onboarded === true) {
          router.replace('/maia');
        }
      }
    } catch { /* ignore */ }
  }, [router, verified]);

  const heading = verified ? 'Welcome' : 'Begin your journey';
  const subtitle = verified
    ? 'Your email is verified. Set up your profile below.'
    : 'Enter your email to receive a sign-in link.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="mb-10"
      >
        <div className="w-28 h-28 mx-auto">
          <Holoflower size="xl" glowIntensity="medium" animate={true} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-white text-4xl sm:text-5xl font-extralight tracking-[0.25em] uppercase mb-3">
          Soullab
        </h1>
        <p className="text-teal-100/80 text-base font-light tracking-wide">
          {subtitle}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={verified ? 'profile' : 'email'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-sm"
        >
          {verified
            ? <ProfileStep email={emailParam} />
            : <EmailStep />
          }
        </motion.div>
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-10 text-teal-100/40 text-xs font-light tracking-wide"
      >
        Already have an account?{' '}
        <a href="/signin" className="underline underline-offset-2 hover:text-teal-100/70 transition">
          Sign in
        </a>
      </motion.p>
    </div>
  );
}

export default function BeginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <BeginContent />
    </Suspense>
  );
}
