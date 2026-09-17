'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Mic, X } from 'lucide-react';
import FieldToneIndicator from '@/components/relationships/FieldToneIndicator';
import CheckInFlow from '@/components/relationships/CheckInFlow';
import RelationshipTimeline, { type TimelineEntry } from '@/components/relationships/RelationshipTimeline';
import RelationshipModeNav, { type RelationshipMode } from '@/components/relationships/RelationshipModeNav';
import { OracleConversation } from '@/components/OracleConversation';
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

const MODE_ORDER: Record<RelationshipMode, number> = {
  now: 0,
  story: 1,
  field: 2,
};

export default function RelationshipDetailPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const id = params.id as string;

  const [relationship, setRelationship] = useState<RelationshipDetail | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [unresolvedThreads, setUnresolvedThreads] = useState<UnresolvedThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<RelationshipMode>('now');
  const [modeDirection, setModeDirection] = useState(0);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteKind, setNoteKind] = useState<'note' | 'reflection' | 'threshold'>('note');
  const [savingNote, setSavingNote] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [showMaia, setShowMaia] = useState(false);
  const [maiaEntryMode, setMaiaEntryMode] = useState<'voice' | 'text'>('voice');
  const [maiaSessionEpoch, setMaiaSessionEpoch] = useState(0);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  const fetchDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/relationships/${id}`);
      const data = await response.json();
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
      const response = await fetch(`/api/relationships/${id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: noteKind, content: noteContent.trim() }),
      });
      const data = await response.json();
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
      const response = await fetch(`/api/relationships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (response.ok) fetchDetail();
    } catch {
      // Renaming is non-load-bearing; leave the current label intact on failure.
    }
    setEditingName(false);
  };

  const changeMode = (nextMode: RelationshipMode) => {
    if (nextMode === mode) return;
    setModeDirection(Math.sign(MODE_ORDER[nextMode] - MODE_ORDER[mode]));
    setShowMaia(false);
    setShowCheckin(false);
    setMode(nextMode);
  };

  const openMaiaInPlace = (entryMode: 'voice' | 'text') => {
    if (!relationship) return;

    const occasion = relationship.note?.trim();
    const prompt = occasion
      ? `I want to explore my relationship with ${relationship.name}. What brought this relationship into view for me is: "${occasion}"`
      : `I want to explore what is alive in my relationship with ${relationship.name}.`;

    seedFromSource(
      'relationships:thread',
      prompt,
      {
        contextId: id,
        tone: 'supportive',
        returnTo: `/relationships/${id}`,
      }
    );

    setMaiaEntryMode(entryMode);
    setMaiaSessionEpoch((value) => value + 1);
    setShowCheckin(false);
    setShowMaia(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border border-jade-sage/30"
          style={{ borderTopColor: 'var(--jade-jade, #a8c7a0)' }}
        />
      </div>
    );
  }

  if (error || !relationship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-jade-mineral">{error || 'Not found'}</p>
          <button
            onClick={() => router.push('/relationships')}
            className="text-sm text-jade-sage transition-colors hover:text-jade-jade"
          >
            Back to relationships
          </button>
        </div>
      </div>
    );
  }

  const latestMovement = entries.find((entry) => entry.suggestedMovement)?.suggestedMovement;
  const latestMemberWords = entries.find((entry) => entry.freeText)?.freeText;
  const occasion = relationship.note?.trim() || null;
  const hasFieldMaterial = Boolean(
    fieldState ||
      unresolvedThreads.length > 0 ||
      entries.some(
        (entry) =>
          entry.patternHint &&
          entry.patternHint !== 'Not enough history yet.'
      )
  );

  const ambientPosition = {
    now: { x: -70, y: -20, scale: 1.08 },
    story: { x: 45, y: 90, scale: 0.94 },
    field: { x: 110, y: 15, scale: 1.16 },
  }[mode];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute left-1/2 top-24 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-jade-sage/[0.055] blur-[120px]"
          initial={false}
          animate={ambientPosition}
          transition={transition}
        />
        <motion.div
          className="absolute bottom-[-8rem] right-[-7rem] h-[28rem] w-[28rem] rounded-full bg-jade-copper/[0.035] blur-[110px]"
          initial={false}
          animate={{
            opacity: mode === 'field' ? 0.9 : 0.35,
            scale: mode === 'field' ? 1.12 : 0.9,
          }}
          transition={transition}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 py-9 md:px-8 md:py-12">
        <button
          onClick={() => router.push('/relationships')}
          className="mb-8 block text-xs text-jade-mineral/58 transition-colors hover:text-jade-sage"
        >
          ← Relationships
        </button>

        <motion.header layout className="mx-auto mb-8 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3">
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
                className="w-full max-w-xl border-b border-jade-sage/30 bg-transparent text-center text-4xl font-extralight tracking-wide text-jade-jade outline-none md:text-5xl"
              />
            ) : (
              <h1
                onClick={() => {
                  setEditName(relationship.name);
                  setEditingName(true);
                }}
                className="cursor-pointer text-4xl font-extralight tracking-wide text-jade-jade transition-colors hover:text-jade-sage md:text-5xl"
                title="Click to rename"
              >
                {relationship.name}
              </h1>
            )}
            {relationship.realm !== 'outer' && (
              <span className="text-xs capitalize text-jade-copper/70">
                {relationship.realm}
              </span>
            )}
          </div>

          {relationship.bondType && (
            <p className="mt-2 text-sm capitalize font-light text-jade-mineral/58">
              {relationship.bondType.replace(/_/g, ' ')}
            </p>
          )}
        </motion.header>

        <RelationshipModeNav value={mode} onChange={changeMode} />

        <main className="pt-9 md:pt-11">
          <AnimatePresence mode="wait" initial={false} custom={modeDirection}>
            {mode === 'now' && (
              <motion.section
                key="now"
                data-relationship-mode="now"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: modeDirection * 24, scale: 0.992 }
                }
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, x: modeDirection * -16, scale: 0.994 }
                }
                transition={transition}
                className={showMaia ? 'mx-auto max-w-5xl' : 'mx-auto max-w-2xl'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {showMaia ? (
                    <motion.div
                      key="maia"
                      data-relationship-maia
                      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                      transition={transition}
                      className="flex h-[min(76vh,820px)] min-h-[600px] flex-col overflow-hidden rounded-[1.8rem] border border-jade-sage/16 bg-jade-night/80 shadow-2xl backdrop-blur-sm"
                    >
                      <div className="flex shrink-0 items-center justify-between border-b border-jade-sage/10 px-5 py-3.5">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-jade-mineral/42">
                            With MAIA
                          </p>
                          <p className="mt-0.5 text-sm font-light text-jade-jade/78">
                            {relationship.name} remains in view
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMaia(false)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-jade-mineral/48 transition-colors hover:bg-jade-forest/15 hover:text-jade-jade"
                          aria-label="Return to relationship"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="min-h-0 flex-1">
                        <OracleConversation
                          key={`relationship-maia-${id}-${maiaSessionEpoch}`}
                          sessionId={`relationship-${id}-${maiaSessionEpoch}`}
                          presentationMode="contained"
                          initialShowChatInterface={maiaEntryMode === 'text'}
                          voiceEnabled
                          showAnalytics={false}
                          shouldRenderArrival={false}
                          surface="maia"
                          onSessionEnd={() => setShowMaia(false)}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="encounter"
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={transition}
                    >
                      {occasion ? (
                        <div className="mb-10" data-relationship-occasion>
                          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-jade-mineral/42">
                            What brought {relationship.name} into view
                          </p>
                          <blockquote className="border-l border-jade-sage/22 pl-5 text-xl font-extralight italic leading-relaxed text-jade-jade/84 md:text-2xl">
                            “{occasion}”
                          </blockquote>
                        </div>
                      ) : latestMemberWords ? (
                        <div className="mb-10">
                          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-jade-mineral/42">
                            From your last encounter
                          </p>
                          <blockquote className="border-l border-jade-sage/20 pl-5 text-lg font-light italic leading-relaxed text-jade-mineral/78">
                            “{latestMemberWords}”
                          </blockquote>
                        </div>
                      ) : null}

                      <div className="mb-9">
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-jade-mineral/40">
                          Now
                        </p>
                        <h2 className="text-2xl font-extralight leading-relaxed text-jade-jade md:text-3xl">
                          {occasion ? 'What feels alive about that now?' : 'What is alive between you now?'}
                        </h2>
                      </div>

                      {!showCheckin ? (
                        <div className="space-y-3">
                          <motion.button
                            type="button"
                            onClick={() => openMaiaInPlace('voice')}
                            whileHover={reduceMotion ? undefined : { y: -2 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.995 }}
                            className="group flex w-full items-center gap-4 rounded-2xl border border-jade-sage/22 bg-jade-forest/[0.10] px-5 py-5 text-left transition-colors hover:border-jade-sage/38 hover:bg-jade-forest/[0.17]"
                          >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-jade-sage/20 bg-jade-forest/18 text-jade-sage">
                              <Mic className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-base font-light text-jade-jade">
                                Talk with MAIA here
                              </span>
                              <span className="mt-1 block text-xs font-light leading-relaxed text-jade-mineral/58">
                                Speak inside this relationship space. The relational context stays with the conversation.
                              </span>
                            </span>
                          </motion.button>

                          <motion.button
                            type="button"
                            onClick={() => openMaiaInPlace('text')}
                            whileHover={reduceMotion ? undefined : { y: -1 }}
                            className="group flex w-full items-center gap-4 rounded-2xl border border-jade-sage/10 px-5 py-4 text-left transition-colors hover:border-jade-sage/24 hover:bg-jade-forest/[0.07]"
                          >
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-jade-sage/12 text-jade-mineral/70">
                              <MessageCircle className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-light text-jade-jade">
                                Write with MAIA
                              </span>
                              <span className="mt-1 block text-xs font-light text-jade-mineral/52">
                                Stay here and let the inquiry unfold in text.
                              </span>
                            </span>
                          </motion.button>

                          <button
                            type="button"
                            onClick={() => setShowCheckin(true)}
                            className="px-2 pt-3 text-left text-xs font-light text-jade-mineral/52 transition-colors hover:text-jade-sage"
                          >
                            Or begin quietly with what you are sensing →
                          </button>
                        </div>
                      ) : (
                        <motion.div
                          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={transition}
                          className="rounded-2xl border border-jade-sage/12 bg-jade-forest/[0.045] p-5 md:p-7"
                        >
                          <CheckInFlow
                            relationshipId={id}
                            relationshipName={relationship.name}
                            onComplete={handleCheckinComplete}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCheckin(false)}
                            className="mt-6 text-xs text-jade-mineral/48 transition-colors hover:text-jade-sage"
                          >
                            Return to now
                          </button>
                        </motion.div>
                      )}

                      {latestMovement && !showCheckin && (
                        <div className="mt-11 border-t border-jade-sage/10 pt-6">
                          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-jade-mineral/38">
                            Something to carry
                          </p>
                          <p className="text-sm font-light italic leading-relaxed text-jade-mineral/72">
                            {latestMovement}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}

            {mode === 'story' && (
              <motion.section
                key="story"
                data-relationship-mode="story"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: modeDirection * 24, scale: 0.992 }
                }
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, x: modeDirection * -16, scale: 0.994 }
                }
                transition={transition}
                className="mx-auto max-w-2xl"
              >
                <div className="mb-9 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-jade-mineral/40">
                      Story
                    </p>
                    <h2 className="text-2xl font-extralight text-jade-jade">
                      How did you get here?
                    </h2>
                    <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-jade-mineral/58">
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

                <AnimatePresence initial={false}>
                  {showAddNote && (
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0, y: -8 }}
                      transition={transition}
                      className="mb-8 overflow-hidden rounded-2xl border border-jade-sage/12 bg-jade-forest/[0.045] p-5"
                    >
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
                        className="mb-3 w-full resize-none border-0 border-b border-jade-sage/16 bg-transparent px-0 py-3 text-sm font-light leading-relaxed text-jade-jade outline-none placeholder:text-jade-mineral/30 focus:border-jade-sage/40"
                      />
                      <button
                        onClick={handleSaveNote}
                        disabled={savingNote || !noteContent.trim()}
                        className="rounded-full border border-jade-sage/25 bg-jade-forest/25 px-4 py-2 text-xs font-light text-jade-jade transition-colors hover:bg-jade-forest/40 disabled:opacity-40"
                      >
                        {savingNote ? 'Keeping…' : 'Keep this'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <RelationshipTimeline entries={entries} />
              </motion.section>
            )}

            {mode === 'field' && (
              <motion.section
                key="field"
                data-relationship-mode="field"
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: modeDirection * 24, scale: 0.992 }
                }
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, x: modeDirection * -16, scale: 0.994 }
                }
                transition={transition}
                className="mx-auto max-w-2xl"
              >
                <div className="mb-9">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-jade-mineral/40">
                    Field
                  </p>
                  <h2 className="text-2xl font-extralight text-jade-jade">
                    What seems to happen between you?
                  </h2>
                  <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-jade-mineral/58">
                    Patterns here are working perceptions, not verdicts. Fresh experience can revise them at any time.
                  </p>
                </div>

                {!hasFieldMaterial ? (
                  <div className="rounded-2xl border border-jade-sage/10 px-5 py-8">
                    <p className="text-sm font-light leading-relaxed text-jade-mineral/62">
                      There is not enough history yet to say much about the field. That is not a gap to fill. Let it emerge from lived moments.
                    </p>
                    <button
                      onClick={() => changeMode('now')}
                      className="mt-5 text-xs text-jade-sage transition-colors hover:text-jade-jade"
                    >
                      Return to what is alive now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-9">
                    {fieldState && (
                      <motion.div
                        layout
                        className="rounded-2xl border border-jade-sage/12 bg-jade-forest/[0.04] p-5"
                      >
                        <div className="mb-4 flex flex-wrap items-center gap-4">
                          <span className="text-[11px] uppercase tracking-[0.16em] text-jade-mineral/40">
                            Recent atmosphere
                          </span>
                          <FieldToneIndicator tone={fieldState.fieldTone} size="md" />
                        </div>

                        {fieldState.dominantPattern && (
                          <div className="mb-4 border-l border-jade-sage/20 pl-4">
                            <p className="mb-1 text-xs text-jade-mineral/42">
                              Something MAIA is noticing
                            </p>
                            <p className="text-sm font-light leading-relaxed text-jade-jade/82">
                              {fieldState.dominantPattern}
                            </p>
                          </div>
                        )}

                        {fieldState.activeSignals && fieldState.activeSignals.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs text-jade-mineral/42">
                              Present in recent check-ins
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {fieldState.activeSignals.map((signal) => (
                                <span
                                  key={signal}
                                  className="rounded-full border border-jade-sage/12 px-2.5 py-1 text-xs text-jade-mineral/62"
                                >
                                  {signal}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {unresolvedThreads.length > 0 && (
                      <div>
                        <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-jade-mineral/40">
                          Still open
                        </p>
                        <div className="space-y-3">
                          {unresolvedThreads.map((thread, index) => (
                            <div
                              key={`${thread.type}-${index}`}
                              className="border-l border-jade-copper/25 pl-4"
                            >
                              <p className="text-sm font-light leading-relaxed text-jade-mineral/72">
                                {thread.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-jade-sage/10 pt-7">
                      <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-jade-mineral/40">
                        Widen this view
                      </p>
                      <div className="space-y-1">
                        <motion.button
                          whileHover={reduceMotion ? undefined : { x: 4 }}
                          onClick={() => router.push(`/labtools/relational-field?relationshipId=${id}`)}
                          className="w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-jade-forest/[0.07]"
                        >
                          <div className="text-sm font-light text-jade-jade">Sense the movement</div>
                          <p className="mt-1 text-xs font-light text-jade-mineral/52">
                            Stay close to tone, movement, and what remains unresolved.
                          </p>
                        </motion.button>
                        <motion.button
                          whileHover={reduceMotion ? undefined : { x: 4 }}
                          onClick={() => router.push(`/labtools/dynamics-map?relationshipId=${id}`)}
                          className="w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-jade-forest/[0.07]"
                        >
                          <div className="text-sm font-light text-jade-jade">Look at recurrence</div>
                          <p className="mt-1 text-xs font-light text-jade-mineral/52">
                            Explore a possible pattern without turning it into an identity.
                          </p>
                        </motion.button>
                        <motion.button
                          whileHover={reduceMotion ? undefined : { x: 4 }}
                          onClick={() => router.push(`/labtools/repair-path?relationshipId=${id}`)}
                          className="w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-jade-forest/[0.07]"
                        >
                          <div className="text-sm font-light text-jade-jade">When something has broken</div>
                          <p className="mt-1 text-xs font-light text-jade-mineral/52">
                            Consider repair, distance, boundary, or ending without presuming which is right.
                          </p>
                        </motion.button>
                      </div>
                    </div>

                    <button
                      onClick={() => changeMode('now')}
                      className="text-xs text-jade-sage transition-colors hover:text-jade-jade"
                    >
                      Return to now
                    </button>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
