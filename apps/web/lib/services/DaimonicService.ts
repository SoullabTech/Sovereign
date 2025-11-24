// Daimonic Service - Handles daimonic encounters and wisdom
export interface DaimonicEncounter {
  id: string;
  userId: string;
  type: 'shadow' | 'anima' | 'animus' | 'wise_old_man' | 'great_mother' | 'trickster';
  message: string;
  intensity: number;
  resolution?: string;
  timestamp: string;
}

export interface DaimonicResponse {
  encounter: DaimonicEncounter;
  guidance: string;
  integration: string[];
  nextSteps: string[];
}

export class DaimonicService {
  private encounters: Map<string, DaimonicEncounter[]> = new Map();

  async createEncounter(userId: string, input: string, type?: string): Promise<DaimonicResponse> {
    const encounterType = type as DaimonicEncounter['type'] || this.detectEncounterType(input);
    
    const encounter: DaimonicEncounter = {
      id: `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: encounterType,
      message: this.generateDaimonicMessage(encounterType, input),
      intensity: this.calculateIntensity(input),
      timestamp: new Date().toISOString()
    };

    // Store encounter
    const userEncounters = this.encounters.get(userId) || [];
    userEncounters.push(encounter);
    this.encounters.set(userId, userEncounters);

    return {
      encounter,
      guidance: this.generateGuidance(encounterType, input),
      integration: this.getIntegrationPractices(encounterType),
      nextSteps: this.getNextSteps(encounterType)
    };
  }

  async getEncounterHistory(userId: string): Promise<DaimonicEncounter[]> {
    return this.encounters.get(userId) || [];
  }

  async resolveEncounter(userId: string, encounterId: string, resolution: string): Promise<boolean> {
    const userEncounters = this.encounters.get(userId) || [];
    const encounter = userEncounters.find(e => e.id === encounterId);
    
    if (encounter) {
      encounter.resolution = resolution;
      return true;
    }
    
    return false;
  }

  private detectEncounterType(input: string): DaimonicEncounter['type'] {
    const lower = input.toLowerCase();
    
    if (lower.includes('shadow') || lower.includes('dark') || lower.includes('avoid')) {
      return 'shadow';
    } else if (lower.includes('feminine') || lower.includes('intuitive') || lower.includes('creative')) {
      return 'anima';
    } else if (lower.includes('masculine') || lower.includes('action') || lower.includes('direct')) {
      return 'animus';
    } else if (lower.includes('wisdom') || lower.includes('teach') || lower.includes('guide')) {
      return 'wise_old_man';
    } else if (lower.includes('nurture') || lower.includes('care') || lower.includes('mother')) {
      return 'great_mother';
    } else if (lower.includes('trick') || lower.includes('chaos') || lower.includes('unexpected')) {
      return 'trickster';
    }
    
    return 'shadow'; // Default to shadow work
  }

  private generateDaimonicMessage(type: DaimonicEncounter['type'], input: string): string {
    const messages = {
      shadow: "I am the part of you that you have cast aside. Look at me - I carry the gold you left behind in the darkness.",
      anima: "I am the creative soul within you, the bridge to your deepest knowing. Dance with me, don't try to possess me.",
      animus: "I am your inner masculine, the focused will that turns dreams into reality. Let me teach you to act with purpose.",
      wise_old_man: "I have watched the cycles of time and learned their lessons. Sit with me and receive what you need to know.",
      great_mother: "I am the source from which you emerged and to which you return. Let me nourish what wants to grow through you.",
      trickster: "I am the chaos that breaks your rigid patterns. Through me, new possibilities emerge from old assumptions."
    };
    
    return messages[type];
  }

  private generateGuidance(type: DaimonicEncounter['type'], input: string): string {
    const guidance = {
      shadow: "Shadow work requires courage to face what you've rejected. This aspect holds medicine you need for wholeness.",
      anima: "The feminine principle invites you to receive rather than pursue, to be receptive to what wants to emerge.",
      animus: "The masculine principle calls for focused action. What vision requires your determined commitment?",
      wise_old_man: "Wisdom comes through patience and reflection. Take time to integrate what you're learning.",
      great_mother: "Nurturing energy is needed now. Care for yourself and what you're bringing into being.",
      trickster: "Unexpected changes are opportunities in disguise. Stay flexible and embrace the unknown."
    };
    
    return guidance[type];
  }

  private getIntegrationPractices(type: DaimonicEncounter['type']): string[] {
    const practices = {
      shadow: [
        "Practice active imagination with rejected aspects",
        "Journal about what you judge in others",
        "Embrace your 'negative' emotions with compassion"
      ],
      anima: [
        "Spend time in receptive meditation",
        "Engage with art, music, or poetry",
        "Honor your intuitive insights"
      ],
      animus: [
        "Set clear goals and take consistent action",
        "Practice assertiveness with compassion",
        "Channel creative energy into focused projects"
      ],
      wise_old_man: [
        "Seek teachings from wisdom traditions",
        "Spend time in contemplation",
        "Share your knowledge with others"
      ],
      great_mother: [
        "Practice self-care and nurturing",
        "Connect with nature regularly",
        "Support others' growth and development"
      ],
      trickster: [
        "Embrace spontaneity and playfulness",
        "Question your assumptions",
        "Find humor in challenging situations"
      ]
    };
    
    return practices[type];
  }

  private getNextSteps(type: DaimonicEncounter['type']): string[] {
    return [
      "Continue dialogue with this archetypal energy",
      "Notice how it appears in your daily life",
      "Practice the integration exercises regularly",
      "Seek guidance from a spiritual mentor if needed"
    ];
  }

  private calculateIntensity(input: string): number {
    // Simple intensity calculation based on emotional keywords
    const intensityWords = ['crisis', 'overwhelming', 'stuck', 'desperate', 'lost', 'breakthrough', 'urgent'];
    const count = intensityWords.reduce((sum, word) => 
      sum + (input.toLowerCase().includes(word) ? 1 : 0), 0
    );
    
    return Math.min(count * 0.3 + 0.2, 1.0); // Scale to 0.2-1.0
  }
}

// Export singleton instance
export const daimonicService = new DaimonicService();

// Default export
export default DaimonicService;