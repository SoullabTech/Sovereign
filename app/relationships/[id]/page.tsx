'use client';

/**
 * The relationship room.
 *
 * RESHAPED 2026-08-10 (founder direction: "this UI/UX feels cold and impersonal
 * for relationship. It has no flow and even the way it is setup is off").
 *
 * What was wrong, against docs/design/INHABITABLE_ARCHITECTURE.md: the room was a
 * RECORD ABOUT A PERSON, not a place to be with one. Four all-caps system sections
 * (CURRENT FIELD / TIMELINE / NEXT MOVEMENT / OPEN WITH A TOOL) rendered at once —
 * the warehouse failure mode, "displays all capabilities simultaneously". Three
 * stacked EMPTY STATES each assigned the member a chore ("Check in to begin
 * sensing the field"). The only genuinely human thing on the page — the member's
 * own sentence about this person — was small italic metadata under a label. And
 * MAIA was a button that navigated AWAY.
 *
 * The shape now:
 *   1. The member's own words are the centre, at full size.
 *   2. MAIA is already here — conversation in the room, not a trip elsewhere.
 *   3. Everything else STAYS HIDDEN until it has something to say. No empty
 *      scaffolding. Field tone, timeline, and movement appear only when they
 *      exist; the remaining gestures live behind one quiet invitation.
 *
 * Also removed from the member surface: the lineage list (polyvagal, Bowen, IFS,
 * Gottman, NVC, EFT). Naming clinical schools turns a friendship into a case file
 * — internal vocabulary, which the design law keeps out of ordinary member UI.
 *
 * ⛔ Placement and presentation only. No schema, no new persistence, no change to
 * what MAIA remembers (the relational read path remains severed — Classification
 * D, see the 2026-08-10 audit). The conversation here is in-turn, not memory.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FieldToneIndicator from '@/components/relationships/FieldToneIndicator';
import CheckInFlow from '@/components/relationships/CheckInFlow';
import RelationshipTimeline, { type TimelineEntry } from '@/components/relationships/RelationshipTimeline';
import RelationshipConversation from '@/components/relationships/RelationshipConversation';

interface RelationshipDetail {
  id: string;
  name: string;
  realm: string;
  bondType: string | null;
  note: string | null;
  /** 'system' = a container the system made for what it could not resolve. */
  origin?: 'member' | 'system';
  createdAt: string;
}

interface HistoryMeta {
  total: number;
  returned: number;
  firstAt: string | null;
}

/**
 * How long ago, in words. Sensing has an age: a tone recorded four months ago
 * is not this relationship's present condition, and rendering it undated let
 * stale sensing read as current.
 */
function ageInWords(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 18) return months === 1 ? 'a month ago' : `${months} months ago`;
  const years = Math.round(days / 365);
  return years === 1 ? 'a year ago' : `${years} years ago`;
}

function onDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

interface FieldState {
  fieldTone: string | null;
  activeSignals: string[] | null;
  dominantPattern: string | null;
  developmentalTheme: string | null;
  lastCheckinAt: string | null;
}

type NoteKind = 'note' | 'reflection' | 'threshold' | 'rupture' | 'repair';

/**
 * The member's own vocabulary for the condition of their relationship, in
 * plain language rather than schema words. Offered, never required.
 */
const NOTE_KINDS: ReadonlyArray<{ kind: NoteKind; label: string }> = [
  { kind: 'note',       label: 'something happened' },
  { kind: 'reflection', label: "something I'm noticing" },
  { kind: 'threshold',  label: 'something changed' },
  { kind: 'rupture',    label: 'something broke' },
  { kind: 'repair',     label: 'something mended' },
];

const NOTE_PROMPTS: Record<NoteKind, string> = {
  note: 'What happened?',
  reflection: 'What are you noticing?',
  threshold: 'What shifted?',
  rupture: 'What broke, in your experience of it?',
  repair: 'What found its way back?',
};

/** Quiet section label — present for orientation, never shouting for attention. */
function Quiet({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs text-stone-300/70 tracking-wide mb-3 font-light">{children}</h2>;
}

export default function RelationshipDetailPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = params.id as string;

  interface UnresolvedThread {
    type: string;
    description: string;
    anchoredAt: string | null;
  }

  const [relationship, setRelationship] = useState<RelationshipDetail | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [history, setHistory] = useState<HistoryMeta | null>(null);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [unresolvedThreads, setUnresolvedThreads] = useState<UnresolvedThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCheckin, setShowCheckin] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  // The member may name the condition of their own relationship. The API has
  // always accepted `rupture` and `repair`, and the OBSERVER could write a
  // rupture — while no member-facing surface offered either. That is an
  // inversion of authorship: the machine could say something broke and the
  // person it happened to could not.
  const [noteKind, setNoteKind] = useState<NoteKind>('note');
  const [savingNote, setSavingNote] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/relationships/${id}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Not found');
        return;
      }
      setRelationship(data.relationship);
      setFieldState(data.fieldState);
      setEntries(data.entries || []);
      setHistory(data.history || null);
      setUnresolvedThreads(data.unresolvedThreads || []);
    } catch {
      setError('Could not load relationship.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Reach further back. History must get RICHER as it accumulates — a room
   * that silently stopped at the twentieth moment made a long relationship
   * less representable the longer it went on.
   */
  const loadEarlier = useCallback(async () => {
    if (loadingEarlier) return;
    setLoadingEarlier(true);
    try {
      const res = await fetch(`/api/relationships/${id}/entries?limit=100&offset=${entries.length}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        setEntries((prev) => [...prev, ...data.entries]);
      }
    } catch {
      // silent — the existing history stays on screen
    } finally {
      setLoadingEarlier(false);
    }
  }, [id, entries.length, loadingEarlier]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleCheckinComplete = () => {
    setShowCheckin(false);
    fetchDetail(); // Refresh to show new entry + updated field state
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/relationships/${id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: noteKind, content: noteContent.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNoteContent('');
        setShowAddNote(false);
        fetchDetail();
      }
    } catch {
      // silent
    } finally {
      setSavingNote(false);
    }
  };

  /**
   * Keep what the member wrote, exactly as they wrote it.
   *
   * No MAIA turn, no detection, no interpretation, no confidence value — which
   * is precisely what makes the resulting entry MEMBER-AUTHORED rather than
   * "noticed, not written". This is the gesture that makes Article VIII true:
   * the room retains its meaning when MAIA is declined or unavailable.
   */
  const keepWhatTheyWrote = useCallback(async (text: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/relationships/${id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'note', content: text }),
      });
      const data = await res.json();
      if (!data?.success) return false;
      await fetchDetail();
      return true;
    } catch {
      return false;
    }
  }, [id, fetchDetail]);

  const saveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === relationship?.name) {
      setEditingName(false);
      return;
    }
    try {
      const res = await fetch(`/api/relationships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        fetchDetail();
      }
    } catch {
      // silent
    }
    setEditingName(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
        <div className="w-8 h-8 border border-stone-700/30 rounded-full animate-spin" style={{ borderTopColor: '#b4703a' }} />
      </div>
    );
  }

  if (error || !relationship) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
        <div className="text-center">
          <p className="text-stone-400 mb-4">{error || 'Not found'}</p>
          <button onClick={() => router.push('/relationships')} className="text-sm text-stone-300 hover:text-stone-200 transition-colors">
            Back to field
          </button>
        </div>
      </div>
    );
  }

  const hasHistory = entries.length > 0;
  const isContainer = relationship.origin === 'system';

  return (
    /* Navy field, ember light. A deep blue-black room rather than a black
       terminal, with the only real warmth coming from the member's own words
       — no glow, no wash, no atmosphere painted around them. */
    <div className="min-h-screen relative bg-[#0a0e17]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          type="button"
          onClick={() => router.push('/relationships')}
          className="text-xs text-stone-500 hover:text-amber-200/70 transition-colors mb-10 block"
        >
          &larr; Relational Field
        </button>

        {/* ── Who, and what the member has said about them ────────────────── */}

        {/* A container the system made for what it could not resolve. It is
            legible as such — never dressed as a person. Everything in it stays
            reachable; nothing is deleted, and nothing here is attributed to
            anyone by guessing. UNKNOWN REMAINS UNKNOWN. */}
        {isContainer && (
          <div className="mb-8">
            <h1 className="text-2xl font-extralight text-stone-400 tracking-wide mb-3">
              Not yet placed
            </h1>
            <p className="text-sm text-stone-400/75 font-light leading-relaxed max-w-lg">
              Things you said in conversation that sounded relational, which we couldn&apos;t
              tell who they were about. We won&apos;t guess. This is our unfinished work — it
              is kept here so nothing of yours is lost, not because it belongs to anyone.
            </p>
          </div>
        )}

        <div className={isContainer ? 'hidden' : 'mb-2'}>
          {editingName ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="text-4xl font-extralight text-amber-100/75 tracking-wide bg-transparent border-b border-amber-800/40 outline-none w-full"
            />
          ) : (
            /* Lamplight, not terminal-green. The name is warm but deliberately
               dimmer than the member's own sentence below it — the person is
               named; what the member said about them is what glows. */
            <h1
              onClick={() => { setEditName(relationship.name); setEditingName(true); }}
              className="text-4xl font-extralight text-amber-100/75 tracking-wide cursor-text hover:text-amber-100 transition-colors"
              title="Click to rename"
            >
              {relationship.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-400/70 mb-6">
          {relationship.bondType && (
            <span className="capitalize">{relationship.bondType.replace(/_/g, ' ')}</span>
          )}
          {relationship.realm !== 'outer' && (
            <span className="text-amber-600 capitalize">{relationship.realm}</span>
          )}
        </div>

        {/* The member's own words — the brightest thing in the room.
            Not a caption under a label; the substance itself. Everything else
            on this page is quieter than this sentence on purpose. */}
        {relationship.note && (
          <p
            className="text-2xl leading-[1.6] text-[#f2e6d8] font-extralight"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {relationship.note}
          </p>
        )}

        {/* Sensing, in words, attributed to the member and DATED.
            It used to render as an undated coloured dot beside the person's
            name — which drew the member's own sensing as an attribute of the
            other person, and let a reading from months ago pass as current.
            `lastCheckinAt` was fetched, typed, and never shown at all. */}
        {fieldState?.fieldTone && (
          <p className="mt-5 text-sm text-stone-400/85 font-light flex items-center gap-2 flex-wrap">
            <FieldToneIndicator tone={fieldState.fieldTone} size="sm" />
            <span>
              is how you sensed things here
              {fieldState.lastCheckinAt ? (
                <>
                  {' '}on {onDate(fieldState.lastCheckinAt)}
                  <span className="text-stone-400/55"> — {ageInWords(fieldState.lastCheckinAt)}</span>
                </>
              ) : (
                <span className="text-stone-400/55"> — the last time you checked in</span>
              )}
            </span>
          </p>
        )}

        {/* ── The hearth ──────────────────────────────────────────────────────
            Speaking is the reason this place exists, and it is a HUMAN gesture
            first. MAIA is company at the fire, not the fire: writing something
            down sits right beside speaking to her, reachable in one move and
            fully usable if she is declined, unavailable, or simply not wanted.
            The room keeps its whole meaning without her. */}
        {!isContainer && (
          <RelationshipConversation
            relationshipId={id}
            name={relationship.name}
            bondType={relationship.bondType}
            note={relationship.note}
            onWriteDown={keepWhatTheyWrote}
          />
        )}

        {/* ── Only what has something to say ──────────────────────────────── */}

        {/* ── NEXT MOVEMENT — relocated, not removed ──────────────────────────
            A standalone "A next movement" heading greeted the member on
            arrival with the newest suggestion the system had, no matter how
            old or how irrelevant. That harms the bereaved and the estranged
            most: no relationship owes the software a next step. A relationship
            may simply be HELD — remembered, witnessed, grieved, honoured,
            accompanied — and nothing needs fixing.

            The capability is preserved in full. Each movement is still
            rendered by RelationshipTimeline, at the moment it was authored,
            dated and attached to the check-in that produced it. Its reveal
            condition is therefore the member's own gesture: it appears when
            they turn to look back, and never asks for anything on arrival. */}

        {(fieldState?.dominantPattern ||
          (fieldState?.activeSignals && fieldState.activeSignals.length > 0) ||
          fieldState?.developmentalTheme) && (
          <section className="mt-12">
            <Quiet>What has been present</Quiet>
            {fieldState.activeSignals && fieldState.activeSignals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {fieldState.activeSignals.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-stone-900/20 border border-stone-700/15 text-stone-400">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {fieldState.dominantPattern && (
              <p className="text-xs text-stone-400 mb-1">{fieldState.dominantPattern}</p>
            )}
            {fieldState.developmentalTheme && (
              <p className="text-xs text-amber-600 font-light">{fieldState.developmentalTheme}</p>
            )}
          </section>
        )}

        {hasHistory && (
          <section className="mt-12">
            <Quiet>{isContainer ? 'What is held here' : 'Together, over time'}</Quiet>

            {/* Derived noticing — moved OUT of arrival and INTO looking back.
                It no longer greets the member above their own words in a
                bordered box speaking in fact-voice. It is attributed to MAIA,
                phrased as noticing rather than verdict, anchored to the date of
                the member's OWN entry it was derived from, and it renders only
                when it has a real anchor — so silence is what happens when
                there is nothing particular to say. */}
            {unresolvedThreads
              .filter((t) => t.anchoredAt)
              .map((thread, i) => (
                <p key={i} className="mb-4 text-sm text-stone-400 font-light leading-relaxed">
                  <span className="text-stone-500">MAIA notices, reading back: </span>
                  {thread.description}
                  <span className="text-stone-500"> — {onDate(thread.anchoredAt!)}.</span>
                </p>
              ))}

            <RelationshipTimeline
              entries={entries}
              total={history?.total}
              onLoadEarlier={loadEarlier}
              loadingEarlier={loadingEarlier}
            />
          </section>
        )}

        {/* ── One quiet invitation, holding everything else ─────────────────
            Hidden for system containers: there is no relationship here to
            check in on or repair, and offering those would dress the system's
            unfinished work as a bond. */}
        <section className={isContainer ? 'hidden' : 'mt-14 pt-6 border-t border-stone-800/20'}>
          {!showMore && !showCheckin && !showAddNote && (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="text-xs text-stone-400/60 hover:text-stone-300 transition-colors font-light"
            >
              Other ways to be with this
            </button>
          )}

          {(showMore || showCheckin || showAddNote) && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-xs font-light">
                <button
                  type="button"
                  onClick={() => {
                    // Refetch on CLOSE as well as on complete. A check-in writes its
                    // entry and field state before the member dismisses the panel, so
                    // closing without refetching left the room rendering pre-check-in
                    // state while the database had already moved — observed 2026-08-10.
                    if (showCheckin) fetchDetail();
                    setShowCheckin(!showCheckin);
                    setShowAddNote(false);
                  }}
                  className="text-stone-300 hover:text-stone-200 transition-colors"
                >
                  {showCheckin ? 'Not now' : 'Check in'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddNote(!showAddNote); setShowCheckin(false); }}
                  className="text-stone-300 hover:text-stone-200 transition-colors"
                >
                  {showAddNote ? 'Not now' : 'Write something down'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/labtools/relational-field?relationshipId=${id}`)}
                  className="text-stone-400/70 hover:text-stone-300 transition-colors"
                >
                  Sense the tone
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/labtools/dynamics-map?relationshipId=${id}`)}
                  className="text-stone-400/70 hover:text-stone-300 transition-colors"
                >
                  Notice the pattern
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/labtools/repair-path?relationshipId=${id}`)}
                  className="text-stone-400/70 hover:text-stone-300 transition-colors"
                >
                  When something has broken
                </button>
              </div>

              {showCheckin && (
                <div className="p-4 rounded-lg border border-stone-700/15 bg-stone-900/5">
                  <CheckInFlow
                    relationshipId={id}
                    relationshipName={relationship.name}
                    onComplete={handleCheckinComplete}
                  />
                </div>
              )}

              {showAddNote && (
                <div className="p-4 rounded-lg border border-stone-700/15 bg-stone-900/5">
                  {/* All five kinds the API has always accepted. `rupture` and
                      `repair` were missing here while the OBSERVER could write
                      a rupture — the machine could name what broke and the
                      person it happened to could not. Offered, never demanded:
                      'note' stays the default and no kind must be chosen. */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {NOTE_KINDS.map(({ kind, label }) => (
                      <button
                        type="button"
                        key={kind}
                        onClick={() => setNoteKind(kind)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                          noteKind === kind
                            ? 'bg-stone-900/40 text-stone-200 border border-stone-700/40'
                            : 'bg-stone-900/40 text-stone-400 border border-stone-800/30'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                    placeholder={NOTE_PROMPTS[noteKind]}
                    className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700/20 text-stone-200 placeholder:text-stone-400/40 focus:outline-none focus:border-stone-700/50 text-sm resize-none mb-3"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={savingNote || !noteContent.trim()}
                    className="px-4 py-1.5 rounded-lg bg-stone-900/30 border border-stone-700/25 text-stone-200 text-xs font-light hover:bg-stone-900/45 transition-all disabled:opacity-40"
                  >
                    {savingNote ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
