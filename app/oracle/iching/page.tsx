'use client';

/**
 * I Ching Oracle Experience
 *
 * The Book of Changes - Traditional yarrow stalk divination
 * Aesthetic: Ancient Chinese emperor's divination chamber
 *
 * Features:
 * - Yarrow stalk simulation (traditional method)
 * - Hexagram building line by line
 * - Trigram visualization
 * - Changing lines and transformation
 */

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  RefreshCw,
  Loader2,
  MessageSquare,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { EmbeddedMAIAChat } from '@/components/oracle/EmbeddedMAIAChat';

/**
 * Bagua Symbol - Traditional 8-sided I Ching symbol
 * The Bagua (八卦) octagon represents the 8 trigrams of the I Ching
 */
function BaguaSymbol({ size = 24, className = '' }: { size?: number; className?: string }) {
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.28;
  const strokeWidth = size * 0.06;

  // Generate octagon points
  const getOctagonPoints = (radius: number) => {
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 - Math.PI / 8; // Start rotated for flat top
      points.push({
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      });
    }
    return points.map((p) => `${p.x},${p.y}`).join(' ');
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      {/* Outer octagon */}
      <polygon points={getOctagonPoints(outerRadius)} />
      {/* Inner octagon */}
      <polygon points={getOctagonPoints(innerRadius)} />
      {/* Center point */}
      <circle cx={center} cy={center} r={size * 0.06} fill="currentColor" stroke="none" />
    </svg>
  );
}

type ReadingPhase = 'question' | 'casting' | 'reveal' | 'interpretation';

interface HexagramLine {
  type: 'yang' | 'yin';
  changing: boolean;
  value: number; // 6-9 traditional values
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
}

export default function IChingOraclePage() {
  return (
    <Suspense fallback={null}>
      <IChingOracleContent />
    </Suspense>
  );
}

function IChingOracleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Return path: if user came from MAIA (or anywhere), back buttons honor it
  const returnTo = searchParams.get('return') || '/oracle';
  const returnLabel = returnTo === '/maia' ? 'Return to MAIA' : 'Back to Oracle';
  const [phase, setPhase] = useState<ReadingPhase>('question');
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<IChingReading | null>(null);
  const [hexagramLines, setHexagramLines] = useState<HexagramLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isCasting, setIsCasting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  // "Bring to Field" — the offering bowl
  const [isBringing, setIsBringing] = useState(false);
  const [isBrought, setIsBrought] = useState(false);

  // Yarrow stalk casting simulation - builds hexagram line by line
  const castYarrowStalks = async () => {
    setPhase('casting');
    setIsCasting(true);
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
      const response = await apiFetch('/api/oracle/iching', {
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

      const data = await response.json();

      if (data.reading) {
        setReading(data.reading);
        setPhase('reveal');

        // Move to interpretation after revealing hexagram
        setTimeout(() => {
          setPhase('interpretation');
        }, 2000);
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
    setPhase('question');
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

  // "Bring to Field" — capture this reading as a Stage 1 field record
  const handleBringToField = async () => {
    if (!reading || isBringing || isBrought) return;

    setIsBringing(true);
    try {
      // Compose a quiet, readable summary of what happened
      const hexName = `Hexagram ${reading.hexagram.number}: ${reading.hexagram.name}`;
      const transformed = reading.hexagram.transformed
        ? ` → Hexagram ${reading.hexagram.transformed.number}: ${reading.hexagram.transformed.name}`
        : '';
      const changingCount = reading.hexagram.changingLines?.length || 0;
      const changingNote = changingCount > 0
        ? ` (${changingCount} changing line${changingCount > 1 ? 's' : ''})`
        : '';

      const phenomena = [
        `I Ching consultation: ${hexName}${transformed}${changingNote}`,
        '',
        reading.hexagram.interpretation,
        '',
        reading.guidance ? `Guidance: ${reading.guidance}` : '',
      ].filter(Boolean).join('\n');

      const tags = [
        'iching',
        `hexagram-${reading.hexagram.number}`,
        reading.hexagram.keyword?.toLowerCase(),
        reading.hexagram.transformed ? `hexagram-${reading.hexagram.transformed.number}` : null,
      ].filter(Boolean) as string[];

      const response = await apiFetch('/api/field/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'iching',
          phenomena,
          tags,
          triggerEvent: question || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsBrought(true);
      }
    } catch (error) {
      console.error('Failed to bring to field:', error);
    } finally {
      setIsBringing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] relative overflow-hidden">
      {/* Atmospheric Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4B896]/30 rounded-full"
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
      <div className="fixed bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#D4B896]/10 via-[#D4B896]/5 to-transparent pointer-events-none" />

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
              onClick={() => router.push(returnTo)}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">{returnLabel}</span>
            </button>

            <div className="flex items-center gap-2">
              <BaguaSymbol size={24} className="text-[#D4B896]" />
              <h1 className="text-2xl font-light text-white tracking-wide">I Ching Oracle</h1>
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
                    <BaguaSymbol size={64} className="text-[#D4B896]/80" />
                  </motion.div>

                  <h2 className="text-4xl font-bold text-white mb-4">
                    Consult the Book of Changes
                  </h2>
                  <p className="text-[#D4B896]/70 text-lg">
                    The ancient wisdom of the I Ching awaits your question
                  </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-[#D4B896]/20 rounded-2xl p-8 shadow-2xl">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What situation requires wisdom and guidance?"
                    className="w-full h-32 px-4 py-3 bg-white/[0.08] border border-[#D4B896]/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#D4B896]/50 focus:border-[#D4B896] transition-all resize-none"
                    autoFocus
                  />

                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!question.trim()}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-[#D4B896] to-[#C4A886] hover:from-[#E4C8A6] hover:to-[#D4B896] disabled:from-[#D4B896]/30 disabled:to-[#B49876]/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Cast the Yarrow Stalks
                  </button>

                  <p className="text-[#D4B896]/50 text-xs text-center mt-4">
                    Using the traditional 50 yarrow stalk method
                  </p>
                </div>
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
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Casting the Hexagram
                  </h2>
                  <p className="text-[#D4B896]/70">
                    Building line {currentLineIndex + 1} of 6...
                  </p>
                </div>

                {/* Hexagram Building Animation */}
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  {/* Yarrow stalk animation */}
                  {isCasting && (
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="mb-12"
                    >
                      <Loader2 className="w-12 h-12 text-[#D4B896]" />
                    </motion.div>
                  )}

                  {/* Hexagram lines building up */}
                  <div className="space-y-4">
                    {[...Array(6)].map((_, index) => {
                      const lineIndex = 5 - index; // Build from bottom to top
                      const line = hexagramLines[lineIndex];
                      const isRevealed = lineIndex < hexagramLines.length;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: isRevealed ? 1 : 0.2,
                            scale: isRevealed ? 1 : 0.8,
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center justify-center gap-3"
                        >
                          {isRevealed && line ? (
                            <HexagramLineDisplay line={line} />
                          ) : (
                            <div className="w-48 h-3 bg-[#D4B896]/15 rounded" />
                          )}
                        </motion.div>
                      );
                    })}
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
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      Hexagram {reading.hexagram.number}
                    </h2>
                    <h3 className="text-2xl text-[#D4B896] mb-1">
                      {reading.hexagram.name}
                    </h3>
                    <p className="text-[#D4B896]/60 text-lg">
                      {reading.hexagram.keyword}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Primary Hexagram */}
                    <div className="bg-white/[0.05] backdrop-blur-xl border border-[#D4B896]/30 rounded-xl p-8 shadow-xl">
                      <h4 className="text-[#D4B896] text-center mb-6 font-semibold">
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
                                ? 'w-48 bg-[#D4B896]'
                                : 'w-48 flex gap-4'
                            }`}>
                              {line === '--- ---' && (
                                <>
                                  <div className="flex-1 bg-[#D4B896] rounded" />
                                  <div className="flex-1 bg-[#D4B896] rounded" />
                                </>
                              )}
                            </div>
                            {reading.hexagram.changingLines?.includes(5 - index + 1) && (
                              <Sparkles className="w-4 h-4 text-[#D4B896] ml-3" />
                            )}
                          </motion.div>
                        ))}
                      </div>

                      <div className="text-center space-y-2">
                        <div className="text-[#D4B896]/60 text-sm">
                          Upper Trigram: {reading.hexagram.trigrams.upper}
                        </div>
                        <div className="text-[#D4B896]/60 text-sm">
                          Lower Trigram: {reading.hexagram.trigrams.lower}
                        </div>
                      </div>
                    </div>

                    {/* Transformed Hexagram (if changing lines exist) */}
                    {reading.hexagram.transformed && (
                      <div className="bg-white/[0.05] backdrop-blur-xl border border-[#D4B896]/30 rounded-xl p-8 shadow-xl">
                        <h4 className="text-[#D4B896] text-center mb-6 font-semibold">
                          Future Hexagram
                        </h4>

                        <div className="text-center space-y-3">
                          <BaguaSymbol size={64} className="text-[#D4B896]/50 mx-auto" />
                          <h5 className="text-2xl font-bold text-white">
                            {reading.hexagram.transformed.number}
                          </h5>
                          <p className="text-[#D4B896]">
                            {reading.hexagram.transformed.name}
                          </p>
                          <p className="text-[#D4B896]/50 text-sm">
                            {reading.hexagram.transformed.keyword}
                          </p>
                        </div>

                        <div className="mt-6 p-4 bg-[#D4B896]/10 rounded-lg">
                          <p className="text-[#D4B896]/70 text-sm text-center">
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
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-[#D4B896]/20 rounded-2xl p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-[#D4B896]" />
                        <h3 className="text-2xl font-bold text-white">Oracle's Wisdom</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[#D4B896] font-semibold mb-3">Interpretation:</h4>
                          <p className="text-white/70 leading-relaxed">
                            {reading.hexagram.interpretation}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[#D4B896] font-semibold mb-3">Guidance:</h4>
                          <p className="text-white/70 leading-relaxed">
                            {reading.guidance}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[#D4B896] font-semibold mb-3">Sacred Timing:</h4>
                          <p className="text-white/70 leading-relaxed">
                            {reading.sacredTiming}
                          </p>
                        </div>

                        {reading.archetypalTheme && (
                          <div>
                            <h4 className="text-[#D4B896] font-semibold mb-3">Archetypal Theme:</h4>
                            <p className="text-white/70 leading-relaxed">
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
                      <div className="bg-[#D4B896]/10 backdrop-blur-xl border border-[#D4B896]/15 rounded-xl p-6">
                        <h4 className="text-[#D4B896] font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Integration Ritual
                        </h4>
                        <p className="text-white/60 text-sm leading-relaxed">
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
                    <div className="space-y-3">
                      {/* Primary: Save + Bring to Field */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveReading}
                          disabled={isSaving || isSaved}
                          className={`flex-1 px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                            isSaved
                              ? 'bg-green-600/80 text-white cursor-default'
                              : saveError
                              ? 'bg-red-700 hover:bg-red-600 text-white'
                              : 'bg-gradient-to-r from-[#D4B896] to-[#B49876] hover:from-[#E4C8A6] hover:to-[#D4B896] text-white'
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

                        {/* Bring to Field — the offering bowl */}
                        <button
                          onClick={handleBringToField}
                          disabled={isBringing || isBrought}
                          className={`px-6 py-3 rounded-lg transition-all duration-500 flex items-center justify-center gap-2 text-sm ${
                            isBrought
                              ? 'bg-[#D4B896]/10 text-[#D4B896]/70 cursor-default border border-[#D4B896]/20'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white/80 border border-white/10 hover:border-[#D4B896]/30'
                          }`}
                        >
                          {isBringing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isBrought ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          {isBrought ? 'Captured' : 'Bring to Field'}
                        </button>
                      </div>

                      {/* Secondary: New Reading + Return */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleNewReading}
                          className="flex-1 px-6 py-3 bg-[#D4B896]/15 hover:bg-[#D4B896]/25 text-white/80 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          New Reading
                        </button>
                        <button
                          onClick={() => router.push(returnTo)}
                          className="flex-1 px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white/80 rounded-lg transition-all duration-300 text-sm"
                        >
                          {returnLabel}
                        </button>
                      </div>
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

// Component to display individual hexagram lines
function HexagramLineDisplay({ line }: { line: HexagramLine }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-4 rounded transition-all ${
        line.type === 'yang'
          ? 'w-48 bg-[#D4B896]'
          : 'w-48 flex gap-4'
      }`}>
        {line.type === 'yin' && (
          <>
            <div className="flex-1 bg-[#D4B896] rounded" />
            <div className="flex-1 bg-[#D4B896] rounded" />
          </>
        )}
      </div>
      {line.changing && (
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Sparkles className="w-5 h-5 text-[#D4B896]" />
        </motion.div>
      )}
    </div>
  );
}
