'use client';

/**
 * Runes Oracle Experience
 *
 * The Elder Futhark - Ancient Norse divination
 * Aesthetic: Cosmic chamber with emerald/teal Nordic accents
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
import {
  RitualShell,
  getOracleTone,
  getRevealMotion,
} from '@/components/oracle/ritual/OracleRitualParts';

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

  // Oracle tone + reveal motion presets
  const tone = getOracleTone('runes');
  const revealMotion = getRevealMotion('runes');

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
    <RitualShell max="5xl" variant="runes">
      {/* Northern lights effect - more subtle */}
      <div className="fixed inset-0 pointer-events-none opacity-15">
        <motion.div
          className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-500/30 via-teal-500/15 to-transparent"
          animate={{
            opacity: [0.1, 0.25, 0.1],
            scaleY: [1, 1.15, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Runic circle pattern overlay */}
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#ffffff" strokeWidth="0.5" />
          {/* 8 lines radiating outward for the aettir */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = 500 + Math.cos(angle) * 150;
            const y1 = 500 + Math.sin(angle) * 150;
            const x2 = 500 + Math.cos(angle) * 450;
            const y2 = 500 + Math.sin(angle) * 450;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth="0.3" />;
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
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-2">
              <Moon className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-light text-white tracking-wide">Rune Oracle</h1>
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
                    <div className="w-20 h-20 flex items-center justify-center text-5xl text-white/80 font-bold">
                      <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 4 L12 20 M12 4 L18 10 M12 4 L6 10" />
                      </svg>
                    </div>
                  </motion.div>

                  <h2 className="text-4xl font-bold text-white mb-4">
                    Consult the Elder Futhark
                  </h2>
                  <p className="text-white/70 text-lg">
                    The ancient Norse runes hold the secrets of wyrd and orlog
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the runes?"
                    className="w-full h-32 px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Sparkles className="w-5 h-5" />
                    Reach Into the Rune Bag
                  </button>

                  <p className="text-white/50 text-xs text-center mt-4">
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
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Choose Your Spread
                  </h2>
                  <p className="text-white/70">
                    Select how many runes to draw for your reading
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SPREADS.map((spread) => (
                    <motion.button
                      key={spread.id}
                      onClick={() => handleSpreadSelect(spread)}
                      className="group relative p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-lg">
                          {spread.runeCount}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-white">
                            {spread.name}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {spread.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button
                  onClick={() => setPhase('question')}
                  className="mt-6 mx-auto block text-white/50 hover:text-white/70 text-sm transition-colors"
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
                  <h2 className="text-3xl font-semibold text-white mb-4 tracking-tight">
                    Drawing the Runes
                  </h2>
                  <p className="text-white/60 text-lg">
                    {tone.waitingLine}
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    Rune {currentRuneIndex + 1} of {selectedSpread.runeCount} — {selectedSpread.positions[currentRuneIndex]}
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
                        <div className="w-24 h-32 bg-gradient-to-b from-emerald-900/40 to-teal-900/60 rounded-t-3xl rounded-b-lg shadow-2xl border border-emerald-500/20" />
                        <div className="absolute top-2 left-2 right-2 h-6 bg-emerald-800/30 rounded-t-2xl" />
                        <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-400 animate-spin" />
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
                        <div className={`w-20 h-28 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-lg shadow-xl flex items-center justify-center ${rune.isReversed ? 'rotate-180' : ''}`}>
                          <span className="text-3xl text-white font-bold">
                            {rune.symbol || '?'}
                          </span>
                        </div>
                        <p className="text-white/70 text-xs mt-2">
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
              <div className="max-w-4xl mx-auto">
                {/* Header - steady, no animation */}
                <div className="text-center mb-8">
                  <p className="text-white/60 text-lg mb-4">{tone.revealLine}</p>
                  <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">
                    {selectedSpread.name} Reading
                  </h2>
                </div>

                {/* Runes Display - stone-set animation */}
                <motion.div
                  key="runes-reveal"
                  initial={revealMotion.initial}
                  animate={revealMotion.animate}
                  transition={revealMotion.transition}
                  className="mb-12"
                >
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
                        <div className={`relative w-24 h-32 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-lg shadow-xl flex items-center justify-center ${rune.isReversed ? 'rotate-180' : ''}`}>
                          <span className="text-4xl text-white font-bold">
                            {rune.symbol}
                          </span>
                          {rune.isReversed && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/60 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">R</span>
                            </div>
                          )}
                        </div>
                        <p className="text-white font-semibold mt-3">
                          {rune.name}
                        </p>
                        <p className="text-white/50 text-xs">
                          {rune.position}
                        </p>
                        <p className="text-white/60 text-xs mt-1">
                          {rune.meaning}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

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
                          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{rune.symbol}</span>
                            <div>
                              <h4 className="text-lg font-semibold text-white">
                                {rune.name}
                                {rune.isReversed && <span className="text-red-400 text-sm ml-2">(Merkstave)</span>}
                              </h4>
                              <p className="text-white/50 text-xs">{rune.position}</p>
                            </div>
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {rune.interpretation}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <span className="px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-white/70">
                              {rune.element}
                            </span>
                            <span className="px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-white/70">
                              {rune.aett} Aett
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Main Reading */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-white" />
                        <h3 className="text-2xl font-bold text-white">The Runes Speak</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-white/80 font-semibold mb-3">Insight:</h4>
                          <p className="text-white/70 leading-relaxed">
                            {reading.insight}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-white/80 font-semibold mb-3">Soul Guidance:</h4>
                          <p className="text-white/70 leading-relaxed">
                            {reading.soulGuidance}
                          </p>
                        </div>

                        {reading.wyrdMessage && (
                          <div>
                            <h4 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
                              <Flame className="w-4 h-4 text-emerald-400" />
                              Message from Wyrd:
                            </h4>
                            <p className="text-white/70 leading-relaxed italic">
                              {reading.wyrdMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ritual Suggestion */}
                    {reading.ritual && (
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <h4 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Integration Ritual
                        </h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {reading.ritual}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleNewReading}
                        className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/10"
                      >
                        <RefreshCw className="w-5 h-5" />
                        New Reading
                      </button>
                      <button
                        onClick={() => router.push('/oracle')}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all duration-300 border border-white/10"
                      >
                        Back to Oracle
                      </button>
                    </div>

                    {/* Closing incantation - after action buttons */}
                    <p className="mt-10 text-white/35 text-sm text-center italic">
                      {tone.integrationLine}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </RitualShell>
  );
}
