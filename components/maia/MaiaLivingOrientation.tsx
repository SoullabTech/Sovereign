'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── State machine ──────────────────────────────────────────────────────────────

type OrientationStep =
  | 'root_options'
  | 'typing'
  | 'practical_options'
  | 'personal_options'
  | 'curious_options';

// ── Option definitions ─────────────────────────────────────────────────────────

const ROOT_OPTIONS = [
  { key: 'practical', label: 'I came with something practical' },
  { key: 'personal',  label: 'I came with something personal'  },
  { key: 'curious',   label: "I'm just curious"                },
] as const;

type RootKey = typeof ROOT_OPTIONS[number]['key'];

const BRANCH_OPTIONS: Record<RootKey, { label: string; prompt: string }[]> = {
  practical: [
    { label: 'Help me organize something',     prompt: 'Help me organize something I\'ve been putting off.' },
    { label: 'Help me write something',        prompt: 'Help me write something — I\'ll tell you what it is.' },
    { label: 'Help me make a decision',        prompt: 'Help me think through a decision I\'m facing.' },
    { label: 'Help me develop an idea',        prompt: 'I have an idea I\'d like to develop. Let me tell you about it.' },
  ],
  personal: [
    { label: 'Help me reflect on an experience',         prompt: 'Help me understand an experience that\'s still with me.' },
    { label: 'Help me understand a relationship',        prompt: 'Help me understand what happened in a relationship that is still affecting me.' },
    { label: 'Help me explore a dream or symbol',        prompt: 'I had a dream — or something keeps recurring — and I\'d like to explore it.' },
    { label: 'Help me return to myself',                 prompt: 'I\'ve been feeling scattered. Help me return to myself.' },
  ],
  curious: [
    { label: 'Show me what MAIA can do',  prompt: 'What else can we do together?' },
    { label: 'Surprise me',               prompt: 'Surprise me with one way we could begin.' },
    { label: 'Ask me a question',         prompt: 'Ask me something. I\'ll see where it goes.' },
    { label: "Let's wander",              prompt: "I don't know where to start. Let's just begin." },
  ],
};

const BRANCH_INTROS: Record<RootKey, string> = {
  practical: 'We can begin with something concrete. What fits?',
  personal:  'Some things need more than thinking. Where does this live?',
  curious:   "Good place to start. Let's find a door that fits.",
};

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  onPromptSelect: (prompt: string) => void;
  onDismiss: () => void;
}

export function MaiaLivingOrientation({ onPromptSelect, onDismiss }: Props) {
  const [step, setStep] = useState<OrientationStep>('root_options');
  const [selectedRoot, setSelectedRoot] = useState<RootKey | null>(null);
  const [introText, setIntroText] = useState('');

  // Typing animation — reveal intro character by character
  useEffect(() => {
    if (step !== 'typing' || !selectedRoot) return;
    const full = BRANCH_INTROS[selectedRoot];
    let i = 0;
    setIntroText('');
    const interval = setInterval(() => {
      i++;
      setIntroText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(interval);
        const nextStep = `${selectedRoot}_options` as OrientationStep;
        setTimeout(() => setStep(nextStep), 300);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [step, selectedRoot]);

  function handleRootSelect(key: RootKey) {
    setSelectedRoot(key);
    setStep('typing');
  }

  const branchOptions = selectedRoot ? BRANCH_OPTIONS[selectedRoot] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto px-2"
    >
      {/* MAIA intro line */}
      <p
        className="text-stone-400 text-sm mb-5 text-center"
        style={{ fontFamily: 'Spectral, Georgia, serif' }}
      >
        {step === 'root_options'
          ? "Let's begin with where you are. You don't need to know what to ask yet."
          : introText}
      </p>

      <AnimatePresence mode="wait">
        {/* Root — 3 doors */}
        {step === 'root_options' && (
          <motion.div
            key="root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            {ROOT_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleRootSelect(opt.key)}
                className="text-left px-4 py-3 rounded-lg border border-stone-800 text-stone-300 text-sm hover:border-stone-600 hover:text-stone-100 hover:bg-stone-900/50 transition-all duration-200"
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Typing state */}
        {step === 'typing' && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-4"
          >
            <span className="text-stone-600 text-xs tracking-widest animate-pulse">· · ·</span>
          </motion.div>
        )}

        {/* Branch options */}
        {(step === 'practical_options' || step === 'personal_options' || step === 'curious_options') && (
          <motion.div
            key="branch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2"
          >
            {branchOptions.map((opt, i) => (
              <motion.button
                key={opt.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onPromptSelect(opt.prompt)}
                className="text-left px-4 py-3 rounded-lg border border-stone-800 text-stone-300 text-sm hover:border-amber-800/60 hover:text-stone-100 hover:bg-stone-900/50 transition-all duration-200 group"
              >
                <span>{opt.label}</span>
                <span className="block text-stone-600 text-xs mt-0.5 group-hover:text-stone-500 italic">
                  "{opt.prompt.length > 60 ? opt.prompt.slice(0, 57) + '…' : opt.prompt}"
                </span>
              </motion.button>
            ))}

            {/* Back */}
            <button
              onClick={() => { setStep('root_options'); setSelectedRoot(null); setIntroText(''); }}
              className="text-stone-700 text-xs mt-1 hover:text-stone-500 transition-colors text-left px-1"
            >
              ← back
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-available escape */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 text-center"
      >
        <button
          onClick={onDismiss}
          className="text-stone-700 text-xs hover:text-stone-500 transition-colors"
        >
          Or just tell me what's here →
        </button>
      </motion.div>
    </motion.div>
  );
}
