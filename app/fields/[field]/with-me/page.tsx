'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { getFieldBySlug } from '@/lib/masters/registry';
import { apiFetch } from '@/lib/http/apiBase';
import {
  BookOpen, ArrowRight, Check, X,
  Clock, ChevronDown, ChevronUp, Send, Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'active' | 'closing' | 'review' | 'done';

interface Bookmark {
  id: string;
  elapsed: string;
  timestamp_seconds: number;
}

interface MemoryCandidate {
  id: string;
  category: string;
  elemental_phase: string | null;
  spiral_position: string | null;
  content: string;
  basis: string;
  confidence: number;
  bookmark_timestamp?: string;
  source_type?: 'bookmark' | 'autonomous';
  approved?: boolean;
}

interface Synthesis {
  candidates: MemoryCandidate[];
  synthesis_note: string;
}

// ---------------------------------------------------------------------------
// Spoken marker detection
// ---------------------------------------------------------------------------

const SPOKEN_MARKERS = [
  /\bbookmark\s+that\b/gi,
  /\bremember\s+this\b/gi,
  /\bbig\s+shift\b/gi,
  /\bmark\s+that\b/gi,
  /\bflag\s+that\b/gi,
];

function findSpokenMarkers(text: string): Array<{ phrase: string; index: number; context: string }> {
  const found: Array<{ phrase: string; index: number; context: string }> = [];
  for (const pattern of SPOKEN_MARKERS) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      const start = Math.max(0, match.index - 80);
      const end = Math.min(text.length, match.index + match[0].length + 80);
      found.push({
        phrase: match[0].toLowerCase(),
        index: match.index,
        context: text.slice(start, end).trim(),
      });
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function elapsedString(startedAt: string): string {
  const secs = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function elapsedSeconds(startedAt: string): number {
  return Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
}

const inputCls = 'w-full bg-black/[0.04] border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/20 resize-none transition-colors';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WithMePage() {
  const { field: slug } = useParams<{ field: string }>();
  const master = getFieldBySlug(slug);
  if (!master) notFound();

  const { palette, shortName } = master;

  const [phase, setPhase] = useState<Phase>('setup');
  const [memberName, setMemberName] = useState('');
  const [memberUsername, setMemberUsername] = useState('');
  const [memberLinked, setMemberLinked] = useState(false);
  const [intention, setIntention] = useState('');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [elapsedDisplay, setElapsedDisplay] = useState('0:00');

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [closingReflection, setClosingReflection] = useState('');

  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [synthesizing, setSynthesizing] = useState(false);
  const [candidates, setCandidates] = useState<MemoryCandidate[]>([]);
  const [completing, setCompleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detectedMarkerIndices = useRef<Set<number>>(new Set());

  // Elapsed timer
  useEffect(() => {
    if (phase !== 'active' || !sessionStartedAt) return;
    const interval = setInterval(() => setElapsedDisplay(elapsedString(sessionStartedAt)), 1000);
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

  const autoSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      patchSession({ facilitator_notes: notes, transcript }).finally(() => setSaving(false));
    }, 1500);
  }, [notes, transcript, patchSession]);

  useEffect(() => { autoSave(); }, [notes, transcript, autoSave]);

  const createBookmarkEvent = useCallback(async (payload: Record<string, unknown>): Promise<string | null> => {
    if (!sessionId) return null;
    const res = await apiFetch(`/api/studio/with-me/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'facilitator_bookmark', source: 'facilitator', payload }),
    });
    const data = await res.json();
    return data.event?.id ?? null;
  }, [sessionId]);

  // ---------------------------------------------------------------------------
  // Bookmark handler — the only live action during session
  // ---------------------------------------------------------------------------

  // Active session protects presence: mark moments now, classify only after.
  const handleBookmark = useCallback(async () => {
    if (!sessionId || !sessionStartedAt) return;
    const secs = elapsedSeconds(sessionStartedAt);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const label = `${m}:${String(s).padStart(2, '0')}`;

    const id = await createBookmarkEvent({
      timestamp_seconds: secs,
      label: null,
      note: null,
      trigger: 'manual',
    });

    if (id) {
      setBookmarks(prev => [...prev, { id, elapsed: label, timestamp_seconds: secs }]);
    }
  }, [sessionId, sessionStartedAt, createBookmarkEvent]);

  // Keyboard shortcut: ⌘B / Ctrl+B
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b' && phase === 'active') {
        e.preventDefault();
        handleBookmark();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleBookmark]);

  // ---------------------------------------------------------------------------
  // Spoken marker detection (runs on transcript change)
  // ---------------------------------------------------------------------------

  const handleTranscriptChange = useCallback((text: string) => {
    setTranscript(text);
    if (!sessionId || !sessionStartedAt) return;

    const markers = findSpokenMarkers(text);
    for (const marker of markers) {
      if (detectedMarkerIndices.current.has(marker.index)) continue;
      detectedMarkerIndices.current.add(marker.index);

      const secs = elapsedSeconds(sessionStartedAt);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      const label = `${m}:${String(s).padStart(2, '0')} (spoken)`;

      createBookmarkEvent({
        timestamp_seconds: secs,
        phrase: marker.phrase,
        context: marker.context,
        trigger: 'spoken_marker',
      }).then(id => {
        if (id) {
          setBookmarks(prev => [...prev, { id, elapsed: label, timestamp_seconds: secs }]);
        }
      });
    }
  }, [sessionId, sessionStartedAt, createBookmarkEvent]);

  // ---------------------------------------------------------------------------
  // Session lifecycle
  // ---------------------------------------------------------------------------

  const handleBeginSession = async () => {
    const res = await apiFetch('/api/studio/with-me/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field_slug: slug,
        member_name: memberName || null,
        member_username: memberUsername || null,
        intention: intention || null,
      }),
    });
    const data = await res.json();
    if (!data.session) return;
    setSessionId(data.session.id);
    setSessionStartedAt(data.session.created_at);
    setMemberLinked(!!data.member_linked);
    setPhase('active');
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
    await patchSession({
      synthesis: { ...synthesis, candidates: approved },
      approved_candidate_ids: approved.map(c => c.id),
      status: 'complete',
    });
    setCompleting(false);
    setPhase('done');
  };

  const handleNewSession = () => {
    setPhase('setup');
    setMemberName('');
    setMemberUsername('');
    setMemberLinked(false);
    setIntention('');
    setSessionId(null);
    setSessionStartedAt(null);
    setBookmarks([]);
    setNotes('');
    setTranscript('');
    setClosingReflection('');
    setSynthesis(null);
    setCandidates([]);
    detectedMarkerIndices.current = new Set();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen" style={{ backgroundColor: palette.background }}>
      <div className="max-w-2xl mx-auto px-6 py-12">

        <Link
          href={`/fields/${slug}`}
          className="text-xs uppercase tracking-widest mb-12 inline-block transition-opacity hover:opacity-100"
          style={{ color: palette.text, opacity: 0.4 }}
        >
          ← {shortName}&apos;s Field
        </Link>

        {/* ── SETUP ── */}
        {phase === 'setup' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-light mb-2" style={{ color: palette.text }}>Walk With Me</h1>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.5 }}>
                Begin a session. MAIA witnesses quietly. Mark moments as they happen — interpret afterward.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: palette.text, opacity: 0.5 }}>
                  Who is here
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  placeholder="Name (optional)"
                  className={inputCls}
                  style={{ color: palette.text }}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: palette.text, opacity: 0.5 }}>
                  Soullab username
                </label>
                <input
                  type="text"
                  value={memberUsername}
                  onChange={e => setMemberUsername(e.target.value)}
                  placeholder="Username — links session to MAIA memory (optional)"
                  className={inputCls}
                  style={{ color: palette.text }}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider block mb-2" style={{ color: palette.text, opacity: 0.5 }}>
                  Session intention
                </label>
                <textarea
                  value={intention}
                  onChange={e => setIntention(e.target.value)}
                  placeholder="What is this session for? (optional)"
                  rows={3}
                  className={inputCls}
                  style={{ color: palette.text }}
                />
              </div>

              <button
                onClick={handleBeginSession}
                className="w-full py-4 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: `${palette.primary}18`, color: palette.primary, border: `1px solid ${palette.primary}50` }}
              >
                Begin Session
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVE ── */}
        {/* Active session protects presence: mark moments now, classify only after. */}
        {phase === 'active' && (
          <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-light" style={{ color: palette.text }}>
                  {memberName || 'Session'}
                </h1>
                {intention && (
                  <p className="text-xs mt-0.5" style={{ color: palette.text, opacity: 0.35 }}>
                    {intention.slice(0, 60)}
                  </p>
                )}
                {memberLinked && (
                  <p className="text-xs mt-0.5" style={{ color: palette.primary, opacity: 0.6 }}>
                    ● linked to MAIA memory
                  </p>
                )}
                {!memberLinked && memberUsername && (
                  <p className="text-xs mt-0.5" style={{ color: palette.text, opacity: 0.3 }}>
                    username not found — session unlinked
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: palette.text, opacity: 0.4 }}>
                <Clock className="w-3 h-3" />
                {elapsedDisplay}
                {saving && <span className="ml-1 opacity-60">saving…</span>}
              </div>
            </div>

            {/* Transcript — primary space */}
            <div>
              <button
                onClick={() => setShowTranscript(v => !v)}
                className="flex items-center gap-2 text-xs mb-2 transition-opacity hover:opacity-80"
                style={{ color: palette.text, opacity: 0.4 }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Transcript
                {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showTranscript && (
                <textarea
                  value={transcript}
                  onChange={e => handleTranscriptChange(e.target.value)}
                  placeholder={`Paste or type transcript. Say "Bookmark that" or "Remember this" and it will be marked automatically.`}
                  rows={10}
                  className={`${inputCls} font-mono text-xs leading-relaxed`}
                  style={{ color: palette.text }}
                />
              )}
            </div>

            {/* Bookmark timeline */}
            {bookmarks.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: palette.text, opacity: 0.35 }}>
                  Moments marked
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  {bookmarks.map((b) => (
                    <div key={b.id} className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: palette.primary, opacity: 0.7 }}
                      />
                      <span className="text-xs" style={{ color: palette.text, opacity: 0.45 }}>
                        {b.elapsed}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookmark button — the only live action */}
            <div className="py-4">
              <button
                onClick={handleBookmark}
                className="w-full py-5 rounded-2xl text-base font-light transition-all active:scale-95"
                style={{
                  backgroundColor: `${palette.primary}12`,
                  color: palette.primary,
                  border: `1px solid ${palette.primary}35`,
                }}
              >
                ● Bookmark
                <span className="ml-3 text-xs opacity-40">⌘B</span>
              </button>
              <p className="text-center text-xs mt-2" style={{ color: palette.text, opacity: 0.25 }}>
                Mark this moment. Stay present.
              </p>
            </div>

            {/* Notes — visually secondary */}
            <div className="pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: palette.text, opacity: 0.35 }}>
                Notes
              </p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Brief notes if needed…"
                rows={3}
                className={inputCls}
                style={{ color: palette.text, fontSize: '0.8rem' }}
              />
            </div>

            <button
              onClick={() => setPhase('closing')}
              className="w-full py-3 rounded-xl text-sm transition-all border"
              style={{ color: palette.text, opacity: 0.45, borderColor: 'rgba(0,0,0,0.08)' }}
            >
              Close Session →
            </button>
          </div>
        )}

        {/* ── CLOSING ── */}
        {phase === 'closing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-light mb-1" style={{ color: palette.text }}>Closing</h2>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.5 }}>
                One reflection before MAIA reviews the session.
                {bookmarks.length > 0 && ` You marked ${bookmarks.length} moment${bookmarks.length !== 1 ? 's' : ''}.`}
              </p>
            </div>

            <textarea
              value={closingReflection}
              onChange={e => setClosingReflection(e.target.value)}
              placeholder="What was most alive in this session?"
              rows={5}
              className={inputCls}
              style={{ color: palette.text }}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setPhase('active')}
                className="px-4 py-2 text-sm rounded-xl border border-black/10 transition-colors"
                style={{ color: palette.text, opacity: 0.5 }}
              >
                ← Back
              </button>
              <button
                onClick={handleRequestSynthesis}
                disabled={synthesizing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all disabled:opacity-60"
                style={{ backgroundColor: `${palette.primary}18`, color: palette.primary, border: `1px solid ${palette.primary}50` }}
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
              <h2 className="text-xl font-light mb-2" style={{ color: palette.text }}>Review</h2>
              {synthesis.synthesis_note && (
                <p
                  className="text-sm italic"
                  style={{
                    color: palette.text,
                    opacity: 0.55,
                    borderLeft: `2px solid rgba(0,0,0,0.12)`,
                    paddingLeft: '1rem',
                  }}
                >
                  {synthesis.synthesis_note}
                </p>
              )}
            </div>

            <p className="text-xs" style={{ color: palette.text, opacity: 0.4 }}>
              These are MAIA&apos;s interpretations of the moments you marked. Approve what belongs in the developmental record.
            </p>

            <div className="space-y-3">
              {candidates.map((c, i) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border transition-all"
                  style={{
                    borderColor: c.approved ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.04)',
                    backgroundColor: c.approved ? 'rgba(0,0,0,0.03)' : 'transparent',
                    opacity: c.approved ? 1 : 0.4,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: 'rgba(0,0,0,0.07)', color: palette.text, opacity: 0.7 }}
                        >
                          {c.category.replace(/_/g, ' ')}
                        </span>
                        {c.bookmark_timestamp && (
                          <span className="text-xs" style={{ color: palette.primary, opacity: 0.6 }}>
                            ● {c.bookmark_timestamp}
                          </span>
                        )}
                        {c.source_type === 'autonomous' && (
                          <span className="text-xs italic" style={{ color: palette.text, opacity: 0.3 }}>
                            MAIA noticed
                          </span>
                        )}
                        <span className="text-xs ml-auto" style={{ color: palette.text, opacity: 0.3 }}>
                          {Math.round(c.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: palette.text, opacity: 0.85 }}>
                        {c.content}
                      </p>
                      <p className="text-xs italic" style={{ color: palette.text, opacity: 0.35 }}>
                        Basis: {c.basis}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 mt-1">
                      <button
                        onClick={() => setCandidates(prev => prev.map((x, j) => j === i ? { ...x, approved: true } : x))}
                        className={`p-1.5 rounded-lg transition-all ${c.approved ? 'bg-emerald-700 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                        style={!c.approved ? { color: palette.text, opacity: 0.35 } : {}}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCandidates(prev => prev.map((x, j) => j === i ? { ...x, approved: false } : x))}
                        className={`p-1.5 rounded-lg transition-all ${!c.approved ? 'bg-rose-800 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                        style={c.approved ? { color: palette.text, opacity: 0.35 } : {}}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs flex-1" style={{ color: palette.text, opacity: 0.4 }}>
                {candidates.filter(c => c.approved).length} of {candidates.length} approved
              </span>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-60"
                style={{ backgroundColor: `${palette.primary}20`, color: palette.primary, border: `1px solid ${palette.primary}50` }}
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
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: `${palette.primary}15` }}
            >
              <Check className="w-6 h-6" style={{ color: palette.primary }} />
            </div>
            <div>
              <h2 className="text-xl font-light mb-2" style={{ color: palette.text }}>Session Complete</h2>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.4 }}>
                {candidates.filter(c => c.approved).length} memory candidate{candidates.filter(c => c.approved).length !== 1 ? 's' : ''} approved.
                The next session begins with deeper continuity.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Link
                href={`/fields/${slug}`}
                className="px-5 py-2.5 text-sm rounded-xl border border-black/10 transition-colors"
                style={{ color: palette.text, opacity: 0.5 }}
              >
                Return to Field
              </Link>
              <button
                onClick={handleNewSession}
                className="px-5 py-2.5 text-sm rounded-xl transition-colors"
                style={{ color: palette.primary, border: `1px solid ${palette.primary}40` }}
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
