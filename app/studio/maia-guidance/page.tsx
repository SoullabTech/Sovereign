'use client';

// ─────────────────────────────────────────────────────────────────────────────
// MAIA GUIDANCE (Layer 4) — practitioner-facing field-governance admin.
//
// A practitioner configures how MAIA engages WITHIN their field: tone, language,
// invitations, boundaries, forbidden topics/engagements. Narrow-only by invariant:
// these preferences may narrow or specify MAIA's behavior in the field; they can
// NEVER relax her constitutional safeguards or widen her authority. Attempts to do
// so are rejected on save (422) with practitioner-facing reasons.
//
// Studio dark classes are UNCONDITIONAL (never `dark:` variants) per repo rule.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { Compass, ShieldCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface GuidanceForm {
  tone: string;
  preferred_language: string;
  invitations: string;          // one per line
  boundaries: string;           // one per line
  forbidden_topics: string;     // one per line
  forbidden_engagements: string;// one per line
  custom_notes: string;
}

const EMPTY: GuidanceForm = {
  tone: '', preferred_language: '', invitations: '', boundaries: '',
  forbidden_topics: '', forbidden_engagements: '', custom_notes: '',
};

const linesToArray = (s: string): string[] =>
  s.split('\n').map((l) => l.trim()).filter(Boolean);

export default function MaiaGuidancePage() {
  const [form, setForm] = useState<GuidanceForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/practitioner/maia-guidance');
        if (res.ok) {
          const data = await res.json();
          const g = data.guidance ?? {};
          setForm({
            tone: g.tone ?? '',
            preferred_language: g.preferred_language ?? '',
            invitations: (g.invitations ?? []).join('\n'),
            boundaries: (g.boundaries ?? []).join('\n'),
            forbidden_topics: (g.forbidden_topics ?? []).join('\n'),
            forbidden_engagements: (g.forbidden_engagements ?? []).join('\n'),
            custom_notes: g.custom_notes ?? '',
          });
        } else if (res.status === 401) {
          setError('Please sign in to your practitioner Studio.');
        }
      } catch {
        setError('Could not load your guidance.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k: keyof GuidanceForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const save = useCallback(async () => {
    setSaving(true); setSaved(false); setViolations([]); setError(null);
    const guidance = {
      tone: form.tone.trim() || undefined,
      preferred_language: form.preferred_language.trim() || undefined,
      invitations: linesToArray(form.invitations),
      boundaries: linesToArray(form.boundaries),
      forbidden_topics: linesToArray(form.forbidden_topics),
      forbidden_engagements: linesToArray(form.forbidden_engagements),
      custom_notes: form.custom_notes.trim() || undefined,
    };
    try {
      const res = await apiFetch('/api/practitioner/maia-guidance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guidance }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
      } else if (res.status === 422) {
        setViolations(data.violations ?? []);
        setError(data.error ?? 'Some preferences were not allowed.');
      } else {
        setError(data.error ?? 'Could not save.');
      }
    } catch {
      setError('Could not save.');
    } finally {
      setSaving(false);
    }
  }, [form]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Compass className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-semibold">MAIA Guidance</h1>
        </div>
        <p className="text-neutral-400 mb-6">
          Shape how MAIA engages within your field — her tone, the language she works in,
          what she may offer, and what she should hold or avoid.
        </p>

        {/* Narrow-only boundary — stated plainly */}
        <div className="flex gap-3 items-start bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-sm text-neutral-300">
            These preferences <span className="text-neutral-100 font-medium">narrow or specify</span> how MAIA
            engages in your field. They can never remove her safeguards or widen her authority — if a
            preference conflicts with her constitution, the constitution wins and the preference is set aside.
          </p>
        </div>

        <div className="space-y-6">
          <Field label="Tone" hint="e.g. warm, direct, unhurried">
            <input className={inputCls} value={form.tone} onChange={set('tone')} placeholder="How MAIA sounds in your field" />
          </Field>

          <Field label="Preferred language / framework" hint="the vocabulary you work in">
            <input className={inputCls} value={form.preferred_language} onChange={set('preferred_language')} placeholder="e.g. Internal Family Systems, somatic, contemplative" />
          </Field>

          <Field label="Invitations" hint="things MAIA may gently offer — one per line">
            <textarea className={textareaCls} rows={3} value={form.invitations} onChange={set('invitations')} placeholder={'a grounding breath when things move fast\nnaming what is alive right now'} />
          </Field>

          <Field label="Boundaries" hint="what MAIA should hold within your field — one per line">
            <textarea className={textareaCls} rows={3} value={form.boundaries} onChange={set('boundaries')} placeholder={'stay with what the client brings; do not steer'} />
          </Field>

          <Field label="Do not raise or engage" hint="topics off-limits in your field — one per line">
            <textarea className={textareaCls} rows={3} value={form.forbidden_topics} onChange={set('forbidden_topics')} placeholder={'politics\nthe practitioner’s personal life'} />
          </Field>

          <Field label="Do not enact" hint="things MAIA must not do here — one per line">
            <textarea className={textareaCls} rows={3} value={form.forbidden_engagements} onChange={set('forbidden_engagements')} placeholder={'do not give medical or legal advice'} />
          </Field>

          <Field label="Additional preferences" hint="anything else about how MAIA should show up">
            <textarea className={textareaCls} rows={3} value={form.custom_notes} onChange={set('custom_notes')} placeholder="Free text" />
          </Field>
        </div>

        {violations.length > 0 && (
          <div className="mt-6 bg-red-950/40 border border-red-900 rounded-xl p-4">
            <p className="text-sm text-red-300 font-medium mb-1">These preferences were not allowed:</p>
            <ul className="list-disc list-inside text-sm text-red-300/90 space-y-1">
              {violations.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
        )}
        {error && violations.length === 0 && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-medium rounded-lg px-5 py-2.5 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save guidance
          </button>
          {saved && <span className="text-sm text-emerald-400">Saved — this now shapes MAIA in your field.</span>}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500';
const textareaCls = inputCls + ' resize-y';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-200 mb-1">{label}</label>
      {hint && <p className="text-xs text-neutral-500 mb-2">{hint}</p>}
      {children}
    </div>
  );
}
