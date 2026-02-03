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
<<<<<<< HEAD
  Feather,
  Eye,
  Heart,
=======
  MessageSquare,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
>>>>>>> ecstatic-brown
  Zap
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { EmbeddedMAIAChat } from '@/components/oracle/EmbeddedMAIAChat';

type ReadingPhase = 'threshold' | 'question' | 'casting' | 'reveal' | 'interpretation' | 'integration';
type LifeArea = 'relationship' | 'work' | 'health' | 'purpose' | 'money' | 'family' | null;

interface HexagramLine {
  type: 'yang' | 'yin';
  changing: boolean;
  value: number;
}

interface ChangingLineMeaning {
  line: number;
  meaning: string;
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
  changingLineMeanings?: ChangingLineMeaning[];
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
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());

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
      const response = await apiFetch('/api/oracle/iching', {
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
    setIsSaved(false);
    setSaveError(null);
    setExpandedLines(new Set());
  };

  const toggleLineExpanded = (lineNum: number) => {
    setExpandedLines(prev => {
      const next = new Set(prev);
      if (next.has(lineNum)) {
        next.delete(lineNum);
      } else {
        next.add(lineNum);
      }
      return next;
    });
  };

  const handleSaveReading = async () => {
    if (!reading || isSaving || isSaved) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await apiFetch('/api/divination/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'iching',
          reading: {
            question: question,
            cast_method: 'yarrow',
            primary_hex: reading.hexagram.number,
            primary_hex_name: reading.hexagram.name,
            line_values: hexagramLines.map(l => l.value),
            changing_lines: reading.hexagram.changingLines || [],
            relating_hex: reading.hexagram.transformed?.number,
            relating_hex_name: reading.hexagram.transformed?.name,
            lower_trigram: reading.hexagram.trigrams.lower,
            upper_trigram: reading.hexagram.trigrams.upper,
            interpretation_text: reading.hexagram.interpretation,
            guidance_text: reading.guidance,
            sacred_timing: reading.sacredTiming,
            ritual_suggestion: reading.ritual,
            theme_keywords: [reading.hexagram.keyword],
            archetypal_themes: reading.archetypalTheme ? [reading.archetypalTheme] : []
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsSaved(true);
      } else {
        setSaveError(data.error || 'Failed to save reading');
        console.error('Save failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to save reading:', error);
      setSaveError('Network error - please try again');
    } finally {
      setIsSaving(false);
    }
  };

  const moveToIntegration = () => {
    setPhase('integration');
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[#06060A] relative overflow-hidden">
      {/* Atmospheric backdrop - deep ink, indigo essence */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_30%_20%,rgba(79,70,229,0.12),transparent_60%),radial-gradient(900px_700px_at_70%_30%,rgba(99,102,241,0.08),transparent_55%),radial-gradient(1100px_800px_at_50%_85%,rgba(139,92,246,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5),rgba(0,0,0,0.9))]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Cold starlight particles */}
=======
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] via-[#7FB5B3] to-[#5A9A97] relative overflow-hidden">
      {/* Atmospheric Particles */}
>>>>>>> ecstatic-brown
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
<<<<<<< HEAD
            className="absolute w-0.5 h-0.5 bg-indigo-200/30 rounded-full"
=======
            className="absolute w-1 h-1 bg-white/30 rounded-full"
>>>>>>> ecstatic-brown
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

<<<<<<< HEAD
=======
      {/* Subtle glow from below */}
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-teal-900/20 via-teal-800/10 to-transparent pointer-events-none" />

>>>>>>> ecstatic-brown
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-5xl">

<<<<<<< HEAD
          {/* Header - only show after threshold */}
          {phase !== 'threshold' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-12"
=======
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <button
              onClick={() => router.push('/oracle')}
              className="flex items-center gap-2 text-teal-900/70 hover:text-teal-900 transition-colors"
>>>>>>> ecstatic-brown
            >
              <button
                onClick={() => router.push('/oracle')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Oracle</span>
              </button>

<<<<<<< HEAD
              <div className="flex items-center gap-2">
                <span className="text-2xl text-indigo-400/80">☰</span>
                <h1 className="text-xl font-light text-white/90 tracking-wide">I Ching</h1>
              </div>
=======
            <div className="flex items-center gap-2">
              <Hexagon className="w-6 h-6 text-teal-800" />
              <h1 className="text-2xl font-light text-teal-900 tracking-wide">I Ching Oracle</h1>
            </div>
>>>>>>> ecstatic-brown

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
<<<<<<< HEAD
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
=======
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
                    <Hexagon className="w-16 h-16 text-teal-800/80" />
                  </motion.div>

                  <h2 className="text-4xl font-bold text-teal-900 mb-4">
                    Consult the Book of Changes
                  </h2>
                  <p className="text-teal-800/70 text-lg">
                    The ancient wisdom of the I Ching awaits your question
                  </p>
                </div>

                <div className="bg-white/30 backdrop-blur-xl border border-teal-600/30 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What situation requires wisdom and guidance?"
                    className="w-full h-32 px-4 py-3 bg-white/50 border border-teal-600/40 rounded-lg text-teal-900 placeholder-teal-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 disabled:from-teal-400/30 disabled:to-teal-500/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Cast the Yarrow Stalks
                  </button>

                  <p className="text-teal-800/50 text-xs text-center mt-4">
                    Using the traditional 50 yarrow stalk method
                  </p>
>>>>>>> ecstatic-brown
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
<<<<<<< HEAD
                  <h2 className="text-2xl font-light text-white/90 mb-2">
                    Building the hexagram
                  </h2>
                  <p className="text-white/50 text-sm">
                    Line {currentLineIndex + 1} of 6 — from earth to heaven
=======
                  <h2 className="text-3xl font-bold text-teal-900 mb-4">
                    Casting the Hexagram
                  </h2>
                  <p className="text-teal-800/70">
                    Building line {currentLineIndex + 1} of 6...
>>>>>>> ecstatic-brown
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {isCasting && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="mb-12"
                    >
<<<<<<< HEAD
                      <Loader2 className="w-10 h-10 text-indigo-400/60" />
=======
                      <Loader2 className="w-12 h-12 text-teal-800" />
>>>>>>> ecstatic-brown
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
<<<<<<< HEAD
                            <div className="w-40 h-2 bg-white/10 rounded" />
=======
                            <div className="w-48 h-3 bg-teal-800/20 rounded" />
>>>>>>> ecstatic-brown
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
<<<<<<< HEAD
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
=======
                <div className="mb-12">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-teal-900 mb-2">
                      Hexagram {reading.hexagram.number}
                    </h2>
                    <h3 className="text-2xl text-teal-800 mb-1">
                      {reading.hexagram.name}
                    </h3>
                    <p className="text-teal-800/60 text-lg">
                      {reading.hexagram.keyword}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Primary Hexagram */}
                    <div className="bg-white/40 backdrop-blur-xl border border-teal-600/40 rounded-xl p-8 shadow-xl">
                      <h4 className="text-teal-800 text-center mb-6 font-semibold">
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
                                ? 'w-48 bg-teal-600'
                                : 'w-48 flex gap-4'
                            }`}>
                              {line === '--- ---' && (
                                <>
                                  <div className="flex-1 bg-teal-600 rounded" />
                                  <div className="flex-1 bg-teal-600 rounded" />
                                </>
                              )}
                            </div>
                            {reading.hexagram.changingLines?.includes(5 - index + 1) && (
                              <Sparkles className="w-4 h-4 text-teal-800 ml-3" />
                            )}
                          </motion.div>
                        ))}
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-teal-800/60 text-sm">
                          Upper Trigram: {reading.hexagram.trigrams.upper}
                        </div>
                        <div className="text-teal-800/60 text-sm">
                          Lower Trigram: {reading.hexagram.trigrams.lower}
                        </div>
                      </div>
                    </div>

                    {/* Transformed Hexagram (if changing lines exist) */}
                    {reading.hexagram.transformed && (
                      <div className="bg-white/40 backdrop-blur-xl border border-teal-600/40 rounded-xl p-8 shadow-xl">
                        <h4 className="text-teal-800 text-center mb-6 font-semibold">
                          Future Hexagram
                        </h4>

                        <div className="text-center space-y-3">
                          <Hexagon className="w-16 h-16 text-teal-700/70 mx-auto" />
                          <h5 className="text-2xl font-bold text-teal-900">
                            {reading.hexagram.transformed.number}
                          </h5>
                          <p className="text-teal-800">
                            {reading.hexagram.transformed.name}
                          </p>
                          <p className="text-teal-700/70 text-sm">
                            {reading.hexagram.transformed.keyword}
                          </p>
                        </div>

                        <div className="mt-6 p-4 bg-teal-800/10 rounded-lg">
                          <p className="text-teal-800/70 text-sm text-center">
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
                    <div className="bg-white/30 backdrop-blur-xl border border-teal-600/30 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-teal-800" />
                        <h3 className="text-2xl font-bold text-teal-900">Oracle's Wisdom</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-teal-800 font-semibold mb-3">Interpretation:</h4>
                          <p className="text-teal-900/70 leading-relaxed">
                            {reading.hexagram.interpretation}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-teal-800 font-semibold mb-3">Guidance:</h4>
                          <p className="text-teal-900/70 leading-relaxed">
                            {reading.guidance}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-teal-800 font-semibold mb-3">Sacred Timing:</h4>
                          <p className="text-teal-900/70 leading-relaxed">
                            {reading.sacredTiming}
                          </p>
                        </div>

                        {reading.archetypalTheme && (
                          <div>
                            <h4 className="text-teal-800 font-semibold mb-3">Archetypal Theme:</h4>
                            <p className="text-teal-900/70 leading-relaxed">
                              {reading.archetypalTheme}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Changing Lines - The Heart of I Ching */}
                    {reading.hexagram.changingLineMeanings && reading.hexagram.changingLineMeanings.length > 0 && (
                      <div className="bg-gradient-to-br from-amber-900/20 via-orange-800/15 to-yellow-900/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                          <Zap className="w-6 h-6 text-amber-500" />
                          <h3 className="text-2xl font-bold text-amber-100">Changing Lines</h3>
                          <span className="ml-auto text-amber-400/70 text-sm">
                            {reading.hexagram.changingLineMeanings.length} line{reading.hexagram.changingLineMeanings.length > 1 ? 's' : ''} in motion
                          </span>
                        </div>

                        <p className="text-amber-200/70 text-sm mb-6 leading-relaxed">
                          The changing lines are the living heart of your reading. They reveal where energy is actively transforming
                          and offer specific guidance for your situation. Click each line to explore its meaning.
                        </p>

                        <div className="space-y-3">
                          {reading.hexagram.changingLineMeanings.map((changingLine) => {
                            const isExpanded = expandedLines.has(changingLine.line);
                            const lineValue = hexagramLines[changingLine.line - 1]?.value;
                            const isOldYang = lineValue === 9;
                            const isOldYin = lineValue === 6;

                            return (
                              <motion.div
                                key={changingLine.line}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: changingLine.line * 0.1 }}
                                className="bg-black/20 rounded-xl overflow-hidden"
                              >
                                <button
                                  onClick={() => toggleLineExpanded(changingLine.line)}
                                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                                >
                                  {/* Line number badge */}
                                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-600/30 flex items-center justify-center">
                                    <span className="text-amber-200 font-bold">{changingLine.line}</span>
                                  </div>

                                  {/* Line visualization */}
                                  <div className="flex-shrink-0 flex items-center gap-2">
                                    {isOldYang ? (
                                      <>
                                        <div className="w-8 h-2 bg-amber-500 rounded" />
                                        <span className="text-amber-400 text-xs">→</span>
                                        <div className="w-3 h-2 bg-amber-500/50 rounded" />
                                        <div className="w-3 h-2 bg-amber-500/50 rounded" />
                                      </>
                                    ) : isOldYin ? (
                                      <>
                                        <div className="w-3 h-2 bg-amber-500 rounded" />
                                        <div className="w-3 h-2 bg-amber-500 rounded" />
                                        <span className="text-amber-400 text-xs">→</span>
                                        <div className="w-8 h-2 bg-amber-500/50 rounded" />
                                      </>
                                    ) : null}
                                  </div>

                                  {/* Change type label */}
                                  <div className="flex-1">
                                    <span className="text-amber-300 text-sm">
                                      {isOldYang ? 'Yang becoming Yin' : isOldYin ? 'Yin becoming Yang' : 'Changing'}
                                    </span>
                                  </div>

                                  {/* Expand/collapse indicator */}
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="w-5 h-5 text-amber-400" />
                                  </motion.div>
                                </button>

                                {/* Expanded content */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4 pt-2 border-t border-amber-500/20">
                                        <p className="text-amber-100/90 leading-relaxed">
                                          {changingLine.meaning}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Summary of transformation */}
                        {reading.hexagram.transformed && (
                          <div className="mt-6 pt-6 border-t border-amber-500/20">
                            <p className="text-amber-200/70 text-sm text-center">
                              Through these changes, Hexagram {reading.hexagram.number} ({reading.hexagram.name})
                              transforms into Hexagram {reading.hexagram.transformed.number} ({reading.hexagram.transformed.name})
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ritual Suggestion */}
                    {reading.ritual && (
                      <div className="bg-teal-800/10 backdrop-blur-xl border border-teal-600/20 rounded-xl p-6">
                        <h4 className="text-teal-800 font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Integration Ritual
                        </h4>
                        <p className="text-teal-900/60 text-sm leading-relaxed">
                          {reading.ritual}
                        </p>
                      </div>
                    )}

                    {/* Embedded MAIA Chat */}
                    <EmbeddedMAIAChat
                      oracleType="I Ching"
                      question={question}
                      readingContext={
                        `Hexagram ${reading.hexagram.number}: ${reading.hexagram.name} (${reading.hexagram.keyword})\n` +
                        `Upper trigram: ${reading.hexagram.trigrams.upper}, Lower trigram: ${reading.hexagram.trigrams.lower}\n\n` +
                        `Interpretation: ${reading.hexagram.interpretation}\n\n` +
                        `Guidance: ${reading.guidance}\n` +
                        (reading.hexagram.changingLineMeanings?.length
                          ? `\nChanging Lines:\n${reading.hexagram.changingLineMeanings.map(cl => `Line ${cl.line}: ${cl.meaning}`).join('\n')}\n`
                          : '') +
                        (reading.hexagram.transformed
                          ? `\nThis transforms into Hexagram ${reading.hexagram.transformed.number}: ${reading.hexagram.transformed.name}`
                          : '')
                      }
                    />

                    {/* Save Error Display */}
                    {saveError && (
                      <div className="mb-4 p-4 bg-red-900/30 border border-red-600/30 rounded-lg">
                        <p className="text-red-300 text-sm">{saveError}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveReading}
                        disabled={isSaving || isSaved}
                        className={`flex-1 px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          isSaved
                            ? 'bg-green-600/80 text-white cursor-default'
                            : saveError
                            ? 'bg-red-700 hover:bg-red-600 text-white'
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
                        {isSaved ? 'Saved to Reflections' : saveError ? 'Retry Save' : 'Save Reading'}
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
>>>>>>> ecstatic-brown
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
<<<<<<< HEAD
      <div className={`h-3 rounded transition-all ${
        line.type === 'yang' ? 'w-40 bg-indigo-400/80' : 'w-40 flex gap-3'
      }`}>
        {line.type === 'yin' && (
          <>
            <div className="flex-1 bg-indigo-400/80 rounded" />
            <div className="flex-1 bg-indigo-400/80 rounded" />
=======
      <div className={`h-4 rounded transition-all ${
        line.type === 'yang'
          ? 'w-48 bg-teal-600'
          : 'w-48 flex gap-4'
      }`}>
        {line.type === 'yin' && (
          <>
            <div className="flex-1 bg-teal-600 rounded" />
            <div className="flex-1 bg-teal-600 rounded" />
>>>>>>> ecstatic-brown
          </>
        )}
      </div>
      {line.changing && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
<<<<<<< HEAD
          <Sparkles className="w-4 h-4 text-indigo-300/70" />
=======
          <Sparkles className="w-5 h-5 text-teal-800" />
>>>>>>> ecstatic-brown
        </motion.div>
      )}
    </div>
  );
}
