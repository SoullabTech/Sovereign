'use client';

/**
 * GANESHA'S FOCUS GARDEN
 *
 * A sacred space for transforming scattered attention into clear intention.
 * Not a productivity hack. A wisdom practice.
 *
 * "Your scattered attention isn't broken machinery—
 *  it's discriminatory wisdom refusing to commit to wrong paths."
 *
 * Design Philosophy:
 * - Dune aesthetic: Desert tones, spice warmth, sacred simplicity
 * - Elegant: Clean lines, generous space, careful typography
 * - Everyday: Accessible, not intimidating
 * - Integral: Each phase flows naturally
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type Phase =
  | 'welcome'
  | 'obstacle'
  | 'gate-1'
  | 'gate-2'
  | 'gate-3'
  | 'blessing'
  | 'emergence';

interface Obstacle {
  name: string;
  reframe?: string;
}

interface FocusGardenProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (result: FocusGardenResult) => void;
  initialContext?: string; // What the user said that triggered this
  memberId?: string; // For weight tracking and pattern saving
}

export interface FocusGardenResult {
  obstacle: Obstacle;
  gateAnswers: {
    protecting: string;
    accept: string;
    smallAction: string;
  };
  chosenAction: string;
  completedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GANESHA'S WISDOM
// ═══════════════════════════════════════════════════════════════════════════════

const OBSTACLE_REFRAMES: Record<string, string> = {
  'too many': "You haven't yet chosen what deserves your full attention",
  'can\'t start': "Something wants to be understood before beginning",
  'overwhelmed': "Your system is asking for one clear priority",
  'distracted': "Your attention is searching for what matters",
  'stuck': "You're at a gate, not a wall",
  'procrastinating': "Part of you knows this isn't the right approach yet",
  'scattered': "Your mind is surveying possibilities before commitment",
  'foggy': "Clarity is forming beneath the surface",
  'tired': "Your energy is asking to be directed, not depleted",
  'anxious': "Your system senses something important that needs attention",
};

function getReframe(obstacleName: string): string {
  const lower = obstacleName.toLowerCase();
  for (const [key, reframe] of Object.entries(OBSTACLE_REFRAMES)) {
    if (lower.includes(key)) {
      return reframe;
    }
  }
  return "This obstacle carries information. Let's listen to it.";
}

const GATE_QUESTIONS = {
  1: {
    question: "What might this obstacle be protecting you from?",
    hint: "Obstacles often guard us from something we're not ready to face",
  },
  2: {
    question: "What would you have to accept if this obstacle dissolved right now?",
    hint: "Sometimes we maintain blocks because the alternative requires change",
  },
  3: {
    question: "What small action would honor both the obstacle and the goal?",
    hint: "Not forcing through. Not giving up. A third way.",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function FocusGarden({
  isOpen,
  onClose,
  onComplete,
  initialContext,
  memberId,
}: FocusGardenProps) {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [obstacle, setObstacle] = useState<Obstacle>({ name: '' });
  const [gateAnswers, setGateAnswers] = useState({
    protecting: '',
    accept: '',
    smallAction: '',
  });
  const [chosenAction, setChosenAction] = useState('');
  const hasLoggedVisit = useRef(false);

  // Log garden visit when opened (weight = 1)
  useEffect(() => {
    if (isOpen && memberId && !hasLoggedVisit.current) {
      hasLoggedVisit.current = true;
      fetch('/api/focus/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, action: 'visit' }),
      }).catch(() => {
        // Silent - weight tracking shouldn't block experience
      });
    }
    if (!isOpen) {
      hasLoggedVisit.current = false;
    }
  }, [isOpen, memberId]);

  const reset = useCallback(() => {
    setPhase('welcome');
    setObstacle({ name: '' });
    setGateAnswers({ protecting: '', accept: '', smallAction: '' });
    setChosenAction('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleComplete = useCallback(async () => {
    const result: FocusGardenResult = {
      obstacle,
      gateAnswers,
      chosenAction: gateAnswers.smallAction || chosenAction,
      completedAt: new Date(),
    };

    // Log completion to backend (weight tracking + optional pattern save)
    try {
      await fetch('/api/focus/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          action: 'complete',
          obstacle,
          gateAnswers,
          chosenAction: result.chosenAction,
          savePattern: false, // TODO: Add UI toggle for Steward+ members
        }),
      });
    } catch (err) {
      // Silent - weight tracking shouldn't block completion
      console.warn('[FocusGarden] API call failed:', err);
    }

    if (onComplete) {
      onComplete(result);
    }
    handleClose();
  }, [obstacle, gateAnswers, chosenAction, onComplete, handleClose, memberId]);

  const nextPhase = useCallback(() => {
    const phases: Phase[] = [
      'welcome',
      'obstacle',
      'gate-1',
      'gate-2',
      'gate-3',
      'blessing',
      'emergence',
    ];
    const currentIndex = phases.indexOf(phase);
    if (currentIndex < phases.length - 1) {
      setPhase(phases[currentIndex + 1]);
    }
  }, [phase]);

  const handleObstacleSubmit = useCallback(() => {
    if (obstacle.name.trim()) {
      setObstacle({
        name: obstacle.name,
        reframe: getReframe(obstacle.name),
      });
      nextPhase();
    }
  }, [obstacle.name, nextPhase]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-desert-dark/80 backdrop-blur-sm z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Main Container */}
          <motion.div
            className="fixed inset-x-4 top-[10vh] bottom-[10vh] md:inset-x-auto md:left-1/2 md:w-[480px] md:-translate-x-1/2
                       bg-gradient-to-b from-[#2A1F1A] via-[#1F1814] to-[#1A1410]
                       rounded-2xl z-[10000] overflow-hidden
                       border border-spice-sand/20 shadow-spice-lg"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-spice-sand/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🐘</span>
                <h2 className="font-cormorant text-xl text-dune-amber tracking-wide">
                  Focus Garden
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-spice-sand/10 transition-colors"
              >
                <X className="w-5 h-5 text-spice-sand/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              <AnimatePresence mode="wait">
                {/* WELCOME */}
                {phase === 'welcome' && (
                  <PhaseContainer key="welcome">
                    <GaneshaSpeak>
                      The scattered mind isn't broken machinery.
                      It's a thousand scouts sent out before you knew where to go.
                    </GaneshaSpeak>
                    <p className="text-sand-white/70 text-base leading-relaxed mt-6">
                      Let's find which obstacle is actually a gate—
                      and which path is worthy of your full attention.
                    </p>
                    <ActionButton onClick={nextPhase}>
                      Begin
                    </ActionButton>
                  </PhaseContainer>
                )}

                {/* OBSTACLE NAMING */}
                {phase === 'obstacle' && (
                  <PhaseContainer key="obstacle">
                    <GaneshaSpeak>
                      Name the obstacle. What stands between you and focus right now?
                    </GaneshaSpeak>
                    <p className="text-spice-sand/60 text-sm mt-2 mb-6">
                      Not the task. The block. What's in the way?
                    </p>
                    <textarea
                      value={obstacle.name}
                      onChange={(e) => setObstacle({ ...obstacle, name: e.target.value })}
                      placeholder="Too many things to do... Can't decide where to start... Everything feels urgent..."
                      className="w-full h-28 bg-desert-dark/50 border border-spice-sand/20 rounded-xl
                                 px-4 py-3 text-sand-white placeholder-spice-sand/40
                                 focus:outline-none focus:border-spice-orange/50 focus:ring-1 focus:ring-spice-orange/20
                                 resize-none font-raleway text-base"
                      autoFocus
                    />
                    <ActionButton
                      onClick={handleObstacleSubmit}
                      disabled={!obstacle.name.trim()}
                    >
                      This is my obstacle
                    </ActionButton>
                  </PhaseContainer>
                )}

                {/* GATE 1 */}
                {phase === 'gate-1' && (
                  <PhaseContainer key="gate-1">
                    {obstacle.reframe && (
                      <div className="mb-6 p-4 bg-spice-orange/10 border border-spice-orange/20 rounded-xl">
                        <p className="text-spice-glow text-sm font-medium mb-1">Ganesha sees:</p>
                        <p className="text-sand-white/90 italic">"{obstacle.reframe}"</p>
                      </div>
                    )}
                    <GateQuestion
                      number={1}
                      question={GATE_QUESTIONS[1].question}
                      hint={GATE_QUESTIONS[1].hint}
                      value={gateAnswers.protecting}
                      onChange={(v) => setGateAnswers({ ...gateAnswers, protecting: v })}
                      onNext={nextPhase}
                    />
                  </PhaseContainer>
                )}

                {/* GATE 2 */}
                {phase === 'gate-2' && (
                  <PhaseContainer key="gate-2">
                    <GateQuestion
                      number={2}
                      question={GATE_QUESTIONS[2].question}
                      hint={GATE_QUESTIONS[2].hint}
                      value={gateAnswers.accept}
                      onChange={(v) => setGateAnswers({ ...gateAnswers, accept: v })}
                      onNext={nextPhase}
                    />
                  </PhaseContainer>
                )}

                {/* GATE 3 */}
                {phase === 'gate-3' && (
                  <PhaseContainer key="gate-3">
                    <GateQuestion
                      number={3}
                      question={GATE_QUESTIONS[3].question}
                      hint={GATE_QUESTIONS[3].hint}
                      value={gateAnswers.smallAction}
                      onChange={(v) => setGateAnswers({ ...gateAnswers, smallAction: v })}
                      onNext={nextPhase}
                    />
                  </PhaseContainer>
                )}

                {/* BLESSING (Optional Grounding) */}
                {phase === 'blessing' && (
                  <PhaseContainer key="blessing">
                    <GaneshaSpeak>
                      Before you go, would you like a moment of grounding?
                    </GaneshaSpeak>
                    <p className="text-sand-white/70 text-sm mt-4 mb-6">
                      Not meditation. Just presence. Movement allowed. Eyes open.
                      Your body knows how to focus. Let's ask it.
                    </p>
                    <div className="space-y-3">
                      <BlessingOption
                        title="30 seconds"
                        description="Three deep breaths, feet on ground"
                        onClick={() => {
                          // Could add timer/guidance here
                          nextPhase();
                        }}
                      />
                      <BlessingOption
                        title="Skip for now"
                        description="Go directly to your action"
                        onClick={nextPhase}
                        subtle
                      />
                    </div>
                  </PhaseContainer>
                )}

                {/* EMERGENCE */}
                {phase === 'emergence' && (
                  <PhaseContainer key="emergence">
                    <div className="text-center mb-8">
                      <Sparkles className="w-8 h-8 text-spice-orange mx-auto mb-4" />
                      <h3 className="font-cormorant text-2xl text-dune-amber mb-2">
                        Your One Thing
                      </h3>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-spice-orange/10 to-bene-gesserit-gold/10
                                    border border-spice-orange/30 rounded-2xl mb-8">
                      <p className="text-sand-white text-lg leading-relaxed text-center">
                        {gateAnswers.smallAction || "The action that honors both obstacle and goal"}
                      </p>
                    </div>

                    <GaneshaSpeak>
                      The obstacle has become a gate.
                      Go. Your attention knows where it belongs now.
                    </GaneshaSpeak>

                    <ActionButton onClick={handleComplete} variant="gold">
                      Complete
                    </ActionButton>
                  </PhaseContainer>
                )}
              </AnimatePresence>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 py-4 border-t border-spice-sand/10">
              <ProgressDots phase={phase} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function PhaseContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-[300px] flex flex-col"
    >
      {children}
    </motion.div>
  );
}

function GaneshaSpeak({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-cormorant text-xl text-sand-white leading-relaxed">
      {children}
    </p>
  );
}

function GateQuestion({
  number,
  question,
  hint,
  value,
  onChange,
  onNext,
}: {
  number: number;
  question: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-spice-orange/20 flex items-center justify-center
                        text-spice-orange font-medium text-sm">
          {number}
        </span>
        <span className="text-spice-sand/60 text-sm">Gate {number} of 3</span>
      </div>
      <GaneshaSpeak>{question}</GaneshaSpeak>
      <p className="text-spice-sand/50 text-sm mt-2 mb-6 italic">{hint}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Take your time..."
        className="w-full h-32 bg-desert-dark/50 border border-spice-sand/20 rounded-xl
                   px-4 py-3 text-sand-white placeholder-spice-sand/40
                   focus:outline-none focus:border-spice-orange/50 focus:ring-1 focus:ring-spice-orange/20
                   resize-none font-raleway text-base"
        autoFocus
      />
      <ActionButton onClick={onNext} disabled={!value.trim()}>
        Continue
        <ChevronRight className="w-4 h-4 ml-1" />
      </ActionButton>
    </>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'gold';
}) {
  const baseClasses = `
    mt-6 w-full py-3.5 rounded-xl font-raleway font-medium
    flex items-center justify-center gap-2
    transition-all duration-200
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    default: `
      bg-spice-orange/20 text-spice-glow border border-spice-orange/30
      hover:bg-spice-orange/30 hover:border-spice-orange/50
      active:scale-[0.98]
    `,
    gold: `
      bg-gradient-to-r from-spice-orange to-bene-gesserit-gold
      text-desert-dark font-semibold
      hover:shadow-spice active:scale-[0.98]
    `,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}

function BlessingOption({
  title,
  description,
  onClick,
  subtle,
}: {
  title: string;
  description: string;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl text-left transition-all duration-200
                  ${subtle
                    ? 'bg-transparent border border-spice-sand/10 hover:border-spice-sand/20'
                    : 'bg-spice-orange/10 border border-spice-orange/20 hover:bg-spice-orange/20'
                  }`}
    >
      <p className={`font-medium ${subtle ? 'text-spice-sand/60' : 'text-sand-white'}`}>
        {title}
      </p>
      <p className="text-sm text-spice-sand/50 mt-1">{description}</p>
    </button>
  );
}

function ProgressDots({ phase }: { phase: Phase }) {
  const phases: Phase[] = [
    'welcome',
    'obstacle',
    'gate-1',
    'gate-2',
    'gate-3',
    'blessing',
    'emergence',
  ];
  const currentIndex = phases.indexOf(phase);

  return (
    <div className="flex items-center justify-center gap-2">
      {phases.map((p, i) => (
        <div
          key={p}
          className={`w-2 h-2 rounded-full transition-all duration-300
                     ${i === currentIndex
                       ? 'bg-spice-orange w-6'
                       : i < currentIndex
                         ? 'bg-spice-orange/50'
                         : 'bg-spice-sand/20'
                     }`}
        />
      ))}
    </div>
  );
}

export default FocusGarden;
