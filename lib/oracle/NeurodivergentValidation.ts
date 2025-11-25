/**
 * Neurodivergent Validation Library
 * High-impact phrases that build trust and understanding
 */

export interface ValidationResponse {
  response: string;
  element: string;
  priority: 'urgent' | 'high' | 'normal';
}

export class NeurodivergentValidation {
  // Self-blame patterns that need immediate validation
  private readonly SELF_BLAME_PATTERNS = [
    { pattern: /lazy|i'm lazy|so lazy/i, response: "You're not lazy. That's executive dysfunction, and it's real. ADHD brains need different strategies, not more willpower." },
    { pattern: /broken|i'm broken|something wrong with me/i, response: "You're not broken. Your brain works differently, not wrong. The world wasn't built for neurodivergent minds, but that doesn't make you defective." },
    { pattern: /stupid|i'm stupid|i'm dumb/i, response: "You're not stupid. Processing differences don't equal intelligence deficits. You likely excel in ways neurotypical brains don't." },
    { pattern: /why can't i just|why can't i be normal/i, response: "Because 'normal' is a setting on a washing machine, not a valid human state. Your brain has its own operating system, and that's okay." },
    { pattern: /should be able to|should just/i, response: "'Should' is often internalized ableism talking. Your capacity fluctuates, and that's valid." },
    { pattern: /everyone else can/i, response: "Not everyone else can, actually. Many people mask their struggles. Your challenges are real and valid." },
    { pattern: /failure|i'm a failure|failing them|failing/i, response: "You're not failing. You're carrying an enormous load with the resources you have. That's strength, not failure." },
    { pattern: /disappointing everyone/i, response: "Other people's expectations often don't account for neurodivergent reality. Your worth isn't measured by neurotypical standards." },
    { pattern: /broken from.*trauma|trauma.*broken/i, response: "Trauma isn't your fault, and it doesn't make you broken. It shows your nervous system protected you. Healing happens at your pace." },
    { pattern: /invisible|feel invisible|nobody notices/i, response: "I see you. Your efforts matter, even when they go unnoticed. Feeling invisible is painful and real." },
    { pattern: /who am i to|who do i think i am/i, response: "You're someone with wisdom earned through experience. Your desire to help others comes from a place of genuine care and understanding." }
  ];

  // ADHD-specific validations
  private readonly ADHD_VALIDATIONS = [
    { pattern: /can't focus|attention issues/i, response: "ADHD focus is interest-based, not importance-based. It's neurology, not a character flaw." },
    { pattern: /hyperfocus|lost track of time/i, response: "Hyperfocus is your superpower when channeled. It's not wrong to have intense interests." },
    { pattern: /forgot|memory|remember/i, response: "ADHD affects working memory. Forgetting doesn't mean you don't care - your brain just processes information differently." },
    { pattern: /procrastinat/i, response: "It's not procrastination - it's task initiation difficulty. Your brain needs different activation strategies." },
    { pattern: /messy|disorganized/i, response: "ADHD brains often think in webs, not lines. What looks like chaos might be your natural organization system." }
  ];

  // Autism-specific validations
  private readonly AUTISM_VALIDATIONS = [
    { pattern: /masking|pretending to be normal/i, response: "Masking is exhausting. You deserve spaces where you can unmask and be authentic." },
    { pattern: /social|people are hard/i, response: "Social interactions are genuinely more complex for autistic brains. It's not a deficit - it's a different communication style." },
    { pattern: /routine|change is hard/i, response: "Routines aren't rigidity - they're how your brain creates predictability and safety. That's adaptive, not problematic." },
    { pattern: /sensory|overwhelm|too much/i, response: "Sensory overwhelm is neurological, not you being 'too sensitive'. Your nervous system processes stimuli differently." },
    { pattern: /special interest|obsessed/i, response: "Special interests aren't obsessions - they're how your brain finds joy and regulation. They're valuable." }
  ];

  // Executive dysfunction validations
  private readonly EXECUTIVE_VALIDATIONS = [
    { pattern: /can't start|can't begin|stuck/i, response: "Task initiation is one of the hardest executive functions. Being stuck doesn't mean you're not trying." },
    { pattern: /overwhelming|too many steps/i, response: "Task overwhelm is real when executive function is taxed. Breaking things down smaller isn't giving up - it's working with your brain." },
    { pattern: /tired all the time|exhausted/i, response: "Neurodivergent brains often work harder to do 'simple' tasks. That exhaustion is real and valid." },
    { pattern: /time blind|losing time/i, response: "Time blindness is a real ADHD trait. Using external time markers isn't cheating - it's accommodation." }
  ];

  // Parental overwhelm validations
  private readonly PARENTAL_VALIDATIONS = [
    { pattern: /exhausted.*keep.*together|keep everything together/i, response: "The mental load of holding a family together is enormous. Your exhaustion shows how much you care, not how much you're failing." },
    { pattern: /used to be.*creative|creative.*now.*stuck/i, response: "Creativity doesn't disappear - it gets buried under survival mode. Your creative self is still there, waiting for space to breathe." },
    { pattern: /trying to keep.*kids|everything.*for.*kids/i, response: "You're doing the invisible work that keeps families functioning. This effort is real and valuable, even when it goes unrecognized." },
    { pattern: /can't do it all|do it all/i, response: "You were never meant to do it all alone. The expectation to be everything to everyone is impossible and unfair." }
  ];

  // Paradox holding responses - recognizing both strength and struggle
  private readonly PARADOX_RESPONSES = [
    {
      pattern: /help.*women.*who am i|could help.*difference.*who/i,
      response: "I hear both your wisdom and your self-doubt. The fact that you want to help others AND question your worthiness shows deep empathy. Both can be true - you have something to offer AND you're still learning about your own value."
    },
    {
      pattern: /creative.*stuck|stuck.*creative/i,
      response: "You hold both your creative identity and your current feeling of being stuck. Creativity isn't gone - it's compressed by circumstances. Your awareness of both states is actually a creative act itself."
    }
  ];

  /**
   * Check for self-blame and provide validation
   */
  validate(input: string): ValidationResponse | null {
    const lower = input.toLowerCase();

    // Check paradox patterns first (most nuanced)
    for (const { pattern, response } of this.PARADOX_RESPONSES) {
      if (pattern.test(lower)) {
        return {
          response,
          element: 'aether', // Paradox holding
          priority: 'urgent'
        };
      }
    }

    // Check self-blame patterns (highest priority)
    for (const { pattern, response } of this.SELF_BLAME_PATTERNS) {
      if (pattern.test(lower)) {
        return {
          response,
          element: 'water', // Emotional support
          priority: 'urgent'
        };
      }
    }

    // Check parental overwhelm patterns
    for (const { pattern, response } of this.PARENTAL_VALIDATIONS) {
      if (pattern.test(lower)) {
        return {
          response,
          element: 'earth', // Grounding support
          priority: 'urgent'
        };
      }
    }

    // Check ADHD-specific patterns
    for (const { pattern, response } of this.ADHD_VALIDATIONS) {
      if (pattern.test(lower)) {
        return {
          response,
          element: 'air', // Clarity and understanding
          priority: 'high'
        };
      }
    }

    // Check autism-specific patterns
    for (const { pattern, response } of this.AUTISM_VALIDATIONS) {
      if (pattern.test(lower)) {
        return {
          response,
          element: 'earth', // Grounding and acceptance
          priority: 'high'
        };
      }
    }

    // Check executive dysfunction patterns
    for (const { pattern, response } of this.EXECUTIVE_VALIDATIONS) {
      if (pattern.test(lower)) {
        return {
          response,
          element: 'fire', // Actionable support
          priority: 'normal'
        };
      }
    }

    return null;
  }

  /**
   * Get affirmation for specific neurodivergent experience
   */
  getAffirmation(context: string): string {
    const affirmations = [
      "Your brain isn't wrong, it's different. Different is not less.",
      "You're allowed to need accommodations. That's equity, not special treatment.",
      "Struggling with 'simple' things doesn't make you weak. It makes you human with different wiring.",
      "Your worth isn't measured by your productivity.",
      "Rest is not a reward for completing tasks. It's a necessity for your brain.",
      "You don't need to earn the right to exist comfortably.",
      "Your needs are not 'too much'. They're just yours.",
      "It's okay to work with your brain instead of against it."
    ];

    // Context-specific affirmations
    if (context.includes('adhd')) {
      return "ADHD is a neurodevelopmental difference, not a character flaw. You're exactly who you're supposed to be.";
    }

    if (context.includes('autism')) {
      return "Autism is a neurotype, not something that needs fixing. Your way of experiencing the world is valid.";
    }

    if (context.includes('work') || context.includes('job')) {
      return "Your value as a person is not determined by traditional work metrics. You contribute in ways that matter.";
    }

    // Return random general affirmation
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  }
}

export const neurodivergentValidation = new NeurodivergentValidation();