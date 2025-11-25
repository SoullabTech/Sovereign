/**
 * Voice Personalization Hook
 *
 * Integrates Tolan-inspired voice personalization insights with MAIA's existing voice system
 * Provides daily life integration patterns and contextual voice adaptation
 */

import { useState, useEffect, useCallback } from 'react';
// Import the daily voice patterns - defined inline to avoid circular dependency
const dailyVoicePatterns = {
  morning: {
    greeting: "gentle energy matching",
    topics: ["intentions", "energy_check", "day_preview"],
    duration: "2-3 minutes",
    tone: "warm, encouraging"
  },
  midday: {
    check_in: "brief and supportive",
    topics: ["progress_check", "stress_relief", "clarity"],
    duration: "1-2 minutes",
    tone: "understanding, practical"
  },
  evening: {
    reflection: "calm and processing",
    topics: ["day_review", "gratitude", "preparation"],
    duration: "3-5 minutes",
    tone: "reflective, peaceful"
  },
  transition_moments: {
    triggers: ["leaving_home", "arriving_work", "commute", "before_sleep"],
    style: "contextual support",
    duration: "30-60 seconds",
    tone: "present, grounding"
  }
};

interface VoicePersonalizationConfig {
  toneAnalysis: {
    energy: 'low' | 'medium' | 'high';
    emotion: 'calm' | 'excited' | 'worried' | 'curious' | 'tired';
    pace: 'slow' | 'normal' | 'fast';
    volume: 'quiet' | 'normal' | 'loud';
  };
  responseStyle: {
    matchPace: boolean;
    mirrorEnergy: boolean;
    pauseDuration: number;
    verbosity: 'concise' | 'moderate' | 'detailed';
  };
  contextAwareness: {
    timeOfDay: string;
    location: 'home' | 'work' | 'transit' | 'outdoors';
    activity: string;
    mood: string;
    availability: 'full_attention' | 'multitasking' | 'brief_moment';
  };
  intimacyLevel: {
    connection: number; // 0-100
    familiarity: number; // 0-100
    trust: number; // 0-100
    vulnerability: number; // 0-100
  };
}

interface VoicePersonalization {
  config: VoicePersonalizationConfig | null;
  isAnalyzing: boolean;
  dailyPattern: typeof dailyVoicePatterns[keyof typeof dailyVoicePatterns] | null;
  updateConfig: (updates: Partial<VoicePersonalizationConfig>) => void;
  analyzeCurrentContext: () => Promise<void>;
  getContextualGreeting: () => string;
  getResponseStyle: () => object;
  getDailyIntegrationTrigger: () => string | null;
}

export function useVoicePersonalization(
  userId?: string,
  userName?: string,
  selectedVoice?: string
): VoicePersonalization {
  const [config, setConfig] = useState<VoicePersonalizationConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dailyPattern, setDailyPattern] = useState<typeof dailyVoicePatterns[keyof typeof dailyVoicePatterns] | null>(null);

  // Load saved personalization config
  useEffect(() => {
    const savedConfig = localStorage.getItem(`voice_personalization_${userId}`);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        console.log('🎵 Voice personalization loaded for', userName);
      } catch (e) {
        console.error('Error loading voice personalization:', e);
      }
    }
  }, [userId, userName]);

  // Update current daily pattern based on time
  useEffect(() => {
    const updateDailyPattern = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setDailyPattern(dailyVoicePatterns.morning);
      } else if (hour >= 12 && hour < 17) {
        setDailyPattern(dailyVoicePatterns.midday);
      } else if (hour >= 17 && hour < 22) {
        setDailyPattern(dailyVoicePatterns.evening);
      } else {
        setDailyPattern(dailyVoicePatterns.transition_moments);
      }
    };

    updateDailyPattern();
    const interval = setInterval(updateDailyPattern, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(interval);
  }, []);

  const updateConfig = useCallback((updates: Partial<VoicePersonalizationConfig>) => {
    setConfig(prev => {
      if (!prev) return null;

      const newConfig = { ...prev, ...updates };

      // Save to localStorage
      localStorage.setItem(`voice_personalization_${userId}`, JSON.stringify(newConfig));

      console.log('🎵 Voice personalization updated:', updates);
      return newConfig;
    });
  }, [userId]);

  const analyzeCurrentContext = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Get current context
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      // Analyze user's typical patterns (could be enhanced with actual audio analysis)
      const contextConfig: VoicePersonalizationConfig = {
        toneAnalysis: {
          energy: hour < 10 || hour > 20 ? 'low' : hour < 14 ? 'medium' : 'high',
          emotion: 'curious',
          pace: 'normal',
          volume: 'normal'
        },
        responseStyle: {
          matchPace: true,
          mirrorEnergy: true,
          pauseDuration: 1200,
          verbosity: timeOfDay === 'evening' ? 'detailed' : 'moderate'
        },
        contextAwareness: {
          timeOfDay,
          location: 'home',
          activity: timeOfDay === 'morning' ? 'starting day' :
                   timeOfDay === 'afternoon' ? 'working' : 'reflecting',
          mood: 'open',
          availability: 'full_attention'
        },
        intimacyLevel: {
          connection: config?.intimacyLevel?.connection || 50,
          familiarity: Math.min((config?.intimacyLevel?.familiarity || 30) + 5, 100),
          trust: Math.min((config?.intimacyLevel?.trust || 40) + 3, 100),
          vulnerability: config?.intimacyLevel?.vulnerability || 30
        }
      };

      setConfig(contextConfig);
      localStorage.setItem(`voice_personalization_${userId}`, JSON.stringify(contextConfig));

    } catch (error) {
      console.error('Error analyzing voice context:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [config, userId]);

  const getContextualGreeting = useCallback(() => {
    if (!config || !dailyPattern) {
      return "Hello! I'm here and ready to connect with you.";
    }

    const { timeOfDay, mood } = config.contextAwareness;
    const { connection } = config.intimacyLevel;

    // Generate personalized greeting based on context
    if (timeOfDay === 'morning') {
      if (connection > 70) {
        return "Good morning... I can sense you're still settling into the day. How are you feeling as you wake up?";
      } else {
        return "Good morning! What's alive in you as you start this new day?";
      }
    } else if (timeOfDay === 'afternoon') {
      return connection > 60
        ? "How has your day been flowing? I'm here if you want to pause and check in..."
        : "Hello! Want to take a moment to see how you're doing right now?";
    } else {
      return connection > 70
        ? "Good evening... ready to slow down and reflect on what this day has brought?"
        : "Evening... how are you as this day comes to a close?";
    }
  }, [config, dailyPattern]);

  const getResponseStyle = useCallback(() => {
    if (!config) {
      return {
        voice: selectedVoice || 'shimmer',
        speed: 1.0,
        pauseDuration: 1000
      };
    }

    const { responseStyle, toneAnalysis, intimacyLevel } = config;

    return {
      voice: selectedVoice || 'shimmer',
      speed: toneAnalysis.pace === 'slow' ? 0.9 : toneAnalysis.pace === 'fast' ? 1.1 : 1.0,
      pauseDuration: responseStyle.pauseDuration,
      verbosity: responseStyle.verbosity,
      intimacyModifier: intimacyLevel.connection / 100,
      energyMatch: responseStyle.mirrorEnergy ? toneAnalysis.energy : 'medium'
    };
  }, [config, selectedVoice]);

  const getDailyIntegrationTrigger = useCallback(() => {
    if (!config || !dailyPattern) return null;

    const { timeOfDay, availability } = config.contextAwareness;
    const { connection } = config.intimacyLevel;

    // Suggest daily integration moments based on context and relationship depth
    if (timeOfDay === 'morning' && availability === 'full_attention' && connection > 60) {
      return "Would you like a gentle morning check-in to set intentions for the day?";
    }

    if (timeOfDay === 'afternoon' && connection > 50) {
      return "Want to pause for a brief midday reset?";
    }

    if (timeOfDay === 'evening' && connection > 70) {
      return "Ready for some evening reflection and integration?";
    }

    return null;
  }, [config, dailyPattern]);

  return {
    config,
    isAnalyzing,
    dailyPattern,
    updateConfig,
    analyzeCurrentContext,
    getContextualGreeting,
    getResponseStyle,
    getDailyIntegrationTrigger
  };
}

// Helper function to enhance OracleConversation with voice personalization
export function enhanceWithVoicePersonalization(
  conversationProps: any,
  personalization: VoicePersonalization
) {
  if (!personalization.config) return conversationProps;

  const contextualGreeting = personalization.getContextualGreeting();
  const responseStyle = personalization.getResponseStyle();
  const dailyTrigger = personalization.getDailyIntegrationTrigger();

  return {
    ...conversationProps,
    voicePersonalization: {
      greeting: contextualGreeting,
      style: responseStyle,
      dailyTrigger,
      config: personalization.config
    },
    systemPrompt: `${conversationProps.systemPrompt || ''}\n
VOICE PERSONALIZATION ACTIVE:
- User connection level: ${personalization.config.intimacyLevel.connection}%
- Current time context: ${personalization.config.contextAwareness.timeOfDay}
- Preferred pace: ${personalization.config.toneAnalysis.pace}
- Emotional state: ${personalization.config.toneAnalysis.emotion}
- Response verbosity: ${personalization.config.responseStyle.verbosity}

Adapt your responses to match the user's current context and relationship depth.
${dailyTrigger ? `\nSuggest: ${dailyTrigger}` : ''}`
  };
}