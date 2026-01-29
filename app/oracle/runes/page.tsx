'use client';

/**
 * Runes Oracle Experience
 *
 * The Elder Futhark - Ancient Norse divination
 * Aesthetic: DUNE earth/stone - stark, elemental, fate-bound
 *
 * Features:
 * - Rune bag drawing simulation
 * - Stone-carved rune visualization
 * - Multiple spread options (single, three norns, etc.)
 * - Merkstave (reversed) interpretation
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
import { RuneStone, RuneCastDisplay } from '@/components/oracle';

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
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Rune casting simulation - draws runes one at a time
  const castRunes = async (spread: RuneSpreadOption) => {
    setPhase('casting');
    setIsCasting(true);
    setError(null);
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.reading) {
        setReading(data.reading);
        setRevealedRunes(data.reading.drawnRunes);
        setPhase('reveal');

        // Move to interpretation after revealing runes
        setTimeout(() => {
          setPhase('interpretation');
        }, 2000);
      } else {
        throw new Error('Invalid reading response');
      }
    } catch (err) {
      console.error('Failed to get Runes reading:', err);
      setError(err instanceof Error ? err.message : 'Failed to get reading');
      setPhase('question');
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
            oracleType: 'runes',
            question,
            spread: selectedSpread?.name,
            runes: reading.drawnRunes.map(r => ({
              name: r.name,
              position: r.position,
              merkstave: r.isReversed,
            })),
            insight: reading.insight,
            soulGuidance: reading.soulGuidance,
          },
          tags: ['runes', 'oracle', selectedSpread?.name?.toLowerCase().replace(/\s+/g, '-') || 'single'].filter(Boolean),
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
    <div className="min-h-screen bg-gradient-to-b from-[#0c0f14] via-[#0f1318] to-[#0a0c10] relative overflow-hidden">
      {/* DUNE Earth/Stone atmosphere - raw, elemental */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Stone texture overlay - very subtle */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />

        {/* Frost/ash particles - slow drift */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-stone-400/30 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 80, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Subtle aurora/northern lights - very muted */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <motion.div
          className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-teal-600/20 via-teal-900/5 to-transparent"
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Bottom earth glow - like distant firelight */}
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-stone-900/10 via-stone-950/5 to-transparent pointer-events-none" />

      {/* Runic circle - very subtle */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.012] pointer-events-none">
        <svg className="w-[70vmin] h-[70vmin]" viewBox="0 0 100 100">
          {/* Single outer circle with runic divisions */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#78716c" strokeWidth="0.3" />
          {/* 8 divisions for the aettir */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 - 90) * (Math.PI / 180);
            const x1 = 50 + Math.cos(angle) * 30;
            const y1 = 50 + Math.sin(angle) * 30;
            const x2 = 50 + Math.cos(angle) * 48;
            const y2 = 50 + Math.sin(angle) * 48;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#78716c" strokeWidth="0.2" />;
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
              className="flex items-center gap-2 text-stone-500/70 hover:text-stone-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Ansuz rune icon */}
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-teal-500/60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 4 L12 20 M12 4 L18 10 M12 4 L6 10" />
              </svg>
              <h1 className="text-2xl font-light text-maia-ink-100 tracking-wider">Rune Oracle</h1>
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
                  {/* Three rune stones as threshold symbol */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="inline-flex items-end gap-2 mb-8"
                  >
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0 }}
                    >
                      <RuneStone rune="fehu" size="sm" animate={false} />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    >
                      <RuneStone rune="ansuz" size="sm" animate={false} />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    >
                      <RuneStone rune="othala" size="sm" animate={false} />
                    </motion.div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-light text-maia-ink-100 mb-4 tracking-wide"
                  >
                    The Elder Futhark
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-teal-400/50 text-lg font-light">
                    The ancient Norse runes hold the secrets of wyrd and orlog
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-[#0f1318]/80 via-stone-950/10 to-[#0a0c10]/80 backdrop-blur-xl border border-stone-600/20 rounded-2xl p-8 shadow-2xl shadow-stone-900/10"
                >
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the runes?"
                    className="w-full h-32 px-5 py-4 bg-[#0c0f14]/60 border border-stone-700/30 rounded-xl text-maia-ink-100 placeholder-maia-ink-30 focus:outline-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all resize-none text-lg font-light"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-stone-700/70 to-stone-800/70 hover:from-stone-600/70 hover:to-stone-700/70 disabled:from-[#0f1318]/50 disabled:to-[#0f1318]/50 disabled:text-maia-ink-30 disabled:cursor-not-allowed text-stone-200 font-medium rounded-xl shadow-lg shadow-stone-900/20 transition-all duration-500 flex items-center justify-center gap-3 tracking-wide"
                  >
                    <Sparkles className="w-5 h-5" />
                    Reach Into the Rune Bag
                  </button>

                  <p className="text-stone-500/40 text-xs text-center mt-5 tracking-wider uppercase">
                    The 24 runes of the Elder Futhark
                  </p>
                </motion.div>
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
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-light text-maia-ink-100 mb-4 tracking-wide">
                    Choose Your Spread
                  </h2>
                  <p className="text-stone-400/50 font-light">
                    How many runes shall speak to your question?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SPREADS.map((spread, index) => (
                    <motion.button
                      key={spread.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSpreadSelect(spread)}
                      className="group relative p-6 bg-gradient-to-br from-[#0f1318]/80 via-stone-950/10 to-[#0a0c10]/80 backdrop-blur-xl border border-stone-600/20 rounded-xl hover:border-teal-500/30 transition-all duration-300 text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-stone-800/40 text-teal-400/60 font-light text-lg border border-stone-700/30">
                          {spread.runeCount}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-light text-maia-ink-100 mb-1 group-hover:text-teal-300 tracking-wide">
                            {spread.name}
                          </h3>
                          <p className="text-maia-ink-50 text-sm font-light">
                            {spread.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button
                  onClick={() => setPhase('question')}
                  className="mt-8 mx-auto block text-stone-500/50 hover:text-stone-400 text-sm transition-colors"
                >
                  ← Back to question
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
                  <h2 className="text-3xl font-bold text-maia-ink-100 mb-4">
                    Drawing the Runes
                  </h2>
                  <p className="text-maia-ink-60">
                    Drawing rune {currentRuneIndex + 1} of {selectedSpread.runeCount}...
                  </p>
                  <p className="text-maia-ink-40 text-sm mt-2">
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
                        <div className="w-24 h-32 bg-gradient-to-b from-maia-navy-700 to-maia-navy-900 rounded-t-3xl rounded-b-lg shadow-2xl border border-maia-sage-500/30" />
                        <div className="absolute top-2 left-2 right-2 h-6 bg-maia-navy-800 rounded-t-2xl" />
                        <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-maia-sage-400 animate-spin" />
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
                        <div className={`w-20 h-28 bg-gradient-to-b from-maia-navy-700 to-maia-navy-800 rounded-lg shadow-xl border border-maia-sage-500/30 flex items-center justify-center ${rune.isReversed ? 'rotate-180' : ''}`}>
                          <span className="text-3xl text-maia-ink-100 font-bold">
                            {rune.symbol || '?'}
                          </span>
                        </div>
                        <p className="text-maia-ink-60 text-xs mt-2">
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
                    <h2 className="text-3xl font-bold text-maia-ink-100 mb-2">
                      {selectedSpread.name} Reading
                    </h2>
                    <p className="text-maia-ink-60">
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
                        <div className={`relative w-24 h-32 bg-gradient-to-b from-maia-navy-700 to-maia-navy-800 rounded-lg shadow-xl border border-maia-sage-500/30 flex items-center justify-center ${rune.isReversed ? 'rotate-180' : ''}`}>
                          <span className="text-4xl text-maia-ink-100 font-bold">
                            {rune.symbol}
                          </span>
                          {rune.isReversed && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-900/60 rounded-full flex items-center justify-center">
                              <span className="text-xs text-red-300">R</span>
                            </div>
                          )}
                        </div>
                        <p className="text-maia-ink-100 font-semibold mt-3">
                          {rune.name}
                        </p>
                        <p className="text-maia-ink-40 text-xs">
                          {rune.position}
                        </p>
                        <p className="text-maia-ink-60 text-xs mt-1">
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
                          className="bg-gradient-to-br from-maia-navy-800/60 via-maia-sage-700/20 to-maia-navy-850/60 backdrop-blur-xl border border-maia-sage-500/30 rounded-xl p-6"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{rune.symbol}</span>
                            <div>
                              <h4 className="text-lg font-semibold text-maia-ink-100">
                                {rune.name}
                                {rune.isReversed && <span className="text-red-400 text-sm ml-2">(Merkstave)</span>}
                              </h4>
                              <p className="text-maia-ink-40 text-xs">{rune.position}</p>
                            </div>
                          </div>
                          <p className="text-maia-ink-80 text-sm leading-relaxed">
                            {rune.interpretation}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <span className="px-2 py-1 bg-maia-navy-900/50 rounded text-xs text-maia-ink-40">
                              {rune.element}
                            </span>
                            <span className="px-2 py-1 bg-maia-navy-900/50 rounded text-xs text-maia-ink-40">
                              {rune.aett} Aett
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Main Reading */}
                    <div className="bg-gradient-to-br from-maia-navy-800/60 via-maia-sage-700/20 to-maia-navy-850/60 backdrop-blur-xl border border-maia-sage-500/30 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-maia-sage-400" />
                        <h3 className="text-2xl font-bold text-maia-ink-100">The Runes Speak</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-maia-sage-400/80 font-semibold mb-3">Insight:</h4>
                          <p className="text-maia-ink-80 leading-relaxed">
                            {reading.insight}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-maia-sage-400/80 font-semibold mb-3">Soul Guidance:</h4>
                          <p className="text-maia-ink-80 leading-relaxed">
                            {reading.soulGuidance}
                          </p>
                        </div>

                        {reading.wyrdMessage && (
                          <div>
                            <h4 className="text-maia-sage-400/80 font-semibold mb-3 flex items-center gap-2">
                              <Flame className="w-4 h-4 text-maia-spice-400" />
                              Message from Wyrd:
                            </h4>
                            <p className="text-maia-ink-80 leading-relaxed italic">
                              {reading.wyrdMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ritual Suggestion */}
                    {reading.ritual && (
                      <div className="bg-gradient-to-br from-maia-navy-800/40 via-maia-sage-700/10 to-maia-navy-850/40 backdrop-blur-xl border border-maia-sage-500/20 rounded-xl p-6">
                        <h4 className="text-maia-sage-400/80 font-semibold mb-3 flex items-center gap-2">
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
                            : 'bg-maia-navy-800/60 hover:bg-maia-navy-700/60 border border-maia-sage-500/30 text-maia-sage-400 hover:text-maia-sage-300'
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
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-maia-sage-600 to-maia-sage-700 hover:from-maia-sage-500 hover:to-maia-sage-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                      <div className="bg-gradient-to-br from-maia-navy-800/40 via-maia-sage-700/10 to-maia-navy-850/40 backdrop-blur-xl border border-maia-sage-500/20 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-maia-sage-500/20 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-maia-sage-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-maia-ink-100 mb-2">Continue with MAIA</h4>
                            <p className="text-maia-ink-60 text-sm mb-4">
                              Want deeper insight into your runes? MAIA can help you understand the ancient wisdom,
                              explore the mythological connections, and apply this reading to your current situation.
                            </p>
                            <button
                              onClick={() => {
                                if (reading) {
                                  sessionStorage.setItem('oracle_context', JSON.stringify({
                                    type: 'runes',
                                    spread: selectedSpread?.name,
                                    runes: reading.drawnRunes.map(r => ({
                                      name: r.name,
                                      position: r.position,
                                      merkstave: r.isReversed
                                    })),
                                    insight: reading.insight,
                                    question: question,
                                    timestamp: new Date().toISOString()
                                  }));
                                }
                                router.push('/maia');
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-maia-sage-500/80 to-maia-sage-600/80 hover:from-maia-sage-500 hover:to-maia-sage-600 text-white font-medium rounded-lg shadow-lg shadow-maia-sage-500/20 transition-all duration-300"
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
