/**
 * Signup — the navy member threshold (sovereign default, code-primary)
 *
 * Visual language matches /signin and /welcome-back: dark navy, holoflower,
 * low stimulation. NO teal, NO induction artifacts, NO invite-passkey language.
 *
 * Auth model (decided 2026-06-04 — codes over links; links never worked for us):
 *   Primary   — email + 6-digit one-time code. Enter email → code arrives →
 *               type it on this page → continue. No link to click, no handoff.
 *   Return    — Face ID / Touch ID / WebAuthn (offered right after first signup;
 *               labelled by device, never "passkey").
 *   Secondary — Google / Apple (small, below the main flow).
 *   Recovery  — an optional password, quiet. Most people never set one.
 *
 * Account creation is passkeyless + passwordless by default via
 * /api/members/register-email (the verified code marks the email as recently
 * verified). Existing members who enter a code here are simply signed in.
 *
 * Phases: 'email' → 'code' → 'finish' (new). ?verified=true jumps to 'finish'.
 */
'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import { deviceTrust } from '@/lib/auth/deviceTrust';
import { betaSession } from '@/lib/auth/betaSession';
import { apiUrl } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';

const CARD_STYLE: React.CSSProperties = {
  background: 'linear-gradient(165deg, rgba(15, 29, 50, 0.8), rgba(10, 22, 40, 0.6))',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(30, 58, 95, 0.5)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(30, 58, 95, 0.3)',
};
const INPUT_CLASS =
  'w-full rounded-xl bg-maia-navy-850 border border-maia-navy-700 px-4 py-3 text-base text-white placeholder:text-slate-500 outline-none focus:border-maia-navy-600 transition-all';
const PRIMARY_BTN_CLASS =
  'w-full rounded-xl bg-maia-navy-700 hover:bg-maia-navy-600 text-white px-4 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg';

function deriveUsername(email: string): string {
  const base = (email.split('@')[0] || 'soul').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  return base || 'soul';
}
function randomSuffix(): string {
  const arr = new Uint8Array(2);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
// Strong random password used when the member stays passwordless; they return
// via a fresh code or biometrics, so they never need to know it.
function generatePassword(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

type Phase = 'email' | 'code' | 'finish';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preVerified = searchParams?.get('verified') === 'true';
  const emailParam = searchParams?.get('email') || '';

  const [phase, setPhase] = useState<Phase>(preVerified ? 'finish' : 'email');
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioPlatformAvailable, setBioPlatformAvailable] = useState(false);

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);

  useEffect(() => {
    (async () => {
      try {
        const avail = await biometricAuth.getAvailability();
        setBioAvailable(avail.available);
        setBioPlatformAvailable(avail.platformAvailable);
      } catch {
        // non-blocking
      }
    })();
  }, []);

  useEffect(() => {
    if (preVerified) return;
    const sessionState = betaSession.restoreSession();
    if (sessionState.isAuthenticated && sessionState.user) {
      router.replace('/maia');
    }
  }, [router, preVerified]);

  function storeSession(user: { id: string; username: string; name: string; preferredName?: string; onboarded: boolean }) {
    const displayName = user.preferredName || user.name || 'Friend';
    localStorage.setItem('beta_user', JSON.stringify(user));
    localStorage.setItem('explorerId', user.id);
    localStorage.setItem('explorerName', displayName);
    localStorage.setItem('explorerPreferredName', displayName);
    localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');
    localStorage.setItem('maia_session_version', '2');
    localStorage.setItem('signup_completed', 'true');
  }

  async function trustThisDevice() {
    try {
      await deviceTrust.trustDevice(undefined, 'standard');
    } catch {
      // non-blocking
    }
  }

  // ── Phase 'email': request a code ────────────────────────────────────────
  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError('');
    const clean = email.toLowerCase().trim();
    if (!clean.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/members/email-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Could not send the code. Please try again.');
        return;
      }
      setCode('');
      setPhase('code');
    } catch {
      setError('Could not send the code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Phase 'code': verify ─────────────────────────────────────────────────
  async function verifyCode(submitCode: string) {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/members/email-code/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.toLowerCase().trim(), code: submitCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Incorrect code.');
        setIsLoading(false);
        return;
      }
      if (data.member) {
        // Existing member — signed in.
        storeSession({
          id: data.member.id,
          username: data.member.username,
          name: data.member.name,
          preferredName: data.member.name,
          onboarded: !!data.member.onboarded,
        });
        await trustThisDevice();
        router.push(data.redirect || (data.member.onboarded ? '/maia' : '/onboarding'));
        return;
      }
      // New email verified — collect a name.
      setPhase('finish');
      setIsLoading(false);
    } catch {
      setError('Could not verify the code. Please try again.');
      setIsLoading(false);
    }
  }

  function onCodeChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6 && !isLoading) {
      verifyCode(digits);
    }
  }

  // ── Phase 'finish': create the account ───────────────────────────────────
  async function completeSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const pwd = password.trim() || generatePassword();
      let username = deriveUsername(cleanEmail);
      let res: Response | null = null;
      let data: any = {};

      for (let attempt = 0; attempt < 3; attempt++) {
        res = await fetch(apiUrl('/api/members/register-email'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: cleanEmail, username, password: pwd, name: name.trim() || username }),
        });
        data = await res.json().catch(() => ({}));
        if (res.status === 409 && /username/i.test(data?.error || '')) {
          username = `${deriveUsername(cleanEmail)}${randomSuffix()}`;
          continue;
        }
        break;
      }

      if (!res || !res.ok) {
        setError(data?.error || 'Could not complete signup. Please try again.');
        setIsLoading(false);
        return;
      }

      storeSession({
        id: data.member.id,
        username: data.member.username,
        name: data.member.name || name,
        preferredName: name || data.member.name,
        onboarded: !!data.member.onboarded,
      });
      await trustThisDevice();

      if (bioAvailable && bioPlatformAvailable) {
        try {
          await biometricAuth.register();
        } catch {
          // optional
        }
      }

      router.push(data.member.onboarded ? '/maia' : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete signup. Please try again.');
      setIsLoading(false);
    }
  }

  // ── Secondary: Google / Apple ────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    try {
      if (Capacitor.isNativePlatform()) {
        const { GoogleAuth } = await import('@southdevs/capacitor-google-auth');
        await GoogleAuth.initialize({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
        const result = await GoogleAuth.signIn({ scopes: ['profile', 'email'] });
        const idToken = result.authentication?.idToken;
        if (!idToken) throw new Error('Missing Google idToken');
        const res = await fetch(apiUrl('/api/auth/google/native-callback'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idToken, email: result.email, name: result.name, imageUrl: result.imageUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
        if (data.member) {
          storeSession(data.member);
          await trustThisDevice();
          router.push(data.member.onboarded ? '/maia' : '/onboarding');
        }
        return;
      }
      window.location.href = '/api/auth/google/list';
    } catch (e) {
      setError('Google sign-in failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleApple = async () => {
    setError('');
    try {
      if (Capacitor.isNativePlatform()) {
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
        const result = await SignInWithApple.authorize({ clientId: 'life.soullab.maia', scopes: 'email name', redirectURI: '' });
        const identityToken = result?.response?.identityToken;
        if (!identityToken) throw new Error('Missing Apple identityToken');
        const res = await fetch(apiUrl('/api/auth/apple/native-callback'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            identityToken,
            authorizationCode: result.response?.authorizationCode,
            email: result.response?.email,
            givenName: result.response?.givenName,
            familyName: result.response?.familyName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Apple sign-in failed');
        if (data.member) {
          storeSession(data.member);
          await trustThisDevice();
          router.push(data.member.onboarded ? '/maia' : '/onboarding');
        }
        return;
      }
      window.location.href = '/api/auth/apple/list';
    } catch (e) {
      setError('Apple sign-in failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const errorBlock = error ? (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-900/20 p-3 text-sm text-amber-300/90">
      {error}
    </div>
  ) : null;

  return (
    <div className="min-h-[100dvh] bg-soullab-core flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-12">
        <div className="w-28 h-28 mx-auto">
          <Holoflower size="xl" glowIntensity="medium" animate={true} theme="dark" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl p-8 max-w-sm w-full"
        style={CARD_STYLE}
      >
        <AnimatePresence mode="wait">
          {phase === 'finish' ? (
            // ── Create the account ──
            <motion.div key="finish" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-3xl font-extralight text-white/80 mb-3 tracking-[0.2em] text-center">Almost there</h1>
              <p className="text-sm text-slate-300/80 font-light mb-6 text-center leading-relaxed">
                {email ? <><span className="text-slate-200">{email}</span> is verified.</> : 'Your email is verified.'} What should MAIA call you?
              </p>

              {errorBlock}

              <form onSubmit={completeSignup} className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus className={INPUT_CLASS} />
                {showPasswordField ? (
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password (optional)" autoComplete="new-password" className={INPUT_CLASS} />
                ) : null}
                <button type="submit" disabled={isLoading} className={PRIMARY_BTN_CLASS}>
                  {isLoading ? 'Entering…' : 'Enter MAIA'}
                </button>
              </form>

              <div className="mt-5 text-center">
                {!showPasswordField && (
                  <button type="button" onClick={() => setShowPasswordField(true)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    Prefer a password? Set one (optional)
                  </button>
                )}
                <p className="mt-3 text-xs text-slate-500/80 leading-relaxed">
                  You’ll return with an emailed code{bioAvailable ? ` or ${biometricLabel}` : ''} — a password is optional.
                </p>
              </div>
            </motion.div>
          ) : phase === 'code' ? (
            // ── Enter the code ──
            <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <h1 className="text-3xl font-extralight text-white/80 mb-3 tracking-[0.2em]">Enter code</h1>
              <p className="text-sm text-slate-300/80 font-light mb-6 leading-relaxed">
                We sent a 6-digit code to <span className="text-slate-200">{email}</span>.
              </p>

              {errorBlock}

              <input
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                autoFocus
                placeholder="••••••"
                className="w-full rounded-xl bg-maia-navy-850 border border-maia-navy-700 px-4 py-4 text-center text-2xl tracking-[0.5em] text-white placeholder:text-slate-600 outline-none focus:border-maia-navy-600 transition-all"
              />

              <button type="button" disabled={isLoading || code.length < 6} onClick={() => verifyCode(code)} className={`${PRIMARY_BTN_CLASS} mt-4`}>
                {isLoading ? 'Verifying…' : 'Verify'}
              </button>

              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500">
                <button type="button" onClick={() => sendCode()} disabled={isLoading} className="hover:text-slate-300 transition-colors">Resend code</button>
                <span className="text-slate-700">·</span>
                <button type="button" onClick={() => { setPhase('email'); setError(''); setCode(''); }} className="hover:text-slate-300 transition-colors">Change email</button>
              </div>
            </motion.div>
          ) : (
            // ── Enter email ──
            <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-3xl font-extralight text-white/80 mb-3 tracking-[0.2em] text-center">Welcome</h1>
              <p className="text-sm text-slate-300/80 font-light mb-6 text-center leading-relaxed">
                Enter your email and we’ll send a 6-digit code. No password to remember.
              </p>

              {errorBlock}

              <form onSubmit={sendCode} className="space-y-3">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" autoComplete="email" autoFocus className={INPUT_CLASS} />
                <button type="submit" disabled={isLoading || !email} className={PRIMARY_BTN_CLASS}>
                  {isLoading ? 'Sending…' : 'Send code'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-maia-navy-700/30" />
                <span className="text-xs text-slate-500 uppercase tracking-wide">or</span>
                <div className="flex-1 h-px bg-maia-navy-700/30" />
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <button type="button" onClick={handleGoogle} title="Continue with Google" className="w-11 h-11 rounded-xl bg-maia-navy-850/50 hover:bg-maia-navy-700/60 border border-maia-navy-700/60 flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button type="button" onClick={handleApple} title="Continue with Apple" className="w-11 h-11 rounded-xl bg-black/50 hover:bg-black/70 border border-maia-navy-700/60 flex items-center justify-center transition-all">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-maia-navy-700/30 text-center">
                <button type="button" onClick={() => router.push('/signin')} className="text-sm font-medium text-slate-300 hover:text-slate-200 transition-colors">
                  Already have an account? Sign in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-soullab-core flex items-center justify-center text-slate-400/70">
          Loading…
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
