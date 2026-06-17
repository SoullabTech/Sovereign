'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame, AlertCircle, Sprout, Plus, X, GripVertical, RefreshCw, Sparkles, ArrowRight,
  CalendarDays, Users, Wind, Scale, FileText, Shuffle, CloudSun, Lightbulb, Pencil,
  ArrowRightLeft, Maximize2, Minimize2, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { useTeamContext } from '@/hooks/useStudioData';
import { FIELD_QUOTES, dailyIndex, type Mood } from '@/lib/studio/fieldQuotes';

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL FIELD — a workspace you work IN, not a directory that links away.
//
// Worked here, not elsewhere: a thin state strip (inner weather · quote · what
// inspires you) you set, Today + People at the top, and three CURATED fields you
// fill yourself — Important · Needs attention · Emerging — pulling in your Changes,
// Decisions, and free notes, with in-place add / subtract / move and drag-to-reorder.
//
// Oath guard: the person authors; MAIA never infers, ranks, or decides. Weather is
// person-tapped. The quote is OFFERED (you choose). Placement is CURATION — "Important"
// is your label, not a computed score. Nothing here is faked or system-significance.
// ─────────────────────────────────────────────────────────────────────────────

type FieldKey = 'important' | 'attention' | 'emerging';

interface AttentionItem {
  id: string;
  kind: 'change' | 'decision' | 'note';
  refId: string | null;
  label: string;
  href?: string;
  position: number;
  gone: boolean;
  createdAt: string;
}
type AttentionFields = Record<FieldKey, AttentionItem[]>;

interface PickOption { id: string; title: string; status: string }
interface Options { changes: PickOption[]; decisions: PickOption[] }

interface FieldDef {
  key: FieldKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  grad: string;     // header gradient
  ring: string;     // accent ring/border
  text: string;     // accent text
  empty: string;
}

const FIELD_DEFS: Record<FieldKey, FieldDef> = {
  important: { key: 'important', label: 'Important', icon: Flame, grad: 'from-amber-500/25 via-orange-500/10 to-transparent', ring: 'border-amber-500/30', text: 'text-amber-300', empty: 'What matters most right now? Place it here.' },
  attention: { key: 'attention', label: 'Needs attention', icon: AlertCircle, grad: 'from-rose-500/25 via-pink-500/10 to-transparent', ring: 'border-rose-500/30', text: 'text-rose-300', empty: 'What can’t wait? Pull it in.' },
  emerging:  { key: 'emerging',  label: 'Emerging', icon: Sprout, grad: 'from-emerald-500/25 via-teal-500/10 to-transparent', ring: 'border-emerald-500/30', text: 'text-emerald-300', empty: 'What’s taking shape? Name it here.' },
};
const FIELD_ORDER: FieldKey[] = ['important', 'attention', 'emerging'];

const WEATHER = ['Grounded', 'Restless', 'Stretched', 'Curious', 'Tender', 'Open'];

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  change: Wind, decision: Scale, note: FileText,
};
const KIND_LABEL: Record<string, string> = { change: 'Change', decision: 'Decision', note: 'Note' };

// ─────────────────────────────────────────────────────────────────────────────
// Drag-to-reorder — persisted per device (movable boxes, not static)
// ─────────────────────────────────────────────────────────────────────────────

function useReorder(storageKey: string, initial: string[]) {
  const [order, setOrder] = useState<string[]>(initial);
  const dragKey = useRef<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          const known = arr.filter((k: string) => initial.includes(k));
          const missing = initial.filter((k) => !known.includes(k));
          if (known.length) setOrder([...known, ...missing]);
        }
      }
    } catch { /* best effort */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  const persist = (next: string[]) => {
    setOrder(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* best effort */ }
  };
  const onDragStart = (k: string) => { dragKey.current = k; };
  const onDrop = (target: string) => {
    const from = dragKey.current; dragKey.current = null;
    if (!from || from === target) return;
    const next = [...order];
    const fi = next.indexOf(from); const ti = next.indexOf(target);
    if (fi < 0 || ti < 0) return;
    next.splice(fi, 1); next.splice(ti, 0, from);
    persist(next);
  };
  return { order, onDragStart, onDrop };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function FieldPage() {
  const [fields, setFields] = useState<AttentionFields>({ important: [], attention: [], emerging: [] });
  const [options, setOptions] = useState<Options>({ changes: [], decisions: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState('');
  const [dayLabel, setDayLabel] = useState('');
  const [weather, setWeather] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { currentTeamId, includePersonal } = useTeamContext();

  const fieldOrder = useReorder('studio:fieldOrder', FIELD_ORDER);
  const topOrder = useReorder('studio:topOrder', ['today', 'people']);

  useEffect(() => {
    setName(getDisplayName());
    try {
      const d = new Date();
      setDayLabel(`${d.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase()} · ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`);
      setWeather(localStorage.getItem('studio:fieldWeather'));
    } catch { /* best effort */ }
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (isRefresh) setRefreshing(true);
    try {
      const p = new URLSearchParams();
      if (currentTeamId) p.set('teamId', currentTeamId);
      p.set('includePersonal', String(includePersonal));
      const qs = p.toString();
      const [aRes, oRes] = await Promise.all([
        apiFetch(`/api/studio/field/attention?${qs}`, { signal: controller.signal }),
        apiFetch(`/api/studio/field/attention/options?${qs}`, { signal: controller.signal }),
      ]);
      if (!controller.signal.aborted) {
        if (aRes.ok) setFields(await aRes.json());
        if (oRes.ok) setOptions(await oRes.json());
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    } finally {
      if (!controller.signal.aborted) { setLoading(false); setRefreshing(false); }
    }
  }, [currentTeamId, includePersonal]);

  useEffect(() => { load(); return () => abortRef.current?.abort(); }, [load]);

  const place = useCallback(async (field: FieldKey, kind: AttentionItem['kind'], label: string, refId?: string) => {
    try {
      await apiFetch('/api/studio/field/attention', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, kind, label, refId, teamId: currentTeamId ?? undefined }),
      });
    } catch { /* best effort */ }
    await load(true);
  }, [currentTeamId, load]);

  const remove = useCallback(async (id: string) => {
    try { await apiFetch(`/api/studio/field/attention/${id}`, { method: 'DELETE' }); } catch { /* */ }
    await load(true);
  }, [load]);

  const move = useCallback(async (id: string, field: FieldKey) => {
    try {
      await apiFetch(`/api/studio/field/attention/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ field }),
      });
    } catch { /* */ }
    await load(true);
  }, [load]);

  const setWeatherPersist = useCallback((w: string | null) => {
    setWeather(w);
    try {
      if (w) localStorage.setItem('studio:fieldWeather', w);
      else localStorage.removeItem('studio:fieldWeather');
    } catch { /* best effort */ }
  }, []);

  const greet = getGreetWord();

  const topPanels: Record<string, React.ReactNode> = {
    today: <TodayPanel teamId={currentTeamId} includePersonal={includePersonal} />,
    people: <PeoplePanel teamId={currentTeamId} includePersonal={includePersonal} />,
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-5 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            {dayLabel && <p className="text-slate-500 text-xs tracking-wider uppercase mb-2">{dayLabel}</p>}
            <h1 className="text-3xl font-light text-white mb-1">Good {greet}{name ? `, ${name}` : ''}</h1>
            <p className="text-slate-400">Your field — tend it here.</p>
          </div>
          {!loading && (
            <button onClick={() => load(true)} disabled={refreshing} title="Refresh"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* State strip — three states in a row, all else around them */}
        <div className="grid gap-3 md:grid-cols-3 mb-6">
          <WeatherCell weather={weather} onPick={setWeatherPersist} />
          <QuoteCell weather={weather} />
          <InspiresCell />
        </div>

        {/* Reflect with MAIA — entry into the companion (still in-page) */}
        <MaiaReflect />

        {/* Today + People — at the top, movable */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {topOrder.order.map((k) => (
            <div key={k}
              draggable
              onDragStart={() => topOrder.onDragStart(k)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => topOrder.onDrop(k)}>
              {topPanels[k]}
            </div>
          ))}
        </div>

        {/* Three curated fields — the workspace centerpiece */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3 items-start">
            {fieldOrder.order.map((k) => {
              const def = FIELD_DEFS[k as FieldKey];
              return (
                <AttentionFieldCard
                  key={k}
                  def={def}
                  items={fields[k as FieldKey] ?? []}
                  options={options}
                  onPlace={place}
                  onRemove={remove}
                  onMove={move}
                  onDragStart={() => fieldOrder.onDragStart(k)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => fieldOrder.onDrop(k)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// State strip cells
// ─────────────────────────────────────────────────────────────────────────────

function StateShell({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 flex flex-col min-h-[112px]">
      <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {title}
      </p>
      {children}
    </div>
  );
}

function WeatherCell({ weather, onPick }: { weather: string | null; onPick: (w: string | null) => void }) {
  const [customs, setCustoms] = useState<string[]>([]);
  const [naming, setNaming] = useState(false);
  const [draft, setDraft] = useState('');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('studio:fieldWeatherCustom');
      if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) setCustoms(a.filter((x) => typeof x === 'string')); }
    } catch { /* best effort */ }
  }, []);
  const saveCustom = () => {
    const v = draft.trim();
    if (!v) { setNaming(false); return; }
    const next = Array.from(new Set([...customs, v])).slice(-6);
    setCustoms(next);
    try { localStorage.setItem('studio:fieldWeatherCustom', JSON.stringify(next)); } catch { /* */ }
    onPick(v); setDraft(''); setNaming(false);
  };
  const pick = (w: string) => onPick(weather === w ? null : w);
  const all = [...WEATHER, ...customs.filter((c) => !WEATHER.includes(c))];
  return (
    <StateShell icon={CloudSun} title="Inner weather">
      <div className="flex flex-wrap gap-1.5">
        {all.map((w) => (
          <button key={w} onClick={() => pick(w)}
            className={`px-2.5 py-1 rounded-full text-xs border transition ${
              weather === w ? 'bg-white/15 border-white/30 text-white' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}>
            {w}
          </button>
        ))}
        {naming ? (
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveCustom(); if (e.key === 'Escape') { setDraft(''); setNaming(false); } }}
            onBlur={saveCustom} placeholder="name it…"
            className="px-2.5 py-1 rounded-full text-xs bg-white/[0.04] border border-white/20 text-white/90 placeholder-slate-600 focus:outline-none w-24" />
        ) : (
          <button onClick={() => setNaming(true)}
            className="px-2.5 py-1 rounded-full text-xs border border-dashed border-white/15 text-slate-500 hover:text-slate-300 hover:border-white/30 transition flex items-center gap-1">
            <Plus className="w-3 h-3" /> Other
          </button>
        )}
      </div>
    </StateShell>
  );
}

function QuoteCell({ weather }: { weather: string | null }) {
  const [idx, setIdx] = useState<number | null>(null);
  const daySeed = (() => { try { return new Date().toISOString().slice(0, 10); } catch { return 'seed'; } })();
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`studio:fieldQuote:${daySeed}`);
      if (saved !== null) { const n = Number(saved); if (Number.isFinite(n) && n >= 0 && n < FIELD_QUOTES.length) { setIdx(n); return; } }
    } catch { /* */ }
    setIdx(dailyIndex(daySeed, FIELD_QUOTES.length));
  }, [daySeed]);
  const set = (n: number) => {
    setIdx(n);
    try { localStorage.setItem(`studio:fieldQuote:${daySeed}`, String(n)); } catch { /* */ }
  };
  const surprise = () => { if (FIELD_QUOTES.length) set(Math.floor(Math.random() * FIELD_QUOTES.length)); };
  const forWeather = () => {
    if (!weather) return;
    const matches = FIELD_QUOTES.map((q, i) => ({ q, i })).filter(({ q }) => q.moods.includes(weather as Mood) || q.moods.includes('any'));
    if (matches.length) set(matches[Math.floor(Math.random() * matches.length)].i);
  };
  const q = idx !== null ? FIELD_QUOTES[idx] : null;
  return (
    <StateShell icon={Sparkles} title="Quote of the day">
      <div className="flex-1 flex flex-col justify-between gap-2">
        {q ? (
          <p className="text-sm text-white/85 leading-snug">
            “{q.text}”{q.by && <span className="text-slate-500 text-xs"> — {q.by}</span>}
          </p>
        ) : <p className="text-sm text-slate-600">…</p>}
        <div className="flex items-center gap-2">
          <button onClick={surprise} title="Surprise me" className="text-[11px] text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
            <Shuffle className="w-3 h-3" /> Surprise
          </button>
          {weather && (
            <button onClick={forWeather} title={`For feeling ${weather}`} className="text-[11px] text-slate-500 hover:text-slate-300 transition flex items-center gap-1">
              <CloudSun className="w-3 h-3" /> For your weather
            </button>
          )}
        </div>
      </div>
    </StateShell>
  );
}

function InspiresCell() {
  const daySeed = (() => { try { return new Date().toISOString().slice(0, 10); } catch { return 'seed'; } })();
  const key = `studio:inspires:${daySeed}`;
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  useEffect(() => {
    try { setText(localStorage.getItem(key) || ''); } catch { /* */ }
  }, [key]);
  const save = () => {
    const v = draft.trim();
    setText(v);
    try { if (v) localStorage.setItem(key, v); else localStorage.removeItem(key); } catch { /* */ }
    setEditing(false);
  };
  return (
    <StateShell icon={Lightbulb} title="What inspires you today">
      {editing ? (
        <div className="flex-1 flex flex-col gap-2">
          <textarea autoFocus rows={2} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } if (e.key === 'Escape') setEditing(false); }}
            placeholder="A person, an idea, a line…"
            className="w-full bg-white/[0.04] border border-white/15 rounded-lg px-2.5 py-1.5 text-sm text-white/90 placeholder-slate-600 focus:outline-none resize-none" />
          <div className="flex gap-2">
            <button onClick={save} className="text-[11px] text-amber-300 hover:text-amber-200">Save</button>
            <button onClick={() => setEditing(false)} className="text-[11px] text-slate-500 hover:text-slate-300">Cancel</button>
          </div>
        </div>
      ) : text ? (
        <button onClick={() => { setDraft(text); setEditing(true); }} className="text-left group flex-1">
          <p className="text-sm text-white/85 leading-snug group-hover:text-white transition">{text}</p>
          <span className="text-[11px] text-slate-600 group-hover:text-slate-400 transition">edit</span>
        </button>
      ) : (
        <button onClick={() => { setDraft(''); setEditing(true); }}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-400 transition">
          <Plus className="w-3.5 h-3.5" /> Name it
        </button>
      )}
    </StateShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reflect with MAIA
// ─────────────────────────────────────────────────────────────────────────────

function MaiaReflect() {
  return (
    <Link href="/studio/maia"
      className="group flex items-center gap-3 mb-8 rounded-xl bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 border border-white/10 hover:border-white/20 transition p-3.5">
      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-white/90 text-sm font-medium">What’s most alive today?</div>
        <div className="text-slate-400 text-xs">Reflect with MAIA</div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition shrink-0" />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Curated field card — vivid header, scrollable/expandable body, in-place add/subtract
// ─────────────────────────────────────────────────────────────────────────────

function AttentionFieldCard({
  def, items, options, onPlace, onRemove, onMove, onDragStart, onDragOver, onDrop,
}: {
  def: FieldDef;
  items: AttentionItem[];
  options: Options;
  onPlace: (field: FieldKey, kind: AttentionItem['kind'], label: string, refId?: string) => Promise<void>;
  onRemove: (id: string) => void;
  onMove: (id: string, field: FieldKey) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const Icon = def.icon;
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<null | 'note' | 'pick'>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const placedRefIds = new Set(items.filter((i) => i.refId).map((i) => i.refId));
  const pickable = [
    ...options.changes.map((c) => ({ kind: 'change' as const, id: c.id, title: c.title })),
    ...options.decisions.map((d) => ({ kind: 'decision' as const, id: d.id, title: d.title })),
  ].filter((o) => !placedRefIds.has(o.id));

  const submitNote = async () => {
    const v = note.trim();
    if (!v || saving) return;
    setSaving(true);
    try { await onPlace(def.key, 'note', v); setNote(''); setMode(null); } finally { setSaving(false); }
  };
  const pick = async (o: { kind: 'change' | 'decision'; id: string; title: string }) => {
    if (saving) return;
    setSaving(true);
    try { await onPlace(def.key, o.kind, o.title, o.id); setMode(null); } finally { setSaving(false); }
  };

  return (
    <section
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`rounded-2xl bg-white/[0.02] border ${def.ring} overflow-hidden flex flex-col`}>
      {/* Vivid header */}
      <header className={`bg-gradient-to-br ${def.grad} px-4 py-3 flex items-center gap-2.5`}>
        <button
          draggable
          onDragStart={onDragStart}
          title="Drag to reorder"
          className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white/70 transition shrink-0">
          <GripVertical className="w-4 h-4" />
        </button>
        <Icon className={`w-5 h-5 ${def.text} shrink-0`} />
        <h2 className="text-white font-medium flex-1 min-w-0">{def.label}</h2>
        <span className="text-xs text-white/50 tabular-nums">{items.length}</span>
        {items.length > 3 && (
          <button onClick={() => setExpanded((v) => !v)} title={expanded ? 'Collapse' : 'Expand'}
            className="text-white/40 hover:text-white/70 transition">
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </header>

      {/* Body — scrollable; expand to grow the box */}
      <div className={`px-3 py-3 ${expanded ? '' : 'max-h-72 overflow-y-auto'}`}>
        {items.length === 0 ? (
          <p className="text-sm text-slate-600 px-1 py-2">{def.empty}</p>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <AttentionRow key={it.id} item={it} def={def} onRemove={onRemove} onMove={onMove} />
            ))}
          </div>
        )}
      </div>

      {/* Footer — add in place (note or pull in) */}
      <div className="px-3 pb-3 mt-auto border-t border-white/5 pt-3">
        {mode === 'note' ? (
          <div className="space-y-2">
            <textarea autoFocus rows={2} value={note} onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitNote(); } if (e.key === 'Escape') { setNote(''); setMode(null); } }}
              placeholder="Name what belongs here…"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none" />
            <div className="flex items-center gap-2">
              <button onClick={submitNote} disabled={saving || !note.trim()} className={`px-3 py-1.5 rounded-lg text-sm bg-white/10 ${def.text} hover:bg-white/15 transition disabled:opacity-40`}>{saving ? 'Placing…' : 'Place'}</button>
              <button onClick={() => { setNote(''); setMode(null); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
            </div>
          </div>
        ) : mode === 'pick' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Pull in</p>
              <button onClick={() => setMode(null)} className="text-slate-600 hover:text-slate-300 transition"><X className="w-3.5 h-3.5" /></button>
            </div>
            {pickable.length === 0 ? (
              <p className="text-xs text-slate-600 py-1">Nothing open to pull in. Write a note instead.</p>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-1">
                {pickable.map((o) => {
                  const KIcon = KIND_ICON[o.kind];
                  return (
                    <button key={`${o.kind}-${o.id}`} onClick={() => pick(o)} disabled={saving}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition disabled:opacity-40">
                      <KIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-sm text-white/85 truncate flex-1">{o.title}</span>
                      <span className="text-[10px] text-slate-600 uppercase">{KIND_LABEL[o.kind]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('note')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition">
              <Plus className="w-3.5 h-3.5" /> Note
            </button>
            <button onClick={() => setMode('pick')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition">
              <ChevronRight className="w-3.5 h-3.5" /> Pull in
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function AttentionRow({
  item, def, onRemove, onMove,
}: {
  item: AttentionItem;
  def: FieldDef;
  onRemove: (id: string) => void;
  onMove: (id: string, field: FieldKey) => void;
}) {
  const [moving, setMoving] = useState(false);
  const KIcon = KIND_ICON[item.kind];
  const others = FIELD_ORDER.filter((k) => k !== def.key);
  return (
    <div className="group relative rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2.5">
      <div className="flex items-start gap-2 pr-14">
        <KIcon className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={`text-sm leading-snug ${item.gone ? 'text-slate-500 line-through' : 'text-white/90'}`}>{item.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-600 uppercase tracking-wide">{KIND_LABEL[item.kind]}</span>
            {item.gone && <span className="text-[10px] text-slate-600">· removed at source</span>}
            {item.href && !item.gone && (
              <Link href={item.href} className="text-[10px] text-slate-600 hover:text-slate-300 transition flex items-center gap-0.5">
                open <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={() => setMoving((v) => !v)} title="Move to another field" className="p-1 rounded text-slate-600 hover:text-slate-300 transition">
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onRemove(item.id)} title="Take out of this field" className="p-1 rounded text-slate-600 hover:text-slate-300 transition">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {moving && (
        <div className="mt-2 flex flex-wrap items-center gap-2 pl-5">
          <span className="text-[11px] text-slate-500">Move to</span>
          {others.map((k) => (
            <button key={k} onClick={() => { onMove(item.id, k); setMoving(false); }}
              className={`px-2.5 py-1 rounded-lg text-xs bg-white/5 ${FIELD_DEFS[k].text} hover:bg-white/10 transition`}>
              {FIELD_DEFS[k].label}
            </button>
          ))}
        </div>
      )}
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
    <section className="h-full rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col">
      <h2 className="text-sm text-slate-400 flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-slate-500" /> Today
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
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What’s happening?"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm focus:outline-none focus:border-white/20" />
          <div className="flex items-center gap-2">
            <button onClick={add} disabled={saving || !title.trim() || !time} className="px-3 py-1.5 rounded-lg text-sm bg-white/10 text-slate-200 hover:bg-white/15 transition disabled:opacity-40">{saving ? 'Adding…' : 'Add'}</button>
            <button onClick={() => { setOpen(false); setTitle(''); setTime(''); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-2 pl-1 text-sm text-slate-600 hover:text-slate-400 transition">
          <Plus className="w-3.5 h-3.5" /> Add to today
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
    <section className="h-full rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col">
      <h2 className="text-sm text-slate-400 flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-slate-500" /> People
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
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Who are you tending to?"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A note (optional)"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/90 text-sm placeholder-slate-600 focus:outline-none focus:border-white/20" />
          <div className="flex items-center gap-2">
            <button onClick={add} disabled={saving || !name.trim()} className="px-3 py-1.5 rounded-lg text-sm bg-white/10 text-slate-200 hover:bg-white/15 transition disabled:opacity-40">{saving ? 'Adding…' : 'Add'}</button>
            <button onClick={() => { setOpen(false); setName(''); setNote(''); }} className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="mt-3 flex items-center gap-2 pl-1 text-sm text-slate-600 hover:text-slate-400 transition">
          <Plus className="w-3.5 h-3.5" /> Add someone
        </button>
      )}
    </section>
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
