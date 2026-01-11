'use client';

/**
 * Runes Oracle Experience
 *
 * The Elder Futhark - Ancient Norse divination
 * Aesthetic: Nordic frost and fire, ancient stone carvings
 *
 * Features:
 * - Rune bag drawing simulation
 * - Multiple spread options (single, three norns, etc.)
 * - Merkstave (reversed) interpretation
 * - Aett visualization
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Moon,
  BookOpen,
  RefreshCw,
  Loader2,
  Flame
} from 'lucide-react';

type ReadingPhase = 'question' | 'spread-select' | 'casting' | 'reveal' | 'interpretation';

interface RuneSpreadOption {
  id: string;
  name: string;
  description: string;
  runeCount: number;
  positions: string[];
}

const SPREADS: RuneSpreadOption[] = [
  {
    id: 'single',
    name: 'Single Rune',
    description: 'One rune for direct guidance on your question',
    runeCount: 1,
    positions: ['Answer']
  },
  {
    id: 'norns',
    name: 'The Three Norns',
    description: 'Past (Urd), Present (Verdandi), Future (Skuld)',
    runeCount: 3,
    positions: ['Past (Urd)', 'Present (Verdandi)', 'Future (Skuld)']
  },
  {
    id: 'elements',
    name: 'Elemental Cross',
    description: 'Earth, Air, Fire, Water, and Spirit positions',
    runeCount: 5,
    positions: ['Earth (Foundation)', 'Air (Mind)', 'Fire (Action)', 'Water (Emotion)', 'Spirit (Higher Self)']
  },
  {
    id: 'week',
    name: 'Week Ahead',
    description: 'Seven runes for the coming week',
    runeCount: 7,
    positions: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }
];

interface DrawnRune {
  name: string;
  symbol: string;
  meaning: string;
  aett: string;
  element: string;
  isReversed: boolean;
  position: string;
  interpretation: string;
}

interface RuneReading {
  query: string;
  spread: string;
  drawnRunes: DrawnRune[];
  insight: string;
  soulGuidance: string;
  ritual?: string;
  wyrdMessage: string;
}

export default function RunesOraclePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<ReadingPhase>('question');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<RuneSpreadOption | null>(null);
  const [reading, setReading] = useState<RuneReading | null>(null);
  const [revealedRunes, setRevealedRunes] = useState<DrawnRune[]>([]);
  const [currentRuneIndex, setCurrentRuneIndex] = useState(0);
  const [isCasting, setIsCasting] = useState(false);

  // Rune casting simulation - draws runes one at a time
  const castRunes = async (spread: RuneSpreadOption) => {
    setPhase('casting');
    setIsCasting(true);
    const runes: DrawnRune[] = [];

    // Draw runes one at a time with animation
    for (let i = 0; i < spread.runeCount; i++) {
      setCurrentRuneIndex(i);

      // Simulate reaching into the rune bag
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create placeholder rune (will be replaced by API)
      const placeholderRune: DrawnRune = {
        name: '...',
        symbol: '...',
        meaning: '',
        aett: '',
        element: '',
        isReversed: false,
        position: spread.positions[i],
        interpretation: ''
      };

      runes.push(placeholderRune);
      setRevealedRunes([...runes]);
    }

    // All runes drawn, now get the reading
    setIsCasting(false);
    await fetchReading(spread);
  };

  const fetchReading = async (spread: RuneSpreadOption) => {
    try {
      const response = await fetch('/api/oracle/runes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          spreadType: spread.id,
          runeCount: spread.runeCount
        })
      });

      const data = await response.json();

      if (data.reading) {
        setReading(data.reading);
        setRevealedRunes(data.reading.drawnRunes);
        setPhase('reveal');

        // Move to interpretation after revealing runes
        setTimeout(() => {
          setPhase('interpretation');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to get Runes reading:', error);
    }
  };

  const handleQuestionSubmit = () => {
    if (question.trim()) {
      setPhase('spread-select');
    }
  };

  const handleSpreadSelect = (spread: RuneSpreadOption) => {
    setSelectedSpread(spread);
    castRunes(spread);
  };

  const handleNewReading = () => {
    setPhase('question');
    setQuestion('');
    setSelectedSpread(null);
    setReading(null);
    setRevealedRunes([]);
    setCurrentRuneIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-stone-950 relative overflow-hidden">
      {/* Atmospheric Particles - cooler, more mystical */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-slate-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 7,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Northern lights effect */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <motion.div
          className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-500/20 via-cyan-500/10 to-transparent"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Cool glow from below */}
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-slate-900/60 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Runic circle pattern overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
          {/* 8 lines radiating outward for the aettir */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = 500 + Math.cos(angle) * 150;
            const y1 = 500 + Math.sin(angle) * 150;
            const x2 = 500 + Math.cos(angle) * 450;
            const y2 = 500 + Math.sin(angle) * 450;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="0.3" />;
          })}
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
              className="flex items-center gap-2 text-slate-400/70 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-2">
              <Moon className="w-6 h-6 text-slate-300" />
              <h1 className="text-2xl font-light text-slate-200 tracking-wide">Rune Oracle</h1>
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
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-block mb-6"
                  >
                    {/* Ansuz rune symbol */}
                    <div className="w-20 h-20 flex items-center justify-center text-5xl text-slate-300/80 font-bold">
                      <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 4 L12 20 M12 4 L18 10 M12 4 L6 10" />
                      </svg>
                    </div>
                  </motion.div>

                  <h2 className="text-4xl font-bold text-slate-100 mb-4">
                    Consult the Elder Futhark
                  </h2>
                  <p className="text-slate-400/70 text-lg">
                    The ancient Norse runes hold the secrets of wyrd and orlog
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-stone-900/50 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the runes?"
                    className="w-full h-32 px-4 py-3 bg-slate-950/50 border border-slate-700/40 rounded-lg text-slate-100 placeholder-slate-500/50 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-slate-600 to-stone-600 hover:from-slate-500 hover:to-stone-500 disabled:from-slate-900/30 disabled:to-stone-900/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Reach Into the Rune Bag
                  </button>

                  <p className="text-slate-500/60 text-xs text-center mt-4">
                    Drawing from the 24 runes of the Elder Futhark
                  </p>
                </div>
              </motion.div>
            )}

            {/* Spread Selection Phase */}
            {phase === 'spread-select' && (
              <motion.div
                key="spread-select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-100 mb-4">
                    Choose Your Spread
                  </h2>
                  <p className="text-slate-400/70">
                    Select how many runes to draw for your reading
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SPREADS.map((spread) => (
                    <motion.button
                      key={spread.id}
                      onClick={() => handleSpreadSelect(spread)}
                      className="group relative p-6 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-stone-900/50 backdrop-blur-xl border border-slate-600/30 rounded-xl hover:border-slate-500/50 transition-all duration-300 text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 text-slate-300 font-bold text-lg">
                          {spread.runeCount}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-200 mb-1 group-hover:text-slate-100">
                            {spread.name}
                          </h3>
                          <p className="text-slate-400/70 text-sm">
                            {spread.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button
                  onClick={() => setPhase('question')}
                  className="mt-6 mx-auto block text-slate-500 hover:text-slate-400 text-sm transition-colors"
                >
                  Back to question
                </button>
              </motion.div>
            )}

            {/* Casting Phase - Rune Drawing Simulation */}
            {phase === 'casting' && selectedSpread && (
              <motion.div
                key="casting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-100 mb-4">
                    Drawing the Runes
                  </h2>
                  <p className="text-slate-400/70">
                    Drawing rune {currentRuneIndex + 1} of {selectedSpread.runeCount}...
                  </p>
                  <p className="text-slate-500/50 text-sm mt-2">
                    {selectedSpread.positions[currentRuneIndex]}
                  </p>
                </div>

                {/* Rune bag animation */}
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {isCasting && (
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="mb-12"
                    >
                      <div className="relative">
                        <div className="w-24 h-32 bg-gradient-to-b from-stone-700 to-stone-900 rounded-t-3xl rounded-b-lg shadow-2xl border border-stone-600/50" />
                        <div className="absolute top-2 left-2 right-2 h-6 bg-stone-800 rounded-t-2xl" />
                        <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 animate-spin" />
                      </div>
                    </motion.div>
                  )}

                  {/* Revealed runes display */}
                  <div className="flex flex-wrap justify-center gap-6">
                    {revealedRunes.map((rune, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`w-20 h-28 bg-gradient-to-b from-stone-700 to-stone-800 rounded-lg shadow-xl border border-stone-600/50 flex items-center justify-center ${rune.isReversed ? 'rotate-180' : ''}`}>
                          <span className="text-3xl text-slate-200 font-bold">
                            {rune.symbol || '?'}
                          </span>
                        </div>
                        <p className="text-slate-400/70 text-xs mt-2">
                          {selectedSpread.positions[index]}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reveal & Interpretation Phase */}
            {(phase === 'reveal' || phase === 'interpretation') && reading && selectedSpread && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto"
              >
                {/* Runes Display */}
                <div className="mb-12">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">
                      {selectedSpread.name} Reading
                    </h2>
                    <p className="text-slate-400/70">
                      The runes have spoken
                    </p>
                  </div>

                  {/* Drawn Runes Grid */}
                  <div className="flex flex-wrap justify-center gap-6 mb-8">
                    {reading.drawnRunes.map((rune, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`relative w-24 h-32 bg-gradient-to-b from-stone-700 to-stone-800 rounded-lg shadow-xl border border-stone-600/50 flex items-center justify-center ${rune.isReversed ? 'rotate-180' : ''}`}>
                          <span className="text-4xl text-slate-100 font-bold">
                            {rune.symbol}
                          </span>
                          {rune.isReversed && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-900/60 rounded-full flex items-center justify-center">
                              <span className="text-xs text-red-300">R</span>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-200 font-semibold mt-3">
                          {rune.name}
                        </p>
                        <p className="text-slate-500/70 text-xs">
                          {rune.position}
                        </p>
                        <p className="text-slate-400/60 text-xs mt-1">
                          {rune.meaning}
                        </p>
                      </motion.div>
                    ))}
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
                    {/* Individual Rune Interpretations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reading.drawnRunes.map((rune, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-stone-900/40 backdrop-blur-xl border border-slate-600/30 rounded-xl p-6"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{rune.symbol}</span>
                            <div>
                              <h4 className="text-lg font-semibold text-slate-200">
                                {rune.name}
                                {rune.isReversed && <span className="text-red-400 text-sm ml-2">(Merkstave)</span>}
                              </h4>
                              <p className="text-slate-500/70 text-xs">{rune.position}</p>
                            </div>
                          </div>
                          <p className="text-slate-300/70 text-sm leading-relaxed">
                            {rune.interpretation}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                              {rune.element}
                            </span>
                            <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                              {rune.aett} Aett
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Main Reading */}
                    <div className="bg-gradient-to-br from-slate-900/30 via-slate-800/20 to-stone-900/30 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-slate-300" />
                        <h3 className="text-2xl font-bold text-slate-100">The Runes Speak</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-slate-300/80 font-semibold mb-3">Insight:</h4>
                          <p className="text-slate-200/70 leading-relaxed">
                            {reading.insight}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-slate-300/80 font-semibold mb-3">Soul Guidance:</h4>
                          <p className="text-slate-200/70 leading-relaxed">
                            {reading.soulGuidance}
                          </p>
                        </div>

                        {reading.wyrdMessage && (
                          <div>
                            <h4 className="text-slate-300/80 font-semibold mb-3 flex items-center gap-2">
                              <Flame className="w-4 h-4 text-orange-400" />
                              Message from Wyrd:
                            </h4>
                            <p className="text-slate-200/70 leading-relaxed italic">
                              {reading.wyrdMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ritual Suggestion */}
                    {reading.ritual && (
                      <div className="bg-gradient-to-br from-slate-900/20 via-slate-800/10 to-stone-900/20 backdrop-blur-xl border border-slate-600/20 rounded-xl p-6">
                        <h4 className="text-slate-300/80 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Integration Ritual
                        </h4>
                        <p className="text-slate-200/60 text-sm leading-relaxed">
                          {reading.ritual}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleNewReading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-stone-600 hover:from-slate-500 hover:to-stone-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        New Reading
                      </button>
                      <button
                        onClick={() => router.push('/oracle')}
                        className="px-6 py-3 bg-slate-900/40 hover:bg-slate-800/50 text-slate-200 font-semibold rounded-lg transition-all duration-300"
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
