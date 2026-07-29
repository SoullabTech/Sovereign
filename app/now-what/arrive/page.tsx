'use client';

/**
 * Now What? — arrival. The environment's own front door.
 *
 * Kelly ruling 2026-07-16: Now What? gets an independent signup/signin so an
 * invited client (and Jondi, walking from scratch) arrives in their
 * practitioner's world — never routed through /begin → /maia (first-flow
 * board, Breaks 1–2). /begin remains AIN's universal door; here, the
 * invitation is the gate.
 *
 * ORDERING REPAIR (2026-07-29): this page previously asserted "You were
 * invited here.", collected name, email and password, and only then learned
 * from POST /api/now-what/register that the arrival carried no authorized
 * field context — a 403 at submit. It took personal data from someone the
 * system had already decided to refuse, and claimed an invitation before
 * establishing one.
 *
 * The invariant now enforced:
 *   No credential field appears until the arriving context has been resolved
 *   and found eligible.
 *
 * Three states, and only three:
 *   resolving — nothing claimed, nothing collected
 *   eligible  — invitation language and credential collection
 *   refused   — neutral copy, no credential component MOUNTED (not hidden,
 *               not disabled — absent from the tree)
 *
 * The eligibility rule is imported, not restated: `lib/nowWhat/invitation.ts`
 * is shared with the register route so the two cannot drift. This gate governs
 * RENDERING only. The route's own check remains the authority — a bypassed
 * client gate changes nothing on the server.
 */

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RoomHoloflower } from '@/components/maia/vision-studio/RoomHoloflower';
import { invitedFieldContext, REFUSAL_COPY } from '@/lib/nowWhat/invitation';

const ACCENT = '#ffe27a';

function storeSession(member: { id: string; name?: string; username?: string }, token?: string) {
  try {
    localStorage.setItem(
      'beta_user',
      JSON.stringify({ id: member.id, name: member.name, username: member.username, onboarded: true })
    );
    localStorage.setItem('memberId', member.id);
    if (token) localStorage.setItem('sessionToken', token);
  } catch {
    /* storage unavailable — cookie session still carries them */
  }
}

/** Shared chrome so all three states look like the same door. */
function DoorFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-w-md mx-auto px-4 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_10%,rgba(125,175,255,0.10),transparent_70%)]"
      />
      {children}
    </div>
  );
}

/**
 * CREDENTIAL COLLECTION.
 *
 * Deliberately its own component so eligibility gates whether it MOUNTS. A
 * hidden-or-disabled form still renders password inputs into the document and
 * would leave the original defect in place behind CSS.
 */
function ArrivalCredentials({ next }: { next: string }) {
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'create') {
        const res = await fetch('/api/now-what/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, next }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.status === 409) {
          // Existing identity — the honest path (Kelly ruling): pivot into
          // sign-in with the invitation preserved; one person, one key.
          setMode('signin');
          setIdentifier(email);
          setPassword('');
          setNotice('You already have a key for this email. Sign in to continue through your invitation.');
          setBusy(false);
          return;
        }
        if (!res.ok) throw new Error(json?.error || 'Could not create your key.');
        storeSession(json.member, json.session?.token);
      } else {
        const res = await fetch('/api/now-what/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Sign-in didn’t work — check your details.');
        storeSession(json.member, json.session?.token);
      }
      window.location.href = next;
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  const input =
    'w-full rounded-lg border border-slate-600/60 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#ffe27a]/60';

  return (
    <div className="relative mt-8">
      <div className="flex gap-2 justify-center mb-5" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'create'}
          onClick={() => { setMode('create'); setError(null); }}
          className="rounded-full px-4 py-1.5 text-xs border transition-all"
          style={
            mode === 'create'
              ? { color: ACCENT, borderColor: 'rgba(255,226,122,0.45)', background: 'rgba(255,226,122,0.08)' }
              : { color: '#94a3b8', borderColor: 'rgba(148,163,184,0.35)' }
          }
        >
          Create my key
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          onClick={() => { setMode('signin'); setError(null); }}
          className="rounded-full px-4 py-1.5 text-xs border transition-all"
          style={
            mode === 'signin'
              ? { color: ACCENT, borderColor: 'rgba(255,226,122,0.45)', background: 'rgba(255,226,122,0.08)' }
              : { color: '#94a3b8', borderColor: 'rgba(148,163,184,0.35)' }
          }
        >
          I already have a key
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === 'create' ? (
          <>
            <input className={input} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <input className={input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <input className={input} placeholder="Choose a password (8+ characters)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </>
        ) : (
          <>
            <input className={input} placeholder="Username or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
            <input className={input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </>
        )}

        {notice && (
          <p className="text-sm font-light" style={{ color: '#ffe27a' }}>{notice}</p>
        )}
        {error && (
          <p role="alert" className="text-red-400 text-sm font-light">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(255,226,122,0.25)] disabled:opacity-40"
          style={{ color: ACCENT, borderColor: 'rgba(255,226,122,0.45)' }}
        >
          {busy ? 'Opening the door…' : mode === 'create' ? 'Create my key and enter' : 'Sign in and enter'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-xs font-light">
        Your key is yours. Signing in is how the room knows whose field to hold.
      </p>
    </div>
  );
}

/** RESOLVING — claims nothing, collects nothing. */
function ArrivalResolving() {
  return (
    <DoorFrame>
      <div className="relative flex flex-col items-center text-center space-y-4">
        <RoomHoloflower coolTint mono motionState="idle" proposedElement={null} confirmedElements={[]} size={120} />
        <p className="text-xs uppercase tracking-[0.45em]" style={{ color: ACCENT }}>
          Now What?
        </p>
        <p className="text-slate-500 text-sm font-light" aria-live="polite">
          One moment.
        </p>
      </div>
    </DoorFrame>
  );
}

/**
 * REFUSED — neutral. Names no field, no allowlist entry, and no reason beyond
 * the absence of an invitation, so the refusal cannot be used to probe which
 * contexts are authorized. No credential component is mounted.
 */
function ArrivalRefused() {
  return (
    <DoorFrame>
      <div className="relative flex flex-col items-center text-center space-y-4">
        <RoomHoloflower coolTint mono motionState="idle" proposedElement={null} confirmedElements={[]} size={120} />
        <p className="text-xs uppercase tracking-[0.45em]" style={{ color: ACCENT }}>
          Now What?
        </p>
        <h1 className="text-slate-100 text-2xl font-extralight tracking-wide">
          {REFUSAL_COPY.heading}
        </h1>
        <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm">
          {REFUSAL_COPY.body}
        </p>
      </div>
    </DoorFrame>
  );
}

/** ELIGIBLE — invitation language is now true, and credentials may be asked for. */
function ArrivalEligible({ next }: { next: string }) {
  return (
    <DoorFrame>
      <div className="relative flex flex-col items-center text-center space-y-4">
        <RoomHoloflower coolTint mono motionState="idle" proposedElement={null} confirmedElements={[]} size={120} />
        <p className="text-xs uppercase tracking-[0.45em]" style={{ color: ACCENT }}>
          Now What?
        </p>
        <h1 className="text-slate-100 text-2xl font-extralight tracking-wide">
          You were invited here.
        </h1>
        <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm">
          This is a place where the work you started together keeps living
          between conversations. What you say here is private — you choose,
          item by item, what is ever shared.
        </p>
      </div>
      <ArrivalCredentials next={next} />
    </DoorFrame>
  );
}

function ArriveInner() {
  const params = useSearchParams();

  // No default destination. The previous `|| '/now-what/room'` fabricated a
  // next path carrying no field context — precisely how an uninvited arrival
  // reached the credential form before being refused at submit.
  const nextRaw = params?.get('next') ?? null;

  // Same-origin paths only — never an open redirect.
  const next = useMemo(() => {
    if (!nextRaw) return null;
    return nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : null;
  }, [nextRaw]);

  // Eligibility precedes every other decision on this page.
  const fieldContext = useMemo(() => invitedFieldContext(next), [next]);

  if (params === null) return <ArrivalResolving />;
  if (!next || !fieldContext) return <ArrivalRefused />;
  return <ArrivalEligible next={next} />;
}

export default function NowWhatArrivePage() {
  return (
    <div className="min-h-screen bg-[#062a42] text-slate-200">
      <Suspense fallback={<ArrivalResolving />}>
        <ArriveInner />
      </Suspense>
    </div>
  );
}
