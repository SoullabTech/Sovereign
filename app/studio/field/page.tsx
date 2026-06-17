'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wind, Scale, BookOpen, Calendar, CheckSquare, Mic,
  ChevronRight, RefreshCw, Flame, Compass, Sprout, Heart, Plus, X, Pencil, ArrowRightLeft,
  Sparkles, Users, ArrowRight, CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { useTeamContext } from '@/hooks/useStudioData';

// ─────────────────────────────────────────────────────────────────────────────
// EXPLORATORY LANDSCAPE — the Personal Studio home (Approach B)
//
// The full home for the team to explore: greeting + person-set inner weather +
// a Reflect-with-MAIA entry + the four-question floor as vivid cards (with Field
// Notes: place / move / edit / remove) + honest placeholders for the imagined
// panels (Today, People) + a Navigate strip.
//
// Oath guard: the person authors; MAIA never infers or decides their attention.
// Inner weather is person-TAPPED (persisted locally), never inferred. Placeholder
// panels are clearly imagined, not faked data.
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

const FLOOR: FloorQuestion[] = [
  { key: 'alive',    question: 'What is alive?',                icon: Flame,   accent: 'amber',   empty: 'Quiet here.',               placeholder: 'Name what’s alive…' },
  { key: 'asking',   question: 'What is asking for attention?', icon: Compass, accent: 'blue',    empty: 'Nothing you’ve marked.',    placeholder: 'What’s asking for your attention?' },
  { key: 'emerging', question: 'What is emerging?',             icon: Sprout,  accent: 'emerald', empty: 'Nothing new taking shape.', placeholder: 'What’s taking shape?' },
  { key: 'tending',  question: 'What are you tending?',         icon: Heart,   accent: 'purple',  empty: 'Nothing in motion.',        placeholder: 'What are you tending?' },
];

// Inner weather — person-TAPPED only. The system never infers it.
const WEATHER = ['Grounded', 'Restless', 'Stretched', 'Curious', 'Tender', 'Open'];

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
  const [name, setName] = useState('');
  const [dayLabel, setDayLabel] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const { currentTeamId, includePersonal } = useTeamContext();

  useEffect(() => {
    setName(getDisplayName());
    try {
      const d = new Date();
      setDayLabel(`${d.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase()} · ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`);
    } catch { /* best effort */ }
  }, []);

  const fetchFloor = useCallback(async (isRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (isRefresh) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (currentTeamId) params.set('teamId', currentTeamId);
      params.set('includePersonal', String(includePersonal));
      const res = await apiFetch(`/api/studio/field/pulse?${params.toString()}`, { signal: controller.signal });
      if (res.ok && !controller.signal.aborted) setFloor(await res.json());
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); }
    }
  }, [currentTeamId, includePersonal]);

  useEffect(() => {
    fetchFloor();
    return () => { abortRef.current?.abort(); };
  }, [fetchFloor]);

  const addNote = useCallback(async (section: FloorKey, body: string) => {
    try {
      await apiFetch('/api/studio/field/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, body, teamId: currentTeamId ?? undefined }),
      });
    } catch { /* best effort */ }
    await fetchFloor(true);
  }, [currentTeamId, fetchFloor]);

  const removeNote = useCallback(async (noteId: string) => {
    try { await apiFetch(`/api/studio/field/notes/${noteId}`, { method: 'DELETE' }); } catch { /* best effort */ }
    await fetchFloor(true);
  }, [fetchFloor]);

  const editNote = useCallback(async (noteId: string, body: string) => {
    try {
      await apiFetch(`/api/studio/field/notes/${noteId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }),
      });
    } catch { /* best effort */ }
    await fetchFloor(true);
  }, [fetchFloor]);

  // Migration: section is state, not shape — identity + created_at persist.
  const moveNote = useCallback(async (noteId: string, section: FloorKey) => {
    try {
      await apiFetch(`/api/studio/field/notes/${noteId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }),
      });
    } catch { /* best effort */ }
    await fetchFloor(true);
  }, [fetchFloor]);

  const greet = getGreetWord();

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              {dayLabel && <p className="text-slate-500 text-xs tracking-wider uppercase mb-2">{dayLabel}</p>}
              <h1 className="text-3xl font-light text-white mb-1">Good {greet}{name ? `, ${name}` : ''}</h1>
              <p className="text-slate-400">What is alive in your field.</p>
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

        {/* Inner weather — person-set */}
        <WeatherStrip />

        {/* Reflect with MAIA — entry into the companion */}
        <MaiaReflect />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* The four questions — vivid cards, with Field Notes */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {FLOOR.map((q) => (
                <FloorCard
                  key={q.key}
                  question={q}
                  items={floor?.[q.key] ?? []}
                  onAdd={addNote}
                  onRemove={removeNote}
                  onEdit={editNote}
                  onMove={moveNote}
                />
              ))}
            </div>

            {/* Today (day calendar) + People — person-authored, real */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <TodayPanel teamId={currentTeamId} includePersonal={includePersonal} />
              <PeoplePanel teamId={currentTeamId} includePersonal={includePersonal} />
            </div>

            {/* Navigate — person-initiated; never injected into the field */}
            <section>
              <h2 className="text-sm text-slate-500 uppercase tracking-wider mb-3">Navigate</h2>
              <div className="flex flex-wrap gap-2">
                <NavChip href="/studio/changes" icon={Wind} label="Changes" />
                <NavChip href="/studio/decisions" icon={Scale} label="Decisions" />
                <NavChip href="/studio/scribe" icon={Mic} label="Scribe" />
                <NavChip href="/studio/calendar" icon={Calendar} label="Calendar" />
                <NavChip href="/studio/tasks" icon={CheckSquare} label="Tasks" />
                <NavChip href="/studio/vault" icon={BookOpen} label="Vault" />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner weather — person-tapped (never inferred); persisted per device
// ─────────────────────────────────────────────────────────────────────────────

function WeatherStrip() {
  const [weather, setWeather] = useState<string | null>(null);
  useEffect(() => {
    try { setWeather(localStorage.getItem('studio:fieldWeather')); } catch { /* best effort */ }
  }, []);
  const pick = (w: string) => {
    const next = weather === w ? null : w; // tap again to clear
    setWeather(next);
    try {
      if (next) localStorage.setItem('studio:fieldWeather', next);
      else localStorage.removeItem('studio:fieldWeather');
    } catch { /* best effort */ }
  };
  return (
    <div className="mb-8">
      <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Inner weather</p>
      <div className="flex flex-wrap gap-2">
        {WEATHER.map((w) => (
          <button
            key={w}
            onClick={() => pick(w)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              weather === w
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reflect with MAIA — the entry into the companion
// ─────────────────────────────────────────────────────────────────────────────

function MaiaReflect() {
  return (
    <Link
      href="/studio/maia"
      className="group block mb-10 rounded-xl bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 border border-white/10 hover:border-white/20 transition p-4"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-white/90 text-sm font-medium">What’s most alive today?</div>
          <div className="text-slate-400 text-xs">Reflect with MAIA</div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition shrink-0" />
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Floor card — one question as a card + its items + a quiet invitation to place
// ─────────────────────────────────────────────────────────────────────────────

function FloorCard({
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
    <section className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col">
      <h2 className={`text-sm uppercase tracking-wider mb-4 flex items-center gap-2 ${isEmpty ? 'text-slate-600' : 'text-slate-400'}`}>
        <Icon className={`w-4 h-4 ${isEmpty ? 'text-slate-600' : ACCENT_TEXT[question.accent]}`} />
        {question.question}
      </h2>
      {isEmpty ? (
        <p className="text-sm text-slate-600 pl-1">{question.empty}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <FloorItemCard key={item.id} item={item} accent={question.accent} currentSection={question.key} onRemove={onRemove} onEdit={onEdit} onMove={onMove} />
          ))}
          {items.length > 5 && (
            <p className="text-xs text-slate-600 mt-2 pl-1">+{items.length - 5} more</p>
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
            <button onClick={save} disabled={saving || !draft.trim()} className={`px-3 py-1.5 rounded-lg text-sm bg-white/10 ${ACCENT_TEXT[accent]} hover:bg-white/15 transition disabled:opacity-40`}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => { setDraft(item.title); setEditing(false); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
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
            <button onClick={() => setMoving(false)} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
          </div>
        </div>
      );
    }
    return (
      <div className={`group relative block pl-4 pr-20 py-3 rounded-lg bg-white/[0.03] border border-white/5 border-l-2 ${ACCENT_BORDER[accent] ?? ''}`}>
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{item.title}</p>
        {item.context && (<p className="text-[11px] text-slate-500 mt-1">{item.context}</p>)}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          {onEdit && (
            <button onClick={() => { setDraft(item.title); setEditing(true); }} className="p-1 rounded text-slate-600 hover:text-slate-300 transition" title="Edit this note" aria-label="Edit this note">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onMove && (
            <button onClick={() => setMoving(true)} className="p-1 rounded text-slate-600 hover:text-slate-300 transition" title="Move to another question" aria-label="Move to another question">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {onRemove && (
            <button onClick={() => onRemove(item.sourceId)} className="p-1 rounded text-slate-600 hover:text-slate-300 transition" title="Remove this note" aria-label="Remove this note">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
  // Derived item — a link back to the change/decision it came from.
  return (
    <Link href={item.href ?? '#'} className={`block pl-4 pr-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 border-l-2 ${ACCENT_BORDER[accent] ?? ''} hover:bg-white/5 transition`}>
      <p className="text-white/90 text-sm leading-relaxed">{item.title}</p>
      {item.context && (<p className="text-[11px] text-slate-500 mt-1 truncate">{item.context}</p>)}
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
    try { await onAdd(section, body); close(); } finally { setSaving(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-2 pl-1 text-sm text-slate-600 hover:text-slate-400 transition">
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
        <button onClick={submit} disabled={saving || !text.trim()} className={`px-3 py-1.5 rounded-lg text-sm bg-white/10 ${ACCENT_TEXT[accent]} hover:bg-white/15 transition disabled:opacity-40`}>
          {saving ? 'Placing…' : 'Place'}
        </button>
        <button onClick={close} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Today — the person's day calendar (person-authored; the system never schedules)
// ─────────────────────────────────────────────────────────────────────────────

function TodayPanel({ teamId, includePersonal }: { teamId: string | null; includePersonal: boolean }) {
  const [events, setEvents] = useState<{ id: string; title: string; event_at: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (teamId) p.set('teamId', teamId);
      p.set('includePersonal', String(includePersonal));
      const res = await apiFetch(`/api/studio/field/events?${p.toString()}`);
      if (res.ok) { const d = await res.json(); setEvents(d.events ?? []); }
    } catch { /* orientation surface — fail quiet */ }
  }, [teamId, includePersonal]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const t = title.trim();
    if (!t || !time || saving) return;
    setSaving(true);
    const [hh, mm] = time.split(':');
    const when = new Date();
    when.setHours(Number(hh) || 0, Number(mm) || 0, 0, 0);
    try {
      await apiFetch('/api/studio/field/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, eventAt: when.toISOString(), teamId: teamId ?? undefined }),
      });
      setTitle(''); setTime(''); setOpen(false);
    } catch { /* best effort */ } finally { setSaving(false); }
    await load();
  };
  const remove = async (id: string) => {
    try { await apiFetch(`/api/studio/field/events/${id}`, { method: 'DELETE' }); } catch { /* */ }
    await load();
  };
  const fmt = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); } catch { return ''; }
  };

  return (
    <section className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col">
      <h2 className="text-sm text-slate-400 flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-slate-500" />
        Today
      </h2>
      {events.length === 0 ? (
        <p className="text-sm text-slate-600">Nothing on your calendar today.</p>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.id} className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-xs text-slate-500 tabular-nums w-16 shrink-0">{fmt(e.event_at)}</span>
              <span className="text-white/90 text-sm flex-1 min-w-0 truncate">{e.title}</span>
              <button onClick={() => remove(e.id)} className="p-1 rounded text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300 transition" aria-label="Remove event">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {open ? (
        <div className="mt-3 space-y-2">
          <input
            autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="What’s happening?"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20"
          />
          <input
            type="time" value={time} onChange={(e) => setTime(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm focus:outline-none focus:border-white/20"
          />
          <div className="flex items-center gap-2">
            <button onClick={add} disabled={saving || !title.trim() || !time} className="px-3 py-1.5 rounded-lg text-sm bg-white/10 text-slate-200 hover:bg-white/15 transition disabled:opacity-40">
              {saving ? 'Adding…' : 'Add'}
            </button>
            <button onClick={() => { setOpen(false); setTitle(''); setTime(''); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-2 pl-1 text-sm text-slate-600 hover:text-slate-400 transition">
          <Plus className="w-3.5 h-3.5" />
          Add to today
        </button>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// People — those the person is tending (person-authored; never inferred)
// ─────────────────────────────────────────────────────────────────────────────

function PeoplePanel({ teamId, includePersonal }: { teamId: string | null; includePersonal: boolean }) {
  const [people, setPeople] = useState<{ id: string; name: string; note: string | null }[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (teamId) p.set('teamId', teamId);
      p.set('includePersonal', String(includePersonal));
      const res = await apiFetch(`/api/studio/field/people?${p.toString()}`);
      if (res.ok) { const d = await res.json(); setPeople(d.people ?? []); }
    } catch { /* fail quiet */ }
  }, [teamId, includePersonal]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const n = name.trim();
    if (!n || saving) return;
    setSaving(true);
    try {
      await apiFetch('/api/studio/field/people', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, note: note.trim() || undefined, teamId: teamId ?? undefined }),
      });
      setName(''); setNote(''); setOpen(false);
    } catch { /* best effort */ } finally { setSaving(false); }
    await load();
  };
  const remove = async (id: string) => {
    try { await apiFetch(`/api/studio/field/people/${id}`, { method: 'DELETE' }); } catch { /* */ }
    await load();
  };

  return (
    <section className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col">
      <h2 className="text-sm text-slate-400 flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-slate-500" />
        People
      </h2>
      {people.length === 0 ? (
        <p className="text-sm text-slate-600">No one yet — name who you’re tending to.</p>
      ) : (
        <div className="space-y-2">
          {people.map((pp) => (
            <div key={pp.id} className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="flex-1 min-w-0">
                <div className="text-white/90 text-sm truncate">{pp.name}</div>
                {pp.note && <div className="text-[11px] text-slate-500 truncate">{pp.note}</div>}
              </div>
              <button onClick={() => remove(pp.id)} className="p-1 rounded text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-300 transition" aria-label="Remove person">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {open ? (
        <div className="mt-3 space-y-2">
          <input
            autoFocus value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Who are you tending to?"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20"
          />
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="A note (optional)"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20"
          />
          <div className="flex items-center gap-2">
            <button onClick={add} disabled={saving || !name.trim()} className="px-3 py-1.5 rounded-lg text-sm bg-white/10 text-slate-200 hover:bg-white/15 transition disabled:opacity-40">
              {saving ? 'Adding…' : 'Add'}
            </button>
            <button onClick={() => { setOpen(false); setName(''); setNote(''); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-2 pl-1 text-sm text-slate-600 hover:text-slate-400 transition">
          <Plus className="w-3.5 h-3.5" />
          Add someone
        </button>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigate chip
// ─────────────────────────────────────────────────────────────────────────────

function NavChip({
  href, icon: Icon, label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition text-sm">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getGreetWord(): string {
  const h = new Date().getHours();
  if (h < 6) return 'evening';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getDisplayName(): string {
  if (typeof window === 'undefined') return '';
  try {
    const bu = localStorage.getItem('beta_user');
    if (bu) {
      const u = JSON.parse(bu);
      const n = (u.preferredName || u.name || '').trim();
      if (n) return n.split(' ')[0];
    }
    const alt = (localStorage.getItem('explorerPreferredName') || localStorage.getItem('explorerName') || '').trim();
    return alt ? alt.split(' ')[0] : '';
  } catch {
    return '';
  }
}
