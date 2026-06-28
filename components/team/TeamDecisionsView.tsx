'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// The TEAM lens over studio_decisions — "what did we decide?" for the whole Co-lab.
// Reads GET /api/team/decisions (channel-access scoped). Accessible to every member,
// including non-practitioners (the engineer), unlike the private Council at /studio/decisions.

// Source message kind → typed-object label for the ledger. Keeps the permissive
// capture model honest: a captured question reads as "question · captured", never
// pretending to be a decision. Colors mirror the in-channel KIND_BADGE
// (components/team/MessageBubble.tsx); 'build' (the default/untagged kind) shows
// muted — "a regular message someone captured".
const KIND_META: Record<string, { label: string; cls: string }> = {
  decision: { label: 'decision', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  question: { label: 'question', cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  insight:  { label: 'insight',  cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  request:  { label: 'request',  cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  build:    { label: 'build',    cls: 'bg-white/8 text-white/45 border-white/15' },
};

function KindChip({ kind }: { kind: string | null }) {
  const meta = kind ? KIND_META[kind] : null;
  if (!meta) return null;
  return (
    <span className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${meta.cls}`}>
      {meta.label} · captured
    </span>
  );
}

interface TeamDecision {
  id: string;
  title: string;
  context: string;
  status: string;
  createdAt: string;
  sourceMessageId: string | null;
  sourceChannelId: string | null;
  channelSlug: string | null;
  channelName: string | null;
  capturedByName: string | null;
  sourceKind: string | null;
  taskCount: number;
}

export function TeamDecisionsView() {
  const [decisions, setDecisions] = useState<TeamDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Convert-to-task action — the operating-loop closure: decision → assigned work.
  const [members, setMembers] = useState<{ memberId: string; name: string }[]>([]);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [assignee, setAssignee] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/team/decisions');
      if (!res.ok) { setError('Failed to load decisions'); return; }
      const d = await res.json();
      setDecisions(d.decisions ?? []);
    } catch {
      setError('Failed to load decisions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch('/api/team/members')
      .then(r => (r.ok ? r.json() : { members: [] }))
      .then(d => setMembers(d.members ?? []))
      .catch(() => {});
  }, [load]);

  // Turn a captured decision into accountable work via the channel-scoped team
  // endpoint (engineer-capable — any channel participant, not just practitioners).
  // The route derives source_decision_id + the decision's channel/message origin
  // server-side, so provenance is retained and the task counts against the decision.
  const makeTask = useCallback(async (d: TeamDecision) => {
    setBusyId(d.id);
    try {
      const res = await fetch(`/api/team/decisions/${d.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: d.title,
          assignee: assignee || undefined,
        }),
      });
      if (res.ok) {
        setConvertingId(null);
        setAssignee('');
        await load(); // refresh taskCount
      }
    } finally {
      setBusyId(null);
    }
  }, [assignee, load]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/8">
        <h1 className="text-lg font-semibold text-white/90 flex items-center gap-2">
          <span className="text-emerald-400">✓</span> Team Decisions
        </h1>
        <p className="text-xs text-white/40 mt-0.5">
          Decisions captured from Co-lab channels — what we decided, and what came of it.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-sm text-red-400/80">{error}</p>}

        {!loading && !error && decisions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8 text-white/40">
            <div className="text-4xl opacity-30">✓</div>
            <p className="text-sm">No decisions captured yet.</p>
            <p className="text-xs text-white/25">
              In any channel, hover a message →{' '}
              <span className="text-emerald-400/70">Capture as Decision</span>.
            </p>
          </div>
        )}

        {!loading && !error && decisions.length > 0 && (
          <div className="space-y-2 max-w-3xl">
            {decisions.map(d => (
              <div
                key={d.id}
                className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-white/90 font-medium leading-snug">{d.title}</p>
                  {d.taskCount > 0 ? (
                    <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-sky-500/15 text-sky-300 border-sky-500/30">
                      {d.taskCount} task{d.taskCount === 1 ? '' : 's'}
                    </span>
                  ) : convertingId !== d.id ? (
                    <button
                      onClick={() => { setConvertingId(d.id); setAssignee(''); }}
                      className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/90 text-black hover:bg-amber-400 transition-colors"
                    >
                      Make task
                    </button>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-white/35 flex-wrap">
                  <KindChip kind={d.sourceKind} />
                  {d.channelSlug && (
                    <Link
                      href={`/team/${d.channelSlug}`}
                      className="text-amber-400/60 hover:text-amber-400 transition-colors"
                    >
                      #{d.channelSlug}
                    </Link>
                  )}
                  {d.capturedByName && <span>· captured by {d.capturedByName}</span>}
                  <span>· {new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>

                {/* Make task → assigned work (shown only when not yet converted) */}
                {convertingId === d.id && d.taskCount === 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/8 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-white/40">Assign to</span>
                    <select
                      value={assignee}
                      onChange={e => setAssignee(e.target.value)}
                      className="bg-[#1a1a2e] border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">Unassigned</option>
                      {members.map(m => (
                        <option key={m.memberId} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => makeTask(d)}
                      disabled={busyId === d.id}
                      className="text-xs px-2.5 py-1 rounded-md bg-amber-500 text-black font-medium disabled:opacity-40 hover:bg-amber-400 transition-colors"
                    >
                      {busyId === d.id ? 'Creating…' : 'Create task'}
                    </button>
                    <button
                      onClick={() => setConvertingId(null)}
                      className="text-xs px-2 py-1 text-white/40 hover:text-white/70 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
