'use client';

/**
 * WisdomSubmissionForm — Community source suggestion form.
 *
 * Extracted as a client component so the parent page can remain
 * a server component (or stay 'use client' without state pollution).
 *
 * Includes a hidden honeypot field for basic anti-spam.
 */

import { useState, useCallback } from 'react';
import { Plus, Send, X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface FormData {
  submitted_by_name: string;
  submitted_by_email: string;
  source_title: string;
  author: string;
  tradition_or_domain: string;
  url: string;
  rationale: string;
  category: string;
  is_self_submission: boolean;
  website: string; // honeypot
}

const INITIAL: FormData = {
  submitted_by_name: '',
  submitted_by_email: '',
  source_title: '',
  author: '',
  tradition_or_domain: '',
  url: '',
  rationale: '',
  category: 'wisdom_tradition',
  is_self_submission: false,
  website: '',
};

type Status = 'idle' | 'open' | 'submitting' | 'success' | 'error';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function WisdomSubmissionForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errorMsg, setErrorMsg] = useState('');

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) =>
      setForm(prev => ({ ...prev, [key]: value })),
    [],
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/wisdom-keepers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setStatus('success');
      setForm(INITIAL);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
      setStatus('error');
    }
  }, [form]);

  // ── Idle: show trigger button ──
  if (status === 'idle') {
    return (
      <section className="mt-10">
        <button
          type="button"
          onClick={() => setStatus('open')}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm text-white/70 hover:bg-white/5 transition"
        >
          <Plus className="h-4 w-4" />
          Suggest a Source
        </button>
      </section>
    );
  }

  // ── Success ──
  if (status === 'success') {
    return (
      <section className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
        <p className="text-sm text-emerald-300">
          Thank you. Your suggestion has been received and will be reviewed.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-3 text-xs text-white/50 underline hover:text-white/70"
        >
          Submit another
        </button>
      </section>
    );
  }

  // ── Form (open / submitting / error) ──
  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#D4B896]">Suggest a Source</h3>
          <button
            type="button"
            onClick={() => { setStatus('idle'); setErrorMsg(''); }}
            className="text-white/40 hover:text-white/70 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-white/50 mb-6">
          Know a text, teacher, or tradition that belongs here?
          Suggest it for review.
        </p>

        {status === 'error' && errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Honeypot — hidden from real users */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <input
              tabIndex={-1}
              autoComplete="off"
              name="website"
              value={form.website}
              onChange={e => update('website', e.target.value)}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-white/80">Your name *</span>
              <input
                required
                value={form.submitted_by_name}
                onChange={e => update('submitted_by_name', e.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-white/80">Email</span>
              <input
                type="email"
                value={form.submitted_by_email}
                onChange={e => update('submitted_by_email', e.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                placeholder="Optional — for follow-up only"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-white/80">Source title *</span>
              <input
                required
                value={form.source_title}
                onChange={e => update('source_title', e.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                placeholder="Book, text, teacher, or body of work"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-white/80">Author</span>
              <input
                value={form.author}
                onChange={e => update('author', e.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                placeholder="Optional"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-white/80">Tradition or domain *</span>
            <input
              required
              value={form.tradition_or_domain}
              onChange={e => update('tradition_or_domain', e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              placeholder="e.g. Sufi mysticism, depth psychology, Buddhist ethics"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/80">Link or reference</span>
            <input
              value={form.url}
              onChange={e => update('url', e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              placeholder="https://..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-white/80">Why it matters *</span>
            <textarea
              required
              rows={5}
              value={form.rationale}
              onChange={e => update('rationale', e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-white/80">Category</span>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              >
                <option value="wisdom_tradition">Wisdom tradition</option>
                <option value="psychology">Psychology</option>
                <option value="philosophy">Philosophy</option>
                <option value="consciousness">Consciousness</option>
                <option value="ritual_practice">Ritual &amp; practice</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="flex items-center gap-3 pt-8 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.is_self_submission}
                onChange={e => update('is_self_submission', e.target.checked)}
              />
              Is this your own work?
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm text-white hover:bg-white/5 disabled:opacity-60 transition"
            >
              <Send className="h-3.5 w-3.5" />
              {status === 'submitting' ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
