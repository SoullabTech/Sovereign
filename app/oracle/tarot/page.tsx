'use client';

/**
 * Tarot Oracle Experience
 *
 * The Mirror of the Soul - Interactive tarot reading with card animations
 * Aesthetic: Sage/teal mystical atmosphere
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Moon,
  Star,
  Heart,
  Wand2,
  Swords,
  Coins,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Save,
  Check,
  Loader2
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

type SpreadType = 'three-card' | 'celtic-cross' | 'single-card';
type ReadingPhase = 'question' | 'spread-selection' | 'drawing' | 'reveal' | 'interpretation';

interface TarotCard {
  name: string;
  position: string;
  reversed: boolean;
  meaning: string;
  interpretation: string;
  keywords: string[];
  suit?: string;
}

interface TarotReading {
  cards: TarotCard[];
  spreadName: string;
  overallMessage: string;
  advice: string;
}

const SPREAD_OPTIONS = [
  {
    id: 'single-card',
    name: 'Single Card',
    description: 'Quick guidance for today',
    positions: 1,
    icon: Star,
    recommended: 'Daily insight'
  },
  {
    id: 'three-card',
    name: 'Three-Card Spread',
    description: 'Past, Present, Future',
    positions: 3,
    icon: Sparkles,
    recommended: 'Most popular'
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'Comprehensive 10-card reading',
    positions: 10,
    icon: Moon,
    recommended: 'Deep dive'
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
    // Start drawing animation after a brief moment
    setTimeout(() => {
      drawCards(spreadId);
    }, 1000);
  };

  const drawCards = async (spreadType: SpreadType) => {
    setIsDrawing(true);

    try {
      // Call the tarot API endpoint
      const response = await apiFetch('/api/oracle/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          spreadType: spreadType
        })
      });

      const data = await response.json();

      if (data.reading) {
        // Transform API response to match frontend interface
        const transformedReading: TarotReading = {
          cards: data.reading.drawnCards.map((dc: {
            card: { name: string; keywords: string[]; suit?: string };
            position: { name: string };
            isReversed: boolean;
            interpretation: string;
          }) => ({
            name: dc.card.name,
            position: dc.position.name,
            reversed: dc.isReversed,
            meaning: dc.interpretation,
            interpretation: dc.interpretation,
            keywords: dc.card.keywords || [],
            suit: dc.card.suit
          })),
          spreadName: data.reading.spread.name,
          overallMessage: data.reading.insight || '',
          advice: data.reading.soulGuidance || ''
        };
        setReading(transformedReading);
        setPhase('reveal');
        // Reveal cards one by one
        revealCardsSequentially(transformedReading.cards.length);
      }
    } catch (error) {
      console.error('Failed to draw cards:', error);
    } finally {
      setIsDrawing(false);
    }
  };

  const revealCardsSequentially = (cardCount: number) => {
    const revealed: number[] = [];
    for (let i = 0; i < cardCount; i++) {
      setTimeout(() => {
        revealed.push(i);
        setRevealedCards([...revealed]);

        // Move to interpretation phase after last card
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
    setIsSaved(false);
  };

  const handleSaveReading = async () => {
    if (!reading || isSaving || isSaved) return;

    setIsSaving(true);
    try {
      // Map spread type to API format
      const spreadTypeMap: Record<string, string> = {
        'single-card': 'single',
        'three-card': 'three_card',
        'celtic-cross': 'celtic_cross'
      };

      const response = await apiFetch('/api/divination/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tarot',
          reading: {
            question: question,
            spread_type: spreadTypeMap[selectedSpread || 'three-card'] || 'three_card',
            cards_json: reading.cards.map((card, index) => ({
              position: card.position,
              card: card.name,
              reversed: card.reversed,
              suit: card.suit,
              arcana: card.name.includes('The ') ? 'major' : 'minor'
            })),
            interpretation_text: reading.overallMessage,
            guidance_text: reading.advice,
            archetypal_themes: reading.cards.flatMap(c => c.keywords.slice(0, 2))
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to save reading:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] via-[#7FB5B3] to-[#5A9A97] relative overflow-hidden">
      {/* Atmospheric Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
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

      {/* Subtle glow from below */}
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-teal-900/20 via-teal-800/10 to-transparent pointer-events-none" />

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
              className="flex items-center gap-2 text-teal-900/70 hover:text-teal-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Oracle</span>
            </button>

            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-teal-800" />
              <h1 className="text-2xl font-light text-teal-900 tracking-wide">Tarot Oracle</h1>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </motion.div>

          {/* Question Phase */}
          <AnimatePresence mode="wait">
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
                    <Star className="w-16 h-16 text-teal-800/80" />
                  </motion.div>

                  <h2 className="text-4xl font-bold text-teal-900 mb-4">
                    Ask Your Question
                  </h2>
                  <p className="text-teal-800/70 text-lg">
                    The cards are listening. Speak from your heart.
                  </p>
                </div>

                <div className="bg-white/30 backdrop-blur-xl border border-teal-600/30 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance do you seek from the cards?"
                    className="w-full h-32 px-4 py-3 bg-white/50 border border-teal-600/40 rounded-lg text-teal-900 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 disabled:from-teal-400/30 disabled:to-teal-500/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                  <h2 className="text-4xl font-bold text-teal-900 mb-4">
                    Choose Your Spread
                  </h2>
                  <p className="text-teal-800/70 text-lg max-w-2xl mx-auto">
                    Each spread offers a different perspective on your question
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
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSpreadSelect(spread.id as SpreadType)}
                        className="group p-6 bg-white/30 backdrop-blur-xl border border-teal-600/30 rounded-2xl hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-600/20 transition-all duration-300"
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-teal-700/30 group-hover:bg-teal-600/40 flex items-center justify-center mb-4 transition-colors">
                            <Icon className="w-8 h-8 text-teal-800" />
                          </div>

                          <h3 className="text-xl font-bold text-teal-900 mb-2">
                            {spread.name}
                          </h3>

                          <span className="inline-block px-3 py-1 bg-teal-600/20 text-teal-800 text-xs rounded-full mb-3">
                            {spread.recommended}
                          </span>

                          <p className="text-teal-800/70 text-sm mb-3">
                            {spread.description}
                          </p>

                          <div className="text-teal-700/60 text-xs">
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
                  <Sparkles className="w-20 h-20 text-teal-800" />
                </motion.div>

                <h2 className="text-3xl font-bold text-teal-900 mb-4">
                  Drawing the Cards...
                </h2>
                <p className="text-teal-800/70 text-lg">
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
                  <h2 className="text-3xl font-bold text-teal-900 text-center mb-8">
                    {reading.spreadName}
                  </h2>

                  <div className={`grid gap-6 ${
                    reading.cards.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
                    reading.cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-2 md:grid-cols-5'
                  }`}>
                    {reading.cards.map((card, index) => (
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
                        <div className="bg-white/40 backdrop-blur-xl border border-teal-600/40 rounded-xl p-6 min-h-[300px] flex flex-col shadow-xl">
                          <div className="text-center mb-4">
                            <div className="text-teal-700/70 text-xs uppercase tracking-wider mb-2">
                              {card.position}
                            </div>
                            <h3 className="text-lg font-bold text-teal-900">
                              {card.name}
                              {card.reversed && <span className="text-red-600 ml-2">(R)</span>}
                            </h3>
                          </div>

                          <div className="flex-1 flex items-center justify-center mb-4">
                            <Star className="w-16 h-16 text-teal-600/30" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {card.keywords.slice(0, 3).map((keyword, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-teal-700/20 text-teal-800 text-xs rounded"
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
                    className="bg-white/30 backdrop-blur-xl border border-teal-600/30 rounded-2xl p-8 shadow-2xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <BookOpen className="w-6 h-6 text-teal-800" />
                      <h3 className="text-2xl font-bold text-teal-900">Oracle's Wisdom</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-teal-800 font-semibold mb-2">Overall Message:</h4>
                        <p className="text-teal-900/80 leading-relaxed">
                          {reading.overallMessage}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-teal-800 font-semibold mb-2">Guidance:</h4>
                        <p className="text-teal-900/80 leading-relaxed">
                          {reading.advice}
                        </p>
                      </div>

                      {/* Individual Card Interpretations */}
                      <div className="border-t border-teal-600/30 pt-6 mt-6">
                        <h4 className="text-teal-800 font-semibold mb-4">Card Details:</h4>
                        <div className="space-y-4">
                          {reading.cards.map((card, index) => (
                            <div key={index} className="bg-teal-800/10 rounded-lg p-4">
                              <h5 className="text-teal-900 font-semibold mb-2">
                                {card.name} - {card.position}
                              </h5>
                              <p className="text-teal-800/70 text-sm">
                                {card.interpretation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Consult with MAIA */}
                    <div className="bg-gradient-to-br from-violet-900/30 via-purple-800/20 to-indigo-900/30 backdrop-blur-xl border border-violet-500/30 rounded-xl p-6 mt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <MessageSquare className="w-6 h-6 text-violet-600" />
                        <h4 className="text-xl font-semibold text-violet-900">Explore with MAIA</h4>
                      </div>
                      <p className="text-violet-800/70 text-sm mb-4">
                        Bring this reading into conversation with MAIA to explore its meaning for your specific situation and integrate its wisdom.
                      </p>
                      <button
                        onClick={() => {
                          const cardsSummary = reading.cards.map(c =>
                            `${c.name}${c.reversed ? ' (Reversed)' : ''} in ${c.position}: ${c.keywords.slice(0, 3).join(', ')}`
                          ).join('\n');
                          const context = encodeURIComponent(
                            `I just received a Tarot reading for my question: "${question}"\n\n` +
                            `Spread: ${reading.spreadName}\n\n` +
                            `Cards drawn:\n${cardsSummary}\n\n` +
                            `Overall message: ${reading.overallMessage}\n\n` +
                            `Guidance: ${reading.advice}\n\n` +
                            `Help me understand how this applies to my situation and what the cards are revealing.`
                          );
                          router.push(`/maia?context=${context}`);
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Consult with MAIA
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mt-6">
                      <button
                        onClick={handleSaveReading}
                        disabled={isSaving || isSaved}
                        className={`flex-1 px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          isSaved
                            ? 'bg-green-600/80 text-white cursor-default'
                            : 'bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 text-white'
                        }`}
                      >
                        {isSaving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isSaved ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {isSaved ? 'Saved to Reflections' : 'Save Reading'}
                      </button>
                      <button
                        onClick={handleNewReading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        New Reading
                      </button>
                      <button
                        onClick={() => router.push('/oracle')}
                        className="px-6 py-3 bg-teal-800/20 hover:bg-teal-700/30 text-teal-900 font-semibold rounded-lg transition-all duration-300"
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
