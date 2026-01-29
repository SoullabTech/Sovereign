'use client';

/**
 * I Ching Oracle Experience
 *
 * The Book of Changes - Traditional yarrow stalk divination
 * Aesthetic: DUNE amber field - vast, elemental, reverent
 *
 * Features:
 * - Yarrow stalk simulation (traditional method)
 * - Brushstroke hexagram visualization
 * - Trigram ring with yin-yang center
 * - Changing lines and transformation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  RefreshCw,
  Loader2,
  MessageCircle,
  BookmarkPlus,
  Check
} from 'lucide-react';
import { HexagramDisplay, BaguaRing } from '@/components/oracle';

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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0d14] via-[#0d1117] to-[#070a0f] relative overflow-hidden">
      {/* DUNE Amber Field - vast desert atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Horizontal amber glow bands - like distant dunes */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/[0.03] to-transparent" style={{ top: '20%', height: '30%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-800/[0.02] to-transparent" style={{ top: '50%', height: '25%' }} />

        {/* Spice dust particles - slow, deliberate */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-amber-400/40 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Bottom amber glow - like spice-touched sand */}
      <div className="fixed bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-amber-900/10 via-amber-950/5 to-transparent pointer-events-none" />

      {/* Bagua sacred geometry - very subtle */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
        <svg className="w-[80vmin] h-[80vmin]" viewBox="0 0 100 100">
          {/* Outer octagon */}
          <polygon
            points="50,5 85,20 95,50 85,80 50,95 15,80 5,50 15,20"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="0.3"
          />
          {/* Inner circles */}
          <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#f59e0b" strokeWidth="0.2" />
          {/* Cross lines */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="#f59e0b" strokeWidth="0.15" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="#f59e0b" strokeWidth="0.15" />
          <line x1="15" y1="20" x2="85" y2="80" stroke="#f59e0b" strokeWidth="0.15" />
          <line x1="85" y1="20" x2="15" y2="80" stroke="#f59e0b" strokeWidth="0.15" />
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

            <div className="flex items-center gap-3">
              {/* Yin-Yang icon */}
              <svg className="w-7 h-7" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500/60" />
                <path
                  d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2"
                  fill="currentColor"
                  className="text-amber-500/60"
                />
                <circle cx="50" cy="26" r="6" fill="currentColor" className="text-[#0d1117]" />
                <circle cx="50" cy="74" r="6" fill="currentColor" className="text-amber-500/60" />
              </svg>
              <h1 className="text-2xl font-light text-maia-ink-100 tracking-wider">I Ching Oracle</h1>
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
                <div className="text-center mb-10">
                  {/* Bagua ring as threshold symbol */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="inline-block mb-8"
                  >
                    <BaguaRing size={140} className="opacity-70" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-light text-maia-ink-100 mb-4 tracking-wide"
                  >
                    The Book of Changes
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-amber-400/60 text-lg font-light"
                  >
                    What question do you bring to the oracle?
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-[#0d1117]/80 via-amber-950/10 to-[#070a0f]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 shadow-2xl shadow-amber-900/10"
                >
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What situation requires wisdom and guidance?"
                    className="w-full h-32 px-5 py-4 bg-[#0a0d14]/60 border border-amber-900/30 rounded-xl text-maia-ink-100 placeholder-maia-ink-30 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all resize-none text-lg font-light"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-amber-700/80 to-amber-800/80 hover:from-amber-600/80 hover:to-amber-700/80 disabled:from-[#0d1117]/50 disabled:to-[#0d1117]/50 disabled:text-maia-ink-30 disabled:cursor-not-allowed text-amber-100 font-medium rounded-xl shadow-lg shadow-amber-900/20 transition-all duration-500 flex items-center justify-center gap-3 tracking-wide"
                  >
                    <Sparkles className="w-5 h-5" />
                    Cast the Yarrow Stalks
                  </button>

                  <p className="text-amber-500/30 text-xs text-center mt-5 tracking-wider uppercase">
                    Traditional 50 yarrow stalk method
                  </p>
                </motion.div>
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
                <div className="text-center mb-16">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-light text-maia-ink-100 mb-3 tracking-wide"
                  >
                    Casting the Hexagram
                  </motion.h2>
                  <motion.p
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-amber-400/50 font-light"
                  >
                    Building line {currentLineIndex + 1} of 6...
                  </motion.p>
                </div>

                {/* Hexagram Building Animation */}
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {/* Yarrow stalk casting indicator */}
                  {isCasting && (
                    <motion.div
                      className="mb-16 flex flex-col items-center"
                    >
                      {/* Yarrow stalks falling animation */}
                      <div className="relative w-20 h-20 mb-4">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-0.5 h-12 bg-amber-500/60 rounded-full origin-bottom"
                            style={{ left: '50%', bottom: '50%' }}
                            animate={{
                              rotate: [i * 60, i * 60 + 360],
                              opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                              rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                              opacity: { duration: 2, repeat: Infinity, delay: i * 0.3 },
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-amber-500/40 tracking-widest uppercase">
                        Dividing the stalks
                      </span>
                    </motion.div>
                  )}

                  {/* Hexagram lines building up using new component */}
                  <div className="relative">
                    <HexagramDisplay
                      lines={hexagramLines}
                      size="lg"
                      animate={true}
                      showChanging={true}
                    />

                    {/* Placeholder lines for uncast positions */}
                    {hexagramLines.length < 6 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-start">
                        {[...Array(6 - hexagramLines.length)].map((_, i) => (
                          <motion.div
                            key={`placeholder-${i}`}
                            className="w-40 h-1 bg-amber-900/20 rounded mb-7"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    )}
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
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                  >
                    <span className="text-amber-500/40 text-sm tracking-[0.3em] uppercase mb-2 block">
                      Hexagram {reading.hexagram.number}
                    </span>
                    <h2 className="text-4xl font-light text-maia-ink-100 mb-2 tracking-wide">
                      {reading.hexagram.name}
                    </h2>
                    <p className="text-amber-400/60 text-lg font-light">
                      {reading.hexagram.keyword}
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Primary Hexagram */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-[#0d1117]/80 via-amber-950/10 to-[#070a0f]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 shadow-xl shadow-amber-900/10"
                    >
                      <h4 className="text-amber-400/60 text-center mb-8 font-medium tracking-wide text-sm uppercase">
                        Present Hexagram
                      </h4>

                      {/* Enhanced Hexagram Display */}
                      <div className="flex justify-center mb-8">
                        <HexagramDisplay
                          lines={hexagramLines}
                          size="lg"
                          animate={true}
                          showChanging={true}
                        />
                      </div>

                      <div className="text-center space-y-2 pt-4 border-t border-amber-900/20">
                        <div className="text-maia-ink-40 text-sm">
                          <span className="text-amber-500/40">Upper:</span> {reading.hexagram.trigrams.upper}
                        </div>
                        <div className="text-maia-ink-40 text-sm">
                          <span className="text-amber-500/40">Lower:</span> {reading.hexagram.trigrams.lower}
                        </div>
                      </div>
                    </motion.div>

                    {/* Transformed Hexagram (if changing lines exist) */}
                    {reading.hexagram.transformed && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-[#0d1117]/80 via-teal-950/10 to-[#070a0f]/80 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-8 shadow-xl shadow-teal-900/10"
                      >
                        <h4 className="text-teal-400/60 text-center mb-8 font-medium tracking-wide text-sm uppercase">
                          Transformation
                        </h4>

                        <div className="text-center space-y-4">
                          {/* Arrow indicating change */}
                          <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-teal-400/40 mb-4"
                          >
                            <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </motion.div>

                          <h5 className="text-3xl font-light text-maia-ink-100">
                            {reading.hexagram.transformed.number}
                          </h5>
                          <p className="text-teal-400/70 text-xl font-light">
                            {reading.hexagram.transformed.name}
                          </p>
                          <p className="text-maia-ink-40 text-sm">
                            {reading.hexagram.transformed.keyword}
                          </p>
                        </div>

                        <div className="mt-8 p-4 bg-[#0a0d14]/60 rounded-xl border border-teal-900/20">
                          <p className="text-maia-ink-50 text-sm text-center font-light">
                            The changing lines reveal the path from present to future
                          </p>
                        </div>
                      </motion.div>
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
                    <div className="bg-gradient-to-br from-[#0d1117]/80 via-amber-950/10 to-[#070a0f]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 shadow-2xl shadow-amber-900/10">
                      <div className="flex items-center gap-3 mb-8">
                        <BookOpen className="w-5 h-5 text-amber-500/60" />
                        <h3 className="text-xl font-light text-maia-ink-100 tracking-wide">Oracle's Wisdom</h3>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h4 className="text-amber-400/50 font-medium mb-3 text-sm tracking-wide uppercase">Interpretation</h4>
                          <p className="text-maia-ink-70 leading-relaxed font-light">
                            {reading.hexagram.interpretation}
                          </p>
                        </div>

                        <div className="border-l-2 border-amber-500/20 pl-6">
                          <h4 className="text-amber-400/50 font-medium mb-3 text-sm tracking-wide uppercase">Guidance</h4>
                          <p className="text-maia-ink-70 leading-relaxed font-light">
                            {reading.guidance}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-amber-400/50 font-medium mb-3 text-sm tracking-wide uppercase">Sacred Timing</h4>
                          <p className="text-maia-ink-70 leading-relaxed font-light">
                            {reading.sacredTiming}
                          </p>
                        </div>

                        {reading.archetypalTheme && (
                          <div className="pt-4 border-t border-amber-900/20">
                            <h4 className="text-amber-400/50 font-medium mb-3 text-sm tracking-wide uppercase">Archetypal Theme</h4>
                            <p className="text-maia-ink-70 leading-relaxed font-light italic">
                              {reading.archetypalTheme}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ritual Suggestion */}
                    {reading.ritual && (
                      <div className="bg-gradient-to-br from-[#0d1117]/60 via-amber-950/5 to-[#070a0f]/60 backdrop-blur-xl border border-amber-500/10 rounded-xl p-6">
                        <h4 className="text-amber-400/50 font-medium mb-3 flex items-center gap-2 text-sm tracking-wide uppercase">
                          <Sparkles className="w-4 h-4" />
                          Integration Ritual
                        </h4>
                        <p className="text-maia-ink-50 text-sm leading-relaxed font-light">
                          {reading.ritual}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleSaveToReflections}
                        disabled={isSaving || isSaved}
                        className={`px-5 py-3 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                          isSaved
                            ? 'bg-teal-600/60 text-teal-100 cursor-default'
                            : 'bg-[#0d1117]/60 hover:bg-[#0d1117]/80 border border-amber-500/20 text-amber-400/70 hover:text-amber-300'
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
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-700/70 to-amber-800/70 hover:from-amber-600/70 hover:to-amber-700/70 text-amber-100 font-medium rounded-xl shadow-lg shadow-amber-900/20 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        New Reading
                      </button>
                      <button
                        onClick={() => router.push('/oracle')}
                        className="px-6 py-3 bg-[#0d1117]/60 hover:bg-[#0d1117]/80 border border-amber-900/20 text-maia-ink-60 font-medium rounded-xl transition-all duration-300"
                      >
                        Back to Oracle
                      </button>
                    </div>

                    {/* MAIA Mentor Access */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-10 pt-8 border-t border-amber-900/20"
                    >
                      <div className="bg-gradient-to-br from-[#0d1117]/60 via-amber-950/5 to-[#070a0f]/60 backdrop-blur-xl border border-amber-500/10 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <MessageCircle className="w-5 h-5 text-amber-400/60" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-light text-maia-ink-100 mb-2 tracking-wide">
                              Continue with MAIA
                            </h4>
                            <p className="text-maia-ink-50 text-sm mb-4 font-light leading-relaxed">
                              Seek deeper understanding of your hexagram. MAIA can illuminate the nuances of changing lines and help you apply this ancient wisdom to your present situation.
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
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600/60 to-amber-700/60 hover:from-amber-500/60 hover:to-amber-600/60 text-amber-100 font-medium rounded-xl shadow-lg shadow-amber-900/20 transition-all duration-300"
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
