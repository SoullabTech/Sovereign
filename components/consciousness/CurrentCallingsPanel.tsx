/**
 * My Current Callings Panel
 * Disposable panel for poetic overview of active macro/meso/micro callings
 * Shows nested relationships and current spiralogic states
 */

import React, { useState } from 'react';
import { CallArc, ArcNestingMap, generateArcSummary, generateNestingInsight } from '@/lib/consciousness/callArcs';
import { FacetCode } from '@/lib/consciousness/spiralogicFacets';
import { CallScale, CallKind } from '@/lib/consciousness/spiralogicPosition';

interface CurrentCallingsProps {
  nestingMap: ArcNestingMap;
  onArcSelect?: (arcId: string) => void;
  onDropIntoArc?: (arcId: string) => void;
  onCreateNewArc?: () => void;
  onClose?: () => void;
}

export const CurrentCallingsPanel: React.FC<CurrentCallingsProps> = ({
  nestingMap,
  onArcSelect,
  onDropIntoArc,
  onCreateNewArc,
  onClose
}) => {
  const [selectedArc, setSelectedArc] = useState<string | null>(null);

  // Filter for active arcs
  const activeMacroArcs = nestingMap.macroArcs.filter(arc => arc.status === 'active');
  const activeMesoArcs = nestingMap.mesoArcs.filter(arc => arc.status === 'active');
  const activeMicroArcs = nestingMap.microArcs.filter(arc =>
    arc.status === 'active' && isRecentQuest(arc)
  );

  function isRecentQuest(arc: CallArc): boolean {
    if (!arc.lastActiveAt) return true;
    const lastActive = new Date(arc.lastActiveAt);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    return lastActive >= sixtyDaysAgo;
  }

  const getScaleColors = (scale: CallScale) => {
    switch (scale) {
      case 'macro':
        return {
          bg: 'from-purple-900/20 to-indigo-900/20',
          border: 'border-purple-400/30',
          text: 'text-purple-200',
          accent: 'text-purple-400'
        };
      case 'meso':
        return {
          bg: 'from-blue-900/20 to-cyan-900/20',
          border: 'border-blue-400/30',
          text: 'text-blue-200',
          accent: 'text-blue-400'
        };
      case 'micro':
        return {
          bg: 'from-green-900/20 to-emerald-900/20',
          border: 'border-green-400/30',
          text: 'text-green-200',
          accent: 'text-green-400'
        };
    }
  };

  const getKindIcon = (kind: CallKind): string => {
    const icons: Record<CallKind, string> = {
      learning: '📚',
      service: '🤝',
      place: '🌍',
      relationship: '💕',
      practice: '🧘',
      lifestyle: '🌱',
      creative_work: '🎨',
      community: '👥',
      healing: '🌿',
      spiritual_path: '✨',
      other: '⭐'
    };
    return icons[kind] || '⭐';
  };

  const getFacetDisplay = (facet?: FacetCode): string => {
    if (!facet) return '';
    const element = facet.charAt(0);
    const phase = facet.charAt(1);
    const elementNames = { F: 'Fire', W: 'Water', E: 'Earth', A: 'Air' };
    return `${elementNames[element as keyof typeof elementNames]} ${phase}`;
  };

  const renderArcCard = (arc: CallArc, showNesting: boolean = true) => {
    const colors = getScaleColors(arc.scale);
    const isSelected = selectedArc === arc.id;

    return (
      <div
        key={arc.id}
        className={`
          p-4 rounded-lg border backdrop-blur-sm cursor-pointer transition-all duration-300
          bg-gradient-to-br ${colors.bg} ${colors.border}
          ${isSelected ? 'ring-2 ring-white/40 scale-105' : 'hover:scale-102 hover:ring-1 hover:ring-white/20'}
        `}
        onClick={() => {
          setSelectedArc(isSelected ? null : arc.id);
          onArcSelect?.(arc.id);
        }}
      >
        {/* Arc Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getKindIcon(arc.kind)}</span>
            <div>
              <h3 className={`font-semibold ${colors.text}`}>
                {arc.title}
              </h3>
              <p className={`text-xs ${colors.accent} capitalize`}>
                {arc.scale} • {arc.kind.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Scale indicator */}
          <div className={`px-2 py-1 rounded-full text-xs font-mono ${colors.bg} ${colors.border} border`}>
            {arc.scale.toUpperCase()}
          </div>
        </div>

        {/* Current Position */}
        {arc.currentPosition && (
          <div className="mb-2">
            <div className={`text-sm ${colors.accent}`}>
              Currently in: <span className="font-medium">{getFacetDisplay(arc.currentPosition.facet)}</span>
            </div>
            {arc.stats?.phaseSummary && (
              <div className={`text-xs ${colors.text} opacity-80`}>
                {arc.stats.phaseSummary}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {arc.description && (
          <p className={`text-sm ${colors.text} opacity-90 mb-2`}>
            {arc.description}
          </p>
        )}

        {/* Nesting Info */}
        {showNesting && (arc.parentArcId || (arc.childArcIds && arc.childArcIds.length > 0)) && (
          <div className={`text-xs ${colors.text} opacity-70 border-t ${colors.border} pt-2 mt-2`}>
            {generateNestingInsight(arc, nestingMap)}
          </div>
        )}

        {/* Action Buttons */}
        {isSelected && (
          <div className="flex space-x-2 mt-3 pt-3 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDropIntoArc?.(arc.id);
              }}
              className={`px-3 py-1 rounded text-xs font-medium ${colors.bg} ${colors.border} border ${colors.text} hover:bg-white/10 transition-colors`}
            >
              Drop into this calling
            </button>
            {arc.scale === 'macro' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateNewArc?.();
                }}
                className="px-3 py-1 rounded text-xs font-medium bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 transition-colors"
              >
                Add nested calling
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl border border-white/20 shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🌀 My Current Callings
              </h2>
              <p className="text-white/70">
                The callings currently shaping your field
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Macro Arcs - Ways of Life */}
          {activeMacroArcs.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                🌌 Ways of Life
                <span className="ml-2 text-sm text-purple-400/60 font-normal">
                  (macro callings)
                </span>
              </h3>
              <div className="space-y-3">
                {activeMacroArcs.map(arc => renderArcCard(arc))}
              </div>
            </section>
          )}

          {/* Meso Arcs - Chapters */}
          {activeMesoArcs.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                📖 Chapters
                <span className="ml-2 text-sm text-blue-400/60 font-normal">
                  (meso callings)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeMesoArcs.map(arc => renderArcCard(arc))}
              </div>
            </section>
          )}

          {/* Micro Arcs - Recent Quests */}
          {activeMicroArcs.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                🎯 Recent Quests
                <span className="ml-2 text-sm text-green-400/60 font-normal">
                  (micro callings)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeMicroArcs.map(arc => renderArcCard(arc, false))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {activeMacroArcs.length === 0 && activeMesoArcs.length === 0 && activeMicroArcs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready for what's calling you
              </h3>
              <p className="text-white/60 mb-4">
                No active callings yet. What wants to emerge?
              </p>
              {onCreateNewArc && (
                <button
                  onClick={onCreateNewArc}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition-colors"
                >
                  Name a new calling
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-black/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/50">
              Callings update as you move through your spiralogic journey
            </div>
            <div className="flex space-x-3">
              {onCreateNewArc && (
                <button
                  onClick={onCreateNewArc}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
                >
                  + New Calling
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};