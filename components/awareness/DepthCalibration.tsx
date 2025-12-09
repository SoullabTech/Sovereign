'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Brain, Atom } from 'lucide-react';
import type { AwarenessLevel, SessionPreference } from '@/lib/awareness/awarenessModel';

interface DepthCalibrationProps {
  type: 'initial' | 'session';
  currentLevel?: AwarenessLevel;
  onSelection: (selection: AwarenessLevel | SessionPreference) => void;
  onSkip?: () => void;
}

export default function DepthCalibration({
  type,
  currentLevel,
  onSelection,
  onSkip
}: DepthCalibrationProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fluid pixel design - options morph based on calibration type
  const calibrationData = type === 'initial' ? {
    title: "How deep do you want to go?",
    subtitle: "I can meet you at different levels of complexity and archetypal depth",
    options: [
      {
        value: 1,
        key: "gentle",
        label: "Gentle & simple",
        description: "Plain language, one step at a time, no jargon",
        icon: Sparkles,
        gradient: "from-emerald-400 to-teal-500",
        tone: "Keep it grounded and accessible"
      },
      {
        value: 2,
        key: "processAware",
        label: "Process-aware",
        description: "Some pattern language and Spiralogic, but still accessible",
        icon: Compass,
        gradient: "from-blue-400 to-indigo-500",
        tone: "Gentle introduction to archetypal thinking"
      },
      {
        value: 3,
        key: "archetypal",
        label: "Full archetypal",
        description: "Spiralogic, elements, astrology, depth psychology - the works",
        icon: Brain,
        gradient: "from-purple-400 to-violet-500",
        tone: "Complete consciousness technology access"
      }
    ]
  } : {
    title: "How much depth today?",
    subtitle: `For today's conversation, how would you like me to meet you?`,
    options: [
      {
        value: "light",
        key: "light",
        label: "Keep it light and simple",
        description: "Gentle approach today - less complexity",
        icon: Sparkles,
        gradient: "from-emerald-400 to-teal-500",
        tone: "Simple and grounding"
      },
      {
        value: "normal",
        key: "normal",
        label: "Normal depth is fine",
        description: `Your usual level ${currentLevel ? `(Level ${currentLevel})` : ''}`,
        icon: Compass,
        gradient: "from-blue-400 to-indigo-500",
        tone: "Your familiar depth"
      },
      {
        value: "deep",
        key: "deep",
        label: "Go full-on deep with me",
        description: "Extra depth and complexity today",
        icon: Atom,
        gradient: "from-purple-400 to-violet-500",
        tone: "Maximum consciousness engagement"
      }
    ]
  };

  const handleSelect = (option: any) => {
    setSelectedOption(option.key);

    // Fluid transition before selection
    setTimeout(() => {
      if (type === 'initial') {
        onSelection(option.value as AwarenessLevel);
      } else {
        onSelection(option.value as SessionPreference);
      }
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Fluid header - morphs based on context */}
      <div className="text-center mb-8">
        <motion.h2
          className="text-2xl font-light text-white mb-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {calibrationData.title}
        </motion.h2>

        <motion.p
          className="text-slate-300 text-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {calibrationData.subtitle}
        </motion.p>

        {type === 'initial' && (
          <motion.p
            className="text-teal-300/70 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            We can always adjust this later
          </motion.p>
        )}
      </div>

      {/* Disposable pixel options - fluid complexity */}
      <div className="space-y-4">
        {calibrationData.options.map((option, index) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.key;

          return (
            <motion.button
              key={option.key}
              onClick={() => handleSelect(option)}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 8 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSelected}
              className={`
                w-full p-6 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden
                ${isSelected
                  ? 'border-teal-400 bg-teal-400/20 shadow-lg shadow-teal-400/20'
                  : 'border-slate-600 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60'
                }
              `}
            >
              {/* Fluid background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-0 transition-opacity duration-300 ${
                isSelected ? 'opacity-10' : ''
              }`} />

              <div className="relative flex items-center gap-4">
                {/* Morphing icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? `bg-gradient-to-r ${option.gradient} shadow-lg`
                    : 'bg-slate-700'
                }`}>
                  <Icon className={`w-6 h-6 transition-colors duration-300 ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`} />
                </div>

                <div className="flex-1">
                  {/* Disposable complexity in labels */}
                  <h3 className={`font-medium text-lg transition-colors duration-300 ${
                    isSelected ? 'text-teal-300' : 'text-white'
                  }`}>
                    {option.label}
                  </h3>

                  <p className="text-slate-400 text-sm mt-1">
                    {option.description}
                  </p>

                  {/* Fluid tone indicator */}
                  <p className={`text-xs mt-2 transition-all duration-300 ${
                    isSelected ? 'text-teal-400/80' : 'text-slate-500'
                  }`}>
                    {option.tone}
                  </p>
                </div>

                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      className="w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Fluid skip option for session calibration */}
      {type === 'session' && onSkip && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            Skip for now
          </button>
        </motion.div>
      )}

      {/* Fluid visual elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </motion.div>
  );
}