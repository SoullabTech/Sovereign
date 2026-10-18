'use client';

/**
 * Member Access: deliberate, consent-aware administrator-initiated recovery.
 * The server requires a VERIFIED FOUNDER MEMBER SESSION; the shared admin
 * password that opens Command Center does not authorize this sensitive action.
 */
import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Search, ShieldCheck, Mail, Copy, AlertTriangle, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin/adminFetch';

type MemberRow = { id: string; name: string | null; username: string | null; email: string | null; admin_role: string | null };
type DeliveryMode = 'email' | 'private_handoff';

export default function MemberAccessPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MemberRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DeliveryMode>('email');
  const [reason, setReason] = useState<'email_unavailable' | 'verified_in_person'>('email_unavailable');
  const [verified, setVerified] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [handoffLink, setHandoffLink] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch('/api/admin/members', { cache: 'no-store' });
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
    setSelected(m);
    setError('');
    setMessage('');
    setHandoffLink(null);
    setVerified(false);
    setConfirmed(false);
    setMode('email');
  }

  async function issueRecovery() {
    if (!selected || !confirmed || submitting) return;
    if (mode === 'private_handoff' && !verified) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    setHandoffLink(null);
    try {
      const res = await adminFetch('/api/admin/members/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          memberId: selected.id,
          method: mode,
          reason: mode === 'email' ? 'member_requested' : reason,
          identityVerified: mode === 'private_handoff' ? verified : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 && typeof data.error === 'string' && data.error.includes('verified founder')) {
          throw new Error('Sign in with your founder member account. The shared admin password alone cannot initiate recovery.');
        }
        throw new Error(data.error || 'Recovery could not be initiated');
      }
      if (mode === 'private_handoff' && typeof data.recoveryLink === 'string') {
        setHandoffLink(data.recoveryLink);
        setMessage('One-time link issued. Transfer only through the verified private handoff; it expires after 10 minutes.');
      } else {
        setMessage('The email provider accepted this recovery request. Delivery has not been confirmed.');
      }
      setConfirmed(false);
      setVerified(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Recovery could not be initiated');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-4xl space-y-6 text-slate-100">
      <header className="space-y-3">
        <Link href="/labtools/admin/command-center/members" className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200">
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
              <button key={m.id} type="button" onClick={() => select(m)} aria-pressed={selected?.id === m.id}
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
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold mb-2">Delivery method</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-700 p-3">
            <input type="radio" name="delivery" value="email" checked={mode === 'email'} onChange={() => { setMode('email'); setHandoffLink(null); }} className="mt-1" />
            <span><span className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4" /> Send recovery email</span>
              <span className="block text-sm text-slate-400">Member chooses a new password through a 30-minute single-use link. Email acceptance does not prove delivery.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-700 p-3">
            <input type="radio" name="delivery" value="private_handoff" checked={mode === 'private_handoff'} onChange={() => { setMode('private_handoff'); setHandoffLink(null); }} className="mt-1" />
            <span><span className="font-medium">Verified private handoff</span>
              <span className="block text-sm text-slate-400">Exceptional use when email cannot be delivered. Show a link once for secure delivery to the member. Expires after 10 minutes.</span></span>
          </label>
        </fieldset>

        {mode === 'private_handoff' && <div className="space-y-3 rounded-lg border border-amber-700/40 bg-amber-950/20 p-4">
          <label className="block text-sm">Reason
            <select value={reason} onChange={e => setReason(e.target.value as typeof reason)}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-white">
              <option value="email_unavailable">Email unavailable; identity verified separately</option>
              <option value="verified_in_person">Identity verified in person</option>
            </select>
          </label>
          <label className="flex items-start gap-2 text-sm text-amber-100">
            <input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} className="mt-1" />
            I have verified this member's identity independently. I will not put their recovery link in a public channel.
          </label>
        </div>}

        <label className="flex items-start gap-3 text-sm text-slate-200">
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
          I confirm this is the correct member and the request is authorized.
        </label>
        <button type="button" disabled={!confirmed || submitting || (mode === 'private_handoff' && !verified)}
          onClick={issueRecovery}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
          <Lock className="h-4 w-4" /> {submitting ? 'Issuing…' : 'Initiate recovery'}
        </button>
        {handoffLink && <div className="rounded-lg border border-amber-600/50 bg-slate-950 p-4 space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-300"><AlertTriangle className="h-4 w-4" /> One-time private link</p>
          <p className="break-all text-xs text-slate-300" aria-label="Temporary recovery link">{handoffLink}</p>
          <button type="button" className="inline-flex gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
            onClick={async () => { try { await navigator.clipboard.writeText(handoffLink); setMessage('Copied. Deliver securely to the verified member.'); } catch { setError('Clipboard unavailable. Use a secure handoff method.'); } }}>
            <Copy className="h-4 w-4" /> Copy once
          </button>
          <button type="button" className="ml-3 text-sm text-slate-400 underline" onClick={() => setHandoffLink(null)}>Dismiss link</button>
        </div>}
      </div>}
    </section>
  );
}
