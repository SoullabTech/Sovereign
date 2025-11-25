/**
 * Gaming Integration Example
 * Shows how to use FIS for game NPCs, companions, and interactive characters
 */

import { FIS, ApplicationContext } from '../IntegrationAdapter';

/**
 * Game NPC using Field Intelligence
 */
export class FieldAwareNPC {
  private context: ApplicationContext;
  private npcRole: string;

  constructor(npcId: string, role: 'companion' | 'mentor' | 'merchant' | 'oracle') {
    this.npcRole = role;
    this.context = {
      type: 'gaming',
      userId: npcId,
      sessionId: `game-session-${Date.now()}`,
      environment: {
        npcRole: role,
        personality: this.getPersonalityTraits(role)
      }
    };
  }

  /**
   * NPC responds to player interaction
   */
  async respondToPlayer(playerInput: {
    dialogue?: string;
    action?: string;
    gameState: any;
  }) {
    const response = await FIS.participate({
      dialogue: playerInput.dialogue,
      playerAction: playerInput.action,
      gameState: playerInput.gameState,
      npcRole: this.npcRole,
      environment: {
        location: playerInput.gameState.location,
        timeOfDay: playerInput.gameState.timeOfDay,
        questProgress: playerInput.gameState.questProgress
      }
    }, this.context);

    return {
      dialogue: response.content,
      animations: response.actions?.filter(a => a.type === 'animation'),
      effects: response.actions?.filter(a => a.type === 'particle_effect'),
      environmentChanges: response.actions?.filter(a => a.type === 'environment_shift'),
      emotionalState: response.metadata.fieldState.emotionalWeather
    };
  }

  private getPersonalityTraits(role: string) {
    switch (role) {
      case 'companion':
        return { warmth: 0.8, playfulness: 0.6, wisdom: 0.4 };
      case 'mentor':
        return { warmth: 0.5, playfulness: 0.2, wisdom: 0.9 };
      case 'oracle':
        return { warmth: 0.3, playfulness: 0.1, wisdom: 1.0 };
      default:
        return { warmth: 0.5, playfulness: 0.5, wisdom: 0.5 };
    }
  }
}

/**
 * Example usage in a game
 */
export async function gameExample() {
  // Create an oracle NPC
  const oracle = new FieldAwareNPC('temple-oracle', 'oracle');

  // Player approaches with a question
  const playerInput = {
    dialogue: "I've been having strange dreams about a mountain. What do they mean?",
    gameState: {
      location: 'ancient_temple',
      timeOfDay: 'twilight',
      questProgress: {
        main: 0.3,
        dreams: 0.1
      },
      playerStats: {
        wisdom: 15,
        spirituality: 8
      }
    }
  };

  // Oracle responds with field awareness
  const oracleResponse = await oracle.respondToPlayer(playerInput);

  console.log("Oracle says:", oracleResponse.dialogue);
  console.log("Visual effects:", oracleResponse.effects);
  console.log("Environment shifts:", oracleResponse.environmentChanges);

  // Response will be shaped by:
  // - Sacred threshold detection (in temple at twilight)
  // - Player's spiritual journey (dream question)
  // - Oracle's high wisdom personality
  // - Field resonance with mystical context
}

/**
 * Companion character with emotional intelligence
 */
export class EmotionalCompanion extends FieldAwareNPC {
  private relationshipScore: number = 0;

  constructor(companionId: string) {
    super(companionId, 'companion');
  }

  async interact(playerState: {
    mood: string;
    recentActions: string[];
    dialogue?: string;
  }) {
    const response = await FIS.participate({
      dialogue: playerState.dialogue || '',
      playerAction: playerState.recentActions[0],
      gameState: {
        playerMood: playerState.mood,
        relationshipLevel: this.relationshipScore,
        recentEvents: playerState.recentActions
      },
      npcRole: 'companion'
    }, this.context);

    // Update relationship based on field resonance
    if (response.metadata.resonance > 0.7) {
      this.relationshipScore += 0.1;
    }

    return {
      response: response.content,
      emotionalResonance: response.metadata.resonance,
      relationshipChange: response.metadata.resonance > 0.7 ? '+' : '=',
      companionMood: this.deriveCompanionMood(response.metadata.fieldState)
    };
  }

  private deriveCompanionMood(fieldState: any): string {
    const weather = fieldState.emotionalWeather;
    if (weather?.texture === 'flowing' && weather?.temperature > 0.7) {
      return 'joyful';
    } else if (weather?.texture === 'turbulent') {
      return 'concerned';
    } else if (weather?.density < 0.3) {
      return 'peaceful';
    }
    return 'attentive';
  }
}