'use client';

/**
 * FieldVirtualSelfTraining
 *
 * A master trains their Virtual Self inside their own field atmosphere.
 * Same mechanics as PersonaTraining — voice, framework, boundaries.
 * Different aesthetic: field palette, not sacred-gold/dark.
 *
 * "Not a tool. Not a bot. An extension of presence."
 */

import React, { useState, useEffect } from 'react';
import type { MasterField } from '@/lib/masters/types';
import { ENERGY_MEDICINE_TRAINING_PROMPTS } from '@/lib/masters/frameworks/energyMedicine';
import { useFeatureFlags } from '@/lib/utils/feature-flags';
import CorrectionsTab from './training/CorrectionsTab';
import ExamplesTab from './training/ExamplesTab';
import ToneTab from './training/ToneTab';
import BuildsTab from './training/BuildsTab';

interface Props {
  master: MasterField;
  /** Practitioner's ID in the Stellium system — required for saving training */
  practitionerId: string;
  /** Existing persona ID to continue training, if any */
  personaId?: string;
  onComplete?: () => void;
}

type TrainingStep = 'intro' | 'voice' | 'framework' | 'boundaries' | 'complete';

type TrainingPrompts = typeof ENERGY_MEDICINE_TRAINING_PROMPTS;

function getPrompts(_master: MasterField): TrainingPrompts {
  // All masters default to energy-medicine prompts for now.
  // Future: switch on master.maia.tone or modality.
  return ENERGY_MEDICINE_TRAINING_PROMPTS;
}

export default function FieldVirtualSelfTraining({
  master,
  practitionerId,
  personaId: initialPersonaId,
  onComplete,
}: Props) {
  const { palette, theme, shortName, name } = master;
  const prompts = getPrompts(master);
  const isSpacious = theme.density === 'spacious';
  const { flags } = useFeatureFlags();

  const [step, setStep] = useState<TrainingStep>('intro');
  const [personaId, setPersonaId] = useState<string | undefined>(initialPersonaId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Training tabs mode: show when persona exists AND feature flag is on
  type TrainingTab = 'corrections' | 'examples' | 'tone' | 'builds';
  const [activeTab, setActiveTab] = useState<TrainingTab>('corrections');
  const [hasPersona, setHasPersona] = useState(!!initialPersonaId);

  // Check if persona exists on mount (for returning practitioners)
  useEffect(() => {
    if (initialPersonaId) {
      setHasPersona(true);
      return;
    }
    // Check server for existing persona
    async function check() {
      try {
        const res = await fetch(`/api/stellium/personas?practitionerId=${practitionerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.persona?.id) {
            setPersonaId(data.persona.id);
            setHasPersona(true);
          }
        }
      } catch {
        // silent — fall through to linear flow
      }
    }
    check();
  }, [practitionerId, initialPersonaId]);

  // If persona exists and flag is on → show tabbed training view
  if (hasPersona && flags.fieldTraining) {
    const tabs: { id: TrainingTab; label: string }[] = [
      { id: 'corrections', label: 'Corrections' },
      { id: 'examples', label: 'Examples' },
      { id: 'tone', label: 'Tone' },
      { id: 'builds', label: 'Builds' },
    ];

    return (
      <main
        className="relative min-h-screen"
        style={{ backgroundColor: palette.background }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64"
          style={{
            background: `linear-gradient(to bottom, ${palette.primary}08 0%, transparent 100%)`,
          }}
        />
        <div
          className="relative z-10 mx-auto max-w-2xl"
          style={{ padding: isSpacious ? '4rem 2rem 6rem' : '3rem 2rem 4rem' }}
        >
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: `${palette.text}40`,
              marginBottom: '0.75rem',
            }}>
              Virtual Self Training
            </p>
            <h1 style={{
              fontFamily: 'var(--field-font-display)',
              fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
              fontWeight: 300,
              color: palette.text,
              lineHeight: 1.25,
              marginBottom: '0.5rem',
            }}>
              Train Virtual {shortName}
            </h1>
            <p style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.85rem',
              color: `${palette.text}55`,
              lineHeight: 1.6,
            }}>
              Correct, shape, and build. Your loop: notice what's off, fix it, build.
            </p>
          </div>

          {/* Tab bar */}
          <div style={{
            display: 'flex',
            gap: '0',
            borderBottom: `1px solid ${palette.primary}20`,
            marginBottom: '2rem',
          }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === t.id
                    ? `2px solid ${palette.primary}`
                    : '2px solid transparent',
                  color: activeTab === t.id ? palette.text : `${palette.text}45`,
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'corrections' && (
            <CorrectionsTab fieldSlug={master.slug} palette={palette} />
          )}
          {activeTab === 'examples' && (
            <ExamplesTab fieldSlug={master.slug} palette={palette} />
          )}
          {activeTab === 'tone' && (
            <ToneTab fieldSlug={master.slug} palette={palette} />
          )}
          {activeTab === 'builds' && (
            <BuildsTab fieldSlug={master.slug} palette={palette} />
          )}
        </div>
      </main>
    );
  }

  // --- Below: original linear flow (intro → voice → framework → boundaries → complete) ---

  const [voiceContent, setVoiceContent] = useState('');
  const [frameworkContent, setFrameworkContent] = useState('');
  const [boundaryContent, setBoundaryContent] = useState('');

  const [trainingProgress, setTrainingProgress] = useState({
    voice: false,
    framework: false,
    boundaries: false,
  });

  // ---------------------------------------------------------------------------
  // Ensure persona exists before training
  // ---------------------------------------------------------------------------
  const ensurePersona = async (): Promise<string | null> => {
    if (personaId) return personaId;

    try {
      const res = await fetch('/api/stellium/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          fromTemplate: 'energy-medicine',
          persona_name: `Virtual ${shortName}`,
          modality: 'energy-medicine',
        }),
      });
      if (!res.ok) throw new Error('Could not create persona');
      const { persona } = await res.json();
      setPersonaId(persona.id);
      return persona.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not initialize Virtual Self');
      return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Training calls
  // ---------------------------------------------------------------------------
  const train = async (
    trainingType: 'voice' | 'framework' | 'boundaries',
    content: string,
    onSuccess: () => void
  ) => {
    setLoading(true);
    setError(null);

    const pid = await ensurePersona();
    if (!pid) { setLoading(false); return; }

    try {
      const res = await fetch('/api/stellium/maia/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practitionerId, personaId: pid, trainingType, content }),
      });
      if (!res.ok) throw new Error('Training failed');
      setTrainingProgress(prev => ({ ...prev, [trainingType]: true }));
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Shared styles
  // ---------------------------------------------------------------------------
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    background: `${palette.primary}08`,
    border: `1px solid ${palette.primary}30`,
    borderRadius: '2px',
    color: palette.text,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    resize: 'vertical' as const,
    outline: 'none',
  };

  const primaryBtn: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem',
    background: palette.primary,
    color: palette.background,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.78rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: '2px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'opacity 0.2s',
  };

  const ghostBtn: React.CSSProperties = {
    padding: '0.875rem 1.5rem',
    background: 'transparent',
    color: `${palette.text}50`,
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.72rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
  };

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.65rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: `${palette.text}40`,
    marginBottom: '1.25rem',
  };

  const stepTitle: React.CSSProperties = {
    fontFamily: 'var(--field-font-display)',
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: 300,
    color: palette.text,
    lineHeight: 1.3,
    marginBottom: '0.75rem',
  };

  const stepDesc: React.CSSProperties = {
    fontFamily: 'var(--field-font-body)',
    fontSize: '0.9rem',
    color: `${palette.text}65`,
    lineHeight: 1.7,
    marginBottom: '2rem',
  };

  // ---------------------------------------------------------------------------
  // Step: progress indicator
  // ---------------------------------------------------------------------------
  const steps: Array<{ id: TrainingStep; label: string }> = [
    { id: 'voice', label: 'Voice' },
    { id: 'framework', label: 'Framework' },
    { id: 'boundaries', label: 'Scope' },
  ];

  const stepIndex = steps.findIndex(s => s.id === step);

  const StepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '3rem' }}>
      {steps.map((s, i) => {
        const isDone = step === 'complete' || i < stepIndex;
        const isCurrent = s.id === step;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `1px solid ${isDone || isCurrent ? palette.primary : `${palette.primary}30`}`,
                  background: isDone ? palette.primary : isCurrent ? `${palette.primary}15` : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                }}
              >
                {isDone ? (
                  <span style={{ color: palette.background, fontSize: '0.65rem' }}>✓</span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.65rem',
                      color: isCurrent ? palette.primary : `${palette.text}30`,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isCurrent ? palette.primary : `${palette.text}35`,
                  marginTop: '0.4rem',
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: i < stepIndex ? palette.primary : `${palette.primary}20`,
                  margin: '0 0.5rem',
                  marginBottom: '1.4rem',
                  transition: 'background 0.3s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main
      className="relative min-h-screen"
      style={{ backgroundColor: palette.background }}
    >
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background: `linear-gradient(to bottom, ${palette.primary}08 0%, transparent 100%)`,
        }}
      />

      <div
        className="relative z-10 mx-auto max-w-xl"
        style={{ padding: isSpacious ? '5rem 2rem 6rem' : '3rem 2rem 4rem' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={sectionLabel}>Virtual Self Training</p>
          <h1
            style={{
              fontFamily: 'var(--field-font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              fontWeight: 300,
              color: palette.text,
              lineHeight: 1.25,
              marginBottom: '0.75rem',
            }}
          >
            Train Virtual {shortName}
          </h1>
          <p
            style={{
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.9rem',
              color: `${palette.text}60`,
              lineHeight: 1.65,
            }}
          >
            MAIA will hold your field for visitors — with your voice, your framework, and your
            scope. Not a replacement for your work. An extension of your presence.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '0.875rem 1rem',
              background: '#FFF0EE',
              border: '1px solid #E8C4BC',
              borderRadius: '2px',
              fontFamily: 'var(--field-font-body)',
              fontSize: '0.82rem',
              color: '#8B3020',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* INTRO                                                             */}
        {/* ----------------------------------------------------------------- */}
        {step === 'intro' && (
          <div>
            <div
              style={{
                padding: '2rem',
                border: `1px solid ${palette.primary}20`,
                background: `${palette.primary}05`,
                marginBottom: '2rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--field-font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 300,
                  color: palette.text,
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                }}
              >
                Three short steps. Each one teaches MAIA something distinct about how you work.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {steps.map((s, i) => (
                  <div
                    key={s.id}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '0.7rem',
                        color: palette.primary,
                        minWidth: '18px',
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
                        }}
                      >
                        {s.label === 'Voice' && 'Your Voice — how you speak, phrase, and pace'}
                        {s.label === 'Framework' && 'Your Framework — what EFT means in your practice'}
                        {s.label === 'Scope' && 'Your Scope — what you hold and what you refer out'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button style={primaryBtn} onClick={() => setStep('voice')}>
              Begin Training
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VOICE                                                             */}
        {/* ----------------------------------------------------------------- */}
        {step === 'voice' && (
          <div>
            <StepIndicator />
            <h2 style={stepTitle}>{prompts.voice.title}</h2>
            <p style={stepDesc}>{prompts.voice.description}</p>
            <textarea
              value={voiceContent}
              onChange={e => setVoiceContent(e.target.value)}
              placeholder={prompts.voice.placeholder}
              rows={10}
              style={inputStyle}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '1.25rem',
              }}
            >
              <button style={ghostBtn} onClick={() => { setStep('framework'); }}>
                Skip for now
              </button>
              <button
                style={{ ...primaryBtn, flex: 1 }}
                disabled={!voiceContent.trim() || loading}
                onClick={() =>
                  train('voice', voiceContent, () => {
                    setVoiceContent('');
                    setStep('framework');
                  })
                }
              >
                {loading ? 'Training…' : 'Train Voice →'}
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* FRAMEWORK                                                         */}
        {/* ----------------------------------------------------------------- */}
        {step === 'framework' && (
          <div>
            <StepIndicator />
            <h2 style={stepTitle}>{prompts.framework.title}</h2>
            <p style={stepDesc}>{prompts.framework.description}</p>
            <textarea
              value={frameworkContent}
              onChange={e => setFrameworkContent(e.target.value)}
              placeholder={prompts.framework.placeholder}
              rows={10}
              style={inputStyle}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '1.25rem',
              }}
            >
              <button style={ghostBtn} onClick={() => setStep('boundaries')}>
                Skip for now
              </button>
              <button
                style={{ ...primaryBtn, flex: 1 }}
                disabled={!frameworkContent.trim() || loading}
                onClick={() =>
                  train('framework', frameworkContent, () => {
                    setFrameworkContent('');
                    setStep('boundaries');
                  })
                }
              >
                {loading ? 'Training…' : 'Train Framework →'}
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* BOUNDARIES                                                        */}
        {/* ----------------------------------------------------------------- */}
        {step === 'boundaries' && (
          <div>
            <StepIndicator />
            <h2 style={stepTitle}>{prompts.boundaries.title}</h2>
            <p style={stepDesc}>{prompts.boundaries.description}</p>

            {/* Pre-loaded EFT scope */}
            <div
              style={{
                padding: '1rem 1.25rem',
                border: `1px solid ${palette.primary}18`,
                background: `${palette.primary}04`,
                marginBottom: '1.25rem',
              }}
            >
              <p style={{ ...sectionLabel, marginBottom: '0.75rem' }}>
                Virtual {shortName} already knows:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                {[
                  'Never claim tapping will cure or treat a medical condition',
                  'Do not diagnose or offer medical advice',
                  'Do not interpret what a sensation means — reflect it back',
                  'Ground and stabilize before anything else in acute distress',
                ].map((rule, i) => (
                  <li
                    key={i}
                    style={{
                      fontFamily: 'var(--field-font-body)',
                      fontSize: '0.8rem',
                      color: `${palette.text}55`,
                      paddingLeft: '0.875rem',
                      borderLeft: `1px solid ${palette.primary}25`,
                    }}
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <textarea
              value={boundaryContent}
              onChange={e => setBoundaryContent(e.target.value)}
              placeholder={prompts.boundaries.placeholder}
              rows={7}
              style={inputStyle}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '1.25rem',
              }}
            >
              <button style={ghostBtn} onClick={() => setStep('complete')}>
                Skip for now
              </button>
              <button
                style={{ ...primaryBtn, flex: 1 }}
                disabled={!boundaryContent.trim() || loading}
                onClick={() =>
                  train('boundaries', boundaryContent, () => {
                    setBoundaryContent('');
                    setStep('complete');
                  })
                }
              >
                {loading ? 'Training…' : 'Set Scope →'}
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* COMPLETE                                                          */}
        {/* ----------------------------------------------------------------- */}
        {step === 'complete' && (
          <div>
            {/* Breath mark */}
            <div
              style={{
                width: '1px',
                height: '3rem',
                background: `linear-gradient(to bottom, transparent, ${palette.primary}60, transparent)`,
                margin: '0 auto 3rem',
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <p style={sectionLabel}>{prompts.complete.successTitle}</p>
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
                Virtual {shortName} is ready.
              </h2>
              <p
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.9rem',
                  color: `${palette.text}60`,
                  lineHeight: 1.7,
                  marginBottom: '2.5rem',
                }}
              >
                {prompts.complete.successDescription}
              </p>

              {/* Progress summary */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2.5rem',
                  marginBottom: '3rem',
                }}
              >
                {steps.map(s => (
                  <div key={s.id} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '1rem',
                        color: trainingProgress[s.id as keyof typeof trainingProgress]
                          ? palette.primary
                          : `${palette.text}25`,
                        marginBottom: '0.3rem',
                      }}
                    >
                      {trainingProgress[s.id as keyof typeof trainingProgress] ? '✓' : '○'}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--field-font-body)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: `${palette.text}40`,
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontFamily: 'var(--field-font-body)',
                  fontSize: '0.8rem',
                  color: `${palette.text}40`,
                  marginBottom: '2rem',
                  lineHeight: 1.6,
                }}
              >
                Training deepens over time. Return whenever you want to refine your Virtual
                Self's voice, expand the framework, or adjust scope.
              </p>

              <button
                style={primaryBtn}
                onClick={onComplete ?? (() => window.history.back())}
              >
                {prompts.complete.continueLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
