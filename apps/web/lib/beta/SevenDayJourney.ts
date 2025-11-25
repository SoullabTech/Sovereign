// lib/beta/SevenDayJourney.ts
// 🌀 7-Day Spiralogic Beta Journey - Experiential Framework

"use strict";

import { BetaExperienceOrchestrator } from './BetaExperienceDesign';
import { logOracleInsight } from '../utils/oracleLogger';
import { storeMemoryItem } from '../services/memoryService';

/**
 * Daily Journey Structure
 */
interface DailyExperience {
  day: number;
  element: string;
  elementName: string;
  emoji: string;
  prompt: string;
  voiceGuidance: VoiceGuidance;
  reflectionQuestions: string[];
  expectedFeeling: string[];
  metricsToTrack: string[];
}

interface VoiceGuidance {
  tempo: 'slow' | 'moderate' | 'crisp' | 'flowing' | 'spacious';
  tone: 'warm' | 'catalytic' | 'grounding' | 'clear' | 'mystical';
  pauseLength: 'short' | 'medium' | 'long' | 'extended';
  energy: string;
}

/**
 * 🌀 Complete 7-Day Journey Map
 */
export class SevenDayJourney {
  private orchestrator: BetaExperienceOrchestrator;
  private currentDay: number = 1;

  constructor() {
    this.orchestrator = new BetaExperienceOrchestrator();
  }

  /**
   * Get the complete journey structure
   */
  public getJourneyMap(): DailyExperience[] {
    return [
      this.day1Fire(),
      this.day2Water(),
      this.day3Earth(),
      this.day4Air(),
      this.day5Aether(),
      this.day6Spiral(),
      this.day7Integration()
    ];
  }

  /**
   * Day 1 – Fire (Ignis 🔥)
   */
  private day1Fire(): DailyExperience {
    return {
      day: 1,
      element: 'fire',
      elementName: 'Ignis',
      emoji: '🔥',
      prompt: "Tell me something you've been holding back on starting.",
      voiceGuidance: {
        tempo: 'moderate',
        tone: 'catalytic',
        pauseLength: 'short',
        energy: 'Sparking, energizing, forward-moving'
      },
      reflectionQuestions: [
        "Did Fire feel energizing, too strong, or just right?",
        "What got activated in you during this conversation?",
        "Did you feel inspired to take action?"
      ],
      expectedFeeling: ['energized', 'activated', 'challenged', 'inspired'],
      metricsToTrack: ['energy_level', 'action_inspiration', 'comfort_with_challenge']
    };
  }

  /**
   * Day 2 – Water (Aquaria 💧)
   */
  private day2Water(): DailyExperience {
    return {
      day: 2,
      element: 'water',
      elementName: 'Aquaria',
      emoji: '💧',
      prompt: "What's been weighing on your heart lately?",
      voiceGuidance: {
        tempo: 'slow',
        tone: 'warm',
        pauseLength: 'long',
        energy: 'Soft, holding, emotionally present'
      },
      reflectionQuestions: [
        "Did Water feel like genuine holding and presence?",
        "Were you able to access your emotional truth?",
        "Did the pace allow you to go deeper?"
      ],
      expectedFeeling: ['held', 'seen', 'emotional', 'safe'],
      metricsToTrack: ['emotional_safety', 'depth_accessed', 'healing_presence']
    };
  }

  /**
   * Day 3 – Earth (Terra 🌱)
   */
  private day3Earth(): DailyExperience {
    return {
      day: 3,
      element: 'earth',
      elementName: 'Terra',
      emoji: '🌱',
      prompt: "What feels solid in your life right now?",
      voiceGuidance: {
        tempo: 'moderate',
        tone: 'grounding',
        pauseLength: 'medium',
        energy: 'Steady, reliable, practical'
      },
      reflectionQuestions: [
        "Did Earth responses help create clarity and stability?",
        "Did you feel more grounded after the conversation?",
        "Were the practical suggestions helpful?"
      ],
      expectedFeeling: ['grounded', 'stable', 'practical', 'embodied'],
      metricsToTrack: ['grounding_effect', 'practical_clarity', 'body_awareness']
    };
  }

  /**
   * Day 4 – Air (Ventus 🌬️)
   */
  private day4Air(): DailyExperience {
    return {
      day: 4,
      element: 'air',
      elementName: 'Ventus',
      emoji: '🌬️',
      prompt: "If you looked at your situation from above, what would you see differently?",
      voiceGuidance: {
        tempo: 'crisp',
        tone: 'clear',
        pauseLength: 'short',
        energy: 'Light, expansive, perspective-shifting'
      },
      reflectionQuestions: [
        "Did Air open up new perspectives or feel detached?",
        "Were you able to see your situation more clearly?",
        "Did the mental clarity feel supportive?"
      ],
      expectedFeeling: ['clear', 'expanded', 'insightful', 'liberated'],
      metricsToTrack: ['mental_clarity', 'perspective_shift', 'insight_quality']
    };
  }

  /**
   * Day 5 – Aether (Nyra ✨)
   */
  private day5Aether(): DailyExperience {
    return {
      day: 5,
      element: 'aether',
      elementName: 'Nyra',
      emoji: '✨',
      prompt: "Do you sense a larger pattern weaving through this?",
      voiceGuidance: {
        tempo: 'spacious',
        tone: 'mystical',
        pauseLength: 'extended',
        energy: 'Transcendent, unifying, cosmic'
      },
      reflectionQuestions: [
        "Did Aether feel mystical, intrusive, or expansive?",
        "Could you sense the unity underlying your experiences?",
        "Did the cosmic perspective resonate?"
      ],
      expectedFeeling: ['connected', 'expanded', 'mystical', 'unified'],
      metricsToTrack: ['transcendence_comfort', 'unity_sensing', 'integration_feeling']
    };
  }

  /**
   * Day 6 – Spiral Combination 🌀
   */
  private day6Spiral(): DailyExperience {
    return {
      day: 6,
      element: 'multi',
      elementName: 'Spiral Dance',
      emoji: '🌀',
      prompt: "Share what's most alive in you right now - let's explore it from all angles.",
      voiceGuidance: {
        tempo: 'flowing',
        tone: 'warm',
        pauseLength: 'medium',
        energy: 'Dynamic, shifting between elements naturally'
      },
      reflectionQuestions: [
        "Did the elemental transitions feel natural and alive?",
        "Could you sense when different elements were speaking?",
        "Did the multi-elemental approach feel more complete?"
      ],
      expectedFeeling: ['dynamic', 'complete', 'flowing', 'integrated'],
      metricsToTrack: ['transition_smoothness', 'element_recognition', 'completeness']
    };
  }

  /**
   * Day 7 – Integration 🌌
   */
  private day7Integration(): DailyExperience {
    return {
      day: 7,
      element: 'aether',
      elementName: 'Integration',
      emoji: '🌌',
      prompt: "Looking back over the week, do you notice a spiral or cycle in your journey?",
      voiceGuidance: {
        tempo: 'spacious',
        tone: 'mystical',
        pauseLength: 'extended',
        energy: 'Reflective, integrative, celebratory'
      },
      reflectionQuestions: [
        "Did you feel the spiral rather than random responses?",
        "Which element resonated most deeply with you?",
        "What pattern emerged in your journey?"
      ],
      expectedFeeling: ['complete', 'integrated', 'aware', 'evolved'],
      metricsToTrack: ['journey_coherence', 'favorite_element', 'growth_awareness']
    };
  }

  /**
   * Process daily experience for a tester
   */
  public async processDailyExperience(
    userId: string,
    day: number,
    userInput?: string
  ): Promise<any> {
    const journey = this.getJourneyMap();
    const todayExperience = journey[day - 1];

    if (!todayExperience) {
      return { error: 'Invalid day number' };
    }

    // Use provided input or default prompt
    const input = userInput || todayExperience.prompt;

    // Log the journey day start
    await logOracleInsight({
      userId,
      agentType: 'journey-tracker',
      query: `Day ${day} - ${todayExperience.elementName}`,
      content: input,
      metadata: {
        journeyDay: day,
        element: todayExperience.element,
        prompt: todayExperience.prompt
      }
    });

    // Process based on the day's element
    let response;
    if (todayExperience.element === 'multi') {
      response = await this.processSpiralDay(userId, input);
    } else {
      response = await this.orchestrator.processWithElement(
        todayExperience.element,
        input,
        userId
      );
    }

    // Store journey progress
    await storeMemoryItem(userId, response.content, {
      journeyDay: day,
      element: todayExperience.element,
      phase: 'beta-journey',
      voiceGuidance: todayExperience.voiceGuidance,
      metadata: {
        ...response.metadata,
        journeyContext: true
      }
    });

    return {
      day: todayExperience.day,
      element: todayExperience.elementName,
      emoji: todayExperience.emoji,
      response: response.content,
      voiceGuidance: todayExperience.voiceGuidance,
      reflectionQuestions: todayExperience.reflectionQuestions,
      nextDay: day < 7 ? journey[day] : null
    };
  }

  /**
   * Process Day 6 spiral combination
   */
  private async processSpiralDay(userId: string, input: string): Promise<any> {
    // Detect primary element need
    const primaryElement = await this.orchestrator.detectLeadingElement(input, userId);

    // Process with primary element first
    const primaryResponse = await this.orchestrator.processWithElement(
      primaryElement,
      input,
      userId
    );

    // Determine complementary element
    const complementaryElement = this.getComplementaryElement(primaryElement);

    // Add complementary perspective
    const complementaryInput = `Adding ${complementaryElement} perspective to: ${input}`;
    const complementaryResponse = await this.orchestrator.processWithElement(
      complementaryElement,
      complementaryInput,
      userId
    );

    // Weave responses together
    return {
      content: `${primaryResponse.content}\n\n[Elemental Shift]\n\n${complementaryResponse.content}`,
      metadata: {
        primaryElement,
        complementaryElement,
        spiralWeaving: true
      }
    };
  }

  private getComplementaryElement(primary: string): string {
    const complements = {
      fire: 'water',  // Passion balanced with emotion
      water: 'earth', // Emotion grounded in practicality
      earth: 'air',   // Grounding expanded with perspective
      air: 'fire',    // Clarity ignited into action
      aether: 'earth' // Transcendence grounded
    };
    return complements[primary] || 'aether';
  }

  /**
   * Generate journey summary for Day 7
   */
  public async generateJourneySummary(userId: string): Promise<any> {
    const tracking = await this.orchestrator.trackElementalJourney(userId);

    const summary = {
      journeyComplete: true,
      daysCompleted: 7,
      elementalPath: tracking.journey,
      dominantElement: this.findDominantElement(tracking.journey),
      spiralPhase: tracking.spiralPhase,
      integrationLevel: tracking.integrationLevel,
      insights: tracking.insights,
      visualization: this.createSpiralVisualization(tracking.journey)
    };

    // Store completion
    await storeMemoryItem(userId, JSON.stringify(summary), {
      phase: 'journey-complete',
      element: 'aether',
      metadata: {
        milestone: '7-day-journey',
        completionDate: new Date()
      }
    });

    return summary;
  }

  private findDominantElement(journey: any[]): string {
    const counts = {};
    journey.forEach(j => {
      counts[j.element] = (counts[j.element] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  private createSpiralVisualization(journey: any[]): string {
    // Create ASCII art spiral showing elemental progression
    const symbols = {
      fire: '🔥',
      water: '💧',
      earth: '🌱',
      air: '🌬️',
      aether: '✨',
      unknown: '○'
    };

    const path = journey
      .slice(0, 7)
      .map(j => symbols[j.element] || symbols.unknown)
      .join(' → ');

    return `
    ╔════════════════════════════════╗
    ║   Your Elemental Journey       ║
    ║                                ║
    ║   ${path}      ║
    ║                                ║
    ║         ✨                     ║
    ║       🌬️ 🔥                   ║
    ║      💧   🌱                  ║
    ║        🌀                      ║
    ╚════════════════════════════════╝
    `;
  }
}