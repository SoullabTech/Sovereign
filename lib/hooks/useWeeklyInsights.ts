import { useState, useEffect } from "react";
import { useUser } from "@/lib/supabase";
import { weeklyInsightService } from "@/lib/services/longitudinal/WeeklyInsightService";
import { WeeklyInsight } from "@/lib/spiralogic/types/LongitudinalTypes";
import { useFeatureFlag } from "./useFeatureFlag";

/**
 * Hook to fetch and manage weekly insights
 */
export function useWeeklyInsights() {
  const user = useUser();
  const isEnabled = useFeatureFlag("WEEKLY_INSIGHTS");
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [currentInsight, setCurrentInsight] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch historical insights
  useEffect(() => {
    if (!isEnabled || !user?.id) return;

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await weeklyInsightService.getInsightHistory(user.id);
        setInsights(history);

        // Set most recent as current
        if (history.length > 0) {
          setCurrentInsight(history[0]);
        }
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Failed to load weekly insights");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user?.id, isEnabled]);

  // Generate new insight
  const generateNewInsight = async () => {
    if (!isEnabled || !user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const newInsight = await weeklyInsightService.generateWeeklyInsight(user.id);

      if (newInsight) {
        setCurrentInsight(newInsight);
        setInsights(prev => [newInsight, ...prev]);
      }

      return newInsight;
    } catch (err) {
      console.error("Error generating insight:", err);
      setError("Failed to generate weekly insight");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    insights,
    currentInsight,
    loading,
    error,
    generateNewInsight,
    isEnabled
  };
}

/**
 * Hook to check if it's time for a weekly insight
 */
export function useWeeklyInsightTiming() {
  const user = useUser();
  const isEnabled = useFeatureFlag("WEEKLY_INSIGHTS");
  const [shouldPrompt, setShouldPrompt] = useState(false);

  useEffect(() => {
    if (!isEnabled || !user?.id) return;

    const checkTiming = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();

      // Sunday evening (6-9 PM) or Monday morning (7-10 AM)
      const isSundayEvening = dayOfWeek === 0 && hour >= 18 && hour <= 21;
      const isMondayMorning = dayOfWeek === 1 && hour >= 7 && hour <= 10;

      setShouldPrompt(isSundayEvening || isMondayMorning);
    };

    // Check immediately
    checkTiming();

    // Check every hour
    const interval = setInterval(checkTiming, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id, isEnabled]);

  return shouldPrompt;
}