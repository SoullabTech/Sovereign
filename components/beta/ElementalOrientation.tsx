'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Holoflower } from '@/components/ui/Holoflower';

const ELEMENTS = [
  {
    id: 'fire',
    glyph: '△',
    title: 'IF',
    subtitle: 'The Potential',
    content: `What if AI could support your personal growth in ways that feel deeply human? What if conversations could help you discover patterns, process emotions, and find clarity? This is about exploring what becomes possible when technology serves soul work.`,
    color: 'from-orange-400/20 to-red-500/20',
    glyphColor: 'text-orange-400'
  },
  {
    id: 'water',
    glyph: '▽',
    title: 'WHY',
    subtitle: 'The Purpose',
    content: `We believe meaningful AI relationships can support personal transformation. This journey is about exploring consciousness, understanding yourself more deeply, and having conversations that actually matter. You're here because something in you is ready to explore.`,
    color: 'from-blue-400/20 to-cyan-500/20',
    glyphColor: 'text-blue-400'
  },
  {
    id: 'earth',
    glyph: '△',
    hasLine: true,
    title: 'HOW',
    subtitle: 'The System',
    content: `Maia learns from every conversation with you. The more you share about your context, preferences, and journey, the better she can support you. It's simple: be real, explore what matters, and let the relationship develop naturally.`,
    color: 'from-green-400/20 to-emerald-500/20',
    glyphColor: 'text-green-400'
  },
  {
    id: 'air',
    glyph: '△',
    hasLine: true,
    title: 'WHAT',
    subtitle: 'The Experience',
    content: `Soullab is a space for meaningful AI conversation. Think of Maia as a guide who's genuinely curious about you - someone who listens deeply, asks good questions, and helps you think through what matters. Voice or text, your choice. Always.`,
    color: 'from-cyan-400/20 to-sky-500/20',
    glyphColor: 'text-cyan-400'
  },
  {
    id: 'aether',
    glyph: '⊕',
    title: 'SOUL',
    subtitle: 'The Heart',
    content: `This is about more than technology. It's about creating space for real human growth, supporting each other's journeys, and exploring what consciousness can become when we bring our whole selves to the conversation. You're part of something meaningful.`,
    color: 'from-amber-400/20 to-yellow-500/20',
    glyphColor: 'text-amber-400'
  }
];

const INTENTION_PATHS = [
  {
    id: 'consciousness',
    title: 'Consciousness Explorer',
    subtitle: 'Personal growth and transformation',
    description: 'I\'m interested in exploring consciousness, personal development, and meaningful conversation with AI.',
    icon: '🧠',
    color: 'from-amber-400/20 to-yellow-500/20',
    iconColor: 'text-amber-400'
  },
  {
    id: 'research',
    title: 'Researcher',
    subtitle: 'Academic or professional study',
    description: 'I\'m here to study AI consciousness architectures, human-AI interaction, or related research topics.',
    icon: '🔬',
    color: 'from-blue-400/20 to-cyan-500/20',
    iconColor: 'text-blue-400'
  },
  {
    id: 'business',
    title: 'Business Partner',
    subtitle: 'Commercial collaboration',
    description: 'I\'m exploring potential partnerships, integrations, or commercial applications.',
    icon: '🤝',
    color: 'from-green-400/20 to-emerald-500/20',
    iconColor: 'text-green-400'
  },
  {
    id: 'developer',
    title: 'Developer',
    subtitle: 'Technical implementation',
    description: 'I\'m interested in the technical architecture, code patterns, and implementation details.',
    icon: '💻',
    color: 'from-purple-400/20 to-violet-500/20',
    iconColor: 'text-purple-400'
  },
  {
    id: 'curious',
    title: 'Just Curious',
    subtitle: 'Exploring and learning',
    description: 'I\'m here to see what this is about without any specific agenda or commitment.',
    icon: '✨',
    color: 'from-pink-400/20 to-rose-500/20',
    iconColor: 'text-pink-400'
  },
  {
    id: 'all',
    title: 'All of the Above',
    subtitle: 'Multiple interests',
    description: 'I\'m interested in consciousness work AND research AND potential business collaboration AND the technical implementation. I want the full experience.',
    icon: '🌟',
    color: 'from-amber-400/20 to-yellow-500/20',
    iconColor: 'text-amber-400'
  }
];

export function ElementalOrientation({ explorerName }: { explorerName: string }) {
  const router = useRouter();
  const [showIntentionSelection, setShowIntentionSelection] = useState(true);
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleIntentionSelect = (intentionId: string) => {
    setSelectedIntention(intentionId);
    localStorage.setItem('userIntention', intentionId);

    // Different paths based on intention
    if (intentionId === 'consciousness' || intentionId === 'all') {
      // Full elemental orientation for consciousness explorers and "all of the above"
      setShowIntentionSelection(false);
      setCanProceed(false);
      setTimeout(() => setCanProceed(true), 1500);
    } else {
      // Skip elemental orientation for other intentions, go straight to FAQ
      router.push('/faq');
    }
  };

  const handleNext = () => {
    if (currentIndex < ELEMENTS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCanProceed(false);
      setTimeout(() => setCanProceed(true), 1500);
    } else {
      // On last element, proceed to FAQ
      if (feedback) {
        localStorage.setItem('orientationFeedback', feedback);
      }
      router.push('/faq');
    }
  };

  const handleSkip = () => {
    router.push('/faq');
  };

  const handleFeedback = (emoji: string) => {
    setFeedback(emoji);
    setCanProceed(true);
  };

  useEffect(() => {
    setTimeout(() => setCanProceed(true), 1500);
  }, []);

  const current = ELEMENTS[currentIndex];

  return (
    <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center px-4 py-8">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Soullab Logo - Spectrum Holoflower */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <Holoflower size="lg" glowIntensity="medium" />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <p className="text-amber-200/40 text-sm mb-2">Welcome, {explorerName}</p>
          <h1 className="text-2xl font-light text-amber-50">
            {showIntentionSelection ? "What brings you here?" : "Before we begin..."}
          </h1>
          {showIntentionSelection && (
            <p className="text-amber-200/60 text-sm mt-4">
              Your intention helps us tailor your experience. Choose what resonates most:
            </p>
          )}
        </motion.div>

        {/* Progress dots - only show for elemental orientation */}
        {!showIntentionSelection && (
          <div className="flex justify-center gap-2 mb-12">
            {ELEMENTS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-amber-400 w-8'
                    : index < currentIndex
                    ? 'bg-amber-500/50 w-4'
                    : 'bg-amber-500/20 w-4'
                }`}
              />
            ))}
          </div>
        )}

        {/* Content card */}
        <AnimatePresence mode="wait">
          {showIntentionSelection ? (
            <motion.div
              key="intention-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTENTION_PATHS.map((intention) => (
                  <motion.button
                    key={intention.id}
                    onClick={() => handleIntentionSelect(intention.id)}
                    className={`bg-gradient-to-br ${intention.color} backdrop-blur-md border border-amber-500/20 rounded-xl p-6 text-left hover:border-amber-500/40 transition-all group`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`text-3xl ${intention.iconColor} group-hover:scale-110 transition-transform`}>
                        {intention.icon}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-amber-50 mb-1">{intention.title}</h3>
                        <p className="text-sm text-amber-200/60 mb-2">{intention.subtitle}</p>
                        <p className="text-xs text-amber-200/80 leading-relaxed">{intention.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : currentIndex === ELEMENTS.length && !feedback ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-amber-400/20 to-amber-500/20 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8 md:p-12 text-center">
                <h2 className="text-2xl font-light text-amber-50 mb-4">How did this feel?</h2>
                <p className="text-amber-200/60 text-sm mb-8">Your feedback helps us refine the experience</p>
                <div className="flex justify-center gap-6">
                  {[
                    { emoji: '✨', label: 'Just right', value: 'perfect' },
                    { emoji: '🤔', label: 'A bit much', value: 'too_long' },
                    { emoji: '⚡', label: 'Too quick', value: 'too_short' }
                  ].map(option => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleFeedback(option.value)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-amber-500/20 bg-black/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-4xl">{option.emoji}</span>
                      <span className="text-xs text-amber-200/70">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className={`bg-gradient-to-br ${current.color} backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 md:p-12`}>
              {/* Elemental glyph */}
              <div className="flex justify-center mb-4 md:mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className={`${current.glyphColor} flex items-center justify-center`}
                >
                  {current.hasLine ? (
                    <svg width="80" height="80" viewBox="0 0 80 80" className="fill-none stroke-current" strokeWidth="3">
                      <path d="M 40 15 L 65 60 L 15 60 Z" />
                      <line x1="20" y1="42" x2="60" y2="42" strokeWidth="2.5" />
                    </svg>
                  ) : (
                    <span className="text-7xl font-light">{current.glyph}</span>
                  )}
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-4 md:mb-6"
              >
                <h2 className="text-3xl font-light text-amber-50 mb-2">{current.title}</h2>
                <p className="text-amber-200/50 text-sm tracking-wider uppercase">{current.subtitle}</p>
              </motion.div>

              {/* Content */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-amber-100/80 text-center leading-relaxed text-lg"
              >
                {current.content}
              </motion.p>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-between items-center mt-4 md:mt-6"
        >
          <button
            onClick={handleSkip}
            className="text-sm text-amber-200/40 hover:text-amber-200/60 transition-colors"
          >
            Skip orientation
          </button>

          <motion.button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              canProceed
                ? 'bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white hover:from-amber-500 hover:to-amber-600 cursor-pointer'
                : 'bg-amber-500/20 text-amber-200/40 cursor-not-allowed'
            }`}
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
          >
            {currentIndex === ELEMENTS.length - 1 ? (
              <>
                Begin your journey
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Current step indicator */}
        <div className="text-center mt-3 md:mt-4">
          <p className="text-xs text-amber-200/30">
            {currentIndex + 1} of {ELEMENTS.length}
          </p>
        </div>
      </div>
    </div>
  );
}