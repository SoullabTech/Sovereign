/**
 * ExplicitnessDial™ Component
 * Calibrates Maya's communication directness based on user evolution level
 * Part of the Protection-as-Wisdom Framework™
 *
 * Proprietary technology of Maya consciousness platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ExplicitnessConfig {
  level: 1 | 2 | 3 | 4 | 5;
  percentage: number;
  style: {
    directness: 'minimal' | 'gentle' | 'balanced' | 'clear' | 'direct';
    metaphorDensity: 'high' | 'medium-high' | 'medium' | 'medium-low' | 'low';
    questionRatio: number; // Ratio of questions to statements
    validationFrequency: 'constant' | 'frequent' | 'moderate' | 'occasional' | 'rare';
    challengeIntensity: 'none' | 'soft' | 'moderate' | 'engaged' | 'peer';
  };
}

interface ExplicitnessDialProps {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  onAdjustment?: (config: ExplicitnessConfig) => void;
  showVisual?: boolean;
  className?: string;
}

// Explicitness configurations for each level
const LEVEL_CONFIGS: Record<1 | 2 | 3 | 4 | 5, ExplicitnessConfig> = {
  1: {
    level: 1,
    percentage: 20,
    style: {
      directness: 'minimal',
      metaphorDensity: 'high',
      questionRatio: 0.1, // 10% questions, 90% statements
      validationFrequency: 'constant',
      challengeIntensity: 'none'
    }
  },
  2: {
    level: 2,
    percentage: 35,
    style: {
      directness: 'gentle',
      metaphorDensity: 'medium-high',
      questionRatio: 0.25,
      validationFrequency: 'frequent',
      challengeIntensity: 'soft'
    }
  },
  3: {
    level: 3,
    percentage: 50,
    style: {
      directness: 'balanced',
      metaphorDensity: 'medium',
      questionRatio: 0.4,
      validationFrequency: 'moderate',
      challengeIntensity: 'moderate'
    }
  },
  4: {
    level: 4,
    percentage: 65,
    style: {
      directness: 'clear',
      metaphorDensity: 'medium-low',
      questionRatio: 0.3,
      validationFrequency: 'occasional',
      challengeIntensity: 'engaged'
    }
  },
  5: {
    level: 5,
    percentage: 80,
    style: {
      directness: 'direct',
      metaphorDensity: 'low',
      questionRatio: 0.5, // Peer dialogue
      validationFrequency: 'rare',
      challengeIntensity: 'peer'
    }
  }
};

export const ExplicitnessDial: React.FC<ExplicitnessDialProps> = ({
  currentLevel,
  onAdjustment,
  showVisual = false,
  className
}) => {
  const [config, setConfig] = useState<ExplicitnessConfig>(LEVEL_CONFIGS[currentLevel]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentLevel !== config.level) {
      setIsTransitioning(true);
      const newConfig = LEVEL_CONFIGS[currentLevel];

      // Smooth transition between levels
      setTimeout(() => {
        setConfig(newConfig);
        onAdjustment?.(newConfig);
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentLevel]);

  if (!showVisual) {
    return null;
  }

  return (
    <div className={cn('explicitness-dial', className)}>
      <div className="dial-container relative w-48 h-48">
        {/* Dial Background */}
        <svg className="absolute inset-0 w-full h-full">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress Arc */}
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${(config.percentage / 100) * 502.65} 502.65`}
            strokeLinecap="round"
            transform="rotate(-90 96 96)"
            className={cn(
              'transition-all duration-500',
              isTransitioning ? 'text-amber-400' : 'text-amber-600'
            )}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold">{config.percentage}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Level {config.level}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {config.style.directness}
          </div>
        </div>
      </div>

      {/* Style Indicators */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Metaphor:</span>
          <span className="font-medium">{config.style.metaphorDensity}</span>
        </div>
        <div className="flex justify-between">
          <span>Questions:</span>
          <span className="font-medium">{Math.round(config.style.questionRatio * 100)}%</span>
        </div>
        <div className="flex justify-between">
          <span>Validation:</span>
          <span className="font-medium">{config.style.validationFrequency}</span>
        </div>
        <div className="flex justify-between">
          <span>Challenge:</span>
          <span className="font-medium">{config.style.challengeIntensity}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook to use explicitness configuration in responses
 */
export const useExplicitness = (level: 1 | 2 | 3 | 4 | 5) => {
  const config = LEVEL_CONFIGS[level];

  const calibrateResponse = (response: string): string => {
    // This would be integrated with the AI response generation
    // For now, returns the response as-is
    return response;
  };

  const shouldAskQuestion = (): boolean => {
    return Math.random() < config.style.questionRatio;
  };

  const shouldValidate = (): boolean => {
    const frequencies = {
      'constant': 0.9,
      'frequent': 0.7,
      'moderate': 0.5,
      'occasional': 0.3,
      'rare': 0.1
    };
    return Math.random() < frequencies[config.style.validationFrequency];
  };

  const getChallengeLevel = (): number => {
    const levels = {
      'none': 0,
      'soft': 0.25,
      'moderate': 0.5,
      'engaged': 0.75,
      'peer': 1.0
    };
    return levels[config.style.challengeIntensity];
  };

  return {
    config,
    calibrateResponse,
    shouldAskQuestion,
    shouldValidate,
    getChallengeLevel
  };
};

/**
 * Response calibration examples by level
 */
export const ResponseExamples = {
  1: {
    direct: "Your protection makes sense.",
    metaphorical: "Like a shell protects the growing seed within.",
    question: null, // Rarely asks questions at this level
    validation: "That's completely understandable.",
    challenge: null // No challenge at this level
  },
  2: {
    direct: "You're starting to see the pattern.",
    metaphorical: "The pattern reveals itself like morning mist clearing.",
    question: "What do you notice about that?",
    validation: "Your awareness is growing.",
    challenge: "There might be more here to explore."
  },
  3: {
    direct: "This protection served you once. Does it still?",
    metaphorical: "Old armor can become tomorrow's prison.",
    question: "What would happen if you tried something different?",
    validation: "Your curiosity is brave.",
    challenge: "You could experiment with letting that go."
  },
  4: {
    direct: "You're transforming this pattern into conscious choice.",
    metaphorical: "The river chooses its path now.",
    question: "How does this new way feel in your body?",
    validation: "This integration is profound.",
    challenge: "What if you trusted this new pattern completely?"
  },
  5: {
    direct: "You've integrated this wisdom. Now you can teach it.",
    metaphorical: null, // Minimal metaphor at this level
    question: "How would you guide someone through this?",
    validation: null, // Rare validation at peer level
    challenge: "Your experience could transform others."
  }
};

export default ExplicitnessDial;