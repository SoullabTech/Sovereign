'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { biometricAuth } from '@/lib/auth/biometricAuth';

type Step =
  | 'email'
  | 'biometric'        // returning user with webauthn
  | 'password'         // returning user, no webauthn or chose password
  | 'new-user'         // new account setup
  | 'set-new-password' // forgot password flow
  | 'offer-biometric'  // post sign-in: offer to enable biometrics
  | 'done';

function storeSession(member: { id: string; name: string; email?: string; onboarded: boolean }) {
  localStorage.setItem('beta_user', JSON.stringify(member));
}

export default function BeginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioLabel, setBioLabel] = useState('Biometric');
  const [bioLoading, setBioLoading] = useState(false);
  const [offerBioStatus, setOfferBioStatus] = useState<'idle' | 'registering' | 'done' | 'skipped'>('idle');

  useEffect(() => {
    biometricAuth.getAvailability().then(avail => setBioAvailable(avail.available));
    setBioLabel(biometricAuth.getBiometricName());
  }, []);

  // ── Email step ───────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) { setError('Please enter a valid email.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/members/lookup-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (data.exists) {
        setMemberName(data.name || '');
        if (data.hasWebauthn && bioAvailable) {
          setStep('biometric');
        } else {
          setStep('password');
        }
      } else {
        setStep('new-user');
      }
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  // ── Biometric sign-in ────────────────────────────────────────────────────
  const handleBiometricSignIn = async () => {
    setBioLoading(true); setError('');
    try {
      const res = await biometricAuth.authenticate(email.trim().toLowerCase());
      if (!res.success) {
        const msg =
          res.code === 'USER_CANCELLED' || res.code === 'BIOMETRY_FAILED' ? 'Cancelled. Tap again when ready.' :
          res.code === 'CREDENTIAL_NOT_FOUND' ? 'No biometric found. Use password instead.' :
          res.code === 'CHALLENGE_EXPIRED' ? 'Took too long. Try again.' :
          res.error || 'Something went wrong.';
        setError(msg);
        setBioLoading(false);
        return;
      }
      if (res.member) storeSession({ id: res.member.id, name: res.member.name, onboarded: res.member.onboarded });
      setStep('done');
      setTimeout(() => router.push('/maia'), 800);
    } catch { setError('Biometric sign-in failed. Try your password.'); }
    finally { setBioLoading(false); }
  };

  // ── Password sign-in (returning) ─────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Enter your password.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/members/enter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(res.status === 401 ? 'Incorrect password.' : (data.error || 'Something went wrong.')); return; }
      if (data.member) storeSession({ id: data.member.id, name: data.member.name, email: data.member.email, onboarded: data.member.onboarded });
      // Offer biometric if available and not already set up
      if (bioAvailable && !data.member?.hasWebauthn) {
        setStep('offer-biometric');
      } else {
        setStep('done');
        setTimeout(() => router.push('/maia'), 800);
      }
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  // ── New user registration ─────────────────────────────────────────────────
  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('What should we call you?'); return; }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/members/enter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      if (data.member) storeSession({ id: data.member.id, name: data.member.name, email: data.member.email, onboarded: data.member.onboarded });
      if (bioAvailable) {
        setStep('offer-biometric');
      } else {
        setStep('done');
        setTimeout(() => router.push('/maia'), 800);
      }
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  // ── Set new password ──────────────────────────────────────────────────────
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/members/set-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), newPassword: password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Something went wrong.'); return; }
      const signIn = await fetch('/api/members/enter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const d = await signIn.json();
      if (d.member) storeSession({ id: d.member.id, name: d.member.name, email: d.member.email, onboarded: d.member.onboarded });
      setStep('done');
      setTimeout(() => router.push('/maia'), 800);
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  // ── Enable biometrics ─────────────────────────────────────────────────────
  const handleEnableBiometric = async () => {
    setOfferBioStatus('registering');
    try {
      const res = await biometricAuth.register();
      if (res.success) {
        setOfferBioStatus('done');
        setTimeout(() => { setStep('done'); router.push('/maia'); }, 1200);
      } else {
        setOfferBioStatus('skipped');
        setTimeout(() => { setStep('done'); router.push('/maia'); }, 800);
      }
    } catch {
      setOfferBioStatus('skipped');
      setTimeout(() => { setStep('done'); router.push('/maia'); }, 800);
    }
  };

  const subtitle: Record<Step, string> = {
    email: 'Your space is waiting.',
    biometric: memberName ? `Welcome back, ${memberName.split(' ')[0]}.` : 'Welcome back.',
    password: memberName ? `Welcome back, ${memberName.split(' ')[0]}.` : 'Welcome back.',
    'new-user': 'Good to meet you.',
    'set-new-password': 'Create a new password.',
    'offer-biometric': 'One more thing.',
    done: 'Entering…',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative"
      style={{ background: 'linear-gradient(135deg, #8FBCBE 0%, #6A9EA1 50%, #5A8E91 100%)' }}>

      {/* Holoflower */}
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }} className="mb-6">
        <img src="/holoflower.png" alt="" width={80} height={80} style={{ opacity: 0.9 }} />
      </motion.div>

      {/* Wordmark */}
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
        className="text-white tracking-[0.3em] text-xl font-light mb-2">
        S O U L L A B
      </motion.h1>

      {/* Subtitle */}
      <AnimatePresence mode="wait">
        <motion.p key={step + memberName} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.65, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          className="text-white text-sm font-light mb-10 text-center">
          {subtitle[step]}
        </motion.p>
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── Email ── */}
        {step === 'email' && (
          <motion.form key="email" onSubmit={handleEmailSubmit}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}
            className="w-full max-w-sm space-y-3">
            <input type="email" placeholder="your email" value={email} autoFocus
              onChange={e => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-sm" />
            {error && <p className="text-red-200 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-white/90 text-[#5A8E91] font-medium text-sm hover:bg-white transition-all disabled:opacity-50">
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </motion.form>
        )}

        {/* ── Biometric ── */}
        {step === 'biometric' && (
          <motion.div key="biometric"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}
            className="w-full max-w-sm space-y-3 text-center">
            <button onClick={handleBiometricSignIn} disabled={bioLoading}
              className="w-full py-4 rounded-xl bg-white/90 text-[#5A8E91] font-medium text-sm hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {bioLoading ? 'Verifying…' : (
                <>
                  <span className="text-lg">🔒</span>
                  Use {bioLabel}
                </>
              )}
            </button>
            {error && <p className="text-red-200 text-xs">{error}</p>}
            <button type="button" onClick={() => { setError(''); setStep('password'); }}
              className="text-white/50 text-xs hover:text-white/80 underline">
              Use password instead
            </button>
            <p className="pt-1">
              <button type="button" onClick={() => { setStep('email'); setError(''); }}
                className="text-white/30 text-xs hover:text-white/60">← Back</button>
            </p>
          </motion.div>
        )}

        {/* ── Password (returning) ── */}
        {step === 'password' && (
          <motion.form key="password" onSubmit={handlePasswordSubmit}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}
            className="w-full max-w-sm space-y-3">
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="password" value={password} autoFocus
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <div className="text-center space-y-1">
                <p className="text-red-200 text-xs">{error}</p>
                {error.includes('Incorrect') && (
                  <button type="button" onClick={() => { setError(''); setPassword(''); setConfirmPassword(''); setStep('set-new-password'); }}
                    className="text-white/60 text-xs underline hover:text-white/90">
                    Set a new password instead
                  </button>
                )}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-white/90 text-[#5A8E91] font-medium text-sm hover:bg-white transition-all disabled:opacity-50">
              {loading ? 'Entering…' : 'Enter'}
            </button>
            <p className="text-center">
              <button type="button" onClick={() => { setStep('email'); setPassword(''); setError(''); }}
                className="text-white/40 text-xs hover:text-white/70">← Back</button>
            </p>
          </motion.form>
        )}

        {/* ── New user ── */}
        {step === 'new-user' && (
          <motion.form key="new-user" onSubmit={handleNewUserSubmit}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}
            className="w-full max-w-sm space-y-3">
            <input type="text" placeholder="your name" value={name} autoFocus
              onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-sm" />
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="create a password" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-200 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-white/90 text-[#5A8E91] font-medium text-sm hover:bg-white transition-all disabled:opacity-50">
              {loading ? 'Creating your space…' : 'Enter'}
            </button>
            <p className="text-center">
              <button type="button" onClick={() => { setStep('email'); setError(''); }}
                className="text-white/40 text-xs hover:text-white/70">← Back</button>
            </p>
          </motion.form>
        )}

        {/* ── Set new password ── */}
        {step === 'set-new-password' && (
          <motion.form key="set-new-password" onSubmit={handleSetNewPassword}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}
            className="w-full max-w-sm space-y-3">
            <input type="password" placeholder="new password (6+ characters)" value={password} autoFocus
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-sm" />
            <input type="password" placeholder="confirm password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/50 text-sm" />
            {error && <p className="text-red-200 text-xs text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-white/90 text-[#5A8E91] font-medium text-sm hover:bg-white transition-all disabled:opacity-50">
              {loading ? 'Saving…' : 'Set password & enter'}
            </button>
            <p className="text-center">
              <button type="button" onClick={() => { setStep('password'); setError(''); setPassword(''); setConfirmPassword(''); }}
                className="text-white/40 text-xs hover:text-white/70">← Back</button>
            </p>
          </motion.form>
        )}

        {/* ── Offer biometric ── */}
        {step === 'offer-biometric' && (
          <motion.div key="offer-biometric"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}
            className="w-full max-w-sm space-y-3 text-center">
            {offerBioStatus === 'idle' && (
              <>
                <p className="text-white/80 text-sm font-light leading-relaxed">
                  Use {bioLabel} next time?<br />
                  <span className="text-white/50 text-xs">Your touch becomes your key.</span>
                </p>
                <button onClick={handleEnableBiometric}
                  className="w-full py-3 rounded-xl bg-white/90 text-[#5A8E91] font-medium text-sm hover:bg-white transition-all flex items-center justify-center gap-2">
                  <span className="text-lg">🔒</span> Enable {bioLabel}
                </button>
                <button type="button" onClick={() => { setStep('done'); router.push('/maia'); }}
                  className="text-white/40 text-xs hover:text-white/70 underline">
                  Maybe later
                </button>
              </>
            )}
            {offerBioStatus === 'registering' && (
              <p className="text-white/70 text-sm font-light">Setting up {bioLabel}…</p>
            )}
            {offerBioStatus === 'done' && (
              <p className="text-white/90 text-sm font-light">✓ {bioLabel} enabled. Entering…</p>
            )}
          </motion.div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-white/80 text-sm font-light tracking-wide">
            Welcome.
          </motion.p>
        )}

      </AnimatePresence>

      {/* Footer */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 text-white text-xs font-light tracking-widest">
        Sovereign by design.
      </motion.p>
    </div>
  );
}
