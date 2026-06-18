'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Clock, Send, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED EMAIL — Level 2 (email-only). You write an email and choose when it
// goes out; MAIA sends exactly what you wrote, when due. You author the
// recipient, the content, the time, and confirm permission. Nothing inferred,
// nothing autonomous.
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduledSend {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  scheduled_for: string;
  consent_confirmed: boolean;
  status: 'pending' | 'sent' | 'failed' | 'canceled';
  sent_at: string | null;
  attempts: number;
  last_error: string | null;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'text-amber-300',
  sent: 'text-emerald-300',
  failed: 'text-rose-300',
  canceled: 'text-slate-500',
};

export default function ScheduledSendsPage() {
  const [sends, setSends] = useState<ScheduledSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/studio/scheduled-sends');
      if (res.ok) { const d = await res.json(); setSends(d.sends ?? []); }
    } catch { /* orientation surface — fail quiet */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setError(null);
    if (saving) return;
    if (!consent) { setError('Please confirm you have permission to send this email.'); return; }
    setSaving(true);
    try {
      const res = await apiFetch('/api/studio/scheduled-sends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          recipientName: recipientName || undefined,
          subject,
          body,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : '',
          consentConfirmed: consent,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Could not schedule the send.');
        return;
      }
      setRecipientEmail(''); setRecipientName(''); setSubject(''); setBody(''); setScheduledFor(''); setConsent(false);
      await load();
    } catch {
      setError('Could not schedule the send.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id: string) => {
    try { await apiFetch(`/api/studio/scheduled-sends/${id}`, { method: 'DELETE' }); } catch { /* */ }
    await load();
  };

  const selfTest = async () => {
    if (testing) return;
    setTesting(true); setTestResult(null);
    try {
      const res = await apiFetch('/api/studio/scheduled-sends/test', { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      setTestResult(res.ok && d.ok ? `Sent a test email to you (${d.to}). Check your inbox.` : `Test failed: ${d.error || 'unknown error'}`);
    } catch {
      setTestResult('Test failed.');
    } finally {
      setTesting(false);
      await load();
    }
  };

  const fmt = (iso: string | null) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-5 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-light text-white mb-1 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" /> Scheduled email
          </h1>
          <p className="text-slate-400 text-sm">
            Write an email and choose when it goes out. MAIA sends exactly what you wrote, when it&rsquo;s due — nothing more.
          </p>
        </div>

        {/* Compose */}
        <section className="rounded-2xl bg-white/[0.02] border border-white/10 p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Recipient email" type="email"
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20" />
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient name (optional)"
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20" />
          </div>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Write your message…"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20 resize-y" />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500">Send at</span>
            <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm focus:outline-none focus:border-white/20" />
          </label>
          <label className="flex items-start gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>I have permission to send this email to this recipient. <span className="text-slate-500">MAIA only sends what I explicitly authorize.</span></span>
          </label>
          {error && <p className="text-rose-300 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {error}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button onClick={submit} disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 transition text-sm flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Schedule send
            </button>
            <button onClick={selfTest} disabled={testing}
              className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition text-sm flex items-center gap-2 disabled:opacity-50">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Send a test to myself
            </button>
          </div>
          {testResult && <p className="text-sm text-slate-300">{testResult}</p>}
        </section>

        {/* List */}
        <h2 className="text-sm text-slate-400 uppercase tracking-wider mb-3">Your scheduled &amp; sent</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-amber-400/60 animate-spin" /></div>
        ) : sends.length === 0 ? (
          <p className="text-sm text-slate-600">Nothing scheduled yet.</p>
        ) : (
          <div className="space-y-2">
            {sends.map((s) => (
              <div key={s.id} className="rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-white/90 text-sm truncate">{s.subject}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    to {s.recipient_name ? `${s.recipient_name} <${s.recipient_email}>` : s.recipient_email}
                    {' · '}
                    {s.status === 'sent' ? `sent ${fmt(s.sent_at)}` : `for ${fmt(s.scheduled_for)}`}
                  </div>
                  {s.last_error && <div className="text-[11px] text-rose-400/80 mt-0.5">{s.last_error}</div>}
                </div>
                <span className={`text-xs ${STATUS_STYLE[s.status] || 'text-slate-400'} shrink-0`}>{s.status}</span>
                {s.status === 'pending' && (
                  <button onClick={() => cancel(s.id)} title="Cancel" aria-label="Cancel"
                    className="p-1 rounded text-slate-600 hover:text-rose-300 transition shrink-0"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
