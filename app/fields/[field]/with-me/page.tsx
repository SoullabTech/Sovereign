'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { getFieldBySlug } from '@/lib/masters/registry';
import { apiFetch } from '@/lib/http/apiBase';
import {
  Flame, Droplets, Mountain, Wind, Sparkles,
  BookOpen, Tag, ArrowRight, Check, X, Clock,
  ChevronDown, ChevronUp, Send, Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'active' | 'closing' | 'review' | 'done';
type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface SessionEvent {
  id: string;
  event_type: string;
  elemental_phase: string | null;
  spiral_position: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

interface MemoryCandidate {
  id: string;
  category: string;
  elemental_phase: string | null;
  spiral_position: string | null;
  content: string;
  basis: string;
  confidence: number;
  approved?: boolean;
}

interface Synthesis {
  candidates: MemoryCandidate[];
  synthesis_note: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ELEMENTS: { key: Element; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'fire',   label: 'Fire',   icon: Flame },
  { key: 'water',  label: 'Water',  icon: Droplets },
  { key: 'earth',  label: 'Earth',  icon: Mountain },
  { key: 'air',    label: 'Air',    icon: Wind },
  { key: 'aether', label: 'Aether', icon: Sparkles },
];

const EVENT_BUTTONS: {
  type: string;
  label: string;
  color: string;
  needsDetail?: boolean;
  detailFields?: string[];
}[] = [
  { type: 'arrival_intention',       label: 'Arrival',        color: 'bg-slate-700 hover:bg-slate-600' },
  { type: 'observer_capacity_shift', label: 'Observer Shift', color: 'bg-teal-800 hover:bg-teal-700',     needsDetail: true, detailFields: ['from', 'to'] },
  { type: 'movement_recognized',     label: 'Movement Named', color: 'bg-blue-900 hover:bg-blue-800' },
  { type: 'protector_named',         label: 'Protector',      color: 'bg-purple-900 hover:bg-purple-800', needsDetail: true, detailFields: ['name'] },
  { type: 'orientation_restored',    label: 'Oriented',       color: 'bg-emerald-900 hover:bg-emerald-800' },
  { type: 'symbolic_frame_accepted', label: 'Symbol',         color: 'bg-amber-900 hover:bg-amber-800',   needsDetail: true, detailFields: ['symbol'] },
  { type: 'facilitator_bookmark',    label: 'Bookmark',       color: 'bg-slate-700 hover:bg-slate-600',   needsDetail: true, detailFields: ['note'] },
  { type: 'closing_commitment',      label: 'Commitment',     color: 'bg-rose-900 hover:bg-rose-800',     needsDetail: true, detailFields: ['commitment'] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function elapsed(startedAt: string): string {
  const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WithMePage() {
  const { field: slug } = useParams<{ field: string }>();
  const master = getFieldBySlug(slug);
  if (!master) notFound();

  const { palette, shortName } = master;

  const [phase, setPhase] = useState<Phase>('setup');

  // Setup
  const [memberName, setMemberName] = useState('');
  const [intention, setIntention] = useState('');

  // Session identity
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [elapsedDisplay, setElapsedDisplay] = useState('0:00');

  // Active state
  const [element, setElement] = useState<Element | null>(null);
  const [spiralPosition, setSpiralPosition] = useState('');
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [events, setEvents] = useState<SessionEvent[]>([]);

  // Event detail input
  const [pendingEventType, setPendingEventType] = useState<string | null>(null);
  const [detailValues, setDetailValues] = useState<Record<string, string>>({});

  // Closing
  const [closingReflection, setClosingReflection] = useState('');

  // Review
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);
  const [candidates, setCandidates] = useState<MemoryCandidate[]>([]);
  const [completing, setCompleting] = useState(false);

  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Elapsed timer
  useEffect(() => {
    if (phase !== 'active' || !sessionStartedAt) return;
    const interval = setInterval(() => setElapsedDisplay(elapsed(sessionStartedAt)), 1000);
    return () => clearInterval(interval);
  }, [phase, sessionStartedAt]);

  // ---------------------------------------------------------------------------
  // API helpers
  // ---------------------------------------------------------------------------

  const patchSession = useCallback(async (updates: Record<string, unknown>) => {
    if (!sessionId) return;
    await apiFetch(`/api/studio/with-me/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }, [sessionId]);

  const autoSaveNotes = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      patchSession({ facilitator_notes: notes, transcript }).finally(() => setSaving(false));
    }, 1500);
  }, [notes, transcript, patchSession]);

  useEffect(() => { autoSaveNotes(); }, [notes, transcript, autoSaveNotes]);

  const logEvent = useCallback(async (eventType: string, payload: Record<string, unknown> = {}) => {
    if (!sessionId) return;
    const res = await apiFetch(`/api/studio/with-me/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        elemental_phase: element,
        spiral_position: spiralPosition || null,
        payload,
      }),
    });
    const data = await res.json();
    if (data.event) setEvents(prev => [...prev, data.event]);
  }, [sessionId, element, spiralPosition]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleBeginSession = async () => {
    const res = await apiFetch('/api/studio/with-me/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field_slug: slug, member_name: memberName || null, intention: intention || null }),
    });
    const data = await res.json();
    if (!data.session) return;
    setSessionId(data.session.id);
    setSessionStartedAt(data.session.created_at);
    setPhase('active');
    // Log arrival after session exists
    setTimeout(() => logEvent('arrival_intention', { intention }), 100);
  };

  const handleElementChange = async (el: Element) => {
    setElement(el);
    await patchSession({ elemental_phase: el });
  };

  const handleEventButtonClick = (btn: typeof EVENT_BUTTONS[number]) => {
    if (btn.needsDetail) {
      setPendingEventType(btn.type);
      setDetailValues({});
    } else {
      logEvent(btn.type);
    }
  };

  const handleDetailSubmit = async () => {
    if (!pendingEventType) return;
    await logEvent(pendingEventType, { ...detailValues });
    setPendingEventType(null);
    setDetailValues({});
  };

  const handleRequestSynthesis = async () => {
    if (!sessionId) return;
    setSynthesizing(true);
    await patchSession({ facilitator_notes: notes, transcript, closing_reflection: closingReflection, status: 'closed' });
    const res = await apiFetch(`/api/studio/with-me/sessions/${sessionId}/synthesize`, { method: 'POST' });
    const data = await res.json();
    setSynthesizing(false);
    if (data.synthesis) {
      setSynthesis(data.synthesis);
      setCandidates((data.synthesis.candidates as MemoryCandidate[]).map(c => ({ ...c, approved: true })));
      setPhase('review');
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    setCompleting(true);
    const approved = candidates.filter(c => c.approved);
    await patchSession({ synthesis: { ...synthesis, candidates: approved }, status: 'complete' });
    setCompleting(false);
    setPhase('done');
  };

  const handleNewSession = () => {
    setPhase('setup');
    setMemberName('');
    setIntention('');
    setSessionId(null);
    setSessionStartedAt(null);
    setElement(null);
    setSpiralPosition('');
    setNotes('');
    setTranscript('');
    setClosingReflection('');
    setEvents([]);
    setSynthesis(null);
    setCandidates([]);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const eventBtn = EVENT_BUTTONS.find(b => b.type === pendingEventType);

  return (
    <main className="min-h-screen" style={{ backgroundColor: palette.background }}>
      <div className="max-w-2xl mx-auto px-6 py-12">

        <Link
          href={`/fields/${slug}`}
          className="text-xs uppercase tracking-widest mb-12 inline-block opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: palette.text }}
        >
          ← {shortName}&apos;s Field
        </Link>

        {/* ── SETUP ── */}
        {phase === 'setup' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-light mb-2" style={{ color: palette.text }}>Walk With Me</h1>
              <p className="text-sm opacity-40" style={{ color: palette.text }}>
                Begin a session. MAIA witnesses quietly and offers synthesis at the close.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider opacity-40 block mb-2" style={{ color: palette.text }}>
                  Who is here
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  placeholder="Name (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25 text-sm"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider opacity-40 block mb-2" style={{ color: palette.text }}>
                  Session intention
                </label>
                <textarea
                  value={intention}
                  onChange={e => setIntention(e.target.value)}
                  placeholder="What is this session for? (optional)"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25 text-sm resize-none"
                />
              </div>

              <button
                onClick={handleBeginSession}
                className="w-full py-4 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: `${palette.primary}20`, color: palette.primary, border: `1px solid ${palette.primary}35` }}
              >
                Begin Session
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVE ── */}
        {phase === 'active' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-light" style={{ color: palette.text }}>
                {memberName || 'Session'}
                {intention && <span className="opacity-35 text-sm ml-2">· {intention.slice(0, 45)}</span>}
              </h1>
              <div className="flex items-center gap-1.5 text-xs opacity-35" style={{ color: palette.text }}>
                <Clock className="w-3 h-3" />
                {elapsedDisplay}
                {saving && <span className="ml-1 opacity-60">saving…</span>}
              </div>
            </div>

            {/* Element selector */}
            <div>
              <p className="text-xs uppercase tracking-wider opacity-35 mb-2" style={{ color: palette.text }}>Element</p>
              <div className="flex gap-2 flex-wrap items-center">
                {ELEMENTS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleElementChange(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      element === key
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
                {element && (
                  <input
                    type="text"
                    value={spiralPosition}
                    onChange={e => setSpiralPosition(e.target.value)}
                    onBlur={() => patchSession({ spiral_position: spiralPosition })}
                    placeholder="Spiral position…"
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/25 focus:outline-none w-36"
                  />
                )}
              </div>
            </div>

            {/* Event bookmarks */}
            <div>
              <p className="text-xs uppercase tracking-wider opacity-35 mb-2" style={{ color: palette.text }}>Mark moment</p>
              <div className="flex flex-wrap gap-2">
                {EVENT_BUTTONS.map(btn => (
                  <button
                    key={btn.type}
                    onClick={() => handleEventButtonClick(btn)}
                    className={`px-3 py-1.5 rounded-lg text-xs text-white/80 transition-all ${btn.color}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {pendingEventType && eventBtn && (
                <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <p className="text-xs text-white/50 font-medium">{eventBtn.label}</p>
                  {(eventBtn.detailFields ?? []).map((field, fi) => (
                    <div key={field}>
                      <label className="text-xs text-white/35 block mb-1 capitalize">{field}</label>
                      <input
                        type="text"
                        value={detailValues[field] ?? ''}
                        onChange={e => setDetailValues(prev => ({ ...prev, [field]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleDetailSubmit()}
                        placeholder={
                          field === 'from' ? '"I am panic"' :
                          field === 'to'   ? '"Part of me is panicking"' :
                          `${field}…`
                        }
                        autoFocus={fi === 0}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleDetailSubmit} className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs rounded-lg">
                      Log
                    </button>
                    <button onClick={() => setPendingEventType(null)} className="px-3 py-1.5 bg-white/5 text-white/45 text-xs rounded-lg hover:bg-white/10">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Event log */}
            {events.length > 0 && (
              <div className="space-y-1 py-2 border-t border-white/5">
                {events.map(e => (
                  <div key={e.id} className="flex items-start gap-2 text-xs text-white/35">
                    <Tag className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{e.event_type.replace(/_/g, ' ')}</span>
                    {e.elemental_phase && <span className="opacity-60">· {e.elemental_phase}</span>}
                    {typeof e.payload?.from === 'string' && (
                      <span className="opacity-50 truncate">· &ldquo;{e.payload.from}&rdquo; → &ldquo;{String(e.payload.to ?? '')}&rdquo;</span>
                    )}
                    {typeof e.payload?.note === 'string' && (
                      <span className="opacity-50 truncate">· {e.payload.note}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="text-xs uppercase tracking-wider opacity-35 mb-2" style={{ color: palette.text }}>Notes</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Live notes…"
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none resize-none"
              />
            </div>

            {/* Transcript (collapsible) */}
            <div>
              <button
                onClick={() => setShowTranscript(v => !v)}
                className="flex items-center gap-2 text-xs opacity-35 hover:opacity-60 transition-opacity"
                style={{ color: palette.text }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Transcript
                {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showTranscript && (
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="Paste or type transcript…"
                  rows={8}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none resize-none font-mono"
                />
              )}
            </div>

            <button
              onClick={() => setPhase('closing')}
              className="w-full py-3 rounded-xl text-sm text-white/45 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
            >
              Close Session →
            </button>
          </div>
        )}

        {/* ── CLOSING ── */}
        {phase === 'closing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-light mb-2" style={{ color: palette.text }}>Closing</h2>
              <p className="text-sm opacity-40" style={{ color: palette.text }}>
                One reflection before MAIA synthesizes. What was most alive in this session?
              </p>
            </div>

            <textarea
              value={closingReflection}
              onChange={e => setClosingReflection(e.target.value)}
              placeholder="Closing reflection…"
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none resize-none"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setPhase('active')}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/60 border border-white/10 rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleRequestSynthesis}
                disabled={synthesizing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: `${palette.primary}20`, border: `1px solid ${palette.primary}35` }}
              >
                {synthesizing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> MAIA is reviewing…</>
                  : <><Send className="w-4 h-4" /> Request MAIA Synthesis</>
                }
              </button>
            </div>
          </div>
        )}

        {/* ── REVIEW ── */}
        {phase === 'review' && synthesis && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-light mb-2" style={{ color: palette.text }}>Memory Review</h2>
              {synthesis.synthesis_note && (
                <p className="text-sm italic opacity-50 border-l-2 border-white/15 pl-4" style={{ color: palette.text }}>
                  {synthesis.synthesis_note}
                </p>
              )}
            </div>

            <p className="text-xs opacity-35" style={{ color: palette.text }}>
              Approve what belongs in the developmental record. Nothing is written until you complete.
            </p>

            <div className="space-y-3">
              {candidates.map((c, i) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all ${
                    c.approved ? 'border-white/15 bg-white/5' : 'border-white/5 bg-transparent opacity-35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/55">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                        {c.elemental_phase && <span className="text-xs text-white/35">{c.elemental_phase}</span>}
                        {c.spiral_position && <span className="text-xs text-white/25">{c.spiral_position}</span>}
                        <span className="text-xs text-white/20 ml-auto">{Math.round(c.confidence * 100)}%</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">{c.content}</p>
                      <p className="text-xs text-white/25 italic">Basis: {c.basis}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 mt-1">
                      <button
                        onClick={() => setCandidates(prev => prev.map((x, j) => j === i ? { ...x, approved: true } : x))}
                        className={`p-1.5 rounded-lg transition-all ${c.approved ? 'bg-emerald-700 text-white' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCandidates(prev => prev.map((x, j) => j === i ? { ...x, approved: false } : x))}
                        className={`p-1.5 rounded-lg transition-all ${!c.approved ? 'bg-rose-800 text-white' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs opacity-35 flex-1" style={{ color: palette.text }}>
                {candidates.filter(c => c.approved).length} of {candidates.length} approved
              </span>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: `${palette.primary}25`, border: `1px solid ${palette.primary}45` }}
              >
                {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Complete Session
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <div className="space-y-6 text-center py-16">
            <div className="w-12 h-12 rounded-full bg-white/8 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-white/50" />
            </div>
            <div>
              <h2 className="text-xl font-light mb-2" style={{ color: palette.text }}>Session Complete</h2>
              <p className="text-sm opacity-35" style={{ color: palette.text }}>
                {candidates.filter(c => c.approved).length} memory candidate{candidates.filter(c => c.approved).length !== 1 ? 's' : ''} approved.
                The next session begins with deeper continuity.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Link
                href={`/fields/${slug}`}
                className="px-5 py-2.5 text-sm rounded-xl border border-white/10 text-white/45 hover:text-white/70 transition-colors"
              >
                Return to Field
              </Link>
              <button
                onClick={handleNewSession}
                className="px-5 py-2.5 text-sm rounded-xl text-white/45 hover:text-white/70 transition-colors"
                style={{ border: `1px solid ${palette.primary}30` }}
              >
                New Session
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
