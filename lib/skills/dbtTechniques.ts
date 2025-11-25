/**
 * 🧘 Enhanced DBT Techniques with Skill Chaining
 *
 * Features:
 * - Multiple phrasings per skill (4+ variations)
 * - Intelligent skill chaining to prevent repetition
 * - Therapeutic progression patterns (crisis → stabilization → integration)
 * - Usage tracking and rotation logic
 */

export interface DBTSkill {
  name: string;
  category: 'mindfulness' | 'distressTolerance' | 'emotionRegulation' | 'interpersonalEffectiveness';
  intensity: 'low' | 'medium' | 'high';
  variations: string[];
  triggers: string[];
  chainTo: string[]; // Skills that naturally follow this one
}

export type DBTModule = 'mindfulness' | 'distressTolerance' | 'emotionRegulation' | 'interpersonalEffectiveness';

type Analysis = {
  topics: string[];
  emotions: string[];
  element: string;
  paradox?: boolean;
  selfBlame?: boolean;
  hopelessness?: boolean;
  intensity?: number;
  crisis?: boolean;
};

// Enhanced DBT Skills Database with Chaining Logic
const skillsDB: { [key: string]: DBTSkill } = {
  // CRISIS/HIGH INTENSITY SKILLS
  tip: {
    name: "TIP",
    category: 'distressTolerance',
    intensity: 'high',
    variations: [
      "Try splashing cold water on your face — it activates your dive response and calms your nervous system fast.",
      "Hold an ice cube for 30 seconds — temperature change resets your body quickly.",
      "Do 20 jumping jacks or run in place — intense exercise burns off stress hormones.",
      "Take a cold shower or put ice on your wrists — TIP skills work through your vagus nerve."
    ],
    triggers: ['panic', 'crisis', 'overwhelming'],
    chainTo: ['stop', 'radicalAcceptance', 'selfSoothe']
  },

  stop: {
    name: "STOP",
    category: 'distressTolerance',
    intensity: 'high',
    variations: [
      "Try the STOP skill: Stop. Take a step back. Observe what's happening. Proceed mindfully.",
      "Pause everything. One breath. What do you actually see vs what you're imagining?",
      "Hit the mental pause button — Stop, breathe, look around, then choose your next move.",
      "STOP: don't act on the impulse yet. Breathe once. Notice what's real. Then decide."
    ],
    triggers: ['impulsive', 'reactive', 'about to act'],
    chainTo: ['wiseMind', 'emotionRegulation', 'mindfulness']
  },

  // MEDIUM INTENSITY SKILLS
  mindfulness: {
    name: "Mindfulness",
    category: 'mindfulness',
    intensity: 'low',
    variations: [
      "Notice what's happening in your body right now — just name it without judgment.",
      "Try focusing on your breath: one inhale, one exhale. That's mindfulness in action.",
      "What would happen if you described this moment as if you were a neutral observer?",
      "Sometimes mindfulness is as simple as noticing: *scrolling makes me tense*."
    ],
    triggers: ['overwhelm', 'scattered', 'disconnected'],
    chainTo: ['wiseMind', 'selfSoothe', 'emotionRegulation']
  },

  selfSoothe: {
    name: "Self-Soothe",
    category: 'distressTolerance',
    intensity: 'medium',
    variations: [
      "Try the 5 senses approach: something pleasant to see, hear, smell, taste, and touch.",
      "Self-soothe like you would comfort a hurt child — what does your body need right now?",
      "Create a mini comfort moment: soft music, warm tea, or wrapping yourself in something cozy.",
      "Ground through your senses — name 5 things you see, 4 you hear, 3 you can touch."
    ],
    triggers: ['emotional pain', 'lonely', 'overwhelmed'],
    chainTo: ['radicalAcceptance', 'emotionRegulation', 'interpersonalEffectiveness']
  },

  emotionRegulation: {
    name: "Emotion Regulation",
    category: 'emotionRegulation',
    intensity: 'medium',
    variations: [
      "Try writing down one value you hold and act in line with it today — that's emotion regulation.",
      "Notice: is this emotion fitting the facts, or is it being amplified by comparison?",
      "You can shift your emotional state by opposite action — do what your emotion doesn't want you to do.",
      "Acknowledge the feeling, then ask: what skillful choice aligns with who I want to be?"
    ],
    triggers: ['mood swings', 'emotional overwhelm', 'reactive'],
    chainTo: ['interpersonalEffectiveness', 'wiseMind', 'radicalAcceptance']
  },

  // INTERPERSONAL SKILLS
  dearMan: {
    name: "DEAR MAN",
    category: 'interpersonalEffectiveness',
    intensity: 'medium',
    variations: [
      "Try DEAR MAN: Describe the situation, Express feelings, Assert needs, Reinforce benefits, stay Mindful, Appear confident, Negotiate.",
      "Structure your ask: describe what happened, share how you feel, ask clearly, explain why it matters.",
      "Be direct — state the facts, express your feelings, make your request, explain the benefits.",
      "Organize your thoughts first — what happened, how you feel, what you need, why it matters to them."
    ],
    triggers: ['need to ask', 'conflict', 'boundary setting'],
    chainTo: ['give', 'fast', 'wiseMind']
  },

  give: {
    name: "GIVE",
    category: 'interpersonalEffectiveness',
    intensity: 'low',
    variations: [
      "Use GIVE to maintain relationships — be Gentle, show Interest, Validate their feelings, use an Easy manner.",
      "Even in disagreement, try: gentle tone, genuine curiosity, validate their perspective, stay relaxed.",
      "Preserve connection while standing your ground — soft voice, real interest, acknowledge their reality.",
      "You might try GIVE with yourself too: Gentle, Interested, Validating, Easy manner toward your own experience."
    ],
    triggers: ['relationship tension', 'conflict', 'disconnection'],
    chainTo: ['fast', 'interpersonalEffectiveness', 'radicalAcceptance']
  },

  fast: {
    name: "FAST",
    category: 'interpersonalEffectiveness',
    intensity: 'medium',
    variations: [
      "Maintain self-respect with FAST — be Fair to yourself, no unnecessary Apologies, Stick to values, be Truthful.",
      "Keep your dignity — treat yourself fairly, don't apologize for existing, stay true to what matters, be honest.",
      "Self-respect means: fair to yourself and others, appropriate apologies only, value-aligned actions, truthfulness.",
      "Protect your integrity while staying connected — balanced fairness, no over-apologizing, honor your values."
    ],
    triggers: ['people pleasing', 'low self-worth', 'boundary violations'],
    chainTo: ['wiseMind', 'emotionRegulation', 'radicalAcceptance']
  },

  // INTEGRATION/WISDOM SKILLS
  wiseMind: {
    name: "Wise Mind",
    category: 'mindfulness',
    intensity: 'low',
    variations: [
      "Notice the difference between Emotion Mind and Reasonable Mind. What does Wise Mind say?",
      "Wise Mind is often quiet — can you pause long enough to hear it?",
      "Sometimes truth feels both calm and clear at once — that's Wise Mind speaking.",
      "What would you do if you trusted the deepest, wisest part of yourself right now?"
    ],
    triggers: ['confusion', 'decision making', 'inner conflict'],
    chainTo: ['radicalAcceptance', 'emotionRegulation', 'mindfulness']
  },

  radicalAcceptance: {
    name: "Radical Acceptance",
    category: 'distressTolerance',
    intensity: 'low',
    variations: [
      "Radical acceptance means saying: this is the reality right now, even if I don't like it.",
      "You don't have to approve of something to accept that it's here in this moment.",
      "Suffering = pain + resistance. Acceptance reduces the resistance part.",
      "Sometimes peace starts by whispering: *this is what it is right now* — and that's enough."
    ],
    triggers: ['resistance', 'fighting reality', 'suffering'],
    chainTo: ['wiseMind', 'selfSoothe', 'emotionRegulation']
  }
};

class DBTSkillChainer {
  private recentSkills: string[] = [];
  private skillUsageCount: Map<string, number> = new Map();
  private maxRecentHistory = 3;

  /**
   * Select the best DBT skill based on triggers and chaining logic
   */
  selectSkill(triggers: string[], intensity: 'low' | 'medium' | 'high', userInput: string): DBTSkill {
    // Find skills that match triggers
    const matchingSkills = Object.values(skillsDB).filter(skill =>
      skill.triggers.some(trigger =>
        triggers.includes(trigger) ||
        userInput.toLowerCase().includes(trigger)
      )
    );

    // If we have recent skills, try to chain appropriately
    if (this.recentSkills.length > 0) {
      const lastSkill = this.recentSkills[this.recentSkills.length - 1];
      const lastSkillData = skillsDB[lastSkill];

      if (lastSkillData) {
        // Look for chaining opportunities
        const chainableSkills = lastSkillData.chainTo
          .map(skillName => skillsDB[skillName])
          .filter(skill => skill && this.skillFitsContext(skill, triggers, intensity))
          .filter(skill => !this.wasRecentlyUsed(skill.name));

        if (chainableSkills.length > 0) {
          return this.selectLeastUsed(chainableSkills);
        }
      }
    }

    // Fallback to best matching skill that wasn't recently used
    const availableSkills = matchingSkills.filter(skill =>
      !this.wasRecentlyUsed(skill.name)
    );

    if (availableSkills.length > 0) {
      return this.selectLeastUsed(availableSkills);
    }

    // Ultimate fallback to any matching skill or mindfulness
    return matchingSkills[0] || skillsDB.mindfulness;
  }

  /**
   * Apply a skill and track usage for chaining
   */
  applySkill(userInput: string, analysis: Analysis): string {
    const triggers = this.extractTriggers(userInput, analysis);
    const intensity = this.determineIntensity(analysis);

    const skill = this.selectSkill(triggers, intensity, userInput);

    // Track usage
    this.trackSkillUsage(skill.name);

    // Get variation and rotate
    const variation = this.getSkillVariation(skill);

    return variation;
  }

  private extractTriggers(userInput: string, analysis: Analysis): string[] {
    const triggers: string[] = [];
    const lowerInput = userInput.toLowerCase();

    // Crisis patterns
    if (lowerInput.includes('panic') || lowerInput.includes('can\'t breathe')) triggers.push('panic');
    if (lowerInput.includes('overwhelm') || lowerInput.includes('too much')) triggers.push('overwhelming');
    if (analysis.crisis) triggers.push('crisis');

    // Emotional patterns
    if (lowerInput.includes('angry') || lowerInput.includes('furious')) triggers.push('reactive');
    if (lowerInput.includes('can\'t stop') || lowerInput.includes('won\'t stop')) triggers.push('impulsive');
    if (lowerInput.includes('confused') || lowerInput.includes('don\'t know')) triggers.push('confusion');
    if (lowerInput.includes('hurt') || lowerInput.includes('alone')) triggers.push('emotional pain');

    // Relational patterns
    if (lowerInput.includes('no one') || lowerInput.includes('everyone else')) triggers.push('disconnection');
    if (lowerInput.includes('sorry') || lowerInput.includes('my fault')) triggers.push('people pleasing');
    if (lowerInput.includes('ask for') || lowerInput.includes('need help')) triggers.push('need to ask');

    return triggers;
  }

  private determineIntensity(analysis: Analysis): 'low' | 'medium' | 'high' {
    if (analysis.crisis || (analysis.intensity && analysis.intensity >= 8)) return 'high';
    if (analysis.intensity && analysis.intensity >= 5) return 'medium';
    return 'low';
  }

  private skillFitsContext(skill: DBTSkill, triggers: string[], intensity: 'low' | 'medium' | 'high'): boolean {
    // High intensity situations need high or medium intensity skills
    if (intensity === 'high' && skill.intensity === 'low') return false;

    // Check if skill's triggers match context
    return skill.triggers.some(trigger => triggers.includes(trigger)) ||
           skill.intensity === intensity;
  }

  private wasRecentlyUsed(skillName: string): boolean {
    return this.recentSkills.includes(skillName);
  }

  private selectLeastUsed(skills: DBTSkill[]): DBTSkill {
    return skills.reduce((least, current) => {
      const leastUsage = this.skillUsageCount.get(least.name) || 0;
      const currentUsage = this.skillUsageCount.get(current.name) || 0;
      return currentUsage < leastUsage ? current : least;
    });
  }

  private trackSkillUsage(skillName: string): void {
    // Add to recent history
    this.recentSkills.push(skillName);
    if (this.recentSkills.length > this.maxRecentHistory) {
      this.recentSkills.shift();
    }

    // Increment usage count
    const currentCount = this.skillUsageCount.get(skillName) || 0;
    this.skillUsageCount.set(skillName, currentCount + 1);
  }

  private getSkillVariation(skill: DBTSkill): string {
    const usageCount = this.skillUsageCount.get(skill.name) || 0;
    const variationIndex = usageCount % skill.variations.length;
    return skill.variations[variationIndex];
  }

  /**
   * Get the current skill chain for debugging
   */
  getRecentChain(): string[] {
    return [...this.recentSkills];
  }

  /**
   * Reset the chainer state
   */
  reset(): void {
    this.recentSkills = [];
    this.skillUsageCount.clear();
  }
}

// Export singleton instance
export const dbtTechniques = new DBTSkillChainer();

// Export types and skills for testing
export { skillsDB, DBTSkillChainer };

