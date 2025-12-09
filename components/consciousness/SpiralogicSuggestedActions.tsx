/**
 * Spiralogic Suggested Actions Component
 * Renders ephemeral action buttons based on MAIA's many-armed intelligence
 * Actions appear as "disposable pixels" that serve specific elemental functions
 */

import React, { useState, useEffect } from 'react';
import { MaiaSuggestedAction, SpiralogicCell } from '@/lib/consciousness/spiralogic-core';

interface SpiralogicSuggestedActionsProps {
  suggestedActions: MaiaSuggestedAction[];
  spiralogicCell: SpiralogicCell;
  availableInterventions: Array<{
    flowId: string;
    name: string;
    description: string;
    confidence: number;
  }>;
  onActionActivate: (actionId: string) => void;
  onInterventionTrigger: (flowId: string) => void;
}

export const SpiralogicSuggestedActions: React.FC<SpiralogicSuggestedActionsProps> = ({
  suggestedActions,
  spiralogicCell,
  availableInterventions,
  onActionActivate,
  onInterventionTrigger
}) => {
  const [visibleActions, setVisibleActions] = useState<MaiaSuggestedAction[]>([]);
  const [elementalPulse, setElementalPulse] = useState<boolean>(false);

  // Manifest actions gradually based on elemental timing
  useEffect(() => {
    const manifestActions = async () => {
      setVisibleActions([]);

      // Sort actions by priority (highest first)
      const sortedActions = [...suggestedActions].sort((a, b) => b.priority - a.priority);

      // Manifest each action with elemental timing
      for (let i = 0; i < sortedActions.length; i++) {
        const delay = getElementalDelay(spiralogicCell.element, i);

        setTimeout(() => {
          setVisibleActions(prev => [...prev, sortedActions[i]]);
        }, delay);
      }
    };

    manifestActions();
  }, [suggestedActions, spiralogicCell]);

  // Pulse effect based on element
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setElementalPulse(true);
      setTimeout(() => setElementalPulse(false), 500);
    }, getElementalPulseInterval(spiralogicCell.element));

    return () => clearInterval(pulseInterval);
  }, [spiralogicCell.element]);

  const getElementalDelay = (element: string, index: number): number => {
    const baseDelay = 300;
    const elementMultiplier = {
      'Fire': 0.8,    // Fast, immediate
      'Air': 1.0,     // Quick, flowing
      'Water': 1.5,   // Fluid, gradual
      'Earth': 2.0    // Slow, grounded
    }[element] || 1.0;

    return baseDelay * elementMultiplier * (index + 1);
  };

  const getElementalPulseInterval = (element: string): number => {
    return {
      'Fire': 2000,   // Rapid pulse
      'Air': 3000,    // Flowing pulse
      'Water': 4000,  // Deep pulse
      'Earth': 6000   // Grounded pulse
    }[element] || 3000;
  };

  const getElementalColors = (element: string) => {
    return {
      'Fire': {
        primary: 'from-red-500 to-orange-600',
        accent: 'border-red-400',
        text: 'text-red-100',
        hover: 'hover:from-red-600 hover:to-orange-700'
      },
      'Water': {
        primary: 'from-blue-500 to-cyan-600',
        accent: 'border-blue-400',
        text: 'text-blue-100',
        hover: 'hover:from-blue-600 hover:to-cyan-700'
      },
      'Earth': {
        primary: 'from-green-500 to-emerald-600',
        accent: 'border-green-400',
        text: 'text-green-100',
        hover: 'hover:from-green-600 hover:to-emerald-700'
      },
      'Air': {
        primary: 'from-purple-500 to-indigo-600',
        accent: 'border-purple-400',
        text: 'text-purple-100',
        hover: 'hover:from-purple-600 hover:to-indigo-700'
      }
    }[element] || {
      primary: 'from-gray-500 to-gray-600',
      accent: 'border-gray-400',
      text: 'text-gray-100',
      hover: 'hover:from-gray-600 hover:to-gray-700'
    };
  };

  const colors = getElementalColors(spiralogicCell.element);

  const handleActionClick = (action: MaiaSuggestedAction) => {
    // Check if this is an intervention action
    if (action.id.startsWith('launch_')) {
      const flowId = action.id.replace('launch_', '');
      onInterventionTrigger(flowId);
    } else {
      onActionActivate(action.id);
    }
  };

  const getActionIcon = (actionId: string, element: string): string => {
    // Intervention actions
    if (actionId.startsWith('launch_ipp')) return '🌟';
    if (actionId.startsWith('launch_cbt')) return '🧠';
    if (actionId.startsWith('launch_jungian')) return '🌙';
    if (actionId.startsWith('launch_somatic')) return '🌊';

    // Standard spiralogic actions by element
    const elementalIcons = {
      'Fire': '🔥',
      'Water': '💧',
      'Earth': '🌱',
      'Air': '💨'
    };

    if (actionId === 'capture_field_event') return '📊';
    if (actionId.includes('canonical_questions')) return '❓';
    if (actionId.includes('explore')) return elementalIcons[element] || '✨';

    return elementalIcons[element] || '⚡';
  };

  return (
    <div className="relative">
      {/* High-confidence intervention actions (floating prominently) */}
      {availableInterventions.filter(i => i.confidence > 0.7).map((intervention, index) => (
        <div
          key={intervention.flowId}
          className={`
            fixed top-20 right-6 z-50 mb-4 p-4 rounded-xl border-2
            bg-gradient-to-r ${colors.primary} ${colors.accent}
            ${elementalPulse ? 'scale-105 shadow-2xl' : 'scale-100 shadow-xl'}
            transition-all duration-300 cursor-pointer group
            animate-fadeIn
          `}
          style={{
            animationDelay: `${index * 200}ms`,
            transform: `translateY(${index * 80}px)`
          }}
          onClick={() => onInterventionTrigger(intervention.flowId)}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getActionIcon(`launch_${intervention.flowId}`, spiralogicCell.element)}
            </div>
            <div>
              <div className={`font-bold ${colors.text}`}>
                {intervention.name}
              </div>
              <div className={`text-sm ${colors.text} opacity-80`}>
                {intervention.description}
              </div>
              <div className="text-xs text-white/60 mt-1">
                Confidence: {Math.round(intervention.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Framework hint badge */}
          {intervention.flowId.includes('_') && (
            <div className="absolute -top-2 -left-2 bg-white/90 text-black text-xs px-2 py-1 rounded-full font-bold">
              {intervention.flowId.split('_')[0].toUpperCase()}
            </div>
          )}
        </div>
      ))}

      {/* Standard suggested actions (bottom overlay) */}
      <div className="fixed bottom-6 left-6 right-6 z-40">
        <div className="flex flex-wrap gap-3 justify-center">
          {visibleActions
            .filter(action => !action.id.startsWith('launch_'))
            .map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                px-4 py-2 rounded-lg border
                bg-gradient-to-r ${colors.primary} ${colors.accent}
                ${colors.text} ${colors.hover}
                ${elementalPulse && action.elementalResonance === spiralogicCell.element
                  ? 'scale-105 shadow-lg'
                  : 'scale-100 shadow-md'}
                transition-all duration-300
                flex items-center space-x-2
                animate-slideUp
                backdrop-blur-sm bg-opacity-90
              `}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <span className="text-lg">
                {getActionIcon(action.id, spiralogicCell.element)}
              </span>
              <span className="font-medium">
                {action.label}
              </span>

              {/* Priority indicator */}
              {action.priority > 0.8 && (
                <span className="text-yellow-300 text-xs">⭐</span>
              )}
            </button>
          ))}
        </div>

        {/* Spiralogic state indicator */}
        <div className="mt-4 text-center">
          <div className="inline-block bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className={`${colors.text} font-mono text-sm`}>
              🌀 {spiralogicCell.element} {spiralogicCell.phase} • {spiralogicCell.context}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};