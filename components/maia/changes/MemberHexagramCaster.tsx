'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Search } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import HexagramGlyph from '@/components/iching/HexagramGlyph';

interface MemberHexagramCasterProps {
  changeId: string;
  onCast: (result: any) => void;
  onSkip: () => void;
}

type CastMethod = 'yarrow' | 'coin';

export default function MemberHexagramCaster({
  changeId,
  onCast,
  onSkip,
}: MemberHexagramCasterProps) {
  const [selectedMethod, setSelectedMethod] = useState<CastMethod>('coin');
  const [isCasting, setIsCasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [castResult, setCastResult] = useState<any>(null);

  const handleCast = async () => {
    setIsCasting(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/changes/${changeId}/cast`, {
        method: 'POST',
        body: JSON.stringify({ method: selectedMethod }),
      });

      if (!response.ok) {
        throw new Error('Failed to cast hexagram');
      }

      const result = await response.json();
      setCastResult(result);

      // Delay slightly for animation effect
      setTimeout(() => {
        onCast(result);
      }, 1500);
    } catch (err) {
      console.error('[MemberHexagramCaster] Cast failed:', err);
      setError('Failed to cast hexagram. Please try again.');
      setIsCasting(false);
    }
  };

  if (castResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 space-y-4"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <HexagramGlyph
              lines={castResult.lines || []}
              changingLines={castResult.changingLines || []}
              size="lg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <h3 className="text-xl font-medium text-white mb-1">
              {castResult.hexagramName}
            </h3>
            <p className="text-stone-400 text-sm">
              Hexagram {castResult.hexagramNumber}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2 text-amber-400 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Hexagram cast</span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-medium text-white">
          Cast the I Ching
        </h3>
        <p className="text-stone-400 text-sm">
          Consult the Book of Changes for perspective on this transition.
        </p>
      </div>

      {/* Method Selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-stone-300">
          Choose your method
        </p>

        <button
          onClick={() => setSelectedMethod('coin')}
          disabled={isCasting}
          className={`w-full p-4 rounded-xl text-left border transition-all ${
            selectedMethod === 'coin'
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-stone-800/50 border-stone-700/50 hover:border-stone-600'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              selectedMethod === 'coin' ? 'border-amber-400' : 'border-stone-600'
            }`}>
              {selectedMethod === 'coin' && (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium mb-1">Three Coins</h4>
              <p className="text-stone-400 text-sm">
                Traditional method. Six tosses of three coins.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedMethod('yarrow')}
          disabled={isCasting}
          className={`w-full p-4 rounded-xl text-left border transition-all ${
            selectedMethod === 'yarrow'
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-stone-800/50 border-stone-700/50 hover:border-stone-600'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              selectedMethod === 'yarrow' ? 'border-amber-400' : 'border-stone-600'
            }`}>
              {selectedMethod === 'yarrow' && (
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium mb-1">Yarrow Stalks</h4>
              <p className="text-stone-400 text-sm">
                Ancient method. More contemplative, slower process.
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cast Button */}
      <motion.button
        onClick={handleCast}
        disabled={isCasting}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
          isCasting
            ? 'bg-stone-800/50 border border-stone-700/50 text-stone-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300'
        }`}
        whileTap={!isCasting ? { scale: 0.98 } : {}}
      >
        {isCasting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Casting...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Cast the Hexagram</span>
          </>
        )}
      </motion.button>

      {/* Browse Option */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex-1 h-px bg-stone-700" />
        <span className="text-stone-500">or</span>
        <div className="flex-1 h-px bg-stone-700" />
      </div>

      <button
        onClick={() => {/* TODO: Open hexagram browser */}}
        disabled={isCasting}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-stone-400 hover:text-stone-300 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Browse hexagrams</span>
      </button>

      {/* Skip Option */}
      <button
        onClick={onSkip}
        disabled={isCasting}
        className="w-full text-center text-sm text-stone-500 hover:text-stone-400 transition-colors"
      >
        Skip — continue without casting
      </button>
    </div>
  );
}
