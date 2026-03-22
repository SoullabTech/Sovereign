'use client';

/**
 * FieldEssenceInterview
 *
 * A master authors their field through guided conversation.
 * Not a form. Not a wizard. A calm, spacious, lightly guided interview.
 *
 * Five modules. Each one surfaces a different facet.
 * MAIA listens, reflects, synthesizes. The master corrects what felt off.
 *
 * "This is not profile setup. This is something else."
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MasterField } from '@/lib/masters/types';
import type {
  MasterFieldProfile,
  InterviewModule,
  InterviewSession,
  InterviewTurn,
  CorrectionEditType,
} from '@/lib/masters/profile';

// ─────────────────────────────────────────────────────────────────────────────
// Interview structure — the questions, in order
// ─────────────────────────────────────────────────────────────────────────────

type ModuleDef = {
  id: InterviewModule;
  title: string;
  invitation: string; // one line that opens the space
  questions: string[];
};

const MODULES: ModuleDef[] = [
  {
    id: 'presence',
    title: 'Presence',
    invitation: 'Begin with what people feel when they arrive.',
    questions: [
      'What happens when someone enters your field — your space, your session, your work?',
      'What do people feel with you that they rarely feel elsewhere?',
      'What pace do you naturally keep? What do you slow down for?',
    ],
  },
  {
    id: 'paradox',
    title: 'Paradox',
    invitation: 'Every real field holds something in tension.',
    questions: [
      'What two qualities must both be present for your work to feel true?',
      'What do you hold together that most people think are opposites?',
      'What gets lost when only one side of that shows?',
    ],
  },
  {
    id: 'boundaries',
    title: 'Boundaries',
    invitation: 'What must not be mistaken about you.',
    questions: [
      'What would feel false in a digital representation of you?',
      'What should a version of you — even an intelligent one — never assume, claim, or imitate?',
      'Who is this work not for? Say it plainly.',
    ],
  },
  {
    id: 'world',
    title: 'World',
    invitation: 'Your aesthetic home. The materials of your field.',
    questions: [
      'What kind of beauty feels like home to your work?',
      'What places, textures, light, or materials belong in your field?',
      'What symbols, images, or sounds do you return to? What must never appear?',
      'Who are the different kinds of people who come to you? What does each group need from you that the others don\'t?',
    ],
  },
  {
    id: 'becoming',
    title: 'Becoming',
    invitation: 'What is alive in your work right now.',
    questions: [
      'What is changing in your work, your practice, or how you understand what you do?',
      'What is no longer true about you that others still assume?',
      'What is emerging now that your field doesn\'t yet reflect?',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Stage =
  | 'landing'
  | 'module-intro'
  | 'question'
  | 'synthesizing'
  | 'synthesis-review'
  | 'complete';

interface Props {
  master: MasterField;
  initialProfile?: MasterFieldProfile;
  onComplete?: () => void;
}

export default function FieldEssenceInterview({ master, initialProfile, onComplete }: Props) {
  const { palette, theme, shortName } = master;
  const isSpacious = theme.density === 'spacious';

  // ── State ────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>('landing');
  const [moduleIndex, setModuleIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [input, setInput] = useState('');
  const [synthesis, setSynthesis] = useState('');
  const [synthesisStructured, setSynthesisStructured] = useState<Record<string, unknown>>({});
  const [correctionInput, setCorrectionInput] = useState('');
  const [feltReaction, setFeltReaction] = useState('');
  const [editType, setEditType] = useState<CorrectionEditType | null>(null);
  const [synthesisViewedAt, setSynthesisViewedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentModule = MODULES[moduleIndex];
  const completedModules = initialProfile?.raw.interviewSessions
    .filter(s => s.completedAt)
    .map(s => s.module) ?? [];

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, stage]);

  // ── Styles ───────────────────────────────────────────────────────────────
  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.62rem',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: `${palette.text}38`,
  };

  const bodyText: React.CSSProperties = {
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.9rem',
    color: `${palette.text}75`,
    lineHeight: 1.75,
  };

  const primaryBtn = (disabled = false): React.CSSProperties => ({
    display: 'inline-block',
    padding: '0.8rem 2rem',
    background: disabled ? `${palette.primary}40` : palette.primary,
    color: palette.background,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.2s',
  });

  const ghostBtn: React.CSSProperties = {
    background: 'transparent',
    color: `${palette.text}45`,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem 0',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 1.25rem',
    background: `${palette.primary}06`,
    border: `1px solid ${palette.primary}22`,
    borderRadius: '2px',
    color: palette.text,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.92rem',
    lineHeight: 1.75,
    resize: 'vertical',
    outline: 'none',
    minHeight: '120px',
  };

  // ── Interview actions ────────────────────────────────────────────────────

  const startModule = useCallback(() => {
    const firstQuestion = currentModule.questions[0];
    setTurns([
      { role: 'interviewer', content: firstQuestion, timestamp: new Date().toISOString() },
    ]);
    setQuestionIndex(0);
    setInput('');
    setStage('question');
  }, [currentModule]);

  const submitAnswer = async () => {
    if (!input.trim() || saving) return;

    const masterTurn: InterviewTurn = {
      role: 'master',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newTurns = [...turns, masterTurn];
    setTurns(newTurns);
    setInput('');

    const nextQIndex = questionIndex + 1;
    if (nextQIndex < currentModule.questions.length) {
      // Next question
      const nextQuestion = currentModule.questions[nextQIndex];
      setTimeout(() => {
        setTurns(t => [
          ...t,
          { role: 'interviewer', content: nextQuestion, timestamp: new Date().toISOString() },
        ]);
        setQuestionIndex(nextQIndex);
      }, 600);
    } else {
      // All questions answered — save session then synthesize
      setSynthesizing(true);
      setStage('synthesizing');
      await saveAndSynthesize(newTurns);
    }
  };

  const saveAndSynthesize = async (completedTurns: InterviewTurn[]) => {
    setSaving(true);
    setError(null);

    const session: InterviewSession = {
      module: currentModule.id,
      completedAt: new Date().toISOString(),
      turns: completedTurns,
    };

    try {
      // Save session
      await fetch(`/api/masters/${master.slug}/author`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-session', session }),
      });

      // Synthesize
      const synthRes = await fetch(`/api/masters/${master.slug}/author`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'synthesize', module: currentModule.id }),
      });

      if (!synthRes.ok) throw new Error('Synthesis failed');
      const { synthesis: synthData } = await synthRes.json();
      setSynthesis(synthData.narrativeSummary ?? '');
      setSynthesisStructured(synthData.structuredData ?? {});
      setSynthesisViewedAt(Date.now());
      setFeltReaction('');
      setEditType(null);
      setStage('synthesis-review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStage('question'); // fall back, let them retry
    } finally {
      setSaving(false);
      setSynthesizing(false);
    }
  };

  const handleCorrection = async () => {
    const timeSpent = synthesisViewedAt
      ? Math.round((Date.now() - synthesisViewedAt) / 1000)
      : 0;
    const hasCorrection = !!correctionInput.trim();

    const acceptanceSignals = {
      accepted_as_is: !hasCorrection,
      edited: hasCorrection,
      re_recorded: false,
      time_spent_seconds: timeSpent,
      firstFeltReaction: feltReaction.trim() || undefined,
    };

    if (!hasCorrection) {
      // No correction — approved as-is
      await fetch(`/api/masters/${master.slug}/author`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          section: currentModule.id,
          acceptanceSignals,
        }),
      });
    } else {
      // Log the correction with delta
      await fetch(`/api/masters/${master.slug}/author`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'correct',
          section: currentModule.id,
          whatWasFalse: synthesis,
          correction: correctionInput.trim(),
          rawWords: correctionInput.trim(),
          original: synthesis,
          corrected: correctionInput.trim(),
          editType: editType ?? undefined,
          acceptanceSignals,
        }),
      });
    }
    advanceModule();
  };

  const advanceModule = () => {
    setCorrectionInput('');
    setSynthesis('');
    setSynthesisStructured({});
    setFeltReaction('');
    setEditType(null);
    setSynthesisViewedAt(null);
    setTurns([]);

    if (moduleIndex + 1 < MODULES.length) {
      setModuleIndex(i => i + 1);
      setQuestionIndex(0);
      setStage('module-intro');
    } else {
      setStage('complete');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submitAnswer();
    }
  };

  // ── Breath divider ───────────────────────────────────────────────────────
  const BreathMark = ({ height = '2.5rem' }: { height?: string }) => (
    <div
      style={{
        width: '1px',
        height,
        background: `linear-gradient(to bottom, transparent, ${palette.primary}45, transparent)`,
        margin: '0 auto',
      }}
    />
  );

  // ── Module progress dots ─────────────────────────────────────────────────
  const ModuleProgress = () => (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
      {MODULES.map((m, i) => {
        const done = completedModules.includes(m.id) || i < moduleIndex;
        const current = i === moduleIndex && stage !== 'landing' && stage !== 'complete';
        return (
          <div
            key={m.id}
            title={m.title}
            style={{
              width: current ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: done
                ? palette.primary
                : current
                ? `${palette.primary}80`
                : `${palette.primary}20`,
              transition: 'all 0.4s ease',
            }}
          />
        );
      })}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STAGES
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main
      className="relative min-h-screen"
      style={{ backgroundColor: palette.background }}
    >
      {/* Top ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background: `linear-gradient(to bottom, ${palette.primary}07 0%, transparent 100%)`,
        }}
      />

      <div
        className="relative z-10 mx-auto"
        style={{
          maxWidth: '560px',
          padding: isSpacious ? '5rem 2rem 6rem' : '3.5rem 2rem 5rem',
        }}
      >
        {/* ── LANDING ───────────────────────────────────────────────────── */}
        {stage === 'landing' && (
          <div>
            <p style={{ ...sectionLabel, marginBottom: '2.5rem' }}>Field Authoring</p>

            <h1
              style={{
                fontFamily: 'var(--field-font-display)',
                fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
                fontWeight: 300,
                color: palette.text,
                lineHeight: 1.25,
                marginBottom: '1.5rem',
              }}
            >
              Let's build your field, {shortName}.
            </h1>

            <p style={{ ...bodyText, marginBottom: '1rem' }}>
              Not a profile. A field.
            </p>
            <p style={{ ...bodyText, marginBottom: '3rem' }}>
              Five short conversations. Each one surfaces something distinct about how you work,
              what you hold, and what must remain unmistakably yours.
              Answer in whatever way feels natural — as much or as little as you need.
            </p>

            <div
              style={{
                padding: '1.5rem',
                border: `1px solid ${palette.primary}18`,
                background: `${palette.primary}04`,
                marginBottom: '3rem',
              }}
            >
              {MODULES.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '0.6rem 0',
                    borderBottom: i < MODULES.length - 1
                      ? `1px solid ${palette.primary}12`
                      : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.7rem',
                      color: palette.primary,
                      minWidth: '14px',
                      marginTop: '0.1rem',
                    }}
                  >
                    {i + 1}.
                  </span>
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '0.85rem',
                        color: palette.text,
                        display: 'block',
                        marginBottom: '0.15rem',
                      }}
                    >
                      {m.title}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '0.78rem',
                        color: `${palette.text}50`,
                      }}
                    >
                      {m.invitation}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button style={primaryBtn()} onClick={() => setStage('module-intro')}>
              Begin
            </button>
          </div>
        )}

        {/* ── MODULE INTRO ──────────────────────────────────────────────── */}
        {stage === 'module-intro' && (
          <div style={{ textAlign: 'center' }}>
            <ModuleProgress />

            <p style={{ ...sectionLabel, marginBottom: '1.5rem' }}>
              {moduleIndex + 1} of {MODULES.length}
            </p>

            <BreathMark height="3rem" />
            <div style={{ margin: '2.5rem 0' }}>
              <h2
                style={{
                  fontFamily: 'var(--field-font-display)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                  fontWeight: 300,
                  color: palette.text,
                  lineHeight: 1.3,
                  marginBottom: '1rem',
                }}
              >
                {currentModule.title}
              </h2>
              <p style={{ ...bodyText, color: `${palette.text}60` }}>
                {currentModule.invitation}
              </p>
            </div>
            <BreathMark height="3rem" />

            <div style={{ marginTop: '2.5rem' }}>
              <button style={primaryBtn()} onClick={startModule}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── QUESTION / CONVERSATION ───────────────────────────────────── */}
        {(stage === 'question' || stage === 'synthesizing') && (
          <div>
            <ModuleProgress />

            <p style={{ ...sectionLabel, marginBottom: '2rem' }}>
              {currentModule.title}
            </p>

            {/* Conversation turns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2.5rem' }}>
              {turns.map((turn, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: turn.role === 'interviewer'
                        ? `${palette.primary}80`
                        : `${palette.text}35`,
                    }}
                  >
                    {turn.role === 'interviewer' ? 'Field' : shortName}
                  </span>
                  <p
                    style={{
                      fontFamily: turn.role === 'interviewer'
                        ? 'var(--field-font-display)'
                        : 'var(--field-font-body)',
                      fontSize: turn.role === 'interviewer' ? '1.05rem' : '0.92rem',
                      fontWeight: turn.role === 'interviewer' ? 300 : 400,
                      color: turn.role === 'interviewer'
                        ? palette.text
                        : `${palette.text}75`,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {turn.content}
                  </p>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>

            {/* Synthesizing state */}
            {stage === 'synthesizing' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 0',
                  color: `${palette.text}40`,
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: palette.primary,
                    animation: 'field-pulse 1.2s ease-in-out infinite',
                  }}
                />
                <span style={{ fontFamily: 'var(--field-font-body)', fontSize: '0.82rem' }}>
                  This is what I&apos;m hearing from you…
                </span>
              </div>
            )}

            {/* Input — only when in question stage */}
            {stage === 'question' && (
              <div>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Take your time…"
                  style={inputStyle}
                  autoFocus
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.65rem',
                      color: `${palette.text}28`,
                    }}
                  >
                    ⌘↵ to continue
                  </span>
                  <button
                    style={primaryBtn(!input.trim())}
                    disabled={!input.trim()}
                    onClick={submitAnswer}
                  >
                    {questionIndex < currentModule.questions.length - 1
                      ? 'Continue →'
                      : 'Complete Module'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SYNTHESIS REVIEW ──────────────────────────────────────────── */}
        {stage === 'synthesis-review' && (
          <div>
            <ModuleProgress />

            <p style={{ ...sectionLabel, marginBottom: '2rem' }}>
              This is what I&apos;m hearing from you
            </p>

            <p
              style={{
                fontFamily: 'var(--field-font-display)',
                fontSize: '1.05rem',
                fontWeight: 300,
                color: palette.text,
                lineHeight: 1.75,
                marginBottom: currentModule.id === 'paradox' ? '2rem' : '2.5rem',
              }}
            >
              {synthesis}
            </p>

            {/* Paradox: surface the tension explicitly when reviewing the paradox module */}
            {currentModule.id === 'paradox' && (() => {
              const paradox = (synthesisStructured as { paradox?: { statement?: string; bothMustBeTrue?: string; whatGetsFlattenedWithout?: string } }).paradox;
              if (!paradox?.statement) return null;
              return (
                <div
                  style={{
                    padding: '1.5rem',
                    border: `1px solid ${palette.primary}25`,
                    background: `${palette.primary}05`,
                    marginBottom: '2.5rem',
                  }}
                >
                  <p style={{ ...sectionLabel, marginBottom: '0.75rem' }}>The Paradox</p>
                  <p
                    style={{
                      fontFamily: 'var(--field-font-display)',
                      fontSize: '1rem',
                      fontWeight: 300,
                      color: palette.text,
                      lineHeight: 1.6,
                      marginBottom: paradox.bothMustBeTrue ? '1rem' : 0,
                    }}
                  >
                    {paradox.statement}
                  </p>
                  {paradox.bothMustBeTrue && (
                    <p style={{ ...bodyText, fontSize: '0.82rem', color: `${palette.text}55` }}>
                      {paradox.bothMustBeTrue}
                    </p>
                  )}
                  {paradox.whatGetsFlattenedWithout && (
                    <p style={{ ...bodyText, fontSize: '0.78rem', color: `${palette.text}40`, marginTop: '0.5rem' }}>
                      Without both: {paradox.whatGetsFlattenedWithout}
                    </p>
                  )}
                </div>
              );
            })()}

            <BreathMark />

            <div style={{ marginTop: '2rem' }}>
              {/* Felt reaction — pre-analytic, before reasoning kicks in */}
              <p
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.82rem',
                  color: `${palette.text}55`,
                  marginBottom: '0.6rem',
                }}
              >
                Take a moment. What&apos;s your first felt reaction?
              </p>
              <textarea
                value={feltReaction}
                onChange={e => setFeltReaction(e.target.value)}
                placeholder="A word, a line — whatever comes first…"
                rows={2}
                style={{ ...inputStyle, minHeight: '56px', marginBottom: '1.75rem', fontSize: '0.85rem' }}
              />

              <p
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.78rem',
                  color: `${palette.text}50`,
                  marginBottom: '0.4rem',
                }}
              >
                Refine this. It&apos;s meant to be shaped.
              </p>
              <p
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.72rem',
                  color: `${palette.text}35`,
                  marginBottom: '1rem',
                }}
              >
                If something is off — name it. Corrections matter as much as answers.
                If it&apos;s right, continue.
              </p>

              <textarea
                value={correctionInput}
                onChange={e => setCorrectionInput(e.target.value)}
                placeholder="That's not quite it — what I meant was…"
                rows={4}
                style={{ ...inputStyle, minHeight: '80px' }}
              />

              {/* Edit type — quiet, optional, only shown when there's a correction */}
              {correctionInput.trim() && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  {(
                    [
                      ['tone_adjustment', 'tone'],
                      ['precision', 'precision'],
                      ['boundary', 'boundary'],
                      ['paradox_fix', 'paradox'],
                      ['misread', 'misread'],
                    ] as [CorrectionEditType, string][]
                  ).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => setEditType(t => t === type ? null : type)}
                      style={{
                        background: editType === type ? `${palette.primary}18` : 'transparent',
                        border: `1px solid ${editType === type ? palette.primary : `${palette.primary}20`}`,
                        color: editType === type ? palette.primary : `${palette.text}35`,
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem',
                  alignItems: 'center',
                }}
              >
                {correctionInput.trim() ? (
                  <button style={primaryBtn()} onClick={handleCorrection}>
                    Note correction and continue
                  </button>
                ) : (
                  <>
                    <button style={primaryBtn()} onClick={handleCorrection}>
                      {moduleIndex + 1 < MODULES.length ? `Next: ${MODULES[moduleIndex + 1].title} →` : 'Complete →'}
                    </button>
                    <button style={ghostBtn} onClick={handleCorrection}>
                      That feels true
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <p
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.8rem',
                  color: '#8B3020',
                  marginTop: '1rem',
                }}
              >
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── COMPLETE ──────────────────────────────────────────────────── */}
        {stage === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <BreathMark height="3rem" />

            <div style={{ margin: '2.5rem 0 3rem' }}>
              <p style={{ ...sectionLabel, marginBottom: '2rem' }}>Field Authoring</p>

              <h2
                style={{
                  fontFamily: 'var(--field-font-display)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 300,
                  color: palette.text,
                  lineHeight: 1.3,
                  marginBottom: '1.5rem',
                }}
              >
                Your field knows more of you now.
              </h2>

              <p style={{ ...bodyText, color: `${palette.text}60`, marginBottom: '1rem' }}>
                What you shared has been woven into the field — your presence,
                your paradox, your boundaries, your world, what you are becoming.
              </p>
              <p style={{ ...bodyText, color: `${palette.text}45` }}>
                Return whenever your work shifts. The field evolves with you.
              </p>
            </div>

            <BreathMark height="3rem" />

            <div style={{ marginTop: '2.5rem' }}>
              <button
                style={primaryBtn()}
                onClick={onComplete ?? (() => window.location.href = `/fields/${master.slug}`)}
              >
                Return to Your Field
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe for synthesis pulse */}
      <style>{`
        @keyframes field-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </main>
  );
}
