'use client';

/**
 * ChangeCouncilResult — Display AIN Council Result for Changes
 *
 * Shows emergence rating, confidence, framings used,
 * tensions, risks, insights, and recommendation.
 * Mirrors CouncilResultView from decisions.
 */

import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, Scale } from 'lucide-react';
import type { ConsultationResult } from '@/lib/ain/types';

interface ChangeCouncilResultProps {
  council: ConsultationResult;
  animate?: boolean;
}

const EMERGENCE_COLORS = {
  recombination: 'text-blue-400',
  synthesis: 'text-purple-400',
  breakthrough: 'text-emerald-400',
};

const EMERGENCE_LABELS = {
  recombination: 'Recombination',
  synthesis: 'Synthesis',
  breakthrough: 'Breakthrough',
};

export default function ChangeCouncilResult({ council, animate = true }: ChangeCouncilResultProps) {
  const MotionDiv = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <div className="space-y-4">
      {/* Header: Emergence + Confidence */}
      <MotionDiv {...motionProps} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {council.emergenceRating && (
            <>
              <Sparkles className={`w-4 h-4 ${EMERGENCE_COLORS[council.emergenceRating]}`} />
              <span className={`text-sm font-medium ${EMERGENCE_COLORS[council.emergenceRating]}`}>
                {EMERGENCE_LABELS[council.emergenceRating]}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Confidence:</span>
          <span className="text-sm text-slate-300">{Math.round(council.confidence * 100)}%</span>
        </div>
      </MotionDiv>

      {/* Framings Used */}
      {council.framingsUsed && council.framingsUsed.length > 0 && (
        <MotionDiv {...motionProps} className="flex items-center gap-2 flex-wrap">
          <Scale className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">{council.framingsUsed.length} perspectives:</span>
          {council.framingsUsed.map((framing, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded bg-slate-800/40 text-slate-400 border border-slate-700/30"
            >
              {framing.replace(/-/g, ' ')}
            </span>
          ))}
        </MotionDiv>
      )}

      {/* Tensions */}
      {council.tensions && council.tensions.length > 0 && (
        <MotionDiv
          {...motionProps}
          className="rounded-lg border border-amber-900/30 bg-amber-950/10 p-3 space-y-2"
        >
          <h4 className="text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Tensions
          </h4>
          <ul className="space-y-1.5">
            {council.tensions.map((tension, i) => (
              <li key={i} className="text-sm text-amber-200/80 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{tension}</span>
              </li>
            ))}
          </ul>
        </MotionDiv>
      )}

      {/* Risks */}
      {council.risks && council.risks.length > 0 && (
        <MotionDiv
          {...motionProps}
          className="rounded-lg border border-red-900/30 bg-red-950/10 p-3 space-y-2"
        >
          <h4 className="text-xs text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Risks
          </h4>
          <ul className="space-y-1.5">
            {council.risks.map((risk, i) => (
              <li key={i} className="text-sm text-red-200/80 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </MotionDiv>
      )}

      {/* Insights */}
      {council.insights && council.insights.length > 0 && (
        <MotionDiv
          {...motionProps}
          className="rounded-lg border border-slate-800/40 bg-slate-900/20 p-3 space-y-2"
        >
          <h4 className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Insights
          </h4>
          <ul className="space-y-1.5">
            {council.insights.map((insight, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-slate-500 mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </MotionDiv>
      )}

      {/* Recommendation */}
      {council.recommendation && (
        <MotionDiv
          {...motionProps}
          className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-3 space-y-2"
        >
          <h4 className="text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recommendation
          </h4>
          <p className="text-sm text-emerald-200/90 leading-relaxed">{council.recommendation}</p>
        </MotionDiv>
      )}

      {/* Raw Responses (if available, for debugging/exploration) */}
      {council.rawResponses && Object.keys(council.rawResponses).length > 0 && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer hover:text-slate-300 transition-colors">
            Show raw council voices ({Object.keys(council.rawResponses).length})
          </summary>
          <div className="mt-2 space-y-2 pl-3 border-l border-slate-800/40">
            {Object.entries(council.rawResponses).map(([framing, response]) => (
              <div key={framing} className="space-y-1">
                <p className="text-slate-400 font-medium">{framing.replace(/-/g, ' ')}</p>
                <p className="text-slate-500 leading-relaxed">{response}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
