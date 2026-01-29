'use client';

/**
 * Tarot Oracle Experience
 *
 * The Mirror of the Soul - Interactive tarot reading with card animations
 * Aesthetic: DUNE deep velvet - cinematic, archetypal, mythopoetic
 *
 * Features:
 * - Spread selection with card preview
 * - Sequential card reveal with dramatic turn
 * - Physical card presence with shadows
 * - Positional relationships
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Moon,
  Star,
  RefreshCw,
  BookOpen,
  Loader2,
  MessageCircle,
  BookmarkPlus,
  Check
} from 'lucide-react';

type SpreadType = 'three-card' | 'celtic-cross' | 'single-card';
type ReadingPhase = 'question' | 'spread-selection' | 'drawing' | 'reveal' | 'interpretation';

interface DrawnCard {
  card: {
    id: string;
    name: string;
    arcana: string;
    suit?: string;
    number?: number;
    element?: string;
    keywords: string[];
    uprightMeaning: string;
    reversedMeaning: string;
    soulGuidance?: string;
    symbolism?: string;
    astrological?: string;
  };
  position: {
    name: string;
    description: string;
  };
  isReversed: boolean;
  interpretation: string;
}

interface TarotReading {
  query: string;
  spread: {
    name: string;
    description: string;
    cardCount: number;
  };
  drawnCards: DrawnCard[];
  insight: string;
  soulGuidance?: string;
  ritual?: {
    name: string;
    duration: string;
    materials: string[];
    steps: string[];
    intention: string;
  };
}

const SPREAD_OPTIONS = [
  {
    id: 'single-card',
    name: 'Single Card',
    description: 'Quick guidance for today',
    positions: 1,
    icon: Star,
    recommended: 'Daily insight',
    color: 'violet'
  },
  {
    id: 'three-card',
    name: 'Three-Card Spread',
    description: 'Past, Present, Future',
    positions: 3,
    icon: Sparkles,
    recommended: 'Most popular',
    color: 'spice'
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'Comprehensive 10-card reading',
    positions: 10,
    icon: Moon,
    recommended: 'Deep dive',
    color: 'sage'
  }
];

export default function TarotOraclePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<ReadingPhase>('question');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleQuestionSubmit = () => {
    if (question.trim()) {
      setPhase('spread-selection');
    }
  };

  const handleSpreadSelect = (spreadId: SpreadType) => {
    setSelectedSpread(spreadId);
    setPhase('drawing');
    setError(null);
    setTimeout(() => {
      drawCards(spreadId);
    }, 1000);
  };

  const drawCards = async (spreadType: SpreadType) => {
    setIsDrawing(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          spreadType: spreadType
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.reading && data.reading.drawnCards && data.reading.drawnCards.length > 0) {
        setReading(data.reading);
        setPhase('reveal');
        revealCardsSequentially(data.reading.drawnCards.length);
      } else {
        throw new Error('Invalid reading response - no cards returned');
      }
    } catch (err) {
      console.error('Failed to draw cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to draw cards');
      setPhase('question');
    } finally {
      setIsDrawing(false);
    }
  };

  const revealCardsSequentially = (cardCount: number) => {
    setRevealedCards([]);
    for (let i = 0; i < cardCount; i++) {
      setTimeout(() => {
        setRevealedCards(prev => [...prev, i]);
        if (i === cardCount - 1) {
          setTimeout(() => {
            setPhase('interpretation');
          }, 1500);
        }
      }, i * 800);
    }
  };

  const handleNewReading = () => {
    setPhase('question');
    setQuestion('');
    setSelectedSpread(null);
    setReading(null);
    setRevealedCards([]);
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
            oracleType: 'tarot',
            question,
            spread: reading.spread.name,
            cards: reading.drawnCards.map(dc => ({
              name: dc.card.name,
              position: dc.position.name,
              reversed: dc.isReversed,
            })),
            insight: reading.insight,
            soulGuidance: reading.soulGuidance,
          },
          tags: ['tarot', 'oracle', reading.spread.name.toLowerCase().replace(/\s+/g, '-')],
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
    <div className="min-h-screen bg-gradient-to-b from-[#08060d] via-[#0d0a14] to-[#06050a] relative overflow-hidden">
      {/* DUNE Deep Velvet - cinematic, theatrical darkness */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Velvet texture overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-violet-950/5 via-transparent to-transparent" style={{ backgroundPosition: 'center 30%' }} />

        {/* Candlelight motes - slow, ethereal */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-violet-300/40 rounded-full"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Vignette edge darkness - theatrical */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6,5,10,0.6) 100%)'
      }} />

      {/* Bottom violet glow - like altar candlelight */}
      <div className="fixed bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-violet-950/15 via-purple-950/5 to-transparent pointer-events-none" />

      {/* Mystical star pattern - very subtle */}
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
        <svg className="w-[90vmin] h-[90vmin]" viewBox="0 0 100 100">
          {/* Six-pointed star (Star of David / hexagram) */}
          <polygon
            points="50,10 61,35 90,35 67,52 78,80 50,63 22,80 33,52 10,35 39,35"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="0.2"
          />
          {/* Inner circle */}
          <circle cx="50" cy="50" r="20" fill="none" stroke="#a78bfa" strokeWidth="0.15" />
          {/* Outer circle */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="#7c3aed" strokeWidth="0.15" />
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
              className="flex items-center gap-2 text-violet-400/50 hover:text-violet-300/70 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Stylized card icon */}
              <svg className="w-6 h-6 text-violet-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M12 7 L12 17 M8 12 L16 12" strokeWidth="1" opacity="0.5" />
              </svg>
              <h1 className="text-2xl font-light text-maia-ink-100 tracking-wider">Tarot Oracle</h1>
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
                  {/* Three card backs as threshold symbol */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    className="inline-flex items-center gap-2 mb-8"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="relative"
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: [0, 5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                      >
                        <div className={`w-12 h-18 rounded-lg bg-gradient-to-br from-violet-900/60 to-purple-950/60 border border-violet-500/30 shadow-lg shadow-violet-900/30 ${i === 1 ? 'scale-110' : 'scale-95 opacity-70'}`} style={{ height: '4.5rem' }}>
                          <div className="absolute inset-1 rounded border border-violet-400/20" />
                          <Star className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${i === 1 ? 'text-violet-400/50' : 'text-violet-500/30'}`} />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-light text-maia-ink-100 mb-4 tracking-wide"
                  >
                    The Mirror of the Soul
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-violet-300/50 text-lg font-light"
                  >
                    What story does your psyche wish to tell?
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-[#0d0a14]/80 via-violet-950/10 to-[#06050a]/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-8 shadow-2xl shadow-violet-900/10"
                >
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the cards?"
                    className="w-full h-32 px-5 py-4 bg-[#08060d]/60 border border-violet-900/30 rounded-xl text-maia-ink-100 placeholder-maia-ink-30 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all resize-none text-lg font-light"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-violet-700/70 to-purple-800/70 hover:from-violet-600/70 hover:to-purple-700/70 disabled:from-[#0d0a14]/50 disabled:to-[#0d0a14]/50 disabled:text-maia-ink-30 disabled:cursor-not-allowed text-violet-100 font-medium rounded-xl shadow-lg shadow-violet-900/20 transition-all duration-500 flex items-center justify-center gap-3 tracking-wide"
                  >
                    <Sparkles className="w-5 h-5" />
                    Choose Your Spread
                  </button>

                  <p className="text-violet-400/25 text-xs text-center mt-5 tracking-wider uppercase">
                    The 78 cards of the Rider-Waite tradition
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Spread Selection Phase */}
            {phase === 'spread-selection' && (
              <motion.div
                key="spread-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-light text-maia-ink-100 mb-4 tracking-wide">
                    Choose Your Spread
                  </h2>
                  <p className="text-violet-300/40 text-lg max-w-2xl mx-auto font-light">
                    Each spread offers a different window into your question
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SPREAD_OPTIONS.map((spread, index) => {
                    const Icon = spread.icon;

                    return (
                      <motion.button
                        key={spread.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        onClick={() => handleSpreadSelect(spread.id as SpreadType)}
                        className="group p-6 bg-gradient-to-br from-[#0d0a14]/80 via-violet-950/10 to-[#06050a]/80 backdrop-blur-xl border border-violet-500/20 hover:border-violet-400/40 rounded-2xl hover:shadow-2xl hover:shadow-violet-900/20 transition-all duration-500"
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          {/* Card stack visualization */}
                          <div className="relative w-16 h-20 mb-4">
                            {[...Array(Math.min(spread.positions, 3))].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-10 h-14 bg-gradient-to-br from-violet-900/40 to-purple-950/40 border border-violet-500/30 rounded-lg shadow-md"
                                style={{
                                  left: `${50 - 20 + i * 8}%`,
                                  top: `${i * 4}px`,
                                  transform: `rotate(${(i - 1) * 8}deg)`,
                                  zIndex: 3 - i
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.15 + i * 0.1 }}
                              >
                                <Icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/40" />
                              </motion.div>
                            ))}
                          </div>

                          <h3 className="text-xl font-light text-maia-ink-100 mb-2 tracking-wide group-hover:text-violet-200 transition-colors">
                            {spread.name}
                          </h3>

                          <span className="inline-block px-3 py-1 bg-violet-600/15 text-violet-300/60 text-xs rounded-full mb-3 tracking-wide">
                            {spread.recommended}
                          </span>

                          <p className="text-maia-ink-50 text-sm mb-3 font-light">
                            {spread.description}
                          </p>

                          <div className="text-violet-400/40 text-xs tracking-wide">
                            {spread.positions} {spread.positions === 1 ? 'card' : 'cards'}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPhase('question')}
                  className="mt-8 mx-auto block text-violet-400/40 hover:text-violet-300/60 text-sm transition-colors"
                >
                  ← Back to question
                </button>
              </motion.div>
            )}

            {/* Drawing Phase */}
            {phase === 'drawing' && (
              <motion.div
                key="drawing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="mb-8"
                >
                  <Loader2 className="w-20 h-20 text-violet-400" />
                </motion.div>

                <h2 className="text-3xl font-bold text-maia-ink-100 mb-4">
                  Drawing the Cards...
                </h2>
                <p className="text-maia-ink-60 text-lg">
                  The oracle speaks through sacred symbols
                </p>
              </motion.div>
            )}

            {/* Reveal & Interpretation Phase */}
            {(phase === 'reveal' || phase === 'interpretation') && reading && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Cards Display */}
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-maia-ink-100 text-center mb-2">
                    {reading.spread.name}
                  </h2>
                  <p className="text-maia-ink-60 text-center mb-8">
                    {reading.spread.description}
                  </p>

                  <div className={`grid gap-6 ${
                    reading.drawnCards.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
                    reading.drawnCards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-2 md:grid-cols-5'
                  }`}>
                    {reading.drawnCards.map((drawnCard, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, rotateY: 180 }}
                        animate={{
                          opacity: revealedCards.includes(index) ? 1 : 0,
                          rotateY: revealedCards.includes(index) ? 0 : 180,
                        }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="perspective-1000"
                      >
                        <div className="bg-gradient-to-br from-maia-navy-800/60 via-violet-900/30 to-maia-navy-850/60 backdrop-blur-xl border border-violet-500/30 rounded-xl p-6 min-h-[300px] flex flex-col shadow-xl">
                          <div className="text-center mb-4">
                            <div className="text-violet-400/60 text-xs uppercase tracking-wider mb-2">
                              {drawnCard.position.name}
                            </div>
                            <h3 className="text-lg font-bold text-maia-ink-100">
                              {drawnCard.card.name}
                              {drawnCard.isReversed && <span className="text-red-400 ml-2 text-sm">(Reversed)</span>}
                            </h3>
                            {drawnCard.card.suit && (
                              <div className="text-maia-ink-40 text-xs mt-1">
                                {drawnCard.card.suit} {drawnCard.card.arcana}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex items-center justify-center mb-4">
                            <div className="w-20 h-28 bg-gradient-to-br from-violet-900/40 to-purple-900/40 rounded-lg border border-violet-500/20 flex items-center justify-center">
                              <Star className="w-10 h-10 text-violet-400/50" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {drawnCard.card.keywords.slice(0, 3).map((keyword, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-violet-900/30 text-violet-300/70 text-xs rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Interpretation */}
                {phase === 'interpretation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-maia-navy-800/60 via-violet-900/20 to-maia-navy-850/60 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-8 shadow-2xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <BookOpen className="w-6 h-6 text-violet-400" />
                      <h3 className="text-2xl font-bold text-maia-ink-100">Oracle's Wisdom</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Overall Insight */}
                      <div>
                        <h4 className="text-violet-300/80 font-semibold mb-2">Overall Message:</h4>
                        <p className="text-maia-ink-80 leading-relaxed">
                          {reading.insight}
                        </p>
                      </div>

                      {/* Soul Guidance */}
                      {reading.soulGuidance && (
                        <div>
                          <h4 className="text-violet-300/80 font-semibold mb-2">Soul Guidance:</h4>
                          <p className="text-maia-ink-80 leading-relaxed">
                            {reading.soulGuidance}
                          </p>
                        </div>
                      )}

                      {/* Individual Card Interpretations */}
                      <div className="border-t border-maia-navy-700/50 pt-6 mt-6">
                        <h4 className="text-violet-300/80 font-semibold mb-4">Card Details:</h4>
                        <div className="space-y-4">
                          {reading.drawnCards.map((drawnCard, index) => (
                            <div key={index} className="bg-maia-navy-900/50 rounded-lg p-4">
                              <h5 className="text-maia-ink-100 font-semibold mb-1">
                                {drawnCard.card.name} - {drawnCard.position.name}
                              </h5>
                              <p className="text-maia-ink-40 text-xs mb-2">
                                {drawnCard.position.description}
                              </p>
                              <p className="text-maia-ink-60 text-sm mb-2">
                                {drawnCard.isReversed ? drawnCard.card.reversedMeaning : drawnCard.card.uprightMeaning}
                              </p>
                              <p className="text-maia-ink-80 text-sm">
                                {drawnCard.interpretation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ritual Suggestion */}
                      {reading.ritual && (
                        <div className="border-t border-maia-navy-700/50 pt-6 mt-6">
                          <h4 className="text-violet-300/80 font-semibold mb-4">Suggested Ritual: {reading.ritual.name}</h4>
                          <div className="bg-maia-navy-900/50 rounded-lg p-4">
                            <p className="text-maia-ink-60 text-sm mb-3">
                              <span className="text-maia-ink-40">Duration:</span> {reading.ritual.duration}
                            </p>
                            <p className="text-maia-ink-60 text-sm mb-3">
                              <span className="text-maia-ink-40">Materials:</span> {reading.ritual.materials.join(', ')}
                            </p>
                            <p className="text-maia-ink-80 text-sm italic">
                              {reading.ritual.intention}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-8">
                      <button
                        onClick={handleSaveToReflections}
                        disabled={isSaving || isSaved}
                        className={`px-5 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          isSaved
                            ? 'bg-maia-sage-600/80 text-white cursor-default'
                            : 'bg-maia-navy-800/60 hover:bg-maia-navy-700/60 border border-violet-500/30 text-violet-400 hover:text-violet-300'
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
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                      <div className="bg-gradient-to-br from-maia-navy-800/40 via-violet-900/10 to-maia-navy-850/40 backdrop-blur-xl border border-violet-500/20 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-violet-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-maia-ink-100 mb-2">Continue with MAIA</h4>
                            <p className="text-maia-ink-60 text-sm mb-4">
                              Want deeper insight into your cards? MAIA can help you understand the archetypal patterns,
                              explore the symbolism, and connect this reading to your life situation.
                            </p>
                            <button
                              onClick={() => {
                                if (reading) {
                                  sessionStorage.setItem('oracle_context', JSON.stringify({
                                    type: 'tarot',
                                    spread: reading.spread.name,
                                    cards: reading.drawnCards.map(dc => ({
                                      name: dc.card.name,
                                      position: dc.position.name,
                                      reversed: dc.isReversed
                                    })),
                                    insight: reading.insight,
                                    question: question,
                                    timestamp: new Date().toISOString()
                                  }));
                                }
                                router.push('/maia');
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500/80 to-purple-500/80 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-violet-500/20 transition-all duration-300"
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
