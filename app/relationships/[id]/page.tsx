'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FieldToneIndicator from '@/components/relationships/FieldToneIndicator';
import CheckInFlow from '@/components/relationships/CheckInFlow';
import RelationshipTimeline, { type TimelineEntry } from '@/components/relationships/RelationshipTimeline';
import RelationshipModeNav, { type RelationshipMode } from '@/components/relationships/RelationshipModeNav';
import { seedFromSource } from '@/lib/maia/seedPrompt';

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

interface UnresolvedThread {
  type: string;
  description: string;
}

export default function RelationshipDetailPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = params.id as string;

  const [relationship, setRelationship] = useState<RelationshipDetail | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [unresolvedThreads, setUnresolvedThreads] = useState<UnresolvedThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<RelationshipMode>('now');
  const [showCheckin, setShowCheckin] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
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
    fetchDetail();
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
      // The relationship remains usable if a note save fails.
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
      if (res.ok) fetchDetail();
    } catch {
      // Renaming is non-load-bearing; leave the current label intact on failure.
    }
    setEditingName(false);
  };

  const openWithMAIA = () => {
    seedFromSource(
      'relationships:thread',
      `I want to explore what is alive in my relationship with ${relationship?.name ?? 'this relationship'}.`,
      { contextId: id, tone: 'supportive' }
    );
    router.push('/maia');
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
            Back to relationships
          </button>
        </div>
      </div>
    );
  }

  const latestMovement = entries.find((entry) => entry.suggestedMovement)?.suggestedMovement;
  const latestMemberWords = entries.find((entry) => entry.freeText)?.freeText;
  const hasFieldMaterial = Boolean(
    fieldState || unresolvedThreads.length > 0 || entries.some((entry) => entry.patternHint && entry.patternHint !== 'Not enough history yet.')
  );

  return (
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <button
          onClick={() => router.push('/relationships')}
          className="mb-8 block text-xs text-jade-mineral transition-colors hover:text-jade-sage"
        >
          ← Relationships
        </button>

        <header className="mb-7 max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            {editingName ? (
              <input
                autoFocus
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onBlur={saveName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveName();
                  if (event.key === 'Escape') setEditingName(false);
                }}
                className="w-full border-b border-jade-sage/30 bg-transparent text-4xl font-extralight tracking-wide text-jade-jade outline-none"
              />
            ) : (
              <h1
                onClick={() => {
                  setEditName(relationship.name);
                  setEditingName(true);
                }}
                className="cursor-pointer text-4xl font-extralight tracking-wide text-jade-jade transition-colors hover:text-jade-sage"
                title="Click to rename"
              >
                {relationship.name}
              </h1>
            )}
            {relationship.realm !== 'outer' && (
              <span className="text-xs capitalize text-jade-copper/80">{relationship.realm}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-light text-jade-mineral/70">
            {relationship.bondType && (
              <span className="capitalize">{relationship.bondType.replace(/_/g, ' ')}</span>
            )}
            {relationship.note && <span className="text-jade-mineral/55">{relationship.note}</span>}
          </div>
        </header>

        <RelationshipModeNav value={mode} onChange={setMode} />

        <main className="pt-8 md:pt-10">
          {mode === 'now' && (
            <section className="mx-auto max-w-2xl">
              <div className="mb-10">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-jade-mineral/45">Now</p>
                <h2 className="text-2xl font-extralight leading-relaxed text-jade-jade md:text-3xl">
                  What is alive between you now?
                </h2>
              </div>

              {latestMemberWords && !showCheckin && (
                <blockquote className="mb-9 border-l border-jade-sage/20 pl-5 text-base font-light italic leading-relaxed text-jade-mineral/80">
                  “{latestMemberWords}”
                </blockquote>
              )}

              {!showCheckin ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCheckin(true)}
                    className="w-full rounded-xl border border-jade-sage/20 bg-jade-forest/10 px-5 py-4 text-left transition-colors hover:border-jade-sage/35 hover:bg-jade-forest/20"
                  >
                    <div className="text-sm font-light text-jade-jade">Begin with what you are sensing</div>
                    <div className="mt-1 text-xs font-light leading-relaxed text-jade-mineral/60">
                      A brief check-in can help the field come into view without deciding what it means.
                    </div>
                  </button>

                  <button
                    onClick={openWithMAIA}
                    className="w-full rounded-xl border border-jade-sage/10 px-5 py-4 text-left transition-colors hover:border-jade-sage/25 hover:bg-jade-forest/10"
                  >
                    <div className="text-sm font-light text-jade-jade">Explore this with MAIA</div>
                    <div className="mt-1 text-xs font-light leading-relaxed text-jade-mineral/60">
                      Bring this relationship into conversation with its context held quietly in the background.
                    </div>
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-jade-sage/15 bg-jade-forest/5 p-5 md:p-6">
                  <CheckInFlow
                    relationshipId={id}
                    relationshipName={relationship.name}
                    onComplete={handleCheckinComplete}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCheckin(false)}
                    className="mt-5 text-xs text-jade-mineral/55 transition-colors hover:text-jade-sage"
                  >
                    Return to now
                  </button>
                </div>
              )}

              {latestMovement && !showCheckin && (
                <div className="mt-10 border-t border-jade-sage/10 pt-6">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-jade-mineral/40">Something to carry</p>
                  <p className="text-sm font-light italic leading-relaxed text-jade-mineral/75">{latestMovement}</p>
                </div>
              )}
            </section>
          )}

          {mode === 'story' && (
            <section className="mx-auto max-w-2xl">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-jade-mineral/45">Story</p>
                  <h2 className="text-2xl font-extralight text-jade-jade">How did you get here?</h2>
                  <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-jade-mineral/60">
                    What has been meaningful enough to keep. Not a complete history, and it does not need to be.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddNote((value) => !value)}
                  className="shrink-0 text-xs text-jade-sage transition-colors hover:text-jade-jade"
                >
                  {showAddNote ? 'Cancel' : '+ Keep a moment'}
                </button>
              </div>

              {showAddNote && (
                <div className="mb-8 rounded-xl border border-jade-sage/15 bg-jade-forest/5 p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {(['note', 'reflection', 'threshold'] as const).map((kind) => (
                      <button
                        key={kind}
                        onClick={() => setNoteKind(kind)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          noteKind === kind
                            ? 'border-jade-sage/35 bg-jade-forest/30 text-jade-jade'
                            : 'border-jade-forest/25 text-jade-mineral/65 hover:border-jade-sage/25'
                        }`}
                      >
                        {kind === 'note' ? 'Moment' : kind === 'threshold' ? 'Something shifted' : 'Reflection'}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                    rows={4}
                    placeholder={
                      noteKind === 'threshold'
                        ? 'What shifted?'
                        : noteKind === 'reflection'
                          ? 'What are you noticing?'
                          : 'What happened, or what do you want to remember?'
                    }
                    className="mb-3 w-full resize-none rounded-lg border border-jade-sage/15 bg-jade-shadow/40 px-3 py-3 text-sm text-jade-jade outline-none placeholder:text-jade-mineral/35 focus:border-jade-sage/40"
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote || !noteContent.trim()}
                    className="rounded-lg border border-jade-sage/25 bg-jade-forest/25 px-4 py-2 text-xs font-light text-jade-jade transition-colors hover:bg-jade-forest/40 disabled:opacity-40"
                  >
                    {savingNote ? 'Keeping...' : 'Keep this'}
                  </button>
                </div>
              )}

              <RelationshipTimeline entries={entries} />
            </section>
          )}

          {mode === 'field' && (
            <section className="mx-auto max-w-2xl">
              <div className="mb-9">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-jade-mineral/45">Field</p>
                <h2 className="text-2xl font-extralight text-jade-jade">What seems to happen between you?</h2>
                <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-jade-mineral/60">
                  Patterns here are working perceptions, not verdicts. Fresh experience can revise them at any time.
                </p>
              </div>

              {!hasFieldMaterial ? (
                <div className="rounded-xl border border-jade-sage/10 px-5 py-7">
                  <p className="text-sm font-light leading-relaxed text-jade-mineral/65">
                    There is not enough history yet to say much about the field. That is not a gap to fill. Let it emerge from lived moments.
                  </p>
                  <button
                    onClick={() => setMode('now')}
                    className="mt-5 text-xs text-jade-sage transition-colors hover:text-jade-jade"
                  >
                    Return to what is alive now
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {fieldState && (
                    <div className="rounded-xl border border-jade-sage/15 bg-jade-forest/5 p-5">
                      <div className="mb-4 flex flex-wrap items-center gap-4">
                        <span className="text-xs uppercase tracking-[0.16em] text-jade-mineral/45">Recent atmosphere</span>
                        <FieldToneIndicator tone={fieldState.fieldTone} size="md" />
                      </div>

                      {fieldState.dominantPattern && (
                        <div className="mb-4">
                          <p className="mb-1 text-xs text-jade-mineral/45">Something MAIA is noticing</p>
                          <p className="text-sm font-light leading-relaxed text-jade-jade/85">{fieldState.dominantPattern}</p>
                        </div>
                      )}

                      {fieldState.activeSignals && fieldState.activeSignals.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs text-jade-mineral/45">Present in recent check-ins</p>
                          <div className="flex flex-wrap gap-2">
                            {fieldState.activeSignals.map((signal) => (
                              <span key={signal} className="rounded-full border border-jade-sage/12 px-2.5 py-1 text-xs text-jade-mineral/65">
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {unresolvedThreads.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-jade-mineral/45">Still open</p>
                      <div className="space-y-3">
                        {unresolvedThreads.map((thread, index) => (
                          <div key={`${thread.type}-${index}`} className="border-l border-jade-copper/25 pl-4">
                            <p className="text-sm font-light leading-relaxed text-jade-mineral/75">{thread.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-jade-sage/10 pt-7">
                    <p className="mb-4 text-xs uppercase tracking-[0.16em] text-jade-mineral/45">Look more closely</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push(`/labtools/relational-field?relationshipId=${id}`)}
                        className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-jade-forest/10"
                      >
                        <div className="text-sm font-light text-jade-jade">Sense the movement</div>
                        <p className="mt-1 text-xs font-light text-jade-mineral/55">Stay close to tone, movement, and what remains unresolved.</p>
                      </button>
                      <button
                        onClick={() => router.push(`/labtools/dynamics-map?relationshipId=${id}`)}
                        className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-jade-forest/10"
                      >
                        <div className="text-sm font-light text-jade-jade">Look at recurrence</div>
                        <p className="mt-1 text-xs font-light text-jade-mineral/55">Explore a possible pattern without turning it into an identity.</p>
                      </button>
                      <button
                        onClick={() => router.push(`/labtools/repair-path?relationshipId=${id}`)}
                        className="w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-jade-forest/10"
                      >
                        <div className="text-sm font-light text-jade-jade">When something has broken</div>
                        <p className="mt-1 text-xs font-light text-jade-mineral/55">Consider repair, distance, boundary, or ending without presuming which is right.</p>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setMode('now')}
                    className="text-xs text-jade-sage transition-colors hover:text-jade-jade"
                  >
                    Return to now
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
