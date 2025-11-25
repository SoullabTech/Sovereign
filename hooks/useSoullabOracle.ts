import { useState, useCallback } from 'react';

export interface OracleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    oracleStage?: string;
    trustLevel?: number;
    emotionalState?: string;
    element?: string;
    stageProgress?: number;
    relationshipMetrics?: any;
    microPsiEmotionalState?: any;
  };
}

export interface OracleState {
  currentStage: string;
  trustLevel: number;
  stageProgress: number;
  safetyStatus: string;
  sessionCount?: number;
  lastInteraction?: Date;
}

export interface UseSoullabOracleResult {
  sendMessage: (text: string, userId: string) => Promise<OracleMessage>;
  isLoading: boolean;
  error: string | null;
  oracleState: OracleState;
  lastMessage: OracleMessage | null;
  clearError: () => void;
}

export function useSoullabOracle(): UseSoullabOracleResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<OracleMessage | null>(null);
  const [oracleState, setOracleState] = useState<OracleState>({
    currentStage: 'structured_guide',
    trustLevel: 0.3,
    stageProgress: 0.1,
    safetyStatus: 'active'
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendMessage = useCallback(async (text: string, userId: string): Promise<OracleMessage> => {
    setIsLoading(true);
    setError(null);

    try {
      // Send to PersonalOracleAgent via enhanced chat endpoint
      const response = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-experiment-spiralogic': 'on' // Force use of full PersonalOracleAgent
        },
        body: JSON.stringify({
          text,
          userId,
          sessionId: `soullab-${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Update oracle state from response metadata
      if (data.metadata || data.data?.metadata) {
        const metadata = data.metadata || data.data?.metadata;
        
        const newState: OracleState = {
          currentStage: metadata.oracleStage || oracleState.currentStage,
          trustLevel: metadata.relationshipMetrics?.trustLevel ?? oracleState.trustLevel,
          stageProgress: metadata.stageProgress ?? oracleState.stageProgress,
          safetyStatus: metadata.safetyStatus || oracleState.safetyStatus,
          sessionCount: metadata.relationshipMetrics?.sessionCount,
          lastInteraction: new Date()
        };
        
        setOracleState(newState);
      }

      // Create message object
      const message: OracleMessage = {
        id: (Date.now() + Math.random()).toString(),
        role: 'assistant',
        content: data.data?.message || data.text || data.message || 'I hear you...',
        timestamp: new Date(),
        metadata: {
          oracleStage: data.metadata?.oracleStage || data.data?.metadata?.oracleStage,
          trustLevel: data.metadata?.relationshipMetrics?.trustLevel || data.data?.metadata?.relationshipMetrics?.trustLevel,
          emotionalState: data.metadata?.emotionalResonance?.dominantEmotion || data.data?.metadata?.emotionalResonance?.dominantEmotion,
          element: data.metadata?.element || data.data?.metadata?.element,
          stageProgress: data.metadata?.stageProgress || data.data?.metadata?.stageProgress,
          relationshipMetrics: data.metadata?.relationshipMetrics || data.data?.metadata?.relationshipMetrics,
          microPsiEmotionalState: data.metadata?.microPsiEmotionalState || data.data?.metadata?.microPsiEmotionalState
        }
      };

      setLastMessage(message);
      return message;

    } catch (err: any) {
      console.error('Oracle communication error:', err);
      const errorMessage = err.message || 'Communication with Oracle failed';
      setError(errorMessage);
      
      // Create error message
      const errorResponse: OracleMessage = {
        id: (Date.now() + Math.random()).toString(),
        role: 'assistant',
        content: 'I need a moment to gather myself. Please try again.',
        timestamp: new Date()
      };
      
      setLastMessage(errorResponse);
      return errorResponse;
      
    } finally {
      setIsLoading(false);
    }
  }, [oracleState]);

  return {
    sendMessage,
    isLoading,
    error,
    oracleState,
    lastMessage,
    clearError
  };
}