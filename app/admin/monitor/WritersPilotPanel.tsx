'use client';

// Writer's Studio pilot — who has made it in, who is engaging.
// Counts and timestamps only; never anyone's writing. See the route header.

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';

type Stage = 'invited' | 'invite_expired' | 'signed_up' | 'started_writing' | 'engaging';

type Entry = {
  kind: 'member' | 'invite';
  key: string;
  name: string;
  username: string | null;
  email: string | null;
  stage: Stage;
  studioAccess: boolean | null;
  joinedAt: string | null;
  lastSignIn: string | null;
  lastActivityAt: string | null;
  inviteExpiresAt: string | null;
  works: number;
  revisions: number;
  revisions7d: number;
  readings: number;
  asks: number;
};

type Payload = {
  generatedAt: string;
  engagingWindowDays: number;
  summary: {
    total: number;
    invited: number;
    inviteExpired: number;
    signedUp: number;
    startedWriting: number;
    engaging: number;
    awaitingAccess: number;
  };
  entries: Entry[];
  basis: { measures: string; doesNotMeasure: string; absence: string };
};

const STAGE_LABEL: Record<Stage, string> = {
  engaging: 'Engaging',
  started_writing: 'Started writing',
  signed_up: 'Signed up',
  invited: 'Invited',
  invite_expired: 'Invite expired',
};

const STAGE_STYLE: Record<Stage, string> = {
  engaging: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  started_writing: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
  signed_up: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
  invited: 'border-maia-ink-40/30 bg-maia-navy-900/60 text-maia-ink-100',
  invite_expired: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
};

function when(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function WritersPilotPanel() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/monitor/writers-pilot', { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        setError('Admin authorization is required.');
        return;
      }
      if (!res.ok) throw new Error(`Could not load the pilot roster (${res.status})`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the pilot roster');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const s = data?.summary;
  const tiles: Array<[string, number | undefined]> = [
    ['Invited', s ? s.invited + s.inviteExpired : undefined],
    ['Signed up', s ? s.signedUp + s.startedWriting + s.engaging : undefined],
    ['Started writing', s ? s.startedWriting + s.engaging : undefined],
    [`Engaging (${data?.engagingWindowDays ?? 7}d)`, s?.engaging],
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-light tracking-wide">Writer’s Studio pilot</h2>
          <p className="mt-1 max-w-2xl text-sm text-maia-ink-60">
            Who has made it in and who is engaging. Counts and times only; nothing anyone has written is read.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded border border-maia-ink-40/30 px-3 py-1.5 text-sm text-maia-ink-100 hover:bg-maia-navy-900/60 disabled:opacity-40"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <div className="text-sm text-rose-300">{error}</div>}

      {s && s.awaitingAccess > 0 && (
        <div className="rounded border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-200">
          {s.awaitingAccess} signed up but {s.awaitingAccess === 1 ? 'has' : 'have'} not been given Writer’s Studio
          access yet. They will not be able to open the Studio until they are flagged.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 px-3 py-3">
            <div className="text-2xl font-light">{value ?? '—'}</div>
            <div className="mt-0.5 text-xs text-maia-ink-60">{label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-maia-ink-40/20">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-maia-navy-900/60 text-xs uppercase tracking-wider text-maia-ink-60">
            <tr>
              <th className="px-3 py-2 font-medium">Writer</th>
              <th className="px-3 py-2 font-medium">Where they are</th>
              <th className="px-3 py-2 font-medium">Last sign-in</th>
              <th className="px-3 py-2 font-medium">Last activity</th>
              <th className="px-3 py-2 text-right font-medium">Works</th>
              <th className="px-3 py-2 text-right font-medium">Saves (7d)</th>
              <th className="px-3 py-2 text-right font-medium">Readings</th>
              <th className="px-3 py-2 text-right font-medium">Questions</th>
            </tr>
          </thead>
          <tbody>
            {data?.entries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-maia-ink-60">
                  No pilot writers found.
                </td>
              </tr>
            )}
            {data?.entries.map((e) => (
              <tr key={`${e.kind}-${e.key}`} className="border-t border-maia-ink-40/15 align-top">
                <td className="px-3 py-2">
                  <div>{e.name}</div>
                  <div className="text-xs text-maia-ink-60">{e.username ?? e.email ?? ''}</div>
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-block rounded border px-2 py-0.5 text-xs ${STAGE_STYLE[e.stage]}`}>
                    {STAGE_LABEL[e.stage]}
                  </span>
                  {e.kind === 'member' && e.studioAccess === false && (
                    <div className="mt-1 text-xs text-amber-200">No Studio access yet</div>
                  )}
                  {e.kind === 'invite' && (
                    <div className="mt-1 text-xs text-maia-ink-60">
                      {e.stage === 'invite_expired' ? 'Expired' : 'Expires'} {when(e.inviteExpiresAt)}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-maia-ink-60">{when(e.lastSignIn)}</td>
                <td className="px-3 py-2 text-maia-ink-60">{when(e.lastActivityAt)}</td>
                <td className="px-3 py-2 text-right">{e.kind === 'member' ? e.works : '—'}</td>
                <td className="px-3 py-2 text-right">{e.kind === 'member' ? `${e.revisions} (${e.revisions7d})` : '—'}</td>
                <td className="px-3 py-2 text-right">{e.kind === 'member' ? e.readings : '—'}</td>
                <td className="px-3 py-2 text-right">{e.kind === 'member' ? e.asks : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <p className="text-xs leading-5 text-maia-ink-60">
          Measures: {data.basis.measures}. Does not measure: {data.basis.doesNotMeasure}. {data.basis.absence}.
          Updated {when(data.generatedAt)}.
        </p>
      )}
    </section>
  );
}
