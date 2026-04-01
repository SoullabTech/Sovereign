'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface FormState {
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

const INITIAL: FormState = {
  submitted_by_name: '',
  submitted_by_email: '',
  source_title: '',
  author: '',
  tradition_or_domain: '',
  url: '',
  rationale: '',
  category: 'other',
  is_self_submission: false,
  website: '',
};

const INPUT =
  'w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4B896]/40 transition';

export default function WisdomSubmissionForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/wisdom-keepers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setStatus('error');
        setMessage(data?.error || 'Unable to submit right now.');
        return;
      }

      setStatus('success');
      setMessage(data.message || 'Thank you. Your submission will be reviewed.');
      setForm(INITIAL);
    } catch {
      setStatus('error');
      setMessage('Unable to submit right now.');
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-white">Submit a Source for Review</h2>
          <p className="mt-1 text-sm text-white/55">
            Submissions are reviewed by Soullab. Only curated sources enter the
            canonical Wisdom Keepers library.
          </p>
        </div>

        {status !== 'success' && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-xl border border-[#D4B896]/30 bg-[#D4B896]/10 px-4 py-2 text-sm text-[#D4B896] transition hover:bg-[#D4B896]/20"
          >
            {open ? 'Close' : 'Submit a Source'}
          </button>
        )}
      </div>

      {/* Success */}
      {status === 'success' && (
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {message}
        </div>
      )}

      {/* Form */}
      {open && (
        <form onSubmit={onSubmit} className="mt-6 grid gap-5">
          {/* Honeypot */}
          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            name="website"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm text-white/70">Your name *</span>
              <input
                required
                value={form.submitted_by_name}
                onChange={(e) => set('submitted_by_name', e.target.value)}
                className={INPUT}
                placeholder="Your name"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm text-white/70">Email (optional)</span>
              <input
                type="email"
                value={form.submitted_by_email}
                onChange={(e) => set('submitted_by_email', e.target.value)}
                className={INPUT}
                placeholder="For follow-up if needed"
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm text-white/70">Source title *</span>
            <input
              required
              value={form.source_title}
              onChange={(e) => set('source_title', e.target.value)}
              className={INPUT}
              placeholder="Title of the book, text, or tradition"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm text-white/70">Author / tradition</span>
              <input
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                className={INPUT}
                placeholder="Author or tradition name"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm text-white/70">Tradition / domain</span>
              <input
                value={form.tradition_or_domain}
                onChange={(e) => set('tradition_or_domain', e.target.value)}
                className={INPUT}
                placeholder="e.g. Depth Psychology, Vedic, Somatic"
              />
            </label>
          </div>

          <label className="grid gap-1.5">
            <span className="text-sm text-white/70">Link or reference</span>
            <input
              value={form.url}
              onChange={(e) => set('url', e.target.value)}
              className={INPUT}
              placeholder="https://..."
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm text-white/70">Why it matters *</span>
            <textarea
              required
              rows={4}
              value={form.rationale}
              onChange={(e) => set('rationale', e.target.value)}
              className={INPUT}
              placeholder="What makes this source meaningful for inner work, growth, or understanding?"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm text-white/70">Category</span>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={INPUT}
              >
                <option value="wisdom_tradition">Wisdom tradition</option>
                <option value="psychology">Psychology</option>
                <option value="philosophy">Philosophy</option>
                <option value="consciousness">Consciousness</option>
                <option value="ritual_practice">Ritual &amp; practice</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="flex items-center gap-3 self-end pb-3 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_self_submission}
                onChange={(e) => set('is_self_submission', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/20 accent-[#D4B896]"
              />
              Is this your own work?
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D4B896]/30 bg-[#D4B896]/15 px-5 py-3 text-sm font-medium text-[#D4B896] transition hover:bg-[#D4B896]/25 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {status === 'submitting' ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
