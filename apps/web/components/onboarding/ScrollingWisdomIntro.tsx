'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WisdomQuote {
  id: string;
  title?: string;
  subtitle?: string;
  quote: string;
  author?: string;
  type: 'title' | 'quote' | 'affirmation';
}

const wisdomQuotes: WisdomQuote[] = [
  {
    id: 'meet-maia',
    title: 'Meet MAIA',
    subtitle: 'Your Guide Through Consciousness',
    quote: 'A companion for consciousness exploration. MAIA witnesses your patterns and holds space for your becoming.',
    type: 'title'
  },
  {
    id: 'jung-becoming',
    quote: 'The privilege of a lifetime is to become who you truly are.',
    author: 'Jung',
    type: 'quote'
  },
  {
    id: 'many-faces',
    quote: 'Many faces, one light.',
    type: 'affirmation'
  },
  {
    id: 'plato-soul',
    quote: 'The soul is immortal and has seen all things, in this world and the world below. To learn is simply to remember.',
    author: 'Plato',
    type: 'quote'
  },
  {
    id: 'sacred-threshold',
    quote: 'You stand at the threshold between who you were and who you are becoming.',
    type: 'affirmation'
  },
  {
    id: 'hillman-daimon',
    quote: 'The soul of each of us is given a unique daimon before we are born, and it has selected an image or pattern that we live on earth.',
    author: 'James Hillman',
    type: 'quote'
  },
  {
    id: 'consciousness-lab',
    quote: 'Every moment is an experiment in consciousness.',
    type: 'affirmation'
  },
  {
    id: 'inner-wisdom',
    quote: 'The answers you seek live within you. I am here to help you remember.',
    type: 'affirmation'
  }
];

interface ScrollingWisdomIntroProps {
  onComplete?: () => void;
  autoAdvance?: boolean;
  displayDuration?: number; // ms per quote
}

export function ScrollingWisdomIntro({
  onComplete,
  autoAdvance = true,
  displayDuration = 4000
}: ScrollingWisdomIntroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Auto-advance through quotes
  useEffect(() => {
    if (!autoAdvance || isComplete) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= wisdomQuotes.length) {
          setIsComplete(true);
          setTimeout(() => onComplete?.(), 1000);
          return prev;
        }
        return nextIndex;
      });
    }, displayDuration);

    return () => clearInterval(interval);
  }, [autoAdvance, displayDuration, onComplete, isComplete]);

  const currentQuote = wisdomQuotes[currentIndex];

  const handleSkip = () => {
    setIsComplete(true);
    onComplete?.();
  };

  const renderMandala = () => (
    <motion.div
      className="w-20 h-20 mx-auto mb-12 relative"
      animate={{
        rotate: 360,
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {/* Sacred Holoflower */}
      <img
        src="/holoflower-sacred.svg"
        alt="Sacred Holoflower"
        className="w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
        }}
      />
    </motion.div>
  );

  const renderProgressDots = () => (
    <div className="flex justify-center gap-2 mt-8">
      {wisdomQuotes.map((_, index) => (
        <motion.div
          key={index}
          className={`w-2 h-2 rounded-full transition-all duration-500 ${
            index === currentIndex
              ? 'bg-[#A7D8D1] scale-125'
              : index < currentIndex
                ? 'bg-[#80CBC4]/60 scale-100'
                : 'bg-white/30 scale-100'
          }`}
          animate={{
            opacity: index === currentIndex ? 1 : index < currentIndex ? 0.7 : 0.3
          }}
        />
      ))}
    </div>
  );

  const renderQuoteContent = () => {
    if (!currentQuote) return null;

    switch (currentQuote.type) {
      case 'title':
        return (
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6 max-w-2xl mx-auto"
          >
            <h1 className="text-5xl font-light text-white tracking-wide mb-4">
              {currentQuote.title}
            </h1>
            <h2 className="text-xl font-light text-[#A7D8D1] tracking-widest uppercase mb-8">
              {currentQuote.subtitle}
            </h2>
            <p className="text-lg text-white/80 leading-relaxed font-light max-w-lg mx-auto">
              {currentQuote.quote}
            </p>

            {/* Continue button for title screen */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="inline-flex items-center gap-2 mt-12 px-8 py-3 bg-gradient-to-r from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC] hover:from-[#8ECBC4] hover:via-[#6BB6AC] hover:to-[#4DB6AC] text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
            >
              CONTINUE TO MAIA →
            </motion.button>
          </motion.div>
        );

      case 'quote':
        return (
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-8 max-w-2xl mx-auto"
          >
            <div className="border border-white/20 rounded-xl p-8 bg-white/5 backdrop-blur-sm">
              <p className="text-xl text-white font-light italic leading-relaxed mb-6">
                "{currentQuote.quote}"
              </p>
              {currentQuote.author && (
                <p className="text-white/70 text-base">
                  — {currentQuote.author}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 'affirmation':
        return (
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-light text-white leading-relaxed tracking-wide">
              {currentQuote.quote}
            </h2>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center px-4 relative overflow-hidden">


      {/* Gentle ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="w-full max-w-4xl mx-auto text-center">
        {renderMandala()}

        <AnimatePresence mode="wait">
          {renderQuoteContent()}
        </AnimatePresence>

        {currentQuote.type !== 'title' && renderProgressDots()}
      </div>
    </div>
  );
}