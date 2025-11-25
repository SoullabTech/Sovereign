/**
 * 🧠 DBT (Dialectical Behavior Therapy) Techniques Module
 *
 * Maps DBT's core modules to Maya's elemental architecture:
 * - Mindfulness (Aether/Air): Present moment awareness
 * - Distress Tolerance (Earth/Water): Surviving emotional storms
 * - Emotion Regulation (Water/Fire): Naming and validating emotions
 * - Interpersonal Effectiveness (Air/Fire): Healthy boundaries
 */

export interface DBTSkill {
  name: string
  technique: string
  elements: string[]
  triggerConditions: string[]
  contraindications?: string[]
}

export const dbtSkills = {
  mindfulness: [
    {
      name: "5-4-3-2-1 Grounding",
      technique: "Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
      elements: ["aether", "air"],
      triggerConditions: ["dissociation", "overwhelm", "panic"]
    },
    {
      name: "Wise Mind",
      technique: "What would your wisest self say about this? Not just emotions, not just logic - but wisdom.",
      elements: ["aether"],
      triggerConditions: ["confusion", "emotional_mind", "rational_mind"]
    },
    {
      name: "Observe Without Judgment",
      technique: "Let's describe what's happening without adding 'good' or 'bad' to it. Just the facts.",
      elements: ["air", "aether"],
      triggerConditions: ["self_criticism", "rumination"]
    }
  ],

  distressTolerance: [
    {
      name: "TIP (Temperature)",
      technique: "Would it help to splash cold water on your face or hold an ice cube? Sometimes the body needs a reset.",
      elements: ["earth", "water"],
      triggerConditions: ["intensity > 0.7", "self_harm_urge", "crisis"],
      contraindications: ["eating_disorder"]
    },
    {
      name: "Paced Breathing",
      technique: "Let's breathe together: in for 4, hold for 2, out for 6. Your exhale is longer than your inhale.",
      elements: ["earth", "water"],
      triggerConditions: ["anxiety", "panic", "rage"]
    },
    {
      name: "Self-Soothing with Senses",
      technique: "What's one gentle thing you could do for each sense right now? Soft music, warm tea, cozy texture?",
      elements: ["earth"],
      triggerConditions: ["emotional_overwhelm", "abandonment_fear"]
    },
    {
      name: "Radical Acceptance",
      technique: "This moment is painful AND you're surviving it. Can you accept the reality without approving of it?",
      elements: ["aether", "earth"],
      triggerConditions: ["injustice", "powerlessness", "betrayal"]
    }
  ],

  emotionRegulation: [
    {
      name: "Check the Facts",
      technique: "Let's examine the evidence: what supports this thought? What goes against it? What would you tell a friend?",
      elements: ["air", "water"],
      triggerConditions: ["catastrophizing", "black_white_thinking", "emotional_reasoning"]
    },
    {
      name: "Opposite Action",
      technique: "Your emotion is valid AND pushing you toward isolation. The opposite action might be gentle connection. What would that look like?",
      elements: ["fire", "water"],
      triggerConditions: ["depression", "shame", "guilt", "fear"]
    },
    {
      name: "PLEASE Skills",
      technique: "When did you last eat, sleep, exercise, or take medication? Sometimes emotions intensify when our body needs care.",
      elements: ["earth"],
      triggerConditions: ["emotional_volatility", "mood_swings"]
    },
    {
      name: "Emotion Surfing",
      technique: "Emotions are like waves - they build, peak, and naturally fall. You don't have to fight the wave, just ride it.",
      elements: ["water", "air"],
      triggerConditions: ["emotional_overwhelm", "urge_to_escape"]
    }
  ],

  interpersonalEffectiveness: [
    {
      name: "DEAR MAN",
      technique: "Try: 'I feel [emotion] when [situation]. What I need is [request]. Can we work toward that?'",
      elements: ["air", "fire"],
      triggerConditions: ["boundary_setting", "conflict", "relationship_issue"]
    },
    {
      name: "GIVE (Gentle, Interested, Validate, Easy)",
      technique: "You can hold your truth AND be curious about theirs. What would gentle strength look like here?",
      elements: ["air", "water"],
      triggerConditions: ["relationship_repair", "conflict_resolution"]
    },
    {
      name: "FAST (Fair, Apologies, Stick to values, Truthful)",
      technique: "What would be fair to both of you? What are your core values here? How can you be truthful without attacking?",
      elements: ["fire", "aether"],
      triggerConditions: ["guilt_manipulation", "boundary_violation"]
    },
    {
      name: "Dialectical Thinking",
      technique: "What if both things are true? You matter AND they matter. You need boundaries AND connection.",
      elements: ["aether"],
      triggerConditions: ["black_white_thinking", "relationship_paradox"]
    }
  ]
}

export interface DBTAssessment {
  primaryModule: keyof typeof dbtSkills
  recommendedSkill: DBTSkill
  rationale: string
  elementalAlignment: string[]
}

export const dbtTriggers = {
  abandonment: [
    /everyone leaves/i,
    /you'll leave too/i,
    /always abandon/i,
    /people leave me/i,
    /eventually.*leave/i
  ],
  paradox: [
    /take on the world/i,
    /other times.*feel/i,
    /sometimes.*other/i,
    /(powerful|strong).*then.*(weak|broken)/i,
    /both.*and/i
  ],
  identity: [
    /don'?t know who i am/i,
    /broken.*really am/i,
    /see how.*broken/i,
    /not sure.*who/i,
    /identity/i
  ],
  relational: [
    /no one will.*love me/i,
    /push.*away/i,
    /always.*push/i,
    /hurt.*people/i,
    /ruin.*relationship/i
  ]
}

export const dbtResponses = {
  abandonment: "That fear of being left makes complete sense. Can we practice asking for what you need here, without apologizing for needing it?",
  paradox: "Both states are real parts of you. Let's hold them side by side — you can feel powerful AND vulnerable. Can you breathe into that middle space?",
  identity: "Your identity is more than today's storm. Even in this confusion, what values show up? What stays consistent about who you are?",
  relational: "That hopelessness about connection is heavy. One tiny opposite action might be reaching out instead of withdrawing. What would gentle connection look like?"
}

export class DBTOrchestrator {

  assessBPDPattern(input: string): { pattern: string; response: string; module: string } | null {
    // Check abandonment patterns
    if (dbtTriggers.abandonment.some(trigger => trigger.test(input))) {
      return {
        pattern: 'abandonment',
        response: dbtResponses.abandonment,
        module: 'interpersonalEffectiveness'
      }
    }

    // Check paradox patterns
    if (dbtTriggers.paradox.some(trigger => trigger.test(input))) {
      return {
        pattern: 'paradox',
        response: dbtResponses.paradox,
        module: 'emotionRegulation'
      }
    }

    // Check identity patterns
    if (dbtTriggers.identity.some(trigger => trigger.test(input))) {
      return {
        pattern: 'identity',
        response: dbtResponses.identity,
        module: 'mindfulness'
      }
    }

    // Check relational patterns
    if (dbtTriggers.relational.some(trigger => trigger.test(input))) {
      return {
        pattern: 'relational',
        response: dbtResponses.relational,
        module: 'interpersonalEffectiveness'
      }
    }

    return null
  }

  assessDBTNeed(
    emotions: string[],
    intensity: number,
    topics: string[],
    somaticState: any
  ): DBTAssessment | null {

    // Crisis/High Intensity → Distress Tolerance
    if (intensity > 0.5 || emotions.includes('panic') || emotions.includes('rage') || emotions.includes('self_harm')) {
      const skill = this.selectDistressToleranceSkill(emotions, intensity)
      return {
        primaryModule: 'distressTolerance',
        recommendedSkill: skill,
        rationale: 'High emotional intensity detected - prioritizing stabilization',
        elementalAlignment: ['earth', 'water']
      }
    }

    // Abandonment/Relationship topics → Interpersonal Effectiveness
    if (topics.some(topic => ['relationship', 'partner', 'family', 'boss', 'friend', 'social', 'abandonment'].includes(topic)) ||
        emotions.includes('abandonment') || emotions.includes('rejection')) {
      const skill = this.selectInterpersonalSkill(emotions, topics)
      return {
        primaryModule: 'interpersonalEffectiveness',
        recommendedSkill: skill,
        rationale: 'Relationship dynamics detected - focusing on interpersonal skills',
        elementalAlignment: ['air', 'fire']
      }
    }

    // Emotional confusion/BPD patterns → Emotion Regulation
    if (emotions.length > 1 || emotions.includes('confusion') || emotions.includes('overwhelm') ||
        emotions.includes('shame') || emotions.includes('guilt') || intensity > 0.4) {
      const skill = this.selectEmotionRegulationSkill(emotions)
      return {
        primaryModule: 'emotionRegulation',
        recommendedSkill: skill,
        rationale: 'Complex emotional state - emotion regulation skills needed',
        elementalAlignment: ['water', 'fire']
      }
    }

    // Default to mindfulness for present moment awareness
    if (emotions.includes('anxiety') || emotions.includes('rumination') || intensity > 0.3) {
      const skill = this.selectMindfulnessSkill(emotions)
      return {
        primaryModule: 'mindfulness',
        recommendedSkill: skill,
        rationale: 'Present moment awareness needed for clarity',
        elementalAlignment: ['aether', 'air']
      }
    }

    return null
  }

  private selectDistressToleranceSkill(emotions: string[], intensity: number): DBTSkill {
    if (intensity > 0.8 || emotions.includes('self_harm')) {
      return dbtSkills.distressTolerance[0] // TIP technique
    }
    if (emotions.includes('anxiety') || emotions.includes('panic')) {
      return dbtSkills.distressTolerance[1] // Paced breathing
    }
    if (emotions.includes('abandonment') || emotions.includes('loneliness')) {
      return dbtSkills.distressTolerance[2] // Self-soothing
    }
    return dbtSkills.distressTolerance[3] // Radical acceptance
  }

  private selectEmotionRegulationSkill(emotions: string[]): DBTSkill {
    if (emotions.includes('catastrophic') || emotions.includes('rumination')) {
      return dbtSkills.emotionRegulation[0] // Check the facts
    }
    if (emotions.includes('depression') || emotions.includes('shame')) {
      return dbtSkills.emotionRegulation[1] // Opposite action
    }
    if (emotions.includes('mood_swings') || emotions.includes('volatile')) {
      return dbtSkills.emotionRegulation[2] // PLEASE skills
    }
    return dbtSkills.emotionRegulation[3] // Emotion surfing
  }

  private selectInterpersonalSkill(emotions: string[], topics: string[]): DBTSkill {
    if (topics.includes('boundary') || topics.includes('conflict')) {
      return dbtSkills.interpersonalEffectiveness[0] // DEAR MAN
    }
    if (emotions.includes('guilt') || topics.includes('repair')) {
      return dbtSkills.interpersonalEffectiveness[1] // GIVE
    }
    if (emotions.includes('manipulation') || topics.includes('values')) {
      return dbtSkills.interpersonalEffectiveness[2] // FAST
    }
    return dbtSkills.interpersonalEffectiveness[3] // Dialectical thinking
  }

  private selectMindfulnessSkill(emotions: string[]): DBTSkill {
    if (emotions.includes('dissociation') || emotions.includes('panic')) {
      return dbtSkills.mindfulness[0] // 5-4-3-2-1 grounding
    }
    if (emotions.includes('confusion') || emotions.includes('decision')) {
      return dbtSkills.mindfulness[1] // Wise mind
    }
    return dbtSkills.mindfulness[2] // Observe without judgment
  }

  formatDBTResponse(assessment: DBTAssessment): string {
    const { recommendedSkill } = assessment
    return recommendedSkill.technique
  }
}