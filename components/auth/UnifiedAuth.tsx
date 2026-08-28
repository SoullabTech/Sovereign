/**
 * UnifiedAuth — the single front door for /signin and /signup.
 *
 * Decided 2026-06-04: there is no separate "sign in" vs "sign up" surface and no
 * "email me a code" side-link. Email + one-time code IS the default action.
 *
 *   Default      Welcome → email → Continue → 6-digit code
 *     ├ existing email → code verifies → straight in
 *     └ new email      → code verifies → ask name → account created
 *   Return       Continue with Face ID / Touch ID (biometric)
 *   Peer         username + password (visible button, not a footnote — 2026-08-24)
 *   Secondary    Google / Apple
 *
 * 2026-08-24: username + password was a 12px link under a hairline at the bottom
 * of the card. Members who set a password during induction (and anyone arriving
 * from /signin?from=signout) had to hunt for their own sign-in path. It is now a
 * full-width peer button in the same stack as biometric. The DEFAULT is unchanged
 * and deliberately so: accounts created through the email-code flow are assigned a
 * generated password the member never sees, so password-first would strand them.
 *
 * 2026-08-24 (second pass): a failed code-send used to leave the member at a dead
 * end — a truthful "retrying won't help" banner and no way forward. Now, when an
 * email-code send fails, the existing password alternative becomes primary for that
 * state: Continue drops to outline and the peer username+password button takes
 * primary weight. The hierarchy flips rather than growing, so there is still one
 * password button in every state, by construction.
 *
 * This does NOT inspect whether the failure is retryable — any non-OK response or
 * transport error trips it. That is deliberate: once the default door has failed,
 * a member holding a valid password should not be stranded while we decide whether
 * the failure was permanent. Email remains the default the moment sending works.
 *
 * 2026-08-24 (third pass): the card also REMEMBERS that a send recently failed,
 * per browser, for 30 minutes, so a fresh visit does not pretend nothing happened
 * and walk the member back into the same wall. What is remembered is one narrow
 * observation — a send failed — and what it buys is PRESENTATION, not a destination:
 * the full card still renders, with Continue demoted, password recovery prominent,
 * and Google / Apple / biometric all reachable. It deliberately does NOT open the
 * password phase — see the paragraph above: an email-code member's password is
 * generated and never seen, so a password-first card would strand precisely the
 * people a send failure hurts most. Cleared the instant a send succeeds, and
 * expiring on its own since whatever caused the failure may already be over.
 *
 * Both app/signin/page.tsx and app/signup/page.tsx render this. Visual language:
 * dark navy + holoflower, matching /welcome-back. No teal, no induction.
 */
'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import {
  shouldOfferWebBiometric,
  webBiometricNotice,
  readLocalPasskeyEvidence,
  markLocalPasskeyEvidence,
  type WebEnrollment,
} from '@/lib/auth/webBiometricOffer';
import { unifiedBiometry } from '@/lib/auth/unifiedBiometry';
import { deviceTrust } from '@/lib/auth/deviceTrust';
import { apiUrl, apiFetch } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';
import { getFeatureFlag } from '@/lib/features/flags';
import { isFeatureEnabled } from '@/lib/utils/feature-flags';

const CARD_STYLE: React.CSSProperties = {
  background: 'linear-gradient(165deg, rgba(15, 29, 50, 0.8), rgba(10, 22, 40, 0.6))',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(30, 58, 95, 0.5)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(30, 58, 95, 0.3)',
};
// Inputs are glass set INTO the card, not opaque panels sitting on top of it: a
// translucent navy fill over the card's own blur, with an inset shadow so the
// field reads as recessed rather than raised.
//
// The `autofill:` rules are the load-bearing part. The class above already said
// bg-maia-navy-850, and the fields still rendered near-white the moment Chrome
// filled them — the browser paints its own background for an autofilled input
// and no ordinary `background` declaration wins. The only reliable override is
// a huge inset box-shadow, with -webkit-text-fill-color for the text, because
// `color` loses to autofill too. Without these, restyling the background does
// nothing for the exact case a returning member sees: a remembered username
// and password already in the fields.
const INPUT_CLASS =
  'w-full rounded-xl bg-maia-navy-900/45 backdrop-blur-sm border border-maia-navy-700/60 px-4 py-3 text-base text-white caret-white placeholder:text-slate-500 outline-none ' +
  'shadow-[inset_0_1px_2px_rgba(0,0,0,0.28)] ' +
  'focus:border-maia-navy-600 focus:bg-maia-navy-900/60 transition-all ' +
  'autofill:shadow-[inset_0_0_0_1000px_rgba(10,22,40,0.92)] ' +
  'autofill:[-webkit-text-fill-color:#ffffff] autofill:[caret-color:#ffffff] ' +
  'autofill:[transition:background-color_9999s_ease-in-out_0s]';
const PRIMARY_BTN =
  'w-full rounded-xl bg-maia-navy-700 hover:bg-maia-navy-600 text-white px-4 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg';
const OUTLINE_BTN =
  'w-full rounded-xl border border-maia-navy-700/50 bg-maia-navy-850/40 px-4 py-3 text-center text-sm font-medium text-slate-200 hover:bg-maia-navy-700/50 disabled:opacity-50 transition-all';

// Arrival remodel — deep-navy glass on the navy cosmos field. Plum lives ONLY in the atmospheric bloom, never on the surfaces
// (brand direction 2026-07-22: Cosmos=navy · Presence=plum glow · Meaning=holoflower — navy foundation, holoflower is the jewel). Presentation only; flag-gated.
const ARRIVAL_CARD_STYLE: React.CSSProperties = {
  // Deep-navy glass with a few percent of plum warmth in the tint/border/highlight — candlelight against the navy, felt not seen.
  background: 'linear-gradient(165deg, rgba(27, 31, 57, 0.75), rgba(18, 19, 43, 0.58))',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(84, 80, 136, 0.30)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.34), 0 2px 8px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(146, 128, 188, 0.14)',
};

function deriveUsername(email: string): string {
  const base = (email.split('@')[0] || 'soul').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  return base || 'soul';
}
function randomSuffix(): string {
  const a = new Uint8Array(2);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}
function generatePassword(): string {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

type Phase = 'email' | 'code' | 'name' | 'password';

/**
 * Remember, per browser, that a sign-in code send recently FAILED.
 *
 * That is the whole claim, and the naming is deliberate. This is set on any
 * non-OK response or transport exception, so the only fact in evidence is
 * "a send failed recently" — not that the provider is down, not that the
 * transport is broken, not that the next attempt will fail. Naming it a
 * diagnosis would license the UI to act on a conclusion nothing established.
 *
 * Without this memory, every fresh visit opens on the email field again and
 * walks the member back into the same wall — type address, wait, read the same
 * refusal. What the observation buys is presentation only: the card renders in
 * its failed-send state instead of pretending nothing happened.
 *
 * Deliberately short-lived and per-browser: whatever caused the failure may
 * already be over, so this expires on its own and any successful send clears
 * it immediately. Storage is best-effort — a private window or blocked site
 * data just means the member gets the pre-existing behavior, never an error.
 */
const RECENT_EMAIL_SEND_FAILURE_KEY = 'maia_recent_email_send_failure';
const RECENT_EMAIL_SEND_FAILURE_TTL_MS = 30 * 60 * 1000;

function markRecentEmailSendFailure(): void {
  try { localStorage.setItem(RECENT_EMAIL_SEND_FAILURE_KEY, String(Date.now())); } catch { /* best-effort */ }
}
function clearRecentEmailSendFailure(): void {
  try { localStorage.removeItem(RECENT_EMAIL_SEND_FAILURE_KEY); } catch { /* best-effort */ }
}
function hasRecentEmailSendFailure(): boolean {
  try {
    const at = Number(localStorage.getItem(RECENT_EMAIL_SEND_FAILURE_KEY));
    if (!at || Number.isNaN(at)) return false;
    if (Date.now() - at > RECENT_EMAIL_SEND_FAILURE_TTL_MS) { clearRecentEmailSendFailure(); return false; }
    return true;
  } catch {
    return false;
  }
}

/**
 * Why the person came through the door.
 *
 * /signin opens on username + password: a returning member already has
 * credentials. /signup opens on email: a new person has none.
 *
 * Both routes rendered <UnifiedAuth /> with no props, so the shared component
 * could not tell them apart and opened on email for everyone — asking a
 * returning member for an email address on a page whose job is signing them in.
 *
 * Presentation only. All auth machinery below is unchanged and shared; this
 * decides which door opens first and which is the peer alternative.
 */
export type AuthMode = 'signin' | 'signup';

function UnifiedAuthInner({ mode = 'signup' }: { mode?: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preVerified = searchParams?.get('verified') === 'true';
  const emailParam = searchParams?.get('email') || '';
  const usernameParam = searchParams?.get('u') || '';

  // `?verified=` and `?u=` still win — they name a specific person mid-flow.
  // Otherwise the arrival intent decides. A returning member opens on password;
  // someone joining opens on email.
  const [phase, setPhase] = useState<Phase>(
    preVerified ? 'name' : usernameParam ? 'password' : mode === 'signin' ? 'password' : 'email'
  );
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState(usernameParam);
  const [password, setPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [error, setError] = useState('');
  // The last email-code send failed (any non-OK response or transport error — this
  // does not inspect retryability). Email is the DEFAULT door, so when it fails the
  // card promotes the password alternative rather than leaving a dead end. Cleared
  // on every new attempt.
  const [sendBlocked, setSendBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioPlatformAvailable, setBioPlatformAvailable] = useState(false);
  // AUTH-BIOMETRIC-01B. Capability (above) and enrollment (below) are separate
  // facts; the button requires both. See lib/auth/webBiometricOffer.ts.
  const [webEnrollment, setWebEnrollment] = useState<WebEnrollment>('unknown');
  const [localPasskey, setLocalPasskey] = useState(false);

  // If this browser hit an email-send failure recently, open on username + password
  // instead of walking the member back into the door we know is shut. Runs after
  // mount (never in the useState initializer) so the server-rendered markup and the
  // first client render agree — localStorage does not exist during SSR.
  useEffect(() => {
    if (preVerified || usernameParam) return; // an explicit intent already chose the phase
    if (!hasRecentEmailSendFailure()) return;
    // Restore the failed-transport PRESENTATION on the full card — never jump the
    // member into the password phase. Accounts created through the email-code flow
    // hold a generated password they have never seen; opening them directly onto a
    // password form would strand exactly the people this is meant to help. They keep
    // every door: Google, Apple, biometric, and a retry of email itself.
    setSendBlocked(true);
    // sendBlocked demotes Continue, so say why. Hedged deliberately, and matching
    // what is actually stored: a send failed recently. Not that it is failing now,
    // and not "a few minutes ago" — the window runs to 30.
    setError('Recently we couldn’t send a sign-in code. You can try again, or use another way in below.');
  }, [preVerified, usernameParam]);
  const arrivalSignin = isFeatureEnabled('arrivalSignin'); // Arrival remodel — fully transitioned (default on; flag is a kill-switch). Presentation only.
  // Arrival remodel — navy cosmos + subtle plum atmosphere; the controls stay the original navy (plum reverted per brand
  // direction 2026-07-22: navy foundation, plum only as the bloom). Only card + field + holoflower + copy differ. Presentation only.
  const cardStyle = arrivalSignin ? ARRIVAL_CARD_STYLE : CARD_STYLE;
  const inputCls = INPUT_CLASS;
  const primaryBtn = PRIMARY_BTN;
  const outlineBtn = OUTLINE_BTN;
  const dividerCls = 'bg-maia-navy-700/30';
  const oauthChrome = 'bg-maia-navy-850/50 hover:bg-maia-navy-700/60 border-maia-navy-700/60';
  const appleBorder = 'border-maia-navy-700/60';
  const codeInputCls = 'w-full rounded-xl bg-maia-navy-850 border border-maia-navy-700 px-4 py-4 text-center text-2xl tracking-[0.5em] text-white placeholder:text-slate-600 outline-none focus:border-maia-navy-600 transition-all';

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);
  const nativeOAuthEnabled = getFeatureFlag('NATIVE_OAUTH');
  const nativeBiometryEnabled = getFeatureFlag('NATIVE_BIOMETRY');

  // Biometric availability (unified biometry on native, WebAuthn on web).
  useEffect(() => {
    (async () => {
      try {
        if (Capacitor.isNativePlatform() && nativeBiometryEnabled) {
          const a = await unifiedBiometry.getAvailability();
          setBioAvailable(a.available);
          setBioPlatformAvailable(a.available);
        } else {
          const a = await biometricAuth.getAvailability();
          setBioAvailable(a.available);
          setBioPlatformAvailable(a.platformAvailable);
        }
      } catch {
        // non-blocking
      }
    })();
  }, [nativeBiometryEnabled]);

  // Device-local evidence of a prior WebAuthn ceremony. Stands in for enrollment
  // only while nobody is identified — see webBiometricOffer.ts.
  useEffect(() => { setLocalPasskey(readLocalPasskeyEvidence()); }, []);

  // Enrollment lookup. `has_webauthn` is what the WEB store knows; a member
  // enrolled only in the iOS app (trusted_devices) comes back 'not-enrolled',
  // which is the whole point. Native sign-in never consults this.
  useEffect(() => {
    if (Capacitor.isNativePlatform() && nativeBiometryEnabled) return;
    const addr = email.trim();
    if (!addr.includes('@')) { setWebEnrollment('unknown'); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      fetch('/api/members/lookup-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: addr }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (cancelled) return;
          // An unknown address tells us nothing about a credential, so it stays
          // 'unknown' rather than 'not-enrolled' — the notice would be a lie.
          if (!d || d.exists !== true) { setWebEnrollment('unknown'); return; }
          setWebEnrollment(d.hasWebauthn === true ? 'enrolled' : 'not-enrolled');
        })
        .catch(() => { if (!cancelled) setWebEnrollment('unknown'); });
    }, 450);
    return () => { cancelled = true; clearTimeout(t); };
  }, [email, nativeBiometryEnabled]);

  // Silent, server-confirmed authed redirect (web only). Uses whoami, NOT
  // localStorage — so a stale beta_user never bounces a real visitor away.
  useEffect(() => {
    if (preVerified) return;
    if (Capacitor.isNativePlatform()) return;
    if (typeof window !== 'undefined' && localStorage.getItem('maia_signed_out') === '1') return;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    fetch('/api/auth/whoami', { credentials: 'include', signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { clearTimeout(t); if (d?.authed) window.location.replace('/maia'); })
      .catch(() => clearTimeout(t));
  }, [preVerified]);

  function storeSession(
    user: { id: string; username: string; name: string; preferredName?: string; onboarded: boolean },
    sessionToken?: string
  ) {
    const displayName = user.preferredName || user.name || 'Friend';
    localStorage.setItem('memberId', user.id);
    localStorage.setItem('beta_user', JSON.stringify(user));
    localStorage.setItem('explorerId', user.id);
    localStorage.setItem('explorerName', displayName);
    localStorage.setItem('explorerPreferredName', displayName);
    localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');
    localStorage.setItem('maia_session_version', '2');
    localStorage.setItem('signup_completed', 'true');
    if (sessionToken) localStorage.setItem('maia_session_token', sessionToken);
    localStorage.removeItem('maia_signed_out');
    localStorage.removeItem('maia_signed_out_at');
  }

  async function trustThisDevice() {
    try { await deviceTrust.trustDevice(undefined, 'standard'); } catch { /* non-blocking */ }
  }

  function enterMaia() {
    window.location.assign(`/maia?ts=${Date.now()}`);
  }

  // ── Email → request a code ───────────────────────────────────────────────
  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError('');
    setSendBlocked(false);
    const clean = email.toLowerCase().trim();
    if (!clean.includes('@')) { setError('Please enter a valid email address.'); return; }
    // Normalize the displayed/stored email to lowercase so the code screen and
    // every downstream call use one canonical form (no mixed-case edge cases).
    setEmail(clean);
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/members/email-code'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Could not send the code. Please try again.');
        setSendBlocked(true);
        markRecentEmailSendFailure();
        return;
      }
      setCode('');
      setPhase('code');
    } catch {
      setError('Could not send the code. Please try again.');
      setSendBlocked(true);
      markRecentEmailSendFailure();
    } finally {
      setIsLoading(false);
    }
  }

  // ── Verify the code ──────────────────────────────────────────────────────
  async function verifyCode(submitCode: string) {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/members/email-code/verify'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ email: email.toLowerCase().trim(), code: submitCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || 'Incorrect code.'); setIsLoading(false); return; }
      if (data.member) {
        storeSession({
          id: data.member.id, username: data.member.username, name: data.member.name,
          preferredName: data.member.name, onboarded: !!data.member.onboarded,
        });
        await trustThisDevice();
        enterMaia();
        return;
      }
      setPhase('name');
      setIsLoading(false);
    } catch {
      setError('Could not verify the code. Please try again.');
      setIsLoading(false);
    }
  }

  function onCodeChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6 && !isLoading) verifyCode(digits);
  }

  // ── New member → create account ──────────────────────────────────────────
  async function completeSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      const pwd = generatePassword();
      let uname = deriveUsername(cleanEmail);
      let res: Response | null = null;
      let data: any = {};
      for (let attempt = 0; attempt < 3; attempt++) {
        res = await fetch(apiUrl('/api/members/register-email'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ email: cleanEmail, username: uname, password: pwd, name: name.trim() || uname }),
        });
        data = await res.json().catch(() => ({}));
        if (res.status === 409 && /username/i.test(data?.error || '')) { uname = `${deriveUsername(cleanEmail)}${randomSuffix()}`; continue; }
        break;
      }
      if (!res || !res.ok) { setError(data?.error || 'Could not complete signup. Please try again.'); setIsLoading(false); return; }
      storeSession({
        id: data.member.id, username: data.member.username, name: data.member.name || name,
        preferredName: name || data.member.name, onboarded: !!data.member.onboarded,
      });
      await trustThisDevice();
      if (bioAvailable && bioPlatformAvailable) { try { await biometricAuth.register(); markLocalPasskeyEvidence(); } catch { /* optional */ } }
      window.location.assign(data.member.onboarded ? `/maia?ts=${Date.now()}` : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete signup. Please try again.');
      setIsLoading(false);
    }
  }

  // Native biometry verifies against trusted_devices, where enrollment is real,
  // so it keeps its own gate. Only the web decision changes here.
  const nativeBioPath = Capacitor.isNativePlatform() && nativeBiometryEnabled;
  const offerInput = {
    capabilityAvailable: bioAvailable,
    platformAvailable: bioPlatformAvailable,
    enrollment: webEnrollment,
    localPasskeyEvidence: localPasskey,
  };
  const offerBiometric = nativeBioPath ? bioAvailable : shouldOfferWebBiometric(offerInput);
  const biometricNotice = nativeBioPath ? null : webBiometricNotice(offerInput);

  // ── Biometric return ─────────────────────────────────────────────────────
  async function continueWithBiometric() {
    setError('');
    setIsLoading(true);
    try {
      const useNative = Capacitor.isNativePlatform() && nativeBiometryEnabled;
      // Pass the known username (from ?u= param / typed) so the server can populate
      // allowCredentials — works even for non-discoverable creds. When empty, the
      // usernameless discoverable flow (residentKey:'required') carries it.
      const rememberedUsername = username.trim() || undefined;
      // Diagnostic: proves the button was actually tapped (separates "not tapped"
      // from "tapped and failed" in the 0-authentications signature).
      console.log(`[WebAuthn] biometric tap: path=${useNative ? 'native' : 'webauthn'} username=${rememberedUsername ? 'known' : 'none'}`);
      const res: any = useNative ? await unifiedBiometry.authenticate(rememberedUsername) : await biometricAuth.authenticate(rememberedUsername);
      if (!res?.success) {
        const code = res?.code;
        console.log(`[WebAuthn] biometric result: failed code=${code || 'none'} error=${res?.error || 'none'}`);
        let msg = res?.error || 'Let’s try another way.';
        if (code === 'CREDENTIAL_NOT_FOUND') msg = 'No passkey is set up for this browser yet — continue with your email code or your password, then turn on Face ID under Account → Security.';
        else if (code === 'DEVICE_NOT_TRUSTED' || code === 'NO_MEMBER_ID') msg = 'This device isn’t set up yet — continue with your email.';
        else if (code === 'USER_CANCELLED' || code === 'BIOMETRY_FAILED') msg = 'Cancelled. Tap again when you’re ready.';
        setError(msg);
        setIsLoading(false);
        return;
      }
      if (res.member) {
        if (!useNative) markLocalPasskeyEvidence();
        storeSession({
          id: res.member.id, username: res.member.username, name: res.member.name,
          preferredName: res.member.preferredName, onboarded: res.member.onboarded,
        }, res.session?.token);
        await trustThisDevice();
        enterMaia();
        return;
      }
      setIsLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Biometric sign-in failed.');
      setIsLoading(false);
    }
  }

  // ── Password recovery ────────────────────────────────────────────────────
  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/members/signin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase().trim(), password }),
      });
      const text = await res.text();
      if (!res.ok) { setError(text || `Sign in failed (${res.status})`); setIsLoading(false); return; }
      const data = text ? JSON.parse(text) : {};
      const memberId = data?.memberId || data?.member?.id || data?.id;
      if (!memberId) { setError('Sign in succeeded but memberId missing.'); setIsLoading(false); return; }
      storeSession({
        id: String(memberId),
        username: data.member?.username || username,
        name: data.member?.name || username,
        preferredName: data.member?.preferredName || data.member?.name,
        onboarded: !!data.member?.onboarded,
      }, data.session?.token);
      await trustThisDevice();
      enterMaia();
    } catch (err: any) {
      setError(err?.message || 'Sign in failed.');
      setIsLoading(false);
    }
  }

  // ── Secondary: Google / Apple ────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    try {
      if (Capacitor.isNativePlatform() && nativeOAuthEnabled) {
        const { GoogleAuth } = await import('@southdevs/capacitor-google-auth');
        await GoogleAuth.initialize({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
          scopes: ['profile', 'email'], grantOfflineAccess: true,
        });
        const result = await GoogleAuth.signIn({ scopes: ['profile', 'email'] });
        const idToken = result.authentication?.idToken;
        if (!idToken) throw new Error('Missing Google idToken');
        const res = await fetch(apiUrl('/api/auth/google/native-callback'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ idToken, email: result.email, name: result.name, imageUrl: result.imageUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
        if (data.member) { storeSession(data.member); await trustThisDevice(); enterMaia(); }
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
      if (Capacitor.isNativePlatform() && nativeOAuthEnabled) {
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
        const result = await SignInWithApple.authorize({ clientId: 'life.soullab.maia', scopes: 'email name', redirectURI: '' });
        const identityToken = result?.response?.identityToken;
        if (!identityToken) throw new Error('Missing Apple identityToken');
        const res = await fetch(apiUrl('/api/auth/apple/native-callback'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({
            identityToken, authorizationCode: result.response?.authorizationCode,
            email: result.response?.email, givenName: result.response?.givenName, familyName: result.response?.familyName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Apple sign-in failed');
        if (data.member) { storeSession(data.member); await trustThisDevice(); enterMaia(); }
        return;
      }
      window.location.href = '/api/auth/apple/list';
    } catch (e) {
      setError('Apple sign-in failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const errorBlock = error ? (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-900/20 p-3 text-sm text-amber-300/90">{error}</div>
  ) : null;

  return (
    <div className="min-h-[100dvh] bg-soullab-core flex flex-col items-center justify-center px-4 py-10" style={arrivalSignin ? { background: 'radial-gradient(58% 40% at 50% 12%, rgba(124,94,170,0.16), rgba(90,70,150,0.05) 40%, transparent 60%), linear-gradient(180deg, #071426 0%, #050f1f 52%, #030814 100%)' } : undefined}>
      <div className="mb-12">
        <div className="w-28 h-28 mx-auto">
          <Holoflower size="xl" glowIntensity={arrivalSignin ? 'low' : 'medium'} animate={true} theme="dark" variant={arrivalSignin ? 'spectrum' : undefined} crisp={arrivalSignin} />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-3xl p-8 max-w-sm w-full" style={cardStyle}>
        <AnimatePresence mode="wait">
          {phase === 'password' ? (
            <motion.div key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-3xl font-extralight text-white/80 mb-3 tracking-[0.2em] text-center">
                {usernameParam ? `Welcome back, ${usernameParam.charAt(0).toUpperCase() + usernameParam.slice(1).toLowerCase()}.` : 'Welcome'}
              </h1>
              <p className="text-sm text-slate-300/80 font-light mb-6 text-center leading-relaxed">
                {usernameParam ? 'Continue your conversation with MAIA.' : 'Sign in with your username and password.'}
              </p>
              {errorBlock}
              <form onSubmit={signInWithPassword} className="space-y-3">
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" className={inputCls} />
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPasswordText ? 'text' : 'password'} placeholder="Password" autoComplete="current-password" className={`${inputCls} pr-12`} />
                  <button type="button" onClick={() => setShowPasswordText(!showPasswordText)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300" tabIndex={-1}>{showPasswordText ? 'Hide' : 'Show'}</button>
                </div>
                <button type="submit" disabled={isLoading || !username || !password} className={primaryBtn}>{isLoading ? 'Signing in…' : 'Sign in'}</button>
              </form>
              {/* Face ID / Touch ID is the easy return path, so it sits directly under
                  Sign in — not below the email fallback. One tap goes straight to the
                  biometric prompt; there is no intermediate username screen. A cancel
                  or a missing credential returns here with a message and no loop
                  (see continueWithBiometric). */}
              {offerBiometric && (
                <button type="button" onClick={continueWithBiometric} disabled={isLoading} className={`${outlineBtn} mt-3`}>
                  Sign in with {biometricLabel}
                </button>
              )}

              {/* Withheld, and said so. A capable device with no web credential
                  used to get a button that could not succeed — the member read
                  the opaque failure as the account forgetting them. */}
              {!offerBiometric && biometricNotice && (
                <p className="mt-3 text-xs text-slate-400/80 leading-relaxed text-center">{biometricNotice}</p>
              )}

              {/* Email stays a peer door, not a footnote. Members who joined through
                  the email-code flow were given a generated password they have never
                  seen, so this cannot be a dead end for them — it is how they get out
                  of a phase they should not have landed in. */}
              <button type="button" onClick={() => { setPhase('email'); setError(''); }} disabled={isLoading} className={`${outlineBtn} mt-3`}>
                Email me a sign-in code instead
              </button>

              {/* The way out for someone who landed here without an account. /signin
                  opens straight onto a password form, so without this a new person
                  faces three doors they cannot open and no exit — the mirror of the
                  "Already a member?" link /signup carries.

                  Destination is /begin, not /signup: the onboarding invariant is a
                  single entry point for new members (/begin → intro → induction →
                  /maia). /signup is the email door for someone already headed in. */}
              {mode === 'signin' && (
                <p className="mt-6 text-xs text-slate-400/80 text-center">
                  New to Soullab?{' '}
                  <a href="/begin" className="text-amber-300/90 hover:text-amber-200 transition-colors">Begin Journey</a>
                </p>
              )}
            </motion.div>
          ) : phase === 'name' ? (
            <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-3xl font-extralight text-white/80 mb-3 tracking-[0.2em] text-center">Almost there</h1>
              <p className="text-sm text-slate-300/80 font-light mb-6 text-center leading-relaxed">
                {email ? <><span className="text-slate-200">{email}</span> is verified.</> : 'Your email is verified.'} What should MAIA call you?
              </p>
              {errorBlock}
              <form onSubmit={completeSignup} className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus className={inputCls} />
                <button type="submit" disabled={isLoading} className={primaryBtn}>{isLoading ? 'Entering…' : 'Enter MAIA'}</button>
              </form>
              <p className="mt-4 text-xs text-slate-500/80 text-center leading-relaxed">You’ll return with an emailed code{bioAvailable ? ` or ${biometricLabel}` : ''} — no password needed.</p>
            </motion.div>
          ) : phase === 'code' ? (
            <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <h1 className="text-3xl font-extralight text-white/80 mb-3 tracking-[0.2em]">Enter code</h1>
              <p className="text-sm text-slate-300/80 font-light mb-6 leading-relaxed">We sent a 6-digit code to <span className="text-slate-200">{email}</span>.</p>
              {errorBlock}
              <input value={code} onChange={(e) => onCodeChange(e.target.value)} inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} autoFocus placeholder="••••••" className={codeInputCls} />
              <button type="button" disabled={isLoading || code.length < 6} onClick={() => verifyCode(code)} className={`${primaryBtn} mt-4`}>{isLoading ? 'Verifying…' : 'Verify'}</button>
              <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500">
                <button type="button" onClick={() => sendCode()} disabled={isLoading} className="hover:text-slate-300 transition-colors">Resend code</button>
                <span className="text-slate-700">·</span>
                <button type="button" onClick={() => { setPhase('email'); setError(''); setCode(''); }} className="hover:text-slate-300 transition-colors">Change email</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-3xl font-extralight text-white/80 mb-3 tracking-[0.2em] text-center" style={arrivalSignin ? { fontFamily: 'Spectral, Georgia, serif' } : undefined}>{arrivalSignin ? 'Welcome.' : 'Welcome'}</h1>
              <p className={`text-sm font-light mb-6 text-center leading-relaxed ${arrivalSignin ? 'text-slate-300/95' : 'text-slate-300/80'}`}>{mode === 'signin' ? 'Sign in with an emailed code.' : 'Enter your email to continue.'}</p>
              {errorBlock}

              <form onSubmit={sendCode} className="space-y-3">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" autoComplete="email" autoFocus className={inputCls} />
                {/* sendBlocked demotes Continue so the username+password button can carry
                    primary weight instead. That button only exists on /signin — nobody
                    joining has a password — so on /signup the demotion would leave the
                    card with NO primary action and nothing promoted in its place.
                    Continue stays primary there; the failed-send message still shows. */}
                <button type="submit" disabled={isLoading || !email} className={sendBlocked && mode === 'signin' ? outlineBtn : primaryBtn}>{isLoading ? 'Sending…' : 'Continue'}</button>
              </form>

              {offerBiometric && (
                <button type="button" onClick={continueWithBiometric} disabled={isLoading} className={`${outlineBtn} mt-3`}>
                  Sign in with {biometricLabel}
                </button>
              )}

              {/* Withheld, and said so. A capable device with no web credential
                  used to get a button that could not succeed — the member read
                  the opaque failure as the account forgetting them. */}
              {!offerBiometric && biometricNotice && (
                <p className="mt-3 text-xs text-slate-400/80 leading-relaxed text-center">{biometricNotice}</p>
              )}

              {/* Username + password is a peer sign-in path, not a footnote. It used to be a
                  12px link below a hairline, which read as "hidden" to members who set a
                  password during induction and return expecting to use it. It is NOT the
                  default: accounts created through the email-code flow are given a generated
                  password the member never sees, so defaulting them here would strand them.
                  Equal visibility, unchanged default.

                  2026-08-24 (second pass): when an email-code send fails, this button
                  carries primary weight and Continue drops to outline. The card points at
                  the alternative that is already valid, without growing a second password
                  button to say the same thing twice. */}
              {/* Signing in and joining are different asks. On /signin, username +
                  password is a peer door. On /signup nobody has a password yet, so
                  offering one would be a door to nowhere — that route gets a link to
                  /signin instead, below the OAuth row. */}
              {mode === 'signin' && (
                <button type="button" onClick={() => { setPhase('password'); setError(''); setSendBlocked(false); }} disabled={isLoading} className={`${sendBlocked ? primaryBtn : outlineBtn} mt-3`}>
                  Sign in with username and password
                </button>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className={`flex-1 h-px ${dividerCls}`} />
                <span className="text-xs text-slate-500 uppercase tracking-wide">or</span>
                <div className={`flex-1 h-px ${dividerCls}`} />
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <button type="button" onClick={handleGoogle} title="Continue with Google" className={`w-11 h-11 rounded-xl border ${oauthChrome} flex items-center justify-center transition-all`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button type="button" onClick={handleApple} title="Continue with Apple" className={`w-11 h-11 rounded-xl bg-black/50 hover:bg-black/70 border ${appleBorder} flex items-center justify-center transition-all`}>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>

              {/* /signup has no password door — nobody joining has one yet. Someone who
                  already has an account needs a way across, not a password form here. */}
              {mode === 'signup' && (
                <p className="mt-6 text-xs text-slate-400/80 text-center">
                  Already a member?{' '}
                  <a href="/signin" className="text-amber-300/90 hover:text-amber-200 transition-colors">Sign in</a>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function UnifiedAuth({ mode }: { mode?: AuthMode } = {}) {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-soullab-core flex items-center justify-center text-slate-400/70">Loading…</div>}>
      <UnifiedAuthInner mode={mode} />
    </Suspense>
  );
}
