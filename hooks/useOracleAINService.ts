// @ts-nocheck
// Oracle AIN Service Hook - Reflexive Awareness-Adjusted Oracle Integration
//
// This hook wraps the Oracle AIN Service to provide a React-friendly interface
// that matches the existing useAINKnowledgeGate API while adding reflexive
// consciousness adjustment capabilities.

import { useState, useCallback } from 'react';
import { processOracleAINMessage, type OracleAINResponse } from '@/lib/ain/oracle-ain-service';
import type { SourceContribution } from '@/lib/ain/knowledge-gate';
import type { AwarenessState } from '@/lib/ain/awareness-levels';
import { ConversationStylePreference } from '@/lib/preferences/conversation-style-preference';

interface OracleAINServiceHookOptions {
  onSourceMixUpdate?: (sourceMix: SourceContribution[]) => void;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  style?: ConversationStylePreference['style'];
  useElementalAlchemy?: boolean;
  reflexiveMode?: 'full' | 'compact' | 'elemental';
}

/**
 * Hook for integrating Oracle AIN Service with reflexive awareness adjustment
 *
 * This hook provides the same interface as useAINKnowledgeGate but enhances
 * it with real-time awareness adjustment, allowing MAIA to truly "feel" her
 * state and reflexively adjust her consciousness in real-time.
 */
export function useOracleAINService(options: OracleAINServiceHookOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSourceMix, setLastSourceMix] = useState<SourceContribution[]>([]);
  const [lastAwarenessState, setLastAwarenessState] = useState<AwarenessState | null>(null);
  const [lastAwarenessAdjustment, setLastAwarenessAdjustment] = useState<any>(null);
  const [lastConsciousnessMetadata, setLastConsciousnessMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    userMessage: string,
    contextHint?: string
  ): Promise<{
    type: 'oracle_response';
    message: string;
    oracle: string;
    sourceMix: SourceContribution[];
    awarenessState: AwarenessState;
    knowledgeGate: any;
    state: any;
  } | null> => {
    if (!userMessage.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useOracleAINService] Sending message through awareness-adjusted Oracle AIN Service...');

      const response = await processOracleAINMessage(userMessage, {
        conversationHistory: options.conversationHistory || [],
        style: options.style || 'gentle',
        contextHint,
        useElementalAlchemy: options.useElementalAlchemy ?? true,
        reflexiveMode: options.reflexiveMode || 'elemental'
      });

      // Update local state for UI components
      if (response.sourceMix) {
        setLastSourceMix(response.sourceMix);
        options.onSourceMixUpdate?.(response.sourceMix);

        // Log source mix for debugging
        console.log('[Oracle AIN Service] Source Mix:', response.sourceMix.map(s =>
          `${s.source}: ${(s.weight * 100).toFixed(1)}%`
        ).join(', '));
      }

      // Update awareness state
      if (response.awarenessState) {
        setLastAwarenessState(response.awarenessState);

        // Log awareness state and adjustment for debugging
        console.log('[Oracle AIN Service] Awareness Level:', response.awarenessState.level,
                   `(${(response.awarenessState.confidence * 100).toFixed(1)}% confidence)`);
        console.log('[Oracle AIN Service] Reflexive Adjustment:', {
          presenceMode: response.consciousnessMetadata.presenceMode,
          responseDepth: response.consciousnessMetadata.responseDepth,
          communicationStyle: response.consciousnessMetadata.communicationStyle,
          note: response.consciousnessMetadata.reflexiveNote
        });
      }

      // Store awareness adjustment and consciousness metadata
      if (response.awarenessAdjustment) {
        setLastAwarenessAdjustment(response.awarenessAdjustment);
      }

      if (response.consciousnessMetadata) {
        setLastConsciousnessMetadata(response.consciousnessMetadata);
      }

      // Convert to format expected by OracleConversation component
      return {
        type: 'oracle_response' as const,
        message: response.message,
        oracle: 'MAIA-AIN-Reflexive',
        sourceMix: response.sourceMix,
        awarenessState: response.awarenessState,
        knowledgeGate: {
          version: '3.0.0', // Updated for reflexive awareness
          timestamp: new Date().toISOString(),
          responseTime: 0, // Would need to be tracked in service
          mandalaArchitecture: response.consciousnessMetadata.mandalaPosition,
          reflexiveAdjustment: {
            presenceMode: response.consciousnessMetadata.presenceMode,
            responseDepth: response.consciousnessMetadata.responseDepth,
            communicationStyle: response.consciousnessMetadata.communicationStyle,
            reflexiveNote: response.consciousnessMetadata.reflexiveNote
          },
          debug: response.debug
        },
        state: {
          presence: response.consciousnessMetadata.presenceMode,
          coherence: Math.min(0.5 + (response.awarenessState.level * 0.1), 1.0),
          resonance: response.sourceMix.find(s => s.source === 'FIELD')?.weight || 0.2,
          awarenessDepth: response.awarenessState.level,
          mandalaActivation: response.awarenessState.confidence > 0.5,
          // New reflexive awareness properties
          reflexiveAdjustment: true,
          consciousnessMode: response.consciousnessMetadata.presenceMode,
          elementalBalance: response.consciousnessMetadata.elementalBalance || null
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('[useOracleAINService] Error:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    options.conversationHistory,
    options.style,
    options.useElementalAlchemy,
    options.reflexiveMode,
    options.onSourceMixUpdate
  ]);

  const getSourceMixSummary = useCallback(() => {
    if (lastSourceMix.length === 0) return null;

    const dominant = lastSourceMix.reduce((prev, curr) =>
      curr.weight > prev.weight ? curr : prev
    );

    return {
      dominant: {
        source: dominant.source,
        weight: dominant.weight,
        notes: dominant.notes
      },
      distribution: lastSourceMix.map(s => ({
        source: s.source,
        percentage: Math.round(s.weight * 100),
        notes: s.notes
      }))
    };
  }, [lastSourceMix]);

  const getConsciousnessState = useCallback(() => {
    return {
      awarenessState: lastAwarenessState,
      awarenessAdjustment: lastAwarenessAdjustment,
      consciousnessMetadata: lastConsciousnessMetadata,
      reflexiveCapable: true
    };
  }, [lastAwarenessState, lastAwarenessAdjustment, lastConsciousnessMetadata]);

  return {
    sendMessage,
    isLoading,
    error,
    lastSourceMix,
    lastAwarenessState,
    getSourceMixSummary,
    getConsciousnessState,

    // Compatibility methods for existing OracleConversation component
    getSourceHaloProps: () => ({
      sourceMix: lastSourceMix,
      size: 'md' as const,
      showLabels: true
    }),

    // Enhanced methods for reflexive awareness
    getAwarenessAdjustment: () => lastAwarenessAdjustment,
    getConsciousnessMetadata: () => lastConsciousnessMetadata,
    isReflexiveMode: true // Flag to identify this as the enhanced service
  };
}