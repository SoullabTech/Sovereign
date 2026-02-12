'use client';

import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { HexagramInterpretation } from '@/lib/studio/changes/types';

interface MemberHexagramReadingProps {
  changeId: string;
  interpretation: HexagramInterpretation | null;
  onRequestInterpretation: () => void;
  loading: boolean;
}

export default function MemberHexagramReading({
  changeId,
  interpretation,
  onRequestInterpretation,
  loading,
}: MemberHexagramReadingProps) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-stone-400 text-sm">MAIA is reading the hexagram...</span>
        </div>
      </div>
    );
  }

  if (!interpretation) {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white">
            Hexagram Reading
          </h3>
          <p className="text-stone-400 text-sm">
            MAIA can offer perspective on what this hexagram means for your change.
          </p>
        </div>

        <motion.button
          onClick={onRequestInterpretation}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-medium transition-all"
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask MAIA to read the hexagram</span>
        </motion.button>

        <p className="text-center text-xs text-stone-500">
          Optional — you can also work with the hexagram on your own
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium text-white">
          Hexagram Reading
        </h3>
        <div className="text-xs text-stone-500">
          {new Date(interpretation.generatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
      </div>

      {/* Reading */}
      <div className="space-y-3">
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <h4 className="text-amber-300 text-sm font-medium mb-2">
            The Hexagram Speaks
          </h4>
          <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
            {interpretation.reading}
          </p>
        </div>

        {/* Guidance */}
        {interpretation.guidance && (
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <h4 className="text-emerald-300 text-sm font-medium mb-2">
              Guidance for This Change
            </h4>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
              {interpretation.guidance}
            </p>
          </div>
        )}

        {/* Warnings */}
        {interpretation.warnings && interpretation.warnings.length > 0 && (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <h4 className="text-red-300 text-sm font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              What to Watch For
            </h4>
            <ul className="space-y-1.5">
              {interpretation.warnings.map((warning, index) => (
                <li key={index} className="text-stone-300 text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-red-400 flex-shrink-0">·</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timing */}
        {interpretation.timing && (
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <h4 className="text-purple-300 text-sm font-medium mb-2">
              Timing
            </h4>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
              {interpretation.timing}
            </p>
          </div>
        )}

        {/* Changing Lines */}
        {interpretation.changingLinesReading && (
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <h4 className="text-blue-300 text-sm font-medium mb-2">
              The Changing Lines
            </h4>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
              {interpretation.changingLinesReading}
            </p>
          </div>
        )}

        {/* Relating Hexagram */}
        {interpretation.relatingReading && (
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
            <h4 className="text-cyan-300 text-sm font-medium mb-2">
              Where This Leads
            </h4>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
              {interpretation.relatingReading}
            </p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-stone-500 leading-relaxed">
        This is MAIA's reflection, not truth. Sit with what resonates.
      </p>
    </div>
  );
}
