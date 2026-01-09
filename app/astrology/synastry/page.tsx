'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type BirthInput = {
  name?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location?: string;
};

function MiniBirthForm({
  label,
  value,
  onChange,
}: {
  label: string;
  value: BirthInput;
  onChange: (next: BirthInput) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-medium text-white/80 mb-3">{label}</div>

      <div className="grid gap-3">
        <input
          className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
          placeholder="Name (optional)"
          value={value.name ?? ''}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
            type="date"
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
          />
          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
            type="time"
            value={value.time ?? ''}
            onChange={(e) => onChange({ ...value, time: e.target.value })}
          />
        </div>
        <input
          className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
          placeholder="Location (optional)"
          value={value.location ?? ''}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function SynastryPage() {
  const router = useRouter();

  const [a, setA] = useState<BirthInput>({ date: '' });
  const [b, setB] = useState<BirthInput>({ date: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(a.date && b.date), [a.date, b.date]);

  async function runSynastry() {
    if (!canSubmit || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/astrology/synastry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persist: true,
          a: { birth: a },
          b: { birth: b },
        }),
      });

      const data = (await res.json()) as any;

      if (!res.ok || !data?.success) {
        throw new Error(data?.error ?? 'Synastry request failed');
      }

      const analysisId = data.analysisId as string | undefined;
      if (!analysisId) throw new Error('Missing analysisId from API response');

      router.push(`/astrology/synastry/${encodeURIComponent(analysisId)}`);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to run synastry');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Synastry</h1>
          <p className="text-sm text-white/60">
            Compare two charts and generate a persisted analysis.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MiniBirthForm label="Person A" value={a} onChange={setA} />
          <MiniBirthForm label="Person B" value={b} onChange={setB} />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            onClick={runSynastry}
            disabled={!canSubmit || isLoading}
            className="rounded-xl bg-violet-500/20 border border-violet-500/30 px-4 py-2 text-sm text-violet-100 hover:bg-violet-500/30 disabled:opacity-50"
          >
            {isLoading ? 'Running…' : 'Run Synastry'}
          </button>
          <div className="text-xs text-white/50">
            Requires at least both birth dates.
          </div>
        </div>
      </div>
    </main>
  );
}
