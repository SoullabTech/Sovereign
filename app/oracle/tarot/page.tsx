'use client';

/**
 * Tarot Oracle Experience - Ritual Immersion
 *
 * The Archetypal Mirror - Interactive tarot reading with ritual flow
 * Aesthetic: Amber/rose warmth (matching hub card)
 *
 * Flow:
 * 1. Threshold (arrival) - "Let the image arrive before meaning"
 * 2. Life area selection + Lens toggle
 * 3. Spiral questions
 * 4. Spread selection as ritual layout
 * 5. Card reveal - Symbol first, meaning second
 * 6. Integration - Journal prompt + Spiral Reflection
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
  Eye,
  Heart,
  Zap,
  Hexagon,
  Feather
} from 'lucide-react';
import {
  RitualShell,
  RitualBackButton,
  RitualCard,
  LifeAreaChips,
  SpiralQuestionChips,
  IntegrationGrid,
  SpiralReflection,
  getOracleTone,
  getRevealMotion,
  type LifeArea,
} from '@/components/oracle/ritual/OracleRitualParts';

type SpreadType = 'three-card' | 'celtic-cross' | 'single-card';
type TarotStage = 'threshold' | 'question' | 'spread' | 'drawing' | 'reveal' | 'reading';
type TarotLens = 'practical' | 'shadow' | 'relationship';

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

const LENS_OPTIONS: { key: TarotLens; label: string }[] = [
  { key: 'practical', label: 'Practical guidance' },
  { key: 'shadow', label: 'Shadow mirror' },
  { key: 'relationship', label: 'Relationship lens' },
];

const SPREAD_OPTIONS = [
  {
    id: 'single-card',
    name: 'Single Card',
    description: 'One clear answer',
    why: 'When you need direct, simple guidance',
    positions: 1,
    icon: Star,
  },
  {
    id: 'three-card',
    name: 'Three-Card Spread',
    description: 'Past, Present, Future',
    why: 'When you want to see the arc of a situation',
    positions: 3,
    icon: Sparkles,
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'Full 10-card reading',
    why: 'When you need a comprehensive view',
    positions: 10,
    icon: Moon,
  }
];

export default function TarotOraclePage() {
  const router = useRouter();

  // Tarot-specific tone and reveal presets
  const tone = getOracleTone('tarot');
  const revealMotion = getRevealMotion('tarot');

  const [stage, setStage] = useState<TarotStage>('threshold');
  const [lifeArea, setLifeArea] = useState<LifeArea | null>(null);
  const [lens, setLens] = useState<TarotLens>('practical');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleSpreadSelect = (spreadId: SpreadType) => {
    setSelectedSpread(spreadId);
    setStage('drawing');
    setTimeout(() => drawCards(spreadId), 1000);
  };

  const drawCards = async (spreadType: SpreadType) => {
    setIsDrawing(true);

    try {
      const response = await fetch('/api/oracle/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          spreadType,
          lifeArea,
          lens
        })
      });

      const data = await response.json();

      if (data.reading) {
        setReading(data.reading);
        setStage('reveal');
        revealCardsSequentially(data.reading.cards.length);
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
      }, i * 800);
    }
  };

  const handleNewReading = () => {
    setStage('threshold');
    setLifeArea(null);
    setLens('practical');
    setQuestion('');
    setSelectedSpread(null);
    setReading(null);
    setRevealedCards([]);
  };

  // THRESHOLD PHASE - Using shared components
  if (stage === 'threshold') {
    return (
      <RitualShell max="5xl" variant="tarot">
        <RitualBackButton to="/oracle" label="Back to Oracle" />
        <RitualCard
          title="Tarot Oracle"
          subtitle={tone.thresholdLine}
          icon={<span className="text-2xl">✶</span>}
        >
          <div className="mt-6">
            <div className="text-sm text-white/60 mb-3">Choose a life area</div>
            <LifeAreaChips value={lifeArea} onChange={setLifeArea} accentColor="amber" className="flex flex-wrap gap-2" />
          </div>

          <div className="mt-8">
            <button
              disabled={!lifeArea}
              onClick={() => setStage('question')}
              className={`w-full rounded-xl px-4 py-4 text-sm font-medium border transition flex items-center justify-center gap-2
                ${lifeArea
                  ? 'border-white/10 bg-white/10 hover:bg-white/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'}`}
            >
              <Eye className="w-5 h-5" />
              Enter the Chamber
            </button>
          </div>
        </RitualCard>

        {/* Subtle sigil watermark */}
        <div className="fixed bottom-8 right-8 pointer-events-none select-none text-7xl font-light text-white/[0.06]">
          ✶
        </div>
      </RitualShell>
    );
  }

  return (
    <RitualShell max="5xl" variant="tarot">
      {/* Soft ambient particles - tarot shimmer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-amber-200/25 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 7 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
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
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Oracle</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl text-amber-400/80">✶</span>
              <h1 className="text-xl font-light text-white/90 tracking-wide">Tarot</h1>
            </div>

            <div className="w-24" />
          </motion.div>

          <AnimatePresence mode="wait">
            {/* QUESTION PHASE */}
            {stage === 'question' && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-light text-white/90 mb-2">
                    Ask your question
                  </h2>
                  <p className="text-white/50 text-sm">
                    Hold the question gently. Let the image speak first.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  {/* Lens Toggle */}
                  <div className="mb-6">
                    <div className="text-sm text-white/60 mb-2">Lens</div>
                    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
                      {LENS_OPTIONS.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setLens(key)}
                          className={`px-4 py-2 text-sm rounded-full transition
                            ${lens === key
                              ? 'bg-amber-500/20 text-white'
                              : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spiral Questions - Using shared component */}
                  <SpiralQuestionChips
                    question={question}
                    setQuestion={setQuestion}
                    lifeArea={lifeArea}
                    accentColor="amber"
                  />

                  <div className="text-white/40 text-xs text-center mb-4 mt-6">— or —</div>

                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Write your own question..."
                    className="w-full h-24 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition-all resize-none text-sm"
                  />

                  <button
                    onClick={() => setStage('spread')}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Choose a Spread
                  </button>
                </div>
              </motion.div>
            )}

            {/* SPREAD SELECTION PHASE */}
            {stage === 'spread' && (
              <motion.div
                key="spread"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-light text-white/90 mb-2">
                    Choose your ritual layout
                  </h2>
                  <p className="text-white/50 text-sm">
                    Each spread offers a different perspective
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
                        className="group p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-amber-400/30 transition-all duration-300 text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-amber-400/70" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white mb-1">
                              {spread.name}
                            </h3>
                            <p className="text-white/60 text-sm mb-2">
                              {spread.description}
                            </p>
                            <p className="text-white/40 text-xs">
                              {spread.why}
                            </p>
                            <div className="mt-3 text-amber-400/60 text-xs">
                              {spread.positions} {spread.positions === 1 ? 'card' : 'cards'}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* DRAWING PHASE */}
            {stage === 'drawing' && (
              <motion.div
                key="drawing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="mb-8"
                >
                  <Sparkles className="w-16 h-16 text-amber-400/50" />
                </motion.div>

                <h2 className="text-2xl font-light text-white/90 mb-2">
                  {tone.waitingLine}
                </h2>
                <p className="text-white/50 text-sm">
                  The oracle speaks through sacred symbols
                </p>
              </motion.div>
            )}

            {/* REVEAL PHASE - Symbol First */}
            {stage === 'reveal' && reading && (
              <div className="max-w-3xl mx-auto">
                {/* Header stays fully steady - no animation */}
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-light text-white/90 mb-2">
                    {tone.revealLine}
                  </h2>
                </div>

                {/* Cards reveal with curtain-pull animation */}
                <motion.div
                  key="tarot-reveal"
                  initial={revealMotion.initial}
                  animate={revealMotion.animate}
                  transition={revealMotion.transition}
                  className={`grid gap-6 mb-10 ${
                    reading.cards.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
                    reading.cards.length === 3 ? 'grid-cols-3' :
                    'grid-cols-5'
                  }`}
                >
                  {reading.cards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, rotateY: 180 }}
                      animate={{
                        opacity: revealedCards.includes(index) ? 1 : 0,
                        rotateY: revealedCards.includes(index) ? 0 : 180,
                      }}
                      transition={{ duration: 0.6, delay: index * 0.15 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center"
                    >
                      <div className="text-4xl text-amber-400/50 mb-3">✶</div>
                      <div className="text-white/50 text-xs uppercase tracking-wider mb-1">
                        {card.position}
                      </div>
                      <h3 className="text-white font-medium">
                        {card.name}
                        {card.reversed && <span className="text-rose-400 ml-1">(R)</span>}
                      </h3>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setStage('reading')}
                  className="w-full rounded-xl px-4 py-4 text-sm font-medium border border-white/10 bg-white/10 hover:bg-white/15 transition"
                >
                  Proceed to Meaning
                </motion.button>
              </div>
            )}

            {/* READING PHASE - Full Interpretation */}
            {stage === 'reading' && reading && (
              <motion.div
                key="reading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Cards with Full Details */}
                <div className="mb-8">
                  <h2 className="text-2xl font-light text-white/90 text-center mb-6">
                    {reading.spreadName}
                  </h2>

                  <div className={`grid gap-6 ${
                    reading.cards.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                    reading.cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                    'grid-cols-2 md:grid-cols-5'
                  }`}>
                    {reading.cards.map((card, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <div className="text-center mb-4">
                          <div className="text-white/50 text-xs uppercase tracking-wider mb-1">
                            {card.position}
                          </div>
                          <h3 className="text-lg font-medium text-white">
                            {card.name}
                            {card.reversed && <span className="text-rose-400 ml-2">(R)</span>}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {card.keywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-500/10 border border-amber-400/20 text-amber-300/70 text-xs rounded">
                              {kw}
                            </span>
                          ))}
                        </div>
                        <p className="text-white/60 text-sm">{card.interpretation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Oracle's Wisdom */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-5 h-5 text-amber-400/80" />
                    <h3 className="text-xl font-light text-white/90">Oracle's Wisdom</h3>
                  </div>

                  <div className="space-y-6 text-white/70 leading-relaxed">
                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-2">Overall Message</h4>
                      <p>{reading.overallMessage}</p>
                    </div>
                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-2">Guidance</h4>
                      <p>{reading.advice}</p>
                    </div>
                  </div>
                </div>

                {/* Integration Section - Using shared component */}
                <IntegrationGrid
                  aTitle="One step (24 hours)"
                  aBody="Choose one small action that matches the card's posture. Keep it simple."
                  bTitle="Journal this"
                  bBody="What part of me does this card describe that I usually hide?"
                  cTitle="One thing to stop"
                  cBody="Stop rehearsing the old story. Notice where you tighten — and soften once."
                />

                {/* Spiral Reflection - Using shared component */}
                <SpiralReflection
                  element={lens === 'shadow' ? 'Water' : lens === 'relationship' ? 'Air' : 'Earth'}
                  state={lens === 'shadow' ? 'integration' : 'opening'}
                  practice="One honest sentence + one embodied action."
                />

                {/* Actions - the choice moment */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleNewReading}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Reading
                  </button>
                  <button
                    onClick={() => router.push('/oracle')}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium rounded-xl transition-all"
                  >
                    Back to Oracle
                  </button>
                </div>

                {/* Closing incantation - after choice */}
                <p className="mt-10 text-white/35 text-sm text-center italic">
                  {tone.integrationLine}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle sigil watermark */}
      <div className="fixed bottom-8 right-8 pointer-events-none select-none text-7xl font-light text-white/[0.06] z-0">
        ✶
      </div>
    </RitualShell>
  );
}
