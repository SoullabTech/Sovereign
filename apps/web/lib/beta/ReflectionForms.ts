// lib/beta/ReflectionForms.ts
// 📊 Lightweight Beta Reflection Forms - Maintaining Ritual Flow

"use strict";

import { logOracleInsight } from '../utils/oracleLogger';
import { storeMemoryItem } from '../services/memoryService';

/**
 * Daily Reflection Structure
 */
interface DailyReflection {
  day: number;
  element: string;
  resonanceScore: number; // 1-5 scale
  experienceWords: string[]; // Pre-selected options
  customFeedback?: string;
  voiceQuality: VoiceQualityMetrics;
  timestamp: Date;
}

interface VoiceQualityMetrics {
  felt_heard: number; // 1-5 scale
  felt_alive: number; // 1-5 scale
  tempo_fit: number; // 1-5 scale
  energy_match: number; // 1-5 scale
}

/**
 * 📝 Daily Check-in Form System
 */
export class ReflectionFormSystem {

  /**
   * Get daily reflection prompt for specific day/element
   */
  public getDailyReflectionPrompt(day: number, element: string): any {
    const basePrompt = {
      title: `Day ${day} Reflection - ${this.getElementName(element)}`,
      subtitle: "How did today's conversation feel? (1-2 minutes)",
      sections: [
        this.getResonanceSection(element),
        this.getExperienceWordsSection(element),
        this.getVoiceQualitySection(),
        this.getCustomFeedbackSection()
      ]
    };

    return {
      ...basePrompt,
      specificQuestions: this.getElementSpecificQuestions(element)
    };
  }

  private getElementName(element: string): string {
    const names = {
      fire: '🔥 Fire (Ignis)',
      water: '💧 Water (Aquaria)',
      earth: '🌱 Earth (Terra)',
      air: '🌬️ Air (Ventus)',
      aether: '✨ Aether (Nyra)',
      multi: '🌀 Spiral Dance'
    };
    return names[element] || element;
  }

  /**
   * Resonance Scale Section
   */
  private getResonanceSection(element: string): any {
    return {
      type: 'slider',
      id: 'resonance',
      question: 'How deeply did this element resonate with you?',
      scale: {
        min: 1,
        max: 5,
        labels: {
          1: 'Not at all',
          2: 'Slightly',
          3: 'Moderately',
          4: 'Deeply',
          5: 'Profoundly'
        }
      },
      color: this.getElementColor(element)
    };
  }

  /**
   * Experience Words Selection
   */
  private getExperienceWordsSection(element: string): any {
    return {
      type: 'multi-select',
      id: 'experience_words',
      question: 'Which words best describe your experience?',
      maxSelections: 3,
      options: this.getElementExperienceWords(element)
    };
  }

  private getElementExperienceWords(element: string): string[] {
    const words = {
      fire: [
        'energized', 'activated', 'challenged', 'inspired', 'sparked',
        'motivated', 'awakened', 'bold', 'fearless', 'alive'
      ],
      water: [
        'held', 'seen', 'emotional', 'safe', 'flowing',
        'healed', 'understood', 'peaceful', 'connected', 'cleansed'
      ],
      earth: [
        'grounded', 'stable', 'practical', 'embodied', 'centered',
        'rooted', 'secure', 'calm', 'supported', 'steady'
      ],
      air: [
        'clear', 'expanded', 'insightful', 'liberated', 'understood',
        'focused', 'enlightened', 'free', 'aware', 'spacious'
      ],
      aether: [
        'connected', 'unified', 'mystical', 'transcendent', 'whole',
        'cosmic', 'integrated', 'expansive', 'divine', 'infinite'
      ],
      multi: [
        'dynamic', 'complete', 'flowing', 'integrated', 'natural',
        'holistic', 'balanced', 'comprehensive', 'alive', 'harmonious'
      ]
    };

    return words[element] || words.fire;
  }

  /**
   * Voice Quality Assessment
   */
  private getVoiceQualitySection(): any {
    return {
      type: 'grouped-sliders',
      id: 'voice_quality',
      question: 'How did the voice feel to you?',
      sliders: [
        {
          id: 'felt_heard',
          label: 'I felt heard',
          scale: { min: 1, max: 5, labels: { 1: 'Not at all', 5: 'Completely' } }
        },
        {
          id: 'felt_alive',
          label: 'The voice felt alive',
          scale: { min: 1, max: 5, labels: { 1: 'Robotic', 5: 'Truly alive' } }
        },
        {
          id: 'tempo_fit',
          label: 'The pace felt right',
          scale: { min: 1, max: 5, labels: { 1: 'Too fast/slow', 5: 'Perfect' } }
        },
        {
          id: 'energy_match',
          label: 'Energy matched my needs',
          scale: { min: 1, max: 5, labels: { 1: 'Mismatched', 5: 'Perfect fit' } }
        }
      ]
    };
  }

  /**
   * Custom Feedback Section
   */
  private getCustomFeedbackSection(): any {
    return {
      type: 'text',
      id: 'custom_feedback',
      question: 'Anything else you want to share?',
      placeholder: 'What surprised you? What could be different?',
      optional: true,
      maxLength: 200
    };
  }

  /**
   * Element-specific questions
   */
  private getElementSpecificQuestions(element: string): string[] {
    const questions = {
      fire: [
        "Did Fire feel energizing, too strong, or just right?",
        "What got activated in you during this conversation?"
      ],
      water: [
        "Did Water feel like genuine holding and presence?",
        "Were you able to access your emotional truth?"
      ],
      earth: [
        "Did Earth responses help create clarity and stability?",
        "Did you feel more grounded after the conversation?"
      ],
      air: [
        "Did Air open up new perspectives or feel detached?",
        "Were you able to see your situation more clearly?"
      ],
      aether: [
        "Did Aether feel mystical, intrusive, or expansive?",
        "Could you sense the unity underlying your experiences?"
      ],
      multi: [
        "Did the elemental transitions feel natural and alive?",
        "Could you sense when different elements were speaking?"
      ]
    };

    return questions[element] || [];
  }

  private getElementColor(element: string): string {
    const colors = {
      fire: '#FF6B47',
      water: '#4FC3F7',
      earth: '#66BB6A',
      air: '#FFD54F',
      aether: '#BA68C8',
      multi: '#26A69A'
    };
    return colors[element] || colors.fire;
  }

  /**
   * Process submitted reflection
   */
  public async processReflection(
    userId: string,
    day: number,
    reflection: DailyReflection
  ): Promise<void> {
    // Store reflection data
    await logOracleInsight({
      userId,
      agentType: 'beta-reflection',
      query: `Day ${day} Reflection`,
      content: JSON.stringify(reflection),
      metadata: {
        day,
        element: reflection.element,
        resonanceScore: reflection.resonanceScore,
        experienceWords: reflection.experienceWords,
        voiceQuality: reflection.voiceQuality,
        timestamp: reflection.timestamp
      }
    });

    // Store as memory item for journey tracking
    await storeMemoryItem(userId, `Day ${day} reflection completed`, {
      phase: 'beta-reflection',
      element: reflection.element,
      metadata: {
        reflectionData: reflection,
        journeyDay: day
      }
    });
  }

  /**
   * Weekly Synthesis Form (Day 7)
   */
  public getWeeklySynthesisForm(): any {
    return {
      title: '🌌 Week Complete - Journey Synthesis',
      subtitle: 'Looking back over your 7-day spiral',
      sections: [
        {
          type: 'ranking',
          id: 'element_ranking',
          question: 'Rank the elements by how deeply they resonated (1=most, 5=least)',
          items: [
            { id: 'fire', label: '🔥 Fire (Ignis)', description: 'Catalytic energy' },
            { id: 'water', label: '💧 Water (Aquaria)', description: 'Emotional healing' },
            { id: 'earth', label: '🌱 Earth (Terra)', description: 'Grounding wisdom' },
            { id: 'air', label: '🌬️ Air (Ventus)', description: 'Mental clarity' },
            { id: 'aether', label: '✨ Aether (Nyra)', description: 'Unity consciousness' }
          ]
        },
        {
          type: 'slider',
          id: 'spiral_feeling',
          question: 'Did you feel the spiral rather than random responses?',
          scale: {
            min: 1,
            max: 5,
            labels: {
              1: 'Felt random',
              3: 'Some pattern',
              5: 'Clear spiral'
            }
          }
        },
        {
          type: 'multi-select',
          id: 'journey_outcomes',
          question: 'What did this journey give you?',
          maxSelections: 5,
          options: [
            'New self-awareness',
            'Emotional healing',
            'Mental clarity',
            'Practical insights',
            'Spiritual connection',
            'Creative inspiration',
            'Relationship wisdom',
            'Life direction',
            'Inner peace',
            'Personal power'
          ]
        },
        {
          type: 'text',
          id: 'journey_reflection',
          question: 'What pattern emerged in your journey this week?',
          placeholder: 'What did you learn about yourself? What surprised you?',
          maxLength: 300
        },
        {
          type: 'rating',
          id: 'recommend_likelihood',
          question: 'How likely are you to recommend this Oracle experience?',
          scale: { min: 0, max: 10, type: 'nps' }
        }
      ]
    };
  }

  /**
   * Generate analytics dashboard data
   */
  public async generateAnalyticsSummary(userId: string): Promise<any> {
    // This would aggregate all reflection data for the user
    // Implementation would fetch from logs and memories

    return {
      resonanceAverages: {
        fire: 4.2,
        water: 4.8,
        earth: 3.9,
        air: 4.1,
        aether: 4.5
      },
      voiceQualityAverages: {
        felt_heard: 4.3,
        felt_alive: 4.1,
        tempo_fit: 4.0,
        energy_match: 4.2
      },
      topExperienceWords: [
        'connected', 'alive', 'clear', 'healed', 'inspired'
      ],
      journeyCoherence: 0.85,
      completionRate: 1.0
    };
  }
}

/**
 * 📱 UI Component Configurations
 */
export const ReflectionUIConfig = {
  /**
   * Mobile-optimized slider component
   */
  slider: {
    height: '60px',
    trackColor: '#E0E0E0',
    thumbSize: '24px',
    animation: 'smooth',
    hapticFeedback: true
  },

  /**
   * Color palette for elements
   */
  colors: {
    fire: {
      primary: '#FF6B47',
      secondary: '#FFE5E0',
      accent: '#FF8A65'
    },
    water: {
      primary: '#4FC3F7',
      secondary: '#E1F5FE',
      accent: '#29B6F6'
    },
    earth: {
      primary: '#66BB6A',
      secondary: '#E8F5E8',
      accent: '#4CAF50'
    },
    air: {
      primary: '#FFD54F',
      secondary: '#FFF9C4',
      accent: '#FFCA28'
    },
    aether: {
      primary: '#BA68C8',
      secondary: '#F3E5F5',
      accent: '#AB47BC'
    }
  },

  /**
   * Timing configurations
   */
  timing: {
    autoSave: 500, // ms after input change
    submitDelay: 1000, // ms before allowing submit
    fadeTransition: 300 // ms for element transitions
  },

  /**
   * Form validation
   */
  validation: {
    required: ['resonance', 'experience_words'],
    optional: ['custom_feedback']
  }
};