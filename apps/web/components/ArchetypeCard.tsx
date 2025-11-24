'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Book, Eye, Heart, Search, Palette, Sparkles, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface ArchetypeInsight {
  id: string;
  archetype: 'hero' | 'sage' | 'shadow' | 'lover' | 'seeker' | 'creator';
  title: string;
  message: string;
  symbols: string[];
  stageHint: string;
  createdAt: string;
}

// Legacy interface for backwards compatibility
export interface Archetype {
  name: string;
  symbol: string;
  description: string;
  keywords: string[];
  color: string;
  energy: "light" | "shadow" | "neutral";
}

export interface LegacyArchetypeInsight {
  archetype: Archetype;
  confidence: number;
  excerpt: string;
  interpretation: string;
  growthPrompt?: string;
}

// Archetype configurations for new format
const ARCHETYPE_CONFIG = {
  hero: {
    name: 'Hero',
    icon: Crown,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    description: 'Courage • Quest • Transformation'
  },
  sage: {
    name: 'Sage',
    icon: Book,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    description: 'Wisdom • Understanding • Truth'
  },
  shadow: {
    name: 'Shadow',
    icon: Eye,
    color: 'from-amber-500 to-gray-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    description: 'Integration • Hidden Gold • Wholeness'
  },
  lover: {
    name: 'Lover',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    description: 'Connection • Beauty • Passion'
  },
  seeker: {
    name: 'Seeker',
    icon: Search,
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    description: 'Quest • Discovery • Meaning'
  },
  creator: {
    name: 'Creator',
    icon: Palette,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    description: 'Expression • Innovation • Manifestation'
  }
};

interface ArchetypeCardProps {
  insight: ArchetypeInsight;
  className?: string;
}

// New component for API format
export const NewArchetypeCard: React.FC<ArchetypeCardProps> = ({ insight, className = "" }) => {
  const config = ARCHETYPE_CONFIG[insight.archetype];
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className={`
      relative overflow-hidden rounded-xl border-2 
      ${config.bgColor} ${config.borderColor}
      hover:shadow-lg transition-all duration-300
      ${className}
    `}>
      {/* Header gradient */}
      <div className={`h-2  ${config.color}`} />
      
      <div className="p-6">
        {/* Archetype header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-full  ${config.color} 
              text-white shadow-md
            `}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${config.textColor}`}>
                {config.name}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {config.description}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(insight.createdAt)}
          </span>
        </div>

        {/* Insight title */}
        <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          {insight.title}
        </h4>

        {/* Symbols */}
        <div className="flex gap-2 mb-4">
          {insight.symbols.map((symbol, idx) => (
            <span 
              key={idx}
              className={`
                inline-flex items-center justify-center
                w-10 h-10 rounded-full text-lg
                ${config.bgColor} ${config.borderColor} border
                shadow-sm hover:scale-110 transition-transform
              `}
              title={`Symbol ${idx + 1}`}
            >
              {symbol}
            </span>
          ))}
        </div>

        {/* Main message */}
        <p className="text-gray-700 leading-relaxed mb-4 text-sm">
          {insight.message}
        </p>

        {/* Stage hint */}
        <div className={`
          p-3 rounded-lg border-l-4 
          ${config.bgColor} ${config.borderColor}
          bg-opacity-50
        `}>
          <p className={`text-sm font-medium ${config.textColor}`}>
            Journey Stage: {insight.stageHint}
          </p>
        </div>

        {/* Decorative element */}
        <div className="absolute top-4 right-4 opacity-10">
          <Icon className="w-16 h-16" />
        </div>
      </div>
    </div>
  );
};

// Legacy props interface
interface LegacyArchetypeCardProps {
  insight: LegacyArchetypeInsight;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const ArchetypeCard: React.FC<LegacyArchetypeCardProps> = ({
  insight,
  isExpanded = false,
  onToggleExpand,
  className = ""
}) => {
  const { archetype, confidence, excerpt, interpretation, growthPrompt } = insight;

  const getColorClasses = (color: string, energy: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; accent: string }> = {
      red: { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-200', 
        accent: 'bg-red-500'
      },
      purple: { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200', 
        accent: 'bg-amber-500'
      },
      gray: { 
        bg: 'bg-gray-50', 
        text: 'text-gray-700', 
        border: 'border-gray-300', 
        accent: 'bg-gray-600'
      },
      pink: { 
        bg: 'bg-pink-50', 
        text: 'text-pink-700', 
        border: 'border-pink-200', 
        accent: 'bg-pink-500'
      },
      orange: { 
        bg: 'bg-orange-50', 
        text: 'text-orange-700', 
        border: 'border-orange-200', 
        accent: 'bg-orange-500'
      },
      green: { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200', 
        accent: 'bg-green-500'
      },
      yellow: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-200', 
        accent: 'bg-yellow-500'
      },
      blue: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-200', 
        accent: 'bg-blue-500'
      },
      gold: { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200', 
        accent: 'bg-amber-500'
      },
      white: { 
        bg: 'bg-slate-50', 
        text: 'text-slate-700', 
        border: 'border-slate-200', 
        accent: 'bg-slate-400'
      }
    };

    return colorMap[color] || colorMap.purple;
  };

  const colors = getColorClasses(archetype.color, archetype.energy);

  const confidencePercentage = Math.round(confidence * 100);

  return (
    <Card className={`${colors.bg} ${colors.border} border transition-all duration-300 hover:shadow-lg ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl" role="img" aria-label={archetype.name}>
              {archetype.symbol}
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${colors.text}`}>
                {archetype.name}
              </h3>
              <p className="text-sm text-gray-600">
                {archetype.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Confidence indicator */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full ${colors.accent} flex items-center justify-center text-white text-sm font-bold`}>
                {confidencePercentage}%
              </div>
              <span className="text-xs text-gray-500 mt-1">Match</span>
            </div>
            
            {/* Expand button */}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className={`p-2 rounded-full ${colors.text} hover:bg-white/50 transition-colors`}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Energy indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            archetype.energy === 'light' ? 'bg-yellow-100 text-yellow-800' :
            archetype.energy === 'shadow' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {archetype.energy === 'light' ? '✨ Light' : 
             archetype.energy === 'shadow' ? '🌑 Shadow' : 
             '⚖️ Neutral'}
          </div>
          
          <div className="text-xs text-gray-500">
            {archetype.energy === 'light' ? 'Growth & expansion' :
             archetype.energy === 'shadow' ? 'Hidden wisdom' :
             'Balanced perspective'}
          </div>
        </div>

        {/* Interpretation */}
        <div className={`p-3 rounded-lg bg-white/70 border border-white/50 mb-3`}>
          <div className="flex items-start gap-2">
            <Eye className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
            <p className="text-sm text-gray-700 leading-relaxed">
              {interpretation}
            </p>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Excerpt */}
              {excerpt && (
                <div className="mb-4">
                  <h4 className={`font-medium ${colors.text} text-sm mb-2 flex items-center gap-1`}>
                    <Sparkles className="w-3 h-3" />
                    Your words reflect this archetype:
                  </h4>
                  <blockquote className="italic text-sm text-gray-600 pl-3 border-l-2 border-gray-300">
                    "{excerpt}"
                  </blockquote>
                </div>
              )}

              {/* Growth prompt */}
              {growthPrompt && (
                <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border} mb-4`}>
                  <div className="flex items-start gap-2">
                    <HelpCircle className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                    <div>
                      <h4 className={`font-medium ${colors.text} text-sm mb-1`}>
                        Reflection Question
                      </h4>
                      <p className="text-sm text-gray-700">
                        {growthPrompt}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Keywords */}
              <div>
                <h4 className={`font-medium ${colors.text} text-sm mb-2`}>
                  Associated themes:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {archetype.keywords.slice(0, 6).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/60 border border-white/80 rounded-md text-xs text-gray-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

// Multiple archetype display component
interface ArchetypeInsightsProps {
  insights: LegacyArchetypeInsight[];
  title?: string;
  className?: string;
}

export const ArchetypeInsights: React.FC<ArchetypeInsightsProps> = ({
  insights,
  title = "Archetypal Insights",
  className = ""
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          {title}
        </h2>
      )}
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <ArchetypeCard
            key={`${insight.archetype.name}-${index}`}
            insight={insight}
            isExpanded={expandedId === `${insight.archetype.name}-${index}`}
            onToggleExpand={() => 
              setExpandedId(
                expandedId === `${insight.archetype.name}-${index}` 
                  ? null 
                  : `${insight.archetype.name}-${index}`
              )
            }
          />
        ))}
      </div>
    </div>
  );
};