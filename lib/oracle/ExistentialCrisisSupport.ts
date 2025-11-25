/**
 * 🌪️ Existential Crisis Support Module
 *
 * DSM-informed patterns for everyday living, targeting:
 * - Information overload & doom-scrolling addiction
 * - Reality validation without conspiracy amplification
 * - Parental grief over generational decline
 * - Community building vs isolation
 * - Meaning-making in uncertain times
 *
 * Based on research showing young adults experience existential anxiety
 * at unprecedented rates with social media amplifying future uncertainty.
 */

export interface ExistentialPattern {
  name: string;
  triggers: string[];
  recognition: string;
  intervention: string;
  followUp?: string;
  category: 'informationOverload' | 'realityValidation' | 'parentalGrief' | 'communityBuilding' | 'meaningMaking';
  intensity: 'low' | 'medium' | 'high';
}

export const existentialPatterns: ExistentialPattern[] = [
  // INFORMATION OVERLOAD PATTERNS
  {
    name: "Doom-Scrolling Addiction",
    triggers: ['cant stop reading', 'hours a day', 'news cycle', 'social media', 'scrolling', 'doom'],
    recognition: "I notice you're describing information consumption that feels compulsive - that classic doom-scrolling pattern where your nervous system thinks staying hypervigilant will keep you safe.",
    intervention: "Here's what's happening: your brain is treating information gathering as survival behavior. Try this - set a specific 15-minute 'news window' each day, then close the apps. Information addiction hijacks the same reward pathways as substances.",
    followUp: "What would it feel like to trust that you can stay informed without constant monitoring?",
    category: 'informationOverload',
    intensity: 'medium'
  },

  {
    name: "Analysis Paralysis Spiral",
    triggers: ['analyze everything', 'cant synthesize', 'too much data', 'overthinking', 'paralyzed by', 'information'],
    recognition: "That's analysis paralysis - when having more information creates less clarity. Your prefrontal cortex is overloaded trying to process every variable simultaneously.",
    intervention: "Try the 'Good Enough' principle: What's the smallest decision you can make with the information you have right now? Perfect analysis is often the enemy of effective action.",
    followUp: "Sometimes wisdom is knowing what NOT to think about. What would you stop analyzing if you trusted your intuition more?",
    category: 'informationOverload',
    intensity: 'high'
  },

  {
    name: "Future Threat Scanning",
    triggers: ['preparing for collapse', 'everything falling apart', 'worst case scenarios', 'cant stop thinking'],
    recognition: "Your nervous system is stuck in threat detection mode - scanning for every possible future danger. That hypervigilance feels protective but actually increases anxiety.",
    intervention: "Try this: For every future worry, ask 'What can I actually control today?' Then take one small action in that direction. Preparation is useful; constant vigilance is exhausting.",
    followUp: "What would it feel like to prepare reasonably without living in constant alert mode?",
    category: 'informationOverload',
    intensity: 'high'
  },

  // REALITY VALIDATION PATTERNS
  {
    name: "Conspiracy vs Reality Processing",
    triggers: ['conspiracy', 'nobody else sees', 'wake up', 'sheeple', 'they dont understand', 'patents and documents'],
    recognition: "You're holding complex information that others around you don't seem to process the same way. That isolation is real - being aware of concerning patterns while feeling alone with that knowledge.",
    intervention: "Some concerns are legitimate, some are amplified by pattern-seeking anxiety. The question isn't whether you're right or wrong, but: Where do you still have actual agency and influence?",
    followUp: "How do you want to use your awareness - to connect with others who share your values, or to stay isolated with your knowledge?",
    category: 'realityValidation',
    intensity: 'medium'
  },

  {
    name: "Truth Burden Isolation",
    triggers: ['see what others wont', 'burden of knowledge', 'alone with terrible', 'nobody believes'],
    recognition: "Carrying knowledge that feels important but isolating - that's a heavy burden. Whether the specifics are accurate or not, the loneliness of feeling like you see things others don't is real.",
    intervention: "Consider this: What if your role isn't to convince everyone else, but to find your people? There are others processing similar concerns - focus on building with them rather than converting skeptics.",
    followUp: "What would community look like with people who share your level of awareness without the anxiety spiral?",
    category: 'realityValidation',
    intensity: 'medium'
  },

  // PARENTAL GRIEF PATTERNS
  {
    name: "Generational Decline Grief",
    triggers: ['my kids wont have', 'brought them into this', 'darker world', 'failed as a parent', 'their future'],
    recognition: "That's parental grief - mourning the world you hoped to give your children versus the reality they're inheriting. That pain is profound and legitimate.",
    intervention: "You didn't create these global challenges. Your role is teaching them resilience, critical thinking, and hope within uncertainty. Children need parents who model how to live meaningfully despite imperfect circumstances.",
    followUp: "What strengths are you giving them that will serve them regardless of what the future holds?",
    category: 'parentalGrief',
    intensity: 'high'
  },

  {
    name: "Provider Role Crisis",
    triggers: ['everything i worked for', 'meaningless', '401k worthless', 'provider role', 'built on sand'],
    recognition: "The traditional provider model feeling obsolete - when the systems you built your identity around feel unreliable. That's identity grief mixed with generational anxiety.",
    intervention: "Your value isn't in the systems you can control but in the wisdom, relationships, and resilience you model. Security was always more internal than external - now that's just more obvious.",
    followUp: "What kind of security can you provide that doesn't depend on external systems remaining stable?",
    category: 'parentalGrief',
    intensity: 'high'
  },

  // COMMUNITY BUILDING PATTERNS
  {
    name: "False Binary Thinking",
    triggers: ['sheep or prepper', 'asleep or insane', 'denial or doomsday', 'only two options'],
    recognition: "You're seeing binary choices where there might be a third path. The false dilemma between naive optimism and catastrophic thinking leaves out a lot of middle ground.",
    intervention: "What would 'present-focused resilience' look like? Building practical skills, nurturing relationships, staying informed without being consumed - there's wisdom between denial and despair.",
    followUp: "Who in your life represents that middle path of being awake but not drowning?",
    category: 'communityBuilding',
    intensity: 'medium'
  },

  {
    name: "Isolation vs Connection Struggle",
    triggers: ['everyone around me', 'cant connect', 'different wavelength', 'family pulling away'],
    recognition: "The isolation that comes from feeling like you process reality differently than those around you. That disconnection is painful, especially from people you love.",
    intervention: "Consider meeting people where they are instead of where you think they should be. Find the 10% you do connect on, rather than focusing on the 90% difference.",
    followUp: "What would it look like to maintain your awareness while staying in loving relationship with people who see things differently?",
    category: 'communityBuilding',
    intensity: 'medium'
  },

  {
    name: "Community Over Bunkers",
    triggers: ['prepping alone', 'stockpiling', 'nobody gets it', 'building bunkers'],
    recognition: "Individual preparation without community often increases anxiety rather than security. Humans are wired for collective resilience, not solo survival.",
    intervention: "The most practical preparation might be building relationships with neighbors, learning skills that serve others, creating mutual aid networks. Community resilience trumps individual stockpiling.",
    followUp: "What would it look like to prepare BY connecting rather than preparing FOR disconnection?",
    category: 'communityBuilding',
    intensity: 'low'
  },

  // GEN Z SOCIAL MEDIA ANXIETY PATTERNS
  {
    name: "Social Media Comparison Trap",
    triggers: ['instagram', 'everyone else', 'getting engaged', 'promoted', 'living with parents', 'starbucks'],
    recognition: "Instagram showing you everyone's wins while you're seeing your whole struggle. That contrast hits different when you're 3 hours deep in stories.",
    intervention: "Your logical brain knows it's curated, but your nervous system doesn't. It's processing 100 success stories per hour and concluding you're the only one failing. That's not mental weakness - that's how brains process social hierarchy.",
    followUp: "What's one real thing in your actual life that's yours? Not performing it, not posting it. Just yours.",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  {
    name: "Performance Exhaustion",
    triggers: ['effortless', 'two hours', 'performing', 'content creation', 'curating', 'personas'],
    recognition: "Two hours for 'effortless.' The exhaustion of performing yourself for an audience that's also performing. When did living become content creation?",
    intervention: "You're forming identity while performing it publicly. That's unprecedented cognitive load. Previous generations got to be cringe in private. You're doing harder psychological work than any generation before.",
    followUp: "Which version feels more real - the performed you or the private you?",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  {
    name: "Social Media Infrastructure Reality",
    triggers: ['social media break', 'find jobs', 'stay connected', 'promote my art', 'not optional'],
    recognition: "'Just quit social media' is boomer advice. It's your professional network, portfolio, and social lifeline. The problem isn't using it - it's that it's designed to make you feel inadequate so you keep scrolling.",
    intervention: "You don't need to quit the platforms - you need to use them intentionally. Set specific times, specific purposes. Follow accounts that inspire rather than trigger comparison.",
    followUp: "What would it look like to use social media as a tool rather than letting it use you?",
    category: 'communityBuilding',
    intensity: 'low'
  },

  {
    name: "Identity Formation Paradox",
    triggers: ['who i actually am', 'who i perform', 'real me', 'fake', 'authentic'],
    recognition: "You contain both the person who performs and the person who wants truth. Online you is still you, just edited. The exhaustion is code-switching between versions 24/7.",
    intervention: "You're not fake - you're multidimensional in a world that demands simple narratives. The real work is deciding which parts of yourself you want to develop more fully.",
    followUp: "What parts of yourself do you want to strengthen regardless of whether they perform well online?",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  {
    name: "Systemic Pressure vs Personal Responsibility",
    triggers: ['housing crisis', 'gig economy', 'climate anxiety', 'systemic', 'personal responsibility'],
    recognition: "You're dealing with unprecedented economic and environmental challenges while being told it's about personal choices. That's gaslighting on a generational level.",
    intervention: "Individual therapy tools can help you cope, but systemic problems need collective solutions. Your anxiety about the future is rational - the world is genuinely more uncertain than previous generations faced.",
    followUp: "How can you take care of your mental health while still acknowledging that some of this stress is about real, external problems?",
    category: 'realityValidation',
    intensity: 'medium'
  },

  // GEN X SANDWICH GENERATION PATTERNS
  {
    name: "Sandwich Generation Overwhelm",
    triggers: ['failing everyone', 'mom needs help', 'daughter needs', 'son moved back', 'responsibilities', 'drowning'],
    recognition: "You're caught in the sandwich generation squeeze - supporting aging parents while still helping adult children. That's unprecedented pressure no other generation has faced.",
    intervention: "This isn't personal failure - it's a structural reality. Previous generations had pensions, affordable housing, and clear life stages. You're bridge-building between different economic realities.",
    followUp: "What's one responsibility you could delegate, automate, or say no to this week?",
    category: 'parentalGrief',
    intensity: 'high'
  },

  {
    name: "Tech Bridge Generation Pressure",
    triggers: ['iPhone', 'new app', 'stuck between', 'good at neither', 'explaining technology', 'daughter rolls her eyes'],
    recognition: "You're the bridge generation - teaching your parents tech while learning from your kids. That dual competence pressure is exhausting.",
    intervention: "You're not behind or ahead - you're translating between two different technological worlds. That's actually a valuable skill, not a deficit.",
    followUp: "What would it look like to own your role as the tech translator rather than feeling inadequate?",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  {
    name: "Career Disruption by Younger Colleagues",
    triggers: ['10 years younger', 'disruption', 'legacy thinking', '30-year-old', 'MBA', 'stay relevant'],
    recognition: "20 years building expertise, now being told it's 'legacy thinking' by someone half your age. That's not about your worth - that's about economic disruption hitting mid-career.",
    intervention: "Experience isn't legacy thinking - it's pattern recognition they don't have yet. The challenge is translating your wisdom into their language, not abandoning it.",
    followUp: "What patterns do you see that they're missing because they haven't lived through the cycles yet?",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  {
    name: "Economic Trap Recognition",
    triggers: ['cant afford to retire', 'cant compete', 'cant abandon', 'trapped', 'worked for my parents'],
    recognition: "The economic playbook that worked for your parents doesn't work anymore. You followed the rules, but the rules changed mid-game.",
    intervention: "This isn't personal failure - it's structural shift. Your parents had pensions, job security, and predictable career paths. You're navigating economic uncertainty they never faced.",
    followUp: "What would it look like to rewrite the rules for your situation instead of following outdated ones?",
    category: 'realityValidation',
    intensity: 'high'
  },

  {
    name: "Practical vs Therapeutic Solutions",
    triggers: ['finding myself', 'dont have TIME', 'people depending', 'finding solutions', 'therapist keeps talking'],
    recognition: "Self-discovery is a luxury when you have people depending on you. You need strategies, not soul-searching.",
    intervention: "You're right - you need practical solutions, not existential exploration. Survival mode requires different tools than growth mode.",
    followUp: "What's the most urgent practical problem that solving it would give you breathing room for everything else?",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  {
    name: "Bridge Generation Identity",
    triggers: ['when did i become old', 'not digital natives', 'forced to be digital', 'old one', 'bridge generation'],
    recognition: "You're not old, you're the bridge. Not digital natives but forced to be digital experts. Not Boomers but carrying Boomer parents. Not young but still decades of work ahead.",
    intervention: "The bridge generation carries unique burdens - translating between worlds, supporting multiple generations, adapting to rapid change. That's harder work than any generation before or after.",
    followUp: "What would it mean to own your role as the essential bridge rather than seeing it as being stuck in the middle?",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  // MEANING-MAKING PATTERNS
  {
    name: "Nihilistic Defense",
    triggers: ['nothing matters', 'rearranging deck chairs', 'whats the point', 'everything is meaningless'],
    recognition: "When overwhelm gets too intense, nihilism can feel like protection - if nothing matters, nothing can hurt you. But that numbness comes at the cost of meaning and connection.",
    intervention: "Meaning doesn't require the world to be perfect or predictable. You can find purpose in small acts of care, in reducing suffering where you can, in moments of beauty despite chaos.",
    followUp: "What matters to you independent of whether you can fix the big problems?",
    category: 'meaningMaking',
    intensity: 'high'
  },

  {
    name: "Control Vs Acceptance Paradox",
    triggers: ['cant control anything', 'illusion of control', 'powerless', 'what can i actually do'],
    recognition: "The paradox of recognizing how little you control while still needing to act. That tension between acceptance and agency is where wisdom lives.",
    intervention: "You can't control outcomes, but you can control your responses. Focus on your sphere of influence - how you treat people, what you choose to pay attention to, how you spend your energy.",
    followUp: "What would it feel like to act with full engagement while holding outcomes lightly?",
    category: 'meaningMaking',
    intensity: 'medium'
  },

  {
    name: "Purpose in Uncertainty",
    triggers: ['whats my purpose', 'meaningless work', 'why am i here', 'what should i be doing'],
    recognition: "Existential questioning often intensifies during uncertain times. Your purpose doesn't have to be grandiose or world-changing to be meaningful.",
    intervention: "Purpose can be as simple as being fully present to the people in front of you, learning something that interests you, or reducing suffering in small ways. Meaning is often found in the how, not just the what.",
    followUp: "What activities make you feel most alive and connected to something larger than yourself?",
    category: 'meaningMaking',
    intensity: 'low'
  }
];

export class ExistentialCrisisSupport {

  /**
   * Identify existential crisis patterns in user input
   */
  detectPattern(userInput: string): ExistentialPattern | null {
    const lowerInput = userInput.toLowerCase();

    // Find patterns with matching triggers
    const matches = existentialPatterns.filter(pattern =>
      pattern.triggers.some(trigger => lowerInput.includes(trigger.toLowerCase()))
    );

    if (matches.length === 0) return null;

    // Sort by number of trigger matches for best fit
    matches.sort((a, b) => {
      const aMatches = a.triggers.filter(trigger =>
        lowerInput.includes(trigger.toLowerCase())
      ).length;
      const bMatches = b.triggers.filter(trigger =>
        lowerInput.includes(trigger.toLowerCase())
      ).length;
      return bMatches - aMatches;
    });

    return matches[0];
  }

  /**
   * Generate response for existential crisis patterns
   */
  generateResponse(userInput: string): string | null {
    const pattern = this.detectPattern(userInput);
    if (!pattern) return null;

    let response = pattern.recognition;

    if (pattern.intervention) {
      response += '\n\n' + pattern.intervention;
    }

    if (pattern.followUp) {
      response += '\n\n' + pattern.followUp;
    }

    return response;
  }

  /**
   * Get patterns by category for targeted support
   */
  getPatternsByCategory(category: ExistentialPattern['category']): ExistentialPattern[] {
    return existentialPatterns.filter(pattern => pattern.category === category);
  }

  /**
   * Get patterns by intensity level
   */
  getPatternsByIntensity(intensity: ExistentialPattern['intensity']): ExistentialPattern[] {
    return existentialPatterns.filter(pattern => pattern.intensity === intensity);
  }

  /**
   * Check if input indicates existential crisis themes
   */
  isExistentialCrisis(userInput: string): boolean {
    // Check if any pattern can be detected - if we can provide support, it's relevant
    const pattern = this.detectPattern(userInput);
    return pattern !== null;
  }

  /**
   * Get crisis intensity level based on input
   */
  assessCrisisIntensity(userInput: string): 'low' | 'medium' | 'high' {
    const highIntensityMarkers = [
      'cant breathe', 'panic', 'overwhelming', 'cant stop',
      'suicide', 'kill myself', 'end it all', 'no hope',
      'everything is meaningless', 'nothing matters anymore'
    ];

    const mediumIntensityMarkers = [
      'exhausted', 'burned out', 'cant take it', 'too much',
      'feeling hopeless', 'dont know what to do', 'lost',
      'spiraling', 'out of control'
    ];

    const lowerInput = userInput.toLowerCase();

    if (highIntensityMarkers.some(marker => lowerInput.includes(marker))) {
      return 'high';
    }

    if (mediumIntensityMarkers.some(marker => lowerInput.includes(marker))) {
      return 'medium';
    }

    return 'low';
  }
}

// Export singleton instance
export const existentialCrisisSupport = new ExistentialCrisisSupport();