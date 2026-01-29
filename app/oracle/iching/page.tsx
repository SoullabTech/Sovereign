'use client';

/**
 * I Ching Oracle Experience
 *
 * The Book of Changes - Traditional yarrow stalk divination
 * Aesthetic: Night sky temple with golden accents
 *
 * Features:
 * - Yarrow stalk simulation (traditional method)
 * - Hexagram building line by line
 * - Trigram visualization
 * - Changing lines and transformation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Hexagon,
  BookOpen,
  RefreshCw,
  Loader2,
  MessageCircle,
  BookmarkPlus,
  Check
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
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Yarrow stalk casting simulation - builds hexagram line by line
  const castYarrowStalks = async () => {
    setPhase('casting');
    setIsCasting(true);
    setError(null);
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.reading) {
        setReading(data.reading);
        setPhase('reveal');

        // Move to interpretation after revealing hexagram
        setTimeout(() => {
          setPhase('interpretation');
        }, 2000);
      } else {
        throw new Error('Invalid reading response');
      }
    } catch (err) {
      console.error('Failed to get I Ching reading:', err);
      setError(err instanceof Error ? err.message : 'Failed to get reading');
      setPhase('question');
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
    setError(null);
    setIsSaved(false);
  };

  const handleSaveToReflections = async () => {
    if (!reading || isSaving || isSaved) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/capsules/from-oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'oracle',
          oracleReading: {
            oracleType: 'iching',
            question,
            hexagram: {
              number: reading.hexagram.number,
              name: reading.hexagram.name,
              keyword: reading.hexagram.keyword,
            },
            insight: reading.insight,
            soulGuidance: reading.guidance,
          },
          tags: ['iching', 'oracle'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save reading');
      }

      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save reading:', err);
      setError('Failed to save reading to reflections');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950 relative overflow-hidden">
      {/* Atmospheric Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-maia-spice-400/30 rounded-full"
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

      {/* Atmospheric Glow */}
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-maia-spice-900/20 via-maia-navy-900/10 to-transparent pointer-events-none" />

      {/* Sacred geometry overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="450" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="8 8" />
          <circle cx="500" cy="500" r="350" fill="none" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="8 8" />
          <circle cx="500" cy="500" r="250" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="8 8" />
        </svg>
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
              className="flex items-center gap-2 text-maia-spice-500/70 hover:text-maia-spice-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-2">
              <Hexagon className="w-6 h-6 text-maia-spice-400" />
              <h1 className="text-2xl font-light text-maia-ink-100 tracking-wide">I Ching Oracle</h1>
            </div>

            <div className="w-24" />
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-200 text-center"
            >
              {error}
            </motion.div>
          )}

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
                    <Hexagon className="w-16 h-16 text-maia-spice-400/80" />
                  </motion.div>

                  <h2 className="text-4xl font-bold text-maia-ink-100 mb-4">
                    Consult the Book of Changes
                  </h2>
                  <p className="text-maia-ink-60 text-lg">
                    The ancient wisdom of the I Ching awaits your question
                  </p>
                </div>

                <div className="bg-gradient-to-br from-maia-navy-800/60 via-maia-spice-700/20 to-maia-navy-850/60 backdrop-blur-xl border border-maia-spice-500/30 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What situation requires wisdom and guidance?"
                    className="w-full h-32 px-4 py-3 bg-maia-navy-900/50 border border-maia-navy-700/40 rounded-lg text-maia-ink-100 placeholder-maia-ink-40 focus:outline-none focus:ring-2 focus:ring-maia-spice-500/50 focus:border-maia-spice-500/50 transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-maia-spice-600 to-maia-spice-700 hover:from-maia-spice-500 hover:to-maia-spice-600 disabled:from-maia-navy-800/50 disabled:to-maia-navy-800/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Cast the Yarrow Stalks
                  </button>

                  <p className="text-maia-ink-40 text-xs text-center mt-4">
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
                  <h2 className="text-3xl font-bold text-maia-ink-100 mb-4">
                    Casting the Hexagram
                  </h2>
                  <p className="text-maia-ink-60">
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
                      <Loader2 className="w-12 h-12 text-maia-spice-400" />
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
                            <div className="w-48 h-3 bg-maia-navy-800/50 rounded" />
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
                    <h2 className="text-4xl font-bold text-maia-ink-100 mb-2">
                      Hexagram {reading.hexagram.number}
                    </h2>
                    <h3 className="text-2xl text-maia-spice-400/80 mb-1">
                      {reading.hexagram.name}
                    </h3>
                    <p className="text-maia-ink-60 text-lg">
                      {reading.hexagram.keyword}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Primary Hexagram */}
                    <div className="bg-gradient-to-br from-maia-navy-800/60 via-maia-spice-700/20 to-maia-navy-850/60 backdrop-blur-xl border border-maia-spice-500/30 rounded-xl p-8 shadow-xl">
                      <h4 className="text-maia-spice-400/80 text-center mb-6 font-semibold">
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
                                ? 'w-48 bg-maia-spice-400'
                                : 'w-48 flex gap-4'
                            }`}>
                              {line === '--- ---' && (
                                <>
                                  <div className="flex-1 bg-maia-spice-400 rounded" />
                                  <div className="flex-1 bg-maia-spice-400 rounded" />
                                </>
                              )}
                            </div>
                            {reading.hexagram.changingLines?.includes(5 - index + 1) && (
                              <Sparkles className="w-4 h-4 text-maia-spice-300 ml-3" />
                            )}
                          </motion.div>
                        ))}
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-maia-ink-40 text-sm">
                          Upper Trigram: {reading.hexagram.trigrams.upper}
                        </div>
                        <div className="text-maia-ink-40 text-sm">
                          Lower Trigram: {reading.hexagram.trigrams.lower}
                        </div>
                      </div>
                    </div>

                    {/* Transformed Hexagram (if changing lines exist) */}
                    {reading.hexagram.transformed && (
                      <div className="bg-gradient-to-br from-maia-navy-800/60 via-maia-sage-700/20 to-maia-navy-850/60 backdrop-blur-xl border border-maia-sage-500/30 rounded-xl p-8 shadow-xl">
                        <h4 className="text-maia-sage-400/80 text-center mb-6 font-semibold">
                          Future Hexagram
                        </h4>

                        <div className="text-center space-y-3">
                          <Hexagon className="w-16 h-16 text-maia-sage-400/60 mx-auto" />
                          <h5 className="text-2xl font-bold text-maia-ink-100">
                            {reading.hexagram.transformed.number}
                          </h5>
                          <p className="text-maia-sage-400/80">
                            {reading.hexagram.transformed.name}
                          </p>
                          <p className="text-maia-ink-40 text-sm">
                            {reading.hexagram.transformed.keyword}
                          </p>
                        </div>

                        <div className="mt-6 p-4 bg-maia-navy-900/50 rounded-lg">
                          <p className="text-maia-ink-60 text-sm text-center">
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
                    <div className="bg-gradient-to-br from-maia-navy-800/60 via-maia-spice-700/20 to-maia-navy-850/60 backdrop-blur-xl border border-maia-spice-500/30 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-maia-spice-400" />
                        <h3 className="text-2xl font-bold text-maia-ink-100">Oracle's Wisdom</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-maia-spice-400/80 font-semibold mb-3">Interpretation:</h4>
                          <p className="text-maia-ink-80 leading-relaxed">
                            {reading.hexagram.interpretation}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-maia-spice-400/80 font-semibold mb-3">Guidance:</h4>
                          <p className="text-maia-ink-80 leading-relaxed">
                            {reading.guidance}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-maia-spice-400/80 font-semibold mb-3">Sacred Timing:</h4>
                          <p className="text-maia-ink-80 leading-relaxed">
                            {reading.sacredTiming}
                          </p>
                        </div>

                        {reading.archetypalTheme && (
                          <div>
                            <h4 className="text-maia-spice-400/80 font-semibold mb-3">Archetypal Theme:</h4>
                            <p className="text-maia-ink-80 leading-relaxed">
                              {reading.archetypalTheme}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ritual Suggestion */}
                    {reading.ritual && (
                      <div className="bg-gradient-to-br from-maia-navy-800/40 via-maia-spice-700/10 to-maia-navy-850/40 backdrop-blur-xl border border-maia-spice-500/20 rounded-xl p-6">
                        <h4 className="text-maia-spice-400/80 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Integration Ritual
                        </h4>
                        <p className="text-maia-ink-60 text-sm leading-relaxed">
                          {reading.ritual}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleSaveToReflections}
                        disabled={isSaving || isSaved}
                        className={`px-5 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          isSaved
                            ? 'bg-maia-sage-600/80 text-white cursor-default'
                            : 'bg-maia-navy-800/60 hover:bg-maia-navy-700/60 border border-maia-spice-500/30 text-maia-spice-400 hover:text-maia-spice-300'
                        }`}
                      >
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isSaved ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <BookmarkPlus className="w-5 h-5" />
                        )}
                        {isSaved ? 'Saved' : 'Save to Reflections'}
                      </button>
                      <button
                        onClick={handleNewReading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-maia-spice-600 to-maia-spice-700 hover:from-maia-spice-500 hover:to-maia-spice-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        New Reading
                      </button>
                      <button
                        onClick={() => router.push('/oracle')}
                        className="px-6 py-3 bg-maia-navy-800/60 hover:bg-maia-navy-700/60 border border-maia-navy-700/40 text-maia-ink-80 font-semibold rounded-lg transition-all duration-300"
                      >
                        Back to Oracle
                      </button>
                    </div>

                    {/* MAIA Mentor Access */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-8 pt-8 border-t border-maia-navy-700/50"
                    >
                      <div className="bg-gradient-to-br from-maia-navy-800/40 via-maia-spice-700/10 to-maia-navy-850/40 backdrop-blur-xl border border-maia-spice-500/20 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-maia-spice-500/20 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-maia-spice-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-maia-ink-100 mb-2">
                              Continue with MAIA
                            </h4>
                            <p className="text-maia-ink-60 text-sm mb-4">
                              Want deeper insight into your hexagram? MAIA can help you understand the nuances of changing lines, explore how this reading applies to your specific situation, and guide you through the wisdom of the I Ching.
                            </p>
                            <button
                              onClick={() => {
                                // Store reading context for MAIA
                                if (reading) {
                                  sessionStorage.setItem('oracle_context', JSON.stringify({
                                    type: 'iching',
                                    hexagram: reading.hexagram.name,
                                    number: reading.hexagram.number,
                                    keyword: reading.hexagram.keyword,
                                    question: question,
                                    timestamp: new Date().toISOString()
                                  }));
                                }
                                router.push('/maia');
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-maia-spice-500/80 to-maia-spice-600/80 hover:from-maia-spice-500 hover:to-maia-spice-600 text-white font-medium rounded-lg transition-all duration-300"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Discuss with MAIA
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
          ? 'w-48 bg-maia-spice-400'
          : 'w-48 flex gap-4'
      }`}>
        {line.type === 'yin' && (
          <>
            <div className="flex-1 bg-maia-spice-400 rounded" />
            <div className="flex-1 bg-maia-spice-400 rounded" />
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
          <Sparkles className="w-5 h-5 text-maia-spice-300" />
        </motion.div>
      )}
    </div>
  );
}
