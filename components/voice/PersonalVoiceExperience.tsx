'use client';

/**
 * Personal Voice Experience Analysis & Enhancement
 *
 * What makes voice interactions deeply personal:
 * 1. Vocal tone recognition (emotional state detection)
 * 2. Speaking rhythm and pace matching
 * 3. Conversational memory and context
 * 4. Adaptive response timing
 * 5. Intimate, private feeling vs text
 * 6. Real-time emotional attunement
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VoicePersonalizationConfig {
  // Vocal characteristics detection
  toneAnalysis: {
    energy: 'low' | 'medium' | 'high';
    emotion: 'calm' | 'excited' | 'worried' | 'curious' | 'tired';
    pace: 'slow' | 'normal' | 'fast';
    volume: 'quiet' | 'normal' | 'loud';
  };

  // Conversation style adaptation
  responseStyle: {
    matchPace: boolean;
    mirrorEnergy: boolean;
    pauseDuration: number;
    verbosity: 'concise' | 'moderate' | 'detailed';
  };

  // Daily life integration
  contextAwareness: {
    timeOfDay: string;
    location: 'home' | 'work' | 'transit' | 'outdoors';
    activity: string;
    mood: string;
    availability: 'full_attention' | 'multitasking' | 'brief_moment';
  };

  // Relationship depth
  intimacyLevel: {
    connection: number; // 0-100
    familiarity: number; // 0-100
    trust: number; // 0-100
    vulnerability: number; // 0-100
  };
}

interface PersonalVoiceExperienceProps {
  onConfigUpdate?: (config: VoicePersonalizationConfig) => void;
  className?: string;
}

export function PersonalVoiceExperience({ onConfigUpdate, className = '' }: PersonalVoiceExperienceProps) {
  const [voiceConfig, setVoiceConfig] = useState<VoicePersonalizationConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // What makes voice personal - key factors
  const personalFactors = [
    {
      id: 'tone_matching',
      name: 'Vocal Tone Matching',
      description: 'MAIA matches your emotional tone and energy level',
      impact: 'Creates feeling of being truly heard and understood',
      implementation: 'Real-time audio analysis of pitch, pace, and emotional markers'
    },
    {
      id: 'pause_timing',
      name: 'Natural Pause Timing',
      description: 'Pauses and response timing feel conversational, not robotic',
      impact: 'Creates sense of shared breathing, natural dialogue rhythm',
      implementation: 'Adaptive response delays based on conversation flow'
    },
    {
      id: 'context_memory',
      name: 'Conversational Memory',
      description: 'Remembers what you said earlier, builds on previous exchanges',
      impact: 'Feels like talking to someone who really knows you',
      implementation: 'Session memory + long-term relationship building'
    },
    {
      id: 'vulnerability_safety',
      name: 'Vulnerability Safety',
      description: 'Voice feels more private and intimate than text',
      impact: 'Enables deeper sharing and authentic expression',
      implementation: 'Privacy indicators + safe conversation design'
    },
    {
      id: 'daily_integration',
      name: 'Daily Life Context',
      description: 'Adapts to your current situation and availability',
      impact: 'Feels naturally woven into your life, not an interruption',
      implementation: 'Context-aware response adaptation'
    }
  ];

  // Enhanced voice features for daily integration
  const dailyIntegrationFeatures = [
    {
      name: 'Morning Check-ins',
      trigger: 'time_based',
      description: 'Gentle voice greeting that adapts to your morning energy',
      example: '"Good morning... I can hear you\'re still waking up. Want to share how you\'re feeling as you start today?"'
    },
    {
      name: 'Transition Moments',
      trigger: 'location_change',
      description: 'Supportive voice during daily transitions',
      example: '"I notice you\'re heading to work. What\'s on your mind for today?"'
    },
    {
      name: 'Micro Check-ins',
      trigger: 'stress_detection',
      description: 'Brief voice support when emotional tone shifts',
      example: '"Your voice sounds different... want to pause for a moment?"'
    },
    {
      name: 'Evening Reflection',
      trigger: 'end_of_day',
      description: 'Gentle voice reflection on the day',
      example: '"How was your day? I\'m here if you want to process anything..."'
    }
  ];

  // Voice personalization analyzer
  const analyzeVoicePersonalization = () => {
    setIsAnalyzing(true);

    // Simulate voice analysis (would integrate with actual audio processing)
    setTimeout(() => {
      const mockConfig: VoicePersonalizationConfig = {
        toneAnalysis: {
          energy: 'medium',
          emotion: 'curious',
          pace: 'normal',
          volume: 'normal'
        },
        responseStyle: {
          matchPace: true,
          mirrorEnergy: true,
          pauseDuration: 1200,
          verbosity: 'moderate'
        },
        contextAwareness: {
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
          location: 'home',
          activity: 'reflecting',
          mood: 'open',
          availability: 'full_attention'
        },
        intimacyLevel: {
          connection: 65,
          familiarity: 70,
          trust: 80,
          vulnerability: 60
        }
      };

      setVoiceConfig(mockConfig);
      onConfigUpdate?.(mockConfig);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className={`personal-voice-experience ${className}`}>
      {/* What Makes Voice Personal */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          What Makes Voice Interactions Personal
        </h2>

        <div className="space-y-4">
          {personalFactors.map((factor, index) => (
            <motion.div
              key={factor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-amber-300">{factor.name}</h3>
                <span className="text-xs text-amber-400/60 bg-amber-500/10 px-2 py-1 rounded">
                  Core Factor
                </span>
              </div>

              <p className="text-white/70 text-sm mb-2">{factor.description}</p>

              <div className="text-xs text-white/50 mb-1">
                <strong>Impact:</strong> {factor.impact}
              </div>

              <div className="text-xs text-amber-400/60">
                <strong>How:</strong> {factor.implementation}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Daily Life Integration Features */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          Daily Life Integration Enhancements
        </h2>

        <div className="grid gap-4">
          {dailyIntegrationFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10
                         rounded-lg p-4 border border-emerald-500/20"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-emerald-300">{feature.name}</h3>
                <span className="text-xs text-emerald-400/60 bg-emerald-500/20 px-2 py-1 rounded">
                  {feature.trigger}
                </span>
              </div>

              <p className="text-white/70 text-sm mb-3">{feature.description}</p>

              <div className="bg-black/20 rounded p-2 border-l-2 border-emerald-400/30">
                <p className="text-emerald-200/80 text-xs italic">"{feature.example}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Voice Personalization Analysis */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Current Voice Profile
          </h2>

          <button
            onClick={analyzeVoicePersonalization}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30
                       border border-amber-500/30 rounded-lg text-amber-300
                       text-sm transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Voice Pattern'}
          </button>
        </div>

        {voiceConfig && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Vocal Analysis */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3">Vocal Characteristics</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70 text-sm">Energy Level:</span>
                  <span className="text-amber-300 text-sm">{voiceConfig.toneAnalysis.energy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70 text-sm">Emotional Tone:</span>
                  <span className="text-amber-300 text-sm">{voiceConfig.toneAnalysis.emotion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70 text-sm">Speaking Pace:</span>
                  <span className="text-amber-300 text-sm">{voiceConfig.toneAnalysis.pace}</span>
                </div>
              </div>
            </div>

            {/* Intimacy Levels */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-medium text-white mb-3">Relationship Depth</h3>

              <div className="space-y-3">
                {Object.entries(voiceConfig.intimacyLevel).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 text-sm capitalize">{key}:</span>
                      <span className="text-amber-300 text-sm">{value}%</span>
                    </div>
                    <div className="bg-black/30 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-400 h-1.5 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Implementation Recommendations */}
      <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-6 border border-purple-500/20">
        <h2 className="text-xl font-semibold text-purple-300 mb-4">
          Recommended Enhancements for MAIA
        </h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Voice Memory Integration</p>
              <p className="text-white/70 text-sm">Store voice patterns and conversation history to build deeper familiarity over time</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Context-Aware Triggers</p>
              <p className="text-white/70 text-sm">Integrate with calendar, location, and activity data for natural conversation timing</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Emotional Tone Matching</p>
              <p className="text-white/70 text-sm">Adapt MAIA's voice characteristics to match user's current emotional state</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Micro-Interaction Design</p>
              <p className="text-white/70 text-sm">Create brief, meaningful voice touchpoints throughout the day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced voice interaction patterns for daily integration
export const dailyVoicePatterns = {
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