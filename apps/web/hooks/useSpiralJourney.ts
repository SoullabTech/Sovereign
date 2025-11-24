'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SpiralNode {
  sessionId: string;
  phase: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  symbols: string[];
  snippet: string;
  practices: string[];
  timestamp?: string;
  emotionalTone?: string;
  insights?: string[];
}

interface SpiralJourneyData {
  nodes: SpiralNode[];
  elementalBalance: {
    element: string;
    activity: number;
    sessions: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }[];
  currentPhase: string;
  dominantElement: string;
  recommendations: {
    nextPractice: string;
    elementToBalance: string;
    narrativeToExplore: string;
  };
}

export function useSpiralJourney(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();
  const [data, setData] = useState<SpiralJourneyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchSpiralJourney = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await fetch(
          `/api/spiral-journey/${user.id}?${params.toString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch spiral journey data');
        }

        const result = await response.json();
        
        if (result.success && result.journey) {
          // Transform backend data to frontend format
          const transformedNodes: SpiralNode[] = result.journey.spiralPoints.map((point: any) => ({
            sessionId: point.sessionId,
            phase: point.phase,
            element: point.element,
            symbols: point.symbols || [],
            snippet: point.content,
            practices: point.practice ? [
              point.practice.ritual,
              point.practice.therapeutic
            ].filter(Boolean) : [],
            timestamp: point.timestamp,
            emotionalTone: point.sentiment,
            insights: point.journalExcerpt ? [point.journalExcerpt] : []
          }));

          setData({
            nodes: transformedNodes,
            elementalBalance: result.journey.elementalBalance,
            currentPhase: result.journey.currentPhase,
            dominantElement: result.journey.dominantElement,
            recommendations: result.journey.recommendations
          });
        }
      } catch (err) {
        console.error('[useSpiralJourney] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSpiralJourney();
  }, [user?.id, startDate?.toISOString(), endDate?.toISOString()]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      if (user?.id) {
        // Trigger re-fetch by updating deps
        setData(null);
      }
    }
  };
}

// Hook for current spiral status
export function useSpiralStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    currentPhase: string;
    dominantElement: string;
    recommendations: any;
    recentSessions: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStatus = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/spiral-journey/${user.id}/current`, {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStatus(result);
          }
        }
      } catch (err) {
        console.error('[useSpiralStatus] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user?.id]);

  return { status, loading };
}