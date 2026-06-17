'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wind, Scale, BookOpen, Calendar, CheckSquare, Mic,
  ChevronRight, RefreshCw, Flame, Compass, Sprout, Heart, Plus, X, Pencil, ArrowRightLeft,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { useTeamContext } from '@/hooks/useStudioData';

// ─────────────────────────────────────────────────────────────────────────────
// Types — the orientation floor (four questions over the person's own content)
// ─────────────────────────────────────────────────────────────────────────────

interface FloorItem {
  id: string;
  source: 'change' | 'decision' | 'note';
  sourceId: string;
  title: string;
  context?: string;
  href?: string;       // omitted for authored notes (they live in the field, not behind a door)
  createdAt: string;
}

interface FieldFloor {
  alive: FloorItem[];
  asking: FloorItem[];
  emerging: FloorItem[];
  tending: FloorItem[];
}

type FloorKey = keyof FieldFloor;

interface FloorQuestion {
  key: FloorKey;
  question: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'amber' | 'blue' | 'emerald' | 'purple';
  empty: string;
  placeholder: string;   // human invitation to place a note here — never "+ New task"
}

// The fixed floor. These four questions are the stable frame — they remain
// present even when a bucket is empty (the recognizable point of return).
// The floor holds room; it never tells the person what matters most.
const FLOOR: FloorQuestion[] = [
  { key: 'alive',    question: 'What is alive?',                icon: Flame,   accent: 'amber',   empty: 'Quiet here.',               placeholder: 'Name what’s alive…' },
  { key: 'asking',   question: 'What is asking for attention?', icon: Compass, accent: 'blue',    empty: 'Nothing you’ve marked.',    placeholder: 'What’s asking for your attention?' },
  { key: 'emerging', question: 'What is emerging?',             icon: Sprout,  accent: 'emerald', empty: 'Nothing new taking shape.', placeholder: 'What’s taking shape?' },
  { key: 'tending',  question: 'What are you tending?',         icon: Heart,   accent: 'purple',  empty: 'Nothing in motion.',        placeholder: 'What are you tending?' },
];

const ACCENT_TEXT: Record<string, string> = {
  amber: 'text-amber-400', blue: 'text-blue-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
};
const ACCENT_BORDER: Record<string, string> = {
  amber: 'border-l-amber-500/40', blue: 'border-l-blue-500/40', emerald: 'border-l-emerald-500/40', purple: 'border-l-purple-500/40',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FieldPage() {
  const [floor, setFloor] = useState<FieldFloor | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { currentTeamId, includePersonal } = useTeamContext();

  const fetchFloor = useCallback(async (isRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (isRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (currentTeamId) params.set('teamId', currentTeamId);
      params.set('includePersonal', String(includePersonal));
      const res = await apiFetch(`/api/studio/field/pulse?${params.toString()}`, {
        signal: controller.signal,
      });
      if (res.ok && !controller.signal.aborted) {
        setFloor(await res.json());
      }
    } catch (err) {
      // Orientation is not critical — ignore aborts, fail quiet on the rest.
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [currentTeamId, includePersonal]);

  useEffect(() => {
    fetchFloor();
    return () => { abortRef.current?.abort(); };
  }, [fetchFloor]);

  // Authoring: place a note into a question, or take one back out. Best-effort —
  // a failed write should never throw into the orientation surface.
  const addNote = useCallback(async (section: FloorKey, body: string) => {
    try {
      await apiFetch('/api/studio/field/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, body, teamId: currentTeamId ?? undefined }),
      });
    } catch { /* best effort */ }
    await fetchFloor(true);
  }, [currentTeamId, fetchFloor]);

  const removeNote = useCallback(async (noteId: string) => {
    try {
      await apiFetch(`/api/studio/field/notes/${noteId}`, { method: 'DELETE' });
    } catch { /* best effort */ }
    await fetchFloor(true);
  }, [fetchFloor]);

  const editNote = useCallback(async (noteId: string, body: string) => {
    try {
      await apiFetch(`/api/studio/field/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
    } catch { /* best effort */ }
    await fetchFloor(true);
  }, [fetchFloor]);

  // Migration: move a note to a different question. Section is state, not shape —
  // identity + created_at persist (we observe the move out-of-band; no audit trail).
  const moveNote = useCallback(async (noteId: string, section: FloorKey) => {
    try {
      await apiFetch(`/api/studio/field/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      });
    } catch { /* best effort */ }
    await fetchFloor(true);
  }, [fetchFloor]);

  const greeting = getGreeting();
  const total = floor
    ? floor.alive.length + floor.asking.length + floor.emerging.length + floor.tending.length
    : 0;
  const allQuiet = !loading && total === 0;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-sm tracking-wider uppercase mb-2">{greeting.label}</p>
              <h1 className="text-3xl font-light text-white mb-2">Field</h1>
              <p className="text-slate-400">
                {allQuiet ? 'Room for whatever’s here.' : 'What is alive right now.'}
              </p>
            </div>
            {!loading && (
              <button
                onClick={() => fetchFloor(true)}
                disabled={refreshing}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* The fixed orientation floor — four questions, always present */}
            {FLOOR.map((q) => (
              <FloorSection
                key={q.key}
                question={q}
                items={floor?.[q.key] ?? []}
                onAdd={addNote}
                onRemove={removeNote}
                onEdit={editNote}
                onMove={moveNote}
              />
            ))}

            {/* Navigate — demoted, person-initiated; never injected into the field */}
            <section className="mt-2">
              <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-3">Navigate</h2>
              <div className="space-y-2">
                <FieldCard href="/studio/changes" icon={Wind} title="Changes" subtitle="Navigate what is shifting" accent="amber" />
                <FieldCard href="/studio/decisions" icon={Scale} title="Decisions" subtitle="Clarify what needs choosing" accent="blue" />
                <FieldCard href="/studio/scribe" icon={Mic} title="Scribe" subtitle="Speak what needs to be heard" accent="emerald" />
                <FieldCard href="/studio/vault" icon={BookOpen} title="Vault" subtitle="Private notes and reflections" accent="purple" />
                <FieldCard href="/studio/calendar" icon={Calendar} title="Calendar" subtitle="What is coming" accent="slate" />
                <FieldCard href="/studio/tasks" icon={CheckSquare} title="Tasks" subtitle="What needs doing" accent="slate" />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Floor section — one question + its items + a quiet invitation to place a note
// ─────────────────────────────────────────────────────────────────────────────

function FloorSection({
  question, items, onAdd, onRemove, onEdit, onMove,
}: {
  question: FloorQuestion;
  items: FloorItem[];
  onAdd: (section: FloorKey, body: string) => Promise<void>;
  onRemove: (id: string) => void;
  onEdit: (id: string, body: string) => Promise<void>;
  onMove: (id: string, section: FloorKey) => Promise<void>;
}) {
  const Icon = question.icon;
  const isEmpty = items.length === 0;
  return (
    <section className="mb-10">
      <h2 className={`text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${isEmpty ? 'text-slate-600' : 'text-slate-500'}`}>
        <Icon className={`w-4 h-4 ${isEmpty ? 'text-slate-600' : ACCENT_TEXT[question.accent]}`} />
        {question.question}
      </h2>
      {isEmpty ? (
        <p className="text-sm text-slate-600 pl-1">{question.empty}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => (
            <FloorItemCard key={item.id} item={item} accent={question.accent} currentSection={question.key} onRemove={onRemove} onEdit={onEdit} onMove={onMove} />
          ))}
          {items.length > 6 && (
            <p className="text-xs text-slate-600 mt-2 pl-1">+{items.length - 6} more</p>
          )}
        </div>
      )}
      <AddNote section={question.key} placeholder={question.placeholder} accent={question.accent} onAdd={onAdd} />
    </section>
  );
}

function FloorItemCard({
  item, accent, currentSection, onRemove, onEdit, onMove,
}: {
  item: FloorItem;
  accent: string;
  currentSection?: FloorKey;
  onRemove?: (id: string) => void;
  onEdit?: (id: string, body: string) => Promise<void>;
  onMove?: (id: string, section: FloorKey) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);
  const [moveSaving, setMoveSaving] = useState(false);

  // Authored note — not a door to a tool; render it in place. The author keeps
  // stewardship of what they wrote (body-only edit), with a quiet remove.
  if (item.source === 'note') {
    if (editing && onEdit) {
      const save = async () => {
        const b = draft.trim();
        if (!b || saving) return;
        setSaving(true);
        try { await onEdit(item.sourceId, b); setEditing(false); } finally { setSaving(false); }
      };
      return (
        <div className={`block pl-4 pr-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 border-l-2 ${ACCENT_BORDER[accent] ?? ''}`}>
          <textarea
            autoFocus
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); }
              if (e.key === 'Escape') { setDraft(item.title); setEditing(false); }
            }}
            className="w-full bg-transparent text-white/90 text-sm leading-relaxed focus:outline-none resize-none"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={save}
              disabled={saving || !draft.trim()}
              className={`px-3 py-1.5 rounded-lg text-sm bg-white/10 ${ACCENT_TEXT[accent]} hover:bg-white/15 transition disabled:opacity-40`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setDraft(item.title); setEditing(false); }}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }
    if (moving && onMove) {
      const others = FLOOR.filter((q) => q.key !== currentSection);
      return (
        <div className={`block pl-4 pr-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 border-l-2 ${ACCENT_BORDER[accent] ?? ''}`}>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{item.title}</p>
          <p className="text-[11px] text-slate-500 mt-2 mb-1.5">Move to…</p>
          <div className="flex flex-wrap items-center gap-2">
            {others.map((q) => (
              <button
                key={q.key}
                onClick={async () => {
                  if (moveSaving) return;
                  setMoveSaving(true);
                  try { await onMove(item.sourceId, q.key); } finally { setMoveSaving(false); setMoving(false); }
                }}
                disabled={moveSaving}
                className={`px-3 py-1.5 rounded-lg text-sm bg-white/10 ${ACCENT_TEXT[q.accent]} hover:bg-white/15 transition disabled:opacity-40`}
              >
                {q.key.charAt(0).toUpperCase() + q.key.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setMoving(false)}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className={`group relative block pl-4 pr-20 py-3 rounded-lg bg-white/[0.03] border border-white/5 border-l-2 ${ACCENT_BORDER[accent] ?? ''}`}>
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{item.title}</p>
        {item.context && (
          <p className="text-[11px] text-slate-500 mt-1">{item.context}</p>
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          {onEdit && (
            <button
              onClick={() => { setDraft(item.title); setEditing(true); }}
              className="p-1 rounded text-slate-600 hover:text-slate-300 transition"
              title="Edit this note"
              aria-label="Edit this note"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onMove && (
            <button
              onClick={() => setMoving(true)}
              className="p-1 rounded text-slate-600 hover:text-slate-300 transition"
              title="Move to another question"
              aria-label="Move to another question"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(item.sourceId)}
              className="p-1 rounded text-slate-600 hover:text-slate-300 transition"
              title="Remove this note"
              aria-label="Remove this note"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
  // Derived item — a link back to the change/decision it came from.
  return (
    <Link
      href={item.href ?? '#'}
      className={`block pl-4 pr-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 border-l-2 ${ACCENT_BORDER[accent] ?? ''} hover:bg-white/5 transition`}
    >
      <p className="text-white/90 text-sm leading-relaxed">{item.title}</p>
      {item.context && (
        <p className="text-[11px] text-slate-500 mt-1 truncate">{item.context}</p>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add note — a small authored attention placed into this question
// ─────────────────────────────────────────────────────────────────────────────

function AddNote({
  section, placeholder, accent, onAdd,
}: {
  section: FloorKey;
  placeholder: string;
  accent: string;
  onAdd: (section: FloorKey, body: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => { setText(''); setOpen(false); };
  const submit = async () => {
    const body = text.trim();
    if (!body || saving) return;
    setSaving(true);
    try {
      await onAdd(section, body);
      close();
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-2 pl-1 text-sm text-slate-600 hover:text-slate-400 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{placeholder}</span>
      </button>
    );
  }

  return (
    <div className="mt-3">
      <textarea
        autoFocus
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') { close(); }
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={submit}
          disabled={saving || !text.trim()}
          className={`px-3 py-1.5 rounded-lg text-sm bg-white/10 ${ACCENT_TEXT[accent]} hover:bg-white/15 transition disabled:opacity-40`}
        >
          {saving ? 'Placing…' : 'Place'}
        </button>
        <button
          onClick={close}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation card (demoted)
// ─────────────────────────────────────────────────────────────────────────────

function FieldCard({
  href, icon: Icon, title, subtitle, accent = 'slate',
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  accent?: string;
}) {
  const accentColors: Record<string, string> = {
    amber: 'text-amber-400', blue: 'text-blue-400', emerald: 'text-emerald-400',
    purple: 'text-purple-400', slate: 'text-slate-400',
  };
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition group"
    >
      <Icon className={`w-4 h-4 ${accentColors[accent] ?? 'text-slate-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-white/80 text-sm">{title}</div>
        <div className="text-slate-600 text-xs">{subtitle}</div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 transition" />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Greeting
// ─────────────────────────────────────────────────────────────────────────────

function getGreeting(): { label: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { label: 'Still night' };
  if (hour < 12) return { label: 'Morning' };
  if (hour < 17) return { label: 'Afternoon' };
  if (hour < 21) return { label: 'Evening' };
  return { label: 'Night' };
}
