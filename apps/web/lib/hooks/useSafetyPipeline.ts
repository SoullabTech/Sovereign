"use client";

import { useState, useCallback } from 'react';

interface SafetyResult {
  action: 'continue' | 'gentle_checkin' | 'lock_session' | 'ask_assessment';
  message?: string;
  riskLevel?: 'none' | 'low' | 'moderate' | 'high';
  confidence?: number;
  recommendedAction?: string;
}

interface SafetyStatus {
  status: 'stable' | 'monitoring' | 'high_risk';
  summary: {
    totalMessages: number;
    highRiskCount: number;
    moderateRiskCount: number;
    activeEscalations: number;
    lastAssessment: any;
  };
  timeRange: number;
}

export function useSafetyPipeline() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processMessage = useCallback(async (
    userId: string,
    message: string,
    messageId?: string
  ): Promise<SafetyResult | null> => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/safety/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message,
          messageId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process message through safety pipeline');
      }

      const result = await response.json();
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown safety processing error';
      setError(errorMessage);
      console.error('Safety processing error:', err);
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  const recordAssessment = useCallback(async (
    userId: string,
    answer: string | number,
    questionId?: string
  ): Promise<boolean> => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/safety/process', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          answer,
          questionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record assessment');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown assessment recording error';
      setError(errorMessage);
      console.error('Assessment recording error:', err);
      return false;
    } finally {
      setProcessing(false);
    }
  }, []);

  const getSafetyStatus = useCallback(async (
    userId: string,
    days: number = 7
  ): Promise<SafetyStatus | null> => {
    try {
      setError(null);

      const response = await fetch(`/api/safety/process?userId=${userId}&days=${days}`);

      if (!response.ok) {
        throw new Error('Failed to fetch safety status');
      }

      const status = await response.json();
      return status;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown status fetch error';
      setError(errorMessage);
      console.error('Safety status error:', err);
      return null;
    }
  }, []);

  return {
    processMessage,
    recordAssessment,
    getSafetyStatus,
    processing,
    error
  };
}

// Hook for growth event tracking
export function useGrowthTracking() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordBreakthrough = useCallback(async (
    userId: string,
    description: string,
    intensity: number = 0.5,
    context?: string,
    themes?: string[]
  ): Promise<boolean> => {
    try {
      setRecording(true);
      setError(null);

      const response = await fetch('/api/dashboard/growth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventType: 'breakthrough_moment',
          data: {
            description,
            intensity,
            context,
            themes,
            metadata: {
              recorded_at: new Date().toISOString(),
              source: 'user_interaction'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record breakthrough moment');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown recording error';
      setError(errorMessage);
      console.error('Breakthrough recording error:', err);
      return false;
    } finally {
      setRecording(false);
    }
  }, []);

  const recordEmotionalPattern = useCallback(async (
    userId: string,
    dominantEmotion: 'fire' | 'water' | 'earth' | 'air',
    scores: {
      fireScore: number;
      waterScore: number;
      earthScore: number;
      airScore: number;
      balanceScore: number;
      sentimentScore: number;
    }
  ): Promise<boolean> => {
    try {
      setRecording(true);
      setError(null);

      const response = await fetch('/api/dashboard/growth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventType: 'emotional_pattern',
          data: {
            dominantEmotion,
            ...scores,
            metadata: {
              recorded_at: new Date().toISOString(),
              source: 'conversation_analysis'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record emotional pattern');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown recording error';
      setError(errorMessage);
      console.error('Emotional pattern recording error:', err);
      return false;
    } finally {
      setRecording(false);
    }
  }, []);

  const recordGrowthMetric = useCallback(async (
    userId: string,
    metricType: 'coherence' | 'emotional_balance' | 'breakthrough_count' | 'engagement' | 'progress_velocity',
    value: number,
    context?: string,
    source: string = 'system_analysis'
  ): Promise<boolean> => {
    try {
      setRecording(true);
      setError(null);

      const response = await fetch('/api/dashboard/growth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventType: 'growth_metric',
          data: {
            metricType,
            value,
            context,
            source,
            metadata: {
              recorded_at: new Date().toISOString()
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record growth metric');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown recording error';
      setError(errorMessage);
      console.error('Growth metric recording error:', err);
      return false;
    } finally {
      setRecording(false);
    }
  }, []);

  return {
    recordBreakthrough,
    recordEmotionalPattern,
    recordGrowthMetric,
    recording,
    error
  };
}