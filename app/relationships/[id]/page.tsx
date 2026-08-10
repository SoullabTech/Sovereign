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
  createdAt: string;
}

interface FieldState {
  fieldTone: string | null;
  activeSignals: string[] | null;
  dominantPattern: string | null;
  developmentalTheme: string | null;
  lastCheckinAt: string | null;
}

/** Quiet section label — present for orientation, never shouting for attention. */
function Quiet({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs text-jade-sage/70 tracking-wide mb-3 font-light">{children}</h2>;
}

export default function RelationshipDetailPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = params.id as string;

  interface UnresolvedThread {
    type: string;
    description: string;
  }

  const [relationship, setRelationship] = useState<RelationshipDetail | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [unresolvedThreads, setUnresolvedThreads] = useState<UnresolvedThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCheckin, setShowCheckin] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteKind, setNoteKind] = useState<'note' | 'reflection' | 'threshold'>('note');
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
      setUnresolvedThreads(data.unresolvedThreads || []);
    } catch {
      setError('Could not load relationship.');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border border-jade-sage/30 rounded-full animate-spin" style={{ borderTopColor: 'var(--jade-jade, #a8c7a0)' }} />
      </div>
    );
  }

  if (error || !relationship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-jade-mineral mb-4">{error || 'Not found'}</p>
          <button onClick={() => router.push('/relationships')} className="text-sm text-jade-sage hover:text-jade-jade transition-colors">
            Back to field
          </button>
        </div>
      </div>
    );
  }

  const latestMovement = entries.find(e => e.suggestedMovement)?.suggestedMovement;
  const hasHistory = entries.length > 0;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push('/relationships')}
          className="text-xs text-jade-mineral/70 hover:text-jade-sage transition-colors mb-10 block"
        >
          &larr; Relational Field
        </button>

        {/* ── Who, and what the member has said about them ────────────────── */}
        <div className="mb-2">
          {editingName ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="text-4xl font-extralight text-jade-jade tracking-wide bg-transparent border-b border-jade-sage/30 outline-none w-full"
            />
          ) : (
            <h1
              onClick={() => { setEditName(relationship.name); setEditingName(true); }}
              className="text-4xl font-extralight text-jade-jade tracking-wide cursor-text hover:text-jade-sage/90 transition-colors"
              title="Click to rename"
            >
              {relationship.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-jade-mineral/70 mb-7">
          {relationship.bondType && (
            <span className="capitalize">{relationship.bondType.replace(/_/g, ' ')}</span>
          )}
          {relationship.realm !== 'outer' && (
            <span className="text-jade-copper capitalize">{relationship.realm}</span>
          )}
          {/* Tone belongs beside the person, not in a panel of its own. */}
          {fieldState?.fieldTone && <FieldToneIndicator tone={fieldState.fieldTone} size="md" />}
        </div>

        {/* The member's own words — the living material of this room, at full size. */}
        {relationship.note && (
          <p
            className="text-xl leading-relaxed text-jade-jade/85 font-extralight"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {relationship.note}
          </p>
        )}

        {/* ── MAIA, already here ──────────────────────────────────────────── */}
        <RelationshipConversation
          relationshipId={id}
          name={relationship.name}
          bondType={relationship.bondType}
          note={relationship.note}
        />

        {/* ── Only what has something to say ──────────────────────────────── */}

        {unresolvedThreads.length > 0 && (
          <section className="mt-12">
            <Quiet>Something remains open</Quiet>
            <div className="space-y-2">
              {unresolvedThreads.map((thread, i) => (
                <div key={i} className="px-4 py-3 rounded-lg border border-jade-copper/20 bg-jade-forest/5">
                  <p className="text-sm text-jade-mineral font-light">{thread.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {latestMovement && (
          <section className="mt-12">
            <Quiet>A next movement</Quiet>
            <p className="text-[15px] text-jade-jade/90 font-light italic leading-relaxed">
              {latestMovement}
            </p>
          </section>
        )}

        {(fieldState?.dominantPattern ||
          (fieldState?.activeSignals && fieldState.activeSignals.length > 0) ||
          fieldState?.developmentalTheme) && (
          <section className="mt-12">
            <Quiet>What has been present</Quiet>
            {fieldState.activeSignals && fieldState.activeSignals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {fieldState.activeSignals.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-jade-forest/20 border border-jade-sage/15 text-jade-mineral">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {fieldState.dominantPattern && (
              <p className="text-xs text-jade-mineral mb-1">{fieldState.dominantPattern}</p>
            )}
            {fieldState.developmentalTheme && (
              <p className="text-xs text-jade-copper font-light">{fieldState.developmentalTheme}</p>
            )}
          </section>
        )}

        {hasHistory && (
          <section className="mt-12">
            <Quiet>Together, over time</Quiet>
            <RelationshipTimeline entries={entries} />
          </section>
        )}

        {/* ── One quiet invitation, holding everything else ───────────────── */}
        <section className="mt-14 pt-6 border-t border-jade-forest/20">
          {!showMore && !showCheckin && !showAddNote && (
            <button
              onClick={() => setShowMore(true)}
              className="text-xs text-jade-mineral/60 hover:text-jade-sage transition-colors font-light"
            >
              Other ways to be with this
            </button>
          )}

          {(showMore || showCheckin || showAddNote) && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-xs font-light">
                <button
                  onClick={() => {
                    // Refetch on CLOSE as well as on complete. A check-in writes its
                    // entry and field state before the member dismisses the panel, so
                    // closing without refetching left the room rendering pre-check-in
                    // state while the database had already moved — observed 2026-08-10.
                    if (showCheckin) fetchDetail();
                    setShowCheckin(!showCheckin);
                    setShowAddNote(false);
                  }}
                  className="text-jade-sage hover:text-jade-jade transition-colors"
                >
                  {showCheckin ? 'Not now' : 'Check in'}
                </button>
                <button
                  onClick={() => { setShowAddNote(!showAddNote); setShowCheckin(false); }}
                  className="text-jade-sage hover:text-jade-jade transition-colors"
                >
                  {showAddNote ? 'Not now' : 'Write something down'}
                </button>
                <button
                  onClick={() => router.push(`/labtools/relational-field?relationshipId=${id}`)}
                  className="text-jade-mineral/70 hover:text-jade-sage transition-colors"
                >
                  Sense the tone
                </button>
                <button
                  onClick={() => router.push(`/labtools/dynamics-map?relationshipId=${id}`)}
                  className="text-jade-mineral/70 hover:text-jade-sage transition-colors"
                >
                  Notice the pattern
                </button>
                <button
                  onClick={() => router.push(`/labtools/repair-path?relationshipId=${id}`)}
                  className="text-jade-mineral/70 hover:text-jade-sage transition-colors"
                >
                  When something has broken
                </button>
              </div>

              {showCheckin && (
                <div className="p-4 rounded-lg border border-jade-sage/15 bg-jade-forest/5">
                  <CheckInFlow
                    relationshipId={id}
                    relationshipName={relationship.name}
                    onComplete={handleCheckinComplete}
                  />
                </div>
              )}

              {showAddNote && (
                <div className="p-4 rounded-lg border border-jade-sage/15 bg-jade-forest/5">
                  <div className="flex gap-2 mb-3">
                    {(['note', 'reflection', 'threshold'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setNoteKind(k)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                          noteKind === k
                            ? 'bg-jade-forest/40 text-jade-jade border border-jade-sage/40'
                            : 'bg-jade-shadow/40 text-jade-mineral border border-jade-forest/30'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                    placeholder={noteKind === 'threshold' ? 'What shifted?' : noteKind === 'reflection' ? 'What are you noticing?' : 'What happened?'}
                    className="w-full px-3 py-2 rounded-lg bg-jade-shadow border border-jade-sage/20 text-jade-jade placeholder:text-jade-mineral/40 focus:outline-none focus:border-jade-sage/50 text-sm resize-none mb-3"
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote || !noteContent.trim()}
                    className="px-4 py-1.5 rounded-lg bg-jade-forest/30 border border-jade-sage/25 text-jade-jade text-xs font-light hover:bg-jade-forest/45 transition-all disabled:opacity-40"
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
