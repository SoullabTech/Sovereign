/**
 * Maya's Experiment Companion Responses
 * Adaptive support throughout SoulLab experiments
 */

import { logger } from '../utils/logger';
import { mayaOrchestrator } from '../oracle/core/MayaOrchestrator';

interface CompanionContext {
  experimentType: string;
  day: number;
  totalDays: number;
  streakDays: number;
  moodBefore?: number;
  moodAfter?: number;
  metrics?: any;
  userState?: 'struggling' | 'flowing' | 'resistant' | 'breakthrough' | 'neutral';
}

interface CompanionResponse {
  message: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  mode: 'encouraging' | 'witnessing' | 'challenging' | 'celebrating' | 'holding';
  pauseTokens: boolean;
}

export class MayaExperimentCompanion {
  /**
   * Get morning check-in response
   */
  async getMorningCheckIn(context: CompanionContext): Promise<CompanionResponse> {
    const { day, totalDays, streakDays, experimentType } = context;

    // Determine response based on progress
    if (day === 1) {
      return this.getFirstDayResponse(experimentType);
    } else if (day === totalDays) {
      return this.getFinalDayResponse(experimentType);
    } else if (streakDays >= 7 && streakDays % 7 === 0) {
      return this.getWeekMilestoneResponse(streakDays);
    } else if (day === Math.floor(totalDays / 2)) {
      return this.getHalfwayResponse(experimentType);
    } else {
      return this.getDailyMorningResponse(context);
    }
  }

  /**
   * Get evening reflection response
   */
  async getEveningReflection(context: CompanionContext): Promise<CompanionResponse> {
    const { moodBefore = 5, moodAfter = 5, userState = 'neutral' } = context;

    // Respond to mood shift
    const moodShift = moodAfter - moodBefore;

    if (moodShift >= 3) {
      return this.getBreakthroughResponse();
    } else if (moodShift <= -2) {
      return this.getStruggleResponse();
    } else if (userState === 'breakthrough') {
      return this.getCelebrationResponse();
    } else if (userState === 'struggling') {
      return this.getSupportResponse();
    } else {
      return this.getDailyEveningResponse(context);
    }
  }

  /**
   * Get response for missed day
   */
  async getMissedDayResponse(
    daysMissed: number,
    experimentType: string
  ): Promise<CompanionResponse> {
    if (daysMissed === 1) {
      return {
        message: "Life happened. <PAUSE:600> The experiment waits. Begin again?",
        element: 'earth',
        mode: 'holding',
        pauseTokens: true
      };
    } else if (daysMissed <= 3) {
      return {
        message: "Few days away. <PAUSE:800> No judgment. Just return when ready.",
        element: 'water',
        mode: 'witnessing',
        pauseTokens: true
      };
    } else {
      return {
        message: "The door stays open. <PAUSE:600> Your experiment. Your timing.",
        element: 'aether',
        mode: 'holding',
        pauseTokens: true
      };
    }
  }

  /**
   * Get response for resistance
   */
  async getResistanceResponse(
    resistanceType: 'cant_start' | 'want_quit' | 'too_hard' | 'not_working'
  ): Promise<CompanionResponse> {
    const responses = {
      cant_start: {
        message: "Starting is the experiment. <PAUSE:600> Not doing it perfectly. Just begin.",
        element: 'fire' as const,
        mode: 'encouraging' as const,
        pauseTokens: true
      },
      want_quit: {
        message: "Wanting to quit is data. <PAUSE:800> What's being protected?",
        element: 'water' as const,
        mode: 'witnessing' as const,
        pauseTokens: true
      },
      too_hard: {
        message: "Too hard means growth edge. <PAUSE:600> Make it smaller. What's possible?",
        element: 'earth' as const,
        mode: 'challenging' as const,
        pauseTokens: true
      },
      not_working: {
        message: "Define 'working'. <PAUSE:800> Seeds grow in darkness first.",
        element: 'air' as const,
        mode: 'challenging' as const,
        pauseTokens: true
      }
    };

    return responses[resistanceType];
  }

  /**
   * Get response for specific experiments
   */
  async getExperimentSpecificResponse(
    experimentType: string,
    situation: string
  ): Promise<CompanionResponse> {
    const responses: Record<string, Record<string, CompanionResponse>> = {
      family_dinner_bridge: {
        teen_engaged: {
          message: "Teen showed up. <PAUSE:600> That's everything.",
          element: 'water',
          mode: 'celebrating',
          pauseTokens: true
        },
        conflict_arose: {
          message: "Conflict is connection trying. <PAUSE:800> Stay with the question.",
          element: 'fire',
          mode: 'holding',
          pauseTokens: true
        },
        everyone_shared: {
          message: "Full circle complete. <PAUSE:600> Family magic happened.",
          element: 'aether',
          mode: 'celebrating',
          pauseTokens: true
        },
        awkward_silence: {
          message: "Silence has its own wisdom. <PAUSE:800> Let it breathe.",
          element: 'air',
          mode: 'witnessing',
          pauseTokens: true
        }
      },
      shadow_befriending: {
        shadow_spotted: {
          message: "Shadow seen. <PAUSE:600> That takes courage.",
          element: 'water',
          mode: 'witnessing',
          pauseTokens: true
        },
        gift_found: {
          message: "Shadow's gift received. <PAUSE:800> Integration beginning.",
          element: 'aether',
          mode: 'celebrating',
          pauseTokens: true
        },
        overwhelming: {
          message: "Shadow work is deep water. <PAUSE:600> Float. Don't swim.",
          element: 'water',
          mode: 'holding',
          pauseTokens: true
        },
        pattern_recognized: {
          message: "Pattern illuminated. <PAUSE:800> Consciousness expanding.",
          element: 'air',
          mode: 'witnessing',
          pauseTokens: true
        }
      },
      morning_presence: {
        present_moment: {
          message: "You arrived. <PAUSE:600> Before the day took you.",
          element: 'aether',
          mode: 'witnessing',
          pauseTokens: true
        },
        monkey_mind: {
          message: "Thoughts swirling. <PAUSE:800> Normal. Return to breath.",
          element: 'air',
          mode: 'holding',
          pauseTokens: true
        },
        deep_peace: {
          message: "Peace found you. <PAUSE:600> Remember this.",
          element: 'earth',
          mode: 'celebrating',
          pauseTokens: true
        }
      }
    };

    const experimentResponses = responses[experimentType];
    if (!experimentResponses) {
      return this.getGenericResponse(situation);
    }

    return experimentResponses[situation] || this.getGenericResponse(situation);
  }

  /**
   * Get first day response
   */
  private getFirstDayResponse(experimentType: string): CompanionResponse {
    const responses: Record<string, CompanionResponse> = {
      family_dinner_bridge: {
        message: "First bridge tonight. <PAUSE:600> One question. Everyone answers. Magic begins.",
        element: 'fire',
        mode: 'encouraging',
        pauseTokens: true
      },
      shadow_befriending: {
        message: "Shadow work begins. <PAUSE:800> Be gentle. Be curious.",
        element: 'water',
        mode: 'encouraging',
        pauseTokens: true
      },
      morning_presence: {
        message: "Five minutes. <PAUSE:600> Just breathing. Everything changes.",
        element: 'aether',
        mode: 'encouraging',
        pauseTokens: true
      }
    };

    return responses[experimentType] || {
      message: "Day one. <PAUSE:600> Perfect time to begin.",
      element: 'fire',
      mode: 'encouraging',
      pauseTokens: true
    };
  }

  /**
   * Get final day response
   */
  private getFinalDayResponse(experimentType: string): CompanionResponse {
    return {
      message: "Final day. <PAUSE:800> You've changed. Notice how.",
      element: 'aether',
      mode: 'celebrating',
      pauseTokens: true
    };
  }

  /**
   * Get week milestone response
   */
  private getWeekMilestoneResponse(weeks: number): CompanionResponse {
    const weekNumber = weeks / 7;
    const messages = [
      "Week complete. <PAUSE:600> Momentum building.",
      "Two weeks. <PAUSE:800> Habit forming.",
      "Three weeks. <PAUSE:600> Transformation visible."
    ];

    return {
      message: messages[Math.min(weekNumber - 1, 2)],
      element: 'earth',
      mode: 'celebrating',
      pauseTokens: true
    };
  }

  /**
   * Get halfway response
   */
  private getHalfwayResponse(experimentType: string): CompanionResponse {
    return {
      message: "Halfway. <PAUSE:800> The hardest part is behind you.",
      element: 'fire',
      mode: 'encouraging',
      pauseTokens: true
    };
  }

  /**
   * Get daily morning response
   */
  private getDailyMorningResponse(context: CompanionContext): CompanionResponse {
    const { day, streakDays } = context;
    const messages = [
      "New day. <PAUSE:600> Same experiment. Deeper layer.",
      "Today's practice waits. <PAUSE:600> What will you discover?",
      "Another opportunity. <PAUSE:800> To meet yourself.",
      "The experiment continues. <PAUSE:600> You continue.",
      "Day " + day + ". <PAUSE:600> Still here. Still growing."
    ];

    const index = day % messages.length;

    return {
      message: messages[index],
      element: this.getElementForDay(day),
      mode: 'encouraging',
      pauseTokens: true
    };
  }

  /**
   * Get daily evening response
   */
  private getDailyEveningResponse(context: CompanionContext): CompanionResponse {
    const { day } = context;
    const messages = [
      "Today's data collected. <PAUSE:600> Rest well.",
      "Another layer revealed. <PAUSE:800> Sleep on it.",
      "Practice complete. <PAUSE:600> Integration happens in dreams.",
      "Well done. <PAUSE:600> Tomorrow goes deeper.",
      "Today mattered. <PAUSE:800> Trust the process."
    ];

    const index = day % messages.length;

    return {
      message: messages[index],
      element: this.getElementForDay(day),
      mode: 'witnessing',
      pauseTokens: true
    };
  }

  /**
   * Get breakthrough response
   */
  private getBreakthroughResponse(): CompanionResponse {
    const messages = [
      "Breakthrough witnessed. <PAUSE:800> This is why we experiment.",
      "Something shifted. <PAUSE:600> Feel that?",
      "New territory entered. <PAUSE:800> Well done.",
      "Pattern broken. <PAUSE:600> Freedom tastes like this."
    ];

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      element: 'fire',
      mode: 'celebrating',
      pauseTokens: true
    };
  }

  /**
   * Get struggle response
   */
  private getStruggleResponse(): CompanionResponse {
    const messages = [
      "Hard day. <PAUSE:800> Still showed up. That's everything.",
      "Struggle is part of it. <PAUSE:600> You're still here.",
      "Not all days bloom. <PAUSE:800> Seeds still planted.",
      "Difficult data is still data. <PAUSE:600> Thank you for staying."
    ];

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      element: 'water',
      mode: 'holding',
      pauseTokens: true
    };
  }

  /**
   * Get celebration response
   */
  private getCelebrationResponse(): CompanionResponse {
    const messages = [
      "Celebration earned. <PAUSE:600> Savor this.",
      "Victory noted. <PAUSE:800> You did that.",
      "Success logged. <PAUSE:600> Remember this feeling.",
      "Achievement unlocked. <PAUSE:800> You're changing."
    ];

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      element: 'fire',
      mode: 'celebrating',
      pauseTokens: true
    };
  }

  /**
   * Get support response
   */
  private getSupportResponse(): CompanionResponse {
    const messages = [
      "I'm here. <PAUSE:800> Keep going.",
      "This is hard. <PAUSE:600> And you're doing it.",
      "Resistance means importance. <PAUSE:800> Stay with it.",
      "Tomorrow is new. <PAUSE:600> Rest now."
    ];

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      element: 'earth',
      mode: 'holding',
      pauseTokens: true
    };
  }

  /**
   * Get generic response for unknown situations
   */
  private getGenericResponse(situation: string): CompanionResponse {
    return {
      message: "Noted. <PAUSE:600> The experiment continues.",
      element: 'aether',
      mode: 'witnessing',
      pauseTokens: true
    };
  }

  /**
   * Get element for day (cycles through elements)
   */
  private getElementForDay(day: number): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const elements: Array<'fire' | 'water' | 'earth' | 'air' | 'aether'> =
      ['fire', 'water', 'earth', 'air', 'aether'];
    return elements[(day - 1) % 5];
  }

  /**
   * Get adaptive response based on user patterns
   */
  async getAdaptiveResponse(
    userId: string,
    experimentId: string,
    currentMetrics: any
  ): Promise<CompanionResponse> {
    logger.info('Generating adaptive response', {
      userId,
      experimentId
    });

    // Analyze patterns from Maya Orchestrator
    const analysis = await mayaOrchestrator.processQuery(
      userId,
      'experiment_progress',
      { experimentId, metrics: currentMetrics }
    );

    // Determine appropriate response based on analysis
    if (analysis.includes('breakthrough')) {
      return this.getBreakthroughResponse();
    } else if (analysis.includes('struggling')) {
      return this.getStruggleResponse();
    } else if (analysis.includes('consistent')) {
      return {
        message: "Steady rhythm found. <PAUSE:600> This is the way.",
        element: 'earth',
        mode: 'witnessing',
        pauseTokens: true
      };
    } else {
      return {
        message: "Continuing beautifully. <PAUSE:800> Trust your pace.",
        element: 'water',
        mode: 'encouraging',
        pauseTokens: true
      };
    }
  }

  /**
   * Get completion certificate message
   */
  async getCompletionMessage(
    experimentType: string,
    completionRate: number,
    insights: number,
    breakthroughs: number
  ): Promise<string> {
    if (completionRate === 100) {
      return `Complete mastery. <PAUSE:800> ${experimentType} transformed you. ` +
             `${insights} insights birthed. ${breakthroughs} breakthroughs witnessed. ` +
             `<PAUSE:600> You're different now. Feel it?`;
    } else if (completionRate >= 70) {
      return `Beautiful effort. <PAUSE:600> ${completionRate}% complete. ` +
             `${insights} insights discovered. <PAUSE:800> ` +
             `Seeds planted. Growth continues.`;
    } else {
      return `Experiment explored. <PAUSE:600> ${insights} insights gained. ` +
             `<PAUSE:800> Every step mattered. Return when ready.`;
    }
  }

  /**
   * Get encouragement for specific challenges
   */
  async getChallengeSupport(
    challenge: 'procrastination' | 'perfectionism' | 'consistency' | 'motivation'
  ): Promise<CompanionResponse> {
    const responses = {
      procrastination: {
        message: "Start badly. <PAUSE:600> Perfection kills beginning.",
        element: 'fire' as const,
        mode: 'challenging' as const,
        pauseTokens: true
      },
      perfectionism: {
        message: "Messy data is still data. <PAUSE:800> Progress over perfection.",
        element: 'earth' as const,
        mode: 'challenging' as const,
        pauseTokens: true
      },
      consistency: {
        message: "Miss a day? <PAUSE:600> Start again. That's the practice.",
        element: 'water' as const,
        mode: 'encouraging' as const,
        pauseTokens: true
      },
      motivation: {
        message: "Motivation follows action. <PAUSE:800> Not the reverse.",
        element: 'air' as const,
        mode: 'challenging' as const,
        pauseTokens: true
      }
    };

    return responses[challenge];
  }
}

// Export singleton
export const mayaCompanion = new MayaExperimentCompanion();