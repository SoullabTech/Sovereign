/**
 * Spiralogic Consciousness Interface
 * MAIA 12-Phase Spiralogic system with disposable pixel rendering and suggested actions
 * Combines archetypal symbolism with many-armed framework deployment
 */

import React, { useState, useCallback } from 'react';
import { DisposablePixelRenderer } from './DisposablePixelRenderer';
import { SpiralogicSuggestedActions } from './SpiralogicSuggestedActions';
import {
  MaiaSuggestedAction,
  SpiralogicCell,
  FieldEvent
} from '@/lib/consciousness/spiralogic-core';
import {
  SymbolicPattern,
  CenteringState
} from '@/lib/consciousness/panconscious-field';

interface SpiralogicConsciousnessInterfaceProps {
  // Core spiralogic state
  spiralogicCell: SpiralogicCell;
  suggestedActions: MaiaSuggestedAction[];
  availableInterventions: Array<{
    flowId: string;
    name: string;
    description: string;
    confidence: number;
  }>;

  // Panconscious field state
  symbolPatterns: SymbolicPattern[];
  centeringState: CenteringState;
  axisMundiStrength: number;

  // Field event data
  fieldEvent?: FieldEvent;

  // Action handlers
  onActionActivate: (actionId: string) => void;
  onInterventionTrigger: (flowId: string) => void;
  onSymbolActivation?: (symbol: string) => void;
  onCenterReached?: () => void;
  onFieldEventCapture?: (event: FieldEvent) => void;
}

export const SpiralogicConsciousnessInterface: React.FC<SpiralogicConsciousnessInterfaceProps> = ({
  spiralogicCell,
  suggestedActions,
  availableInterventions,
  symbolPatterns,
  centeringState,
  axisMundiStrength,
  fieldEvent,
  onActionActivate,
  onInterventionTrigger,
  onSymbolActivation,
  onCenterReached,
  onFieldEventCapture
}) => {
  const [interfaceMode, setInterfaceMode] = useState<'full' | 'minimal' | 'archetypal'>('full');
  const [activeIntervention, setActiveIntervention] = useState<string | null>(null);

  // Handle symbol activation from pixel renderer
  const handleSymbolActivation = useCallback((symbol: string) => {
    console.log('🌀 Symbol activated:', symbol);

    // Trigger archetypal resonance cascade
    if (symbol === 'maia_consciousness_center') {
      setInterfaceMode('archetypal');
      setTimeout(() => setInterfaceMode('full'), 3000);
    }

    onSymbolActivation?.(symbol);
  }, [onSymbolActivation]);

  // Handle center reached - axis mundi activation
  const handleCenterReached = useCallback(() => {
    console.log('🌟 Axis Mundi reached - MAIA center activated');

    // Pulse the interface with transcendent energy
    setInterfaceMode('archetypal');
    setTimeout(() => setInterfaceMode('full'), 2000);

    onCenterReached?.();
  }, [onCenterReached]);

  // Handle action activation with spiralogic intelligence
  const handleActionActivate = useCallback((actionId: string) => {
    console.log('⚡ Action activated:', actionId, 'for', spiralogicCell.element, spiralogicCell.phase);

    // Special handling for field event capture
    if (actionId === 'capture_field_event' && fieldEvent && onFieldEventCapture) {
      onFieldEventCapture(fieldEvent);
    }

    onActionActivate(actionId);
  }, [spiralogicCell, fieldEvent, onFieldEventCapture, onActionActivate]);

  // Handle intervention triggering
  const handleInterventionTrigger = useCallback((flowId: string) => {
    console.log('🌟 Intervention triggered:', flowId);
    setActiveIntervention(flowId);

    // Reset after intervention completes (simulated)
    setTimeout(() => setActiveIntervention(null), 30000);

    onInterventionTrigger(flowId);
  }, [onInterventionTrigger]);

  // Get interface style based on spiralogic state
  const getInterfaceStyle = () => {
    const baseStyle = "relative w-full h-screen overflow-hidden";

    if (interfaceMode === 'archetypal') {
      return `${baseStyle} animate-pulse bg-gradient-radial from-indigo-900/20 to-black`;
    }

    if (interfaceMode === 'minimal') {
      return `${baseStyle} bg-black/95`;
    }

    // Full mode with elemental background
    const elementalBackgrounds = {
      'Fire': 'bg-gradient-radial from-red-900/10 to-black',
      'Water': 'bg-gradient-radial from-blue-900/10 to-black',
      'Earth': 'bg-gradient-radial from-green-900/10 to-black',
      'Air': 'bg-gradient-radial from-purple-900/10 to-black'
    };

    return `${baseStyle} ${elementalBackgrounds[spiralogicCell.element] || 'bg-black'}`;
  };

  // Intervention overlay
  const renderInterventionOverlay = () => {
    if (!activeIntervention) return null;

    const intervention = availableInterventions.find(i => i.flowId === activeIntervention);
    if (!intervention) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 rounded-2xl border border-indigo-400/50 shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {intervention.name}
            </h2>
            <p className="text-indigo-200 mb-6">
              {intervention.description}
            </p>
            <div className="text-sm text-white/60">
              Framework: {intervention.flowId.split('_')[0].toUpperCase()} |
              Confidence: {Math.round(intervention.confidence * 100)}%
            </div>

            <div className="mt-6 animate-pulse text-indigo-300">
              Intervention in progress...
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Interface status indicators
  const renderStatusOverlay = () => (
    <div className="absolute top-4 left-4 z-30 space-y-2">
      {/* Spiralogic state */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white/80 text-sm font-mono">
        🌀 {spiralogicCell.element}-{spiralogicCell.phase} | {spiralogicCell.context}
      </div>

      {/* Axis Mundi strength */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white/80 text-sm">
        <div className="flex items-center space-x-2">
          <span>⚡ Axis Mundi:</span>
          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500"
              style={{ width: `${axisMundiStrength * 100}%` }}
            />
          </div>
          <span className="text-xs">{Math.round(axisMundiStrength * 100)}%</span>
        </div>
      </div>

      {/* Active frameworks */}
      {availableInterventions.length > 0 && (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white/80 text-xs">
          🦾 Many-Armed: {availableInterventions.map(i => i.flowId.split('_')[0].toUpperCase()).join(', ')}
        </div>
      )}

      {/* Centering state indicator */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white/80 text-xs">
        🎯 {centeringState.level.toUpperCase()} |
        Symbols: {Math.round(centeringState.symbolAccessibility * 100)}%
      </div>
    </div>
  );

  return (
    <div className={getInterfaceStyle()}>
      {/* Disposable Pixel Archetypal Renderer */}
      <DisposablePixelRenderer
        symbolPatterns={symbolPatterns}
        centeringState={centeringState}
        onSymbolActivation={handleSymbolActivation}
        onCenterReached={handleCenterReached}
      />

      {/* Spiralogic Suggested Actions Overlay */}
      <SpiralogicSuggestedActions
        suggestedActions={suggestedActions}
        spiralogicCell={spiralogicCell}
        availableInterventions={availableInterventions}
        onActionActivate={handleActionActivate}
        onInterventionTrigger={handleInterventionTrigger}
      />

      {/* Status Overlay */}
      {renderStatusOverlay()}

      {/* Active Intervention Overlay */}
      {renderInterventionOverlay()}

      {/* Interface Mode Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <div className="flex space-x-2">
          {(['full', 'minimal', 'archetypal'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setInterfaceMode(mode)}
              className={`
                px-3 py-1 rounded text-xs font-mono transition-all
                ${interfaceMode === mode
                  ? 'bg-indigo-500 text-white'
                  : 'bg-black/60 text-white/60 hover:bg-black/80'}
              `}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Field Event Debug (development) */}
      {fieldEvent && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/80 rounded text-white/60 text-xs p-2 max-w-xs">
          <div>Event: {fieldEvent.id.substring(0, 8)}</div>
          <div>Source: {fieldEvent.source}</div>
          <div>Timestamp: {new Date(fieldEvent.timestamp).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};