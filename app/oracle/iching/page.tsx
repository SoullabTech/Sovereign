'use client';

/**
 * I Ching Oracle Experience
 *
 * The Book of Changes - Traditional yarrow stalk divination
 * Aesthetic: Ancient Chinese emperor's divination chamber
 *
 * Features:
 * - Yarrow stalk simulation (traditional method)
 * - Hexagram building line by line
 * - Trigram visualization
 * - Changing lines and transformation
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Hexagon,
  BookOpen,
  RefreshCw,
  Loader2
} from 'lucide-react';

type ReadingPhase = 'question' | 'casting' | 'reveal' | 'interpretation';

interface HexagramLine {
  type: 'yang' | 'yin';
  changing: boolean;
  value: number; // 6-9 traditional values
}

interface Hexagram {
  number: number;
  name: string;
  keyword: string;
  lines: string[];
  trigrams: { upper: string; lower: string };
  interpretation: string;
  guidance: string;
  timing: string;
  changingLines?: number[];
  transformed?: {
    number: number;
    name: string;
    keyword: string;
  };
}

interface IChingReading {
  hexagram: Hexagram;
  insight: string;
  guidance: string;
  ritual: string;
  archetypalTheme: string;
  sacredTiming: string;
}

export default function IChingOraclePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<ReadingPhase>('question');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<IChingReading | null>(null);
  const [hexagramLines, setHexagramLines] = useState<HexagramLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isCasting, setIsCasting] = useState(false);

  // Yarrow stalk casting simulation - builds hexagram line by line
  const castYarrowStalks = async () => {
    setPhase('casting');
    setIsCasting(true);
    const lines: HexagramLine[] = [];

    // Cast 6 lines, one at a time with animation
    for (let i = 0; i < 6; i++) {
      setCurrentLineIndex(i);

      // Simulate yarrow stalk counting (takes time)
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Traditional I Ching values: 6, 7, 8, 9
      const value = Math.floor(Math.random() * 4) + 6;

      const line: HexagramLine = {
        type: (value === 7 || value === 9) ? 'yang' : 'yin',
        changing: (value === 6 || value === 9),
        value
      };

      lines.push(line);
      setHexagramLines([...lines]);
    }

    // All lines cast, now get the reading
    setIsCasting(false);
    await fetchReading(lines);
  };

  const fetchReading = async (lines: HexagramLine[]) => {
    try {
      const response = await fetch('/api/oracle/iching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          lines: lines.map(l => ({
            type: l.type,
            changing: l.changing,
            value: l.value
          }))
        })
      });

      const data = await response.json();

      if (data.reading) {
        setReading(data.reading);
        setPhase('reveal');

        // Move to interpretation after revealing hexagram
        setTimeout(() => {
          setPhase('interpretation');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to get I Ching reading:', error);
    }
  };

  const handleQuestionSubmit = () => {
    if (question.trim()) {
      castYarrowStalks();
    }
  };

  const handleNewReading = () => {
    setPhase('question');
    setQuestion('');
    setReading(null);
    setHexagramLines([]);
    setCurrentLineIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 relative overflow-hidden">
      {/* Atmospheric Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4B896]/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Warm glow from below */}
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#3d2817]/40 via-amber-950/10 to-transparent pointer-events-none" />

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
              <Hexagon className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-light text-amber-200 tracking-wide">I Ching Oracle</h1>
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
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="inline-block mb-6"
                  >
                    <Hexagon className="w-16 h-16 text-amber-400/80" />
                  </motion.div>

                  <h2 className="text-4xl font-bold text-amber-100 mb-4">
                    Consult the Book of Changes
                  </h2>
                  <p className="text-amber-300/60 text-lg">
                    The ancient wisdom of the I Ching awaits your question
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-orange-900/30 backdrop-blur-xl border border-amber-600/30 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What situation requires wisdom and guidance?"
                    className="w-full h-32 px-4 py-3 bg-amber-950/50 border border-amber-700/40 rounded-lg text-amber-100 placeholder-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-amber-900/30 disabled:to-orange-900/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Cast the Yarrow Stalks
                  </button>

                  <p className="text-amber-400/50 text-xs text-center mt-4">
                    Using the traditional 50 yarrow stalk method
                  </p>
                </div>
              </motion.div>
            )}

            {/* Casting Phase - Yarrow Stalk Simulation */}
            {phase === 'casting' && (
              <motion.div
                key="casting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-amber-100 mb-4">
                    Casting the Hexagram
                  </h2>
                  <p className="text-amber-300/60">
                    Building line {currentLineIndex + 1} of 6...
                  </p>
                </div>

                {/* Hexagram Building Animation */}
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {/* Yarrow stalk animation */}
                  {isCasting && (
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="mb-12"
                    >
                      <Loader2 className="w-12 h-12 text-amber-400" />
                    </motion.div>
                  )}

                  {/* Hexagram lines building up */}
                  <div className="space-y-4">
                    {[...Array(6)].map((_, index) => {
                      const lineIndex = 5 - index; // Build from bottom to top
                      const line = hexagramLines[lineIndex];
                      const isRevealed = lineIndex < hexagramLines.length;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: isRevealed ? 1 : 0.2,
                            scale: isRevealed ? 1 : 0.8,
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center justify-center gap-3"
                        >
                          {isRevealed && line ? (
                            <HexagramLineDisplay line={line} />
                          ) : (
                            <div className="w-48 h-3 bg-amber-900/20 rounded" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
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
                    <h2 className="text-4xl font-bold text-amber-100 mb-2">
                      Hexagram {reading.hexagram.number}
                    </h2>
                    <h3 className="text-2xl text-amber-300/80 mb-1">
                      {reading.hexagram.name}
                    </h3>
                    <p className="text-amber-400/60 text-lg">
                      {reading.hexagram.keyword}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Primary Hexagram */}
                    <div className="bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-orange-900/40 backdrop-blur-xl border border-amber-600/40 rounded-xl p-8 shadow-xl">
                      <h4 className="text-amber-300/80 text-center mb-6 font-semibold">
                        Present Hexagram
                      </h4>

                      <div className="space-y-3 mb-6">
                        {reading.hexagram.lines.map((line, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
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
                            {reading.hexagram.changingLines?.includes(5 - index + 1) && (
                              <Sparkles className="w-4 h-4 text-amber-300 ml-3" />
                            )}
                          </motion.div>
                        ))}
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-amber-400/60 text-sm">
                          Upper Trigram: {reading.hexagram.trigrams.upper}
                        </div>
                        <div className="text-amber-400/60 text-sm">
                          Lower Trigram: {reading.hexagram.trigrams.lower}
                        </div>
                      </div>
                    </div>

                    {/* Transformed Hexagram (if changing lines exist) */}
                    {reading.hexagram.transformed && (
                      <div className="bg-gradient-to-br from-orange-900/40 via-amber-800/30 to-amber-900/40 backdrop-blur-xl border border-orange-600/40 rounded-xl p-8 shadow-xl">
                        <h4 className="text-orange-300/80 text-center mb-6 font-semibold">
                          Future Hexagram
                        </h4>

                        <div className="text-center space-y-3">
                          <Hexagon className="w-16 h-16 text-orange-400/60 mx-auto" />
                          <h5 className="text-2xl font-bold text-orange-200">
                            {reading.hexagram.transformed.number}
                          </h5>
                          <p className="text-orange-300/80">
                            {reading.hexagram.transformed.name}
                          </p>
                          <p className="text-orange-400/60 text-sm">
                            {reading.hexagram.transformed.keyword}
                          </p>
                        </div>

                        <div className="mt-6 p-4 bg-orange-950/30 rounded-lg">
                          <p className="text-orange-300/70 text-sm text-center">
                            The changing lines indicate transformation from the present to this future state
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interpretation */}
                {phase === 'interpretation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Main Interpretation */}
                    <div className="bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-orange-900/30 backdrop-blur-xl border border-amber-600/30 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-amber-400" />
                        <h3 className="text-2xl font-bold text-amber-100">Oracle's Wisdom</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-amber-300/80 font-semibold mb-3">Interpretation:</h4>
                          <p className="text-amber-200/70 leading-relaxed">
                            {reading.hexagram.interpretation}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-amber-300/80 font-semibold mb-3">Guidance:</h4>
                          <p className="text-amber-200/70 leading-relaxed">
                            {reading.guidance}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-amber-300/80 font-semibold mb-3">Sacred Timing:</h4>
                          <p className="text-amber-200/70 leading-relaxed">
                            {reading.sacredTiming}
                          </p>
                        </div>

                        {reading.archetypalTheme && (
                          <div>
                            <h4 className="text-amber-300/80 font-semibold mb-3">Archetypal Theme:</h4>
                            <p className="text-amber-200/70 leading-relaxed">
                              {reading.archetypalTheme}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ritual Suggestion */}
                    {reading.ritual && (
                      <div className="bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-orange-900/20 backdrop-blur-xl border border-amber-600/20 rounded-xl p-6">
                        <h4 className="text-amber-300/80 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Integration Ritual
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
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        New Reading
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

// Component to display individual hexagram lines
function HexagramLineDisplay({ line }: { line: HexagramLine }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-4 rounded transition-all ${
        line.type === 'yang'
          ? 'w-48 bg-amber-400'
          : 'w-48 flex gap-4'
      }`}>
        {line.type === 'yin' && (
          <>
            <div className="flex-1 bg-amber-400 rounded" />
            <div className="flex-1 bg-amber-400 rounded" />
          </>
        )}
      </div>
      {line.changing && (
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
        </motion.div>
      )}
    </div>
  );
}
