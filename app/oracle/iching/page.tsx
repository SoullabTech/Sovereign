'use client';

/**
 * I Ching Oracle Experience - Ritual Immersion
 *
 * The Book of Changes - A portal for timing, change, and the turning of the spiral
 * Aesthetic: Deep ink, cold starlight, indigo essence
 *
 * Flow:
 * 1. Threshold (arrival) - "entering the chamber" moment
 * 2. Ritual prompt - guide into spiral language
 * 3. Method-specific action - yarrow stalk casting feels physical
 * 4. Revelation - symbol first, then meaning
 * 5. Integration - closing actions and reflections
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
  Feather,
  Eye,
  Heart,
  Zap
} from 'lucide-react';

type ReadingPhase = 'threshold' | 'question' | 'casting' | 'reveal' | 'interpretation' | 'integration';
type LifeArea = 'relationship' | 'work' | 'health' | 'purpose' | 'money' | 'family' | null;

interface HexagramLine {
  type: 'yang' | 'yin';
  changing: boolean;
  value: number;
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
  spiralReflection?: {
    element: string;
    state: string;
    practice: string[];
  };
}

const LIFE_AREAS = [
  { key: 'relationship', label: 'Relationship', icon: Heart },
  { key: 'work', label: 'Work', icon: Zap },
  { key: 'health', label: 'Health', icon: Eye },
  { key: 'purpose', label: 'Purpose', icon: Sparkles },
  { key: 'money', label: 'Money', icon: Hexagon },
  { key: 'family', label: 'Family', icon: Feather },
] as const;

const SPIRAL_QUESTIONS = [
  "What is the nature of this moment?",
  "What is completing?",
  "What is emerging?",
  "What posture is wise?",
];

export default function IChingOraclePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<ReadingPhase>('threshold');
  const [lifeArea, setLifeArea] = useState<LifeArea>(null);
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<IChingReading | null>(null);
  const [hexagramLines, setHexagramLines] = useState<HexagramLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isCasting, setIsCasting] = useState(false);

  // Enter the chamber
  const enterChamber = () => {
    setPhase('question');
  };

  // Yarrow stalk casting - builds hexagram line by line
  const castYarrowStalks = async () => {
    setPhase('casting');
    setIsCasting(true);
    const lines: HexagramLine[] = [];

    for (let i = 0; i < 6; i++) {
      setCurrentLineIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1800));

      const value = Math.floor(Math.random() * 4) + 6;
      const line: HexagramLine = {
        type: (value === 7 || value === 9) ? 'yang' : 'yin',
        changing: (value === 6 || value === 9),
        value
      };

      lines.push(line);
      setHexagramLines([...lines]);
    }

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
          lifeArea,
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
        setTimeout(() => setPhase('interpretation'), 3000);
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
    setPhase('threshold');
    setLifeArea(null);
    setQuestion('');
    setReading(null);
    setHexagramLines([]);
    setCurrentLineIndex(0);
  };

  const moveToIntegration = () => {
    setPhase('integration');
  };

  return (
    <div className="min-h-screen bg-[#06060A] relative overflow-hidden">
      {/* Atmospheric backdrop - deep ink, indigo essence */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_30%_20%,rgba(79,70,229,0.12),transparent_60%),radial-gradient(900px_700px_at_70%_30%,rgba(99,102,241,0.08),transparent_55%),radial-gradient(1100px_800px_at_50%_85%,rgba(139,92,246,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5),rgba(0,0,0,0.9))]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Cold starlight particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-indigo-200/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
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

          {/* Header - only show after threshold */}
          {phase !== 'threshold' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-12"
            >
              <button
                onClick={() => router.push('/oracle')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Oracle</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-2xl text-indigo-400/80">☰</span>
                <h1 className="text-xl font-light text-white/90 tracking-wide">I Ching</h1>
              </div>

              <div className="w-24" />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* THRESHOLD PHASE - Entering the Chamber */}
            {phase === 'threshold' && (
              <motion.div
                key="threshold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center justify-center min-h-[80vh] text-center"
              >
                {/* Sigil */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="relative mb-10"
                >
                  <div className="absolute inset-0 blur-3xl bg-indigo-500/20 rounded-full" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    className="relative text-8xl text-indigo-400/70"
                  >
                    ☰
                  </motion.div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-light text-white/95 tracking-tight mb-4"
                >
                  The Book of Changes
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-lg text-white/60 max-w-md mb-12"
                >
                  A mirror for timing, change, and the turning of the spiral.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-lg backdrop-blur-xl"
                >
                  <p className="text-white/80 text-lg mb-6">
                    Take one breath.
                  </p>
                  <p className="text-white/60 text-sm mb-8">
                    Ask what is true now — not what you wish were true.
                  </p>

                  <button
                    onClick={enterChamber}
                    className="w-full px-6 py-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-medium rounded-xl border border-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Eye className="w-5 h-5" />
                    Enter the Chamber
                  </button>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  onClick={() => router.push('/oracle')}
                  className="mt-8 text-white/40 hover:text-white/60 text-sm transition-colors"
                >
                  ← Back to Oracle
                </motion.button>
              </motion.div>
            )}

            {/* QUESTION PHASE */}
            {phase === 'question' && (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                {/* Life Area Selection */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-light text-white/90 mb-2">
                    Name the life area
                  </h2>
                  <p className="text-white/50 text-sm">
                    Where does this question live?
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  {LIFE_AREAS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setLifeArea(key as LifeArea)}
                      className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 text-sm ${
                        lifeArea === key
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Spiral Questions */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-6">
                  <div className="text-white/60 text-sm mb-4">
                    Consider asking:
                  </div>
                  <div className="space-y-2 mb-6">
                    {SPIRAL_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(q)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                          question === q
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                            : 'bg-black/20 border-white/10 text-white/70 hover:bg-black/30 hover:text-white/80'
                        }`}
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>

                  <div className="text-white/50 text-xs text-center mb-4">— or —</div>

                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Write your own question..."
                    className="w-full h-24 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all resize-none text-sm"
                  />
                </div>

                <button
                  onClick={handleQuestionSubmit}
                  disabled={!question.trim()}
                  className="w-full px-6 py-4 bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-medium rounded-xl border border-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Cast the Yarrow Stalks
                </button>

                <p className="text-white/40 text-xs text-center mt-4">
                  The Changes show the pattern; you choose the posture.
                </p>
              </motion.div>
            )}

            {/* CASTING PHASE */}
            {phase === 'casting' && (
              <motion.div
                key="casting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-2xl font-light text-white/90 mb-2">
                    Building the hexagram
                  </h2>
                  <p className="text-white/50 text-sm">
                    Line {currentLineIndex + 1} of 6 — from earth to heaven
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {isCasting && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="mb-12"
                    >
                      <Loader2 className="w-10 h-10 text-indigo-400/60" />
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    {[...Array(6)].map((_, index) => {
                      const lineIndex = 5 - index;
                      const line = hexagramLines[lineIndex];
                      const isRevealed = lineIndex < hexagramLines.length;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: isRevealed ? 1 : 0.15,
                            scale: isRevealed ? 1 : 0.9,
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center justify-center gap-3"
                        >
                          {isRevealed && line ? (
                            <HexagramLineDisplay line={line} />
                          ) : (
                            <div className="w-40 h-2 bg-white/10 rounded" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* REVEAL PHASE - Symbol First */}
            {phase === 'reveal' && reading && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh]"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-center"
                >
                  <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 blur-3xl bg-indigo-500/20 rounded-full" />
                    <div className="text-9xl text-indigo-400/80 relative">☰</div>
                  </div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-5xl font-light text-white/95 mb-2"
                  >
                    {reading.hexagram.number}
                  </motion.h2>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="text-2xl text-white/80 mb-2"
                  >
                    {reading.hexagram.name}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="text-lg text-white/50"
                  >
                    {reading.hexagram.keyword}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.0 }}
                    className="mt-8 text-white/40 text-sm"
                  >
                    Let the symbol land before meaning...
                  </motion.p>
                </motion.div>
              </motion.div>
            )}

            {/* INTERPRETATION PHASE - Meaning */}
            {phase === 'interpretation' && reading && (
              <motion.div
                key="interpretation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto"
              >
                {/* Hexagram Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                    <h4 className="text-white/70 text-sm mb-4 text-center">Present Hexagram</h4>
                    <div className="space-y-2 mb-4">
                      {reading.hexagram.lines.map((line, index) => (
                        <div key={index} className="flex items-center justify-center">
                          <div className={`h-2 rounded ${
                            line === '-------' ? 'w-32 bg-indigo-400/80' : 'w-32 flex gap-3'
                          }`}>
                            {line === '--- ---' && (
                              <>
                                <div className="flex-1 bg-indigo-400/80 rounded" />
                                <div className="flex-1 bg-indigo-400/80 rounded" />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-white/50 text-xs">
                      {reading.hexagram.trigrams.upper} over {reading.hexagram.trigrams.lower}
                    </div>
                  </div>

                  {reading.hexagram.transformed && (
                    <div className="bg-white/5 border border-indigo-500/20 rounded-xl p-6 backdrop-blur-xl">
                      <h4 className="text-indigo-300/70 text-sm mb-4 text-center">Transforming to</h4>
                      <div className="text-center">
                        <div className="text-4xl text-indigo-400/60 mb-2">{reading.hexagram.transformed.number}</div>
                        <div className="text-white/70">{reading.hexagram.transformed.name}</div>
                        <div className="text-white/50 text-sm mt-1">{reading.hexagram.transformed.keyword}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interpretation */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-5 h-5 text-indigo-400/80" />
                    <h3 className="text-xl font-light text-white/90">Oracle's Wisdom</h3>
                  </div>

                  <div className="space-y-6 text-white/70 leading-relaxed">
                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-2">Interpretation</h4>
                      <p>{reading.hexagram.interpretation}</p>
                    </div>

                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-2">Guidance</h4>
                      <p>{reading.guidance}</p>
                    </div>

                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-2">Timing</h4>
                      <p>{reading.sacredTiming}</p>
                    </div>
                  </div>
                </div>

                {/* Spiral Reflection */}
                {reading.spiralReflection && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6 mb-6">
                    <h4 className="text-indigo-300/80 text-sm font-medium mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Spiral Reflection
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-white/50">Element:</span>
                        <span className="text-white/80 ml-2">{reading.spiralReflection.element}</span>
                      </div>
                      <div>
                        <span className="text-white/50">State:</span>
                        <span className="text-white/80 ml-2">{reading.spiralReflection.state}</span>
                      </div>
                    </div>
                    <div className="text-white/60 text-sm">
                      <span className="text-white/50">Practice:</span>
                      <ul className="mt-2 space-y-1">
                        {reading.spiralReflection.practice.map((p, i) => (
                          <li key={i} className="text-white/70">• {p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <button
                  onClick={moveToIntegration}
                  className="w-full px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl border border-white/10 transition-all duration-300"
                >
                  Continue to Integration
                </button>
              </motion.div>
            )}

            {/* INTEGRATION PHASE - Closing */}
            {phase === 'integration' && reading && (
              <motion.div
                key="integration"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-light text-white/90 mb-2">Integration</h2>
                  <p className="text-white/50 text-sm">One step, one reflection</p>
                </div>

                <div className="space-y-6">
                  {/* One action */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                    <h4 className="text-white/80 text-sm font-medium mb-3">
                      One small action (within 24 hours):
                    </h4>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm">
                        {reading.ritual || "Take 5 minutes to sit with what arose. Notice what feels true."}
                      </p>
                    </div>
                  </div>

                  {/* Journal prompt */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                    <h4 className="text-white/80 text-sm font-medium mb-3">
                      One sentence to journal:
                    </h4>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-white/60 text-sm italic">
                        "The pattern I'm seeing is... and my next wise move is..."
                      </p>
                    </div>
                  </div>

                  {/* What to stop */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
                    <h4 className="text-white/80 text-sm font-medium mb-3">
                      One thing to stop doing:
                    </h4>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-white/60 text-sm italic">
                        "I will stop trying to control..."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleNewReading}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Reading
                  </button>
                  <button
                    onClick={() => router.push('/oracle')}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium rounded-xl border border-white/10 transition-all"
                  >
                    Back to Oracle
                  </button>
                </div>

                <p className="text-center text-white/40 text-xs mt-6">
                  The Changes show the pattern; you choose the posture.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Subtle sigil watermark */}
      <div className="fixed bottom-8 right-8 pointer-events-none select-none text-7xl font-light text-white/[0.06]">
        ☰
      </div>
    </div>
  );
}

function HexagramLineDisplay({ line }: { line: HexagramLine }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-3 rounded transition-all ${
        line.type === 'yang' ? 'w-40 bg-indigo-400/80' : 'w-40 flex gap-3'
      }`}>
        {line.type === 'yin' && (
          <>
            <div className="flex-1 bg-indigo-400/80 rounded" />
            <div className="flex-1 bg-indigo-400/80 rounded" />
          </>
        )}
      </div>
      {line.changing && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-indigo-300/70" />
        </motion.div>
      )}
    </div>
  );
}
