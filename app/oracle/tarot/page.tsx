'use client';

/**
 * Tarot Oracle Experience
 *
 * The Mirror of the Soul - Interactive tarot reading with card animations
 * Aesthetic: Night sky temple with sacred card mysticism
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
    <div className="min-h-screen bg-gradient-to-br from-maia-navy-950 via-maia-navy-900 to-maia-navy-950 relative overflow-hidden">
      {/* Atmospheric Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
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
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-violet-950/20 via-maia-navy-900/10 to-transparent pointer-events-none" />

      {/* Sacred geometry overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          <circle cx="500" cy="500" r="450" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="8 8" />
          <circle cx="500" cy="500" r="350" fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="8 8" />
          <circle cx="500" cy="500" r="250" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="8 8" />
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
              <Star className="w-6 h-6 text-violet-400" />
              <h1 className="text-2xl font-light text-maia-ink-100 tracking-wide">Tarot Oracle</h1>
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
                    <Star className="w-16 h-16 text-violet-400/80" />
                  </motion.div>

                  <h2 className="text-4xl font-bold text-maia-ink-100 mb-4">
                    Ask Your Question
                  </h2>
                  <p className="text-maia-ink-60 text-lg">
                    The cards are listening. Speak from your heart.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-maia-navy-800/60 via-violet-900/20 to-maia-navy-850/60 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the cards?"
                    className="w-full h-32 px-4 py-3 bg-maia-navy-900/50 border border-maia-navy-700/40 rounded-lg text-maia-ink-100 placeholder-maia-ink-40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-maia-navy-800/50 disabled:to-maia-navy-800/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Continue to Card Selection
                  </button>
                </div>
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
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-maia-ink-100 mb-4">
                    Choose Your Spread
                  </h2>
                  <p className="text-maia-ink-60 text-lg max-w-2xl mx-auto">
                    Each spread offers a different perspective on your question
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SPREAD_OPTIONS.map((spread, index) => {
                    const Icon = spread.icon;
                    const colorClasses = {
                      violet: {
                        gradient: 'from-maia-navy-800/60 via-violet-900/20 to-maia-navy-850/60',
                        border: 'border-violet-500/30 hover:border-violet-400/50',
                        icon: 'bg-violet-900/30 group-hover:bg-violet-800/40',
                        iconColor: 'text-violet-400',
                        badge: 'bg-violet-600/20 text-violet-300/80'
                      },
                      spice: {
                        gradient: 'from-maia-navy-800/60 via-maia-spice-700/20 to-maia-navy-850/60',
                        border: 'border-maia-spice-500/30 hover:border-maia-spice-400/50',
                        icon: 'bg-maia-spice-900/30 group-hover:bg-maia-spice-800/40',
                        iconColor: 'text-maia-spice-400',
                        badge: 'bg-maia-spice-600/20 text-maia-spice-300/80'
                      },
                      sage: {
                        gradient: 'from-maia-navy-800/60 via-maia-sage-700/20 to-maia-navy-850/60',
                        border: 'border-maia-sage-500/30 hover:border-maia-sage-400/50',
                        icon: 'bg-maia-sage-900/30 group-hover:bg-maia-sage-800/40',
                        iconColor: 'text-maia-sage-400',
                        badge: 'bg-maia-sage-600/20 text-maia-sage-300/80'
                      }
                    };
                    const colors = colorClasses[spread.color as keyof typeof colorClasses];

                    return (
                      <motion.button
                        key={spread.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSpreadSelect(spread.id as SpreadType)}
                        className={`group p-6 bg-gradient-to-br ${colors.gradient} backdrop-blur-xl border ${colors.border} rounded-2xl hover:shadow-2xl transition-all duration-300`}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-16 h-16 rounded-full ${colors.icon} flex items-center justify-center mb-4 transition-colors`}>
                            <Icon className={`w-8 h-8 ${colors.iconColor}`} />
                          </div>

                          <h3 className="text-xl font-bold text-maia-ink-100 mb-2">
                            {spread.name}
                          </h3>

                          <span className={`inline-block px-3 py-1 ${colors.badge} text-xs rounded-full mb-3`}>
                            {spread.recommended}
                          </span>

                          <p className="text-maia-ink-60 text-sm mb-3">
                            {spread.description}
                          </p>

                          <div className="text-maia-ink-40 text-xs">
                            {spread.positions} {spread.positions === 1 ? 'card' : 'cards'}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
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
