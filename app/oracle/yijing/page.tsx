'use client';

/**
 * Yi Jing Soul Oracle Experience
 *
 * The Path of Return - Spiritual I Ching for soul guidance
 * Aesthetic: Ethereal temple of soul wisdom with softer, more mystical energy
 *
 * Features:
 * - Soul-focused question prompts
 * - Meditative casting experience
 * - Emphasis on inner journey and spiritual development
 * - Energetic signature visualization
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  CircleDot,
  BookOpen,
  RefreshCw,
  Heart,
  Compass,
  Loader2
} from 'lucide-react';

type ReadingPhase = 'question' | 'meditation' | 'casting' | 'reveal' | 'interpretation';

interface Hexagram {
  number: number;
  name: string;
  keyword: string;
  lines: string[];
  trigrams: { upper: string; lower: string };
  interpretation: string;
  guidance: string;
  timing: string;
}

interface YiJingReading {
  hexagram: Hexagram;
  insight: string;
  guidance: string;
  ritual: string;
  archetypalTheme: string;
  sacredTiming: string;
  energeticSignature: string;
  soulMessage: string;
}

const SOUL_PROMPTS = [
  "What is my soul calling me to understand right now?",
  "What spiritual lesson is emerging in my life?",
  "How can I align more deeply with my true essence?",
  "What does my soul need me to know?",
  "What is the next step on my spiritual path?",
];

export default function YiJingSoulOraclePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<ReadingPhase>('question');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<YiJingReading | null>(null);
  const [meditationProgress, setMeditationProgress] = useState(0);

  // Soul-centered casting with meditation phase
  const beginSoulConsultation = () => {
    setPhase('meditation');

    // Meditation countdown
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      setMeditationProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          castSoulHexagram();
        }, 500);
      }
    }, 50); // 5 seconds total meditation
  };

  const castSoulHexagram = async () => {
    setPhase('casting');

    try {
      const response = await fetch('/api/oracle/yijing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question })
      });

      const data = await response.json();

      if (data.reading) {
        setReading(data.reading);

        // Brief pause before reveal
        setTimeout(() => {
          setPhase('reveal');

          // Then move to interpretation
          setTimeout(() => {
            setPhase('interpretation');
          }, 2500);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to get Yi Jing reading:', error);
    }
  };

  const handleQuestionSubmit = () => {
    if (question.trim()) {
      beginSoulConsultation();
    }
  };

  const handleNewReading = () => {
    setPhase('question');
    setQuestion('');
    setReading(null);
    setMeditationProgress(0);
  };

  const useSoulPrompt = (prompt: string) => {
    setQuestion(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-950 via-amber-900 to-amber-950 relative overflow-hidden">
      {/* Ethereal Particles - More spiritual, floating energy */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(212, 184, 150, ${Math.random() * 0.4 + 0.2}) 0%, transparent 70%)`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Soft golden glow from center */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-5xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <button
              onClick={() => router.push('/oracle')}
              className="flex items-center gap-2 text-amber-400/70 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-2">
              <CircleDot className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-light text-amber-200 tracking-wide">Yi Jing Soul Oracle</h1>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Question Phase */}
            {phase === 'question' && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-block mb-6"
                  >
                    <CircleDot className="w-16 h-16 text-amber-400/80" />
                  </motion.div>

                  <h2 className="text-4xl font-bold text-amber-100 mb-4">
                    Soul Consultation
                  </h2>
                  <p className="text-amber-300/60 text-lg mb-6">
                    The Yi Jing speaks to your eternal essence and sacred journey
                  </p>

                  <div className="flex items-center justify-center gap-2 text-amber-400/50 text-sm">
                    <Heart className="w-4 h-4" />
                    <span>This oracle honors the traveler's path of return</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/30 via-amber-800/20 to-amber-900/30 backdrop-blur-xl border border-amber-600/30 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What is your soul asking to understand?"
                    className="w-full h-32 px-4 py-3 bg-amber-950/50 border border-amber-700/40 rounded-lg text-amber-100 placeholder-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none"
                    autoFocus
                  />

                  {/* Soul Prompt Suggestions */}
                  <div className="mt-4 mb-6">
                    <p className="text-amber-400/60 text-xs mb-3">Or choose a soul question:</p>
                    <div className="flex flex-wrap gap-2">
                      {SOUL_PROMPTS.slice(0, 3).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => useSoulPrompt(prompt)}
                          className="px-3 py-1.5 bg-amber-800/20 hover:bg-amber-700/30 border border-amber-700/30 hover:border-amber-600/50 text-amber-300/70 hover:text-amber-200 text-xs rounded-lg transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-2 px-6 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:from-amber-900/30 disabled:to-yellow-900/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Compass className="w-5 h-5" />
                    Consult Your Soul
                  </button>

                  <p className="text-amber-400/50 text-xs text-center mt-4">
                    Begin with meditation and inner listening
                  </p>
                </div>
              </motion.div>
            )}

            {/* Meditation Phase */}
            {phase === 'meditation' && (
              <motion.div
                key="meditation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 360],
                    }}
                    transition={{
                      scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                      rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                    }}
                    className="mb-8"
                  >
                    <CircleDot className="w-24 h-24 text-amber-400/60" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-amber-100 mb-4 text-center">
                    Centering Your Soul
                  </h2>
                  <p className="text-amber-300/60 text-lg mb-8 text-center max-w-md">
                    Breathe deeply. Connect with your inner knowing. The oracle awaits your presence.
                  </p>

                  {/* Meditation Progress */}
                  <div className="w-full max-w-sm">
                    <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${meditationProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <p className="text-amber-400/50 text-xs text-center mt-3">
                      Preparing the sacred space...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Casting Phase */}
            {phase === 'casting' && (
              <motion.div
                key="casting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="mb-8"
                >
                  <Loader2 className="w-20 h-20 text-amber-400" />
                </motion.div>

                <h2 className="text-3xl font-bold text-amber-100 mb-4">
                  Receiving Soul Guidance...
                </h2>
                <p className="text-amber-300/60 text-lg">
                  The spirit of the hexagram is forming
                </p>
              </motion.div>
            )}

            {/* Reveal & Interpretation Phase */}
            {(phase === 'reveal' || phase === 'interpretation') && reading && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto"
              >
                {/* Hexagram Display */}
                <div className="mb-12">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.8 }}
                      className="inline-block mb-4"
                    >
                      <CircleDot className="w-20 h-20 text-amber-400/80" />
                    </motion.div>

                    <h2 className="text-4xl font-bold text-amber-100 mb-2">
                      {reading.hexagram.name}
                    </h2>
                    <h3 className="text-2xl text-amber-300/80 mb-1">
                      {reading.hexagram.keyword}
                    </h3>
                    <p className="text-amber-400/60 text-sm">
                      Hexagram {reading.hexagram.number}
                    </p>
                  </div>

                  {/* Hexagram Visualization */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-yellow-900/40 via-amber-800/30 to-amber-900/40 backdrop-blur-xl border border-amber-600/40 rounded-xl p-8 shadow-xl max-w-md mx-auto mb-8"
                  >
                    <div className="space-y-3 mb-6">
                      {reading.hexagram.lines.map((line, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center justify-center"
                        >
                          <div className={`h-3 rounded transition-all ${
                            line === '-------'
                              ? 'w-48 bg-amber-400'
                              : 'w-48 flex gap-4'
                          }`}>
                            {line === '--- ---' && (
                              <>
                                <div className="flex-1 bg-amber-400 rounded" />
                                <div className="flex-1 bg-amber-400 rounded" />
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center space-y-2 pt-4 border-t border-amber-700/30">
                      <div className="text-amber-400/60 text-sm">
                        Upper Trigram: {reading.hexagram.trigrams.upper}
                      </div>
                      <div className="text-amber-400/60 text-sm">
                        Lower Trigram: {reading.hexagram.trigrams.lower}
                      </div>
                    </div>
                  </motion.div>

                  {/* Energetic Signature */}
                  {reading.energeticSignature && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-r from-amber-800/20 to-yellow-800/20 backdrop-blur-sm border border-amber-600/30 rounded-xl p-6 max-w-2xl mx-auto mb-8"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h4 className="text-amber-300/80 font-semibold">Energetic Signature</h4>
                      </div>
                      <p className="text-amber-200/70 text-center italic">
                        {reading.energeticSignature}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Soul Interpretation */}
                {phase === 'interpretation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Soul Message */}
                    {reading.soulMessage && (
                      <div className="bg-gradient-to-br from-yellow-900/30 via-amber-800/20 to-amber-900/30 backdrop-blur-xl border border-amber-600/30 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                          <Heart className="w-6 h-6 text-amber-400" />
                          <h3 className="text-2xl font-bold text-amber-100">Soul Message</h3>
                        </div>
                        <p className="text-amber-200/80 leading-relaxed text-lg mb-6">
                          {reading.soulMessage}
                        </p>
                      </div>
                    )}

                    {/* Main Interpretation */}
                    <div className="bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-yellow-900/30 backdrop-blur-xl border border-amber-600/30 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-amber-400" />
                        <h3 className="text-2xl font-bold text-amber-100">Soul Wisdom</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-amber-300/80 font-semibold mb-3">Insight:</h4>
                          <p className="text-amber-200/70 leading-relaxed">
                            {reading.insight}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-amber-300/80 font-semibold mb-3">Soul Guidance:</h4>
                          <p className="text-amber-200/70 leading-relaxed">
                            {reading.guidance}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-amber-300/80 font-semibold mb-3">Archetypal Theme:</h4>
                          <p className="text-amber-200/70 leading-relaxed">
                            {reading.archetypalTheme}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-amber-300/80 font-semibold mb-3">Sacred Timing:</h4>
                          <p className="text-amber-200/70 leading-relaxed">
                            {reading.sacredTiming}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Soul Return Ritual */}
                    {reading.ritual && (
                      <div className="bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-yellow-900/20 backdrop-blur-xl border border-amber-600/20 rounded-xl p-6">
                        <h4 className="text-amber-300/80 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Soul Return Ceremony
                        </h4>
                        <p className="text-amber-200/60 text-sm leading-relaxed">
                          {reading.ritual}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleNewReading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        New Soul Consultation
                      </button>
                      <button
                        onClick={() => router.push('/oracle')}
                        className="px-6 py-3 bg-amber-900/40 hover:bg-amber-800/50 text-amber-200 font-semibold rounded-lg transition-all duration-300"
                      >
                        Back to Oracle
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
