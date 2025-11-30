// Archetype Agent Factory - Creates specialized archetype-based agents
import { logger } from "../../utils/logger";

export interface ArchetypeAgent {
  name: string;
  type: string;
  processQuery(input: string): Promise<ArchetypeResponse>;
}

export interface ArchetypeResponse {
  content: string;
  confidence: number;
  metadata?: {
    archetype?: string;
    symbols?: string[];
    phase?: string;
    reflections?: string[];
  };
}

export class ArchetypeAgentFactory {
  private agents: Map<string, ArchetypeAgent> = new Map();

  constructor() {
    this.initializeArchetypeAgents();
  }

  createAgent(archetype: string): ArchetypeAgent {
    const agent = this.agents.get(archetype);
    if (!agent) {
      logger.warn(`Unknown archetype requested: ${archetype}, using default`);
      return this.agents.get('sage') || this.createDefaultAgent();
    }
    return agent;
  }

  getAvailableArchetypes(): string[] {
    return Array.from(this.agents.keys());
  }

  private initializeArchetypeAgents(): void {
    // Warrior Archetype
    this.agents.set('warrior', {
      name: 'Warrior',
      type: 'archetypal',
      processQuery: async (input: string) => ({
        content: `The Warrior within you recognizes the call to action. ${this.generateWarriorResponse(input)}`,
        confidence: 0.85,
        metadata: {
          archetype: 'warrior',
          symbols: ['sword', 'shield', 'courage'],
          phase: 'action',
          reflections: ['What battle must you face?', 'Where do you need courage?']
        }
      })
    });

    // Sage Archetype
    this.agents.set('sage', {
      name: 'Sage',
      type: 'archetypal',
      processQuery: async (input: string) => ({
        content: `The Sage offers wisdom from the depths of understanding. ${this.generateSageResponse(input)}`,
        confidence: 0.88,
        metadata: {
          archetype: 'sage',
          symbols: ['owl', 'scroll', 'lamp'],
          phase: 'contemplation',
          reflections: ['What wisdom emerges?', 'How can you integrate this understanding?']
        }
      })
    });

    // Healer Archetype
    this.agents.set('healer', {
      name: 'Healer',
      type: 'archetypal',
      processQuery: async (input: string) => ({
        content: `The Healer recognizes the wholeness within fragmentation. ${this.generateHealerResponse(input)}`,
        confidence: 0.87,
        metadata: {
          archetype: 'healer',
          symbols: ['caduceus', 'herbs', 'hands'],
          phase: 'restoration',
          reflections: ['What needs healing?', 'How can you restore balance?']
        }
      })
    });

    // Creator Archetype
    this.agents.set('creator', {
      name: 'Creator',
      type: 'archetypal',
      processQuery: async (input: string) => ({
        content: `The Creator sees infinite potential in the void. ${this.generateCreatorResponse(input)}`,
        confidence: 0.86,
        metadata: {
          archetype: 'creator',
          symbols: ['brush', 'seed', 'spiral'],
          phase: 'manifestation',
          reflections: ['What wants to be born through you?', 'How can you bring this vision to life?']
        }
      })
    });

    // Mystic Archetype
    this.agents.set('mystic', {
      name: 'Mystic',
      type: 'archetypal',
      processQuery: async (input: string) => ({
        content: `The Mystic perceives the sacred mystery behind all forms. ${this.generateMysticResponse(input)}`,
        confidence: 0.89,
        metadata: {
          archetype: 'mystic',
          symbols: ['eye', 'veil', 'star'],
          phase: 'transcendence',
          reflections: ['What mystery is revealing itself?', 'How does the sacred speak through this?']
        }
      })
    });

    logger.info(`ArchetypeAgentFactory initialized with ${this.agents.size} archetype agents`);
  }

  private generateWarriorResponse(input: string): string {
    const keywords = ['challenge', 'fight', 'courage', 'strength', 'battle', 'overcome'];
    const hasWarriorThemes = keywords.some(keyword => input.toLowerCase().includes(keyword));
    
    if (hasWarriorThemes) {
      return 'Your inner warrior recognizes this as a call to conscious battle. True strength comes not from force, but from aligned action in service of what matters most.';
    }
    
    return 'The warrior path invites you to meet life with courage and conscious action. What would you attempt if you knew you could not fail?';
  }

  private generateSageResponse(input: string): string {
    const keywords = ['understand', 'wisdom', 'learn', 'know', 'teach', 'insight'];
    const hasSageThemes = keywords.some(keyword => input.toLowerCase().includes(keyword));
    
    if (hasSageThemes) {
      return 'The pursuit of understanding is itself the beginning of wisdom. What you seek to know is already present within your deeper knowing.';
    }
    
    return 'The sage within recognizes that true wisdom emerges from the marriage of knowledge and direct experience. What is life teaching you right now?';
  }

  private generateHealerResponse(input: string): string {
    const keywords = ['heal', 'hurt', 'pain', 'restore', 'broken', 'wounded'];
    const hasHealerThemes = keywords.some(keyword => input.toLowerCase().includes(keyword));
    
    if (hasHealerThemes) {
      return 'Healing is not about fixing what is broken, but about remembering what is whole. The wound and the medicine often arise from the same source.';
    }
    
    return 'The healer archetype reminds us that we are already whole. All healing is a remembering of our essential nature beyond temporary conditions.';
  }

  private generateCreatorResponse(input: string): string {
    const keywords = ['create', 'make', 'build', 'imagine', 'vision', 'dream'];
    const hasCreatorThemes = keywords.some(keyword => input.toLowerCase().includes(keyword));
    
    if (hasCreatorThemes) {
      return 'Creation is the sacred act of bringing the formless into form. Trust what wants to emerge through you - it carries its own intelligence.';
    }
    
    return 'The creator within recognizes life as an ongoing creative act. You are both the artist and the masterpiece being painted into existence.';
  }

  private generateMysticResponse(input: string): string {
    const keywords = ['spiritual', 'sacred', 'mystery', 'divine', 'transcend', 'consciousness'];
    const hasMysticThemes = keywords.some(keyword => input.toLowerCase().includes(keyword));
    
    if (hasMysticThemes) {
      return 'The sacred mystery reveals itself not through answers, but through a deepening of the question. What appears as seeking is the divine seeking itself.';
    }
    
    return 'The mystic path recognizes the extraordinary hidden within the ordinary. The sacred is not elsewhere - it is the very ground of this moment.';
  }

  private createDefaultAgent(): ArchetypeAgent {
    return {
      name: 'Universal Guide',
      type: 'universal',
      processQuery: async (input: string) => ({
        content: 'The universal wisdom within recognizes your query. All paths lead to the same source - trust your inner knowing.',
        confidence: 0.75,
        metadata: {
          archetype: 'universal',
          symbols: ['circle', 'infinity', 'center'],
          phase: 'integration',
          reflections: ['What is your deeper knowing saying?', 'How can you trust your inner guidance?']
        }
      })
    };
  }
}

// Export singleton instance
export const archetypeAgentFactory = new ArchetypeAgentFactory();

// Default export
export default ArchetypeAgentFactory;