/**
 * useInsightTracking Hook
 *
 * Non-intrusive hook that processes content for insights in the background.
 * Call this AFTER saving journal entries, conversations, or chat messages.
 *
 * This runs asynchronously and never blocks the UI or disrupts MAIA.
 */

import { useCallback } from 'react';
import { InsightContext, Element } from '../services/UnifiedInsightEngine';

interface UseInsightTrackingOptions {
  userId?: string;
  enabled?: boolean;  // Set to false to disable tracking
}

export function useInsightTracking(options: UseInsightTrackingOptions = {}) {
  const { userId, enabled = true } = options;

  /**
   * Track content for insights
   * Call this after saving journal/conversation/chat
   */
  const trackInsights = useCallback(async (
    content: string,
    context: InsightContext,
    metadata?: {
      element?: Element;
      emotionalTone?: string;
      sessionId?: string;
      date?: Date;
    }
  ) => {
    if (!enabled || !userId) {
      return; // Silently skip if disabled or no userId
    }

    try {
      // Fire and forget - this runs in background
      fetch('/api/insights/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          context,
          userId,
          metadata: {
            ...metadata,
            date: metadata?.date?.toISOString()
          }
        })
      }).catch(error => {
        // Log but don't throw - this is background work
        console.warn('Background insight tracking failed:', error);
      });
    } catch (error) {
      console.warn('Failed to initiate insight tracking:', error);
    }
  }, [userId, enabled]);

  /**
   * Get user's insights
   */
  const getInsights = useCallback(async (convergingOnly: boolean = false) => {
    if (!userId) return null;

    try {
      const response = await fetch(
        `/api/insights/user?userId=${userId}&converging=${convergingOnly}`
      );

      if (!response.ok) throw new Error('Failed to fetch insights');

      const data = await response.json();
      return data.insights;
    } catch (error) {
      console.error('Error fetching insights:', error);
      return null;
    }
  }, [userId]);

  /**
   * Get latest Spiral Report
   */
  const getSpiralReport = useCallback(async () => {
    if (!userId) return null;

    try {
      const response = await fetch(`/api/insights/spiral-report?userId=${userId}`);

      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch Spiral Report');

      const data = await response.json();
      return data.report;
    } catch (error) {
      console.error('Error fetching Spiral Report:', error);
      return null;
    }
  }, [userId]);

  /**
   * Generate a new Spiral Report
   */
  const generateSpiralReport = useCallback(async (
    periodStart?: Date,
    periodEnd?: Date
  ) => {
    if (!userId) return null;

    try {
      const response = await fetch('/api/insights/spiral-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          periodStart: periodStart?.toISOString(),
          periodEnd: periodEnd?.toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to generate Spiral Report');

      const data = await response.json();
      return data.report;
    } catch (error) {
      console.error('Error generating Spiral Report:', error);
      return null;
    }
  }, [userId]);

  return {
    trackInsights,
    getInsights,
    getSpiralReport,
    generateSpiralReport
  };
}

/**
 * Example Usage:
 *
 * // In a journal component
 * const { trackInsights } = useInsightTracking({ userId });
 *
 * const handleSaveJournal = async (entry: string) => {
 *   // Save journal entry first
 *   await saveJournalEntry(entry);
 *
 *   // Then track insights (non-blocking)
 *   trackInsights(entry, 'journal', {
 *     element: 'water',
 *     emotionalTone: 'reflective',
 *     date: new Date()
 *   });
 * };
 *
 * // In a conversation component
 * const handleConversationEnd = async (messages: Message[]) => {
 *   const fullConversation = messages.map(m => m.text).join('\n\n');
 *
 *   // Track the entire conversation
 *   trackInsights(fullConversation, 'conversation', {
 *     sessionId: conversationId,
 *     date: new Date()
 *   });
 * };
 *
 * // View converging insights
 * const { getInsights } = useInsightTracking({ userId });
 *
 * const loadConvergingInsights = async () => {
 *   const insights = await getInsights(true); // converging only
 *   console.log('Ready for integration:', insights);
 * };
 *
 * // Generate weekly report
 * const { generateSpiralReport } = useInsightTracking({ userId });
 *
 * const createWeeklyReport = async () => {
 *   const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
 *   const report = await generateSpiralReport(weekAgo, new Date());
 *   console.log('Spiral synthesis:', report.synthesis);
 * };
 */
