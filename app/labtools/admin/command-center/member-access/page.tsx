'use client';

/**
 * Member Access: deliberate, consent-aware administrator-initiated recovery.
 * The server requires a VERIFIED FOUNDER MEMBER SESSION; the shared admin
 * password that opens Command Center does not authorize this sensitive action.
 */
import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Search, ShieldCheck, Mail, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
/**
 * Do not forward the shared admin password from the legacy Command Center's
 * localStorage. Recovery is founder MEMBER SESSION only. Session cookies and
 * validated member tokens are sufficient; password-only admins must be denied.
 */
async function founderSessionFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  try {
    const sessionToken = window.localStorage.getItem('maia_session_token');
    if (sessionToken && !headers.has('x-session-token')) headers.set('x-session-token', sessionToken);
  } catch {
    // Session cookie can still carry the verified member session.
  }
  return fetch(path, { ...init, headers, credentials: 'same-origin' });
}

type MemberRow = { id: string; name: string | null; username: string | null; email: string | null; admin_role: string | null; recovery_email_verified: boolean };

export default function MemberAccessPage() {
  const pathname = usePathname();
  const backTo = pathname?.startsWith('/labtools/')
    ? '/labtools/admin/command-center/members' : '/studio/settings';
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MemberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [verifyConfirmed, setVerifyConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await founderSessionFetch('/api/admin/members', { cache: 'no-store' });
        if (!res.ok) throw new Error('Member directory is unavailable or your account lacks admin access');
        const body = await res.json();
        if (!cancelled) setMembers(Array.isArray(body.members) ? body.members : []);
      } catch {
        if (!cancelled) setError('Sign in as an authorized administrator to view Member Access.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLocaleLowerCase().trim();
    if (!term) return members.slice(0, 40);
    return members.filter(m => [m.name, m.username, m.email].some(t => t?.toLocaleLowerCase().includes(term))).slice(0, 40);
  }, [search, members]);

  function select(m: MemberRow) {
    // The submitted action is bound to one target; do not allow another
    // member to be selected before its sensitive response is settled.
    if (submitting) return;
    setSelected(m);
    setError('');
    setMessage('');
    setConfirmed(false);
    setVerifyConfirmed(false);
  }

  async function issueVerification() {
    if (!selected || !selected.email || selected.recovery_email_verified === true
        || !verifyConfirmed || submitting) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await founderSessionFetch('/api/admin/members/recovery/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ memberId: selected.id, confirmed: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 && typeof data.error === 'string' && data.error.includes('founder')) {
          throw new Error('A verified founder member session is required. The shared admin password cannot send identity mail.');
        }
        throw new Error(typeof data.error === 'string' ? data.error : 'Verification could not be initiated');
      }
      // An administrator must never receive a bearer from the verification
      // operation. Provider ACCEPTANCE is not proof the member received it.
      if (data.method !== 'email' || data.delivery !== 'provider_accepted'
          || data.verificationRequired !== true
          || Object.prototype.hasOwnProperty.call(data, 'recoveryLink')
          || Object.prototype.hasOwnProperty.call(data, 'verificationLink')
          || Object.prototype.hasOwnProperty.call(data, 'token')) {
        throw new Error('Unexpected verification response; confirmation withheld.');
      }
      setMessage('The SMTP provider accepted the verification email. Delivery is not confirmed. The member must open it and verify their email before recovery can be initiated; refresh this page afterward.');
      setVerifyConfirmed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification could not be initiated');
    } finally {
      setSubmitting(false);
    }
  }

  async function issueRecovery() {
    if (!selected || !confirmed || submitting || !selected.email
        || selected.recovery_email_verified !== true) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const res = await founderSessionFetch('/api/admin/members/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          memberId: selected.id,
          method: 'email',
          reason: 'member_requested',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 && typeof data.error === 'string' && data.error.includes('verified founder')) {
          throw new Error('Sign in with your founder member account. The shared admin password alone cannot initiate recovery.');
        }
        throw new Error(data.error || 'Recovery could not be initiated');
      }
      // A bearer link must NEVER be disclosed to the administrator. Reject an
      // unexpected response rather than rendering or persisting it.
      if (data.method !== 'email' || data.delivery !== 'provider_accepted'
          || Object.prototype.hasOwnProperty.call(data, 'recoveryLink')) {
        throw new Error('Unexpected delivery response; recovery confirmation withheld.');
      }
      setMessage('The email provider accepted this recovery request. Delivery has not been confirmed.');
      setConfirmed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recovery could not be initiated');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-4xl space-y-6 text-slate-100">
      <header className="space-y-3">
        <Link href={backTo} className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200">
          <ArrowLeft className="h-4 w-4" /> Members
        </Link>
        <h1 className="flex items-center gap-3 text-2xl font-semibold"><KeyRound className="h-6 w-6 text-amber-400" /> Member Access</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Help a member recover access without seeing or choosing their password.
          Only a verified founder member session can authorize an issuance.
        </p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-700/60 bg-rose-950/30 p-4 text-sm text-rose-200">{error}</div>}
      {message && <div role="status" className="rounded-lg border border-emerald-700/60 bg-emerald-950/20 p-4 text-sm text-emerald-200">{message}</div>}

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-4">
        <h2 className="flex items-center gap-2 font-semibold"><Search className="h-4 w-4 text-amber-400" /> Select the member</h2>
        <input aria-label="Search member name or email" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search member name, username or email"
          className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500" />
        <div className="max-h-60 overflow-auto space-y-1">
          {loading ? <p className="text-sm text-slate-400">Loading member directory…</p> : filtered.length === 0
            ? <p className="text-sm text-slate-400">No matching members</p>
            : filtered.map(m => (
              <button key={m.id} type="button" onClick={() => select(m)} disabled={submitting} aria-pressed={selected?.id === m.id}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-800 ${selected?.id === m.id ? 'border border-amber-500/70 bg-slate-800' : 'border border-transparent'}`}>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.name || m.username || 'Member'}</span>
                  <span className="block truncate text-xs text-slate-400">{m.email || m.username || 'No email on file'}</span>
                </span>
                {selected?.id === m.id && <ShieldCheck className="h-5 w-5 shrink-0 text-amber-400" />}
              </button>
            ))}
        </div>
      </div>

      {selected && <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-5">
        <h2 className="font-semibold">Recovery for {selected.name || selected.username || 'member'}</h2>
        <p className="text-sm text-slate-400">This action will invalidate any earlier administrator-issued recovery link for this account. It will not immediately change the password.</p>
        <div aria-label="Email-only recovery" className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-200">
            <Mail className="h-4 w-4" /> Send recovery email
          </p>
          <p className="mt-2 text-sm text-slate-300">
            The member receives a single-use link at their email on file, valid for 30 minutes,
            and chooses their own password. Provider acceptance does not guarantee delivery.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Email is the only recovery method during the initial beta.
            Private handoff is unavailable until separately reviewed and approved.
          </p>
          {!selected.email && <p role="alert" className="mt-3 text-sm text-amber-200">
            This member has no email on file; email-only recovery is unavailable.
          </p>}
          {selected.email && selected.recovery_email_verified !== true && (
            <p role="alert" className="mt-3 text-sm text-amber-200">
              Recovery is unavailable until this member re-verifies their current email
              address. A historical verified flag is not sufficient.
            </p>
          )}
        </div>

        {selected.email && selected.recovery_email_verified !== true && (
          <div className="space-y-3 rounded-lg border border-amber-600/40 bg-amber-950/20 p-4">
            <h3 className="flex items-center gap-2 font-semibold text-amber-200">
              <Mail className="h-4 w-4" /> Verify the email on file
            </h3>
            <p className="text-sm text-slate-300">
              Send a one-time email verification link to the existing address.
              This does not change the account password or disclose a link to administrators.
              The member must confirm the email themselves before recovery becomes available.
            </p>
            <label className="flex items-start gap-2 text-sm text-amber-100">
              <input type="checkbox" checked={verifyConfirmed}
                onChange={e => setVerifyConfirmed(e.target.checked)} className="mt-1" />
              I confirm this member requested verification of their email address on file.
            </label>
            <button type="button" onClick={issueVerification}
              disabled={!verifyConfirmed || submitting}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 disabled:cursor-not-allowed disabled:opacity-40">
              <Mail className="h-4 w-4" /> {submitting ? 'Sending…' : 'Send verification email'}
            </button>
          </div>
        )}

        <label className="flex items-start gap-3 text-sm text-slate-200">
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
          I confirm this is the correct member and the request is authorized.
        </label>
        <button type="button" disabled={!confirmed || submitting || !selected.email || selected.recovery_email_verified !== true}
          onClick={issueRecovery}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
          <Lock className="h-4 w-4" /> {submitting ? 'Issuing…' : 'Initiate recovery'}
        </button>

      </div>}
    </section>
  );
}
