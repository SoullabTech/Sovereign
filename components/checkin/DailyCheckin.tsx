'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { ELEMENT_TO_CHECKIN_THEME, CHECKIN_PARTICIPATORY_QUESTIONS } from '@/lib/maia/prompts/participatoryRealityPrompt';

/**
 * Daily Check-in Component
 *
 * A gentle emotional check-in for session openers.
 * Maps emotional states to elemental energies.
 */

export type EmotionalState = {
  id: string;
  label: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  emoji: string;
  description: string;
  color: string;
};

const emotionalStates: EmotionalState[] = [
  // Fire states - energy, passion, intensity
  { id: 'energized', label: 'Energized', element: 'fire', emoji: '🔥', description: 'Full of drive and motivation', color: 'from-orange-500 to-red-500' },
  { id: 'frustrated', label: 'Frustrated', element: 'fire', emoji: '😤', description: 'Blocked energy wanting release', color: 'from-red-600 to-orange-500' },
  { id: 'passionate', label: 'Passionate', element: 'fire', emoji: '💫', description: 'Deeply engaged with something', color: 'from-amber-500 to-orange-500' },

  // Water states - emotion, intuition, flow
  { id: 'peaceful', label: 'Peaceful', element: 'water', emoji: '🌊', description: 'Calm and flowing', color: 'from-blue-500 to-cyan-500' },
  { id: 'sad', label: 'Sad', element: 'water', emoji: '💧', description: 'Processing grief or loss', color: 'from-blue-600 to-indigo-500' },
  { id: 'intuitive', label: 'Intuitive', element: 'water', emoji: '🌙', description: 'Connected to inner knowing', color: 'from-indigo-500 to-blue-500' },

  // Earth states - stability, body, grounding
  { id: 'grounded', label: 'Grounded', element: 'earth', emoji: '🌿', description: 'Stable and present', color: 'from-green-500 to-emerald-500' },
  { id: 'tired', label: 'Tired', element: 'earth', emoji: '🪨', description: 'Body asking for rest', color: 'from-stone-500 to-green-600' },
  { id: 'steady', label: 'Steady', element: 'earth', emoji: '🌳', description: 'Rooted and reliable', color: 'from-emerald-600 to-green-500' },

  // Air states - mind, communication, clarity
  { id: 'curious', label: 'Curious', element: 'air', emoji: '💨', description: 'Mind open and exploring', color: 'from-yellow-400 to-amber-400' },
  { id: 'anxious', label: 'Anxious', element: 'air', emoji: '🌀', description: 'Thoughts spinning', color: 'from-amber-500 to-yellow-400' },
  { id: 'clear', label: 'Clear', element: 'air', emoji: '✨', description: 'Mental clarity and focus', color: 'from-yellow-300 to-amber-300' },

  // Aether states - spirit, connection, transcendence
  { id: 'connected', label: 'Connected', element: 'aether', emoji: '🔮', description: 'In touch with something greater', color: 'from-violet-500 to-purple-500' },
  { id: 'lost', label: 'Lost', element: 'aether', emoji: '🌫️', description: 'Seeking direction or meaning', color: 'from-purple-600 to-violet-500' },
  { id: 'grateful', label: 'Grateful', element: 'aether', emoji: '🙏', description: 'Appreciating what is', color: 'from-amber-400 to-violet-400' },
];

const intensityLevels = [
  { value: 1, label: 'Whisper', description: 'Barely there' },
  { value: 2, label: 'Gentle', description: 'Present but soft' },
  { value: 3, label: 'Clear', description: 'Definitely feeling it' },
  { value: 4, label: 'Strong', description: 'Can\'t ignore it' },
  { value: 5, label: 'Overwhelming', description: 'All-consuming' },
];

interface DailyCheckinProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (checkin: {
    state: EmotionalState;
    intensity: number;
    note?: string;
    reflectionTheme?: string;
    reflectionResponse?: string;
  }) => void;
  showReflectionStep?: boolean; // participatoryReality feature flag — default false
}

export function DailyCheckin({ isOpen, onClose, onComplete, showReflectionStep = false }: DailyCheckinProps) {
  const [step, setStep] = useState<'state' | 'intensity' | 'note' | 'reflection'>('state');
  const [selectedState, setSelectedState] = useState<EmotionalState | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const handleStateSelect = (state: EmotionalState) => {
    setSelectedState(state);
    setStep('intensity');
  };

  const handleIntensitySelect = (level: number) => {
    setIntensity(level);
    setStep('note');
  };

  const resetAll = () => {
    setStep('state');
    setSelectedState(null);
    setIntensity(3);
    setNote('');
    setReflectionResponse('');
  };

  const handleComplete = (skipReflection = false) => {
    if (selectedState) {
      const reflectionThemeKey = ELEMENT_TO_CHECKIN_THEME[selectedState.element];
      onComplete({
        state: selectedState,
        intensity,
        note: note.trim() || undefined,
        reflectionTheme: (!skipReflection && reflectionResponse.trim()) ? reflectionThemeKey : undefined,
        reflectionResponse: (!skipReflection && reflectionResponse.trim()) ? reflectionResponse.trim() : undefined,
      });
    }
    resetAll();
  };

  const handleSkipNote = () => {
    if (selectedState && showReflectionStep) {
      setStep('reflection');
      return;
    }
    if (selectedState) {
      onComplete({ state: selectedState, intensity });
    }
    resetAll();
  };

  // Group states by element
  const statesByElement = emotionalStates.reduce((acc, state) => {
    if (!acc[state.element]) acc[state.element] = [];
    acc[state.element].push(state);
    return acc;
  }, {} as Record<string, EmotionalState[]>);

  const elementOrder: Array<'fire' | 'water' | 'earth' | 'air' | 'aether'> = ['fire', 'water', 'earth', 'air', 'aether'];
  const elementLabels = {
    fire: { name: 'Fire', icon: '🔥', subtitle: 'Energy & Drive' },
    water: { name: 'Water', icon: '💧', subtitle: 'Emotion & Flow' },
    earth: { name: 'Earth', icon: '🌿', subtitle: 'Body & Stability' },
    air: { name: 'Air', icon: '💨', subtitle: 'Mind & Thought' },
    aether: { name: 'Aether', icon: '✨', subtitle: 'Spirit & Connection' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[101] overflow-hidden"
          >
            <div className="h-full bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 rounded-2xl border border-amber-900/30 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-amber-900/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-medium text-amber-100">
                    {step === 'state' && 'How are you arriving?'}
                    {step === 'intensity' && `How strong is this ${selectedState?.label.toLowerCase()}?`}
                    {step === 'note' && 'Anything else present?'}
                    {step === 'reflection' && 'One more thing —'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {/* Step 1: Select emotional state */}
                  {step === 'state' && (
                    <motion.div
                      key="state"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <p className="text-sm text-stone-400 text-center">
                        Take a breath. What's most alive in you right now?
                      </p>

                      {elementOrder.map((element) => (
                        <div key={element} className="space-y-2">
                          <div
                            className="flex items-center gap-2 text-xs text-stone-500"
                            onMouseEnter={() => setHoveredElement(element)}
                            onMouseLeave={() => setHoveredElement(null)}
                          >
                            <span>{elementLabels[element].icon}</span>
                            <span className="uppercase tracking-wider">{elementLabels[element].name}</span>
                            <span className="text-stone-600">— {elementLabels[element].subtitle}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {statesByElement[element]?.map((state) => (
                              <motion.button
                                key={state.id}
                                onClick={() => handleStateSelect(state)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                  px-4 py-2 rounded-xl text-sm font-medium transition-all
                                  bg-gradient-to-r ${state.color} bg-opacity-20
                                  border border-white/10 hover:border-white/30
                                  text-white/90 hover:text-white
                                  shadow-lg hover:shadow-xl
                                `}
                              >
                                <span className="mr-2">{state.emoji}</span>
                                {state.label}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Step 2: Select intensity */}
                  {step === 'intensity' && selectedState && (
                    <motion.div
                      key="intensity"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Selected state display */}
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${selectedState.color} bg-opacity-20 border border-white/10`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{selectedState.emoji}</span>
                          <div>
                            <div className="font-medium text-white">{selectedState.label}</div>
                            <div className="text-sm text-white/60">{selectedState.description}</div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-stone-400 text-center">
                        How present is this feeling?
                      </p>

                      <div className="space-y-3">
                        {intensityLevels.map((level) => (
                          <motion.button
                            key={level.value}
                            onClick={() => handleIntensitySelect(level.value)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                              w-full p-4 rounded-xl text-left transition-all
                              ${intensity === level.value
                                ? 'bg-amber-500/20 border-amber-500/50'
                                : 'bg-stone-800/50 border-stone-700/50 hover:bg-stone-800'
                              }
                              border
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-stone-200">{level.label}</div>
                                <div className="text-sm text-stone-500">{level.description}</div>
                              </div>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < level.value ? 'bg-amber-400' : 'bg-stone-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      <button
                        onClick={() => setStep('state')}
                        className="text-sm text-stone-500 hover:text-amber-300 transition-colors"
                      >
                        ← Choose different feeling
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3: Optional note */}
                  {step === 'note' && selectedState && (
                    <motion.div
                      key="note"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Summary */}
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${selectedState.color} bg-opacity-20 border border-white/10`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{selectedState.emoji}</span>
                          <div>
                            <div className="font-medium text-white">
                              {selectedState.label} — {intensityLevels[intensity - 1].label}
                            </div>
                            <div className="text-sm text-white/60">{selectedState.description}</div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-stone-400 text-center">
                        Is there anything specific stirring? (optional)
                      </p>

                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="A few words about what's present..."
                        className="w-full h-24 p-4 rounded-xl bg-stone-800/50 border border-stone-700/50
                                   text-stone-200 placeholder:text-stone-600 resize-none
                                   focus:outline-none focus:border-amber-500/50"
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={handleSkipNote}
                          className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
                        >
                          Skip
                        </button>
                        <button
                          onClick={() => {
                            if (showReflectionStep) {
                              setStep('reflection');
                            } else {
                              handleComplete();
                            }
                          }}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium hover:from-amber-500 hover:to-amber-400 transition-all"
                        >
                          {showReflectionStep ? 'Continue' : 'Begin Session'}
                        </button>
                      </div>

                      <button
                        onClick={() => setStep('intensity')}
                        className="text-sm text-stone-500 hover:text-amber-300 transition-colors"
                      >
                        ← Adjust intensity
                      </button>
                    </motion.div>
                  )}
                  {/* Step 4: Optional reflection question (participatory lens) */}
                  {step === 'reflection' && selectedState && (() => {
                    const themeKey = ELEMENT_TO_CHECKIN_THEME[selectedState.element];
                    const question = CHECKIN_PARTICIPATORY_QUESTIONS[themeKey];
                    return (
                      <motion.div
                        key="reflection"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <p className="text-sm text-stone-400 text-center italic">
                          {question}
                        </p>

                        <textarea
                          value={reflectionResponse}
                          onChange={(e) => setReflectionResponse(e.target.value)}
                          placeholder="A few words, or nothing at all..."
                          className="w-full h-24 p-4 rounded-xl bg-stone-800/50 border border-stone-700/50
                                     text-stone-200 placeholder:text-stone-600 resize-none
                                     focus:outline-none focus:border-amber-500/50"
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleComplete(true)}
                            className="flex-1 py-3 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => handleComplete(false)}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium hover:from-amber-500 hover:to-amber-400 transition-all"
                          >
                            Begin Session
                          </button>
                        </div>

                        <button
                          onClick={() => setStep('note')}
                          className="text-sm text-stone-500 hover:text-amber-300 transition-colors"
                        >
                          ← Back
                        </button>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Compact inline version for quick check-ins
export function QuickCheckin({
  onSelect
}: {
  onSelect: (state: EmotionalState) => void
}) {
  const quickStates = emotionalStates.filter(s =>
    ['energized', 'peaceful', 'tired', 'anxious', 'grateful'].includes(s.id)
  );

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <span className="w-full text-center text-xs text-stone-500 mb-1">
        How are you arriving today?
      </span>
      {quickStates.map((state) => (
        <motion.button
          key={state.id}
          onClick={() => onSelect(state)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-stone-800/50 hover:bg-stone-700/50 transition-colors"
          title={state.label}
        >
          <span className="text-lg">{state.emoji}</span>
        </motion.button>
      ))}
    </div>
  );
}

export { emotionalStates };
export default DailyCheckin;
