'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CouncilInsightPanel — Expandable AIN consultation results
 *
 * Appears alongside MAIA's response when councils were consulted.
 * Collapsed: Shows "Consulted: [Council] Council" badge
 * Expanded: Shows insights, tensions, recommendation, framings used
 *
 * Design: Ambient, non-intrusive, expandable. The council speaks to MAIA,
 * not directly to the member — this panel reveals the process, not the authority.
 */

interface ConsultationData {
  council: string;
  insights: string[];
  tensions: string[];
  recommendation: string;
  framingsUsed: string[];
  emergenceRating: 'recombination' | 'synthesis' | 'breakthrough';
  framingWeights?: Record<string, number> | null;
}

interface CouncilInsightPanelProps {
  consultation: ConsultationData;
  className?: string;
}

// Council display names + colors
const COUNCIL_META: Record<string, { label: string; color: string; icon: string }> = {
  deliberation: { label: 'Deliberation',  color: '#60a5fa', icon: '~' },  // blue — multi-perspective
  shadow:       { label: 'Shadow',        color: '#a78bfa', icon: '~' },  // violet — depth/unconscious
  practical:    { label: 'Practical',     color: '#34d399', icon: '~' },  // green — implementation
  ethics:       { label: 'Ethics',        color: '#f59e0b', icon: '~' },  // amber — moral
  dream:        { label: 'Dream',         color: '#f472b6', icon: '~' },  // pink — symbolic/archetypal
};

// Emergence visual
const EMERGENCE_META: Record<string, { label: string; intensity: number; glyph: string }> = {
  recombination: { label: 'Recombination', intensity: 0.4, glyph: '*' },
  synthesis:     { label: 'Synthesis',     intensity: 0.7, glyph: '**' },
  breakthrough:  { label: 'Breakthrough',  intensity: 1.0, glyph: '***' },
};

export function CouncilInsightPanel({
  consultation,
  className = '',
}: CouncilInsightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const council = COUNCIL_META[consultation.council] || COUNCIL_META.deliberation;
  const emergence = EMERGENCE_META[consultation.emergenceRating] || EMERGENCE_META.recombination;

  return (
    <div className={`mt-3 ${className}`} data-testid="council-panel" onClick={(e) => e.stopPropagation()}>
      {/* Collapsed badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs
                   transition-all duration-300 hover:scale-[1.02]
                   border focus:outline-none focus:ring-1 focus:ring-violet-400/30"
        style={{
          backgroundColor: `${council.color}10`,
          borderColor: `${council.color}30`,
          color: council.color,
          fontFamily: 'Spectral, Georgia, serif',
        }}
      >
        <span className="opacity-60">{council.icon}</span>
        <span>Consulted: {council.label} Council</span>
        <span className="opacity-40 text-[10px]">{emergence.glyph}</span>
        <span
          className="ml-1 text-[10px] opacity-50 transition-transform duration-200"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          {'\u25BC'}
        </span>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-lg p-4 border space-y-3"
              style={{
                backgroundColor: 'rgba(26, 21, 18, 0.85)',
                backdropFilter: 'blur(8px)',
                borderColor: `${council.color}20`,
              }}
            >
              {/* Emergence rating */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: `${council.color}80`, fontFamily: 'Spectral, Georgia, serif' }}
                >
                  {council.label} Council
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${council.color}15`,
                    color: council.color,
                    opacity: emergence.intensity,
                  }}
                >
                  {emergence.label}
                </span>
              </div>

              {/* Insights */}
              {consultation.insights.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-dune-amber/50 mb-1.5"
                      style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                    Insights
                  </h4>
                  <ul className="space-y-1">
                    {consultation.insights.slice(0, 5).map((insight, i) => (
                      <li key={i} className="text-xs text-dune-sand/70 leading-relaxed pl-3 relative"
                          style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                        <span className="absolute left-0 top-0.5 text-[8px] opacity-40"
                              style={{ color: council.color }}>
                          {'\u25CF'}
                        </span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tensions */}
              {consultation.tensions.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-dune-amber/50 mb-1.5"
                      style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                    Tensions
                  </h4>
                  <ul className="space-y-1">
                    {consultation.tensions.slice(0, 4).map((tension, i) => (
                      <li key={i} className="text-xs text-dune-sand/60 leading-relaxed pl-3 relative"
                          style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                        <span className="absolute left-0 top-0.5 text-[8px] opacity-30"
                              style={{ color: '#f59e0b' }}>
                          {'\u25C6'}
                        </span>
                        {tension}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {consultation.recommendation && (
                <div className="pt-2 border-t" style={{ borderColor: `${council.color}15` }}>
                  <h4 className="text-[10px] uppercase tracking-widest text-dune-amber/50 mb-1"
                      style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                    Recommendation
                  </h4>
                  <p className="text-xs text-dune-sand/80 leading-relaxed"
                     style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                    {consultation.recommendation}
                  </p>
                </div>
              )}

              {/* Framings used */}
              {consultation.framingsUsed.length > 0 && (
                <div className="pt-2 border-t" style={{ borderColor: `${council.color}10` }}>
                  <div className="flex flex-wrap gap-1.5">
                    {consultation.framingsUsed.map((framing) => {
                      const weight = consultation.framingWeights?.[framing];
                      return (
                        <span
                          key={framing}
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${council.color}08`,
                            color: `${council.color}90`,
                            border: `1px solid ${council.color}20`,
                          }}
                        >
                          {framing}
                          {weight != null && (
                            <span className="opacity-50 ml-1">
                              {Math.round(weight * 100)}%
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
