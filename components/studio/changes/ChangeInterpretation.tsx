'use client';

/**
 * ChangeInterpretation — MAIA's I Ching Interpretation
 *
 * Displays MAIA's reading of the hexagram for this change.
 * Includes main reading, guidance, warnings, timing,
 * and changing lines / relating hexagram readings.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { HexagramInterpretation } from '@/lib/studio/changes/types';

interface ChangeInterpretationProps {
  changeId: string;
  interpretation: HexagramInterpretation | null;
  hexagramNumber: number | null;
  onInterpretationGenerated: (interp: HexagramInterpretation) => void;
}

export default function ChangeInterpretation({
  changeId,
  interpretation,
  hexagramNumber,
  onInterpretationGenerated,
}: ChangeInterpretationProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateInterpretation() {
    if (!hexagramNumber) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/studio/changes/${changeId}/interpret`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        onInterpretationGenerated(data.interpretation);
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        setError(err.error || 'Interpretation failed');
      }
    } catch {
      setError('Could not reach MAIA');
    } finally {
      setGenerating(false);
    }
  }

  if (!hexagramNumber) {
    return (
      <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-4 text-center">
        <p className="text-sm text-slate-500">Cast or select a hexagram to receive MAIA's interpretation.</p>
      </div>
    );
  }

  if (!interpretation) {
    return (
      <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-slate-300">MAIA's I Ching Interpretation</h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          MAIA can reflect on what this hexagram means for your specific change.
        </p>
        <button
          onClick={generateInterpretation}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-sm rounded-lg transition-all disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              MAIA is interpreting...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Interpretation
            </>
          )}
        </button>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-medium text-slate-300">MAIA's I Ching Interpretation</h3>
      </div>

      {/* Main Reading */}
      <div className="rounded-lg border border-purple-900/30 bg-purple-950/10 p-4 space-y-2">
        <h4 className="text-xs text-purple-400 uppercase tracking-wider">Reading</h4>
        <p className="text-sm text-slate-300 leading-relaxed">{interpretation.reading}</p>
      </div>

      {/* Guidance */}
      <div className="rounded-lg border border-cyan-900/30 bg-cyan-950/10 p-4 space-y-2">
        <h4 className="text-xs text-cyan-400 uppercase tracking-wider">Guidance</h4>
        <p className="text-sm text-slate-300 leading-relaxed">{interpretation.guidance}</p>
      </div>

      {/* Warnings */}
      {interpretation.warnings && interpretation.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-4 space-y-2">
          <h4 className="text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warnings
          </h4>
          <ul className="space-y-1.5">
            {interpretation.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-200/80 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timing */}
      {interpretation.timing && (
        <div className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-3 space-y-1">
          <h4 className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Timing
          </h4>
          <p className="text-sm text-slate-300">{interpretation.timing}</p>
        </div>
      )}

      {/* Changing Lines Reading */}
      {interpretation.changingLinesReading && (
        <div className="rounded-lg border border-indigo-900/30 bg-indigo-950/10 p-4 space-y-2">
          <h4 className="text-xs text-indigo-400 uppercase tracking-wider">Changing Lines</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{interpretation.changingLinesReading}</p>
        </div>
      )}

      {/* Relating Hexagram Reading */}
      {interpretation.relatingReading && (
        <div className="rounded-lg border border-violet-900/30 bg-violet-950/10 p-4 space-y-2">
          <h4 className="text-xs text-violet-400 uppercase tracking-wider">Relating Hexagram</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{interpretation.relatingReading}</p>
        </div>
      )}

      {/* Regenerate */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
        <p className="text-xs text-slate-500">
          Generated {new Date(interpretation.generatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
        <button
          onClick={generateInterpretation}
          disabled={generating}
          className="text-xs text-purple-400/70 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>
    </motion.div>
  );
}
