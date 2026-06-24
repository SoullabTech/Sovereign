'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { ELEMENT_META, FIELD_ACCENT, type ElementKey } from '@/lib/beta-testers/constants';
import { Loading } from '../_components/states';

interface Pulse {
  measured: {
    observationsThisWeek: number;
    mostActiveElement: string | null;
    membersReturning: number;
  };
  sensing: { theme: string; returningQuestions: string; note: string; updatedAt: string | null } | null;
}

function formatDate(d: string | null): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function FieldPulsePage() {
  const [pulse, setPulse] = useState<Pulse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/beta-testers/pulse');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setPulse(data?.measured ? data : { measured: { observationsThisWeek: 0, mostActiveElement: null, membersReturning: 0 }, sensing: null });
      } catch {
        if (!cancelled) setPulse({ measured: { observationsThisWeek: 0, mostActiveElement: null, membersReturning: 0 }, sensing: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (pulse === null) return <Loading />;

  const { measured, sensing } = pulse;
  const lens = measured.mostActiveElement ? ELEMENT_META[measured.mostActiveElement as ElementKey] : undefined;
  const quiet = measured.observationsThisWeek === 0 && measured.membersReturning === 0 && !lens;
  const hasSensing = !!sensing && (sensing.theme || sensing.returningQuestions || sensing.note);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h2 className="text-xl font-light text-zinc-100">What is alive right now</h2>
        <p className="text-[15px] text-zinc-500">A pulse of the field — not a dashboard.</p>
      </header>

      {/* Measured — real counts */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile value={String(measured.observationsThisWeek)} label="observations this week" />
        <Tile
          value={lens ? `${lens.glyph}` : '—'}
          valueColor={lens?.accent}
          label={lens ? `${lens.label} — most active perspective` : 'no active perspective yet'}
        />
        <Tile value={String(measured.membersReturning)} label="people returning to the field" />
      </div>

      {quiet && (
        <p className="text-[15px] leading-relaxed text-zinc-500">
          The field is quiet right now. Bring a question, try an experiment, and leave what you notice — the pulse grows
          from what the cohort does here.
        </p>
      )}

      {/* Sensing — a human reading */}
      {hasSensing && (
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-[0.2em] text-zinc-500">What we’re sensing</h3>
            {sensing?.updatedAt && <span className="text-xs text-zinc-600">{formatDate(sensing.updatedAt)}</span>}
          </div>
          <p className="text-xs text-zinc-600">A reading by the stewards — a human reflection, not a measurement.</p>

          {sensing?.theme && (
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-600">Strongest emerging theme</div>
              <p className="mt-1 text-[17px] font-light" style={{ color: FIELD_ACCENT }}>
                {sensing.theme}
              </p>
            </div>
          )}
          {sensing?.returningQuestions && (
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-600">Questions people are returning to</div>
              <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-zinc-300">{sensing.returningQuestions}</p>
            </div>
          )}
          {sensing?.note && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-zinc-400">{sensing.note}</p>
          )}
        </section>
      )}
    </div>
  );
}

function Tile({ value, label, valueColor }: { value: string; label: string; valueColor?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="text-4xl font-extralight" style={{ color: valueColor ?? '#f4f4f5' }}>
        {value}
      </div>
      <div className="mt-2 text-sm text-zinc-500">{label}</div>
    </div>
  );
}
