'use client';

// Feedback Inbox — Layer 1 board (status columns + cards + detail; click-to-move, no drag yet).
// Live source only: reads GET /api/admin/feedback and mutates via PATCH /api/admin/feedback/[id].
// Layer 2 (drag-drop) will sit on top of the SAME PATCH endpoint — no rework.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';

interface Attachment {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
}
interface FeedbackItem {
  id: number;
  category: string;
  message: string;
  status: string;
  user_id: string | null;
  user_name: string | null;
  user_agent: string | null;
  url: string | null;
  notes: string | null;
  assigned_owner: string | null;
  linked_pr: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

const COLUMNS: { key: string; label: string; hint: string }[] = [
  { key: 'new', label: 'New', hint: 'Incoming reports' },
  { key: 'triaged', label: 'Triaged', hint: 'Reviewed & categorized' },
  { key: 'planned', label: 'Planned', hint: 'Accepted for work' },
  { key: 'active', label: 'Active', hint: 'Being worked' },
  { key: 'fixed', label: 'Fixed', hint: 'Awaiting verification' },
  { key: 'verified', label: 'Verified', hint: 'Confirmed solved' },
  { key: 'closed', label: 'Closed', hint: 'Archived' },
];
const STATUS_KEYS = COLUMNS.map((c) => c.key);

const CATEGORY_META: Record<string, { label: string; badge: string }> = {
  problem: { label: 'Problem', badge: 'bg-red-500/15 text-red-300 border-red-500/30' },
  challenge: { label: 'Challenge', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  strength: { label: 'Love', badge: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  feature: { label: 'Feature', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  question: { label: 'Question', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
};

function parseUA(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Android/.test(ua) ? 'Android'
    : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Linux/.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge'
    : /CriOS|Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari' : '';
  return [br, os].filter(Boolean).join(' · ') || 'Unknown device';
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function FeedbackInboxPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [hideClosed, setHideClosed] = useState(true);
  const [detailId, setDetailId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback');
      if (res.status === 401 || res.status === 403) {
        setError('Admin access required to view the feedback inbox.');
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setCounts(data.counts || {});
      setError(null);
    } catch {
      setError('Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = betaSession.getUser();
    if (!user) {
      router.push('/signin');
      return;
    }
    load();
  }, [router, load]);

  const patch = useCallback(
    async (id: number, body: Record<string, unknown>) => {
      try {
        await fetch(`/api/admin/feedback/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } finally {
        load();
      }
    },
    [load]
  );

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        if (categoryFilter !== 'all' && it.category !== categoryFilter) return false;
        if (hideClosed && it.status === 'closed') return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const hay = `${it.message} ${it.user_name ?? ''} ${it.url ?? ''} ${it.assigned_owner ?? ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [items, categoryFilter, hideClosed, search]
  );

  const byStatus = useMemo(() => {
    const m: Record<string, FeedbackItem[]> = {};
    for (const c of COLUMNS) m[c.key] = [];
    for (const it of filtered) {
      if (!m[it.status]) m[it.status] = [];
      m[it.status].push(it);
    }
    return m;
  }, [filtered]);

  const detail = items.find((it) => it.id === detailId) ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white/90">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              ← Admin
            </button>
            <h1 className="text-lg font-semibold text-white">Feedback Inbox</h1>
            <span className="text-xs text-white/35">
              {items.length} report{items.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search message / reporter / URL…"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/90 placeholder-white/25 outline-none focus:border-amber-500/40 transition-colors w-64"
            />
            <label className="flex items-center gap-1.5 text-xs text-white/45 cursor-pointer select-none">
              <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} />
              Hide closed
            </label>
            <button
              onClick={load}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['all', 'problem', 'challenge', 'strength', 'feature', 'question'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                categoryFilter === c
                  ? 'bg-white/15 text-white border-white/30'
                  : 'text-white/45 border-white/10 hover:text-white/70'
              }`}
            >
              {c === 'all' ? 'All' : CATEGORY_META[c]?.label ?? c}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {error ? (
        <div className="p-8 text-sm text-red-300/80">{error}</div>
      ) : loading && items.length === 0 ? (
        <div className="p-8 text-sm text-white/40">Loading…</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto p-5">
          {COLUMNS.map((col) => {
            const cards = byStatus[col.key] ?? [];
            return (
              <div key={col.key} className="flex-shrink-0 w-[300px]">
                <div className="flex items-baseline justify-between px-1 mb-2">
                  <div>
                    <div className="text-sm font-medium text-white/85">{col.label}</div>
                    <div className="text-[10px] text-white/30">{col.hint}</div>
                  </div>
                  <span className="text-xs text-white/40 tabular-nums">
                    {counts[col.key] ?? cards.length}
                  </span>
                </div>
                <div className="space-y-2 rounded-xl bg-white/[0.02] border border-white/5 p-2 min-h-[120px]">
                  {cards.length === 0 ? (
                    <div className="text-[11px] text-white/20 text-center py-6">—</div>
                  ) : (
                    cards.map((it) => (
                      <Card key={it.id} item={it} onOpen={() => setDetailId(it.id)} onPatch={patch} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && <DetailModal item={detail} onClose={() => setDetailId(null)} onPatch={patch} />}
    </div>
  );
}

function Card({
  item,
  onOpen,
  onPatch,
}: {
  item: FeedbackItem;
  onOpen: () => void;
  onPatch: (id: number, body: Record<string, unknown>) => void;
}) {
  const cat = CATEGORY_META[item.category] ?? { label: item.category, badge: 'bg-white/10 text-white/60 border-white/20' };
  const reviewed = !!item.reviewed_at;
  return (
    <div className="rounded-lg bg-zinc-900 border border-white/10 p-2.5 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cat.badge}`}>{cat.label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPatch(item.id, { reviewed: !reviewed })}
            title={reviewed ? `Reviewed${item.reviewed_by ? ` by ${item.reviewed_by}` : ''}` : 'Mark reviewed'}
            className={`w-2.5 h-2.5 rounded-full border transition-colors ${
              reviewed ? 'bg-green-400 border-green-400' : 'border-white/30 hover:border-green-400'
            }`}
            aria-label={reviewed ? 'Reviewed' : 'Mark reviewed'}
          />
          <span className="text-[10px] text-white/30">{timeAgo(item.created_at)}</span>
        </div>
      </div>

      {item.attachments.length > 0 && (
        <div className="flex gap-1 mb-1.5">
          {item.attachments.slice(0, 3).map((a) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={a.id}
              src={a.url}
              alt={a.filename}
              onClick={onOpen}
              className="h-12 w-12 object-cover rounded border border-white/10 cursor-pointer"
            />
          ))}
          {item.attachments.length > 3 && (
            <div className="h-12 w-12 rounded border border-white/10 flex items-center justify-center text-[10px] text-white/40">
              +{item.attachments.length - 3}
            </div>
          )}
        </div>
      )}

      <button onClick={onOpen} className="block text-left w-full">
        <p className="text-xs text-white/80 line-clamp-3 leading-snug">
          {item.message || <span className="text-white/30 italic">(screenshot only)</span>}
        </p>
      </button>

      <div className="mt-1.5 text-[10px] text-white/35 truncate">
        {item.user_name || 'Anonymous'} · {parseUA(item.user_agent)}
      </div>
      {(item.assigned_owner || item.linked_pr) && (
        <div className="mt-1 flex items-center gap-2 text-[10px]">
          {item.assigned_owner && <span className="text-amber-300/80">@{item.assigned_owner}</span>}
          {item.linked_pr && <span className="text-blue-300/80 truncate">{item.linked_pr}</span>}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <select
          value={item.status}
          onChange={(e) => onPatch(item.id, { status: e.target.value })}
          className="text-[11px] bg-white/5 border border-white/10 rounded px-1.5 py-1 text-white/70 outline-none cursor-pointer hover:border-white/25"
          title="Move"
        >
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s} className="bg-zinc-800">
              {COLUMNS.find((c) => c.key === s)?.label}
            </option>
          ))}
        </select>
        <button onClick={onOpen} className="text-[11px] text-white/40 hover:text-white/70 transition-colors">
          Details →
        </button>
      </div>
    </div>
  );
}

function DetailModal({
  item,
  onClose,
  onPatch,
}: {
  item: FeedbackItem;
  onClose: () => void;
  onPatch: (id: number, body: Record<string, unknown>) => void;
}) {
  const [owner, setOwner] = useState(item.assigned_owner ?? '');
  const [pr, setPr] = useState(item.linked_pr ?? '');
  const [notes, setNotes] = useState(item.notes ?? '');
  const [status, setStatus] = useState(item.status);
  const reviewed = !!item.reviewed_at;
  const cat = CATEGORY_META[item.category] ?? { label: item.category, badge: 'bg-white/10 text-white/60 border-white/20' };

  const save = () => {
    onPatch(item.id, {
      status,
      assignedOwner: owner,
      linkedPr: pr,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-white/12 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${cat.badge}`}>{cat.label}</span>
            <span className="text-xs text-white/35">#{item.id} · {timeAgo(item.created_at)}</span>
            {reviewed && (
              <span className="text-[11px] text-green-300/80">
                ✓ reviewed{item.reviewed_by ? ` by ${item.reviewed_by}` : ''}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-white/85 whitespace-pre-wrap">
            {item.message || <span className="text-white/30 italic">(screenshot only — no description)</span>}
          </p>

          {item.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.attachments.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.url}
                    alt={a.filename}
                    className="max-h-48 max-w-[16rem] rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                  />
                </a>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Field label="Reporter" value={item.user_name || 'Anonymous'} />
            <Field label="Device / browser" value={parseUA(item.user_agent)} />
            <Field
              label="URL"
              value={item.url || '—'}
              href={item.url || undefined}
            />
            <Field label="User ID" value={item.user_id || '—'} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white/85 outline-none focus:border-amber-500/40"
              >
                {STATUS_KEYS.map((s) => (
                  <option key={s} value={s} className="bg-zinc-800">
                    {COLUMNS.find((c) => c.key === s)?.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => onPatch(item.id, { reviewed: !reviewed })}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  reviewed
                    ? 'bg-green-500/15 text-green-300 border-green-500/30'
                    : 'text-white/55 border-white/15 hover:border-green-400/40'
                }`}
              >
                {reviewed ? '✓ Reviewed' : 'Mark reviewed'}
              </button>
            </div>
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Assigned owner</label>
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="name / handle"
                className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white/85 placeholder-white/25 outline-none focus:border-amber-500/40"
              />
            </div>
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Linked PR</label>
              <input
                value={pr}
                onChange={(e) => setPr(e.target.value)}
                placeholder="#418 or URL"
                className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white/85 placeholder-white/25 outline-none focus:border-amber-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1">Internal notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Triage notes (team-only)…"
              className="w-full text-sm bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-white/85 placeholder-white/25 outline-none focus:border-amber-500/40 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10 sticky bottom-0 bg-zinc-900">
          <button onClick={onClose} className="text-xs px-4 py-2 rounded-lg text-white/50 hover:text-white/80 transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            className="text-xs px-4 py-2 rounded-lg bg-amber-500/80 text-black font-medium hover:bg-amber-400 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <div className="text-[11px] text-white/40 mb-0.5">{label}</div>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-blue-300/80 hover:text-blue-200 break-all">
          {value}
        </a>
      ) : (
        <div className="text-white/75 break-all">{value}</div>
      )}
    </div>
  );
}
