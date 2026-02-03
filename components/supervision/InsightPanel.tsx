'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap
} from 'lucide-react';

type InsightType = 'pattern' | 'countertransference' | 'intervention' | 'stuck_point' | 'rupture' | 'attunement' | 'documentation' | 'recommendation';

interface Insight {
  id: string;
  type: InsightType;
  content: string;
  significance?: number;
  timeRange?: {
    startMs: number | null;
    endMs: number | null;
  };
  modelUsed?: string;
  createdAt: string;
}

interface InsightPanelProps {
  insights: Record<string, Insight[]>;
  isLoading?: boolean;
  onInsightClick?: (insight: Insight) => void;
  selectedInsightId?: string;
}

// Insight type configurations
const INSIGHT_CONFIG: Record<InsightType, {
  label: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
  description: string;
}> = {
  pattern: {
    label: 'Patterns',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    description: 'Recurring themes and defense mechanisms'
  },
  countertransference: {
    label: 'Countertransference',
    icon: Heart,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/30',
    description: 'Therapist emotional reactions'
  },
  intervention: {
    label: 'Interventions',
    icon: MessageCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    description: 'Timing, depth, and attunement'
  },
  stuck_point: {
    label: 'Stuck Points',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'Impasses and circular patterns'
  },
  rupture: {
    label: 'Ruptures',
    icon: Zap,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    description: 'Alliance breaks and disconnections'
  },
  attunement: {
    label: 'Attunement',
    icon: Sparkles,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'Moments of deep connection'
  },
  documentation: {
    label: 'Documentation',
    icon: FileText,
    color: 'text-stone-400',
    bgColor: 'bg-stone-500/10 border-stone-500/30',
    description: 'SOAP notes and summaries'
  },
  recommendation: {
    label: 'Recommendations',
    icon: Brain,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    description: 'Suggested approaches'
  }
};

function formatTimestamp(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function SignificanceBar({ value }: { value: number }) {
  const percentage = Math.round(value * 100);
  const color =
    percentage >= 70 ? 'bg-emerald-500' :
    percentage >= 50 ? 'bg-amber-500' :
    'bg-stone-500';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-stone-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      <span className="text-xs text-stone-500">{percentage}%</span>
    </div>
  );
}

export function InsightPanel({
  insights,
  isLoading = false,
  onInsightClick,
  selectedInsightId
}: InsightPanelProps) {
  const [expandedTypes, setExpandedTypes] = useState<Set<InsightType>>(new Set(['pattern', 'countertransference']));

  const toggleType = (type: InsightType) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  // Order insight types by priority
  const orderedTypes: InsightType[] = [
    'rupture',
    'countertransference',
    'pattern',
    'intervention',
    'stuck_point',
    'attunement',
    'documentation',
    'recommendation'
  ];

  // Filter to only types that have insights
  const activeTypes = orderedTypes.filter(type => insights[type]?.length > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-12 h-12 opacity-30" />
        </motion.div>
        <p className="text-sm mt-3">Analyzing session...</p>
      </div>
    );
  }

  if (activeTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <Sparkles className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">No insights generated yet</p>
        <p className="text-xs mt-1">Insights appear as the session is analyzed</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeTypes.map((type) => {
        const config = INSIGHT_CONFIG[type];
        const typeInsights = insights[type] || [];
        const isExpanded = expandedTypes.has(type);
        const Icon = config.icon;

        return (
          <div key={type} className={`border rounded-xl overflow-hidden ${config.bgColor}`}>
            {/* Type Header */}
            <button
              onClick={() => toggleType(type)}
              className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`font-medium ${config.color}`}>{config.label}</span>
                <span className="text-xs text-stone-500">({typeInsights.length})</span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {/* Insights List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-2">
                    {typeInsights.map((insight) => {
                      const isSelected = insight.id === selectedInsightId;

                      return (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => onInsightClick?.(insight)}
                          className={`
                            p-3 rounded-lg cursor-pointer transition-all
                            ${isSelected
                              ? 'bg-amber-500/20 border border-amber-500/30'
                              : 'bg-stone-800/50 hover:bg-stone-800/80 border border-transparent'
                            }
                          `}
                        >
                          {/* Content */}
                          <p className="text-sm text-stone-200 leading-relaxed whitespace-pre-wrap">
                            {insight.content}
                          </p>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                            {insight.timeRange && insight.timeRange.startMs !== null && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(insight.timeRange.startMs)}
                                {insight.timeRange.endMs !== null && (
                                  <> - {formatTimestamp(insight.timeRange.endMs)}</>
                                )}
                              </span>
                            )}
                            {insight.significance !== undefined && (
                              <SignificanceBar value={insight.significance} />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
