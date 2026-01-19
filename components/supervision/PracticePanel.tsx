'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Eye,
  Heart,
  Palette,
  Sun,
  Layers
} from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';

// Domain icons mapping
const DOMAIN_ICONS: Record<string, typeof Eye> = {
  body: Heart,
  mind: Eye,
  relational: Heart,
  creative: Palette,
  spiritual: Sun,
  integrative: Layers
};

// Domain colors
const DOMAIN_COLORS: Record<string, string> = {
  body: 'emerald',
  mind: 'violet',
  relational: 'rose',
  creative: 'amber',
  spiritual: 'cyan',
  integrative: 'indigo'
};

interface World {
  id: string;
  code: string;
  display_name: string;
  description: string;
  domain: string;
  icon_name: string;
  color_theme: string;
}

interface PracticeInsight {
  id: string;
  world_code: string;
  insight_type: string;
  content: string;
  significance: number;
  model_used: string;
  created_at: string;
}

interface PracticePanelProps {
  sessionId: string | null;
  practitionerId?: string;
  onInsightClick?: (insight: PracticeInsight) => void;
  selectedInsightId?: string;
}

export default function PracticePanel({
  sessionId,
  practitionerId = '00000000-0000-0000-0000-000000000001',
  onInsightClick,
  selectedInsightId
}: PracticePanelProps) {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [insights, setInsights] = useState<PracticeInsight[]>([]);
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedWorld, setExpandedWorld] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available worlds
  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        const res = await fetch(apiUrl('/api/practice/worlds/list'));
        const data = await res.json();
        if (data.success) {
          setWorlds(data.worlds);
          // Auto-select first world with prompt module
          const availableWorlds = data.worlds.filter((w: World) =>
            ['somatic', 'parts_ifs', 'jungian', 'attachment'].includes(w.code)
          );
          if (availableWorlds.length > 0) {
            setSelectedWorld(availableWorlds[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch worlds:', err);
      } finally {
        setIsLoadingWorlds(false);
      }
    };
    fetchWorlds();
  }, []);

  // Fetch existing insights for session
  useEffect(() => {
    if (!sessionId) {
      setInsights([]);
      return;
    }

    const fetchInsights = async () => {
      try {
        const res = await fetch(apiUrl(`/api/practice/insights/generate?sessionId=${sessionId}`));
        const data = await res.json();
        if (data.success) {
          setInsights(data.insights || []);
        }
      } catch (err) {
        console.error('Failed to fetch practice insights:', err);
      }
    };
    fetchInsights();
  }, [sessionId]);

  // Generate insights for selected world
  const generateInsights = useCallback(async () => {
    if (!sessionId || !selectedWorld) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/practice/insights/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          worldCode: selectedWorld.code,
          generateAll: true
        })
      });

      const data = await res.json();

      if (data.success) {
        // Merge new insights with existing
        setInsights(prev => {
          const newIds = new Set(data.insights.map((i: PracticeInsight) => i.id));
          const filtered = prev.filter(i => !newIds.has(i.id));
          return [...filtered, ...data.insights];
        });
        setExpandedWorld(selectedWorld.code);
      } else {
        setError(data.error || 'Failed to generate insights');
      }
    } catch (err) {
      console.error('Generate insights error:', err);
      setError('Failed to connect to insight service');
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId, selectedWorld]);

  // Group insights by world
  const insightsByWorld = insights.reduce<Record<string, PracticeInsight[]>>((acc, insight) => {
    const code = insight.world_code;
    if (!acc[code]) acc[code] = [];
    acc[code].push(insight);
    return acc;
  }, {});

  // Format insight type for display
  const formatInsightType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get world by code
  const getWorldByCode = (code: string) => worlds.find(w => w.code === code);

  // Worlds with prompt modules available
  const availableWorlds = worlds.filter(w =>
    ['somatic', 'parts_ifs', 'jungian', 'attachment'].includes(w.code)
  );

  if (isLoadingWorlds) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* World Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Interpretive Lens
        </label>
        <div className="grid grid-cols-2 gap-2">
          {availableWorlds.map(world => {
            const Icon = DOMAIN_ICONS[world.domain] || Sparkles;
            const color = DOMAIN_COLORS[world.domain] || 'amber';
            const isSelected = selectedWorld?.id === world.id;

            return (
              <button
                key={world.id}
                onClick={() => setSelectedWorld(world)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${
                  isSelected
                    ? `bg-${color}-500/20 border border-${color}-500/40 text-${color}-300`
                    : 'bg-stone-800/50 border border-stone-700/50 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{world.display_name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      {sessionId && selectedWorld && (
        <button
          onClick={generateInsights}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate {selectedWorld.display_name} Insights
            </>
          )}
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Insights Display */}
      <div className="space-y-3">
        {Object.entries(insightsByWorld).map(([worldCode, worldInsights]) => {
          const world = getWorldByCode(worldCode);
          const isExpanded = expandedWorld === worldCode;
          const Icon = DOMAIN_ICONS[world?.domain || 'integrative'] || Sparkles;

          return (
            <div
              key={worldCode}
              className="bg-stone-800/50 rounded-lg border border-stone-700/50 overflow-hidden"
            >
              {/* World Header */}
              <button
                onClick={() => setExpandedWorld(isExpanded ? null : worldCode)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-stone-800/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-stone-200">
                    {world?.display_name || worldCode}
                  </span>
                  <span className="text-xs text-stone-500">
                    ({worldInsights.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {/* Insights List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-stone-700/50"
                  >
                    <div className="p-2 space-y-2">
                      {worldInsights.map(insight => (
                        <button
                          key={insight.id}
                          onClick={() => onInsightClick?.(insight)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedInsightId === insight.id
                              ? 'bg-amber-500/20 border border-amber-500/30'
                              : 'bg-stone-900/50 hover:bg-stone-900/80 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-3 h-3 text-amber-400" />
                            <span className="text-xs font-medium text-amber-400">
                              {formatInsightType(insight.insight_type)}
                            </span>
                            {insight.significance > 0.7 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                High
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-300 line-clamp-3">
                            {insight.content}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Empty State */}
        {insights.length === 0 && sessionId && (
          <div className="text-center py-6 text-stone-500 text-sm">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No practice insights yet.</p>
            <p className="text-xs mt-1">Select a lens and generate insights.</p>
          </div>
        )}

        {!sessionId && (
          <div className="text-center py-6 text-stone-500 text-sm">
            <p>Start or select a session to generate practice insights.</p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3">
        <h4 className="text-xs font-medium text-violet-400 mb-1">
          Practice Development
        </h4>
        <p className="text-xs text-stone-400">
          Each lens offers unique insights: somatic (body cues), parts/IFS (inner parts),
          Jungian (archetypes), attachment (relational patterns).
        </p>
      </div>
    </div>
  );
}
