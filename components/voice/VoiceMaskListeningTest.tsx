'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, Star, Volume2 } from 'lucide-react';

interface MaskTestResult {
  maskId: string;
  ratings: {
    distinctiveness: number;
    appropriateness: number;
    preference: number;
  };
  notes?: string;
  timestamp: Date;
}

interface VoiceMaskListeningTestProps {
  userId: string;
  onComplete?: (results: MaskTestResult[]) => void;
  testMode?: 'blind' | 'identified'; // Blind = don't show mask names
}

const TEST_PHRASES = [
  "Welcome to the threshold between worlds.",
  "The spiral turns, and we turn with it.",
  "Deep waters hold ancient memories.",
  "Your shadow knows the way forward.",
  "In this sacred moment, transformation begins."
];

const TEST_MASKS = [
  { id: 'maya-threshold', name: 'Threshold', element: '✨' },
  { id: 'maya-deep-waters', name: 'Deep Waters', element: '💧' },
  { id: 'maya-spiral', name: 'Spiral', element: '🌀' },
  { id: 'miles-grounded', name: 'Grounded', element: '🌍' }
];

export default function VoiceMaskListeningTest({
  userId,
  onComplete,
  testMode = 'blind'
}: VoiceMaskListeningTestProps) {
  const [currentMaskIndex, setCurrentMaskIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [results, setResults] = useState<MaskTestResult[]>([]);
  const [ratings, setRatings] = useState({
    distinctiveness: 0,
    appropriateness: 0,
    preference: 0
  });
  const [notes, setNotes] = useState('');
  const [testOrder, setTestOrder] = useState<typeof TEST_MASKS>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Shuffle masks on mount for blind testing
  useEffect(() => {
    const shuffled = testMode === 'blind'
      ? [...TEST_MASKS].sort(() => Math.random() - 0.5)
      : TEST_MASKS;
    setTestOrder(shuffled);
  }, [testMode]);

  const currentMask = testOrder[currentMaskIndex];
  const currentPhrase = TEST_PHRASES[currentPhraseIndex];
  const progress = ((currentMaskIndex + 1) / testOrder.length) * 100;

  const playAudio = async () => {
    setIsPlaying(true);
    setHasListened(true);

    try {
      const response = await fetch('/api/oracle/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentPhrase,
          voiceMaskId: currentMask.id,
          userId,
          testMode: true
        })
      });

      const data = await response.json();
      if (data.success && data.audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Failed to play test audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    // Save current ratings
    const result: MaskTestResult = {
      maskId: currentMask.id,
      ratings: { ...ratings },
      notes: notes.trim() || undefined,
      timestamp: new Date()
    };

    const newResults = [...results, result];
    setResults(newResults);

    // Move to next mask or complete
    if (currentMaskIndex < testOrder.length - 1) {
      setCurrentMaskIndex(currentMaskIndex + 1);
      setRatings({ distinctiveness: 0, appropriateness: 0, preference: 0 });
      setNotes('');
      setHasListened(false);
    } else {
      // Test complete
      onComplete?.(newResults);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handlePhraseChange = () => {
    setCurrentPhraseIndex((currentPhraseIndex + 1) % TEST_PHRASES.length);
    setHasListened(false);
  };

  const RatingScale = ({
    label,
    value,
    onChange,
    description
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    description: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
        <span className="text-xs text-neutral-500">{description}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`p-2 rounded-lg transition-all ${
              value >= rating
                ? 'bg-amber-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Star className="w-5 h-5" fill={value >= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Voice Mask Listening Test
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {testMode === 'blind'
            ? 'Listen carefully and rate each voice variation'
            : `Testing: ${currentMask.name} ${currentMask.element}`}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Test Card */}
      <motion.div
        key={currentMaskIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-6"
      >
        {/* Mask Indicator (for identified mode) */}
        {testMode === 'identified' && (
          <div className="text-center">
            <span className="text-3xl">{currentMask.element}</span>
            <h3 className="text-lg font-semibold mt-2">{currentMask.name}</h3>
          </div>
        )}

        {/* Test Phrase */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
          <p className="text-center text-lg italic text-neutral-700 dark:text-neutral-300">
            "{currentPhrase}"
          </p>
          <button
            onClick={handlePhraseChange}
            className="mt-2 text-xs text-amber-600 hover:text-amber-700 mx-auto block"
          >
            Try different phrase →
          </button>
        </div>

        {/* Audio Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            onClick={playAudio}
            disabled={isPlaying}
            className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors
              ${isPlaying
                ? 'bg-neutral-200 dark:bg-neutral-700 cursor-wait'
                : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
            whileHover={!isPlaying ? { scale: 1.05 } : {}}
            whileTap={!isPlaying ? { scale: 0.95 } : {}}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-5 h-5 animate-pulse" />
                Playing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {hasListened ? 'Play Again' : 'Play Voice'}
              </>
            )}
          </motion.button>

          {hasListened && (
            <button
              onClick={handleReplay}
              className="px-4 py-3 rounded-lg bg-neutral-200 dark:bg-neutral-700
                       hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Rating Section (only show after listening) */}
        <AnimatePresence>
          {hasListened && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t pt-4 dark:border-neutral-700"
            >
              <RatingScale
                label="Distinctiveness"
                value={ratings.distinctiveness}
                onChange={v => setRatings(r => ({ ...r, distinctiveness: v }))}
                description="How different from the base voice?"
              />

              <RatingScale
                label="Appropriateness"
                value={ratings.appropriateness}
                onChange={v => setRatings(r => ({ ...r, appropriateness: v }))}
                description="Does it match the character?"
              />

              <RatingScale
                label="Preference"
                value={ratings.preference}
                onChange={v => setRatings(r => ({ ...r, preference: v }))}
                description="How much do you like it?"
              />

              {/* Optional Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any specific feedback about this voice..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600
                           rounded-lg bg-white dark:bg-neutral-800 text-sm resize-none"
                  rows={2}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t dark:border-neutral-700">
          <span className="text-sm text-neutral-500">
            Voice {currentMaskIndex + 1} of {testOrder.length}
          </span>

          <button
            onClick={handleNext}
            disabled={!hasListened || Object.values(ratings).some(r => r === 0)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors
              ${hasListened && !Object.values(ratings).some(r => r === 0)
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'}`}
          >
            {currentMaskIndex < testOrder.length - 1 ? (
              <>
                Next Voice
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              'Complete Test'
            )}
          </button>
        </div>
      </motion.div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Results Summary (after completion) */}
      {results.length === testOrder.length && (
        <TestResults results={results} masks={testOrder} />
      )}
    </div>
  );
}

// Results Component
function TestResults({
  results,
  masks
}: {
  results: MaskTestResult[];
  masks: typeof TEST_MASKS;
}) {
  const averageRatings = results.reduce((acc, result) => {
    const mask = masks.find(m => m.id === result.maskId);
    if (!mask) return acc;

    if (!acc[result.maskId]) {
      acc[result.maskId] = {
        name: mask.name,
        element: mask.element,
        distinctiveness: 0,
        appropriateness: 0,
        preference: 0,
        count: 0
      };
    }

    acc[result.maskId].distinctiveness += result.ratings.distinctiveness;
    acc[result.maskId].appropriateness += result.ratings.appropriateness;
    acc[result.maskId].preference += result.ratings.preference;
    acc[result.maskId].count += 1;

    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.values(averageRatings).forEach((rating: any) => {
    rating.distinctiveness /= rating.count;
    rating.appropriateness /= rating.count;
    rating.preference /= rating.count;
    rating.overall = (rating.distinctiveness + rating.appropriateness + rating.preference) / 3;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
        Test Complete! 🎉
      </h3>

      <div className="space-y-3">
        {Object.entries(averageRatings)
          .sort((a, b) => b[1].overall - a[1].overall)
          .map(([maskId, ratings]: [string, any]) => (
            <div key={maskId} className="bg-white dark:bg-neutral-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {ratings.element} {ratings.name}
                </span>
                <span className="text-sm font-bold text-amber-600">
                  {ratings.overall.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span>Distinct: {ratings.distinctiveness.toFixed(1)}</span>
                <span>Fitting: {ratings.appropriateness.toFixed(1)}</span>
                <span>Liked: {ratings.preference.toFixed(1)}</span>
              </div>
            </div>
          ))}
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
        Results saved! These ratings will help improve voice experiences.
      </p>
    </motion.div>
  );
}