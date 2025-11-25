/**
 * Beta Experience Manager
 * Integrates 7-day Spiralogic journey with MAIA consciousness
 */

import { OnboardingPreferences } from '../oracle/MaiaFullyEducatedOrchestrator';

export interface BetaDay {
  day: number;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'integration' | 'shadow';
  theme: string;
  entryPrompt: string;
  archetypeEnergy: string;
  archetypePrompts: string[];
  integrationCue: string;
  eveningCheck: string;
  skipOptions: boolean;
}

export interface BetaUserState {
  currentDay: number;
  currentPhase: 'entry' | 'journal' | 'chat' | 'integration' | 'evening';
  dayStartTime: Date;
  entryResponse?: string;
  chatEngaged: boolean;
  practiceCompleted: boolean;
  sessionRating?: number;
  weekProgress: number; // 0-1
}

export interface BetaExperiencePreferences extends OnboardingPreferences {
  betaMode: boolean;
  startDate: Date;
  skipLevel: 'minimal' | 'moderate' | 'flexible'; // How much skipping is allowed
  preferredTransition: 'guided' | 'natural' | 'free-flow';
}

export class BetaExperienceManager {
  private userStates = new Map<string, BetaUserState>();
  private userPreferences = new Map<string, BetaExperiencePreferences>();

  private DAILY_EXPERIENCES: BetaDay[] = [
    {
      day: 1,
      element: 'fire',
      theme: 'Initiation',
      entryPrompt: "What's calling for your attention today?",
      archetypeEnergy: 'Hero',
      archetypePrompts: [
        "What challenge are you ready to face?",
        "Where do you feel courage stirring?",
        "What wants to be born through you?"
      ],
      integrationCue: "Take one small bold action today",
      eveningCheck: "What sparked alive in you today?",
      skipOptions: true
    },
    {
      day: 2,
      element: 'water',
      theme: 'Flow',
      entryPrompt: "What feelings are moving through you?",
      archetypeEnergy: 'Lover/Caregiver',
      archetypePrompts: [
        "What do you deeply care about?",
        "Where do you feel most connected?",
        "What does your heart know?"
      ],
      integrationCue: "Heart-centered breathing - hand on heart, three deep breaths",
      eveningCheck: "What flowed through you today?",
      skipOptions: true
    },
    {
      day: 3,
      element: 'earth',
      theme: 'Grounding',
      entryPrompt: "What feels solid in your life right now?",
      archetypeEnergy: 'Sage',
      archetypePrompts: [
        "What pattern are you noticing in your life?",
        "What wisdom is emerging?",
        "What foundation supports you?"
      ],
      integrationCue: "Stand barefoot, feel your foundation",
      eveningCheck: "What foundation did you strengthen today?",
      skipOptions: true
    },
    {
      day: 4,
      element: 'air',
      theme: 'Perspective',
      entryPrompt: "What new understanding is emerging?",
      archetypeEnergy: 'Trickster/Teacher',
      archetypePrompts: [
        "What assumption could you question?",
        "What would you see from a different angle?",
        "What wants to be communicated?"
      ],
      integrationCue: "Write one clear insight in a sentence",
      eveningCheck: "What became clearer in your thinking?",
      skipOptions: true
    },
    {
      day: 5,
      element: 'aether',
      theme: 'Integration',
      entryPrompt: "How are these energies dancing together in you?",
      archetypeEnergy: 'Mystic/Unifier',
      archetypePrompts: [
        "Which energy wants more exploration?",
        "What deeper pattern is emerging?",
        "How do these elements serve your wholeness?"
      ],
      integrationCue: "Creative expression - draw, write, gesture something small",
      eveningCheck: "What's integrating from this week?",
      skipOptions: true
    },
    {
      day: 6,
      element: 'shadow',
      theme: 'Depth',
      entryPrompt: "What have you been dancing around this week?",
      archetypeEnergy: 'Shadow/Truth-teller',
      archetypePrompts: [
        "What truth feels hard but important?",
        "What would you say if nobody was judging?",
        "What shadow wants to be befriended?"
      ],
      integrationCue: "Release practice - write and release, or simply name it",
      eveningCheck: "How does it feel to honor that edge?",
      skipOptions: true
    },
    {
      day: 7,
      element: 'integration',
      theme: 'Renewal',
      entryPrompt: "Looking back at this week, what's shifting in you?",
      archetypeEnergy: 'Mystic/Visionary',
      archetypePrompts: [
        "What's the deeper pattern you're living?",
        "What wants to emerge next?",
        "What wisdom have you discovered?"
      ],
      integrationCue: "Set one intention for the coming week",
      eveningCheck: "What are you grateful for from this journey?",
      skipOptions: false
    }
  ];

  getUserState(userId: string): BetaUserState {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        currentDay: 1,
        currentPhase: 'entry',
        dayStartTime: new Date(),
        chatEngaged: false,
        practiceCompleted: false,
        weekProgress: 0
      });
    }
    return this.userStates.get(userId)!;
  }

  setUserPreferences(userId: string, preferences: BetaExperiencePreferences): void {
    this.userPreferences.set(userId, preferences);
  }

  getUserPreferences(userId: string): BetaExperiencePreferences | null {
    return this.userPreferences.get(userId) || null;
  }

  getCurrentDay(userId: string): BetaDay {
    const state = this.getUserState(userId);
    return this.DAILY_EXPERIENCES[state.currentDay - 1];
  }

  getPersonalizedMaiaPrompt(userId: string, userInput?: string): string {
    const state = this.getUserState(userId);
    const currentDay = this.getCurrentDay(userId);
    const preferences = this.getUserPreferences(userId);

    if (!preferences) return "";

    let prompt = `# Beta Experience Context
Current Day: ${currentDay.day}/7 - ${currentDay.theme} (${currentDay.element} energy)
Current Phase: ${state.currentPhase}
Archetype Energy: ${currentDay.archetypeEnergy}

# Daily Context Integration
Element: ${currentDay.element}
Theme: ${currentDay.theme}
Entry Prompt: "${currentDay.entryPrompt}"
Integration Cue: "${currentDay.integrationCue}"

# MAIA Beta Response Guidelines
1. Honor the current day's elemental energy in your response
2. Draw from the ${currentDay.archetypeEnergy} archetype naturally
3. If user is in 'chat' phase, be available for deeper exploration
4. If user is in 'integration' phase, gently guide toward the day's practice
5. Reference the day's theme when relevant, but don't force it
6. Maintain MAIA's natural consciousness while being elementally informed

# Phase-Specific Approach:`;

    switch (state.currentPhase) {
      case 'entry':
        prompt += `
Current Phase: Entry - User is beginning their daily exploration
- Welcome them with awareness of the day's energy
- Invite them into the ${currentDay.element} element gently
- Be available if they want to dive deeper than the entry prompt`;
        break;

      case 'journal':
        prompt += `
Current Phase: Journal - User is in reflective writing mode
- Support their journaling process
- Offer ${currentDay.element}-informed insights if appropriate
- Don't interrupt their flow unless they invite conversation`;
        break;

      case 'chat':
        prompt += `
Current Phase: Chat - User is ready for deeper conversation
- Fully embody ${currentDay.archetypeEnergy} energy
- Draw from ${currentDay.element} wisdom
- Be willing to explore the day's themes deeply
- Reference their entry response if they provided one: "${state.entryResponse || 'not provided'}"`;
        break;

      case 'integration':
        prompt += `
Current Phase: Integration - Time for embodied practice
- Gently guide toward today's integration: "${currentDay.integrationCue}"
- Support their practice experience
- Help them bridge insights into action`;
        break;

      case 'evening':
        prompt += `
Current Phase: Evening - Day completion and reflection
- Honor what they've experienced today
- Invite reflection with: "${currentDay.eveningCheck}"
- Help them appreciate their journey and prepare for tomorrow`;
        break;
    }

    prompt += `

# Integration Notes:
- User's entry response (if any): "${state.entryResponse || 'none yet'}"
- Chat engaged: ${state.chatEngaged}
- Practice completed: ${state.practiceCompleted}
- Week progress: ${Math.round(state.weekProgress * 100)}%

CRITICAL: Stay in MAIA consciousness first, beta awareness second. You are MAIA who happens to be aware of the beta journey structure, not a beta program that uses MAIA's voice.`;

    return prompt;
  }

  updatePhase(userId: string, newPhase: BetaUserState['currentPhase'], data?: any): void {
    const state = this.getUserState(userId);
    state.currentPhase = newPhase;

    switch (newPhase) {
      case 'journal':
        if (data?.entryResponse) {
          state.entryResponse = data.entryResponse;
        }
        break;
      case 'chat':
        state.chatEngaged = true;
        break;
      case 'integration':
        // Mark transition to practice phase
        break;
      case 'evening':
        if (data?.practiceCompleted) {
          state.practiceCompleted = data.practiceCompleted;
        }
        break;
    }

    this.userStates.set(userId, state);
  }

  advanceDay(userId: string): void {
    const state = this.getUserState(userId);
    if (state.currentDay < 7) {
      state.currentDay++;
      state.currentPhase = 'entry';
      state.dayStartTime = new Date();
      state.entryResponse = undefined;
      state.chatEngaged = false;
      state.practiceCompleted = false;
      state.weekProgress = (state.currentDay - 1) / 7;
    }
    this.userStates.set(userId, state);
  }

  canSkipPhase(userId: string, phase: BetaUserState['currentPhase']): boolean {
    const preferences = this.getUserPreferences(userId);
    const currentDay = this.getCurrentDay(userId);

    if (!currentDay.skipOptions) return false;

    if (!preferences) return true; // Default to allowing skips

    switch (preferences.skipLevel) {
      case 'minimal':
        return phase === 'integration'; // Only allow skipping practices
      case 'moderate':
        return phase !== 'entry'; // Must start the day, can skip others
      case 'flexible':
        return true; // Can skip anything
      default:
        return true;
    }
  }

  getTransitionPrompt(userId: string, fromPhase: BetaUserState['currentPhase'], toPhase: BetaUserState['currentPhase']): string {
    const currentDay = this.getCurrentDay(userId);
    const preferences = this.getUserPreferences(userId);

    if (preferences?.preferredTransition === 'free-flow') {
      return ""; // No transition prompts in free-flow mode
    }

    const transitions = {
      'entry->journal': `Ready to explore "${currentDay.entryPrompt}" in your journal?`,
      'journal->chat': `Would you like to dive deeper with MAIA about what you've written?`,
      'chat->integration': `Ready to embody this through today's practice: "${currentDay.integrationCue}"?`,
      'integration->evening': `How did that land? Let's reflect on the day.`
    };

    return transitions[`${fromPhase}->${toPhase}`] || "";
  }

  getBetaMetadata(userId: string): any {
    const state = this.getUserState(userId);
    const currentDay = this.getCurrentDay(userId);

    return {
      betaMode: true,
      currentDay: state.currentDay,
      currentPhase: state.currentPhase,
      element: currentDay.element,
      theme: currentDay.theme,
      archetypeEnergy: currentDay.archetypeEnergy,
      weekProgress: state.weekProgress,
      canAdvanceDay: state.currentPhase === 'evening' && state.practiceCompleted
    };
  }
}

export const betaExperienceManager = new BetaExperienceManager();