'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ArchetypeInsight {
  archetype: {
    name: string;
    symbol: string;
    description: string;
    keywords: string[];
    color: string;
    energy: "light" | "shadow" | "neutral";
  };
  confidence: number;
  excerpt: string;
  interpretation: string;
  growthPrompt?: string;
}

interface UseArchetypeInsightsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useArchetypeInsights({ 
  userId, 
  autoRefresh = false, 
  refreshInterval = 60000 
}: UseArchetypeInsightsOptions) {
  const [insights, setInsights] = useState<ArchetypeInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current archetypal patterns
  const fetchInsights = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/insights?userId=${userId}&type=current`);
      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights || []);
      } else {
        setError(data.error || 'Failed to fetch insights');
      }
    } catch (err) {
      setError('Failed to load archetypal insights');
      console.error('Error fetching archetype insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Analyze specific text for archetypes
  const analyzeText = useCallback(async (text: string): Promise<ArchetypeInsight[]> => {
    if (!userId || !text?.trim()) return [];

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId })
      });

      if (!response.ok) throw new Error('Failed to analyze text');
      
      const data = await response.json();
      return data.success ? data.insights || [] : [];
    } catch (err) {
      console.error('Error analyzing text for archetypes:', err);
      return [];
    }
  }, [userId]);

  // Get archetypal journey analysis
  const fetchJourneyAnalysis = useCallback(async () => {
    if (!userId) return null;

    try {
      const response = await fetch(`/api/insights?userId=${userId}&type=journey`);
      if (!response.ok) throw new Error('Failed to fetch journey analysis');
      
      const data = await response.json();
      return data.success ? data.journey : null;
    } catch (err) {
      console.error('Error fetching journey analysis:', err);
      return null;
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchInsights, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchInsights, autoRefresh, refreshInterval]);

  return {
    insights,
    isLoading,
    error,
    refresh: fetchInsights,
    analyzeText,
    fetchJourneyAnalysis
  };
}