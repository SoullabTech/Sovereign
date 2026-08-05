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
 * system had already decided to refuse.
 *
 * GATE BOUNDARY (Kelly ruling 2026-07-29, F1 — Option A): "the invitation is
 * the gate" governs entry into MEMBERSHIP, not subsequent authentication into
 * an account the person already holds. A first attempt at this repair gated
 * the whole door, which — because middleware redirects every unauthenticated
 * /now-what/* request here and not every such URL carries fieldContext —
 * locked existing members out of accounts they legitimately hold. It also
 * added no authorization: /api/now-what/signin is not invitation-gated
 * server-side, so the refusal was a client-side denial the server would have
 * overruled.
 *
 * The durable invariant:
 *   No ACCOUNT-CREATING credential field may be presented until invitation
 *   eligibility has been established. Existing authorized members must always
 *   retain a path to authenticate into accounts they already hold.
 *
 * States:
 *   resolving  — nothing claimed, nothing collected
 *   eligible   — invitation language; create AND sign in
 *   sign-in    — neutral copy; sign in only. The CreateForm component is not
 *                MOUNTED (not hidden, not disabled — absent from the tree)
 *
 * The eligibility rule is imported, not restated: `lib/nowWhat/invitation.ts`
 * is shared with the register route so the two cannot drift. This gate governs
 * RENDERING. `/api/now-what/register` keeps the authoritative server-side
 * check; `/api/now-what/signin` deliberately gains none.
 */

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RoomHoloflower } from '@/components/maia/vision-studio/RoomHoloflower';
import { invitedFieldContext, UNINVITED_COPY } from '@/lib/nowWhat/invitation';

const ACCENT = '#c9a35e';

/**
 * Where a member lands after signing in when the arrival named no destination.
 *
 * Deliberately NOT the removed `|| '/now-what/room'` fallback: that value was
 * fed to the ELIGIBILITY check, fabricating a context-free path that made an
 * uninvited arrival look like it had somewhere to be. This one is only ever a
 * post-authentication landing and is never an input to eligibility. The two
 * concerns are kept separate on purpose.
 */
const SIGNED_IN_LANDING = '/now-what/map';

const inputClass =
  'w-full rounded-lg border border-slate-600/60 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#c9a35e]/60';

const buttonClass =
  'w-full rounded-full border px-6 py-2.5 text-sm transition-all hover:shadow-[0_0_30px_rgba(201,163,94,0.25)] disabled:opacity-40';

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

/** Shared chrome so every state looks like the same door. */
function DoorFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-w-md mx-auto px-4 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_10%,rgba(196,164,110,0.10),transparent_70%)]"
      />
      {children}
    </div>
  );
}

function DoorHead({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="relative flex flex-col items-center text-center space-y-4">
      <RoomHoloflower coolTint mono motionState="idle" proposedElement={null} confirmedElements={[]} size={120} />
      <p className="text-xs uppercase tracking-[0.45em]" style={{ color: ACCENT }}>
        Now What?
      </p>
      <h1 className="text-slate-100 text-2xl font-extralight tracking-wide">{heading}</h1>
      <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm">{body}</p>
    </div>
  );
}

/**
 * SIGN IN — always available.
 *
 * An existing member must be able to authenticate into an account they already
 * hold, however they arrived. `/api/now-what/signin` carries no invitation
 * check by design; gating this client-side would deny what the server admits.
 */
function SignInForm({ next, seedIdentifier, notice }: { next: string; seedIdentifier?: string; notice?: string | null }) {
  const [identifier, setIdentifier] = useState(seedIdentifier ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/now-what/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Sign-in didn’t work — check your details.');
      storeSession(json.member, json.session?.token);
      // The original destination is preserved across authentication.
      window.location.href = next;
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className={inputClass} placeholder="Username or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
      <input className={inputClass} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      {notice && <p className="text-sm font-light" style={{ color: ACCENT }}>{notice}</p>}
      {error && <p role="alert" className="text-red-400 text-sm font-light">{error}</p>}
      <button type="submit" disabled={busy} className={buttonClass} style={{ color: ACCENT, borderColor: 'rgba(201,163,94,0.45)' }}>
        {busy ? 'Opening the door…' : 'Sign in and enter'}
      </button>
    </form>
  );
}

/**
 * CREATE A KEY — account creation.
 *
 * This component is MOUNTED ONLY when invitation eligibility has been
 * established. Its name/email/password fields are the ones whose premature
 * presentation was the original defect: personal data collected from someone
 * the system had already decided to refuse.
 */
function CreateForm({ next, onExistingIdentity }: { next: string; onExistingIdentity: (email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/now-what/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, next }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409) {
        // Existing identity — the honest path (Kelly ruling): pivot into
        // sign-in with the invitation preserved; one person, one key.
        onExistingIdentity(email);
        setBusy(false);
        return;
      }
      if (!res.ok) throw new Error(json?.error || 'Could not create your key.');
      storeSession(json.member, json.session?.token);
      window.location.href = next;
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className={inputClass} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <input className={inputClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <input className={inputClass} placeholder="Choose a password (8+ characters)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      {error && <p role="alert" className="text-red-400 text-sm font-light">{error}</p>}
      <button type="submit" disabled={busy} className={buttonClass} style={{ color: ACCENT, borderColor: 'rgba(201,163,94,0.45)' }}>
        {busy ? 'Opening the door…' : 'Create my key and enter'}
      </button>
    </form>
  );
}

function ModeTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="rounded-full px-4 py-1.5 text-xs border transition-all"
      style={
        active
          ? { color: ACCENT, borderColor: 'rgba(201,163,94,0.45)', background: 'rgba(201,163,94,0.08)' }
          : { color: '#94a3b8', borderColor: 'rgba(148,163,184,0.35)' }
      }
    >
      {label}
    </button>
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
 * NOT ELIGIBLE — sign in only.
 *
 * No invitation is asserted, no field or allowlist entry is named, and
 * CreateForm is not mounted. An existing member keeps their way in; a stranger
 * finds no way to create anything.
 */
function ArrivalSignInOnly({ next }: { next: string }) {
  return (
    <DoorFrame>
      <DoorHead heading={UNINVITED_COPY.heading} body={UNINVITED_COPY.body} />
      <div className="relative mt-8">
        <SignInForm next={next} />
        <p className="mt-6 text-center text-slate-600 text-xs font-light">
          Your key is yours. Signing in is how the room knows whose field to hold.
        </p>
      </div>
    </DoorFrame>
  );
}

/** ELIGIBLE — the invitation is established, so it may be named and acted on. */
function ArrivalEligible({ next }: { next: string }) {
  const [mode, setMode] = useState<'create' | 'signin'>('create');
  const [seedIdentifier, setSeedIdentifier] = useState<string | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <DoorFrame>
      <DoorHead
        heading="You were invited here."
        body="This is a place where the work you started together keeps living between conversations. What you say here is private — you choose, item by item, what is ever shared."
      />
      <div className="relative mt-8">
        <div className="flex gap-2 justify-center mb-5" role="tablist">
          <ModeTab active={mode === 'create'} label="Create my key" onClick={() => setMode('create')} />
          <ModeTab active={mode === 'signin'} label="I already have a key" onClick={() => setMode('signin')} />
        </div>
        {mode === 'create' ? (
          <CreateForm
            next={next}
            onExistingIdentity={(email) => {
              setSeedIdentifier(email);
              setNotice('You already have a key for this email. Sign in to continue through your invitation.');
              setMode('signin');
            }}
          />
        ) : (
          <SignInForm next={next} seedIdentifier={seedIdentifier} notice={notice} />
        )}
        <p className="mt-6 text-center text-slate-600 text-xs font-light">
          Your key is yours. Signing in is how the room knows whose field to hold.
        </p>
      </div>
    </DoorFrame>
  );
}

function ArriveInner() {
  const params = useSearchParams();

  // No default destination for the ELIGIBILITY input. The previous
  // `|| '/now-what/room'` fabricated a context-free path, which is how an
  // uninvited arrival reached the registration form.
  const nextRaw = params?.get('next') ?? null;

  // Same-origin paths only — never an open redirect.
  const requestedNext = useMemo(() => {
    if (!nextRaw) return null;
    return nextRaw.startsWith('/') && !nextRaw.startsWith('//') ? nextRaw : null;
  }, [nextRaw]);

  // Eligibility is computed from what the arrival actually asked for — never
  // from a fallback.
  const fieldContext = useMemo(() => invitedFieldContext(requestedNext), [requestedNext]);

  if (params === null) return <ArrivalResolving />;

  // Destination after authentication. Separate concern from eligibility.
  const destination = requestedNext ?? SIGNED_IN_LANDING;

  if (!fieldContext) return <ArrivalSignInOnly next={destination} />;
  return <ArrivalEligible next={destination} />;
}

export default function NowWhatArrivePage() {
  return (
    <div className="min-h-screen bg-[#1f1b16] text-slate-200">
      <Suspense fallback={<ArrivalResolving />}>
        <ArriveInner />
      </Suspense>
    </div>
  );
}
