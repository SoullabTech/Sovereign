// frontend

import { useState } from 'react';
import { KnowledgeGateResult, SourceContribution } from '@/lib/ain/knowledge-gate';
import { AwarenessState } from '@/lib/ain/awareness-levels';
import { ConversationStylePreference } from '@/lib/preferences/conversation-style-preference';

interface AINKnowledgeGateHookOptions {
  onSourceMixUpdate?: (sourceMix: SourceContribution[]) => void;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  style?: ConversationStylePreference['style'];
}

interface AINOracleMessage {
  type: 'oracle_response';
  message: string;
  oracle: string;
  sourceMix: SourceContribution[];
  awarenessState: AwarenessState;
  knowledgeGate: {
    version: string;
    timestamp: string;
    responseTime: number;
    mandalaArchitecture?: {
      horizontal: { source: string; weight: number }[];
      vertical: {
        level: number;
        description: string;
        confidence: number;
        depthMarkers: Record<string, number>;
      };
    };
    debug?: Record<string, any>;
  };
  state: {
    presence: string;
    coherence: number;
    resonance: number;
    awarenessDepth?: number;
    mandalaActivation?: boolean;
  };
}

/**
 * Hook for integrating AIN Knowledge Gate with Oracle conversations
 *
 * This hook provides a clean interface for sending messages through the
 * AIN Knowledge Gate enhanced Oracle endpoint and handling the responses
 * with source mix visualization support.
 */
export function useAINKnowledgeGate(options: AINKnowledgeGateHookOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSourceMix, setLastSourceMix] = useState<SourceContribution[]>([]);
  const [lastAwarenessState, setLastAwarenessState] = useState<AwarenessState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    userMessage: string,
    contextHint?: string
  ): Promise<AINOracleMessage | null> => {
    if (!userMessage.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      console.log('[useAINKnowledgeGate] Sending message through Knowledge Gate...');

      const response = await fetch('/api/oracle/ain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          style: options.style || 'gentle',
          conversationHistory: options.conversationHistory || [],
          contextHint
        })
      });

      if (!response.ok) {
        throw new Error(`Oracle responded with status ${response.status}`);
      }

      const data: AINOracleMessage = await response.json();

      // Update source mix and awareness state
      if (data.sourceMix) {
        setLastSourceMix(data.sourceMix);
        options.onSourceMixUpdate?.(data.sourceMix);

        // Log source mix for debugging
        console.log('[AIN Knowledge Gate] Source Mix:', data.sourceMix.map(s =>
          `${s.source}: ${(s.weight * 100).toFixed(1)}%`
        ).join(', '));
      }

      // Update awareness state
      if (data.awarenessState) {
        setLastAwarenessState(data.awarenessState);

        // Log awareness state for debugging
        console.log('[AIN Knowledge Gate] Awareness Level:', data.awarenessState.level,
                   `(${(data.awarenessState.confidence * 100).toFixed(1)}% confidence)`);
      }

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('[useAINKnowledgeGate] Error:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceMixSummary = () => {
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
  };

  return {
    sendMessage,
    isLoading,
    error,
    lastSourceMix,
    getSourceMixSummary,
    // Utility function to get source mix as a prop for SourceHalo component
    getSourceHaloProps: () => ({
      sourceMix: lastSourceMix,
      size: 'md' as const,
      showLabels: true
    })
  };
}