'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Droplet,
  Mountain,
  Wind,
  Star,
  Quote,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';

interface ElementalSignature {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

interface GoldLine {
  speaker: string;
  text: string;
  timestampMs?: number;
}

interface TurningPoint {
  timestampMs: number;
  whatShifted: string;
}

interface SupervisionFocus {
  ruptureRepair: string | null;
  countertransference: string | null;
  interventions: string[];
  consultQuestions: string[];
}

interface EssenceSummary {
  title: string;
  coreInsight: string;
  themes: string[];
  goldLines: GoldLine[];
  turningPoints: TurningPoint[];
  spiralMovement: string;
  elementalSignature: ElementalSignature;
  nextSteps: string[];
  practices: string[];
  supervisionFocus: SupervisionFocus;
  synthesizedAt: string;
  version: number;
}

interface EssenceViewerProps {
  sessionId: string | null;
  compact?: boolean;
}

export default function EssenceViewer({ sessionId, compact = false }: EssenceViewerProps) {
  const [essence, setEssence] = useState<EssenceSummary | null>(null);
  const [status, setStatus] = useState<'loading' | 'complete' | 'no_content' | 'in_progress' | 'error'>('loading');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const fetchEssence = useCallback(async (regenerate = false) => {
    if (!sessionId) {
      setStatus('no_content');
      return;
    }

    if (regenerate) {
      setIsRegenerating(true);
    } else {
      setStatus('loading');
    }

    try {
      const url = apiUrl(`/api/supervision/session/${sessionId}/essence${regenerate ? '?regenerate=true' : ''}`);
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStatus(data.status);
        setEssence(data.essence);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Failed to fetch essence:', err);
      setStatus('error');
    } finally {
      setIsRegenerating(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchEssence();
  }, [fetchEssence]);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Element icon mapping
  const elementIcons: Record<keyof ElementalSignature, typeof Flame> = {
    fire: Flame,
    water: Droplet,
    earth: Mountain,
    air: Wind,
    aether: Star
  };

  const elementColors: Record<keyof ElementalSignature, string> = {
    fire: 'text-orange-400',
    water: 'text-blue-400',
    earth: 'text-amber-600',
    air: 'text-cyan-300',
    aether: 'text-violet-400'
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (status === 'in_progress') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <p className="text-[#A89880] text-sm">
          Session still in progress. Essence will be generated when session ends.
        </p>
      </div>
    );
  }

  if (status === 'no_content' || !essence) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-[#8B7355] text-sm">
          {sessionId ? 'No essence available for this session.' : 'Select a session to view its essence.'}
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400/80 text-sm mb-3">Failed to load essence</p>
        <button
          onClick={() => fetchEssence()}
          className="text-xs text-[#A89880] hover:text-[#D4B896] underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Compact view for sidebar
  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-[#D4B896] text-sm">{essence.title}</h4>
          <button
            onClick={() => fetchEssence(true)}
            disabled={isRegenerating}
            className="p-1 text-[#8B7355] hover:text-[#D4B896] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-sm text-[#E6DCC6] leading-relaxed">{essence.coreInsight}</p>

        {essence.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {essence.themes.slice(0, 3).map((theme, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#FF8C42]/10 text-[#FFA85C]">
                {theme}
              </span>
            ))}
          </div>
        )}

        {/* Elemental signature mini-bar */}
        <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-[#1A1510]">
          {(Object.entries(essence.elementalSignature) as [keyof ElementalSignature, number][]).map(([element, value]) => (
            <div
              key={element}
              className={`h-full transition-all ${
                element === 'fire' ? 'bg-orange-400' :
                element === 'water' ? 'bg-blue-400' :
                element === 'earth' ? 'bg-amber-600' :
                element === 'air' ? 'bg-cyan-300' :
                'bg-violet-400'
              }`}
              style={{ width: `${value * 100}%` }}
            />
          ))}
        </div>

        <p className="text-xs text-[#8B7355]">
          Synthesized {new Date(essence.synthesizedAt).toLocaleDateString()}
        </p>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-medium text-[#D4B896] font-cinzel tracking-wide">{essence.title}</h3>
          <p className="text-xs text-[#8B7355] mt-1">
            Synthesized {new Date(essence.synthesizedAt).toLocaleString()} (v{essence.version})
          </p>
        </div>
        <button
          onClick={() => fetchEssence(true)}
          disabled={isRegenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A1F18]/50 text-[#A89880] hover:text-[#D4B896] transition-colors text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* Core Insight */}
      <div className="p-4 rounded-xl bg-[#FF8C42]/10 border border-[#FF8C42]/30">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-[#FF8C42] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-[#FFA85C] mb-2">Core Insight</h4>
            <p className="text-[#E6DCC6] leading-relaxed">{essence.coreInsight}</p>
          </div>
        </div>
      </div>

      {/* Themes */}
      {essence.themes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[#A89880] mb-3">Themes</h4>
          <div className="flex flex-wrap gap-2">
            {essence.themes.map((theme, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-[#2A1F18] text-[#D4B896] text-sm border border-[#3D2F20]">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gold Lines */}
      {essence.goldLines.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('goldLines')}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="text-sm font-medium text-[#A89880] flex items-center gap-2">
              <Quote className="w-4 h-4" />
              Gold Lines ({essence.goldLines.length})
            </h4>
            {expandedSection === 'goldLines' ? (
              <ChevronUp className="w-4 h-4 text-[#8B7355]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8B7355]" />
            )}
          </button>
          <AnimatePresence>
            {expandedSection === 'goldLines' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {essence.goldLines.map((line, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1A1510] border border-[#3D2F20]/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[#FF8C42] uppercase">{line.speaker}</span>
                      {line.timestampMs && (
                        <span className="text-xs text-[#8B7355]">
                          {Math.floor(line.timestampMs / 60000)}:{String(Math.floor((line.timestampMs % 60000) / 1000)).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#E6DCC6] italic">&ldquo;{line.text}&rdquo;</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Supervision Focus */}
      {(essence.supervisionFocus.ruptureRepair || essence.supervisionFocus.countertransference || essence.supervisionFocus.interventions.length > 0) && (
        <div>
          <button
            onClick={() => toggleSection('supervision')}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="text-sm font-medium text-[#5FA8A3] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Supervision Focus
            </h4>
            {expandedSection === 'supervision' ? (
              <ChevronUp className="w-4 h-4 text-[#8B7355]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8B7355]" />
            )}
          </button>
          <AnimatePresence>
            {expandedSection === 'supervision' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {essence.supervisionFocus.ruptureRepair && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h5 className="text-xs font-medium text-red-300 mb-1">Rupture/Repair</h5>
                    <p className="text-sm text-[#E6DCC6]">{essence.supervisionFocus.ruptureRepair}</p>
                  </div>
                )}
                {essence.supervisionFocus.countertransference && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h5 className="text-xs font-medium text-amber-300 mb-1">Countertransference</h5>
                    <p className="text-sm text-[#E6DCC6]">{essence.supervisionFocus.countertransference}</p>
                  </div>
                )}
                {essence.supervisionFocus.interventions.length > 0 && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <h5 className="text-xs font-medium text-purple-300 mb-2">Interventions</h5>
                    <ul className="space-y-1">
                      {essence.supervisionFocus.interventions.map((int, i) => (
                        <li key={i} className="text-sm text-[#E6DCC6] flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-purple-400" />
                          {int}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Elemental Signature */}
      <div>
        <h4 className="text-sm font-medium text-[#A89880] mb-3">Elemental Signature</h4>
        <div className="grid grid-cols-5 gap-3">
          {(Object.entries(essence.elementalSignature) as [keyof ElementalSignature, number][]).map(([element, value]) => {
            const Icon = elementIcons[element];
            const color = elementColors[element];
            return (
              <div key={element} className="text-center">
                <div className={`w-10 h-10 mx-auto rounded-full bg-[#1A1510] border border-[#3D2F20] flex items-center justify-center mb-1`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="text-xs text-[#8B7355] capitalize">{element}</div>
                <div className={`text-sm font-medium ${color}`}>{Math.round(value * 100)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps & Practices */}
      {(essence.nextSteps.length > 0 || essence.practices.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {essence.nextSteps.length > 0 && (
            <div className="p-4 rounded-xl bg-[#2C7873]/10 border border-[#2C7873]/30">
              <h4 className="text-sm font-medium text-[#5FA8A3] mb-3">Next Steps</h4>
              <ul className="space-y-2">
                {essence.nextSteps.map((step, i) => (
                  <li key={i} className="text-sm text-[#E6DCC6] flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-[#5FA8A3]" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {essence.practices.length > 0 && (
            <div className="p-4 rounded-xl bg-[#6A4C93]/10 border border-[#6A4C93]/30">
              <h4 className="text-sm font-medium text-[#9D7FBF] mb-3">Practices</h4>
              <ul className="space-y-2">
                {essence.practices.map((practice, i) => (
                  <li key={i} className="text-sm text-[#E6DCC6] flex items-start gap-2">
                    <Star className="w-3 h-3 mt-1 flex-shrink-0 text-[#9D7FBF]" />
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Spiral Movement */}
      {essence.spiralMovement && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#FF8C42]/5 to-[#6A4C93]/5 border border-[#3D2F20]/50">
          <h4 className="text-sm font-medium text-[#A89880] mb-2">Spiral Movement</h4>
          <p className="text-sm text-[#E6DCC6] italic">{essence.spiralMovement}</p>
        </div>
      )}
    </div>
  );
}
