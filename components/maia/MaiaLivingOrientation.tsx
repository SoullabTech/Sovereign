'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── State machine ──────────────────────────────────────────────────────────────

type OrientationStep =
  | 'root_options'
  | 'typing'
  | 'understand_options'
  | 'creating_options'
  | 'know_self_options'
  | 'curious_options';

type RootKey = 'understand' | 'creating' | 'know_self' | 'curious';

// ── Root doors — ways of arriving, not feature destinations ───────────────────

const ROOT_OPTIONS: { key: RootKey; label: string; glyph: string }[] = [
  { key: 'understand', label: 'I want to understand something',  glyph: '🌱' },
  { key: 'creating',   label: 'I\'m creating something',         glyph: '🔥' },
  { key: 'know_self',  label: 'I want to know myself better',    glyph: '🌊' },
  { key: 'curious',    label: 'I\'m just curious',               glyph: '🌎' },
];

// ── Branch invitations — these are the prompts that start the conversation ────

const BRANCH_OPTIONS: Record<RootKey, { label: string; prompt: string }[]> = {
  understand: [
    { label: 'Help me understand something that\'s been on my mind.',  prompt: 'Help me understand something that\'s been on my mind.' },
    { label: 'Reflect with me.',                                        prompt: 'I\'d like to reflect on something. Let\'s begin.' },
    { label: 'Help me untangle a situation.',                           prompt: 'Help me untangle a situation I\'ve been in.' },
  ],
  creating: [
    { label: 'Help me shape an idea.',          prompt: 'I have an idea I\'d like to shape. Help me think it through.' },
    { label: 'Explore a project with me.',      prompt: 'I\'m working on a project. Let\'s explore it together.' },
    { label: 'Think something through.',        prompt: 'I need to think something through carefully.' },
  ],
  know_self: [
    { label: 'Explore a dream.',                         prompt: 'I\'d like to explore a dream I had.' },
    { label: 'Help me understand a relationship.',       prompt: 'Help me understand a relationship that\'s on my mind.' },
    { label: 'Notice patterns with me.',                 prompt: 'I\'ve been noticing a pattern in my life. Help me look at it.' },
  ],
  curious: [
    { label: 'What can you actually do?',  prompt: 'What can we actually do together? I\'m still figuring that out.' },
    { label: 'Show me around.',            prompt: 'I\'d like a sense of what\'s possible here. Show me around a little.' },
    { label: 'Surprise me.',               prompt: 'Surprise me with one way we could begin.' },
  ],
};

const BRANCH_INTROS: Record<RootKey, string> = {
  understand: 'Where would you like to begin?',
  creating:   'What are you building?',
  know_self:  'Which feels closest to where you are?',
  curious:    'Good place to start. Here are a few doors.',
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
        setTimeout(() => setStep(nextStep), 250);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [step, selectedRoot]);

  function handleRootSelect(key: RootKey) {
    setSelectedRoot(key);
    setStep('typing');
  }

  const branchOptions = selectedRoot ? BRANCH_OPTIONS[selectedRoot] : [];
  const isInBranch = step !== 'root_options' && step !== 'typing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto px-2"
    >
      {/* MAIA presence line */}
      <AnimatePresence mode="wait">
        {step === 'root_options' && (
          <motion.p
            key="root-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-stone-400 text-sm mb-5 text-center leading-relaxed"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            People come here for many different reasons.<br />
            We can begin anywhere.
          </motion.p>
        )}
        {step === 'typing' && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-3 mb-2"
          >
            <span className="text-stone-600 text-xs tracking-widest animate-pulse">· · ·</span>
          </motion.div>
        )}
        {isInBranch && (
          <motion.p
            key="branch-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-stone-400 text-sm mb-4 text-center"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {introText}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Root — 4 ways of arriving */}
        {step === 'root_options' && (
          <motion.div key="root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            {ROOT_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleRootSelect(opt.key)}
                className="text-left px-4 py-3 rounded-lg border border-stone-800 text-stone-300 text-sm hover:border-stone-600 hover:text-stone-100 hover:bg-stone-900/50 transition-all duration-200 flex items-center gap-3"
              >
                <span className="text-base">{opt.glyph}</span>
                <span>{opt.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Branch — specific invitations */}
        {isInBranch && (
          <motion.div key="branch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            {branchOptions.map((opt, i) => (
              <motion.button
                key={opt.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onPromptSelect(opt.prompt)}
                className="text-left px-4 py-3 rounded-lg border border-stone-800 text-stone-300 text-sm hover:border-amber-800/60 hover:text-stone-100 hover:bg-stone-900/50 transition-all duration-200"
              >
                {opt.label}
              </motion.button>
            ))}
            <button
              onClick={() => { setStep('root_options'); setSelectedRoot(null); setIntroText(''); }}
              className="text-stone-700 text-xs mt-1 hover:text-stone-500 transition-colors text-left px-1"
            >
              ← back
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission line + escape */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-center space-y-2"
      >
        {step === 'root_options' && (
          <p className="text-stone-700 text-xs leading-relaxed">
            You don&apos;t need to know what you need.<br />
            Many conversations begin with &ldquo;I&apos;m not sure why I&apos;m here.&rdquo;
          </p>
        )}
        <button
          onClick={onDismiss}
          className="text-stone-700 text-xs hover:text-stone-500 transition-colors"
        >
          Or just tell me what&apos;s here →
        </button>
      </motion.div>
    </motion.div>
  );
}
